import State from '../../middleware/State'
import { ParameterizedContext } from 'koa'
import Router from '@koa/router'
import { Middleware } from 'koa'
import assert from 'assert'
import { Post } from '../../model/Post'
import { PostService } from '../../service/PostService'
import { ResourceNotFoundError } from '../../errors/ResourceNotFoundError'

const postService = new PostService()

async function findPost(ctx: ParameterizedContext<State>) {
  const id = ctx.params.postId
  const post = await Post.findById(id).exec()
  if (!post) {
    throw new ResourceNotFoundError('post', id)
  }
  return post
}

const getLikes: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const post = await findPost(ctx)
  ctx.body = {
    count: post.likedBy.length
  }
}

const like: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const count = await postService.likePost(ctx.state.user, ctx.params.postId)
  ctx.body = { count }
}

const cancelLike: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const count = await postService.cancelLikePost(ctx.state.user, ctx.params.postId)
  ctx.body = { count }
}

export function addToRouter(router: Router<State>) {
  router.get('/like', getLikes)
  router.post('/like', like)
  router.delete('/like', cancelLike)
}
