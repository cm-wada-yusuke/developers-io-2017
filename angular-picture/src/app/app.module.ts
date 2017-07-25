import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LineChartComponent} from './line-chart/line-chart.component';
import {ChartRoutingModule} from './chart/chart-routing.module';
import {RouterModule, Routes} from '@angular/router';
import {TttComponent} from './ttt/ttt.component';
import {WebSocketService} from './websocket.service';
import {LobbyComponent} from './lobby/lobby.component';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';


const routes: Routes = [
  {path: '', redirectTo: '/lobby', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    LineChartComponent,
    TttComponent,
    LobbyComponent
  ],
  imports: [
    HttpModule,
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    ChartRoutingModule
  ],
  providers: [
    WebSocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
