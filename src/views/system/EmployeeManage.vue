<template>
  <div class="employee-manage">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" @click="openDialog('add')">新增员工</el-button>
        <el-button @click="loadData">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="36" :src="row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="登录账号" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="role" label="角色" min-width="120">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role)" size="small">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog('edit', row)">编辑</el-button>
            <el-button link type="primary" @click="openPasswordDialog(row)">重置密码</el-button>
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
        <el-form-item label="登录账号" prop="username">
          <el-input
            v-model="form.username"
            placeholder="如：zhangsan"
            :disabled="dialogMode === 'edit'"
          />
        </el-form-item>
        <el-form-item v-if="dialogMode === 'add'" label="登录密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="至少 6 位"
          />
        </el-form-item>
        <el-form-item label="员工姓名" prop="name">
          <el-input v-model="form.name" placeholder="如：张三" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span>{{ item.name }}</span>
              <span class="role-desc">{{ item.description }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像地址" prop="avatar">
          <el-input v-model="form.avatar" placeholder="可选，留空使用默认头像" />
        </el-form-item>
        <el-form-item v-if="dialogMode === 'edit'" label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            show-password
            placeholder="不修改请留空"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="passwordVisible"
      title="重置密码"
      width="400px"
      destroy-on-close
    >
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="90px">
        <el-form-item label="员工">
          <span>{{ pwdForm.name }}（{{ pwdForm.username }}）</span>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="pwdForm.password"
            type="password"
            show-password
            placeholder="至少 6 位"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="pwdSubmitting" @click="handleResetPassword">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createEmployee,
  deleteEmployee,
  getEmployeeList,
  resetEmployeePassword,
  updateEmployee,
} from '@/api/employee'
import { getRoleList } from '@/api/role'

const loading = ref(false)
const submitting = ref(false)
const pwdSubmitting = ref(false)
const tableData = ref([])
const roleOptions = ref([])
const dialogVisible = ref(false)
const passwordVisible = ref(false)
const dialogMode = ref('add')
const formRef = ref(null)
const pwdFormRef = ref(null)
const editingRow = ref(null)

const defaultForm = () => ({
  username: '',
  password: '',
  name: '',
  roleId: null,
  avatar: '',
  newPassword: '',
})

const form = reactive(defaultForm())

const pwdForm = reactive({
  id: null,
  username: '',
  name: '',
  password: '',
})

const rules = computed(() => ({
  username: [{ required: true, message: '请输入登录账号', trigger: 'blur' }],
  password: dialogMode.value === 'add'
    ? [
        { required: true, message: '请输入登录密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
      ]
    : [],
  name: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  newPassword: [
    {
      validator: (_rule, value, callback) => {
        if (value && value.length < 6) callback(new Error('密码长度不能少于 6 位'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}))

const pwdRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
  ],
}

const dialogTitle = computed(() =>
  dialogMode.value === 'add' ? '新增员工' : '编辑员工'
)

const roleTagType = (role) => {
  const map = {
    超级管理员: 'danger',
    部门经理: 'warning',
    运营人员: 'success',
    普通员工: 'info',
  }
  return map[role] || 'info'
}

const loadRoles = async () => {
  roleOptions.value = await getRoleList()
}

const loadData = async () => {
  loading.value = true
  try {
    tableData.value = await getEmployeeList()
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, defaultForm())
  editingRow.value = null
}

const openDialog = (mode, row = null) => {
  dialogMode.value = mode
  resetForm()
  if (mode === 'edit' && row) {
    editingRow.value = row
    Object.assign(form, {
      username: row.username,
      name: row.name,
      roleId: row.roleId,
      avatar: row.avatar || '',
      newPassword: '',
    })
  }
  dialogVisible.value = true
}

const openPasswordDialog = (row) => {
  Object.assign(pwdForm, {
    id: row.id,
    username: row.username,
    name: row.name,
    password: '',
  })
  passwordVisible.value = true
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
    if (isAdd) {
      await createEmployee({
        username: form.username,
        password: form.password,
        name: form.name,
        roleId: form.roleId,
        avatar: form.avatar || undefined,
      })
    } else {
      await updateEmployee(editingRow.value.id, {
        name: form.name,
        roleId: form.roleId,
        avatar: form.avatar || undefined,
        password: form.newPassword || undefined,
      })
    }

    dialogVisible.value = false
    await loadData()
    await nextTick()
    ElMessage.success(isAdd ? '新增成功' : '更新成功')
  } finally {
    submitting.value = false
  }
}

const handleResetPassword = async () => {
  try {
    await pwdFormRef.value.validate()
  } catch {
    return
  }

  pwdSubmitting.value = true
  try {
    await resetEmployeePassword(pwdForm.id, pwdForm.password)
    passwordVisible.value = false
    await nextTick()
    ElMessage.success('密码重置成功')
  } finally {
    pwdSubmitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除员工「${row.name}」吗？`, '提示', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteEmployee(row.id)
  await loadData()
  await nextTick()
  ElMessage.success('删除成功')
}

onMounted(async () => {
  await loadRoles()
  await loadData()
})
</script>

<style scoped lang="scss">
.employee-manage {
  .toolbar {
    margin-bottom: 16px;
  }

  .role-desc {
    float: right;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }
}
</style>
