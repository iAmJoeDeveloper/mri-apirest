import { Router } from 'express'
const { getPackages, createPackage, getPackageById } = require('../controllers/package.controller')

const router = Router()

router.get('/packages', getPackages)
router.post('/package/create', createPackage)
router.get('/package/checking/:id', getPackageById)

export default router
