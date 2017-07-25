import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  @Input() roomType: string;

  constructor(
    private router: Router
  ) {
  }

  join(roomNumber: string, name: string): void {
    this.router.navigate([
        './' + this.roomType,
        roomNumber
      ],
      {queryParams: {name: name}}
    );
  }

  ngOnInit() {
    this.roomType = 'ttt';
  }

}
