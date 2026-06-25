import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import { config } from '../config/index.js'
import { hashPassword } from '../utils/auth.js'
import { ensureLayoutTable, seedDemoHomeLayout } from './seedDemoHomeLayout.js'
import { seedDemoUserLayout } from './seedDemoUserLayout.js'
import { seedDemoMember } from '../services/memberService.js'
import {
  ensureAuthConfigTable,
  seedDefaultAuthConfig,
} from '../services/memberAuthConfigService.js'

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
  { id: 14, parentId: 10, path: '/system/layout', name: 'layoutManage', label: '布局管理', icon: 'Grid', component: 'system/LayoutManage', sort: 4, type: 'menu' },
  { id: 15, parentId: 10, path: '/system/link', name: 'linkManage', label: '链接管理', icon: 'Link', component: 'system/LinkManage', sort: 5, type: 'menu' },
  { id: 16, parentId: 10, path: '/system/media', name: 'mediaManage', label: '素材管理', icon: 'Picture', component: 'system/MediaManage', sort: 6, type: 'menu' },
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
  {
    parentPath: '/system',
    path: '/system/layout',
    name: 'layoutManage',
    label: '布局管理',
    icon: 'Grid',
    component: 'system/LayoutManage',
    sort: 4,
  },
  {
    parentPath: '/system',
    path: '/system/link',
    name: 'linkManage',
    label: '链接管理',
    icon: 'Link',
    component: 'system/LinkManage',
    sort: 5,
  },
  {
    parentPath: '/system',
    path: '/system/media',
    name: 'mediaManage',
    label: '素材管理',
    icon: 'Picture',
    component: 'system/MediaManage',
    sort: 6,
  },
  {
    parentPath: '/system',
    path: '/system/member-auth',
    name: 'memberAuthConfig',
    label: 'C端登录配置',
    icon: 'Unlock',
    component: 'system/MemberAuthConfig',
    sort: 7,
  },
  {
    parentPath: '/system',
    path: '/system/member-sms',
    name: 'memberSmsInbox',
    label: '验证码收件箱',
    icon: 'Message',
    component: 'system/MemberSmsInbox',
    sort: 8,
  },
]

const seedLinkCategories = [
  { code: 'general', name: '通用', sort: 99, description: '默认分类' },
  { code: 'navigation', name: '主导航', sort: 1, description: '首页、Tabbar 等主导航入口' },
  { code: 'content', name: '内容资讯', sort: 2, description: '列表、资讯、详情等内容页' },
  { code: 'marketing', name: '营销活动', sort: 3, description: '活动页、推广页' },
  { code: 'external', name: '站外推广', sort: 4, description: '站外 H5、官网等' },
]

const seedLinks = [
  { code: 'home', name: '首页', categoryCode: 'navigation', type: 'internal', target: '/home', description: '应用首页' },
  { code: 'mall', name: '商品管理', categoryCode: 'navigation', type: 'internal', target: '/mall', description: '商品管理页' },
  { code: 'user', name: '用户管理', categoryCode: 'navigation', type: 'internal', target: '/user', description: '用户管理页' },
  { code: 'community-news', name: '社区资讯', categoryCode: 'content', type: 'internal', target: '/page1', description: '社区资讯列表' },
  { code: 'official-site', name: '官网', categoryCode: 'external', type: 'external', target: 'https://example.com', description: '站外官网示例' },
]

const seedMediaCategories = [
  { code: 'general', name: '通用素材', sort: 99, description: '默认分类' },
  { code: 'layout', name: '布局素材', sort: 1, description: '页面背景、模块配图' },
  { code: 'banner', name: '轮播 Banner', sort: 2, description: '顶部容器、轮播图' },
  { code: 'logo', name: 'Logo 图标', sort: 3, description: '品牌 Logo、角标' },
  { code: 'avatar', name: '头像', sort: 4, description: '用户头像、员工头像' },
]

