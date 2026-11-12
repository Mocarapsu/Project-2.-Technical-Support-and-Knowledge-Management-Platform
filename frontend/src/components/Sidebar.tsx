import React from 'react';
import {
  Home,
  Bot,
  Ticket,
  BookOpen,
  Plus,
  LogOut,
  Users,
  Briefcase,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { ActiveScreen, RoleMode, UserAccount } from '../types/figma-tickets';

interface Props {
  currentRole: RoleMode;
  currentScreen: ActiveScreen;
  currentUser?: UserAccount;
  onNavigate: (screen: ActiveScreen) => void;
  onRoleToggle?: (role: RoleMode) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentRole,
  currentScreen,
  currentUser,
  onNavigate,
  onRoleToggle,
  onLogout
}) => {
  // BUG-001 & BUG-002: La única fuente de verdad inmutable para el rol en el sidebar es la sesión activa
  const activeRole = currentUser?.rol || currentRole;

  return (
    <aside className="w-64 bg-[#0B0D11] text-slate-300 flex flex-col justify-between p-3.5 border-r border-[#1a1d24] flex-shrink-0 h-full max-h-full select-none overflow-hidden">
      {/* Top Section */}
      <div className="space-y-3 overflow-hidden">
        {/* Brand & Role Badge */}
        <div className="px-1">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-black text-white tracking-wider">RIALSA</h1>
            
            {/* Active Role Badge (Color-coded) */}
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wider uppercase ${
              activeRole === 'admin'
                ? 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                : activeRole === 'tecnico'
                ? 'bg-blue-950/70 border-blue-500/50 text-blue-300'
                : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>
                {activeRole === 'empleado' && '👤 Empleado'}
                {activeRole === 'tecnico' && '🛠 Técnico TI'}
                {activeRole === 'admin' && '🛡 Admin CISO'}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">
            {activeRole === 'empleado' && 'Centro de soporte TI institucional'}
            {activeRole === 'tecnico' && 'Consola operativa de resolución'}
            {activeRole === 'admin' && 'Dirección TI, SLAs y Rebalanceo'}
          </p>
        </div>

        {/* Primary Action Button (Empleado) */}
        {activeRole === 'empleado' && (
          <div className="px-1">
            <button
              type="button"
              onClick={() => onNavigate('empleado_nuevo')}
              className="w-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-medium text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear ticket</span>
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1 text-xs">
          {activeRole === 'empleado' && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('empleado_inicio')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentScreen === 'empleado_inicio'
                    ? 'bg-[#1d4ed8] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#151820]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('empleado_asistente_ia')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentScreen === 'empleado_asistente_ia'
                    ? 'bg-[#1d4ed8] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#151820]'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Asistente IA</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('empleado_mis_tickets')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentScreen === 'empleado_mis_tickets' || currentScreen === 'empleado_detalle'
                    ? 'bg-[#1d4ed8] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#151820]'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Mis tickets</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('tecnico_kb')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentScreen === 'tecnico_kb'
                    ? 'bg-[#1d4ed8] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#151820]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Base de conocimiento</span>
              </button>
            </>
          )}

          {activeRole === 'tecnico' && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('tecnico_cola')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentScreen === 'tecnico_cola'
                    ? 'bg-[#1d4ed8] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#151820]'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Cola de tickets</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('tecnico_detalle')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentScreen === 'tecnico_detalle'
                    ? 'bg-[#1d4ed8] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#151820]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Detalle ticket</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('tecnico_kb')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentScreen === 'tecnico_kb'
                    ? 'bg-[#1d4ed8] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#151820]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Base de conocimiento</span>
              </button>
            </>
          )}

          {activeRole === 'admin' && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('admin_dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentScreen === 'admin_dashboard'
                    ? 'bg-[#1d4ed8] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#151820]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Dashboard KPIs & Auditoría</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('tecnico_cola')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151820]"
              >
                <Ticket className="w-4 h-4" />
                <span>Cola operativa</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* User Footer (Always visible without scrolling) */}
      <div className="pt-2.5 border-t border-[#1a1d24] px-1 text-xs flex-shrink-0 mt-auto">
        <div className="font-semibold text-white truncate text-[11px]" title={currentUser?.nombre}>
          {currentUser?.nombre || (currentRole === 'admin' ? 'Ing. José Luis Bautista' : currentRole === 'tecnico' ? 'Alfredo González Soto' : 'Carlos Operador Planta')}
        </div>
        <div className="text-[10px] text-slate-400 font-mono truncate">
          {currentUser?.email || (currentRole === 'admin' ? 'bautista@gid.com.mx' : currentRole === 'tecnico' ? 'alfredo@gid.com.mx' : 'carlos@gid.com.mx')}
        </div>
        <div className="text-[9px] text-slate-500 truncate mt-0.5">
          {currentUser?.departamento || (currentRole === 'empleado' ? 'Operaciones TI2' : currentRole === 'tecnico' ? 'Soporte Especialista L2' : 'CISO Central')}
        </div>
        <button
          onClick={onLogout}
          className="text-[11px] text-slate-400 hover:text-white mt-1.5 flex items-center gap-1 transition cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
