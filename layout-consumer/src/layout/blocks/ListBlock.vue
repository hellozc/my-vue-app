<template>
  <view class="list-block" :style="blockStyle">
    <view v-if="header.show" class="list-block__header">
      <view class="list-block__header-left">
        <view class="list-block__accent" :style="{ background: header.accentColor }" />
        <text class="list-block__header-title">{{ header.title || '模块标题' }}</text>
      </view>
      <AppLink
        v-if="header.showMore"
        class="list-block__more"
        :link-code="header.moreLinkCode"
        :legacy-link="header.moreLink"
      >
        <text>{{ header.moreText || '更多>' }}</text>
      </AppLink>
    </view>

    <AppLink
      v-for="(item, index) in items"
      :key="index"
      class="list-block__item"
      :class="{ 'list-block__item--divided': showDivider && index < items.length - 1 }"
      :link-code="item.linkCode"
      :legacy-link="item.link"
    >
      <view v-if="item.icon || item.image" class="list-block__icon">
        <image v-if="item.image" class="list-block__thumb" :src="item.image" mode="aspectFill" />
        <text v-else class="list-block__icon-text">{{ getIconChar(item.icon, '📄') }}</text>
      </view>
      <view class="list-block__content">
        <text class="list-block__title">{{ item.title || `列表项 ${index + 1}` }}</text>
        <text v-if="item.desc" class="list-block__desc">{{ item.desc }}</text>
      </view>
      <text v-if="showArrow" class="list-block__arrow">›</text>
    </AppLink>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppLink from '@/layout/components/AppLink.vue'
import { getIconChar } from '@/utils/iconMap'

interface ListItem {
  title?: string
  desc?: string
  icon?: string
  image?: string
  linkCode?: string
  link?: string
}

interface ListHeader {
  show?: boolean
  title?: string
  accentColor?: string
  showMore?: boolean
  moreText?: string
  moreLinkCode?: string
  moreLink?: string
}

const props = withDefaults(
  defineProps<{
    padding?: string
    showDivider?: boolean
    showArrow?: boolean
    header?: ListHeader
    items?: ListItem[]
  }>(),
  {
    padding: '24rpx 32rpx',
    showDivider: true,
    showArrow: true,
    header: () => ({}),
    items: () => [],
  }
)

const defaultHeader: Required<ListHeader> = {
  show: true,
  title: '社区资讯',
  accentColor: '#e53935',
  showMore: true,
  moreText: '更多>',
  moreLinkCode: 'community-news',
  moreLink: '',
}

const header = computed(() => ({ ...defaultHeader, ...props.header }))
const blockStyle = computed(() => ({ padding: props.padding }))
</script>

<style scoped>
.list-block {
  background: #fff;
  margin: 24rpx 24rpx 0;
  border-radius: 16rpx;
}

.list-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
}

.list-block__header-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.list-block__accent {
  width: 6rpx;
  height: 32rpx;
  border-radius: 4rpx;
  margin-right: 16rpx;
}

.list-block__header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
}

.list-block__more {
  font-size: 26rpx;
  color: #909399;
}

.list-block__item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
}

.list-block__item--divided {
  border-bottom: 1rpx solid #ebeef5;
}

.list-block__icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.list-block__icon-text {
  font-size: 36rpx;
}

.list-block__thumb {
  width: 100%;
  height: 100%;
}

.list-block__content {
  flex: 1;
  min-width: 0;
}

.list-block__title {
  font-size: 28rpx;
  color: #303133;
}

.list-block__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #909399;
}

.list-block__arrow {
  color: #c0c4cc;
  font-size: 36rpx;
  margin-left: 12rpx;
}
</style>
