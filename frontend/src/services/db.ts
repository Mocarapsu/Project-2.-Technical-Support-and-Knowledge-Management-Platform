/**
 * BASE DE DATOS LOCAL Y PERSISTENCIA (RIALSA)
 * Maneja usuarios, tickets, notas, técnicos y notificaciones.
 * Soporta arquitectura híbrida: LocalStorage + Supabase Cloud (PostgreSQL Realtime).
 */

import { UserAccount, TicketItem, TechnicianProfile, RoleMode, AppNotification } from '../types/figma-tickets';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const USERS_STORAGE_KEY = 'rialsa_db_users_v1';
const CURRENT_USER_KEY = 'rialsa_db_current_user_v1';
const TICKETS_STORAGE_KEY = 'rialsa_db_tickets_v1';
const TECHS_STORAGE_KEY = 'rialsa_db_techs_v1';
const NOTIFICATIONS_STORAGE_KEY = 'rialsa_db_notifications_v1';

// 1. Usuarios Oficiales de Prueba (Según backend-core/src/database/schema.sql)
export const DEFAULT_USERS: (UserAccount & { password?: string })[] = [
  {
    id: 'USR-01',
    nombre: 'Carlos Operador Planta',
    email: 'empleado@gid.com.mx',
    rol: 'empleado',
    departamento: 'Operaciones y Planta 1',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-02',
    nombre: 'Ricardo Daniel Hernández',
    email: 'ricardo@gid.com.mx',
    rol: 'empleado',
    departamento: 'Desarrollo Frontend / TI2',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-03',
    nombre: 'Alfredo González Soto',
    email: 'alfredo@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Mesa de Ayuda L2 / Backend',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-04',
    nombre: 'Salvador Rivera Delgado',
    email: 'salvador@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Microservicios IA & Automatización',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-05',
    nombre: 'Ing. José Luis Bautista',
    email: 'bautista@gid.com.mx',
    rol: 'admin',
    departamento: 'CISO / Dirección TI Central',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  }
];

// 2. Técnicos Iniciales con Nivel y Especialidad
export const DEFAULT_TECHNICIANS: TechnicianProfile[] = [
  {
    id: 'TECH-01',
    nombre: 'Ana Torres',
    email: 'ana.torres@delnorte.com.mx',
    especialidad: 'Mesa de Ayuda, Accesos & Cuentas',
    nivel: 'Nivel 1 (Mesa de Ayuda)',
    ticketsActivos: 1,
    estado: 'Disponible'
  },
  {
    id: 'TECH-02',
    nombre: 'Alfredo González Soto',
    email: 'alfredo@gid.com.mx',
    especialidad: 'Software, SAP ERP & Bases de Datos',
    nivel: 'Nivel 2 (Especialista)',
    ticketsActivos: 1,
    estado: 'Disponible'
  },
  {
    id: 'TECH-03',
    nombre: 'Carlos Mendoza',
    email: 'carlos.mendoza@delnorte.com.mx',
    especialidad: 'Infraestructura, Switches & Telecomunicaciones',
    nivel: 'Nivel 3 (Infraestructura)',
    ticketsActivos: 0,
    estado: 'En guardia'
  },
  {
    id: 'TECH-04',
    nombre: 'Salvador Rivera Delgado',
    email: 'salvador@gid.com.mx',
    especialidad: 'Microservicios de IA, RAG & Automatización',
    nivel: 'Nivel 2 (Especialista)',
    ticketsActivos: 0,
    estado: 'Disponible',
    isNext: true
  },
  {
    id: 'TECH-05',
    nombre: 'Ing. José Luis Bautista',
    email: 'bautista@gid.com.mx',
    especialidad: 'Ciberseguridad & Dirección de Operaciones TI',
    nivel: 'Nivel 3 (Infraestructura)',
    ticketsActivos: 1,
    estado: 'Disponible'
  }
];

