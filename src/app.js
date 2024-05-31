import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import config from './config'

import productsRoutes from './routes/products.routes'
import invoicesRoutes from './routes/invoices.routes'
import facturaRoutes from './routes/facturaComercial.routes'

const app = express()

//Middlelwares
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//settings
app.set('port', config.port)

app.use(productsRoutes, invoicesRoutes, facturaRoutes)

export default app
