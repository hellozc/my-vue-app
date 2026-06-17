import { pool } from '../db/pool.js'
import * as roleRepo from '../repositories/roleRepository.js'

export async function getRoleList() {
  return roleRepo.findAll(pool)
}

export async function getRoleDetail(id) {
  const role = await roleRepo.findById(pool, id)
  if (!role) throw new Error('角色不存在')
  const menuIds = await roleRepo.getMenuIdsByRoleId(pool, id)
  return { ...role, menuIds }
}

export async function createRole(payload) {
  const { code, name, description, sort, menuIds = [] } = payload
  if (!code?.trim()) throw new Error('请输入角色编码')
  if (!name?.trim()) throw new Error('请输入角色名称')
  if (await roleRepo.findByCode(pool, code.trim())) throw new Error('角色编码已存在')
  if (await roleRepo.findByName(pool, name.trim())) throw new Error('角色名称已存在')

  const role = await roleRepo.create(pool, {
    code: code.trim(),
    name: name.trim(),
    description,
    sort,
  })
  await roleRepo.setRoleMenus(pool, role.id, menuIds)
  return { ...role, menuIds }
}

export async function updateRole(id, payload) {
  const roleId = Number(id)
  const existing = await roleRepo.findById(pool, roleId)
  if (!existing) throw new Error('角色不存在')

  const { code, name, description, sort, menuIds = [] } = payload
  if (!code?.trim()) throw new Error('请输入角色编码')
  if (!name?.trim()) throw new Error('请输入角色名称')
  if (await roleRepo.findByCode(pool, code.trim(), roleId)) throw new Error('角色编码已存在')
  if (await roleRepo.findByName(pool, name.trim(), roleId)) throw new Error('角色名称已存在')

  const role = await roleRepo.update(pool, roleId, {
    code: code.trim(),
    name: name.trim(),
    description,
    sort,
  })
  await roleRepo.setRoleMenus(pool, roleId, menuIds)
  await roleRepo.syncUserRoleName(pool, roleId, role.name)
  return { ...role, menuIds }
}

export async function removeRole(id) {
  const roleId = Number(id)
  if (roleId === 1) throw new Error('超级管理员角色不可删除')

  const existing = await roleRepo.findById(pool, roleId)
  if (!existing) throw new Error('角色不存在')

  const userCount = await roleRepo.countUsersByRoleId(pool, roleId)
  if (userCount > 0) throw new Error('该角色下仍有员工，无法删除')

  await roleRepo.remove(pool, roleId)
}

export async function getRoleMenuIds(id) {
  const role = await roleRepo.findById(pool, id)
  if (!role) throw new Error('角色不存在')
  return roleRepo.getMenuIdsByRoleId(pool, id)
}

export async function setRoleMenus(id, menuIds) {
  const roleId = Number(id)
  const role = await roleRepo.findById(pool, roleId)
  if (!role) throw new Error('角色不存在')
  await roleRepo.setRoleMenus(pool, roleId, menuIds)
}
