package controllers.member

import akka.actor.{ Actor, ActorRef, PoisonPill, Props }
import domains.member.{ Join, Leave }

class MemberRequestActor(out: ActorRef, roomId: String, userName: String) extends Actor {


  override def receive: Receive = {
    case m => () // do nothing.
  }

  override def preStart(): Unit = {
    out ! Join(userName)
  }

  override def postStop(): Unit = {
    out ! Leave(userName)
    out ! PoisonPill
  }
}

object MemberRequestActor {
  def props(out: ActorRef, roomId: String, userName: String): Props = Props(new MemberRequestActor(out, roomId, userName))
}
