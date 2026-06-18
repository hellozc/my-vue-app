import { defineMock } from 'vite-plugin-mock-dev-server'
import demoHomeSeed from '../../shared/seeds/demo-home.json'

let layouts = [
  {
    id: 1,
    ...demoHomeSeed,
    createdAt: '2026-06-17 10:00:00',
    updatedAt: '2026-06-17 10:00:00',
  },
]

let nextId = 2

const mapRow = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description,
  status: row.status,
  version: row.version,
  schema: row.schema,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export default defineMock([
  {
    url: '/api/layout/list',
    method: ['GET'],
    body() {
      return {
        code: 200,
        message: 'success',
        data: layouts.map(mapRow).sort((a, b) => b.id - a.id),
      }
    },
  },
  {
    url: '/api/layout/code/:code',
    method: ['GET'],
    body({ params }) {
      const row = layouts.find((item) => item.code === params.code && item.status === 'published')
      if (!row) return { code: 404, message: '布局不存在或未发布', data: null }
      return { code: 200, message: 'success', data: mapRow(row) }
    },
  },
  {
    url: '/api/layout/:id',
    method: ['GET'],
    body({ params }) {
      const row = layouts.find((item) => String(item.id) === String(params.id))
      if (!row) return { code: 404, message: '布局不存在', data: null }
      return { code: 200, message: 'success', data: mapRow(row) }
    },
  },
  {
    url: '/api/layout',
    method: ['POST'],
    body({ body }) {
      try {
        if (layouts.some((item) => item.code === body.code)) {
          throw new Error('布局编码已存在')
        }
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
        const item = {
          id: nextId++,
          code: body.code,
          name: body.name,
          description: body.description ?? '',
          status: 'draft',
          version: 1,
          schema: body.schema,
          createdAt: now,
          updatedAt: now,
        }
        layouts.push(item)
        return { code: 200, message: '创建成功', data: mapRow(item) }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/layout/:id',
    method: ['PUT'],
    body({ params, body }) {
      const index = layouts.findIndex((item) => String(item.id) === String(params.id))
      if (index === -1) return { code: 404, message: '布局不存在', data: null }
      if (body.code && layouts.some((item) => item.code === body.code && item.id !== layouts[index].id)) {
        return { code: 400, message: '布局编码已存在', data: null }
      }
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      layouts[index] = {
        ...layouts[index],
        name: body.name ?? layouts[index].name,
        code: body.code ?? layouts[index].code,
        description: body.description ?? layouts[index].description,
        schema: body.schema ?? layouts[index].schema,
        updatedAt: now,
      }
      return { code: 200, message: '更新成功', data: mapRow(layouts[index]) }
    },
  },
  {
    url: '/api/layout/:id/publish',
    method: ['POST'],
    body({ params }) {
      const index = layouts.findIndex((item) => String(item.id) === String(params.id))
      if (index === -1) return { code: 404, message: '布局不存在', data: null }
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      layouts[index].status = 'published'
      layouts[index].version += 1
      layouts[index].updatedAt = now
      return { code: 200, message: '发布成功', data: mapRow(layouts[index]) }
    },
  },
  {
    url: '/api/layout/:id',
    method: ['DELETE'],
    body({ params }) {
      const index = layouts.findIndex((item) => String(item.id) === String(params.id))
      if (index === -1) return { code: 404, message: '布局不存在', data: null }
      layouts.splice(index, 1)
      return { code: 200, message: '删除成功', data: null }
    },
  },
])
