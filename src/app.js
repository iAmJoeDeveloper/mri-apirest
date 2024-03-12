import express from 'express'
import config from './config'

import productsRoutes from './routes/products.routes'
import invoicesRoutes from './routes/invoices.routes'

const app = express()

//settings
app.set('port', config.port)

app.use(productsRoutes, invoicesRoutes)

export default app
