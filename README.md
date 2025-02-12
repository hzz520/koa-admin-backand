# koa

node中间层

## 启动端口
```javascript
const PORT = {
  development: 81,
  pre: 83,
  production: 82,
}
```

 
## 目录结构
1. app.js -- 入口文件
1. config -- 全局配置
1. common -- 底层公用方法
1. static -- 静态资源
1. uploads -- 上传临时文件，注意不要持久保存，即用即删
1. utils -- 提炼业务工具、方法等
1. routers -- 路由总入口
1. controllers -- 控制器层,处理接口请求和返回
1. services -- 服务层，业务处理

