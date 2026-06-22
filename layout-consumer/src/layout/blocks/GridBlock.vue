<template>
  <view class="grid-block" :style="blockStyle">
    <view class="grid-block__inner">
      <view
        v-for="(item, index) in displayItems"
        :key="index"
        class="grid-block__cell"
        :style="cellStyle"
      >
        <AppLink block :link-code="item.linkCode" :legacy-link="item.link">
          <view class="grid-block__item">
            <view class="grid-block__icon" :style="iconStyle">
              <text class="grid-block__icon-text" :style="{ fontSize: iconFontSize }">
                {{ getIconChar(item.icon, '☰') }}
              </text>
            </view>
            <view class="grid-block__label-box">
              <view
                v-if="labelOverflow === 'ellipsis'"
                class="grid-block__label-ellipsis"
              >
                <text class="grid-block__label">{{ item.label || `菜单${index + 1}` }}</text>
              </view>
              <view v-else class="grid-block__label-scroll">
                <view
                  class="grid-block__label-track"
                  :class="{
                    'grid-block__label-track--active': shouldMarquee(item.label || `菜单${index + 1}`),
                  }"
                >
                  <text class="grid-block__label">{{ item.label || `菜单${index + 1}` }}</text>
                  <text
                    v-if="shouldMarquee(item.label || `菜单${index + 1}`)"
                    class="grid-block__label grid-block__label--copy"
                  >
                    {{ item.label || `菜单${index + 1}` }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </AppLink>
      </view>

      <view
        v-for="index in emptySlots"
        :key="`empty-${index}`"
        class="grid-block__cell grid-block__cell--empty"
        :style="cellStyle"
      >
        <view class="grid-block__item">
          <view class="grid-block__icon grid-block__icon--empty" :style="iconStyle" />
          <view class="grid-block__label-box">
            <text class="grid-block__label grid-block__label--placeholder">待配置</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import AppLink from '@/layout/components/AppLink.vue'
import { getIconChar } from '@/utils/iconMap'
import { pxStringToRpx, pxToRpx } from '@/utils/unit'
import { GRID_LABEL_OVERFLOW } from '@shared/layout/grid'

export type GridLabelOverflow = 'ellipsis' | 'scroll'

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
    labelOverflow?: GridLabelOverflow
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
    labelOverflow: 'ellipsis',
    items: () => [],
  }
)

const labelOverflow = computed(() =>
  props.labelOverflow === GRID_LABEL_OVERFLOW.SCROLL
    ? GRID_LABEL_OVERFLOW.SCROLL
    : GRID_LABEL_OVERFLOW.ELLIPSIS
)

const totalCells = computed(() => props.columns * props.rows)
const displayItems = computed(() => props.items.slice(0, totalCells.value))
const emptySlots = computed(() => Math.max(0, totalCells.value - displayItems.value.length))

const blockStyle = computed((): CSSProperties => ({
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

const cellStyle = computed((): CSSProperties => {
  const columnWidth = 100 / props.columns
  const gapX = pxToRpx(props.gap / 2)
  return {
    width: `${columnWidth}%`,
    paddingLeft: gapX,
    paddingRight: gapX,
    marginBottom: pxToRpx(props.gap),
    boxSizing: 'border-box',
  }
})

const iconStyle = computed((): CSSProperties => ({
  width: pxToRpx(props.iconWidth),
  height: pxToRpx(props.iconHeight),
  borderRadius: pxToRpx(props.borderRadius),
  background: props.iconBg,
}))

const iconFontSize = computed(() =>
  pxToRpx(Math.round(Math.min(props.iconWidth, props.iconHeight) * 0.42))
)

function shouldMarquee(label: string) {
  return label.trim().length > 4
}
</script>

<style scoped>
.grid-block__inner {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
}

.grid-block__cell {
  display: flex;
  justify-content: center;
}

.grid-block__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
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

.grid-block__label-box {
  width: 100%;
  margin-top: 12rpx;
  min-width: 0;
}

.grid-block__label {
  font-size: 24rpx;
  color: #606266;
  line-height: 1.3;
}

.grid-block__label--placeholder {
  display: block;
  text-align: center;
  color: #c0c4cc;
}

.grid-block__label-ellipsis {
  width: 100%;
  overflow: hidden;
}

.grid-block__label-ellipsis .grid-block__label {
  display: block;
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-block__label-scroll {
  width: 100%;
  overflow: hidden;
}

.grid-block__label-track {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  white-space: nowrap;
}

.grid-block__label-track--active {
  width: auto;
  justify-content: flex-start;
  animation: grid-label-marquee 10s linear infinite;
}

.grid-block__label--copy {
  padding-left: 48rpx;
}

@keyframes grid-label-marquee {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}
</style>
