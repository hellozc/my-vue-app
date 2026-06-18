<template>
  <div class="layout-manage">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" @click="openEditor()">新建布局</el-button>
        <el-button @click="loadData">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="name" label="布局名称" min-width="140" />
        <el-table-column prop="code" label="编码" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="70" />
        <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditor(row)">编辑</el-button>
            <el-button link type="primary" @click="preview(row)">预览</el-button>
            <el-button
              link
              type="success"
              :disabled="row.status === 'published'"
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="previewVisible" title="布局预览" width="420px" destroy-on-close>
      <div class="preview-phone">
        <LayoutRenderer v-if="previewSchema" :schema="previewSchema" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLayoutList, deleteLayout, publishLayout } from '@/api/layout'
import { LayoutRenderer } from '@/layout-builder'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const previewVisible = ref(false)
const previewSchema = ref(null)

async function loadData() {
  loading.value = true
  try {
    const data = await getLayoutList()
    tableData.value = data ?? []
  } finally {
    loading.value = false
  }
}

function openEditor(row) {
  if (row?.id) {
    router.push(`/system/layout/editor/${row.id}`)
  } else {
    router.push('/system/layout/editor')
  }
}

function preview(row) {
  previewSchema.value = row.schema
  previewVisible.value = true
}

async function handlePublish(row) {
  await publishLayout(row.id)
  ElMessage.success('发布成功')
  loadData()
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除布局「${row.name}」？`, '提示', { type: 'warning' })
  await deleteLayout(row.id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.toolbar {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.preview-phone {
  width: 375px;
  max-height: 640px;
  margin: 0 auto;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}
</style>
