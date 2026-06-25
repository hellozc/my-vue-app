<template>
  <el-form label-width="96px" size="small" class="lb-config">
    <div class="config-section">
      <div class="config-section__title">样式</div>
      <el-form-item label="外边距">
        <el-input v-model="model.margin" />
      </el-form-item>
      <el-form-item label="显示分割线">
        <el-switch v-model="model.showDivider" />
      </el-form-item>
      <el-form-item label="显示箭头">
        <el-switch v-model="model.showArrow" />
      </el-form-item>
    </div>

    <div v-for="(group, groupIndex) in model.groups" :key="groupIndex" class="config-section">
      <div class="config-section__title">
        分组 {{ groupIndex + 1 }}
        <el-button link type="danger" @click="removeGroup(groupIndex)">删除</el-button>
      </div>
      <el-form-item label="分组标题">
        <el-input v-model="group.title" placeholder="可留空" />
      </el-form-item>
      <div v-for="(item, itemIndex) in group.items" :key="itemIndex" class="config-item-card">
        <el-form-item label="名称">
          <el-input v-model="item.label" />
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="item.icon" filterable allow-create default-first-option style="width: 100%">
            <el-option v-for="name in iconOptions" :key="name" :label="name" :value="name">
              <span class="icon-option">
                <el-icon><component :is="name" /></el-icon>
                <span>{{ name }}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="需登录">
          <el-switch v-model="item.requireLogin" />
        </el-form-item>
        <el-form-item label="动作">
          <el-select v-model="item.action" clearable placeholder="无">
            <el-option label="无" value="" />
            <el-option label="退出登录" value="logout" />
          </el-select>
        </el-form-item>
        <el-button link type="danger" @click="removeItem(group, itemIndex)">删除菜单项</el-button>
      </div>
      <el-button size="small" @click="addItem(group)">添加菜单项</el-button>
    </div>

    <el-button type="primary" plain size="small" @click="addGroup">添加分组</el-button>
  </el-form>
</template>

<script setup>
import { createDefaultMenuGroupItem, createDefaultMenuGroupProps } from '@shared/layout/menuGroup'
import { COMMON_LAYOUT_ICONS } from '@shared/layout/iconOptions'

const model = defineModel({ type: Object, default: () => createDefaultMenuGroupProps() })
const iconOptions = COMMON_LAYOUT_ICONS

function addGroup() {
  model.value.groups.push({
    title: '新分组',
    items: [createDefaultMenuGroupItem()],
  })
}

function removeGroup(index) {
  model.value.groups.splice(index, 1)
}

function addItem(group) {
  group.items.push(createDefaultMenuGroupItem())
}

function removeItem(group, index) {
  group.items.splice(index, 1)
}
</script>

<style scoped lang="scss">
.config-section {
  margin-bottom: 16px;
}

.config-section__title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.82);
}

.config-item-card {
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 8px;
}

.icon-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
