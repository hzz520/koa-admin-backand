/*
 * @FilePath: /koa-decoration-demo/src/app.ts
 * @Author: hzz
 * @Date: 2024-11-14 16:04:41
 * @LastEditors: hzz
 * @LastEditTime: 2024-11-18 21:55:47
 * Copyright: 2024 杭州贝康科技有限公司 All Rights Reserved.
 * @Descripttion: 首页
 */
import Koa, { Context } from 'koa'
import cors from '@koa/cors'
import bodyParser from '@koa/bodyparser'
import staticServe from 'koa-static'
import jwt from 'koa-jwt'

import config, { prisma } from './config/index'
import { getLocalIP } from './utils'
import Result from './common/Result'
import router from './routes'
import { loggerMiddleware } from './middlewares/logger'
import { Logger } from 'log4js'
import path from 'path'
import { jwtMiddleware } from './middlewares/jwt'

const { port, isProd, isLocal } = config
console.log('isProd: ', isProd)
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export const unlessCfg = {
  path: ['/api/user/login', '/api/user/registry', '/api/user/changPwd'],
  custom: (ctx) => {
    return !ctx.request.path.startsWith('/api')
  },
}

const app = new Koa<{
  file: File
  files: File[]
  fields: { [key: string]: any }
  logger: Logger
  errLogger: Logger
}>()
app.use((ctx: Context, next) => {
  ctx.config = config
  ctx.prisma = prisma
  return next()
})
app.use(cors())
app.use(bodyParser())
app.use(loggerMiddleware)
app.use(
  jwt({
    secret: config.jwt.secret,
    tokenKey: 'authorization',
    key: 'secret',
  }).unless(unlessCfg),
)
app.use(jwtMiddleware)

app.use(staticServe(path.resolve(__dirname, '../public')))

app.use(router.routes())
app.use(router.allowedMethods())

app.use((ctx) => {
  if (ctx.request.path === '/v3/api-docs/swagger-config') {
    ctx.body = {
      urls: [
        {
          name: '2.X版本',
          url: `/swagger-ui/index.json`,
          swaggerVersion: '3.0',
          location: `/swagger-ui/index.json`,
        },
      ],
    }
    return
  }
  ctx.body = Result.notFound()
})

app.listen(port)

if (isLocal) {
  console.log(`\nenter rs to resatrt\n`)
}
console.log(`app is listen port: http://${getLocalIP()}:${port}`)
