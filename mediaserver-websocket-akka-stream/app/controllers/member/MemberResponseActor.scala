package controllers.member

import akka.actor.{ Actor, ActorRef, PoisonPill, Props }
import domains.member.Members
import play.api.libs.json.Json

class MemberResponseActor(out: ActorRef, roomId: String, userName: String) extends Actor {

  import MembersConverters._

  override def receive: Receive = {
    case m: Members =>
      out ! Json.toJson(m)
  }

  override def postStop(): Unit = out ! PoisonPill
}

object MemberResponseActor {
  def props(out: ActorRef, roomId: String, userName: String): Props = Props(new MemberResponseActor(out, roomId, userName))
}
