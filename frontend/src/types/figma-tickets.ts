export type RoleMode = 'empleado' | 'tecnico' | 'admin';

export type AuthScreen =
  | 'auth_login_default'
  | 'auth_login_error'
  | 'auth_login_loading'
  | 'auth_recuperar'
  | 'auth_recuperacion_enviada'
  | 'auth_nueva_password'
  | 'auth_password_actualizada'
  | 'auth_sesion_expirada'
  | 'auth_acceso_denegado';

export type EmployeeScreen =
  | 'empleado_inicio'
  | 'empleado_asistente_ia'
  | 'empleado_mis_tickets'
  | 'empleado_nuevo'
  | 'empleado_detalle';

export type TechnicianScreen =
  | 'tecnico_cola'
  | 'tecnico_detalle'
  | 'tecnico_kb';

export type AdminScreen =
  | 'admin_dashboard';

export type ActiveScreen = AuthScreen | EmployeeScreen | TechnicianScreen | AdminScreen;

export type TicketPriority = 'Crítica' | 'Alta' | 'Media' | 'Baja';

export type TicketStatus = 'Abierto' | 'En progreso' | 'Escalado' | 'Resuelto';

export interface TechnicianProfile {
  id: string;
  nombre: string;
  email: string;
  especialidad: string;
  nivel: 'Nivel 1 (Mesa de Ayuda)' | 'Nivel 2 (Especialista)' | 'Nivel 3 (Infraestructura)';
  ticketsActivos: number;
  estado: 'Disponible' | 'Ocupado' | 'En guardia';
  isNext?: boolean;
}

export interface UserAccount {
  id: string;
  nombre: string;
  email: string;
  rol: RoleMode;
  departamento: string;
  estado: 'Activo' | 'Inactivo';
  fechaRegistro: string;
}

export interface TicketComment {
  id: string;
  autor: string;
  rol: RoleMode;
  texto: string;
  fecha: string;
}

export interface AppNotification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'asignacion' | 'comentario' | 'estado' | 'alerta';
  ticketId?: string;
  destinatarioRol: 'todos' | 'admin' | 'tecnico' | 'empleado';
  destinatarioUsuario?: string;
  leida: boolean;
  timestamp: string;
}

export interface TicketItem {
  id: string;
  asunto: string;
  solicitante: string;
  prioridad: TicketPriority;
  categoria: string;
  estado: TicketStatus;
  asignacion: string;
  departamento?: string;
  fechaCreacion?: string;
  slaRestante?: string;
  notasInternas?: string[];
  comentariosPublicos?: TicketComment[];
  historialAuditoria?: string[];
}

export interface KbArticle {
  id: string;
  codigo: string;
  titulo: string;
  categoria: string;
  resumen: string;
  vistas: number;
  actualizado: string;
  tags: string[];
}
