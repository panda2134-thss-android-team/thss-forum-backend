import {IHttpError} from './IHttpError'

export class ResourceNotFoundError extends Error implements IHttpError {
  constructor(public readonly resourceType: string, public readonly resourceName: string) {
    super()
    this.name = '资源未找到'
    this.message = `${resourceType} 中无法找到 ${resourceName}`
  }

  status() {
    return 404
  }

  toResponse() {
    return {name: this.name, message: this.message, resourceType: this.resourceType, resourceName: this.resourceName}
  }
}
