function compareQualifier(tax) {
	const qualifierMap = {
		ITBIS: '',
		EXENTO: '',
		CDT: '002',
		ISC: '004',
	}

	let cleanTax = tax.replaceAll(' ', '')

	return qualifierMap[cleanTax] || null
}

export { compareQualifier }
