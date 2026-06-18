import type { LinkRecord } from '@/layout/types'
import { appConfig } from '@/config/env'
import { request } from './request'

export function getLinkOptions() {
  return request<LinkRecord[]>({
    url: '/link/options',
  })
}

export function trackLinkClick(code: string) {
  if (!code) return Promise.resolve()
  return new Promise<void>((resolve) => {
    uni.request({
      url: `${appConfig.apiBaseUrl}/link/track/${encodeURIComponent(code)}`,
      method: 'POST',
      complete: () => resolve(),
    })
  })
}
