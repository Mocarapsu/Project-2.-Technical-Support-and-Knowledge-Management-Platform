import React,{useEffect,useRef,useState} from 'react';
import {Bell,HelpCircle,CheckCheck,MessageSquare,UserCheck,AlertTriangle,CheckCircle2,Database,Menu,X,RefreshCw} from 'lucide-react';
import {ActiveScreen,UserAccount,AppNotification} from '../types/figma-tickets';
import {isSupabaseConfigured} from '../services/supabaseClient';
interface Props{currentScreen:ActiveScreen;currentUser?:UserAccount|null;notifications?:AppNotification[];onMarkAllAsRead?:()=>void;onSelectNotification?:(n:AppNotification)=>void;onOpenDatabaseModal?:()=>void;onHelp?:()=>void;onOpenMenu?:()=>void;onRefresh?:()=>void;connected?:boolean;demo?:boolean;}
const titles:Partial<Record<ActiveScreen,string>>={empleado_inicio:'Inicio',empleado_asistente_ia:'Asistente IA',empleado_mis_tickets:'Mis tickets',empleado_nuevo:'Crear ticket',empleado_detalle:'Detalle de ticket',tecnico_cola:'Cola operativa',tecnico_detalle:'Detalle de ticket',tecnico_kb:'Base de conocimiento',admin_dashboard:'Indicadores y auditoría'};
export const HeaderBar:React.FC<Props>=({currentScreen,currentUser,notifications=[],onMarkAllAsRead,onSelectNotification,onHelp,onOpenMenu,onRefresh,connected,demo})=>{
 const [open,setOpen]=useState(false);const ref=useRef<HTMLDivElement>(null);const button=useRef<HTMLButtonElement>(null);
 const [syncing,setSyncing]=useState(false);
 useEffect(()=>{if(!open)return;const outside=(e:MouseEvent)=>{if(!ref.current?.contains(e.target as Node))setOpen(false);};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);button.current?.focus();}};document.addEventListener('mousedown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',escape);};},[open]);
 const unread=notifications.filter(n=>!n.leida).length;const role=currentUser?.rol==='admin'?'Dirección TI':currentUser?.rol==='tecnico'?'Técnico TI':'Empleado';const initials=currentUser?.nombre.split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase()||'';
 
 const handleSync = () => {
   if (syncing) return;
   setSyncing(true);
   onRefresh?.();
   setTimeout(() => setSyncing(false), 800);
 };

 return <header className="rialsa-header flex items-center justify-between gap-3 px-4 sm:px-6 h-[72px] bg-white border-b border-[#E4E7EC] shrink-0 z-30">
  <div className="flex items-center min-w-0 gap-3"><button onClick={onOpenMenu} aria-label="Abrir navegación" className="lg:hidden p-2 rounded-md hover:bg-slate-100"><Menu size={20}/></button><div className="min-w-0"><p className="text-xs font-medium text-slate-500 hidden sm:block">{role}</p><p className="text-sm font-semibold text-slate-900 truncate">{titles[currentScreen]||'RIALSA'}</p></div></div>
  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
   <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md" title="Base de datos Supabase PostgreSQL Cloud vinculada en tiempo real">
     <Database size={14} className="text-blue-600"/>
     <span className={`h-2 w-2 rounded-full ${isSupabaseConfigured || connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}/>
     <span className="font-medium hidden sm:inline">{isSupabaseConfigured || connected ? 'Supabase Cloud (En vivo)' : 'Base Local'}</span>
     <button type="button" onClick={handleSync} title="Sincronizar ahora con Supabase" className="p-1 hover:bg-slate-200 text-slate-600 rounded transition cursor-pointer">
       <RefreshCw size={13} className={syncing ? 'animate-spin text-blue-600' : ''}/>
     </button>
   </div>
   <button onClick={onHelp} aria-label="Ayuda" className="flex items-center gap-1.5 rounded-md p-2 text-slate-600 hover:bg-slate-100"><HelpCircle size={18}/><span className="hidden md:inline text-sm">Ayuda</span></button>
   <div className="relative" ref={ref}>
    <button ref={button} aria-label={`Notificaciones, ${unread} sin leer`} aria-expanded={open} onClick={()=>setOpen(v=>!v)} className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm text-slate-700 ${open?'border-blue-300 bg-blue-50':'border-slate-200 hover:bg-slate-50'}`}><Bell size={18}/>{unread>0&&<span className="text-xs font-semibold text-blue-700 tabular-nums">{unread}</span>}</button>
    {open&&<section aria-label="Centro de notificaciones" className="rialsa-popover fixed sm:absolute right-2 sm:right-0 top-[76px] sm:top-full sm:mt-2 w-[min(400px,calc(100vw-1rem))] rounded-lg bg-white border border-slate-200 shadow-lg overflow-hidden">
     <div className="px-4 py-3 border-b flex justify-between gap-2 items-center"><div><h2 className="text-sm font-semibold">Notificaciones</h2><p className="text-xs text-slate-500">{unread} sin leer</p></div>{unread>0&&<button onClick={onMarkAllAsRead} className="flex items-center gap-1 text-xs font-medium text-blue-700 px-2 py-2 hover:bg-blue-50 rounded-md"><CheckCheck size={14}/> Marcar todas</button>}<button aria-label="Cerrar notificaciones" onClick={()=>{setOpen(false);button.current?.focus();}} className="p-1.5 hover:bg-slate-100 rounded-md"><X size={16}/></button></div>
     <div className="max-h-[min(65vh,480px)] overflow-y-auto divide-y divide-slate-100">{notifications.length?notifications.map(n=><button key={n.id} onClick={()=>{onSelectNotification?.(n);setOpen(false);}} className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-100 ${n.leida?'bg-white':'bg-blue-50/60'}`}><span className="text-slate-600 mt-0.5 shrink-0">{n.tipo==='comentario'?<MessageSquare size={17}/>:n.tipo==='asignacion'?<UserCheck size={17}/>:n.tipo==='estado'?<CheckCircle2 size={17}/>:<AlertTriangle size={17}/>}</span><div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 break-words">{n.titulo}</p><p className="text-sm text-slate-600 break-words mt-1">{n.mensaje}</p><p className="text-xs text-slate-500 mt-1">{n.timestamp}{n.ticketId&&` · ${n.ticketId}`}{!n.leida&&' · Sin leer'}</p></div>{!n.leida&&<span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0"/>}</button>):<p className="p-8 text-center text-sm text-slate-500">No tienes notificaciones.</p>}</div>
    </section>}
   </div>
   <div className="flex items-center gap-2 pl-2 border-l border-slate-200" title={`${currentUser?.nombre} · ${role}`}><div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-semibold">{initials}</div><div className="hidden xl:block max-w-[160px]"><p className="text-sm font-medium truncate">{currentUser?.nombre}</p><p className="text-xs text-slate-500 truncate">{role}</p></div></div>
  </div>
 </header>;
};
