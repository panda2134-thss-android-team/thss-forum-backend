import {z} from 'zod'
import {dateSchema} from "../utils";
import {PostTypes} from "../../model/Post";

export const locationSchema = z.object({
  description: z.string(),
  lon: z.number().min(-180.0, '经度 > -180').max(180.0, '经度 < 180'),
  lat: z.number().min(-90.0, '纬度 > -90').max(90.0, '纬度 < 90')
})

const imageTextPost = z.object({
  type: z.literal('normal'),
  location: locationSchema.optional(),
  imageTextContent: z.object({
    title: z.string(),
    text: z.string(),
    images: z.array(z.string().url())
  })
})

const mediaPost = z.object({
  type: z.enum(['audio', 'video']),
  location: locationSchema.optional(),
  mediaContent: z.object({
    title: z.string(),
    media: z.array(z.string().url())
  })
})

export const newPostRequest = z.union([imageTextPost, mediaPost])

export const editPostRequest = z.union([
  imageTextPost.omit({location: true}),
  mediaPost.omit({location: true})
])

const getPostQuerySchemaBase = z.object({
  start: dateSchema.default(() => new Date(0)),
  end: dateSchema.default(() => new Date()),
  skip: z.string().regex(/\d*/).optional().transform(x => x != null ? parseInt(x) : 0).refine(x => Number.isInteger(x)),
  limit: z.string().regex(/\d*/).optional().transform(x => x != null ? parseInt(x) : 65535).refine(x => Number.isInteger(x)),
  sort_by: z.enum(['time', 'like']).default('time'),
  type:
    z.nativeEnum(PostTypes).or(z.array(z.nativeEnum(PostTypes))).transform(x => Array.isArray(x) ? x : [x])
      .optional(),
  q: z.ostring()
})

export const getPostQuerySchema = z.object({
  following: z.preprocess(x => !!x, z.boolean()),
  qu: z.string().optional()
}).and(getPostQuerySchemaBase)

export const getPostsOfUserQuerySchema = getPostQuerySchemaBase