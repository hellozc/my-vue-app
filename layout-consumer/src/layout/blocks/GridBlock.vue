<template>
  <view class="grid-block" :style="blockStyle">
    <view class="grid-block__inner" :style="gridStyle">
      <AppLink
        v-for="(item, index) in displayItems"
        :key="index"
        class="grid-block__item"
        :link-code="item.linkCode"
        :legacy-link="item.link"
      >
        <view class="grid-block__icon" :style="iconStyle">
          <text class="grid-block__icon-text" :style="{ fontSize: iconFontSize }">{{ getIconChar(item.icon, '☰') }}</text>
        </view>
        <text class="grid-block__label">{{ item.label || `菜单${index + 1}` }}</text>
      </AppLink>
      <view
        v-for="index in emptySlots"
        :key="`empty-${index}`"
        class="grid-block__item grid-block__item--empty"
      >
        <view class="grid-block__icon grid-block__icon--empty" :style="iconStyle" />
        <text class="grid-block__label">待配置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppLink from '@/layout/components/AppLink.vue'
import { getIconChar } from '@/utils/iconMap'
import { pxStringToRpx, pxToRpx } from '@/utils/unit'

interface GridItem {
  label?: string
  icon?: string
  linkCode?: string
  link?: string
}

const props = withDefaults(
  defineProps<{
    columns?: number
    rows?: number
    offsetY?: number
    marginX?: number
    background?: string
    blockRadius?: number
    showShadow?: boolean
    padding?: string
    gap?: number
    borderRadius?: number
    iconWidth?: number
    iconHeight?: number
    iconBg?: string
    items?: GridItem[]
  }>(),
  {
    columns: 3,
    rows: 2,
    offsetY: 0,
    marginX: 16,
    background: '#ffffff',
    blockRadius: 12,
    showShadow: true,
    padding: '12px 16px',
    gap: 8,
    borderRadius: 8,
    iconWidth: 52,
    iconHeight: 52,
    iconBg: '#f5f7fa',
    items: () => [],
  }
)

const totalCells = computed(() => props.columns * props.rows)
const displayItems = computed(() => props.items.slice(0, totalCells.value))
const emptySlots = computed(() => Math.max(0, totalCells.value - displayItems.value.length))

const blockStyle = computed(() => ({
  position: props.offsetY < 0 ? 'relative' : undefined,
  zIndex: props.offsetY < 0 ? 2 : undefined,
  marginTop: pxToRpx(props.offsetY),
  marginLeft: pxToRpx(props.marginX),
  marginRight: pxToRpx(props.marginX),
  padding: pxStringToRpx(props.padding),
  background: props.background || 'transparent',
  borderRadius: pxToRpx(props.blockRadius),
  boxShadow: props.showShadow ? '0 8rpx 24rpx rgba(15, 23, 42, 0.06)' : 'none',
}))

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
  gap: pxToRpx(props.gap),
}))

const iconStyle = computed(() => ({
  width: pxToRpx(props.iconWidth),
  height: pxToRpx(props.iconHeight),
  borderRadius: pxToRpx(props.borderRadius),
  background: props.iconBg,
}))

const iconFontSize = computed(() =>
  pxToRpx(Math.round(Math.min(props.iconWidth, props.iconHeight) * 0.42))
)
</script>

<style scoped>
.grid-block__inner {
  display: grid;
}

.grid-block__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.grid-block__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  overflow: hidden;
  flex-shrink: 0;
}

.grid-block__icon--empty {
  border: 1rpx dashed #dcdfe6;
  background: #fafafa !important;
}

.grid-block__icon-text {
  line-height: 1;
}

.grid-block__label {
  font-size: 24rpx;
  color: #606266;
  text-align: center;
  line-height: 1.3;
}

.grid-block__item--empty .grid-block__label {
  color: #c0c4cc;
}
</style>
