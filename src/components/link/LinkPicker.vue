<template>
  <div class="link-picker">
    <el-select
      :model-value="modelValue"
      filterable
      clearable
      :placeholder="placeholder"
      style="width: 100%"
      @update:model-value="emit('update:modelValue', $event || '')"
    >
      <template v-if="groupedOptions.length">
        <el-option-group
          v-for="group in groupedOptions"
          :key="group.code"
          :label="group.name"
        >
          <el-option
            v-for="item in group.items"
            :key="item.code"
            :label="formatLabel(item)"
            :value="item.code"
          >
            <div class="link-picker__option">
              <span class="link-picker__name">{{ item.name }}</span>
              <el-tag size="small" :type="item.type === 'external' ? 'warning' : 'success'">
                {{ item.type === 'external' ? '站外' : '站内' }}
              </el-tag>
              <span class="link-picker__target">{{ item.target }}</span>
            </div>
          </el-option>
        </el-option-group>
      </template>
      <el-option
        v-for="item in flatOptions"
        v-else
        :key="item.code"
        :label="formatLabel(item)"
        :value="item.code"
      >
        <div class="link-picker__option">
          <span class="link-picker__name">{{ item.name }}</span>
          <el-tag size="small" :type="item.type === 'external' ? 'warning' : 'success'">
            {{ item.type === 'external' ? '站外' : '站内' }}
          </el-tag>
          <span class="link-picker__target">{{ item.target }}</span>
        </div>
      </el-option>
    </el-select>

    <div class="link-picker__actions">
      <el-button link type="primary" @click="refresh">刷新</el-button>
      <el-button link type="primary" @click="openManage">管理链接</el-button>
    </div>

    <div v-if="selectedLink" class="link-picker__preview">
      当前：{{ selectedLink.name }}
      <template v-if="selectedLink.categoryName">（{{ selectedLink.categoryName }}）</template>
      → {{ selectedLink.target }}
    </div>
    <div v-else-if="legacyLink" class="link-picker__preview is-legacy">
      旧版直链：{{ legacyLink }}（建议改为统一链接）
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getLinkCategoryOptions, getLinkOptions } from '@/api/link'

const props = defineProps({
  modelValue: { type: String, default: '' },
  legacyLink: { type: String, default: '' },
  /** 仅展示某分类下的链接，如 navigation / content */
  categoryFilter: { type: String, default: '' },
  placeholder: { type: String, default: '选择统一链接' },
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const options = ref([])
const categories = ref([])

const selectedLink = computed(() => options.value.find((item) => item.code === props.modelValue))

const flatOptions = computed(() => (props.categoryFilter ? options.value : []))

const groupedOptions = computed(() => {
  if (props.categoryFilter) return []

  const categoryMap = new Map(categories.value.map((item) => [item.code, item.name]))
  const groups = new Map()

  options.value.forEach((item) => {
    const code = item.categoryCode || 'general'
    if (!groups.has(code)) {
      groups.set(code, {
        code,
        name: item.categoryName || categoryMap.get(code) || '未分类',
        sort: categories.value.find((c) => c.code === code)?.sort ?? 99,
        items: [],
      })
    }
    groups.get(code).items.push(item)
  })

  return [...groups.values()].sort((a, b) => a.sort - b.sort)
})

function formatLabel(item) {
  return `${item.name} (${item.code})`
}

async function refresh() {
  const [linkList, categoryList] = await Promise.all([
    getLinkOptions(props.categoryFilter || undefined),
    props.categoryFilter ? Promise.resolve([]) : getLinkCategoryOptions(),
  ])
  options.value = linkList ?? []
  categories.value = categoryList ?? []
}

function openManage() {
  router.push('/system/link')
}

watch(() => props.categoryFilter, refresh)

onMounted(refresh)
</script>

<style scoped lang="scss">
.link-picker__actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.link-picker__preview {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);
  word-break: break-all;

  &.is-legacy {
    color: #fbbf24;
  }
}

.link-picker__option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link-picker__name {
  min-width: 72px;
}

.link-picker__target {
  flex: 1;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
