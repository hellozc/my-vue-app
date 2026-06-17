<template>
  <div class="common-layout">
    <div class="lay-container">
      <common-aside />
      <el-container class="main-container">
        <el-header class="el-header">
          <common-header />
        </el-header>
        <common-tabs />
        <el-main class="right-main">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, provide, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import CommonAside from '@/components/CommonAside.vue'
import CommonHeader from '@/components/CommonHeader.vue'
import CommonTabs from '@/components/CommonTabs.vue'
import { useMenuStore } from '@/stores/menu'
import { findMenuItem } from '@/utils/menu'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const { menuTree } = storeToRefs(menuStore)
const tabs = ref([{ path: '/home', label: '首页' }])

const addTab = (path) => {
  const exists = tabs.value.some((tab) => tab.path === path)
  if (exists) return
  const menuItem = findMenuItem(path, menuTree.value)
  if (menuItem) {
    tabs.value.push({ path: menuItem.path, label: menuItem.label })
  }
}

const removeTab = (path) => {
  if (path === '/home') return
  const index = tabs.value.findIndex((tab) => tab.path === path)
  if (index === -1) return
  tabs.value.splice(index, 1)
  if (route.path === path) {
    const nextTab = tabs.value[index] || tabs.value[index - 1]
    router.push(nextTab.path)
  }
}

watch(
  () => [route.path, menuTree.value],
  ([path]) => {
    addTab(path)
  },
  { immediate: true, deep: true }
)

provide('appState', {
  tabs,
  removeTab,
})

onMounted(() => {
  document.body.classList.add('app-dark')
})

onUnmounted(() => {
  document.body.classList.remove('app-dark')
})
</script>

<style scoped lang="scss">
.common-layout {
  height: 100%;
  background: #0f1419;

  .lay-container {
    display: flex;
    height: 100%;

    .main-container {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .el-header {
      height: 60px;
      padding: 0;
      background: transparent;
    }

    .right-main {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background:
        radial-gradient(ellipse at 15% 40%, rgba(99, 102, 241, 0.1) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 15%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 100%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
        #0f1419;
    }
  }
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.25s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
