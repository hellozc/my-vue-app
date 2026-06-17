<template>
  <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
    <div class="logo">
      <div class="logo-icon">
        <img src="@/assets/vue.svg" alt="logo" />
      </div>
      <transition name="fade">
        <span v-if="!isCollapse" class="logo-title">后台管理系统</span>
      </transition>
    </div>
    <el-scrollbar class="menu-scroll">
      <el-menu
        :default-active="activeMenu"
        :default-openeds="defaultOpeneds"
        class="aside-menu"
        :collapse="isCollapse"
        router
      >
        <menu-item
          v-for="item in menuTree"
          :key="item.id"
          :item="item"
        />
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useMenuStore } from '@/stores/menu'
import MenuItem from '@/components/MenuItem.vue'

const route = useRoute()
const appStore = useAppStore()
const menuStore = useMenuStore()
const { isCollapse } = storeToRefs(appStore)
const { menuTree } = storeToRefs(menuStore)

const activeMenu = computed(() => route.path)

const defaultOpeneds = computed(() => {
  const openeds = []
  const findOpeneds = (list, parents = []) => {
    for (const item of list) {
      const chain = [...parents, item.path]
      if (item.path === route.path) {
        openeds.push(...parents)
        return true
      }
      if (item.children && findOpeneds(item.children, chain)) {
        openeds.push(...parents)
        return true
      }
    }
    return false
  }
  findOpeneds(menuTree.value)
  return [...new Set(openeds)]
})
</script>

<style scoped lang="scss">
.aside {
  background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 50%, #24243e 100%);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, transparent, rgba(99, 102, 241, 0.3), transparent);
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 60px;
    padding: 0 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    .logo-icon {
      width: 32px;
      height: 32px;
      flex-shrink: 0;

      img {
        width: 32px;
        height: 32px;
        filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));
      }
    }

    .logo-title {
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      white-space: nowrap;
      background: linear-gradient(90deg, #fff, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .menu-scroll {
    height: calc(100% - 60px);
  }

  .aside-menu {
    border-right: none;
    background: transparent !important;
    padding: 8px;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      border-radius: 8px;
      margin-bottom: 4px;
      color: rgba(255, 255, 255, 0.7) !important;
      transition: all 0.25s;

      &:hover {
        background: rgba(99, 102, 241, 0.15) !important;
        color: #fff !important;
      }
    }

    :deep(.el-menu-item.is-active) {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(6, 182, 212, 0.2)) !important;
      color: #fff !important;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 60%;
        background: linear-gradient(180deg, #6366f1, #06b6d4);
        border-radius: 0 3px 3px 0;
      }
    }

    :deep(.el-sub-menu .el-menu) {
      background: transparent !important;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
