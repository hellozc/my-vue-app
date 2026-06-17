import http from './request'

export function login(data) {
  return http.post('/auth/login', data)
}

export function logout() {
  return http.post('/auth/logout')
}

export function getUserInfo() {
  return http.get('/auth/userInfo')
}

export function changePassword(data) {
  return http.put('/auth/password', data)
}
