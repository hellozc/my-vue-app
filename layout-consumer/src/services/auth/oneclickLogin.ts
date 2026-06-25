import { loginByOneclick } from '@/api/member'

export async function obtainOneclickAccessToken() {
  // #ifdef APP-PLUS
  await new Promise<void>((resolve, reject) => {
    uni.preLogin({
      provider: 'univerify',
      success: () => resolve(),
      fail: (err) => reject(new Error(err.errMsg || '一键登录预取号失败')),
    })
  })

  const result = await new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'univerify',
      univerifyStyle: {
        fullScreen: false,
      },
      success: resolve,
      fail: reject,
    })
  })

  const accessToken = (result as UniApp.LoginRes & { authResult?: { access_token?: string } })
    .authResult?.access_token
  if (!accessToken) throw new Error('一键登录授权失败')
  return { platform: 'app' as const, accessToken }
  // #endif

  return { platform: 'app' as const, accessToken: 'mock_oneclick_token' }
}

export async function performOneclickLogin() {
  const payload = await obtainOneclickAccessToken()
  return loginByOneclick(payload)
}
