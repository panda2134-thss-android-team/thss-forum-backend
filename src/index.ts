import logger from './util/Logger'

require('dotenv').config()

import Koa from 'koa'
import State from './middleware/State'
import router from './router'
import ErrorMiddleware from './middleware/ErrorMiddleware'
import BodyParser from 'koa-bodyparser'
import {connectToDatabase} from './model'

const app = new Koa<State, {}>()

app.use(ErrorMiddleware())
app.use(BodyParser())
app.use(router.routes()).use(router.allowedMethods())

async function main() {
  await connectToDatabase(process.env.MONGODB_URL)
  const port = 3000
  app.listen(port)
  logger.info(`Server is now listening on localhost:${port}`)
}

main()
