<template>
  <view class="layout-shell" :style="pageStyle">
    <view class="layout-shell__body" :style="bodyStyle">
      <template v-for="item in components" :key="item.id">
        <component
          :is="resolveBlock(item.type)"
          v-if="resolveBlock(item.type)"
          v-bind="item.props"
        />
      </template>
    </view>
    <TabbarBlock
      v-if="tabbar.enabled"
      class="layout-shell__tabbar"
      v-bind="tabbar.props"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref } from 'vue'
import type { LayoutSchema } from '@/layout/types'
import { normalizeLayoutSchema } from '@/layout/normalize'
import { getBlockComponent } from '@/layout/registry'
import TabbarBlock from '@/layout/blocks/TabbarBlock.vue'
import { getLinkOptions } from '@/api/link'
import { buildLinkRegistry } from '@/utils/link'
import { useSafeAreaBottom } from '@/composables/useSafeAreaBottom'
import { pxToRpx } from '@/utils/unit'

const props = withDefaults(
  defineProps<{
    schema: LayoutSchema
    interactive?: boolean
  }>(),
  {
    interactive: true,
  }
)

const linkRegistry = reactive<Record<string, import('@/layout/types').LinkRecord>>({})
const safeAreaBottom = useSafeAreaBottom()

provide('linkRegistry', linkRegistry)
provide('layoutInteractive', ref(props.interactive))

const normalized = computed(() => normalizeLayoutSchema(props.schema))
const components = computed(() => normalized.value.components)
const tabbar = computed(() => normalized.value.chrome.tabbar)

const pageStyle = computed(() => {
  const settings = normalized.value.pageSettings
  if (settings.backgroundType === 'image' && settings.backgroundImage) {
    return {
      backgroundImage: `url(${settings.backgroundImage})`,
      backgroundSize: '100% auto',
      backgroundColor: settings.backgroundColor || '#f5f7fa',
    }
  }
  return {
    backgroundColor: settings.backgroundColor || '#f5f7fa',
  }
})

const bodyStyle = computed(() => {
  if (!tabbar.value.enabled) {
    return { paddingBottom: '24rpx' }
  }

  const height = tabbar.value.props?.height ?? 50
  const useSafeArea = tabbar.value.props?.safeAreaInset !== false
  const tabbarHeight = pxToRpx(height)

  if (!useSafeArea) {
    return { paddingBottom: tabbarHeight }
  }

  if (safeAreaBottom.value > 0) {
    return { paddingBottom: `calc(${tabbarHeight} + ${pxToRpx(safeAreaBottom.value)})` }
  }

  return {
    paddingBottom: `calc(${tabbarHeight} + env(safe-area-inset-bottom))`,
  }
})

function resolveBlock(type: string) {
  return getBlockComponent(type)
}

onMounted(async () => {
  try {
    const list = await getLinkOptions()
    Object.assign(linkRegistry, buildLinkRegistry(list ?? []))
  } catch {
    /* 链接库加载失败时仍可使用旧版直链 */
  }
})
</script>

<style scoped>
.layout-shell {
  min-height: 100vh;
}

.layout-shell__body {
  min-height: 100vh;
}

.layout-shell__tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}
</style>
