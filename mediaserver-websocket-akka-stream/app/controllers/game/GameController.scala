package controllers.game

import javax.inject.Inject

import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.stream.scaladsl.{ Flow, Keep }
import domains.game.GameMessage
import play.api.libs.json.JsValue
import play.api.libs.streams.ActorFlow
import play.api.mvc.WebSocket
import services.game.GameService

class GameController @Inject()(
    implicit val system: ActorSystem,
    implicit val materializer: Materializer,
    gameService: GameService
) {

  def start(roomId: String) = WebSocket.accept[JsValue, JsValue] { request =>

    val userName = request.queryString("user_name").headOption.getOrElse("anon")

    val userInput: Flow[JsValue, GameMessage, _] = ActorFlow.actorRef[JsValue, GameMessage](out => GameRequestActor.props(out, userName, roomId))
    val room = gameService.start(roomId, userName)
    val userOutPut: Flow[ GameMessage, JsValue, _] = ActorFlow.actorRef[GameMessage, JsValue](out => GameResponseActor.props(out, userName))

    userInput.viaMat(room.bus)(Keep.right).viaMat(userOutPut)(Keep.right)
  }
}
