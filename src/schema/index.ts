import {z, ZodError} from 'zod'
import {KoaMiddlewareWithBody} from '../middleware/MiddlewareType'
import assert from 'assert'
import {UnprocessableEntityError} from '../errors/UnprocessableEntityError'
import {Middleware} from '@koa/router'
import State from '../middleware/State'

export function ValidateBody<Output,Def,Input>(schema: z.ZodType<Output,Def,Input>) {
  return function (middleware: KoaMiddlewareWithBody<Output>): Middleware<State> {
    return async (ctx, next) => {
      assert(ctx.is('json'))

      let bodyTyped: Output
      try {
        bodyTyped = schema.parse(ctx.request.body)
      } catch (e) {
        throw new UnprocessableEntityError(ctx.request.body, e as ZodError)
      }

      await middleware(ctx, next, bodyTyped)
    }

  }
}
