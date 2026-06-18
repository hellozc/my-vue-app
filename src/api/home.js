import http from '@/api/request'

export function getHomeData() {
  return http.get('/home/getData')
}
