<template>
  <div class="layout-shell" :style="pageStyle">
    <HeaderChromeBlock
      v-if="headerPreview.shouldRenderChrome"
      :header="header"
      :components="components"
      :layout-name="layoutName"
      class="layout-shell__header"
      :class="{ 'layout-shell__header--immersive': headerPreview.isImmersive }"
    />

    <div class="layout-shell__body" :style="bodyStyle">
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
import HeaderChromeBlock from '@/layout-builder/blocks/HeaderChromeBlock.vue'
import { getBlockComponent } from '@/layout-builder/registry'
import { normalizeLayoutSchema } from '@/layout-builder/utils'
import { resolveHeaderConfig } from '@shared/layout/header'
import { getLinkOptions } from '@/api/link'
import { buildLinkRegistry } from '@/utils/link'

const props = defineProps({
  schema: { type: Object, required: true },
  layoutName: { type: String, default: '布局预览' },
  interactive: { type: Boolean, default: true },
})

const linkRegistry = reactive({})

provide('linkRegistry', linkRegistry)
provide('layoutInteractive', computed(() => props.interactive))

const normalized = computed(() => normalizeLayoutSchema(props.schema))
const components = computed(() => normalized.value.components)
const tabbar = computed(() => normalized.value.chrome.tabbar)
const header = computed(() => normalized.value.chrome.header)
const headerPreview = computed(() =>
  resolveHeaderConfig(header.value, {
    components: components.value,
    layoutName: props.layoutName,
  })
)

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

const bodyStyle = computed(() => {
  if (headerPreview.value.shouldRenderChrome && !headerPreview.value.isImmersive) {
    const height = (headerPreview.value.height ?? 44) + 20
    return { paddingTop: `${height}px` }
  }
  return {}
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
  position: relative;
}

.layout-shell__header {
  flex-shrink: 0;

  &--immersive {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
  }
}

.layout-shell__body {
  flex: 1;
  min-height: 0;
  position: relative;
}

.layout-shell__tabbar {
  position: sticky;
  bottom: 0;
  z-index: 10;
}
</style>
