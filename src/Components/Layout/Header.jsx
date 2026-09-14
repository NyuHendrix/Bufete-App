import { useState } from 'react'
import { Menu, Volume2, VolumeX, Sun, Moon } from 'lucide-react'
import { CR_TIMEZONE } from '../../Utils/formatters'
import { sounds } from '../../Utils/sounds'

const titulos = {
  '/': 'Panel principal',
  '/citas': 'Gestión de citas',
  '/clientes': 'Gestión de clientes',
  '/pagos': 'Control de pagos',
  '/reportes': 'Generación de reportes',
}

export default function Header({ onMenu, pathname }) {
  const [muted, setMuted] = useState(sounds.isMuted())
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('lexcr-theme', next ? 'dark' : 'light')
  }

  const fecha = new Intl.DateTimeFormat('es-CR', {
    timeZone: CR_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
      <button onClick={onMenu} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Abrir menú">
        <Menu size={22} />
      </button>
      <div>
        <h1 className="text-lg font-bold text-slate-800">
          {titulos[pathname] || (pathname.startsWith('/clientes/') ? 'Ficha de cliente' : 'LexCR')}
        </h1>
        <p className="hidden text-xs capitalize text-slate-500 sm:block">{fecha}</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {/* Botón de tema claro/oscuro */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          title={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {/* Botón de sonido */}
        <button
          onClick={() => setMuted(sounds.toggle())}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          title={muted ? 'Activar sonidos' : 'Silenciar'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline">
          ● Sistema en línea
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          LC
        </span>
      </div>
    </header>
  )
}
