import { getConnection } from '../database/remoteConnection'
import { json2xml, xml2json } from 'xml-js'
import fs from 'fs'

export const getBatchOfInvoices = async (req, res) => {
	const invoice1 = req.params.invoice1
	const invoice2 = req.params.invoice2

	const queryStructure = `SELECT invoice AS ref
	,(
		SELECT EXCHRATE
		FROM CURREXCH
		WHERE EXCHGREF = '00002758'
		) AS ExchangeRate
	,tipoingreso = '2 - IngresosFinancieros'
	,tipopago = '2 - Credito'
	,cif = (
		SELECT PHONE
		FROM entity
		WHERE entityid IN (
				SELECT ENTITYID
				FROM BLDG
				WHERE BLDGID = CMLEDG.BLDGID
				)
		)
	,company = (
		SELECT NAME
		FROM entity
		WHERE entityid IN (
				SELECT ENTITYID
				FROM BLDG
				WHERE BLDGID = CMLEDG.BLDGID
				)
		)
	,address = (
		SELECT ADDR1
		FROM entity
		WHERE entityid IN (
				SELECT ENTITYID
				FROM BLDG
				WHERE BLDGID = CMLEDG.BLDGID
				)
		)
	,city = (
		SELECT CITY
		FROM entity
		WHERE entityid IN (
				SELECT ENTITYID
				FROM BLDG
				WHERE BLDGID = CMLEDG.BLDGID
				)
		)
	,country = 'DOM'
	,type = 'Phone'
	,number = (
		SELECT PHONENO
		FROM BLDG
		WHERE BLDGID = CMLEDG.BLDGID
		)
	,cliente_cif = (
		SELECT RNC
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
	,company2 = (
		SELECT DBA
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
	,address = (
		SELECT ADDRESS
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
	,city = (
		SELECT CITY
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
	,country = 'DOM'

FROM cmledg 
WHERE invoice BETWEEN '${invoice1}' AND '${invoice2}' GROUP BY INVOICE,BLDGID, LEASID
ORDER BY invoice`

	const pool = await getConnection()
	const result = await pool.request().query(queryStructure)

	res.json(result.recordset)
}

export const getInvoices = async (req, res) => {
	const invoiceNum = '012311'

	const queryStructure = `
    SELECT TOP 1 invoice AS ref,
	tranid,
	parenttranid AS parent,
	refnmbr,
    trandate AS date,
    currcode AS currency,
    rtaxgrpid AS taxincluded,
    govinvc AS ncf,
    (
        SELECT TOP 1 vigencia 
        FROM numerofactura 
        WHERE entityid IN (
            SELECT entityid 
            FROM bldg 
            WHERE bldgid = cmledg.bldgid
            )
    ) AS ncfexpirationdate,
    (
		SELECT exchrate
		FROM currexch
		WHERE exchgref = '00002758'
	) AS exchangerate,
    tipoingreso = '2 - IngresosFinancieros',
	tipopago = '2 - Credito',
    linesperprintedpage = '',
	supplierid = '',
    cif = (
		SELECT phone
		FROM entity
		WHERE entityid IN (
				SELECT entityid
				FROM bldg
				WHERE bldgid = cmledg.bldgid
				)
		),
    company = (
        SELECT name
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    address = (
        SELECT addr1
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    city = (
        SELECT city
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    country = 'DOM',
    type = 'Phone',
    number = (
		SELECT phoneno
		FROM bldg
		WHERE bldgid = cmledg.bldgid
		),
    cliente_cif = (
        SELECT rnc
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    company = (
        SELECT dba
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    address = (
        SELECT address
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    city = (
        SELECT city
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    country = 'DOM',
    inccat,
    item = (
		SELECT descrptn
		FROM inch
		WHERE inccat = cmledg.inccat
		),
    qty = '1',
    up = TRANAMT,
    total = '',
    netamount = '',
    syslinetype = 'GenericServices',
	type = (
		SELECT rtaxid
		FROM rtax
		WHERE inccat = cmledg.inccat
	),
	base = '',
	rate = (
		SELECT rtaxperc
		FROM rtax
		WHERE inccat = cmledg.inccat
	),
	amount = tranamt,
	Qualifier = ''
    FROM cmledg 
    WHERE leasid=000007
    AND govinvc = 'B0100015859'`

	const pool = await getConnection()
	const result = await pool.request().query(queryStructure)

	//console.log('Esto es el recordset: ' + result.recordset)
	//const respuesta = res.json(result.recordset)

	// return res.json(result.recordset)
	//res.json(result.recordset)

	return result.recordset
}

