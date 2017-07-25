package domains.game

trait GameRoomRepository {

    def gamrRoom(roomId: String, userName: String): GameRoom

}


