import Router from '@koa/router'
import State from '../../middleware/State'
import {Middleware} from 'koa'
import assert from 'assert'
import {PostService} from '../../service/PostService'
import {parseStartEndDate} from '../../util/QueryArgParser'
import {Post, PostSchema, PostTypes} from '../../model/Post'
import {ResourceNotFoundError} from '../../errors/ResourceNotFoundError'
import {ValidateBody} from '../../schema'
import {editPostRequest, newPostRequest} from '../../schema/posts/request'

const postService = new PostService()

const getPosts: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const startEndQuery = parseStartEndDate(ctx)
  const following = ctx.query.following != null

  let posts: PostSchema[]
  if (following) {
    posts = await postService.getPosts(ctx.state.user, {target: 'following', ...startEndQuery})
  } else {
    posts = await postService.getPosts(ctx.state.user, startEndQuery)
  }
  ctx.body = posts.map(postService.filterPostModelFields)
}

const getPostItem: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)

  const post = await Post.findById(ctx.params.postId).exec()
  if (!post) {
    throw new ResourceNotFoundError('post', ctx.params.postId)
  }

  ctx.body = postService.filterPostModelFields(post)
}

const addPost = ValidateBody(newPostRequest)(
  async (ctx, next, body) => {
    assert(ctx.state.user)
    let post: PostSchema
    if (body.type === 'normal') {
      post = await postService.makeImageTextPost(ctx.state.user, body.imageTextContent, body.location)
    } else {
      post = await postService.makeMediaPost(ctx.state.user,
        body.type === 'audio' ? PostTypes.AUDIO : PostTypes.VIDEO, body.mediaContent, body.location)
    }
    ctx.body = {id: post.id.toString()}
  }
)

const editPost = ValidateBody(editPostRequest)(
  async (ctx, next, body) => {
    assert(ctx.state.user)
    const postId = ctx.params.postId
    let post: PostSchema
    if (body.type === 'normal') {
      post = await postService.editPost(ctx.state.user, postId, PostTypes.NORMAL, body.imageTextContent)
    } else {
      post = await postService.editPost(ctx.state.user,postId,
        body.type === 'audio' ? PostTypes.AUDIO : PostTypes.VIDEO, body.mediaContent)
    }
    ctx.body = postService.filterPostModelFields(post)
  }
)

const removePost: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const postId = ctx.params.postId
  await postService.removePost(ctx.state.user, postId)
  ctx.body = null
}

export function addToRouter(router: Router<State>) {
  router.get('/', getPosts)
  router.get('/:postId', getPostItem)
  router.post('/', addPost)
  router.put('/:postId', editPost)
  router.delete('/:postId', removePost)
}
