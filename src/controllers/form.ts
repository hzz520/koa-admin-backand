import { z, body, middlewares } from 'koa-swagger-decorator'
import Result from '../common/Result'
import { getRouterConfig } from '../utils'
import { Context } from 'koa'
import {
  GETLIST_REQ_DTO,
  EDIT_REQ_DTO,
  DETAIL_REQ_DTO,
  DETAIL_VERSIONID_REQ_DTO,
  DEL_REQ_DTO,
} from '../dto/form'
import { headersDto } from '../dto/common'
import service from '../services/form'
import { PermissionMiddleware } from '../middlewares/permission'

const routeConfig = getRouterConfig({
  path: '/api/dynamic-form',
  tags: ['表单引擎'],
})

export class DynimicFormController {
  @routeConfig({
    path: '/list',
    method: 'post',
    summary: '获取表单列表',
    request: {
      headers: headersDto,
    },
  })
  @body(GETLIST_REQ_DTO)
  async getList(ctx: Context) {
    try {
      let data = await service.getList(ctx.request.body as z.infer<typeof GETLIST_REQ_DTO>)
      ctx.body = Result.success(data)
    } catch (error) {
      console.log('error', error);
      
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/copy',
    method: 'post',
    summary: '拷贝表单',
    request: {
      headers: headersDto,
    },
  })
  @body(DETAIL_VERSIONID_REQ_DTO)
  @middlewares([PermissionMiddleware()])
  async copy(ctx: Context) {
    try {
      let data = ctx.request.body as z.infer<typeof DETAIL_VERSIONID_REQ_DTO>
      await service.copy(data)
      ctx.body = Result.success()
    } catch (error) {
      console.log('error', error);
      
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/edit',
    method: 'post',
    summary: '新增或编辑表单',
    request: {
      headers: headersDto,
    },
  })
  @body(EDIT_REQ_DTO)
  @middlewares([PermissionMiddleware()])
  async edit(ctx: Context) {
    try {
      let { id: authorId } = ctx.state.user || {}
      let data = ctx.request.body as z.infer<typeof EDIT_REQ_DTO>
      await service.edit({
        ...data,
        authorId,
      })
      ctx.body = Result.success()
    } catch (error) {
      console.log('error', error);
      
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/detail',
    method: 'post',
    summary: '获取表单详情',
    request: {
      headers: headersDto,
    },
  })
  @body(DETAIL_REQ_DTO)
  async detail(ctx: Context) {
    try {
      let data = await service.detail(ctx.request.body as z.infer<typeof DETAIL_REQ_DTO>)
      ctx.body = Result.success(data)
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/versionsById',
    method: 'post',
    summary: '获取表单版本列表',
    request: {
      headers: headersDto,
    },
  })
  @body(DETAIL_REQ_DTO)
  async getVersionsById(ctx: Context) {
    try {
      let data = await service.getVersionsById(ctx.request.body as z.infer<typeof DETAIL_REQ_DTO>)
      ctx.body = Result.success(data)
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/detailByVersionId',
    method: 'post',
    summary: '通过版本获取表单详情',
    request: {
      headers: headersDto,
    },
  })
  @body(DETAIL_VERSIONID_REQ_DTO)
  async getDetailByVersionId(ctx: Context) {
    try {
      let data = await service.detailVersionId(ctx.request.body as z.infer<typeof DETAIL_VERSIONID_REQ_DTO>)
      ctx.body = Result.success(data)
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/del',
    method: 'post',
    summary: '删除表单',
    request: {
      headers: headersDto,
    },
  })
  @body(DETAIL_REQ_DTO)
  @middlewares([PermissionMiddleware()])
  async del(ctx: Context) {
    try {
      await service.del(ctx.request.body as z.infer<typeof DETAIL_REQ_DTO>)
      ctx.body = Result.success()
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/delByVersionId',
    method: 'post',
    summary: '删除指定版本的表单',
    request: {
      headers: headersDto,
    },
  })
  @body(DEL_REQ_DTO)
  @middlewares([PermissionMiddleware()])
  async delByVersionId(ctx: Context) {
    try {
      await service.delByVersionId(ctx.request.body as z.infer<typeof DEL_REQ_DTO>)
      ctx.body = Result.success()
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }
}
