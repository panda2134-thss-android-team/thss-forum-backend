import {UserSchema} from '../model/User'
import {Comment, CommentSchema} from '../model/Comment'
import {Post} from '../model/Post'
import {ResourceNotFoundError} from '../errors/ResourceNotFoundError'
import {ForbiddenError} from '../errors/ForbiddenError'
import {ObjectId} from 'mongodb'
import NotificationServiceInstance, {Broadcast} from './NotificationService'

interface CommentFilter {
  skip?: number
  limit?: number
  sortBy?: 'asc' | 'desc'
}

export class CommentService {
  /**
   * 获得某个动态的所有评论
   * @param currentUser
   * @param postId
   * @param filter
   */
  async getCommentsOfPost (currentUser: UserSchema, postId: string, filter: CommentFilter): Promise<CommentSchema[]> {
    if (!(await Post.findById(postId).exec())) {
      throw new ResourceNotFoundError('post', postId)
    }
    const f: CommentFilter = Object.assign({sortBy: 'desc'}, filter)
    // assert(currentUser.populated('blockedUsers'))
    let q = Post.aggregate().match({_id: new ObjectId(postId)})
      .unwind('comments')
      .lookup({
        from: 'comments',
        localField: 'comments',
        foreignField: '_id',
        as: 'commentObject'
      })
      .unwind('commentObject')
      .replaceRoot('commentObject')
      .match({by: {$nin: (currentUser.blockedUsers as UserSchema[]).map(x => x._id)}})
      .sort({createdAt: f.sortBy === 'asc' ? 1 : -1})
    if (f.skip) {
      q = q.skip(f.skip)
    }
    if (f.limit) {
      q = q.limit(f.limit)
    }
    return await q.exec()
  }

  /**
   * 发表评论
   * @param user 用户
   * @param postId 评论的动态 id
   * @param content 评论内容
   * @param parentCommentId 楼中楼的回复原评论 id
   */
  async addComment (user: UserSchema, postId: string, content: string, parentCommentId?: string): Promise<CommentSchema> {
    const post = await Post.findById(postId).populate('by').exec()
    if (!post) {
      throw new ResourceNotFoundError('post', postId)
    }
    let parentComment: CommentSchema | undefined
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId).populate('by').exec()
      if (!parentComment) {
        throw new ResourceNotFoundError('comment', parentCommentId)
      }
    }

    const comment = new Comment({
      by: user.id,
      parentCommentId,
      content
    })
    await comment.save()
    post.comments.push(comment.id)
    await post.save()

    process.nextTick(async () => {
      const meta = {
        postId,
        commentId: comment.id,
        uid: user.id
      }
      await NotificationServiceInstance.doBroadcast(new Broadcast('post_commented',
        [(post.by as UserSchema).id], meta))
      if (parentCommentId) {
        await NotificationServiceInstance.doBroadcast(new Broadcast('comment_replied',
          [(parentComment.by as UserSchema).id], meta))
      }
    })

    return comment
  }

  async findComment (user: UserSchema, postId: string, commentId: string): Promise<CommentSchema> {
    const post = await Post.findById(postId).populate('comments').exec()
    if (!post) {
      throw new ResourceNotFoundError('post', postId)
    }
    const comment = await Comment.findById(commentId)
      .populate('by').populate('parentCommentId').exec()
    if (!comment) {
      throw new ResourceNotFoundError('comment', commentId)
    }
    const commentIsInPost = (post.comments as CommentSchema[]).find(x => x.id === comment.id)
    if (!commentIsInPost) {
      throw new ResourceNotFoundError('comment_in_post', commentId)
    }
    // assert(user.populated('blockedUsers'))
    if ((user.blockedUsers as UserSchema[]).find(x => x.id === (comment.by as UserSchema).id)) {
      // blocked, return 403
      throw new ForbiddenError(user, 'view the comment by a blocked user')
    }
    return comment
  }

  async removeComment (user: UserSchema, postId: string, commentId: string): Promise<void> {
    const post = await Post.findById(postId).exec()
    if (!post) {
      throw new ResourceNotFoundError('post', postId)
    }
    const comment = await this.findComment(user, postId, commentId)

    const commentBy = (comment.by as UserSchema).id
    if (commentBy !== user.id && post.by !== user.id) {
      throw new ForbiddenError(user, 'remove this comment')
    }
    //@ts-ignore
    await Post.findByIdAndUpdate(postId, {$pull: {comments: new ObjectId(comment.id)}})
    await comment.remove()
  }

  async likeComment (user: UserSchema, postId: string, commentId: string): Promise<number> {
    await this.findComment(user, postId, commentId) // ensure existence
    const post = await Post.findById(postId).populate('by').exec()
    // @ts-ignore
    const comment: CommentSchema = await Comment.findByIdAndUpdate(commentId, {$addToSet: {likedBy: user.id}}, {new: true}).exec()
    process.nextTick(async () => {
      await NotificationServiceInstance.doBroadcast(new Broadcast(
        'comment_liked', [(post.by as UserSchema).id],
        {
          postId,
          commentId,
          uid: user.id
        }
      ))
    })
    return comment.likedBy.length
  }

  async cancelLikeComment (user: UserSchema, postId: string, commentId: string): Promise<number> {
    await this.findComment(user, postId, commentId)
    // @ts-ignore
    const comment: CommentSchema = await Comment.findByIdAndUpdate(commentId, {$pull: {likedBy: user.id}}, {new: true}).exec()
    return comment.likedBy.length
  }

  filterCommentModelFields (comment: CommentSchema) {
    return {
      by: (comment.by as any)._id ?? comment.by,
      id: comment._id,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      createdAt: comment.createdAt
    }
  }
}
