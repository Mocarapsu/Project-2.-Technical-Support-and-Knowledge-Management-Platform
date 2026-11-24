import { supabase, DEMO_MODE } from './supabaseClient';
import { AppNotification, TechnicianProfile, TicketItem, UserAccount } from '../types/figma-tickets';
import { mapRowToTicket } from './db';

function client() {
  if (!supabase || DEMO_MODE) throw new Error('Configura Supabase y ejecuta la migración QA V2 para acceder al entorno conectado.');
  return supabase;
}
async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const {data,error} = await client().rpc(fn,args);
  if (error) throw new Error(error.message);
  return data as T;
}
export async function loadCloudProfile(): Promise<UserAccount | null> {
  if (!supabase || DEMO_MODE) return null;
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) return null;
  return rpc<UserAccount>('rialsa_profile');
}
export async function signInCloud(email: string, password: string): Promise<UserAccount> {
  const {error} = await client().auth.signInWithPassword({email,password});
  if (error) throw new Error('Correo o contraseña incorrectos, o servicio de autenticación no disponible.');
  try {
    const profile = await loadCloudProfile();
    if (!profile) throw new Error('La cuenta no tiene un perfil autorizado.');
    return profile;
  } catch (err) { await client().auth.signOut(); throw err; }
}
export async function signOutCloud() { if (supabase) await supabase.auth.signOut({scope:'local'}); }
export async function loadWorkspace(): Promise<{tickets:TicketItem[]; technicians:TechnicianProfile[]; notifications:AppNotification[]}> {
  const data = await rpc<{tickets:any[]; technicians:any[]; notifications:any[]}>('rialsa_workspace');
  return {
    tickets:(data.tickets || []).map(mapRowToTicket),
    technicians:(data.technicians || []).map(t => ({id:t.id,nombre:t.nombre,email:t.email,especialidad:t.especialidad,nivel:t.nivel,ticketsActivos:t.tickets_activos,estado:t.estado})),
    notifications:(data.notifications || []).map(n => ({id:n.id,titulo:n.titulo,mensaje:n.mensaje,tipo:n.tipo,ticketId:n.ticket_id || undefined,destinatarioRol:n.destinatario_rol,destinatarioUsuario:n.destinatario_usuario || undefined,leida:n.leida,timestamp:n.timestamp}))
  };
}
export async function cloudTicketAction(action:string, payload:Record<string,unknown>):Promise<string> {
  return rpc<string>('rialsa_ticket_action',{p_action:action,p_data:payload});
}
export async function cloudMarkRead(id?:string) { return rpc('rialsa_mark_read',{p_id:id || null}); }
export async function cloudAddTechnician(tech:TechnicianProfile) { return rpc('rialsa_add_technician',{p_data:tech}); }
