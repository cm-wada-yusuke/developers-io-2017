import javax.inject.Named

import com.google.inject.{ AbstractModule, Provides, Singleton }
import com.redis.RedisClientPool
import domains.chat.ChatRoomRepository
import domains.game.GameRoomRepository
import domains.member.MemberRepository
import domains.video.VideoRoomRepository
import infrastructure.game.GameStatusCacheStore
import play.api.Configuration

/**
 * This class is a Guice module that tells Guice how to bind several
 * different types. This Guice module is created when the Play
 * application starts.

 * Play will automatically use any class called `Module` that is in
 * the root package. You can create modules in other locations by
 * adding `play.modules.enabled` settings to the `application.conf`
 * configuration file.
 */
class Module extends AbstractModule {

  override def configure() = {
    bind(classOf[ChatRoomRepository]).to(classOf[infrastructure.chat.ChatRoomClient])
    bind(classOf[VideoRoomRepository]).to(classOf[infrastructure.video.VideoRoomClient])
    bind(classOf[MemberRepository]).to(classOf[infrastructure.member.MemberClient])
    bind(classOf[GameRoomRepository]).to(classOf[infrastructure.game.GameRoomClient])
    bind(classOf[GameStatusCacheStore]).to(classOf[infrastructure.game.GameStatusDAO])
  }

  @Provides
  @Singleton
  @Named("game_status")
  def provideContentsRedisClientPool(configuration: Configuration): RedisClientPool =
    generateRedisClientPool(configuration, 0)

  private def generateRedisClientPool(configuration: Configuration, databaseNumber: Int): RedisClientPool =
    new RedisClientPool(
      configuration.getString("redis.host").get,
      configuration.getInt("redis.port").get,
      database = databaseNumber
    )

}
