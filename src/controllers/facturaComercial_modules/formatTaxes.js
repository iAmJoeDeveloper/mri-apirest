import { getItems } from '../facturaComercial.controller'
import { compareTaxCode } from '../../utils/compareTaxCode'

// Filter taxes by parent
const filterTaxes = async (invoiceNum, req, res) => {
	const items = await getItems(invoiceNum)

	//Filtering
	function filterTaxesByParent(item) {
		if (item.parent != null) {
			return true
		}
		return false
	}

	const arrTaxesFilteredByParent = items.filter(filterTaxesByParent)

	return arrTaxesFilteredByParent
}

//---------------------------

// Format Taxes
const formatTax = async (invoiceNum, req, res) => {
	const items = await getItems(invoiceNum)
	const arrTaxesFilteredByParent = await filterTaxes(invoiceNum)
	let totalAmount = 0

	const taxesGrouped = []

	const initializeAmounts = () => ({
		CD: { 2: { amount: 0, base: 0, qualifier: '' } },
		CT: { 2: { amount: 0, base: 0, qualifier: '' } },
		ED: { 18: { amount: 0, base: 0, qualifier: '' } },
		EP: { 18: { amount: 0, base: 0, qualifier: '' } },
		HD: { 18: { amount: 0, base: 0, qualifier: '' } },
		HP: { 18: { amount: 0, base: 0, qualifier: '' } },
		ID: { 18: { amount: 0, base: 0, qualifier: '' } },
		IM: { 18: { amount: 0, base: 0, qualifier: '' } },
		IP: { 18: { amount: 0, base: 0, qualifier: '' } },
		IS: { 10: { amount: 0, base: 0, qualifier: '' } },
		IX: { 18: { amount: 0, base: 0, qualifier: '' } },
		MD: { 18: { amount: 0, base: 0, qualifier: '' } },
		OD: { 18: { amount: 0, base: 0, qualifier: '' } },
		OP: { 18: { amount: 0, base: 0, qualifier: '' } },
		PD: { 18: { amount: 0, base: 0, qualifier: '' } },
		PP: { 18: { amount: 0, base: 0, qualifier: '' } },
		SD: { 18: { amount: 0, base: 0, qualifier: '' } },
		SP: { 18: { amount: 0, base: 0, qualifier: '' } },
		ST: { 10: { amount: 0, base: 0, qualifier: '' } },
	})

	const amounts = initializeAmounts()

	//Filter Parent Product
	function filterParents(item) {
		if (item.parent == null) {
			return true
		}
		return false
	}
	const arrFilterParents = items.filter(filterParents)

	// Setting Amount
	arrTaxesFilteredByParent.forEach((item) => {
		const type = item.type2
		const rate = item.rate

		if (amounts[type] && amounts[type][rate] !== undefined) {
			amounts[type][rate].amount += item.amount
			amounts[type][rate].qualifier = item.qualifier // Assign qualifier
		}

		// Setting Base
		arrFilterParents.forEach((itemParent) => {
			const type = item.type2
			const rate = item.rate

			if (amounts[type] && amounts[type][rate] !== undefined) {
				if (item.parent == itemParent.tranid) amounts[type][rate].base += itemParent.amount
			}
		})
	})

	// Pushing object to taxesGrouped array
	for (const type in amounts) {
		for (const rate in amounts[type]) {
			if (amounts[type][rate].amount > 0) {
				taxesGrouped.push({
					type2: type,
					rate: rate,
					base: amounts[type][rate].base,
					amount: amounts[type][rate].amount,
					qualifier: amounts[type][rate].qualifier,
				})
			}
		}
	}

	// Adding Taxes to json format
	const taxesFormated = taxesGrouped.map((item) => {
		totalAmount += item.amount

		return {
			Tax: {
				_attributes: {
					Type: compareTaxCode(item.type2),
					Rate: item.rate,
					Base: item.base.toFixed(2),
					Amount: item.amount.toFixed(2),
					Qualifier: item.qualifier,
				},
			},
		}
	})

	return [taxesFormated, totalAmount]
}

//---------------------------
export { formatTax, filterTaxes }
