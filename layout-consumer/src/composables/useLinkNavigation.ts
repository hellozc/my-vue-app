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

function openInternal(target: string, linkCode?: string) {
  if (target.startsWith('/pages/')) {
    uni.navigateTo({ url: target })
    return
  }

  if (linkCode) {
    uni.navigateTo({
      url: `/pages/layout/index?code=${encodeURIComponent(linkCode)}`,
    })
    return
  }

  uni.showToast({
    title: `暂未配置页面：${target}`,
    icon: 'none',
  })
}
