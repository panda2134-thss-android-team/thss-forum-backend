import {IHttpError} from './IHttpError'

export class BadRequestError extends Error implements IHttpError {
  constructor(public readonly description: string) {
    super()
    this.name = '请求体错误'
    this.message = description
  }

  status() {
    return 400
  }

  toResponse() {
    return {
      name: this.name,
      message: this.message,
      description: this.description
    }
  }
}
