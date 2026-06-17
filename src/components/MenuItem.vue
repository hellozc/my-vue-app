<template>
  <el-sub-menu v-if="item.type === 'directory' || item.children?.length" :index="item.path">
    <template #title>
      <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
      <span>{{ item.label }}</span>
    </template>
    <menu-item
      v-for="child in item.children"
      :key="child.path"
      :item="child"
    />
  </el-sub-menu>
  <el-menu-item v-else :index="item.path">
    <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
    <span>{{ item.label }}</span>
  </el-menu-item>
</template>

<script setup>
import MenuItem from './MenuItem.vue'

defineProps({
  item: {
    type: Object,
    required: true,
  },
})
</script>
