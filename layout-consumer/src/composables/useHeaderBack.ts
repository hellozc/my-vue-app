import { computed, onMounted, ref } from 'vue'

export type HeaderShowBack = boolean | 'auto' | 'true' | 'false'

export function useHeaderBack(showBackSetting: HeaderShowBack = 'auto') {
  const canGoBack = ref(false)

  onMounted(() => {
    try {
      const pages = getCurrentPages()
      canGoBack.value = pages.length > 1
    } catch {
      canGoBack.value = false
    }
  })

  const visible = computed(() => {
    if (showBackSetting === true || showBackSetting === 'true') return true
    if (showBackSetting === false || showBackSetting === 'false') return false
    return canGoBack.value
  })

  function goBack() {
    if (!canGoBack.value) return
    uni.navigateBack({ delta: 1 })
  }

  return { visible, goBack, canGoBack }
}
