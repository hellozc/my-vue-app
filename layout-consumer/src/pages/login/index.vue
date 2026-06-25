<template>
  <view class="auth-page">
    <AuthPageShell title="欢迎登录" subtitle="连接你的数字生活空间" badge="MEMBER ACCESS">
    <view class="auth-tabs">
      <view
        v-if="capabilities.password"
        class="auth-tab"
        :class="{ 'is-active': activeTab === 'password' }"
        @tap="activeTab = 'password'"
      >
        密码登录
      </view>
      <view
        v-if="capabilities.sms"
        class="auth-tab"
        :class="{ 'is-active': activeTab === 'sms' }"
        @tap="activeTab = 'sms'"
      >
        验证码登录
      </view>
    </view>

    <view v-if="activeTab === 'password'" class="auth-form">
      <AuthField label="账号" icon="👤">
        <input
          v-model="account"
          class="auth-input"
          placeholder="手机号 / 用户名"
          placeholder-class="auth-input__placeholder"
          confirm-type="next"
        />
      </AuthField>
      <AuthField label="密码" icon="🔒">
        <input
          v-model="password"
          class="auth-input"
          password
          placeholder="请输入密码"
          placeholder-class="auth-input__placeholder"
          confirm-type="done"
          @confirm="handleLogin"
        />
      </AuthField>
      <button class="auth-btn" :loading="submitting" @tap="handleLogin">登 录</button>
      <text class="auth-hint">演示账号：demo 或 13800138000，密码 123456</text>
    </view>

    <view v-else class="auth-form">
      <AuthField label="手机号" icon="📱">
        <input
          v-model="phone"
          class="auth-input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          placeholder-class="auth-input__placeholder"
          confirm-type="next"
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
          confirm-type="done"
          @confirm="handleSmsLogin"
        />
        <button
          class="auth-code-btn"
          :disabled="smsCountdown > 0 || sendingCode"
          @tap="handleSendCode"
        >
          {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
        </button>
      </AuthField>
      <button class="auth-btn" :loading="submitting" @tap="handleSmsLogin">登 录</button>
      <text v-if="mockCodeHint" class="auth-hint">开发环境验证码：{{ mockCodeHint }}</text>
      <text v-else class="auth-hint">演示手机号 13800138000，验证码见服务端日志</text>
    </view>

    <view v-if="showOAuthSection" class="auth-oauth">
      <view class="auth-divider"><text>其他登录方式</text></view>
      <view class="auth-oauth-list">
        <button
          v-if="clientCapabilities.showWechatPhone"
          class="auth-oauth-btn auth-oauth-btn--wechat"
          open-type="getPhoneNumber"
          :loading="submitting"
          @getphonenumber="handleWechatPhone"
        >
          <text class="auth-oauth-icon">📱</text>
          <text>微信手机号快捷登录</text>
        </button>
        <button
          v-if="clientCapabilities.showWechat && !clientCapabilities.showWechatPhone"
          class="auth-oauth-btn auth-oauth-btn--wechat"
          :loading="submitting"
          @tap="handleWechatLogin"
        >
          <text class="auth-oauth-icon">💬</text>
          <text>微信登录</text>
        </button>
        <button
          v-if="clientCapabilities.showOneclick"
          class="auth-oauth-btn"
          :loading="submitting"
          @tap="handleOneclickLogin"
        >
          <text class="auth-oauth-icon">📞</text>
          <text>本机号码一键登录</text>
        </button>
      </view>
    </view>

    <view v-if="capabilities.register" class="auth-switch" @tap="goRegister">
      <text>还没有账号？</text>
      <text class="auth-switch__link">立即注册</text>
    </view>
  </AuthPageShell>

  <view class="auth-agreement-wrap">
    <AuthAgreement :model-value="agreed" @toggle="agreed = !agreed" />
  </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAuthCapabilities, type AuthCapabilities } from '@/api/member'
import AuthAgreement from '@/components/auth/AuthAgreement.vue'
import AuthField from '@/components/auth/AuthField.vue'
import AuthPageShell from '@/components/auth/AuthPageShell.vue'
import { useAuth } from '@/composables/useAuth'
import { useAuthRedirect } from '@/composables/useAuthRedirect'
import { useSmsSender } from '@/composables/useSmsSender'
import { resolveClientAuthCapabilities } from '@/utils/authPlatform'

const auth = useAuth()
const { finishAuthSuccess, goRegister } = useAuthRedirect()
const { countdown: smsCountdown, sending: sendingCode, mockCodeHint, sendCode } = useSmsSender()

const account = ref('')
const password = ref('')
const phone = ref('')
const smsCode = ref('')
const agreed = ref(false)
const submitting = ref(false)
const activeTab = ref<'password' | 'sms'>('password')
const capabilities = ref<AuthCapabilities>({
  password: true,
  sms: false,
  wechat: false,
  oneclick: false,
  wechatPhone: false,
  register: true,
  defaultTab: 'password',
  agreementUrl: '',
  privacyUrl: '',
})

const showOAuthSection = computed(() => {
  const resolved = resolveClientAuthCapabilities(capabilities.value)
  return resolved.showWechat || resolved.showOneclick || resolved.showWechatPhone
})

const clientCapabilities = computed(() => resolveClientAuthCapabilities(capabilities.value))

onLoad(() => {
  if (auth.isLoggedIn.value) {
    finishAuthSuccess()
  }
})

onMounted(async () => {
  try {
    const data = await getAuthCapabilities()
    capabilities.value = data
    activeTab.value = data.defaultTab === 'sms' && data.sms ? 'sms' : 'password'
  } catch {
    /* 使用默认能力配置 */
  }
})

async function handleSendCode() {
  await sendCode(phone.value)
}

function ensureAgreed() {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return false
  }
  return true
}

async function handleSmsLogin() {
  if (!ensureAgreed()) return
  if (!/^1\d{10}$/.test(phone.value.trim()) || !smsCode.value.trim()) {
    uni.showToast({ title: '请输入手机号和验证码', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await auth.loginWithSms(phone.value.trim(), smsCode.value.trim())
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => finishAuthSuccess(), 300)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '登录失败',
      icon: 'none',
    })
  } finally {
    submitting.value = false
  }
}

async function handleWechatLogin() {
  if (!ensureAgreed()) return
  submitting.value = true
  try {
    await auth.loginWithWechat()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => finishAuthSuccess(), 300)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '微信登录失败',
      icon: 'none',
    })
  } finally {
    submitting.value = false
  }
}

async function handleWechatPhone(event: { detail: { errMsg?: string; code?: string } }) {
  if (!ensureAgreed()) return
  const detail = event.detail || {}
  if (detail.errMsg !== 'getPhoneNumber:ok' || !detail.code) {
    uni.showToast({ title: '授权已取消', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await auth.loginWithWechatPhone(detail.code)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => finishAuthSuccess(), 300)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '微信手机号登录失败',
      icon: 'none',
    })
  } finally {
    submitting.value = false
  }
}

async function handleOneclickLogin() {
  if (!ensureAgreed()) return
  submitting.value = true
  try {
    await auth.loginWithOneclick()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => finishAuthSuccess(), 300)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '一键登录失败',
      icon: 'none',
    })
  } finally {
    submitting.value = false
  }
}

async function handleLogin() {
  if (!ensureAgreed()) return
  if (!account.value.trim() || !password.value) {
    uni.showToast({ title: '请输入账号和密码', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await auth.loginWithPassword(account.value.trim(), password.value)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => finishAuthSuccess(), 300)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '登录失败',
      icon: 'none',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import '@/styles/auth-form.css';

.auth-oauth-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

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
