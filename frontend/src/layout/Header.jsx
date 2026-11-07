import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Volume2, VolumeX, Sun, Moon, Bell, Mail, Search, ChevronDown, ArrowUpRight } from 'lucide-react'
import { CR_TIMEZONE } from '../../utils/formatters'
import { sounds } from '../../utils/sounds'
import AdminProfileModal from './AdminProfileModal'
import { useEscapeKey } from '../../hooks/useEscapeKey'

const titulos = {
  '/': 'Panel principal',
  '/citas': 'Gestión de citas',
  '/clientes': 'Gestión de clientes',
  '/pagos': 'Control de pagos',
  '/reportes': 'Generación de reportes',
}

const mensajesIniciales = [
  { id: 1, remitente: 'María Fernanda Jiménez', asunto: 'Documentación del caso', hora: '09:42', leido: false },
  { id: 2, remitente: 'Equipo de recepción', asunto: 'Confirmación de cita', hora: 'Ayer', leido: false },
  { id: 3, remitente: 'Registro Nacional', asunto: 'Solicitud de certificación', hora: 'Ayer', leido: true },
]

export default function Header({ onMenu, pathname, perfil, onGuardarPerfil, notificaciones }) {
  const navigate = useNavigate()
  const [muted, setMuted] = useState(sounds.isMuted())
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [panel, setPanel] = useState('')
  const [perfilAbierto, setPerfilAbierto] = useState(false)
  useEscapeKey(Boolean(panel), () => setPanel(''))
  const [notificacionesLeidas, setNotificacionesLeidas] = useState(() => {
    try {
      const guardadas = JSON.parse(localStorage.getItem('harvey-read-notifications') || '[]')
      return new Set(Array.isArray(guardadas) ? guardadas : [])
    } catch {
      return new Set()
    }
  })
  const [mensajes, setMensajes] = useState(() => {
    try {
      const guardados = JSON.parse(localStorage.getItem('harvey-inbox-messages') || 'null')
      return Array.isArray(guardados) ? guardados : mensajesIniciales
    } catch {
      return mensajesIniciales
    }
  })

  useEffect(() => {
    localStorage.setItem('harvey-read-notifications', JSON.stringify([...notificacionesLeidas]))
  }, [notificacionesLeidas])

  useEffect(() => {
    localStorage.setItem('harvey-inbox-messages', JSON.stringify(mensajes))
  }, [mensajes])

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
  const iniciales = perfil.nombre.split(/\s+/).filter(Boolean).slice(-2).map((parte) => parte[0]).join('').toUpperCase()
  const noLeidos = mensajes.filter((mensaje) => !mensaje.leido).length
  const notificacionesNoLeidas = notificaciones.filter((aviso) => !notificacionesLeidas.has(aviso.id))
  const totalNotificaciones = notificacionesNoLeidas.length

  const alternarPanel = (siguientePanel) => {
    if (panel === siguientePanel) {
      setPanel('')
      return
    }

    if (siguientePanel === 'inbox') {
      setMensajes((actuales) => actuales.map((mensaje) => ({ ...mensaje, leido: true })))
    } else {
      setNotificacionesLeidas((actuales) => new Set([...actuales, ...notificaciones.map((aviso) => aviso.id)]))
    }
    setPanel(siguientePanel)
  }

  return (
    <header className={`app-header sticky top-0 z-20 flex h-16 items-center gap-4 border-b px-4 lg:px-8 ${pathname === '/' ? 'app-header-dashboard' : ''}`}>
      <button onClick={onMenu} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Abrir menú">
        <Menu size={22} />
      </button>
      <div>
        <h1 className="text-lg font-bold">
          {titulos[pathname] || (pathname.startsWith('/clientes/') ? 'Ficha de cliente' : 'Harvey: Bufete & Notaría')}
        </h1>
        <p className="hidden text-xs capitalize sm:block">{fecha}</p>
      </div>
      {pathname === '/' && <label className="header-search ml-8 hidden max-w-md flex-1 items-center gap-2 rounded-lg px-3 py-2 lg:flex"><Search size={16} /><input aria-label="Buscar" placeholder="Buscar clientes, citas, expedientes..." /></label>}
      <div className="relative ml-auto flex items-center gap-1 sm:gap-2">
        {/* Botón de tema claro/oscuro */}
        <button
          onClick={toggleTheme}
          className="header-action rounded-lg p-2"
          title={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {/* Botón de sonido */}
        <button
          onClick={() => setMuted(sounds.toggle())}
          className="header-action hidden rounded-lg p-2 sm:inline-flex"
          title={muted ? 'Activar sonidos' : 'Silenciar'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button className="header-action relative rounded-lg p-2" onClick={() => alternarPanel('inbox')} aria-label={`Buzón de entrada, ${noLeidos} sin leer`} aria-expanded={panel === 'inbox'} aria-controls="header-popover" title="Buzón de entrada">
          <Mail size={18} />{noLeidos > 0 && <span className="header-badge">{noLeidos}</span>}
        </button>
        <button className="header-action relative rounded-lg p-2" onClick={() => alternarPanel('alerts')} aria-label={`${totalNotificaciones} notificaciones sin leer`} aria-expanded={panel === 'alerts'} aria-controls="header-popover" title="Notificaciones">
          <Bell size={18} />{totalNotificaciones > 0 && <span className="header-badge">{totalNotificaciones}</span>}
        </button>
        <button className="profile-trigger ml-1 flex items-center gap-2 rounded-lg p-1.5" onClick={() => setPerfilAbierto(true)} title="Editar perfil administrativo">
          <span className="profile-avatar">{perfil.foto ? <img src={perfil.foto} alt="" /> : iniciales}</span>
          <span className="hidden max-w-28 text-left sm:block"><span className="block truncate text-xs font-semibold">{perfil.nombre}</span><span className="block truncate text-[10px]">{perfil.cargo}</span></span>
          <ChevronDown size={14} className="hidden sm:block" />
        </button>

        {panel && <div id="header-popover" className="header-popover" role="region" aria-label={panel === 'inbox' ? 'Buzón de entrada' : 'Notificaciones'}>
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-semibold">{panel === 'inbox' ? 'Buzón de entrada' : 'Notificaciones'}</h2>
            <button className="text-xs text-amber-300 hover:text-amber-200" onClick={() => panel === 'inbox' ? setMensajes((actuales) => actuales.map((mensaje) => ({ ...mensaje, leido: true }))) : setPanel('')}>{panel === 'inbox' ? 'Marcar todo leído' : 'Cerrar'}</button>
          </div>
          {panel === 'inbox' ? <ul className="header-popover-list" aria-label="Mensajes" tabIndex={0}>{mensajes.map((mensaje) => <li key={mensaje.id}><button className={`popover-row ${mensaje.leido ? '' : 'popover-unread'}`} onClick={() => setMensajes((actuales) => actuales.map((item) => item.id === mensaje.id ? { ...item, leido: true } : item))}><span className="flex min-w-0 flex-1 items-start gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-amber-300" /><span className="min-w-0"><strong className="block truncate">{mensaje.remitente}</strong><span className="block truncate text-xs text-slate-400">{mensaje.asunto}</span></span></span><span className="text-[10px] text-slate-500">{mensaje.hora}</span></button></li>)}</ul> : <ul className="header-popover-list py-1" aria-label="Lista de notificaciones" tabIndex={0}>
            {notificaciones.length === 0 ? <li className="px-4 py-5 text-center text-xs text-slate-400">No hay alertas pendientes.</li> : notificaciones.map((aviso) => <li key={aviso.id}><button type="button" className={`popover-row w-full text-left ${notificacionesLeidas.has(aviso.id) ? '' : 'popover-unread'}`} onClick={() => { navigate(aviso.to, { state: { notificationAction: Date.now() } }); setPanel('') }} aria-label={`${aviso.accion}: ${aviso.titulo}`}><Bell size={16} className="shrink-0 text-rose-300" /><span className="min-w-0 flex-1"><strong className="block truncate text-xs">{aviso.titulo}</strong><span className="block truncate text-[10px] text-slate-400">{aviso.detalle}</span><span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-amber-300">{aviso.accion}<ArrowUpRight size={12} /></span></span></button></li>)}
          </ul>}
        </div>}
      </div>
      {perfilAbierto && <AdminProfileModal perfil={perfil} onGuardar={onGuardarPerfil} onCerrar={() => setPerfilAbierto(false)} />}
    </header>
  )
}
