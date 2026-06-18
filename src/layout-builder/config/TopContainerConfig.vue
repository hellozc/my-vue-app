<template>
  <div class="lb-config top-container-config">
    <div class="config-section config-section--highlight">
      <div class="config-section__title">布局模式</div>
      <el-radio-group v-model="layoutMode" class="layout-mode-group">
        <el-radio value="overlay">沉浸叠加（不占空间）</el-radio>
        <el-radio value="flow">标准流式（占用空间）</el-radio>
      </el-radio-group>
      <p class="field-hint">
        沉浸模式下轮播浮在顶部，下方组件可上移叠加；配合宫格「垂直偏移」负值实现卡片压图效果。
      </p>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="外观样式" name="style">
        <div class="config-section">
          <div class="config-section__title">展示样式</div>
          <VariantPicker v-model="model.variant" :variants="TOP_CONTAINER_VARIANTS" />
        </div>

        <el-form label-width="88px" size="small" class="config-form">
          <el-form-item label="容器底色">
            <el-color-picker v-model="model.containerBg" show-alpha />
            <div class="field-hint">背景图未覆盖区域或轮播无图时的底色</div>
          </el-form-item>
        </el-form>

        <el-divider content-position="left">轮播规则</el-divider>
        <el-form v-if="isCarouselMode" label-width="88px" size="small" class="config-form">
          <el-form-item label="自动播放">
            <el-switch v-model="model.carousel.autoplay" />
          </el-form-item>
          <el-form-item label="切换间隔">
            <el-input-number v-model="model.carousel.interval" :min="1000" :step="500" /> ms
          </el-form-item>
          <el-form-item label="循环播放">
            <el-switch v-model="model.carousel.loop" />
          </el-form-item>
          <el-form-item label="底部指示器">
            <el-switch v-model="model.carousel.indicator" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="内容配置" name="content">
        <div class="config-section config-section--highlight">
          <div class="config-section__title">顶部视觉</div>
          <el-radio-group v-model="visualMode" class="layout-mode-group">
            <el-radio :value="VISUAL_MODE.BACKGROUND">静态背景图</el-radio>
            <el-radio :value="VISUAL_MODE.CAROUSEL">轮播图</el-radio>
          </el-radio-group>
          <p class="field-hint">
            静态背景与轮播二选一，避免轮播叠在背景上互相遮挡。社区首页常用「静态背景 + 品牌 Logo」。
          </p>
        </div>

        <div v-if="isBackgroundMode" class="config-section config-section--highlight">
          <div class="config-section__title">顶部背景图</div>
          <el-form label-width="88px" size="small" class="config-form">
            <el-form-item label="显示背景">
              <el-switch v-model="model.background.show" />
            </el-form-item>
            <template v-if="model.background.show">
              <el-form-item label="背景图片">
                <ImagePicker
                  v-model="model.background.image"
                  category="banner"
                  placeholder="上传顶部大背景"
                  hint="建议宽 750px 以上"
                  preview-height="140px"
                  :max-size-m-b="3"
                />
              </el-form-item>
            </template>
          </el-form>
        </div>

        <div v-else class="config-section config-section--highlight">
          <div class="config-section__title">轮播内容</div>
          <p class="field-hint section-hint">轮播模式下使用轮播项图片作为顶部主视觉。</p>
          <MediaCarouselEditor v-model="model.carousel.items" />
        </div>

        <div class="config-section">
          <div class="config-section__title">品牌区（左上角）</div>
          <el-form label-width="88px" size="small" class="config-form">
            <el-form-item label="显示品牌">
              <el-switch v-model="model.brand.show" />
            </el-form-item>
            <template v-if="model.brand.show">
              <el-form-item label="Logo 图">
                <ImagePicker
                  v-model="model.brand.logo"
                  category="logo"
                  placeholder="上传 Logo"
                  preview-height="88px"
                />
              </el-form-item>
              <el-form-item label="标题文案">
                <el-input v-model="model.brand.title" placeholder="如：滨江未来社区" />
              </el-form-item>
              <el-form-item label="跳转链接">
                <LinkPicker
                  v-model="model.brand.linkCode"
                  :legacy-link="model.brand.link"
                  category-filter="navigation"
                  placeholder="点击品牌区跳转（可选）"
                />
              </el-form-item>
            </template>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { LinkPicker } from '@/components/link'
import { ImagePicker } from '@/components/media'
import VariantPicker from '@/layout-builder/config/parts/VariantPicker.vue'
import MediaCarouselEditor from '@/layout-builder/config/parts/MediaCarouselEditor.vue'
import {
  TOP_CONTAINER_VARIANTS,
  TOP_CONTAINER_VISUAL_MODE,
  createDefaultTopContainerProps,
  getTopContainerVariant,
  resolveTopContainerVisualMode,
} from '@shared/layout/topContainer'

const VISUAL_MODE = TOP_CONTAINER_VISUAL_MODE

const model = defineModel({ type: Object, required: true })
const activeTab = ref('content')

function ensureModelShape(value) {
  if (!value || typeof value !== 'object') return
  const defaults = createDefaultTopContainerProps(value)

  if (!value.variant) value.variant = defaults.variant
  if (!value.background || typeof value.background !== 'object') {
    value.background = { ...defaults.background }
  } else {
    value.background.show = value.background.show !== false
    if (value.background.image === undefined) {
      value.background.image = defaults.background.image
    }
  }
  if (!value.brand) value.brand = defaults.brand
  if (!value.carousel) value.carousel = defaults.carousel
  if (!Array.isArray(value.carousel.items)) value.carousel.items = []
  if (!value.visualMode) {
    value.visualMode = resolveTopContainerVisualMode(value)
  }

  // 保持扁平字段与 background.image 同步（保存/源码兼容）
  value.backgroundImage = value.background.image || ''
}

watch(() => model.value, ensureModelShape, { immediate: true, deep: true })

watch(
  () => model.value?.background?.image,
  (image) => {
    if (!model.value) return
    model.value.backgroundImage = image || ''
  }
)

watch(
  () => model.value?.variant,
  (variantKey) => {
    if (!variantKey || !model.value) return
    model.value.styleVariant = variantKey === 'compact-strip' ? 2 : 1
  },
  { immediate: true }
)

const layoutMode = computed({
  get: () => (model.value.occupySpace === false ? 'overlay' : 'flow'),
  set: (mode) => {
    model.value.occupySpace = mode !== 'overlay'
  },
})

const visualMode = computed({
  get: () => model.value.visualMode || resolveTopContainerVisualMode(model.value),
  set: (mode) => {
    model.value.visualMode = mode
  },
})

const isBackgroundMode = computed(() => visualMode.value === VISUAL_MODE.BACKGROUND)
const isCarouselMode = computed(() => visualMode.value === VISUAL_MODE.CAROUSEL)
</script>

<style scoped lang="scss">
.config-section {
  margin-bottom: 16px;
}

.config-section--highlight {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.28);
  background: rgba(99, 102, 241, 0.08);
}

.config-section__title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.92);
}

.layout-mode-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.field-hint {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.65);
}

.section-hint {
  margin: 0 0 12px;
}

.config-form {
  margin-top: 12px;
}
</style>
