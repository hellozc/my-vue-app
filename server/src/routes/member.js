import { Router } from 'express'
import { success, fail } from '../utils/response.js'
import * as memberService from '../services/memberService.js'

const router = Router()

router.get('/auth/capabilities', async (req, res) => {
  try {
    res.json(success(await memberService.getAuthCapabilities()))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.get('/auth/admin/config', async (req, res) => {
  try {
    res.json(success(await memberService.getAdminAuthConfig(req.headers.authorization)))
  } catch (err) {
    res.json(fail(err.message, 403))
  }
})

router.put('/auth/admin/config', async (req, res) => {
  try {
    res.json(success(await memberService.saveAdminAuthConfig(req.headers.authorization, req.body), '保存成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.get('/auth/admin/sms-inbox', async (req, res) => {
  try {
    res.json(success(await memberService.getAdminSmsInbox(req.headers.authorization, req.query)))
  } catch (err) {
    res.json(fail(err.message, 403))
  }
})

router.delete('/auth/admin/sms-inbox', async (req, res) => {
  try {
    res.json(success(await memberService.clearAdminSmsInbox(req.headers.authorization), '已清空'))
  } catch (err) {
    res.json(fail(err.message, 403))
  }
})

router.post('/auth/login/password', async (req, res) => {
  try {
    res.json(success(await memberService.loginByPassword(req.body)))
  } catch (err) {
    res.json(fail(err.message, 401))
  }
})

router.post('/auth/sms/send', async (req, res) => {
  try {
    res.json(success(await memberService.sendSmsCode(req.body)))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.post('/auth/login/sms', async (req, res) => {
  try {
    res.json(success(await memberService.loginBySms(req.body)))
  } catch (err) {
    res.json(fail(err.message, 401))
  }
})

router.post('/auth/login/wechat', async (req, res) => {
  try {
    res.json(success(await memberService.loginByWechat(req.body)))
  } catch (err) {
    res.json(fail(err.message, 401))
  }
})

router.post('/auth/login/wechat-phone', async (req, res) => {
  try {
    res.json(success(await memberService.loginByWechatPhone(req.body)))
  } catch (err) {
    res.json(fail(err.message, 401))
  }
})

router.post('/auth/login/oneclick', async (req, res) => {
  try {
    res.json(success(await memberService.loginByOneclick(req.body)))
  } catch (err) {
    res.json(fail(err.message, 401))
  }
})

router.post('/auth/register', async (req, res) => {
  try {
    res.json(success(await memberService.registerByPhone(req.body), '注册成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.post('/auth/logout', async (req, res) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : ''
  await memberService.logout(token)
  res.json(success(null, '退出成功'))
})

router.get('/profile', async (req, res) => {
  try {
    res.json(success(await memberService.getProfileByToken(req.headers.authorization)))
  } catch (err) {
    res.json(fail(err.message, 401))
  }
})

export default router
