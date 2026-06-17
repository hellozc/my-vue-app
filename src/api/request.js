import axios from 'axios'
import { ElMessage } from 'element-plus'
import { apiConfig } from '@/config/api'

const redirectToLogin = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

class HttpRequest {
  constructor() {
    this.instance = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    this.setupInterceptors()
  }

  setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => {
        const res = response.data

        if (res === null || typeof res !== 'object' || !('code' in res)) {
          return res
        }

        const { code, message, data } = res

        if (code === 401) {
          redirectToLogin()
          ElMessage.error(message || '登录已过期，请重新登录')
          return Promise.reject(new Error(message || '未授权'))
        }

        if (code === apiConfig.successCode) return data

        ElMessage.error(message || '请求失败')
        return Promise.reject(new Error(message || '请求失败'))
      },
      (error) => {
        const status = error.response?.status
        const message =
          error.response?.data?.message ||
          error.message ||
          '网络错误'

        if (status === 401) {
          redirectToLogin()
        }

        ElMessage.error(message)
        return Promise.reject(error)
      }
    )
  }

  get(url, config) {
    return this.instance.get(url, config)
  }

  post(url, data, config) {
    return this.instance.post(url, data, config)
  }

  put(url, data, config) {
    return this.instance.put(url, data, config)
  }

  delete(url, config) {
    return this.instance.delete(url, config)
  }

  request(config) {
    return this.instance.request(config)
  }
}

const http = new HttpRequest()

export default http
