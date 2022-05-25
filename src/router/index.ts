import Router from '@koa/router'
import authRouter from './auth/index'
import profileRouter from './profile/index'
import postsRouter from './posts/index'

const router = new Router()

router.use('/auth', authRouter.routes(), authRouter.allowedMethods())
router.use('/profile', profileRouter.routes(), profileRouter.allowedMethods())
router.use('/posts', postsRouter.routes(), postsRouter.allowedMethods())

export default router
