import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {GameCommand} from './game-command';
import {WebSocketService} from '../websocket.service';

@Injectable()
export class GameCommandService {

  private messages: Subject<GameCommand>;

  private chatUrl(roomNumber: string, name: string): string {
    return `ws://localhost:9000/game/stream/${roomNumber}?user_name=${name}`;
  }

  constructor(private ws: WebSocketService) {
  }

  connect(roomNumber: string, name: string): Subject<GameCommand> {
    return this.messages = <Subject<GameCommand>>this.ws
      .connect(this.chatUrl(roomNumber, name))
      .map((response: MessageEvent): GameCommand => {
        return this.createCommand('dummy', 'dummy', 0);
      });
  }

  send(roomId: string, name: string, command: number): void {
    this.messages.next(this.createCommand(roomId, name, command));
  }

  private createCommand(name: string, message: string, command: number): GameCommand {
    return new GameCommand(name, message, command);
  }

}
