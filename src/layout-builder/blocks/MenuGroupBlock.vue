<template>
  <div class="lb-block menu-group-block" :style="blockStyle">
    <div v-for="(group, groupIndex) in groups" :key="groupIndex" class="menu-group-block__section">
      <div v-if="group.title" class="menu-group-block__title">{{ group.title }}</div>
      <div
        v-for="(item, index) in group.items"
        :key="index"
        class="menu-group-block__item"
        :class="{ 'is-divided': showDivider && index < group.items.length - 1 }"
      >
        <el-icon class="menu-group-block__icon"><component :is="item.icon || 'Menu'" /></el-icon>
        <span class="menu-group-block__label">{{ item.label }}</span>
        <span v-if="item.requireLogin" class="menu-group-block__tag">需登录</span>
        <span v-if="item.action === 'logout'" class="menu-group-block__tag">退出</span>
        <el-icon v-if="showArrow" class="menu-group-block__arrow"><ArrowRight /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { normalizeMenuGroupProps } from '@shared/layout/menuGroup'

const props = defineProps({
  padding: { type: String, default: '0' },
  margin: { type: String, default: '12px 12px 0' },
  background: { type: String, default: '#ffffff' },
  borderRadius: { type: Number, default: 16 },
  showDivider: { type: Boolean, default: true },
  showArrow: { type: Boolean, default: true },
  style: { type: String, default: 'list' },
  groups: { type: Array, default: () => [] },
})

const normalized = computed(() => normalizeMenuGroupProps(props))
const groups = computed(() => normalized.value.groups)
const showDivider = computed(() => normalized.value.showDivider)
const showArrow = computed(() => normalized.value.showArrow)

const blockStyle = computed(() => ({
  padding: normalized.value.padding,
  margin: normalized.value.margin,
  background: normalized.value.background,
  borderRadius: `${normalized.value.borderRadius}px`,
}))
</script>

<style scoped lang="scss">
.menu-group-block__title {
  padding: 12px 16px 4px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.menu-group-block__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
}

.menu-group-block__item.is-divided {
  border-bottom: 1px solid #ebeef5;
}

.menu-group-block__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f5f7fa;
  font-size: 16px;
  color: #6366f1;
}

.menu-group-block__label {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.menu-group-block__tag {
  font-size: 10px;
  color: #6366f1;
  background: #eef2ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.menu-group-block__arrow {
  color: #c0c4cc;
}
</style>
