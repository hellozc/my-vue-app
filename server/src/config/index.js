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

function resolveDbUser() {
  if (urlConfig?.user) return urlConfig.user
  const mysqlUser = process.env.MYSQLUSER
  const dbUser = process.env.DB_USER
  // Railway 变量误配时 DB_USER 可能被写成端口号
  if (dbUser && dbUser !== String(process.env.DB_PORT || process.env.MYSQLPORT)) {
    return dbUser
  }
  return mysqlUser || dbUser || 'root'
}

function resolveDbPassword() {
  return (
    urlConfig?.password ||
    process.env.MYSQLPASSWORD ||
    process.env.DB_PASSWORD ||
    ''
  )
}

export const config = {
  port: Number(process.env.PORT) || 8080,
  apiPrefix: process.env.API_PREFIX || '/api',
  db: {
    host: urlConfig?.host || process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
    port: urlConfig?.port || Number(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
    user: resolveDbUser(),
    password: resolveDbPassword(),
    database:
      urlConfig?.database ||
      process.env.MYSQLDATABASE ||
      process.env.DB_NAME ||
      'my_vue_app',
    ssl:
      process.env.DB_SSL === 'true' ||
      Boolean(databaseUrl && process.env.RAILWAY_ENVIRONMENT),
  },
}
