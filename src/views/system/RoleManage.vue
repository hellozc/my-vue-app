<template>
  <div class="role-manage">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" @click="openDialog('add')">新增角色</el-button>
        <el-button @click="loadData">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="code" label="角色编码" min-width="120" />
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog('edit', row)">编辑</el-button>
            <el-button link type="primary" @click="openMenuDialog(row)">菜单权限</el-button>
            <el-button
              link
              type="danger"
              :disabled="row.id === 1"
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
      width="480px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="form.code"
            placeholder="如：manager"
            :disabled="dialogMode === 'edit' && editingRow?.id === 1"
          />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="如：部门经理" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="角色说明" />
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

    <el-dialog
      v-model="menuDialogVisible"
      :title="`菜单权限 - ${menuRole?.name || ''}`"
      width="520px"
      destroy-on-close
    >
      <el-tree
        ref="menuTreeRef"
        :data="menuTreeData"
        node-key="id"
        show-checkbox
        default-expand-all
        :props="treeProps"
      />
      <template #footer>
        <el-button @click="menuDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="menuSubmitting" @click="handleSaveMenus">
          保存权限
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMenuList } from '@/api/menu'
import {
  createRole,
  deleteRole,
  getRoleDetail,
  getRoleList,
  updateRole,
} from '@/api/role'

const loading = ref(false)
const submitting = ref(false)
const menuSubmitting = ref(false)
const tableData = ref([])
const menuTreeData = ref([])
const dialogVisible = ref(false)
const menuDialogVisible = ref(false)
const dialogMode = ref('add')
const formRef = ref(null)
const menuTreeRef = ref(null)
const editingRow = ref(null)
const menuRole = ref(null)

const treeProps = {
  label: 'label',
  children: 'children',
}

const defaultForm = () => ({
  code: '',
  name: '',
  description: '',
  sort: 1,
  menuIds: [],
})

const form = reactive(defaultForm())

const rules = {
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
}

const dialogTitle = computed(() =>
  dialogMode.value === 'add' ? '新增角色' : '编辑角色'
)

const buildMenuTree = (list) => {
  const map = new Map()
  const tree = []
  list.forEach((item) => map.set(item.id, { ...item, children: [] }))
  map.forEach((node) => {
    if (node.parentId === 0) tree.push(node)
    else {
      const parent = map.get(node.parentId)
      if (parent) parent.children.push(node)
    }
  })
  const sortTree = (nodes) => {
    nodes.sort((a, b) => a.sort - b.sort)
    nodes.forEach((n) => {
      if (n.children.length) sortTree(n.children)
    })
  }
  sortTree(tree)
  return tree
}

const loadMenus = async () => {
  const list = await getMenuList()
  menuTreeData.value = buildMenuTree(list)
}

const loadData = async () => {
  loading.value = true
  try {
    tableData.value = await getRoleList()
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, defaultForm())
  editingRow.value = null
}

const openDialog = async (mode, row = null) => {
  dialogMode.value = mode
  resetForm()
  if (mode === 'edit' && row) {
    editingRow.value = row
    const detail = await getRoleDetail(row.id)
    Object.assign(form, {
      code: detail.code,
      name: detail.name,
      description: detail.description || '',
      sort: detail.sort,
      menuIds: detail.menuIds || [],
    })
  }
  dialogVisible.value = true
}

const openMenuDialog = async (row) => {
  menuRole.value = row
  menuDialogVisible.value = true
  await nextTick()
  const detail = await getRoleDetail(row.id)
  menuTreeRef.value?.setCheckedKeys(detail.menuIds || [], false)
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  const isAdd = dialogMode.value === 'add'
  const payload = {
    code: form.code,
    name: form.name,
    description: form.description,
    sort: form.sort,
    menuIds: form.menuIds,
  }

  try {
    if (isAdd) {
      await createRole(payload)
    } else {
      await updateRole(editingRow.value.id, payload)
    }
    dialogVisible.value = false
    await loadData()
    await nextTick()
    ElMessage.success(isAdd ? '新增成功' : '更新成功')
  } finally {
    submitting.value = false
  }
}

const handleSaveMenus = async () => {
  if (!menuTreeRef.value || !menuRole.value) return

  menuSubmitting.value = true
  try {
    const checked = menuTreeRef.value.getCheckedKeys(false)
    const halfChecked = menuTreeRef.value.getHalfCheckedKeys()
    const menuIds = [...new Set([...checked, ...halfChecked])]
    await updateRole(menuRole.value.id, {
      ...menuRole.value,
      menuIds,
    })
    menuDialogVisible.value = false
    await nextTick()
    ElMessage.success('菜单权限已保存')
  } finally {
    menuSubmitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, '提示', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteRole(row.id)
  await loadData()
  await nextTick()
  ElMessage.success('删除成功')
}

onMounted(async () => {
  await loadMenus()
  await loadData()
})
</script>

<style scoped lang="scss">
.role-manage {
  .toolbar {
    margin-bottom: 16px;
  }
}
</style>
