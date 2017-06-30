package infrastructure.game

import java.util.concurrent.atomic.AtomicReference
import javax.inject.Inject

import akka.actor.ActorSystem
import akka.stream.{ KillSwitches, Materializer, ThrottleMode, UniqueKillSwitch }
import akka.stream.scaladsl.{ BroadcastHub, Flow, Keep, MergeHub, Sink, Source }
import domains.game._

import scala.collection.mutable
import scala.concurrent.duration._


class GameRoomClient @Inject()(
    implicit val materializer: Materializer,
    implicit val system: ActorSystem,
    cacheStore: GameStatusCacheStore,
    gameLogic: GameLogic
) extends GameRoomRepository {

  import GameRoomClient._

  override def chatRoom(roomId: String, userName: String): GameRoom = synchronized {
    roomPool.get.get(roomId) match {
      case Some(chatRoom) =>
        chatRoom
      case None =>
        val room = create(roomId)
        roomPool.get() += (roomId -> room)
        room
    }
  }

  private def create(roomId: String): GameRoom = {
    // create game status
    cacheStore.find(roomId) match {
      case Some(x) => ()
      case None => cacheStore.insertOrUpdate(GameStatus(0, 0, Map[String, Int](), Board()), roomId)
    }

    // Create bus parts.
    val (sink, source) =
      MergeHub.source[GameMessage](perProducerBufferSize = 16)
          .toMat(BroadcastHub.sink(bufferSize = 256))(Keep.both)
          .run()

    // Connect "drain outlet".
    source.runWith(Sink.ignore)

    // Game status publisher.
    sink.runWith(Source.repeat(Frame).throttle(1, 1.second, 5, ThrottleMode.Shaping))

    val channel = GameChannel(sink, source)

    val bus: Flow[GameMessage, GameMessage, UniqueKillSwitch] = Flow.fromSinkAndSource(channel.sink, channel.source)
        .joinMat(KillSwitches.singleBidi[GameMessage, GameMessage])(Keep.right)
        .backpressureTimeout(3.seconds)
        .map[GameMessage] {
      case j: Join =>
        gameLogic.join(j)
        cacheStore.find(roomId).get
      case c: Command =>
        println("GameRoomClient: " + c)
        gameLogic.command(c)
        cacheStore.find(roomId).get
      case Frame =>
        val f = cacheStore.find(roomId).get
        println(f)
        f
      case m =>
        println(m)
        m

    }

    GameRoom(roomId, bus)
  }
}

object GameRoomClient {

  private var rooms: scala.collection.mutable.Map[String, GameRoom] = scala.collection.mutable.Map()

  val roomPool: AtomicReference[scala.collection.mutable.Map[String, GameRoom]] =
    new AtomicReference[mutable.Map[String, GameRoom]](rooms)

}