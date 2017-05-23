package services.member

import javax.inject.Inject

import domains.member.{ MemberChannel, MemberRepository }

class MemberService @Inject()(
    repository: MemberRepository
){

  def members(roomId: String, userName: String): MemberChannel = repository.members(roomId, userName)

}
