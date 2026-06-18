import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CREATE_LAYOUT_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS sys_layout (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL COMMENT '布局编码，展示端按 code 拉取',
  name VARCHAR(100) NOT NULL COMMENT '布局名称',
  description VARCHAR(500) DEFAULT NULL COMMENT '描述',
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft' COMMENT '状态',
  version INT NOT NULL DEFAULT 1 COMMENT '版本号',
  schema_json JSON NOT NULL COMMENT '布局 Schema JSON',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面布局配置表'
`

export function loadDemoHomeSeed() {
  const seedPath = path.join(__dirname, '../../../shared/seeds/demo-home.json')
  return JSON.parse(fs.readFileSync(seedPath, 'utf8'))
}

export async function ensureLayoutTable(conn) {
  await conn.query(CREATE_LAYOUT_TABLE_SQL)
}

/**
 * 导入并发布 demo-home 示例布局（与 shared/seeds/demo-home.json、C 端 Mock 同源）
 * - 不存在：插入并发布
 * - 已存在且为 draft：同步 Schema 并发布
 * - 已发布：不覆盖（避免冲掉管理端已改内容）
 */
export async function seedDemoHomeLayout(conn) {
  const seed = loadDemoHomeSeed()
  const schemaJson = JSON.stringify(seed.schema)

  const [rows] = await conn.query(
    'SELECT id, status FROM sys_layout WHERE code = ?',
    [seed.code]
  )

  if (rows.length === 0) {
    await conn.query(
      `INSERT INTO sys_layout (code, name, description, status, version, schema_json)
       VALUES (?, ?, ?, 'published', ?, ?)`,
      [seed.code, seed.name, seed.description ?? '', seed.version ?? 1, schemaJson]
    )
    console.log('[DB] demo-home 示例布局已导入并发布')
    return { action: 'inserted' }
  }

  if (rows[0].status === 'draft') {
    await conn.query(
      `UPDATE sys_layout SET
         name = ?,
         description = ?,
         status = 'published',
         version = GREATEST(version, ?),
         schema_json = ?
       WHERE code = ?`,
      [seed.name, seed.description ?? '', seed.version ?? 1, schemaJson, seed.code]
    )
    console.log('[DB] demo-home 已同步示例 Schema 并发布')
    return { action: 'published' }
  }

  return { action: 'skipped' }
}
