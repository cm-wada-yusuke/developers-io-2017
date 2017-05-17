import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ChatComponent} from '../chat/chat.component';
import {LobbyComponent} from '../lobby/lobby.component';


const routes: Routes = [
  {path: '', redirectTo: '/rooms', pathMatch: 'full'},
  {path: 'rooms', component: LobbyComponent},
  {path: 'rooms/:roomNumber', component: ChatComponent}
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
