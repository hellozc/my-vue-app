<template>
  <div class="header">
    <div class="header-left">
      <div class="toggle-btn" @click="appStore.toggleCollapse">
        <el-icon>
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbs"
          :key="index"
        >
          {{ item }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="36" :src="userInfo.avatar" class="user-avatar" />
          <span class="username">{{ userInfo.name || userInfo.username }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="password">
              <el-icon><Lock /></el-icon>修改密码
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <change-password-dialog v-model="passwordVisible" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import { findMenuPath } from '@/utils/menu'
import { resetRouterReady } from '@/router/permission'
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const menuStore = useMenuStore()
const userStore = useUserStore()
const { isCollapse } = storeToRefs(appStore)
const { menuTree } = storeToRefs(menuStore)
const { userInfo } = storeToRefs(userStore)

const passwordVisible = ref(false)

const breadcrumbs = computed(() => {
  const path = findMenuPath(route.path, menuTree.value)
  return path || ['首页']
})

const handleCommand = async (command) => {
  if (command === 'password') {
    passwordVisible.value = true
    return
  }

  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' })
    } catch {
      return
    }

    await userStore.logout()
    menuStore.resetMenus()
    resetRouterReady()
    router.replace('/login')
    ElMessage.success('已退出登录')
  }
}
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  background: linear-gradient(135deg, #1a1a3e 0%, #24243e 100%);
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), rgba(6, 182, 212, 0.5), transparent);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.8);
      transition: all 0.25s;

      .el-icon {
        font-size: 20px;
      }

      &:hover {
        background: rgba(99, 102, 241, 0.2);
        color: #a5b4fc;
      }
    }

    :deep(.el-breadcrumb__inner) {
      color: rgba(255, 255, 255, 0.6) !important;
    }

    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      color: #a5b4fc !important;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px 6px 6px;
      border-radius: 24px;
      cursor: pointer;
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.25s;

      .user-avatar {
        border: 2px solid rgba(99, 102, 241, 0.5);
      }

      .username {
        font-size: 14px;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .arrow-icon {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        transition: transform 0.25s;
      }

      &:hover {
        background: rgba(99, 102, 241, 0.15);
        border-color: rgba(99, 102, 241, 0.3);

        .arrow-icon {
          transform: rotate(180deg);
        }
      }
    }
  }
}
</style>
