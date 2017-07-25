package controllers.game

import javax.inject.Inject

import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.stream.scaladsl.{ Flow, Keep }
import domains.game.{ Command, GameMessage }
import play.api.libs.json.{ JsValue, Json }
import play.api.libs.streams.ActorFlow
import play.api.mvc.{ Action, BodyParsers, Controller, WebSocket }
import services.game.GameService

class GameController @Inject()(
    implicit val system: ActorSystem,
    implicit val materializer: Materializer,
    gameService: GameService
) extends Controller {

  import libs.GameStatusConverters._

  def start(roomId: String) = WebSocket.accept[JsValue, JsValue] { request =>

    val userName = request.queryString("user_name").headOption.getOrElse("anon")

    val userInput: Flow[JsValue, GameMessage, _] = ActorFlow.actorRef[JsValue, GameMessage](out => GameRequestActor.props(out, userName, roomId))
    val room = gameService.start(roomId, userName)
    val userOutPut: Flow[GameMessage, JsValue, _] = ActorFlow.actorRef[GameMessage, JsValue](out => GameResponseActor.props(out, userName))

    userInput.viaMat(room.bus)(Keep.right).viaMat(userOutPut)(Keep.right)
  }


  def command(roomId: String) = Action(BodyParsers.parse.json) { req =>

    val command1 = req.body.validate[Command].get
    println(s"get command: $command1")
    gameService.command(command1)
    Accepted("{}").withHeaders(
      "Access-Control-Allow-Origin" -> "*",
      "Access-Control-Allow-Method" -> "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers" -> "Accept, Origin, Content-type, X-Json, X-Prototype-Version, X-Requested-With"
    )
  }


  def get(roomId: String) = Action { req =>

    val game = gameService.load(roomId)
    Ok(Json.toJson(game)).withHeaders(
      "Access-Control-Allow-Origin" -> "*",
      "Access-Control-Allow-Method" -> "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers" -> "Accept, Origin, Content-type, X-Json, X-Prototype-Version, X-Requested-With"
    )
  }

  def reset(roomId: String) = Action { req =>

    val game = gameService.reset(roomId)
    println(s"get command: reset room: $roomId")
    NoContent.withHeaders(
      "Access-Control-Allow-Origin" -> "*",
      "Access-Control-Allow-Method" -> "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers" -> "Accept, Origin, Content-type, X-Json, X-Prototype-Version, X-Requested-With"
    )
  }


}
