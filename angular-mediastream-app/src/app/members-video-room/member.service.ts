import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {WebSocketService} from '../websocket.service';
import {Members} from './Members';
import {environment} from '../../environments/environment';

@Injectable()
export class MemberService {

  private messages: Subject<Members>;

  private chatUrl(roomNumber: string, name: string): string {
    return `wss://${environment.mediaServerHost}:9443/members/stream/${roomNumber}?user_name=${name}`;
  }

  constructor(private ws: WebSocketService) {
  }

  connect(roomNumber: string, name: string): Subject<Members> {
    return this.messages = <Subject<Members>>this.ws
      .connect(this.chatUrl(roomNumber, name))
      .map((response: MessageEvent): Members => {
        const data = JSON.parse(response.data) as Members;
        return data;
      });
  }

  send(): void {} // do nothing

}
