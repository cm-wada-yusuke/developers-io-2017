package domains.video

sealed trait VideoMessage

case class Video(
    sender: String,
    data: Array[Byte]
) extends  VideoMessage

case class Join(sender: String) extends VideoMessage

case class Leave(sender: String) extends VideoMessage


