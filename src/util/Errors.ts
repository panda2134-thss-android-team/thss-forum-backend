import {UserSchema} from '../model/User'

export interface IHTTPError {
  status(): number
  toResponse(): Record<string, any> & {name: string; message: string}
}

export function isIHttpError(err: any): err is IHTTPError {
  return typeof err === 'object' &&
    (typeof err.status === 'function' && typeof err.toResponse === 'function')
}

export class UnauthorizedError extends Error implements IHTTPError {
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

export class ResourceNotFoundError extends Error implements IHTTPError {
  constructor(public readonly resourceType: string, public readonly resourceName: string) {
    super()
    this.name = 'Resource Not Found'
    this.message = `${resourceName} is not found in ${resourceType}`
  }

  status() {
    return 404
  }

  toResponse() {
    return {name: this.name, message: this.message, resourceType: this.resourceType, resourceName: this.resourceName}
  }
}

export class BadRequestError extends Error implements IHTTPError {
  constructor(public readonly description: string) {
    super()
    this.name = 'Bad Request'
    this.message = description
  }

  status() {
    return 0
  }

  toResponse() {
    return {
      name: this.name,
      message: this.message,
      description: this.description
    }
  }
}
