import * as linkRepository from '../repositories/linkRepository.js'
import * as linkCategoryService from './linkCategoryService.js'

const CODE_PATTERN = /^[a-z][a-z0-9-]{1,48}$/

function validateLinkPayload(data, { partial = false } = {}) {
  if (!partial || data.code !== undefined) {
    if (!data.code) throw new Error('链接编码不能为空')
    if (!CODE_PATTERN.test(data.code)) {
      throw new Error('链接编码需以小写字母开头，仅含小写字母、数字、连字符')
    }
  }
  if (!partial || data.name !== undefined) {
    if (!data.name) throw new Error('链接名称不能为空')
  }
  if (!partial || data.type !== undefined) {
    if (!['internal', 'external'].includes(data.type)) throw new Error('链接类型无效')
  }
  if (!partial || data.target !== undefined) {
    if (!data.target) throw new Error('跳转目标不能为空')
    const linkType = data.type
    if (linkType === 'external' && !/^https?:\/\//i.test(data.target)) {
      throw new Error('站外链接需以 http:// 或 https:// 开头')
    }
    if (linkType === 'internal' && !data.target.startsWith('/')) {
      throw new Error('站内链接需以 / 开头')
    }
  }
  if (data.status !== undefined && !['enabled', 'disabled'].includes(data.status)) {
    throw new Error('链接状态无效')
  }
}

export async function listLinks(categoryCode = null) {
  return linkRepository.findAllLinks(categoryCode || null)
}

export async function listLinkOptions(categoryCode = null) {
  return linkRepository.findEnabledLinkOptions(categoryCode || null)
}

export async function getLink(id) {
  const link = await linkRepository.findLinkById(id)
  if (!link) throw new Error('链接不存在')
  return link
}

export async function getLinkByCode(code) {
  const link = await linkRepository.findLinkByCode(code)
  if (!link) throw new Error('链接不存在')
  return link
}

export async function createLink(data) {
  validateLinkPayload(data)
  if (await linkRepository.existsByCode(data.code)) throw new Error('链接编码已存在')
  data.categoryCode = await linkCategoryService.ensureCategoryExists(data.categoryCode || 'general')
  return linkRepository.createLink(data)
}

export async function updateLink(id, data) {
  const existing = await linkRepository.findLinkById(id)
  if (!existing) throw new Error('链接不存在')
  validateLinkPayload(data, { partial: true })
  if (data.code && await linkRepository.existsByCode(data.code, id)) {
    throw new Error('链接编码已存在')
  }
  if (data.categoryCode) {
    data.categoryCode = await linkCategoryService.ensureCategoryExists(data.categoryCode)
  }
  return linkRepository.updateLink(id, data)
}

export async function trackLinkClick(code) {
  if (!code) throw new Error('链接编码不能为空')
  const ok = await linkRepository.incrementClickCount(code)
  if (!ok) throw new Error('链接不存在或已禁用')
  return { code }
}

export async function removeLink(id) {
  const ok = await linkRepository.deleteLink(id)
  if (!ok) throw new Error('链接不存在')
}
