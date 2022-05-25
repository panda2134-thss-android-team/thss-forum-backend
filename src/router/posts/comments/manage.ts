import Router, { Middleware } from "@koa/router"
import assert from "assert"
import { z, ZodError } from "zod"
import { UnprocessableEntityError } from "../../../errors/UnprocessableEntityError"
import State from "../../../middleware/State"
import { getCommentsQuery, newCommentRequest } from "../../../schema/comments/request"
import { ValidateBody } from "../../../schema/index"
import { CommentService } from "../../../service/CommentService"

const commentService = new CommentService()

const getComments: Middleware<State> = async (ctx) => {
    assert(ctx.state.user)
    const postId = ctx.params.postId
    let parsedQuery: z.infer<typeof getCommentsQuery>
    try {
        parsedQuery = getCommentsQuery.parse(ctx.query)
    } catch (e) {
        throw new UnprocessableEntityError(ctx.querystring, e as ZodError)
    }
    const sortBy = parsedQuery.sort_by === 'newest' ? 'desc' : 'asc'
    const comments = await commentService.getCommentsOfPost(ctx.state.user, postId, {
        sortBy,
        skip: parsedQuery.skip,
        limit: parsedQuery.limit
    })
    ctx.body = comments.map(commentService.filterCommentModelFields)
}

const getCommentById: Middleware<State> = async (ctx) => {
    assert(ctx.state.user)
    const {postId, commentId} = ctx.params
    
    const comment = await commentService.findComment(postId, commentId)
    ctx.body = commentService.filterCommentModelFields(comment)
}

const addComment: Middleware<State> = ValidateBody(newCommentRequest)(
    async (ctx, next, body) => {
        assert(ctx.state.user)
        const { postId } = ctx.params
        if (body.parent_comment_id == null) {
            body.parent_comment_id = undefined
        }
        const comment = await commentService.addComment(ctx.state.user, postId, body.content, body.parent_comment_id)
        ctx.body = {
            comment_id: comment.id,
            post_id: postId
        }
    }
)

const removeComment: Middleware<State> = async (ctx) => {
    assert(ctx.state.user)
    const { postId, commentId } = ctx.params
    await commentService.removeComment(ctx.state.user, postId, commentId)
    ctx.body = {
        post_id: postId,
        comment_id: commentId
    }
}

export function addToRouter (router: Router<State>) {
    router.get('/', getComments)
    router.get('/:commentId', getCommentById)
    router.post('/', addComment)
    router.delete('/:commentId', removeComment)
}