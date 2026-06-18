<template>
  <div class="header-config">
    <el-alert
      v-if="model.enabled !== false && autoModeHint"
      :type="resolvedPreview.isImmersive ? 'info' : 'warning'"
      :closable="false"
      show-icon
      class="header-config__tip"
      :title="autoModeHint"
    />

    <el-form label-width="96px" size="small">
      <el-form-item label="启用头部">
        <el-switch v-model="model.enabled" />
      </el-form-item>

      <template v-if="model.enabled !== false">
        <el-form-item label="头部模式">
          <el-radio-group v-model="model.mode">
            <el-radio value="auto">自动</el-radio>
            <el-radio value="native">标准</el-radio>
            <el-radio value="immersive">沉浸</el-radio>
          </el-radio-group>
          <div class="field-hint">自动：首个 topContainer 为叠加模式时使用沉浸头</div>
        </el-form-item>

        <el-form-item label="导航样式">
          <el-radio-group v-model="model.navigationStyle">
            <el-radio value="auto">自动</el-radio>
            <el-radio value="default">类系统栏</el-radio>
            <el-radio value="custom">自定义</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="页面标题">
          <el-input v-model="model.title" placeholder="留空则使用布局名称" clearable />
        </el-form-item>

        <el-form-item label="返回按钮">
          <el-radio-group v-model="model.showBack">
            <el-radio value="auto">自动</el-radio>
            <el-radio :value="true">显示</el-radio>
            <el-radio :value="false">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="内容区高度">
          <el-input-number v-model="model.height" :min="36" :max="56" /> px
        </el-form-item>

        <el-form-item label="顶部安全区">
          <el-switch v-model="model.safeAreaInset" />
        </el-form-item>

        <template v-if="showStandardStyles">
          <el-divider content-position="left">{{ standardStyleTitle }}</el-divider>

          <el-form-item label="背景色">
            <el-color-picker v-model="model.background" show-alpha />
          </el-form-item>
          <el-form-item label="文字颜色">
            <el-color-picker v-model="model.color" />
          </el-form-item>
        </template>

        <template v-if="showImmersiveStyles">
          <el-divider content-position="left">{{ immersiveStyleTitle }}</el-divider>

          <el-form-item label="背景">
            <el-input v-model="model.immersive.background" placeholder="transparent" />
          </el-form-item>
          <el-form-item label="文字颜色">
            <el-color-picker v-model="model.immersive.color" />
          </el-form-item>
          <el-form-item label="与头图融合">
            <el-switch v-model="model.immersive.blendWithTopContainer" />
          </el-form-item>
        </template>

        <el-divider content-position="left">右侧操作</el-divider>

        <div v-for="(action, index) in model.rightActions" :key="index" class="action-card">
          <el-form-item label="类型">
            <el-select v-model="action.type" style="width: 100%">
              <el-option label="图标" value="icon" />
              <el-option label="文字" value="text" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="action.type !== 'text'" label="图标">
            <el-select v-model="action.icon" style="width: 100%">
              <el-option label="分享" value="share" />
              <el-option label="更多" value="more" />
              <el-option label="搜索" value="search" />
            </el-select>
          </el-form-item>
          <el-form-item v-else label="文案">
            <el-input v-model="action.text" placeholder="按钮文字" />
          </el-form-item>
          <el-form-item label="动作">
            <el-select v-model="action.action" clearable style="width: 100%">
              <el-option label="分享" value="share" />
            </el-select>
          </el-form-item>
          <el-form-item label="跳转链接">
            <LinkPicker
              v-model="action.linkCode"
              :legacy-link="action.link"
              placeholder="可选"
            />
          </el-form-item>
          <el-button type="danger" link @click="removeAction(index)">删除</el-button>
        </div>
        <el-button type="primary" link @click="addAction">+ 添加右侧按钮</el-button>
      </template>
    </el-form>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { LinkPicker } from '@/components/link'
import { createDefaultHeader, resolveHeaderConfig } from '@shared/layout/header'

const model = defineModel({ type: Object, required: true })

const props = defineProps({
  components: { type: Array, default: () => [] },
  layoutName: { type: String, default: '' },
})

const resolvedPreview = computed(() =>
  resolveHeaderConfig(model.value, {
    components: props.components,
    layoutName: props.layoutName,
  })
)

/** 当前实际生效为沉浸头（含自动判定结果） */
const showImmersiveStyles = computed(() => resolvedPreview.value.isImmersive)
const showStandardStyles = computed(() => !resolvedPreview.value.isImmersive)

const standardStyleTitle = computed(() => {
  if (model.value.mode === 'auto') return '标准模式样式（自动 · 当前生效）'
  return '标准模式样式'
})

const immersiveStyleTitle = computed(() => {
  if (model.value.mode === 'auto') return '沉浸模式样式（自动 · 当前生效）'
  return '沉浸模式样式'
})

const autoModeHint = computed(() => {
  if (model.value.mode !== 'auto') return ''
  if (resolvedPreview.value.autoImmersive) {
    return '已检测到沉浸顶部容器，将自动使用透明头部叠在头图上'
  }
  return '当前自动判定为标准头部。透明头需将顶部容器置于首位，并选「沉浸叠加（不占空间）」'
})

watch(
  model,
  (value) => {
    if (!value.immersive) value.immersive = createDefaultHeader().immersive
    if (!Array.isArray(value.rightActions)) value.rightActions = []
  },
  { immediate: true, deep: true }
)

function addAction() {
  model.value.rightActions.push({
    type: 'icon',
    icon: 'more',
    text: '',
    linkCode: '',
    link: '',
    action: '',
  })
}

function removeAction(index) {
  model.value.rightActions.splice(index, 1)
}
</script>

<style scoped lang="scss">
.header-config__tip {
  margin-bottom: 12px;
}

.field-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.action-card {
  padding: 10px 12px;
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}
</style>
