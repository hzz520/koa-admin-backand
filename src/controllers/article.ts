import { z, body, middlewares } from 'koa-swagger-decorator'
import Result from '../common/Result'
import { getRouterConfig } from '../utils'
import { Context } from 'koa'
import service from '../services/article'
import { DETAIL_REQ_DTO, EDIT_REQ_DTO, GETLIST_REQ_DTO } from '../dto/article'
import { headersDto } from '../dto/common'
import { PermissionMiddleware } from '../middlewares/permission'

const routeConfig = getRouterConfig({
  path: '/api/article',
  tags: ['文章'],
})

export class ArticleController {
  @routeConfig({
    path: '/list',
    method: 'post',
    summary: '获取文章列表',
    request: {
      headers: headersDto,
    },
  })
  @body(GETLIST_REQ_DTO)
  async getList(ctx: Context) {
    try {
      const body = ctx.request.body as z.infer<typeof GETLIST_REQ_DTO>
      const data = await service.getList(body)
      ctx.body = Result.success(data)
    } catch (error) {
      console.log('error', error)
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/edit',
    method: 'post',
    summary: '编辑',
    request: {
      headers: headersDto,
    },
  })
  @middlewares([PermissionMiddleware()])
  @body(EDIT_REQ_DTO)
  async edit(ctx: Context) {
    try {
      const body = ctx.request.body as z.infer<typeof EDIT_REQ_DTO>
      const { id: authorId } = ctx.state.user || {}

      await service.edit({
        ...body,
        authorId,
      })
      ctx.body = Result.success()
    } catch (error) {
      console.log('error', error)
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/del',
    method: 'post',
    summary: '删除',
    request: {
      headers: headersDto,
    },
  })
  @body(DETAIL_REQ_DTO)
  @middlewares([PermissionMiddleware()])
  async del(ctx: Context) {
    try {
      const body = ctx.request.body as z.infer<typeof DETAIL_REQ_DTO>
      await service.del(body)
      ctx.body = Result.success()
    } catch (error) {
      console.log('error', error)
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/detail',
    method: 'post',
    summary: '详情',
    request: {
      headers: headersDto,
    },
  })
  @body(DETAIL_REQ_DTO)
  async getDetail(ctx: Context) {
    try {
      const body = ctx.request.body as z.infer<typeof DETAIL_REQ_DTO>
      const data = await service.getDetail(body)
      ctx.body = Result.success(data)
    } catch (error) {
      console.log('error', error)
      ctx.body = Result.customFailed(error)
    }
  }
}
