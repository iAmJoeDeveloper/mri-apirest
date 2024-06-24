function sanitizeCompanyName(companyName) {
	return companyName.replace(/&/g, '&amp;')
}

export { sanitizeCompanyName }
