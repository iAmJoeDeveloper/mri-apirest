import { Router } from 'express'
import { getProducts, renderXml } from '../controllers/products.controller'
import { createQR } from '../controllers/qrcode.controller'

const router = Router()

router.get('/products', getProducts)

router.get('/products/renderxml', renderXml)

//create QR Code
router.get('/createQR', createQR)

// router.post('/products', getProducts)
// router.put('/products', getProducts)
// router.delete('/products', getProducts)

export default router
