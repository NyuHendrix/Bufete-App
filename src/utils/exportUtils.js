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

export function exportToPDF({ titulo, subtitulo, columnas, filas, nombre }) {
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
  doc.save(`${nombre}.pdf`)
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
