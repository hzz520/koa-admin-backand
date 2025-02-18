import { z, body, middlewares } from 'koa-swagger-decorator'
import Result from '../common/Result'
import { getRouterConfig } from '../utils'
import { Context } from 'koa'
import service from '../services/user'
import {
  CHANGE_USER_PWD_BODY_DTO,
  DEL_BODY_DTO,
  LIST_BODY_DTO,
  USER_ADD_BODY_DTO,
  USER_LOGIN_BODY_DTO,
  USER_REG_BODY_DTO,
} from '../dto/user'
import jwt from 'jsonwebtoken'
import config from '../config/index'
import { headersDto } from '../dto/common'
import { PermissionMiddleware } from '../middlewares/permission'

const routeConfig = getRouterConfig({
  path: '/api/user',
  tags: ['用户'],
})

export class UserController {
  @routeConfig({
    path: '/login',
    method: 'post',
    summary: '登录',
    request: {},
  })
  @body(USER_LOGIN_BODY_DTO)
  async login(ctx: Context) {
    try {
      let data = ctx.request.body as z.infer<typeof USER_LOGIN_BODY_DTO>
      const { name, password } = await service.login(data)

      let token = jwt.sign(
        {
          name,
          password,
        },
        config.jwt.secret,
        { expiresIn: '1d' },
      )
      let user = await jwt.decode(token, { complete: true })
      ctx.redis.set(`jwt_${name}`, token, user?.['exp'])
      ctx.body = Result.success(token)
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/logout',
    method: 'post',
    summary: '退出登录',
    request: {
      headers: headersDto.partial(),
    },
  })
  async logout(ctx: Context) {
    try {
      ctx.body = Result.needLogin()
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/registry',
    method: 'post',
    summary: '注册',
    request: {},
  })
  @body(USER_REG_BODY_DTO)
  async registry(ctx: Context) {
    let data = ctx.request.body as z.infer<typeof USER_REG_BODY_DTO>
    const { error } = USER_REG_BODY_DTO.refine(
      (data) => data.password === data.confirmPassword,
      '密码和确认密码不匹配',
    ).safeParse(data)
    if (error) {
      ctx.body = Result.success()
      return
    }
    try {
      await service.registry(data)
      ctx.body = Result.success()
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/changPwd',
    method: 'post',
    summary: '修改密码',
    request: {},
  })
  @body(CHANGE_USER_PWD_BODY_DTO)
  async changePwd(ctx: Context) {
    let data = ctx.request.body as z.infer<typeof CHANGE_USER_PWD_BODY_DTO>
    const { error } = CHANGE_USER_PWD_BODY_DTO.refine(
      (data) => data.password !== data.newPassword,
      '密码和新密码不能相同',
    ).safeParse(data)
    if (error) {
      ctx.body = Result.customFailed(error.errors[0].message)
      return
    }
    try {
      await service.changePwd(data)
      ctx.body = Result.success()
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/info',
    method: 'post',
    summary: '获取用户信息',
    request: {
      headers: headersDto,
    },
  })
  async getUser(ctx: Context) {
    const instance = await service.getUserByToken(ctx.headers.authorization)
    if (!instance) {
      ctx.body = Result.needLogin('用户不存在')
    }
    ctx.body = Result.success(instance)
  }

  @routeConfig({
    path: '/list',
    method: 'post',
    summary: '获取用户列表',
    request: {
      headers: headersDto,
    },
  })
  @body(LIST_BODY_DTO)
  async getList(ctx: Context) {
    try {
      let data = ctx.request.body as z.infer<typeof LIST_BODY_DTO>
      let body = await service.getList(data)

      ctx.body = Result.success(body)
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/addOrUpdate',
    method: 'post',
    summary: '新增或修改用户',
    request: {
      headers: headersDto,
    },
  })
  @body(USER_ADD_BODY_DTO)
  @middlewares([PermissionMiddleware((ctx) => {
    let isSuperAdmin = ctx.state.user?.role?.code === 'superAdmin'
    if (!isSuperAdmin) {
      return {
        pass: false,
        msg: '非超级管理员权限不够',
      }
    }
    return {
      pass: true,
      msg: '',
    }
  })])
  async add(ctx: Context) {
    let data = ctx.request.body as z.infer<typeof USER_ADD_BODY_DTO>
    try {
      await service.add(data)
      ctx.body = Result.success()
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/del',
    method: 'post',
    summary: '删除用户',
    request: {
      headers: headersDto,
    },
  })
  @body(DEL_BODY_DTO)
  @middlewares([PermissionMiddleware((ctx) => {
    let isSuperAdmin = ctx.state.user?.role?.code === 'superAdmin'
    if (!isSuperAdmin) {
      return {
        pass: false,
        msg: '非超级管理员权限不够',
      }
    }
    return {
      pass: true,
      msg: '',
    }
  })])
  async del(ctx: Context) {
    try {
      let data = ctx.request.body as z.infer<typeof DEL_BODY_DTO>

      await service.del(data)
      ctx.body = Result.success()
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }
}
