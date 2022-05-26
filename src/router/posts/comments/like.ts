import Router, {Middleware} from '@koa/router'
import assert from 'assert'
import State from '../../../middleware/State'
import {CommentService} from '../../../service/CommentService'

const commentService = new CommentService()

const getLikes: Middleware<State> = async (ctx) => {
    assert(ctx.state.user)

    const {postId, commentId} = ctx.params
    const comment = await commentService.findComment(ctx.state.user, postId, commentId)

    ctx.body = { count: comment.likedBy.length }
}

const like: Middleware<State> = async (ctx) => {
    assert(ctx.state.user)

    const {postId, commentId} = ctx.params
    const count = await commentService.likeComment(ctx.state.user, postId, commentId)
    ctx.body = { count }
}

const cancelLike: Middleware<State> = async (ctx) => {
    assert(ctx.state.user)

    const {postId, commentId} = ctx.params
    const count = await commentService.cancelLikeComment(ctx.state.user, postId, commentId)
    ctx.body = { count }
}

export function addToRouter(router: Router<State>) {
    router.get('/:commentId/like', getLikes)
    router.post('/:commentId/like', like)
    router.delete('/:commentId/like', cancelLike)
}
