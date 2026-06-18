<template>
  <view class="top-container" :style="{ background: containerBg }">
    <view v-if="!carouselItems.length" class="top-container__empty">
      <text>暂无可见轮播</text>
    </view>
    <swiper
      v-else
      class="top-container__swiper"
      :style="{ height: `${carouselHeight}px` }"
      :autoplay="carousel?.autoplay !== false"
      :interval="carousel?.interval ?? 3000"
      :circular="carousel?.loop !== false"
      :indicator-dots="carousel?.indicator !== false"
      indicator-active-color="#6366f1"
    >
      <swiper-item v-for="(item, index) in carouselItems" :key="index">
        <view class="top-container__slide" :style="slideStyle(item)">
          <image
            v-if="item.image"
            class="top-container__image"
            :src="item.image"
            mode="aspectFill"
          />
          <text v-else class="top-container__title">{{ item.title || `轮播 ${index + 1}` }}</text>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CarouselItem {
  title?: string
  image?: string
  bgColor?: string
}

const props = withDefaults(
  defineProps<{
    containerBg?: string
    styleVariant?: number
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
    styleVariant: 1,
    carousel: () => ({}),
  }
)

const carouselItems = computed(() => props.carousel?.items ?? [])
const carouselHeight = computed(() => (props.styleVariant === 1 ? 140 : 120))

function slideStyle(item: CarouselItem) {
  if (item.image) return {}
  return { background: item.bgColor || '#eef2ff' }
}
</script>

<style scoped>
.top-container {
  overflow: hidden;
}

.top-container__empty {
  min-height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 26rpx;
  background: #f5f7fa;
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
}
</style>
