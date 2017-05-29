package infrastructure.video

import java.io.{ BufferedOutputStream, FileOutputStream }
import java.util.concurrent.atomic.AtomicReference
import javax.inject.{ Inject, Singleton }

import akka.actor.ActorSystem
import akka.stream.scaladsl.{ BroadcastHub, Flow, Keep, MergeHub, Sink }
import akka.stream.{ KillSwitches, Materializer, UniqueKillSwitch }
import domains.video._

import scala.collection.mutable
import scala.concurrent.duration._

@Singleton
class VideoRoomClient @Inject()(
    implicit val materializer: Materializer,
    implicit val system: ActorSystem
) extends VideoRoomRepository {

  import VideoRoomClient._

  override def videoRoom(roomId: String, userName: String): VideoRoom = synchronized {
    roomPool.get.get(roomId + userName) match {
      case Some(videoRoom) =>
        videoRoom
      case None =>
        val room = create(roomId, userName)
        roomPool.get() += (roomId + userName -> room)
        room
    }
  }

  private def create(roomId: String, userName: String): VideoRoom = {
    // Create bus parts.
    val (sink, source) =
      MergeHub.source[VideoMessage](perProducerBufferSize = 16)
          .filter {
            case Video(sender, _) => sender == userName
            case _ => true
          }
          .map {
            case v@Video(s, data) =>
              headerPool.get().get(roomId + userName) match {
                case None =>
                  headerPool.get() += (roomId + userName -> data)
                  Video(s, data)
                case _ => v
              }
            case j@Join(s) =>
//              headerPool.get().get(roomId + userName) match {
//                case None => j
//                case Some(h) => Video(s, h)
//              }
              j
            case s => s
          }
          .toMat(BroadcastHub.sink(bufferSize = 256))(Keep.both)
          .run()

    // Connect "drain outlet".
    source.runWith(Sink.ignore)

    val channel = VideoChannel(sink, source)

    val bus: Flow[VideoMessage, VideoMessage, UniqueKillSwitch] = Flow.fromSinkAndSource(channel.sink, channel.source)
        .joinMat(KillSwitches.singleBidi[VideoMessage, VideoMessage])(Keep.right)
        .backpressureTimeout(3.seconds)
        .map {
          case v@Video(sender, data) =>
            println(s"Video: $sender, $data")
            //            val bos = new BufferedOutputStream(new FileOutputStream(data.toString))
            //            bos.write(data)
            //            bos.close() // You may end up with 0 bytes file if not calling close.
            v
          case l@Leave(sender) =>
            println(s"Leave: $sender")
            l
          case j@Join(sender) =>
            println(s"Join: $sender")
            j
        }


    VideoRoom(roomId, bus)
  }
}

object VideoRoomClient {

  private var rooms: scala.collection.mutable.Map[String, VideoRoom] = scala.collection.mutable.Map()

  val roomPool: AtomicReference[scala.collection.mutable.Map[String, VideoRoom]] =
    new AtomicReference[mutable.Map[String, VideoRoom]](rooms)


  private var headers: scala.collection.mutable.Map[String, Array[Byte]] = scala.collection.mutable.Map()

  val headerPool: AtomicReference[scala.collection.mutable.Map[String, Array[Byte]]] =
    new AtomicReference[mutable.Map[String, Array[Byte]]](headers)

}
