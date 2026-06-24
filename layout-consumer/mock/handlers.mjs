import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const demoHomeSeed = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../shared/seeds/demo-home.json'), 'utf8')
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

export function attachDevMock(server) {
  server.middlewares.use((req, res, next) => {
    const url = req.url?.split('?')[0] || ''

    if (req.method === 'GET' && url.startsWith('/api/layout/code/')) {
      const code = decodeURIComponent(url.slice('/api/layout/code/'.length))
      if (code === DEMO_LAYOUT.code && DEMO_LAYOUT.status === 'published') {
        sendJson(res, { code: 200, message: 'success', data: DEMO_LAYOUT })
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
