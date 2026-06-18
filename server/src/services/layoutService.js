import * as layoutRepository from '../repositories/layoutRepository.js'

export async function listLayouts() {
  return layoutRepository.findAllLayouts()
}

export async function getLayout(id) {
  const layout = await layoutRepository.findLayoutById(id)
  if (!layout) throw new Error('布局不存在')
  return layout
}

export async function getPublishedLayoutByCode(code) {
  const layout = await layoutRepository.findPublishedLayoutByCode(code)
  if (!layout) throw new Error('布局不存在或未发布')
  return layout
}

export async function createLayout(data) {
  if (!data.code || !data.name) throw new Error('编码和名称不能为空')
  if (await layoutRepository.existsByCode(data.code)) throw new Error('布局编码已存在')
  if (!data.schema) throw new Error('布局 Schema 不能为空')
  return layoutRepository.createLayout(data)
}

export async function updateLayout(id, data) {
  const existing = await layoutRepository.findLayoutById(id)
  if (!existing) throw new Error('布局不存在')
  if (data.code && await layoutRepository.existsByCode(data.code, id)) {
    throw new Error('布局编码已存在')
  }
  return layoutRepository.updateLayout(id, data)
}

export async function publishLayout(id) {
  const existing = await layoutRepository.findLayoutById(id)
  if (!existing) throw new Error('布局不存在')
  return layoutRepository.publishLayout(id)
}

export async function removeLayout(id) {
  const ok = await layoutRepository.deleteLayout(id)
  if (!ok) throw new Error('布局不存在')
}
