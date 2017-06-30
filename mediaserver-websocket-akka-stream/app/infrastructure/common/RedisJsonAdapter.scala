package infrastructure.common

import com.redis.RedisClientPool
import play.api.libs.json.{ Format, Json }

/**
 * Redisに格納する値としてJsonを想定するテーブルのアダプタ
 *
 * @tparam T Jsonとして格納される想定の型
 */
trait RedisJsonAdapter[T] {

  /**
   * クライアント取得用プール
   */
  def pool: RedisClientPool

  /**
   * Jsonと値のマッピングのためのフォーマッタ
   */
  implicit def format: Format[T]

  /**
   * キーを指定して挿入処理を行います。
   *
   * @param key   キー
   * @param ttl   キャッシュTTL
   * @param value 値
   */
  protected def insertByKey(key: String, ttl: Long, value: T): Unit = pool.withClient { redis =>
    val json = Json.toJson(value)
    val exists = redis.exists(key)
    if (!exists) {
      redis.setex(key, ttl, json.toString)
    } else {
      throw new IllegalStateException(s"key $key already exists")
    }
  }

  /**
   * キーが存在する場合は何もせずfalseを返す。キーが存在しない場合は値と有効期限をセットしてtrueを返す。
   *
   * @param key    キー。
   * @param expire 有効期間（秒）
   * @param value  値
   * @return 値と有効期限のセットに成功した場合、true。失敗した場合、false。
   */
  protected def insertIfNotExists(key: String, expire: Int, value: T): Boolean = pool.withClient { redis =>
    val json = Json.toJson(value)
    redis.setnx(key, json) match {
      case false => false
      case true => {
        val setExpire = redis.expire(key, expire)
        if (setExpire) true else throw new RuntimeException("set expire failed.")
      }

    }
  }

  /**
   * キーを指定して挿入か更新処理を行います。
   *
   * @param key   キー
   * @param value 値
   */
  protected def upsertByKey(key: String, value: T): Unit = pool.withClient { redis =>
    redis.set(key, Json.toJson(value).toString)
  }

  /**
   * キーを指定して挿入か更新処理（TTL付き）を行います。
   *
   * @param key   キー
   * @param ttl   キャッシュTTL
   * @param value 値
   */
  protected def upsertByKey(key: String, ttl: Long, value: T): Unit = pool.withClient { redis =>
    redis.setex(key, ttl, Json.toJson(value).toString)
  }

  /**
   * キーを指定して読み込み処理を行います。
   *
   * @param key キー
   * @return 値（オプション）
   */
  protected def findByKey(key: String): Option[T] = pool.withClient { redis =>
    val maybeJson = redis.get(key) map Json.parse
    maybeJson.map { json => Json.fromJson(json).get }
  }

  /**
   * キーを指定して値の存在確認を行います
   *
   * @param key キー
   * @return 値が存在するかどうか
   */
  protected def existsByKey(key: String): Boolean = pool.withClient { redis =>
    redis.exists(key)
  }

  /**
   * キーを指定して値を削除します
   *
   * @param key キー
   */
  protected def deleteByKey(key: String): Unit = pool.withClient { redis =>
    redis.del(key)
  }
}

