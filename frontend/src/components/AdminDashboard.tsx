import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  Download,
  FileText,
  Shield,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Users,
  UserPlus,
  Send,
  Ticket,
  Check,
  X,
  BarChart3,
  PieChart,
  Activity,
  Layers,
  Calendar,
  Filter
} from 'lucide-react';
import { TicketItem, TechnicianProfile, UserAccount } from '../types/figma-tickets';
import { CATEGORIES, normalizeCategory, slaText, getTicketDate } from '../services/ticketDomain';
import { ExecutiveReportModal } from './ExecutiveReportModal';

export interface AuditEvent {
  id: string;
  timestamp: string;
  ticketId: string;
  action: string;
  executor: string;
  role: 'AI_SYSTEM' | 'TECHNICIAN' | 'END_USER' | 'ADMIN';
  slaStatus: string;
  slaLevel: 'critical' | 'ontime' | 'resolved';
}

export interface AdminDashboardProps {
  currentUser?: UserAccount | null;
  tickets?: TicketItem[];
  technicians?: TechnicianProfile[];
  onAssignTicket?: (ticketId: string, techName: string) => void | Promise<boolean>;
  onAddTechnician?: (tech: TechnicianProfile) => void | Promise<boolean>;
  onForceAssignment?: (ticketId: string) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  tickets = [],
  technicians = [],
  onAssignTicket,
  onAddTechnician,
  onExportCSV,
  onExportPDF,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'metrics' | 'assignments' | 'team'>('metrics');
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState<TicketItem | null>(null);
  const [selectedTechForStats, setSelectedTechForStats] = useState<TechnicianProfile | null>(null);
  const [showExecutiveReportModal, setShowExecutiveReportModal] = useState(false);
  const [targetTech, setTargetTech] = useState<string>('');
  const [showAddTechModal, setShowAddTechModal] = useState(false);
  const [assignmentSuccessMsg, setAssignmentSuccessMsg] = useState<string | null>(null);

