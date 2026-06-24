import { request } from './request'

export interface ListSourceItem {
  id?: string | number
  title?: string
  desc?: string
  icon?: string
  image?: string
  linkCode?: string
  link?: string
}

export interface ListPageData<T = ListSourceItem> {
  items: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

/**
 * 获取动态列表数据源的分页数据
 * 对应后端 GET /api/list/:sourceCode?page=&pageSize=
 */
export function fetchListPage(sourceCode: string, page: number, pageSize: number) {
  const query = `page=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(pageSize)}`
  return request<ListPageData>({
    url: `/list/${encodeURIComponent(sourceCode)}?${query}`,
  })
}
