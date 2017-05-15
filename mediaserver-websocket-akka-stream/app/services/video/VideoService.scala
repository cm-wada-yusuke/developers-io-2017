package services.video

import javax.inject.Inject

import domains.video.{ VideoRoom, VideoRoomRepository }

class VideoService @Inject() (
    repository: VideoRoomRepository
){

  def start(roomId: String, userName: String): VideoRoom = repository.videoRoom(roomId, userName)

}
