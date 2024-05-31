import { getConnection } from '../database/remoteConnection'
import fs from 'fs'

export const getProducts = async (req, res) => {
	const ncf = req.params.ncf

	const queryStructure = `
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
    AND govinvc='B0100015859'`

	const pool = await getConnection()
	const result = await pool.request().query(queryStructure)

	//console.log('Esto es el recordset: ' + result.recordset)
	//const respuesta = res.json(result.recordset)

	//return res.json(result.recordset)
	res.json(result.recordset)

	//return result.recordset
}

//Render xml Template
export const renderXml = async (req, res) => {
	res.sendFile(__dirname + '/Formatos/ficheroFactura.xml')
}
