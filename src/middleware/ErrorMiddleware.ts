import {KoaMiddleware} from './MiddlewareType'
import logger from '../util/Logger'
import {isIHttpError} from '../errors/IHttpError'

export default function ErrorMiddleware(): KoaMiddleware {
  return async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      logger.error(e)
      if (! isIHttpError(e)) {
        ctx.body = { 'message': 'Internal Server Error' }
        ctx.status = 500
        return
      } else {
        const errResponse = e.toResponse()
        ctx.body = typeof errResponse === 'object' ? errResponse : JSON.stringify(errResponse)
        ctx.status = e.status()
        return
      }
    }
  }
}
