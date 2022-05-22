import {IHttpError} from './IHttpError'

export class DuplicatedUserError extends Error implements IHttpError {
  constructor(email: string) {
    super()
    this.name = 'Email registered'
    this.message = `There is already a user with email ${email}`
  }


  status() {
    return 400
  }

  toResponse() {
    return {name: this.name, message: this.message}
  }
}
