import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

export function useAuthRedirect() {
  const redirect = ref('')

  onLoad((query) => {
    if (query?.redirect) {
      redirect.value = decodeURIComponent(String(query.redirect))
    }
  })

  function finishAuthSuccess() {
    const url = redirect.value || '/pages/layout/index?code=demo-home'
    if (url.startsWith('/pages/layout/') || url.startsWith('/pages/index/')) {
      uni.reLaunch({ url })
      return
    }
    if (url.startsWith('/pages/')) {
      uni.redirectTo({ url })
      return
    }
    uni.reLaunch({ url: '/pages/layout/index?code=demo-home' })
  }

  function goLogin(extraQuery = '') {
    const base = redirect.value
      ? `/pages/login/index?redirect=${encodeURIComponent(redirect.value)}`
      : '/pages/login/index'
    uni.navigateTo({ url: extraQuery ? `${base}&${extraQuery}` : base })
  }

  function goRegister() {
    const base = redirect.value
      ? `/pages/register/index?redirect=${encodeURIComponent(redirect.value)}`
      : '/pages/register/index'
    uni.navigateTo({ url: base })
  }

  return {
    redirect,
    finishAuthSuccess,
    goLogin,
    goRegister,
  }
}
