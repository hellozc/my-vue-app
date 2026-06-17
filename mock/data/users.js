import { createHash } from 'crypto'

export const hashPassword = (pwd) => createHash('sha256').update(pwd).digest('hex')

/** Mock 内存用户，供 auth / employee 接口共用 */
export let users = [
  {
    id: 1,
    username: 'admin',
    password: hashPassword('123456'),
    name: 'Admin',
    roleId: 1,
    role: '超级管理员',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    createdAt: '2024-01-01 00:00:00',
  },
]

export const userState = { nextId: 2 }

export const toPublicUser = (user) => ({
  id: user.id,
  username: user.username,
  name: user.name,
  roleId: user.roleId,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})
