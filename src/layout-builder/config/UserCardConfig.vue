<template>
  <el-form label-width="96px" size="small" class="lb-config">
    <div class="config-section">
      <div class="config-section__title">展示</div>
      <el-form-item label="内边距">
        <el-input v-model="model.padding" />
      </el-form-item>
      <el-form-item label="外边距">
        <el-input v-model="model.margin" />
      </el-form-item>
      <el-form-item label="背景色">
        <div class="color-row">
          <el-color-picker v-model="model.background" />
          <el-input v-model="model.background" />
        </div>
      </el-form-item>
      <el-form-item label="圆角">
        <el-input-number v-model="model.borderRadius" :min="0" :max="32" />
      </el-form-item>
      <el-form-item label="显示统计">
        <el-switch v-model="model.showStats" />
      </el-form-item>
      <el-form-item label="点击需登录">
        <el-switch v-model="model.tapRequiresLogin" />
      </el-form-item>
    </div>

    <div class="config-section">
      <div class="config-section__title">未登录文案</div>
      <el-form-item label="标题">
        <el-input v-model="model.guest.title" />
      </el-form-item>
      <el-form-item label="副标题">
        <el-input v-model="model.guest.subtitle" />
      </el-form-item>
    </div>

    <div v-if="model.showStats" class="config-section">
      <div class="config-section__title">统计项</div>
      <div v-for="(stat, index) in model.stats" :key="index" class="config-item-card">
        <el-form-item label="名称">
          <el-input v-model="stat.label" />
        </el-form-item>
        <el-form-item label="展示值">
          <el-input v-model="stat.value" placeholder="未登录时展示" />
        </el-form-item>
        <el-form-item label="需登录">
          <el-switch v-model="stat.requireLogin" />
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>

<script setup>
import { createDefaultUserCardProps } from '@shared/layout/userCard'

const model = defineModel({ type: Object, default: () => createDefaultUserCardProps() })
</script>

<style scoped lang="scss">
.config-section {
  margin-bottom: 16px;
}

.config-section__title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.82);
}

.config-item-card {
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 8px;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
</style>
