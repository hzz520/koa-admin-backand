import * as z from "zod"
import { Completeform, RelatedformModel } from "./index"

export const categoryModel = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  createAt: z.date(),
  updateAt: z.date(),
})

export interface Completecategory extends z.infer<typeof categoryModel> {
  form: Completeform[]
}

/**
 * RelatedcategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedcategoryModel: z.ZodSchema<Completecategory> = z.lazy(() => categoryModel.extend({
  form: RelatedformModel.array(),
}))
