<template>
  <view
    class="top-container"
    :class="[
      `top-container--${resolved.variantMeta.wireframe}`,
      { 'top-container--overlay': isOverlay },
    ]"
    :style="containerStyle"
  >
    <image
      v-if="showBackground"
      class="top-container__background"
      :src="backgroundImageUrl"
      mode="aspectFill"
    />

    <view class="top-container__content" :style="contentStyle">
      <view v-if="showEmpty" class="top-container__empty">
        <text>{{ emptyHint }}</text>
      </view>
      <swiper
        v-else-if="isCarouselMode && carouselItems.length"
        class="top-container__swiper"
        :style="{ height: `${resolved.carouselHeight}px` }"
        :autoplay="resolved.carousel.autoplay !== false"
        :interval="resolved.carousel.interval ?? 3000"
        :circular="resolved.carousel.loop !== false"
        :indicator-dots="resolved.carousel.indicator !== false"
        indicator-active-color="#6366f1"
      >
        <swiper-item v-for="(item, index) in carouselItems" :key="index">
          <AppLink
            block
            :link-code="item.linkCode"
            :legacy-link="item.link"
            class="top-container__slide"
            :style="slideStyle(item)"
          >
            <image
              v-if="item.image"
              class="top-container__image"
              :src="resolveMediaUrl(item.image)"
              mode="aspectFill"
            />
            <text v-else-if="item.title" class="top-container__title">{{ item.title }}</text>
          </AppLink>
        </swiper-item>
      </swiper>
      <view
        v-else-if="isBackgroundMode && showBackground"
        class="top-container__static-hero"
        :style="{ height: `${resolved.carouselHeight}px` }"
      />
    </view>

    <view v-if="showBrand" class="top-container__brand" :style="brandStyle">
      <AppLink
        :link-code="resolved.brand.linkCode"
        :legacy-link="resolved.brand.link"
        class="top-container__brand-inner"
      >
        <image
          v-if="resolved.brand.logo"
          class="top-container__brand-logo"
          :src="resolveMediaUrl(resolved.brand.logo)"
          mode="aspectFill"
        />
        <text v-if="resolved.brand.title" class="top-container__brand-title">
          {{ resolved.brand.title }}
        </text>
      </AppLink>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, inject, type CSSProperties, type Ref } from 'vue'
import AppLink from '@/layout/components/AppLink.vue'
import { resolveTopContainerProps, hasTopContainerBrandContent, TOP_CONTAINER_VISUAL_MODE } from '@shared/layout/topContainer'
import { resolveMediaUrl } from '@/utils/media'

interface CarouselItem {
  title?: string
  image?: string
  bgColor?: string
  linkCode?: string
  link?: string
}

const props = withDefaults(
  defineProps<{
    variant?: string
    styleVariant?: number
    containerBg?: string
    backgroundImage?: string
    background?: {
      show?: boolean
      image?: string
    }
    occupySpace?: boolean
    brand?: {
      show?: boolean
      logo?: string
      title?: string
      linkCode?: string
      link?: string
    }
    carousel?: {
      autoplay?: boolean
      interval?: number
      loop?: boolean
      indicator?: boolean
      items?: CarouselItem[]
    }
  }>(),
  {
    containerBg: '#ffffff',
    backgroundImage: '',
    background: () => ({}),
    carousel: () => ({}),
  }
)

const resolved = computed(() => resolveTopContainerProps(props))
const isOverlay = computed(() => resolved.value.occupySpace === false)
const isCarouselMode = computed(
  () => resolved.value.visualMode === TOP_CONTAINER_VISUAL_MODE.CAROUSEL
)
const isBackgroundMode = computed(
  () => resolved.value.visualMode === TOP_CONTAINER_VISUAL_MODE.BACKGROUND
)
const carouselItems = computed(() => resolved.value.carousel.items ?? [])
const backgroundImageUrl = computed(() => resolveMediaUrl(resolved.value.background.image))
const showBackground = computed(
  () =>
    isBackgroundMode.value &&
    resolved.value.background.show !== false &&
    Boolean(backgroundImageUrl.value)
)
const showEmpty = computed(
  () =>
    (isBackgroundMode.value && !showBackground.value) ||
    (isCarouselMode.value && !carouselItems.value.length)
)
const emptyHint = computed(() => {
  if (isCarouselMode.value) return '请添加轮播图'
  return '请上传顶部背景图'
})
const showBrand = computed(() => {
  const { brand, variantMeta } = resolved.value
  return (
    variantMeta.features.brand &&
    brand.show !== false &&
    hasTopContainerBrandContent(brand)
  )
})

const defaultLayoutChrome = {
  headerTotalHeightPx: 0,
  isImmersiveHeader: false,
  showCustomHeader: false,
}

const layoutChrome = inject<Ref<typeof defaultLayoutChrome> | null>('layoutChrome', null)

const brandStyle = computed(() => {
  const chrome = layoutChrome?.value ?? defaultLayoutChrome
  if (!chrome.showCustomHeader || !chrome.isImmersiveHeader) {
    return {}
  }
  const offset = chrome.headerTotalHeightPx
  if (offset > 0) {
    return { top: `calc(${offset}px + 20rpx)` }
  }
  return { top: 'calc(env(safe-area-inset-top) + 20rpx)' }
})

const containerStyle = computed((): CSSProperties => {
  const style: CSSProperties = {
    background: resolved.value.containerBg,
  }
  if (isOverlay.value) {
    style.position = 'absolute'
    style.top = 0
    style.left = 0
    style.right = 0
    style.zIndex = 1
  }
  return style
})

const contentStyle = computed((): CSSProperties => ({
  minHeight: `${resolved.value.carouselHeight}px`,
}))

function slideStyle(item: CarouselItem): CSSProperties {
  if (item.image) return {}
  return { background: item.bgColor || 'transparent' }
}
</script>

<style scoped>
.top-container {
  position: relative;
  overflow: hidden;
}

.top-container--overlay {
  border-radius: 0;
}

.top-container__background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.top-container__content {
  position: relative;
  z-index: 1;
}

.top-container__static-hero {
  width: 100%;
}

.top-container__empty {
  min-height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 26rpx;
  background: rgba(245, 247, 250, 0.72);
}

.top-container__slide {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-container__image {
  width: 100%;
  height: 100%;
}

.top-container__title {
  color: #4338ca;
  font-size: 30rpx;
  font-weight: 600;
  padding: 0 32rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 12rpx;
}

.top-container__brand {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  z-index: 2;
}

.top-container__brand-inner {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 16rpx 8rpx 8rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.08);
}

.top-container__brand-logo {
  width: 56rpx;
  height: 56rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.top-container__brand-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #303133;
  max-width: 280rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
