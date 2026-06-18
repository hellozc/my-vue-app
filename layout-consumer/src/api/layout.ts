import type { LayoutDetail } from '@/layout/types'
import { request } from './request'

export function getLayoutByCode(code: string) {
  return request<LayoutDetail>({
    url: `/layout/code/${encodeURIComponent(code)}`,
  })
}
