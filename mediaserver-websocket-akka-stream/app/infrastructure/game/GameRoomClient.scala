package infrastructure.game

import java.util.concurrent.atomic.AtomicReference
import javax.inject.Inject

import akka.actor.ActorSystem
import akka.stream._
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

  override def gamrRoom(roomId: String, userName: String): GameRoom = synchronized {
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
    // bufferSize を大きくすることで、消費されなくてもバッファされる。いっぱいになるとバックプレッシャーがかかる。
    val (sink, source) =
    MergeHub.source[GameMessage](perProducerBufferSize = 16)
        .toMat(BroadcastHub.sink(bufferSize = 1024))(Keep.both)
        .run()


    val channel = GameChannel(sink, source)

    val bus: Flow[GameMessage, GameMessage, UniqueKillSwitch] = Flow.fromSinkAndSource(channel.sink, channel.source)
        .joinMat(KillSwitches.singleBidi[GameMessage, GameMessage])(Keep.right)
        //        .backpressureTimeout(3.seconds)
        .map[GameMessage] {
      case j: Join =>
        gameLogic.join(j)
        println(j)
        cacheStore.find(roomId).get
      case c: Command =>
        gameLogic.command(c)
        println(c)
        cacheStore.find(roomId).get
      case Frame =>
        val f = cacheStore.find(roomId).get
        println(f)
        f
      case m =>
        println(m)
        m
    }

    bus.runWith(
      Source.repeat(Frame).throttle(1, 1.second, 100, ThrottleMode.Shaping),
      //Sink.foreach(println) // Connect "drain outlet".
      Sink.ignore
    )

    //
    //    val actorSource = bus.runWith(
    //      Source.actorRef[GameMessage](bufferSize = 1024, OverflowStrategy.dropBuffer),
    //      Sink.foreach(println) // Connect "drain outlet".
    //    )._1
    //
    //    system.scheduler.schedule(3.seconds, 1 second){
    //      actorSource ! Frame
    //    }

    GameRoom(roomId, bus)
  }
}

object GameRoomClient {

  private var rooms: scala.collection.mutable.Map[String, GameRoom] = scala.collection.mutable.Map()

  val roomPool: AtomicReference[scala.collection.mutable.Map[String, GameRoom]] =
    new AtomicReference[mutable.Map[String, GameRoom]](rooms)

}