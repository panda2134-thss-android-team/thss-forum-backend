import {z} from 'zod'

export const wsLoginRequest = z.object({
  token: z.string(),
  unique_id: z.string().min(1)
})
