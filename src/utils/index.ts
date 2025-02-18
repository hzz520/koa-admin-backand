import os from 'os'
import { routeConfig } from 'koa-swagger-decorator'
import { RouteConfig } from '@asteasolutions/zod-to-openapi'

export function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name in interfaces) {
    for (const item of (interfaces as any)[name]) {
      const { address, family, internal } = item
      if (family === 'IPv4' && !internal) {
        return address
      }
    }
  }
  return null
}

export function getRouterConfig(config: Partial<RouteConfig>) {
  return function (cfg: Partial<RouteConfig>) {
    let { path: configPath } = config
    let { path: cfgPath } = cfg
    return routeConfig({
      ...config,
      ...cfg,
      request: {
        ...config.request,
        ...cfg.request,
      },
      path: `${configPath || ''}/${cfgPath}`.replace(/\/\//g, '/'),
    } as any)
  }
}
