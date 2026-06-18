import { Router } from 'express'
import homeRouter from './home.js'
import menuRouter from './menu.js'
import authRouter from './auth.js'
import employeeRouter from './employee.js'
import roleRouter from './role.js'
import layoutRouter from './layout.js'
import linkRouter from './link.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/home', homeRouter)
router.use('/menu', menuRouter)
router.use('/employee', employeeRouter)
router.use('/role', roleRouter)
router.use('/layout', layoutRouter)
router.use('/link', linkRouter)

export default router
