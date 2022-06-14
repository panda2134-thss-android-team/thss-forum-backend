import Router from '@koa/router'
import State from '../../middleware/State'
import {Middleware} from 'koa'
import assert from 'assert'
import {PostService} from '../../service/PostService'
import {ImageTextContent, MediaContent, Post, PostSchema, PostTypes} from '../../model/Post'
import {ResourceNotFoundError} from '../../errors/ResourceNotFoundError'
import {ValidateBody} from '../../schema'
import {editPostRequest, getPostQuerySchema, newPostRequest} from '../../schema/posts/request'
import {LocationSchema} from '../../model/Location'
import {SafeParseError, z} from "zod";
import {UnprocessableEntityError} from "../../errors/UnprocessableEntityError";

const postService = new PostService()

const getPosts: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  const parseQueryResult = getPostQuerySchema.safeParse(ctx.query)
  if (! parseQueryResult.success) {
    throw new UnprocessableEntityError(ctx.query, (parseQueryResult as SafeParseError<z.infer<typeof getPostQuerySchema>>).error)
  }
  const query = parseQueryResult.data
  let posts: PostSchema[]
  const commonGetPostParams = {
    search: query.q, type: query.type,
    start: query.start, end: query.end,
    sortBy: query.sort_by as 'time' | 'like',
    skip: query.skip,
    limit: query.limit
  }
  if (query.following) {
    posts = await postService.getPosts(ctx.state.user, {
      target: 'following', ...commonGetPostParams
    })
  } else {
    posts = await postService.getPosts(ctx.state.user, commonGetPostParams)
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
    let loc: LocationSchema | undefined = undefined
    if (body.location) {
      loc = {
        description: body.location.description,
        lon: body.location.lon,
        lat: body.location.lat
      }
    }
    if (body.type === 'normal') {
      post = await postService.makeImageTextPost(ctx.state.user, body.imageTextContent as ImageTextContent, loc)
    } else {
      post = await postService.makeMediaPost(ctx.state.user,
        body.type === 'audio' ? PostTypes.AUDIO : PostTypes.VIDEO, body.mediaContent as MediaContent, loc)
    }
    ctx.body = {id: post.id.toString()}
    ctx.status = 201
  }
)

const editPost = ValidateBody(editPostRequest)(
  async (ctx, next, body) => {
    assert(ctx.state.user)
    const postId = ctx.params.postId
    let post: PostSchema
    if (body.type === 'normal') {
      post = await postService.editPost(ctx.state.user, postId, PostTypes.NORMAL, body.imageTextContent as ImageTextContent)
    } else {
      post = await postService.editPost(ctx.state.user,postId,
        body.type === 'audio' ? PostTypes.AUDIO : PostTypes.VIDEO, body.mediaContent as MediaContent)
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
