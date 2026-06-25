import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const demoHomeSeed = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../shared/seeds/demo-home.json'), 'utf8')
)
const demoUserSeed = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../shared/seeds/demo-user.json'), 'utf8')
)

const LINKS = [
  { id: 1, code: 'home', name: '首页', categoryCode: 'navigation', categoryName: '主导航', type: 'internal', target: '/home', status: 'enabled', clickCount: 0, description: '应用首页', createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 2, code: 'mall', name: '商品管理', categoryCode: 'navigation', categoryName: '主导航', type: 'internal', target: '/mall', status: 'enabled', clickCount: 0, description: '商品管理页', createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 3, code: 'user', name: '用户管理', categoryCode: 'navigation', categoryName: '主导航', type: 'internal', target: '/user', status: 'enabled', clickCount: 0, description: '用户管理页', createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 4, code: 'community-news', name: '社区资讯', categoryCode: 'content', categoryName: '内容资讯', type: 'internal', target: '/page1', status: 'enabled', clickCount: 0, description: '社区资讯列表', createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 5, code: 'official-site', name: '官网', categoryCode: 'external', categoryName: '站外推广', type: 'external', target: 'https://example.com', status: 'enabled', clickCount: 0, description: '站外官网示例', createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
]

const DEMO_LAYOUT = {
  id: 1,
  ...demoHomeSeed,
  createdAt: '2026-06-17 10:00:00',
  updatedAt: '2026-06-17 10:00:00',
}

const USER_LAYOUT = {
  id: 2,
  ...demoUserSeed,
  createdAt: '2026-06-17 10:00:00',
  updatedAt: '2026-06-17 10:00:00',
}

const smsCodes = new Map()

const LIST_SOURCES = {
  news: Array.from({ length: 28 }, (_, i) => {
    const topics = ['社区公告', '物业通知', '便民服务', '活动预告', '安全提示', '邻里互助']
    const topic = topics[i % topics.length]
    const no = i + 1
    return {
      id: `news-${no}`,
      title: `${topic} · 第 ${no} 条资讯`,
      desc: `这是第 ${no} 条${topic}的摘要内容，点击查看详情。`,
      icon: 'Document',
      image: '',
      linkCode: '',
      link: '',
    }
  }),
}

function paginateList(all, query) {
  const list = Array.isArray(all) ? all : []
  const pageSize = Math.min(100, Math.max(1, Math.round(Number(query.get('pageSize')) || 5)))
  const page = Math.max(1, Math.round(Number(query.get('page')) || 1))
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    items: list.slice(start, end),
    page,
    pageSize,
    total: list.length,
    hasMore: end < list.length,
  }
}

function sendJson(res, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

export function createDevMockPlugin() {
  return {
    name: 'layout-consumer-dev-mock',
    configureServer(server) {
      attachDevMock(server)
    },
  }
}

const DEMO_MEMBER = {
  id: 1,
  nickname: '演示用户',
  avatar: null,
  phone: '13800138000',
  phoneMasked: '138****8000',
}

const MEMBER_CAPABILITIES = {
  password: true,
  sms: true,
  wechat: true,
  oneclick: true,
  wechatPhone: true,
  register: true,
  defaultTab: 'sms',
  agreementUrl: '',
  privacyUrl: '',
}

const registeredPhones = new Set(['13800138000'])

const memberTokens = new Map()

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function parseAuthToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  if (!header.startsWith('Bearer ')) return ''
  return header.slice(7)
}

