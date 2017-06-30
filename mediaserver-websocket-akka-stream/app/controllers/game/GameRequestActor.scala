package controllers.game

import akka.actor.{ Actor, ActorRef, PoisonPill, Props }
import domains.game.{ Command, Join, Leave }
import play.api.libs.json.JsValue

class GameRequestActor(out: ActorRef, userName: String, roomId: String) extends Actor {

  import libs.GameStatusConverters._

  override def receive: Receive = {
    case msg: JsValue =>
      println("GameRequestActor: " + msg.validate[Command].get)
      out ! msg.validate[Command].get
  }

  override def preStart(): Unit = out ! Join(roomId, userName)

  override def postStop(): Unit = {
    out ! Leave(roomId, userName)
    out ! PoisonPill
  }
}

object GameRequestActor {
  def props(out: ActorRef, userName: String, roomId: String): Props = Props(new GameRequestActor(out, userName, roomId))
}


