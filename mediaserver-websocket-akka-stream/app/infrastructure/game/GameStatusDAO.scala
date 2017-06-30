package infrastructure.game

import javax.inject.{ Inject, Named }

import com.redis.RedisClientPool
import domains.game.GameStatus
import infrastructure.common.RedisJsonAdapter
import libs.GameStatusConverters
import play.api.libs.json.Format

class GameStatusDAO @Inject()(
    @Named("game_status") override val pool: RedisClientPool
)extends RedisJsonAdapter[GameStatus] with GameStatusCacheStore {

  private val ttl: Int = 60 // s

  override implicit def format: Format[GameStatus] = GameStatusConverters.GameStatusFormat

  override def insertOrUpdate(status: GameStatus, key: String): Unit =
    upsertByKey(key, ttl, status)

  override def find(key: String): Option[GameStatus] = findByKey(key)
}
