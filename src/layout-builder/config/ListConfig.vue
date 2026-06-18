<template>
  <div class="lb-config list-config">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="样式配置" name="style">
        <el-form label-width="96px" size="small">
          <div class="config-section">
            <div class="config-section__title">模块样式</div>
            <el-form-item label="内边距">
              <el-input v-model="model.padding" placeholder="12px 16px" />
            </el-form-item>
            <el-form-item label="分割线">
              <el-switch v-model="model.showDivider" />
            </el-form-item>
            <el-form-item label="右侧箭头">
              <el-switch v-model="model.showArrow" />
            </el-form-item>
          </div>

          <div class="config-section">
            <div class="config-section__title">标题栏</div>
            <el-form-item label="显示标题栏">
              <el-switch v-model="model.header.show" />
            </el-form-item>
            <template v-if="model.header.show">
              <el-form-item label="左侧竖条">
                <div class="color-row">
                  <el-color-picker v-model="model.header.accentColor" />
                  <el-input v-model="model.header.accentColor" />
                </div>
              </el-form-item>
              <el-form-item label="显示更多">
                <el-switch v-model="model.header.showMore" />
              </el-form-item>
            </template>
          </div>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="内容配置" name="content">
        <template v-if="model.header.show">
          <el-form label-width="96px" size="small">
            <el-form-item label="模块标题">
              <el-input v-model="model.header.title" placeholder="如：社区资讯" />
            </el-form-item>
            <el-form-item v-if="model.header.showMore" label="更多文案">
              <el-input v-model="model.header.moreText" placeholder="更多>" />
            </el-form-item>
            <el-form-item v-if="model.header.showMore" label="更多链接">
              <LinkPicker
                v-model="model.header.moreLinkCode"
                :legacy-link="model.header.moreLink"
                category-filter="content"
                placeholder="选择内容页链接"
              />
            </el-form-item>
          </el-form>
          <el-divider content-position="left">列表项</el-divider>
        </template>

        <div v-for="(item, index) in model.items" :key="index" class="item-card">
          <div class="item-card__head">列表项 {{ index + 1 }}</div>
          <el-input v-model="item.title" placeholder="标题" />
          <el-input v-model="item.desc" placeholder="描述（可选）" />
          <el-input v-model="item.icon" placeholder="图标名（无图时）" />
          <el-input v-model="item.image" placeholder="缩略图 URL（可选）" />
          <el-form-item label="跳转链接" label-width="72px" class="item-link-field">
            <LinkPicker v-model="item.linkCode" :legacy-link="item.link" category-filter="content" />
          </el-form-item>
          <el-button link type="danger" @click="removeItem(index)">删除</el-button>
        </div>
        <el-button type="primary" link @click="addItem">+ 添加列表项</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { LinkPicker } from '@/components/link'

const model = defineModel({ type: Object, required: true })
const activeTab = ref('style')

function ensureHeader() {
  if (!model.value.header) {
    model.value.header = {
      show: true,
      title: '社区资讯',
      accentColor: '#e53935',
      showMore: true,
      moreText: '更多>',
      moreLinkCode: 'community-news',
      moreLink: '',
    }
  }
}

function addItem() {
  model.value.items.push({
    title: '新列表项',
    desc: '描述文案',
    icon: 'Document',
    image: '',
    linkCode: '',
    link: '',
  })
}

function removeItem(index) {
  model.value.items.splice(index, 1)
}

watch(() => model.value, ensureHeader, { immediate: true, deep: true })
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

.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
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
