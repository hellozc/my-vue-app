import { ref } from 'vue'
import { sendSmsCode } from '@/api/member'

export function useSmsSender() {
  const countdown = ref(0)
  const sending = ref(false)
  const mockCodeHint = ref('')

  async function sendCode(phone: string, scene: 'login' | 'register' = 'login') {
    if (!/^1\d{10}$/.test(phone.trim())) {
      uni.showToast({ title: '请输入正确手机号', icon: 'none' })
      return false
    }
    if (countdown.value > 0 || sending.value) return false

    sending.value = true
    try {
      const data = await sendSmsCode(phone.trim(), scene)
      mockCodeHint.value = data.mockCode || ''
      uni.showToast({ title: '验证码已发送', icon: 'none' })
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value -= 1
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
      return true
    } catch (err) {
      uni.showToast({
        title: err instanceof Error ? err.message : '发送失败',
        icon: 'none',
      })
      return false
    } finally {
      sending.value = false
    }
  }

  return {
    countdown,
    sending,
    mockCodeHint,
    sendCode,
  }
}
