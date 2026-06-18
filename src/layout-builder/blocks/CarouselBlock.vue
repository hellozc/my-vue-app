<template>
  <div class="lb-block carousel-block">
    <div v-if="!items.length" class="lb-block__empty">
      <el-icon><Picture /></el-icon>
      <span>暂无轮播图</span>
    </div>
    <el-carousel
      v-else
      :height="`${height}px`"
      :interval="interval"
      :autoplay="autoplay"
      :loop="loop"
      :indicator-position="indicator ? undefined : 'none'"
    >
      <el-carousel-item v-for="(item, index) in items" :key="index">
        <div class="lb-carousel-slide" :style="slideStyle(item)">
          <span v-if="!item.image">{{ item.title || `轮播 ${index + 1}` }}</span>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'

defineProps({
  height: { type: Number, default: 160 },
  autoplay: { type: Boolean, default: true },
  interval: { type: Number, default: 3000 },
  loop: { type: Boolean, default: true },
  indicator: { type: Boolean, default: true },
  items: { type: Array, default: () => [] },
})

function slideStyle(item) {
  if (item.image) {
    return {
      backgroundImage: `url(${item.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { background: item.bgColor || '#eef2ff' }
}
</script>

<style scoped lang="scss">
.carousel-block {
  border-radius: 8px;
  overflow: hidden;
}

.lb-block__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 120px;
  color: #909399;
  font-size: 13px;
  background: #f5f7fa;
}

.lb-carousel-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #606266;
}
</style>
