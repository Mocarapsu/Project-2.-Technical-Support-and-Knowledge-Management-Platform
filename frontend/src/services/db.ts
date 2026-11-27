/**
 * BASE DE DATOS LOCAL Y PERSISTENCIA (RIALSA)
 * Maneja usuarios, tickets, notas, técnicos y notificaciones.
 * Soporta arquitectura híbrida: LocalStorage + Supabase Cloud (PostgreSQL Realtime).
 */

import { UserAccount, TicketItem, TechnicianProfile, RoleMode, AppNotification } from '../types/figma-tickets';
import { supabase, isSupabaseConfigured, DEMO_MODE } from './supabaseClient';

import { normalizeTicket } from './ticketDomain';

const USERS_STORAGE_KEY = 'rialsa_db_users_v1';
const CURRENT_USER_KEY = 'rialsa_db_current_user_v1';
const TICKETS_STORAGE_KEY = 'rialsa_db_tickets_v1';
const TECHS_STORAGE_KEY = 'rialsa_db_techs_v1';
const NOTIFICATIONS_STORAGE_KEY = 'rialsa_db_notifications_v1';

// 1. Usuarios Oficiales de Prueba (Según backend-core/src/database/schema.sql)
export const DEFAULT_USERS: (UserAccount & { password?: string })[] = DEMO_MODE ? [
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
    departamento: 'Software, SAP ERP & Bases de Datos',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-04',
    nombre: 'Salvador Rivera Delgado',
    email: 'salvador@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Software, Microservicios IA & Automatización',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-05',
    nombre: 'Mariana Fuentes',
    email: 'mariana@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Software, Aplicaciones Web & Portales',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-06',
    nombre: 'Carlos Mendoza',
    email: 'carlos@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Redes, Switches & Telecomunicaciones',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-07',
    nombre: 'Roberto Villarreal',
    email: 'roberto@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Redes, Cableado Estructurado & Firewall',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-08',
    nombre: 'Elena Ramos',
    email: 'elena@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Redes Industriales & Telecomunicaciones',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-09',
    nombre: 'Héctor Ramírez',
    email: 'hector@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Hardware, Servidores Físicos & Mantenimiento',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-10',
    nombre: 'Fernando Garza',
    email: 'fernando@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Hardware, Impresoras Térmicas & Periféricos',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-11',
    nombre: 'Ana Torres',
    email: 'ana@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Acceso, Cuentas & Mesa de Ayuda',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-12',
    nombre: 'Laura Medina',
    email: 'laura@gid.com.mx',
    rol: 'tecnico',
    departamento: 'Acceso, Directorio Activo & Credenciales',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  },
  {
    id: 'USR-13',
    nombre: 'Ing. José Luis Bautista',
    email: 'bautista@gid.com.mx',
    rol: 'admin',
    departamento: 'CISO / Dirección TI Central',
    estado: 'Activo',
    fechaRegistro: '15 oct 2026',
    password: 'Password123!'
  }
] : [];

// 2. Técnicos Iniciales con Nivel y Especialidad por Ramas
export const DEFAULT_TECHNICIANS: TechnicianProfile[] = DEMO_MODE ? [
  // Rama: Redes y Telecomunicaciones
  {
    id: 'TECH-01',
    nombre: 'Carlos Mendoza',
    email: 'carlos@gid.com.mx',
    especialidad: 'Redes, Switches & Telecomunicaciones',
    nivel: 'Nivel 3 (Infraestructura)',
    ticketsActivos: 3,
    estado: 'Disponible'
  },
  {
    id: 'TECH-02',
    nombre: 'Roberto Villarreal',
    email: 'roberto@gid.com.mx',
    especialidad: 'Redes, Cableado Estructurado & Firewall',
    nivel: 'Nivel 2 (Especialista)',
    ticketsActivos: 1,
    estado: 'Disponible'
  },
  {
    id: 'TECH-03',
    nombre: 'Elena Ramos',
    email: 'elena@gid.com.mx',
    especialidad: 'Redes Industriales & Telecomunicaciones',
    nivel: 'Nivel 2 (Especialista)',
    ticketsActivos: 2,
    estado: 'Disponible'
  },
  // Rama: Software y Aplicaciones
  {
    id: 'TECH-04',
    nombre: 'Alfredo González Soto',
    email: 'alfredo@gid.com.mx',
    especialidad: 'Software, SAP ERP & Bases de Datos',
    nivel: 'Nivel 2 (Especialista)',
    ticketsActivos: 4,
    estado: 'Disponible'
  },
  {
    id: 'TECH-05',
    nombre: 'Salvador Rivera Delgado',
    email: 'salvador@gid.com.mx',
    especialidad: 'Software, Microservicios IA & Automatización',
    nivel: 'Nivel 2 (Especialista)',
    ticketsActivos: 1,
    estado: 'Disponible'
  },
  {
    id: 'TECH-06',
    nombre: 'Mariana Fuentes',
    email: 'mariana@gid.com.mx',
    especialidad: 'Software, Aplicaciones Web & Portales',
    nivel: 'Nivel 2 (Especialista)',
    ticketsActivos: 2,
    estado: 'Disponible'
  },
  // Rama: Hardware y Equipos
  {
    id: 'TECH-07',
    nombre: 'Héctor Ramírez',
    email: 'hector@gid.com.mx',
    especialidad: 'Hardware, Servidores Físicos & Mantenimiento',
    nivel: 'Nivel 1 (Mesa de Ayuda)',
    ticketsActivos: 3,
    estado: 'Disponible'
  },
  {
    id: 'TECH-08',
    nombre: 'Fernando Garza',
    email: 'fernando@gid.com.mx',
    especialidad: 'Hardware, Impresoras Térmicas & Periféricos',
    nivel: 'Nivel 1 (Mesa de Ayuda)',
    ticketsActivos: 1,
    estado: 'Disponible'
  },
  // Rama: Acceso y Directorio
  {
    id: 'TECH-09',
    nombre: 'Ana Torres',
    email: 'ana@gid.com.mx',
    especialidad: 'Acceso, Cuentas & Mesa de Ayuda',
    nivel: 'Nivel 1 (Mesa de Ayuda)',
    ticketsActivos: 2,
    estado: 'Disponible'
  },
  {
    id: 'TECH-10',
    nombre: 'Laura Medina',
    email: 'laura@gid.com.mx',
    especialidad: 'Acceso, Directorio Activo & Credenciales',
    nivel: 'Nivel 1 (Mesa de Ayuda)',
    ticketsActivos: 3,
    estado: 'Disponible'
  }
] : [];

