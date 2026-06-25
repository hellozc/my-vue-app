import { computed, inject, ref, type InjectionKey } from 'vue'
import {
  getMemberProfile,
  loginByPassword,
  loginBySms,
  loginByWechatPhone,
  logoutMember,
  registerByPhone,
  type LoginResult,
  type MemberProfile,
} from '@/api/member'
import { performOneclickLogin } from '@/services/auth/oneclickLogin'
import { performWechatLogin } from '@/services/auth/wechatLogin'
import { clearMemberToken, getMemberToken, setMemberToken } from '@/utils/memberToken'

export interface AuthContext {
  member: ReturnType<typeof ref<MemberProfile | null>>
  token: ReturnType<typeof ref<string>>
  loading: ReturnType<typeof ref<boolean>>
  isLoggedIn: ReturnType<typeof computed<boolean>>
  init: () => Promise<void>
  loginWithPassword: (account: string, password: string) => Promise<MemberProfile>
  loginWithSms: (phone: string, code: string) => Promise<MemberProfile>
  loginWithWechat: () => Promise<MemberProfile>
  loginWithWechatPhone: (phoneCode: string) => Promise<MemberProfile>
  loginWithOneclick: () => Promise<MemberProfile>
  registerWithPhone: (payload: {
    phone: string
    code: string
    password: string
    nickname?: string
  }) => Promise<MemberProfile>
  logout: () => Promise<void>
  refreshProfile: () => Promise<MemberProfile | null>
}

export const AUTH_KEY: InjectionKey<AuthContext> = Symbol('auth')

export function createAuth(): AuthContext {
  const member = ref<MemberProfile | null>(null)
  const token = ref(getMemberToken())
  const loading = ref(false)

  const isLoggedIn = computed(() => Boolean(token.value))

  function applyLoginResult(data: LoginResult) {
    token.value = data.token
    setMemberToken(data.token)
    member.value = data.member
    return data.member
  }

  async function refreshProfile() {
    if (!token.value) {
      member.value = null
      return null
    }
    try {
      member.value = await getMemberProfile()
      return member.value
    } catch {
      token.value = ''
      member.value = null
      clearMemberToken()
      return null
    }
  }

  async function init() {
    if (!token.value) return
    loading.value = true
    try {
      await refreshProfile()
    } finally {
      loading.value = false
    }
  }

  async function loginWithPassword(account: string, password: string) {
    loading.value = true
    try {
      const data = await loginByPassword({ account, password })
      return applyLoginResult(data)
    } finally {
      loading.value = false
    }
  }

  async function loginWithSms(phone: string, code: string) {
    loading.value = true
    try {
      const data = await loginBySms({ phone, code })
      return applyLoginResult(data)
    } finally {
      loading.value = false
    }
  }

  async function loginWithWechat() {
    loading.value = true
    try {
      const data = await performWechatLogin()
      return applyLoginResult(data)
    } finally {
      loading.value = false
    }
  }

  async function loginWithWechatPhone(phoneCode: string) {
    loading.value = true
    try {
      const data = await loginByWechatPhone({ platform: 'mp-weixin', phoneCode })
      return applyLoginResult(data)
    } finally {
      loading.value = false
    }
  }

  async function loginWithOneclick() {
    loading.value = true
    try {
      const data = await performOneclickLogin()
      return applyLoginResult(data)
    } finally {
      loading.value = false
    }
  }

  async function registerWithPhone(payload: {
    phone: string
    code: string
    password: string
    nickname?: string
  }) {
    loading.value = true
    try {
      const data = await registerByPhone(payload)
      return applyLoginResult(data)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      if (token.value) {
        try {
          await logoutMember()
        } catch {
          /* 本地仍清除登录态 */
        }
      }
      token.value = ''
      member.value = null
      clearMemberToken()
    } finally {
      loading.value = false
    }
  }

  return {
    member,
    token,
    loading,
    isLoggedIn,
    init,
    loginWithPassword,
    loginWithSms,
    loginWithWechat,
    loginWithWechatPhone,
    loginWithOneclick,
    registerWithPhone,
    logout,
    refreshProfile,
  }
}

export function useAuth() {
  const auth = inject(AUTH_KEY, null)
  if (!auth) {
    throw new Error('useAuth 必须在 App 中 provide AUTH_KEY')
  }
  return auth
}
