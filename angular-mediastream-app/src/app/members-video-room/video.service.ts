import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {ArrayBufferWebSocketService} from '../arraybuffer-websocket.service';
import {environment} from '../../environments/environment';

@Injectable()
export class VideoService {

  private url(roomNumber: string, name: string): string {
    return `ws://${environment.mediaServerHost}:9000/video/stream/${roomNumber}?user_name=${name}`;
  }

  constructor(private ws: ArrayBufferWebSocketService) {
  }

  connect(roomNumber: string, name: string): Subject<ArrayBuffer> {
    console.log('connect:', this.url(roomNumber, name));
    return <Subject<ArrayBuffer>>this.ws
      .connect(this.url(roomNumber, name))
      .map((response: MessageEvent): ArrayBuffer => {
        const data = response.data;
        return data;
      });
  }

}
