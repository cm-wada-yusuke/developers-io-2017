package controllers

import javax.inject.Inject

import akka.actor.ActorSystem
import akka.stream.scaladsl.{ BroadcastHub, Flow, Keep, MergeHub, Sink }
import akka.stream.{ ActorMaterializer, KillSwitches, UniqueKillSwitch }
import play.api.mvc._

import scala.concurrent.duration._

class WebSocketController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  def connect() = WebSocket.accept[String, String] { req =>
    Flow.fromFunction(txt => s"flow passed! $txt")
  }

  def dynamic() = WebSocket.accept[String, String] { req =>
    DynamicStream.publishSubscribeFlow
  }

}

object DynamicStream {

  implicit val as = ActorSystem()
  implicit val mat = ActorMaterializer()

  lazy val publishSubscribeFlow: Flow[String, String, UniqueKillSwitch] = {
    // Obtain a Sink and Source which will publish and receive from the "bus" respectively.
    val (sink, source) =
      MergeHub.source[String](perProducerBufferSize = 16)
          .toMat(BroadcastHub.sink(bufferSize = 256))(Keep.both)
          .run()

    // Ensure that the Broadcast output is dropped if there are no listening parties.
    // If this dropping Sink is not attached, then the broadcast hub will not drop any
    // elements itself when there are no subscribers, backpressuring the producer instead.
    source.runWith(Sink.ignore)

    // We create now a Flow that represents a publish-subscribe channel using the above
    // started stream as its "topic". We add two more features, external cancellation of
    // the registration and automatic cleanup for very slow subscribers.
    val busFlow: Flow[String, String, UniqueKillSwitch] =
    Flow.fromSinkAndSource(sink, source)
        .joinMat(KillSwitches.singleBidi[String, String])(Keep.right)
        .backpressureTimeout(3.seconds)

    busFlow
  }

}