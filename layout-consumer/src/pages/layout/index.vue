<template>
  <view class="page">
    <view v-if="loading" class="state">
      <text>布局加载中...</text>
    </view>
    <view v-else-if="error" class="state state--error">
      <text>{{ error }}</text>
      <button class="btn" @tap="reload">重试</button>
    </view>
    <LayoutRenderer v-else-if="schema" :schema="schema" />
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getLayoutByCode } from '@/api/layout'
import LayoutRenderer from '@/layout/renderer/LayoutRenderer.vue'
import type { LayoutSchema } from '@/layout/types'
import { appConfig } from '@/config/env'

const loading = ref(true)
const error = ref('')
const schema = ref<LayoutSchema | null>(null)
const layoutCode = ref(appConfig.layoutCode)

onLoad((query) => {
  if (query?.code) {
    layoutCode.value = String(query.code)
  }
  uni.setNavigationBarTitle({
    title: layoutCode.value,
  })
  loadLayout()
})

async function loadLayout() {
  loading.value = true
  error.value = ''
  schema.value = null

  try {
    const data = await getLayoutByCode(layoutCode.value)
    schema.value = data.schema
    uni.setNavigationBarTitle({
      title: data.name || layoutCode.value,
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function reload() {
  loadLayout()
}
</script>

<style scoped>
.page {
  min-height: 100vh;
}

.state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #606266;
  font-size: 28rpx;
}

.state--error {
  color: #e53935;
  padding: 32rpx;
  text-align: center;
}

.btn {
  margin-top: 24rpx;
  background: #6366f1;
  color: #fff;
  font-size: 28rpx;
}
</style>
