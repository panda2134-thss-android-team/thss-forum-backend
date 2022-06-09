import {IHttpError} from './IHttpError'
import {UserSchema} from '../model/User'

export class ForbiddenError extends Error implements IHttpError {
  constructor(public readonly user: UserSchema, public readonly operation?: string) {
    super()
    this.name = '禁止访问'
    this.message = `用户 ${user.id} 没有权限 "${operation ?? '完成此操作'}"`
  }

  status() {
    return 403
  }

  toResponse() {
    return {name: this.name, message: this.message}
  }
}
