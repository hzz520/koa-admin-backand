import COS from 'cos-nodejs-sdk-v5'
import path from 'path'
import fs from 'fs-extra'
import { z } from 'koa-swagger-decorator'
import { IMAGE_DEL_BODY_DTO } from '../dto/image'
import { randomUUID } from 'crypto'

const bucketInfo = {
  Bucket: 'asset-1306470651', // 替换为您的bucket名称
  Region: 'ap-shanghai', // 替换为您的region名称
}

const cos = new COS({
  SecretId: 'AKIDoVzJQJ0TijWB2g7Kerv083kE1rX8kBRT',
  SecretKey: 'sWw89xYwKblvurg6TefCYheOuFMGzKZo',
  Domain: `asset-1306470651.cos.ap-shanghai.myqcloud.com`, // 自定义加速域名
  Protocol: 'https:', // 请求协议： 'https:' 或 'http:'
})

class ImageService {
  async uploadBuffer({ bizCode, html, Key }): Promise<any> {
    const Body = Buffer.from(html, 'utf-8')
    return new Promise((resolve) => {
      if (Key) {
        return this.headObject(Key).catch(async () => {
          return true
        })
      } else {
        resolve(true)
      }
    }).then(() => {
      return new Promise((resolve, reject) => {
        if (!Key) {
          Key = `${bizCode}/${randomUUID()}.txt`
        }
        cos.putObject(
          {
            ...bucketInfo,
            Key,
            Body,
          },
          function (err, { Location }) {
            if (err) {
              console.log('上传失败')
              reject('上传失败')
            } else {
              resolve({
                url: `https://${Location}`,
                osskey: Key,
              })
            }
          },
        )
      })
    })
  }

  async upload({ file, bizCode }) {
    return new Promise<String>((resolve, reject) => {
      const filePath = path.resolve(
        __dirname,
        `../../uploads/article/${file.filename}`,
      )

      const params = {
        ...bucketInfo,
        Key: `${bizCode}/${file.originalname}`,
        FilePath: filePath, // 替换为您想要上传的本地文件路径
        Body: fs.readFileSync(filePath),
        Headers: {
          'Content-Disposition': 'inline;',
        },
      }

      cos.putObject(params, async function (err, { Location }) {
        if (err) {
          console.log('putObject Err ===>', err)
          reject('上传cos失败')
        } else {
          console.log('Location', Location)
          resolve(`https://${Location}`)
        }
        fs.unlinkSync(filePath)
      })
    })
  }

  async del({ filename, bizCode }: z.infer<typeof IMAGE_DEL_BODY_DTO>) {
    let Key = `${bizCode}/${filename}`
    return this.headObject(Key)
      .catch(async () => {
        return true
      })
      .then(() => {
        cos.deleteObject(
          {
            ...bucketInfo,
            Key,
          },
          function (err, data) {
            return new Promise((resolve, reject) => {
              console.log(err || data)
              if (err) {
                console.log('删除失败')
                reject('删除失败')
              } else {
                resolve(true)
              }
            })
          },
        )
      })
  }

  async headObject(Key) {
    return new Promise((resolve, reject) => {
      let msg = ''
      cos.headObject(
        {
          ...bucketInfo,
          Key,
        },
        function (err, data) {
          if (data) {
            resolve(true)
          } else if (err?.statusCode == 404) {
            msg = '对象不存在'
            console.log(msg)
            reject(msg)
          } else if (err?.statusCode == 403) {
            msg = '没有该对象读权限'
            console.log(msg)
            reject(msg)
          }
        },
      )
    })
  }

  async getBuffer(Key) {
    return this.headObject(Key).then(() => {
      return new Promise((resolve, reject) => {
        cos.getObject(
          {
            ...bucketInfo,
            Key,
          },
          (err, data) => {
            if (err) {
              reject('获取失败')
            } else {
              resolve(Buffer.from(data.Body).toString('utf-8'))
            }
          },
        )
      })
    })
  }
}

export default new ImageService()
