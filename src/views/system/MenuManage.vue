<template>
  <div class="menu-manage">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" @click="openDialog('add')">新增顶级菜单</el-button>
        <el-button @click="loadData">刷新</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="label" label="菜单名称" min-width="160" />
        <el-table-column prop="path" label="路由路径" min-width="140" />
        <el-table-column prop="name" label="路由 name" min-width="120" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="component" label="组件路径" min-width="160" />
        <el-table-column prop="type" label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.type === 'directory' ? 'warning' : 'success'" size="small">
              {{ row.type === 'directory' ? '目录' : '菜单' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.type === 'directory'"
              link
              type="primary"
              @click="openDialog('add', row)"
            >
              新增子级
            </el-button>
            <el-button link type="primary" @click="openDialog('edit', row)">编辑</el-button>
            <el-button
              link
              type="danger"
              :disabled="row.path === '/home'"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="上级菜单" prop="parentId">
          <el-select v-model="form.parentId" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in parentOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="directory">目录</el-radio>
            <el-radio value="menu">菜单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="label">
          <el-input v-model="form.label" placeholder="如：用户管理" />
        </el-form-item>
        <el-form-item label="路由 name" prop="name">
          <el-input v-model="form.name" placeholder="如：userManage，需唯一" />
        </el-form-item>
        <el-form-item label="路由 path" prop="path">
          <el-input v-model="form.path" placeholder="如：/user/list" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="form.icon" filterable placeholder="选择图标" style="width: 100%">
            <el-option v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon">
              <el-icon><component :is="icon" /></el-icon>
              <span style="margin-left: 8px">{{ icon }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 'menu'" label="组件路径" prop="component">
          <el-input v-model="form.component" placeholder="如：User 或 system/MenuManage" />
          <div class="form-tip">对应 src/views/ 下的 .vue 文件，无组件时用 DynamicPage</div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createMenu,
  deleteMenu,
  getMenuTree,
  updateMenu,
} from '@/api/menu'
import { useMenuStore } from '@/stores/menu'
import { buildParentOptions } from '@/utils/menu'

const router = useRouter()
const menuStore = useMenuStore()

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogMode = ref('add')
const formRef = ref(null)
const parentRow = ref(null)

const iconOptions = [
  'House', 'Goods', 'User', 'Menu', 'Setting', 'Folder', 'Document',
  'More', 'Grid', 'List', 'Monitor', 'Bell', 'Star',
]

const defaultForm = () => ({
  parentId: 0,
  type: 'menu',
  label: '',
  name: '',
  path: '',
  icon: 'Document',
  component: 'DynamicPage',
  sort: 1,
})

const form = reactive(defaultForm())

const rules = {
  label: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  name: [{ required: true, message: '请输入路由 name', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由 path', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

const dialogTitle = computed(() =>
  dialogMode.value === 'add' ? '新增菜单' : '编辑菜单'
)

const parentOptions = computed(() => buildParentOptions(tableData.value))

const loadData = async () => {
  loading.value = true
  try {
    tableData.value = await getMenuTree()
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, defaultForm())
  parentRow.value = null
}

const openDialog = (mode, row = null) => {
  dialogMode.value = mode
  resetForm()
  if (mode === 'add') {
    if (row) {
      form.parentId = row.id
      form.type = row.type === 'directory' ? 'menu' : 'directory'
    }
  } else {
    Object.assign(form, {
      parentId: row.parentId,
      type: row.type,
      label: row.label,
      name: row.name,
      path: row.path,
      icon: row.icon,
      component: row.component || 'DynamicPage',
      sort: row.sort,
    })
    parentRow.value = row
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  const isAdd = dialogMode.value === 'add'

  try {
    const payload = {
      parentId: form.parentId,
      type: form.type,
      label: form.label,
      name: form.name,
      path: form.path.startsWith('/') ? form.path : `/${form.path}`,
      icon: form.icon,
      sort: form.sort,
      ...(form.type === 'menu' ? { component: form.component || 'DynamicPage' } : {}),
    }

    if (isAdd) {
      await createMenu(payload)
    } else {
      await updateMenu(parentRow.value.id, payload)
    }

    dialogVisible.value = false
    await loadData()
    await menuStore.refreshMenus(router)
    await nextTick()
    ElMessage.success(isAdd ? '新增成功' : '更新成功')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除菜单「${row.label}」吗？`, '提示', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteMenu(row.id)
  await loadData()
  await menuStore.refreshMenus(router)
  await nextTick()
  ElMessage.success('删除成功')
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.menu-manage {
  .toolbar {
    margin-bottom: 16px;
  }

  .form-tip {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.5;
    margin-top: 4px;
  }
}
</style>
