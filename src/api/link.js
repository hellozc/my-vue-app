import http from '@/api/request'
import { apiConfig } from '@/config/api'
import axios from 'axios'

export function getLinkList(categoryCode) {
  return http.get('/link/list', { params: categoryCode ? { categoryCode } : undefined })
}

export function getLinkOptions(categoryCode) {
  return http.get('/link/options', { params: categoryCode ? { categoryCode } : undefined })
}

export function getLinkById(id) {
  return http.get(`/link/${id}`)
}

export function getLinkByCode(code) {
  return http.get(`/link/code/${code}`)
}

export function createLink(data) {
  return http.post('/link', data)
}

export function updateLink(id, data) {
  return http.put(`/link/${id}`, data)
}

export function deleteLink(id) {
  return http.delete(`/link/${id}`)
}

export function getLinkCategoryList() {
  return http.get('/link/category/list')
}

export function getLinkCategoryOptions() {
  return http.get('/link/category/options')
}

export function createLinkCategory(data) {
  return http.post('/link/category', data)
}

export function updateLinkCategory(id, data) {
  return http.put(`/link/category/${id}`, data)
}

export function deleteLinkCategory(id) {
  return http.delete(`/link/category/${id}`)
}

/** 点击统计（静默失败，不影响跳转） */
export function trackLinkClick(code) {
  if (!code) return Promise.resolve()
  return axios
    .post(`${apiConfig.baseURL}/link/track/${encodeURIComponent(code)}`, null, {
      timeout: apiConfig.timeout,
      headers: { 'Content-Type': 'application/json' },
    })
    .catch(() => {})
}
