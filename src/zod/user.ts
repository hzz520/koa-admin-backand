import * as z from 'zod'
import {
  Completearticle,
  RelatedarticleModel,
  Completerole,
  RelatedroleModel,
  Completeform,
  RelatedformModel,
  Completemessage,
  RelatedmessageModel,
  CompleteuserRooms,
  RelateduserRoomsModel,
} from './index'

export const userModel = z.object({
  id: z.number().int(),
  name: z.string(),
  password: z.string(),
  roleId: z.number().int(),
  createAt: z.date(),
  updateAt: z.date(),
})

export interface Completeuser extends z.infer<typeof userModel> {
  articles: Completearticle[]
  role: Completerole
  form: Completeform[]
  messages: Completemessage[]
  rooms: CompleteuserRooms[]
}

/**
 * RelateduserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelateduserModel: z.ZodSchema<Completeuser> = z.lazy(() =>
  userModel.extend({
    articles: RelatedarticleModel.array(),
    role: RelatedroleModel,
    form: RelatedformModel.array(),
    messages: RelatedmessageModel.array(),
    rooms: RelateduserRoomsModel.array(),
  }),
)
