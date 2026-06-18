<template>
  <div class="layout-builder">
    <header class="layout-builder__header">
      <div class="layout-builder__title">
        <el-button link @click="handleCancel">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span>{{ title }}</span>
      </div>
      <div class="layout-builder__actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </header>
    <div class="layout-builder__body">
      <ComponentLibrary @add="addComponent" />
      <BuilderCanvas
        v-model="schema.components"
        :selected-target="selectedTarget"
        :page-settings="schema.pageSettings"
        :tabbar="schema.chrome.tabbar"
        :header="schema.chrome.header"
        :layout-name="title"
        @select-component="selectedTarget = $event"
        @select-tabbar="selectedTarget = SELECTION.TABBAR"
        @select-header="selectedTarget = SELECTION.HEADER"
        @remove="removeComponent"
        @clear="clearComponents"
        @move-up="(index) => moveComponent(index, -1)"
        @move-down="(index) => moveComponent(index, 1)"
      />
      <ConfigPanel
        v-model:components="schema.components"
        v-model:page-settings="schema.pageSettings"
        v-model:tabbar="schema.chrome.tabbar"
        v-model:header="schema.chrome.header"
        :layout-name="title"
        :selected-target="selectedTarget"
        @select="selectedTarget = $event"
        @remove="removeComponent"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, provide, reactive, ref, watch } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import ComponentLibrary from '@/layout-builder/ComponentLibrary.vue'
import BuilderCanvas from '@/layout-builder/BuilderCanvas.vue'
import ConfigPanel from '@/layout-builder/ConfigPanel.vue'
import { SELECTION } from '@/layout-builder/constants'
import { createComponentInstance } from '@/layout-builder/registry'
import { cloneLayout, createEmptyLayout, normalizeLayoutSchema } from '@/layout-builder/utils'
import { getLinkOptions } from '@/api/link'
import { buildLinkRegistry } from '@/utils/link'

const props = defineProps({
  layoutName: { type: String, default: '新建自定义布局' },
  initialSchema: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['save', 'cancel'])

const schema = reactive(normalizeLayoutSchema(props.initialSchema ?? createEmptyLayout()))
const selectedTarget = ref(SELECTION.PAGE)
const linkRegistry = reactive({})

provide('linkRegistry', linkRegistry)
provide('layoutInteractive', false)

const title = computed(() => props.layoutName || '新建自定义布局')

watch(
  () => props.initialSchema,
  (val) => {
    if (val) {
      const normalized = normalizeLayoutSchema(val)
      schema.pageSettings = normalized.pageSettings
      schema.components = normalized.components
      schema.chrome.tabbar = normalized.chrome.tabbar
      schema.chrome.header = normalized.chrome.header
    }
  }
)

function addComponent(type) {
  const instance = createComponentInstance(type)
  schema.components.push(instance)
  selectedTarget.value = instance.id
}

function removeComponent(id) {
  const index = schema.components.findIndex((item) => item.id === id)
  if (index === -1) return
  schema.components.splice(index, 1)
  if (selectedTarget.value === id) {
    selectedTarget.value = schema.components[0]?.id ?? SELECTION.PAGE
  }
}

function clearComponents() {
  schema.components = []
  selectedTarget.value = SELECTION.PAGE
}

function moveComponent(index, delta) {
  const target = index + delta
  if (target < 0 || target >= schema.components.length) return
  const list = schema.components
  const [item] = list.splice(index, 1)
  list.splice(target, 0, item)
}

function handleSave() {
  emit('save', cloneLayout(schema))
}

function handleCancel() {
  emit('cancel')
}

onMounted(async () => {
  try {
    const list = await getLinkOptions()
    Object.assign(linkRegistry, buildLinkRegistry(list ?? []))
  } catch {
    /* ignore */
  }
})
</script>

<style scoped lang="scss">
.layout-builder {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  min-height: 560px;
  margin: -12px;
  background: rgba(14, 17, 28, 0.95);
  border-radius: 8px;
  overflow: hidden;
}

.layout-builder__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.14);
}

.layout-builder__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.layout-builder__body {
  flex: 1;
  display: flex;
  min-height: 0;
}
</style>
