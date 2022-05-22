import Router, {Middleware} from '@koa/router'
import State from '../../middleware/State'
import assert from 'assert'
import {UserService} from '../../service/UserService'
import {UserSchema} from '../../model/User'
import {ValidateBody} from '../../schema'
import {AddUserToListRequest} from '../../schema/users/request'

const userService = new UserService()

const getBlacklist: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  ctx.body = (ctx.state.user.blockedUsers as UserSchema[]).map(userService.filterUserModelFields)
}

const addToBlacklist: Middleware<State> = ValidateBody(AddUserToListRequest)(
  async (ctx, next, {uid: uidToBlock}) => {
    assert(ctx.state.user)
    await userService.blockUser(ctx.state.user, uidToBlock)
    ctx.body = { uid: uidToBlock }
    ctx.status = 201
  }
)

const removeFromBlacklist: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const uidToRemove = ctx.params.id
  await userService.unblockUser(ctx.state.user, uidToRemove)
  ctx.body = null
}

export function addToRouter(router: Router) {
  router.get('/blacklist/', getBlacklist)
  router.post('/blacklist/', addToBlacklist)
  router.delete('/blacklist/:id', removeFromBlacklist)
}
