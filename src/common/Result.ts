import ResultCode from './Response'

class Result {
  code
  msg
  data

  constructor(code, msg, data) {
    this.code = code
    this.msg = msg
    this.data = data
  }

  static success(data?: any) {
    return new Result(ResultCode.SUCCESS.code, ResultCode.SUCCESS.msg, data)
  }

  static failed() {
    return new Result(ResultCode.FAILED.code, ResultCode.FAILED.msg, {})
  }

  static customFailed(msg) {
    return new Result(ResultCode.CUSTOM_FAILED.code, msg, {})
  }

  static needLogin(msg?: string) {
    return {
      ...ResultCode.NEEDLOGIN,
      ...(msg ? { msg } : {}),
    }
  }

  static notFound() {
    return new Result(ResultCode.NOT_FOUND.code, ResultCode.NOT_FOUND.msg, {})
  }
}

export default Result
