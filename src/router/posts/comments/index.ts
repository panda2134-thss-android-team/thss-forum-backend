import Router from '@koa/router'
import * as Manage from './manage'
import * as Like from './like'

const commentsRouter = new Router()
Manage.addToRouter(commentsRouter)
Like.addToRouter(commentsRouter)

export default commentsRouter
