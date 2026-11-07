import { Download, Mail, MessageCircle, Printer } from 'lucide-react'
import { exportPaymentInvoicePDF, printPaymentInvoice } from '../../utils/exportUtils'
import { formatCRC, formatDateCR } from '../../utils/formatters'

const telefonoWhatsApp = (telefono) => {
  const numero = String(telefono || '').replace(/\D/g, '')
  if (numero.length === 8) return `506${numero}`
  return numero
}

export default function PaymentInvoiceActions({ pago, cliente, onListo }) {
  const nombre = cliente?.nombre || 'Cliente'
  const numeroFactura = pago.id ?? 'N/D'
  const monto = formatCRC(pago.montoPagado || 0)
  const fecha = formatDateCR(pago.fecha)
  const asunto = `Comprobante de pago #${numeroFactura}`
  const mensaje = `Estimado/a ${nombre}: registramos su pago de ${monto} el ${fecha} por concepto de ${pago.concepto || 'servicios profesionales'}. Saldo pendiente: ${formatCRC((pago.monto || 0) - (pago.montoPagado || 0))}. Puede adjuntar el comprobante PDF a este mensaje.`
  const correo = cliente?.email
  const telefono = telefonoWhatsApp(cliente?.telefono)
  const mensajeWhatsApp = `${mensaje} Factura #${numeroFactura}.`
  const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeWhatsApp)}`

  return (
    <>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={() => printPaymentInvoice({ pago, cliente })}>
          <Printer size={16} /> Imprimir
        </button>
        <button type="button" className="btn-primary" onClick={() => exportPaymentInvoicePDF({ pago, cliente })}>
          <Download size={16} /> Descargar PDF
        </button>
        <a
          className={`btn-secondary ${correo ? '' : 'pointer-events-none opacity-50'}`}
          href={correo ? `mailto:${encodeURIComponent(correo)}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}` : undefined}
          aria-disabled={!correo}
          title={correo ? 'Preparar correo con los datos del pago' : 'El cliente no tiene correo registrado'}
        >
          <Mail size={16} /> Correo
        </a>
        <a
          className={`btn-secondary ${telefono ? '' : 'pointer-events-none opacity-50'}`}
          href={telefono ? whatsappUrl : undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!telefono}
          title={telefono ? 'Compartir los datos del pago por WhatsApp' : 'El cliente no tiene teléfono registrado'}
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
        {onListo && <button type="button" className="btn-secondary" onClick={onListo}>Listo</button>}
      </div>
      <p className="mt-3 text-right text-xs text-slate-500">Descargue el PDF para adjuntarlo al correo o WhatsApp.</p>
    </>
  )
}