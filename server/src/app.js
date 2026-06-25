import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import { mediaConfig } from './config/media.js'
import { testConnection } from './db/pool.js'
import { ensureDatabaseSchema, ensureSchemaPatches } from './db/initSchema.js'
import routes from './routes/index.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(mediaConfig.publicPath, express.static(mediaConfig.uploadRoot))

app.use(config.apiPrefix, (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use(config.apiPrefix, routes)

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: `接口不存在: ${req.method} ${req.originalUrl}`,
    data: null,
  })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误',
    data: null,
  })
})

async function start() {
  try {
    await testConnection()
    console.log(`[DB] MySQL 已连接 → ${config.db.host}:${config.db.port}/${config.db.database}`)

    const autoInit = process.env.DB_AUTO_INIT !== 'false'
    if (autoInit) {
      const { initialized } = await ensureDatabaseSchema()
      if (initialized) {
        console.log('[DB] 启动时自动初始化已完成')
      }
      await ensureSchemaPatches()
      console.log('[DB] 结构补丁检查完成')
    }
  } catch (err) {
    console.error('[DB] MySQL 连接失败:', err.message || err.code || String(err))
    if (err.code === 'ECONNREFUSED') {
      console.error('[DB] 请确认 MySQL 已启动，并执行: npm run db:init')
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('[DB] 请检查 server/.env 中的 DB_USER / DB_PASSWORD')
    } else {
      console.error('[DB] 请先启动 MySQL 并执行: npm run db:init')
    }
    process.exit(1)
  }

  const server = app.listen(config.port, () => {
    console.log(`[Server] http://localhost:${config.port}`)
    console.log(`[Server] API 前缀: ${config.apiPrefix}`)
    console.log(`[Server] 示例: GET ${config.apiPrefix}/home/getData`)
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server] 端口 ${config.port} 已被占用，请执行以下任一操作：`)
      console.error(`  1. 关闭占用进程: netstat -ano | findstr :${config.port}  →  taskkill /PID <PID> /F`)
      console.error(`  2. 修改 server/.env 中的 PORT 为其他端口，并同步更新 .env.integration 的 VITE_API_TARGET`)
      process.exit(1)
    }
    throw err
  })
}

start()
