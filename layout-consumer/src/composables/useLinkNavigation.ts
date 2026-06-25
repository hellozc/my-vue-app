import { inject, type Ref } from 'vue'
import type { LinkRecord } from '@/layout/types'
import { trackLinkClick } from '@/api/link'
import { isExternalUrl, resolveLinkTarget } from '@/utils/link'

export function useLinkNavigation() {
  const linkRegistry = inject<Record<string, LinkRecord>>('linkRegistry', {})
  const layoutInteractive = inject<Ref<boolean> | boolean>('layoutInteractive', true)

  function isInteractive() {
    return typeof layoutInteractive === 'boolean'
      ? layoutInteractive
      : layoutInteractive.value !== false
  }

  function resolve(options: { linkCode?: string; legacyLink?: string } = {}) {
    return resolveLinkTarget({ ...options, registry: linkRegistry })
  }

  async function navigate(options: { linkCode?: string; legacyLink?: string } = {}) {
    const resolved = resolve(options)
    if (!resolved?.target || !isInteractive()) return false

    if (options.linkCode) {
      await trackLinkClick(options.linkCode)
    }

    if (resolved.type === 'external' || isExternalUrl(resolved.target)) {
      openExternal(resolved.target)
      return true
    }

    openInternal(resolved.target, options.linkCode)
    return true
  }

  function hasLink(options: { linkCode?: string; legacyLink?: string } = {}) {
    return Boolean(resolve(options)?.target)
  }

  return { resolve, navigate, hasLink }
}

function openExternal(url: string) {
  // #ifdef H5
  window.open(url, '_blank')
  // #endif
  // #ifdef APP-PLUS
  plus.runtime.openURL(url)
  // #endif
  // #ifdef MP
  uni.navigateTo({
    url: `/pages/webview/index?url=${encodeURIComponent(url)}`,
  })
  // #endif
}

/** linkCode → 布局 code（主 Tab 切换用 reLaunch） */
const MAIN_TAB_LAYOUT_CODES: Record<string, string> = {
  home: 'demo-home',
  user: 'user',
  'community-news': 'demo-home',
}

function openInternal(target: string, linkCode?: string) {
  if (target.startsWith('/pages/')) {
    uni.navigateTo({ url: target })
    return
  }

  if (linkCode) {
    const layoutCode = MAIN_TAB_LAYOUT_CODES[linkCode] ?? linkCode
    const url = `/pages/layout/index?code=${encodeURIComponent(layoutCode)}`
    if (MAIN_TAB_LAYOUT_CODES[linkCode]) {
      uni.reLaunch({ url })
      return
    }
    uni.navigateTo({ url })
    return
  }

  uni.showToast({
    title: `暂未配置页面：${target}`,
    icon: 'none',
  })
}
