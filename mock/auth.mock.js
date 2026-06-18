import { defineMock } from 'vite-plugin-mock-dev-server'
import { hashPassword, toPublicUser, users } from '@mock/data/users.js'
import { tokenStore } from '@mock/data/tokenStore.js'
import { randomUUID } from 'crypto'

const parseToken = (authHeader = '') =>
  authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

export default defineMock([
  {
    url: '/api/auth/login',
    method: ['POST'],
    body({ body }) {
      const user = users.find((u) => u.username === body.username)
      if (!user || user.password !== hashPassword(body.password)) {
        return { code: 401, message: '用户名或密码错误', data: null }
      }
      const token = randomUUID()
      tokenStore.set(token, user.id)
      return {
        code: 200,
        message: '登录成功',
        data: { token, userInfo: toPublicUser(user) },
      }
    },
  },
  {
    url: '/api/auth/logout',
    method: ['POST'],
    body({ headers }) {
      tokenStore.delete(parseToken(headers.authorization))
      return { code: 200, message: '退出成功', data: null }
    },
  },
  {
    url: '/api/auth/userInfo',
    method: ['GET'],
    body({ headers }) {
      const token = parseToken(headers.authorization)
      const userId = tokenStore.get(token)
      if (!userId) {
        return { code: 401, message: '登录已过期，请重新登录', data: null }
      }
      const user = users.find((u) => u.id === userId)
      if (!user) {
        return { code: 401, message: '用户不存在', data: null }
      }
      return { code: 200, message: 'success', data: toPublicUser(user) }
    },
  },
  {
    url: '/api/auth/password',
    method: ['PUT'],
    body({ headers, body }) {
      const token = parseToken(headers.authorization)
      const userId = tokenStore.get(token)
      if (!userId) {
        return { code: 401, message: '登录已过期，请重新登录', data: null }
      }
      const user = users.find((u) => u.id === userId)
      if (!user) {
        return { code: 401, message: '用户不存在', data: null }
      }
      if (user.password !== hashPassword(body.oldPassword)) {
        return { code: 400, message: '原密码错误', data: null }
      }
      if (!body.newPassword || body.newPassword.length < 6) {
        return { code: 400, message: '新密码长度不能少于 6 位', data: null }
      }
      user.password = hashPassword(body.newPassword)
      return { code: 200, message: '密码修改成功', data: null }
    },
  },
])
