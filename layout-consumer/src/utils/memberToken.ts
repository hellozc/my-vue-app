const TOKEN_KEY = 'member_token'

export function getMemberToken() {
  try {
    return String(uni.getStorageSync(TOKEN_KEY) || '')
  } catch {
    return ''
  }
}

export function setMemberToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function clearMemberToken() {
  uni.removeStorageSync(TOKEN_KEY)
}
