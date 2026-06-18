<template>
  <div class="media-carousel-editor">
    <div v-for="(item, index) in model" :key="index" class="item-card">
      <div class="item-card__head">轮播 {{ index + 1 }}</div>
      <el-form label-width="72px" size="small">
        <el-form-item label="标题">
          <el-input v-model="item.title" placeholder="轮播标题（无图时展示）" />
        </el-form-item>
        <el-form-item label="图片">
          <ImagePicker
            v-model="item.image"
            category="banner"
            placeholder="上传轮播图"
            :max-size-m-b="2"
            preview-height="100px"
          />
        </el-form-item>
        <el-form-item v-if="!item.image" label="背景色">
          <div class="color-row">
            <el-color-picker v-model="item.bgColor" show-alpha />
            <el-input v-model="item.bgColor" placeholder="#eef2ff" />
          </div>
        </el-form-item>
        <el-form-item label="跳转链接">
          <LinkPicker
            v-model="item.linkCode"
            :legacy-link="item.link"
            category-filter="content"
            placeholder="可选，点击轮播图跳转"
          />
        </el-form-item>
      </el-form>
      <el-button link type="danger" @click="remove(index)">删除</el-button>
    </div>
    <el-button type="primary" link @click="add">+ 添加轮播项</el-button>
  </div>
</template>

<script setup>
import { LinkPicker } from '@/components/link'
import { ImagePicker } from '@/components/media'
import { createDefaultTopContainerSlide } from '@shared/layout/topContainer'

const model = defineModel({ type: Array, required: true })

function add() {
  model.value.push(createDefaultTopContainerSlide({ title: '新轮播' }))
}

function remove(index) {
  model.value.splice(index, 1)
}
</script>

<style scoped lang="scss">
.item-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 8px;
}

.item-card__head {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.82);
}

.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
</style>