export const getItems = async (req, res) => {
	const queryItems = `
    SELECT invoice AS ref,
	tranid,
	parenttranid AS parent,
	refnmbr,
    trandate AS date,
    currcode AS currency,
    rtaxgrpid AS taxincluded,
    govinvc AS ncf,
    (
        SELECT TOP 1 vigencia 
        FROM numerofactura 
        WHERE entityid IN (
            SELECT entityid 
            FROM bldg 
            WHERE bldgid = cmledg.bldgid
            )
    ) AS ncfexpirationdate,
    (
		SELECT exchrate
		FROM currexch
		WHERE exchgref = '00002758'
	) AS exchangerate,
    tipoingreso = '2 - IngresosFinancieros',
	tipopago = '2 - Credito',
    linesperprintedpage = '',
	supplierid = '',
    cif = (
		SELECT phone
		FROM entity
		WHERE entityid IN (
				SELECT entityid
				FROM bldg
				WHERE bldgid = cmledg.bldgid
				)
		),
    company = (
        SELECT name
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    address = (
        SELECT addr1
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    city = (
        SELECT city
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    country = 'DOM',
    type = 'Phone',
    number = (
		SELECT phoneno
		FROM bldg
		WHERE bldgid = cmledg.bldgid
		),
    cliente_cif = (
        SELECT rnc
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    company = (
        SELECT dba
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    address = (
        SELECT address
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    city = (
        SELECT city
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    country = 'DOM',
    inccat,
    item = (
		SELECT descrptn
		FROM inch
		WHERE inccat = cmledg.inccat
		),
    qty = '1',
    up = TRANAMT,
    total = '',
    netamount = '',
    syslinetype = 'GenericServices',
	type = (
		SELECT rtaxid
		FROM rtax
		WHERE inccat = cmledg.inccat
	),
	base = '',
	rate = (
		SELECT rtaxperc
		FROM rtax
		WHERE inccat = cmledg.inccat
	),
	amount = tranamt,
	Qualifier = ''
    FROM cmledg 
    WHERE leasid=000007
    AND govinvc = 'B0100015859'`

	const pool = await getConnection()
	const items = await pool.request().query(queryItems)

	// console.log(result.recordset)
	// res.json(result.recordset)

	// -----------------------------------------

	return items.recordset
}

