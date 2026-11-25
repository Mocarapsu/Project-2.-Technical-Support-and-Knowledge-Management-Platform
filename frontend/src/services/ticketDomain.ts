import { AppNotification, TicketItem, TicketPriority, UserAccount, TechnicianProfile } from '../types/figma-tickets';

export const CATEGORIES = ['Acceso', 'Software', 'Hardware', 'Redes'] as const;
export const PRIORITIES = ['Crítica', 'Alta', 'Media', 'Baja'] as const;
export function normalizeCategory(value?: string): string {
  const text = (value || '').trim();
  const key = text.toLowerCase();
  if (key === 'red' || key === 'redes' || key === 'red y conectividad') return 'Redes';
  if (key === 'acceso' || key === 'acceso y credenciales') return 'Acceso';
  if (key === 'software' || key === 'software y aplicaciones') return 'Software';
  if (key === 'hardware' || key === 'hardware y equipos') return 'Hardware';
  return text || 'Sin categoría';
}
export function normalizePriority(value?: string): TicketPriority {
  const p = PRIORITIES.find(v => v.toLowerCase() === (value || '').trim().toLowerCase());
  return p || 'No especificada';
}
export function slaText(ticket: TicketItem): string {
  if (ticket.estado === 'Resuelto') {
    if (ticket.resolvedAt && ticket.slaDeadline) return Date.parse(ticket.resolvedAt) <= Date.parse(ticket.slaDeadline) ? 'Cumplido' : 'Incumplido';
    return 'Cerrado';
  }
  if (ticket.slaDeadline) {
    const mins = Math.ceil((Date.parse(ticket.slaDeadline) - Date.now()) / 60000);
    if (mins <= 0) return 'Vencido';
    return `${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')} min`;
  }
  return ticket.slaRestante || 'No disponible';
}
export function normalizeTicket(ticket: TicketItem): TicketItem {
  return { ...ticket, prioridad: normalizePriority(ticket.prioridad), categoria: normalizeCategory(ticket.categoria), comentariosPublicos: ticket.comentariosPublicos || [], notasInternas: ticket.notasInternas || [], historialAuditoria: ticket.historialAuditoria || [] };
}
export function canViewTicket(ticket: TicketItem, user?: UserAccount | null): boolean {
  if (!user) return false;
  if (user.rol !== 'empleado') return true;
  return ticket.solicitanteId ? ticket.solicitanteId === user.id : ticket.solicitante.trim().toLowerCase() === user.nombre.trim().toLowerCase();
}
export function visibleTicket(ticket: TicketItem, user: UserAccount): TicketItem {
  return user.rol === 'empleado' ? { ...ticket, notasInternas: [], historialAuditoria: [] } : ticket;
}
export function recentActiveTicket(tickets: TicketItem[], user?: UserAccount | null): TicketItem | undefined {
  return tickets.filter(t => canViewTicket(t, user) && t.estado !== 'Resuelto').sort((a,b) => {
    const da = Date.parse(a.createdAt || ''), db = Date.parse(b.createdAt || '');
    if (Number.isFinite(da) && Number.isFinite(db) && da !== db) return db-da;
    return Number(b.id.replace(/\D/g,'')) - Number(a.id.replace(/\D/g,''));
  })[0];
}
export function notificationVisible(n: AppNotification, tickets: TicketItem[], user?: UserAccount | null) {
  if (!user) return false;
  if (n.destinatarioUsuario && n.destinatarioUsuario !== user.email) return false;
  if (n.destinatarioRol !== 'todos' && n.destinatarioRol !== user.rol) return false;
  if (n.ticketId && user.rol === 'empleado') return tickets.some(t => t.id === n.ticketId && canViewTicket(t, user));
  return true;
}
export function textOnlyIcon(value: string): string {
  return value.replace(/\p{Extended_Pictographic}[\uFE0F\u200D]*/gu, '').trim();
}

/**
 * Determina automáticamente la prioridad adecuada del ticket para evitar que los usuarios
 * abusen asignando 'Crítica' indiscriminadamente a cualquier reporte.
 */
