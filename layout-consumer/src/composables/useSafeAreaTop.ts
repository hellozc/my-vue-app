import { computed, onMounted, ref } from 'vue'

export interface MenuButtonRect {
  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number
}

/** 顶部安全区 + 状态栏高度（多端兼容） */
export function useSafeAreaTop() {
  const statusBarHeight = ref(0)
  const safeAreaTop = ref(0)
  const menuButtonRect = ref<MenuButtonRect | null>(null)
  const windowWidth = ref(375)

  onMounted(() => {
    try {
      const info = uni.getSystemInfoSync()
      statusBarHeight.value = info.statusBarHeight ?? 0
      windowWidth.value = info.windowWidth ?? 375

      if (info.safeAreaInsets?.top != null) {
        safeAreaTop.value = info.safeAreaInsets.top
      } else if (info.safeArea) {
        safeAreaTop.value = info.safeArea.top
      } else {
        safeAreaTop.value = statusBarHeight.value
      }
    } catch {
      /* H5 / 部分端可能无 uni API */
    }

    // #ifdef MP-WEIXIN
    try {
      const rect = uni.getMenuButtonBoundingClientRect()
      if (rect?.width) {
        menuButtonRect.value = rect
      }
    } catch {
      /* ignore */
    }
    // #endif
  })

  const topInset = computed(() => Math.max(safeAreaTop.value, statusBarHeight.value))

  /** 微信小程序右侧留白（避开胶囊） */
  const mpNavBarPaddingRight = computed(() => {
    if (!menuButtonRect.value) return 0
    const gap = windowWidth.value - menuButtonRect.value.right + 8
    return Math.max(gap, 0)
  })

  return {
    statusBarHeight,
    safeAreaTop,
    topInset,
    menuButtonRect,
    windowWidth,
    mpNavBarPaddingRight,
  }
}
