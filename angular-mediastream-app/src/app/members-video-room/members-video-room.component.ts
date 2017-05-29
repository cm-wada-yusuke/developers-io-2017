import {Component, OnInit, ViewChild} from '@angular/core';
import {Observavle} from 'Rx';
import {VideoService} from './video.service';
import {MemberService} from './member.service';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable} from 'rxjs/Observable';

declare const MediaRecorder: any;
declare const MediaSource: any;

@Component({
  selector: 'app-members-video-room',
  templateUrl: './members-video-room.component.html',
  providers: [VideoService, MemberService],
  styleUrls: ['./members-video-room.component.css']
})

export class MembersVideoRoomComponent implements OnInit {

  roomNumber: string;
  name: string;

  private localStream;
  private recorder;
  @ViewChild('localVideoPlayer') localVideoPlayer: any;


  members: Observable<string[]>;


  constructor(
    private videoService: VideoService,
    private memberService: MemberService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      this.roomNumber = params['roomNumber'];
    });

    this.route.queryParams.forEach((params: Params) => {
      this.name = params['name'];
    });

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

    this.members = this.memberService.connect(this.roomNumber, this.name)
      .debounceTime(1000)
      .distinctUntilChanged()
      .concatMap(members => {
        this.restart();
        return Observable.of<string[]>(members.members)
      });

  }


  start(): void {

    let subject = this.videoService.connect(this.roomNumber, this.name);

    const options = {
      audioBitsPerSecond: 64000,
      videoBitsPerSecond: 100000,
      mimeType: 'video/webm; codecs=vp9'
    };

    this.recorder = new MediaRecorder(this.localStream, options);

    this.recorder.ondataavailable = (event) => {
      subject.next(event.data);
    };

    this.recorder.onstop = (event) => {
      console.log('recorder.stop(), so playback');
      subject.complete();
      subject = null;
      this.recorder = null;
    };

    this.recorder.start(500);
    console.log('publish');
  }

  stop(): void {
    if (this.recorder) {
      this.recorder.stop();
      console.log('stop');
    }
  }

  restart(): void {

    if (!this.recorder) {
      return;
    }

    this.stop();
    this.start();

  }

}
