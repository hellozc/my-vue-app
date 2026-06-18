<template>
  <div class="lb-config">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="样式配置" name="style">
        <el-form label-width="88px" size="small">
          <el-form-item label="高度">
            <el-input-number v-model="model.height" :min="80" :max="400" /> px
          </el-form-item>
          <el-form-item label="自动播放">
            <el-switch v-model="model.autoplay" />
          </el-form-item>
          <el-form-item label="切换间隔">
            <el-input-number v-model="model.interval" :min="1000" :step="500" /> ms
          </el-form-item>
          <el-form-item label="循环播放">
            <el-switch v-model="model.loop" />
          </el-form-item>
          <el-form-item label="底部指示器">
            <el-switch v-model="model.indicator" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="内容配置" name="content">
        <CarouselItemsEditor v-model="model.items" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CarouselItemsEditor from '@/layout-builder/config/parts/CarouselItemsEditor.vue'

const model = defineModel({ type: Object, required: true })
const activeTab = ref('style')
</script>
