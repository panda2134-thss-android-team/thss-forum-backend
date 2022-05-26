import Router from '@koa/router'
import authRouter from './auth'
import usersRouter from './users'
import profileRouter from './profile'
import postsRouter from './posts'

const router = new Router()

router.use('/auth', authRouter.routes(), authRouter.allowedMethods())
router.use('/users', usersRouter.routes(), usersRouter.allowedMethods())
router.use('/profile', profileRouter.routes(), profileRouter.allowedMethods())
router.use('/posts', postsRouter.routes(), postsRouter.allowedMethods())

export default router
