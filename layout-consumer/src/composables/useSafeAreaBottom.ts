import { onMounted, ref } from 'vue'

/** 获取底部安全区高度（px），作为 env(safe-area-inset-bottom) 的运行时补充 */
export function useSafeAreaBottom() {
  const bottom = ref(0)

  onMounted(() => {
    try {
      const info = uni.getSystemInfoSync()
      if (info.safeAreaInsets?.bottom) {
        bottom.value = info.safeAreaInsets.bottom
        return
      }
      if (info.safeArea && info.screenHeight) {
        bottom.value = Math.max(0, info.screenHeight - info.safeArea.bottom)
      }
    } catch {
      /* H5 / 部分端可能无 uni API */
    }
  })

  return bottom
}
