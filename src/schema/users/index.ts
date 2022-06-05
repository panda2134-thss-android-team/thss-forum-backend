import {z} from 'zod'

export const emailSchema = z.string().email('电子邮件格式错误')
export const passwordSchema = z.string()
  .min(6, '密码不短于6位')
  .max(32, '密码不长于32位')
  .regex(/\p{ASCII}+/gu, '密码只能含有字母数字符号')
export const userUpdateSchema = z.object({
  avatar: z.string(),
  nickname: z.string().min(1, '昵称非空').max(8, '昵称不超过8个字'),
  intro: z.string().max(20, '个人简介不超过20字'),
  email: emailSchema
}).partial()
