import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus, Search, Filter, AlertCircle, ArrowUpRight, CheckCircle2, UserCheck, Clock } from 'lucide-react';
import { TicketItem, UserAccount } from '../../types/figma-tickets';

interface Props {
  tickets?: TicketItem[];
  currentUser?: UserAccount | null;
  onSelectTicket?: (ticketId: string) => void;
  onCreateInternalTicket?: () => void;
  onAssignTicket?: (ticketId: string, techName: string) => void;
}

const DEFAULT_TICKETS: TicketItem[] = [
  {
    id: 'TCK-1045',
    asunto: 'ERP bloqueado al facturar',
    solicitante: 'Ana Rentería',
    prioridad: 'Crítica',
    categoria: 'Software',
    estado: 'Abierto',
    asignacion: 'Sin asignar'
  },
  {
    id: 'TCK-1046',
    asunto: 'Sin acceso a VPN desde casa',
    solicitante: 'Carlos Operador Planta',
    prioridad: 'Alta',
    categoria: 'Acceso',
    estado: 'En progreso',
    asignacion: 'Ana Torres'
  },
  {
    id: 'TCK-1047',
    asunto: 'Impresora no responde',
    solicitante: 'Mario Díaz',
    prioridad: 'Media',
    categoria: 'Hardware',
    estado: 'Abierto',
    asignacion: 'Sin asignar'
  },
  {
    id: 'TCK-1048',
    asunto: 'Sin conexión VPN laptop',
    solicitante: 'Carlos Operador Planta',
    prioridad: 'Alta',
    categoria: 'Acceso',
    estado: 'En progreso',
    asignacion: 'Alfredo González Soto'
  }
];

export const TechnicianTicketQueueView: React.FC<Props> = ({
  tickets,
  currentUser,
  onSelectTicket,
  onCreateInternalTicket,
  onAssignTicket
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('Todas');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroAsignacion, setFiltroAsignacion] = useState<'Todos' | 'Sin asignar' | 'Asignados a mí'>('Todos');

  const ticketList = tickets || DEFAULT_TICKETS;
  const sinAsignarCount = ticketList.filter((t) => t.asignacion === 'Sin asignar' || t.asignacion === '').length;
  const criticosCount = ticketList.filter((t) => t.prioridad === 'Crítica').length;
  const enProgresoCount = ticketList.filter((t) => t.estado === 'En progreso').length;
  const resueltosCount = ticketList.filter((t) => t.estado === 'Resuelto').length;

  const currentTechFirstName = currentUser?.nombre ? currentUser.nombre.split(' ')[0].toLowerCase() : '';

  const filteredTickets = ticketList.filter((t) => {
    const matchesSearch =
      t.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.solicitante.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'Todos' || t.estado === filtroEstado;
    const matchesPrioridad = filtroPrioridad === 'Todas' || t.prioridad === filtroPrioridad;
    const matchesCategoria = filtroCategoria === 'Todas' || t.categoria === filtroCategoria;

    let matchesAsignacion = true;
    if (filtroAsignacion === 'Sin asignar') {
      matchesAsignacion = t.asignacion === 'Sin asignar' || !t.asignacion;
    } else if (filtroAsignacion === 'Asignados a mí') {
      matchesAsignacion = Boolean(
        currentTechFirstName && t.asignacion.toLowerCase().includes(currentTechFirstName)
      );
    }

    return matchesSearch && matchesEstado && matchesPrioridad && matchesCategoria && matchesAsignacion;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6"
    >
      {/* Top Header & Internal Ticket Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cola de tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioriza, asigna y resuelve solicitudes con la menor fricción.
          </p>
        </div>
        <motion.button
          type="button"
          onClick={onCreateInternalTicket}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          className="bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Crear ticket interno</span>
        </motion.button>
      </div>

      {/* Black Priority Alert Banner */}
      <div className="bg-slate-900 text-white px-5 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-slate-100 uppercase">COLA PRIORITARIA</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 font-medium">
            {sinAsignarCount} sin asignar · {criticosCount} críticos · {resueltosCount} resueltos. Revisa primero los tickets de alta prioridad.
          </span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{sinAsignarCount}</div>
          <div className="text-xs font-semibold text-slate-600 mt-1">Sin asignar</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-3xl font-extrabold text-red-600 tracking-tight">{criticosCount}</div>
          <div className="text-xs font-semibold text-slate-600 mt-1">Críticos</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{enProgresoCount}</div>
          <div className="text-xs font-semibold text-slate-600 mt-1">En progreso</div>
          <div className="text-[10px] text-slate-400">Técnicos & apoyo</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{resueltosCount}</div>
          <div className="text-xs font-semibold text-slate-600 mt-1">Resueltos</div>
          <div className="text-[10px] text-slate-400">Aprobación pendiente</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        <div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="Todos">Estado: Todos</option>
            <option value="Abierto">Abierto</option>
            <option value="En progreso">En progreso</option>
            <option value="Resuelto">Resuelto</option>
          </select>
        </div>

        <div>
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="Todas">Prioridad: Todas</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <div>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="Todas">Categoría: Todas</option>
            <option value="Software">Software</option>
            <option value="Acceso">Acceso</option>
            <option value="Hardware">Hardware</option>
          </select>
        </div>

        <div>
          <select
            value={filtroAsignacion}
            onChange={(e) => setFiltroAsignacion(e.target.value as any)}
            className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="Todos">Asignación: Todos ({ticketList.length})</option>
            <option value="Sin asignar">Sin asignar ({sinAsignarCount})</option>
            <option value="Asignados a mí">
              Asignados a mí {currentUser?.nombre ? `(${ticketList.filter(t => currentTechFirstName && t.asignacion.toLowerCase().includes(currentTechFirstName)).length})` : ''}
            </option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
            <tr>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Asunto</th>
              <th className="py-3 px-4">Solicitante</th>
              <th className="py-3 px-4">Prioridad</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Asignación</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredTickets.map((t) => {
              const isAssignedToMe = Boolean(
                currentTechFirstName && t.asignacion.toLowerCase().includes(currentTechFirstName)
              );
              const isUnassigned = t.asignacion === 'Sin asignar' || !t.asignacion;

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTicket?.(t.id)}
                  className={`transition-colors cursor-pointer group ${
                    isAssignedToMe ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-blue-700 flex items-center gap-1 group-hover:text-blue-900">
                    <span>{t.id}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{t.asunto}</td>
                  <td className="py-3.5 px-4 text-slate-600">{t.solicitante}</td>
                  <td className="py-3.5 px-4">
                    {t.prioridad === 'Crítica' && (
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        Crítica
                      </span>
                    )}
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
                    {isAssignedToMe ? (
                      <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded border border-blue-300 inline-flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                        <span>Asignado a ti</span>
                      </span>
                    ) : isUnassigned ? (
                      <span className="text-red-600 font-semibold text-[11px] bg-red-50 px-2 py-0.5 rounded border border-red-200/50">
                        Sin asignar
                      </span>
                    ) : (
                      <span className="text-slate-700 font-medium">{t.asignacion}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isUnassigned ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignTicket?.(t.id, currentUser?.nombre || 'Técnico TI');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-xs transition"
                      >
                        + Asignarme
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px] group-hover:text-blue-600 font-medium">
                        Ver →
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
