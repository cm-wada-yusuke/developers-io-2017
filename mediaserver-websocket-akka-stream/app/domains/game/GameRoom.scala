package domains.game

import akka.stream.UniqueKillSwitch
import akka.stream.scaladsl.Flow

case class GameRoom(roomId: String, bus: Flow[GameMessage, GameMessage, UniqueKillSwitch])

