import React,{useState} from 'react';
import {ArrowUpRight,Search,Plus,UserCheck,Inbox,AlertCircle,Clock,CheckCircle2} from 'lucide-react';
import {TicketItem,UserAccount} from '../../types/figma-tickets';
import {CATEGORIES,PRIORITIES,canViewTicket} from '../../services/ticketDomain';
import {Button,EmptyState,PriorityBadge,StatusBadge,SLAIndicator} from '../ui';

interface Props{tickets?:TicketItem[];currentUser?:UserAccount|null;onSelectTicket?:(id:string)=>void;onCreate?:()=>void;onAssignTicket?:(id:string,tech:string)=>void;staff?:boolean;}

export const TicketTable:React.FC<Props>=({tickets=[],currentUser:user,onSelectTicket,onCreate,onAssignTicket,staff=false})=>{
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState('Todos');
  const [priority,setPriority]=useState('Todas');
  const [category,setCategory]=useState('Todas');
  const [assignment,setAssignment]=useState('Todos');

  const all=tickets.filter(t=>canViewTicket(t,user));
  const filtered=all.filter(t=>[t.id,t.asunto,t.solicitante].some(x=>(x||'').toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))&&(status==='Todos'||t.estado===status)&&(priority==='Todas'||t.prioridad===priority)&&(category==='Todas'||t.categoria===category)&&(assignment==='Todos'||(assignment==='Sin asignar'?!t.asignacion||t.asignacion==='Sin asignar':t.asignacion===user?.nombre)));
  
  const active=all.filter(t=>t.estado==='En progreso').length;
  const resolved=all.filter(t=>t.estado==='Resuelto').length;
  const assigned=all.filter(t=>t.asignacion===user?.nombre).length;
  const unassigned=all.filter(t=>t.estado!=='Resuelto'&&(!t.asignacion||t.asignacion==='Sin asignar')).length;
  const critical=all.filter(t=>t.estado!=='Resuelto'&&t.prioridad==='Crítica').length;

  const filters=[
    {name:'Estado',value:status,set:setStatus,options:['Todos','Abierto','En progreso','Escalado','Resuelto']},
    {name:'Prioridad',value:priority,set:setPriority,options:['Todas',...PRIORITIES,'No especificada']},
    {name:'Categoría',value:category,set:setCategory,options:['Todas',...new Set([...CATEGORIES,...all.map(t=>t.categoria)])]},
    {name:'Asignación',value:assignment,set:setAssignment,options:['Todos','Sin asignar','Asignados a mí']}
  ];

  const clear=()=>{setSearch('');setStatus('Todos');setPriority('Todas');setCategory('Todas');setAssignment('Todos');};

  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between items-start gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{staff?'Cola de tickets':'Mis tickets'}</h1>
        <p className="text-sm text-slate-600 mt-1">{staff?'Gestiona las solicitudes, atiende tus tickets asignados y prioriza incidentes.':'Consulta y da seguimiento a tus solicitudes de soporte.'}</p>
      </div>
      <Button variant="primary" onClick={onCreate}><Plus size={17}/>{staff?'Crear ticket interno':'Crear ticket'}</Button>
    </div>

    {staff&&<section className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
      <button type="button" onClick={()=>{setAssignment('Asignados a mí');setStatus('Todos');setPriority('Todas');}} className={`p-4 rounded-lg border text-left transition cursor-pointer ${assignment==='Asignados a mí'?'bg-blue-50/90 border-blue-500 ring-2 ring-blue-300 shadow-sm':'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
        <div className="flex items-center justify-between"><p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5"><UserCheck size={15}/> Mis asignados</p><span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Tus tickets</span></div>
        <p className="text-2xl font-bold mt-1.5 text-slate-900 tabular-nums">{assigned}</p>
      </button>

      <button type="button" onClick={()=>{setAssignment('Sin asignar');setStatus('Todos');setPriority('Todas');}} className={`p-4 rounded-lg border text-left transition cursor-pointer ${assignment==='Sin asignar'?'bg-amber-50/90 border-amber-500 ring-2 ring-amber-300 shadow-sm':'bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50'}`}>
        <div className="flex items-center justify-between"><p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5"><Inbox size={15}/> Sin asignar</p></div>
        <p className="text-2xl font-bold mt-1.5 text-slate-900 tabular-nums">{unassigned}</p>
      </button>

      <button type="button" onClick={()=>{setPriority('Crítica');setStatus('Todos');setAssignment('Todos');}} className={`p-4 rounded-lg border text-left transition cursor-pointer ${priority==='Crítica'?'bg-red-50/90 border-red-500 ring-2 ring-red-300 shadow-sm':'bg-white border-slate-200 hover:border-red-300 hover:bg-slate-50'}`}>
        <div className="flex items-center justify-between"><p className="text-xs font-semibold text-red-700 flex items-center gap-1.5"><AlertCircle size={15}/> Críticos</p></div>
        <p className="text-2xl font-bold mt-1.5 text-slate-900 tabular-nums">{critical}</p>
      </button>

      <button type="button" onClick={()=>{setStatus('En progreso');setAssignment('Todos');setPriority('Todas');}} className={`p-4 rounded-lg border text-left transition cursor-pointer ${status==='En progreso'&&assignment==='Todos'?'bg-blue-50/90 border-blue-500 ring-2 ring-blue-300 shadow-sm':'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
        <div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><Clock size={15}/> En progreso</p></div>
        <p className="text-2xl font-bold mt-1.5 text-slate-900 tabular-nums">{active}</p>
      </button>

      <button type="button" onClick={()=>{setStatus('Resuelto');setAssignment('Todos');setPriority('Todas');}} className={`p-4 rounded-lg border text-left transition cursor-pointer ${status==='Resuelto'&&assignment==='Todos'?'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-300 shadow-sm':'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'}`}>
        <div className="flex items-center justify-between"><p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5"><CheckCircle2 size={15}/> Resueltos</p></div>
        <p className="text-2xl font-bold mt-1.5 text-slate-900 tabular-nums">{resolved}</p>
      </button>
    </section>}

    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 space-y-3">
        <div className="flex gap-2 border-b border-slate-100 overflow-x-auto pb-1">
          {staff?(
            <>
              <button type="button" className={`px-3 py-2 border-b-2 text-sm whitespace-nowrap font-medium transition cursor-pointer flex items-center gap-1.5 ${assignment==='Todos'&&status==='Todos'&&priority==='Todas'?'border-blue-600 text-blue-700 font-semibold':'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={()=>{setAssignment('Todos');setStatus('Todos');setPriority('Todas');}}>
                <span>Todos</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{all.length}</span>
              </button>
              <button type="button" className={`px-3 py-2 border-b-2 text-sm whitespace-nowrap font-medium transition cursor-pointer flex items-center gap-1.5 ${assignment==='Asignados a mí'?'border-blue-600 text-blue-700 font-semibold':'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={()=>{setAssignment('Asignados a mí');setStatus('Todos');setPriority('Todas');}}>
                <UserCheck size={15}/>
                <span>🎯 Mis tickets asignados</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${assignment==='Asignados a mí'?'bg-blue-600 text-white':'bg-blue-100 text-blue-700'}`}>{assigned}</span>
              </button>
              <button type="button" className={`px-3 py-2 border-b-2 text-sm whitespace-nowrap font-medium transition cursor-pointer flex items-center gap-1.5 ${assignment==='Sin asignar'?'border-amber-600 text-amber-700 font-semibold':'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={()=>{setAssignment('Sin asignar');setStatus('Todos');setPriority('Todas');}}>
                <Inbox size={15}/>
                <span>Sin asignar</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">{unassigned}</span>
              </button>
              <button type="button" className={`px-3 py-2 border-b-2 text-sm whitespace-nowrap font-medium transition cursor-pointer flex items-center gap-1.5 ${status==='En progreso'&&assignment==='Todos'?'border-blue-600 text-blue-700 font-semibold':'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={()=>{setStatus('En progreso');setAssignment('Todos');setPriority('Todas');}}>
                <span>En progreso</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{active}</span>
              </button>
              <button type="button" className={`px-3 py-2 border-b-2 text-sm whitespace-nowrap font-medium transition cursor-pointer flex items-center gap-1.5 ${status==='Resuelto'&&assignment==='Todos'?'border-emerald-600 text-emerald-700 font-semibold':'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={()=>{setStatus('Resuelto');setAssignment('Todos');setPriority('Todas');}}>
                <span>Resueltos</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">{resolved}</span>
              </button>
            </>
          ):(
            [['Todos',all.length],['En progreso',active],['Resuelto',resolved]].map(([l,n])=><button key={l} className={`px-3 py-2.5 border-b-2 text-sm whitespace-nowrap ${status===l?'border-blue-600 text-blue-700 font-medium':'border-transparent text-slate-500'}`} onClick={()=>setStatus(String(l))}>{l==='Resuelto'?'Resueltos':l} ({n})</button>)
          )}
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="relative flex-1 min-w-[190px]">
            <Search size={17} className="absolute left-3 top-2.5 text-slate-500"/>
            <input aria-label="Buscar tickets" placeholder="Buscar folio o asunto…" value={search} onChange={e=>setSearch(e.target.value)} className="w-full rounded-md border border-slate-300 text-sm pl-9 pr-3 py-2"/>
          </div>
          {staff&&filters.map(f=><select key={f.name} aria-label={f.name} value={f.value} onChange={e=>f.set(e.target.value)} className="border border-slate-300 rounded-md text-sm py-2 px-2 max-w-full">{f.options.map(o=><option value={o} key={o}>{o==='Todos'||o==='Todas'?`${f.name}: ${o}`:o==='Asignados a mí'?`${o} (${assigned})`:o}</option>)}</select>)}
          <Button variant="ghost" onClick={clear}>Limpiar filtros</Button>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <p>{filtered.length} de {all.length} tickets</p>
          {assignment==='Asignados a mí'&&<p className="text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Mostrando únicamente: Tus tickets asignados ({user?.nombre})</p>}
        </div>
      </div>

      {filtered.length?<div className="overflow-x-auto"><table className="w-full text-sm text-left min-w-[680px] border-collapse"><thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-xs text-slate-600"><tr>{['Ticket','Asunto',...(staff?['Solicitante']:[]),'Prioridad','Categoría','Estado','Asignación','SLA',...(staff?['Acción']:[])].map(h=><th key={h} scope="col" className="font-medium px-3 py-3 whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(t=><tr key={t.id} onClick={()=>onSelectTicket?.(t.id)} className="hover:bg-slate-50 cursor-pointer"><td className="px-3 py-3 whitespace-nowrap"><button onClick={e=>{e.stopPropagation();onSelectTicket?.(t.id);}} className="text-blue-700 font-medium flex items-center gap-1">{t.id}<ArrowUpRight size={13}/></button></td><td className="px-3 py-3 font-medium max-w-[280px] min-w-[160px] break-words">{t.asunto}</td>{staff&&<td className="px-3 py-3 text-slate-600">{t.solicitante}</td>}<td className="px-3 py-3"><PriorityBadge priority={t.prioridad}/></td><td className="px-3 py-3 text-slate-600">{t.categoria}</td><td className="px-3 py-3"><StatusBadge status={t.estado}/></td><td className="px-3 py-3 text-slate-600"><span className={t.asignacion===user?.nombre?'font-semibold text-blue-700':''}>{t.asignacion||'Sin asignar'}</span></td><td className="px-3 py-3"><SLAIndicator ticket={t}/></td>{staff&&<td className="px-3 py-3 whitespace-nowrap"><Button disabled={t.estado==='Resuelto'||t.asignacion===user?.nombre} onClick={e=>{e.stopPropagation();if(user)onAssignTicket?.(t.id,user.nombre);}} className="text-xs">{t.asignacion===user?.nombre?'Asignado':'Asignarme'}</Button></td>}</tr>)}</tbody></table></div>:<EmptyState title={assignment==='Asignados a mí'?'No tienes tickets asignados a tu nombre actualmente. Puedes ver la cola general y asignarte tickets pendientes.':(all.length===0&&!staff?'No tienes tickets registrados aún. Como empleado solo ves tus propias solicitudes (aislamiento de seguridad QA V2). Crea tu primer ticket o cambia a rol Técnico en la barra lateral para ver toda la cola.':'No hay tickets con estos filtros.')} action={assignment==='Asignados a mí'?'Ver todos los tickets':(all.length===0&&!staff?'Crear ticket':'Limpiar filtros')} onAction={assignment==='Asignados a mí'?()=>setAssignment('Todos'):(all.length===0&&!staff?onCreate:clear)}/>}
    </section>
  </div>;
};
