<template>
  <div class="carousel-items-editor">
    <div v-for="(item, index) in model" :key="index" class="item-card">
      <el-input v-model="item.title" placeholder="标题" />
      <el-input v-model="item.image" placeholder="图片 URL（可选）" />
      <el-input v-model="item.bgColor" placeholder="背景色（无图时）" />
      <el-button link type="danger" @click="remove(index)">删除</el-button>
    </div>
    <el-button type="primary" link @click="add">+ 添加轮播项</el-button>
  </div>
</template>

<script setup>
const model = defineModel({ type: Array, required: true })

function add() {
  model.value.push({ title: '新轮播', image: '', bgColor: '#eef2ff' })
}

function remove(index) {
  model.value.splice(index, 1)
}
</script>

<style scoped lang="scss">
.item-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  padding: 8px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 6px;
}
</style>
