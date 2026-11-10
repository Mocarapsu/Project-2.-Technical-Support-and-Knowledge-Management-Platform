import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Bot,
  Plus,
  Ticket,
  BookOpen,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { ActiveScreen, UserAccount } from '../../types/figma-tickets';

interface Props {
  onNavigate: (screen: ActiveScreen) => void;
  currentUser?: UserAccount | null;
}

export const EmployeeHomeView: React.FC<Props> = ({ onNavigate, currentUser }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Welcome Banner Card */}
      <div className="bg-white rounded-2xl p-8 lg:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Asistente Inteligente Activo · RIALSA</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Hola, {currentUser?.nombre || 'Colaborador'}.<br />
            <span className="text-blue-600 font-bold">¿En qué podemos ayudarte hoy?</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            Obtén soluciones inmediatas de nuestros manuales autorizados o levanta una solicitud de soporte para que un técnico te atienda.
          </p>

          {/* Quick Search */}
          <div className="pt-2">
            <div className="relative max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Busca un error, software, equipo o artículo KB..."
                className="w-full text-xs pl-10 pr-24 py-3 border border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              />
              <button
                type="button"
                onClick={() => onNavigate('empleado_asistente_ia')}
                className="absolute right-2 top-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-50/60 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* 3 Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Asistente IA */}
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { y: -3 }}
          onClick={() => onNavigate('empleado_asistente_ia')}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Asistente RIALSA IA
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Diagnósticos en tiempo real y guías paso a paso de los manuales de planta GID.
            </p>
          </div>
          <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Iniciar conversación</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Card 2: Crear Ticket */}
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { y: -3 }}
          onClick={() => onNavigate('empleado_nuevo')}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Crear nuevo ticket
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Registra una solicitud formal con adjuntos y categorización para los técnicos de TI.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Registrar solicitud</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Card 3: Base de Conocimiento */}
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { y: -3 }}
          onClick={() => onNavigate('tecnico_kb')}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Base de conocimiento
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Explora manuales técnicos oficiales sobre VPN, impresoras Zebra, ERP y correo.
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Explorar manuales</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      </div>

      {/* Active Ticket Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tu ticket activo más reciente
            </h2>
          </div>
          <button
            onClick={() => onNavigate('empleado_mis_tickets')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            Ver todos mis tickets →
          </button>
        </div>

        <div
          onClick={() => onNavigate('empleado_detalle')}
          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer flex flex-wrap justify-between items-center gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-blue-700 text-sm">TCK-1048</span>
              <span className="bg-teal-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                En progreso
              </span>
              <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded">
                Alta
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">
              Sin conexión VPN laptop fuera de oficina
            </h3>
            <p className="text-[11px] text-slate-500">
              Asignado a: Mesa de ayuda - Nivel 1 · Creado hace 42 minutos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>SLA restante: 01 h 12 min</span>
            </span>
            <button className="bg-slate-900 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold hover:bg-black transition">
              Ver detalle
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

