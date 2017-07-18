import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LineChartComponent} from '../line-chart/line-chart.component';

const routes: Routes = [
  {path: 'lineChart', component: LineChartComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChartRoutingModule { }
