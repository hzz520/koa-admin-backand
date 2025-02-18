import * as z from "zod"
import { Completeuser, RelateduserModel } from "./index"

export const roleModel = z.object({
  id: z.number().int(),
  name: z.string(),
  code: z.string(),
  createAt: z.date(),
  updateAt: z.date(),
})

export interface Completerole extends z.infer<typeof roleModel> {
  users: Completeuser[]
}

/**
 * RelatedroleModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedroleModel: z.ZodSchema<Completerole> = z.lazy(() => roleModel.extend({
  users: RelateduserModel.array(),
}))
