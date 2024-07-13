import { Router } from 'express'
const { getPackages, createPackage } = require('../controllers/packageController')

const router = Router()

router.get('/packages', getPackages)
router.post('/package/create', createPackage)

export default router
