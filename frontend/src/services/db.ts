/**
 * BASE DE DATOS LOCAL Y PERSISTENCIA (RIALSA)
 * Maneja usuarios, tickets, notas y técnicos con persistencia en localStorage.
 * Inicializado con los datos oficiales del schema.sql de la Universidad / GID.
 */

import { UserAccount, TicketItem, TechnicianProfile, RoleMode, TicketPriority, AppNotification } from '../types/figma-tickets';

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
    estado: 'Abierto',
    asignacion: 'Sin asignar',
    fechaCreacion: '15 oct 2026 - 08:30',
    slaRestante: '00 h 45 min'
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
    slaRestante: '01 h 40 min'
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
    slaRestante: '03 h 20 min'
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
  }
];

// ====================================================================
// FUNCIONES CRUD CON LOCALSTORAGE
// ====================================================================

// Obtener todos los usuarios
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

// Guardar o registrar un usuario nuevo
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

  // Si ya existía por email, actualizarlo
  const existingIdx = users.findIndex((u) => u.email === newUser.email);
  if (existingIdx >= 0) {
    users[existingIdx] = newUser;
  } else {
    users.push(newUser);
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Si es técnico, darlo de alta también en el pool de técnicos
  if (newUser.rol === 'tecnico') {
    addTechnicianFromUser(newUser);
  }

  return newUser;
}

// Obtener el usuario en sesión actual (null si no ha iniciado sesión)
export function getCurrentSessionUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

// Establecer el usuario en sesión actual
export function setCurrentSessionUser(user: UserAccount | null) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

// Obtener los tickets persistentes
export function getStoredTickets(): TicketItem[] {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(DEFAULT_TICKETS));
      return DEFAULT_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TICKETS;
  }
}

// Guardar lista de tickets
export function saveStoredTickets(tickets: TicketItem[]) {
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
}

// Obtener los técnicos persistentes
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

// Guardar lista de técnicos
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
  }
}

// 5. Notificaciones Iniciales y Persistentes
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

