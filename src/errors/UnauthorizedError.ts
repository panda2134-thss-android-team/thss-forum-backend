import {IHttpError} from './IHttpError'

export class UnauthorizedError extends Error implements IHttpError {
  constructor(public readonly operation?: string, public readonly reason?: string) {
    super()
    this.name = '未登录'
    this.message = `只有登录用户允许${operation ?? '完成此操作'}`
    if (reason) {
      this.message += `(${reason})`
    }
  }

  status() {
    return 401
  }

  toResponse() {
    return {name: this.name, message: this.message}
  }
}
