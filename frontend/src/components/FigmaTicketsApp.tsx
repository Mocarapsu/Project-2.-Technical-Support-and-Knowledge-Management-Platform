import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, UserCheck, AlertTriangle, X, Loader2 } from 'lucide-react';
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
import { ActiveScreen, AuthScreen, TicketItem, TicketPriority, TechnicianProfile, UserAccount, AppNotification, RoleMode } from '../types/figma-tickets';
import { getStoredTickets, saveStoredTickets, getStoredTechnicians, saveStoredTechnicians, getCurrentSessionUser, setCurrentSessionUser, getStoredUsers, saveNewUser, getStoredNotifications, saveStoredNotifications, DEFAULT_USERS, fetchCloudTickets, saveCloudTicket } from '../services/db';
import { DEMO_MODE, supabase } from '../services/supabaseClient';
import { loadCloudProfile, loadWorkspace, cloudTicketAction, cloudMarkRead, cloudAddTechnician, signOutCloud } from '../services/cloudWorkspace';
import { canViewTicket, visibleTicket, notificationVisible, normalizeCategory, PRIORITIES, CATEGORIES, textOnlyIcon, slaText } from '../services/ticketDomain';
import { printExecutiveReport } from '../services/reportGenerator';

type Draft = { asunto:string; descripcion:string; categoria:string; prioridad:string; contextoIa?:string };
const home = (user:UserAccount):ActiveScreen => user.rol === 'admin' ? 'admin_dashboard' : user.rol === 'tecnico' ? 'tecnico_cola' : 'empleado_inicio';
const allows = (screen:ActiveScreen,user:UserAccount):boolean => screen === 'tecnico_kb' || screen === 'empleado_nuevo' || (user.rol === 'empleado' ? screen.startsWith('empleado_') : screen.startsWith('tecnico_') || (user.rol === 'admin' && screen === 'admin_dashboard'));
const now = () => new Date().toLocaleString('es-MX', { dateStyle:'short',timeStyle:'short' });

