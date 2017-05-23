import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Observavle} from 'Rx';
import {VideoService} from './video.service';
import {Subject} from 'rxjs/Subject';
import {Members} from './Members';
import {MemberService} from './member.service';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable} from 'rxjs/Observable';

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


  // private internetBuffer;
  // @ViewChild('internetVideoPlayer') internetVideoPlayer: any;
  // private internetSource = new MediaSource();


  // for html
  // @Input() members: string[] = new Array();
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
      .concatMap( members => Observable.of<string[]>(members.members) )

  }

  private sendChunk(chunk: ArrayBuffer): void {
    this.videoService.send(chunk);
  }

}
