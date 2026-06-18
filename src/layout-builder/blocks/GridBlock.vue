<template>
  <div class="lb-block grid-block" :style="blockStyle">
    <div class="grid-block__inner" :style="gridStyle">
      <AppLink
        v-for="(item, index) in displayItems"
        :key="index"
        class="grid-block__item"
        :link-code="item.linkCode"
        :legacy-link="item.link"
        tag="div"
      >
        <div class="grid-block__icon" :style="iconStyle">
          <el-icon :size="iconFontSize"><component :is="item.icon || 'Menu'" /></el-icon>
        </div>
        <span class="grid-block__label">{{ item.label || `菜单${index + 1}` }}</span>
      </AppLink>
      <div
        v-for="index in emptySlots"
        :key="`empty-${index}`"
        class="grid-block__item grid-block__item--empty"
      >
        <div class="grid-block__icon grid-block__icon--empty" :style="iconStyle" />
        <span class="grid-block__label">待配置</span>
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
  items: { type: Array, default: () => [] },
})

const totalCells = computed(() => props.columns * props.rows)
const displayItems = computed(() => props.items.slice(0, totalCells.value))
const emptySlots = computed(() => Math.max(0, totalCells.value - displayItems.value.length))

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

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
  gap: `${props.gap}px`,
}))

const iconStyle = computed(() => ({
  width: `${props.iconWidth}px`,
  height: `${props.iconHeight}px`,
  borderRadius: `${props.borderRadius}px`,
  background: props.iconBg,
}))

const iconFontSize = computed(() => Math.round(Math.min(props.iconWidth, props.iconHeight) * 0.42))
</script>

<style scoped lang="scss">
.grid-block__inner {
  display: grid;
}

.grid-block__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.grid-block__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  overflow: hidden;
}

.grid-block__icon--empty {
  border: 1px dashed #dcdfe6;
  background: #fafafa !important;
}

.grid-block__label {
  font-size: 12px;
  color: #606266;
  text-align: center;
  line-height: 1.3;
}

.grid-block__item--empty .grid-block__label {
  color: #c0c4cc;
}
</style>
