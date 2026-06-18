<template>
  <view class="page">
    <view class="hero">
      <text class="hero__title">布局展示 C 端</text>
      <text class="hero__desc">拉取管理端已发布布局，多端预览渲染效果</text>
    </view>

    <view class="card">
      <text class="card__label">布局编码</text>
      <input
        v-model="layoutCode"
        class="card__input"
        placeholder="如 demo-home"
        confirm-type="go"
        @confirm="openLayout"
      />
      <button class="btn btn--primary" @tap="openLayout">查看布局</button>
      <button class="btn btn--ghost" @tap="openDemo">打开预览示例 demo-home</button>
    </view>

    <view class="tips">
      <text class="tips__title">支持平台</text>
      <text class="tips__item">H5 · 微信小程序 · 支付宝小程序 · App</text>
      <text class="tips__item">API：{{ apiBaseUrl }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { appConfig } from '@/config/env'

const layoutCode = ref(appConfig.layoutCode)
const apiBaseUrl = appConfig.apiBaseUrl

function openLayout() {
  const code = layoutCode.value.trim()
  if (!code) {
    uni.showToast({ title: '请输入布局编码', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/layout/index?code=${encodeURIComponent(code)}`,
  })
}

function openDemo() {
  layoutCode.value = 'demo-home'
  openLayout()
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  background: #f5f7fa;
  box-sizing: border-box;
}

.hero__title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #303133;
}

.hero__desc {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #606266;
  line-height: 1.6;
}

.card {
  margin-top: 48rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 20rpx;
}

.card__label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #303133;
}

.card__input {
  height: 80rpx;
  padding: 0 24rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.btn {
  margin-top: 24rpx;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
}

.btn--primary {
  background: #6366f1;
  color: #fff;
}

.btn--ghost {
  background: #eef2ff;
  color: #6366f1;
}

.tips {
  margin-top: 40rpx;
  padding: 24rpx;
}

.tips__title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #303133;
}

.tips__item {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #909399;
  line-height: 1.5;
}
</style>
