import { Router } from 'express'
import { createQR, generate } from '../controllers/qrcode.controller'

const router = Router()

router.get('/qrcodes/generate/:id', generate)

export default router
