import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Search, Filter, Tag, Eye, ArrowUpRight, X, Sparkles } from 'lucide-react';
import { KbArticle } from '../../types/figma-tickets';

const KB_ARTICLES: KbArticle[] = [
  {
    id: 'kb-1',
    codigo: 'KB-014',
    titulo: 'Calibración y solución de atasco de etiquetas en impresoras Zebra ZT230',
    categoria: 'Hardware',
    resumen: 'Procedimiento operativo estándar para calibrar sensores térmicos, resolver LED rojo parpadeante y bloqueo de cabezal en líneas de embarque.',
    vistas: 148,
    actualizado: 'Hace 3 días',
    tags: ['Zebra', 'Embarque', 'Hardware', 'Impresoras']
  },
  {
    id: 'kb-2',
    codigo: 'KB-231',
    titulo: 'Acceso VPN corporativo y errores de credenciales en GlobalProtect v2',
    categoria: 'Acceso',
    resumen: 'Pasos de diagnóstico para resolver fallos de validación RADIUS/Active Directory en laptops de usuarios fuera de oficina.',
    vistas: 312,
    actualizado: 'Hace 1 semana',
    tags: ['VPN', 'GlobalProtect', 'RADIUS', 'Seguridad']
  },
  {
    id: 'kb-3',
    codigo: 'KB-008',
    titulo: 'Diagnóstico de tormentas de broadcast y reboot de puertos en switch de planta',
    categoria: 'Redes',
    resumen: 'Instrucciones para operadores de soporte al identificar caídas de enlace Ethernet en quioscos y líneas de ensamble.',
    vistas: 95,
    actualizado: 'Hace 2 semanas',
    tags: ['Cisco', 'Switches', 'LAN', 'Planta 2']
  },
  {
    id: 'kb-4',
    codigo: 'KB-102',
    titulo: 'Restablecimiento de contraseña y desbloqueo de cuentas en Dominio GID',
    categoria: 'Acceso',
    resumen: 'Guía rápida para la mesa de ayuda para desbloqueo de usuarios con bloqueo por intentos fallidos en terminales de planta.',
    vistas: 240,
    actualizado: 'Hace 4 días',
    tags: ['Active Directory', 'Cuentas', 'Contraseñas']
  }
];

export const TechnicianKbView: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [activeArticle, setActiveArticle] = useState<KbArticle | null>(null);

  const filtered = KB_ARTICLES.filter((a) => {
    const matchesSearch =
      a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todas' || a.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Base de Conocimiento Técnica
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manuales oficiales, procedimientos autorizados de planta e índice indexado para RIALSA IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>ChromaDB Vector Store Sincronizado</span>
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['Todas', 'Hardware', 'Acceso', 'Redes'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, título o tag..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((art) => (
          <div
            key={art.id}
            onClick={() => setActiveArticle(art)}
            className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer space-y-3 group"
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                {art.codigo}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{art.vistas} vistas</span>
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
              {art.titulo}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {art.resumen}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {art.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded">
                  {activeArticle.codigo} · {activeArticle.categoria}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  {activeArticle.titulo}
                </h2>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <strong className="block text-slate-900 mb-1">Resumen del manual:</strong>
                {activeArticle.resumen}
              </div>

              <h4 className="font-bold text-slate-900 text-sm">Procedimiento Técnico Autorizado:</h4>
              <ol className="list-decimal list-inside space-y-2 pl-1 text-slate-700">
                <li>Verificar los registros de eventos de Windows y comprobar la conectividad en el puerto TCP correspondiente.</li>
                <li>Comprobar si el usuario cuenta con el certificado de equipo vigente emitido por la CA interna de GID.</li>
                <li>Si el problema persiste, restablecer la configuración de red y reiniciar el adaptador virtual correspondiente.</li>
              </ol>

              <div className="p-3 bg-amber-50 text-amber-900 rounded-lg border border-amber-200/80 text-[11px]">
                <strong>Nota de seguridad NFR-08:</strong> Este documento está restringido para uso interno del Grupo Industrial Delnorte. No compartir externamente.
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveArticle(null)}
                className="bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-black transition"
              >
                Cerrar manual
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

