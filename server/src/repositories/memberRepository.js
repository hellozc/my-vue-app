import { hashPassword } from '../utils/auth.js'

const mapMember = (row) => ({
  id: row.id,
  nickname: row.nickname,
  avatar: row.avatar,
  phone: row.phone,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function findMemberById(pool, id) {
  const [rows] = await pool.query(
    'SELECT id, nickname, avatar, phone, status, created_at, updated_at FROM app_member WHERE id = ?',
    [id]
  )
  return rows[0] ? mapMember(rows[0]) : null
}

export async function findMemberByPhone(pool, phone) {
  const [rows] = await pool.query(
    'SELECT id, nickname, avatar, phone, status, created_at, updated_at FROM app_member WHERE phone = ?',
    [phone]
  )
  return rows[0] ? mapMember(rows[0]) : null
}

export async function findAuthByProvider(pool, provider, identifier) {
  const [rows] = await pool.query(
    `SELECT a.id, a.member_id, a.provider, a.identifier, a.credential, a.extra_json,
            m.id AS m_id, m.nickname, m.avatar, m.phone, m.status, m.created_at, m.updated_at
     FROM app_member_auth a
     INNER JOIN app_member m ON m.id = a.member_id
     WHERE a.provider = ? AND a.identifier = ?`,
    [provider, identifier]
  )
  return rows[0] || null
}

export async function createMember(pool, { nickname, avatar, phone, status = 'enabled' }) {
  const [result] = await pool.query(
    `INSERT INTO app_member (nickname, avatar, phone, status)
     VALUES (?, ?, ?, ?)`,
    [nickname || '新用户', avatar || null, phone || null, status]
  )
  return findMemberById(pool, result.insertId)
}

export async function createMemberAuth(pool, { memberId, provider, identifier, credential, extraJson }) {
  await pool.query(
    `INSERT INTO app_member_auth (member_id, provider, identifier, credential, extra_json)
     VALUES (?, ?, ?, ?, ?)`,
    [
      memberId,
      provider,
      identifier,
      credential || null,
      extraJson ? JSON.stringify(extraJson) : null,
    ]
  )
}

export async function updateMemberProfile(pool, id, { nickname, avatar, phone }) {
  await pool.query(
    `UPDATE app_member SET
      nickname = COALESCE(?, nickname),
      avatar = COALESCE(?, avatar),
      phone = COALESCE(?, phone)
     WHERE id = ?`,
    [nickname ?? null, avatar ?? null, phone ?? null, id]
  )
  return findMemberById(pool, id)
}

export async function findOrCreateMemberByPhone(pool, phone) {
  let member = await findMemberByPhone(pool, phone)
  if (member) return member

  member = await createMember(pool, {
    nickname: `用户${phone.slice(-4)}`,
    phone,
  })

  await createMemberAuth(pool, {
    memberId: member.id,
    provider: 'phone',
    identifier: phone,
  })

  return member
}

export async function findOrCreateMemberByWechat(pool, { openid, unionid, nickname, avatar }) {
  const provider = 'wechat'
  let row = await findAuthByProvider(pool, provider, openid)
  if (row) {
    return memberFromAuthRow(row)
  }

  if (unionid) {
    const [unionRows] = await pool.query(
      `SELECT a.member_id, m.id AS m_id, m.nickname, m.avatar, m.phone, m.status, m.created_at, m.updated_at
       FROM app_member_auth a
       INNER JOIN app_member m ON m.id = a.member_id
       WHERE a.provider = ? AND JSON_UNQUOTE(JSON_EXTRACT(a.extra_json, '$.unionid')) = ?
       LIMIT 1`,
      [provider, unionid]
    )
    if (unionRows[0]) {
      await createMemberAuth(pool, {
        memberId: unionRows[0].member_id,
        provider,
        identifier: openid,
        extraJson: { unionid },
      })
      return memberFromAuthRow(unionRows[0])
    }
  }

  const member = await createMember(pool, {
    nickname: nickname || '微信用户',
    avatar: avatar || null,
  })

  await createMemberAuth(pool, {
    memberId: member.id,
    provider,
    identifier: openid,
    extraJson: unionid ? { unionid } : null,
  })

  return member
}

export async function registerMemberWithPhone(pool, { phone, password, nickname }) {
  const passwordHash = hashPassword(password)
  const existingMember = await findMemberByPhone(pool, phone)

  if (existingMember) {
    const passwordAuth = await findAuthByProvider(pool, 'password', phone)
    if (passwordAuth) {
      throw new Error('该手机号已注册')
    }

    await createMemberAuth(pool, {
      memberId: existingMember.id,
      provider: 'password',
      identifier: phone,
      credential: passwordHash,
    })

    if (nickname) {
      await updateMemberProfile(pool, existingMember.id, { nickname })
    }

    return findMemberById(pool, existingMember.id)
  }

  const member = await createMember(pool, {
    nickname: nickname || `用户${phone.slice(-4)}`,
    phone,
  })

  await createMemberAuth(pool, {
    memberId: member.id,
    provider: 'phone',
    identifier: phone,
  })

  await createMemberAuth(pool, {
    memberId: member.id,
    provider: 'password',
    identifier: phone,
    credential: passwordHash,
  })

  return member
}

export async function findPasswordAuthByAccount(pool, account) {
  const [rows] = await pool.query(
    `SELECT a.id, a.member_id, a.provider, a.identifier, a.credential,
            m.id AS m_id, m.nickname, m.avatar, m.phone, m.status, m.created_at, m.updated_at
     FROM app_member_auth a
     INNER JOIN app_member m ON m.id = a.member_id
     WHERE a.provider = 'password' AND (a.identifier = ? OR m.phone = ?)`,
    [account, account]
  )
  return rows[0] || null
}

export function verifyPasswordAuth(row, password) {
  if (!row?.credential) return false
  return row.credential === hashPassword(password)
}

export function memberFromAuthRow(row) {
  return mapMember({
    id: row.m_id,
    nickname: row.nickname,
    avatar: row.avatar,
    phone: row.phone,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })
}
