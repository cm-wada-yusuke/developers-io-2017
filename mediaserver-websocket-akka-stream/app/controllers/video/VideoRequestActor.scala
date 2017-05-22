package controllers.video

import akka.actor.{ Actor, ActorRef, PoisonPill, Props }
import akka.util.ByteString
import domains.video.{ Leave, Video }


class VideoRequestActor(out: ActorRef, userName: String) extends Actor {

  override def receive: Receive = {
    case msg: Array[Byte] =>
      println(msg)
      out ! Video(userName, msg)
  }

  override def postStop(): Unit = {
    out ! Leave(userName)
    out ! PoisonPill
  }
}

object VideoRequestActor {
  def props(out: ActorRef, userName: String): Props = Props(new VideoRequestActor(out, userName))
}
