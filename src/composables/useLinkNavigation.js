import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { trackLinkClick } from '@/api/link'
import { performNavigation, resolveLinkTarget } from '@/utils/link'

export function useLinkNavigation() {
  const router = useRouter()
  const linkRegistry = inject('linkRegistry', {})
  const layoutInteractive = inject('layoutInteractive', true)

  function resolve({ linkCode, legacyLink } = {}) {
    return resolveLinkTarget({ linkCode, legacyLink, registry: linkRegistry })
  }

  async function navigate({ linkCode, legacyLink } = {}) {
    const resolved = resolve({ linkCode, legacyLink })
    if (!resolved?.target) return false

    if (layoutInteractive !== false) {
      if (linkCode) await trackLinkClick(linkCode)
      performNavigation(resolved, router)
    }
    return true
  }

  function hasLink({ linkCode, legacyLink } = {}) {
    return Boolean(resolve({ linkCode, legacyLink })?.target)
  }

  return {
    resolve,
    navigate,
    hasLink,
    linkRegistry,
    layoutInteractive,
  }
}
