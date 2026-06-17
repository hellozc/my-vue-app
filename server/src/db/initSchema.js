import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import { config } from '../config/index.js'
import { hashPassword } from '../utils/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const seedMenus = [
  { id: 1, parentId: 0, path: '/home', name: 'home', label: '首页', icon: 'House', component: 'Home', sort: 1, type: 'menu' },
  { id: 2, parentId: 0, path: '/mall', name: 'mall', label: '商品管理', icon: 'Goods', component: 'Mall', sort: 2, type: 'menu' },
  { id: 3, parentId: 0, path: '/user', name: 'user', label: '用户管理', icon: 'User', component: 'User', sort: 3, type: 'menu' },
  { id: 4, parentId: 0, path: '/other', name: 'other', label: '其他', icon: 'More', component: null, sort: 4, type: 'directory' },
  { id: 5, parentId: 4, path: '/other-group', name: 'otherGroup', label: '分组管理', icon: 'Folder', component: null, sort: 1, type: 'directory' },
  { id: 6, parentId: 5, path: '/page1', name: 'page1', label: '页面1', icon: 'Document', component: 'PageOne', sort: 1, type: 'menu' },
  { id: 7, parentId: 5, path: '/page2', name: 'page2', label: '页面2', icon: 'Document', component: 'PageTwo', sort: 2, type: 'menu' },
  { id: 8, parentId: 4, path: '/other-setting', name: 'otherSetting', label: '系统设置', icon: 'Setting', component: null, sort: 2, type: 'directory' },
  { id: 9, parentId: 8, path: '/page3', name: 'page3', label: '页面3', icon: 'Document', component: 'PageThree', sort: 1, type: 'menu' },
  { id: 10, parentId: 0, path: '/system', name: 'system', label: '系统管理', icon: 'Setting', component: null, sort: 5, type: 'directory' },
  { id: 11, parentId: 10, path: '/system/menu', name: 'menuManage', label: '菜单管理', icon: 'Menu', component: 'system/MenuManage', sort: 1, type: 'menu' },
  { id: 12, parentId: 10, path: '/system/employee', name: 'employeeManage', label: '员工管理', icon: 'UserFilled', component: 'system/EmployeeManage', sort: 2, type: 'menu' },
  { id: 13, parentId: 10, path: '/system/role', name: 'roleManage', label: '角色管理', icon: 'Key', component: 'system/RoleManage', sort: 3, type: 'menu' },
]

const seedRoles = [
  { code: 'admin', name: '超级管理员', description: '拥有系统全部权限', sort: 1 },
  { code: 'manager', name: '部门经理', description: '管理部门业务与人员', sort: 2 },
  { code: 'operator', name: '运营人员', description: '负责日常运营操作', sort: 3 },
  { code: 'staff', name: '普通员工', description: '基础业务访问权限', sort: 4 },
]

const seedRoleMenuPaths = {
  1: null,
  2: ['/home', '/mall', '/user'],
  3: ['/home', '/mall'],
  4: ['/home'],
}

const patchMenus = [
  {
    parentPath: '/system',
    path: '/system/employee',
    name: 'employeeManage',
    label: '员工管理',
    icon: 'UserFilled',
    component: 'system/EmployeeManage',
    sort: 2,
  },
  {
    parentPath: '/system',
    path: '/system/role',
    name: 'roleManage',
    label: '角色管理',
    icon: 'Key',
    component: 'system/RoleManage',
    sort: 3,
  },
]

function createDbConnection(options = {}) {
  return mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    ...(config.db.ssl && { ssl: { rejectUnauthorized: false } }),
    ...options,
  })
}

async function getMenuIdByPath(conn, menuPath) {
  const [rows] = await conn.query('SELECT id FROM sys_menu WHERE path = ?', [menuPath])
  return rows[0]?.id ?? null
}

async function expandMenuIdsWithAncestors(conn, menuIds) {
  const [allMenus] = await conn.query('SELECT id, parent_id AS parentId FROM sys_menu')
  const map = new Map(allMenus.map((item) => [item.id, item]))
  const result = new Set(menuIds)
  menuIds.forEach((id) => {
    let current = map.get(id)
    while (current?.parentId) {
      result.add(current.parentId)
      current = map.get(current.parentId)
    }
  })
  return [...result]
}

async function ensureMenuByPath(conn, menu) {
  const existingId = await getMenuIdByPath(conn, menu.path)
  if (existingId) return existingId

  const parentId = await getMenuIdByPath(conn, menu.parentPath)
  if (!parentId) {
    console.warn(`[DB] 上级菜单 ${menu.parentPath} 不存在，跳过补全「${menu.label}」`)
    return null
  }

  const [result] = await conn.query(
    `INSERT INTO sys_menu (parent_id, path, name, label, icon, component, sort, type)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'menu')`,
    [parentId, menu.path, menu.name, menu.label, menu.icon, menu.component, menu.sort]
  )
  console.log(`[DB] 已补全「${menu.label}」菜单`)
  return result.insertId
}

