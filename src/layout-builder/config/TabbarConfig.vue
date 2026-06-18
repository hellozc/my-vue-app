<template>
  <div class="tabbar-config">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="tabbar-config__tip"
    >
      底部 Tabbar 为<strong>壳层组件</strong>：固定在页面底部、全局唯一，与可拖拽的「页面宫格」不同。
    </el-alert>

    <el-form label-width="96px" size="small">
      <el-form-item label="启用 Tabbar">
        <el-switch v-model="model.enabled" />
      </el-form-item>
    </el-form>

    <template v-if="model.enabled">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="样式配置" name="style">
          <el-form label-width="96px" size="small">
            <el-form-item label="高度">
              <el-input-number v-model="model.props.height" :min="40" :max="80" /> px
            </el-form-item>
            <el-form-item label="背景色">
              <div class="color-row">
                <el-color-picker v-model="model.props.background" show-alpha />
                <el-input v-model="model.props.background" />
              </div>
            </el-form-item>
            <el-form-item label="选中颜色">
              <el-color-picker v-model="model.props.activeColor" />
            </el-form-item>
            <el-form-item label="未选中颜色">
              <el-color-picker v-model="model.props.inactiveColor" />
            </el-form-item>
            <el-form-item label="顶部分割线">
              <el-switch v-model="model.props.showBorder" />
            </el-form-item>
            <el-form-item label="图标大小">
              <el-input-number v-model="model.props.iconSize" :min="16" :max="32" /> px
            </el-form-item>
            <el-form-item label="文字大小">
              <el-input-number v-model="model.props.fontSize" :min="10" :max="14" /> px
            </el-form-item>
            <el-form-item label="安全区域">
              <div class="inline-field">
                <el-switch v-model="model.props.safeAreaInset" />
                <span class="field-hint">iPhone 等设备底部留白</span>
              </div>
            </el-form-item>
            <el-form-item label="默认选中">
              <el-select v-model="model.props.activeIndex" style="width: 100%">
                <el-option
                  v-for="(item, index) in model.props.items"
                  :key="index"
                  :label="item.label || `Tab ${index + 1}`"
                  :value="index"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="内容配置" name="content">
          <div v-for="(item, index) in model.props.items" :key="index" class="item-card">
            <div class="item-card__head">Tab {{ index + 1 }}</div>
            <el-input v-model="item.label" placeholder="名称" />
            <el-input v-model="item.icon" placeholder="图标名" />
            <el-form-item label="跳转链接" label-width="72px" class="item-link-field">
              <LinkPicker v-model="item.linkCode" :legacy-link="item.path" category-filter="navigation" />
            </el-form-item>
            <el-button link type="danger" :disabled="model.props.items.length <= 2" @click="removeTab(index)">
              删除
            </el-button>
          </div>
          <el-button type="primary" link :disabled="model.props.items.length >= 5" @click="addTab">
            + 添加 Tab（最多 5 个）
          </el-button>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LinkPicker } from '@/components/link'

const model = defineModel({
  type: Object,
  required: true,
})

const activeTab = ref('style')

function addTab() {
  model.value.props.items.push({
    label: '新 Tab',
    icon: 'Menu',
    linkCode: '',
    path: '/page',
  })
}

function removeTab(index) {
  model.value.props.items.splice(index, 1)
  if (model.value.props.activeIndex >= model.value.props.items.length) {
    model.value.props.activeIndex = Math.max(0, model.value.props.items.length - 1)
  }
}
</script>

<style scoped lang="scss">
.tabbar-config__tip {
  margin-bottom: 14px;
  background: rgba(99, 102, 241, 0.08);
  border: none;

  strong {
    color: #a5b4fc;
  }
}

.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.inline-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.field-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.item-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 8px;
}

.item-card__head {
  font-size: 12px;
  font-weight: 600;
}
</style>
