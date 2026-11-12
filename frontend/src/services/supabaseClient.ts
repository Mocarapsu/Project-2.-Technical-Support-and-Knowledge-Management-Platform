import { createClient } from '@supabase/supabase-js';

// Función para sanitizar la URL (elimina /rest/v1/ o barras sobrantes si el usuario las pegó)
export function cleanSupabaseUrl(raw: string): string {
  if (!raw) return '';
  return raw.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}

// Credenciales oficiales de Supabase para RIALSA
const DEFAULT_URL = 'https://pedgmulkxdrnpdlzwscr.supabase.co';
const DEFAULT_KEY = 'sb_publishable_JK43SN8ol0H214zdg2iguA_0q6zgsmE';

// 1. Obtener credenciales de variables de entorno de Vite, localStorage o fallback oficial
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('rialsa_supabase_url') || '' : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('rialsa_supabase_key') || '' : '';

export const SUPABASE_URL = cleanSupabaseUrl(localUrl || envUrl || DEFAULT_URL);
export const SUPABASE_ANON_KEY = (localKey || envKey || DEFAULT_KEY).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('TU_PROJECT')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// Helper para guardar credenciales dinámicamente desde el navegador
export function setSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    const cleaned = cleanSupabaseUrl(url);
    localStorage.setItem('rialsa_supabase_url', cleaned);
    localStorage.setItem('rialsa_supabase_key', key.trim());
    window.location.reload();
  }
}
