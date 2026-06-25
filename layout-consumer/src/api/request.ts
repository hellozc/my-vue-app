import { appConfig } from '@/config/env'
import { clearMemberToken, getMemberToken } from '@/utils/memberToken'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export async function request<T>(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: UniApp.RequestOptions['data']
  auth?: boolean
}): Promise<T> {
  const { url, method = 'GET', data, auth = true } = options

  const hasBody = data !== undefined && data !== null && method !== 'GET'
  const headers: Record<string, string> = {}
  if (hasBody) headers['Content-Type'] = 'application/json'

  const token = auth ? getMemberToken() : ''
  if (token) headers.Authorization = `Bearer ${token}`

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${appConfig.apiBaseUrl}${url}`,
      method,
      data,
      timeout: appConfig.requestTimeout,
      header: headers,
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
        if (body.code === 401 && auth) {
          clearMemberToken()
        }
        reject(new Error(body.message || '请求失败'))
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络错误'))
      },
    })
  })
}
