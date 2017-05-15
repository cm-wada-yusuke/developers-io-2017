import {Component, OnInit, ViewChild} from '@angular/core';
import {Observavle} from 'Rx';
import {Observable} from 'rxjs/Observable';

declare const MediaRecorder: any;
declare const MediaSource: any;

@Component({
  selector: 'app-imaging-room',
  templateUrl: './imaging-room.component.html',
  styleUrls: ['./imaging-room.component.css']
})

export class ImagingRoomComponent implements OnInit {

  private localStream;
  private recorder;
  // private remoteChunks: ArrayBuffer = new ArrayBuffer(1024);
  // private remoteSource = Observable.create((observer) =>
  //
  // )
  // private remoteVideoSource;
  private remoteBuffer;
  @ViewChild('localVideoPlayer') localVideoPlayer: any;
  @ViewChild('remoteVideoPlayer') remoteVideoPlayer: any;

  private mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
  private mediaSource = new MediaSource();

  constructor() {
  }

  ngOnInit() {
  }

  startVideo(): void {

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    })
      .then((stream) => {
        this.localStream = stream;
        this.localVideoPlayer.nativeElement.srcObject = this.localStream;
      })
      .catch((error) => {
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
      });

  }

  publishVideo(): void {

    // リモート再生
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      // reader.result contains the contents of blob as a typed array
      // appendする
      this.remoteBuffer.appendBuffer(reader.result);
      console.log(reader.result);
    });


    this.remoteVideoPlayer.nativeElement.src = URL.createObjectURL(this.mediaSource);
    this.mediaSource.addEventListener('sourceopen', () => {
      console.log(this.mediaSource.readyState);
      // const sourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
      const sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs=vp9');
      sourceBuffer.addEventListener('updateend', () => {
        console.log(this.mediaSource.readyState);
        // this.mediaSource.endOfStream();
        this.remoteVideoPlayer.nativeElement.play();
      });
      this.remoteBuffer = sourceBuffer;
    });

    const options = {
      audioBitsPerSecond: 64000,
      videoBitsPerSecond: 512000,
      mimeType: 'video/webm; codecs=vp9'
    };


    this.recorder = new MediaRecorder(this.localStream, options);

    this.recorder.ondataavailable = (event) => {
      console.log('data available: evt.data.type=' + event.data.type + ' size=' + event.data.size);
      // this.remoteChunks = event.data;
      // TODO 送信処理


      // イベントデータからBLOE => ArrayBuffer とし専有しているFileReaderで読み込む
      // const chunks = []
      // chunks.push(event.data);
      // const blob = new Blob(chunks, {type: 'application/octet-binary'});
      reader.readAsArrayBuffer(event.data);
      // this.remoteBuffer.appendBuffer(event.data);
      // console.log(chunks);
    }

    this.recorder.onstop = (event) => {
      console.log('recorder.onstop(), so playback');
      this.recorder = null;
    };

    this.recorder.start(1000 / 30);
    console.log('publish');
  }

  stopPublish(): void {
    if (this.recorder) {
      this.recorder.stop();
      console.log('stop');
    }
  }

  private sourceOpen(_) {
    console.log(this.mediaSource.readyState)
    const sourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
    sourceBuffer.addEventListener('updateend', () => {
      this.mediaSource.endOfStream();
      this.remoteVideoPlayer.play();
    });
    // sourceBuffer.appendBuffer(this.remoteChunks);
  }

}
