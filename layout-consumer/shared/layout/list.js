/** 列表组件默认 props + 兼容旧 schema + 分页解析（管理端 / C 端共用） */

/** 数据来源：静态切片（纯前端） / 动态拉取（后端分页接口） */
export const LIST_DATA_SOURCE = {
  STATIC: 'static',
  DYNAMIC: 'dynamic',
}

/**
 * 分页加载方式 —— 预留可拓展，新增模式只需在此追加并在 C 端实现对应分支
 * - auto: 上拉触底自动加载（H5 IntersectionObserver，小程序降级为按钮）
 * - loadMore: 「加载更多」按钮
 * - pager: 上一页 / 下一页 分页器（预留）
 */
export const LIST_PAGINATION_MODE = {
  AUTO: 'auto',
  LOAD_MORE: 'loadMore',
  PAGER: 'pager',
}

const PAGINATION_MODES = Object.values(LIST_PAGINATION_MODE)
const DATA_SOURCES = Object.values(LIST_DATA_SOURCE)

const DEFAULT_PAGE_SIZE = 5
const MIN_PAGE_SIZE = 1
const MAX_PAGE_SIZE = 100

function clampPageSize(value, fallback = DEFAULT_PAGE_SIZE) {
  const num = Number(value)
  if (!Number.isFinite(num)) return fallback
  return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Math.round(num)))
}

export function createDefaultListHeader(overrides = {}) {
  return {
    show: true,
    title: '模块标题',
    accentColor: '#e53935',
    showMore: true,
    moreText: '更多>',
    moreLinkCode: '',
    moreLink: '',
    ...overrides,
  }
}

export function createDefaultListPagination(overrides = {}) {
  return {
    enabled: false,
    pageSize: DEFAULT_PAGE_SIZE,
    mode: LIST_PAGINATION_MODE.AUTO,
    ...overrides,
  }
}

export function createDefaultListProps(overrides = {}) {
  const { items, header, pagination, ...rest } = overrides
  return {
    padding: '12px 16px',
    showDivider: true,
    showArrow: true,
    dataSource: LIST_DATA_SOURCE.STATIC,
    /** 动态数据源标识（dataSource = dynamic 时生效），对应后端 GET /api/list/:sourceCode */
    sourceCode: '',
    header: createDefaultListHeader(header),
    pagination: createDefaultListPagination(pagination),
    items: Array.isArray(items) ? items : [],
    ...rest,
  }
}

export function normalizeListPagination(raw = {}) {
  const defaults = createDefaultListPagination()
  const mode = PAGINATION_MODES.includes(raw?.mode) ? raw.mode : defaults.mode
  const enabled = raw?.enabled === true || raw?.enabled === 'true' || raw?.enabled === 1
  return {
    enabled,
    pageSize: clampPageSize(raw?.pageSize, defaults.pageSize),
    mode,
  }
}

export function normalizeListProps(raw = {}) {
  const defaults = createDefaultListProps()
  const dataSource = DATA_SOURCES.includes(raw?.dataSource)
    ? raw.dataSource
    : defaults.dataSource

  return {
    ...defaults,
    ...raw,
    dataSource,
    sourceCode: typeof raw?.sourceCode === 'string' ? raw.sourceCode : defaults.sourceCode,
    header: { ...defaults.header, ...(raw?.header ?? {}) },
    pagination: normalizeListPagination(raw?.pagination),
    items: Array.isArray(raw?.items) ? raw.items : defaults.items,
  }
}

/**
 * 静态数据按页切片（纯前端分页）
 * @returns {{ items: any[], page: number, pageSize: number, total: number, hasMore: boolean }}
 */
export function sliceListItems(items = [], page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const list = Array.isArray(items) ? items : []
  const size = clampPageSize(pageSize)
  const safePage = Math.max(1, Math.floor(Number(page) || 1))
  const end = safePage * size
  return {
    items: list.slice(0, end),
    page: safePage,
    pageSize: size,
    total: list.length,
    hasMore: end < list.length,
  }
}
