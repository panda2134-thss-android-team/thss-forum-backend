import {z} from 'zod'

export const getCommentsQuery = z.object({
    skip: z.string().optional().transform(x => x ? parseInt(x) : undefined),
    limit: z.string().optional().transform(x => x ? parseInt(x) : undefined),
    sort_by: z.enum(['oldest', 'newest']).optional()
})

export const newCommentRequest = z.object({
    content: z.string().min(1),
    parent_comment_id: z.string().nullable().optional()
})
