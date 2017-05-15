package domains.video

trait VideoRoomRepository {

  def videoRoom(roomId: String, userName: String): VideoRoom

}
