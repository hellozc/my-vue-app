<template>
  <div
    class="lb-block top-container"
    :class="[
      `top-container--${resolved.variantMeta.wireframe}`,
      { 'top-container--overlay': isOverlay },
    ]"
    :style="containerStyle"
  >
    <img
      v-if="showBackground"
      class="top-container__background"
      :src="backgroundImageUrl"
      alt=""
    />

    <div class="top-container__content" :style="contentStyle">
      <div v-if="showEmpty" class="lb-block__empty">
        <el-icon><Picture /></el-icon>
        <span>{{ emptyHint }}</span>
      </div>
      <template v-else-if="isCarouselMode">
        <div
          v-if="!carouselItems.length"
          class="lb-block__empty lb-block__empty--hero"
          :style="{ height: `${resolved.carouselHeight}px` }"
        >
          <el-icon><Picture /></el-icon>
          <span>请在「内容配置」添加轮播图</span>
        </div>
        <el-carousel
          v-else
          :height="`${resolved.carouselHeight}px`"
        :interval="resolved.carousel.interval"
        :autoplay="resolved.carousel.autoplay !== false"
        :loop="resolved.carousel.loop !== false"
        :indicator-position="resolved.carousel.indicator !== false ? undefined : 'none'"
      >
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <AppLink
            :link-code="item.linkCode"
            :legacy-link="item.link"
            tag="div"
            class="lb-carousel-slide"
            :style="slideStyle(item)"
          >
            <img
              v-if="item.image"
              class="top-container__slide-image"
              :src="resolveMediaUrl(item.image)"
              alt=""
            />
            <span v-else-if="item.title" class="top-container__slide-title">
              {{ item.title }}
            </span>
          </AppLink>
        </el-carousel-item>
      </el-carousel>
      </template>
      <div
        v-else-if="isBackgroundMode && showBackground"
        class="top-container__static-hero"
        :style="{ height: `${resolved.carouselHeight}px` }"
      />
    </div>

    <div v-if="showBrand" class="top-container__brand">
      <AppLink
        :link-code="resolved.brand.linkCode"
        :legacy-link="resolved.brand.link"
        tag="div"
        class="top-container__brand-inner"
      >
        <img
          v-if="resolved.brand.logo"
          class="top-container__brand-logo"
          :src="resolveMediaUrl(resolved.brand.logo)"
          alt=""
        />
        <span v-if="resolved.brand.title" class="top-container__brand-title">
          {{ resolved.brand.title }}
        </span>
      </AppLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import { AppLink } from '@/components/link'
import { resolveTopContainerProps, hasTopContainerBrandContent, TOP_CONTAINER_VISUAL_MODE } from '@shared/layout/topContainer'
import { resolveMediaUrl } from '@/utils/media'

const props = defineProps({
  variant: { type: String, default: '' },
  styleVariant: { type: Number, default: undefined },
  containerBg: { type: String, default: '#ffffff' },
  backgroundImage: { type: String, default: '' },
  background: { type: Object, default: () => ({}) },
  occupySpace: { type: Boolean, default: undefined },
  brand: { type: Object, default: () => ({}) },
  carousel: { type: Object, default: () => ({}) },
})

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
  if (isCarouselMode.value) return '请在「内容配置」添加轮播图'
  return '请在「内容配置」上传顶部背景图'
})
const showBrand = computed(() => {
  const { brand, variantMeta } = resolved.value
  return (
    variantMeta.features.brand &&
    brand.show !== false &&
    hasTopContainerBrandContent(brand)
  )
})

const containerStyle = computed(() => ({
  background: resolved.value.containerBg,
  ...(isOverlay.value
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
      }
    : {}),
}))

const contentStyle = computed(() => ({
  minHeight: `${resolved.value.carouselHeight}px`,
}))

function slideStyle(item) {
  if (item.image) {
    return { background: 'transparent' }
  }
  return {
    background: item.bgColor || 'transparent',
  }
}
</script>

<style scoped lang="scss">
.top-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.top-container--overlay {
  border-radius: 0;
}

.top-container__background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  z-index: 0;
  pointer-events: none;
}

.top-container__content {
  position: relative;
  z-index: 1;
}

.top-container__static-hero {
  width: 100%;
}

.top-container--immersive .top-container__brand {
  top: 10px;
}

.top-container--compact .top-container__brand {
  top: 8px;
}

.lb-block__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  min-height: inherit;
  color: #909399;
  font-size: 13px;
  background: rgba(245, 247, 250, 0.72);
}

.lb-carousel-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow: hidden;
}

.top-container__slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.top-container__slide-title {
  color: #4338ca;
  font-size: 14px;
  font-weight: 600;
  padding: 0 16px;
  text-align: center;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 8px;
}

.top-container__brand {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  pointer-events: none;

  .top-container__brand-inner {
    pointer-events: auto;
  }
}

.top-container__brand-inner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.top-container__brand-logo {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.top-container__brand-title {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
