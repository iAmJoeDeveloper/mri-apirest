import { Router } from 'express'
import { getInvoices, createInvoice } from '../controllers/invoices.controller'

const router = Router()

router.get('/invoices', getInvoices)

router.get('/createInvoice', createInvoice)

export default router
