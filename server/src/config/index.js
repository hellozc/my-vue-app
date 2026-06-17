import './loadEnv.js'

function parseDatabaseUrl(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: Number(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
    }
  } catch {
    return null
  }
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.MYSQL_PUBLIC_URL

const urlConfig = parseDatabaseUrl(databaseUrl)

export const config = {
  port: Number(process.env.PORT) || 8080,
  apiPrefix: process.env.API_PREFIX || '/api',
  db: {
    host: urlConfig?.host || process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
    port: urlConfig?.port || Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
    user: urlConfig?.user || process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: urlConfig?.password || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database:
      urlConfig?.database || process.env.DB_NAME || process.env.MYSQLDATABASE || 'my_vue_app',
    ssl: process.env.DB_SSL === 'true',
  },
}
