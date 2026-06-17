import path from 'path'
import { fileURLToPath } from 'url'
import { config } from '../src/config/index.js'
import { ensureDatabaseSchema } from '../src/db/initSchema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function printDbConfig() {
  const { host, port, user, database } = config.db
  console.log(`[DB] 配置 → ${user}@${host}:${port}/${database}`)
  console.log(`[DB] 环境文件 → ${path.join(__dirname, '../.env')}`)
}

function printHelp(err) {
  if (err.code === 'ECONNREFUSED') {
    console.error('[DB] 无法连接 MySQL，请检查：')
    console.error('  1. MySQL 服务是否已启动（服务名 MySQL80 等）')
    console.error('  2. server/.env 中 DB_HOST、DB_PORT 是否正确')
  } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('[DB] 用户名或密码错误，请修改 server/.env 中的 DB_USER / DB_PASSWORD')
  } else if (!err.message) {
    console.error('[DB] 未知错误，详情:', err)
  }
}

async function main() {
  printDbConfig()
  console.log('[DB] 连接 MySQL...')

  const result = await ensureDatabaseSchema({ force: true })

  if (!result.initialized) {
    console.log('[DB] 数据库已存在，已执行补全检查')
  }
}

main().catch((err) => {
  console.error('[DB] 初始化失败:', err.message || err.code || String(err))
  printHelp(err)
  process.exit(1)
})
