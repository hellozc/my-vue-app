/**
 * 列表模块动态数据源服务
 *
 * 当前为示例实现（内存数据）。后续接入真实业务表时，
 * 只需把对应 sourceCode 的 fetch 换成数据库查询即可，对外契约保持不变：
 *   GET /api/list/:sourceCode?page=1&pageSize=5
 *   → { items, page, pageSize, total, hasMore }
 */

const DEFAULT_PAGE_SIZE = 5
const MAX_PAGE_SIZE = 100

function buildNewsItems(count = 28) {
  const topics = ['社区公告', '物业通知', '便民服务', '活动预告', '安全提示', '邻里互助']
  return Array.from({ length: count }, (_, i) => {
    const topic = topics[i % topics.length]
    const no = i + 1
    return {
      id: `news-${no}`,
      title: `${topic} · 第 ${no} 条资讯`,
      desc: `这是第 ${no} 条${topic}的摘要内容，点击查看详情。`,
      icon: 'Document',
      image: '',
      linkCode: '',
      link: '',
    }
  })
}

/**
 * 数据源注册表 —— 预留可拓展：新增业务列表只需在此追加一项
 * name 会出现在管理端「数据源」下拉里，运营无需记接口标识
 * @type {Record<string, { name: string, fetch: () => Promise<any[]> | any[] }>}
 */
const DATA_SOURCES = {
  news: {
    name: '社区资讯',
    fetch: () => buildNewsItems(28),
  },
}

/** 管理端下拉用：返回可选数据源列表 */
export function getDataSourceOptions() {
  return Object.entries(DATA_SOURCES).map(([code, def]) => ({ code, name: def.name }))
}

function clampPageSize(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return DEFAULT_PAGE_SIZE
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.round(num)))
}

function clampPage(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 1
  return Math.max(1, Math.round(num))
}

export function hasDataSource(sourceCode) {
  return Object.prototype.hasOwnProperty.call(DATA_SOURCES, sourceCode)
}

/**
 * 分页获取某个数据源的列表数据
 * @param {string} sourceCode 数据源标识
 * @param {{ page?: number|string, pageSize?: number|string }} query
 */
export async function getListPage(sourceCode, query = {}) {
  if (!hasDataSource(sourceCode)) {
    const err = new Error(`未知的数据源: ${sourceCode}`)
    err.statusCode = 404
    throw err
  }

  const all = await DATA_SOURCES[sourceCode].fetch()
  const list = Array.isArray(all) ? all : []
  const pageSize = clampPageSize(query.pageSize)
  const page = clampPage(query.page)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = list.slice(start, end)

  return {
    items,
    page,
    pageSize,
    total: list.length,
    hasMore: end < list.length,
  }
}
