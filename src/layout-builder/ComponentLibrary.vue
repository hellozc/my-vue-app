<template>
  <aside class="component-library">
    <div class="component-library__header">
      <span>组件库</span>
      <el-button link @click="collapsed = !collapsed">
        <el-icon><ArrowLeft v-if="!collapsed" /><ArrowRight v-else /></el-icon>
      </el-button>
    </div>
    <div v-show="!collapsed" class="component-library__body">
      <section v-for="cat in categories" :key="cat.key" class="library-section">
        <div class="library-section__title">{{ cat.label }}</div>
        <draggable
          class="library-section__grid"
          :list="getList(cat.key)"
          item-key="type"
          :sort="false"
          :group="{ name: 'layout-builder', pull: 'clone', put: false }"
          :clone="cloneItem"
        >
          <template #item="{ element }">
            <div class="library-item" @click="$emit('add', element.type)">
              <div class="library-item__thumb">
                <el-icon><component :is="thumbIcon(element.type)" /></el-icon>
              </div>
              <span>{{ element.label }}</span>
            </div>
          </template>
        </draggable>
      </section>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { ArrowLeft, ArrowRight, Picture, Grid, List, Menu, User } from '@element-plus/icons-vue'
import { LAYOUT_CATEGORIES, getComponentsByCategory, createComponentInstance } from '@/layout-builder/registry'

defineEmits(['add'])

const categories = LAYOUT_CATEGORIES
const collapsed = ref(false)
const listCache = {}

function getList(categoryKey) {
  if (!listCache[categoryKey]) {
    listCache[categoryKey] = getComponentsByCategory(categoryKey)
  }
  return listCache[categoryKey]
}

function cloneItem(def) {
  return createComponentInstance(def.type)
}

function thumbIcon(type) {
  const map = {
    topContainer: Picture,
    carousel: Picture,
    grid: Grid,
    list: List,
    userCard: User,
    menuGroup: Menu,
  }
  return map[type] || Menu
}
</script>

<style scoped lang="scss">
.component-library {
  width: 220px;
  border-right: 1px solid rgba(99, 102, 241, 0.14);
  background: rgba(22, 26, 42, 0.6);
  display: flex;
  flex-direction: column;
}

.component-library__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(99, 102, 241, 0.12);
}

.component-library__body {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.library-section__title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.62);
  margin-bottom: 10px;
}

.library-section__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.library-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.12);
  cursor: grab;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.88);
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: rgba(99, 102, 241, 0.45);
    background: rgba(99, 102, 241, 0.08);
  }
}

.library-item__thumb {
  width: 100%;
  height: 48px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #818cf8;
}
</style>
