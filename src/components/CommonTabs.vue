<template>
  <div class="tabs-bar">
    <el-tag
      v-for="tab in tabs"
      :key="tab.path"
      :closable="tab.path !== '/home'"
      :effect="route.path === tab.path ? 'dark' : 'plain'"
      :class="['tab-item', { active: route.path === tab.path }]"
      @click="switchTab(tab.path)"
      @close="closeTab(tab.path)"
    >
      {{ tab.label }}
    </el-tag>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { tabs, removeTab } = inject('appState')

const switchTab = (path) => {
  router.push(path)
}

const closeTab = (path) => {
  removeTab(path)
}
</script>

<style scoped lang="scss">
.tabs-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(15, 20, 35, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(99, 102, 241, 0.12);

  .tab-item {
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.25s;
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(99, 102, 241, 0.15) !important;
    color: rgba(255, 255, 255, 0.65) !important;

    &:hover {
      transform: translateY(-1px);
      background: rgba(99, 102, 241, 0.12) !important;
      color: rgba(255, 255, 255, 0.9) !important;
    }

    &.active {
      background: linear-gradient(135deg, #6366f1, #06b6d4) !important;
      border-color: transparent !important;
      color: #fff !important;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }
  }
}
</style>
