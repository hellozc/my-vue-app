import * as linkCategoryRepository from '../repositories/linkCategoryRepository.js'

const CODE_PATTERN = /^[a-z][a-z0-9-]{1,48}$/

function validateCategoryPayload(data, { partial = false } = {}) {
  if (!partial || data.code !== undefined) {
    if (!data.code) throw new Error('分类编码不能为空')
    if (!CODE_PATTERN.test(data.code)) {
      throw new Error('分类编码需以小写字母开头，仅含小写字母、数字、连字符')
    }
  }
  if (!partial || data.name !== undefined) {
    if (!data.name) throw new Error('分类名称不能为空')
  }
  if (data.status !== undefined && !['enabled', 'disabled'].includes(data.status)) {
    throw new Error('分类状态无效')
  }
}

export async function listCategories() {
  return linkCategoryRepository.findAllCategories()
}

export async function listCategoryOptions() {
  return linkCategoryRepository.findEnabledCategoryOptions()
}

export async function getCategory(id) {
  const category = await linkCategoryRepository.findCategoryById(id)
  if (!category) throw new Error('分类不存在')
  return category
}

export async function createCategory(data) {
  validateCategoryPayload(data)
  if (await linkCategoryRepository.existsCategoryByCode(data.code)) {
    throw new Error('分类编码已存在')
  }
  return linkCategoryRepository.createCategory(data)
}

export async function updateCategory(id, data) {
  const existing = await linkCategoryRepository.findCategoryById(id)
  if (!existing) throw new Error('分类不存在')
  validateCategoryPayload(data, { partial: true })
  if (data.code && await linkCategoryRepository.existsCategoryByCode(data.code, id)) {
    throw new Error('分类编码已存在')
  }
  return linkCategoryRepository.updateCategory(id, data)
}

export async function removeCategory(id) {
  const existing = await linkCategoryRepository.findCategoryById(id)
  if (!existing) throw new Error('分类不存在')
  if (existing.code === 'general') throw new Error('默认分类不可删除')
  if (existing.linkCount > 0) throw new Error('该分类下仍有链接，请先移动或删除链接')
  const ok = await linkCategoryRepository.deleteCategory(id)
  if (!ok) throw new Error('分类不存在')
}

export async function ensureCategoryExists(categoryCode) {
  if (!categoryCode) return 'general'
  const category = await linkCategoryRepository.findCategoryByCode(categoryCode)
  if (!category) throw new Error('链接分类不存在')
  if (category.status === 'disabled') throw new Error('链接分类已禁用')
  return categoryCode
}
