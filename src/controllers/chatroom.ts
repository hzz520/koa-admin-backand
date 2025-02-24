import { getRouterConfig } from '../utils'
import service from '../services/chatroom'
import { Context } from 'koa'
import Result from '../common/Result'
import { EDIT_REQ_DTO, GET_LIST_REQ_DTO } from '../dto/chatroom'
import { body, z } from 'koa-swagger-decorator'

const routeConfig = getRouterConfig({
  path: '/api/chatroom',
  tags: ['用户'],
})

export class ChatRoomController {
  @routeConfig({
    path: '/list',
    method: 'post',
  })
  @body(GET_LIST_REQ_DTO)
  async getList(ctx: Context) {
    try {
      let data = await service.getList(
        ctx.request.body as z.infer<typeof GET_LIST_REQ_DTO>,
      )
      ctx.body = Result.success(data)
    } catch (error) {
      ctx.body = Result.customFailed(error)
    }
  }

  @routeConfig({
    path: '/edit',
    method: 'post',
  })
  @body(EDIT_REQ_DTO)
  async edit(ctx: Context) {
    try {
      await service.edit(ctx.request.body as z.infer<typeof EDIT_REQ_DTO>)
      ctx.body = Result.success()
    } catch (error) {
      console.log('error', error)
      ctx.body = Result.customFailed(error)
    }
  }
}
