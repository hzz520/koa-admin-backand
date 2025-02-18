import { prisma } from '../config'
import { Prisma } from '@prisma/client'
import { z } from 'koa-swagger-decorator'
import { DETAIL_REQ_DTO, EDIT_REQ_DTO, GETLIST_REQ_DTO } from '../dto/article'
import ossService from './image'

class ArticleService {
  async getList({
    title,
    author,
    createAt,
    updateAt,
    page = 1,
    pageSize = 10,
  }: z.infer<typeof GETLIST_REQ_DTO>) {
    let where = {
      title: {
        contains: title,
      },
      author: {
        name: {
          contains: author,
        },
      },
      createAt: {
        gte: createAt?.[0],
        lte: createAt?.[1],
      },
      updateAt: {
        gte: updateAt?.[0],
        lte: updateAt?.[1],
      }
    } as Prisma.articleWhereInput

    const total = await prisma.article.count({
      where,
    })
    let list = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        createAt: true,
        updateAt: true,
      },
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: {
        updateAt: 'desc'
      },
    })

    return {
      page,
      pageSize,
      list,
      total,
    }
  }

  async edit({
    id,
    html,
    title,
    authorId,
  }: z.infer<typeof EDIT_REQ_DTO> & { authorId: number }) {
    if (id) {
      const data = await prisma.article.findFirst({
        where: { id: { equals: id } },
      })
      if (data) {
        ossService.del({
          bizCode: 'article',
          filename: data.osskey.replace('article/', ''),
        })
        ossService
          .uploadBuffer({
            Key: '',
            html,
            bizCode: 'article',
          })
          .then(async ({ url, osskey }: Prisma.articleUpdateInput) => {
            await prisma.article
              .update({ where: { id }, data: { url, osskey, title } })
              .catch(() => {
                ossService.del({
                  bizCode: 'article',
                  filename: (osskey as string).replace('article/', ''),
                })
              })
          })
      } else {
        return Promise.reject('该篇文章不存在')
      }
    } else {
      ossService
        .uploadBuffer({
          Key: '',
          html,
          bizCode: 'article',
        })
        .then(async ({ url, osskey }: Prisma.articleCreateInput) => {
          await prisma.article
            .create({ data: { url, osskey, title, authorId } })
            .catch(() => {
              ossService.del({
                bizCode: 'article',
                filename: (osskey || '').replace('article/', ''),
              })
            })
        })
    }
  }

  async getDetail({ id }: z.infer<typeof DETAIL_REQ_DTO>) {
    const data = await prisma.article.findFirst({
      where: { id: { equals: id } },
      select: { id: true, osskey: true, title: true, author: true, createAt: true, updateAt: true },
    })

    if (data) {
      const { id, osskey, title, author } = data
      const html = await ossService.getBuffer(osskey).catch(async () => {
        return ''
      })

      return {
        id,
        title,
        html,
        author,
      }
    }

    return Promise.reject('该篇文章不存在')
  }

  async del({ id }: z.infer<typeof DETAIL_REQ_DTO>) {
    const data = await prisma.article.findFirst({
      where: { id: { equals: id } },
      select: { id: true, osskey: true, title: true },
    })

    if (data) {
      await ossService
        .del({
          bizCode: 'article',
          filename: data.osskey.replace('article/', ''),
        })
        .then(async () => {
          await prisma.article.delete({ where: { id } })
        })
    } else {
      return Promise.reject('该篇文章不存在')
    }
  }
}

export default new ArticleService()
