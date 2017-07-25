package controllers.game

import akka.actor.{ Actor, ActorRef, PoisonPill, Props }
import domains.game.{ GameStatus, Leave }
import play.api.libs.json.Json

class GameResponseActor(out: ActorRef, me: String) extends Actor {

  import libs.GameStatusConverters._

  override def receive: Receive = {
    case s: GameStatus =>
      out ! Json.toJson(s)
    case Leave(roomId, userName) =>
      if (userName == me) {
        println(s"$userName will Poison Pill...")
        out ! PoisonPill
        self ! PoisonPill
      }
  }
}

object GameResponseActor {
  def props(out: ActorRef, userName: String): Props = Props(new GameResponseActor(out, userName))
}