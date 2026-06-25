import { useAuth } from '@/composables/useAuth'

export function getCurrentPageUrl() {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1] as {
    route?: string
    options?: Record<string, string>
  } | undefined
  if (!current?.route) return '/pages/index/index'

  const query = Object.entries(current.options ?? {})
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return `/${current.route}${query ? `?${query}` : ''}`
}

export function buildLoginUrl(redirect?: string) {
  const target = redirect || getCurrentPageUrl()
  return `/pages/login/index?redirect=${encodeURIComponent(target)}`
}

export function useLoginGate() {
  const auth = useAuth()

  function ensureLoggedIn(redirect?: string) {
    if (auth.isLoggedIn.value) return true
    uni.navigateTo({ url: buildLoginUrl(redirect) })
    return false
  }

  function requireLogin<T>(action: () => T | Promise<T>, redirect?: string) {
    if (!ensureLoggedIn(redirect)) return Promise.resolve(undefined as T)
    return action()
  }

  return {
    ensureLoggedIn,
    requireLogin,
    buildLoginUrl,
    getCurrentPageUrl,
  }
}
