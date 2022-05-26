import {z} from 'zod'

export const stsResponse = z.object({
  'Credentials': z.object({
    'SecurityToken': z.string(),
    'Expiration': z.string(),
    'AccessKeyId': z.string(),
    'AccessKeySecret': z.string()
  })
})