function attachDevMock(server) {
  server.middlewares.use(async (req, res, next) => {
    const url = req.url?.split('?')[0] || ''

    if (req.method === 'GET' && url === '/api/member/auth/capabilities') {
      sendJson(res, { code: 200, message: 'success', data: MEMBER_CAPABILITIES })
      return
    }

    if (req.method === 'POST' && url === '/api/member/auth/sms/send') {
      try {
        const body = await readBody(req)
        const phone = String(body.phone || '').trim()
        if (!/^1\d{10}$/.test(phone)) {
          sendJson(res, { code: 400, message: '请输入正确的手机号', data: null })
          return
        }
        const code = '123456'
        smsCodes.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 })
        sendJson(res, {
          code: 200,
          message: 'success',
          data: { phone, expiresIn: 300, mockCode: code },
        })
      } catch {
        sendJson(res, { code: 400, message: '请求参数错误', data: null })
      }
      return
    }

    if (req.method === 'POST' && url === '/api/member/auth/login/sms') {
      try {
        const body = await readBody(req)
        const phone = String(body.phone || '').trim()
        const code = String(body.code || '').trim()
        const entry = smsCodes.get(phone)
        if (!entry || entry.code !== code || Date.now() > entry.expiresAt) {
          sendJson(res, { code: 401, message: '验证码错误或已过期', data: null })
          return
        }
        smsCodes.delete(phone)
        const token = `m_mock_${Date.now()}`
        memberTokens.set(token, DEMO_MEMBER.id)
        sendJson(res, {
          code: 200,
          message: 'success',
          data: { token, expiresIn: 604800, member: DEMO_MEMBER },
        })
      } catch {
        sendJson(res, { code: 400, message: '请求参数错误', data: null })
      }
      return
    }

    if (req.method === 'POST' && url === '/api/member/auth/login/password') {
      try {
        const body = await readBody(req)
        const account = String(body.account || '').trim()
        const password = String(body.password || '')
        const ok =
          (account === 'demo' || account === '13800138000') && password === '123456'
        if (!ok) {
          sendJson(res, { code: 401, message: '账号或密码错误', data: null })
          return
        }
        const token = `m_mock_${Date.now()}`
        memberTokens.set(token, DEMO_MEMBER.id)
        sendJson(res, {
          code: 200,
          message: 'success',
          data: { token, expiresIn: 604800, member: DEMO_MEMBER },
        })
      } catch {
        sendJson(res, { code: 400, message: '请求参数错误', data: null })
      }
      return
    }

    if (req.method === 'POST' && url === '/api/member/auth/login/wechat') {
      const token = `m_mock_wx_${Date.now()}`
      memberTokens.set(token, DEMO_MEMBER.id)
      sendJson(res, {
        code: 200,
        message: 'success',
        data: { token, expiresIn: 604800, member: DEMO_MEMBER },
      })
      return
    }

    if (req.method === 'POST' && url === '/api/member/auth/login/wechat-phone') {
      const token = `m_mock_wxphone_${Date.now()}`
      memberTokens.set(token, DEMO_MEMBER.id)
      sendJson(res, {
        code: 200,
        message: 'success',
        data: { token, expiresIn: 604800, member: DEMO_MEMBER },
      })
      return
    }

    if (req.method === 'POST' && url === '/api/member/auth/login/oneclick') {
      const token = `m_mock_oneclick_${Date.now()}`
      memberTokens.set(token, DEMO_MEMBER.id)
      sendJson(res, {
        code: 200,
        message: 'success',
        data: { token, expiresIn: 604800, member: DEMO_MEMBER },
      })
      return
    }

    if (req.method === 'POST' && url === '/api/member/auth/register') {
      try {
        const body = await readBody(req)
        const phone = String(body.phone || '').trim()
        const code = String(body.code || '').trim()
        const password = String(body.password || '')
        const entry = smsCodes.get(phone)
        if (!/^1\d{10}$/.test(phone)) {
          sendJson(res, { code: 400, message: '请输入正确的手机号', data: null })
          return
        }
        if (!entry || entry.code !== code || Date.now() > entry.expiresAt) {
          sendJson(res, { code: 400, message: '验证码错误或已过期', data: null })
          return
        }
        if (password.length < 6) {
          sendJson(res, { code: 400, message: '密码至少 6 位', data: null })
          return
        }
        if (registeredPhones.has(phone)) {
          sendJson(res, { code: 400, message: '该手机号已注册', data: null })
          return
        }
        smsCodes.delete(phone)
        registeredPhones.add(phone)
        const member = {
          id: Date.now(),
          nickname: String(body.nickname || '').trim() || `用户${phone.slice(-4)}`,
          avatar: null,
          phone,
          phoneMasked: `${phone.slice(0, 3)}****${phone.slice(-4)}`,
        }
        const token = `m_mock_reg_${Date.now()}`
        memberTokens.set(token, member.id)
        sendJson(res, {
          code: 200,
          message: '注册成功',
          data: { token, expiresIn: 604800, member },
        })
      } catch {
        sendJson(res, { code: 400, message: '请求参数错误', data: null })
      }
      return
    }

    if (req.method === 'POST' && url === '/api/member/auth/logout') {
      const token = parseAuthToken(req)
      memberTokens.delete(token)
      sendJson(res, { code: 200, message: '退出成功', data: null })
      return
    }

    if (req.method === 'GET' && url === '/api/member/profile') {
      const token = parseAuthToken(req)
      if (!token || !memberTokens.has(token)) {
        sendJson(res, { code: 401, message: '登录已过期，请重新登录', data: null })
        return
      }
      sendJson(res, { code: 200, message: 'success', data: DEMO_MEMBER })
      return
    }

    if (req.method === 'GET' && url.startsWith('/api/layout/code/')) {
      const code = decodeURIComponent(url.slice('/api/layout/code/'.length))
      if (code === DEMO_LAYOUT.code && DEMO_LAYOUT.status === 'published') {
        sendJson(res, { code: 200, message: 'success', data: DEMO_LAYOUT })
        return
      }
      if (code === USER_LAYOUT.code && USER_LAYOUT.status === 'published') {
        sendJson(res, { code: 200, message: 'success', data: USER_LAYOUT })
        return
      }
      sendJson(res, { code: 404, message: '布局不存在或未发布', data: null })
      return
    }

    if (req.method === 'GET' && url === '/api/link/options') {
      sendJson(res, {
        code: 200,
        message: 'success',
        data: LINKS.filter((item) => item.status === 'enabled'),
      })
      return
    }

    if (req.method === 'POST' && url.startsWith('/api/link/track/')) {
      sendJson(res, { code: 200, message: '统计成功', data: { code: url.slice('/api/link/track/'.length) } })
      return
    }

    if (req.method === 'GET' && url.startsWith('/api/list/')) {
      const sourceCode = decodeURIComponent(url.slice('/api/list/'.length))
      const source = LIST_SOURCES[sourceCode]
      if (!source) {
        sendJson(res, { code: 404, message: `未知的数据源: ${sourceCode}`, data: null })
        return
      }
      const query = new URLSearchParams(req.url?.split('?')[1] || '')
      sendJson(res, { code: 200, message: 'success', data: paginateList(source, query) })
      return
    }

    next()
  })
}
