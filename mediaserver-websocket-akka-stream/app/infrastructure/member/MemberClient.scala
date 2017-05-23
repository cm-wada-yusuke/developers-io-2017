package infrastructure.member

import java.util.concurrent.atomic.AtomicReference
import javax.inject.{ Inject, Singleton }

import akka.actor.ActorSystem
import akka.stream.scaladsl.{ BroadcastHub, Flow, Keep, MergeHub, Sink }
import akka.stream.{ KillSwitches, Materializer, UniqueKillSwitch }
import domains.member._

import scala.collection.mutable
import scala.concurrent.duration._

@Singleton
class MemberClient @Inject()(
    implicit val materializer: Materializer,
    implicit val system: ActorSystem
) extends MemberRepository {

  import MemberClient._
  import MembersPool._

  override def members(roomId: String, userName: String): MemberChannel = synchronized {
    cannelsPool.get.get(roomId) match {
      case Some(channel) =>
        channel
      case None =>
        val channel = create(roomId)
        cannelsPool.get() += (roomId -> channel)
        channel
    }
  }


  private def create(roomId: String): MemberChannel = {
    // Create bus parts.
    val (sink, source) =
      MergeHub.source[MemberMessage](perProducerBufferSize = 16)
          .map {
            case Join(name) =>
              MembersPool.memberPool.get.get(roomId) match {
                case Some(ms) =>
                  val newMember = List(name)
                  val members = Members(ms.members ::: newMember)
                  memberPool.get() += (roomId -> members)
                  println(s"join ${newMember}, members: ${members}")
                  members
                case None =>
                  val members = Members(List(name))
                  memberPool.get() += (roomId -> members)
                  println(s"join ${members}, members: ${members}")
                  members
              }
            case Leave(name) =>
              memberPool.get.get(roomId) match {
                case Some(ms) =>
                  val filteredMember = ms.members.filterNot(_ == name)
                  val members = Members(filteredMember)
                  memberPool.get() += (roomId -> members)
                  println(s"leave ${filteredMember}, members: ${members}")
                  members
                case None =>
                  Members(List())
              }

          }
          .toMat(BroadcastHub.sink[Members](bufferSize = 256))(Keep.both)
          .run()

    // Connect "drain outlet".
    source.runWith(Sink.ignore)

    val bus: Flow[MemberMessage, Members, UniqueKillSwitch] = Flow.fromSinkAndSource(sink, source)
        .joinMat(KillSwitches.singleBidi[Members, MemberMessage])(Keep.right)
        .backpressureTimeout(3.seconds)

    MemberChannel(roomId, bus)
  }
}


object MemberClient {
  private val cannels: scala.collection.mutable.Map[String, MemberChannel] = scala.collection.mutable.Map()

  val cannelsPool: AtomicReference[scala.collection.mutable.Map[String, MemberChannel]] =
    new AtomicReference[mutable.Map[String, MemberChannel]](cannels)
}

object MembersPool {

  private var members: scala.collection.mutable.Map[String, Members] = scala.collection.mutable.Map()

  val memberPool: AtomicReference[scala.collection.mutable.Map[String, Members]] =
    new AtomicReference[mutable.Map[String, Members]](members)

}