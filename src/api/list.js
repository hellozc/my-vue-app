import http from '@/api/request'

/** 动态列表可选数据源（管理端下拉用） */
export function getListSourceOptions() {
  return http.get('/list/sources')
}
