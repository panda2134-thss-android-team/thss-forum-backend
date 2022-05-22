import {TokenService} from '../service/TokenService'
import {User} from '../model/User'
import {KoaMiddleware} from './MiddlewareType'
import {UnauthorizedError} from '../errors/UnauthorizedError'
import {BadRequestError} from '../errors/BadRequestError'

export default function AuthMiddleware(secret: string, expireSeconds: number): KoaMiddleware {
  const tokenService = new TokenService(secret, expireSeconds)

  return async (ctx, next) => {
    const [type, token] = ctx.get('Authorization').split('', 2)
    if (type !== 'Bearer' && type !== 'Token') {
      throw new BadRequestError('invalid Authorization type; only Bearer and Token is accepted')
    }

    const uid = tokenService.checkToken(token)
    if (! uid) {
      throw new UnauthorizedError()
    }
    const user = await User.findById(uid).populate('blockedUsers').exec()
    if (! user) {
      throw new UnauthorizedError()
    }

    ctx.state.user = user

    await next()
  }
}
