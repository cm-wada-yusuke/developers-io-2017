package domains.member

sealed trait MemberMessage

case class Join(name: String) extends MemberMessage

case class Leave(name: String) extends MemberMessage