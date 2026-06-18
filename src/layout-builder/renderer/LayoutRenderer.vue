<template>
  <div class="layout-shell" :style="pageStyle">
    <div class="layout-shell__body">
      <component
        v-for="item in components"
        :key="item.id"
        :is="resolveBlock(item.type)"
        v-bind="item.props"
      />
    </div>
    <TabbarBlock
      v-if="tabbar.enabled"
      class="layout-shell__tabbar"
      v-bind="tabbar.props"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, provide, reactive } from 'vue'
import TabbarBlock from '@/layout-builder/blocks/TabbarBlock.vue'
import { getBlockComponent } from '@/layout-builder/registry'
import { normalizeLayoutSchema } from '@/layout-builder/utils'
import { getLinkOptions } from '@/api/link'
import { buildLinkRegistry } from '@/utils/link'

const props = defineProps({
  schema: { type: Object, required: true },
  /** 是否允许点击跳转并统计（编辑器预览可设为 false） */
  interactive: { type: Boolean, default: true },
})

const linkRegistry = reactive({})

provide('linkRegistry', linkRegistry)
provide('layoutInteractive', computed(() => props.interactive))

const normalized = computed(() => normalizeLayoutSchema(props.schema))
const components = computed(() => normalized.value.components)
const tabbar = computed(() => normalized.value.chrome.tabbar)

const pageStyle = computed(() => {
  const settings = normalized.value.pageSettings
  if (settings.backgroundType === 'image' && settings.backgroundImage) {
    return {
      backgroundImage: `url(${settings.backgroundImage})`,
      backgroundSize: '100% auto',
      backgroundPosition: 'top center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return { backgroundColor: settings.backgroundColor || '#f5f7fa' }
})

function resolveBlock(type) {
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

<style scoped lang="scss">
.layout-shell {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.layout-shell__body {
  flex: 1;
  min-height: 0;
}

.layout-shell__tabbar {
  position: sticky;
  bottom: 0;
  z-index: 10;
}
</style>
