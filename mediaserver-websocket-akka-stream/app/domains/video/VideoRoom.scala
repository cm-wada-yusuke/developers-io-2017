package domains.video

import akka.stream.UniqueKillSwitch
import akka.stream.scaladsl.Flow

/**
 * Chat room.
 */
case class VideoRoom(roomId: String, bus: Flow[VideoMessage, VideoMessage, UniqueKillSwitch])
