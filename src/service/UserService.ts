import {User, UserSchema} from '../model/User'
import {Following} from '../model/Following'
import PasswordUtil from '../util/PasswordUtil'
import bcrypt from 'bcrypt'
import Mongoose from 'mongoose'
import {ForbiddenError} from '../errors/ForbiddenError'
import {ResourceNotFoundError} from '../errors/ResourceNotFoundError'
import {emailSchema, passwordSchema, userUpdateSchema} from '../schema/users'
import {z} from 'zod'
import {DuplicatedUserError} from '../errors/DuplicatedUserError'

export class UserService {
  /**
   * 获得关注者列表
   * @description 谁关注了我(profile)？
   * @param user 当前用户
   */
  async getFollowersOf (user: UserSchema): Promise<UserSchema[]> {
    const results = await Following.find({followee: user.id}).populate('by').exec()
    return results.map(x => x.by as UserSchema)
  }

  /**
   * 获得被关注者列表
   * @description 我(profile)关注了谁？
   * @param user 当前用户
   */
  async getFollowedBy (user: UserSchema): Promise<UserSchema[]> {
    const results = await Following.find({by: user.id}).populate('followee').exec()
    return results.map(x => x.followee as UserSchema)
  }

  /**
   * 关注某用户
   * @description 如果已关注则正常返回
   * @param user
   * @param userIdToFollow
   */
  async followUser (user: UserSchema, userIdToFollow: string): Promise<void> {
    const userToFollow = await User.findById(userIdToFollow).exec()
    if (!userToFollow) {
      throw new ResourceNotFoundError('user', userIdToFollow)
    }
    const blocked = (user.blockedUsers as any[]).find(x => (x.id.toString() ?? x.toString()) === userIdToFollow)
    if (blocked) {
      throw new ForbiddenError(user, 'follow a blocked user')
    }
    const newFollowingObj = {
      by: user.id,
      followee: userToFollow.id
    }
    if (await Following.exists(newFollowingObj)) {
      return
    }
    const following = new Following(newFollowingObj)
    await following.save()
  }

  /**
   * 移除关注
   * @description 如果未关注则正常返回
   * @param user
   * @param userIdToUnfollow
   */
  async unfollowUser (user: UserSchema, userIdToUnfollow: string): Promise<void> {
    const userToUnfollow = await User.findById(userIdToUnfollow).exec()
    if (!userToUnfollow) {
      throw new ResourceNotFoundError('user', userIdToUnfollow)
    }
    await Following.findOneAndRemove({
      by: user.id,
      followee: userToUnfollow.id
    }).exec()
  }

  /**
   * 注册用户。解析验证 email 和密码符合要求，否则抛出 ZodError
   * @param email 电子邮箱
   * @param password 密码
   */
  async register (email: string, password: string): Promise<UserSchema> {
    emailSchema.parse(email)
    passwordSchema.parse(password)

    const newUser = new User({
      email,
      passwordHash: await PasswordUtil.hash(password)
    })
    try {
      return await User.create(newUser)
    } catch (e) {
      if ((e as any).code === 11000) { // E11000: duplicate key
        throw new DuplicatedUserError(email)
      } else {
        throw e;
      }
    }
  }

  /**
   * 进行用户登录；如果密码正确，返回用户对象
   * 找不到用户时/密码错误时抛出异常
   * @param email 电子邮箱
   * @param password 密码
   */
  async login (email: string, password: string): Promise<UserSchema> {
    const user = await User.findOne({email}).exec()
    if (!user) {
      throw new ResourceNotFoundError('user', email)
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      throw new ForbiddenError(user, 'login')
    }

    return user
  }

  /**
   * 更新用户信息（如头像和昵称）
   * @param user 用户
   * @param update 更新信息对象，可包含 `avatar`, `intro` 和 `nickname` 键
   */
  async updateUserProfile (user: UserSchema, update: z.infer<typeof userUpdateSchema>): Promise<void> {
    userUpdateSchema.parse(update)

    let res: UserSchema | null
    try {
      res = await User.findByIdAndUpdate(user.id, {$set: update}, {new: true})
    } catch (e) {
      if ((e as any).code === 11000) {
        throw new DuplicatedUserError(user.email)
      } else {
        throw e
      }
    }
    if (!res) {
      throw new ResourceNotFoundError('user', user.id)
    }
  }

  /**
   * 更新该用户密码
   * @param user 用户
   * @param oldPassword 老密码
   * @param newPassword 新密码
   */
  async updatePassword (user: UserSchema, oldPassword: string, newPassword: string): Promise<void> {
    const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash)
    if (!passwordMatch) {
      throw new ForbiddenError(user, 'updatePassword')
    }
    passwordSchema.parse(newPassword)
    user.passwordHash = await PasswordUtil.hash(newPassword)
    await user.save()
  }

  /**
   * 屏蔽某用户
   * @description 如果已经屏蔽，则什么都不做
   * @param user 想要屏蔽别人的用户
   * @param userIdToBlock 即将被屏蔽的用户
   */
  async blockUser (user: UserSchema, userIdToBlock: string): Promise<void> {
    const targetUser = await User.findById(userIdToBlock).exec()
    if (!targetUser) {
      throw new ResourceNotFoundError('user', userIdToBlock)
    }

    // @ts-ignore
    await User.findByIdAndUpdate(user.id, {$addToSet: {blockedUsers: new Mongoose.Types.ObjectId(userIdToBlock)}})
  }

  /**
   * 解除屏蔽某用户
   * @description 如果没被屏蔽则什么都不做
   * @param user 想要解除屏蔽别人的用户
   * @param userIdToUnblock 即将被解除屏蔽的用户
   */
  async unblockUser (user: UserSchema, userIdToUnblock: string): Promise<void> {
    const targetUser = await User.findById(userIdToUnblock).exec()
    if (!targetUser) {
      throw new ResourceNotFoundError('user', userIdToUnblock)
    }

    // a bug of mongoose types
    // @ts-ignore
    await User.findByIdAndUpdate(user.id, {$pull: {blockedUsers: new Mongoose.Types.ObjectId(userIdToUnblock)}})
  }

  /**
   * 对用户信息字段进行过滤供前端读取
   * @param user 用户对象
   */
  filterUserModelFields (user: UserSchema) {
    return {
      uid: user.id.toString(),
      nickname: user.nickname,
      email: user.email,
      avatar: user.avatar,
      intro: user.intro
    }
  }
}
