export async function verifyOneclickAccessToken(accessToken) {
  const token = String(accessToken || '').trim()
  if (!token) throw new Error('一键登录授权失败')

  if (token.startsWith('mock_') || process.env.UNIVERIFY_MOCK === 'true') {
    return { phone: '13800138000', mock: true }
  }

  // DCloud 一键登录需配置 univerify 密钥并在服务端调用官方 API 换号
  // 此处预留真实接入点，未配置时给出明确提示
  if (!process.env.UNIVERIFY_API_KEY) {
    throw new Error('一键登录服务未配置，请联系管理员')
  }

  throw new Error('一键登录服务尚未完成生产配置')
}
