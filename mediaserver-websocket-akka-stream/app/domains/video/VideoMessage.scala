package domains.video

import akka.util.ByteString

sealed trait VideoMessage

case class Video(
    sender: String,
    data: Array[Byte]
) extends  VideoMessage

case class Leave(sender: String) extends VideoMessage


