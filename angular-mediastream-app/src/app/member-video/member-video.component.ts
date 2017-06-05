import {Component, Input, NgZone, OnInit, ViewChild} from '@angular/core';
import {VideoService} from 'app/members-video-room/video.service';
import {Subject} from 'rxjs/Subject';
import has = Reflect.has;

declare const MediaSource: any;


class Queue<T> {
  _store: T[] = [];

  push(val: T) {
    this._store.push(val);
  }

  pop(): T | undefined {
    return this._store.shift();
  }

  isEmpty(): boolean {
    return this._store.length <= 0;
  }

  flush(): void {
    this._store = [];
  }
}

@Component({
  selector: 'app-member-video',
  templateUrl: './member-video.component.html',
  styleUrls: ['./member-video.component.css']
})
export class MemberVideoComponent implements OnInit {


  @Input() room: string;
  @Input() name: string;
  @ViewChild('memberVideoPlayer') memberVideoPlayer: any;

  private channel: Subject<ArrayBuffer>;
  private mediaSource: MediaSource;
  private activeBuffer;
  private headPopped: boolean;
  private started: boolean;
  private chunkQueue: Queue<ArrayBuffer>;


  constructor(private service: VideoService) {
  }


  ngOnInit(): void {

    console.log('init MemberVideoPlayer', this.name, this.memberVideoPlayer);

    this.memberVideoPlayer.nativeElement.addEventListener('error', e => {
      console.log('DOM error', this.memberVideoPlayer.nativeElement.error);
    });

    // this.memberVideoPlayer.nativeElement.addEventListener('progress', e => {
    //   console.log('Delta end:', this.memberVideoPlayer.nativeElement.buffered.end(0) - this.memberVideoPlayer.nativeElement.currentTime);
    //   if (this.memberVideoPlayer.nativeElement.currentTime - this.memberVideoPlayer.nativeElement.buffered.end(0) > 1.0) {
    //   }
    // });

    this.start();

  }

  private start() {
    this.channel = null;
    this.mediaSource = new MediaSource();
    this.activeBuffer = null;
    this.chunkQueue = new Queue<ArrayBuffer>();
    this.started = false;
    this.headPopped = false;

    this.channel = this.service.connect(this.room, this.name);
    this.channel
      .subscribe(chunk => {
        console.log('subscribe, video tag current time is :', this.memberVideoPlayer.nativeElement.currentTime);

        // 手に入れたものはとりあえずPUSHしてためる
        this.chunkQueue.push(chunk);
        if ((this.activeBuffer)
          && (this.mediaSource.readyState === 'open')
          && !this.activeBuffer.updating
        ) {
          if (!this.headPopped && !this.started) {
            const parser = new WebMParser();
            const webm = this.chunkQueue.pop();
            const hasHeader = parser.hasHeader(new Uint8Array(webm));
            console.log('has header: ', hasHeader);
            if (hasHeader) {
              this.activeBuffer.appendBuffer(webm);
              this.headPopped = true;
              this.started = true;
            }
          } else if (!this.headPopped) {
            this.activeBuffer.appendBuffer(this.chunkQueue.pop());
            this.headPopped = true;
          }
        }
      });

    this.mediaSource.addEventListener('sourceopen', () => this.createSourceBuffer());
    this.memberVideoPlayer.nativeElement.src = URL.createObjectURL(this.mediaSource);

  }

  private createSourceBuffer() {
    const internetBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs=vp9');
    internetBuffer.addEventListener('updateend', () => {
      console.log(this.name, 'SourceBuffer updateend, mediaSource status: ', this.mediaSource.readyState);
      console.log('SourceBuffer updateend, mediaSource url: ', this.memberVideoPlayer.nativeElement.src);

      // キューを使い切ったら、一度先頭を処理していないことにする
      if (this.chunkQueue.isEmpty()) {
        this.headPopped = false;
      } else {
        internetBuffer.appendBuffer(this.chunkQueue.pop());
      }
      // this.memberVideoPlayer.nativeElement.currentTime = this.memberVideoPlayer.nativeElement.buffered().start(1);
    });
    this.activeBuffer = internetBuffer;
  }

}


class WebMParser {

  ptr = 0;

  tagEBML = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);
  tagSegment = new Uint8Array([0x18, 0x53, 0x80, 0x67]);

// 配列(ArrayBufferView)が合致しているかどうかを比較
  private equal(a, b) {
    if (a.byteLength !== b.byteLength) {
      return false;
    }
    for (let i = 0; i < a.byteLength; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

// WebMフォーマットのElementサイズを計算
  private getElementSize(d, p) {
    let l = 0;
    const n = d[p];
    let j;
    let t = 0;
    for (let i = 0; i < 8; i++) {
      if (( n >> (7 - i)) > 0) {
        j = i;
        break;
      }
    }
    for (let i = 0; i <= j; i++) {
      let b = d[p + t];
      if (i === 0) {
        b -= (1 << 7 - j);
      }
      l = l * 256 + b;
      t++;
    }
    return {length: l, offset: t};
  }

  // WebMファイルの先頭から初期化セグメントを取り出してSourceBufferに渡す
  hasHeader(webm: Uint8Array) {

    let r;

    if (!this.equal(this.tagEBML, webm.subarray(this.ptr, this.ptr + this.tagEBML.byteLength))) {
      return false;
    }

    this.ptr += this.tagEBML.byteLength;
    r = this.getElementSize(webm, this.ptr);
    this.ptr += r.offset + r.length;
    if (!this.equal(this.tagSegment, webm.subarray(this.ptr, this.ptr + this.tagSegment.byteLength))) {
      return false;
    }

    return true;
  }
}
