package libs

import domains.game._
import play.api.libs.functional.syntax._
import play.api.libs.json._


object GameStatusConverters {

  implicit val JoinFormat: Format[Join] = (
      (JsPath \ "roomId").format[String] and
          (JsPath \ "userName").format[String]
      ) (Join.apply, unlift(Join.unapply))

  implicit val LeaveFormat: Format[Leave] = (
      (JsPath \ "roomId").format[String] and
          (JsPath \ "userName").format[String]
      ) (Leave.apply, unlift(Leave.unapply))

  implicit val CommandFormat: Format[Command] = (
      (JsPath \ "roomId").format[String] and
          (JsPath \ "userName").format[String] and
          (JsPath \ "command").format[Int]
      ) (Command.apply, unlift(Command.unapply))

  private implicit object BoardFormat extends Format[Board] {

    override def reads(json: JsValue): JsResult[Board] =
      json.validate[Map[String, Int]].map(Board.apply)

    override def writes(o: Board): JsValue = Json.toJson(o.board)
  }

  implicit val GameStatusFormat: Format[GameStatus] = (
      (JsPath \ "turn").format[Int] and
          (JsPath \ "state").format[Int] and
          (JsPath \ "players").format[Map[String, Int]] and
          (JsPath \ "board").format[Board]
      ) (GameStatus.apply, unlift(GameStatus.unapply))

}
