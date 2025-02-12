class BaseResultCode {
  code
  msg

  constructor(code: string, msg?: string) {
    this.code = code
    this.msg = msg
  }

  static SUCCESS = new BaseResultCode('00000', '操作成功!')
  static NEEDLOGIN = new BaseResultCode('B0003', '登录失效!')

  static FAILED = new BaseResultCode('B0001', '系统错误!')
  static NOT_FOUND = new BaseResultCode('B0002', '404, Api Not Found!')

  static CUSTOM_FAILED = new BaseResultCode('C0001')
}

export default BaseResultCode
