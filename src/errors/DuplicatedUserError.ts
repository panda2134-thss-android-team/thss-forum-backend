import {IHttpError} from './IHttpError'

export class DuplicatedUserError extends Error implements IHttpError {
  constructor(email: string) {
    super()
    this.name = '电子邮件已注册'
    this.message = `已有用户使用了邮箱 "${email}"`
  }


  status() {
    return 400
  }

  toResponse() {
    return {name: this.name, message: this.message}
  }
}
