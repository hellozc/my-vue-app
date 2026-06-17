export async function findAll(pool) {
  const [rows] = await pool.query(
    'SELECT id, code, name, description, sort FROM sys_role ORDER BY sort, id'
  )
  return rows
}

export async function findById(pool, id) {
  const [rows] = await pool.query(
    'SELECT id, code, name, description, sort FROM sys_role WHERE id = ?',
    [id]
  )
  return rows[0] || null
}

export async function findByName(pool, name, excludeId = null) {
  const sql = excludeId
    ? 'SELECT id FROM sys_role WHERE name = ? AND id != ?'
    : 'SELECT id FROM sys_role WHERE name = ?'
  const params = excludeId ? [name, excludeId] : [name]
  const [rows] = await pool.query(sql, params)
  return rows[0] || null
}

export async function findByCode(pool, code, excludeId = null) {
  const sql = excludeId
    ? 'SELECT id FROM sys_role WHERE code = ? AND id != ?'
    : 'SELECT id FROM sys_role WHERE code = ?'
  const params = excludeId ? [code, excludeId] : [code]
  const [rows] = await pool.query(sql, params)
  return rows[0] || null
}

export async function create(pool, { code, name, description, sort }) {
  const [result] = await pool.query(
    `INSERT INTO sys_role (code, name, description, sort) VALUES (?, ?, ?, ?)`,
    [code, name, description || null, sort ?? 1]
  )
  return findById(pool, result.insertId)
}

export async function update(pool, id, { code, name, description, sort }) {
  await pool.query(
    `UPDATE sys_role SET code = ?, name = ?, description = ?, sort = ? WHERE id = ?`,
    [code, name, description || null, sort ?? 1, id]
  )
  return findById(pool, id)
}

export async function remove(pool, id) {
  await pool.query('DELETE FROM sys_role WHERE id = ?', [id])
}

export async function countUsersByRoleId(pool, roleId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM sys_user WHERE role_id = ?',
    [roleId]
  )
  return rows[0].total
}

export async function countRoles(pool) {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM sys_role')
  return rows[0].total
}

export async function getMenuIdsByRoleId(pool, roleId) {
  const [rows] = await pool.query(
    'SELECT menu_id FROM sys_role_menu WHERE role_id = ?',
    [roleId]
  )
  return rows.map((row) => row.menu_id)
}

export async function setRoleMenus(pool, roleId, menuIds) {
  await pool.query('DELETE FROM sys_role_menu WHERE role_id = ?', [roleId])
  if (!menuIds.length) return
  const values = menuIds.map((menuId) => [roleId, menuId])
  await pool.query('INSERT INTO sys_role_menu (role_id, menu_id) VALUES ?', [values])
}

export async function syncUserRoleName(pool, roleId, roleName) {
  await pool.query('UPDATE sys_user SET role = ? WHERE role_id = ?', [roleName, roleId])
}
