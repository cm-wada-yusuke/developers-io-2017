import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ChatComponent} from '../chat/chat.component';
import {LobbyComponent} from '../lobby/lobby.component';
import {VideoRoomComponent} from '../video-room/video-room.component';
import {MembersVideoRoomComponent} from '../members-video-room/members-video-room.component';


const routes: Routes = [
  {path: '', redirectTo: '/lobby', pathMatch: 'full'},
  {path: 'lobby', component: LobbyComponent},
  {path: 'chat/:roomNumber', component: ChatComponent},
  {path: 'localVideo/:roomNumber', component: VideoRoomComponent},
  {path: 'video/:roomNumber', component: MembersVideoRoomComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule {
}
