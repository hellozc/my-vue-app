import { Router } from 'express'
import { success, fail } from '../utils/response.js'
import {
  changePassword,
  getUserInfoByToken,
  login,
  logout,
} from '../services/authService.js'
import { parseBearerToken } from '../utils/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    res.json(success(await login(req.body)))
  } catch (err) {
    res.json(fail(err.message, 401))
  }
})

router.post('/logout', async (req, res) => {
  const token = parseBearerToken(req.headers.authorization)
  await logout(token)
  res.json(success(null, '退出成功'))
})

router.get('/userInfo', async (req, res) => {
  try {
    const token = parseBearerToken(req.headers.authorization)
    res.json(success(await getUserInfoByToken(token)))
  } catch (err) {
    res.json(fail(err.message, 401))
  }
})

router.put('/password', async (req, res) => {
  try {
    const token = parseBearerToken(req.headers.authorization)
    await changePassword(token, req.body)
    res.json(success(null, '密码修改成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

export default router
