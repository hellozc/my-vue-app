import http from './request'

export function getHomeData() {
  return http.get('/home/getData')
}
