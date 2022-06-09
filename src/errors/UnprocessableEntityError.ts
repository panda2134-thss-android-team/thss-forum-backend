import {IHttpError} from './IHttpError'

export class UnprocessableEntityError extends Error implements IHttpError {

  constructor(public readonly object: any, public readonly validationError: {issues: any[]}) {
    super()
    this.name = '无法处理的请求体'
    this.message = `无法解析：${JSON.stringify(object)}`
  }


  status() {
    return 422
  }

  toResponse() {
    return {name: this.name, message: this.message, errors: this.validationError.issues}
  }

}
