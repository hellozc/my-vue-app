<template>
  <LayoutBuilder
    :layout-name="layoutMeta.name || '新建自定义布局'"
    :initial-schema="initialSchema"
    :saving="saving"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { LayoutBuilder } from '@/layout-builder'
import { createEmptyLayout } from '@/layout-builder/utils'
import { createLayout, getLayoutById, updateLayout } from '@/api/layout'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const layoutMeta = ref({ name: '', code: '', description: '' })
const initialSchema = ref(createEmptyLayout())

onMounted(async () => {
  const id = route.params.id
  if (!id) return

  const data = await getLayoutById(id)
  layoutMeta.value = {
    name: data.name,
    code: data.code,
    description: data.description,
  }
  initialSchema.value = data.schema
})

async function handleSave(schema) {
  saving.value = true
  try {
    const id = route.params.id
    if (id) {
      await updateLayout(id, {
        name: layoutMeta.value.name,
        code: layoutMeta.value.code,
        description: layoutMeta.value.description,
        schema,
      })
      ElMessage.success('保存成功')
    } else {
      const { value: name } = await ElMessageBox.prompt('请输入布局名称', '新建布局', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '名称不能为空',
      })
      const { value: code } = await ElMessageBox.prompt(
        '请输入布局编码（展示端拉取用）',
        '布局编码',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[a-z][a-z0-9_-]*$/,
          inputErrorMessage: '编码需为小写字母开头，仅含字母数字_-',
        }
      )
      const created = await createLayout({
        name,
        code,
        description: '',
        schema,
      })
      ElMessage.success('创建成功')
      router.replace(`/system/layout/editor/${created.id}`)
    }
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/system/layout')
}
</script>
