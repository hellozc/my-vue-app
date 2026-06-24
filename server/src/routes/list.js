import { Router } from 'express'
import { success, fail } from '../utils/response.js'
import { getListPage, getDataSourceOptions } from '../services/listService.js'

const router = Router()

/**
 * GET /api/list/sources
 * 管理端下拉：可选的动态数据源列表（须在 /:sourceCode 之前注册）
 */
router.get('/sources', (req, res) => {
  try {
    res.json(success(getDataSourceOptions()))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

/**
 * GET /api/list/:sourceCode?page=1&pageSize=5
 * 列表模块动态数据源分页接口
 */
router.get('/:sourceCode', async (req, res) => {
  try {
    const data = await getListPage(req.params.sourceCode, {
      page: req.query.page,
      pageSize: req.query.pageSize,
    })
    res.json(success(data))
  } catch (err) {
    res.json(fail(err.message, err.statusCode || 500))
  }
})

export default router