// 3. Tickets Iniciales
export const DEFAULT_TICKETS: TicketItem[] = [
  {
    id: 'TCK-1045',
    asunto: 'ERP bloqueado al facturar remisión',
    solicitante: 'Carlos Operador Planta',
    prioridad: 'Crítica',
    categoria: 'Software',
    estado: 'Resuelto',
    asignacion: 'Salvador Rivera Delgado',
    fechaCreacion: '15 oct 2026 - 08:30',
    slaRestante: '00 h 00 min',
    comentariosPublicos: [
      {
        id: 'COM-00',
        autor: 'Carlos Operador Planta',
        rol: 'empleado',
        texto: 'Muchas gracias, ya pudimos facturar correctamente.',
        fecha: '15 oct 2026 - 11:20'
      }
    ]
  },
  {
    id: 'TCK-1046',
    asunto: 'Sin acceso a VPN desde casa',
    solicitante: 'Ricardo Daniel Hernández',
    prioridad: 'Alta',
    categoria: 'Acceso',
    estado: 'En progreso',
    asignacion: 'Ana Torres',
    fechaCreacion: '15 oct 2026 - 09:05',
    slaRestante: '01 h 40 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1047',
    asunto: 'Impresora térmica de etiquetas no responde',
    solicitante: 'Mario Díaz',
    prioridad: 'Media',
    categoria: 'Hardware',
    estado: 'Abierto',
    asignacion: 'Alfredo González Soto',
    fechaCreacion: '15 oct 2026 - 09:12',
    slaRestante: '03 h 20 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1048',
    asunto: 'Sin conexión VPN laptop fuera de oficina',
    solicitante: 'Carlos Operador Planta',
    prioridad: 'Alta',
    categoria: 'Acceso',
    estado: 'En progreso',
    asignacion: 'Mesa de ayuda - Nivel 1',
    fechaCreacion: '15 oct 2026 - 09:23',
    slaRestante: '01 h 12 min',
    comentariosPublicos: [
      {
        id: 'COM-01',
        autor: 'Carlos Operador Planta',
        rol: 'empleado',
        texto: 'He reiniciado el equipo y sigue mostrando el mismo error de autenticación con el servidor RADIUS.',
        fecha: '15 oct 2026 - 09:30'
      }
    ]
  },
  {
    id: 'TCK-1049',
    asunto: 'Fallo de red en conmutador planta',
    solicitante: 'Carlos Operador Planta',
    prioridad: 'Baja',
    categoria: 'Redes',
    estado: 'En progreso',
    asignacion: 'Carlos Mendoza',
    fechaCreacion: '15 oct 2026 - 08:45',
    slaRestante: '07 h 30 min',
    comentariosPublicos: []
  }
];

// ====================================================================
// FUNCIONES CRUD CON LOCALSTORAGE (Fallback & Cache Inmediato)
// ====================================================================

export function getStoredUsers(): (UserAccount & { password?: string })[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveNewUser(user: {
  nombre: string;
  email: string;
  rol: RoleMode;
  departamento?: string;
  password?: string;
}): UserAccount {
  const users = getStoredUsers();
  const nextId = `USR-0${users.length + 1}`;
  
  const newUser: UserAccount & { password?: string } = {
    id: nextId,
    nombre: user.nombre.trim(),
    email: user.email.toLowerCase().trim(),
    rol: user.rol,
    departamento: user.departamento?.trim() || 'General',
    estado: 'Activo',
    fechaRegistro: 'Hoy - En vivo',
    password: user.password || 'Password123!'
  };

  const existingIdx = users.findIndex((u) => u.email === newUser.email);
  if (existingIdx >= 0) {
    users[existingIdx] = newUser;
  } else {
    users.push(newUser);
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  if (newUser.rol === 'tecnico') {
    addTechnicianFromUser(newUser);
  }

  // Sincronizar en segundo plano con Supabase si está disponible
  if (isSupabaseConfigured && supabase) {
    supabase.from('users').upsert({
      id: newUser.id,
      nombre: newUser.nombre,
      email: newUser.email,
      rol: newUser.rol,
      departamento: newUser.departamento,
      estado: newUser.estado,
      fecha_registro: newUser.fechaRegistro,
      password: newUser.password
    }).then();
  }

  return newUser;
}

export function getCurrentSessionUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function setCurrentSessionUser(user: UserAccount | null) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function getStoredTickets(): TicketItem[] {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(DEFAULT_TICKETS));
      return DEFAULT_TICKETS;
    }
    const parsed: TicketItem[] = JSON.parse(raw);
    return parsed.map((t) => ({
      ...t,
      comentariosPublicos: Array.isArray(t.comentariosPublicos) ? t.comentariosPublicos : [],
      notasInternas: Array.isArray(t.notasInternas) ? t.notasInternas : [],
      historialAuditoria: Array.isArray(t.historialAuditoria) ? t.historialAuditoria : []
    }));
  } catch {
    return DEFAULT_TICKETS;
  }
}

