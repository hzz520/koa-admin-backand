import { SwaggerRouter } from 'koa-swagger-decorator'
import config from '../config/index'

import * as Controllers from '../controllers/index'

const router = new SwaggerRouter({
  spec: {
    info: {
      title: '前端node服务',
      description: 'API文档',
      version: '1.0.0',
      termsOfService: config.TERMSOFSERVICE,
      contact: {
        name: '黄忠贞',
        email: '1013452861@qq.com',
        url: 'https://github.com/hzz520',
      },
    },
    servers: [
      {
        url: config.TERMSOFSERVICE,
      },
    ],
    openapi: '3.0.1',
  },
  swaggerHtmlEndpoint: '/swagger-ui',
  swaggerJsonEndpoint: '/swagger-ui/index.json',
})

router.swagger()

Object.values(Controllers).forEach((controller) => {
  router.applyRoute(controller)
})

export default router
