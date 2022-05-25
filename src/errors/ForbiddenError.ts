import {IHttpError} from './IHttpError'
import {UserSchema} from '../model/User'

export class ForbiddenError extends Error implements IHttpError {
  constructor(public readonly user: UserSchema, public readonly operation?: string) {
    super()
    this.name = 'Forbidden'
    this.message = `user ${user.id} has no privilege to "${operation ?? 'do this action'}"`
  }

  status() {
    return 400
  }

  toResponse() {
    return {name: this.name, message: this.message}
  }
}
