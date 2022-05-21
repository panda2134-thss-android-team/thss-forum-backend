import {UserSchema} from '../model/User'
import jwt from 'jsonwebtoken'

/**
 * 管理用户登录凭据的服务
 */
export class TokenService {
  constructor(private secret: string, public readonly expireSeconds: number) {
  }

  /**
   * 签发一个 JWT
   * @param user 待签发 JWT 的用户
   */
  signTokenFor (user: UserSchema): string {
    return jwt.sign({uid: user.id}, this.secret, {
      expiresIn: this.expireSeconds
    })
  }

  /**
   * 检查 JWT 的有效性。
   * @param token 待检查的 token
   * @returns 如果是合法 token，返回用户的 uid；否则，返回 null
   */
  checkToken (token: string): string | null {
      try {
        const decoded = jwt.verify(token, this.secret)
        if (typeof decoded === 'string') {
          return null // 应该是对象
        } else {
          return decoded.uid ?? null
        }
      } catch (e) {
        return null
      }
  }
}
