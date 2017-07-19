import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LineChartComponent} from './line-chart/line-chart.component';
import {ChartRoutingModule} from './chart/chart-routing.module';
import {RouterModule, Routes} from '@angular/router';
import { TttComponent } from './ttt/ttt.component';


const routes: Routes = [
  { path: '', redirectTo: '/lineChart', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    LineChartComponent,
    TttComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    ChartRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
