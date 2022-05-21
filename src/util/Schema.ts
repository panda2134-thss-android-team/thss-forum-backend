import { z } from 'zod'

export const emailSchema = z.string().email('电子邮件格式错误')
export const passwordSchema = z.string()
  .min(6, '密码不短于6位')
  .max(32, '密码不长于32位')
  .regex(/\p{ASCII}+/gu)
export const userUpdateSchema = z.object({
  avatar: z.string(),
  nickname: z.string()
}).partial()
