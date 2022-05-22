import Router, {Middleware} from '@koa/router'
import {ValidateBody} from '../../schema'
import {AddUserToListRequest} from '../../schema/users/request'
import {UserService} from '../../service/UserService'
import assert from 'assert'
import State from '../../middleware/State'

const userService = new UserService()

const addToFollowing = ValidateBody(AddUserToListRequest)(
  async (ctx, next, body) => {
    assert(ctx.state.user)
    await userService.followUser(ctx.state.user, body.uid)
    ctx.body = { uid: body.uid }
    ctx.status = 201
  }
)

const removeFromFollowing: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const userIdToUnfollow = ctx.params.id
  await userService.unfollowUser(ctx.state.user, userIdToUnfollow)
  ctx.body = null
}

/**
 * 当前用户关注了哪些人
 * @param ctx Koa 上下文
 */
const getFollowedByMe: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const usersIFollow = await userService.getFollowedBy(ctx.state.user)
  ctx.body = usersIFollow.map(userService.filterUserModelFields)
}

const getMyFollowers: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const myFollowers = await userService.getFollowersOf(ctx.state.user)
  ctx.body = myFollowers.map(userService.filterUserModelFields)
}

export function addToRouter(router: Router) {
  router.post('/following/', addToFollowing)
  router.delete('/following/:id', removeFromFollowing)
  router.get('/following/', getFollowedByMe)
  router.get('/followers/', getMyFollowers)
}
