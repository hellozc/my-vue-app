import { pool } from '../db/pool.js'
import * as userRepo from '../repositories/userRepository.js'
import * as roleRepo from '../repositories/roleRepository.js'

const DEFAULT_AVATAR =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

async function getRoleById(roleId) {
  const role = await roleRepo.findById(pool, roleId)
  if (!role) throw new Error('角色不存在')
  return role
}

export async function getEmployeeList() {
  return userRepo.findAll(pool)
}

export async function createEmployee(payload) {
  const { username, password, name, roleId, avatar } = payload

  if (!username?.trim()) throw new Error('请输入登录账号')
  if (!password || password.length < 6) throw new Error('密码长度不能少于 6 位')
  if (!name?.trim()) throw new Error('请输入员工姓名')
  if (!roleId) throw new Error('请选择角色')

  const role = await getRoleById(Number(roleId))

  if (await userRepo.existsByUsername(pool, username.trim())) {
    throw new Error('登录账号已存在')
  }

  return userRepo.create(pool, {
    username: username.trim(),
    password,
    name: name.trim(),
    roleId: role.id,
    role: role.name,
    avatar: avatar || DEFAULT_AVATAR,
  })
}

export async function updateEmployee(id, payload) {
  const userId = Number(id)
  const existing = await userRepo.findById(pool, userId)
  if (!existing) throw new Error('员工不存在')

  const { name, roleId, avatar, password } = payload
  if (!name?.trim()) throw new Error('请输入员工姓名')
  if (!roleId) throw new Error('请选择角色')

  const role = await getRoleById(Number(roleId))

  if (password && password.length < 6) {
    throw new Error('密码长度不能少于 6 位')
  }

  return userRepo.update(pool, userId, {
    name: name.trim(),
    roleId: role.id,
    role: role.name,
    avatar: avatar || existing.avatar || DEFAULT_AVATAR,
    password: password || undefined,
  })
}

export async function removeEmployee(id, currentUserId) {
  const userId = Number(id)
  if (userId === 1) throw new Error('默认管理员不可删除')
  if (userId === Number(currentUserId)) throw new Error('不能删除当前登录账号')

  const existing = await userRepo.findById(pool, userId)
  if (!existing) throw new Error('员工不存在')

  await userRepo.remove(pool, userId)
}

export async function resetEmployeePassword(id, password) {
  const userId = Number(id)
  if (!password || password.length < 6) throw new Error('密码长度不能少于 6 位')

  const existing = await userRepo.findById(pool, userId)
  if (!existing) throw new Error('员工不存在')

  await userRepo.updatePassword(pool, userId, password)
}
