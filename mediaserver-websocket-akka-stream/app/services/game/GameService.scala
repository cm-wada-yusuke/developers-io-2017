package services.game

import javax.inject.Inject

import domains.game.{ Command, GameRoom, GameRoomRepository, GameStatus }
import infrastructure.game.GameLogic

class GameService @Inject()(
    repository: GameRoomRepository,
    gameLogic: GameLogic
) {

  def start(roomId: String, userName: String): GameRoom = repository.gamrRoom(roomId, userName)

  def command(command: Command): Unit = gameLogic.command(command)

  def load(roomId: String): GameStatus = gameLogic.load(roomId)

  def reset(roomId: String): Unit = gameLogic.reset(roomId)

}
