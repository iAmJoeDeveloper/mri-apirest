import { Router } from 'express'
import {
	getHeaders,
	createInvoice,
	getBatchOfInvoices,
	sendInvoices,
} from '../controllers/ar_invoices.controller'

const router = Router()

router.get('/arinvoices/:invoice1/:invoice2/:createInvoice?', getBatchOfInvoices)

export default router
