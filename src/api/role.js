import http from '@/api/request'

export function getRoleList() {
  return http.get('/role/list')
}

export function getRoleDetail(id) {
  return http.get(`/role/${id}`)
}

export function createRole(data) {
  return http.post('/role', data)
}

export function updateRole(id, data) {
  return http.put(`/role/${id}`, data)
}

export function deleteRole(id) {
  return http.delete(`/role/${id}`)
}

export function getRoleMenuIds(id) {
  return http.get(`/role/${id}/menus`)
}

export function setRoleMenus(id, menuIds) {
  return http.put(`/role/${id}/menus`, { menuIds })
}
