import { Router } from 'express'
import * as layoutService from '../services/layoutService.js'
import { success, fail } from '../utils/response.js'

const router = Router()

router.get('/list', async (req, res) => {
  try {
    res.json(success(await layoutService.listLayouts()))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.get('/code/:code', async (req, res) => {
  try {
    res.json(success(await layoutService.getPublishedLayoutByCode(req.params.code)))
  } catch (err) {
    res.json(fail(err.message, 404))
  }
})

router.get('/:id', async (req, res) => {
  try {
    res.json(success(await layoutService.getLayout(req.params.id)))
  } catch (err) {
    res.json(fail(err.message, 404))
  }
})

router.post('/', async (req, res) => {
  try {
    res.json(success(await layoutService.createLayout(req.body), '创建成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.put('/:id', async (req, res) => {
  try {
    res.json(success(await layoutService.updateLayout(req.params.id, req.body), '更新成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.post('/:id/publish', async (req, res) => {
  try {
    res.json(success(await layoutService.publishLayout(req.params.id), '发布成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await layoutService.removeLayout(req.params.id)
    res.json(success(null, '删除成功'))
  } catch (err) {
    res.json(fail(err.message, 404))
  }
})

export default router
