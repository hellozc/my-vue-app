<template>
  <div class="dynamic-page page-placeholder">
    <el-card shadow="hover">
      <el-empty :description="`页面「${title}」已注册路由`">
        <template #description>
          <p>当前为动态菜单占位页</p>
          <p class="path">路由：{{ route.path }}</p>
          <p class="tip">可在菜单管理中配置 component 指向 views 下已有组件</p>
        </template>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta?.title || route.name)
</script>

<style scoped lang="scss">
.dynamic-page {
  .path {
    color: #a5b4fc;
    margin: 8px 0;
  }

  .tip {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.45);
  }
}
</style>
