import {UserSchema} from '../model/User'
import {Comment, CommentSchema} from '../model/Comment'
import {Post} from '../model/Post'
import {ResourceNotFoundError} from '../errors/ResourceNotFoundError'
import {ForbiddenError} from '../errors/ForbiddenError'

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
    let q = Post.aggregate().match({_id: postId})
      .unwind('comments')
      .lookup({
        from: 'comment',
        localField: 'comments',
        foreignField: '_id',
        as: 'commentObject'
      })
      .replaceRoot('commentObject')
      .sort({createdAt: f.sortBy})
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
    const post = await Post.findById(postId).exec()
    if (!post) {
      throw new ResourceNotFoundError('post', postId)
    }
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId).exec()
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

    return comment
  }

  async findComment (postId: string, commentId: string): Promise<CommentSchema> {
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

    return comment
  }

  async removeComment (user: UserSchema, postId: string, commentId: string): Promise<void> {
    const comment = await this.findComment(postId, commentId)
    if ((comment.by as UserSchema).id !== user.id) {
      throw new ForbiddenError(user, 'remove this comment')
    }
    await comment.remove()
  }

  async likeComment (user: UserSchema, postId: string, commentId: string): Promise<number> {
    await this.findComment(postId, commentId) // ensure existence
    // @ts-ignore
    const comment: CommentSchema = await Comment.findByIdAndUpdate(commentId, {$addToSet: {likedBy: user.id}}).exec()
    return comment.likedBy.length
  }

  async cancelLikeComment (user: UserSchema, postId: string, commentId: string): Promise<number> {
    await this.findComment(postId, commentId)
    // @ts-ignore
    const comment: CommentSchema = await Comment.findByIdAndUpdate(commentId, {$pull: {likedBy: user.id}}).exec()
    return comment.likedBy.length
  }

  filterCommentModelFields (comment: CommentSchema) {
    return {
      content: comment.content,
      parentCommentId: comment.parentCommentId
    }
  }
}
