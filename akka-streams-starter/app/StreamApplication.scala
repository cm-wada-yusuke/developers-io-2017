import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{ Flow, Sink, Source }

object StreamApplication {

  implicit val as = ActorSystem()

  implicit val mat = ActorMaterializer()

  def main(args: Array[String]): Unit = {
    val source = Source(1 to 100)
    val flow = Flow.fromFunction[Int, Int](_ * 3)
    val sink = Sink.foreach(println)

    val graph = source.via(flow).to(sink)
    graph.run()
  }
}