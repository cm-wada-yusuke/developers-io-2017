package infrastructure.game

import domains.game.GameStatus

trait GameStatusCacheStore {

  def insertOrUpdate(status: GameStatus, key: String): Unit

  def find(key: String): Option[GameStatus]

}
