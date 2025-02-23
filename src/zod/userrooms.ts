import * as z from 'zod'
import {
  Completeuser,
  RelateduserModel,
  Completeroom,
  RelatedroomModel,
} from './index'

export const userRoomsModel = z.object({
  userId: z.number().int(),
  roomId: z.number().int(),
  createAt: z.date(),
  updateAt: z.date(),
})

export interface CompleteuserRooms extends z.infer<typeof userRoomsModel> {
  user: Completeuser
  room: Completeroom
}

/**
 * RelateduserRoomsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelateduserRoomsModel: z.ZodSchema<CompleteuserRooms> = z.lazy(
  () =>
    userRoomsModel.extend({
      user: RelateduserModel,
      room: RelatedroomModel,
    }),
)
