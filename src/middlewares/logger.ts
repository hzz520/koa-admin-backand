/*
 * @FilePath: /koa/src/middlewares/logger.ts
 * @Author: hzz
 * @Date: 2024-11-15 11:55:18
 * @LastEditors: hzz
 * @LastEditTime: 2024-11-15 19:58:32
 * Copyright: 2024 杭州贝康科技有限公司 All Rights Reserved.
 * @Descripttion: 日志中间件
 */
import { Context } from 'koa'
import log4js, { Configuration } from 'log4js'
import path from 'path'
import config from '../config'
import Result from '../common/Result'
import { ZodError } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
import { z } from 'koa-swagger-decorator'
import i18next from 'i18next'
import translation from 'zod-i18n-map/locales/zh-CN/zod.json'

i18next.init({
  lng: 'zh-CN',
  resources: {
    'zh-CN': { zod: translation },
  },
})
z.setErrorMap(zodI18nMap)

let { isLocal } = config
isLocal = true

let appenders = Object.assign(
  {
    out: { type: 'stdout' },
  },
  isLocal
    ? {}
    : {
        error: {
          type: 'file',
          filename: path.resolve(__dirname, '../../logs/error'),
        },
        info: {
          type: 'file',
          filename: path.resolve(__dirname, '../../logs/info'),
        },
      },
)

let categories = isLocal
  ? {
      default: { appenders: ['out'], level: 'all' },
    }
  : {
      default: { appenders: ['info'], level: 'info' },
      error: { appenders: ['error'], level: 'all' },
    }

log4js.configure({
  appenders,
  categories,
} as Configuration)
const logger = log4js.getLogger('application')
const errLogger = log4js.getLogger('error')

export const loggerMiddleware = async (ctx: Context, next) => {
  if (['/swagger-ui', '/swagger-ui/'].includes(ctx.request.path)) {
    ctx.body = Result.notFound()
    return
  }
  if (
    [
      '/favicon.ico',
      '/swagger-ui/index.json',
      '/v3/api-docs/swagger-config',
      '/doc.html',
    ].includes(ctx.request.path) ||
    ctx.request.path.startsWith('/webjars/')
  ) {
    await next()
    return
  }
  ctx.logger = logger
  ctx.errLogger = errLogger
  const { url, method, host } = ctx.request
  let pre = +new Date()
  logger.info(`<--- ${host} ${url} ${method}`)
  try {
    await next()
  } catch (error: any) {
    if (error instanceof ZodError) {
      let err = JSON.parse(error.message)[0]
      let { message, path } = err

      ctx.status = 200
      ctx.body = Result.customFailed(`【${path[0]}】${message}`)
    } else {
      if (error.message.indexOf('Authorization') > -1) {
        ctx.status = 200
        ctx.body = Result.needLogin()
      } else {
        ctx.status = error.status || 500
        if (error.status === 401) ctx.status = 200
        ctx.body = Result.needLogin(error?.message)
      }
    }
    errLogger.error(`${url} ${method}`, error)
    errLogger.info(
      '\n---------------\nrequest\n',
      JSON.stringify(ctx.request.body),
      '\n---------------\nresponse\n',
      JSON.stringify(ctx.body),
      '\n---------------',
    )
  }
  logger.info(`---> ${host} ${url} ${method} ${+new Date() - pre}ms`)
}
