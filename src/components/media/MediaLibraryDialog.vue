<template>
  <el-dialog
    v-model="visible"
    title="选择素材"
    width="860px"
    destroy-on-close
    class="media-library-dialog"
    @closed="handleClosed"
  >
    <div class="media-library__toolbar">
      <el-select
        v-model="categoryFilter"
        clearable
        placeholder="全部分类"
        style="width: 180px"
        @change="loadData"
      >
        <el-option
          v-for="item in categoryOptions"
          :key="item.code"
          :label="item.name"
          :value="item.code"
        />
      </el-select>
      <el-input
        v-model="keyword"
        clearable
        placeholder="搜索名称或 URL"
        style="width: 220px"
        @keyup.enter="loadData"
      />
      <el-button @click="loadData">查询</el-button>
    </div>

    <div v-loading="loading" class="media-library__grid">
      <button
        v-for="item in list"
        :key="item.id"
        type="button"
        class="media-card"
        :class="{ 'is-active': selectedId === item.id }"
        @click="selectedId = item.id"
      >
        <el-image :src="resolveMediaUrl(item.url)" fit="cover" class="media-card__image">
          <template #error>
            <div class="media-card__error">无法预览</div>
          </template>
        </el-image>
        <div class="media-card__meta">
          <span class="media-card__name">{{ item.name }}</span>
          <span class="media-card__size">{{ formatFileSize(item.fileSize) }}</span>
        </div>
      </button>
      <el-empty v-if="!loading && !list.length" description="暂无素材" :image-size="72" />
    </div>

    <div class="media-library__footer">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        layout="total, prev, pager, next"
        :total="total"
        @current-change="loadData"
      />
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="!selectedId" @click="confirmSelect">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getMediaCategoryOptions, getMediaList } from '@/api/media'
import { resolveMediaUrl } from '@/utils/media'

const props = defineProps({
  category: { type: String, default: '' },
})

const visible = defineModel({ type: Boolean, default: false })
const emit = defineEmits(['select'])

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(18)
const keyword = ref('')
const categoryFilter = ref('')
const categoryOptions = ref([])
const selectedId = ref(null)

watch(visible, async (open) => {
  if (!open) return
  categoryFilter.value = props.category || ''
  selectedId.value = null
  page.value = 1
  await loadCategories()
  await loadData()
})

async function loadCategories() {
  categoryOptions.value = (await getMediaCategoryOptions()) ?? []
}

async function loadData() {
  loading.value = true
  try {
    const data = await getMediaList({
      categoryCode: categoryFilter.value || undefined,
      keyword: keyword.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    })
    list.value = data?.list ?? []
    total.value = data?.total ?? 0
  } finally {
    loading.value = false
  }
}

function formatFileSize(size) {
  if (!size) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

function confirmSelect() {
  const item = list.value.find((row) => row.id === selectedId.value)
  if (!item) return
  emit('select', item)
  visible.value = false
}

function handleClosed() {
  keyword.value = ''
  selectedId.value = null
}
</script>

<style scoped lang="scss">
.media-library__toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.media-library__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  min-height: 280px;
  max-height: 420px;
  overflow: auto;
  padding-right: 4px;
}

.media-card {
  border: 1px solid rgba(99, 102, 241, 0.18);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: border-color 0.2s, box-shadow 0.2s;

  &.is-active {
    border-color: #6366f1;
    box-shadow: inset 0 0 0 1px #6366f1;
  }
}

.media-card__image {
  width: 100%;
  height: 96px;
  display: block;
}

.media-card__error {
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
}

.media-card__meta {
  padding: 8px;
}

.media-card__name {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-card__size {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
}

.media-library__footer {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
