<template>
  <!-- #ifdef MP -->
  <page-meta page-style="overflow: hidden; height: 100%;" />
  <!-- #endif -->
  <view class="page">
    <view v-if="loading" class="state">
      <text>布局加载中...</text>
    </view>
    <view v-else-if="error" class="state state--error">
      <text>{{ error }}</text>
      <button class="btn" @tap="reload">重试</button>
    </view>
    <LayoutRenderer
      v-else-if="schema"
      ref="rendererRef"
      :schema="schema"
      :layout-name="layoutName"
      :layout-code="layoutCode"
    />
  </view>
</template>

<script setup lang="ts">
import { onLoad, onPageScroll, onReachBottom } from '@dcloudio/uni-app'
import { nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { getLayoutByCode } from '@/api/layout'
import LayoutRenderer from '@/layout/renderer/LayoutRenderer.vue'
import type { LayoutSchema } from '@/layout/types'
import { appConfig } from '@/config/env'
import { resolveHeaderConfig } from '@shared/layout/header'
import { createLayoutPageEventBus, LAYOUT_PAGE_EVENT_KEY } from '@/composables/useLayoutReachBottom'

const pageEventBus = createLayoutPageEventBus()
provide(LAYOUT_PAGE_EVENT_KEY, pageEventBus)

onReachBottom(() => {
  pageEventBus.emitReachBottom()
})

onPageScroll(() => {
  pageEventBus.emitScroll()
})

// H5 自定义导航下 onPageScroll 可能不稳定，用 window 滚动兜底
// #ifdef H5
const REACH_BOTTOM_OFFSET = 120

function handleH5Scroll() {
  pageEventBus.emitScroll()
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0
  const viewHeight = window.innerHeight || document.documentElement.clientHeight
  const scrollHeight = document.documentElement.scrollHeight
  if (scrollTop + viewHeight >= scrollHeight - REACH_BOTTOM_OFFSET) {
    pageEventBus.emitReachBottom()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleH5Scroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleH5Scroll)
})
// #endif

const loading = ref(true)
const error = ref('')
const schema = ref<LayoutSchema | null>(null)
const layoutCode = ref(appConfig.layoutCode)
const layoutName = ref('')
const rendererRef = ref<InstanceType<typeof LayoutRenderer> | null>(null)

onLoad((query) => {
  if (query?.code) {
    layoutCode.value = String(query.code)
  }
  loadLayout()
})

watch(schema, () => {
  nextTick(() => applyNativeNavigation())
})

async function loadLayout() {
  loading.value = true
  error.value = ''
  schema.value = null

  try {
    const data = await getLayoutByCode(layoutCode.value)
    layoutName.value = data.name || layoutCode.value
    schema.value = data.schema
    await nextTick()
    applyNativeNavigation()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function applyNativeNavigation() {
  if (!schema.value) return

  const header = resolveHeaderConfig(schema.value.chrome?.header, {
    components: schema.value.components ?? [],
    layoutName: layoutName.value,
    layoutCode: layoutCode.value,
  })

  if (!header.enabled || !header.title) return

  uni.setNavigationBarTitle({ title: header.title })
  // #ifdef H5
  document.title = header.title
  // #endif
}

function reload() {
  loadLayout()
}
</script>

<style scoped>
.page {
  min-height: 100vh;
}

/* #ifdef MP */
.page {
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}
/* #endif */

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
