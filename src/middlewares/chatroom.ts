import { Socket } from 'socket.io'
import { ChatRoomService } from '../services/chatroom'

export default (io) => {
  io.on(
    'connection',
    (
      socket: Socket & {
        decoded_token: {
          [key: string]: any
        }
      },
    ) => {
      const service = new ChatRoomService(socket, io)
      socket.on('join', () => {
        try {
          service.join()
        } catch (error) {
          console.error('ws join', error)
        }
      })
      socket.on('message', (data) => {
        try {
          service.message({ message: data.message })
        } catch (error) {
          console.error('ws message', error)
        }
      })
      socket.on('disconnect', async () => {
        let roomId = socket.request.headers.roomId as string
        socket.leave(roomId)
        socket.disconnect()
      })
    },
  )
}
