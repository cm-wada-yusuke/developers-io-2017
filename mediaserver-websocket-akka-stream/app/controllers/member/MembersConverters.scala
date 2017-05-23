package controllers.member

import domains.member.Members
import play.api.libs.json.{ JsPath, Writes }
import play.api.libs.functional.syntax._

object MembersConverters {

  implicit val MembersWrites: Writes[Members] =
      (JsPath \ "members").write[List[String]].contramap(unlift(Members.unapply))

}
