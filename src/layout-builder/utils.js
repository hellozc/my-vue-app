import { createDefaultTabbar, normalizeTabbar } from '@/layout-builder/chrome/tabbar'
import { createDefaultHeader, normalizeHeader } from '@/layout-builder/chrome/header'

/** 布局 Schema 版本，展示端可按版本做兼容 */
export const LAYOUT_SCHEMA_VERSION = 1

export function generateId(prefix = 'cmp') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 布局 Schema 结构
 * - pageSettings + components：页面主体（宫格、列表等，可拖拽多个）
 * - chrome.tabbar：壳层底部导航（固定、全局唯一，不进 components）
 */
export function createEmptyLayout(overrides = {}) {
  return {
    version: LAYOUT_SCHEMA_VERSION,
    pageSettings: {
      backgroundType: 'solid',
      backgroundColor: '#f5f7fa',
      backgroundImage: '',
    },
    components: [],
    chrome: {
      tabbar: createDefaultTabbar(),
      header: createDefaultHeader(),
    },
    ...overrides,
  }
}

export function cloneLayout(layout) {
  return JSON.parse(JSON.stringify(layout))
}

export function normalizeLayoutSchema(raw) {
  if (!raw || typeof raw !== 'object') return createEmptyLayout()
  return {
    version: raw.version ?? LAYOUT_SCHEMA_VERSION,
    pageSettings: {
      backgroundType: raw.pageSettings?.backgroundType ?? 'solid',
      backgroundColor: raw.pageSettings?.backgroundColor ?? '#f5f7fa',
      backgroundImage: raw.pageSettings?.backgroundImage ?? '',
    },
    components: Array.isArray(raw.components) ? raw.components : [],
    chrome: {
      tabbar: normalizeTabbar(raw.chrome?.tabbar),
      header: normalizeHeader(raw.chrome?.header),
    },
  }
}
