<template>
  <aside class="config-panel">
    <div class="config-panel__header">数据配置</div>
    <el-tabs v-model="mainTab" class="config-panel__tabs">
      <el-tab-pane label="配置" name="config">
        <el-tabs v-model="subTab" class="config-panel__subtabs" @tab-change="onSubTabChange">
          <el-tab-pane label="组件列表" name="list" />
          <el-tab-pane label="页面设置" name="page" />
        </el-tabs>

        <div v-if="subTab === 'list'" class="component-list">
          <div class="list-section">
            <div class="list-section__title">页面</div>
            <div
              class="list-item"
              :class="{ 'is-active': selectionMode === 'page' }"
              @click="selectPage"
            >
              <span class="list-item__tag">页</span>
              <span class="list-item__label">页面设置</span>
            </div>
          </div>

          <div class="list-section">
            <div class="list-section__title">页面组件（可拖拽多个）</div>
            <draggable
              v-model="components"
              item-key="id"
              handle=".list-item__drag"
              animation="200"
            >
              <template #item="{ element, index }">
                <div
                  class="list-item"
                  :class="{ 'is-active': selectionMode === 'component' && selectedTarget === element.id }"
                  @click="selectComponent(element.id)"
                >
                  <span class="list-item__drag">⋮⋮</span>
                  <span class="list-item__index">{{ index + 1 }}</span>
                  <span class="list-item__label">{{ getComponentLabel(element.type) }}</span>
                  <el-badge
                    v-if="getItemBadge(element)"
                    :value="getItemBadge(element)"
                    class="list-item__badge"
                  />
                  <el-button link type="danger" @click.stop="emit('remove', element.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
            </draggable>
            <div v-if="!components.length" class="list-empty-tip">
              <el-icon><Upload /></el-icon>
              <span>暂无页面组件，请从左侧拖入</span>
            </div>
          </div>

          <div class="list-section">
            <div class="list-section__title">壳层（固定位置）</div>
            <div
              class="list-item list-item--chrome"
              :class="{ 'is-active': selectionMode === 'tabbar' }"
              @click="selectTabbar"
            >
              <span class="list-item__tag list-item__tag--chrome">底</span>
              <span class="list-item__label">底部 Tabbar</span>
              <el-tag v-if="tabbar.enabled" size="small" type="success">已启用</el-tag>
              <el-tag v-else size="small" type="info">未启用</el-tag>
            </div>
          </div>
        </div>

        <div class="config-panel__detail">
          <template v-if="selectionMode === 'page'">
            <PageSettingsPanel v-model="pageSettings" />
          </template>
          <template v-else-if="selectionMode === 'tabbar'">
            <div class="config-panel__detail-title">底部 Tabbar 配置</div>
            <TabbarConfig v-model="tabbar" />
          </template>
          <template v-else-if="selectedComponent">
            <div class="config-panel__detail-title">
              {{ getComponentLabel(selectedComponent.type) }}配置
            </div>
            <component
              :is="getConfigComponent(selectedComponent.type)"
              v-model="selectedComponent.props"
            />
          </template>
          <div v-else-if="selectionMode === 'component' && !selectedComponent" class="config-empty-tip">
            <el-icon><Pointer /></el-icon>
            <span>请在上方列表选择组件，或拖拽组件到画布</span>
          </div>
          <el-empty v-else description="请选择页面、组件或壳层进行配置" :image-size="60" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="源码" name="source">
        <el-input
          v-model="sourceJson"
          type="textarea"
          :rows="18"
          resize="none"
          @blur="applySource"
        />
        <el-button type="primary" size="small" style="margin-top: 8px" @click="applySource">
          应用 JSON
        </el-button>
      </el-tab-pane>
    </el-tabs>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import { Delete, Pointer, Upload } from '@element-plus/icons-vue'
import PageSettingsPanel from '@/layout-builder/PageSettingsPanel.vue'
import TabbarConfig from '@/layout-builder/config/TabbarConfig.vue'
import { getComponentLabel, getConfigComponent } from '@/layout-builder/registry'
import { SELECTION } from '@/layout-builder/constants'
import { normalizeLayoutSchema } from '@/layout-builder/utils'

const components = defineModel('components', { type: Array, required: true })
const pageSettings = defineModel('pageSettings', { type: Object, required: true })
const tabbar = defineModel('tabbar', { type: Object, required: true })

