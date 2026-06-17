import { Router } from 'express'
import { success, fail } from '../utils/response.js'
import { getUserIdByToken, parseBearerToken } from '../utils/auth.js'
import {
  addMenu,
  editMenu,
  getAllMenus,
  getMenuTree,
  getMenuTreeForUser,
  removeMenu,
} from '../services/menuService.js'

const router = Router()

router.get('/tree', async (req, res) => {
  try {
    const userId = getUserIdByToken(parseBearerToken(req.headers.authorization))
    const data = userId ? await getMenuTreeForUser(userId) : await getMenuTree()
    res.json(success(data))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.get('/list', async (req, res) => {
  try {
    res.json(success(await getAllMenus()))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.post('/', async (req, res) => {
  try {
    res.json(success(await addMenu(req.body), '新增成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.put('/:id', async (req, res) => {
  try {
    res.json(success(await editMenu(req.params.id, req.body), '更新成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await removeMenu(req.params.id)
    res.json(success(null, '删除成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

export default router
