import { pool } from '../db/pool.js'
import {
  createMemberToken,
  getMemberIdByToken,
  getUserIdByToken,
  hashPassword,
  parseBearerToken,
  removeMemberToken,
} from '../utils/auth.js'
import {
  canSendSms,
  clearSmsInbox,
  generateSmsCode,
  listSmsInbox,
  saveSmsCode,
  verifySmsCode,
} from '../utils/smsStore.js'
import { exchangeWechatCode, exchangeWechatPhoneCode } from '../utils/wechatAuth.js'
import { verifyOneclickAccessToken } from '../utils/oneclickAuth.js'
import * as memberRepo from '../repositories/memberRepository.js'
import {
  getMemberAuthConfig,
  getWechatCredentials,
  toPublicCapabilities,
  updateMemberAuthConfig,
} from './memberAuthConfigService.js'

function toMemberInfo(member) {
  if (!member) return null
  return {
    id: member.id,
    nickname: member.nickname,
    avatar: member.avatar,
    phone: member.phone,
    phoneMasked: maskPhone(member.phone),
  }
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone || ''
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

function assertMemberEnabled(member) {
  if (!member) throw new Error('用户不存在')
  if (member.status === 'disabled') throw new Error('账号已被禁用')
}

function issueLoginResult(member) {
  const token = createMemberToken(member.id)
  return {
    token,
    expiresIn: 7 * 24 * 3600,
    member: toMemberInfo(member),
  }
}

function assertAdmin(authHeader) {
  const token = parseBearerToken(authHeader || '')
  const userId = getUserIdByToken(token)
  if (!userId) throw new Error('无权限访问')
}

export async function getAuthCapabilities() {
  const config = await getMemberAuthConfig()
  return toPublicCapabilities(config)
}

export async function getAdminAuthConfig(authHeader) {
  assertAdmin(authHeader)
  return getMemberAuthConfig({ fresh: true })
}

export async function saveAdminAuthConfig(authHeader, payload) {
  assertAdmin(authHeader)
  return updateMemberAuthConfig(payload)
}

export async function getAdminSmsInbox(authHeader, { limit } = {}) {
  assertAdmin(authHeader)
  return {
    items: listSmsInbox({ limit }),
    isDevInbox: process.env.NODE_ENV !== 'production',
  }
}

export async function clearAdminSmsInbox(authHeader) {
  assertAdmin(authHeader)
  clearSmsInbox()
  return { cleared: true }
}

export async function sendSmsCode({ phone, scene }) {
  const config = await getMemberAuthConfig()
  if (!config.sms) throw new Error('短信登录未开启')

  const check = canSendSms(phone)
  if (!check.ok) throw new Error(check.reason)

  const code = generateSmsCode()
  const normalizedScene = scene === 'register' ? 'register' : 'login'
  saveSmsCode(check.phone, code, { scene: normalizedScene })
  console.log(`[SMS] 验证码已生成 → ${check.phone}: ${code} (${normalizedScene})`)

  return {
    phone: check.phone,
    expiresIn: 300,
    mockCode: process.env.NODE_ENV !== 'production' ? code : undefined,
  }
}

export async function loginByPassword({ account, password }) {
  const config = await getMemberAuthConfig()
  if (!config.password) throw new Error('密码登录未开启')

  const trimmedAccount = String(account || '').trim()
  const rawPassword = String(password || '')
  if (!trimmedAccount || !rawPassword) {
    throw new Error('请输入账号和密码')
  }

  const row = await memberRepo.findPasswordAuthByAccount(pool, trimmedAccount)
  if (!row || !memberRepo.verifyPasswordAuth(row, rawPassword)) {
    throw new Error('账号或密码错误')
  }

  const member = memberRepo.memberFromAuthRow(row)
  assertMemberEnabled(member)
  return issueLoginResult(member)
}

export async function loginBySms({ phone, code }) {
  const config = await getMemberAuthConfig()
  if (!config.sms) throw new Error('短信登录未开启')

  const normalizedPhone = String(phone || '').trim()
  const normalizedCode = String(code || '').trim()
  if (!/^1\d{10}$/.test(normalizedPhone)) {
    throw new Error('请输入正确的手机号')
  }
  if (!normalizedCode) {
    throw new Error('请输入验证码')
  }
  if (!verifySmsCode(normalizedPhone, normalizedCode)) {
    throw new Error('验证码错误或已过期')
  }

  const member = await memberRepo.findOrCreateMemberByPhone(pool, normalizedPhone)
  assertMemberEnabled(member)
  return issueLoginResult(member)
}

export async function loginByWechat({ platform, code }) {
  const config = await getMemberAuthConfig()
  if (!config.wechat) throw new Error('微信登录未开启')

  const normalizedPlatform = String(platform || '').trim() || 'mp-weixin'
  const credentials = getWechatCredentials(config, normalizedPlatform)
  const session = await exchangeWechatCode({
    platform: normalizedPlatform,
    code,
    credentials,
  })

  const member = await memberRepo.findOrCreateMemberByWechat(pool, {
    openid: session.openid,
    unionid: session.unionid,
    nickname: '微信用户',
  })
  assertMemberEnabled(member)
  return issueLoginResult(member)
}

export async function loginByWechatPhone({ platform, phoneCode }) {
  const config = await getMemberAuthConfig()
  if (!config.wechatPhone) throw new Error('微信手机号登录未开启')

  const normalizedPlatform = String(platform || '').trim() || 'mp-weixin'
  const credentials = getWechatCredentials(config, normalizedPlatform)
  const { phone } = await exchangeWechatPhoneCode({ phoneCode, credentials })

  const member = await memberRepo.findOrCreateMemberByPhone(pool, phone)
  assertMemberEnabled(member)
  return issueLoginResult(member)
}

export async function loginByOneclick({ platform, accessToken }) {
  const config = await getMemberAuthConfig()
  if (!config.oneclick) throw new Error('一键登录未开启')
  if (platform && platform !== 'app' && platform !== 'app-plus') {
    throw new Error('当前平台请使用微信手机号快捷登录')
  }
  if (config.univerifyEnabled === false) {
    throw new Error('一键登录未开启')
  }

  const { phone } = await verifyOneclickAccessToken(accessToken)
  const member = await memberRepo.findOrCreateMemberByPhone(pool, phone)
  assertMemberEnabled(member)
  return issueLoginResult(member)
}

export async function registerByPhone({ phone, code, password, nickname }) {
  const config = await getMemberAuthConfig()
  if (!config.register) throw new Error('注册功能未开启')
  if (!config.sms) throw new Error('短信验证未开启')

  const normalizedPhone = String(phone || '').trim()
  const normalizedCode = String(code || '').trim()
  const rawPassword = String(password || '')

  if (!/^1\d{10}$/.test(normalizedPhone)) {
    throw new Error('请输入正确的手机号')
  }
  if (!normalizedCode) {
    throw new Error('请输入验证码')
  }
  if (!verifySmsCode(normalizedPhone, normalizedCode)) {
    throw new Error('验证码错误或已过期')
  }
  if (rawPassword.length < 6) {
    throw new Error('密码至少 6 位')
  }

  const member = await memberRepo.registerMemberWithPhone(pool, {
    phone: normalizedPhone,
    password: rawPassword,
    nickname: String(nickname || '').trim() || undefined,
  })
  assertMemberEnabled(member)
  return issueLoginResult(member)
}

export async function logout(token) {
  removeMemberToken(token)
}

export async function getProfileByToken(authHeader) {
  const token = parseBearerToken(authHeader || '')
  const memberId = getMemberIdByToken(token)
  if (!memberId) throw new Error('登录已过期，请重新登录')

  const member = await memberRepo.findMemberById(pool, memberId)
  assertMemberEnabled(member)
  return toMemberInfo(member)
}

export async function seedDemoMember(conn) {
  const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM app_member')
  if (countRows[0].total > 0) return

  const [result] = await conn.query(
    `INSERT INTO app_member (nickname, avatar, phone, status)
     VALUES (?, ?, ?, 'enabled')`,
    ['演示用户', null, '13800138000']
  )
  const memberId = result.insertId
  const passwordHash = hashPassword('123456')

  await conn.query(
    `INSERT INTO app_member_auth (member_id, provider, identifier, credential)
     VALUES (?, 'password', 'demo', ?),
            (?, 'password', '13800138000', ?),
            (?, 'phone', '13800138000', NULL)`,
    [memberId, passwordHash, memberId, passwordHash, memberId]
  )
  console.log('[DB] C端演示会员已导入 → demo/13800138000 密码 123456')
}
