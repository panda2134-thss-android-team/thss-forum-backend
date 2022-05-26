import {z} from 'zod'
import {emailSchema, passwordSchema} from '../users'

export const RegisterRequest = z.object({
  nickname: z.string().optional(),
  password: passwordSchema,
  email: emailSchema
})

export const LoginRequest = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const ChangePasswordRequest = z.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema
})
