import dotenv from 'dotenv'
import logger from './util/Logger'
import Koa from 'koa'
import State from './middleware/State'
import router from './router'
import ErrorMiddleware from './middleware/ErrorMiddleware'
import BodyParser from 'koa-bodyparser'
import {connectToDatabase} from './model'
import {BadRequestError} from './errors/BadRequestError'
import configuration from './configuration'
import './util/RedisCache' // connect to redis
import KoaEasyWS from 'koa-easy-ws'

dotenv.config()
const app = new Koa<State, {}>()

app.use(KoaEasyWS())
app.use(ErrorMiddleware())
app.use(BodyParser({
  onerror(err) {
    throw new BadRequestError(err.message)
  }
}))
app.use(router.routes()).use(router.allowedMethods())

async function main() {
  await connectToDatabase(configuration.mongo.url)
  const port = 3000
  app.listen(port)
  logger.info(`Server is now listening on http://localhost:${port}`)
}

main()
