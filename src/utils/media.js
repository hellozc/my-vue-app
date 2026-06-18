import { apiConfig } from '@/config/api'

function resolveUploadsOrigin() {
  const base = apiConfig.baseURL || ''
  if (/^https?:\/\//i.test(base)) {
    return base.replace(/\/api\/?$/, '')
  }
  const target = apiConfig.target || ''
  if (/^https?:\/\//i.test(target)) {
    return target.replace(/\/$/, '')
  }
  return ''
}

/** 将后端返回的素材 URL 转为可访问地址 */
export function resolveMediaUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url

  if (url.startsWith('/')) {
    const origin = resolveUploadsOrigin()
    // 开发环境走 Vite /uploads 代理；生产环境拼后端域名
    if (origin) return `${origin}${url}`
    return url
  }

  return url
}
