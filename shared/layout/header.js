import { resolveTopContainerProps } from './topContainer.js'

function normalizeDisplayText(value) {
  if (value == null) return ''
  return String(value).trim()
}

/** 是否首个 topContainer 为沉浸叠加 */
export function detectImmersiveTopContainer(components = []) {
  const first = components?.[0]
  if (!first || first.type !== 'topContainer') return false
  const resolved = resolveTopContainerProps(first.props ?? {})
  return resolved.occupySpace === false
}

export function createDefaultHeader() {
  return {
    enabled: true,
    mode: 'auto',
    navigationStyle: 'auto',
    title: '',
    showBack: 'auto',
    background: '#ffffff',
    color: '#000000',
    height: 44,
    safeAreaInset: true,
    immersive: {
      blendWithTopContainer: true,
      background: 'transparent',
      color: '#ffffff',
    },
    rightActions: [],
  }
}

/**
 * 解析页面头部配置
 * @param {object} raw schema.chrome.header
 * @param {object} context { components, layoutName, layoutCode }
 */
export function resolveHeaderConfig(raw = {}, context = {}) {
  const defaults = createDefaultHeader()
  const header = {
    ...defaults,
    ...raw,
    immersive: {
      ...defaults.immersive,
      ...(raw.immersive ?? {}),
    },
    rightActions: Array.isArray(raw?.rightActions) ? raw.rightActions : defaults.rightActions,
  }

  const { components = [], layoutName = '', layoutCode = '' } = context
  const autoImmersive = detectImmersiveTopContainer(components)

  let mode = header.mode
  if (mode === 'auto') {
    mode = autoImmersive ? 'immersive' : 'native'
  }

  let navigationStyle = header.navigationStyle
  if (navigationStyle === 'auto') {
    navigationStyle = mode === 'immersive' ? 'custom' : 'default'
  }

  const title =
    normalizeDisplayText(header.title) ||
    normalizeDisplayText(layoutName) ||
    normalizeDisplayText(layoutCode) ||
    ''

  const isImmersive = mode === 'immersive'
  const isNative = mode === 'native'
  const enabled = header.enabled !== false

  // layout 页在 pages.json 固定 custom，展示端统一走 AppHeader
  const useCustomNav = enabled
  const useNativeNav = false

  const resolvedBackground = isImmersive
    ? header.immersive?.background ?? 'transparent'
    : header.background ?? '#ffffff'

  const resolvedColor = isImmersive
    ? header.immersive?.color ?? '#ffffff'
    : header.color ?? '#000000'

  const frontColor = isLightColor(resolvedColor) ? '#ffffff' : '#000000'

  return {
    ...header,
    mode,
    navigationStyle,
    title,
    isImmersive,
    isNative,
    useCustomNav,
    useNativeNav,
    shouldRenderChrome: enabled,
    resolvedBackground,
    resolvedColor,
    frontColor,
    autoImmersive,
  }
}

function isLightColor(color) {
  const hex = String(color).replace('#', '')
  if (hex.length !== 6) return false
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}

export function normalizeHeader(raw) {
  const defaults = createDefaultHeader()
  if (!raw) return defaults
  return {
    ...defaults,
    ...raw,
    immersive: {
      ...defaults.immersive,
      ...(raw.immersive ?? {}),
    },
    rightActions: Array.isArray(raw.rightActions) ? raw.rightActions : defaults.rightActions,
  }
}
