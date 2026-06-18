import type { LinkRecord } from '@/layout/types'

export const LINK_TYPE = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
} as const

export function isExternalUrl(url = '') {
  return /^https?:\/\//i.test(url)
}

export function resolveLinkRecord(record?: LinkRecord | null) {
  if (!record || record.status === 'disabled') return null
  return {
    code: record.code,
    name: record.name,
    type: record.type,
    target: record.target,
  }
}

export function resolveLegacyLink(legacyLink?: string) {
  if (!legacyLink) return null
  return {
    code: null as string | null,
    name: legacyLink,
    type: isExternalUrl(legacyLink) ? LINK_TYPE.EXTERNAL : LINK_TYPE.INTERNAL,
    target: legacyLink,
  }
}

export function resolveLinkTarget(options: {
  linkCode?: string
  legacyLink?: string
  registry?: Record<string, LinkRecord>
}) {
  const { linkCode, legacyLink, registry = {} } = options
  if (linkCode && registry[linkCode]) {
    return resolveLinkRecord(registry[linkCode])
  }
  return resolveLegacyLink(legacyLink)
}

export function buildLinkRegistry(list: LinkRecord[] = []) {
  return Object.fromEntries(list.map((item) => [item.code, item]))
}
