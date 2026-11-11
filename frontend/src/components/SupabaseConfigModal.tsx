import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Database, X, CheckCircle2, ShieldCheck, ExternalLink, KeyRound, Globe, Copy, Check } from 'lucide-react';
import { isSupabaseConfigured, setSupabaseCredentials, SUPABASE_URL, SUPABASE_ANON_KEY } from '../services/supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const shouldReduceMotion = useReducedMotion();
  const [url, setUrl] = useState(SUPABASE_URL || '');
  const [key, setKey] = useState(SUPABASE_ANON_KEY || '');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) return;
    setSupabaseCredentials(url.trim(), key.trim());
  };

  const copySqlPath = () => {
    navigator.clipboard.writeText('supabase_setup.sql');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
        className="bg-[#0B0D11] border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-slate-200 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Base de Datos Centralizada (Supabase)</span>
                {isSupabaseConfigured ? (
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En línea
                  </span>
                ) : (
                  <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Modo Local
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Sincronización en tiempo real entre computadoras (PostgreSQL).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        {isSupabaseConfigured ? (
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold mb-0.5">
                ¡Base de Datos Conectada Exitosamente!
              </strong>
              Los tickets, comentarios y estados se sincronizan en vivo entre computadoras mediante WebSockets.
            </div>
          </div>
        ) : (
          <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-4 text-xs text-blue-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Pasos rápidos para conectar en 2 minutos:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
              <li>Crea un proyecto gratis en <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 underline font-semibold inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
              <li>Abre <strong>SQL Editor</strong> y ejecuta el script <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono">supabase_setup.sql</code> que ya te dejé creado.</li>
              <li>Copia tu <strong>Project URL</strong> y <strong>anon public key</strong> (en Project Settings &gt; API) y pégalos aquí abajo:</li>
            </ol>
          </div>
        )}

        {/* Config Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Project URL de Supabase:</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://tu-proyecto.supabase.co"
              required
              className="w-full text-xs px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anon Public Key (Clave Pública Anónima):</span>
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              required
              className="w-full text-xs px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={copySqlPath}
              className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 transition"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? '¡Nombre de script copiado!' : 'Archivo: supabase_setup.sql'}</span>
            </button>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Guardar y Conectar Base de Datos</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

