import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Users, Banknote, FileText, X, ChevronRight,
} from 'lucide-react'
import logoHarvey from '../../assets/logoHarvey.jpeg'

const navItems = [
  { to: '/', label: 'Panel principal', icon: LayoutDashboard, end: true },
  { to: '/citas', label: 'Citas', icon: CalendarDays },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/pagos', label: 'Pagos', icon: Banknote },
  { to: '/reportes', label: 'Reportes', icon: FileText },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay en móvil */}
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-300 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ---------- Marca ---------- */}
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
          <span className="h-10 w-12 shrink-0 overflow-hidden rounded-[10px] shadow-lg shadow-indigo-950/60 ring-1 ring-white/20">
            <img
              src={logoHarvey}
              alt="Harvey: Bufete & Notaría"
              className="h-[52px] max-w-none -translate-x-[11px] -translate-y-[7px]"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[11px] font-semibold tracking-[0.04em] text-brand-100">
              Harvey: Bufete & Notaría
            </p>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---------- Navegación ---------- */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            General
          </p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-indigo-950/60'
                    : 'text-slate-300 hover:translate-x-0.5 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Barra indicadora de sección activa */}
                  <span
                    className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-300 transition-opacity duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <Icon
                    size={18}
                    className={isActive ? '' : 'text-slate-400 transition-colors group-hover:text-brand-300'}
                  />
                  <span className="flex-1">{label}</span>
                  <ChevronRight
                    size={14}
                    className={`transition-all duration-200 ${
                      isActive
                        ? 'translate-x-0 opacity-100'
                        : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ---------- Tarjeta de usuario ---------- */}
        <div className="p-3">
          <div className="rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 text-xs font-bold text-white">
                LC
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">Lic. C. Obando</p>
                <p className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Socio principal
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] text-slate-500">
            America/Costa_Rica · © 2026 Harvey: Bufete & Notaría
          </p>
        </div>
      </aside>
    </>
  )
}
