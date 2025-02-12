import { z } from 'koa-swagger-decorator'

export const IMAGE_DEL_BODY_DTO = z.object({
  bizCode: z.string().describe('业务域').nonempty().openapi({ example: '' }),
  filename: z.string().describe('文件名').nonempty().openapi({ example: '' }),
})
