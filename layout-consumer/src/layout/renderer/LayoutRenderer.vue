<template>
  <view class="layout-shell" :style="pageStyle">
    <AppHeader
      v-if="showCustomHeader"
      :title="header.title"
      :show-back="headerShowBack"
      :background="header.resolvedBackground"
      :color="header.resolvedColor"
      :height="header.height"
      :safe-area-inset="header.safeAreaInset !== false"
      :immersive="header.isImmersive"
      :right-actions="header.rightActions"
      fixed
    />

    <!-- #ifdef MP -->
    <scroll-view
      class="layout-shell__scroll"
      scroll-y
      :style="scrollViewStyle"
      :lower-threshold="120"
      :enable-back-to-top="true"
      @scroll="handlePageScroll"
      @scrolltolower="handlePageReachBottom"
    >
      <view class="layout-shell__body" :style="bodyStyle">
        <template v-for="item in components" :key="item.id">
          <view
            v-if="isOverlayTopContainer(item)"
            class="layout-shell__overlay-host"
            :style="getOverlayHostStyle(item)"
          >
            <LayoutBlockRenderer :type="item.type" :block-props="item.props" />
          </view>
          <LayoutBlockRenderer
            v-else
            :type="item.type"
            :block-props="item.props"
          />
        </template>
      </view>
    </scroll-view>
    <!-- #endif -->

    <!-- #ifndef MP -->
    <view class="layout-shell__body" :style="bodyStyle">
      <template v-for="item in components" :key="item.id">
        <view
          v-if="isOverlayTopContainer(item)"
          class="layout-shell__overlay-host"
          :style="getOverlayHostStyle(item)"
        >
          <LayoutBlockRenderer :type="item.type" :block-props="item.props" />
        </view>
        <LayoutBlockRenderer
          v-else
          :type="item.type"
          :block-props="item.props"
        />
      </template>
    </view>
    <!-- #endif -->

    <TabbarBlock
      v-if="tabbar.enabled"
      class="layout-shell__tabbar"
      v-bind="tabbar.props"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, provide, reactive, ref, watch } from 'vue'
import type { LayoutSchema } from '@/layout/types'
import { normalizeLayoutSchema } from '@/layout/normalize'
import LayoutBlockRenderer from '@/layout/renderer/LayoutBlockRenderer.vue'
import TabbarBlock from '@/layout/blocks/TabbarBlock.vue'
import AppHeader from '@/layout/chrome/AppHeader.vue'
import { getLinkOptions } from '@/api/link'
import { buildLinkRegistry } from '@/utils/link'
import { useSafeAreaBottom } from '@/composables/useSafeAreaBottom'
import { useSafeAreaTop } from '@/composables/useSafeAreaTop'
import { LAYOUT_PAGE_EVENT_KEY } from '@/composables/useLayoutReachBottom'
import { resolveHeaderConfig } from '@shared/layout/header'
import { resolveTopContainerProps } from '@shared/layout/topContainer'
import { pxToRpx } from '@/utils/unit'
import type { HeaderShowBack } from '@/composables/useHeaderBack'

function readWindowHeight() {
  const getWindowInfo = (uni as unknown as { getWindowInfo?: () => { windowHeight: number } }).getWindowInfo
  if (typeof getWindowInfo === 'function') {
    return getWindowInfo().windowHeight
  }
  return uni.getSystemInfoSync().windowHeight
}

function toHeaderShowBack(value: unknown): HeaderShowBack {
  if (value === true || value === false) return value
  if (value === 'auto' || value === 'true' || value === 'false') return value
  return 'auto'
}

const props = withDefaults(
  defineProps<{
    schema: LayoutSchema
    interactive?: boolean
    layoutName?: string
    layoutCode?: string
  }>(),
  {
    interactive: true,
    layoutName: '',
    layoutCode: '',
  }
)

const linkRegistry = reactive<Record<string, import('@/layout/types').LinkRecord>>({})
const safeAreaBottom = useSafeAreaBottom()
const { topInset } = useSafeAreaTop()
const pageEventBus = inject(LAYOUT_PAGE_EVENT_KEY, null)
const windowHeight = ref(0)

