import { pool } from '../db/pool.js'
import { buildMenuTree, filterMenusByIds } from '../utils/menuTree.js'
import * as menuRepo from '../repositories/menuRepository.js'
import * as roleRepo from '../repositories/roleRepository.js'
import * as userRepo from '../repositories/userRepository.js'

export async function getMenuTree() {
  const list = await menuRepo.findAllMenus(pool)
  return buildMenuTree(list)
}

export async function getMenuTreeForUser(userId) {
  const list = await menuRepo.findAllMenus(pool)
  const user = await userRepo.findById(pool, userId)
  if (!user) throw new Error('用户不存在')

  const role = await roleRepo.findById(pool, user.roleId)
  if (!role) throw new Error('角色不存在')

  if (role.code === 'admin') {
    return buildMenuTree(list)
  }

  const menuIds = await roleRepo.getMenuIdsByRoleId(pool, role.id)
  const filtered = filterMenusByIds(list, menuIds)
  return buildMenuTree(filtered)
}

export async function getAllMenus() {
  return menuRepo.findAllMenus(pool)
}

export async function addMenu(payload) {
  if (await menuRepo.existsByName(pool, payload.name)) {
    throw new Error('路由 name 已存在')
  }
  if (await menuRepo.existsByPath(pool, payload.path)) {
    throw new Error('路由 path 已存在')
  }
  return menuRepo.insertMenu(pool, payload)
}

export async function editMenu(id, payload) {
  const menuId = Number(id)
  if (await menuRepo.existsByName(pool, payload.name, menuId)) {
    throw new Error('路由 name 已存在')
  }
  if (await menuRepo.existsByPath(pool, payload.path, menuId)) {
    throw new Error('路由 path 已存在')
  }
  const result = await menuRepo.updateMenuById(pool, menuId, payload)
  if (!result) throw new Error('菜单不存在')
  return result
}

export async function removeMenu(id) {
  return menuRepo.deleteMenuById(pool, Number(id))
}
