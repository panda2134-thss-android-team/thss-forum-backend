import {z} from 'zod'

export const AddUserToListRequest = z.object({
  uid: z.string()
})
