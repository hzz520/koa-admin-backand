import { z, middlewares, body, ParsedArgs } from 'koa-swagger-decorator'
import Result from '../common/Result'
import { getRouterConfig } from '../utils'
import path from 'path'
import { Context } from 'koa'
import service from '../services/image'
import fs from 'fs-extra'
import { IMAGE_DEL_BODY_DTO } from '../dto/image'
import { upload } from '../utils/upload'
import { headersDto } from '../dto/common'

const routeConfig = getRouterConfig({
  path: '/api/oss',
  tags: ['文件管理'],
})

export class ImageController {
  @routeConfig({
    path: '/upload',
    method: 'post',
    summary: '上传文件',
    request: {
      headers: headersDto,
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              file: z
                .string()
                .nonempty()
                .openapi({ format: 'binary', multipleOf: 1, example: '' })
                .describe('文件内容'),
              bizCode: z.string().nonempty().describe('业务域'),
            }),
          },
        },
      },
    },
  })
  @middlewares([upload.single('file')])
  async upload(ctx: Context) {
    const file = ctx.request['file']
    const { bizCode } = ctx.request['fields'] || {}

    if (!file || !bizCode) {
      const filePath = path.resolve(
        __dirname,
        `../../uploads/article/${file.filename}`,
      )
      fs.unlinkSync(filePath)
      ctx.body = Result.customFailed('上传文件失败!')
      return
    }

    try {
      const data = await service.upload({ file, bizCode })
      ctx.body = Result.success(data)
    } catch (error) {
      console.log(error)
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/del',
    method: 'post',
    summary: '删除文件',
    request: {
      headers: headersDto,
    },
  })
  @body(IMAGE_DEL_BODY_DTO)
  async del(
    ctx: Context,
    args: ParsedArgs<z.infer<typeof IMAGE_DEL_BODY_DTO>>,
  ) {
    try {
      await service.del(args.body as z.infer<typeof IMAGE_DEL_BODY_DTO>)
      ctx.body = Result.success()
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }
}
