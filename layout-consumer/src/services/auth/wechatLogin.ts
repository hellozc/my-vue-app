import { loginByWechat } from '@/api/member'
import { getClientPlatform } from '@/utils/authPlatform'

export async function obtainWechatLoginCode() {
  const platform = getClientPlatform()

  // #ifdef MP-WEIXIN
  const result = await new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: resolve,
      fail: reject,
    })
  })
  if (!result.code) throw new Error('微信授权失败')
  return { platform: 'mp-weixin' as const, code: result.code }
  // #endif

  // #ifdef APP-PLUS
  const appResult = await new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      onlyAuthorize: true,
      success: resolve,
      fail: reject,
    })
  })
  if (!appResult.code) throw new Error('微信授权失败')
  return { platform: 'app' as const, code: appResult.code }
  // #endif

  // #ifdef H5
  return { platform: 'h5' as const, code: `mock_wx_code_${platform}` }
  // #endif

  return { platform: 'mp-weixin' as const, code: 'mock_wx_code_other' }
}

export async function performWechatLogin() {
  const payload = await obtainWechatLoginCode()
  return loginByWechat(payload)
}
