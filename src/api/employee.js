import http from './request'

export function getEmployeeList() {
  return http.get('/employee/list')
}

export function createEmployee(data) {
  return http.post('/employee', data)
}

export function updateEmployee(id, data) {
  return http.put(`/employee/${id}`, data)
}

export function resetEmployeePassword(id, password) {
  return http.put(`/employee/${id}/password`, { password })
}

export function deleteEmployee(id) {
  return http.delete(`/employee/${id}`)
}
