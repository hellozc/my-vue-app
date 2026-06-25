import { request } from '@/api/request'

export interface MemberProfile {
  id: number
  nickname: string
  avatar: string | null
  phone: string | null
  phoneMasked: string
}

export interface AuthCapabilities {
  password: boolean
  sms: boolean
  wechat: boolean
  oneclick: boolean
  wechatPhone: boolean
  register: boolean
  defaultTab: 'password' | 'sms'
  agreementUrl: string
  privacyUrl: string
}

export interface LoginResult {
  token: string
  expiresIn: number
  member: MemberProfile
}

export function getAuthCapabilities() {
  return request<AuthCapabilities>({ url: '/member/auth/capabilities', auth: false })
}

export function loginByPassword(data: { account: string; password: string }) {
  return request<LoginResult>({
    url: '/member/auth/login/password',
    method: 'POST',
    data,
    auth: false,
  })
}

export function sendSmsCode(phone: string, scene: 'login' | 'register' = 'login') {
  return request<{ phone: string; expiresIn: number; mockCode?: string }>({
    url: '/member/auth/sms/send',
    method: 'POST',
    data: { phone, scene },
    auth: false,
  })
}

export function loginBySms(data: { phone: string; code: string }) {
  return request<LoginResult>({
    url: '/member/auth/login/sms',
    method: 'POST',
    data,
    auth: false,
  })
}

export function loginByWechat(data: { platform: string; code: string }) {
  return request<LoginResult>({
    url: '/member/auth/login/wechat',
    method: 'POST',
    data,
    auth: false,
  })
}

export function loginByWechatPhone(data: { platform: string; phoneCode: string }) {
  return request<LoginResult>({
    url: '/member/auth/login/wechat-phone',
    method: 'POST',
    data,
    auth: false,
  })
}

export function loginByOneclick(data: { platform: string; accessToken: string }) {
  return request<LoginResult>({
    url: '/member/auth/login/oneclick',
    method: 'POST',
    data,
    auth: false,
  })
}

export function registerByPhone(data: {
  phone: string
  code: string
  password: string
  nickname?: string
}) {
  return request<LoginResult>({
    url: '/member/auth/register',
    method: 'POST',
    data,
    auth: false,
  })
}

export function logoutMember() {
  return request<null>({ url: '/member/auth/logout', method: 'POST' })
}

export function getMemberProfile() {
  return request<MemberProfile>({ url: '/member/profile' })
}
