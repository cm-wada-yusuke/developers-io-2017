import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  roomType: string;
  serverAddress = `https://${environment.mediaServerHost}:9443/`

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
    this.roomType = 'video';
  }

}
