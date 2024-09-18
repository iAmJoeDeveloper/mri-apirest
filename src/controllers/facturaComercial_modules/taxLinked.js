import { compareTaxCode } from '../../utils/compareTaxCode'
import { compareQualifier } from '../../utils/compareQualifier'

// Tax Linkage
const taxLinked = (productTranid, arrTaxes, productBase) => {
	let arraicito = []
	arrTaxes.map((tax) => {
		if (tax.parent == productTranid) {
			arraicito.push({
				_attributes: {
					Type: compareTaxCode(tax.type2),
					Rate: tax.rate,
					Base: Math.abs(productBase),
					Amount: Math.abs(tax.amount),
					Qualifier: compareQualifier(tax.qualifier),
				},
			})
		}
	})

	return arraicito
}

export { taxLinked }
