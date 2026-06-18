import { defineMock } from 'vite-plugin-mock-dev-server'

let categories = [
  { id: 1, code: 'general', name: '通用', sort: 99, status: 'enabled', description: '默认分类', linkCount: 0, createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 2, code: 'navigation', name: '主导航', sort: 1, status: 'enabled', description: '首页、Tabbar 等主导航入口', linkCount: 3, createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 3, code: 'content', name: '内容资讯', sort: 2, status: 'enabled', description: '列表、资讯、详情等内容页', linkCount: 1, createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 4, code: 'marketing', name: '营销活动', sort: 3, status: 'enabled', description: '活动页、推广页', linkCount: 0, createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 5, code: 'external', name: '站外推广', sort: 4, status: 'enabled', description: '站外 H5、官网等', linkCount: 1, createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
]

let links = [
  { id: 1, code: 'home', name: '首页', categoryCode: 'navigation', categoryName: '主导航', type: 'internal', target: '/home', status: 'enabled', clickCount: 0, description: '应用首页', createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 2, code: 'mall', name: '商品管理', categoryCode: 'navigation', categoryName: '主导航', type: 'internal', target: '/mall', status: 'enabled', clickCount: 0, description: '商品管理页', createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 3, code: 'user', name: '用户管理', categoryCode: 'navigation', categoryName: '主导航', type: 'internal', target: '/user', status: 'enabled', clickCount: 0, description: '用户管理页', createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 4, code: 'community-news', name: '社区资讯', categoryCode: 'content', categoryName: '内容资讯', type: 'internal', target: '/page1', status: 'enabled', clickCount: 0, description: '社区资讯列表', createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
  { id: 5, code: 'official-site', name: '官网', categoryCode: 'external', categoryName: '站外推广', type: 'external', target: 'https://example.com', status: 'enabled', clickCount: 0, description: '站外官网示例', createdAt: '2026-06-17 10:00:00', updatedAt: '2026-06-17 10:00:00' },
]

let nextLinkId = 6
let nextCategoryId = 6

const findLinkById = (id) => links.find((item) => item.id === Number(id))
const findLinkByCode = (code) => links.find((item) => item.code === code)
const findCategoryById = (id) => categories.find((item) => item.id === Number(id))
const findCategoryByCode = (code) => categories.find((item) => item.code === code)

function syncCategoryLinkCount() {
  categories.forEach((category) => {
    category.linkCount = links.filter((item) => item.categoryCode === category.code).length
  })
}

function attachCategoryName(link) {
  const category = findCategoryByCode(link.categoryCode)
  return { ...link, categoryName: category?.name || '通用' }
}

export default defineMock([
  {
    url: '/api/link/category/list',
    method: ['GET'],
    body() {
      syncCategoryLinkCount()
      return { code: 200, message: 'success', data: [...categories].sort((a, b) => a.sort - b.sort) }
    },
  },
  {
    url: '/api/link/category/options',
    method: ['GET'],
    body() {
      return {
        code: 200,
        message: 'success',
        data: categories.filter((item) => item.status === 'enabled').sort((a, b) => a.sort - b.sort),
      }
    },
  },
  {
    url: '/api/link/category',
    method: ['POST'],
    body({ body }) {
      try {
        if (categories.some((item) => item.code === body.code)) throw new Error('分类编码已存在')
        const item = {
          id: nextCategoryId++,
          code: body.code,
          name: body.name,
          sort: body.sort ?? 1,
          status: body.status || 'enabled',
          description: body.description || '',
          linkCount: 0,
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        }
        categories.push(item)
        return { code: 200, message: '创建成功', data: item }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/link/category/:id',
    method: ['PUT'],
    body({ params, body }) {
      try {
        const item = findCategoryById(params.id)
        if (!item) throw new Error('分类不存在')
        Object.assign(item, {
          code: body.code ?? item.code,
          name: body.name ?? item.name,
          sort: body.sort ?? item.sort,
          status: body.status ?? item.status,
          description: body.description ?? item.description,
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        })
        return { code: 200, message: '更新成功', data: item }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/link/category/:id',
    method: ['DELETE'],
    body({ params }) {
      try {
        const item = findCategoryById(params.id)
        if (!item) throw new Error('分类不存在')
        if (item.code === 'general') throw new Error('默认分类不可删除')
        if (links.some((link) => link.categoryCode === item.code)) {
          throw new Error('该分类下仍有链接，请先移动或删除链接')
        }
        categories = categories.filter((row) => row.id !== item.id)
        return { code: 200, message: '删除成功', data: null }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/link/list',
    method: ['GET'],
    body({ query }) {
      let data = links.filter((item) => item.status !== 'disabled').concat([]).sort((a, b) => b.id - a.id)
      data = links.sort((a, b) => b.id - a.id).map(attachCategoryName)
      if (query.categoryCode) {
        data = data.filter((item) => item.categoryCode === query.categoryCode)
      }
      return { code: 200, message: 'success', data }
    },
  },
  {
    url: '/api/link/options',
    method: ['GET'],
    body({ query }) {
      let data = links.filter((item) => item.status === 'enabled').map(attachCategoryName)
      if (query.categoryCode) {
        data = data.filter((item) => item.categoryCode === query.categoryCode)
      }
      return { code: 200, message: 'success', data }
    },
  },
  {
    url: '/api/link/code/:code',
    method: ['GET'],
    body({ params }) {
      const item = findLinkByCode(params.code)
      if (!item) return { code: 404, message: '链接不存在', data: null }
      return { code: 200, message: 'success', data: attachCategoryName(item) }
    },
  },
  {
    url: '/api/link/track/:code',
    method: ['POST'],
    body({ params }) {
      const item = findLinkByCode(params.code)
      if (!item || item.status !== 'enabled') {
        return { code: 400, message: '链接不存在或已禁用', data: null }
      }
      item.clickCount += 1
      item.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
      return { code: 200, message: '统计成功', data: { code: item.code } }
    },
  },
  {
    url: '/api/link/:id',
    method: ['GET'],
    body({ params }) {
      const item = findLinkById(params.id)
      if (!item) return { code: 404, message: '链接不存在', data: null }
      return { code: 200, message: 'success', data: attachCategoryName(item) }
    },
  },
  {
    url: '/api/link',
    method: ['POST'],
    body({ body }) {
      try {
        if (links.some((item) => item.code === body.code)) throw new Error('链接编码已存在')
        const item = attachCategoryName({
          id: nextLinkId++,
          code: body.code,
          name: body.name,
          categoryCode: body.categoryCode || 'general',
          type: body.type,
          target: body.target,
          status: body.status || 'enabled',
          clickCount: 0,
          description: body.description || '',
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        })
        links.push(item)
        syncCategoryLinkCount()
        return { code: 200, message: '创建成功', data: item }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/link/:id',
    method: ['PUT'],
    body({ params, body }) {
      try {
        const item = findLinkById(params.id)
        if (!item) throw new Error('链接不存在')
        Object.assign(item, {
          code: body.code ?? item.code,
          name: body.name ?? item.name,
          categoryCode: body.categoryCode ?? item.categoryCode,
          type: body.type ?? item.type,
          target: body.target ?? item.target,
          status: body.status ?? item.status,
          description: body.description ?? item.description,
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        })
        syncCategoryLinkCount()
        return { code: 200, message: '更新成功', data: attachCategoryName(item) }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/link/:id',
    method: ['DELETE'],
    body({ params }) {
      const index = links.findIndex((item) => item.id === Number(params.id))
      if (index === -1) return { code: 404, message: '链接不存在', data: null }
      links.splice(index, 1)
      syncCategoryLinkCount()
      return { code: 200, message: '删除成功', data: null }
    },
  },
])
