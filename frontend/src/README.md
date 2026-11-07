# LexCR — Sistema de Gestión para Bufetes de Abogados y Notarías

Aplicación web profesional (React 18 + Vite + json-server) para administrar citas,
clientes, cobros en colones (CRC), gastos y reportes exportables. Zona horaria: America/Costa_Rica.

## Instalación

\`\`\`bash
npm install
\`\`\`

## Ejecución (terminal 1: API / terminal 2: frontend)

\`\`\`bash
npm run server   # API local en http://localhost:3001
npm run dev        # Vite en http://localhost:5173 (proxy /api → 3001)
\`\`\`

O en una sola terminal: \`npm start\` (levanta ambos con concurrently).

El servidor agrega rutas validadas de expedientes y conserva `json-server` para
clientes, citas, pagos y gastos.

## Funcionalidades

- **Dashboard**: estadísticas en vivo, alertas (citas &lt;24h, pagos vencidos +30 días,
  conflictos de agenda), gráfico SVG de flujo de caja (6 meses) y actividad reciente.
- **Citas**: calendario mensual con navegación, agenda diaria, creación/edición con
  **validación anti-conflictos** que bloquea horarios traslapados, recordatorios con badge.
- **Clientes**: CRUD completo, búsqueda por nombre/cédula/correo, ficha con historial
  de citas y pagos y estado de cuenta.
- **Expedientes**: CRUD vinculado a clientes por `clientId`, con partes involucradas,
  validación de estados/prioridades, filtros, búsqueda, orden y paginación.
- **Pagos (CRC)**: cobros con estados Pagado/Parcial/Pendiente, métodos (Efectivo,
  Transferencia SINPE, SINPE Móvil, Tarjeta), filtros por período/estado/cliente,
  resaltado de vencidos +30 días.
- **Reportes**: vista previa + exportación a **PDF**, **Excel (.xlsx)** y **Word (.docx)**
  con plantillas (contrato de servicios, carta de recordatorio, poder especial).

## Moneda y fechas

- Colones costarricenses: ₡1.250.000,00 (Intl.NumberFormat 'es-CR', currency CRC).
- Toda fecha se interpreta en la zona horaria America/Costa_Rica.

## Datos de ejemplo

\`db.json\` incluye 18 clientes costarricenses con cédulas, 42 citas (sept–oct 2026),
30 cobros mixtos y 10 gastos operativos realistas.

## API de expedientes

El servicio `src/services/cases.service.js` expone `getAll`, `getById`, `create`,
`update` y `delete`. `getAll` admite `page`, `perPage` (máximo 100), `legalBranch`,
`status`, `priority`, `search`, `sortBy` y `sortOrder` (`asc` o `desc`). La respuesta
de listado contiene `{ data, total, page, perPage, totalPages }`; la búsqueda revisa
solo el ID y el título. Al crear, se genera un ID `EXP-AAAA-NNNN` si no se proporciona
y se comprueba que `clientId` corresponda a un cliente existente.