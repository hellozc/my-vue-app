import { pool } from '../db/pool.js'
import {
  createToken,
  getUserIdByToken,
  hashPassword,
  removeToken,
} from '../utils/auth.js'
import * as userRepo from '../repositories/userRepository.js'

function toUserInfo(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    roleId: user.role_id ?? user.roleId,
    role: user.role,
    avatar: user.avatar,
  }
}

export async function login({ username, password }) {
  const user = await userRepo.findByUsername(pool, username)
  if (!user || user.password !== hashPassword(password)) {
    throw new Error('用户名或密码错误')
  }
  const token = createToken(user.id)
  return {
    token,
    userInfo: toUserInfo(user),
  }
}

export async function logout(token) {
  removeToken(token)
}

export async function getUserInfoByToken(token) {
  const userId = getUserIdByToken(token)
  if (!userId) throw new Error('登录已过期，请重新登录')
  const user = await userRepo.findById(pool, userId)
  if (!user) throw new Error('用户不存在')
  return toUserInfo(user)
}

export async function changePassword(token, { oldPassword, newPassword }) {
  const userId = getUserIdByToken(token)
  if (!userId) throw new Error('登录已过期，请重新登录')

  const user = await userRepo.findByIdWithPassword(pool, userId)
  if (!user) throw new Error('用户不存在')

  if (user.password !== hashPassword(oldPassword)) {
    throw new Error('原密码错误')
  }
  if (newPassword.length < 6) {
    throw new Error('新密码长度不能少于 6 位')
  }

  await userRepo.updatePassword(pool, userId, newPassword)
}