const props = defineProps({
  selectedTarget: { type: String, default: '' },
})

const emit = defineEmits(['select', 'remove'])

const mainTab = ref('config')
const subTab = ref('list')
const selectionMode = ref('page')
const sourceJson = ref('')

const selectedComponent = computed(() => {
  if (!props.selectedTarget || props.selectedTarget.startsWith('__')) return null
  return components.value.find((item) => item.id === props.selectedTarget) ?? null
})

watch(
  () => props.selectedTarget,
  (target) => {
    if (target === SELECTION.TABBAR) {
      selectionMode.value = 'tabbar'
      subTab.value = 'list'
    } else if (target && !target.startsWith('__')) {
      selectionMode.value = 'component'
      subTab.value = 'list'
    } else if (target === SELECTION.PAGE || target === '') {
      selectionMode.value = 'page'
    }
  }
)

watch(
  [components, pageSettings, tabbar],
  () => {
    if (mainTab.value === 'source') syncSource()
  },
  { deep: true }
)

watch(mainTab, (tab) => {
  if (tab === 'source') syncSource()
})

function onSubTabChange(name) {
  if (name === 'page') selectPage()
}

function selectPage() {
  selectionMode.value = 'page'
  subTab.value = 'page'
  emit('select', SELECTION.PAGE)
}

function selectTabbar() {
  selectionMode.value = 'tabbar'
  subTab.value = 'list'
  emit('select', SELECTION.TABBAR)
}

function selectComponent(id) {
  selectionMode.value = 'component'
  subTab.value = 'list'
  emit('select', id)
}

function getItemBadge(element) {
  if (element.type === 'grid') {
    const { columns = 3, rows = 2, items = [] } = element.props || {}
    return items.length || columns * rows
  }
  if (Array.isArray(element.props?.items)) {
    return element.props.items.length
  }
  return 0
}

function syncSource() {
  sourceJson.value = JSON.stringify(
    normalizeLayoutSchema({
      pageSettings: pageSettings.value,
      components: components.value,
      chrome: { tabbar: tabbar.value },
    }),
    null,
    2
  )
}

function applySource() {
  try {
    const parsed = JSON.parse(sourceJson.value)
    const normalized = normalizeLayoutSchema(parsed)
    pageSettings.value = normalized.pageSettings
    components.value = normalized.components
    tabbar.value = normalized.chrome.tabbar
    ElMessage.success('JSON 已应用')
  } catch {
    ElMessage.error('JSON 格式无效')
  }
}
</script>

<style scoped lang="scss">
.config-panel {
  width: 360px;
  border-left: 1px solid rgba(99, 102, 241, 0.14);
  background: rgba(22, 26, 42, 0.6);
  display: flex;
  flex-direction: column;
}

.config-panel__header {
  padding: 12px 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(99, 102, 241, 0.12);
}

.config-panel__tabs {
  flex: 1;
  padding: 0 12px 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__content) {
    overflow: auto;
    flex: 1;
  }
}

.config-panel__subtabs {
  margin-bottom: 10px;
}

.component-list {
  margin-bottom: 12px;
}

.list-section {
  margin-bottom: 14px;
}

.list-section__title {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.62);
  margin-bottom: 6px;
  padding-left: 2px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.12);
  cursor: pointer;

  &.is-active {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.12);
  }

  &--chrome.is-active {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }
}

.list-item__tag {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--chrome {
    background: rgba(16, 185, 129, 0.25);
    color: #6ee7b7;
  }
}

.list-item__drag {
  cursor: grab;
  color: rgba(255, 255, 255, 0.5);
}

.list-item__index {
  width: 18px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.58);
}

.list-item__label {
  flex: 1;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.list-item__badge {
  :deep(.el-badge__content) {
    background: #f56c6c;
    border: none;
  }
}

.config-panel__detail {
  padding-top: 12px;
  border-top: 1px solid rgba(99, 102, 241, 0.12);
}

.config-panel__detail-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.92);
}

.list-empty-tip,
.config-empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  margin-bottom: 12px;
  border: 1px dashed rgba(99, 102, 241, 0.35);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
  text-align: center;
  line-height: 1.5;
}

.config-empty-tip {
  margin-top: 8px;
  min-height: 80px;
}
</style>
