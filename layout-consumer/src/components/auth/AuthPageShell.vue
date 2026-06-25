<template>
  <view class="auth-shell">
    <view class="auth-shell__bg">
      <view class="auth-shell__grid" />
      <view class="auth-shell__glow auth-shell__glow--a" />
      <view class="auth-shell__glow auth-shell__glow--b" />
    </view>

    <view class="auth-shell__content">
      <view class="auth-shell__hero">
        <view class="auth-shell__badge">
          <text class="auth-shell__badge-dot" />
          <text class="auth-shell__badge-text">{{ badge }}</text>
        </view>
        <text class="auth-shell__title">{{ title }}</text>
        <text class="auth-shell__desc">{{ subtitle }}</text>
      </view>

      <view class="auth-shell__card">
        <slot />
      </view>

      <view v-if="$slots.footer" class="auth-shell__footer">
        <slot name="footer" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    badge?: string
  }>(),
  {
    title: '欢迎登录',
    subtitle: '登录后享受更多服务',
    badge: 'SECURE ACCESS',
  }
)
</script>

<style scoped>
.auth-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #070b14;
}

.auth-shell__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.auth-shell__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.05) 1rpx, transparent 1rpx),
    linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1rpx, transparent 1rpx);
  background-size: 48rpx 48rpx;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 92%);
}

.auth-shell__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80rpx);
  opacity: 0.55;
}

.auth-shell__glow--a {
  top: -120rpx;
  right: -80rpx;
  width: 420rpx;
  height: 420rpx;
  background: rgba(59, 130, 246, 0.35);
}

.auth-shell__glow--b {
  bottom: 120rpx;
  left: -120rpx;
  width: 360rpx;
  height: 360rpx;
  background: rgba(0, 212, 255, 0.22);
}

.auth-shell__content {
  position: relative;
  z-index: 1;
  padding: 48rpx 40rpx 56rpx;
  box-sizing: border-box;
}

.auth-shell__hero {
  margin-bottom: 40rpx;
}

.auth-shell__badge {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(0, 212, 255, 0.28);
  background: rgba(0, 212, 255, 0.08);
}

.auth-shell__badge-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #00d4ff;
  box-shadow: 0 0 16rpx #00d4ff;
}

.auth-shell__badge-text {
  font-size: 20rpx;
  letter-spacing: 2rpx;
  color: #7dd3fc;
}

.auth-shell__title {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.25;
}

.auth-shell__desc {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #94a3b8;
  line-height: 1.5;
}

.auth-shell__card {
  padding: 36rpx 32rpx 32rpx;
  border-radius: 28rpx;
  border: 1rpx solid rgba(0, 212, 255, 0.18);
  background: rgba(15, 23, 42, 0.72);
  box-shadow:
    0 24rpx 80rpx rgba(0, 0, 0, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20rpx);
}

.auth-shell__footer {
  margin-top: 36rpx;
}
</style>
