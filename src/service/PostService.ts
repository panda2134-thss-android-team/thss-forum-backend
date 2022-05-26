import dayjs from 'dayjs'
import {UnprocessableEntityError} from '../errors/UnprocessableEntityError'
import {UserSchema} from '../model/User'
import {ImageTextContent, MediaContent, Post, PostSchema, PostTypes} from '../model/Post'
import assert from 'assert'
import {Following} from '../model/Following'
import {LocationSchema} from '../model/Location'
import {ResourceNotFoundError} from '../errors/ResourceNotFoundError'
import {ForbiddenError} from '../errors/ForbiddenError'
import {BadRequestError} from '../errors/BadRequestError'

/**
 * 动态筛选器
 * @property start 选取时间段开始时间，默认为结束时间减去24小时
 * @property end 选取时间段结束时间，默认为现在
 * @property target 取值为用户对象 UserSchema 时，表示查看此对象代表的用户的动态（除黑名单）
 *                  取值为 'following' 时，表示查看当前用户关注者动态（除黑名单）
 *                  取值为 undefined 时，表示查看所有动态（除黑名单）
 */
interface PostFilter {
  start?: Date
  end?: Date
  target?: UserSchema | 'following'
}

export class PostService {
  /**
   * 过滤动态模型内容供前端读取
   * @param post 动态
   */
  filterPostModelFields (post: PostSchema) {
    return {
      id: post.id.toString(),
      by: post.by,
      type: post.type,
      location: post.location,
      imageTextContent: post.imageTextContent,
      mediaContent: post.mediaContent
    }
  }
  /**
   * 获取动态消息
   * @param currentUser 当前用户的对象
   * @param filter 筛选器。具体见相应类型文档
   */
  async getPosts (currentUser: UserSchema, filter: PostFilter = {}): Promise<PostSchema[]> {
    // 终止时间默认现在
    if (filter.end == null) { filter.end = new Date() }
    // 起始时间默认等于终止-24h
    if (filter.start == null) {
      filter.start = dayjs(filter.end).subtract(24, 'hours').toDate()
    }
    if (! dayjs(filter.start).isBefore(filter.end)) {
      throw new UnprocessableEntityError(filter, {issues: ["start should not be after end"]})
    }
    assert(currentUser.populated('blockedUsers'))
    if (filter.target === 'following' || filter.target == null) {
      const basicFilter = {
        createdAt: {
          $gt: filter.start,
          $lt: filter.end
        },
        by: {
          $nin: currentUser.blockedUsers as UserSchema[]
        }
      }
      if (filter.target == null) {
        return await Post.find(basicFilter).sort({createdAt: 'desc'}).exec()
      } else {
        return await Following.aggregate()
          .match({by: currentUser.id})
          .lookup({
            from: 'post',
            localField: 'followee',
            foreignField: 'by',
            as: 'post'
          })
          .unwind('post')
          .replaceRoot('post')
          .match(basicFilter)
          .sort({createdAt: 'desc'})
          .exec()
      }
    } else {
      const targetUser = filter.target
      if ((currentUser.blockedUsers as UserSchema[]).find(x => x.id.toString() === targetUser.id.toString())) {
        return []
      }
      return await Post.find({
        createdAt: {
          $gt: filter.start,
          $lt: filter.end
        },
        by: targetUser.id
      }).exec()
    }
  }

  /**
   * 发图文动态
   * @param currentUser 当前用户
   * @param content 动态内容
   * @param location 可选的地理位置
   */
  async makeImageTextPost (currentUser: UserSchema, content: ImageTextContent, location?: LocationSchema): Promise<PostSchema> {
    const post = new Post({
      by: currentUser,
      type: PostTypes.NORMAL,
      imageTextContent: content,
      location
    })
    return await post.save()
  }

  /**
   * 发音视频动态
   * @param currentUser 当前用户
   * @param type 音频或视频，见 `PostTypes`
   * @param mediaContent 音视频内容的数组
   * @param location 可选的地理位置
   */
  async makeMediaPost (currentUser: UserSchema, type: PostTypes.AUDIO | PostTypes.VIDEO, mediaContent: MediaContent, location?: LocationSchema): Promise<PostSchema> {
    const post = new Post({
      by: currentUser,
      type,
      mediaContent,
      location
    })
    return await post.save()
  }

  /**
   * 修改动态内容
   * @param currentUser 当前用户
   * @param postId 动态id
   * @param postType 动态类型，见 `PostTypes`
   * @param content 修改内容，要和动态类型一致；对图文动态，类型为 ImageTextContent; 对音视频则为 string[]
   */
  async editPost (currentUser: UserSchema, postId: string, postType: PostTypes, content: ImageTextContent | MediaContent): Promise<PostSchema> {
    const post = await Post.findById(postId).exec()
    if (! post) {
      throw new ResourceNotFoundError('post', postId)
    }
    if (currentUser.id.toString() !== post.by.toString()) {
      throw new ForbiddenError(currentUser, `edit post ${postId}`)
    }
    if (postType !== post.type) {
      throw new BadRequestError(`post ${postId} is of type ${post.type}, but ${postType} given`)
    }

    if (postType === PostTypes.NORMAL) {
      post.imageTextContent = content as ImageTextContent
    } else {
      post.mediaContent = content as MediaContent
    }
    return await post.save()
  }

  /**
   * 删除动态
   * @param currentUser 当前用户
   * @param postId 动态 id
   */
  async removePost (currentUser: UserSchema, postId: string): Promise<void> {
    const post = await Post.findById(postId).exec()
    if (! post) {
      throw new ResourceNotFoundError('post', postId)
    }
    if (currentUser.id.toString() !== post.by.toString()) {
      throw new ForbiddenError(currentUser, `remove post ${postId}`)
    }
    await post.delete()
  }

  /**
   * 点赞动态
   * @param user
   * @param postId
   */
  async likePost (user: UserSchema, postId: string): Promise<number> {
    const post = await Post.findById(postId).exec()
    if (! post) {
      throw new ResourceNotFoundError('post', postId)
    }
    // @ts-ignore
    const res: PostSchema = await Post.findByIdAndUpdate(postId, {$addToSet: { likedBy: user.id }}, {new: true}).exec()
    return res.likedBy.length
  }

  /**
   * 取消点赞动态
   * @param user
   * @param postId
   */
  async cancelLikePost (user: UserSchema, postId: string): Promise<number> {
    const post = await Post.findById(postId).exec()
    if (! post) {
      throw new ResourceNotFoundError('post', postId)
    }
    // @ts-ignore
    const res: PostSchema = await Post.findByIdAndUpdate(postId, {$pull: { likedBy: user.id }}, {new: true}).exec()
    return res.likedBy.length
  }
}

const postService = new PostService()
export default postService
