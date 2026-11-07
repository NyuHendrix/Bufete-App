# Bufete-App
Una app diseñada para la administración y logística empresarial, especialmente dirigida a abogados/as y contadores/as.

## Backend SQL y seguridad

Este proyecto ya no usa `db.json` como base de datos persistente. La información se almacena en SQLite con migraciones y seeders bajo la estructura solicitada.

### Comandos principales

- `npm run db:migrate` - crea/actualiza el esquema SQL.
- `npm run db:seed` - carga datos iniciales y un usuario administrador.
- `npm run server` - levanta la API REST segura en `http://localhost:3001`.
- `npm run dev` - levanta el frontend React en `http://localhost:5173`.
- `npm start` - levanta el backend y el frontend en paralelo.

El frontend consume la API REST de SQLite a través del proxy `/api` de Vite. La capa de servicios adapta los campos `snake_case` del backend al formato `camelCase` usado por React; clientes, citas, pagos, gastos y casos se guardan en la base de datos configurada.

### Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores de JWT, CORS y la base de datos antes de desplegar.

### Seguridad aplicada

- JWT con algoritmo HS256, issuer/audience verificados.
- Refresh token rotativo con cookie HttpOnly + SameSite=Lax.
- Headers defensivas con Helmet.
- CORS restringido por origen.
- Validación de entradas con express-validator.
