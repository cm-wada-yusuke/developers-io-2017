package controllers

import play.api.mvc.{ Action, Controller }

class Application extends Controller {

  def options(path: String) = Action { request =>
    NoContent.withHeaders(headers: _*)
  }

  private def headers = List(
    "Access-Control-Allow-Origin" -> "*",
    "Access-Control-Allow-Methods" -> "GET, POST, OPTIONS, DELETE, PUT",
    "Access-Control-Max-Age" -> "3600",
    "Access-Control-Allow-Headers" -> "Origin, Content-Type, Accept, Authorization",
    "Access-Control-Allow-Credentials" -> "true"
  )

}