export function determineAutomaticPriority(categoria?: string, asunto?: string, descripcion?: string): TicketPriority {
  const text = `${asunto || ''} ${descripcion || ''}`.toLowerCase();

  // 1. Alta criticidad: afectación severa de planta, línea detenida o riesgo de ciberseguridad
  const criticalPattern = /\b(caida total|planta parada|produccion parada|afecta toda la planta|urgencia maxima|ciberseguridad|ransomware|bloqueo masivo|servidor principal caido|linea detenida|no se puede despachar|sin energia en planta)\b/i;
  if (criticalPattern.test(text)) {
    return 'Crítica';
  }

  // 2. Prioridad Alta: servicios operativos centrales (ERP, SAP, VPN masiva, conmutador, facturación)
  const highPattern = /\b(vpn|acceso bloqueado|facturacion|sap no responde|conmutador|red caida|servidor|no puedo facturar|sin internet|puerto bloqueado|radius|imposible trabajar)\b/i;
  if (highPattern.test(text)) {
    return 'Alta';
  }

  // 3. Prioridad Baja: dudas, consultas o solicitudes de periféricos menores
  const lowPattern = /\b(consulta|duda|capacitacion|mantenimiento preventivo|icono|fondo|cambio de teclado|mouse|pad|cable auxiliar)\b/i;
  if (lowPattern.test(text)) {
    return 'Baja';
  }

  // 4. Por categoría técnica por defecto
  const cat = normalizeCategory(categoria).toLowerCase();
  if (cat === 'redes') return 'Alta';
  if (cat === 'software') return 'Media';
  if (cat === 'acceso') return 'Media';
  if (cat === 'hardware') return 'Media';

  return 'Media';
}

/**
 * Asignación automática inteligente por ESPECIALIDAD de rama + algoritmo LEAST-LOADED (menor carga activa).
 * Garantiza balance armónico entre técnicos especialistas de Grupo Industrial Delnorte.
 */
export function assignTechnicianLeastLoaded(
  category: string,
  technicians: TechnicianProfile[],
  tickets: TicketItem[]
): { technician: TechnicianProfile | null; load: number; reason: string } {
  if (!technicians.length) {
    return { technician: null, load: 0, reason: 'Sin técnicos en el directorio' };
  }

  const cat = normalizeCategory(category).toLowerCase();

  // Mapeo semántico de ramas a especialidades de los técnicos de GID
  const branchKeywords: Record<string, string[]> = {
    'acceso': ['acceso', 'cuentas', 'mesa de ayuda', 'credenciales', 'password', 'usuarios', 'directorio'],
    'software': ['software', 'sap', 'erp', 'base de datos', 'desarrollo', 'ia', 'automatización', 'microservicios', 'aplicaciones', 'datos'],
    'redes': ['red', 'redes', 'telecomunicaciones', 'switches', 'infraestructura', 'firewall', 'conectividad', 'router', 'ciberseguridad'],
    'hardware': ['hardware', 'equipos', 'impresoras', 'mantenimiento', 'periféricos', 'computadoras', 'laptop', 'mesa de ayuda']
  };

  const keywords = branchKeywords[cat] || [cat];

  // 1. Filtrar técnicos candidatos que pertenezcan a la especialidad de la rama
  let candidates = technicians.filter(tech => {
    const spec = `${tech.especialidad || ''} ${tech.nivel || ''}`.toLowerCase();
    return keywords.some(kw => spec.includes(kw));
  });

  let matchedBranch = true;
  if (candidates.length === 0) {
    candidates = technicians;
    matchedBranch = false;
  }

  // 2. Calcular la carga real de tickets activos (no resueltos) para cada candidato
  const candidatesWithLoad = candidates.map(tech => {
    const activeLoad = tickets.filter(
      t => t.estado !== 'Resuelto' && t.asignacion && t.asignacion.toLowerCase().includes(tech.nombre.toLowerCase())
    ).length;
    return {
      tech,
      load: activeLoad,
      isAvailable: tech.estado !== 'Ocupado'
    };
  });

  // 3. Ordenar por disponibilidad y menor carga activa (Least-Loaded)
  candidatesWithLoad.sort((a, b) => {
    if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
    if (a.load !== b.load) return a.load - b.load;
    return a.tech.nombre.localeCompare(b.tech.nombre);
  });

  const best = candidatesWithLoad[0];
  const reason = matchedBranch
    ? `Asignado automáticamente por especialidad (${category}) a ${best.tech.nombre} mediante Least-Loaded (${best.load} tickets activos)`
    : `Asignado automáticamente a ${best.tech.nombre} por menor carga activa (${best.load} tickets activos)`;

  return { technician: best.tech, load: best.load, reason };
}

/**
 * Obtiene la fecha exacta de creación de un ticket en formato Date nativo
 * para filtrado preciso por rangos de fecha en dashboards y reportes.
 */
export function getTicketDate(t: TicketItem): Date | null {
  if (t.createdAt) {
    const d = new Date(t.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (t.fechaCreacion) {
    const parsed = Date.parse(t.fechaCreacion);
    if (!isNaN(parsed)) return new Date(parsed);

    // Formatos en español como "15 oct 2026", "24 nov 2026 - 10:30"
    const match = t.fechaCreacion.match(/(\d{1,2})\s+([a-zA-ZáéíóúÁÉÍÓÚ]+)\s+(\d{4})/);
    if (match) {
      const months: Record<string, number> = {
        ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11
      };
      const m = months[match[2].toLowerCase().slice(0, 3)];
      if (m !== undefined) return new Date(Number(match[3]), m, Number(match[1]));
    }

    const slashMatch = t.fechaCreacion.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) return new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]));
  }
  return null;
}
