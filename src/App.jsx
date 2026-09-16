import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import LegalBackground from './components/layout/LegalBackground'
import DashboardStats from './components/dashboard/DashboardStats'
import AlertsPanel from './components/dashboard/AlertsPanel'
import CashFlowChart from './components/dashboard/CashFlowChart'
import RecentActivity from './components/dashboard/RecentActivity'
import ClientList from './components/clients/ClientList'
import ClientDetail from './components/clients/ClientDetail'
import AppointmentCalendar from './components/appointments/AppointmentCalendar'
import PaymentTracker from './components/payments/PaymentTracker'
import ReportGenerator from './components/reports/ReportGenerator'
import { useClients } from './hooks/useClients'
import { useAppointments } from './hooks/useAppointments'
import { usePayments } from './hooks/usePayments'
import { sounds } from './utils/sounds'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre']

export default function App() {
  const clients = useClients()
  const citas = useAppointments()
  const pagos = usePayments()

  return (
    <BrowserRouter>
      <Shell clients={clients} citas={citas} pagos={pagos} />
    </BrowserRouter>
  )
}

function Shell({ clients, citas, pagos }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()

  /* ---- Restaurar tema guardado al cargar (PASO 4) ---- */
  useEffect(() => {
    if (localStorage.getItem('lexcr-theme') === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  /* ---- Sonido global: clic en cualquier botón/enlace ---- */
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest('button, a, [role="button"]')
      if (!el || el.disabled) return
      if (el.dataset.sound === 'success') sounds.success()
      else if (el.dataset.sound === 'alert') sounds.alert()
      else sounds.click()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  /* ---- Sonido sutil al cambiar de página ---- */
  useEffect(() => { sounds.page() }, [pathname])

  const hoy = new Date()
  const claveMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const ingresosMes = pagos.data
    .filter((p) => (p.fecha || '').startsWith(claveMes))
    .reduce((s, p) => s + (p.montoPagado || 0), 0)
  const pagosPendientes = pagos.data.filter((p) => p.estado !== 'Pagado')

  return (
    <div className="relative flex min-h-screen bg-slate-100 text-slate-800">
      <LegalBackground />
      <Sidebar open={menuAbierto} onClose={() => setMenuAbierto(false)} />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <Header onMenu={() => setMenuAbierto(true)} pathname={pathname} />
        <main className="flex-1 space-y-6 p-4 lg:p-8">
          <Routes>
            <Route
              path="/"
              element={
                <div className="space-y-6">
                  <DashboardStats
                    citasProximas={citas.proximas24h}
                    pagosPendientes={pagosPendientes}
                    vencidos={pagos.vencidos}
                    ingresosMes={ingresosMes}
                    nombreMes={MESES[hoy.getMonth()]}
                  />
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                      <CashFlowChart pagos={pagos.data} gastos={pagos.gastos} />
                    </div>
                    <AlertsPanel
                      citas24h={citas.proximas24h}
                      pagosVencidos={pagos.vencidos}
                      conflictos={citas.conflictos}
                      clientes={clients.data}
                    />
                  </div>
                  <RecentActivity citas={citas.data} pagos={pagos.data} clientes={clients.data} />
                </div>
              }
            />
            <Route path="/citas" element={<AppointmentCalendar hook={citas} clientesHook={clients} />} />
            <Route path="/clientes" element={<ClientList hook={clients} />} />
            <Route path="/clientes/:id" element={<ClientDetail clientes={clients.data} citas={citas.data} pagos={pagos.data} />} />
            <Route path="/pagos" element={<PaymentTracker hook={pagos} clientes={clients.data} />} />
            <Route path="/reportes" element={<ReportGenerator clientes={clients.data} citas={citas.data} pagos={pagos.data} gastos={pagos.gastos} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
