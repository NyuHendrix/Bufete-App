import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, Banknote, FileText, Scale, X } from 'lucide-react'

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
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Scale size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-white">LexCR</p>
            <p className="text-[11px] text-slate-400">Bufete & Notaría</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={onClose} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
          Zona horaria: America/Costa_Rica
          <br />© 2026 LexCR
        </div>
      </aside>
    </>
  )
}