// #ifdef MP
windowHeight.value = readWindowHeight()
// #endif

const scrollViewStyle = computed(() => ({
  height: windowHeight.value > 0 ? `${windowHeight.value}px` : '100vh',
}))

function handlePageScroll() {
  pageEventBus?.emitScroll()
}

function handlePageReachBottom() {
  pageEventBus?.emitReachBottom()
}

provide('linkRegistry', linkRegistry)
provide('layoutInteractive', ref(props.interactive))

const normalized = computed(() => normalizeLayoutSchema(props.schema))
const components = computed(() => normalized.value.components)
const tabbar = computed(() => normalized.value.chrome.tabbar)
const header = computed(() =>
  resolveHeaderConfig(normalized.value.chrome.header, {
    components: components.value,
    layoutName: props.layoutName,
    layoutCode: props.layoutCode,
  })
)

const showCustomHeader = computed(() => header.value.shouldRenderChrome)

const headerShowBack = computed(() => toHeaderShowBack(header.value.showBack))

const headerTotalHeightPx = computed(() => {
  if (!showCustomHeader.value) return 0
  const contentHeight = header.value.height ?? 44
  const inset = header.value.safeAreaInset !== false ? topInset.value : 0
  return inset + contentHeight
})

const layoutChrome = computed(() => ({
  headerTotalHeightPx: headerTotalHeightPx.value,
  headerContentHeightPx: header.value.height ?? 44,
  statusBarHeightPx: header.value.safeAreaInset !== false ? topInset.value : 0,
  isImmersiveHeader: header.value.isImmersive,
  showCustomHeader: showCustomHeader.value,
}))

provide('layoutChrome', layoutChrome)

watch(
  headerTotalHeightPx,
  (height) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--layout-header-total-height', `${height}px`)
    }
  },
  { immediate: true }
)

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
  const styles: Record<string, string> = {}

  if (showCustomHeader.value && !header.value.isImmersive) {
    styles.paddingTop = pxToRpx(headerTotalHeightPx.value)
  }

  if (!tabbar.value.enabled) {
    styles.paddingBottom = '24rpx'
    return styles
  }

  const height = tabbar.value.props?.height ?? 50
  const useSafeArea = tabbar.value.props?.safeAreaInset !== false
  const tabbarHeight = pxToRpx(height)

  if (!useSafeArea) {
    styles.paddingBottom = tabbarHeight
    return styles
  }

  if (safeAreaBottom.value > 0) {
    styles.paddingBottom = pxToRpx(height + safeAreaBottom.value)
    return styles
  }

  styles.paddingBottom = `calc(${tabbarHeight} + max(env(safe-area-inset-bottom), var(--lc-safe-area-bottom, 0px)))`
  return styles
})

function isOverlayTopContainer(item: { type: string; props?: Record<string, unknown> }) {
  if (item.type !== 'topContainer') return false
  const resolved = resolveTopContainerProps(item.props ?? {})
  return resolved.occupySpace === false
}

function getOverlayHostStyle(item: { type: string; props?: Record<string, unknown> }) {
  if (!isOverlayTopContainer(item)) return undefined
  const resolved = resolveTopContainerProps(item.props ?? {})
  return { minHeight: `${resolved.carouselHeight}px` }
}

onMounted(async () => {
  try {
    const list = await getLinkOptions()
    Object.assign(linkRegistry, buildLinkRegistry(list ?? []))
  } catch {
    /* 链接库加载失败时仍可使用旧版直链 */
  }
})

defineExpose({
  header,
  showCustomHeader,
})
</script>

<style scoped>
.layout-shell {
  width: 100%;
}

/* #ifdef MP */
.layout-shell {
  height: 100vh;
  overflow: hidden;
}

.layout-shell__scroll {
  width: 100%;
}
/* #endif */

/* #ifndef MP */
.layout-shell {
  min-height: 100vh;
}
/* #endif */

.layout-shell__body {
  position: relative;
}

.layout-shell__overlay-host {
  position: relative;
  z-index: 1;
}

.layout-shell__tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}
</style>
