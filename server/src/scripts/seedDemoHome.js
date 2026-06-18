import { config } from '../config/index.js'
import { testConnection } from '../db/pool.js'
import { ensureLayoutTable, seedDemoHomeLayout } from '../db/seedDemoHomeLayout.js'
import mysql from 'mysql2/promise'

const force = process.argv.includes('--force')

async function main() {
  await testConnection()
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    ...(config.db.ssl && { ssl: { rejectUnauthorized: false } }),
  })

  try {
    await ensureLayoutTable(conn)
    const result = await seedDemoHomeLayout(conn, { force })
    console.log('[seed] demo-home 完成:', result.action)
    if (result.action === 'skipped') {
      console.log('[seed] 提示: 线上已有已发布的 demo-home，若要覆盖请加 --force')
    }
  } finally {
    await conn.end()
  }
}

main().catch((err) => {
  console.error('[seed] 失败:', err.message || err)
  process.exit(1)
})
