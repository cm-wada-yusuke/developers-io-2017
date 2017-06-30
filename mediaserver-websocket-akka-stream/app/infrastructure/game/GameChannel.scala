package infrastructure.game

import akka.NotUsed
import akka.stream.scaladsl.{ Sink, Source }
import domains.game.GameMessage

case class GameChannel (
    sink : Sink[GameMessage, NotUsed],
    source: Source[GameMessage, NotUsed]
)
