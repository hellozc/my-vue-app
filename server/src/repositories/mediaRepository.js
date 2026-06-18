import { pool } from '../db/pool.js'

const mapMediaRow = (row) => ({
  id: row.id,
  name: row.name,
  categoryCode: row.category_code,
  categoryName: row.category_name,
  url: row.url,
  path: row.path,
  mimeType: row.mime_type,
  fileSize: row.file_size,
  width: row.width,
  height: row.height,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function findMediaList({ categoryCode, keyword, page = 1, pageSize = 24 } = {}) {
  const where = []
  const params = []

  if (categoryCode) {
    where.push('m.category_code = ?')
    params.push(categoryCode)
  }
  if (keyword) {
    where.push('(m.name LIKE ? OR m.url LIKE ?)')
    params.push(`%${keyword}%`, `%${keyword}%`)
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const offset = (Number(page) - 1) * Number(pageSize)

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM sys_media m ${whereSql}`,
    params
  )

  const [rows] = await pool.query(
    `SELECT m.id, m.name, m.category_code, m.url, m.path, m.mime_type, m.file_size,
            m.width, m.height, m.status, m.created_at, m.updated_at,
            c.name AS category_name
     FROM sys_media m
     LEFT JOIN sys_media_category c ON c.code = m.category_code
     ${whereSql}
     ORDER BY m.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  return {
    list: rows.map(mapMediaRow),
    total: countRows[0].total,
    page: Number(page),
    pageSize: Number(pageSize),
  }
}

export async function findMediaOptions(categoryCode) {
  const where = ["m.status = 'enabled'"]
  const params = []
  if (categoryCode) {
    where.push('m.category_code = ?')
    params.push(categoryCode)
  }

  const [rows] = await pool.query(
    `SELECT m.id, m.name, m.category_code, m.url, m.path, m.mime_type, m.file_size,
            m.width, m.height, m.status, m.created_at, m.updated_at,
            c.name AS category_name
     FROM sys_media m
     LEFT JOIN sys_media_category c ON c.code = m.category_code
     WHERE ${where.join(' AND ')}
     ORDER BY m.id DESC
     LIMIT 200`,
    params
  )
  return rows.map(mapMediaRow)
}

export async function findMediaById(id) {
  const [rows] = await pool.query(
    `SELECT m.id, m.name, m.category_code, m.url, m.path, m.mime_type, m.file_size,
            m.width, m.height, m.status, m.created_at, m.updated_at,
            c.name AS category_name
     FROM sys_media m
     LEFT JOIN sys_media_category c ON c.code = m.category_code
     WHERE m.id = ?`,
    [id]
  )
  return rows[0] ? mapMediaRow(rows[0]) : null
}

export async function insertMedia(data) {
  const [result] = await pool.query(
    `INSERT INTO sys_media
      (name, category_code, url, path, mime_type, file_size, width, height, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.categoryCode,
      data.url,
      data.path,
      data.mimeType,
      data.fileSize,
      data.width ?? null,
      data.height ?? null,
      data.status ?? 'enabled',
    ]
  )
  return findMediaById(result.insertId)
}

export async function updateMediaById(id, data) {
  await pool.query(
    `UPDATE sys_media
     SET name = ?, category_code = ?, status = ?
     WHERE id = ?`,
    [data.name, data.categoryCode, data.status ?? 'enabled', id]
  )
  return findMediaById(id)
}

export async function deleteMediaById(id) {
  const media = await findMediaById(id)
  if (!media) return null
  await pool.query('DELETE FROM sys_media WHERE id = ?', [id])
  return media
}
