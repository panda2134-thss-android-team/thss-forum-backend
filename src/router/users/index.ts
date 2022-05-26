import Router, {Middleware} from '@koa/router'
import State from '../../middleware/State'
import assert from 'assert'
import AuthMiddleware from '../../middleware/AuthMiddleware'
import configuration from '../../configuration'
import {UserService} from '../../service/UserService'
import {User} from '../../model/User'
import {ResourceNotFoundError} from '../../errors/ResourceNotFoundError'
import {PostService} from '../../service/PostService'
import {parseStartEndDate} from '../../util/QueryArgParser'

const userService = new UserService()
const postService = new PostService()
const authMiddleware = AuthMiddleware(configuration.jwt.secret, configuration.jwt.expireSeconds)
const usersRouter = new Router<State>()
usersRouter.use(authMiddleware)

const getUserDetail: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const uid = ctx.params.id
  const user = await User.findById(uid).exec()
  if (!user) {
    throw new ResourceNotFoundError('user', uid)
  }
  ctx.body = userService.filterUserModelFields(user)
}

const getPostsOfUser: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const uid = ctx.params.id
  const startEnd = parseStartEndDate(ctx)

  const user = await User.findById(uid).exec()
  if (!user) {
    throw new ResourceNotFoundError('user', uid)
  }

  const posts = await postService.getPosts(ctx.state.user, {
    target: user,
    ...startEnd
  })
  ctx.body = posts.map(postService.filterPostModelFields)
}


usersRouter.get('/:id', getUserDetail)
usersRouter.get('/:id/posts', getPostsOfUser)

export default usersRouter
