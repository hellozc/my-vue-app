import { defineMock } from 'vite-plugin-mock-dev-server'
import {
  getRoleById,
  getRoleMenuIds,
  removeRoleMenus,
  roleState,
  roles,
  setRoleMenuIds,
} from '@mock/data/roles.js'
import { users } from '@mock/data/users.js'

export default defineMock([
  {
    url: '/api/role/list',
    method: ['GET'],
    body() {
      return { code: 200, message: 'success', data: [...roles] }
    },
  },
  {
    url: '/api/role/:id',
    method: ['GET'],
    body({ params }) {
      const role = getRoleById(params.id)
      if (!role) return { code: 404, message: '角色不存在', data: null }
      return {
        code: 200,
        message: 'success',
        data: { ...role, menuIds: getRoleMenuIds(role.id) },
      }
    },
  },
  {
    url: '/api/role',
    method: ['POST'],
    body({ body }) {
      try {
        if (!body.code?.trim()) throw new Error('请输入角色编码')
        if (!body.name?.trim()) throw new Error('请输入角色名称')
        if (roles.some((r) => r.code === body.code.trim())) throw new Error('角色编码已存在')
        if (roles.some((r) => r.name === body.name.trim())) throw new Error('角色名称已存在')

        const role = {
          id: roleState.nextId++,
          code: body.code.trim(),
          name: body.name.trim(),
          description: body.description || '',
          sort: body.sort ?? 1,
        }
        roles.push(role)
        setRoleMenuIds(role.id, body.menuIds || [])
        return {
          code: 200,
          message: '新增成功',
          data: { ...role, menuIds: getRoleMenuIds(role.id) },
        }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/role/:id',
    method: ['PUT'],
    body({ params, body }) {
      try {
        const id = Number(params.id)
        const index = roles.findIndex((r) => r.id === id)
        if (index === -1) throw new Error('角色不存在')
        if (!body.code?.trim()) throw new Error('请输入角色编码')
        if (!body.name?.trim()) throw new Error('请输入角色名称')
        if (roles.some((r) => r.code === body.code.trim() && r.id !== id)) {
          throw new Error('角色编码已存在')
        }
        if (roles.some((r) => r.name === body.name.trim() && r.id !== id)) {
          throw new Error('角色名称已存在')
        }

        roles[index] = {
          ...roles[index],
          code: body.code.trim(),
          name: body.name.trim(),
          description: body.description || '',
          sort: body.sort ?? roles[index].sort,
        }
        if (body.menuIds) setRoleMenuIds(id, body.menuIds)

        users.forEach((user) => {
          if (user.roleId === id) user.role = roles[index].name
        })

        return {
          code: 200,
          message: '更新成功',
          data: { ...roles[index], menuIds: getRoleMenuIds(id) },
        }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/role/:id',
    method: ['DELETE'],
    body({ params }) {
      try {
        const id = Number(params.id)
        if (id === 1) throw new Error('超级管理员角色不可删除')
        const index = roles.findIndex((r) => r.id === id)
        if (index === -1) throw new Error('角色不存在')
        if (users.some((u) => u.roleId === id)) throw new Error('该角色下仍有员工，无法删除')
        roles.splice(index, 1)
        removeRoleMenus(id)
        return { code: 200, message: '删除成功', data: null }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/role/:id/menus',
    method: ['GET'],
    body({ params }) {
      const role = getRoleById(params.id)
      if (!role) return { code: 404, message: '角色不存在', data: null }
      return { code: 200, message: 'success', data: getRoleMenuIds(role.id) }
    },
  },
  {
    url: '/api/role/:id/menus',
    method: ['PUT'],
    body({ params, body }) {
      try {
        const role = getRoleById(params.id)
        if (!role) throw new Error('角色不存在')
        setRoleMenuIds(role.id, body.menuIds || [])
        return { code: 200, message: '菜单权限已更新', data: null }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
])
