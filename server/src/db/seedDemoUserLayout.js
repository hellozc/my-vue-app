import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function loadDemoUserSeed() {
  const candidates = [
    path.join(__dirname, '../../seeds/demo-user.json'),
    path.join(__dirname, '../../../shared/seeds/demo-user.json'),
  ]
  for (const seedPath of candidates) {
    if (fs.existsSync(seedPath)) {
      return JSON.parse(fs.readFileSync(seedPath, 'utf8'))
    }
  }
  throw new Error(`未找到 demo-user 种子文件，已尝试: ${candidates.join(', ')}`)
}

export async function seedDemoUserLayout(conn, { force = false } = {}) {
  const seed = loadDemoUserSeed()
  const schemaJson = JSON.stringify(seed.schema)

  const [rows] = await conn.query('SELECT id, status FROM sys_layout WHERE code = ?', [seed.code])

  if (rows.length === 0) {
    await conn.query(
      `INSERT INTO sys_layout (code, name, description, status, version, schema_json)
       VALUES (?, ?, ?, 'published', ?, ?)`,
      [seed.code, seed.name, seed.description ?? '', seed.version ?? 1, schemaJson]
    )
    console.log('[DB] user 我的页布局已导入并发布')
    return { action: 'inserted' }
  }

  if (rows[0].status === 'draft' || force) {
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
    console.log(force ? '[DB] user 布局已强制同步并发布' : '[DB] user 布局已同步并发布')
    return { action: force ? 'forced' : 'published' }
  }

  return { action: 'skipped' }
}
