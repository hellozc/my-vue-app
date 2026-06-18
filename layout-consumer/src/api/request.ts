import { appConfig } from '@/config/env'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export async function request<T>(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: unknown
}): Promise<T> {
  const { url, method = 'GET', data } = options

  const hasBody = data !== undefined && data !== null && method !== 'GET'

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${appConfig.apiBaseUrl}${url}`,
      method,
      data,
      timeout: appConfig.requestTimeout,
      header: hasBody ? { 'Content-Type': 'application/json' } : {},
      success: (res) => {
        const body = res.data as ApiResponse<T>
        if (!body || typeof body !== 'object' || !('code' in body)) {
          reject(new Error('接口响应格式异常'))
          return
        }
        if (body.code === appConfig.successCode) {
          resolve(body.data)
          return
        }
        reject(new Error(body.message || '请求失败'))
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络错误'))
      },
    })
  })
}
