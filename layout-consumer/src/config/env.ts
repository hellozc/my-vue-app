const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()
const apiTarget = (import.meta.env.VITE_API_TARGET || 'http://localhost:8080')
  .trim()
  .replace(/\/$/, '')

function joinUrl(base: string, path: string) {
  const normalizedBase = base.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

function resolveApiBaseUrl() {
  // #ifdef H5
  return configuredBaseUrl || '/api'
  // #endif

  // #ifndef H5
  // 小程序 / App 不支持相对路径，/api 需拼成完整 URL
  if (/^https?:\/\//i.test(configuredBaseUrl)) {
    return configuredBaseUrl.replace(/\/$/, '')
  }
  if (configuredBaseUrl.startsWith('/')) {
    return joinUrl(apiTarget, configuredBaseUrl)
  }
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '')
  }
  return joinUrl(apiTarget, '/api')
  // #endif
}

function resolveApiOrigin(apiBaseUrl: string) {
  if (/^https?:\/\//i.test(apiBaseUrl)) {
    return apiBaseUrl.replace(/\/api\/?$/, '')
  }
  // #ifdef H5
  const target = (import.meta.env.VITE_API_TARGET || 'http://localhost:8080').trim().replace(/\/$/, '')
  return target
  // #endif
  return apiTarget
}

const apiBaseUrl = resolveApiBaseUrl()
const layoutCode = import.meta.env.VITE_LAYOUT_CODE || 'demo-home'

export const appConfig = {
  apiBaseUrl,
  /** 静态资源根地址（如 /uploads），小程序端拼完整 URL 用 */
  apiOrigin: resolveApiOrigin(apiBaseUrl),
  layoutCode,
  requestTimeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  successCode: Number(import.meta.env.VITE_API_SUCCESS_CODE || 200),
}
