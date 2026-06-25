import http from '@/api/request'

export function getMemberAuthConfig() {
  return http.get('/member/auth/admin/config')
}

export function saveMemberAuthConfig(data) {
  return http.put('/member/auth/admin/config', data)
}

export function getSmsInbox(params) {
  return http.get('/member/auth/admin/sms-inbox', { params })
}

export function clearSmsInbox() {
  return http.delete('/member/auth/admin/sms-inbox')
}