export const createInvoice = async (req, res) => {
	//Calls
	// const bathcOfInvoices = await getBatchOfInvoices()
	const invoicesJson = await getInvoices()
	const taxesFormated = await formatTax()
	const productsFormated = await filterProducts()

	// NUEVO
	// batchInvoices.map((invoice)=>{
	// 	const invoiceJson = await getInvoices(invoice.ref)
	// })

	//************

	//Run
	const batchInvoices = invoicesJson.map((invoice) => {
		const invoiceDate = new Date(invoice.date)
		const invoiceExpirationDate = new Date(invoice.ncfexpirationdate)

		const template = {
			_declaration: {
				_attributes: {
					version: '1.0',
				},
			},
			Transaction: {
				_attributes: {
					'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
					'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				},
				GeneralData: {
					_attributes: {
						ref: invoice.ref,
						Type: 'FacturaComercial',
						Date:
							invoiceDate.getFullYear() +
							'-' +
							invoiceDate.getMonth() +
							'-' +
							invoiceDate.getDate(),
						Currency: invoice.currency,
						NCF: invoice.ncf,
						NCFExpirationDate:
							invoiceExpirationDate.getFullYear() +
							'-' +
							invoiceExpirationDate.getMonth() +
							'-' +
							invoiceExpirationDate.getDate(),
						TaxIncluded: 'false',
					},
					PublicAdministration: {
						DOM: {
							_attributes: {
								TipoIngreso: invoice.tipoingreso,
								TipoPago: invoice.tipopago,
								LinesPerPrintedPage: '',
							},
						},
					},
				},
				Supplier: {
					_attributes: {
						SupplierID: '',
						Email: '',
						CIF: invoice.cif,
						Company: invoice.company,
						Address: invoice.address,
						City: invoice.city,
						PC: '',
						Province: '',
						Country: 'DOM',
					},
				},
				Client: {
					_attributes: {
						CIF: invoice.cliente_cif,
						Email: '',
						Company: invoice.company,
						Address: invoice.address,
						City: invoice.city,
						PC: '',
						Province: '',
						Country: 'DOM',
					},
				},
				References: {
					Reference: {
						_attributes: {
							PORef: '',
						},
					},
				},
				ProductList: [
					{
						//Must be Multiple ⚠️
						Product: productsFormated.map((item) => {
							return item.Product
						}),
					},
				],

				DueDates: {
					DueDate: {
						_attributes: {
							PaymentID: 'Venta a Credito',
							Amount: '48888.36',
							Date: '2019-03-22',
						},
					},
				},
				TaxSummary: [
					{
						//Multiple
						// Tax: [
						// 	{
						// 		_attributes: {
						// 			Type: 'ITBIS',
						// 			Rate: '18.00',
						// 			Base: '1602.00',
						// 			Amount: '288.36',
						// 		},
						// 	},
						// 	{
						// 		_attributes: {
						// 			Type: '',
						// 			Rate: '',
						// 			Base: '',
						// 			Amount: '',
						// 		},
						// 	},
						// ],
						Tax: taxesFormated.map((item) => {
							return item.Tax
						}),
					},
				],
				TotalSummary: {
					_attributes: {
						GrossAmount: '',
						Discounts: '',
						SubTotal: '',
						Tax: '',
						Total: '',
					},
				},
			},
		}

		const json = JSON.stringify(template)
		const formatoXml = json2xml(json, { compact: true, spaces: 4 })
		//Mostrar factura por consola
		console.log(formatoXml)

		//Exportar en archivo XML
		fs.writeFile(
			`FacturaComercial_${invoice.ref}_${invoice.inccat}.xml`,
			formatoXml,
			function (error) {
				if (error) {
					return console.log(error)
				}
			}
		)

		return formatoXml
	})

	res.json(batchInvoices)
}

//----------------- MODULES --------------
//TAX LINKAGE
const taxLinked = (productTranid, arrTaxes, productBase) => {
	let arraicito = []
	arrTaxes.map((tax) => {
		if (tax.parent == productTranid) {
			arraicito.push({
				_attributes: { Type: tax.type, Rate: tax.rate, Base: productBase, Amount: tax.amount },
			})
		}
	})

	return arraicito
}
// ----------------

//FILTER TAXES
const filterTaxes = async (req, res) => {
	const items = await getItems()

	//Filtrar Impuestos
	function filterTaxesByParent(item) {
		if (item.parent != null) {
			return true
		}
		return false
	}

	const arrTaxesFilteredByParent = items.filter(filterTaxesByParent)

	return arrTaxesFilteredByParent
}

//FORMAT TAXES
const formatTax = async (req, res) => {
	const arrTaxesFilteredByParent = await filterTaxes()
	// Agregar Taxes a formato json
	const taxesFormated = arrTaxesFilteredByParent.map((item) => {
		return {
			Tax: {
				_attributes: {
					Type: item.type,
					Rate: item.rate,
					Base: item.base,
					Amount: item.amount,
				},
			},
		}
	})

	return taxesFormated
}
//---------------------------

//FILTER PRODUCTS
const filterProducts = async (req, res) => {
	const items = await getItems()
	const arrTaxesFilteredByParent = await filterTaxes()

	//Filtrar Productos
	function filterProductsByParent(item) {
		if (item.parent == null) {
			return true
		}
		return false
	}

	const arrProductsFilteredByParent = items.filter(filterProductsByParent)

	// Agregar Productos a formato json
	const productsFormated = arrProductsFilteredByParent.map((item) => {
		return {
			Product: {
				_attributes: {
					supplierSKU: '',
					EAN: '',
					item: item.item,
					Qty: '1',
					MU: '',
					UP: item.up,
					CU: '',
					Total: item.qty * item.up,
					NetAmount: item.amount,
					SysLineType: item.syslinetype,
				},
				Discounts: {
					Discount: '',
				},
				Taxes: [
					{
						Tax: taxLinked(item.tranid, arrTaxesFilteredByParent, item.amount),
					},
				],
			},
		}
	})

	return productsFormated
}
