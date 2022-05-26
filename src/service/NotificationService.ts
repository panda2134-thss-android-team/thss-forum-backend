import WebSocket from 'ws'
import {UserSchema} from '../model/User'
import {randomUUID} from 'crypto'

interface WSMapping {
  websocket: WebSocket
  deviceId: string
}

interface BroadcastMeta {
  postId?: string | undefined;
  commentId?: string | undefined;
  uid?: string | undefined
}

interface BroadcastObject {
  type: string
  notification_id: string
  post_id?: string
  comment_id?: string
  uid?: string
}

export class Broadcast {
  notificationId: string
  constructor(public readonly type: string, public readonly targetUid: string[],
              public readonly meta: BroadcastMeta) {
    this.notificationId = randomUUID()
  }

  toObject (): BroadcastObject {
    return {
      type: this.type,
      notification_id: this.notificationId,
      post_id: this.meta.postId,
      comment_id: this.meta.commentId,
      uid: this.meta.uid
    }
  }
}

class NotificationService {
  wsMapping: Record<string, WSMapping[]>

  constructor() {
    this.wsMapping = {}
  }

  /**
   * 向服务注册某个用户的 websocket 连接。此后，通知通过这个连接发送
   * @param user 用户
   * @param deviceId 登陆用的设备id
   * @param websocket 该用户的 websocket
   * @returns 成功时返回 true；返回 false 表示该设备 id 已经登陆
   */
  registerToService (user: UserSchema, deviceId: string, websocket: WebSocket): boolean {
    if (! this.wsMapping[user.id]) {
      this.wsMapping[user.id] = []
    }
    if (this.wsMapping[user.id].find(x => x.deviceId === deviceId)) {
      return false
    }
    this.wsMapping[user.id].push({deviceId, websocket})
    websocket.on('close', () => {
      const currentIndex = this.wsMapping[user.id].findIndex((x) => deviceId === x.deviceId)
      this.wsMapping[user.id].splice(currentIndex, 1)
      if (this.wsMapping[user.id].length === 0) {
        delete this.wsMapping[user.id]
      }
    })
    return true
  }

  async doBroadcast (b: Broadcast) {
    for (const uid of b.targetUid) {
      if (!this.wsMapping[uid]) continue
      this.wsMapping[uid].forEach(({websocket}) => {
        websocket.send(JSON.stringify(b.toObject()))
      })
    }
  }
}

export const NotificationServiceInstance = new NotificationService() // singleton
export default NotificationServiceInstance
