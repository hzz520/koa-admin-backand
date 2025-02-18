import { z } from 'koa-swagger-decorator'
import { page } from './common'

export const GETLIST_REQ_DTO = z
  .object({
    title: z.string().describe('标题').optional().openapi({ example: '' }),
    author: z.string().describe('作者').optional().openapi({ example: '' }),
    createAt: z.array(z.string()).describe('创建时间').optional().openapi({ example: [] }),
    updateAt: z.array(z.string()).describe('更新时间').optional().openapi({ example: [] }),
  })
  .merge(page)

export const EDIT_REQ_DTO = z.object({
  id: z
    .number()
    .describe('文章id')
    .nullable()
    .optional()
    .openapi({ example: undefined }),
  html: z.string().describe('文章内容').nonempty().openapi({ example: '' }),
  title: z.string().describe('文章标题').nonempty().openapi({ example: '' }),
})

export const DETAIL_REQ_DTO = z.object({
  id: z.number().describe('文章id').openapi({ example: undefined }),
})
