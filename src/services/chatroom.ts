import { Socket, Server } from 'socket.io'
import { prisma } from '../config'
import { Prisma } from '@prisma/client'

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
      let message = `欢迎 ${this.socket?.decoded_token.name} 加入${room?.name}`
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

  async getList() {
    let where = {} as Prisma.roomWhereInput
    const total = await prisma.room.count({
      where,
    })
    const list = await prisma.room.findMany({
      where,
      orderBy: {
        updateAt: 'desc',
      },
    })

    return {
      list,
      total,
    }
  }
}

export default new ChatRoomService()
