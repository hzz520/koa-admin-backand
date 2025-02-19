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
import { createClient, RedisClientType } from 'redis'

import config, { prisma } from './config/index'
import { getLocalIP } from './utils'
import Result from './common/Result'
import router from './routes'
import { loggerMiddleware } from './middlewares/logger'
import { Logger } from 'log4js'
import path from 'path'

const { port, isProd, isLocal } = config
console.log('isProd: ', isProd)
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

var context: Partial<{
  redis: RedisClientType<any, any, any>
}> = {}

export const unlessCfg = {
  path: [
    '/api/user/login',
    '/api/user/registry',
    '/api/user/changPwd',
    '/api/user/logout',
  ],
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
app.use(async (ctx: Context, next) => {
  ctx.config = config
  ctx.prisma = prisma
  try {
    const redis = await createClient({
      url: config.redis.url,
    })
      .on('error', (err) => {
        console.log('Redis Client Error', err)
      })
      .connect()
    ctx.redis = redis
    context.redis = redis
  } catch (error) {
    ctx.body = Result.customFailed(error)
    return
  }
  await next()
})
app.use(cors())
app.use(bodyParser())
app.use(loggerMiddleware)
app.use(
  jwt({
    secret: config.jwt.secret,
    tokenKey: 'authorization',
    key: 'secret',
    isRevoked: async (ctx: Context, user, token) => {
      if (ctx.request.path === '/api/user/logout') {
        ctx.redis.del(`jwt_${user['name']}`)
        return false
      }
      const cToken = await ctx.redis.get(`jwt_${user['name']}`)

      if (cToken !== token) {
        ctx.body = Result.needLogin('登录失效')
        return true
      }

      let instance = await prisma.user.findFirst({
        select: {
          id: true,
          name: true,
          password: true,
          roleId: true,
          role: true,
        },
        where: {
          name: { equals: user['name'] },
          password: { equals: user['password'] },
        },
      })

      if (instance) {
        ctx.state.user = instance
        ctx.logger.info('jwt', instance)
        return false
      }

      return false
    },
    debug: true,
  }).unless(unlessCfg),
)

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
