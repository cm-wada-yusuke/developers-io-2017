import {Subject, Observable, Observer} from 'rxjs/Rx';
import {Injectable} from '@angular/core';

@Injectable()
export class ArrayBufferWebSocketService {

  connect(url: string): Subject<MessageEvent> {
    return this.create(url);
  }

  private create(url: string): Subject<MessageEvent> {
    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer'; // https://developer.mozilla.org/ja/docs/Web/API/WebSocket

    const observable = Observable.create((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);

      return ws.close.bind(ws);
    });

    const observer = {
      next: (data: ArrayBuffer) => {
        console.log('sending... stats: ', ws.readyState, ws);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      },
      error: (e) => {
        console.log(e);
      },
    };

    return Subject.create(observer, observable);
  }

}
