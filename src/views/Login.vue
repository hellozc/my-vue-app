<template>
  <div class="login-page">
    <!-- 动态背景 -->
    <div class="bg-layer">
      <div class="orb orb-1" />
      <div class="orb orb-2" />
      <div class="orb orb-3" />
      <div class="grid-overlay" />
    </div>

    <!-- 左侧品牌区 -->
    <div class="brand-panel">
      <div class="brand-content">
        <div class="brand-logo">
          <img src="@/assets/vue.svg" alt="logo" />
          <div class="logo-ring" />
        </div>
        <h1>通用后台管理系统</h1>
        <p class="brand-desc">智能 · 高效 · 可视化数据管理平台</p>
        <div class="feature-list">
          <div v-for="item in features" :key="item" class="feature-item">
            <el-icon><Check /></el-icon>
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="card-glow" />
      <div class="login-header">
        <h2>欢迎回来</h2>
        <p>请登录您的账号</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" class="cyber-input">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            show-password
            class="cyber-input"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="login-btn" :loading="loading" @click="handleLogin">
            <span v-if="!loading">立即登录</span>
            <span v-else>登录中...</span>
          </el-button>
        </el-form-item>
      </el-form>

      <p class="login-tip">
        <el-icon><InfoFilled /></el-icon>
        默认账号 admin / 123456
      </p>
    </div>
  </div>
</template>

<script setup>
import { nextTick, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import { resetRouterReady } from '@/router/permission'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const menuStore = useMenuStore()

const formRef = ref(null)
const loading = ref(false)

const features = ['动态菜单路由', '数据可视化大屏', '权限安全管理']

const form = reactive({
  username: 'admin',
  password: '123456',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await userStore.login(form)
    resetRouterReady()
    menuStore.resetMenus()

    const redirect = route.query.redirect || '/home'
    await router.replace(String(redirect))
    await nextTick()
    ElMessage.success('登录成功，欢迎回来！')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  min-height: 100vh;
  overflow: hidden;
  background: #0a0e17;
}

.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
    animation: float 8s ease-in-out infinite;
  }

  .orb-1 {
    width: 500px;
    height: 500px;
    background: #6366f1;
    top: -10%;
    left: -5%;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 400px;
    height: 400px;
    background: #06b6d4;
    bottom: -10%;
    right: 10%;
    animation-delay: -3s;
  }

  .orb-3 {
    width: 300px;
    height: 300px;
    background: #8b5cf6;
    top: 40%;
    left: 40%;
    animation-delay: -5s;
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.brand-panel {
  position: relative;
  z-index: 1;
  max-width: 420px;
  animation: slideInLeft 0.8s ease-out;

  .brand-content {
    color: #fff;

    .brand-logo {
      position: relative;
      width: 72px;
      height: 72px;
      margin-bottom: 24px;

      img {
        width: 72px;
        height: 72px;
        position: relative;
        z-index: 1;
        filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.8));
      }

      .logo-ring {
        position: absolute;
        inset: -8px;
        border: 2px solid rgba(99, 102, 241, 0.4);
        border-radius: 50%;
        animation: spin 10s linear infinite;

        &::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 50%;
          width: 8px;
          height: 8px;
          background: #06b6d4;
          border-radius: 50%;
          box-shadow: 0 0 12px #06b6d4;
        }
      }
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 12px;
      background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-desc {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.6);
      margin: 0 0 32px;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.75);

        .el-icon {
          color: #06b6d4;
          font-size: 16px;
        }
      }
    }
  }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 44px 40px 32px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: slideInRight 0.8s ease-out;

  .card-glow {
    position: absolute;
    top: -1px;
    left: 20%;
    right: 20%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #6366f1, #06b6d4, transparent);
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;

    h2 {
      margin: 0 0 8px;
      font-size: 26px;
      font-weight: 600;
      color: #fff;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  :deep(.cyber-input) {
    .el-input__wrapper {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      box-shadow: none;
      transition: all 0.3s;

      &:hover,
      &.is-focus {
        border-color: rgba(99, 102, 241, 0.6);
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
      }
    }

    .el-input__inner {
      color: #fff;

      &::placeholder {
        color: rgba(255, 255, 255, 0.35);
      }
    }

    .el-input__prefix .el-icon {
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .login-btn {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 2px;
    color: #fff;
    background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
    transition: all 0.3s;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    span {
      position: relative;
      z-index: 1;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);

      &::before {
        opacity: 1;
      }
    }

    &:active {
      transform: translateY(0);
    }
  }

  .login-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 16px 0 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.35);
  }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .login-page {
    flex-direction: column;
    gap: 40px;
    padding: 40px 20px;
  }

  .brand-panel {
    text-align: center;

    .brand-content .brand-logo {
      margin: 0 auto 24px;
    }

    .feature-list {
      display: none;
    }
  }
}
</style>
