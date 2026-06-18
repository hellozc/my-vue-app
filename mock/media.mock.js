import { defineMock } from 'vite-plugin-mock-dev-server'

let categories = [
  { id: 1, code: 'general', name: '通用素材', sort: 99, status: 'enabled', description: '默认分类', mediaCount: 0 },
  { id: 2, code: 'layout', name: '布局素材', sort: 1, status: 'enabled', description: '页面背景、模块配图', mediaCount: 0 },
  { id: 3, code: 'banner', name: '轮播 Banner', sort: 2, status: 'enabled', description: '顶部容器、轮播图', mediaCount: 1 },
  { id: 4, code: 'logo', name: 'Logo 图标', sort: 3, status: 'enabled', description: '品牌 Logo', mediaCount: 0 },
  { id: 5, code: 'avatar', name: '头像', sort: 4, status: 'enabled', description: '用户头像', mediaCount: 0 },
]

let mediaItems = [
  {
    id: 1,
    name: '示例 Banner',
    categoryCode: 'banner',
    categoryName: '轮播 Banner',
    url: 'https://picsum.photos/seed/demo-banner/750/360',
    path: 'mock/demo-banner.jpg',
    mimeType: 'image/jpeg',
    fileSize: 120000,
    width: 750,
    height: 360,
    status: 'enabled',
    createdAt: '2026-06-17 10:00:00',
    updatedAt: '2026-06-17 10:00:00',
  },
]

let nextMediaId = 2
let nextCategoryId = 6

function syncCategoryCount() {
  categories.forEach((category) => {
    category.mediaCount = mediaItems.filter((item) => item.categoryCode === category.code).length
  })
}

function filterList(query = {}) {
  let list = [...mediaItems]
  if (query.categoryCode) {
    list = list.filter((item) => item.categoryCode === query.categoryCode)
  }
  if (query.keyword) {
    const keyword = String(query.keyword).toLowerCase()
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) || item.url.toLowerCase().includes(keyword)
    )
  }
  return list
}

export default defineMock([
  {
    url: '/api/media/category/list',
    method: ['GET'],
    body() {
      syncCategoryCount()
      return { code: 200, message: 'success', data: [...categories].sort((a, b) => a.sort - b.sort) }
    },
  },
  {
    url: '/api/media/category/options',
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
    url: '/api/media/category',
    method: ['POST'],
    body({ body }) {
      const item = {
        id: nextCategoryId++,
        code: body.code,
        name: body.name,
        sort: body.sort ?? 1,
        status: body.status || 'enabled',
        description: body.description || '',
        mediaCount: 0,
      }
      categories.push(item)
      return { code: 200, message: '创建成功', data: item }
    },
  },
  {
    url: '/api/media/list',
    method: ['GET'],
    body({ query }) {
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 24)
      const list = filterList(query)
      const start = (page - 1) * pageSize
      return {
        code: 200,
        message: 'success',
        data: {
          list: list.slice(start, start + pageSize),
          total: list.length,
          page,
          pageSize,
        },
      }
    },
  },
  {
    url: '/api/media/options',
    method: ['GET'],
    body({ query }) {
      return {
        code: 200,
        message: 'success',
        data: filterList(query).filter((item) => item.status === 'enabled'),
      }
    },
  },
  {
    url: '/api/media/upload',
    method: ['POST'],
    body({ body }) {
      const item = {
        id: nextMediaId++,
        name: body?.name || `mock-${Date.now()}`,
        categoryCode: body?.categoryCode || 'general',
        categoryName: categories.find((c) => c.code === body?.categoryCode)?.name || '通用素材',
        url: `https://picsum.photos/seed/mock-${Date.now()}/750/360`,
        path: `mock/${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
        fileSize: 102400,
        width: Number(body?.width) || 750,
        height: Number(body?.height) || 360,
        status: 'enabled',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      }
      mediaItems.unshift(item)
      return { code: 200, message: '上传成功', data: item }
    },
  },
  {
    url: '/api/media/:id',
    method: ['DELETE'],
    body({ params }) {
      mediaItems = mediaItems.filter((item) => item.id !== Number(params.id))
      return { code: 200, message: '删除成功', data: null }
    },
  },
])
