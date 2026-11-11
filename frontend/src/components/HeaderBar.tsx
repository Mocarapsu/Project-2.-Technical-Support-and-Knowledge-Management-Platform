import React, { useState, useRef, useEffect } from 'react';
import {
  HelpCircle,
  Bell,
  Search,
  User,
  CheckCheck,
  MessageSquare,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Database
} from 'lucide-react';
import { ActiveScreen, UserAccount, AppNotification } from '../types/figma-tickets';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface Props {
  currentScreen: ActiveScreen;
  currentUser?: UserAccount | null;
  notifications?: AppNotification[];
  onMarkAllAsRead?: () => void;
  onSelectNotification?: (notif: AppNotification) => void;
  onOpenDatabaseModal?: () => void;
}

export const HeaderBar: React.FC<Props> = ({
  currentScreen,
  currentUser,
  notifications = [],
  onMarkAllAsRead,
  onSelectNotification,
  onOpenDatabaseModal
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const getBreadcrumb = () => {
    switch (currentScreen) {
      case 'empleado_inicio':
        return 'EMPLEADO / INICIO';
      case 'empleado_asistente_ia':
        return 'EMPLEADO / ASISTENTE IA';
      case 'empleado_mis_tickets':
        return 'EMPLEADO / MIS TICKETS';
      case 'empleado_nuevo':
        return 'EMPLEADO / NUEVO TICKET';
      case 'empleado_detalle':
        return 'EMPLEADO / DETALLE TICKET';
      case 'tecnico_cola':
        return 'TÉCNICO / COLA DE TICKETS';
      case 'tecnico_detalle':
        return 'TÉCNICO / DETALLE TICKET';
      case 'tecnico_kb':
        return 'SISTEMA / BASE DE CONOCIMIENTO';
      case 'admin_dashboard':
        return 'DIRECCIÓN TI / DASHBOARD KPIS & AUDITORÍA';
      default:
        return 'RIALSA PLATAFORMA';
    }
  };

  const getInitials = () => {
    if (!currentUser?.nombre) return currentScreen === 'admin_dashboard' ? 'JB' : 'RH';
    const parts = currentUser.nombre.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getRoleMeta = () => {
    const rol = currentUser?.rol || (currentScreen === 'admin_dashboard' ? 'admin' : currentScreen.startsWith('tecnico') ? 'tecnico' : 'empleado');
    if (rol === 'admin') {
      return {
        bg: 'bg-purple-600',
        badgeBg: 'bg-purple-950/70 text-purple-300 border-purple-500/50',
        label: '🛡 Administrador TI (CISO)'
      };
    }
    if (rol === 'tecnico') {
      return {
        bg: 'bg-blue-600',
        badgeBg: 'bg-blue-950/70 text-blue-300 border-blue-500/50',
        label: '🛠 Técnico de Soporte TI'
      };
    }
    return {
      bg: 'bg-emerald-600',
      badgeBg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50',
      label: '👤 Portal Empleado / Cliente'
    };
  };

  const roleMeta = getRoleMeta();
  const userRole = currentUser?.rol || (currentScreen === 'admin_dashboard' ? 'admin' : currentScreen.startsWith('tecnico') ? 'tecnico' : 'empleado');

  // Filtrar notificaciones para este usuario y rol
  const userNotifications = notifications.filter((n) => {
    if (n.destinatarioRol === 'todos') return true;
    if (n.destinatarioRol === userRole) return true;
    if (currentUser?.email && n.destinatarioUsuario === currentUser.email) return true;
    return false;
  });

  const unreadCount = userNotifications.filter((n) => !n.leida).length;

  return (
    <header className="px-8 py-3.5 flex justify-between items-center text-xs select-none border-b border-[#161a22] relative z-40">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 text-slate-300">
        {/* Role Pill Badge */}
        <div className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${roleMeta.badgeBg}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span>{roleMeta.label}</span>
        </div>

        {/* Database Status Button */}
        {onOpenDatabaseModal && (
          <button
            type="button"
            onClick={onOpenDatabaseModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
              isSupabaseConfigured
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/70'
                : 'bg-amber-950/70 border-amber-500/50 text-amber-300 hover:bg-amber-900/70'
            }`}
            title="Estado de sincronización de Base de Datos Cloud"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'BD Cloud: Conectada' : 'Conectar BD Cloud'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </button>
        )}

        <button
          type="button"
          className="hover:text-white flex items-center gap-1.5 transition text-[11px]"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Ayuda</span>
        </button>

        {/* Campana de Notificaciones Interactiva con Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
              showDropdown
                ? 'bg-blue-600 text-white border-blue-400'
                : unreadCount > 0
                ? 'bg-[#1a233a] text-blue-300 border-blue-500/60 shadow-xs'
                : 'bg-[#1a1e28] text-slate-300 border-slate-700/50 hover:bg-[#202533]'
            }`}
          >
            <Bell className={`w-3.5 h-3.5 flex-shrink-0 ${unreadCount > 0 ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="whitespace-nowrap">Notificaciones</span>
            {unreadCount > 0 ? (
              <span className="bg-red-500 text-white font-black px-1.5 py-0.2 rounded-full text-[9px] animate-pulse">
                {unreadCount}
              </span>
            ) : (
              <span className="bg-slate-700 text-slate-300 font-bold px-1.5 py-0.2 rounded-full text-[9px]">
                0
              </span>
            )}
          </button>

          {/* Menú Desplegable de Notificaciones */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0e121a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-200">
              <div className="p-3.5 bg-[#141a26] border-b border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-xs text-white whitespace-nowrap">
                    {unreadCount > 0 ? `Notificaciones (${unreadCount} nuevas)` : 'Notificaciones al día'}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Marcar leídas</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {userNotifications.length > 0 ? (
                  userNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onSelectNotification?.(n);
                        setShowDropdown(false);
                      }}
                      className={`p-3.5 hover:bg-slate-800/60 transition cursor-pointer flex items-start gap-3 ${
                        !n.leida ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0">
                        {n.tipo === 'asignacion' && <UserCheck className="w-3.5 h-3.5 text-blue-400" />}
                        {n.tipo === 'comentario' && <MessageSquare className="w-3.5 h-3.5 text-purple-400" />}
                        {n.tipo === 'estado' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {n.tipo === 'alerta' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-white truncate">{n.titulo}</h4>
                          <span className="text-[9px] text-slate-500 font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                          {n.mensaje}
                        </p>
                        {n.ticketId && (
                          <div className="text-[10px] text-blue-400 font-mono font-semibold pt-0.5">
                            Ticket: {n.ticketId}
                          </div>
                        )}
                      </div>

                      {!n.leida && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    No tienes notificaciones pendientes en este momento.
                  </div>
                )}
              </div>

              <div className="p-2 bg-[#141a26] border-t border-slate-800 text-center text-[10px] text-slate-400">
                Sincronizado en tiempo real con auditoría RIALSA
              </div>
            </div>
          )}
        </div>

        {/* User avatar & account */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700/50">
          <div className={`w-7 h-7 rounded-md ${roleMeta.bg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
            {getInitials()}
          </div>
          {currentUser && (
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-semibold text-white leading-tight">
                {currentUser.nombre}
              </span>
              <span className="text-[9px] text-slate-400 capitalize">
                {currentUser.departamento || (currentUser.rol === 'admin' ? 'Dirección TI' : 'General')}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
