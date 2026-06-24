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

      <el-tab-pane label="数据/分页" name="data">
        <el-form label-width="96px" size="small">
          <div class="config-section">
            <div class="config-section__title">数据来源</div>
            <el-form-item label="来源类型">
              <el-radio-group v-model="model.dataSource">
                <el-radio-button :value="LIST_DATA_SOURCE.STATIC">静态内容</el-radio-button>
                <el-radio-button :value="LIST_DATA_SOURCE.DYNAMIC">动态接口</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <template v-if="model.dataSource === LIST_DATA_SOURCE.DYNAMIC">
              <el-form-item label="数据源">
                <el-select
                  v-model="model.sourceCode"
                  :loading="sourceLoading"
                  placeholder="请选择数据源"
                  style="width: 100%"
                >
                  <el-option
                    v-for="opt in sourceOptions"
                    :key="opt.code"
                    :label="opt.name"
                    :value="opt.code"
                  />
                </el-select>
              </el-form-item>
              <div v-if="sourceError" class="config-hint config-hint--error">
                数据源加载失败：{{ sourceError }}
              </div>
              <div v-else-if="!sourceLoading && sourceOptions.length === 0" class="config-hint">
                后端暂未注册可用数据源，请联系开发在 server 端登记。
              </div>
              <div v-else class="config-hint">
                动态模式下列表数据由所选数据源分页返回；下方「列表项」仅作为接口异常时的兜底/预览内容。
              </div>
            </template>
            <div v-else class="config-hint">静态模式下展示「内容配置」中维护的列表项。</div>
          </div>

          <div class="config-section">
            <div class="config-section__title">分页</div>
            <el-form-item label="启用分页">
              <el-switch v-model="model.pagination.enabled" />
            </el-form-item>
            <template v-if="model.pagination.enabled">
              <el-form-item label="每页条数">
                <el-input-number v-model="model.pagination.pageSize" :min="1" :max="100" :step="1" />
              </el-form-item>
              <el-form-item label="加载方式">
                <el-select v-model="model.pagination.mode">
                  <el-option label="上拉自动加载" :value="LIST_PAGINATION_MODE.AUTO" />
                  <el-option label="「加载更多」按钮" :value="LIST_PAGINATION_MODE.LOAD_MORE" />
                  <el-option label="分页器（上一页/下一页）" :value="LIST_PAGINATION_MODE.PAGER" />
                </el-select>
              </el-form-item>
              <div class="config-hint">
                上拉自动加载在 H5 触底自动加载，小程序端自动降级为「加载更多」按钮。
              </div>
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
          <el-form-item label="缩略图" label-width="72px" class="item-link-field">
            <ImagePicker
              v-model="item.image"
              category="layout"
              placeholder="上传缩略图"
              preview-height="88px"
            />
          </el-form-item>
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
import { ImagePicker } from '@/components/media'
import {
  LIST_DATA_SOURCE,
  LIST_PAGINATION_MODE,
  createDefaultListHeader,
  createDefaultListPagination,
} from '@shared/layout/list'

const model = defineModel({ type: Object, required: true })
const activeTab = ref('style')

function ensureDefaults() {
  const m = model.value
  if (!m) return
  if (!m.header) m.header = createDefaultListHeader()
  if (!m.dataSource) m.dataSource = LIST_DATA_SOURCE.STATIC
  if (typeof m.sourceCode !== 'string') m.sourceCode = ''
  if (!m.pagination) m.pagination = createDefaultListPagination()
  if (!Array.isArray(m.items)) m.items = []
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

watch(() => model.value, ensureDefaults, { immediate: true, deep: true })
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

.config-hint {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.5);
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
