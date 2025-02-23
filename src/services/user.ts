import { prisma } from '../config'
import { Prisma } from '@prisma/client'
import { z } from 'koa-swagger-decorator'
import {
  CHANGE_USER_PWD_BODY_DTO,
  DEL_BODY_DTO,
  LIST_BODY_DTO,
  USER_ADD_BODY_DTO,
  USER_LOGIN_BODY_DTO,
  USER_REG_BODY_DTO,
  USER_UPDATEPWD_BODY_DTO,
} from '../dto/user'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

class UserService {
  genPwd(password) {
    return crypto.createHmac('md5', 'pwd').update(password).digest('hex')
  }
  async getList({
    name,
    role,
    createAt,
    updateAt,
    page = 1,
    pageSize = 10,
  }: z.infer<typeof LIST_BODY_DTO>) {
    let where = {
      name: {
        contains: name,
      },
      role: {
        name: {
          contains: role,
        },
      },
      createAt: {
        gte: createAt?.[0],
        lte: createAt?.[1],
      },
      updateAt: {
        gte: updateAt?.[0],
        lte: updateAt?.[1],
      },
    } as Prisma.userWhereInput

    const total = await prisma.user.count({ where })
    const list = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        password: true,
        role: true,
        createAt: true,
        updateAt: true,
      },
      where,
      orderBy: {
        updateAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return {
      total,
      list,
    }
  }
  async login({ name, password }: z.infer<typeof USER_LOGIN_BODY_DTO>) {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        password: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      where: {
        name: { equals: name },
        password: { equals: this.genPwd(password) },
      },
    })

    if (user) {
      return user
    }

    return Promise.reject('用户名或者密码错误')
  }

  async getUser({ name }: { name: string }) {
    const user = await prisma.user.findFirst({
      where: {
        name: { equals: name },
      },
    })

    if (user) {
      return Promise.reject('用户已存在')
    }

    return Promise.resolve()
  }

  async registry({ name, password }: z.infer<typeof USER_REG_BODY_DTO>) {
    return this.getUser({ name }).then(() => {
      return prisma.user.create({
        data: {
          name,
          password: this.genPwd(password),
          roleId: 4,
        },
      })
    })
  }

  async changePwd({
    name,
    password,
    newPassword,
  }: z.infer<typeof CHANGE_USER_PWD_BODY_DTO>) {
    return this.login({ name, password }).then((user) => {
      if (user.role.code === 'superAdmin') {
        return Promise.reject('超级管理员密码不允许变更')
      }
      return prisma.user.update({
        where: { id: user.id },
        data: { name, password: this.genPwd(newPassword) },
      })
    })
  }

  async getUserByToken(authorization) {
    const [part1, part2] = authorization.split(' ')
    let user, instance
    if (part1 === 'Bearer') {
      user = (jwt.decode(part2, { complete: true }) ?? {}).payload
    }
    if (user) {
      instance = await prisma.user.findFirst({
        select: {
          name: true,
          id: true,
          role: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        where: {
          name: { equals: user['name'] },
          password: { equals: user['password'] },
        },
      })
    }

    return instance
  }

  async add({ name, password, roleId, id }: z.infer<typeof USER_ADD_BODY_DTO>) {
    if (id) {
      await prisma.user.update({
        select: {
          roleId: !!roleId,
          password: !!password,
        },
        where: { id },
        data: {
          roleId,
          ...(password ? { password: this.genPwd(password) } : {}),
        },
      })
    } else {
      await this.getUser({ name })
      await prisma.user.create({
        data: {
          name,
          password: this.genPwd(password),
          roleId,
        },
      })
    }
  }

  async updatePwd({ password, id }: z.infer<typeof USER_UPDATEPWD_BODY_DTO>) {
    await prisma.user.update({
      where: { id },
      data: { password: this.genPwd(password) },
    })
  }

  async del({ id }: z.infer<typeof DEL_BODY_DTO>) {
    const { role } =
      (await prisma.user.findFirst({
        where: { id },
        select: { role: true },
      })) || {}
    if (role?.code && role?.code === 'superAdmin')
      return Promise.reject('超级管理员角色的用户不能删除')
    await prisma.user.delete({ where: { id } })
  }
}

export default new UserService()
