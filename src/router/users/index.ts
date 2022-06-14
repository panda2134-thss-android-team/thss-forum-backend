import Router, {Middleware} from '@koa/router'
import State from '../../middleware/State'
import assert from 'assert'
import AuthMiddleware from '../../middleware/AuthMiddleware'
import configuration from '../../configuration'
import {UserService} from '../../service/UserService'
import {User} from '../../model/User'
import {ResourceNotFoundError} from '../../errors/ResourceNotFoundError'
import {PostService} from '../../service/PostService'
import {getPostQuerySchema} from '../../schema/posts/request'
import {UnprocessableEntityError} from '../../errors/UnprocessableEntityError'
import {SafeParseError, z} from 'zod'

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
  const parseQueryResult = getPostQuerySchema.safeParse(ctx.query)
  if (! parseQueryResult.success) {
    throw new UnprocessableEntityError(ctx.query, (parseQueryResult as SafeParseError<z.infer<typeof getPostQuerySchema>>).error)
  }
  const query = parseQueryResult.data
  const commonGetPostParams = {
    search: query.q, type: query.type,
    start: query.start, end: query.end,
    sortBy: query.sort_by as 'time' | 'like',
    skip: query.skip,
    limit: query.limit
  }

  const user = await User.findById(uid).exec()
  if (!user) {
    throw new ResourceNotFoundError('user', uid)
  }

  const posts = await postService.getPosts(ctx.state.user, {
    target: user,
    ...commonGetPostParams
  })
  ctx.body = posts.map(postService.filterPostModelFields)
}


usersRouter.get('/:id', getUserDetail)
usersRouter.get('/:id/posts', getPostsOfUser)

export default usersRouter
