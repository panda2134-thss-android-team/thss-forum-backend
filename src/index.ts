import Koa from 'koa';
import State from './middleware/State'
import router from './router'
import logger from './util/Logger'
import ErrorMiddleware from './middleware/ErrorMiddleware'
import BodyParser from 'koa-bodyparser'

require('dotenv').config()
const app = new Koa<State, {}>()

if (! process.env.JWT_SECRET) {
  logger.error('jwt secret is empty')
  process.exit(1)
}

app.use(BodyParser())
app.use(router.routes()).use(router.allowedMethods())
app.use(ErrorMiddleware())
