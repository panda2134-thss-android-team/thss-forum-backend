import Router from '@koa/router'
import AuthMiddleware from '../../middleware/AuthMiddleware'
import * as Following from './following'
import * as Blacklist from './blacklist'
import * as CurrentUser from './currentUser'
import configuration from '../../configuration'
import State from '../../middleware/State'

const authMiddleware = AuthMiddleware(configuration.jwt.secret, configuration.jwt.expireSeconds)

const profileRouter = new Router<State>()
profileRouter.use(authMiddleware)

Following.addToRouter(profileRouter)
Blacklist.addToRouter(profileRouter)
CurrentUser.addToRouter(profileRouter)

export default profileRouter
