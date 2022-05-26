import {IHttpError} from './IHttpError'

export class UnprocessableEntityError extends Error implements IHttpError {

  constructor(public readonly object: any, public readonly validationError: {issues: any[]}) {
    super()
    this.name = 'Unprocessable Entity'
    this.message = `${JSON.stringify(object)} cannot be parsed`
  }


  status() {
    return 422
  }

  toResponse() {
    return {name: this.name, message: this.message, errors: this.validationError.issues}
  }

}
