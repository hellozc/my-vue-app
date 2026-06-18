import { Router } from 'express'
import * as mediaService from '../services/mediaService.js'
import { mediaUpload } from '../middleware/mediaUpload.js'
import { success, fail } from '../utils/response.js'

const router = Router()

router.get('/category/list', async (req, res) => {
  try {
    res.json(success(await mediaService.listCategories()))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.get('/category/options', async (req, res) => {
  try {
    res.json(success(await mediaService.listCategoryOptions()))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.post('/category', async (req, res) => {
  try {
    res.json(success(await mediaService.createCategory(req.body), '创建成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.put('/category/:id', async (req, res) => {
  try {
    res.json(success(await mediaService.updateCategory(req.params.id, req.body), '更新成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.delete('/category/:id', async (req, res) => {
  try {
    await mediaService.removeCategory(req.params.id)
    res.json(success(null, '删除成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.get('/list', async (req, res) => {
  try {
    res.json(success(await mediaService.listMedia(req.query)))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.get('/options', async (req, res) => {
  try {
    res.json(success(await mediaService.listMediaOptions(req.query.categoryCode)))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.get('/:id', async (req, res) => {
  try {
    res.json(success(await mediaService.getMediaById(req.params.id)))
  } catch (err) {
    res.json(fail(err.message, 404))
  }
})

router.post('/upload', mediaUpload.single('file'), async (req, res) => {
  try {
    const categoryCode = req.query?.categoryCode || req.body?.categoryCode
    const media = await mediaService.uploadMedia(req.file, {
      ...req.body,
      categoryCode,
      width: req.body.width,
      height: req.body.height,
    })
    res.json(success(media, '上传成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.put('/:id', async (req, res) => {
  try {
    res.json(success(await mediaService.updateMedia(req.params.id, req.body), '更新成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await mediaService.removeMedia(req.params.id)
    res.json(success(null, '删除成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

export default router
