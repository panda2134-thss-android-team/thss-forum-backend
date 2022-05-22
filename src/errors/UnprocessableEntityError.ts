import {IHttpError} from './IHttpError'
import {ZodError} from 'zod'

export class UnprocessableEntityError extends Error implements IHttpError {
  constructor(public readonly object: any, public readonly validationError: ZodError) {
    super()
    this.name = 'Unprocessable Entity'
    this.message = `${object} cannot be parsed; errors are: ${validationError.issues}`
  }


  status() {
    return 422
  }

  toResponse() {
    return {name: this.name, message: this.message, errors: this.validationError.errors}
  }

}
