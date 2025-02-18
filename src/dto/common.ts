import { z } from 'koa-swagger-decorator'

export const commonRes = z.object({
  code: z
    .string()
    .nonempty()
    .describe('通用返回状态')
    .openapi({ example: '00000' }),
  msg: z.string().describe('通用返回信息').openapi({ example: '' }),
})

export const operator = z.object({
  operator: z
    .object(
      {
        operatorGuid: z
          .string({ description: '操作人guid' })
          .openapi({ example: '' }),
        operatorName: z
          .string({ description: '操作人名称' })
          .openapi({ example: '' }),
        operatorPhone: z
          .string({ description: '操作人手机号码' })
          .openapi({ example: '' }),
      },
      { description: '操作人信息' },
    )
    .optional(),
})

export const wrapRes = (data) => {
  return commonRes.merge(z.object({ data }, { description: '通用返回数据' }))
}

export const headersDto = z.object({
  Authorization: z.string().describe('token').nullable(),
})

export const page = z.object({
  page: z.number().describe('页码').optional().openapi({ example: 1 }),
  pageSize: z.number().describe('页长').optional().openapi({ example: 10 }),
})
