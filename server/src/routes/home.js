import { Router } from 'express'
import { success } from '../utils/response.js'
import { getHomeData } from '../services/homeService.js'

const router = Router()

/**
 * GET /api/home/getData
 * 首页仪表盘数据
 */
router.get('/getData', (req, res) => {
  res.json(success(getHomeData()))
})

export default router
