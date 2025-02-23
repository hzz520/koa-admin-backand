import * as z from 'zod'
import {
  Completeuser,
  RelateduserModel,
  Completeroom,
  RelatedroomModel,
} from './index'

export const messageModel = z.object({
  id: z.number().int(),
  message: z.string().nullish(),
  userId: z.number().int().nullish(),
  roomId: z.number().int(),
  createAt: z.date(),
  updateAt: z.date(),
  system: z.number().int(),
})

export interface Completemessage extends z.infer<typeof messageModel> {
  user?: Completeuser | null
  room: Completeroom
}

/**
 * RelatedmessageModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedmessageModel: z.ZodSchema<Completemessage> = z.lazy(() =>
  messageModel.extend({
    user: RelateduserModel.nullish(),
    room: RelatedroomModel,
  }),
)
