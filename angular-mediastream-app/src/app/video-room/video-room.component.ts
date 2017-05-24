import {Component, OnInit, ViewChild} from '@angular/core';
import {Observavle} from 'Rx';
import {VideoService} from './video.service';
import {Subject} from 'rxjs/Subject';

declare const MediaRecorder: any;
declare const MediaSource: any;

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  providers: [VideoService],
  styleUrls: ['./video-room.component.css']
})

export class VideoRoomComponent implements OnInit {


  private subject: Subject<ArrayBuffer>;

  private localStream;
  private recorder;
  private remoteBuffer;
  private internetBuffer;
  @ViewChild('localVideoPlayer') localVideoPlayer: any;
  @ViewChild('remoteVideoPlayer') remoteVideoPlayer: any;
  @ViewChild('internetVideoPlayer') internetVideoPlayer: any;

  private mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
  private mediaSource = new MediaSource();
  private internetSource = new MediaSource();


  constructor(private service: VideoService) {
  }

  ngOnInit() {
  }

  private sendChunk(chunk: ArrayBuffer): void {
    this.service.send(chunk);
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
    // インターネット接続
    // const internetReader = new FileReader();
    // internetReader.addEventListener('loadend', () => {
    //   this.internetBuffer.appendBuffer(internetReader.result);
    // });

    this.subject = this.service.connect('1', 'wada');

    this.internetVideoPlayer.nativeElement.src = URL.createObjectURL(this.internetSource);
    this.internetSource.addEventListener('sourceopen', () => {
      const internetBuffer = this.internetSource.addSourceBuffer('video/webm; codecs=vp9');
      internetBuffer.addEventListener('updateend', () => {
        this.internetVideoPlayer.nativeElement.play();
      });
      this.internetBuffer = internetBuffer;
      this.subject.subscribe(chunk => {
        this.internetBuffer.appendBuffer(chunk);
        console.log('internet' + chunk);
      });
    });



    // リモート再生
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      // reader.result contains the contents of blob as a typed array
      // appendする
      this.remoteBuffer.appendBuffer(reader.result);
      console.log('remote: ' + reader.result.data);
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
      videoBitsPerSecond: 64000,
      mimeType: 'video/webm; codecs=vp9'
    };


    this.recorder = new MediaRecorder(this.localStream, options);

    this.recorder.ondataavailable = (event) => {
      // console.log('data available: evt.data.type=' + event.data.type + ' size=' + event.data.size);
      reader.readAsArrayBuffer(event.data); // byte[]
      this.sendChunk(event.data);
    }

    this.recorder.onstop = (event) => {
      console.log('recorder.onstop(), so playback');
      this.recorder = null;
    };

    this.recorder.start(1000);
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
