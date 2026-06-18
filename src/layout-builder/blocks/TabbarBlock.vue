<template>
  <div class="tabbar-block" :style="barStyle">
    <AppLink
      v-for="(item, index) in items"
      :key="index"
      class="tabbar-block__item"
      :class="{ 'is-active': index === activeIndex }"
      :style="itemStyle(index)"
      :link-code="item.linkCode"
      :legacy-link="item.path"
      tag="div"
    >
      <el-icon :size="iconSize"><component :is="item.icon || 'Menu'" /></el-icon>
      <span class="tabbar-block__label">{{ item.label }}</span>
    </AppLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AppLink } from '@/components/link'

const props = defineProps({
  height: { type: Number, default: 50 },
  background: { type: String, default: '#ffffff' },
  activeColor: { type: String, default: '#6366f1' },
  inactiveColor: { type: String, default: '#909399' },
  showBorder: { type: Boolean, default: true },
  fontSize: { type: Number, default: 11 },
  iconSize: { type: Number, default: 22 },
  activeIndex: { type: Number, default: 0 },
  items: { type: Array, default: () => [] },
})

const barStyle = computed(() => ({
  height: `${props.height}px`,
  background: props.background,
  borderTop: props.showBorder ? '1px solid #ebeef5' : 'none',
}))

function itemStyle(index) {
  const color = index === props.activeIndex ? props.activeColor : props.inactiveColor
  return { color, fontSize: `${props.fontSize}px` }
}
</script>

<style scoped lang="scss">
.tabbar-block {
  display: flex;
  align-items: stretch;
  width: 100%;
  flex-shrink: 0;
}

.tabbar-block__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.tabbar-block__label {
  line-height: 1.2;
}
</style>
