import {IHttpError} from './IHttpError'
import {UserSchema} from '../model/User'

export class UnauthorizedError extends Error implements IHttpError {
  constructor(public readonly user?: UserSchema, public readonly operation?: string) {
    super()
    this.name = 'Unauthorized'
    this.message = `user ${user?.id ?? undefined} has no privilege to "${operation ?? 'do this action'}"`
  }

  status() {
    return 400
  }

  toResponse() {
    return {name: this.name, message: this.message}
  }
}
