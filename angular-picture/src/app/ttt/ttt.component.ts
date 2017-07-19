import {Component, OnInit} from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Color from 'd3-color';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import {ScaleOrdinal} from 'd3-scale';


@Component({
  selector: 'app-ttt',
  templateUrl: './ttt.component.html',
  styleUrls: ['./ttt.component.css']
})
export class TttComponent implements OnInit {

  private margin = {top: 100, right: 100, bottom: 100, left: 100};
  private width = 384;
  private height = 256;
  private svg: any;
  private x: any;
  private y: any;
  private numrows = 15;
  private numcols = 10;
  private matrix = new Array(this.numrows);

  constructor() {
  }

  ngOnInit() {
    this.initSvg();
    this.initAxis();
    this.draw();
  }

  private initSvg() {
    this.svg = d3.select('svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.svg.append('rect')
      .attr('class', 'background')
      .attr('width', this.width)
      .attr('height', this.height);

    for (let i = 0; i < this.numrows; i++) {
      this.matrix[i] = new Array(this.numcols);
      for (let j = 0; j < this.numcols; j++) {
        this.matrix[i][j] = Math.random() * 2 - 1;
      }
    }
  }

  private initAxis() {
    this.x = d3Scale.scaleBand()
      .domain(d3Array.range(this.numcols).map((v) => v.toString()))
      .range([0, this.width]);


    this.y = d3Scale.scaleBand()
      .domain(d3Array.range(this.numrows).map((v) => v.toString()))
      .range([0, this.height]);
  }

  private draw() {
    // const colorMap = d3Scale.scaleLinear()
    //   .domain([-1, 0, 1])
    //   .range([parseInt('0xFF0000', 16), parseInt('0x000000', 16), parseInt('0x0000FF', 16)]);

    const colorMap = d3Scale.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(['red', 'white', 'blue']);


    const row = this.svg.selectAll('.row')
      .data(this.matrix)
      .enter().append('g')
      .attr('class', 'row')
      .attr('transform', function (d, i) {
        console.log(this.y);
        return 'translate(0,' + (this.y)(i) + ')';
      }.bind(this));

    row.selectAll('.cell')
      .data(function (d) {
        return d;
      })
      .enter().append('rect')
      .attr('class', 'cell')
      .attr('x', function (d, i) {
        return this.x(i);
      }.bind(this))
      .attr('width', this.x.bandwidth())
      .attr('height', this.y.bandwidth())
      .style('stroke-width', 0);

    row.append('line')
      .attr('x2', this.width);

    console.log(this.y.bandwidth());
    row.append('text')
      .attr('x', 0)
      .attr('y', this.y.bandwidth() / 2)
      .attr('dy', '.32em')
      .attr('text-anchor', 'end')
      .text(function (d, i) {
        return i;
      });

    const column = this.svg.selectAll('.column')
      .enter().append('g')
      .attr('class', 'column')
      .attr('transform', function (d, i) {
        return 'translate(' + this.x(i) + ')rotate(-90)';
      }.bind(this));

    column.append('line')
      .attr('x1', -this.width);

    column.append('text')
      .attr('x', 6)
      .attr('y', this.y.bandwidth() / 2)
      .attr('dy', '.32em')
      .attr('text-anchor', 'start')
      .text(function (d, i) {
        return d;
      });

    row.selectAll('.cell')
      .data(function (d, i) {
        return this.matrix[i];
      }.bind(this))
      .style('fill', colorMap);

  }

}
