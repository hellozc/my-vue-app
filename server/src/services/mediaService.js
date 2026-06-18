import fs from 'fs'
import path from 'path'
import * as mediaCategoryRepo from '../repositories/mediaCategoryRepository.js'
import * as mediaRepo from '../repositories/mediaRepository.js'
import { buildPublicUrl, getCategoryDir, mediaConfig, resolveAbsolutePath } from '../config/media.js'

function ensureUploadRoot() {
  if (!fs.existsSync(mediaConfig.uploadRoot)) {
    fs.mkdirSync(mediaConfig.uploadRoot, { recursive: true })
  }
}

function sanitizeCode(code) {
  const value = String(code || 'general').trim()
  if (!/^[a-z][a-z0-9_-]*$/.test(value)) {
    throw new Error('分类编码需为小写字母开头，仅含字母数字_-')
  }
  return value
}

export async function listCategories() {
  return mediaCategoryRepo.findAllCategories()
}

export async function listCategoryOptions() {
  return mediaCategoryRepo.findEnabledCategoryOptions()
}

export async function createCategory(payload) {
  const code = sanitizeCode(payload.code)
  const exists = await mediaCategoryRepo.findCategoryByCode(code)
  if (exists) throw new Error('分类编码已存在')

  const category = await mediaCategoryRepo.insertCategory({
    code,
    name: payload.name?.trim() || code,
    sort: Number(payload.sort) || 1,
    status: payload.status === 'disabled' ? 'disabled' : 'enabled',
    description: payload.description?.trim() || '',
  })

  fs.mkdirSync(getCategoryDir(code), { recursive: true })
  return category
}

export async function updateCategory(id, payload) {
  const current = await mediaCategoryRepo.findCategoryById(id)
  if (!current) throw new Error('分类不存在')
  if (current.code === 'general' && payload.status === 'disabled') {
    throw new Error('通用分类不可禁用')
  }
  return mediaCategoryRepo.updateCategoryById(id, {
    name: payload.name?.trim() || current.name,
    sort: Number(payload.sort) || current.sort,
    status: payload.status === 'disabled' ? 'disabled' : 'enabled',
    description: payload.description?.trim() ?? current.description,
  })
}

export async function removeCategory(id) {
  const current = await mediaCategoryRepo.findCategoryById(id)
  if (!current) throw new Error('分类不存在')
  if (current.code === 'general') throw new Error('通用分类不可删除')
  return mediaCategoryRepo.deleteCategoryById(id)
}

export async function listMedia(query = {}) {
  return mediaRepo.findMediaList(query)
}

export async function listMediaOptions(categoryCode) {
  return mediaRepo.findMediaOptions(categoryCode)
}

export async function getMediaById(id) {
  const media = await mediaRepo.findMediaById(id)
  if (!media) throw new Error('素材不存在')
  return media
}

export async function updateMedia(id, payload) {
  const current = await mediaRepo.findMediaById(id)
  if (!current) throw new Error('素材不存在')

  const categoryCode = payload.categoryCode
    ? sanitizeCode(payload.categoryCode)
    : current.categoryCode
  const category = await mediaCategoryRepo.findCategoryByCode(categoryCode)
  if (!category) throw new Error('素材分类不存在')

  return mediaRepo.updateMediaById(id, {
    name: payload.name?.trim() || current.name,
    categoryCode,
    status: payload.status === 'disabled' ? 'disabled' : 'enabled',
  })
}

export async function removeMedia(id) {
  const media = await mediaRepo.findMediaById(id)
  if (!media) throw new Error('素材不存在')

  const deleted = await mediaRepo.deleteMediaById(id)
  try {
    const absolutePath = resolveAbsolutePath(media.path)
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath)
    }
  } catch {
    /* 文件可能已不存在，忽略 */
  }
  return deleted
}

export async function uploadMedia(file, payload = {}) {
  ensureUploadRoot()
  if (!file) throw new Error('请选择图片文件')

  const categoryCode = sanitizeCode(
    payload.categoryCode || path.basename(path.dirname(file.path || '')) || 'general'
  )
  const category = await mediaCategoryRepo.findCategoryByCode(categoryCode)
  if (!category || category.status !== 'enabled') {
    throw new Error('素材分类不存在或已禁用')
  }

  const relativePath = path.posix.join(categoryCode, file.filename)
  const url = buildPublicUrl(relativePath)

  return mediaRepo.insertMedia({
    name: payload.name?.trim() || file.originalname || file.filename,
    categoryCode,
    url,
    path: relativePath,
    mimeType: file.mimetype,
    fileSize: file.size,
    width: payload.width ? Number(payload.width) : null,
    height: payload.height ? Number(payload.height) : null,
    status: 'enabled',
  })
}
