package controllers.video

import javax.inject.Inject

import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.stream.scaladsl.{ Flow, Keep }
import akka.util.ByteString
import domains.video.VideoMessage
import play.api.libs.streams.ActorFlow
import play.api.mvc.WebSocket
import services.video.VideoService


class VideoController @Inject()(
    implicit val system: ActorSystem,
    implicit val materializer: Materializer,
    streamVideoService: VideoService
) {

  def start(roomId: String) = WebSocket.accept[ByteString, ByteString] { request =>


    // TODO: ユーザ名がない場合はユーザ一覧を返すAPIとなるのでここは後で分岐する必要がある
    val userName = request.queryString("user_name").headOption.getOrElse("anon")

    val userInput: Flow[ByteString, VideoMessage, _] = ActorFlow.actorRef[ByteString, VideoMessage](out => VideoRequestActor.props(out, userName))
    val room = streamVideoService.start(roomId, userName)
    val userOutPut: Flow[VideoMessage, ByteString, _] = ActorFlow.actorRef[VideoMessage, ByteString](out => VideoResponseActor.props(out,userName))

    userInput.viaMat(room.bus)(Keep.right).viaMat(userOutPut)(Keep.right)
  }
}

