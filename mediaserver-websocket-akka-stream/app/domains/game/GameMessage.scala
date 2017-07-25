package domains.game

import scala.collection.immutable.HashMap
import scala.collection.mutable

sealed trait GameMessage

case class Join(roomId: String, userName: String) extends GameMessage

case class Leave(roomId: String, userName: String) extends GameMessage

case class Command(roomId: String, userName: String, command: Int) extends GameMessage

object Frame extends GameMessage

case class GameStatus(turn: Int, state: Int, players: Map[String, Int], board: Board) extends GameMessage {

  def join(name: String, players: Map[String, Int]): GameStatus = {
    val (newPlayers, newTurn) = if (players.isEmpty) {
      (players + (name -> 1), 0)
    } else if (players.size == 1) {
      (players + (name -> 2), 1)
    } else {
      (players, turn)
    }
    GameStatus(newTurn, state, newPlayers, board)
  }

  def command(name: String, command: Int): GameStatus = {
    // name から1P2P判定
    val commander = this.players(name)
    if (turn == commander) {
      judge(command, commander, this)
    } else {
      this
    }
  }

  private def judge(command: Int, commander: Int, now: GameStatus): GameStatus = {

    val newTurn = turn match {
      case 0 => commander match {
        case 1 => 2
        case 2 => 1
      }
      case 1 => 2
      case 2 => 1
    }

    val newBoard = now.board.update(command.toString, commander)

    if (newBoard.judge) {
      GameStatus(newTurn, commander, this.players, newBoard)
    } else if (newBoard.isFull) {
      GameStatus(newTurn, 3, this.players, newBoard)
    } else {
      GameStatus(newTurn, 0, this.players, newBoard)
    }

  }

}

class Board(
    val board: Map[String, Int]
) {

  def update(key: String, value: Int): Board = Board(this.board + (key -> value))

  def judge: Boolean = {
    val b = this.board

    println("""(b("1") == b("2") && b("2") == b("3") && b("1") != 0""" + (b("4") == b("5") && b("5") == b("6") && b("4") != 0))
    println("""(b("4") == b("5") && b("5") == b("6") && b("4"""" + (b("4") == b("5") && b("5") == b("6") && b("4") != 0))
    println("""(b("7") == b("8") && b("8") == b("9") && b("1") != 0)""" + (b("7") == b("8") && b("8") == b("9") && b("1") != 0))
    println("""(b("1") == b("4") && b("4") == b("7") && b("1") != 0) """ + (b("1") == b("4") && b("4") == b("7") && b("1") != 0))
    println("""(b("2") == b("5") && b("5") == b("8") && b("2") != 0)""" + (b("2") == b("5") && b("5") == b("8") && b("2") != 0))
    println("""(b("3") == b("6") && b("6") == b("9") && b("3") != 0) """ + (b("3") == b("6") && b("6") == b("9") && b("3") != 0))
    println("""(b("1") == b("5") && b("5") == b("9") && b("1") != 0)""" + (b("1") == b("5") && b("5") == b("9") && b("1") != 0))
    println("""(b("3") == b("5") && b("5") == b("7") && b("3") != 0)""" + (b("3") == b("5") && b("5") == b("7") && b("3") != 0))

    if (
      (b("1") == b("2") && b("2") == b("3") && b("1") != 0) ||
          (b("4") == b("5") && b("5") == b("6") && b("4") != 0) ||
          (b("7") == b("8") && b("8") == b("9") && b("7") != 0) ||
          (b("1") == b("4") && b("4") == b("7") && b("1") != 0) ||
          (b("2") == b("5") && b("5") == b("8") && b("2") != 0) ||
          (b("3") == b("6") && b("6") == b("9") && b("3") != 0) ||
          (b("1") == b("5") && b("5") == b("9") && b("1") != 0) ||
          (b("3") == b("5") && b("5") == b("7") && b("3") != 0)
    ) { true } else false
  }

  def isFull: Boolean = !this.board.values.mkString.contains("0")

}

object Board {

  def apply(): Board = {
    val b = new mutable.HashMap[String, Int]()
    for (key <- 1 to 9) {
      b += (key.toString -> 0)
    }
    new Board(b.toMap)
  }

  def apply(board: Map[String, Int]): Board = new Board(board)

}

