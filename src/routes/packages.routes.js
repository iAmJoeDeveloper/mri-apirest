import { Router } from 'express'
const { getPackages, createPackage, checkStatus } = require('../controllers/package.controller')

const router = Router()

router.get('/packages', getPackages)
router.post('/package/create', createPackage)
router.get('/package/checking/:id', checkStatus)

export default router
