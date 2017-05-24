import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {VideoService} from 'app/members-video-room/video.service';
import {Subject} from 'rxjs/Subject';

declare const MediaSource: any;

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


  constructor(private service: VideoService) {
  }


  ngOnInit(): void {

    console.log('init MemberVideoPlayer', this.name, this.memberVideoPlayer);

    // this.memberVideoPlayer.nativeElement.addEventListener('error', e => {
    //   console.log('DOM error', e);
    //   this.start();
    // });

    this.start();

  }

  private start() {
    this.channel = null;
    this.mediaSource = new MediaSource();
    this.activeBuffer = null;

    this.channel = this.service.connect(this.room, this.name);
    this.channel
    // .catch(error => {
    //   console.log('subscription error:', error);
    //   this.channel = this.service.connect(this.room, this.name);
    // })
      .subscribe(chunk => {
        if ((this.activeBuffer) && (this.mediaSource.readyState === 'open') && !this.activeBuffer.updating) {
          this.activeBuffer.appendBuffer(chunk);
        }
      });

    this.memberVideoPlayer.nativeElement.src = URL.createObjectURL(this.mediaSource);
    this.mediaSource.addEventListener('sourceopen', () => this.createSourceBuffer());

  }

  private createSourceBuffer() {
    const internetBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs=vp9');
    internetBuffer.addEventListener('updateend', () => {
      console.log('SourceBuffer updateend, mediaSource status: ', this.mediaSource.readyState);
      console.log('SourceBuffer updateend, mediaSource url: ', this.memberVideoPlayer.nativeElement.src);
      // this.sourceBuffer.appendBuffer(this.segmentChunk);
    });
    this.activeBuffer = internetBuffer;

    this.activeBuffer.addEventListener('error', e => {
      console.log(e);
      // this.mediaSource.removeSourceBuffer(this.activeBuffer);
      this.start();
    });

  }
}
