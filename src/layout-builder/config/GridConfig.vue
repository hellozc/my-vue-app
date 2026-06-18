<template>
  <div class="lb-config grid-config">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="样式配置" name="style">
        <el-form label-width="96px" size="small">
          <div class="config-section">
            <div class="config-section__title">布局</div>
            <el-form-item label="列数">
              <el-input-number v-model="model.columns" :min="2" :max="5" @change="syncItems" />
            </el-form-item>
            <el-form-item label="行数">
              <div class="inline-field">
                <el-input-number v-model="model.rows" :min="1" :max="6" @change="syncItems" />
                <span class="field-hint">共 {{ totalCells }} 个宫格</span>
              </div>
            </el-form-item>
          </div>

          <div class="config-section">
            <div class="config-section__title">模块位置</div>
            <el-form-item label="垂直偏移">
              <div class="inline-field">
                <el-input-number v-model="model.offsetY" :min="-200" :max="200" />
                <span class="field-hint">px（设计稿，负值更靠近上方内容）</span>
              </div>
            </el-form-item>
          </div>

          <div class="config-section">
            <div class="config-section__title">模块外观</div>
            <el-form-item label="水平边距">
              <div class="inline-field">
                <el-input-number v-model="model.marginX" :min="0" :max="48" /> px
                <span class="field-hint">左右留白，0 为贴边</span>
              </div>
            </el-form-item>
            <el-form-item label="模块背景">
              <div class="color-row">
                <el-color-picker v-model="model.background" show-alpha />
                <el-input v-model="model.background" placeholder="transparent" />
              </div>
            </el-form-item>
            <el-form-item label="模块圆角">
              <el-input-number v-model="model.blockRadius" :min="0" :max="32" /> px
            </el-form-item>
            <el-form-item label="卡片阴影">
              <el-switch v-model="model.showShadow" />
            </el-form-item>
          </div>

          <div class="config-section">
            <div class="config-section__title">全局样式</div>
            <el-form-item label="模块内边距">
              <el-input v-model="model.padding" placeholder="12px" />
            </el-form-item>
            <el-form-item label="宫格间距">
              <el-input-number v-model="model.gap" :min="0" :max="32" /> px
            </el-form-item>
            <el-form-item label="默认圆角">
              <div class="inline-field">
                <el-input-number v-model="model.borderRadius" :min="0" :max="32" /> px
                <span class="field-hint">（0 为直角）</span>
              </div>
            </el-form-item>
            <el-form-item label="图标宽度">
              <el-input-number v-model="model.iconWidth" :min="24" :max="80" /> px
            </el-form-item>
            <el-form-item label="图标高度">
              <el-input-number v-model="model.iconHeight" :min="24" :max="80" /> px
            </el-form-item>
            <el-form-item>
              <el-button link type="primary" @click="applyRecommendedSize">
                应用 {{ model.columns }} 列推荐尺寸
              </el-button>
            </el-form-item>
            <el-form-item label="图标底色">
              <div class="color-row">
                <el-color-picker v-model="model.iconBg" show-alpha />
                <el-input v-model="model.iconBg" />
              </div>
            </el-form-item>
            <el-form-item label="文案溢出">
              <el-radio-group v-model="model.labelOverflow">
                <el-radio :value="GRID_LABEL_OVERFLOW.ELLIPSIS">单行省略</el-radio>
                <el-radio :value="GRID_LABEL_OVERFLOW.SCROLL">无缝滚动</el-radio>
              </el-radio-group>
              <div class="field-hint">保存后写入 schema，C 端按此配置渲染宫格名称</div>
            </el-form-item>
          </div>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="内容配置" name="content">
        <div class="content-tip">共 {{ totalCells }} 个宫格位，已配置 {{ model.items.length }} 项</div>
        <div v-for="(item, index) in model.items" :key="index" class="item-card">
          <div class="item-card__head">宫格 {{ index + 1 }}</div>
          <el-input v-model="item.label" placeholder="名称" />
          <el-input v-model="item.icon" placeholder="图标名（Element Plus Icons）" />
          <el-form-item label="跳转链接" label-width="72px" class="item-link-field">
            <LinkPicker v-model="item.linkCode" :legacy-link="item.link" category-filter="navigation" />
          </el-form-item>
          <el-button link type="danger" @click="removeItem(index)">删除</el-button>
        </div>
        <el-button type="primary" link :disabled="model.items.length >= totalCells" @click="addItem">
          + 添加宫格项
        </el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { LinkPicker } from '@/components/link'
import { GRID_LABEL_OVERFLOW, normalizeGridProps } from '@shared/layout/grid'

const model = defineModel({ type: Object, required: true })
const activeTab = ref('style')

const totalCells = computed(() => (model.value.columns || 3) * (model.value.rows || 2))

const RECOMMENDED = {
  2: { iconWidth: 56, iconHeight: 56, gap: 10, borderRadius: 8 },
  3: { iconWidth: 52, iconHeight: 52, gap: 8, borderRadius: 8 },
  4: { iconWidth: 44, iconHeight: 44, gap: 8, borderRadius: 8 },
  5: { iconWidth: 36, iconHeight: 36, gap: 6, borderRadius: 6 },
}

function ensureGridProps() {
  const normalized = normalizeGridProps(model.value)
  if (model.value.labelOverflow !== normalized.labelOverflow) {
    model.value.labelOverflow = normalized.labelOverflow
  }
}

function syncItems() {
  ensureGridProps()
  const total = totalCells.value
  const items = model.value.items
  while (items.length < total) {
    items.push({ label: `菜单${items.length + 1}`, icon: 'Menu', linkCode: '', link: '' })
  }
  while (items.length > total) {
    items.pop()
  }
}

function applyRecommendedSize() {
  const preset = RECOMMENDED[model.value.columns] || RECOMMENDED[3]
  Object.assign(model.value, preset)
}

function addItem() {
  if (model.value.items.length >= totalCells.value) return
  model.value.items.push({ label: '新菜单', icon: 'Menu', linkCode: '', link: '' })
}

function removeItem(index) {
  model.value.items.splice(index, 1)
}

watch(
  () => model.value,
  () => ensureGridProps(),
  { immediate: true, deep: true }
)

watch(
  () => [model.value.columns, model.value.rows],
  () => syncItems(),
  { immediate: true }
)
</script>

<style scoped lang="scss">
.config-section {
  margin-bottom: 16px;
}

.config-section__title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
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

.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.content-tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);
  margin-bottom: 12px;
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
  color: rgba(255, 255, 255, 0.82);
}
</style>
