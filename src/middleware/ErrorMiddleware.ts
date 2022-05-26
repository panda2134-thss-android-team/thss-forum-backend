import {KoaMiddleware} from './MiddlewareType'
import logger from '../util/Logger'
import {isIHttpError} from '../errors/IHttpError'

export default function ErrorMiddleware(): KoaMiddleware {
  return async (ctx, next) => {
    try {
      await next()
      if (ctx.status === 404) { // default status, not found!
        ctx.body = {
          'message': `No such route: "${ctx.method} ${ctx.path}"`
        }
        ctx.status = 404 // ctx.body sets status to 200; set it to 404 again
      } else if (ctx.status >= 400) {
        ctx.body = {
          'message': ctx.message
        }
      }
    } catch (e) {
      logger.error(`error handling http request: ${e.message}`)
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
