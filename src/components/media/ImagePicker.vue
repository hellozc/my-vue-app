<template>
  <div class="image-picker">
    <div class="image-picker__preview" :style="{ height: previewHeight }" @click="openUpload">
      <el-image
        v-if="displayUrl"
        :src="displayUrl"
        fit="cover"
        class="image-picker__image"
      />
      <div v-else class="image-picker__placeholder">
        <el-icon><Plus /></el-icon>
        <span>{{ placeholder }}</span>
      </div>
      <div v-if="displayUrl" class="image-picker__mask">
        <el-button link type="primary" @click.stop="openUpload">更换</el-button>
        <el-button link type="danger" @click.stop="clearValue">清除</el-button>
      </div>
    </div>

    <div class="image-picker__actions">
      <el-button v-if="allowUpload" size="small" :loading="uploading" @click="openUpload">
        本地上传
      </el-button>
      <el-button v-if="allowLibrary" size="small" @click="libraryVisible = true">
        素材库
      </el-button>
    </div>

    <el-input
      v-if="allowUrl"
      :model-value="modelValue"
      class="image-picker__url"
      :placeholder="urlPlaceholder"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <p v-if="hintText" class="image-picker__hint">{{ hintText }}</p>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="image-picker__input"
      @change="handleFileChange"
    />

    <MediaLibraryDialog
      v-model="libraryVisible"
      :category="category"
      @select="handleLibrarySelect"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import MediaLibraryDialog from '@/components/media/MediaLibraryDialog.vue'
import { uploadMedia } from '@/api/media'
import { compressImageFile, formatSize } from '@/utils/imageCompress'
import { resolveMediaUrl } from '@/utils/media'
import { DEFAULT_IMAGE_UPLOAD_OPTIONS } from '@shared/media/uploadOptions'

const props = defineProps({
  modelValue: { type: String, default: '' },
  category: { type: String, default: 'general' },
  placeholder: { type: String, default: '点击上传图片' },
  urlPlaceholder: { type: String, default: '或粘贴图片地址' },
  hint: { type: String, default: '' },
  previewHeight: { type: String, default: '120px' },
  maxSizeMB: { type: Number, default: DEFAULT_IMAGE_UPLOAD_OPTIONS.maxSizeMB },
  compressTargetMB: { type: Number, default: DEFAULT_IMAGE_UPLOAD_OPTIONS.compressTargetMB },
  maxWidth: { type: Number, default: DEFAULT_IMAGE_UPLOAD_OPTIONS.maxWidth },
  maxHeight: { type: Number, default: DEFAULT_IMAGE_UPLOAD_OPTIONS.maxHeight },
  quality: { type: Number, default: DEFAULT_IMAGE_UPLOAD_OPTIONS.quality },
  enableCompress: { type: Boolean, default: DEFAULT_IMAGE_UPLOAD_OPTIONS.enableCompress },
  allowUrl: { type: Boolean, default: DEFAULT_IMAGE_UPLOAD_OPTIONS.allowUrl },
  allowLibrary: { type: Boolean, default: DEFAULT_IMAGE_UPLOAD_OPTIONS.allowLibrary },
  allowUpload: { type: Boolean, default: DEFAULT_IMAGE_UPLOAD_OPTIONS.allowUpload },
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

const fileInputRef = ref(null)
const uploading = ref(false)
const libraryVisible = ref(false)

const displayUrl = computed(() => resolveMediaUrl(props.modelValue))

const hintText = computed(() => {
  if (props.hint) return props.hint
  const parts = []
  if (props.allowUpload) {
    parts.push(`最大 ${props.maxSizeMB}MB`)
    if (props.enableCompress) parts.push('超出自动压缩')
  }
  if (props.category) parts.push(`分类：${props.category}`)
  return parts.join(' · ')
})

function openUpload() {
  if (!props.allowUpload || uploading.value) return
  fileInputRef.value?.click()
}

function clearValue() {
  emit('update:modelValue', '')
}

function handleLibrarySelect(item) {
  emit('update:modelValue', item.url)
  emit('uploaded', item)
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  uploading.value = true
  try {
    const result = await compressImageFile(file, {
      maxSizeMB: props.maxSizeMB,
      compressTargetMB: props.compressTargetMB,
      maxWidth: props.maxWidth,
      maxHeight: props.maxHeight,
      quality: props.quality,
      enableCompress: props.enableCompress,
    })

    const formData = new FormData()
    formData.append('file', result.file)
    formData.append('categoryCode', props.category)
    formData.append('name', file.name)
    if (result.width) formData.append('width', String(result.width))
    if (result.height) formData.append('height', String(result.height))

    const media = await uploadMedia(formData, props.category)
    emit('update:modelValue', media.url)
    emit('uploaded', media)

    if (result.compressed) {
      ElMessage.success(
        `上传成功（${formatSize(result.originalSize)} → ${formatSize(result.compressedSize)}）`
      )
    } else {
      ElMessage.success('上传成功')
    }
  } catch (err) {
    ElMessage.error(err.message || '上传失败')
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped lang="scss">
.image-picker__preview {
  position: relative;
  width: 100%;
  border: 1px dashed rgba(99, 102, 241, 0.35);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);

  &:hover .image-picker__mask {
    opacity: 1;
  }
}

.image-picker__image {
  width: 100%;
  height: 100%;
  display: block;
}

.image-picker__placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
}

.image-picker__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.45);
  opacity: 0;
  transition: opacity 0.2s;
}

.image-picker__actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.image-picker__url {
  margin-top: 8px;
}

.image-picker__hint {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.58);
}

.image-picker__input {
  display: none;
}
</style>
