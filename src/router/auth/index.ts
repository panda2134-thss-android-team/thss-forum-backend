import Router from '@koa/router'
import {ValidateBody} from '../../schema'
import {ChangePasswordRequest, LoginRequest, RegisterRequest} from '../../schema/auth'
import {UserService} from '../../service/UserService'
import {TokenService} from '../../service/TokenService'
import configuration from '../../configuration'
import {UnauthorizedError} from '../../errors/UnauthorizedError'
import AuthMiddleware from '../../middleware/AuthMiddleware'
import State from '../../middleware/State'

const {secret, expireSeconds} = configuration.jwt

const userService = new UserService()
const tokenService = new TokenService(secret, expireSeconds)

const authMiddleware = AuthMiddleware(secret, expireSeconds)

const register = ValidateBody(RegisterRequest)(
  async (ctx, next, {email, password}) => {
    const user = await userService.register(email, password)
    ctx.body = { uid: user.id }
    ctx.status = 201
  }
)

const login = ValidateBody(LoginRequest)(
  async (ctx, next, {email, password}) => {
    const user = await userService.login(email, password)
    ctx.body = {
      uid: user.id,
      token: tokenService.signTokenFor(user)
    }
    ctx.status = 200
  }
)

const changePassword = ValidateBody(ChangePasswordRequest)(
  async (ctx, next, {oldPassword, newPassword}) => {
    if (!ctx.state.user) {
      throw new UnauthorizedError(undefined, 'change-password')
    }
    await userService.updatePassword(ctx.state.user, oldPassword, newPassword)
    ctx.body = null
  }
)

const authRouter = new Router<State>()
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/change-password', authMiddleware, changePassword)

export default authRouter
