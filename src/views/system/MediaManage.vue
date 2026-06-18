<template>
  <div class="media-manage">
    <el-card shadow="never">
      <el-alert type="info" :closable="false" show-icon class="media-manage__tip">
        图片素材按<strong>分类</strong>管理，布局编辑器中的图片选择器会按场景自动筛选分类。
        上传支持<strong>自动压缩</strong>，默认限制 2MB（可在组件上单独配置）。
      </el-alert>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="素材列表" name="media">
          <div class="toolbar">
            <el-select
              v-model="mediaCategoryFilter"
              clearable
              placeholder="全部分类"
              style="width: 180px"
              @change="loadMedia"
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
            <el-input
              v-model="mediaKeyword"
              clearable
              placeholder="搜索名称或 URL"
              style="width: 220px"
              @keyup.enter="loadMedia"
            />
            <el-button type="primary" @click="openUploadDialog">上传图片</el-button>
            <el-button @click="loadMedia">刷新</el-button>
          </div>

          <el-table v-loading="mediaLoading" :data="mediaTableData" border>
            <el-table-column label="预览" width="90">
              <template #default="{ row }">
                <el-image
                  :src="resolveMediaUrl(row.url)"
                  fit="cover"
                  style="width: 56px; height: 56px; border-radius: 6px"
                />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" min-width="140" />
            <el-table-column prop="categoryName" label="分类" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ row.categoryName || row.categoryCode }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="大小" width="100">
              <template #default="{ row }">{{ formatSize(row.fileSize) }}</template>
            </el-table-column>
            <el-table-column prop="url" label="URL" min-width="180" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                  {{ row.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDeleteMedia(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pager">
            <el-pagination
              v-model:current-page="mediaPage"
              v-model:page-size="mediaPageSize"
              layout="total, prev, pager, next"
              :total="mediaTotal"
              @current-change="loadMedia"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="分类管理" name="categories">
          <div class="toolbar">
            <el-button type="primary" @click="openCategoryDialog('add')">新增分类</el-button>
            <el-button @click="loadCategories">刷新</el-button>
          </div>

          <el-table v-loading="categoryLoading" :data="categoryTableData" border>
            <el-table-column prop="name" label="分类名称" min-width="120" />
            <el-table-column prop="code" label="分类编码" min-width="140" />
            <el-table-column prop="mediaCount" label="素材数" width="90" />
            <el-table-column prop="sort" label="排序" width="80" />
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

    <el-dialog v-model="uploadDialogVisible" title="上传图片" width="520px" destroy-on-close>
      <el-form label-width="96px">
        <el-form-item label="素材分类">
          <el-select v-model="uploadCategory" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择图片">
          <ImagePicker
            v-model="uploadPreviewUrl"
            :category="uploadCategory"
            :max-size-m-b="uploadMaxSizeMB"
            :enable-compress="uploadEnableCompress"
            preview-height="160px"
            :allow-url="false"
            :allow-library="false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑素材" width="480px" destroy-on-close>
      <el-form :model="editForm" label-width="96px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editForm.categoryCode" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSaving" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="categoryDialogVisible" :title="categoryDialogTitle" width="480px" destroy-on-close>
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="96px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="categoryForm.code" :disabled="categoryDialogMode === 'edit'" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sort" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="categoryForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="categorySaving" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ImagePicker } from '@/components/media'
import {
  createMediaCategory,
  deleteMedia,
  deleteMediaCategory,
  getMediaCategoryList,
  getMediaCategoryOptions,
  getMediaList,
  updateMedia,
  updateMediaCategory,
} from '@/api/media'
import { resolveMediaUrl } from '@/utils/media'

const activeTab = ref('media')
const categoryOptions = ref([])

const mediaLoading = ref(false)
const mediaTableData = ref([])
const mediaTotal = ref(0)
const mediaPage = ref(1)
const mediaPageSize = ref(10)
const mediaCategoryFilter = ref('')
const mediaKeyword = ref('')

const categoryLoading = ref(false)
const categoryTableData = ref([])

const uploadDialogVisible = ref(false)
const uploadCategory = ref('general')
const uploadPreviewUrl = ref('')
const uploadMaxSizeMB = ref(2)
const uploadEnableCompress = ref(true)

const editDialogVisible = ref(false)
const editSaving = ref(false)
const editForm = reactive({
  id: null,
  name: '',
  categoryCode: 'general',
  status: 'enabled',
})

const categoryDialogVisible = ref(false)
const categoryDialogMode = ref('add')
const categorySaving = ref(false)
const categoryFormRef = ref(null)
const categoryForm = reactive({
  id: null,
  name: '',
  code: '',
  sort: 1,
  description: '',
})

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入分类编码', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_-]*$/, message: '小写字母开头，仅含字母数字_-', trigger: 'blur' },
  ],
}

const categoryDialogTitle = computed(() =>
  categoryDialogMode.value === 'add' ? '新增分类' : '编辑分类'
)

function formatSize(size) {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

async function loadCategoryOptions() {
  categoryOptions.value = (await getMediaCategoryOptions()) ?? []
}

async function loadMedia() {
  mediaLoading.value = true
  try {
    const data = await getMediaList({
      categoryCode: mediaCategoryFilter.value || undefined,
      keyword: mediaKeyword.value || undefined,
      page: mediaPage.value,
      pageSize: mediaPageSize.value,
    })
    mediaTableData.value = data?.list ?? []
    mediaTotal.value = data?.total ?? 0
  } finally {
    mediaLoading.value = false
  }
}

async function loadCategories() {
  categoryLoading.value = true
  try {
    categoryTableData.value = (await getMediaCategoryList()) ?? []
  } finally {
    categoryLoading.value = false
  }
}

function openUploadDialog() {
  uploadCategory.value = mediaCategoryFilter.value || 'general'
  uploadPreviewUrl.value = ''
  uploadDialogVisible.value = true
}

function openEditDialog(row) {
  editForm.id = row.id
  editForm.name = row.name
  editForm.categoryCode = row.categoryCode
  editForm.status = row.status
  editDialogVisible.value = true
}

async function saveEdit() {
  editSaving.value = true
  try {
    await updateMedia(editForm.id, {
      name: editForm.name,
      categoryCode: editForm.categoryCode,
      status: editForm.status,
    })
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadMedia()
  } finally {
    editSaving.value = false
  }
}

async function handleDeleteMedia(row) {
  await ElMessageBox.confirm(`确定删除素材「${row.name}」？`, '提示', { type: 'warning' })
  await deleteMedia(row.id)
  ElMessage.success('删除成功')
  loadMedia()
}

function openCategoryDialog(mode, row) {
  categoryDialogMode.value = mode
  if (mode === 'edit' && row) {
    categoryForm.id = row.id
    categoryForm.name = row.name
    categoryForm.code = row.code
    categoryForm.sort = row.sort
    categoryForm.description = row.description || ''
  } else {
    categoryForm.id = null
    categoryForm.name = ''
    categoryForm.code = ''
    categoryForm.sort = 1
    categoryForm.description = ''
  }
  categoryDialogVisible.value = true
}

async function saveCategory() {
  await categoryFormRef.value?.validate()
  categorySaving.value = true
  try {
    if (categoryDialogMode.value === 'add') {
      await createMediaCategory(categoryForm)
      ElMessage.success('创建成功')
    } else {
      await updateMediaCategory(categoryForm.id, categoryForm)
      ElMessage.success('更新成功')
    }
    categoryDialogVisible.value = false
    await loadCategoryOptions()
    loadCategories()
    loadMedia()
  } finally {
    categorySaving.value = false
  }
}

async function handleDeleteCategory(row) {
  await ElMessageBox.confirm(`确定删除分类「${row.name}」？`, '提示', { type: 'warning' })
  await deleteMediaCategory(row.id)
  ElMessage.success('删除成功')
  await loadCategoryOptions()
  loadCategories()
}

onMounted(async () => {
  await loadCategoryOptions()
  await Promise.all([loadMedia(), loadCategories()])
})
</script>

<style scoped lang="scss">
.media-manage__tip {
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
