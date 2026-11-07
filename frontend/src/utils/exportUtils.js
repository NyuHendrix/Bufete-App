// Exportaciones PDF (jsPDF), Excel (SheetJS) y Word (docx)
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { formatCRC, formatDateCR } from './formatters'

/* ---------------- PDF ---------------- */

/**
 * jsPDF usa fuentes con codificación WinAnsi: el signo ₡ (y algunos otros
 * caracteres Unicode) NO existe ahí y hace fallar la exportación en silencio.
 * Esta función los sustituye por equivalentes seguros.
 */
const REEMPLAZOS = {
  '₡': 'CRC ', '\u202F': ' ', '\u00A0': ' ',
  '\u2013': '-', '\u2014': '-',
  '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
  '\u2026': '...', '\u2192': '->',
}
const pdfSafe = (v) =>
  String(v ?? '').replace(
    /[₡\u202F\u00A0\u2013\u2014\u2018\u2019\u201C\u201D\u2026\u2192]/g,
    (ch) => REEMPLAZOS[ch] ?? ch
  )

export function exportToPDF({ titulo, subtitulo, columnas, filas, nombre, totales }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt' })
  doc.setFontSize(16)
  doc.setTextColor(31, 41, 55)
  doc.text(pdfSafe(titulo), 40, 50)
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(
    pdfSafe(`${subtitulo} — Generado: ${formatDateCR(new Date().toISOString().slice(0, 10), { dateStyle: 'medium' })}`),
    40, 68
  )
  autoTable(doc, {
    startY: 85,
    head: [columnas.map((c) => pdfSafe(c.header))],
    body: filas.map((f) => columnas.map((c) => pdfSafe(f[c.key]))),
    styles: { fontSize: 8.5, cellPadding: 5 },
    headStyles: { fillColor: [39, 76, 228] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })
  if (totales) {
    let y = doc.lastAutoTable.finalY + 22
    if (y > 760) {
      doc.addPage()
      y = 40
    }
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text(doc.splitTextToSize(pdfSafe(totales), 515), 40, y)
  }
  doc.save(`${nombre}.pdf`)
}

const nombreSeguro = (valor) => String(valor || 'cliente').replace(/[^a-z0-9_-]/gi, '_')

export function exportPaymentInvoicePDF({ pago, cliente }) {
  const doc = new jsPDF({ unit: 'pt' })
  const margen = 48
  const numero = pago.id ?? 'N/D'
  let y = 58

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(31, 41, 55)
  doc.text('FACTURA / COMPROBANTE DE PAGO', margen, y)
  y += 24
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(pdfSafe(`${BRAND} · Factura #${numero}`), margen, y)

  autoTable(doc, {
    startY: y + 24,
    theme: 'plain',
    body: [
      [pdfSafe('Cliente'), pdfSafe(cliente.nombre || 'Cliente')],
      [pdfSafe('Cédula'), pdfSafe(cliente.cedula || 'No registrada')],
      [pdfSafe('Correo'), pdfSafe(cliente.email || 'No registrado')],
      [pdfSafe('Concepto'), pdfSafe(pago.concepto || 'Servicios profesionales')],
      [pdfSafe('Fecha de pago'), pdfSafe(formatDateCR(pago.fecha))],
      [pdfSafe('Método de pago'), pdfSafe(pago.metodo || 'No registrado')],
      [pdfSafe('Monto del servicio'), pdfSafe(formatCRC(pago.monto))],
      [pdfSafe('Monto recibido'), pdfSafe(formatCRC(pago.montoPagado))],
      [pdfSafe('Saldo pendiente'), pdfSafe(formatCRC((pago.monto || 0) - (pago.montoPagado || 0)))],
    ],
    styles: { fontSize: 10, cellPadding: 8 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 140, textColor: [71, 85, 105] } },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })

  const notas = pago.notas?.trim()
  if (notas) {
    const notaY = doc.lastAutoTable.finalY + 24
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(71, 85, 105)
    doc.text('Notas', margen, notaY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(31, 41, 55)
    doc.text(doc.splitTextToSize(pdfSafe(notas), 500), margen, notaY + 16)
  }

  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('Comprobante interno de pago. No sustituye la factura electrónica tributaria.', margen, 770)
  doc.save(`factura-${numero}-${nombreSeguro(cliente.nombre)}.pdf`)
}

const escaparHTML = (valor) => String(valor ?? '').replace(/[&<>"']/g, (caracter) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[caracter]))

export function printReport({ titulo, subtitulo, columnas, filas, totales }) {
  const ventana = window.open('', '_blank', 'width=1000,height=750')
  if (!ventana) {
    window.alert('Permita las ventanas emergentes para imprimir el reporte.')
    return
  }

  const encabezados = columnas.map((columna) => `<th>${escaparHTML(columna.header)}</th>`).join('')
  const filasHTML = filas.map((fila) => `<tr>${columnas.map((columna) => `<td>${escaparHTML(fila[columna.key])}</td>`).join('')}</tr>`).join('')
  ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escaparHTML(titulo)}</title>
    <style>
      body{font:13px Arial,sans-serif;color:#1f2937;margin:36px auto;max-width:1100px;padding:0 24px}
      h1{font-size:20px;margin:0 0 6px}p{color:#64748b;margin:0 0 22px}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #dbe2ea;padding:8px;text-align:left}
      th{background:#f1f5f9;font-weight:700}tr:nth-child(even){background:#f8fafc}
      footer{border-top:1px solid #dbe2ea;margin-top:18px;padding-top:12px;font-weight:600}
      @media print{body{margin:0;padding:0 8px}thead{display:table-header-group}tr{break-inside:avoid}}
    </style></head><body><h1>${escaparHTML(titulo)}</h1><p>${escaparHTML(subtitulo)}</p>
    <table><thead><tr>${encabezados}</tr></thead><tbody>${filasHTML}</tbody></table>
    ${totales ? `<footer>${escaparHTML(totales)}</footer>` : ''}
    <script>window.onload=()=>window.print()</script></body></html>`)
  ventana.document.close()
}

export function printPaymentInvoice({ pago, cliente }) {
  const ventana = window.open('', '_blank', 'width=850,height=700')
  if (!ventana) {
    window.alert('Permita las ventanas emergentes para imprimir la factura.')
    return
  }

  const numero = pago.id ?? 'N/D'
  const filas = [
    ['Cliente', cliente.nombre || 'Cliente'],
    ['Cédula', cliente.cedula || 'No registrada'],
    ['Correo', cliente.email || 'No registrado'],
    ['Concepto', pago.concepto || 'Servicios profesionales'],
    ['Fecha de pago', formatDateCR(pago.fecha)],
    ['Método de pago', pago.metodo || 'No registrado'],
    ['Monto del servicio', formatCRC(pago.monto)],
    ['Monto recibido', formatCRC(pago.montoPagado)],
    ['Saldo pendiente', formatCRC((pago.monto || 0) - (pago.montoPagado || 0))],
  ]
  const filasHTML = filas.map(([etiqueta, valor]) => `<tr><th>${escaparHTML(etiqueta)}</th><td>${escaparHTML(valor)}</td></tr>`).join('')

  ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Factura ${escaparHTML(numero)}</title>
    <style>
      body{font:14px Arial,sans-serif;color:#1f2937;margin:48px auto;max-width:720px;padding:0 28px}
      h1{font-size:21px;margin:0 0 8px}p{color:#64748b;margin:0 0 26px}
      table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid #e2e8f0;padding:12px;text-align:left}
      th{color:#475569;width:34%;font-weight:600}tr:nth-child(even){background:#f8fafc}
      footer{color:#94a3b8;font-size:11px;margin-top:36px}
      @media print{body{margin:0 auto;padding:0 12px}}
    </style></head><body>
    <h1>FACTURA / COMPROBANTE DE PAGO</h1>
    <p>${escaparHTML(BRAND)} · Factura #${escaparHTML(numero)}</p>
    <table><tbody>${filasHTML}</tbody></table>
    ${pago.notas ? `<p style="margin-top:20px"><strong>Notas:</strong> ${escaparHTML(pago.notas)}</p>` : ''}
    <footer>Comprobante interno de pago. No sustituye la factura electrónica tributaria.</footer>
    <script>window.onload=()=>window.print()</script></body></html>`)
  ventana.document.close()
}

/* ---------------- Excel ---------------- */

export function exportToExcel({ tituloHoja, columnas, filas, nombre }) {
  const data = filas.map((f) =>
    columnas.reduce((acc, c) => ({ ...acc, [c.header]: f[c.key] ?? '' }), {})
  )
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = columnas.map((c) => ({ wch: Math.max(c.header.length, 18) + 6 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, tituloHoja.slice(0, 31))
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([out], { type: 'application/octet-stream' }), `${nombre}.xlsx`)
}

/* ---------------- Word: plantillas ---------------- */

const BRAND = 'Harvey: Bufete & Notaría'
const FOOTER = 'Documento generado automáticamente. Verifique los datos antes de su uso oficial.'

function bloque(parrafos) {
  return parrafos.map(
    (t) =>
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({ text: t, size: 24 })],
      })
  )
}

export async function generarDocumentoWord(tipo, { cliente, montoPendiente = 0 }) {
  let parrafos = []

  if (tipo === 'contrato') {
    parrafos = [
      new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CONTRATO DE SERVICIOS PROFESIONALES', bold: true, size: 28 })] }),
      ...bloque([
        `Entre el Bufete ${BRAND}, representado por su director general, por una parte, y el(la) señor(a) ${cliente.nombre}, cédula ${cliente.cedula}, por la otra, se conviene lo siguiente:`,
        'PRIMERO: OBJETO. El bufete prestará servicios legales relativos al asunto: ' + (cliente.casoDescripcion || 'por definir') + ', tipo de caso: ' + (cliente.tipoCaso || 'N/D') + '.',
        'SEGUNDO: HONORARIOS. Los honorarios profesionales se pactan según lo acordado por escrito en la hoja de encargo, pagaderos en colones costarricenses (CRC).',
        'TERCERO: CONFIDENCIALIDAD. Toda la información recibida será tratada con reserva profesional conforme al Código de Ética del Colegio de Abogados de Costa Rica.',
        `En fe de lo anterior, se firma en San José, Costa Rica, el ${formatDateCR(new Date().toISOString().slice(0, 10), { dateStyle: 'long' })}.`,
      ]),
    ]
  }

  if (tipo === 'carta') {
    parrafos = [
      new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CARTA DE RECORDATORIO DE PAGO', bold: true, size: 28 })] }),
      ...bloque([
        `San José, Costa Rica, ${formatDateCR(new Date().toISOString().slice(0, 10), { dateStyle: 'long' })}`,
        `Estimado(a) ${cliente.nombre}:`,
        `Por medio de la presente le recordamos que mantiene un saldo pendiente con nuestro bufete por concepto de honorarios y servicios legales, por un monto de ${formatCRC(montoPendiente)}.`,
        'Le agradeceremos regularizar dicha situación a la brevedad posible, o comunicarse con nuestra oficina para acordar un plan de pagos.',
        'Agradecemos su atención y quedamos a su orden.',
        'Atentamente,\n' + BRAND,
      ]),
    ]
  }

  if (tipo === 'poder') {
    parrafos = [
      new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PODER ESPECIAL — MODELO', bold: true, size: 28 })] }),
      ...bloque([
        `Yo, ${cliente.nombre}, cédula de identidad número ${cliente.cedula}, en pleno uso de mis facultades, CONFIERO PODER ESPECIAL al despacho ${BRAND}, para que en mi nombre y representación realice trámites, firme documentos y represente mis intereses ante las autoridades competentes.`,
        'El presente poder se otorga de conformidad con el artículo 1255 del Código Civil y queda sujeto a las formalidades notariales correspondientes.',
      ]),
    ]
  }

  parrafos.push(
    new Paragraph({
      spacing: { before: 480 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: FOOTER, italics: true, size: 18, color: '94A3B8' })],
    })
  )

  const doc = new Document({ sections: [{ children: parrafos }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${tipo}-${cliente.nombre.replace(/\s+/g, '_')}.docx`)
}
