package infrastructure.game

import javax.inject.Inject

import domains.game.{ Board, Command, GameStatus, Join }

class GameLogic @Inject()(
    cacheStore: GameStatusCacheStore
) {

  def join(join: Join): Unit = {
    cacheStore.find(join.roomId) match {
      case None => ()
      case Some(s) =>
        val updated = s.join(join.userName, s.players)
        cacheStore.insertOrUpdate(updated, join.roomId)
    }
  }

  def command(command: Command): Unit = {
    cacheStore.find(command.roomId) match {
      case None => ()
      case Some(s) => cacheStore.insertOrUpdate(s.command(command.userName, command.command), command.roomId)
    }
  }

  def load(roomId: String): GameStatus = cacheStore.find(roomId).get

  def reset(roomId: String): Unit = cacheStore.insertOrUpdate(GameStatus(0, 0, Map[String, Int](), Board()), roomId)

}
