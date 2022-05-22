import {IHttpError} from './IHttpError'

export class ResourceNotFoundError extends Error implements IHttpError {
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
