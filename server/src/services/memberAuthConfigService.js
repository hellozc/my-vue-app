import { pool } from '../db/pool.js'

const CONFIG_KEY = 'member_auth'

export const DEFAULT_MEMBER_AUTH_CONFIG = {
  password: true,
  sms: true,
  wechat: true,
  oneclick: true,
  wechatPhone: true,
  register: true,
  defaultTab: 'sms',
  agreementUrl: '',
  privacyUrl: '',
  wechatMpAppId: '',
  wechatMpSecret: '',
  wechatAppAppId: '',
  wechatAppSecret: '',
  wechatH5AppId: '',
  univerifyEnabled: true,
}

function normalizeConfig(raw = {}) {
  const merged = { ...DEFAULT_MEMBER_AUTH_CONFIG, ...raw }
  return {
    password: merged.password !== false,
    sms: merged.sms !== false,
    wechat: merged.wechat !== false,
    oneclick: merged.oneclick !== false,
    wechatPhone: merged.wechatPhone !== false,
    register: merged.register !== false,
    defaultTab: merged.defaultTab === 'password' ? 'password' : 'sms',
    agreementUrl: String(merged.agreementUrl || ''),
    privacyUrl: String(merged.privacyUrl || ''),
    wechatMpAppId: String(merged.wechatMpAppId || ''),
    wechatMpSecret: String(merged.wechatMpSecret || ''),
    wechatAppAppId: String(merged.wechatAppAppId || ''),
    wechatAppSecret: String(merged.wechatAppSecret || ''),
    wechatH5AppId: String(merged.wechatH5AppId || ''),
    univerifyEnabled: merged.univerifyEnabled !== false,
  }
}

export function toPublicCapabilities(config) {
  return {
    password: config.password,
    sms: config.sms,
    wechat: config.wechat,
    oneclick: config.oneclick,
    wechatPhone: config.wechatPhone,
    register: config.register,
    defaultTab: config.defaultTab,
    agreementUrl: config.agreementUrl,
    privacyUrl: config.privacyUrl,
  }
}

export async function ensureAuthConfigTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS app_auth_config (
      id INT PRIMARY KEY,
      config_json JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='C端登录配置'
  `)
}

export async function seedDefaultAuthConfig(conn) {
  const [rows] = await conn.query('SELECT id FROM app_auth_config WHERE id = 1')
  if (rows.length > 0) return
  await conn.query('INSERT INTO app_auth_config (id, config_json) VALUES (1, ?)', [
    JSON.stringify(DEFAULT_MEMBER_AUTH_CONFIG),
  ])
  console.log('[DB] C端登录配置已初始化')
}

let cachedConfig = null
let cacheAt = 0
const CACHE_MS = 5000

export async function getMemberAuthConfig({ fresh = false } = {}) {
  if (!fresh && cachedConfig && Date.now() - cacheAt < CACHE_MS) {
    return cachedConfig
  }
  const [rows] = await pool.query('SELECT config_json FROM app_auth_config WHERE id = 1')
  if (!rows[0]) {
    cachedConfig = normalizeConfig(DEFAULT_MEMBER_AUTH_CONFIG)
  } else {
    const raw = typeof rows[0].config_json === 'string'
      ? JSON.parse(rows[0].config_json)
      : rows[0].config_json
    cachedConfig = normalizeConfig(raw)
  }
  cacheAt = Date.now()
  return cachedConfig
}

export async function updateMemberAuthConfig(payload = {}) {
  const current = await getMemberAuthConfig({ fresh: true })
  const next = normalizeConfig({ ...current, ...payload })
  await pool.query(
    `INSERT INTO app_auth_config (id, config_json) VALUES (1, ?)
     ON DUPLICATE KEY UPDATE config_json = VALUES(config_json)`,
    [JSON.stringify(next)]
  )
  cachedConfig = next
  cacheAt = Date.now()
  return next
}

export function getWechatCredentials(config, platform) {
  if (platform === 'mp-weixin') {
    return {
      appId: config.wechatMpAppId || process.env.WX_MP_APP_ID || '',
      secret: config.wechatMpSecret || process.env.WX_MP_APP_SECRET || '',
    }
  }
  if (platform === 'app') {
    return {
      appId: config.wechatAppAppId || process.env.WX_APP_APP_ID || '',
      secret: config.wechatAppSecret || process.env.WX_APP_APP_SECRET || '',
    }
  }
  return {
    appId: config.wechatH5AppId || process.env.WX_H5_APP_ID || '',
    secret: process.env.WX_H5_APP_SECRET || '',
  }
}

export function isMockWechatEnabled(credentials) {
  return !credentials.appId || !credentials.secret || process.env.WX_AUTH_MOCK === 'true'
}
