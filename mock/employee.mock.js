import { defineMock } from 'vite-plugin-mock-dev-server'
import {
  hashPassword,
  toPublicUser,
  userState,
  users,
} from './data/users.js'
import { getRoleById } from './data/roles.js'
import { tokenStore } from './data/tokenStore.js'

const parseToken = (authHeader = '') =>
  authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

export default defineMock([
  {
    url: '/api/employee/list',
    method: ['GET'],
    body() {
      return {
        code: 200,
        message: 'success',
        data: users.map(toPublicUser),
      }
    },
  },
  {
    url: '/api/employee',
    method: ['POST'],
    body({ body }) {
      try {
        if (!body.username?.trim()) throw new Error('请输入登录账号')
        if (!body.password || body.password.length < 6) throw new Error('密码长度不能少于 6 位')
        if (!body.name?.trim()) throw new Error('请输入员工姓名')
        if (!body.roleId) throw new Error('请选择角色')

        const role = getRoleById(body.roleId)
        if (!role) throw new Error('角色不存在')
        if (users.some((u) => u.username === body.username.trim())) {
          throw new Error('登录账号已存在')
        }

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
        const user = {
          id: userState.nextId++,
          username: body.username.trim(),
          password: hashPassword(body.password),
          name: body.name.trim(),
          roleId: role.id,
          role: role.name,
          avatar:
            body.avatar ||
            'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          createdAt: now,
          updatedAt: now,
        }
        users.push(user)
        return { code: 200, message: '新增成功', data: toPublicUser(user) }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/employee/:id',
    method: ['PUT'],
    body({ params, body }) {
      try {
        const id = Number(params.id)
        const index = users.findIndex((u) => u.id === id)
        if (index === -1) throw new Error('员工不存在')
        if (!body.name?.trim()) throw new Error('请输入员工姓名')
        if (!body.roleId) throw new Error('请选择角色')

        const role = getRoleById(body.roleId)
        if (!role) throw new Error('角色不存在')
        if (body.password && body.password.length < 6) {
          throw new Error('密码长度不能少于 6 位')
        }

        users[index] = {
          ...users[index],
          name: body.name.trim(),
          roleId: role.id,
          role: role.name,
          avatar: body.avatar || users[index].avatar,
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          ...(body.password ? { password: hashPassword(body.password) } : {}),
        }
        return { code: 200, message: '更新成功', data: toPublicUser(users[index]) }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/employee/:id/password',
    method: ['PUT'],
    body({ params, body }) {
      try {
        const id = Number(params.id)
        const user = users.find((u) => u.id === id)
        if (!user) throw new Error('员工不存在')
        if (!body.password || body.password.length < 6) {
          throw new Error('密码长度不能少于 6 位')
        }
        user.password = hashPassword(body.password)
        return { code: 200, message: '密码重置成功', data: null }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/employee/:id',
    method: ['DELETE'],
    body({ params, headers }) {
      try {
        const id = Number(params.id)
        if (id === 1) throw new Error('默认管理员不可删除')

        const token = parseToken(headers.authorization)
        const currentUserId = tokenStore.get(token)
        if (currentUserId === id) throw new Error('不能删除当前登录账号')

        const index = users.findIndex((u) => u.id === id)
        if (index === -1) throw new Error('员工不存在')
        users.splice(index, 1)
        return { code: 200, message: '删除成功', data: null }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
])
