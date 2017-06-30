package domains.game

trait GameRoomRepository {

    def chatRoom(roomId: String, userName: String): GameRoom

}


