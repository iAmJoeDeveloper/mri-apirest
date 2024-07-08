import { compareTaxCode } from '../../utils/compareTaxCode'

// Tax Linkage
const taxLinked = (productTranid, arrTaxes, productBase) => {
	let arraicito = []
	arrTaxes.map((tax) => {
		if (tax.parent == productTranid) {
			arraicito.push({
				_attributes: {
					Type: compareTaxCode(tax.type2),
					Rate: tax.rate,
					Base: productBase,
					Amount: tax.amount,
					Qualifier: tax.qualifier,
				},
			})
		}
	})

	return arraicito
}

export { taxLinked }
