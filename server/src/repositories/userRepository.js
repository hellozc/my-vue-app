import { hashPassword } from '../utils/auth.js'

const mapRow = (row) => ({
  id: row.id,
  username: row.username,
  name: row.name,
  roleId: row.role_id,
  role: row.role,
  avatar: row.avatar,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function findByUsername(pool, username) {
  const [rows] = await pool.query(
    'SELECT id, username, password, name, role_id, role, avatar FROM sys_user WHERE username = ?',
    [username]
  )
  return rows[0] || null
}

export async function findById(pool, id) {
  const [rows] = await pool.query(
    'SELECT id, username, name, role_id, role, avatar, created_at, updated_at FROM sys_user WHERE id = ?',
    [id]
  )
  return rows[0] ? mapRow(rows[0]) : null
}

export async function findByIdWithPassword(pool, id) {
  const [rows] = await pool.query(
    'SELECT id, username, password, name, role_id, role, avatar FROM sys_user WHERE id = ?',
    [id]
  )
  return rows[0] || null
}

export async function findAll(pool) {
  const [rows] = await pool.query(
    'SELECT id, username, name, role_id, role, avatar, created_at, updated_at FROM sys_user ORDER BY id'
  )
  return rows.map(mapRow)
}

export async function existsByUsername(pool, username, excludeId = null) {
  const sql = excludeId
    ? 'SELECT id FROM sys_user WHERE username = ? AND id != ?'
    : 'SELECT id FROM sys_user WHERE username = ?'
  const params = excludeId ? [username, excludeId] : [username]
  const [rows] = await pool.query(sql, params)
  return rows.length > 0
}

export async function create(pool, { username, password, name, roleId, role, avatar }) {
  const [result] = await pool.query(
    `INSERT INTO sys_user (username, password, name, role_id, role, avatar)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, hashPassword(password), name, roleId, role, avatar || null]
  )
  return findById(pool, result.insertId)
}

export async function update(pool, id, { name, roleId, role, avatar, password }) {
  if (password) {
    await pool.query(
      'UPDATE sys_user SET name = ?, role_id = ?, role = ?, avatar = ?, password = ? WHERE id = ?',
      [name, roleId, role, avatar || null, hashPassword(password), id]
    )
  } else {
    await pool.query(
      'UPDATE sys_user SET name = ?, role_id = ?, role = ?, avatar = ? WHERE id = ?',
      [name, roleId, role, avatar || null, id]
    )
  }
  return findById(pool, id)
}

export async function remove(pool, id) {
  await pool.query('DELETE FROM sys_user WHERE id = ?', [id])
}

export async function updatePassword(pool, id, newPassword) {
  const password = hashPassword(newPassword)
  await pool.query('UPDATE sys_user SET password = ? WHERE id = ?', [password, id])
}

export async function countUsers(pool) {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM sys_user')
  return rows[0].total
}
