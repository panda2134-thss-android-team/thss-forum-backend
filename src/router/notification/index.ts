import Router from '@koa/router'
import State from '../../middleware/State'
import {BadRequestError} from '../../errors/BadRequestError'
import WebSocket from 'ws'
import NotificationServiceInstance from '../../service/NotificationService'
import {TokenService} from '../../service/TokenService'
import configuration from '../../configuration'
import {wsLoginRequest} from '../../schema/websocket'
import {User, UserSchema} from '../../model/User'
import {ResourceNotFoundError} from '../../errors/ResourceNotFoundError'
import {z} from 'zod'
import {UnauthorizedError} from '../../errors/UnauthorizedError'

const tokenService = new TokenService(configuration.jwt.secret, configuration.jwt.expireSeconds)
const notificationRouter = new Router<State>()
notificationRouter.get('/subscribe', async (ctx) => {
  if (!ctx.ws) {
    throw new BadRequestError('this is a websocket endpoint')
  }
  const ws: WebSocket = await ctx.ws()
  const loginTimeout = setTimeout(() => {
    ws.send(JSON.stringify({type: 'error'}))
    ws.close(4500, 'authentication timeout')
  }, configuration.ws.loginTimeout)
  ws.once('message', async (data) => {
    clearTimeout(loginTimeout)

    let user: UserSchema
    let loginRequest: z.infer<typeof wsLoginRequest>
    try {
      loginRequest = wsLoginRequest.parse(JSON.parse(data.toString()))
      const userId = tokenService.checkToken(loginRequest.token)
      if (!userId) {
        throw new UnauthorizedError('subscribe', 'token is invalid')
      }
      user = await User.findById(userId).exec()
      if (!user) {
        throw new ResourceNotFoundError('user', userId)
      }
    } catch (e) {
      ws.send(JSON.stringify({type: 'error', message: e}))
      // close immediately.
      ws.close(4010, `authentication failed`)
      return
    }
    const success = NotificationServiceInstance.registerToService(user, loginRequest.unique_id, ws)
    if (!success) {
      ws.send(JSON.stringify({type: 'error'}))
      ws.close(4030, 'duplicate device registration')
    } else {
      ws.send(JSON.stringify({type: 'success'}))
    }
  })
})

export default notificationRouter
