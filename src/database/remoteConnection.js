import sql from 'mssql'

const dbSettings = {
	user: 'mriuser01',
	password: 'Bluemall_2',
	server: 'localhost',
	database: 'MRITEST',
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
