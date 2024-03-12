import sql from 'mssql'

const dbSettings = {
	user: 'mriuser01',
	password: 'Bluemall_2',
	server: '172.24.1.248',
	database: 'MRITEST',
	options: {
		encrypt: false,
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
