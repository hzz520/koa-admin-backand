import { z } from 'koa-swagger-decorator'

export const CATE_OPTIONS_REQ_DTO = z.object({
  name: z.string().optional().describe('分类名称').openapi({ example: '' })
})