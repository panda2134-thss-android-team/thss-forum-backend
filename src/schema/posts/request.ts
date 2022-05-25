import {z} from 'zod'

export const locationSchema = z.object({
  description: z.string(),
  lon: z.number().min(-180.0, 'longitude should be > -180').max(180.0, 'longitude should be < 180'),
  lat: z.number().min(-90.0, 'latitude should be > -90').max(90.0, 'latitude should be < 90')
})

const imageTextPost = z.object({
  type: z.literal('normal'),
  location: locationSchema.optional(),
  imageTextContent: z.object({
    text: z.string(),
    images: z.array(z.string().url())
  })
})

const mediaPost = z.object({
  type: z.enum(['audio', 'video']),
  location: locationSchema.optional(),
  mediaContent: z.array(z.string().url())
})

export const newPostRequest = z.union([imageTextPost, mediaPost])

export const editPostRequest = z.union([
  imageTextPost.omit({location: true}),
  mediaPost.omit({location: true})
])
