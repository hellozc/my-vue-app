import http from '@/api/request'

export function getMediaList(params) {
  return http.get('/media/list', { params })
}

export function getMediaOptions(categoryCode) {
  return http.get('/media/options', { params: categoryCode ? { categoryCode } : undefined })
}

export function getMediaById(id) {
  return http.get(`/media/${id}`)
}

export function uploadMedia(formData, categoryCode = '') {
  const code = categoryCode || formData.get?.('categoryCode') || 'general'
  return http.request({
    url: `/media/upload?categoryCode=${encodeURIComponent(code)}`,
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
}

export function updateMedia(id, data) {
  return http.put(`/media/${id}`, data)
}

export function deleteMedia(id) {
  return http.delete(`/media/${id}`)
}

export function getMediaCategoryList() {
  return http.get('/media/category/list')
}

export function getMediaCategoryOptions() {
  return http.get('/media/category/options')
}

export function createMediaCategory(data) {
  return http.post('/media/category', data)
}

export function updateMediaCategory(id, data) {
  return http.put(`/media/category/${id}`, data)
}

export function deleteMediaCategory(id) {
  return http.delete(`/media/category/${id}`)
}
