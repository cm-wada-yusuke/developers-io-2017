package services.game

import javax.inject.Inject

import domains.game.{ GameRoom, GameRoomRepository }

class GameService @Inject()(
    repository: GameRoomRepository
) {

  def start(roomId: String, userName: String): GameRoom = repository.chatRoom(roomId, userName)

}
