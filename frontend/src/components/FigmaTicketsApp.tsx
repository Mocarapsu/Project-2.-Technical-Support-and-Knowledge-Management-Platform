import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';
import { EmployeeHomeView } from './views/EmployeeHomeView';
import { EmployeeAiAssistantView } from './views/EmployeeAiAssistantView';
import { EmployeeMyTicketsView } from './views/EmployeeMyTicketsView';
import { EmployeeNewTicketView } from './views/EmployeeNewTicketView';
import { EmployeeTicketDetailView } from './views/EmployeeTicketDetailView';
import { TechnicianTicketQueueView } from './views/TechnicianTicketQueueView';
import { TechnicianTicketDetailView } from './views/TechnicianTicketDetailView';
import { TechnicianKbView } from './views/TechnicianKbView';
import { AdminDashboard } from './AdminDashboard';
import { LoginSplitView } from './auth/LoginSplitView';
import { AuthModalViews } from './auth/AuthModalViews';
import { ActiveScreen, RoleMode, AuthScreen, TicketItem, TicketPriority, TicketStatus, TechnicianProfile, UserAccount, AppNotification } from '../types/figma-tickets';
import {
  getStoredTickets,
  saveStoredTickets,
  getStoredTechnicians,
  saveStoredTechnicians,
  getCurrentSessionUser,
  setCurrentSessionUser,
  getStoredUsers,
  saveNewUser,
  getStoredNotifications,
  saveStoredNotifications
} from '../services/db';
import { printExecutiveReport } from '../services/reportGenerator';
import { Bell, X, CheckCircle2, MessageSquare, UserCheck, AlertTriangle } from 'lucide-react';

