import { getConnection } from '../database/remoteConnection'
import { json2xml, xml2json } from 'xml-js'
import fs from 'fs'

export const getInvoices = async (req, res) => {
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

	// console.log(result.recordset)
	// res.json(result.recordset)

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

	//Filtrar Productos
	function filterProductsByParent(item) {
		if (item.parent == null) {
			return true
		}
		return false
	}

	const arrProductsFilteredByParent = items.recordset.filter(filterProductsByParent)

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
					Total: '',
					NetAmount: '',
					SysLineType: item.syslinetype,
				},
				Discounts: {
					Discount: '',
				},
				Taxes: {
					Tax: {
						_attributes: {
							Type: '',
							Rate: '',
							Base: '',
							Amount: '',
						},
					},
				},
			},
		}
	})

	// -----------------------------------------

	//Filtrar Impuestos
	function filterTaxesByParent(item) {
		if (item.parent != null) {
			return true
		}
		return false
	}

	const arrTaxesFilteredByParent = items.recordset.filter(filterTaxesByParent)

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

	// -----------------------------------------

	return [productsFormated, taxesFormated]
}

export const createInvoice = async (req, res) => {
	const invoicesJson = await getInvoices()
	const [productsFormated, taxesFormated] = await getItems()

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
						// Product: [
						// 	{
						// 		_attributes: {
						// 			SupplierSKU: '',
						// 			EAN: '',
						// 			Item: invoice.item,
						// 			Qty: invoice.qty,
						// 			MU: '',
						// 			UP: invoice.tranamt,
						// 			CU: '',
						// 			Total: invoice.total,
						// 			NetAmount: invoice.netamount,
						// 			SysLineType: invoice.syslinetype,
						// 		},
						// 		//No aplica
						// 		Discounts:
						// 			//Shoul be multiple
						// 			{
						// 				Discount: {
						// 					// _attributes: {
						// 					// 	Qualifier: 'Descuento',
						// 					// 	Type: 'Comercial',
						// 					// 	Rate: '10.00',
						// 					// 	Amount: '180.00',
						// 					// },
						// 				},
						// 			},
						// 		Taxes: {
						// 			Tax: {
						// 				_attributes: {
						// 					Type: invoice.type,
						// 					Rate: invoice.rate,
						// 					Base: '',
						// 					Amount: invoice.amount,
						// 				},
						// 			},
						// 		},
						// 	},
						// ],
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
		// console.log(formatoXml)

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

	res.send(batchInvoices)
}
