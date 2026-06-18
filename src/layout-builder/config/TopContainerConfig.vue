<template>
  <div class="lb-config">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="样式配置" name="style">
        <el-form label-width="88px" size="small">
          <el-form-item label="展示样式">
            <div class="style-preview">
              <span>样式 {{ model.styleVariant }}</span>
              <el-button link type="primary" @click="toggleVariant">切换样式</el-button>
            </div>
          </el-form-item>
          <el-form-item label="容器底色">
            <el-color-picker v-model="model.containerBg" show-alpha />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="内容配置" name="content">
        <CarouselItemsEditor v-model="model.carousel.items" />
      </el-tab-pane>
    </el-tabs>
    <el-divider content-position="left">轮播规则</el-divider>
    <el-form label-width="88px" size="small">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CarouselItemsEditor from '@/layout-builder/config/parts/CarouselItemsEditor.vue'

const model = defineModel({ type: Object, required: true })
const activeTab = ref('style')

function toggleVariant() {
  model.value.styleVariant = model.value.styleVariant === 1 ? 2 : 1
}
</script>

<style scoped lang="scss">
.style-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
