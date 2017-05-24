import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {ArrayBufferWebSocketService} from '../arraybuffer-websocket.service';

@Injectable()
export class VideoService {

  private url(roomNumber: string, name: string): string {
    return `wss://192.168.11.2:9443/video/stream/${roomNumber}?user_name=${name}`;
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

  // send(chunk: ArrayBuffer): void {
  //   this.subject.next(chunk);
  // }

}
