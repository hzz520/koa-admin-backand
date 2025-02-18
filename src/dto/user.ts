import { z } from 'koa-swagger-decorator'
import { page } from './common'

export const DEL_BODY_DTO = z.object({
  id: z.number().describe('用户id').openapi({ example: 0 }),
})

export const LIST_BODY_DTO = z
  .object({
    name: z.string().describe('用户名').openapi({ example: '' }),
    role: z.string().describe('角色').openapi({ example: '' }),
    createAt: z.array(z.string()).describe('创建时间').openapi({ example: [] }),
    updateAt: z.array(z.string()).describe('更新时间').openapi({ example: [] }),
  })
  .merge(page)
  .partial()

export const USER_LOGIN_BODY_DTO = z.object({
  name: z.string().describe('用户名').openapi({ example: '' }),
  password: z.string().describe('密码').openapi({ example: '' }),
})

export const USER_REG_BODY_DTO = z
  .object({
    confirmPassword: z.string().describe('确认密码').openapi({ example: '' }),
  })
  .merge(USER_LOGIN_BODY_DTO)

export const USER_ADD_BODY_DTO = z.object({
  id: z.number().describe('用户id').optional().openapi({ example: 0 }),
  name: z.string().describe('用户名').openapi({ example: '' }),
  password: z.string().describe('密码').optional().openapi({ example: '' }),
  roleId: z.number().describe('角色id').openapi({ example: 4 }),
})

export const USER_UPDATEPWD_BODY_DTO = z.object({
  id: z.number().describe('用户id').openapi({ example: 0 }),
  password: z.string().describe('密码').openapi({ example: '' }),
})

export const CHANGE_USER_PWD_BODY_DTO = z
  .object({
    newPassword: z.string().describe('新密码').openapi({ example: '' }),
  })
  .merge(USER_LOGIN_BODY_DTO)
