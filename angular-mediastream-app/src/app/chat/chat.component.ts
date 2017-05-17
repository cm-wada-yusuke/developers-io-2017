import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {ChatService} from '../chat.service';

import {Md5} from 'ts-md5/dist/md5';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [ChatService],
  encapsulation: ViewEncapsulation.None
})
export class ChatComponent implements OnInit {

  roomNumber: string;
  name: string;

  // for html
  @Input() messages: ChatModel[] = new Array();

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {
  }

  send(message: string): void {
    this.chatService.send(
      this.name, message
    );
  }

  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      this.roomNumber = params['roomNumber'];
    });

    this.route.queryParams.forEach((params: Params) => {
      this.name = params['name'];
    });

    this.chatService.connect(this.roomNumber, this.name).subscribe(msg => {

      const isMe = msg.userName === this.name;

      this.messages.push(new ChatModel(
        msg.userName,
        msg.text,
        msg.systemFlag,
        {
          me: isMe,
          someone: !isMe
        },
        this.color6(msg.userName)
      ));
    });
  }

  private color6(key: string): string {
    const hash6 = Md5.hashStr(encodeURIComponent(key)).toString().slice(6, 12);
    const rgb = parseInt(hash6, 16) % 1000000;
    return ('000000' + rgb).slice(-6);
  }

}

class ChatModel {

  userName: string;
  text: string;
  systemFlag: boolean;
  speaker: {};
  faceColor: string;

  constructor(userName: string, text: string, systemFlag: boolean, speaker: {}, faceColor: string) {
    this.userName = userName;
    this.text = text;
    this.systemFlag = systemFlag;
    this.speaker = speaker;
    this.faceColor = faceColor;
  }
}
