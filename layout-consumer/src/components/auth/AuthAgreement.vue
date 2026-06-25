<template>
  <view class="auth-agreement" @tap="$emit('toggle')">
    <view class="auth-agreement__checkbox" :class="{ 'is-checked': modelValue }">
      <text v-if="modelValue" class="auth-agreement__check">✓</text>
    </view>
    <text class="auth-agreement__text">
      我已阅读并同意
      <text class="auth-agreement__link">《用户协议》</text>
      和
      <text class="auth-agreement__link">《隐私政策》</text>
    </text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<style scoped>
.auth-agreement {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0 8rpx;
}

.auth-agreement__checkbox {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
  margin-top: 4rpx;
  border: 2rpx solid rgba(148, 163, 184, 0.5);
  border-radius: 8rpx;
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-agreement__checkbox.is-checked {
  border-color: #00d4ff;
  background: linear-gradient(135deg, #0ea5e9, #3b82f6);
  box-shadow: 0 0 20rpx rgba(14, 165, 233, 0.35);
}

.auth-agreement__check {
  font-size: 20rpx;
  color: #fff;
  line-height: 1;
}

.auth-agreement__text {
  flex: 1;
  font-size: 24rpx;
  color: #94a3b8;
  line-height: 1.6;
}

.auth-agreement__link {
  color: #38bdf8;
}
</style>
