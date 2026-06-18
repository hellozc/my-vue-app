<template>
  <div class="link-manage">
    <el-card shadow="never">
      <el-alert type="info" :closable="false" show-icon class="link-manage__tip">
        链接按<strong>分类</strong>组织，便于在布局配置时快速筛选。同一链接可被多处引用，修改目标地址只需改一处。
      </el-alert>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="链接列表" name="links">
          <div class="toolbar">
            <el-select
              v-model="linkCategoryFilter"
              clearable
              placeholder="全部分类"
              style="width: 180px"
              @change="loadLinks"
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
            <el-button type="primary" @click="openLinkDialog('add')">新增链接</el-button>
            <el-button @click="loadLinks">刷新</el-button>
          </div>

          <el-table v-loading="linkLoading" :data="linkTableData" border>
            <el-table-column prop="name" label="链接名称" min-width="120" />
            <el-table-column prop="code" label="链接编码" min-width="140" />
            <el-table-column prop="categoryName" label="分类" width="110">
              <template #default="{ row }">
                <el-tag size="small">{{ row.categoryName || row.categoryCode || '通用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="90">
              <template #default="{ row }">
                <el-tag :type="row.type === 'external' ? 'warning' : 'success'" size="small">
                  {{ row.type === 'external' ? '站外' : '站内' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="跳转目标" min-width="160" show-overflow-tooltip />
            <el-table-column prop="clickCount" label="点击次数" width="100" sortable />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                  {{ row.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openLinkDialog('edit', row)">编辑</el-button>
                <el-button link type="danger" @click="handleDeleteLink(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="分类管理" name="categories">
          <div class="toolbar">
            <el-button type="primary" @click="openCategoryDialog('add')">新增分类</el-button>
            <el-button @click="loadCategories">刷新</el-button>
          </div>

          <el-table v-loading="categoryLoading" :data="categoryTableData" border>
            <el-table-column prop="name" label="分类名称" min-width="120" />
            <el-table-column prop="code" label="分类编码" min-width="140" />
            <el-table-column prop="linkCount" label="链接数" width="90" />
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                  {{ row.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openCategoryDialog('edit', row)">编辑</el-button>
                <el-button
                  link
                  type="danger"
                  :disabled="row.code === 'general'"
                  @click="handleDeleteCategory(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="linkDialogVisible" :title="linkDialogTitle" width="520px" destroy-on-close>
      <el-form ref="linkFormRef" :model="linkForm" :rules="linkRules" label-width="96px">
        <el-form-item label="链接编码" prop="code">
          <el-input v-model="linkForm.code" placeholder="如：community-news" :disabled="linkDialogMode === 'edit'" />
          <div class="form-tip">小写字母开头，仅含小写字母、数字、连字符</div>
        </el-form-item>
        <el-form-item label="链接名称" prop="name">
          <el-input v-model="linkForm.name" placeholder="如：社区资讯" />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryCode">
          <el-select v-model="linkForm.categoryCode" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="链接类型" prop="type">
          <el-radio-group v-model="linkForm.type">
            <el-radio value="internal">站内</el-radio>
            <el-radio value="external">站外</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="跳转目标" prop="target">
          <el-input
            v-model="linkForm.target"
            :placeholder="linkForm.type === 'external' ? 'https://example.com' : '/page1'"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="linkForm.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="linkForm.description" type="textarea" :rows="2" placeholder="用途说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="linkDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="linkSubmitting" @click="handleSubmitLink">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryDialogTitle"
      width="480px"
      destroy-on-close
    >
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="96px">
        <el-form-item label="分类编码" prop="code">
          <el-input
            v-model="categoryForm.code"
            placeholder="如：marketing"
            :disabled="categoryDialogMode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="如：营销活动" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="1" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="categoryForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="categorySubmitting" @click="handleSubmitCategory">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createLink,
  createLinkCategory,
  deleteLink,
  deleteLinkCategory,
  getLinkCategoryList,
  getLinkCategoryOptions,
  getLinkList,
  updateLink,
  updateLinkCategory,
} from '@/api/link'

const activeTab = ref('links')
const linkLoading = ref(false)
const categoryLoading = ref(false)
const linkSubmitting = ref(false)
const categorySubmitting = ref(false)
const linkTableData = ref([])
const categoryTableData = ref([])
const categoryOptions = ref([])
const linkCategoryFilter = ref('')
const linkDialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const linkDialogMode = ref('add')
const categoryDialogMode = ref('add')
const linkFormRef = ref(null)
const categoryFormRef = ref(null)
const editingLink = ref(null)
const editingCategory = ref(null)

const defaultLinkForm = () => ({
  code: '',
  name: '',
  categoryCode: 'general',
  type: 'internal',
  target: '',
  status: 'enabled',
  description: '',
})

const defaultCategoryForm = () => ({
  code: '',
  name: '',
  sort: 1,
  status: 'enabled',
  description: '',
})

const linkForm = reactive(defaultLinkForm())
const categoryForm = reactive(defaultCategoryForm())

const linkRules = {
  code: [
    { required: true, message: '请输入链接编码', trigger: 'blur' },
    {
      pattern: /^[a-z][a-z0-9-]{1,48}$/,
      message: '编码需以小写字母开头，仅含小写字母、数字、连字符',
      trigger: 'blur',
    },
  ],
  name: [{ required: true, message: '请输入链接名称', trigger: 'blur' }],
  categoryCode: [{ required: true, message: '请选择分类', trigger: 'change' }],
  type: [{ required: true, message: '请选择链接类型', trigger: 'change' }],
  target: [{ required: true, message: '请输入跳转目标', trigger: 'blur' }],
}

const categoryRules = {
  code: [
    { required: true, message: '请输入分类编码', trigger: 'blur' },
    {
      pattern: /^[a-z][a-z0-9-]{1,48}$/,
      message: '编码需以小写字母开头，仅含小写字母、数字、连字符',
      trigger: 'blur',
    },
  ],
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

const linkDialogTitle = computed(() => (linkDialogMode.value === 'add' ? '新增链接' : '编辑链接'))
const categoryDialogTitle = computed(() =>
  categoryDialogMode.value === 'add' ? '新增分类' : '编辑分类'
)

async function loadCategoryOptions() {
  categoryOptions.value = (await getLinkCategoryOptions()) ?? []
}

async function loadLinks() {
  linkLoading.value = true
  try {
    linkTableData.value = (await getLinkList(linkCategoryFilter.value || undefined)) ?? []
  } finally {
    linkLoading.value = false
  }
}

async function loadCategories() {
  categoryLoading.value = true
  try {
    categoryTableData.value = (await getLinkCategoryList()) ?? []
    await loadCategoryOptions()
  } finally {
    categoryLoading.value = false
  }
}

function openLinkDialog(mode, row = null) {
  linkDialogMode.value = mode
  Object.assign(linkForm, defaultLinkForm())
  editingLink.value = null
  if (mode === 'edit' && row) {
    editingLink.value = row
    Object.assign(linkForm, {
      code: row.code,
      name: row.name,
      categoryCode: row.categoryCode || 'general',
      type: row.type,
      target: row.target,
      status: row.status,
      description: row.description || '',
    })
  } else if (linkCategoryFilter.value) {
    linkForm.categoryCode = linkCategoryFilter.value
  }
  linkDialogVisible.value = true
}

function openCategoryDialog(mode, row = null) {
  categoryDialogMode.value = mode
  Object.assign(categoryForm, defaultCategoryForm())
  editingCategory.value = null
  if (mode === 'edit' && row) {
    editingCategory.value = row
    Object.assign(categoryForm, {
      code: row.code,
      name: row.name,
      sort: row.sort,
      status: row.status,
      description: row.description || '',
    })
  }
  categoryDialogVisible.value = true
}

async function handleSubmitLink() {
  try {
    await linkFormRef.value.validate()
  } catch {
    return
  }

  linkSubmitting.value = true
  const payload = { ...linkForm }
  try {
    if (linkDialogMode.value === 'add') {
      await createLink(payload)
      ElMessage.success('新增成功')
    } else {
      await updateLink(editingLink.value.id, payload)
      ElMessage.success('更新成功')
    }
    linkDialogVisible.value = false
    await loadLinks()
  } finally {
    linkSubmitting.value = false
  }
}

async function handleSubmitCategory() {
  try {
    await categoryFormRef.value.validate()
  } catch {
    return
  }

  categorySubmitting.value = true
  const payload = { ...categoryForm }
  try {
    if (categoryDialogMode.value === 'add') {
      await createLinkCategory(payload)
      ElMessage.success('新增成功')
    } else {
      await updateLinkCategory(editingCategory.value.id, payload)
      ElMessage.success('更新成功')
    }
    categoryDialogVisible.value = false
    await loadCategories()
    await loadLinks()
  } finally {
    categorySubmitting.value = false
  }
}

async function handleDeleteLink(row) {
  await ElMessageBox.confirm(`确定删除链接「${row.name}」？`, '提示', { type: 'warning' })
  await deleteLink(row.id)
  ElMessage.success('删除成功')
  loadLinks()
}

async function handleDeleteCategory(row) {
  await ElMessageBox.confirm(`确定删除分类「${row.name}」？`, '提示', { type: 'warning' })
  await deleteLinkCategory(row.id)
  ElMessage.success('删除成功')
  loadCategories()
  loadLinks()
}

onMounted(async () => {
  await loadCategoryOptions()
  await loadLinks()
  await loadCategories()
})
</script>

<style scoped lang="scss">
.link-manage__tip {
  margin-bottom: 16px;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
