import Router from '@koa/router'
import { assert } from 'console'
import { Middleware } from 'koa'
import State from '../../../middleware/State'
import * as Manage from './manage'
import * as Like from './like'

const commentsRouter = new Router()
Manage.addToRouter(commentsRouter)
Like.addToRouter(commentsRouter)

export default commentsRouter