async function seedRoleMenuPermissions(conn) {
  const [allMenus] = await conn.query('SELECT id FROM sys_menu')
  const allMenuIds = allMenus.map((item) => item.id)

  for (const [roleId, paths] of Object.entries(seedRoleMenuPaths)) {
    let menuIds = allMenuIds
    if (paths) {
      const ids = []
      for (const menuPath of paths) {
        const menuId = await getMenuIdByPath(conn, menuPath)
        if (menuId) ids.push(menuId)
      }
      menuIds = await expandMenuIdsWithAncestors(conn, ids)
    }

    for (const menuId of menuIds) {
      await conn.query(
        'INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES (?, ?)',
        [Number(roleId), menuId]
      )
    }
  }
}

async function tableExists(conn, tableName) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.tables
     WHERE table_schema = ? AND table_name = ?`,
    [config.db.database, tableName]
  )
  return rows[0].total > 0
}

export async function ensureDatabaseSchema({ force = false } = {}) {
  const rootConn = await createDbConnection()

  try {
    await rootConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    await rootConn.query(`USE \`${config.db.database}\``)

    if (!force && (await tableExists(rootConn, 'sys_user'))) {
      return { initialized: false }
    }

    console.log('[DB] 检测到数据库未初始化，开始建表并导入种子数据...')

    const sqlPath = path.join(__dirname, '../../sql/init.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)

    for (const statement of statements) {
      await rootConn.query(statement)
    }
    console.log('[DB] 表 sys_menu、sys_user、sys_role、sys_role_menu 已创建')

    try {
      const [roleIdCol] = await rootConn.query("SHOW COLUMNS FROM sys_user LIKE 'role_id'")
      if (roleIdCol.length === 0) {
        await rootConn.query(
          'ALTER TABLE sys_user ADD COLUMN role_id INT DEFAULT 4 COMMENT "角色ID" AFTER name'
        )
        console.log('[DB] 已添加 sys_user.role_id 字段')
      }
      await rootConn.query('UPDATE sys_user SET role_id = 1 WHERE username = ?', ['admin'])
    } catch (err) {
      console.warn('[DB] sys_user.role_id 迁移跳过:', err.message)
    }

    const [roleCountRows] = await rootConn.query('SELECT COUNT(*) AS total FROM sys_role')
    if (roleCountRows[0].total === 0) {
      for (const role of seedRoles) {
        await rootConn.query(
          `INSERT INTO sys_role (code, name, description, sort) VALUES (?, ?, ?, ?)`,
          [role.code, role.name, role.description, role.sort]
        )
      }
      console.log('[DB] 初始角色数据已导入')
    }

    const [countRows] = await rootConn.query('SELECT COUNT(*) AS total FROM sys_menu')
    if (countRows[0].total === 0) {
      for (const item of seedMenus) {
        await rootConn.query(
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
      await rootConn.query('ALTER TABLE sys_menu AUTO_INCREMENT = 14')
      console.log('[DB] 初始菜单数据已导入')
    } else {
      for (const menu of patchMenus) {
        await ensureMenuByPath(rootConn, menu)
      }
    }

    const [roleMenuCountRows] = await rootConn.query('SELECT COUNT(*) AS total FROM sys_role_menu')
    if (roleMenuCountRows[0].total === 0) {
      await seedRoleMenuPermissions(rootConn)
      console.log('[DB] 初始角色菜单权限已导入')
    } else {
      const [adminRole] = await rootConn.query('SELECT id FROM sys_role WHERE code = ?', ['admin'])
      if (adminRole.length > 0) {
        const [allMenus] = await rootConn.query('SELECT id FROM sys_menu')
        for (const row of allMenus) {
          await rootConn.query(
            'INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES (?, ?)',
            [adminRole[0].id, row.id]
          )
        }
      }
    }

    const [userCountRows] = await rootConn.query('SELECT COUNT(*) AS total FROM sys_user')
    if (userCountRows[0].total === 0) {
      await rootConn.query(
        `INSERT INTO sys_user (username, password, name, role_id, role, avatar)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'admin',
          hashPassword('123456'),
          'Admin',
          1,
          '超级管理员',
          'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        ]
      )
      console.log('[DB] 默认管理员已导入 → admin / 123456')
    } else {
      await rootConn.query(
        'UPDATE sys_user SET role_id = 1, role = ? WHERE username = ?',
        ['超级管理员', 'admin']
      )
    }

    console.log('[DB] 初始化完成')
    return { initialized: true }
  } finally {
    await rootConn.end()
  }
}
