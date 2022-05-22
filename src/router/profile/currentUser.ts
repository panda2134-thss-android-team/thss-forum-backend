import Router, {Middleware} from '@koa/router'
import assert from 'assert'
import State from '../../middleware/State'
import {UserService} from '../../service/UserService'
import {ValidateBody} from '../../schema'
import {userUpdateSchema} from '../../schema/users'
import {User} from '../../model/User'

const userService = new UserService()
const getCurrentUserProfile: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  ctx.body = userService.filterUserModelFields(ctx.state.user)
}
const updateCurrentUserProfile: Middleware<State> = ValidateBody(userUpdateSchema)(
  async (ctx, next, body) => {
    assert(ctx.state.user)
    await userService.updateUserProfile(ctx.state.user, body)

    const newUser = await User.findById(ctx.state.user.id).exec()
    assert(newUser != null)
    ctx.body = userService.filterUserModelFields(newUser)
  }
)

export function addToRouter(router: Router) {
  router.get('/', getCurrentUserProfile)
  router.put('/', updateCurrentUserProfile)
}
