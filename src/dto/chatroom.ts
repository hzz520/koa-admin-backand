import { z } from 'koa-swagger-decorator'
import { page } from './common'

export const GET_LIST_REQ_DTO = z.object({}).merge(page)

export const EDIT_REQ_DTO = z.object({
  id: z.number().describe('id').optional().openapi({ example: 0 }),
  name: z.string().describe('名称').openapi({ example: '' }),
  users: z.array(z.number().describe('用户id')).describe('用户列表'),
})
