import { pool } from '../db/pool.js'

const mapRow = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  categoryCode: row.category_code,
  categoryName: row.category_name ?? '',
  type: row.type,
  target: row.target,
  status: row.status,
  clickCount: row.click_count,
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const baseSelect = `
  SELECT l.id, l.code, l.name, l.category_code, l.type, l.target, l.status,
         l.click_count, l.description, l.created_at, l.updated_at,
         c.name AS category_name
  FROM sys_link l
  LEFT JOIN sys_link_category c ON c.code = l.category_code
`

export async function findAllLinks(categoryCode = null) {
  const params = []
  let sql = `${baseSelect}`
  if (categoryCode) {
    sql += ' WHERE l.category_code = ?'
    params.push(categoryCode)
  }
  sql += ' ORDER BY l.id DESC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapRow)
}

export async function findEnabledLinkOptions(categoryCode = null) {
  const params = []
  let sql = `${baseSelect} WHERE l.status = 'enabled'`
  if (categoryCode) {
    sql += ' AND l.category_code = ?'
    params.push(categoryCode)
  }
  sql += ' ORDER BY c.sort ASC, l.id ASC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapRow)
}

export async function findLinkById(id) {
  const [rows] = await pool.query(`${baseSelect} WHERE l.id = ?`, [id])
  return rows[0] ? mapRow(rows[0]) : null
}

export async function findLinkByCode(code) {
  const [rows] = await pool.query(`${baseSelect} WHERE l.code = ?`, [code])
  return rows[0] ? mapRow(rows[0]) : null
}

export async function existsByCode(code, excludeId = null) {
  const sql = excludeId
    ? 'SELECT id FROM sys_link WHERE code = ? AND id != ?'
    : 'SELECT id FROM sys_link WHERE code = ?'
  const params = excludeId ? [code, excludeId] : [code]
  const [rows] = await pool.query(sql, params)
  return rows.length > 0
}

export async function createLink(data) {
  const [result] = await pool.query(
    `INSERT INTO sys_link (code, name, category_code, type, target, status, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code,
      data.name,
      data.categoryCode ?? 'general',
      data.type,
      data.target,
      data.status ?? 'enabled',
      data.description ?? '',
    ]
  )
  return findLinkById(result.insertId)
}

export async function updateLink(id, data) {
  await pool.query(
    `UPDATE sys_link SET
      code = COALESCE(?, code),
      name = COALESCE(?, name),
      category_code = COALESCE(?, category_code),
      type = COALESCE(?, type),
      target = COALESCE(?, target),
      status = COALESCE(?, status),
      description = COALESCE(?, description)
     WHERE id = ?`,
    [
      data.code ?? null,
      data.name ?? null,
      data.categoryCode ?? null,
      data.type ?? null,
      data.target ?? null,
      data.status ?? null,
      data.description ?? null,
      id,
    ]
  )
  return findLinkById(id)
}

export async function incrementClickCount(code) {
  const [result] = await pool.query(
    `UPDATE sys_link SET click_count = click_count + 1
     WHERE code = ? AND status = 'enabled'`,
    [code]
  )
  return result.affectedRows > 0
}

export async function deleteLink(id) {
  const [result] = await pool.query('DELETE FROM sys_link WHERE id = ?', [id])
  return result.affectedRows > 0
}
