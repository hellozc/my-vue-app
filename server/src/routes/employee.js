import { Router } from 'express'
import { success, fail } from '../utils/response.js'
import { getUserIdByToken } from '../utils/auth.js'
import {
  createEmployee,
  getEmployeeList,
  removeEmployee,
  resetEmployeePassword,
  updateEmployee,
} from '../services/employeeService.js'

const router = Router()

const getCurrentUserId = (req) => {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  return getUserIdByToken(token)
}

router.get('/list', async (req, res) => {
  try {
    res.json(success(await getEmployeeList()))
  } catch (err) {
    res.json(fail(err.message, 500))
  }
})

router.post('/', async (req, res) => {
  try {
    res.json(success(await createEmployee(req.body), '新增成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.put('/:id', async (req, res) => {
  try {
    res.json(success(await updateEmployee(req.params.id, req.body), '更新成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.put('/:id/password', async (req, res) => {
  try {
    await resetEmployeePassword(req.params.id, req.body.password)
    res.json(success(null, '密码重置成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await removeEmployee(req.params.id, getCurrentUserId(req))
    res.json(success(null, '删除成功'))
  } catch (err) {
    res.json(fail(err.message, 400))
  }
})

export default router
