import type { AuthCapabilities } from '@/api/member'

export type ClientPlatform = 'mp-weixin' | 'h5' | 'app' | 'other'

export function getClientPlatform(): ClientPlatform {
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  // #ifdef APP-PLUS
  return 'app'
  // #endif
  // #ifdef H5
  return 'h5'
  // #endif
  return 'other'
}

export function isWechatH5() {
  // #ifdef H5
  return /MicroMessenger/i.test(navigator.userAgent)
  // #endif
  return false
}

export interface ResolvedAuthCapabilities extends AuthCapabilities {
  showWechat: boolean
  showOneclick: boolean
  showWechatPhone: boolean
}

export function resolveClientAuthCapabilities(
  server: AuthCapabilities,
  platform: ClientPlatform = getClientPlatform()
): ResolvedAuthCapabilities {
  const showWechat =
    server.wechat &&
    (platform === 'mp-weixin' || platform === 'app' || (platform === 'h5' && isWechatH5()) || platform === 'h5')

  const showOneclick = server.oneclick && platform === 'app'
  const showWechatPhone = server.wechatPhone && platform === 'mp-weixin'

  return {
    ...server,
    showWechat,
    showOneclick,
    showWechatPhone,
  }
}
