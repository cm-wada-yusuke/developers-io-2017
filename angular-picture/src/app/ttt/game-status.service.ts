import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {WebSocketService} from '../websocket.service';
import {TTTStatus} from './ttt.status';
import {GameCommand} from './game-command';
import {Http, Headers} from '@angular/http';

@Injectable()
export class GameStatusService {

  private messages: Subject<TTTStatus>;

  private url(roomNumber: string, name: string): string {
    return `ws://172.17.0.132:9000/game/stream/${roomNumber}?user_name=${name}`;
  }

  private commandUrl(roomNumber: string): string {
    return `http://172.17.0.132:9000/game/command/${roomNumber}`;
  }

  constructor(
    private ws: WebSocketService,
    private http: Http
  ) {
  }

  connect(roomNumber: string, name: string): Subject<TTTStatus> {
    console.log('コネクト：', this.url(roomNumber, name));
    return this.messages = <Subject<TTTStatus>>this.ws
      .connect(this.url(roomNumber, name))
      .map((response: MessageEvent): TTTStatus => {
        console.log('レスポンスデータ：', response.data);
        const data = JSON.parse(response.data) as TTTStatus;
        return data;
      });
  }

  command(roomId: string, name: string, command: number): void {
    this.post(roomId, this.createCommand(roomId, name, command));
  }

  private createCommand(name: string, message: string, command: number): GameCommand {
    return new GameCommand(name, message, command);
  }

  private post(roomId: string, command: GameCommand): Promise<GameCommand> {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    return this.http
      .post(this.commandUrl(roomId), JSON.stringify(command), {headers: headers})
      .toPromise()
      .then(res => res.json());
      // .catch(e => e);
  }

  reset(roomId: string): void {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    this.http
      .delete(this.commandUrl(roomId), {headers: headers})
      .toPromise()
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
