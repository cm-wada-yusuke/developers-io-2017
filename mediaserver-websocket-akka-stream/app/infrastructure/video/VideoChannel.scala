package infrastructure.video

import akka.NotUsed
import akka.stream.scaladsl.{ Sink, Source }
import domains.video.VideoMessage

case class VideoChannel(
    sink : Sink[VideoMessage, NotUsed],
    source: Source[VideoMessage, NotUsed]
)
