import {IHttpError} from './IHttpError'

export class UnauthorizedError extends Error implements IHttpError {
  constructor(public readonly operation?: string) {
    super()
    this.name = 'Unauthorized'
    this.message = `Only logged in users are allowed to "${operation ?? 'do this action'}"`
  }

  status() {
    return 400
  }

  toResponse() {
    return {name: this.name, message: this.message}
  }
}
