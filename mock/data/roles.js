export let roles = [
  { id: 1, code: 'admin', name: '超级管理员', description: '拥有系统全部权限', sort: 1 },
  { id: 2, code: 'manager', name: '部门经理', description: '管理部门业务与人员', sort: 2 },
  { id: 3, code: 'operator', name: '运营人员', description: '负责日常运营操作', sort: 3 },
  { id: 4, code: 'staff', name: '普通员工', description: '基础业务访问权限', sort: 4 },
]

export const roleState = { nextId: 5 }

/** roleId -> menuId[] */
export let roleMenus = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  2: [1, 2, 3],
  3: [1, 2],
  4: [1],
}

export function getRoleById(id) {
  return roles.find((item) => item.id === Number(id))
}

export function isAdminRole(roleId) {
  const role = getRoleById(roleId)
  return role?.code === 'admin'
}

export function getRoleMenuIds(roleId) {
  return roleMenus[roleId] ? [...roleMenus[roleId]] : []
}

export function setRoleMenuIds(roleId, menuIds) {
  roleMenus[roleId] = [...menuIds]
}

export function removeRoleMenus(roleId) {
  delete roleMenus[roleId]
}
