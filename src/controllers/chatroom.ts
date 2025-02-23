import { getRouterConfig } from '../utils'
import service from '../services/chatroom'
import { Context } from 'koa'
import Result from '../common/Result'

const routeConfig = getRouterConfig({
  path: '/api/chatroom',
  tags: ['用户'],
})

export class ChatRoomController {
  @routeConfig({
    path: '/list',
    method: 'post',
  })
  async getList(ctx: Context) {
    try {
      let data = await service.getList()
      ctx.body = Result.success(data)
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }
}
