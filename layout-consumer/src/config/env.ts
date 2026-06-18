const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

// H5 默认 /api（Vite 代理）；小程序/App 需配置完整地址
// #ifdef H5
const apiBaseUrl = configuredBaseUrl || '/api'
// #endif
// #ifndef H5
const apiBaseUrl = configuredBaseUrl || 'http://localhost:8080/api'
// #endif

const layoutCode = import.meta.env.VITE_LAYOUT_CODE || 'demo-home'

export const appConfig = {
  apiBaseUrl,
  layoutCode,
  requestTimeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  successCode: Number(import.meta.env.VITE_API_SUCCESS_CODE || 200),
}
