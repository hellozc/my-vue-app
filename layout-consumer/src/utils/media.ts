import { appConfig } from '@/config/env'

/** 将后端返回的素材 URL 转为可访问地址 */
export function resolveMediaUrl(url?: string) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  if (!url.startsWith('/')) return url

  if (appConfig.apiOrigin) {
    return `${appConfig.apiOrigin}${url}`
  }

  return url
}
