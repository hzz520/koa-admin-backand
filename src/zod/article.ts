import * as z from "zod"
import { Completeuser, RelateduserModel } from "./index"

export const articleModel = z.object({
  id: z.number().int(),
  url: z.string(),
  osskey: z.string(),
  title: z.string(),
  authorId: z.number().int(),
  createAt: z.date(),
  updateAt: z.date(),
})

export interface Completearticle extends z.infer<typeof articleModel> {
  author: Completeuser
}

/**
 * RelatedarticleModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedarticleModel: z.ZodSchema<Completearticle> = z.lazy(() => articleModel.extend({
  author: RelateduserModel,
}))
