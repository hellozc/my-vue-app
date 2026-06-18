<template>
  <div class="page-settings">
    <div class="page-settings__title">页面设置</div>
    <div class="page-settings__subtitle">样式配置</div>

    <el-form label-position="top" size="small">
      <el-form-item label="展示样式">
        <div class="bg-type-cards">
          <div
            class="bg-type-card"
            :class="{ active: model.backgroundType === 'solid' }"
            @click="model.backgroundType = 'solid'"
          >
            <el-icon v-if="model.backgroundType === 'solid'" class="bg-type-card__check"><CircleCheck /></el-icon>
            <strong>纯色底色</strong>
            <span>整页使用单一颜色</span>
          </div>
          <div
            class="bg-type-card"
            :class="{ active: model.backgroundType === 'image' }"
            @click="model.backgroundType = 'image'"
          >
            <el-icon v-if="model.backgroundType === 'image'" class="bg-type-card__check"><CircleCheck /></el-icon>
            <strong>背景图片</strong>
            <span>顶部对齐，宽度铺满</span>
          </div>
        </div>
      </el-form-item>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="page-settings__tip"
      >
        作用于整页背景，各组件之间无额外间距
      </el-alert>

      <template v-if="model.backgroundType === 'solid'">
        <el-form-item label="底色设置">
          <div class="color-row">
            <el-color-picker v-model="model.backgroundColor" show-alpha />
            <el-input v-model="model.backgroundColor" placeholder="#f5f7fa" />
          </div>
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item label="背景图设置">
          <ImagePicker
            v-model="model.backgroundImage"
            category="layout"
            placeholder="上传页面背景图"
            hint="建议宽 750px 以上，顶部对齐、宽度铺满"
            preview-height="140px"
            :max-size-m-b="3"
          />
        </el-form-item>
      </template>

      <el-form-item label="效果预览">
        <div class="preview-box" :style="previewStyle">
          <span v-if="model.backgroundType === 'image' && !model.backgroundImage" class="preview-box__empty">
            暂无背景图
          </span>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CircleCheck } from '@element-plus/icons-vue'
import { ImagePicker } from '@/components/media'
import { resolveMediaUrl } from '@/utils/media'

const model = defineModel({ type: Object, required: true })

const previewStyle = computed(() => {
  if (model.value.backgroundType === 'image' && model.value.backgroundImage) {
    return {
      backgroundImage: `url(${resolveMediaUrl(model.value.backgroundImage)})`,
      backgroundSize: '100% auto',
      backgroundPosition: 'top center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return { backgroundColor: model.value.backgroundColor || '#f5f7fa' }
})
</script>

<style scoped lang="scss">
.page-settings__title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.92);
}

.page-settings__subtitle {
  font-size: 13px;
  color: #6366f1;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 2px solid #6366f1;
  display: inline-block;
}

.page-settings__tip {
  margin-bottom: 14px;
  background: rgba(99, 102, 241, 0.08);
  border: none;
}

.bg-type-cards {
  display: flex;
  gap: 10px;
  width: 100%;
}

.bg-type-card {
  position: relative;
  flex: 1;
  padding: 12px 10px;
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  cursor: pointer;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.2s, background 0.2s;

  strong {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.92);
  }

  span {
    color: rgba(255, 255, 255, 0.72);
    line-height: 1.4;
  }

  &.active {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
  }
}

.bg-type-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #6366f1;
  font-size: 16px;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.upload-box {
  position: relative;
  width: 100%;
  height: 120px;
  border: 1px dashed rgba(99, 102, 241, 0.35);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.03);
}

.upload-box__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 28px;
  color: rgba(255, 255, 255, 0.55);
}

.upload-box__preview {
  width: 100%;
  height: 100%;
}

.upload-box__input {
  display: none;
}

.upload-url {
  width: 100%;
}

.field-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.5;
}

.preview-box {
  width: 100%;
  height: 100px;
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-box__empty {
  font-size: 12px;
  color: #909399;
}
</style>
