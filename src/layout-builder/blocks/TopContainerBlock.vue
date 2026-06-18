<template>
  <div class="lb-block top-container" :style="{ background: props.containerBg }">
    <div v-if="!carouselItems.length" class="lb-block__empty">
      <el-icon><Picture /></el-icon>
      <span>暂无可见轮播</span>
    </div>
    <el-carousel
      v-else
      :height="`${carouselHeight}px`"
      :interval="props.carousel?.interval ?? 3000"
      :autoplay="props.carousel?.autoplay !== false"
      :loop="props.carousel?.loop !== false"
      :indicator-position="props.carousel?.indicator !== false ? undefined : 'none'"
    >
      <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
        <div class="lb-carousel-slide" :style="slideStyle(item)">
          <span v-if="!item.image">{{ item.title || `轮播 ${index + 1}` }}</span>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'

const props = defineProps({
  containerBg: { type: String, default: '#ffffff' },
  carousel: { type: Object, default: () => ({}) },
  styleVariant: { type: Number, default: 1 },
})

const carouselItems = computed(() => props.carousel?.items ?? [])
const carouselHeight = computed(() => (props.styleVariant === 1 ? 140 : 120))

function slideStyle(item) {
  if (item.image) {
    return {
      backgroundImage: `url(${item.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { background: item.bgColor || '#e8edf5' }
}
</script>

<style scoped lang="scss">
.top-container {
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
  font-size: 14px;
}
</style>
