import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ChatComponent} from '../chat/chat.component';
import {LobbyComponent} from '../lobby/lobby.component';
import {VideoRoomComponent} from '../video-room/video-room.component';


const routes: Routes = [
  {path: '', redirectTo: '/rooms', pathMatch: 'full'},
  {path: 'rooms', component: LobbyComponent},
  {path: 'rooms/:roomNumber', component: ChatComponent},
  {path: 'video/:roomNumber', component: VideoRoomComponent}
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
