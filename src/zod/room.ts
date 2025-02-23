import * as z from 'zod'
import {
  CompleteuserRooms,
  RelateduserRoomsModel,
  Completemessage,
  RelatedmessageModel,
} from './index'

export const roomModel = z.object({
  id: z.number().int(),
  muiltple: z.number().int(),
  name: z.string(),
  createAt: z.date(),
  updateAt: z.date(),
})

export interface Completeroom extends z.infer<typeof roomModel> {
  users: CompleteuserRooms[]
  messages: Completemessage[]
}

/**
 * RelatedroomModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedroomModel: z.ZodSchema<Completeroom> = z.lazy(() =>
  roomModel.extend({
    users: RelateduserRoomsModel.array(),
    messages: RelatedmessageModel.array(),
  }),
)
