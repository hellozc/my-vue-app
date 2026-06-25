<template>
  <view class="auth-page">
    <AuthPageShell title="创建账号" subtitle="注册后即可同步享受全部会员服务" badge="NEW ACCOUNT">
    <AuthField label="昵称" icon="✨">
      <input
        v-model="nickname"
        class="auth-input"
        maxlength="20"
        placeholder="选填，默认自动生成"
        placeholder-class="auth-input__placeholder"
      />
    </AuthField>

    <AuthField label="手机号" icon="📱">
      <input
        v-model="phone"
        class="auth-input"
        type="number"
        maxlength="11"
        placeholder="请输入手机号"
        placeholder-class="auth-input__placeholder"
      />
    </AuthField>

    <AuthField label="验证码" icon="🔐" row>
      <input
        v-model="smsCode"
        class="auth-input"
        type="number"
        maxlength="6"
        placeholder="6位验证码"
        placeholder-class="auth-input__placeholder"
      />
      <button
        class="auth-code-btn"
        :disabled="smsCountdown > 0 || sendingCode"
        @tap="handleSendCode"
      >
        {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
      </button>
    </AuthField>

    <AuthField label="设置密码" icon="🔒">
      <input
        v-model="password"
        class="auth-input"
        password
        placeholder="至少 6 位"
        placeholder-class="auth-input__placeholder"
      />
    </AuthField>

    <AuthField label="确认密码" icon="🔑">
      <input
        v-model="confirmPassword"
        class="auth-input"
        password
        placeholder="再次输入密码"
        placeholder-class="auth-input__placeholder"
        @confirm="handleRegister"
      />
    </AuthField>

    <button class="auth-btn" :loading="submitting" @tap="handleRegister">注 册</button>
    <text v-if="mockCodeHint" class="auth-hint">开发环境验证码：{{ mockCodeHint }}</text>

    <view class="auth-switch" @tap="goLogin">
      <text>已有账号？</text>
      <text class="auth-switch__link">去登录</text>
    </view>
  </AuthPageShell>

  <view class="auth-agreement-wrap">
    <AuthAgreement :model-value="agreed" @toggle="agreed = !agreed" />
  </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAuthCapabilities } from '@/api/member'
import AuthAgreement from '@/components/auth/AuthAgreement.vue'
import AuthField from '@/components/auth/AuthField.vue'
import AuthPageShell from '@/components/auth/AuthPageShell.vue'
import { useAuth } from '@/composables/useAuth'
import { useAuthRedirect } from '@/composables/useAuthRedirect'
import { useSmsSender } from '@/composables/useSmsSender'

const auth = useAuth()
const { finishAuthSuccess, goLogin } = useAuthRedirect()
const { countdown: smsCountdown, sending: sendingCode, mockCodeHint, sendCode } = useSmsSender()

const nickname = ref('')
const phone = ref('')
const smsCode = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreed = ref(false)
const submitting = ref(false)
const registerEnabled = ref(true)

onLoad(() => {
  if (auth.isLoggedIn.value) {
    finishAuthSuccess()
  }
})

onMounted(async () => {
  try {
    const data = await getAuthCapabilities()
    registerEnabled.value = data.register !== false
    if (!registerEnabled.value) {
      uni.showToast({ title: '注册功能未开启', icon: 'none' })
      setTimeout(() => goLogin(), 400)
    }
  } catch {
    /* 默认可注册 */
  }
})

async function handleSendCode() {
  await sendCode(phone.value, 'register')
}

function ensureAgreed() {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return false
  }
  return true
}

async function handleRegister() {
  if (!registerEnabled.value) return
  if (!ensureAgreed()) return

  const normalizedPhone = phone.value.trim()
  if (!/^1\d{10}$/.test(normalizedPhone)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  if (!smsCode.value.trim()) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  if (password.value.length < 6) {
    uni.showToast({ title: '密码至少 6 位', icon: 'none' })
    return
  }
  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await auth.registerWithPhone({
      phone: normalizedPhone,
      code: smsCode.value.trim(),
      password: password.value,
      nickname: nickname.value.trim(),
    })
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => finishAuthSuccess(), 300)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '注册失败',
      icon: 'none',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import '@/styles/auth-form.css';

.auth-page {
  min-height: 100vh;
  background: #070b14;
}

.auth-agreement-wrap {
  position: relative;
  z-index: 2;
  margin-top: -20rpx;
  padding: 0 40rpx 48rpx;
  background: #070b14;
}
</style>
