import { prisma } from '../config'
import { Prisma } from '@prisma/client'
import { z } from 'koa-swagger-decorator'
import { DEL_REQ_DTO, DETAIL_REQ_DTO, DETAIL_VERSIONID_REQ_DTO, EDIT_REQ_DTO, GETLIST_REQ_DTO } from '../dto/form'
import { randomUUID } from 'crypto'

class DynimicFormService {
  async getList({
    name,
    author,
    categoryIds,
    createAt,
    updateAt,
    page = 1,
    pageSize = 10,
  }: z.infer<typeof GETLIST_REQ_DTO>) {
    let where = {
      name: {
        contains: name,
      },
      author: {
        name: {
          contains: author,
        },
      },
      categoryId: categoryIds?.length ? {
        in: categoryIds
      } : {},
      createAt: {
        gte: createAt?.[0],
        lte: createAt?.[1],
      },
      updateAt: {
        gte: updateAt?.[0],
        lte: updateAt?.[1],
      }
    } as Prisma.formWhereInput

    const { length: total } = await prisma.form.groupBy({ 
      where, 
      by: ['id'],
    })
    const list = await prisma.form.findMany({
      select: {
        id: true,
        name: true,
        // config: true,
        // extConfig: true,
        authorId: true,
        author: {
          select: {
            name: true,
            id: true,
            role: {
              select: {
                id: true,
                name: true,
                code: true,
              }
            }
          },
        },
        categoryId: true,
        category: {
          select: {
            code: true,
            name: true,
            id: true,
          }
        },
        createAt: true,
        updateAt: true,
        versionId: true,
      },
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: {
        updateAt: 'desc'
      },
      distinct: ['id'],
    })
    return {
      total,
      list
    }
  }

  async copy({ versionId }: z.infer<typeof DETAIL_VERSIONID_REQ_DTO>) {
    let detail = await this.detailVersionId({ versionId })
    if (detail) {
      const { name, categoryId, authorId, config  } = detail

      await prisma.form.create({
        data: {
          id: randomUUID().replace(/-/g, ''),
          name,
          config,
          authorId,
          categoryId,
          extConfig: null,
          versionId: randomUUID().replace(/-/g, ''),
        }
      })
    }
  }

  async getVersionsById({ id }: z.infer<typeof DETAIL_REQ_DTO>) {
    let where = {
      id: {
        equals: id
      }
    } as Prisma.formWhereInput
    let total = await prisma.form.count({ where })
    let list = await prisma.form.findMany({
      select: {
        id: true,
        name: true,
        categoryId: true,
        category: {
          select: {
            code: true,
            name: true
          }
        },
        config: true,
        extConfig: true,
        authorId: true,
        author: {
          select: {
            name: true,
            id: true,
            role: {
              select: {
                name: true,
                code: true,
                id: true
              }
            }
          }
        },
        versionId: true,
        createAt: true,
        updateAt: true,
      },
      where: {
        id: {
          equals: id
        }
      },
      orderBy: {
        updateAt: 'desc'
      }
    })

    return {
      list,
      total
    }
  }

  async detail({ id }: z.infer<typeof DETAIL_REQ_DTO>) {
    return await prisma.form.findFirst({
      where: {
        id
      },
      orderBy: {
        updateAt: 'desc'
      }
    })
  }

  async detailVersionId({ versionId }: z.infer<typeof DETAIL_VERSIONID_REQ_DTO>) {
    return await prisma.form.findUnique({
      where: {
        versionId
      }
    })
  }

  async edit({
    id,
    name,
    config,
    extConfig,
    authorId,
    categoryId
  }: z.infer<typeof EDIT_REQ_DTO> & { authorId: number }) {
    await prisma.form.create({
      data: {
        id: id ? id : randomUUID().replace(/-/g, ''),
        name,
        config,
        authorId,
        categoryId,
        extConfig,
        versionId: randomUUID().replace(/-/g, ''),
      }
    })
  }
   
  async del({ id }: z.infer<typeof DETAIL_REQ_DTO>) {
    await prisma.form.deleteMany({
      where: {
        id: {
          equals: id
        }
      }
    })
  }

  async delByVersionId({ versionId }: z.infer<typeof DEL_REQ_DTO>) {
    await prisma.form.delete({
      where: {
        versionId
      }
    })
  }
}

export default new DynimicFormService();