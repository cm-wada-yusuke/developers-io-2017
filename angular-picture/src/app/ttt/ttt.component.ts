import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Color from 'd3-color';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import {ScaleOrdinal} from 'd3-scale';
import {selection} from 'd3-selection';
import {TTTStatus} from './ttt.status';
import {Observable} from 'rxjs/Observable';
import {GameStatusService} from './game-status.service';
import {GameCommandService} from './game-command.service';
import {GameCommand} from './game-command';
import {Subject} from 'rxjs/Subject';


@Component({
  selector: 'app-ttt',
  templateUrl: './ttt.component.html',
  providers: [GameStatusService, GameCommandService],
  styleUrls: ['./ttt.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TttComponent implements OnInit {

  game: TTTStatus;
  roomNumber: string;
  name: string;
  colorMap: {};

  private margin = {top: 100, right: 100, bottom: 100, left: 100};
  private width = 384;
  private height = 256;
  private svg: any;
  private x: any;
  private y: any;
  private numrows = 3;
  private numcols = 3;
  private matrix = new Array(this.numrows);

  constructor(
    private route: ActivatedRoute,
    private statusService: GameStatusService,
    private commandService: GameCommandService
  ) {
  }

  ngOnInit() {
    this.initGame();
    this.initSvg();
    this.initAxis();
    this.draw();
  }

  private initGame() {
    this.route.params.forEach((params: Params) => {
      this.roomNumber = params['roomNumber'];
    });

    this.route.queryParams.forEach((params: Params) => {
      this.name = params['name'];
    });

    this.colorMap = {1: this.randomRGBLeft(), 2: this.randomRGBRight(), 0: 'white'};

    this.game = new TTTStatus(0, 0, {}, {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0});

    this.statusService.connect(this.roomNumber, this.name).subscribe(msg => {
      this.game = msg;
      this.paintBoard(this.game.board);
    });

    this.commandService.connect(this.roomNumber, this.name).subscribe(msg => {
      // do nothing.
      console.log(msg);
    });

  }

  private initSvg() {
    this.svg = d3.select('svg')
      .append('g')
      .attr('class', 'matrix')
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
    // .domain(d3Array.range(this.numcols).map((v) => v.toString()))
      .domain(d3Array.range(this.numcols).map((v) => v.toString()))
      .range([0, this.width]);


    this.y = d3Scale.scaleBand()
      .domain(d3Array.range(this.numrows).map((v) => v.toString()))
      .range([0, this.height]);
  }

  private draw() {

    const row = this.svg.selectAll('.row')
      .data(this.matrix)
      .enter().append('g')
      .attr('class', 'row')
      .attr('transform', function (d, i) {
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
      .attr('stroke', '#2378ae')
      .style('stroke-width', 1);

    row.append('line')
      .attr('x2', this.width);

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
      .style('fill', 'white');

    this.svg.selectAll('.cell')
      .on('click', (d, i) => {
        this.commandService.send(this.roomNumber, this.name, i + 1);
      });


  }

  private selection(n) {
    return (d, i) => i === n;
  }

  private paintBoard(board: {}): void {
    // d3 オブジェクト取得
    const row = this.svg.selectAll('.row');

    // 順番に見ていって塗りつぶしていく
    Object.keys(board).forEach((v, i, a) => {
      const player = board[v];
      const color = this.colorMap[player];
      const p = new Point(Number(v));
      row.filter(this.selection(p.x))
        .selectAll('.cell')
        .filter(this.selection(p.y))
        .style('fill', color);
    });
  }

  private randomRGBLeft(): string {
    return d3Scale.interpolateWarm(Math.random() * 0.25);
  }

  private randomRGBRight(): string {
    return d3Scale.interpolateWarm(Math.random() * (1 - 0.75) + 0.75);
  }

  positionName(status: TTTStatus, yourName: string): string {
    const n = status.players[yourName];
    if (n) {
      return `あなたはプレイヤー${n}です。`;
    } else {
      return 'あなたは観戦者です';
    }
  }

  statusName(status: TTTStatus): string {
    switch (status.state) {
      case 0:
        return '未決着です';
      case 1:
      case 2:
        return `プレイヤー${status.state}の勝利です`;
      case 3:
        return '引き分けです';
    }
  }

  turnName(status: TTTStatus, yourName: string): string {
    if (status.turn === 0) {
      return '相手の参加待ちです';
    }
    const n = status.players[yourName];
    console.log(status.players[yourName], n);
    console.log(status.players, yourName);
    if (n && n === status.turn) {
      return 'あなたの手番です';
    } else if (n) {
      return '相手の手番です';
    } else {
      return `プレイヤー ${status.turn} の手番です。`;
    }
  }

}

export class Point {

  private _x: number;
  private _y: number;

  constructor(private boardNumber: number) {
    this._x = Math.floor((boardNumber - 1) / 3);
    this._y = (boardNumber - 1) % 3;
  }


  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }
}
