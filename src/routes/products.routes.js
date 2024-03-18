import { Router } from 'express'
import {
	getProducts,
	xmlTest,
	xmlReal,
	renderXml,
	convertXmlToJson,
} from '../controllers/products.controller'
import { createQR } from '../controllers/qrcode.controller'

const router = Router()

router.get('/products', getProducts)

router.get('/products/xmlTest', xmlTest)
router.get('/products/xmlReal', xmlReal)

//convertXmlToJson
router.get('/renderXml', renderXml)
router.get('/convertXmlToJson', convertXmlToJson)

//create QR Code
router.get('/createQR', createQR)

// router.post('/products', getProducts)
// router.put('/products', getProducts)
// router.delete('/products', getProducts)

export default router
