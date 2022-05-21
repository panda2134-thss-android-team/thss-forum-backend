import Router from '@koa/router'

const authRouter = new Router()

authRouter.post('/register', (ctx) => {
  // TODO ctx.request.body; validators
})

export default authRouter
