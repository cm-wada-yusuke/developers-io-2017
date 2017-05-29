package controllers.video

import javax.inject.Inject

import akka.actor.{ Actor, ActorRef, ActorRefFactory, ActorSystem, OneForOneStrategy, PoisonPill, Props, Status, SupervisorStrategy, Terminated }
import akka.stream.{ Materializer, OverflowStrategy }
import akka.stream.scaladsl.{ Flow, Keep, Sink, Source }
import domains.video.VideoMessage
import play.api.libs.streams.ActorFlow
import play.api.mvc.WebSocket
import services.video.VideoService


class VideoController @Inject()(
    implicit val system: ActorSystem,
    implicit val materializer: Materializer,
    streamVideoService: VideoService
) {

  def start(roomId: String) = WebSocket.accept[Array[Byte], Array[Byte]] { request =>


    val userName = request.queryString("user_name").headOption.getOrElse("anon")

    val userInput: Flow[Array[Byte], VideoMessage, _] = LoggingActorFlow.actorRef[Array[Byte], VideoMessage](out => VideoRequestActor.props(out, userName))
    val room = streamVideoService.start(roomId, userName)
    val userOutPut: Flow[VideoMessage, Array[Byte], _] = ActorFlow.actorRef[VideoMessage, Array[Byte]](out => VideoResponseActor.props(out, userName))

    userInput.viaMat(room.bus)(Keep.right).viaMat(userOutPut)(Keep.right)
  }
}


object LoggingActorFlow {

  /**
   * Create a flow that is handled by an actor.
   *
   * Messages can be sent downstream by sending them to the actor passed into the props function.  This actor meets
   * the contract of the actor returned by [[akka.stream.scaladsl.Source.actorRef]].
   *
   * The props function should return the props for an actor to handle the flow. This actor will be created using the
   * passed in [[akka.actor.ActorRefFactory]]. Each message received will be sent to the actor - there is no back pressure,
   * if the actor is unable to process the messages, they will queue up in the actors mailbox. The upstream can be
   * cancelled by the actor terminating itself.
   *
   * @param props            A function that creates the props for actor to handle the flow.
   * @param bufferSize       The maximum number of elements to buffer.
   * @param overflowStrategy The strategy for how to handle a buffer overflow.
   */
  def actorRef[In, Out](props: ActorRef => Props, bufferSize: Int = 16, overflowStrategy: OverflowStrategy = OverflowStrategy.dropNew)(implicit factory: ActorRefFactory, mat: Materializer): Flow[In, Out, _] = {

    val (outActor, publisher) = Source.actorRef[Out](bufferSize, overflowStrategy)
        .toMat(Sink.asPublisher(false))(Keep.both).run()

    Flow.fromSinkAndSource(
      Sink.actorRef(factory.actorOf(Props(new Actor {
        val flowActor = context.watch(context.actorOf(props(outActor), "flowActor"))

        def receive = {
          case Status.Success(ss) =>
//            println("LoggingActorFlow: Finished", ss)
            flowActor ! PoisonPill
          case Status.Failure(fs) =>
            println("LoggingActorFlow: Failure", fs)
            flowActor ! PoisonPill
          case Terminated(a) =>
            println("LoggingActorFlow: Terminated", a)
            context.stop(self)
          case other =>
//            println("LoggingActorFlow: Other", other)
            flowActor ! other
        }

        override def supervisorStrategy = OneForOneStrategy() {
          case _ => SupervisorStrategy.Stop
        }
      })), Status.Success(())),
      Source.fromPublisher(publisher)
    )
  }
}