export const FigmaTicketsApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      return getCurrentSessionUser();
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return !!getCurrentSessionUser();
    } catch {
      return false;
    }
  });

  const [currentRole, setCurrentRole] = useState<RoleMode>(() => {
    try {
      const user = getCurrentSessionUser();
      return user ? user.rol : 'empleado';
    } catch {
      return 'empleado';
    }
  });

  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>(() => {
    try {
      const user = getCurrentSessionUser();
      if (!user) return 'auth_login_default';
      if (user.rol === 'admin') return 'admin_dashboard';
      if (user.rol === 'tecnico') return 'tecnico_cola';
      return 'empleado_inicio';
    } catch {
      return 'auth_login_default';
    }
  });

  // Persistent tickets & technicians state connected to local database
  const [tickets, setTickets] = useState<TicketItem[]>(() => getStoredTickets());
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(() => getStoredTechnicians());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications());
  const [liveToast, setLiveToast] = useState<AppNotification | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('TCK-1048');

  // Disparar notificación en tiempo real con banner flotante (Toast)
  const triggerNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'leida'>) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNotif: AppNotification = {
      ...notifData,
      id: `NOTIF-${Date.now()}`,
      timestamp: `Hoy ${nowStr}`,
      leida: false
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveStoredNotifications(updated);
    setLiveToast(newNotif);
    setTimeout(() => {
      setLiveToast((cur) => (cur?.id === newNotif.id ? null : cur));
    }, 6500);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, leida: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleSelectNotification = (notif: AppNotification) => {
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, leida: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
    if (notif.ticketId) {
      setSelectedTicketId(notif.ticketId);
      if (currentRole === 'empleado') setCurrentScreen('empleado_detalle');
      else if (currentRole === 'tecnico') setCurrentScreen('tecnico_detalle');
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];
  const isAuthScreen = currentScreen.startsWith('auth_');

  const handleNavigate = (screen: ActiveScreen) => {
    setCurrentScreen(screen);
    if (screen.startsWith('empleado')) {
      setCurrentRole('empleado');
      setIsAuthenticated(true);
    } else if (screen.startsWith('tecnico')) {
      setCurrentRole('tecnico');
      setIsAuthenticated(true);
    } else if (screen.startsWith('admin')) {
      setCurrentRole('admin');
      setIsAuthenticated(true);
    } else if (screen.startsWith('auth_')) {
      setIsAuthenticated(false);
    }
  };

  const handleRoleToggle = (role: RoleMode) => {
    setCurrentRole(role);
    if (role === 'empleado') {
      setCurrentScreen('empleado_inicio');
    } else if (role === 'tecnico') {
      setCurrentScreen('tecnico_cola');
    } else if (role === 'admin') {
      setCurrentScreen('admin_dashboard');
    }
  };

  const handleLoginSuccess = (userOrRole?: UserAccount | 'empleado' | 'tecnico' | 'admin') => {
    let resolvedUser: UserAccount;
    if (userOrRole && typeof userOrRole === 'object' && 'rol' in userOrRole) {
      resolvedUser = userOrRole;
    } else {
      const targetRole = (userOrRole as RoleMode) || 'empleado';
      const allUsers = getStoredUsers();
      resolvedUser = allUsers.find((u) => u.rol === targetRole) || allUsers[0];
    }

    setCurrentUser(resolvedUser);
    setCurrentSessionUser(resolvedUser);
    setCurrentRole(resolvedUser.rol);
    setIsAuthenticated(true);

    if (resolvedUser.rol === 'empleado') setCurrentScreen('empleado_inicio');
    else if (resolvedUser.rol === 'tecnico') setCurrentScreen('tecnico_cola');
    else if (resolvedUser.rol === 'admin') setCurrentScreen('admin_dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentSessionUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('auth_login_default');
  };

  // Crear nuevo ticket con algoritmo de asignación Least-Loaded dinámico y persistencia
  const handleCreateTicket = (data: { asunto: string; descripcion: string; categoria: string; prioridad: string }) => {
    const nextNum = 1049 + (tickets.length - 4);
    const newId = `TCK-${nextNum}`;

    // Algoritmo Least-Loaded real: calcular carga activa actual de cada técnico
    const sortedTechs = [...technicians].sort((a, b) => {
      const loadA = tickets.filter((t) => t.asignacion === a.nombre && t.estado !== 'Resuelto').length;
      const loadB = tickets.filter((t) => t.asignacion === b.nombre && t.estado !== 'Resuelto').length;
      return loadA - loadB;
    });

    const leastLoadedTech = sortedTechs[0];
    const assignedTech = leastLoadedTech?.nombre || 'Sin asignar';
    const activeLoad = tickets.filter((t) => t.asignacion === assignedTech && t.estado !== 'Resuelto').length;
    const creatorName = currentUser?.nombre || 'Empleado RIALSA';

    const newTicket: TicketItem = {
      id: newId,
      asunto: data.asunto,
      solicitante: creatorName,
      prioridad: (data.prioridad as TicketPriority) || 'Media',
      categoria: data.categoria || 'Acceso',
      estado: 'En progreso',
      asignacion: assignedTech,
      fechaCreacion: 'Hoy - En vivo',
      slaRestante: '04 h 00 min',
      historialAuditoria: [
        `Ticket creado por ${creatorName} (${currentUser?.departamento || 'Operaciones'})`,
        `Asignado automáticamente por algoritmo Least-Loaded a ${assignedTech} (Carga activa previa: ${activeLoad} tickets)`
      ]
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    saveStoredTickets(updated);
    setSelectedTicketId(newId);
    setCurrentScreen('empleado_detalle');

    triggerNotification({
      titulo: `📋 Nuevo Ticket Creado (${newId})`,
      mensaje: `"${data.asunto}" asignado automáticamente a ${assignedTech} por Least-Loaded.`,
      tipo: 'alerta',
      ticketId: newId,
      destinatarioRol: 'todos'
    });
  };

  const handleResolveTicket = (ticketId: string) => {
    const actorName = currentUser?.nombre || 'Técnico Especialista';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const prevAudit = t.historialAuditoria || [];
        return {
          ...t,
          estado: 'Resuelto' as TicketStatus,
          historialAuditoria: [
            `Ticket resuelto por ${actorName} (${nowStr})`,
            ...prevAudit
          ]
        };
      }
      return t;
    });
    setTickets(updated);
    saveStoredTickets(updated);

    triggerNotification({
      titulo: `🎉 Ticket ${ticketId} Resuelto`,
      mensaje: `El incidente fue marcado como RESUELTO por ${actorName}.`,
      tipo: 'estado',
      ticketId: ticketId,
      destinatarioRol: 'todos'
    });
  };

  // Asignar o reasignar ticket por el Admin o Técnico con persistencia
  const handleAssignTicket = (ticketId: string, techName: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const actorName = currentUser?.nombre || (currentRole === 'admin' ? 'Ing. Bautista (Admin)' : 'Técnico TI');
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const prevAudit = t.historialAuditoria || [];
        return {
          ...t,
          asignacion: techName,
          estado: 'En progreso' as TicketStatus,
          historialAuditoria: [
            `Asignado por ${actorName} a: ${techName} (${nowStr})`,
            ...prevAudit
          ]
        };
      }
      return t;
    });
    setTickets(updated);
    saveStoredTickets(updated);

    triggerNotification({
      titulo: `📌 Ticket ${ticketId} Asignado`,
      mensaje: `Asignado por ${actorName} al resolutor ${techName}.`,
      tipo: 'asignacion',
      ticketId: ticketId,
      destinatarioRol: 'todos'
    });
  };

  // Agregar nuevo técnico al pool con persistencia y crear su cuenta para login inmediato
  const handleAddTechnician = (newTech: TechnicianProfile) => {
    const updated = [...technicians, newTech];
    setTechnicians(updated);
    saveStoredTechnicians(updated);

    // Guardar también como usuario para que pueda iniciar sesión con su correo especial
    saveNewUser({
      nombre: newTech.nombre,
      email: newTech.email,
      rol: 'tecnico',
      departamento: newTech.especialidad,
      password: 'Password123!'
    });

    triggerNotification({
      titulo: `🛠 Nuevo Técnico Registrado`,
      mensaje: `${newTech.nombre} (${newTech.nivel}) fue dado de alta en el pool de resolución.`,
      tipo: 'alerta',
      destinatarioRol: 'todos'
    });
  };

  // Agregar nota interna técnica privada (FR-06) con persistencia
  const handleAddNote = (ticketId: string, noteText: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const author = currentUser?.nombre || 'Técnico Especialista';
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const prevNotes = t.notasInternas || [];
        const prevAudit = t.historialAuditoria || [];
        return {
          ...t,
          notasInternas: [...prevNotes, noteText],
          historialAuditoria: [
            `Nota privada agregada por ${author}: "${noteText.length > 25 ? noteText.slice(0, 25) + '...' : noteText}" (${nowStr})`,
            ...prevAudit
          ]
        };
      }
      return t;
    });
    setTickets(updated);
    saveStoredTickets(updated);
  };

  // Agregar comentario público al ticket (visible para solicitante, técnicos y admin)
  const handleAddComment = (ticketId: string, commentText: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const author = currentUser?.nombre || 'Usuario RIALSA';
    const role = currentUser?.rol || 'empleado';
    const newComment = {
      id: `COM-${Date.now()}`,
      autor: author,
      rol: role,
      texto: commentText,
      fecha: nowStr
    };

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const prevComments = t.comentariosPublicos || [];
        const prevAudit = t.historialAuditoria || [];
        return {
          ...t,
          comentariosPublicos: [...prevComments, newComment],
          historialAuditoria: [
            `Mensaje de ${author} (${role}): "${commentText.length > 25 ? commentText.slice(0, 25) + '...' : commentText}" (${nowStr})`,
            ...prevAudit
          ]
        };
      }
      return t;
    });
    setTickets(updated);
    saveStoredTickets(updated);

    triggerNotification({
      titulo: `💬 Nuevo Comentario (${author})`,
      mensaje: `En ${ticketId}: "${commentText.length > 40 ? commentText.slice(0, 40) + '...' : commentText}"`,
      tipo: 'comentario',
      ticketId: ticketId,
      destinatarioRol: 'todos'
    });
  };

  return (
    <div className="h-screen max-h-screen bg-[#07080a] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* PURE APPLICATION RUNNER (Zero Figma dev bars) */}
      {!isAuthenticated || isAuthScreen ? (
        /* PANTALLA COMPLETA DE AUTENTICACIÓN (LOGIN & REGISTRO) */
        <div className="flex-1 flex flex-col overflow-y-auto">
          {currentScreen === 'auth_login_default' && (
            <LoginSplitView
              onLoginSuccess={handleLoginSuccess}
              onForgotPassword={() => handleNavigate('auth_recuperar')}
              onNavigateState={handleNavigate}
            />
          )}

          {currentScreen !== 'auth_login_default' && (
            <AuthModalViews
              currentScreen={currentScreen as AuthScreen}
              onNavigate={handleNavigate}
              onBackToLogin={() => handleNavigate('auth_login_default')}
            />
          )}
        </div>
      ) : (
        /* ESPACIO DE TRABAJO CON BARRA LATERAL NATIVA */
        <div className="flex-1 flex overflow-hidden h-full">
          <Sidebar
            currentRole={currentRole}
            currentScreen={currentScreen}
            currentUser={currentUser || undefined}
            onNavigate={handleNavigate}
            onRoleToggle={handleRoleToggle}
            onLogout={handleLogout}
          />

          <main className="flex-1 flex flex-col bg-[#0B0D11] overflow-y-auto h-full">
            <HeaderBar
              currentScreen={currentScreen}
              currentUser={currentUser}
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
              onSelectNotification={handleSelectNotification}
            />

            <div className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
              
              {/* VISTAS DE EMPLEADO */}
              {currentScreen === 'empleado_inicio' && (
                <EmployeeHomeView onNavigate={handleNavigate} currentUser={currentUser} />
              )}

              {currentScreen === 'empleado_asistente_ia' && (
                <EmployeeAiAssistantView
                  currentUser={currentUser}
                  onEscalate={() => handleNavigate('empleado_nuevo')}
                />
              )}

              {currentScreen === 'empleado_mis_tickets' && (
                <EmployeeMyTicketsView
                  tickets={tickets}
                  currentUser={currentUser}
                  onSelectTicket={(id) => {
                    setSelectedTicketId(id);
                    handleNavigate('empleado_detalle');
                  }}
                  onCreateNew={() => handleNavigate('empleado_nuevo')}
                />
              )}

              {currentScreen === 'empleado_nuevo' && (
                <EmployeeNewTicketView
                  onCancel={() => handleNavigate('empleado_mis_tickets')}
                  onSubmitTicket={handleCreateTicket}
                  onTryAiFirst={() => handleNavigate('empleado_asistente_ia')}
                />
              )}

              {currentScreen === 'empleado_detalle' && (
                <EmployeeTicketDetailView
                  ticket={selectedTicket}
                  currentUser={currentUser}
                  onBackToList={() => handleNavigate('empleado_mis_tickets')}
                  onAddComment={handleAddComment}
                />
              )}

              {/* VISTAS DE TÉCNICO TI */}
              {currentScreen === 'tecnico_cola' && (
                <TechnicianTicketQueueView
                  tickets={tickets}
                  currentUser={currentUser}
                  onSelectTicket={(id) => {
                    setSelectedTicketId(id);
                    handleNavigate('tecnico_detalle');
                  }}
                  onCreateInternalTicket={() => handleNavigate('empleado_nuevo')}
                  onAssignTicket={handleAssignTicket}
                />
              )}

              {currentScreen === 'tecnico_detalle' && (
                <TechnicianTicketDetailView
                  ticket={selectedTicket}
                  currentUser={currentUser}
                  onBackToQueue={() => handleNavigate('tecnico_cola')}
                  onResolveTicket={handleResolveTicket}
                  onAssignTicket={handleAssignTicket}
                  onAddNote={handleAddNote}
                  onAddComment={handleAddComment}
                />
              )}

              {currentScreen === 'tecnico_kb' && (
                <TechnicianKbView />
              )}

              {/* VISTA DE DIRECCIÓN TI / CISO */}
              {currentScreen === 'admin_dashboard' && (
                <AdminDashboard
                  tickets={tickets}
                  technicians={technicians}
                  onAssignTicket={handleAssignTicket}
                  onAddTechnician={handleAddTechnician}
                  onForceAssignment={(ticketId) => handleAssignTicket(ticketId, 'Salvador Rivera Delgado')}
                  onExportCSV={() => {
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      ["Ticket,Asunto,Solicitante,Prioridad,Estado,Asignacion", 
                       ...tickets.map(t => `${t.id},"${t.asunto}","${t.solicitante}",${t.prioridad},${t.estado},"${t.asignacion}"`)].join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `RIALSA_Auditoria_Tickets_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  onExportPDF={() => {
                    printExecutiveReport(tickets, technicians);
                  }}
                  onLogout={handleLogout}
                />
              )}

            </div>
          </main>
        </div>
      )}

      {/* FLOATING LIVE TOAST NOTIFICATION ("resalte la notificación") */}
      {liveToast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full transition-all duration-300 drop-shadow-2xl">
          <div className="bg-[#0e121a]/95 border-2 border-blue-500 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3 ring-4 ring-blue-500/20">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/50 flex-shrink-0 animate-pulse">
              {liveToast.tipo === 'asignacion' && <UserCheck className="w-5 h-5 text-blue-400" />}
              {liveToast.tipo === 'comentario' && <MessageSquare className="w-5 h-5 text-purple-400" />}
              {liveToast.tipo === 'estado' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {liveToast.tipo === 'alerta' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-black text-white tracking-tight">{liveToast.titulo}</h4>
                <button
                  type="button"
                  onClick={() => setLiveToast(null)}
                  className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug break-words">
                {liveToast.mensaje}
              </p>
              <div className="text-[9px] text-blue-400 font-mono mt-2 flex items-center justify-between">
                <span>{liveToast.timestamp}</span>
                {liveToast.ticketId && (
                  <span className="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                    Ticket {liveToast.ticketId}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
