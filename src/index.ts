import Koa from 'koa'
import State from './middleware/State'
import router from './router'
import ErrorMiddleware from './middleware/ErrorMiddleware'
import BodyParser from 'koa-bodyparser'
import mongoose from 'mongoose'

require('dotenv').config()
const app = new Koa<State, {}>()

app.use(BodyParser())
app.use(router.routes()).use(router.allowedMethods())
app.use(ErrorMiddleware())

async function main() {
  await mongoose.connect(process.env.MONGODB_URL ?? 'mongodb://localhost:27017/thss-forum')
  app.listen(8080)
}

main()
