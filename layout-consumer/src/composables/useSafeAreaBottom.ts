import { onMounted, ref } from 'vue'

const H5_ANDROID_FALLBACK_PX = 12
const H5_GENERIC_FALLBACK_PX = 8

function isH5Runtime(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const info = uni.getSystemInfoSync()
    const platform = String(info.uniPlatform || info.platform || '').toLowerCase()
    if (platform === 'web' || platform === 'h5') return true
  } catch {
    /* ignore */
  }
  return typeof document !== 'undefined'
}

function isAndroidUa(): boolean {
  if (typeof navigator === 'undefined') return false
  return /android/i.test(navigator.userAgent)
}

/** 通过探测元素读取 env(safe-area-inset-bottom) 的计算值（px） */
function measureEnvSafeAreaBottom(): number {
  if (typeof document === 'undefined') return 0
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;left:-9999px;top:0;padding-bottom:constant(safe-area-inset-bottom);padding-bottom:env(safe-area-inset-bottom);'
  document.body.appendChild(probe)
  const value = parseFloat(window.getComputedStyle(probe).paddingBottom) || 0
  document.body.removeChild(probe)
  return value
}

/** visualViewport 与 layout viewport 差值（部分 Android 浏览器有效） */
function measureVisualViewportBottomGap(): number {
  if (typeof window === 'undefined' || !window.visualViewport) return 0
  const { height, offsetTop } = window.visualViewport
  const gap = window.innerHeight - height - offsetTop
  return gap > 0 ? gap : 0
}

function readUniSafeAreaBottom(): number {
  try {
    const getWindowInfo = (uni as unknown as { getWindowInfo?: () => UniApp.GetWindowInfoResult }).getWindowInfo
    const info =
      typeof getWindowInfo === 'function' ? getWindowInfo() : uni.getSystemInfoSync()

    if (info.safeAreaInsets?.bottom) {
      return info.safeAreaInsets.bottom
    }
    if (info.safeArea && info.screenHeight) {
      return Math.max(0, info.screenHeight - info.safeArea.bottom)
    }
  } catch {
    /* 部分端可能无 uni API */
  }
  return 0
}

function resolveH5FallbackInset(current: number): number {
  if (current > 0 || !isH5Runtime()) return current
  if (isAndroidUa()) return H5_ANDROID_FALLBACK_PX
  return H5_GENERIC_FALLBACK_PX
}

/** 综合 uni / env / visualViewport，得到底部安全区高度（px） */
export function measureSafeAreaBottomInset(): number {
  const uniInset = readUniSafeAreaBottom()
  const envInset = measureEnvSafeAreaBottom()
  const visualInset = measureVisualViewportBottomGap()
  const merged = Math.max(uniInset, envInset, visualInset)
  return resolveH5FallbackInset(merged)
}

function applySafeAreaCssVar(px: number) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--lc-safe-area-bottom', `${px}px`)
}

/** 获取底部安全区高度（px），作为 env(safe-area-inset-bottom) 的运行时补充 */
export function useSafeAreaBottom() {
  const bottom = ref(0)

  function refresh() {
    const inset = measureSafeAreaBottomInset()
    bottom.value = inset
    applySafeAreaCssVar(inset)
  }

  // 小程序 / App 无 document，setup 阶段即同步读取，避免 Tabbar 首屏贴底
  refresh()

  onMounted(() => {
    refresh()

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', refresh)
      window.visualViewport.addEventListener('scroll', refresh)
    }
  })

  return bottom
}
