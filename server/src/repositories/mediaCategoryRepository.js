import { pool } from '../db/pool.js'

const mapCategoryRow = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  sort: row.sort,
  status: row.status,
  description: row.description,
  mediaCount: row.media_count ?? 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function findAllCategories() {
  const [rows] = await pool.query(
    `SELECT c.id, c.code, c.name, c.sort, c.status, c.description, c.created_at, c.updated_at,
            COUNT(m.id) AS media_count
     FROM sys_media_category c
     LEFT JOIN sys_media m ON m.category_code = c.code
     GROUP BY c.id
     ORDER BY c.sort ASC, c.id ASC`
  )
  return rows.map(mapCategoryRow)
}

export async function findEnabledCategoryOptions() {
  const [rows] = await pool.query(
    `SELECT id, code, name, sort, status, description
     FROM sys_media_category
     WHERE status = 'enabled'
     ORDER BY sort ASC, id ASC`
  )
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    sort: row.sort,
    status: row.status,
    description: row.description,
  }))
}

export async function findCategoryById(id) {
  const [rows] = await pool.query(
    `SELECT id, code, name, sort, status, description, created_at, updated_at
     FROM sys_media_category WHERE id = ?`,
    [id]
  )
  if (!rows[0]) return null
  const row = rows[0]
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    sort: row.sort,
    status: row.status,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function findCategoryByCode(code) {
  const [rows] = await pool.query(
    `SELECT id, code, name, sort, status, description
     FROM sys_media_category WHERE code = ?`,
    [code]
  )
  return rows[0] ?? null
}

export async function insertCategory(data) {
  const [result] = await pool.query(
    `INSERT INTO sys_media_category (code, name, sort, status, description)
     VALUES (?, ?, ?, ?, ?)`,
    [data.code, data.name, data.sort ?? 1, data.status ?? 'enabled', data.description ?? '']
  )
  return findCategoryById(result.insertId)
}

export async function updateCategoryById(id, data) {
  await pool.query(
    `UPDATE sys_media_category
     SET name = ?, sort = ?, status = ?, description = ?
     WHERE id = ?`,
    [data.name, data.sort ?? 1, data.status ?? 'enabled', data.description ?? '', id]
  )
  return findCategoryById(id)
}

export async function deleteCategoryById(id) {
  const category = await findCategoryById(id)
  if (!category) return null
  const [mediaCount] = await pool.query(
    'SELECT COUNT(*) AS total FROM sys_media WHERE category_code = ?',
    [category.code]
  )
  if (mediaCount[0].total > 0) {
    throw new Error('分类下仍有素材，无法删除')
  }
  await pool.query('DELETE FROM sys_media_category WHERE id = ?', [id])
  return category
}
