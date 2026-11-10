import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, Clock, ArrowUpRight, Plus, CheckCircle2 } from 'lucide-react';
import { TicketItem, UserAccount } from '../../types/figma-tickets';

interface Props {
  tickets?: TicketItem[];
  currentUser?: UserAccount | null;
  onSelectTicket?: (ticketId: string) => void;
  onCreateNew?: () => void;
}

const MY_TICKETS: TicketItem[] = [
  {
    id: 'TCK-1048',
    asunto: 'Sin conexión VPN laptop fuera de oficina',
    solicitante: 'Carlos Operador Planta',
    prioridad: 'Alta',
    categoria: 'Acceso',
    estado: 'En progreso',
    asignacion: 'Mesa de ayuda - Nivel 1',
    fechaCreacion: '15 oct 2026 - 09:23',
    slaRestante: '01 h 12 min'
  },
  {
    id: 'TCK-1038',
    asunto: 'Actualización certificados Outlook corporativo',
    solicitante: 'Carlos Operador Planta',
    prioridad: 'Media',
    categoria: 'Software',
    estado: 'Resuelto',
    asignacion: 'Resuelto por RIALSA IA',
    fechaCreacion: '12 oct 2026 - 14:10',
    slaRestante: 'Completado'
  },
  {
    id: 'TCK-1031',
    asunto: 'Cambio de tóner Ricoh Planta 1',
    solicitante: 'Carlos Operador Planta',
    prioridad: 'Baja',
    categoria: 'Hardware',
    estado: 'Resuelto',
    asignacion: 'Alfredo González Soto',
    fechaCreacion: '08 oct 2026 - 11:05',
    slaRestante: 'Completado'
  }
];

export const EmployeeMyTicketsView: React.FC<Props> = ({
  tickets,
  currentUser,
  onSelectTicket,
  onCreateNew
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'todos' | 'progreso' | 'resuelto'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const allTickets = tickets && tickets.length > 0 ? tickets : MY_TICKETS;
  const userTickets = currentUser?.nombre
    ? allTickets.filter(t => t.solicitante.toLowerCase().includes(currentUser.nombre.toLowerCase().split(' ')[0]))
    : allTickets;
  const ticketList = userTickets.length > 0 ? userTickets : allTickets;

  const filtered = ticketList.filter((t) => {
    const matchesSearch =
      t.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'progreso') return matchesSearch && t.estado === 'En progreso';
    if (activeTab === 'resuelto') return matchesSearch && t.estado === 'Resuelto';
    return matchesSearch;
  });

  const progressCount = ticketList.filter(t => t.estado === 'En progreso').length;
  const resolvedCount = ticketList.filter(t => t.estado === 'Resuelto').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mis tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Consulta el estado en tiempo real de tus solicitudes e historial de incidentes.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Crear nuevo ticket</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('todos')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'todos'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todos ({ticketList.length})
          </button>
          <button
            onClick={() => setActiveTab('progreso')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'progreso'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            En progreso ({progressCount})
          </button>
          <button
            onClick={() => setActiveTab('resuelto')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'resuelto'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Resueltos ({resolvedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en mis tickets..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
            <tr>
              <th className="py-3 px-4">Ticket ID</th>
              <th className="py-3 px-4">Asunto</th>
              <th className="py-3 px-4">Prioridad</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">SLA / Tiempo</th>
              <th className="py-3 px-4">Atendido por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.map((t) => (
              <tr
                key={t.id}
                onClick={() => onSelectTicket?.(t.id)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4 font-bold text-blue-700 flex items-center gap-1 group-hover:text-blue-900">
                  <span>{t.id}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">{t.asunto}</td>
                <td className="py-3.5 px-4">
                  {t.prioridad === 'Alta' && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                      Alta
                    </span>
                  )}
                  {t.prioridad === 'Media' && (
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                      Media
                    </span>
                  )}
                  {t.prioridad === 'Baja' && (
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                      Baja
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-600">{t.categoria}</td>
                <td className="py-3.5 px-4">
                  {t.estado === 'Resuelto' && (
                    <span className="bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Resuelto</span>
                    </span>
                  )}
                  {t.estado === 'En progreso' && (
                    <span className="bg-blue-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3" />
                      <span>En progreso</span>
                    </span>
                  )}
                  {t.estado === 'Abierto' && (
                    <span className="bg-amber-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
                      <span>Abierto</span>
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {t.estado === 'En progreso' ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.slaRestante}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Resuelto</span>
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">{t.asignacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

