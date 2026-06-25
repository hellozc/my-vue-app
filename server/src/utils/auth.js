import { createHash, randomUUID } from 'crypto'

export function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex')
}

/** 简易 token 存储（生产环境建议 Redis + JWT） */
const adminTokenStore = new Map()
const memberTokenStore = new Map()

export function createToken(userId) {
  const token = randomUUID()
  adminTokenStore.set(token, userId)
  return token
}

export function getUserIdByToken(token) {
  if (!token || token.startsWith('m_')) return null
  return adminTokenStore.get(token) ?? null
}

export function removeToken(token) {
  if (!token) return
  if (token.startsWith('m_')) {
    memberTokenStore.delete(token)
    return
  }
  adminTokenStore.delete(token)
}

export function createMemberToken(memberId) {
  const token = `m_${randomUUID()}`
  memberTokenStore.set(token, memberId)
  return token
}

export function getMemberIdByToken(token) {
  if (!token?.startsWith('m_')) return null
  return memberTokenStore.get(token) ?? null
}

export function removeMemberToken(token) {
  if (!token) return
  memberTokenStore.delete(token)
}

export function parseBearerToken(authHeader = '') {
  if (!authHeader.startsWith('Bearer ')) return ''
  return authHeader.slice(7)
}
