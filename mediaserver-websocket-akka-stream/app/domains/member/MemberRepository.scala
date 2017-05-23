package domains.member

trait MemberRepository {

  def members(roomId: String, userName: String): MemberChannel

}
