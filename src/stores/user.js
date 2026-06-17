import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi, changePassword as changePasswordApi } from '@/api/auth'

const TOKEN_KEY = 'token'
const USER_KEY = 'userInfo'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref(JSON.parse(localStorage.getItem(USER_KEY) || '{}'))

  const isLoggedIn = () => !!token.value

  function setAuth(data) {
    token.value = data.token
    userInfo.value = data.userInfo
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.userInfo))
  }

  function clearAuth() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function login(form) {
    const data = await loginApi(form)
    setAuth(data)
    return data
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      clearAuth()
    }
  }

  async function changePassword(form) {
    await changePasswordApi(form)
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    changePassword,
    clearAuth,
  }
})
