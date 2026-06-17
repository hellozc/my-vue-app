/**
 * API 环境配置
 * VITE_USE_MOCK=true   → 走 mock 模拟数据
 * VITE_USE_MOCK=false  → 走真实后端联调（需配置 VITE_API_TARGET）
 */
export const apiConfig = {
  /** 是否启用 mock */
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  /** 请求基础路径 */
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  /** 请求超时（ms） */
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  /** 联调后端地址（仅开发环境 vite proxy 使用） */
  target: import.meta.env.VITE_API_TARGET || 'http://localhost:8080',
  /** 转发时是否去掉 /api 前缀 */
  stripPrefix: import.meta.env.VITE_API_STRIP_PREFIX === 'true',
  /** 业务成功状态码 */
  successCode: Number(import.meta.env.VITE_API_SUCCESS_CODE) || 200,
}

export function logApiMode() {
  if (!import.meta.env.DEV) return
  if (apiConfig.useMock) {
    console.info('[API] 当前模式: Mock 模拟数据')
  } else {
    console.info('[API] 当前模式: 联调真实接口 →', apiConfig.target)
  }
}
