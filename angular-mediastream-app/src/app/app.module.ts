import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';

import {WebSocketService} from './websocket.service';
import {ChatService} from './chat.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AppRoutingModule} from './routing/app-rouitng.module';
import { LobbyComponent } from './lobby/lobby.component';
import {AppNgAutoScrollDirective} from '../lib/ng-auto-scroll';
import { VideoRoomComponent } from './video-room/video-room.component';

///<reference path="./Bar.ts"/>

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    LobbyComponent,
    AppNgAutoScrollDirective,
    VideoRoomComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    WebSocketService,
    ChatService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
