import Router from '@koa/router'
import AuthMiddleware from '../../middleware/AuthMiddleware'
import configuration from '../../configuration'
import State from '../../middleware/State'
import * as Manage from './manage'
import commentsRouter from './comments/index'

const authMiddleware = AuthMiddleware(configuration.jwt.secret, configuration.jwt.expireSeconds)

const postsRouter = new Router<State>()
postsRouter.use(authMiddleware)

Manage.addToRouter(postsRouter)
postsRouter.use('/:postId/comments', commentsRouter.routes(), commentsRouter.allowedMethods())

export default postsRouter
