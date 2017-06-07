import {Component, OnInit, SimpleChange, ViewChild} from '@angular/core';
import {Greeter} from './greeter';
import {SimpleGame} from './simplegame';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit {

  @ViewChild('content') content: any;

  constructor() { }

  ngOnInit() {
    const greeter = new Greeter(this.content.nativeElement);
    greeter.start();
    const game = new SimpleGame();
  }

}
