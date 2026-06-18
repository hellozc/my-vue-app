import { config } from '../config/index.js'
import { testConnection } from '../db/pool.js'
import { ensureLayoutTable, seedDemoHomeLayout } from '../db/seedDemoHomeLayout.js'
import mysql from 'mysql2/promise'

async function main() {
  await testConnection()
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  })

  try {
    await ensureLayoutTable(conn)
    const result = await seedDemoHomeLayout(conn)
    console.log('[seed] demo-home 完成:', result.action)
  } finally {
    await conn.end()
  }
}

main().catch((err) => {
  console.error('[seed] 失败:', err.message || err)
  process.exit(1)
})
