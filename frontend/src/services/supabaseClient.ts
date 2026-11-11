import { createClient } from '@supabase/supabase-js';

// 1. Obtener credenciales de variables de entorno de Vite o de localStorage
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('rialsa_supabase_url') || '' : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('rialsa_supabase_key') || '' : '';

export const SUPABASE_URL = (envUrl || localUrl).trim();
export const SUPABASE_ANON_KEY = (envKey || localKey).trim();

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

// Helper para guardar credenciales dinámicamente desde el navegador si no se usó .env
export function setSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rialsa_supabase_url', url.trim());
    localStorage.setItem('rialsa_supabase_key', key.trim());
    window.location.reload();
  }
}
