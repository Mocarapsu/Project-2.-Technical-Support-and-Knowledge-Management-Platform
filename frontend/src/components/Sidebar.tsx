import React from 'react';
import { Home,Bot,Ticket,BookOpen,Plus,LogOut,ShieldCheck,PanelLeftClose,PanelLeftOpen,X,ChevronsUpDown } from 'lucide-react';
import { ActiveScreen,RoleMode,UserAccount } from '../types/figma-tickets';
interface Props {currentRole:RoleMode;currentScreen:ActiveScreen;currentUser?:UserAccount;onNavigate:(screen:ActiveScreen)=>void;onRoleToggle?:(role:RoleMode)=>void;onLogout?:()=>void;collapsed?:boolean;onToggleCollapse?:()=>void;mobileOpen?:boolean;onCloseMobile?:()=>void;}
export const Sidebar:React.FC<Props>=({currentRole,currentScreen,currentUser,onNavigate,onLogout,collapsed,onToggleCollapse,mobileOpen,onCloseMobile})=>{
 const role=currentUser?.rol||currentRole;
 const entries=role==='empleado'?[{id:'empleado_inicio',label:'Inicio',Icon:Home},{id:'empleado_asistente_ia',label:'Asistente IA',Icon:Bot},{id:'empleado_mis_tickets',label:'Mis tickets',Icon:Ticket},{id:'tecnico_kb',label:'Base de conocimiento',Icon:BookOpen}]:role==='tecnico'?[{id:'tecnico_cola',label:'Cola de tickets',Icon:Ticket},{id:'tecnico_kb',label:'Base de conocimiento',Icon:BookOpen}]:[{id:'admin_dashboard',label:'Indicadores y auditoría',Icon:ShieldCheck},{id:'tecnico_cola',label:'Cola operativa',Icon:Ticket}];
 const isActive=(id:string)=>currentScreen===id||(id==='tecnico_cola'&&currentScreen==='tecnico_detalle')||(id==='empleado_mis_tickets'&&currentScreen==='empleado_detalle');
 return <>
  {mobileOpen&&<button className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-label="Cerrar navegación" onClick={onCloseMobile}/>}
  <aside className={`rialsa-sidebar fixed inset-y-0 left-0 z-50 lg:static flex flex-col flex-shrink-0 bg-[#10141C] text-slate-300 border-r border-slate-800 ${mobileOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'} ${collapsed?'lg:w-[68px]':'lg:w-64'} w-64 transition-[transform,width] duration-200 ease-out overflow-hidden`} aria-label="Navegación principal">
   <div className="flex items-center justify-between h-[72px] border-b border-slate-800 px-4 gap-2">
    <div className={`min-w-0 ${collapsed?'lg:hidden':''}`}><p className="text-white text-lg font-semibold tracking-tight">RIALSA</p><p className="text-xs text-slate-400 whitespace-nowrap">Grupo Industrial Delnorte</p></div>
    <button className="hidden lg:flex p-2 rounded-md hover:bg-slate-800 text-slate-300" onClick={onToggleCollapse} aria-label={collapsed?'Expandir navegación':'Colapsar navegación'} title={collapsed?'Expandir navegación':'Colapsar navegación'}>{collapsed?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}</button>
    <button className="lg:hidden p-2" onClick={onCloseMobile} aria-label="Cerrar navegación"><X size={20}/></button>
   </div>
   <div className="flex-1 overflow-y-auto p-3 space-y-5">
    <div className={`${collapsed?'lg:hidden':''} text-xs font-medium text-slate-400 px-2`}>{role==='admin'?'Dirección TI':role==='tecnico'?'Mesa de ayuda':'Portal de soporte'}</div>
    {role==='empleado'&&<button title="Crear ticket" onClick={()=>onNavigate('empleado_nuevo')} className={`w-full flex items-center gap-2 justify-center bg-[#2457E6] text-white hover:bg-blue-700 rounded-md px-3 py-2.5 text-sm font-medium ${currentScreen==='empleado_nuevo'?'ring-2 ring-blue-300':''}`}><Plus size={18} className="shrink-0"/><span className={collapsed?'lg:hidden':''}>Crear ticket</span></button>}
    <nav className="space-y-1">{entries.map(({id,label,Icon})=><button key={id} title={label} aria-current={isActive(id)?'page':undefined} onClick={()=>onNavigate(id as ActiveScreen)} className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm font-medium ${isActive(id)?'bg-slate-800 text-white before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-blue-400 before:rounded-full':'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}><Icon size={17} className="shrink-0"/><span className={`whitespace-nowrap ${collapsed?'lg:hidden':''}`}>{label}</span></button>)}</nav>
   </div>
   <div className="p-3 border-t border-slate-800 space-y-3"><div className={`px-2 min-w-0 ${collapsed?'lg:hidden':''}`}><p className="text-sm text-white font-medium truncate" title={currentUser?.nombre}>{currentUser?.nombre}</p><p className="text-xs text-slate-400 truncate" title={currentUser?.email}>{currentUser?.email}</p></div><button title="Cerrar sesión" onClick={onLogout} className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-slate-800"><LogOut size={17} className="shrink-0"/><span className={collapsed?'lg:hidden':''}>Cerrar sesión</span></button></div>
  </aside>
 </>;
};
