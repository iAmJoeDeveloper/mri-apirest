import { compareTaxCode } from '../../utils/compareTaxCode'
import { compareQualifier } from '../../utils/compareQualifier'

// Tax Linkage
const exentLinked = (productTranid, arrTaxes, productBase) => {
	let arraicito = []

	arrTaxes.map((tax) => {
		const taxincluded = tax.taxincluded.replaceAll(' ', '')

		if (taxincluded == 'E' && tax.tranid == productTranid) {
			arraicito.push({
				_attributes: {
					Type: 'EXENTO',
					Rate: '0.00',
					Base: productBase,
					Amount: '0.00',
				},
			})
		}
	})

	return arraicito
}

export { exentLinked }
