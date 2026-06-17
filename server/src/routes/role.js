import { Router } from 'express'
import { success, fail } from '../utils/response.js'
import {
  createRole,
  getRoleDetail,
  getRoleList,
  getRoleMenuIds,
  removeRole,
  setRoleMenus,
  updateRole,
} from '../services/roleService.js'

const router = Router()

router.get('/list', async (req, res) => {
  try {
    res.json(success(await getRoleList()))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.get('/:id', async (req, res) => {
  try {
    res.json(success(await getRoleDetail(req.params.id)))
  } catch (err) {
    res.json(fail(err.message, 404))
  }
})

router.post('/', async (req, res) => {
  try {
    res.json(success(await createRole(req.body), '新增成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.put('/:id', async (req, res) => {
  try {
    res.json(success(await updateRole(req.params.id, req.body), '更新成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await removeRole(req.params.id)
    res.json(success(null, '删除成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.get('/:id/menus', async (req, res) => {
  try {
    res.json(success(await getRoleMenuIds(req.params.id)))
  } catch (err) {
    res.json(fail(err.message, 404))
  }
})

router.put('/:id/menus', async (req, res) => {
  try {
    await setRoleMenus(req.params.id, req.body.menuIds || [])
    res.json(success(null, '菜单权限已更新'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

export default router
