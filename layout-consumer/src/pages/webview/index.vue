<template>
  <web-view v-if="url" :src="url" />
  <view v-else class="empty">
    <text>缺少链接地址</text>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const url = ref('')

onLoad((query) => {
  url.value = query?.url ? decodeURIComponent(String(query.url)) : ''
})
</script>

<style scoped>
.empty {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
</style>
