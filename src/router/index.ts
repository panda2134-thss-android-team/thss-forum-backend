import Router from '@koa/router'
import authRouter from './auth/index'
import profileRouter from './profile/index'

const router = new Router()

router.use('/auth', authRouter.routes(), authRouter.allowedMethods())
router.use('/profile', profileRouter.routes(), profileRouter.allowedMethods())

export default router
