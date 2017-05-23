package controllers.member

import javax.inject.Inject

import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.stream.scaladsl.{ Flow, Keep }
import domains.member.{ MemberMessage, Members }
import play.api.libs.json.JsValue
import play.api.libs.streams.ActorFlow
import play.api.mvc.WebSocket
import services.member.MemberService

class MembersController @Inject()(
    implicit val system: ActorSystem,
    implicit val materializer: Materializer,
    memberService: MemberService
) {

  def members(roomId: String) = WebSocket.accept[JsValue, JsValue] { request =>
    val userName = request.queryString("user_name").headOption.getOrElse("anon")
    println(userName)

    val userInput: Flow[JsValue, MemberMessage, _] = ActorFlow.actorRef[JsValue, MemberMessage](out => MemberRequestActor.props(out, roomId, userName))
    val members = memberService.members(roomId, userName)
    val userOutput: Flow[Members, JsValue, _] = ActorFlow.actorRef[Members, JsValue](out => MemberResponseActor.props(out, roomId, userName))

    userInput.viaMat(members.bus)(Keep.right).viaMat(userOutput)(Keep.right)
  }

}
