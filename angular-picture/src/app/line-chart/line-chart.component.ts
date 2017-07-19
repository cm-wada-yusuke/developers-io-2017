import { Component, OnInit } from '@angular/core';


import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { Stocks } from './data';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

  title = 'D3.js with Angular 2!';
  subtitle = 'Line Chart';

  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;

  constructor() {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawLine();
  }

  /**
   * g: HTMLタグで、グループ化する
   * transform=translate('leftMargin, rightMargin') でマージン分だけ移動することを表す
   */
  private initSvg() {
    this.svg = d3.select('svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  /**
   * x軸: このコンポーネントサイズのタイムスケールを用意
   * y軸: 0地点の高さはこのコンポーネントの高さ、MAX地点を0に合わせる
   * x軸ドメイン: データオブジェクトのdateを使う
   * y軸ドメイン: データオブジェクトのvalueを使う
   */
  private initAxis() {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(Stocks, (d) => d.date ));
    this.y.domain(d3Array.extent(Stocks, (d) => d.value ));
  }

  /**
   * <g class="axis axis--x" transform="translate(0,450)" fill="none" font-size="10" font-family="sans-serif" text-anchor="middle">
   */
  private drawAxis() {

    /**
     * class付与、マージン分だけトップレベルからさらに移動して下部に描画する
     */
    this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));

    /**
     * class付与、左部に描画する。
     * 軸タイトルをつける。-90度回転させ、y=6,dy=.71emは不明。
     * y: y軸からの絶対距離。
     * dy: y軸からの相対距離。
     * text-anchor=endも不明。文字列は Price($)。
     */
    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Price ($)');
  }

  private drawLine() {

    // d3Shape.Lineオブジェクトを作る。x軸がdate, y軸がvalue。
    // 渡されたデータに'date'っていうのがあるはずなのでそれをx軸に使う。
    // 渡されたデータに'value'っていうのがあるはずなのでそれをy軸に使う。
    this.line = d3Shape.line()
      .x( (d: any) => this.x(d.date) )
      .y( (d: any) => this.y(d.value) );

    // svgのpath要素を作成する。
    // dataum で svg にデータをバインドする。
    // class=line, d=先程定義したラインデータを使う。
    this.svg.append('path')
      .datum(Stocks)
      .attr('class', 'line')
      .attr('d', this.line);
  }


}
