<template>
  <div class="lb-block list-block" :style="blockStyle">
    <div v-if="header.show" class="list-block__header">
      <div class="list-block__header-left">
        <span class="list-block__accent" :style="{ background: header.accentColor }" />
        <span class="list-block__header-title">{{ header.title || '模块标题' }}</span>
      </div>
      <AppLink
        v-if="header.showMore"
        class="list-block__more"
        :link-code="header.moreLinkCode"
        :legacy-link="header.moreLink"
        tag="span"
      >
        {{ header.moreText || '更多>' }}
      </AppLink>
    </div>

    <div v-if="isDynamic" class="list-block__dynamic-tip">
      <el-icon><Connection /></el-icon>
      <span>动态数据源{{ sourceCode ? `：${sourceCode}` : '（未设置标识）' }}，以下为预览内容</span>
    </div>

    <AppLink
      v-for="(item, index) in displayItems"
      :key="index"
      class="list-block__item"
      :class="{ 'is-divided': showDivider && index < displayItems.length - 1 }"
      :link-code="item.linkCode"
      :legacy-link="item.link"
      tag="div"
    >
      <div v-if="item.icon || item.image" class="list-block__icon" :class="{ 'has-image': item.image }">
        <img v-if="item.image" :src="item.image" alt="" class="list-block__thumb" />
        <el-icon v-else><component :is="item.icon || 'Document'" /></el-icon>
      </div>
      <div class="list-block__content">
        <div class="list-block__title">{{ item.title || `列表项 ${index + 1}` }}</div>
        <div v-if="item.desc" class="list-block__desc">{{ item.desc }}</div>
      </div>
      <el-icon v-if="showArrow" class="list-block__arrow"><ArrowRight /></el-icon>
    </AppLink>

    <div v-if="paginationHint" class="list-block__pagination-hint">{{ paginationHint }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight, Connection } from '@element-plus/icons-vue'
import { AppLink } from '@/components/link'
import {
  LIST_DATA_SOURCE,
  LIST_PAGINATION_MODE,
  createDefaultListHeader,
  normalizeListPagination,
} from '@shared/layout/list'

const props = defineProps({
  padding: { type: String, default: '12px 16px' },
  showDivider: { type: Boolean, default: true },
  showArrow: { type: Boolean, default: true },
  header: { type: Object, default: () => ({}) },
  items: { type: Array, default: () => [] },
  dataSource: { type: String, default: LIST_DATA_SOURCE.STATIC },
  sourceCode: { type: String, default: '' },
  pagination: { type: Object, default: () => ({}) },
})

const header = computed(() => ({ ...createDefaultListHeader(), ...props.header }))
const pagination = computed(() => normalizeListPagination(props.pagination))
const isDynamic = computed(() => props.dataSource === LIST_DATA_SOURCE.DYNAMIC)

const displayItems = computed(() => {
  if (!pagination.value.enabled) return props.items
  return props.items.slice(0, pagination.value.pageSize)
})

const paginationHint = computed(() => {
  if (!pagination.value.enabled) return ''
  const { pageSize, mode } = pagination.value
  const modeLabel = {
    [LIST_PAGINATION_MODE.AUTO]: '上拉自动加载',
    [LIST_PAGINATION_MODE.LOAD_MORE]: '加载更多按钮',
    [LIST_PAGINATION_MODE.PAGER]: '分页器',
  }[mode] || '上拉自动加载'
  return `每页 ${pageSize} 条 · ${modeLabel}`
})

const blockStyle = computed(() => ({
  padding: props.padding,
}))
</script>

<style scoped lang="scss">
.list-block {
  background: #fff;
}

.list-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  padding: 4px 0 8px;
  box-sizing: border-box;
}

.list-block__header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 16px;
}

.list-block__accent {
  flex-shrink: 0;
  width: 3px;
  height: 16px;
  border-radius: 2px;
}

.list-block__header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 16px;
}

.list-block__more {
  flex-shrink: 0;
  font-size: 13px;
  color: #909399;
  line-height: 16px;
}

.list-block__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}

.list-block__item.is-divided {
  border-bottom: 1px solid #ebeef5;
}

.list-block__icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f0f2f5;
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  &.has-image {
    background: #f5f7fa;
  }
}

.list-block__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-block__content {
  flex: 1;
  min-width: 0;
}

.list-block__title {
  font-size: 14px;
  color: #303133;
}

.list-block__desc {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.list-block__arrow {
  color: #c0c4cc;
  flex-shrink: 0;
}

.list-block__dynamic-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #6366f1;
  background: #eef0ff;
  border-radius: 6px;
}

.list-block__pagination-hint {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ebeef5;
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
}
</style>
