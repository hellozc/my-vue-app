import { createHash, randomUUID } from 'crypto'

export function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex')
}

/** 简易 token 存储（生产环境建议 Redis + JWT） */
const tokenStore = new Map()

export function createToken(userId) {
  const token = randomUUID()
  tokenStore.set(token, userId)
  return token
}

export function getUserIdByToken(token) {
  if (!token) return null
  return tokenStore.get(token) ?? null
}

export function removeToken(token) {
  tokenStore.delete(token)
}

export function parseBearerToken(authHeader = '') {
  if (!authHeader.startsWith('Bearer ')) return ''
  return authHeader.slice(7)
}
