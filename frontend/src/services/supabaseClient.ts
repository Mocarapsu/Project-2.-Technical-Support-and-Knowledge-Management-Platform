import { createClient } from '@supabase/supabase-js';

// Modo de demostración activo por defecto (en local y en Vercel para pruebas de evaluación),
// a menos que se configure explícitamente VITE_DEMO_MODE=false.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';
export function cleanSupabaseUrl(raw: string): string {
  return (raw || '').trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}
export const SUPABASE_URL = cleanSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
export const isSupabaseConfigured = !DEMO_MODE && Boolean(SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith('sb_secret_'));
export const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}}) : null;
// La configuración del servidor se establece por variables de entorno; no se
// permite cambiar la base de datos desde una sesión de usuario.
export function setSupabaseCredentials(_url: string, _key: string) {
  throw new Error('La conexión se configura mediante las variables de entorno del despliegue.');
}