  // Filtro de rangos de fechas (Día a día, Mes a mes, Presets rápidos)
  type DatePreset = 'all' | 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'custom';
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filtrar tickets por rango de fechas
  const { filteredTickets, periodoLabel } = useMemo(() => {
    if (datePreset === 'all') {
      return {
        filteredTickets: tickets,
        periodoLabel: 'Histórico consolidado (todos los registros)'
      };
    }

    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;
    let label = '';

    if (datePreset === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      label = `Hoy (${now.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })})`;
    } else if (datePreset === '7d') {
      start = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      label = `Últimos 7 días (${start.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })})`;
    } else if (datePreset === '30d') {
      start = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      label = `Últimos 30 días (${start.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })})`;
    } else if (datePreset === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      label = `Este mes (${now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })})`;
    } else if (datePreset === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      label = `Mes anterior (${prevDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })})`;
    } else if (datePreset === 'custom') {
      if (startDate) {
        const [sy, sm, sd] = startDate.split('-').map(Number);
        start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
      }
      if (endDate) {
        const [ey, em, ed] = endDate.split('-').map(Number);
        end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
      }
      if (start && end) {
        label = `Del ${start.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })} al ${end.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      } else if (start) {
        label = `Desde ${start.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      } else if (end) {
        label = `Hasta ${end.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      } else {
        label = 'Rango personalizado';
      }
    }

    const filtered = tickets.filter(t => {
      const d = getTicketDate(t);
      if (!d) return true;
      if (start && d.getTime() < start.getTime()) return false;
      if (end && d.getTime() > end.getTime()) return false;
      return true;
    });

    return { filteredTickets: filtered, periodoLabel: label };
  }, [tickets, datePreset, startDate, endDate]);

  // Formulario nuevo técnico
  const [newTechNombre, setNewTechNombre] = useState('');
  const [newTechEmail, setNewTechEmail] = useState('');
  const [newTechEspecialidad, setNewTechEspecialidad] = useState('');
  const [newTechNivel, setNewTechNivel] = useState<'Nivel 1 (Mesa de Ayuda)' | 'Nivel 2 (Especialista)' | 'Nivel 3 (Infraestructura)'>('Nivel 2 (Especialista)');

  // Calcular carga dinámica por técnico en el periodo
  const techWorkloads = technicians.map((tech) => {
    const count = filteredTickets.filter(
      (t) => t.asignacion.toLowerCase().includes(tech.nombre.toLowerCase()) && t.estado !== 'Resuelto'
    ).length;
    return { ...tech, ticketsActivos: count };
  });

  // Identificar el técnico con menor carga para el algoritmo Least-Loaded
  const minLoad = Math.min(...techWorkloads.map((t) => t.ticketsActivos));

  // Buscar si existe un ticket crítico o de alta prioridad NO RESUELTO
  const pendingCriticalTicket = filteredTickets.find(
    (t) => t.estado !== 'Resuelto' && (t.prioridad === 'Crítica' || t.prioridad === 'Alta')
  );

  // BUG-014: Métricas y KPIs dinámicos calculados del estado real en el periodo
  const totalTickets = filteredTickets.length;
  const resueltosCount = filteredTickets.filter((t) => t.estado === 'Resuelto').length;
  const enProgresoCount = filteredTickets.filter((t) => t.estado === 'En progreso').length;
  const abiertosCount = filteredTickets.filter((t) => t.estado === 'Abierto').length;
  const criticosCount = filteredTickets.filter((t) => t.prioridad === 'Crítica' && t.estado !== 'Resuelto').length;

  const categoryCounts = Array.from(new Set([...CATEGORIES, ...filteredTickets.map(t=>normalizeCategory(t.categoria))])).map(category=>({category,count:filteredTickets.filter(t=>normalizeCategory(t.categoria)===category).length}));
  const pct = (val:number) => totalTickets ? Math.round(val/totalTickets*100) : 0;
  const measured = filteredTickets.filter(t=>t.estado==='Resuelto'&&t.resolvedAt&&t.slaDeadline);
  const slaCompliance = measured.length ? `${Math.round(measured.filter(t=>slaText(t)==='Cumplido').length/measured.length*100)}%` : 'Sin datos';
  const durations = filteredTickets.filter(t=>t.estado==='Resuelto'&&t.createdAt&&t.resolvedAt).map(t=>(Date.parse(t.resolvedAt!)-Date.parse(t.createdAt!))/3600000).filter(n=>Number.isFinite(n)&&n>=0);
  const average = durations.length ? `${(durations.reduce((a,b)=>a+b,0)/durations.length).toFixed(1)} h` : 'Sin datos';
  const auditLogs = filteredTickets.flatMap(t=>(t.historialAuditoria||[]).map((action,i)=>({id:`${t.id}-${i}`,ticketId:t.id,action,slaStatus:slaText(t)})));
  const escaladosCount = filteredTickets.filter(t=>t.estado==='Escalado').length;

  const handleExportCSV = () => {
    const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
    const rows = [
      'Folio,Asunto,Solicitante,Departamento,Categoria,Prioridad,Estado,Asignacion,FechaCreacion,SLARestante',
      ...filteredTickets.map(t => [
        t.id,
        t.asunto,
        t.solicitante,
        t.departamento || '',
        t.categoria,
        t.prioridad,
        t.estado,
        t.asignacion,
        t.fechaCreacion || t.createdAt || '',
        t.slaRestante || ''
      ].map(escape).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff', rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanLabel = (periodoLabel || 'Historico').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    a.download = `RIALSA_Reporte_${cleanLabel}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedTicketForAssign || !targetTech) return;
    if (await onAssignTicket?.(selectedTicketForAssign.id, targetTech) === false) return;
    setAssignmentSuccessMsg(`Ticket ${selectedTicketForAssign.id} asignado exitosamente a ${targetTech}.`);
    setSelectedTicketForAssign(null);
    setTargetTech('');
    setTimeout(() => setAssignmentSuccessMsg(null), 4000);
  };

  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechNombre || !newTechEmail) return;

    const newProfile: TechnicianProfile = {
      id: `TECH-${crypto.randomUUID()}`,
      nombre: newTechNombre,
      email: newTechEmail,
      especialidad: newTechEspecialidad || 'Soporte General',
      nivel: newTechNivel,
      ticketsActivos: 0,
      estado: 'Disponible'
    };

    if (await onAddTechnician?.(newProfile) === false) return;
    setShowAddTechModal(false);
    setNewTechNombre('');
    setNewTechEmail('');
    setNewTechEspecialidad('');
    setAssignmentSuccessMsg(`Técnico ${newProfile.nombre} registrado en el pool de resolución.`);
    setTimeout(() => setAssignmentSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER & TAB NAVIGATION                             */}
      {/* ========================================================= */}
      <div className="bg-white rounded-lg p-6 border border-slate-200  space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Consola Central CISO / Dirección TI
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">{currentUser?.nombre || "Dirección TI"}</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mt-1">
              Dashboard de Dirección & Gestión Operativa
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de SLAs, balanceo de carga entre técnicos y auditoría inmutable de eventos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              title="Descargar datos del periodo seleccionado en formato CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={() => setShowExecutiveReportModal(true)}
              className="bg-slate-900 hover:bg-black text-white text-xs font-semibold px-3.5 py-2 rounded-lg  transition flex items-center gap-1.5 cursor-pointer"
              title="Generar dictamen ejecutivo oficial para auditoría y comité"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Reporte Ejecutivo PDF</span>
            </button>
          </div>
        </div>

        {/* Date Range & Period Filter Bar */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5 mr-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Rango de fechas:</span>
            </span>
            {[
              { id: 'all', label: 'Todo el histórico' },
              { id: 'today', label: 'Hoy' },
              { id: '7d', label: 'Últimos 7 días' },
              { id: '30d', label: 'Últimos 30 días' },
              { id: 'this_month', label: 'Este mes' },
              { id: 'last_month', label: 'Mes anterior' },
              { id: 'custom', label: 'Personalizado' }
            ].map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDatePreset(preset.id as DatePreset)}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition cursor-pointer ${
                  datePreset === preset.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              <label className="text-[11px] text-slate-500 font-medium">Desde:</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="text-xs text-slate-800 bg-transparent focus:outline-none"
              />
              <label className="text-[11px] text-slate-500 font-medium ml-1">Hasta:</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="text-xs text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
          )}

          <div className="text-slate-500 text-[11px] font-medium flex items-center gap-2">
            <span className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-mono text-xs">
              {filteredTickets.length} de {tickets.length} tickets
            </span>
            <span className="italic">{periodoLabel}</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'metrics'
                ? 'bg-slate-900 text-white '
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>1. Métricas, SLA & Auditoría</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'bg-slate-900 text-white '
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>2. Asignar y Rebalancear Tickets ({filteredTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'team'
                ? 'bg-slate-900 text-white '
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. Técnicos & Capacidad ({technicians.length})</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {assignmentSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-lg font-semibold flex items-center justify-between "
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{assignmentSuccessMsg}</span>
          </div>
          <button onClick={() => setAssignmentSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: METRICS & SLA OVERVIEW (BUG-014: KPIs Y ANALÍTICA) */}
      {/* ========================================================= */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {totalTickets === 0 ? (
            /* Explicit Empty State (BUG-014) */
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center  space-y-4">
              <div className="w-16 h-16 mx-auto rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">Sin incidencias registradas en el periodo actual</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No se han registrado incidencias activas en el sistema o la base de datos no contiene tickets en el rango evaluado.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 max-w-lg mx-auto text-xs text-slate-600 text-left space-y-1.5 font-mono">
                <div><strong className="text-slate-800">Fuente de datos:</strong> PostgreSQL Cloud (Supabase) / Cache Local GID</div>
                <div><strong className="text-slate-800">Periodo evaluado:</strong> Tiempo Real (Últimos 30 días)</div>
                <div><strong className="text-slate-800">Próximos pasos:</strong> Los usuarios pueden crear tickets desde el portal de autoservicio o el Asistente IA para generar métricas de rendimiento y SLAs.</div>
              </div>
            </div>
          ) : (
            <>
              {/* Dynamic Critical SLA Alert or Optimal Status Banner */}
              {pendingCriticalTicket ? (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl  flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Alerta de Atención Prioritaria (SLA en Curso)</span>
                        <span className="text-xs bg-red-200/70 text-red-800 px-2 py-0.5 rounded-full font-bold">
                          Regla BR-02
                        </span>
                      </div>
                      <div className="text-xs text-red-800 mt-0.5">
                        El Ticket <strong className="font-mono text-red-950 font-bold">{pendingCriticalTicket.id}</strong> ({pendingCriticalTicket.asunto}) tiene prioridad <strong className="text-red-950 font-bold">{pendingCriticalTicket.prioridad}</strong> y le restan{' '}
                        <span className="font-semibold text-red-900 underline">{slaText(pendingCriticalTicket) || '01 h 12 min'}</span>. Asignado a: <strong>{pendingCriticalTicket.asignacion}</strong>.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTicketForAssign(pendingCriticalTicket);
                      setTargetTech(pendingCriticalTicket.asignacion !== 'Sin asignar' ? pendingCriticalTicket.asignacion : technicians[0]?.nombre || '');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg  transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Reasignar a Especialista</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-xl  flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Sin incidencias críticas o altas pendientes</span>
                        <span className="text-xs bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          Estado operativo
                        </span>
                      </div>
                      <div className="text-xs text-emerald-800 mt-0.5">
                        Cero incidencias críticas o de alta prioridad pendientes. Consulta las métricas de SLA para verificar el cumplimiento.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg  transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Ver Portafolio de Tickets ({filteredTickets.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5  space-y-1">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tiempo Prom. Resolución</span>
                  <div className="text-3xl font-semibold text-slate-900 tracking-tight">{average}</div>
                  <div className="text-xs text-blue-700 font-semibold pt-1 border-t border-slate-100 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tickets con fechas registradas</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5  space-y-1">
                  <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Resolución IA vs Humano</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-semibold text-emerald-600 tracking-tight">
                    Sin datos
                  </div>
                  <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
                    <span className="text-emerald-700 font-semibold">IA: no medido</span>
                    <span className="text-blue-700 font-semibold">Sin clasificación</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5  space-y-1">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Cumplimiento de SLA</span>
                  <div className="text-3xl font-semibold text-slate-900 tracking-tight">{slaCompliance}</div>
                  <div className="text-xs text-emerald-600 font-semibold pt-1 border-t border-slate-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{criticosCount === 0 ? 'Sin desvíos críticos' : `${criticosCount} en riesgo crítico`}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5  space-y-1">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Balanceo Least-Loaded</span>
                  <div className="text-3xl font-semibold text-slate-900 tracking-tight">{technicians.length} Técnicos</div>
                  <div className="text-xs text-emerald-700 font-semibold pt-1 border-t border-slate-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Algoritmo activo de menor carga</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Categorization & Status Analytics (BUG-014) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Incidencias por Categoría */}
                <div className="bg-white border border-slate-200 rounded-lg p-5  space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>Distribución por Categoría ({totalTickets} Total)</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">Volumen relativo</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {categoryCounts.map(({category,count})=><div key={category} className="space-y-1"><div className="flex justify-between text-sm text-slate-700"><span>{category}</span><span className="font-semibold">{count} ({pct(count)}%)</span></div><div className="w-full h-2 bg-slate-100 rounded overflow-hidden"><div className="h-full bg-blue-600" style={{width:`${pct(count)}%`}}/></div></div>)}
                  </div>
                </div>

                {/* Estado del Pipeline */}
                <div className="bg-white border border-slate-200 rounded-lg p-5  space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Estado del Pipeline Operativo</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">Ciclo de vida</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-3 text-center space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Resueltos</span>
                      <div className="text-2xl font-semibold text-emerald-800">{resueltosCount}</div>
                      <div className="text-xs text-emerald-600 font-semibold">{pct(resueltosCount)}% del total</div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200/80 rounded-lg p-3 text-center space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">En Progreso</span>
                      <div className="text-2xl font-semibold text-blue-800">{enProgresoCount}</div>
                      <div className="text-xs text-blue-600 font-semibold">{pct(enProgresoCount)}% del total</div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-center space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Abiertos</span>
                      <div className="text-2xl font-semibold text-amber-800">{abiertosCount}</div>
                      <div className="text-xs text-amber-600 font-semibold">{pct(abiertosCount)}% del total</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center space-y-1"><span className="text-xs text-slate-600">Escalados</span><div className="text-2xl font-semibold">{escaladosCount}</div><div className="text-xs">{pct(escaladosCount)}% del total</div></div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Tickets críticos sin resolver:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                      criticosCount > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {criticosCount === 0 ? '0' : `${criticosCount} en atención`}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Audit Log Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-6  space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Bitácora de auditoría</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Eventos registrados en los tickets disponibles.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <RefreshCw className="w-3 h-3 text-slate-400" />
                <span>{auditLogs.length} eventos</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-xs text-slate-500 font-bold tracking-wider">
                  <tr>
                    
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Acción Registrada</th>
                    
                    <th className="py-3 px-4">SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {auditLogs.length===0&&<tr><td colSpan={3} className="p-6 text-center text-slate-500">No hay eventos registrados.</td></tr>}
                  {auditLogs.map(evt=><tr key={evt.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium text-blue-700">{evt.ticketId}</td><td className="px-4 py-3">{evt.action}</td><td className="px-4 py-3">{evt.slaStatus}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TICKET ASSIGNMENTS & REBALANCING (USER REQUEST)    */}
      {/* ========================================================= */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-lg p-6 border border-slate-200  space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                <span>Asignación y Rebalanceo de Tickets a Técnicos (FR-04)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Como Administrador, puedes ver todos los tickets activos y forzar o reasignar la tarea a cualquier técnico del equipo.
              </p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-bold px-3 py-1 rounded-full">
              {filteredTickets.length} tickets en periodo
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-xs text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Asunto</th>
                  <th className="py-3.5 px-4">Prioridad</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Técnico Asignado</th>
                  <th className="py-3.5 px-4 text-right">Acción del Administrador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-700">{t.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {t.asunto}
                      <span className="block text-xs text-slate-400 font-normal">Solicitó: {t.solicitante}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        t.prioridad === 'Crítica'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : t.prioridad === 'Alta'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.prioridad}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.estado === 'Resuelto' && (
                        <span className="bg-emerald-700 text-white font-bold text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resuelto</span>
                        </span>
                      )}
                      {t.estado === 'En progreso' && (
                        <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ">
                          <Clock className="w-3 h-3" />
                          <span>En progreso</span>
                        </span>
                      )}
                      {t.estado === 'Abierto' && (
                        <span className="bg-amber-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ">
                          <span>Abierto</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {t.asignacion === 'Sin asignar' ? (
                        <span className="text-red-600 bg-red-50 border border-red-200 text-xs px-2 py-0.5 rounded">
                          Sin asignar
                        </span>
                      ) : (
                        <span className="text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{t.asignacion}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicketForAssign(t);
                          setTargetTech(t.asignacion !== 'Sin asignar' ? t.asignacion : technicians[0]?.nombre || '');
                        }}
                        className="bg-slate-900 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg  transition"
                      >
                        Reasignar Técnico →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TEAM & CAPACITY MANAGEMENT (USER REQUEST)         */}
      {/* ========================================================= */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-lg p-6 border border-slate-200  space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Equipo de Soporte TI & Algoritmo Least-Loaded</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                El sistema distribuye nuevos tickets al técnico con menor carga activa de trabajo. Haz clic en cualquier técnico para ver sus estadísticas completas.
              </p>
            </div>
            <button
              onClick={() => setShowAddTechModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg  transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Dar de Alta Nuevo Técnico</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techWorkloads.map((tech) => {
              const isLeastLoaded = tech.ticketsActivos === minLoad;
              return (
                <div
                  key={tech.id}
                  onClick={() => setSelectedTechForStats(tech)}
                  className={`rounded-lg p-5 border transition-all cursor-pointer group hover:scale-[1.01] hover:border-blue-500 hover:shadow-md ${
                    isLeastLoaded
                      ? 'border-emerald-300 bg-emerald-50/30 '
                      : 'border-slate-200 bg-slate-50/40 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{tech.nombre}</h4>
                      <p className="text-xs text-slate-500">{tech.email}</p>
                    </div>
                    {isLeastLoaded && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Menor Carga (Siguiente)
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs border-t border-slate-200/70">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nivel de Soporte:</span>
                      <span className="font-semibold text-slate-800">{tech.nivel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Especialidad:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{tech.especialidad}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500">Tickets Activos:</span>
                      <span className="font-mono font-semibold text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {tech.ticketsActivos} {tech.ticketsActivos === 1 ? 'ticket' : 'tickets'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-800">
                    <span>Ver estadísticas & tickets</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REASIGNAR TICKET A TÉCNICO                          */}
      {/* ========================================================= */}
      {selectedTicketForAssign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reasignar Ticket</h3>
                <p className="text-xs text-slate-500">Acción ejecutiva del Administrador TI</p>
              </div>
              <button onClick={() => setSelectedTicketForAssign(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1">
              <div><strong className="text-slate-700">Ticket:</strong> <span className="font-mono text-blue-700 font-bold">{selectedTicketForAssign.id}</span></div>
              <div><strong className="text-slate-700">Asunto:</strong> <span className="text-slate-900">{selectedTicketForAssign.asunto}</span></div>
              <div><strong className="text-slate-700">Asignación previa:</strong> <span className="text-slate-600">{selectedTicketForAssign.asignacion}</span></div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Selecciona al nuevo Técnico responsable:
              </label>
              <select
                value={targetTech}
                onChange={(e) => setTargetTech(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {techWorkloads.map((tech) => (
                  <option key={tech.id} value={tech.nombre}>
                    {tech.nombre} ({tech.nivel}) — {tech.ticketsActivos} {tech.ticketsActivos === 1 ? 'ticket' : 'tickets'} {tech.ticketsActivos === minLoad ? '⭐ (Menor carga)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTicketForAssign(null)}
                className="text-xs text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg  transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar Reasignación</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DAR DE ALTA NUEVO TÉCNICO                           */}
      {/* ========================================================= */}
      {showAddTechModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Dar de Alta Técnico TI</h3>
                <p className="text-xs text-slate-500">Agrega un resolutor al pool de atención</p>
              </div>
              <button onClick={() => setShowAddTechModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newTechNombre}
                  onChange={(e) => setNewTechNombre(e.target.value)}
                  placeholder="ej: Mariana Soto Morales"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Corporativo</label>
                <input
                  type="email"
                  required
                  value={newTechEmail}
                  onChange={(e) => setNewTechEmail(e.target.value)}
                  placeholder="mariana.soto@delnorte.com.mx"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nivel de Soporte</label>
                <select
                  value={newTechNivel}
                  onChange={(e) => setNewTechNivel(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Nivel 1 (Mesa de Ayuda)">Nivel 1 (Mesa de Ayuda y Accesos)</option>
                  <option value="Nivel 2 (Especialista)">Nivel 2 (Especialista Software & ERP)</option>
                  <option value="Nivel 3 (Infraestructura)">Nivel 3 (Infraestructura & Telecomunicaciones)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Especialidad Principal</label>
                <input
                  type="text"
                  value={newTechEspecialidad}
                  onChange={(e) => setNewTechEspecialidad(e.target.value)}
                  placeholder="ej: Redes Wi-Fi, Impresoras Zebra, SAP"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTechModal(false)}
                  className="text-xs text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg "
                >
                  Guardar y Habilitar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ESTADÍSTICAS Y RENDIMIENTO DEL TÉCNICO (USER REQ)   */}
      {/* ========================================================= */}
      {selectedTechForStats && (() => {
        const techTickets = filteredTickets.filter(
          (t) => t.asignacion.toLowerCase().includes(selectedTechForStats.nombre.toLowerCase())
        );
        const resolvedCount = techTickets.filter((t) => t.estado === 'Resuelto').length;
        const activeCount = techTickets.filter((t) => t.estado !== 'Resuelto').length;
        const capacityPct = Math.min(Math.round((activeCount / 5) * 100), 100);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 text-white font-semibold text-lg flex items-center justify-center shadow-md">
                    {selectedTechForStats.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                        {selectedTechForStats.nombre}
                      </h3>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {selectedTechForStats.nivel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {selectedTechForStats.email} · Especialidad: {selectedTechForStats.especialidad}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTechForStats(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Performance KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-slate-500 uppercase">Carga Activa</div>
                  <div className="text-2xl font-semibold text-slate-900 mt-0.5">{activeCount}</div>
                  <div className="text-xs text-slate-400 font-medium">de 5 máx. concurrente</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-slate-500 uppercase">Resueltos</div>
                  <div className="text-2xl font-semibold text-emerald-600 mt-0.5">{resolvedCount}</div>
                  <div className="text-xs text-emerald-700 font-medium">Tickets registrados</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-slate-500 uppercase">Cumplimiento SLA</div>
                  <div className="text-2xl font-semibold text-blue-600 mt-0.5">Sin datos</div>
                  <div className="text-xs text-blue-700 font-medium">Meta: {'>'}92%</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-slate-500 uppercase">Satisfacción CSAT</div>
                  <div className="text-2xl font-semibold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                    <span>Sin datos</span>
                    
                  </div>
                  <div className="text-xs text-slate-500 font-medium">5.0 escala máx.</div>
                </div>
              </div>

              {/* Workload Progress Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Índice de saturación operativa (Least-Loaded)</span>
                  <span className="font-semibold text-slate-900">{capacityPct}% de capacidad</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      capacityPct > 80
                        ? 'bg-red-500'
                        : capacityPct > 40
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(capacityPct, 8)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {activeCount === 0
                    ? 'Técnico 100% disponible. El algoritmo asignará el próximo ticket entrante a este resolutor.'
                    : activeCount <= 2
                    ? 'Carga balanceada y óptima dentro de los parámetros de Grupo Industrial Delnorte.'
                    : 'Carga alta. Se recomienda rebalancear tickets antes de asignar nuevas incidencias críticas.'}
                </p>
              </div>

              {/* Assigned Tickets List */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Tickets en cartera asignada ({techTickets.length})
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">Gestión directa</span>
                </div>

                {techTickets.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs max-h-52 overflow-y-auto">
                    {techTickets.map((t) => (
                      <div key={t.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 transition">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-700 font-mono">{t.id}</span>
                            <span className="font-semibold text-slate-800 truncate max-w-xs">{t.asunto}</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Solicitó: {t.solicitante} · Cat: {t.categoria}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            t.prioridad === 'Crítica'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : t.prioridad === 'Alta'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {t.prioridad}
                          </span>

                          {t.estado === 'Resuelto' ? (
                            <span className="bg-emerald-700 text-white font-bold text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Resuelto</span>
                            </span>
                          ) : (
                            <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ">
                              <Clock className="w-3 h-3" />
                              <span>En progreso</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded-lg border border-slate-200/80 text-center italic">
                    Este técnico no tiene ningún ticket asignado actualmente.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">ID Técnico: {selectedTechForStats.id}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTechForStats(null);
                      setActiveTab('assignments');
                    }}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1"
                  >
                    <span>Rebalancear tickets de este técnico</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTechForStats(null)}
                    className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg font-semibold  transition"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL: VISTA PREVIA INFORME EJECUTIVO OFICIAL (PDF)        */}
      {/* ========================================================= */}
      <ExecutiveReportModal
        isOpen={showExecutiveReportModal}
        onClose={() => setShowExecutiveReportModal(false)}
        tickets={filteredTickets}
        technicians={technicians}
        periodoLabel={periodoLabel}
      />

    </div>
  );
};
