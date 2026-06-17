import { defineMock } from 'vite-plugin-mock-dev-server'
import { tokenStore } from './data/tokenStore.js'
import { users } from './data/users.js'
import { getRoleMenuIds, isAdminRole } from './data/roles.js'
import { buildMenuTree, filterMenusByIds } from './data/menuUtils.js'

/** Mock 菜单内存数据 */
let menus = [
  { id: 1, parentId: 0, path: '/home', name: 'home', label: '首页', icon: 'House', component: 'Home', sort: 1, type: 'menu' },
  { id: 2, parentId: 0, path: '/mall', name: 'mall', label: '商品管理', icon: 'Goods', component: 'Mall', sort: 2, type: 'menu' },
  { id: 3, parentId: 0, path: '/user', name: 'user', label: '用户管理', icon: 'User', component: 'User', sort: 3, type: 'menu' },
  { id: 4, parentId: 0, path: '/other', name: 'other', label: '其他', icon: 'More', component: null, sort: 4, type: 'directory' },
  { id: 5, parentId: 4, path: '/other-group', name: 'otherGroup', label: '分组管理', icon: 'Folder', component: null, sort: 1, type: 'directory' },
  { id: 6, parentId: 5, path: '/page1', name: 'page1', label: '页面1', icon: 'Document', component: 'PageOne', sort: 1, type: 'menu' },
  { id: 7, parentId: 5, path: '/page2', name: 'page2', label: '页面2', icon: 'Document', component: 'PageTwo', sort: 2, type: 'menu' },
  { id: 8, parentId: 4, path: '/other-setting', name: 'otherSetting', label: '系统设置', icon: 'Setting', component: null, sort: 2, type: 'directory' },
  { id: 9, parentId: 8, path: '/page3', name: 'page3', label: '页面3', icon: 'Document', component: 'PageThree', sort: 1, type: 'menu' },
  { id: 10, parentId: 0, path: '/system', name: 'system', label: '系统管理', icon: 'Setting', component: null, sort: 5, type: 'directory' },
  { id: 11, parentId: 10, path: '/system/menu', name: 'menuManage', label: '菜单管理', icon: 'Menu', component: 'system/MenuManage', sort: 1, type: 'menu' },
  { id: 12, parentId: 10, path: '/system/employee', name: 'employeeManage', label: '员工管理', icon: 'UserFilled', component: 'system/EmployeeManage', sort: 2, type: 'menu' },
  { id: 13, parentId: 10, path: '/system/role', name: 'roleManage', label: '角色管理', icon: 'Key', component: 'system/RoleManage', sort: 3, type: 'menu' },
]

let nextId = 14

const parseToken = (authHeader = '') =>
  authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

const getMenuTreeForUser = (userId) => {
  const user = users.find((item) => item.id === userId)
  if (!user) return buildMenuTree([...menus])
  if (isAdminRole(user.roleId)) return buildMenuTree([...menus])
  const menuIds = getRoleMenuIds(user.roleId)
  return buildMenuTree(filterMenusByIds([...menus], menuIds))
}

export default defineMock([
  {
    url: '/api/menu/tree',
    method: ['GET'],
    body({ headers }) {
      const token = parseToken(headers.authorization)
      const userId = tokenStore.get(token)
      const data = userId ? getMenuTreeForUser(userId) : buildMenuTree([...menus])
      return { code: 200, message: 'success', data }
    },
  },
  {
    url: '/api/menu/list',
    method: ['GET'],
    body() {
      return { code: 200, message: 'success', data: [...menus].sort((a, b) => a.sort - b.sort) }
    },
  },
  {
    url: '/api/menu',
    method: ['POST'],
    body({ body }) {
      try {
        if (menus.some((m) => m.name === body.name)) throw new Error('路由 name 已存在')
        if (menus.some((m) => m.path === body.path)) throw new Error('路由 path 已存在')
        const item = {
          id: nextId++,
          parentId: body.parentId ?? 0,
          path: body.path,
          name: body.name,
          label: body.label,
          icon: body.icon || 'Document',
          component: body.type === 'menu' ? (body.component || 'DynamicPage') : null,
          sort: body.sort ?? 1,
          type: body.type || 'menu',
        }
        menus.push(item)
        return { code: 200, message: '新增成功', data: item }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/menu/:id',
    method: ['PUT'],
    body({ params, body }) {
      try {
        const id = Number(params.id)
        if (menus.some((m) => m.name === body.name && m.id !== id)) throw new Error('路由 name 已存在')
        if (menus.some((m) => m.path === body.path && m.id !== id)) throw new Error('路由 path 已存在')
        const index = menus.findIndex((m) => m.id === id)
        if (index === -1) throw new Error('菜单不存在')
        menus[index] = {
          ...menus[index],
          ...body,
          id,
          component: body.type === 'directory' ? null : (body.component || menus[index].component || 'DynamicPage'),
        }
        return { code: 200, message: '更新成功', data: menus[index] }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
  {
    url: '/api/menu/:id',
    method: ['DELETE'],
    body({ params }) {
      try {
        const id = Number(params.id)
        if (menus.some((m) => m.parentId === id)) throw new Error('请先删除子菜单')
        const index = menus.findIndex((m) => m.id === id)
        if (index === -1) throw new Error('菜单不存在')
        if (menus[index].path === '/home') throw new Error('首页不可删除')
        menus.splice(index, 1)
        return { code: 200, message: '删除成功', data: null }
      } catch (err) {
        return { code: 400, message: err.message, data: null }
      }
    },
  },
])
