import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {WebSocketService} from '../websocket.service';
import {TTTStatus} from './ttt.status';
import {GameCommand} from './game-command';

@Injectable()
export class GameStatusService {

  private messages: Subject<TTTStatus>;

  private chatUrl(roomNumber: string, name: string): string {
    return `ws://172.17.0.132:9000/game/stream/${roomNumber}?user_name=${name}`;
  }

  constructor(private ws: WebSocketService) {
  }

  connect(roomNumber: string, name: string): Subject<TTTStatus> {
    return this.messages = <Subject<TTTStatus>>this.ws
      .connect(this.chatUrl(roomNumber, name))
      .map((response: MessageEvent): TTTStatus => {
        const data = JSON.parse(response.data) as TTTStatus;
        return data;
      });
  }

}
