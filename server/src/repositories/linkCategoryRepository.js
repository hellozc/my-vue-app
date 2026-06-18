import { pool } from '../db/pool.js'

const mapRow = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  sort: row.sort,
  status: row.status,
  description: row.description,
  linkCount: row.link_count ?? 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function findAllCategories() {
  const [rows] = await pool.query(
    `SELECT c.id, c.code, c.name, c.sort, c.status, c.description, c.created_at, c.updated_at,
            COUNT(l.id) AS link_count
     FROM sys_link_category c
     LEFT JOIN sys_link l ON l.category_code = c.code
     GROUP BY c.id
     ORDER BY c.sort ASC, c.id ASC`
  )
  return rows.map(mapRow)
}

export async function findEnabledCategoryOptions() {
  const [rows] = await pool.query(
    `SELECT id, code, name, sort, status, description
     FROM sys_link_category
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
     FROM sys_link_category WHERE id = ?`,
    [id]
  )
  if (!rows[0]) return null
  const linkCount = await countLinksByCategory(rows[0].code)
  return mapRow({ ...rows[0], link_count: linkCount })
}

export async function findCategoryByCode(code) {
  const [rows] = await pool.query(
    `SELECT id, code, name, sort, status, description, created_at, updated_at
     FROM sys_link_category WHERE code = ?`,
    [code]
  )
  return rows[0] ? mapRow({ ...rows[0], link_count: 0 }) : null
}

export async function existsCategoryByCode(code, excludeId = null) {
  const sql = excludeId
    ? 'SELECT id FROM sys_link_category WHERE code = ? AND id != ?'
    : 'SELECT id FROM sys_link_category WHERE code = ?'
  const params = excludeId ? [code, excludeId] : [code]
  const [rows] = await pool.query(sql, params)
  return rows.length > 0
}

export async function countLinksByCategory(categoryCode) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM sys_link WHERE category_code = ?',
    [categoryCode]
  )
  return rows[0].total
}

export async function createCategory(data) {
  const [result] = await pool.query(
    `INSERT INTO sys_link_category (code, name, sort, status, description)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.code,
      data.name,
      data.sort ?? 1,
      data.status ?? 'enabled',
      data.description ?? '',
    ]
  )
  return findCategoryById(result.insertId)
}

export async function updateCategory(id, data) {
  await pool.query(
    `UPDATE sys_link_category SET
      code = COALESCE(?, code),
      name = COALESCE(?, name),
      sort = COALESCE(?, sort),
      status = COALESCE(?, status),
      description = COALESCE(?, description)
     WHERE id = ?`,
    [
      data.code ?? null,
      data.name ?? null,
      data.sort ?? null,
      data.status ?? null,
      data.description ?? null,
      id,
    ]
  )
  return findCategoryById(id)
}

export async function deleteCategory(id) {
  const [result] = await pool.query('DELETE FROM sys_link_category WHERE id = ?', [id])
  return result.affectedRows > 0
}
