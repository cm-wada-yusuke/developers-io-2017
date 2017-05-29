package controllers.video

import akka.actor.{ Actor, ActorRef, PoisonPill, Props }
import domains.video.{ Leave, Video }

class VideoResponseActor(out: ActorRef, me: String) extends Actor {

  override def receive: Receive = {
    case Video(s, bytes) =>
      println(s"Video: $s, $bytes")
      out ! bytes
    case Leave(userName) =>
      if (userName == me) {
        out ! PoisonPill
        self ! PoisonPill
      }
  }
}

object VideoResponseActor {
  def props(out: ActorRef, me: String): Props = Props(new VideoResponseActor(out, me))
}

