<template>
  <div class="lb-block user-card-block" :style="blockStyle">
    <div class="user-card-block__main">
      <div class="user-card-block__avatar">{{ guest.title?.slice(0, 1) || '登' }}</div>
      <div class="user-card-block__info">
        <div class="user-card-block__title">{{ guest.title || '点击登录' }}</div>
        <div class="user-card-block__subtitle">{{ guest.subtitle || '登录后享受更多服务' }}</div>
      </div>
    </div>
    <div v-if="showStats && stats.length" class="user-card-block__stats">
      <div v-for="(stat, index) in stats" :key="index" class="user-card-block__stat">
        <div class="user-card-block__stat-value">{{ stat.value || '0' }}</div>
        <div class="user-card-block__stat-label">{{ stat.label }}</div>
      </div>
    </div>
    <div class="user-card-block__tip">C 端将根据登录态展示真实用户信息</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeUserCardProps } from '@shared/layout/userCard'

const props = defineProps({
  padding: { type: String, default: '24px 16px' },
  margin: { type: String, default: '12px 12px 0' },
  background: { type: String, default: '#ffffff' },
  borderRadius: { type: Number, default: 16 },
  showStats: { type: Boolean, default: true },
  tapRequiresLogin: { type: Boolean, default: true },
  guest: { type: Object, default: () => ({}) },
  stats: { type: Array, default: () => [] },
})

const normalized = computed(() => normalizeUserCardProps(props))
const guest = computed(() => normalized.value.guest)
const stats = computed(() => normalized.value.stats)
const showStats = computed(() => normalized.value.showStats)

const blockStyle = computed(() => ({
  padding: normalized.value.padding,
  margin: normalized.value.margin,
  background: normalized.value.background,
  borderRadius: `${normalized.value.borderRadius}px`,
}))
</script>

<style scoped lang="scss">
.user-card-block {
  border-radius: 12px;
}

.user-card-block__main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-card-block__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 20px;
}

.user-card-block__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.user-card-block__subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.user-card-block__stats {
  display: flex;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.user-card-block__stat {
  flex: 1;
  text-align: center;
}

.user-card-block__stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.user-card-block__stat-label {
  margin-top: 4px;
  font-size: 11px;
  color: #909399;
}

.user-card-block__tip {
  margin-top: 12px;
  font-size: 11px;
  color: #c0c4cc;
}
</style>
