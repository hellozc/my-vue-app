import mysql from 'mysql2/promise'
import { config } from '../config/index.js'

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  ...(config.db.ssl && {
    ssl: { rejectUnauthorized: false },
  }),
})
export async function testConnection() {
  const conn = await pool.getConnection()
  conn.release()
}
