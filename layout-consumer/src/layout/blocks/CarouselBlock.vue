<template>
  <view class="carousel-block">
    <view v-if="!items.length" class="carousel-block__empty">
      <text>暂无轮播图</text>
    </view>
    <swiper
      v-else
      class="carousel-block__swiper"
      :style="{ height: `${height * 2}rpx` }"
      :autoplay="autoplay"
      :interval="interval"
      :circular="loop"
      :indicator-dots="indicator"
      indicator-active-color="#6366f1"
    >
      <swiper-item v-for="(item, index) in items" :key="index">
        <view class="carousel-block__slide" :style="slideStyle(item)">
          <image
            v-if="item.image"
            class="carousel-block__image"
            :src="item.image"
            mode="aspectFill"
          />
          <text v-else class="carousel-block__title">{{ item.title || `轮播 ${index + 1}` }}</text>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
interface CarouselItem {
  title?: string
  image?: string
  bgColor?: string
}

withDefaults(
  defineProps<{
    height?: number
    autoplay?: boolean
    interval?: number
    loop?: boolean
    indicator?: boolean
    items?: CarouselItem[]
  }>(),
  {
    height: 160,
    autoplay: true,
    interval: 3500,
    loop: true,
    indicator: true,
    items: () => [],
  }
)

function slideStyle(item: CarouselItem) {
  if (item.image) return {}
  return { background: item.bgColor || '#eef2ff' }
}
</script>

<style scoped>
.carousel-block {
  margin: 24rpx 24rpx 0;
  border-radius: 16rpx;
  overflow: hidden;
}

.carousel-block__empty {
  min-height: 280rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background: #f5f7fa;
}

.carousel-block__slide {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-block__image {
  width: 100%;
  height: 100%;
}

.carousel-block__title {
  color: #4338ca;
  font-size: 30rpx;
  font-weight: 600;
  padding: 0 32rpx;
  text-align: center;
}
</style>
