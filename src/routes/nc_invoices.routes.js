import { Router } from 'express'
import { getBatchOfInvoices } from '../controllers/nc_invoices.controller'

const router = Router()

router.get('/ncinvoices/:invoice1/:invoice2/:createInvoice?', getBatchOfInvoices)

export default router
