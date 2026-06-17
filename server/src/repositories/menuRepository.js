const mapRow = (row) => ({
  id: row.id,
  parentId: row.parent_id,
  path: row.path,
  name: row.name,
  label: row.label,
  icon: row.icon,
  component: row.component,
  sort: row.sort,
  type: row.type,
})

export async function findAllMenus(pool) {
  const [rows] = await pool.query(
    'SELECT id, parent_id, path, name, label, icon, component, sort, type FROM sys_menu ORDER BY sort ASC, id ASC'
  )
  return rows.map(mapRow)
}

export async function findMenuById(pool, id) {
  const [rows] = await pool.query(
    'SELECT id, parent_id, path, name, label, icon, component, sort, type FROM sys_menu WHERE id = ?',
    [id]
  )
  return rows[0] ? mapRow(rows[0]) : null
}

export async function existsByName(pool, name, excludeId = null) {
  const sql = excludeId
    ? 'SELECT id FROM sys_menu WHERE name = ? AND id != ?'
    : 'SELECT id FROM sys_menu WHERE name = ?'
  const params = excludeId ? [name, excludeId] : [name]
  const [rows] = await pool.query(sql, params)
  return rows.length > 0
}

export async function existsByPath(pool, path, excludeId = null) {
  const sql = excludeId
    ? 'SELECT id FROM sys_menu WHERE path = ? AND id != ?'
    : 'SELECT id FROM sys_menu WHERE path = ?'
  const params = excludeId ? [path, excludeId] : [path]
  const [rows] = await pool.query(sql, params)
  return rows.length > 0
}

export async function hasChildren(pool, id) {
  const [rows] = await pool.query('SELECT id FROM sys_menu WHERE parent_id = ? LIMIT 1', [id])
  return rows.length > 0
}

export async function insertMenu(pool, payload) {
  const component = payload.type === 'menu' ? (payload.component || 'DynamicPage') : null
  const [result] = await pool.query(
    `INSERT INTO sys_menu (parent_id, path, name, label, icon, component, sort, type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.parentId ?? 0,
      payload.path,
      payload.name,
      payload.label,
      payload.icon || 'Document',
      component,
      payload.sort ?? 1,
      payload.type || 'menu',
    ]
  )
  return findMenuById(pool, result.insertId)
}

export async function updateMenuById(pool, id, payload) {
  const current = await findMenuById(pool, id)
  if (!current) return null

  const component =
    payload.type === 'directory'
      ? null
      : payload.component || current.component || 'DynamicPage'

  await pool.query(
    `UPDATE sys_menu SET parent_id = ?, path = ?, name = ?, label = ?, icon = ?, component = ?, sort = ?, type = ?
     WHERE id = ?`,
    [
      payload.parentId ?? current.parentId,
      payload.path,
      payload.name,
      payload.label,
      payload.icon || current.icon,
      component,
      payload.sort ?? current.sort,
      payload.type || current.type,
      id,
    ]
  )
  return findMenuById(pool, id)
}

export async function deleteMenuById(pool, id) {
  const current = await findMenuById(pool, id)
  if (!current) return false
  if (current.path === '/home') {
    throw new Error('首页不可删除')
  }
  if (await hasChildren(pool, id)) {
    throw new Error('请先删除子菜单')
  }
  await pool.query('DELETE FROM sys_menu WHERE id = ?', [id])
  return true
}

export async function countMenus(pool) {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM sys_menu')
  return rows[0].total
}

export async function seedMenus(pool, menus) {
  for (const item of menus) {
    await pool.query(
      `INSERT INTO sys_menu (id, parent_id, path, name, label, icon, component, sort, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.parentId,
        item.path,
        item.name,
        item.label,
        item.icon,
        item.component,
        item.sort,
        item.type,
      ]
    )
  }
}
