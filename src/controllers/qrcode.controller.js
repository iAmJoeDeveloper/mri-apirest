import fs from 'fs'
import QRCode from 'qrcode'

//Enlances
const test = 'https://ecf.dgii.gov.do/testecf/ConsultaTimbre?'
const certificación = 'https://ecf.dgii.gov.do/certecf/ConsultaTimbre?'
const producción = 'https://ecf.dgii.gov.do/ecf/ConsultaTimbre?'
const RNCEmisor = ''
const RncComprador = ''
const ENCF = ''
const fechaEmision = '22-12-1993'
const MontoTotal = '' //(En DOP)
const FechaFirma = '' //(dd-mm-aaaa hh:mm:ss entre fecha y hora se debe colocar %20 que representa un espacio en HTML)
const codigoSeguridad = '123456' //los 6 primeros dígitos de la firma digital

export const createQR = async (req, res) => {
	const formato = `${test}${certificación}${fechaEmision}${codigoSeguridad}`
	const QR = await QRCode.toDataURL(formato)

	const htmlContent = `<div><img src="${QR}"></div>`

	fs.writeFileSync('./QRcode.html', `${htmlContent}`)
}
