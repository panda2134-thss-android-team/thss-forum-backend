export interface IHttpError {
  status(): number

  toResponse(): Record<string, any> & { name: string; message: string }
}

export function isIHttpError(err: any): err is IHttpError {
  return typeof err === 'object' &&
    (typeof err.status === 'function' && typeof err.toResponse === 'function')
}
