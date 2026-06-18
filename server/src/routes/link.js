import { Router } from 'express'
import * as linkService from '../services/linkService.js'
import * as linkCategoryService from '../services/linkCategoryService.js'
import { success, fail } from '../utils/response.js'

const router = Router()

router.get('/category/list', async (req, res) => {
  try {
    res.json(success(await linkCategoryService.listCategories()))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.get('/category/options', async (req, res) => {
  try {
    res.json(success(await linkCategoryService.listCategoryOptions()))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.post('/category', async (req, res) => {
  try {
    res.json(success(await linkCategoryService.createCategory(req.body), '创建成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.put('/category/:id', async (req, res) => {
  try {
    res.json(success(await linkCategoryService.updateCategory(req.params.id, req.body), '更新成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.delete('/category/:id', async (req, res) => {
  try {
    await linkCategoryService.removeCategory(req.params.id)
    res.json(success(null, '删除成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.get('/list', async (req, res) => {
  try {
    res.json(success(await linkService.listLinks(req.query.categoryCode)))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.get('/options', async (req, res) => {
  try {
    res.json(success(await linkService.listLinkOptions(req.query.categoryCode)))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.get('/code/:code', async (req, res) => {
  try {
    res.json(success(await linkService.getLinkByCode(req.params.code)))
  } catch (err) {
    res.json(fail(err.message, 404))
  }
})

router.post('/track/:code', async (req, res) => {
  try {
    res.json(success(await linkService.trackLinkClick(req.params.code), '统计成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.get('/:id', async (req, res) => {
  try {
    res.json(success(await linkService.getLink(req.params.id)))
  } catch (err) {
    res.json(fail(err.message, 404))
  }
})

router.post('/', async (req, res) => {
  try {
    res.json(success(await linkService.createLink(req.body), '创建成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.put('/:id', async (req, res) => {
  try {
    res.json(success(await linkService.updateLink(req.params.id, req.body), '更新成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await linkService.removeLink(req.params.id)
    res.json(success(null, '删除成功'))
  } catch (err) {
    res.json(fail(err.message, 404))
  }
})

export default router
