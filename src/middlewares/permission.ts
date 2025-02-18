import { Context, Next } from "koa"
import Result from "../common/Result"

export const PermissionMiddleware = (filter?: (ctx: Context) => { msg: string, pass: boolean }) => {
  return async (ctx: Context, next: Next) => {
    const { user } = ctx.state
    let fn = (ctx: Context) => {
      if (['admin', 'superAdmin'].includes(user?.role.code) ||
      user.id === ctx.request.body.authorId) {
        return {
          pass: true,
          msg: ''
        }
      }

      return {
        pass: false,
        msg: '无操作权限'
      }
    }
    if (filter && Object.prototype.toString.call(filter) === '[object Function]') {
      fn = filter
    }
    let flag = fn(ctx)
    if (flag.pass) {
      await next()
      return
    }
  
    ctx.body = Result.customFailed(flag.msg || '无权限')
  }
}