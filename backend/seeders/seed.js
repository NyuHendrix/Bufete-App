import { db, initializeDatabase, query, runSql } from '../config/db.js'
import { userModel } from '../models/userModel.js'

const sampleClients = [
  { nombre: 'María Fernanda Jiménez Solano', cedula: '2-5234-8233', telefono: '8624-2681', email: 'maria.jimenez@gmail.com', direccion: 'Barrio Las Flores, Puntarenas', tipoCaso: 'Familiar', casoDescripcion: 'Adopción', estadoCaso: 'Activo', fechaRegistro: '2026-09-27' },
  { nombre: 'José Alberto Chaves Rodríguez', cedula: '8-9609-7226', telefono: '8345-1041', email: 'jose.chaves@gmail.com', direccion: 'Residencial Los Álamos, Cartago', tipoCaso: 'Penal', casoDescripcion: 'Defensa en juicio por estafa', estadoCaso: 'Activo', fechaRegistro: '2026-08-01' },
  { nombre: 'Carlos Manuel Villalobos Umaña', cedula: '8-5148-3444', telefono: '8506-5120', email: 'carlos.villalobos@gmail.com', direccion: 'Urbanización San Rafael, Limón', tipoCaso: 'Mercantil', casoDescripcion: 'Incumplimiento de contrato', estadoCaso: 'Activo', fechaRegistro: '2026-09-21' },
]

async function seedRoles() {
  const roles = ['admin', 'user']
  for (const role of roles) {
    await runSql('INSERT OR IGNORE INTO roles (name) VALUES (?)', [role])
  }
}

async function seedUsers() {
  const admin = await userModel.findByEmail('admin@bufete.app')
  if (!admin) {
    await userModel.create({
      name: 'Administrador',
      email: 'admin@bufete.app',
      password: 'Admin1234',
      roleName: 'admin',
    })
  }
}

async function seedClients() {
  const count = await query('SELECT COUNT(*) AS total FROM clients')
  if (Number(count[0]?.total || 0) > 0) {
    return
  }

  for (const client of sampleClients) {
    await runSql(
      `INSERT INTO clients (nombre, cedula, telefono, email, direccion, tipo_caso, caso_descripcion, estado_caso, fecha_registro, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [client.nombre, client.cedula, client.telefono, client.email, client.direccion, client.tipoCaso, client.casoDescripcion, client.estadoCaso, client.fechaRegistro],
    )
  }
}

async function seedAppointments() {
  const count = await query('SELECT COUNT(*) AS total FROM appointments')
  if (Number(count[0]?.total || 0) > 0) {
    return
  }

  await runSql(`INSERT INTO appointments (client_id, fecha, hora, duracion_min, tipo, estado, notas, recordatorio, created_at, updated_at) VALUES
    (1, '2026-09-11', '08:30', 60, 'Consulta', 'Programada', 'Traer cédula y documentos del caso', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, '2026-09-12', '09:00', 90, 'Audiencia', 'Programada', 'Sala 4, Tribunal de San José', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, '2026-09-30', '12:45', 45, 'Firma', 'Programada', 'Trámite en Registro de la Propiedad', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`) 
}

async function seedPayments() {
  const count = await query('SELECT COUNT(*) AS total FROM payments')
  if (Number(count[0]?.total || 0) > 0) {
    return
  }

  await runSql(`INSERT INTO payments (client_id, concepto, monto, monto_pagado, estado, fecha_vencimiento, fecha_pago, nota, created_at, updated_at) VALUES
    (1, 'Honorarios iniciales', 500000, 250000, 'Pendiente', '2026-09-15', NULL, 'Cuota parcial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Defensa penal', 1200000, 1200000, 'Pagado', '2026-09-18', '2026-09-17', 'Se recibió el total', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`) 
}

async function seedExpenses() {
  const count = await query('SELECT COUNT(*) AS total FROM expenses')
  if (Number(count[0]?.total || 0) > 0) {
    return
  }

  await runSql(`INSERT INTO expenses (concepto, monto, categoria, fecha, proveedor, created_at, updated_at) VALUES
    ('Papelería legal', 35000, 'Administrativo', '2026-09-01', 'Papelería Central', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Gastos de tribunal', 90000, 'Judicial', '2026-09-02', 'Tribunal de San José', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`) 
}

try {
  await initializeDatabase(false)
  await seedRoles()
  await seedUsers()
  await seedClients()
  await seedAppointments()
  await seedPayments()
  await seedExpenses()
  console.log('Seed completed successfully')
  process.exit(0)
} catch (error) {
  console.error('Seed failed:', error)
  process.exit(1)
}
