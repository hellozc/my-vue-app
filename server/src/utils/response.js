/**
 * 统一响应格式，与前端 axios 封装约定一致
 */
export function success(data, message = 'success') {
  return {
    code: 200,
    message,
    data,
  }
}

export function fail(message = '请求失败', code = 500) {
  return {
    code,
    message,
    data: null,
  }
}
