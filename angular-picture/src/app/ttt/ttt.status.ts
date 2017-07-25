export class TTTStatus {
  private _turn: number;
  private _state: number;
  private _players: {};
  private _board: {};

  constructor(turn: number, state: number, players: {}, board: {}) {
    this._turn = turn;
    this._state = state;
    this._players = players;
    this._board = board;
  }


  get turn(): number {
    return this._turn;
  }

  get state(): number {
    return this._state;
  }

  get players(): {} {
    return this._players;
  }

  get board(): {} {
    return this._board;
  }
}
