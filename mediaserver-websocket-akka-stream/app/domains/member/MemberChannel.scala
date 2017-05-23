package domains.member

import akka.stream.UniqueKillSwitch
import akka.stream.scaladsl.Flow

case class MemberChannel(roomId: String, bus: Flow[MemberMessage,Members, UniqueKillSwitch])