export function saveStoredTickets(tickets: TicketItem[]) {
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
}

export function getStoredTechnicians(): TechnicianProfile[] {
  try {
    const raw = localStorage.getItem(TECHS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TECHS_STORAGE_KEY, JSON.stringify(DEFAULT_TECHNICIANS));
      return DEFAULT_TECHNICIANS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TECHNICIANS;
  }
}

export function saveStoredTechnicians(techs: TechnicianProfile[]) {
  try {
    localStorage.setItem(TECHS_STORAGE_KEY, JSON.stringify(techs));
  } catch {}
}

function addTechnicianFromUser(user: UserAccount) {
  const techs = getStoredTechnicians();
  if (!techs.some((t) => t.email === user.email)) {
    const newTech: TechnicianProfile = {
      id: `TECH-0${techs.length + 1}`,
      nombre: user.nombre,
      email: user.email,
      especialidad: user.departamento || 'Soporte General',
      nivel: 'Nivel 2 (Especialista)',
      ticketsActivos: 0,
      estado: 'Disponible'
    };
    techs.push(newTech);
    saveStoredTechnicians(techs);

    if (isSupabaseConfigured && supabase) {
      supabase.from('technicians').upsert({
        id: newTech.id,
        nombre: newTech.nombre,
        email: newTech.email,
        especialidad: newTech.especialidad,
        nivel: newTech.nivel,
        tickets_activos: 0,
        estado: newTech.estado
      }).then();
    }
  }
}

// 4. Notificaciones
export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-1',
    titulo: '📌 Ticket Asignado',
    mensaje: 'El Ticket TCK-1048 fue asignado a Mesa de ayuda - Nivel 1 mediante Least-Loaded.',
    tipo: 'asignacion',
    ticketId: 'TCK-1048',
    destinatarioRol: 'todos',
    leida: false,
    timestamp: 'Hoy 09:35'
  },
  {
    id: 'NOTIF-2',
    titulo: '💬 Nuevo Comentario en TCK-1046',
    mensaje: 'Carlos Operador Planta escribió: "He reiniciado el equipo y sigue mostrando el error..."',
    tipo: 'comentario',
    ticketId: 'TCK-1046',
    destinatarioRol: 'todos',
    leida: false,
    timestamp: 'Hoy 09:42'
  },
  {
    id: 'NOTIF-3',
    titulo: '🎉 Ticket Resuelto',
    mensaje: 'El Ticket TCK-1045 (ERP bloqueado al facturar) fue resuelto satisfactoriamente por Salvador Rivera.',
    tipo: 'estado',
    ticketId: 'TCK-1045',
    destinatarioRol: 'todos',
    leida: false,
    timestamp: 'Hoy 08:50'
  }
];

export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: AppNotification[]) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch {}
}

// ====================================================================
// CAPA DE SINCRONIZACIÓN EN TIEMPO REAL CON SUPABASE (POSTGRESQL CLOUD)
// ====================================================================

/**
 * Convierte un registro de PostgreSQL de Supabase al formato TicketItem de la app
 */
