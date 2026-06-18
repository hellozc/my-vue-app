import http from '@/api/request'

export function getMenuTree() {
  return http.get('/menu/tree')
}

export function getMenuList() {
  return http.get('/menu/list')
}

export function createMenu(data) {
  return http.post('/menu', data)
}

export function updateMenu(id, data) {
  return http.put(`/menu/${id}`, data)
}

export function deleteMenu(id) {
  return http.delete(`/menu/${id}`)
}
