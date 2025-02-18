import { PrismaClient } from '@prisma/client'
import * as dev from './env-dev'
import * as pre from './env-pre'
import * as prod from './env-prod'

console.log('process.env.NODE_ENV', process.env.NODE_ENV)

const env = process.env.NODE_ENV as
  | 'local'
  | 'development'
  | 'pre'
  | 'production'
const MAP = {
  local: dev,
  development: dev,
  pre: pre,
  production: prod,
}

const PORT = {
  local: 82,
  development: 82,
  pre: 82,
  production: 82,
}

export const SUCCESS_CODE = '00000'
export const prot = PORT[env]
export const isProd = env === 'production'
const isLocal = env === 'local'
export const prisma = new PrismaClient()
const obj = MAP[(env as 'development') || 'production']

export default {
  ...obj,
  TERMSOFSERVICE: isLocal ? 'http://localhost:82' : obj.TERMSOFSERVICE,
  SUCCESS_CODE,
  port: PORT[env],
  isProd,
  isLocal,
  jwt: {
    secret: 'node-jwt',
  },
  redis: {
    url: 'redis://fe_cloud:ab2cfb92-5596-4ca1-96b3-d274f1b17d1e@127.0.0.1:6379',
  }
}
