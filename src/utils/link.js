export const LINK_TYPE = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
}

export function isExternalUrl(url = '') {
  return /^https?:\/\//i.test(url)
}

export function resolveLinkRecord(record) {
  if (!record || record.status === 'disabled') return null
  return {
    code: record.code,
    name: record.name,
    type: record.type,
    target: record.target,
  }
}

export function resolveLegacyLink(legacyLink) {
  if (!legacyLink) return null
  return {
    code: null,
    name: legacyLink,
    type: isExternalUrl(legacyLink) ? LINK_TYPE.EXTERNAL : LINK_TYPE.INTERNAL,
    target: legacyLink,
  }
}

/**
 * 解析跳转目标：优先 linkCode（统一链接库），兼容旧字段 raw link/path
 */
export function resolveLinkTarget({ linkCode, legacyLink, registry = {} }) {
  if (linkCode && registry[linkCode]) {
    return resolveLinkRecord(registry[linkCode])
  }
  return resolveLegacyLink(legacyLink)
}

export function getLinkTypeLabel(type) {
  return type === LINK_TYPE.EXTERNAL ? '站外' : '站内'
}

export function performNavigation(resolved, router) {
  if (!resolved?.target) return false

  if (resolved.type === LINK_TYPE.EXTERNAL || isExternalUrl(resolved.target)) {
    window.open(resolved.target, '_blank', 'noopener,noreferrer')
    return true
  }

  if (router) {
    router.push(resolved.target).catch(() => {})
    return true
  }

  window.location.href = resolved.target
  return true
}

export function buildLinkRegistry(list = []) {
  return Object.fromEntries(list.map((item) => [item.code, item]))
}
