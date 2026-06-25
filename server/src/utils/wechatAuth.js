import { isMockWechatEnabled } from '../services/memberAuthConfigService.js'

export async function exchangeWechatCode({ platform, code, credentials }) {
  const trimmedCode = String(code || '').trim()
  if (!trimmedCode) throw new Error('微信授权失败，请重试')

  if (isMockWechatEnabled(credentials) || trimmedCode.startsWith('mock_')) {
    const suffix = trimmedCode.slice(-8) || Date.now().toString().slice(-8)
    return {
      openid: `mock_openid_${suffix}`,
      unionid: `mock_unionid_${suffix}`,
      sessionKey: 'mock_session_key',
      mock: true,
    }
  }

  let url = ''
  if (platform === 'mp-weixin') {
    url = `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(credentials.appId)}&secret=${encodeURIComponent(credentials.secret)}&js_code=${encodeURIComponent(trimmedCode)}&grant_type=authorization_code`
  } else if (platform === 'app') {
    url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${encodeURIComponent(credentials.appId)}&secret=${encodeURIComponent(credentials.secret)}&code=${encodeURIComponent(trimmedCode)}&grant_type=authorization_code`
  } else {
    throw new Error('当前平台暂不支持微信登录')
  }

  const response = await fetch(url)
  const data = await response.json()
  if (data.errcode) {
    throw new Error(data.errmsg || '微信登录失败')
  }
  return {
    openid: data.openid,
    unionid: data.unionid || '',
    sessionKey: data.session_key || data.session_key || '',
    mock: false,
  }
}

export async function exchangeWechatPhoneCode({ phoneCode, credentials }) {
  const trimmed = String(phoneCode || '').trim()
  if (!trimmed) throw new Error('获取手机号失败，请重试')

  if (isMockWechatEnabled(credentials) || trimmed.startsWith('mock_')) {
    return { phone: '13800138000', mock: true }
  }

  const tokenRes = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(credentials.appId)}&secret=${encodeURIComponent(credentials.secret)}`
  )
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    throw new Error(tokenData.errmsg || '微信服务暂不可用')
  }

  const phoneRes = await fetch(
    `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${encodeURIComponent(tokenData.access_token)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: trimmed }),
    }
  )
  const phoneData = await phoneRes.json()
  if (phoneData.errcode) {
    throw new Error(phoneData.errmsg || '获取手机号失败')
  }
  const phone = phoneData.phone_info?.phoneNumber || phoneData.phone_info?.purePhoneNumber
  if (!phone) throw new Error('未获取到手机号')
  return { phone, mock: false }
}
