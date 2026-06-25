<template>
  <view class="auth-field">
    <text v-if="label" class="auth-field__label">{{ label }}</text>
    <view class="auth-field__control" :class="{ 'auth-field__control--row': row }">
      <view v-if="icon" class="auth-field__icon-wrap">
        <text class="auth-field__icon">{{ icon }}</text>
      </view>
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    icon?: string
    row?: boolean
  }>(),
  {
    label: '',
    icon: '',
    row: false,
  }
)
</script>

<style scoped>
.auth-field {
  margin-bottom: 28rpx;
}

.auth-field__label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  color: #94a3b8;
  letter-spacing: 1rpx;
}

.auth-field__control {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 92rpx;
  padding: 0 8rpx 0 20rpx;
  border-radius: 18rpx;
  border: 1rpx solid rgba(148, 163, 184, 0.18);
  background: rgba(2, 6, 23, 0.55);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.04);
}

.auth-field__control--row {
  gap: 16rpx;
  padding-right: 16rpx;
}

.auth-field__icon-wrap {
  width: 48rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-field__icon {
  font-size: 30rpx;
  line-height: 1;
  opacity: 0.9;
}
</style>
