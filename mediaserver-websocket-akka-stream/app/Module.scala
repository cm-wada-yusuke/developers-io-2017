import com.google.inject.AbstractModule
import domains.chat.ChatRoomRepository
import domains.member.MemberRepository
import domains.video.VideoRoomRepository

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
  }

}
