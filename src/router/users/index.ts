import Router, {Middleware} from '@koa/router'
import State from '../../middleware/State'
import assert from 'assert'
import AuthMiddleware from '../../middleware/AuthMiddleware'
import configuration from '../../configuration'
import {UserService} from '../../service/UserService'
import {User} from '../../model/User'
import {ResourceNotFoundError} from '../../errors/ResourceNotFoundError'

const userService = new UserService()
const authMiddleware = AuthMiddleware(configuration.jwt.secret, configuration.jwt.expireSeconds)
const authRouter = new Router<State>()
authRouter.use(authMiddleware)

const getUserDetail: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const uid = ctx.params.id
  const user = await User.findById(uid).exec()
  if (!user) {
    throw new ResourceNotFoundError('user', uid)
  }
  return userService.filterUserModelFields(user)
}

// TODO: all posts of user


authRouter.get('/:id', getUserDetail)
