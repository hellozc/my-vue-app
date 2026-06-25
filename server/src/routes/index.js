import { Router } from 'express'
import homeRouter from './home.js'
import menuRouter from './menu.js'
import authRouter from './auth.js'
import employeeRouter from './employee.js'
import roleRouter from './role.js'
import layoutRouter from './layout.js'
import linkRouter from './link.js'
import listRouter from './list.js'
import mediaRouter from './media.js'
import memberRouter from './member.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/member', memberRouter)
router.use('/home', homeRouter)
router.use('/menu', menuRouter)
router.use('/employee', employeeRouter)
router.use('/role', roleRouter)
router.use('/layout', layoutRouter)
router.use('/link', linkRouter)
router.use('/list', listRouter)
router.use('/media', mediaRouter)

export default router
