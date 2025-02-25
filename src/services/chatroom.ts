import { Socket, Server } from 'socket.io'
import { prisma } from '../config'
import { Prisma } from '@prisma/client'
import { GET_LIST_REQ_DTO, EDIT_REQ_DTO } from '../dto/chatroom'
import { z } from 'koa-swagger-decorator'
import { io } from '../app'

export type SOCKET_TYPE = Socket & {
  decoded_token: {
    [key: string]: any
  }
}

export class ChatRoomService {
  socket?: SOCKET_TYPE
  io?: Server
  constructor(socket?: SOCKET_TYPE, io?: Server) {
    if (socket && io) {
      this.socket = socket
      this.io = io
    }
  }
  async findRoom({ roomId }) {
    if (!+roomId) return null
    return await prisma.room.findUnique({
      select: {
        id: true,
        name: true,
        users: true,
      },
      where: {
        id: +roomId,
      },
    })
  }
  async getRoomInfo({ roomId }) {
    if (!+roomId) return null
    return await prisma.room.findUnique({
      select: {
        id: true,
        name: true,
        users: {
          orderBy: {
            updateAt: 'asc',
          },
        },
        messages: {
          select: {
            id: true,
            message: true,
            updateAt: true,
            user: true,
            userId: true,
            system: true,
          },
          orderBy: {
            updateAt: 'asc',
          },
        },
      },
      where: {
        id: +roomId,
      },
    })
  }
  async join() {
    const roomId = this.socket?.request.headers.roomid as string
    if (!roomId) return

    let userId = this.socket?.decoded_token.id
    const room = await this.findRoom({ roomId })
    if (!room) return

    if (!room?.users?.some?.((item) => item.userId === userId)) {
      let message = `欢迎 ${this.socket?.decoded_token.name} 加入 ${room?.name}`
      await prisma.$transaction([
        prisma.userRooms.create({
          data: {
            roomId: room.id,
            userId,
          },
        }),
        prisma.message.create({
          data: {
            roomId: +room.id,
            system: 1,
            message,
          },
        }),
      ])
    }
    let data = await this.getRoomInfo({ roomId })

    this.socket?.join(roomId)
    this.io?.to(roomId)?.emit?.('join', data)
  }

  async message({ message }) {
    const roomId = this.socket?.request.headers.roomid
    const room = await this.findRoom({ roomId })
    if (room) {
      await prisma.$transaction([
        prisma.message.create({
          data: {
            roomId: +room.id,
            message,
            system: 0,
            userId: this.socket?.decoded_token.id,
          },
        }),
      ])
      let data = await this.getRoomInfo({ roomId })
      this.socket?.join(`${roomId}`)
      this.io?.to(`${roomId}`)?.emit('message', data)
    }
  }

  async getList({ page = 1, pageSize = 10 }: z.infer<typeof GET_LIST_REQ_DTO>) {
    let where = {} as Prisma.roomWhereInput
    const total = await prisma.room.count({
      where,
    })
    const list = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        updateAt: true,
        createAt: true,
        users: {
          select: {
            userId: true,
            user: true,
          },
        },
      },
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        updateAt: 'desc',
      },
    })

    return {
      list,
      total,
    }
  }

  async edit({ id, name, users }: z.infer<typeof EDIT_REQ_DTO>) {
    if (!id) {
      await prisma.room
        .create({
          select: {
            name: true,
            id: true,
            users: {
              select: {
                userId: true,
                user: true,
              },
            },
          },
          data: {
            name,
            muiltple: 1,
            users: {
              createMany: {
                data: users.map((userId) => {
                  return {
                    userId,
                  }
                }),
              },
            },
          },
        })
        .then(async (data) => {
          let users = data.users.map((item) => item.user)
          await prisma.message.createMany({
            data: users.map((user) => {
              return {
                roomId: data.id,
                system: 1,
                message: `欢迎 ${user.name} 加入 ${data.name}`,
              }
            }),
          })
          let cData = await this.getRoomInfo({ roomId: data.id })
          io.to(`${data.id}`).emit('message', cData)
        })
    } else {
      const detail = await prisma.room.findFirst({
        select: {
          name: true,
          users: {
            select: {
              userId: true,
            },
          },
        },
        where: {
          id,
        },
      })
      if (!detail) return Promise.reject('聊天室不存在')
      let curUsers = detail?.users.map((item) => item.userId)
      let delUsers = curUsers?.filter((userId) => !users.includes(userId))
      let addUsers = users?.filter((userId) => !curUsers?.includes(userId))

      await prisma
        .$transaction([
          prisma.user.findMany({
            where: {
              id: {
                in: addUsers,
              },
            },
          }),
          prisma.user.findMany({
            where: {
              id: {
                in: delUsers,
              },
            },
          }),
        ])
        .then(async ([addUsers, delUsers]) => {
          await prisma.$transaction([
            prisma.room.update({
              where: {
                id,
              },
              data: {
                name,
                users: {
                  deleteMany: {
                    roomId: {
                      equals: id,
                    },
                  },
                  createMany: {
                    data: users.map((userId) => {
                      return {
                        userId,
                      }
                    }),
                  },
                },
              },
            }),
            prisma.message.createMany({
              data: [
                ...delUsers.map((item) => {
                  return {
                    message: `${item.name} 退出了 ${name}`,
                    system: 1,
                    roomId: id,
                  }
                }),
                ...addUsers.map((item) => {
                  return {
                    message: `欢迎 ${item.name} 加入 ${name}`,
                    system: 1,
                    roomId: id,
                  }
                }),
              ],
            }),
          ])

          await io
            .to(`${id}`)
            .fetchSockets()
            .then(async (sockets) => {
              return Promise.all(
                sockets.map(async (socket) => {
                  let userId = (socket as unknown as SOCKET_TYPE).decoded_token
                    .id
                  if (delUsers.some((item) => item.id === +userId)) {
                    await socket.leave(`${id}`)
                  }
                }),
              )
            })

          let cData = await this.getRoomInfo({ roomId: id })
          io.to(`${id}`).emit('message', cData)
        })
    }
  }
}

export default new ChatRoomService()
