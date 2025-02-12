import * as z from "zod"
import { Completearticle, RelatedarticleModel, Completerole, RelatedroleModel } from "./index"

export const userModel = z.object({
  id: z.number().int(),
  name: z.string(),
  password: z.string(),
  roleId: z.number().int(),
})

export interface Completeuser extends z.infer<typeof userModel> {
  articles: Completearticle[]
  role: Completerole
}

/**
 * RelateduserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelateduserModel: z.ZodSchema<Completeuser> = z.lazy(() => userModel.extend({
  articles: RelatedarticleModel.array(),
  role: RelatedroleModel,
}))
