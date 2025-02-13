import { Context } from 'koa'
import { prisma } from '../config'
import {  } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { unlessCfg } from '../app'
import Result from '../common/Result'
import { PrismaClientInitializationError } from '@prisma/client/runtime/library'

export const jwtMiddleware = async (ctx: Context, next) => {
  try {
    if (!unlessCfg.path.includes(ctx.request.path) && !unlessCfg.custom(ctx)) {
      let { authorization = '' } = ctx.headers
      const [part1, part2] = authorization.split(' ')
      let user, instance
      if (part1 === 'Bearer') {
        user = jwt.decode(part2, { complete: true, json: true })?.payload
      }
      if (user) {
        instance = await prisma.user.findFirst({
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
        }).catch(() => {
          return 
        })
        if (!instance) {
          ctx.body = Result.needLogin('用户不存在')
          return
        }
      }

      ctx.state.user = instance
    }
    await next()
  } catch (error: any) {
    console.log('error', error)
    if (error instanceof PrismaClientInitializationError) {
      ctx.body = Result.needLogin(error?.message)
    } else {
      ctx.body = Result.customFailed(error?.message)
    }
    
  }
}