const CREATE_MEDIA_CATEGORY_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS sys_media_category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL COMMENT '分类编码',
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  sort INT NOT NULL DEFAULT 1 COMMENT '排序',
  status ENUM('enabled', 'disabled') NOT NULL DEFAULT 'enabled' COMMENT '状态',
  description VARCHAR(500) DEFAULT NULL COMMENT '描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='素材分类表'
`

const CREATE_MEDIA_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS sys_media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL COMMENT '素材名称',
  category_code VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT '素材分类编码',
  url VARCHAR(500) NOT NULL COMMENT '访问 URL',
  path VARCHAR(500) NOT NULL COMMENT '服务器相对路径',
  mime_type VARCHAR(100) NOT NULL COMMENT 'MIME 类型',
  file_size INT NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
  width INT DEFAULT NULL COMMENT '图片宽度',
  height INT DEFAULT NULL COMMENT '图片高度',
  status ENUM('enabled', 'disabled') NOT NULL DEFAULT 'enabled' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_category_code (category_code),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图片素材表'
`

const CREATE_MEMBER_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS app_member (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nickname VARCHAR(100) NOT NULL DEFAULT '' COMMENT '昵称',
  avatar VARCHAR(500) DEFAULT NULL COMMENT '头像',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  status ENUM('enabled', 'disabled') NOT NULL DEFAULT 'enabled' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='C端会员表'
`

const CREATE_MEMBER_AUTH_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS app_member_auth (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL COMMENT '会员ID',
  provider VARCHAR(32) NOT NULL COMMENT '登录方式',
  identifier VARCHAR(128) NOT NULL COMMENT '标识（账号/手机号/openid）',
  credential VARCHAR(255) DEFAULT NULL COMMENT '凭证（密码hash等）',
  extra_json JSON DEFAULT NULL COMMENT '扩展信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_provider_identifier (provider, identifier),
  KEY idx_member_id (member_id),
  CONSTRAINT fk_member_auth_member FOREIGN KEY (member_id) REFERENCES app_member(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='C端会员登录绑定表'
`

const CREATE_LINK_CATEGORY_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS sys_link_category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL COMMENT '分类编码',
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  sort INT NOT NULL DEFAULT 1 COMMENT '排序',
  status ENUM('enabled', 'disabled') NOT NULL DEFAULT 'enabled' COMMENT '状态',
  description VARCHAR(500) DEFAULT NULL COMMENT '描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='链接分类表'
`

const CREATE_LINK_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS sys_link (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL COMMENT '链接编码，布局中引用此编码',
  name VARCHAR(100) NOT NULL COMMENT '链接名称',
  category_code VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT '链接分类编码',
  type ENUM('internal', 'external') NOT NULL DEFAULT 'internal' COMMENT 'internal站内 external站外',
  target VARCHAR(500) NOT NULL COMMENT '站内路由或站外 URL',
  status ENUM('enabled', 'disabled') NOT NULL DEFAULT 'enabled' COMMENT '状态',
  click_count INT NOT NULL DEFAULT 0 COMMENT '点击次数',
  description VARCHAR(500) DEFAULT NULL COMMENT '描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_code (code),
  KEY idx_status (status),
  KEY idx_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='统一跳转链接表'
`

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

async function ensureLinkCategoryTable(conn) {
  await conn.query(CREATE_LINK_CATEGORY_TABLE_SQL)
}

async function ensureLinkTable(conn) {
  await conn.query(CREATE_LINK_TABLE_SQL)
  const [cols] = await conn.query("SHOW COLUMNS FROM sys_link LIKE 'category_code'")
  if (cols.length === 0) {
    await conn.query(
      "ALTER TABLE sys_link ADD COLUMN category_code VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT '链接分类编码' AFTER name"
    )
    await conn.query('ALTER TABLE sys_link ADD KEY idx_category_code (category_code)')
    console.log('[DB] 已添加 sys_link.category_code 字段')
  }
}

async function seedDefaultLinkCategories(conn) {
  const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM sys_link_category')
  if (countRows[0].total > 0) return

  for (const item of seedLinkCategories) {
    await conn.query(
      `INSERT INTO sys_link_category (code, name, sort, status, description)
       VALUES (?, ?, ?, 'enabled', ?)`,
      [item.code, item.name, item.sort, item.description ?? '']
    )
  }
  console.log('[DB] 初始链接分类数据已导入')
}

async function seedDefaultLinks(conn) {
  const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM sys_link')
  if (countRows[0].total > 0) return

  for (const item of seedLinks) {
    await conn.query(
      `INSERT INTO sys_link (code, name, category_code, type, target, status, description)
       VALUES (?, ?, ?, ?, ?, 'enabled', ?)`,
      [
        item.code,
        item.name,
        item.categoryCode ?? 'general',
        item.type,
        item.target,
        item.description ?? '',
      ]
    )
  }
  console.log('[DB] 初始链接数据已导入')
}

async function ensureMemberTables(conn) {
  await conn.query(CREATE_MEMBER_TABLE_SQL)
  await conn.query(CREATE_MEMBER_AUTH_TABLE_SQL)
}

async function ensureMediaCategoryTable(conn) {
  await conn.query(CREATE_MEDIA_CATEGORY_TABLE_SQL)
}

async function ensureMediaTable(conn) {
  await conn.query(CREATE_MEDIA_TABLE_SQL)
}

async function seedDefaultMediaCategories(conn) {
  const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM sys_media_category')
  if (countRows[0].total > 0) return

  for (const item of seedMediaCategories) {
    await conn.query(
      `INSERT INTO sys_media_category (code, name, sort, status, description)
       VALUES (?, ?, ?, 'enabled', ?)`,
      [item.code, item.name, item.sort, item.description ?? '']
    )
  }
  console.log('[DB] 初始素材分类数据已导入')
}

async function ensureAdminSystemMenus(conn) {
  const [adminRole] = await conn.query('SELECT id FROM sys_role WHERE code = ?', ['admin'])
  if (adminRole.length === 0) return

  for (const menu of patchMenus) {
    const menuId = await ensureMenuByPath(conn, menu)
    if (!menuId) continue
    await conn.query(
      'INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES (?, ?)',
      [adminRole[0].id, menuId]
    )
  }
}

export async function ensureSchemaPatches() {
  const conn = await createDbConnection()
  try {
    await conn.query(`USE \`${config.db.database}\``)
    await ensureLinkCategoryTable(conn)
    await seedDefaultLinkCategories(conn)
    await ensureLinkTable(conn)
    await seedDefaultLinks(conn)
    await ensureMediaCategoryTable(conn)
    await seedDefaultMediaCategories(conn)
    await ensureMediaTable(conn)
    await ensureAdminSystemMenus(conn)
    await ensureLayoutTable(conn)
    await seedDemoHomeLayout(conn)
    await seedDemoUserLayout(conn)
    await ensureMemberTables(conn)
    await seedDemoMember(conn)
    await ensureAuthConfigTable(conn)
    await seedDefaultAuthConfig(conn)
  } catch (err) {
    console.warn('[DB] 结构补丁执行失败:', err.message)
  } finally {
    await conn.end()
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
      await rootConn.query('ALTER TABLE sys_menu AUTO_INCREMENT = 17')
      console.log('[DB] 初始菜单数据已导入')
    } else {
      for (const menu of patchMenus) {
        await ensureMenuByPath(rootConn, menu)
      }
    }

    await ensureLinkCategoryTable(rootConn)
    await seedDefaultLinkCategories(rootConn)
    await ensureLinkTable(rootConn)
    await seedDefaultLinks(rootConn)
    await ensureMediaCategoryTable(rootConn)
    await seedDefaultMediaCategories(rootConn)
    await ensureMediaTable(rootConn)
    await ensureLayoutTable(rootConn)
    await seedDemoHomeLayout(rootConn)
    await seedDemoUserLayout(rootConn)

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