export const FigmaTicketsApp:React.FC = () => {
  const [user,setUser] = useState<UserAccount|null>(()=>getCurrentSessionUser());
  const [screen,setScreen] = useState<ActiveScreen>(()=>{const u=getCurrentSessionUser();return u?home(u):'auth_login_default';});
  const [tickets,setTickets] = useState<TicketItem[]>(()=>getStoredTickets());
  const [technicians,setTechnicians] = useState<TechnicianProfile[]>(()=>getStoredTechnicians());
  const [notifications,setNotifications] = useState<AppNotification[]>(()=>getStoredNotifications());
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [draft,setDraft] = useState<Draft|null>(null);
  const [toast,setToast] = useState<AppNotification|null>(null);
  const [error,setError] = useState('');
  const [checking,setChecking] = useState(!DEMO_MODE);
  const [loading,setLoading] = useState(false);
  const [busy,setBusy] = useState(false);
  const [connected,setConnected] = useState(false);
  const [collapsed,setCollapsed] = useState(false);
  const [mobileOpen,setMobileOpen] = useState(false);
  const identity=useRef(user?.id || '');
  const generation=useRef(0);
  const lock=useRef(false);
  const knownNotifications=useRef<Set<string>|null>(null);

  function clearSession() {
    generation.current++; identity.current=''; knownNotifications.current=null; lock.current=false;
    try { sessionStorage.setItem('rialsa_explicit_logout', 'true'); } catch {}
    setUser(null);setCurrentSessionUser(null);setScreen('auth_login_default');setSelectedId(null);setDraft(null);setToast(null);setError('');setBusy(false);setLoading(false);setConnected(false);setMobileOpen(false);
    if (!DEMO_MODE) {setTickets([]);setTechnicians([]);setNotifications([]);}
  }
  function login(next:UserAccount) {
    try { sessionStorage.removeItem('rialsa_explicit_logout'); } catch {}
    generation.current++;identity.current=next.id;knownNotifications.current=null;lock.current=false;
    const {id,nombre,email,rol,departamento,estado,fechaRegistro}=next;
    const safe={id,nombre,email,rol,departamento,estado,fechaRegistro};
    setUser(safe);setCurrentSessionUser(safe);setScreen(home(safe));setSelectedId(null);setDraft(null);setToast(null);setError('');setBusy(false);setMobileOpen(false);
    if(DEMO_MODE){
      setTickets(getStoredTickets());
      setTechnicians(getStoredTechnicians());
      setNotifications(getStoredNotifications());
      void fetchCloudTickets().then(cloud=>{if(cloud&&cloud.length>0)setTickets(cloud);});
    }
    else {setTickets([]);setTechnicians([]);setNotifications([]);setLoading(true);setConnected(false);}
  }
  useEffect(()=>{
    void fetchCloudTickets().then(cloud=>{if(cloud&&cloud.length>0)setTickets(cloud);});
    if(!supabase)return;
    const channel=supabase.channel('public:tickets:realtime').on('postgres_changes',{event:'*',schema:'public',table:'tickets'},()=>{
      void fetchCloudTickets().then(cloud=>{if(cloud&&cloud.length>0)setTickets(cloud);});
    }).subscribe();
    return ()=>{supabase?.removeChannel(channel);};
  },[]);
  useEffect(()=>{
    if(DEMO_MODE){setChecking(false);return;}
    let active=true;
    loadCloudProfile().then(p=>{if(active && p) login(p);}).catch(()=>{if(active)setError('No se pudo verificar el perfil. Verifica la configuración y la migración QA V2.');}).finally(()=>{if(active)setChecking(false);});
    const sub=supabase?.auth.onAuthStateChange((event)=>{
      if(event==='SIGNED_OUT' && active) clearSession();
      if(event==='PASSWORD_RECOVERY' && active){clearSession();setScreen('auth_nueva_password');}
    });
    return ()=>{active=false;sub?.data.subscription.unsubscribe();};
  },[]);

  const refreshWorkspace=async (expectedGeneration=generation.current, showNew=false) => {
    const data=await loadWorkspace();
    if(expectedGeneration!==generation.current || !identity.current) return;
    if(showNew && knownNotifications.current){const fresh=data.notifications.find(n=>!knownNotifications.current!.has(n.id)&&!n.leida);if(fresh)setToast(fresh);}
    knownNotifications.current=new Set(data.notifications.map(n=>n.id));
    setTickets(data.tickets);setTechnicians(data.technicians);setNotifications(data.notifications);setConnected(true);setLoading(false);
  };
  useEffect(()=>{
    if(!user || DEMO_MODE) return;
    const g=generation.current;
    let stopped=false;
    const refresh=()=>{if(stopped||lock.current)return;refreshWorkspace(g,true).catch(()=>{if(g===generation.current&&!stopped){setConnected(false);setLoading(false);setError('No se pudo actualizar el espacio de trabajo. Reintenta la conexión.');}});};
    refresh();const interval=window.setInterval(refresh,5000);
    return()=>{stopped=true;window.clearInterval(interval);};
  },[user?.id]);
  useEffect(()=>{
    if(!DEMO_MODE)return;
    const sync=(e:StorageEvent)=>{if(e.key?.startsWith('rialsa_db_')){setTickets(getStoredTickets());setTechnicians(getStoredTechnicians());setNotifications(getStoredNotifications());}};
    window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
  },[]);
  useEffect(()=>{if(!toast)return;const id=window.setTimeout(()=>setToast(null),5500);return()=>window.clearTimeout(id);},[toast]);

  const actualScreen=user?(allows(screen,user)?screen:home(user)):screen.startsWith('auth_')?screen:'auth_login_default';
  const ownTickets=user?tickets.filter(t=>canViewTicket(t,user)).map(t=>visibleTicket(t,user)):[];
  const selected=ownTickets.find(t=>t.id===selectedId);
  const visibleNotifs=user?notifications.filter(n=>notificationVisible(n,tickets,user)).map(n=>({...n,titulo:textOnlyIcon(n.titulo),mensaje:textOnlyIcon(n.mensaje)})):[];
  const navigate=(next:ActiveScreen)=>{
    setMobileOpen(false);setError('');
    if(!user){if(next.startsWith('auth_'))setScreen(next);return;}
    if(!allows(next,user)){setError('Tu perfil no tiene permisos para este módulo.');return;}
    setScreen(next);
  };
  const selectTicket=(id:string)=>{if(!user||!tickets.some(t=>t.id===id&&canViewTicket(t,user))){setError('El ticket no está disponible para tu perfil.');return;}setSelectedId(id);navigate(user.rol==='empleado'?'empleado_detalle':'tecnico_detalle');};
  const logout=async()=>{clearSession();if(!DEMO_MODE)await signOutCloud().catch(()=>{});};
  const setLocalTickets=(next:TicketItem[])=>{saveStoredTickets(next);setTickets(next);};
  function notify(ticket:TicketItem|undefined,title:string,message:string,type:AppNotification['tipo']){
    if(!user)return;
    const recipients=getStoredUsers().filter(u=>u.estado==='Activo' && (u.id===user.id || (ticket ? u.rol==='admin' || (u.rol==='tecnico' && (type==='alerta'||u.nombre===ticket.asignacion)) || canViewTicket(ticket,u)&&u.rol==='empleado' : u.rol==='admin')));
    const id=crypto.randomUUID();
    const newNotifs=recipients.map(u=>({id:`NOTIF-${id}-${u.id}`,titulo:title,mensaje:message,tipo:type,ticketId:ticket?.id,destinatarioRol:u.rol,destinatarioUsuario:u.email,leida:false,timestamp:now()}));
    const next=[...newNotifs,...getStoredNotifications()];saveStoredNotifications(next);setNotifications(next);
    const mine=newNotifs.find(n=>n.destinatarioUsuario===user.email);if(mine)setToast(mine);
  }
  const perform=async (work:()=>Promise<void>|void):Promise<boolean>=>{
    if(!user||lock.current)return false;
    const g=generation.current;lock.current=true;setBusy(true);setError('');
    try{await work();return g===generation.current;}catch(e){if(g===generation.current)setError(e instanceof Error?e.message:'No se pudo completar la operación.');return false;}finally{if(g===generation.current){lock.current=false;setBusy(false);}}
  };
  const markRead=async(id?:string)=>{
    if(!user)return;
    if(!DEMO_MODE){await perform(async()=>{await cloudMarkRead(id);await refreshWorkspace();});return;}
    // Las notificaciones antiguas globales mantienen un registro de lectura por cuenta.
    const readIds=visibleNotifs.filter(n=>!id||n.id===id).map(n=>n.id);
    const current=getStoredNotifications();
    const next=current.flatMap(n=>{
      if(!readIds.includes(n.id))return [n];
      if(n.destinatarioUsuario===user.email)return [{...n,leida:true}];
      // Expandir una notificación heredada a copias por destinatario para que
      // marcarla no modifique la lectura de las demás cuentas.
      return getStoredUsers().filter(u=>notificationVisible(n,tickets,u)).map(u=>({...n,id:`${n.id}-${u.id}`,destinatarioUsuario:u.email,destinatarioRol:u.rol,leida:u.id===user.id||n.leida}));
    });saveStoredNotifications(next);setNotifications(next);
  };
  const createTicket=(data:Draft)=>perform(async()=>{
    if(!user)return;
    const clean={...data,asunto:data.asunto.trim(),descripcion:data.descripcion.trim(),categoria:normalizeCategory(data.categoria)};
    if(clean.asunto.length<5||clean.descripcion.length<10||!CATEGORIES.includes(clean.categoria as any)||!PRIORITIES.includes(clean.prioridad as any))throw new Error('Completa el asunto, descripción, categoría y prioridad.');
    if(!DEMO_MODE){const g=generation.current;const id=await cloudTicketAction('create',clean);await refreshWorkspace(g);if(g!==generation.current)return;setSelectedId(id);setDraft(null);setScreen(user.rol==='empleado'?'empleado_detalle':'tecnico_detalle');return;}
    const all=getStoredTickets();const nextNum=Math.max(1049,...all.map(t=>Number(t.id.replace(/^TCK-/,''))||0))+1;
    const techs=getStoredTechnicians().filter(t=>t.estado!=='Ocupado').sort((a,b)=>all.filter(t=>t.asignacion===a.nombre&&t.estado!=='Resuelto').length-all.filter(t=>t.asignacion===b.nombre&&t.estado!=='Resuelto').length);
    const assigned=techs[0]?.nombre||'Sin asignar';const ts=new Date();const hours=clean.prioridad==='Crítica'?1:clean.prioridad==='Alta'?4:8;
    const t:TicketItem={id:`TCK-${nextNum}`,asunto:clean.asunto,descripcion:clean.descripcion,contextoIa:clean.contextoIa,solicitante:user.nombre,solicitanteId:user.id,prioridad:clean.prioridad as TicketPriority,categoria:clean.categoria,estado:assigned==='Sin asignar'?'Abierto':'En progreso',asignacion:assigned,departamento:user.departamento,fechaCreacion:now(),createdAt:ts.toISOString(),slaDeadline:new Date(ts.getTime()+hours*3600000).toISOString(),slaRestante:`0${hours} h 00 min`,comentariosPublicos:[],notasInternas:[],historialAuditoria:[`Ticket creado por ${user.nombre} (${now()})`,...(assigned==='Sin asignar'?[]:[`Asignado automáticamente a ${assigned} (${now()})`])]};
    setLocalTickets([t,...all]);
    void saveCloudTicket(t);
    setSelectedId(t.id);setDraft(null);setScreen(user.rol==='empleado'?'empleado_detalle':'tecnico_detalle');notify(t,`Ticket ${t.id} creado`,`${t.asunto} · ${assigned}`,'alerta');
  });
  const ticketAction=(action:string,id:string,value?:string)=>perform(async()=>{
    if(!user)return;const t=tickets.find(t=>t.id===id);
    if(!t||!canViewTicket(t,user))throw new Error('Ticket no disponible para tu perfil.');
    if(action!=='comment'&&user.rol==='empleado')throw new Error('Permisos insuficientes.');
    if(['resolve','assign','escalate'].includes(action)&&t.estado==='Resuelto')throw new Error('El ticket ya está resuelto.');
    if(action==='assign'&&t.asignacion===value&&t.estado==='En progreso')return;
    if(!DEMO_MODE){await cloudTicketAction(action,{id,value});await refreshWorkspace();return;}
    const all=getStoredTickets();const original=all.find(x=>x.id===id);if(!original||!canViewTicket(original,user))throw new Error('El ticket ya no está disponible.');
    if(['resolve','assign','escalate'].includes(action)&&original.estado==='Resuelto')throw new Error('El ticket ya está resuelto.');
    let updated={...original};let event='';let type:AppNotification['tipo']='estado';let title='';let message='';
    switch(action){
      case 'resolve':updated.estado='Resuelto';updated.resolvedAt=new Date().toISOString();updated.slaRestante='Cerrado';event=`Ticket resuelto por ${user.nombre} (${now()})`;title=`Ticket ${id} resuelto`;message=event;break;
      case 'assign':if(!value)throw new Error('Selecciona un técnico.');if(user.rol==='tecnico'&&value!==user.nombre)throw new Error('Solo puedes asignarte el ticket.');if(original.asignacion===value&&original.estado==='En progreso')return;updated.asignacion=value;updated.estado='En progreso';event=`Asignado por ${user.nombre}: ${original.asignacion} → ${value} (${now()})`;title=`Ticket ${id} asignado`;message=event;type='asignacion';break;
      case 'escalate':if(original.estado==='Escalado')return;updated.estado='Escalado';event=`Ticket escalado por ${user.nombre} (${now()})`;title=`Ticket ${id} escalado`;message=event;break;
      case 'note':if(!value?.trim())return;updated.notasInternas=[...(original.notasInternas||[]),value.trim()];event=`Nota interna agregada por ${user.nombre} (${now()})`;break;
      case 'comment':if(!value?.trim())return;updated.comentariosPublicos=[...(original.comentariosPublicos||[]),{id:crypto.randomUUID(),autor:user.nombre,rol:user.rol,texto:value.trim(),fecha:now()}];event=`Comentario público de ${user.nombre} (${now()})`;title=`Nuevo comentario en ${id}`;message=value.trim();type='comentario';break;
      default:throw new Error('Acción no válida.');
    }
    updated.historialAuditoria=[event,...(original.historialAuditoria||[])];
    const nextTickets=all.map(x=>x.id===id?updated:x);
    setLocalTickets(nextTickets);
    void saveCloudTicket(updated);
    if(title)notify(updated,title,message,type);
  });
  const addTech=(tech:TechnicianProfile)=>perform(async()=>{if(user?.rol!=='admin')throw new Error('Permisos insuficientes.');if(!DEMO_MODE){await cloudAddTechnician(tech);await refreshWorkspace();return;}if(getStoredUsers().some(u=>u.email===tech.email))throw new Error('El correo ya está registrado.');saveNewUser({nombre:tech.nombre,email:tech.email,rol:'tecnico',departamento:tech.especialidad,password:'Password123!'});const next=[...getStoredTechnicians().filter(t=>t.email!==tech.email),tech];saveStoredTechnicians(next);setTechnicians(next);notify(undefined,'Técnico registrado',tech.nombre,'alerta');});
  const retry=()=>{if(DEMO_MODE){setError('');return;}setLoading(true);setError('');refreshWorkspace().catch(()=>{setLoading(false);setError('No se pudo conectar. Verifica Supabase y la migración QA V2.');});};
  if(checking)return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-700"><div role="status" className="flex gap-2 items-center"><Loader2 className="animate-spin w-5 h-5"/>Verificando sesión…</div></div>;
  if(!user)return <div className="min-h-screen bg-[#0B0D11]">{error&&<p role="alert" className="p-3 text-sm bg-red-50 text-red-800">{error}</p>}{actualScreen==='auth_login_default'?<LoginSplitView onLoginSuccess={login} onForgotPassword={()=>navigate('auth_recuperar')} onNavigateState={navigate}/>:<AuthModalViews currentScreen={actualScreen as AuthScreen} onNavigate={navigate} onBackToLogin={()=>navigate('auth_login_default')}/>}</div>;

  return <div className="rialsa-shell min-h-screen bg-[#F7F8FA] text-slate-900 flex h-dvh overflow-hidden">
    <Sidebar key={user.id} currentRole={user.rol} currentScreen={actualScreen} currentUser={user} onNavigate={navigate} onLogout={logout} collapsed={collapsed} onToggleCollapse={()=>setCollapsed(v=>!v)} mobileOpen={mobileOpen} onCloseMobile={()=>setMobileOpen(false)}/>
    <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
      <HeaderBar key={user.id} currentScreen={actualScreen} currentUser={user} notifications={visibleNotifs} onMarkAllAsRead={()=>markRead()} onSelectNotification={n=>{void markRead(n.id);if(n.ticketId)selectTicket(n.ticketId);}} onHelp={()=>navigate('tecnico_kb')} onOpenMenu={()=>setMobileOpen(true)} connected={connected} demo={DEMO_MODE}/>
      <div className="flex-1 overflow-y-auto min-w-0" id="main-content">
        <div className="px-4 py-5 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          {error&&<div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><span>{error}</span><div className="flex gap-2">{!DEMO_MODE&&<button onClick={retry} className="font-semibold underline">Reintentar</button>}<button aria-label="Cerrar error" onClick={()=>setError('')}><X size={16}/></button></div></div>}
          {loading?<div role="status" className="space-y-3 p-5 border bg-white rounded-lg"><div className="h-5 w-44 bg-slate-200 rounded animate-pulse"/><div className="h-20 bg-slate-100 rounded animate-pulse"/><p className="text-sm text-slate-600">Cargando datos autorizados…</p></div>:<div key={`${user.id}-${actualScreen}`} className="rialsa-page">
            {actualScreen==='empleado_inicio'&&<EmployeeHomeView currentUser={user} tickets={ownTickets} onNavigate={navigate} onSelectTicket={selectTicket} onAsk={(query)=>{setDraft({asunto:query,descripcion:query,categoria:'',prioridad:''});navigate('empleado_asistente_ia');}}/>}
            {actualScreen==='empleado_asistente_ia'&&<EmployeeAiAssistantView key={user.id} currentUser={user} initialTicketDraft={draft} onClearDraft={()=>setDraft(null)} onEscalate={d=>{if(d)setDraft({...d,prioridad:d.prioridad||''});navigate('empleado_nuevo');}}/>}
            {actualScreen==='empleado_mis_tickets'&&<EmployeeMyTicketsView tickets={ownTickets} currentUser={user} onSelectTicket={selectTicket} onCreateNew={()=>navigate('empleado_nuevo')}/>}
            {actualScreen==='empleado_nuevo'&&<EmployeeNewTicketView initialDraft={draft} busy={busy} internal={user.rol!=='empleado'} onCancel={()=>{setDraft(null);navigate(user.rol==='empleado'?'empleado_mis_tickets':'tecnico_cola');}} onSubmitTicket={createTicket} onTryAiFirst={user.rol==='empleado'?d=>{if(d)setDraft(d);navigate('empleado_asistente_ia');}:undefined}/>}
            {actualScreen==='empleado_detalle'&&(selected?<EmployeeTicketDetailView key={selected.id} ticket={selected} currentUser={user} onBackToList={()=>navigate('empleado_mis_tickets')} onAddComment={(id,v)=>ticketAction('comment',id,v)}/>:<div className="empty-state">Selecciona un ticket de <button className="text-blue-700 underline" onClick={()=>navigate('empleado_mis_tickets')}>Mis tickets</button>.</div>)}
            {actualScreen==='tecnico_cola'&&<TechnicianTicketQueueView tickets={ownTickets} currentUser={user} onSelectTicket={selectTicket} onCreateInternalTicket={()=>navigate('empleado_nuevo')} onAssignTicket={(id,v)=>ticketAction('assign',id,v)}/>}
            {actualScreen==='tecnico_detalle'&&(selected?<TechnicianTicketDetailView key={selected.id} ticket={selected} currentUser={user} busy={busy} onBackToQueue={()=>navigate('tecnico_cola')} onResolveTicket={id=>ticketAction('resolve',id)} onEscalateTicket={id=>ticketAction('escalate',id)} onAssignTicket={(id,v)=>ticketAction('assign',id,v)} onAddNote={(id,v)=>ticketAction('note',id,v)} onAddComment={(id,v)=>ticketAction('comment',id,v)}/>:<div className="empty-state">Selecciona un ticket de la <button className="text-blue-700 underline" onClick={()=>navigate('tecnico_cola')}>cola operativa</button>.</div>)}
            {actualScreen==='tecnico_kb'&&<TechnicianKbView/>}
            {actualScreen==='admin_dashboard'&&user.rol==='admin'&&<AdminDashboard currentUser={user} tickets={ownTickets} technicians={technicians} onAssignTicket={(id,v)=>ticketAction('assign',id,v)} onAddTechnician={addTech} onForceAssignment={(id)=>{const tech=technicians[0];if(tech)void ticketAction('assign',id,tech.nombre);}} onExportCSV={()=>{const escape=(v:string)=>`"${v.replace(/"/g,'""')}"`;const csv=['Ticket,Asunto,Solicitante,Prioridad,Estado,Asignacion',...ownTickets.map(t=>[t.id,t.asunto,t.solicitante,t.prioridad,t.estado,t.asignacion].map(escape).join(','))].join('\n');const url=URL.createObjectURL(new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`RIALSA_Auditoria_Tickets_${Date.now()}.csv`;a.click();URL.revokeObjectURL(url);}} onExportPDF={()=>printExecutiveReport(ownTickets,technicians)} onLogout={logout}/>}
          </div>}
        </div>
      </div>
    </main>
    {toast&&<div role="status" className="rialsa-toast fixed bottom-4 right-4 z-[80] w-[min(380px,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-4 shadow-lg flex items-start gap-3 text-slate-900"><span className="text-blue-700">{toast.tipo==='comentario'?<MessageSquare size={19}/>:toast.tipo==='asignacion'?<UserCheck size={19}/>:toast.tipo==='estado'?<CheckCircle2 size={19}/>:<Bell size={19}/>}</span><div className="flex-1 min-w-0"><p className="text-sm font-semibold">{textOnlyIcon(toast.titulo)}</p><p className="mt-1 text-sm text-slate-600 break-words">{textOnlyIcon(toast.mensaje)}</p></div><button aria-label="Cerrar notificación" onClick={()=>setToast(null)}><X size={16}/></button></div>}
  </div>;
};
