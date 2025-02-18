import * as z from "zod"
import { Completeuser, RelateduserModel, Completecategory, RelatedcategoryModel } from "./index"

export const formModel = z.object({
  id: z.string(),
  name: z.string(),
  config: z.string(),
  extConfig: z.string().nullish(),
  authorId: z.number().int(),
  categoryId: z.number().int().nullish(),
  createAt: z.date(),
  updateAt: z.date(),
  versionId: z.string(),
})

export interface Completeform extends z.infer<typeof formModel> {
  author: Completeuser
  category?: Completecategory | null
}

/**
 * RelatedformModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedformModel: z.ZodSchema<Completeform> = z.lazy(() => formModel.extend({
  author: RelateduserModel,
  category: RelatedcategoryModel.nullish(),
}))
