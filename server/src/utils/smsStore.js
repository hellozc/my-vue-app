/** 开发期短信验证码内存存储（生产环境应换 Redis + 真实 SMS） */
const store = new Map()
const inbox = []

const CODE_TTL_MS = 5 * 60 * 1000
const SEND_COOLDOWN_MS = 60 * 1000
const MAX_INBOX = 200

let nextInboxId = 1

function normalizePhone(phone) {
  return String(phone || '').trim()
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone || ''
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

function formatTime(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function refreshInboxStatus() {
  const now = Date.now()
  for (const item of inbox) {
    if (item.status === 'active' && now > item.expiresAt) {
      item.status = 'expired'
    }
  }
}

function supersedeActiveInbox(phone) {
  for (const item of inbox) {
    if (item.phone === phone && item.status === 'active') {
      item.status = 'superseded'
    }
  }
}

function markInboxUsed(phone, code) {
  const normalizedCode = String(code || '').trim()
  for (const item of inbox) {
    if (item.phone === phone && item.status === 'active' && item.code === normalizedCode) {
      item.status = 'used'
      item.usedAt = Date.now()
      return
    }
  }
}

export function canSendSms(phone) {
  const key = normalizePhone(phone)
  if (!/^1\d{10}$/.test(key)) return { ok: false, reason: '请输入正确的手机号' }
  const existing = store.get(key)
  if (existing?.sentAt && Date.now() - existing.sentAt < SEND_COOLDOWN_MS) {
    const wait = Math.ceil((SEND_COOLDOWN_MS - (Date.now() - existing.sentAt)) / 1000)
    return { ok: false, reason: `请 ${wait} 秒后再试` }
  }
  return { ok: true, phone: key }
}

export function saveSmsCode(phone, code, { scene = 'login' } = {}) {
  const key = normalizePhone(phone)
  const now = Date.now()
  const expiresAt = now + CODE_TTL_MS

  supersedeActiveInbox(key)
  store.set(key, { code, sentAt: now, expiresAt, scene })

  inbox.unshift({
    id: nextInboxId++,
    phone: key,
    phoneMasked: maskPhone(key),
    code: String(code),
    scene: scene === 'register' ? 'register' : 'login',
    sentAt: now,
    expiresAt,
    usedAt: null,
    status: 'active',
  })

  if (inbox.length > MAX_INBOX) {
    inbox.length = MAX_INBOX
  }
}

export function verifySmsCode(phone, code) {
  const key = normalizePhone(phone)
  const entry = store.get(key)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return false
  }
  if (String(code).trim() !== entry.code) return false
  markInboxUsed(key, entry.code)
  store.delete(key)
  return true
}

export function generateSmsCode() {
  if (process.env.SMS_MOCK_CODE) return String(process.env.SMS_MOCK_CODE)
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function listSmsInbox({ limit = 100 } = {}) {
  refreshInboxStatus()
  const size = Math.min(MAX_INBOX, Math.max(1, Number(limit) || 100))
  return inbox.slice(0, size).map((item) => ({
    id: item.id,
    phone: item.phone,
    phoneMasked: item.phoneMasked,
    code: item.code,
    scene: item.scene,
    status: item.status,
    sentAt: item.sentAt,
    sentAtText: formatTime(item.sentAt),
    expiresAt: item.expiresAt,
    expiresAtText: formatTime(item.expiresAt),
    usedAt: item.usedAt,
    usedAtText: item.usedAt ? formatTime(item.usedAt) : '',
    remainingSeconds:
      item.status === 'active' ? Math.max(0, Math.ceil((item.expiresAt - Date.now()) / 1000)) : 0,
  }))
}

export function clearSmsInbox() {
  inbox.length = 0
}
