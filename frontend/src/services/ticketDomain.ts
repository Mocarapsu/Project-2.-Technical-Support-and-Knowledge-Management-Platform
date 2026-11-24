import { AppNotification, TicketItem, TicketPriority, UserAccount } from '../types/figma-tickets';

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