// 3. Tickets Iniciales
export const DEFAULT_TICKETS: TicketItem[] = DEMO_MODE ? [
  // --- REDES Y TELECOMUNICACIONES ---
  // Carlos Mendoza (3 activos, 2 resueltos)
  {
    id: 'TCK-1049',
    asunto: 'Caída intermitente en switch troncal de Planta 2',
    solicitante: 'Carlos Operador Planta',
    solicitanteId: 'USR-01',
    departamento: 'Operaciones / Planta 2',
    prioridad: 'Alta',
    categoria: 'Redes',
    estado: 'En progreso',
    asignacion: 'Carlos Mendoza',
    fechaCreacion: '24 nov 2026 - 08:45',
    createdAt: '2026-11-24T08:45:00.000Z',
    slaDeadline: '2026-11-24T12:45:00.000Z',
    slaRestante: '03 h 30 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1056',
    asunto: 'Pérdida de paquetes en enlace de fibra óptica Planta 1 a Almacén',
    solicitante: 'Martín Soto Carrillo',
    solicitanteId: 'USR-04',
    departamento: 'Almacén y Logística',
    prioridad: 'Crítica',
    categoria: 'Redes',
    estado: 'En progreso',
    asignacion: 'Carlos Mendoza',
    fechaCreacion: '25 nov 2026 - 09:10',
    createdAt: '2026-11-25T09:10:00.000Z',
    slaDeadline: '2026-11-25T11:10:00.000Z',
    slaRestante: '01 h 20 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1057',
    asunto: 'Reconfiguración de puertos de seguridad 802.1X en oficinas de compras',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Media',
    categoria: 'Redes',
    estado: 'Abierto',
    asignacion: 'Carlos Mendoza',
    fechaCreacion: '26 nov 2026 - 10:20',
    createdAt: '2026-11-26T10:20:00.000Z',
    slaDeadline: '2026-11-26T18:20:00.000Z',
    slaRestante: '06 h 15 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1058',
    asunto: 'Sustitución de transceptor SFP+ en router perimetral Cisco',
    solicitante: 'Guillermo Espinoza Díaz',
    solicitanteId: 'USR-08',
    departamento: 'Operaciones / Planta 1',
    prioridad: 'Alta',
    categoria: 'Redes',
    estado: 'Resuelto',
    asignacion: 'Carlos Mendoza',
    fechaCreacion: '18 nov 2026 - 11:00',
    createdAt: '2026-11-18T11:00:00.000Z',
    resolvedAt: '2026-11-18T13:45:00.000Z',
    slaDeadline: '2026-11-18T15:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: [
      {
        id: 'COM-1058',
        autor: 'Carlos Mendoza',
        rol: 'tecnico',
        texto: 'Se reemplazó módulo óptico defectuoso, enlace operando a 10Gbps con 0% de pérdidas.',
        fecha: '18 nov 2026 - 13:45'
      }
    ]
  },
  {
    id: 'TCK-1059',
    asunto: 'Configuración de enrutamiento estático para nuevo enlace de respaldo',
    solicitante: 'Ing. José Luis Bautista',
    solicitanteId: 'USR-13',
    departamento: 'TI y Sistemas',
    prioridad: 'Media',
    categoria: 'Redes',
    estado: 'Resuelto',
    asignacion: 'Carlos Mendoza',
    fechaCreacion: '15 nov 2026 - 14:00',
    createdAt: '2026-11-15T14:00:00.000Z',
    resolvedAt: '2026-11-15T17:10:00.000Z',
    slaDeadline: '2026-11-15T22:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },

  // Elena Ramos (2 activos, 2 resueltos)
  {
    id: 'TCK-1055',
    asunto: 'Fallo intermitente en enlace inalámbrico de almacén general',
    solicitante: 'Carlos Operador Planta',
    solicitanteId: 'USR-01',
    departamento: 'Almacén y Logística',
    prioridad: 'Media',
    categoria: 'Redes',
    estado: 'En progreso',
    asignacion: 'Elena Ramos',
    fechaCreacion: '24 nov 2026 - 11:45',
    createdAt: '2026-11-24T11:45:00.000Z',
    slaDeadline: '2026-11-24T19:45:00.000Z',
    slaRestante: '05 h 15 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1060',
    asunto: 'Interferencia electromagnética en cableado de sensor en horno 3',
    solicitante: 'Javier Gutiérrez Peña',
    solicitanteId: 'USR-06',
    departamento: 'Operaciones / Planta 2',
    prioridad: 'Alta',
    categoria: 'Redes',
    estado: 'En progreso',
    asignacion: 'Elena Ramos',
    fechaCreacion: '26 nov 2026 - 08:30',
    createdAt: '2026-11-26T08:30:00.000Z',
    slaDeadline: '2026-11-26T12:30:00.000Z',
    slaRestante: '02 h 15 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1061',
    asunto: 'Calibración de puntos de acceso WiFi AP-08 y AP-09 en nave B',
    solicitante: 'Daniela Pacheco Ortiz',
    solicitanteId: 'USR-11',
    departamento: 'Operaciones / Planta 2',
    prioridad: 'Media',
    categoria: 'Redes',
    estado: 'Resuelto',
    asignacion: 'Elena Ramos',
    fechaCreacion: '19 nov 2026 - 10:00',
    createdAt: '2026-11-19T10:00:00.000Z',
    resolvedAt: '2026-11-19T13:20:00.000Z',
    slaDeadline: '2026-11-19T18:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1062',
    asunto: 'Instalación de repetidor industrial en zona de carga pesada',
    solicitante: 'Alejandro Ruiz Morales',
    solicitanteId: 'USR-10',
    departamento: 'Almacén y Logística',
    prioridad: 'Baja',
    categoria: 'Redes',
    estado: 'Resuelto',
    asignacion: 'Elena Ramos',
    fechaCreacion: '14 nov 2026 - 15:30',
    createdAt: '2026-11-14T15:30:00.000Z',
    resolvedAt: '2026-11-15T09:00:00.000Z',
    slaDeadline: '2026-11-15T15:30:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },

  // Roberto Villarreal (1 activo - LEAST LOADED EN REDES, 3 resueltos)
  {
    id: 'TCK-1063',
    asunto: 'Revisión de parcheo y etiquetado de rack de servidores RACK-03',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Media',
    categoria: 'Redes',
    estado: 'En progreso',
    asignacion: 'Roberto Villarreal',
    fechaCreacion: '26 nov 2026 - 11:00',
    createdAt: '2026-11-26T11:00:00.000Z',
    slaDeadline: '2026-11-26T19:00:00.000Z',
    slaRestante: '04 h 50 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1052',
    asunto: 'Configuración de VLAN para báscula de pesaje en patio',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Alta',
    categoria: 'Redes',
    estado: 'Resuelto',
    asignacion: 'Roberto Villarreal',
    fechaCreacion: '20 nov 2026 - 11:00',
    createdAt: '2026-11-20T11:00:00.000Z',
    resolvedAt: '2026-11-20T14:15:00.000Z',
    slaDeadline: '2026-11-20T15:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1064',
    asunto: 'Reglas de filtrado en Firewall Fortinet para servicio de facturación',
    solicitante: 'Lucía Torres Valenzuela',
    solicitanteId: 'USR-02',
    departamento: 'Finanzas y Facturación',
    prioridad: 'Alta',
    categoria: 'Redes',
    estado: 'Resuelto',
    asignacion: 'Roberto Villarreal',
    fechaCreacion: '17 nov 2026 - 09:30',
    createdAt: '2026-11-17T09:30:00.000Z',
    resolvedAt: '2026-11-17T12:00:00.000Z',
    slaDeadline: '2026-11-17T13:30:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1065',
    asunto: 'Sustitución de cable UTP categoría 6 dañado por montacargas',
    solicitante: 'Martín Soto Carrillo',
    solicitanteId: 'USR-04',
    departamento: 'Almacén y Logística',
    prioridad: 'Media',
    categoria: 'Redes',
    estado: 'Resuelto',
    asignacion: 'Roberto Villarreal',
    fechaCreacion: '12 nov 2026 - 16:00',
    createdAt: '2026-11-12T16:00:00.000Z',
    resolvedAt: '2026-11-12T18:30:00.000Z',
    slaDeadline: '2026-11-13T00:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },

  // --- SOFTWARE Y APLICACIONES ---
  // Alfredo González Soto (4 activos - SATURADO DE CARGA, 2 resueltos)
  {
    id: 'TCK-1051',
    asunto: 'Error en transacciones RFC de facturación SAP FI/CO',
    solicitante: 'Carlos Operador Planta',
    solicitanteId: 'USR-01',
    departamento: 'Operaciones / Planta 1',
    prioridad: 'Alta',
    categoria: 'Software',
    estado: 'En progreso',
    asignacion: 'Alfredo González Soto',
    fechaCreacion: '24 nov 2026 - 10:30',
    createdAt: '2026-11-24T10:30:00.000Z',
    slaDeadline: '2026-11-24T14:30:00.000Z',
    slaRestante: '02 h 45 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1066',
    asunto: 'Bloqueo de tablas en base de datos PostgreSQL de producción',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Crítica',
    categoria: 'Software',
    estado: 'En progreso',
    asignacion: 'Alfredo González Soto',
    fechaCreacion: '25 nov 2026 - 08:15',
    createdAt: '2026-11-25T08:15:00.000Z',
    slaDeadline: '2026-11-25T10:15:00.000Z',
    slaRestante: '00 h 45 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1067',
    asunto: 'Fallo al contabilizar remisiones masivas de fin de mes en SAP',
    solicitante: 'Brenda Castro Méndez',
    solicitanteId: 'USR-09',
    departamento: 'Finanzas y Facturación',
    prioridad: 'Alta',
    categoria: 'Software',
    estado: 'En progreso',
    asignacion: 'Alfredo González Soto',
    fechaCreacion: '26 nov 2026 - 09:40',
    createdAt: '2026-11-26T09:40:00.000Z',
    slaDeadline: '2026-11-26T13:40:00.000Z',
    slaRestante: '03 h 10 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1068',
    asunto: 'Desincronización de catálogos de proveedores en portal ERP',
    solicitante: 'Lucía Torres Valenzuela',
    solicitanteId: 'USR-02',
    departamento: 'Finanzas y Facturación',
    prioridad: 'Media',
    categoria: 'Software',
    estado: 'Abierto',
    asignacion: 'Alfredo González Soto',
    fechaCreacion: '26 nov 2026 - 11:20',
    createdAt: '2026-11-26T11:20:00.000Z',
    slaDeadline: '2026-11-26T19:20:00.000Z',
    slaRestante: '07 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1069',
    asunto: 'Depuración de logs de transacciones en servidor SAP ECC',
    solicitante: 'Ing. José Luis Bautista',
    solicitanteId: 'USR-13',
    departamento: 'TI y Sistemas',
    prioridad: 'Media',
    categoria: 'Software',
    estado: 'Resuelto',
    asignacion: 'Alfredo González Soto',
    fechaCreacion: '20 nov 2026 - 15:00',
    createdAt: '2026-11-20T15:00:00.000Z',
    resolvedAt: '2026-11-20T18:20:00.000Z',
    slaDeadline: '2026-11-20T23:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1070',
    asunto: 'Actualización de certificados de timbrado CFDI con SAT',
    solicitante: 'Brenda Castro Méndez',
    solicitanteId: 'USR-09',
    departamento: 'Finanzas y Facturación',
    prioridad: 'Alta',
    categoria: 'Software',
    estado: 'Resuelto',
    asignacion: 'Alfredo González Soto',
    fechaCreacion: '16 nov 2026 - 09:00',
    createdAt: '2026-11-16T09:00:00.000Z',
    resolvedAt: '2026-11-16T11:30:00.000Z',
    slaDeadline: '2026-11-16T13:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },

  // Mariana Fuentes (2 activos, 2 resueltos)
  {
    id: 'TCK-1071',
    asunto: 'Incompatibilidad de visualización en panel de pedidos para clientes',
    solicitante: 'Paola Navarro Beltrán',
    solicitanteId: 'USR-07',
    departamento: 'Ventas y Comercial',
    prioridad: 'Media',
    categoria: 'Software',
    estado: 'En progreso',
    asignacion: 'Mariana Fuentes',
    fechaCreacion: '25 nov 2026 - 11:30',
    createdAt: '2026-11-25T11:30:00.000Z',
    slaDeadline: '2026-11-25T19:30:00.000Z',
    slaRestante: '04 h 20 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1072',
    asunto: 'Error 500 al adjuntar fichas técnicas en cotizador web',
    solicitante: 'Paola Navarro Beltrán',
    solicitanteId: 'USR-07',
    departamento: 'Ventas y Comercial',
    prioridad: 'Alta',
    categoria: 'Software',
    estado: 'Abierto',
    asignacion: 'Mariana Fuentes',
    fechaCreacion: '26 nov 2026 - 10:15',
    createdAt: '2026-11-26T10:15:00.000Z',
    slaDeadline: '2026-11-26T14:15:00.000Z',
    slaRestante: '03 h 40 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1073',
    asunto: 'Publicación de nuevo formulario de encuestas de clima laboral',
    solicitante: 'Sofía López Arreola',
    solicitanteId: 'USR-05',
    departamento: 'Recursos Humanos',
    prioridad: 'Baja',
    categoria: 'Software',
    estado: 'Resuelto',
    asignacion: 'Mariana Fuentes',
    fechaCreacion: '21 nov 2026 - 10:00',
    createdAt: '2026-11-21T10:00:00.000Z',
    resolvedAt: '2026-11-21T15:40:00.000Z',
    slaDeadline: '2026-11-22T10:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1074',
    asunto: 'Corrección de estilos CSS en encabezado de reportes PDF',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Baja',
    categoria: 'Software',
    estado: 'Resuelto',
    asignacion: 'Mariana Fuentes',
    fechaCreacion: '18 nov 2026 - 14:20',
    createdAt: '2026-11-18T14:20:00.000Z',
    resolvedAt: '2026-11-18T16:50:00.000Z',
    slaDeadline: '2026-11-19T14:20:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },

  // Salvador Rivera Delgado (1 activo - LEAST LOADED EN SOFTWARE, 4 resueltos)
  {
    id: 'TCK-1050',
    asunto: 'Optimización de microservicio RAG e indexación de artículos TI',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Media',
    categoria: 'Software',
    estado: 'En progreso',
    asignacion: 'Salvador Rivera Delgado',
    fechaCreacion: '26 nov 2026 - 10:00',
    createdAt: '2026-11-26T10:00:00.000Z',
    slaDeadline: '2026-11-26T18:00:00.000Z',
    slaRestante: '04 h 15 min',
    comentariosPublicos: [
      {
        id: 'COM-02',
        autor: 'Salvador Rivera Delgado',
        rol: 'tecnico',
        texto: 'Se optimizó el pipeline de embeddings y la tasa de acierto del asistente IA subió al 92%.',
        fecha: '26 nov 2026 - 10:15'
      }
    ]
  },
  {
    id: 'TCK-1045',
    asunto: 'ERP bloqueado al facturar remisión',
    solicitante: 'Carlos Operador Planta',
    solicitanteId: 'USR-01',
    departamento: 'Operaciones / Planta 1',
    prioridad: 'Crítica',
    categoria: 'Software',
    estado: 'Resuelto',
    asignacion: 'Salvador Rivera Delgado',
    fechaCreacion: '15 nov 2026 - 08:30',
    createdAt: '2026-11-15T08:30:00.000Z',
    resolvedAt: '2026-11-15T10:15:00.000Z',
    slaDeadline: '2026-11-15T10:30:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: [
      {
        id: 'COM-00',
        autor: 'Carlos Operador Planta',
        rol: 'empleado',
        texto: 'Muchas gracias, ya pudimos facturar correctamente.',
        fecha: '15 nov 2026 - 10:20'
      }
    ]
  },
  {
    id: 'TCK-1075',
    asunto: 'Automatización de respaldo nocturno de base de datos PostgreSQL',
    solicitante: 'Ing. José Luis Bautista',
    solicitanteId: 'USR-13',
    departamento: 'TI y Sistemas',
    prioridad: 'Alta',
    categoria: 'Software',
    estado: 'Resuelto',
    asignacion: 'Salvador Rivera Delgado',
    fechaCreacion: '19 nov 2026 - 16:00',
    createdAt: '2026-11-19T16:00:00.000Z',
    resolvedAt: '2026-11-19T18:40:00.000Z',
    slaDeadline: '2026-11-19T20:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1076',
    asunto: 'Integración de webhook para alertas críticas en Teams/Discord',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Media',
    categoria: 'Software',
    estado: 'Resuelto',
    asignacion: 'Salvador Rivera Delgado',
    fechaCreacion: '13 nov 2026 - 11:15',
    createdAt: '2026-11-13T11:15:00.000Z',
    resolvedAt: '2026-11-13T14:30:00.000Z',
    slaDeadline: '2026-11-13T19:15:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1077',
    asunto: 'Ajuste en algoritmo Least-Loaded de balanceo inteligente de tickets',
    solicitante: 'Ing. José Luis Bautista',
    solicitanteId: 'USR-13',
    departamento: 'TI y Sistemas',
    prioridad: 'Media',
    categoria: 'Software',
    estado: 'Resuelto',
    asignacion: 'Salvador Rivera Delgado',
    fechaCreacion: '10 nov 2026 - 09:30',
    createdAt: '2026-11-10T09:30:00.000Z',
    resolvedAt: '2026-11-10T12:10:00.000Z',
    slaDeadline: '2026-11-10T17:30:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },

  // --- HARDWARE Y EQUIPOS ---
  // Héctor Ramírez (3 activos, 2 resueltos)
  {
    id: 'TCK-1047',
    asunto: 'Impresora térmica de etiquetas no responde',
    solicitante: 'Carlos Operador Planta',
    solicitanteId: 'USR-01',
    departamento: 'Operaciones / Planta 1',
    prioridad: 'Media',
    categoria: 'Hardware',
    estado: 'En progreso',
    asignacion: 'Héctor Ramírez',
    fechaCreacion: '24 nov 2026 - 09:12',
    createdAt: '2026-11-24T09:12:00.000Z',
    slaDeadline: '2026-11-24T17:12:00.000Z',
    slaRestante: '03 h 20 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1078',
    asunto: 'Fallo en ventilador de fuente de poder en Servidor Dell PowerEdge',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Crítica',
    categoria: 'Hardware',
    estado: 'En progreso',
    asignacion: 'Héctor Ramírez',
    fechaCreacion: '25 nov 2026 - 08:50',
    createdAt: '2026-11-25T08:50:00.000Z',
    slaDeadline: '2026-11-25T10:50:00.000Z',
    slaRestante: '01 h 05 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1079',
    asunto: 'Ruido anormal y calentamiento en equipo de cómputo de báscula',
    solicitante: 'Jorge Salazar Luna',
    solicitanteId: 'USR-12',
    departamento: 'Operaciones / Planta 1',
    prioridad: 'Alta',
    categoria: 'Hardware',
    estado: 'Abierto',
    asignacion: 'Héctor Ramírez',
    fechaCreacion: '26 nov 2026 - 09:15',
    createdAt: '2026-11-26T09:15:00.000Z',
    slaDeadline: '2026-11-26T13:15:00.000Z',
    slaRestante: '03 h 10 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1080',
    asunto: 'Mantenimiento preventivo de soplado y limpieza en rack de control',
    solicitante: 'Guillermo Espinoza Díaz',
    solicitanteId: 'USR-08',
    departamento: 'Operaciones / Planta 1',
    prioridad: 'Baja',
    categoria: 'Hardware',
    estado: 'Resuelto',
    asignacion: 'Héctor Ramírez',
    fechaCreacion: '22 nov 2026 - 14:00',
    createdAt: '2026-11-22T14:00:00.000Z',
    resolvedAt: '2026-11-22T17:30:00.000Z',
    slaDeadline: '2026-11-23T14:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1081',
    asunto: 'Sustitución de disco duro mecánico por SSD en estación de empaque',
    solicitante: 'Carlos Operador Planta',
    solicitanteId: 'USR-01',
    departamento: 'Operaciones / Planta 1',
    prioridad: 'Media',
    categoria: 'Hardware',
    estado: 'Resuelto',
    asignacion: 'Héctor Ramírez',
    fechaCreacion: '17 nov 2026 - 11:20',
    createdAt: '2026-11-17T11:20:00.000Z',
    resolvedAt: '2026-11-17T14:50:00.000Z',
    slaDeadline: '2026-11-17T19:20:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },

  // Fernando Garza (1 activo - LEAST LOADED EN HARDWARE, 3 resueltos)
  {
    id: 'TCK-1082',
    asunto: 'Atasco persistente de etiquetas en impresora Zebra ZD220',
    solicitante: 'Martín Soto Carrillo',
    solicitanteId: 'USR-04',
    departamento: 'Almacén y Logística',
    prioridad: 'Media',
    categoria: 'Hardware',
    estado: 'En progreso',
    asignacion: 'Fernando Garza',
    fechaCreacion: '26 nov 2026 - 10:45',
    createdAt: '2026-11-26T10:45:00.000Z',
    slaDeadline: '2026-11-26T18:45:00.000Z',
    slaRestante: '04 h 30 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1053',
    asunto: 'Sustitución de rodillo y calibración de sensor en Zebra ZT411',
    solicitante: 'Carlos Operador Planta',
    solicitanteId: 'USR-01',
    departamento: 'Operaciones / Planta 1',
    prioridad: 'Media',
    categoria: 'Hardware',
    estado: 'Resuelto',
    asignacion: 'Fernando Garza',
    fechaCreacion: '23 nov 2026 - 11:15',
    createdAt: '2026-11-23T11:15:00.000Z',
    resolvedAt: '2026-11-23T13:40:00.000Z',
    slaDeadline: '2026-11-23T19:15:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1083',
    asunto: 'Fallo en lector de código de barras USB en estación de recepción',
    solicitante: 'Alejandro Ruiz Morales',
    solicitanteId: 'USR-10',
    departamento: 'Almacén y Logística',
    prioridad: 'Media',
    categoria: 'Hardware',
    estado: 'Resuelto',
    asignacion: 'Fernando Garza',
    fechaCreacion: '19 nov 2026 - 09:30',
    createdAt: '2026-11-19T09:30:00.000Z',
    resolvedAt: '2026-11-19T11:15:00.000Z',
    slaDeadline: '2026-11-19T17:30:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1084',
    asunto: 'Instalación de monitor secundario para analista de compras',
    solicitante: 'Lucía Torres Valenzuela',
    solicitanteId: 'USR-02',
    departamento: 'Finanzas y Facturación',
    prioridad: 'Baja',
    categoria: 'Hardware',
    estado: 'Resuelto',
    asignacion: 'Fernando Garza',
    fechaCreacion: '15 nov 2026 - 15:00',
    createdAt: '2026-11-15T15:00:00.000Z',
    resolvedAt: '2026-11-16T10:00:00.000Z',
    slaDeadline: '2026-11-16T15:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },

  // --- ACCESO Y SEGURIDAD ---
  // Laura Medina (3 activos, 2 resueltos)
  {
    id: 'TCK-1048',
    asunto: 'Desbloqueo de token y restablecimiento de contraseña RADIUS',
    solicitante: 'Carlos Operador Planta',
    solicitanteId: 'USR-01',
    departamento: 'Operaciones / Planta 1',
    prioridad: 'Alta',
    categoria: 'Acceso',
    estado: 'En progreso',
    asignacion: 'Laura Medina',
    fechaCreacion: '24 nov 2026 - 09:23',
    createdAt: '2026-11-24T09:23:00.000Z',
    slaDeadline: '2026-11-24T13:23:00.000Z',
    slaRestante: '01 h 12 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1085',
    asunto: 'Bloqueo preventivo de cuenta por intentos fallidos de inicio de sesión',
    solicitante: 'Brenda Castro Méndez',
    solicitanteId: 'USR-09',
    departamento: 'Finanzas y Facturación',
    prioridad: 'Alta',
    categoria: 'Acceso',
    estado: 'En progreso',
    asignacion: 'Laura Medina',
    fechaCreacion: '26 nov 2026 - 08:20',
    createdAt: '2026-11-26T08:20:00.000Z',
    slaDeadline: '2026-11-26T12:20:00.000Z',
    slaRestante: '01 h 40 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1086',
    asunto: 'Revocación de accesos por baja laboral en departamento de cobranza',
    solicitante: 'Sofía López Arreola',
    solicitanteId: 'USR-05',
    departamento: 'Recursos Humanos',
    prioridad: 'Crítica',
    categoria: 'Acceso',
    estado: 'Abierto',
    asignacion: 'Laura Medina',
    fechaCreacion: '26 nov 2026 - 11:10',
    createdAt: '2026-11-26T11:10:00.000Z',
    slaDeadline: '2026-11-26T13:10:00.000Z',
    slaRestante: '01 h 30 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1087',
    asunto: 'Asignación de roles de solo lectura en Active Directory',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Media',
    categoria: 'Acceso',
    estado: 'Resuelto',
    asignacion: 'Laura Medina',
    fechaCreacion: '21 nov 2026 - 11:00',
    createdAt: '2026-11-21T11:00:00.000Z',
    resolvedAt: '2026-11-21T13:15:00.000Z',
    slaDeadline: '2026-11-21T19:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1088',
    asunto: 'Renovación de certificado digital SSL para conexión segura',
    solicitante: 'Ing. José Luis Bautista',
    solicitanteId: 'USR-13',
    departamento: 'TI y Sistemas',
    prioridad: 'Alta',
    categoria: 'Acceso',
    estado: 'Resuelto',
    asignacion: 'Laura Medina',
    fechaCreacion: '18 nov 2026 - 09:00',
    createdAt: '2026-11-18T09:00:00.000Z',
    resolvedAt: '2026-11-18T11:45:00.000Z',
    slaDeadline: '2026-11-18T13:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },

  // Ana Torres (2 activos, 3 resueltos)
  {
    id: 'TCK-1046',
    asunto: 'Sin acceso a VPN desde casa',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Alta',
    categoria: 'Acceso',
    estado: 'En progreso',
    asignacion: 'Ana Torres',
    fechaCreacion: '24 nov 2026 - 09:05',
    createdAt: '2026-11-24T09:05:00.000Z',
    slaDeadline: '2026-11-24T13:05:00.000Z',
    slaRestante: '01 h 40 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1089',
    asunto: 'Generación de llave de acceso MFA para supervisor de embarques',
    solicitante: 'Martín Soto Carrillo',
    solicitanteId: 'USR-04',
    departamento: 'Almacén y Logística',
    prioridad: 'Media',
    categoria: 'Acceso',
    estado: 'En progreso',
    asignacion: 'Ana Torres',
    fechaCreacion: '26 nov 2026 - 09:50',
    createdAt: '2026-11-26T09:50:00.000Z',
    slaDeadline: '2026-11-26T17:50:00.000Z',
    slaRestante: '05 h 10 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1054',
    asunto: 'Alta de credenciales y cuenta de correo para nuevo supervisor de turno',
    solicitante: 'Ricardo Daniel Hernández',
    solicitanteId: 'USR-02',
    departamento: 'TI y Sistemas',
    prioridad: 'Baja',
    categoria: 'Acceso',
    estado: 'Resuelto',
    asignacion: 'Ana Torres',
    fechaCreacion: '23 nov 2026 - 11:30',
    createdAt: '2026-11-23T11:30:00.000Z',
    resolvedAt: '2026-11-23T15:20:00.000Z',
    slaDeadline: '2026-11-24T11:30:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1090',
    asunto: 'Desbloqueo de buzón compartido de compras corporativas',
    solicitante: 'Lucía Torres Valenzuela',
    solicitanteId: 'USR-02',
    departamento: 'Finanzas y Facturación',
    prioridad: 'Media',
    categoria: 'Acceso',
    estado: 'Resuelto',
    asignacion: 'Ana Torres',
    fechaCreacion: '19 nov 2026 - 12:00',
    createdAt: '2026-11-19T12:00:00.000Z',
    resolvedAt: '2026-11-19T14:30:00.000Z',
    slaDeadline: '2026-11-19T20:00:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  },
  {
    id: 'TCK-1091',
    asunto: 'Reasignación de permisos en carpeta de diseño técnico',
    solicitante: 'Javier Gutiérrez Peña',
    solicitanteId: 'USR-06',
    departamento: 'Operaciones / Planta 2',
    prioridad: 'Baja',
    categoria: 'Acceso',
    estado: 'Resuelto',
    asignacion: 'Ana Torres',
    fechaCreacion: '16 nov 2026 - 16:30',
    createdAt: '2026-11-16T16:30:00.000Z',
    resolvedAt: '2026-11-17T09:40:00.000Z',
    slaDeadline: '2026-11-17T16:30:00.000Z',
    slaRestante: '00 h 00 min',
    comentariosPublicos: []
  }
] : [];

// ====================================================================
// FUNCIONES CRUD CON LOCALSTORAGE (Fallback & Cache Inmediato)
// ====================================================================

export function getStoredUsers(): (UserAccount & { password?: string })[] {
  if (!DEMO_MODE) return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    const missing = DEFAULT_USERS.filter(du => !parsed.some((p: any) => p.email.toLowerCase() === du.email.toLowerCase()));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
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
  if (!DEMO_MODE) throw new Error('Las cuentas se provisionan mediante autenticación del servidor.');
  const users = getStoredUsers();
  if (users.some(u => u.email.toLowerCase() === user.email.trim().toLowerCase())) throw new Error('El correo ya está registrado.');
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

  // Si es un empleado nuevo en Demo Mode, sembramos un ticket inicial para que tenga datos inmediatos
  if (DEMO_MODE && newUser.rol === 'empleado') {
    const currentTickets = getStoredTickets();
    const nextNum = Math.max(1050, ...currentTickets.map(t => Number(t.id.replace(/^TCK-/, '')) || 0)) + 1;
    const starterTicket: TicketItem = {
      id: `TCK-${nextNum}`,
      asunto: 'Bienvenida a RIALSA · Provisión inicial de accesos y equipo',
      solicitante: newUser.nombre,
      solicitanteId: newUser.id,
      prioridad: 'Media',
      categoria: 'Acceso',
      estado: 'En progreso',
      asignacion: 'Salvador Rivera Delgado',
      fechaCreacion: 'Hoy - Recién creado',
      slaRestante: '03 h 30 min',
      comentariosPublicos: [
        {
          id: `COM-${nextNum}`,
          autor: 'Salvador Rivera Delgado',
          rol: 'tecnico',
          texto: `Hola ${newUser.nombre}, tu cuenta institucional quedó habilitada y tu equipo está listo para operar.`,
          fecha: 'Hoy'
        }
      ],
      notasInternas: [],
      historialAuditoria: []
    };
    saveStoredTickets([starterTicket, ...currentTickets]);
  }

  // Sincronizar en segundo plano con Supabase si está disponible
  if (DEMO_MODE && isSupabaseConfigured && supabase) {
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
  if (!DEMO_MODE) return null;
  try {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function setCurrentSessionUser(user: UserAccount | null) {
  if (!DEMO_MODE) return;
  if (!user) {
    sessionStorage.removeItem(CURRENT_USER_KEY);
  } else {
    const { id, nombre, email, rol, departamento, estado, fechaRegistro } = user;
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify({id,nombre,email,rol,departamento,estado,fechaRegistro}));
  }
}

export function getStoredTickets(): TicketItem[] {
  if (!DEMO_MODE) return [];
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(DEFAULT_TICKETS));
      return DEFAULT_TICKETS.map(normalizeTicket);
    }
    const parsed: TicketItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(DEFAULT_TICKETS));
      return DEFAULT_TICKETS.map(normalizeTicket);
    }
    const missing = DEFAULT_TICKETS.filter(dt => !parsed.some((p: any) => p.id === dt.id));
    const merged = missing.length > 0 ? [...parsed, ...missing] : parsed;
    if (missing.length > 0) {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(merged));
    }
    return merged.map((t) => normalizeTicket({
      ...t,
      comentariosPublicos: Array.isArray(t.comentariosPublicos) ? t.comentariosPublicos : [],
      notasInternas: Array.isArray(t.notasInternas) ? t.notasInternas : [],
      historialAuditoria: Array.isArray(t.historialAuditoria) ? t.historialAuditoria : [],
      adjuntos: Array.isArray(t.adjuntos) ? t.adjuntos : []
    }));
  } catch {
    return DEFAULT_TICKETS.map(normalizeTicket);
  }
}

export function saveStoredTickets(tickets: TicketItem[]) {
  if (!DEMO_MODE) return;
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
}

export function getStoredTechnicians(): TechnicianProfile[] {
  if (!DEMO_MODE) return [];
  try {
    const raw = localStorage.getItem(TECHS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TECHS_STORAGE_KEY, JSON.stringify(DEFAULT_TECHNICIANS));
      return DEFAULT_TECHNICIANS;
    }
    const parsed = JSON.parse(raw);
    const missing = DEFAULT_TECHNICIANS.filter(dt => !parsed.some((p: any) => p.email.toLowerCase() === dt.email.toLowerCase()));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(TECHS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return DEFAULT_TECHNICIANS;
  }
}

export function saveStoredTechnicians(techs: TechnicianProfile[]) {
  if (!DEMO_MODE) return;
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

    if (DEMO_MODE && isSupabaseConfigured && supabase) {
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
export const DEFAULT_NOTIFICATIONS: AppNotification[] = DEMO_MODE ? [
  {
    id: 'NOTIF-1',
    titulo: 'Ticket Asignado',
    mensaje: 'El Ticket TCK-1048 fue asignado a Mesa de ayuda - Nivel 1 mediante Least-Loaded.',
    tipo: 'asignacion',
    ticketId: 'TCK-1048',
    destinatarioRol: 'todos',
    leida: false,
    timestamp: 'Hoy 09:35'
  },
  {
    id: 'NOTIF-2',
    titulo: 'Nuevo Comentario en TCK-1046',
    mensaje: 'Carlos Operador Planta escribió: "He reiniciado el equipo y sigue mostrando el error..."',
    tipo: 'comentario',
    ticketId: 'TCK-1046',
    destinatarioRol: 'todos',
    leida: false,
    timestamp: 'Hoy 09:42'
  },
  {
    id: 'NOTIF-3',
    titulo: 'Ticket Resuelto',
    mensaje: 'El Ticket TCK-1045 (ERP bloqueado al facturar) fue resuelto satisfactoriamente por Salvador Rivera.',
    tipo: 'estado',
    ticketId: 'TCK-1045',
    destinatarioRol: 'todos',
    leida: false,
    timestamp: 'Hoy 08:50'
  }
] : [];

export function getStoredNotifications(): AppNotification[] {
  if (!DEMO_MODE) return [];
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
  if (!DEMO_MODE) return;
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
  return normalizeTicket({
    id: row.id,
    asunto: row.asunto,
    descripcion: row.descripcion || undefined,
    contextoIa: row.contexto_ia || undefined,
    solicitanteId: row.solicitante_id || undefined,
    createdAt: row.created_at || undefined,
    slaDeadline: row.sla_deadline || undefined,
    resolvedAt: row.resolved_at || undefined,
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
    historialAuditoria: Array.isArray(row.historial_auditoria) ? row.historial_auditoria : [],
    adjuntos: Array.isArray(row.adjuntos) ? row.adjuntos : []
  });
}

export function ticketToRow(t: TicketItem): Record<string, unknown> {
  return {
    id: t.id,
    asunto: t.asunto,
    descripcion: t.descripcion || null,
    contexto_ia: t.contextoIa || null,
    solicitante: t.solicitante,
    solicitante_id: t.solicitanteId || null,
    prioridad: t.prioridad,
    categoria: t.categoria,
    estado: t.estado,
    asignacion: t.asignacion || 'Sin asignar',
    departamento: t.departamento || null,
    fecha_creacion: t.fechaCreacion || null,
    sla_restante: t.slaRestante || null,
    sla_deadline: t.slaDeadline || null,
    resolved_at: t.resolvedAt || null,
    notas_internas: t.notasInternas || [],
    comentarios_publicos: t.comentariosPublicos || [],
    historial_auditoria: t.historialAuditoria || [],
    adjuntos: t.adjuntos || []
  };
}

export async function fetchCloudTickets(): Promise<TicketItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('tickets').select('*').order('id', { ascending: false });
    if (error || !data) return null;
    if (data.length === 0) {
      const rows = DEFAULT_TICKETS.map(ticketToRow);
      await supabase.from('tickets').upsert(rows);
      return DEFAULT_TICKETS;
    }
    const mapped = data.map(mapRowToTicket);
    saveStoredTickets(mapped);
    return mapped;
  } catch {
    return null;
  }
}

export async function saveCloudTicket(ticket: TicketItem): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('tickets').upsert(ticketToRow(ticket));
  } catch (err) {
    console.warn('Error sincronizando ticket en la nube:', err);
  }
}

