import { z, body, middlewares } from 'koa-swagger-decorator'
import Result from '../common/Result'
import { getRouterConfig } from '../utils'
import { Context } from 'koa'
import { CATE_OPTIONS_REQ_DTO } from '../dto/category'

const routeConfig = getRouterConfig({
  path: '/api/category',
  tags: ['业务分类'],
})

export class CategoryController {
  @routeConfig({
    path: '/options',
    method: 'post',
    summary: '获取业务分类'
  })
  @body(CATE_OPTIONS_REQ_DTO)
  async getOptions(ctx: Context) {
    let { name } = ctx.request.body as z.infer<typeof CATE_OPTIONS_REQ_DTO>
    let data = await ctx.prisma.category.findMany({
      where: {
        name: {
          contains: name
        }
      },
      orderBy: {
        updateAt: 'desc'
      }
    })

    ctx.body = Result.success(data)
  }
}