export function mapRowToTicket(row: any): TicketItem {
  return {
    id: row.id,
    asunto: row.asunto,
    solicitante: row.solicitante,
    prioridad: row.prioridad,
    categoria: row.categoria,
    estado: row.estado,
    asignacion: row.asignacion,
    departamento: row.departamento || undefined,
    fechaCreacion: row.fecha_creacion || undefined,
    slaRestante: row.sla_restante || undefined,
    notasInternas: Array.isArray(row.notas_internas) ? row.notas_internas : [],
    comentariosPublicos: Array.isArray(row.comentarios_publicos) ? row.comentarios_publicos : [],
    historialAuditoria: Array.isArray(row.historial_auditoria) ? row.historial_auditoria : []
  };
}

/**
 * Convierte un TicketItem al formato de fila para la tabla tickets en PostgreSQL
 */
export function mapTicketToRow(ticket: TicketItem): any {
  return {
    id: ticket.id,
    asunto: ticket.asunto,
    solicitante: ticket.solicitante,
    prioridad: ticket.prioridad,
    categoria: ticket.categoria,
    estado: ticket.estado,
    asignacion: ticket.asignacion,
    departamento: ticket.departamento || '',
    fecha_creacion: ticket.fechaCreacion || '',
    sla_restante: ticket.slaRestante || '',
    notas_internas: ticket.notasInternas || [],
    comentarios_publicos: ticket.comentariosPublicos || [],
    historial_auditoria: ticket.historialAuditoria || []
  };
}

/**
 * Sube o actualiza un ticket en Supabase Cloud
 */
export async function syncTicketToCloud(ticket: TicketItem): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const row = mapTicketToRow(ticket);
    const { error } = await supabase.from('tickets').upsert(row);
    if (error) {
      console.error('Error sincronizando ticket en Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Fallo de red en syncTicketToCloud:', err);
    return false;
  }
}

/**
 * Sube o actualiza una notificación en Supabase Cloud
 */
export async function syncNotificationToCloud(notif: AppNotification): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('notifications').upsert({
      id: notif.id,
      titulo: notif.titulo,
      mensaje: notif.mensaje,
      tipo: notif.tipo,
      ticket_id: notif.ticketId || null,
      destinatario_rol: notif.destinatarioRol,
      destinatario_usuario: notif.destinatarioUsuario || null,
      leida: notif.leida,
      timestamp: notif.timestamp
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Descarga todos los tickets remotos de Supabase
 */
export async function fetchRemoteTickets(): Promise<TicketItem[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Sync] Error al leer tabla tickets:', error.message, error.details || '');
      return null;
    }
    if (!data) return null;

    const cloudTickets = data.map(mapRowToTicket);
    saveStoredTickets(cloudTickets);
    return cloudTickets;
  } catch (err) {
    console.warn('No fue posible descargar tickets remotos:', err);
    return null;
  }
}

/**
 * Inicializa la sincronización de WebSockets en tiempo real
 */
export function initSupabaseSync(
  onTicketsChanged: (tickets: TicketItem[]) => void,
  onNotificationReceived?: (notif: AppNotification) => void
): () => void {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }

  // 1. Descarga inicial en vivo
  fetchRemoteTickets().then((cloudTickets) => {
    if (cloudTickets && cloudTickets.length > 0) {
      onTicketsChanged(cloudTickets);
    }
  });

  // 2. Suscripción en Tiempo Real (WebSockets de PostgreSQL)
  const channel = supabase
    .channel('rialsa_cloud_sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tickets' },
      async () => {
        const freshTickets = await fetchRemoteTickets();
        if (freshTickets) {
          onTicketsChanged(freshTickets);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload) => {
        if (onNotificationReceived && payload.new) {
          const row = payload.new;
          const notif: AppNotification = {
            id: row.id,
            titulo: row.titulo,
            mensaje: row.mensaje,
            tipo: row.tipo,
            ticketId: row.ticket_id || undefined,
            destinatarioRol: row.destinatario_rol,
            destinatarioUsuario: row.destinatario_usuario || undefined,
            leida: row.leida,
            timestamp: row.timestamp
          };
          onNotificationReceived(notif);
        }
      }
    )
    .subscribe();

  return () => {
    if (supabase) {
      supabase.removeChannel(channel);
    }
  };
}
