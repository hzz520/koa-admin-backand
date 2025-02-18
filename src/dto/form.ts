import { z } from 'koa-swagger-decorator'
import { page } from './common'

export const GETLIST_REQ_DTO = z
  .object({
    name: z.string().describe('表单名称').optional().openapi({ example: '' }),
    author: z.string().describe('作者').optional().openapi({ example: '' }),
    categoryIds: z.array(z.number()).describe('分类').optional().openapi({ example: [] }),
    createAt: z.array(z.string()).describe('创建时间').optional().openapi({ example: [] }),
    updateAt: z.array(z.string()).describe('更新时间').optional().openapi({ example: [] }),
  })
  .merge(page)

export const EDIT_REQ_DTO = z.object({
  id: z
    .string()
    .describe('表单id')
    .nullable()
    .optional()
    .openapi({ example: undefined }),
    name: z.string().describe('表单名称').nonempty().openapi({ example: '' }),
  config: z.string().describe('表单配置').nonempty().openapi({ example: '' }),
  extConfig: z.string().describe('额外配置').nullable().optional().openapi({ example: '' }),
  categoryId: z.number().describe('分类id').nullable().optional().openapi({ example: null }),
})

export const DETAIL_REQ_DTO = z.object({
  id: z.string().describe('表单id').openapi({ example: undefined }),
})

export const DEL_REQ_DTO = z.object({
  versionId: z.string().describe('表单版本id').openapi({ example: undefined })
})

export const DETAIL_VERSIONID_REQ_DTO = z.object({
  versionId: z.string().describe('表单版本id').openapi({ example: undefined }),
})