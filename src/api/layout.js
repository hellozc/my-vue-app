import http from '@/api/request'

export function getLayoutList() {
  return http.get('/layout/list')
}

export function getLayoutById(id) {
  return http.get(`/layout/${id}`)
}

/** 展示端拉取已发布布局（供独立前端项目使用） */
export function getLayoutByCode(code) {
  return http.get(`/layout/code/${code}`)
}

export function createLayout(data) {
  return http.post('/layout', data)
}

export function updateLayout(id, data) {
  return http.put(`/layout/${id}`, data)
}

export function deleteLayout(id) {
  return http.delete(`/layout/${id}`)
}

export function publishLayout(id) {
  return http.post(`/layout/${id}/publish`)
}
