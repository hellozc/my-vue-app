/** 宫格组件默认 props + 兼容旧 schema */

export const GRID_LABEL_OVERFLOW = {
  ELLIPSIS: 'ellipsis',
  SCROLL: 'scroll',
}

export function createDefaultGridProps(overrides = {}) {
  const { items, ...rest } = overrides
  return {
    columns: 3,
    rows: 2,
    offsetY: 0,
    marginX: 16,
    background: '#ffffff',
    blockRadius: 12,
    showShadow: true,
    padding: '12px 16px',
    gap: 8,
    borderRadius: 8,
    iconWidth: 52,
    iconHeight: 52,
    iconBg: '#f5f7fa',
    labelOverflow: GRID_LABEL_OVERFLOW.ELLIPSIS,
    items: [],
    ...rest,
    items: Array.isArray(items) ? items : [],
  }
}

export function normalizeGridProps(raw = {}) {
  const defaults = createDefaultGridProps()
  const labelOverflow =
    raw.labelOverflow === GRID_LABEL_OVERFLOW.SCROLL
      ? GRID_LABEL_OVERFLOW.SCROLL
      : GRID_LABEL_OVERFLOW.ELLIPSIS

  return {
    ...defaults,
    ...raw,
    labelOverflow,
    items: Array.isArray(raw.items) ? raw.items : defaults.items,
  }
}
