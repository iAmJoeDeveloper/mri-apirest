import sql from 'mssql'

const dbSettings = {
	user: 'joedev',
	password: '12345678',
	server: 'localhost',
	database: 'Test',
	options: {
		encrypt: true,
		trustServerCertificate: true,
	},
}

export async function getConnection() {
	try {
		const pool = await sql.connect(dbSettings)
		return pool
	} catch (error) {
		console.log(error)
	}
}
