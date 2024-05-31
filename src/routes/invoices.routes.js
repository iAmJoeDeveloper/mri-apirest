import { Router } from 'express'
import { getInvoices, createInvoice, getBatchOfInvoices } from '../controllers/invoices.controller'

const router = Router()

router.get('/batch/:invoice1/:invoice2', getBatchOfInvoices)

router.get('/invoices', getInvoices)

router.get('/createInvoice', createInvoice)

export default router
