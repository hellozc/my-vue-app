import { pool } from '../db/pool.js'

const mapRow = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description,
  status: row.status,
  version: row.version,
  schema: typeof row.schema_json === 'string' ? JSON.parse(row.schema_json) : row.schema_json,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function findAllLayouts() {
  const [rows] = await pool.query(
    'SELECT id, code, name, description, status, version, schema_json, created_at, updated_at FROM sys_layout ORDER BY id DESC'
  )
  return rows.map(mapRow)
}

export async function findLayoutById(id) {
  const [rows] = await pool.query(
    'SELECT id, code, name, description, status, version, schema_json, created_at, updated_at FROM sys_layout WHERE id = ?',
    [id]
  )
  return rows[0] ? mapRow(rows[0]) : null
}

export async function findPublishedLayoutByCode(code) {
  const [rows] = await pool.query(
    'SELECT id, code, name, description, status, version, schema_json, created_at, updated_at FROM sys_layout WHERE code = ? AND status = ?',
    [code, 'published']
  )
  return rows[0] ? mapRow(rows[0]) : null
}

export async function existsByCode(code, excludeId = null) {
  const sql = excludeId
    ? 'SELECT id FROM sys_layout WHERE code = ? AND id != ?'
    : 'SELECT id FROM sys_layout WHERE code = ?'
  const params = excludeId ? [code, excludeId] : [code]
  const [rows] = await pool.query(sql, params)
  return rows.length > 0
}

export async function createLayout(data) {
  const [result] = await pool.query(
    `INSERT INTO sys_layout (code, name, description, status, version, schema_json)
     VALUES (?, ?, ?, 'draft', 1, ?)`,
    [data.code, data.name, data.description ?? '', JSON.stringify(data.schema)]
  )
  return findLayoutById(result.insertId)
}

export async function updateLayout(id, data) {
  await pool.query(
    `UPDATE sys_layout SET
      code = COALESCE(?, code),
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      schema_json = COALESCE(?, schema_json)
     WHERE id = ?`,
    [
      data.code ?? null,
      data.name ?? null,
      data.description ?? null,
      data.schema ? JSON.stringify(data.schema) : null,
      id,
    ]
  )
  return findLayoutById(id)
}

export async function publishLayout(id) {
  await pool.query(
    'UPDATE sys_layout SET status = ?, version = version + 1 WHERE id = ?',
    ['published', id]
  )
  return findLayoutById(id)
}

export async function deleteLayout(id) {
  const [result] = await pool.query('DELETE FROM sys_layout WHERE id = ?', [id])
  return result.affectedRows > 0
}
