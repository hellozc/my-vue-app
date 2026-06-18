<template>
  <div class="lb-block grid-block" :style="blockStyle">
    <div class="grid-block__inner">
      <div
        v-for="(item, index) in displayItems"
        :key="index"
        class="grid-block__cell"
        :style="cellStyle"
      >
        <AppLink
          class="grid-block__item"
          :link-code="item.linkCode"
          :legacy-link="item.link"
          tag="div"
        >
          <div class="grid-block__icon" :style="iconStyle">
            <el-icon :size="iconFontSize"><component :is="item.icon || 'Menu'" /></el-icon>
          </div>
          <div class="grid-block__label-box">
            <div v-if="labelOverflow === 'ellipsis'" class="grid-block__label-ellipsis">
              <span class="grid-block__label">{{ item.label || `菜单${index + 1}` }}</span>
            </div>
            <div v-else class="grid-block__label-scroll">
              <div
                class="grid-block__label-track"
                :class="{
                  'grid-block__label-track--active': shouldMarquee(item.label || `菜单${index + 1}`),
                }"
              >
                <span class="grid-block__label">{{ item.label || `菜单${index + 1}` }}</span>
                <span
                  v-if="shouldMarquee(item.label || `菜单${index + 1}`)"
                  class="grid-block__label grid-block__label--copy"
                >
                  {{ item.label || `菜单${index + 1}` }}
                </span>
              </div>
            </div>
          </div>
        </AppLink>
      </div>
      <div
        v-for="index in emptySlots"
        :key="`empty-${index}`"
        class="grid-block__cell grid-block__cell--empty"
        :style="cellStyle"
      >
        <div class="grid-block__item">
          <div class="grid-block__icon grid-block__icon--empty" :style="iconStyle" />
          <span class="grid-block__label grid-block__label--placeholder">待配置</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AppLink } from '@/components/link'

const props = defineProps({
  columns: { type: Number, default: 3 },
  rows: { type: Number, default: 2 },
  offsetY: { type: Number, default: 0 },
  marginX: { type: Number, default: 16 },
  background: { type: String, default: '#ffffff' },
  blockRadius: { type: Number, default: 12 },
  showShadow: { type: Boolean, default: true },
  padding: { type: String, default: '12px' },
  gap: { type: Number, default: 8 },
  borderRadius: { type: Number, default: 8 },
  iconWidth: { type: Number, default: 52 },
  iconHeight: { type: Number, default: 52 },
  iconBg: { type: String, default: '#f5f7fa' },
  labelOverflow: { type: String, default: 'ellipsis' },
  items: { type: Array, default: () => [] },
})

const totalCells = computed(() => props.columns * props.rows)
const displayItems = computed(() => props.items.slice(0, totalCells.value))
const emptySlots = computed(() => Math.max(0, totalCells.value - displayItems.value.length))
const labelOverflow = computed(() => props.labelOverflow || 'ellipsis')

const blockStyle = computed(() => ({
  position: props.offsetY < 0 ? 'relative' : undefined,
  zIndex: props.offsetY < 0 ? 2 : undefined,
  marginTop: `${props.offsetY}px`,
  marginLeft: `${props.marginX}px`,
  marginRight: `${props.marginX}px`,
  padding: props.padding,
  background: props.background || 'transparent',
  borderRadius: `${props.blockRadius}px`,
  boxShadow: props.showShadow ? '0 4px 12px rgba(15, 23, 42, 0.06)' : 'none',
}))

const cellStyle = computed(() => {
  const columnWidth = 100 / props.columns
  const gapX = `${props.gap / 2}px`
  return {
    width: `${columnWidth}%`,
    paddingLeft: gapX,
    paddingRight: gapX,
    marginBottom: `${props.gap}px`,
    boxSizing: 'border-box',
  }
})

const iconStyle = computed(() => ({
  width: `${props.iconWidth}px`,
  height: `${props.iconHeight}px`,
  borderRadius: `${props.borderRadius}px`,
  background: props.iconBg,
}))

const iconFontSize = computed(() => Math.round(Math.min(props.iconWidth, props.iconHeight) * 0.42))

function shouldMarquee(label) {
  return String(label || '').trim().length > 4
}
</script>

<style scoped lang="scss">
.grid-block__inner {
  display: flex;
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
  width: 100%;
  min-width: 0;
  gap: 6px;
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
  border: 1px dashed #dcdfe6;
  background: #fafafa !important;
}

.grid-block__label-box {
  width: 100%;
  min-width: 0;
}

.grid-block__label {
  font-size: 12px;
  color: #606266;
  line-height: 1.3;
}

.grid-block__label--placeholder {
  color: #c0c4cc;
  text-align: center;
  display: block;
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
  padding-left: 24px;
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
