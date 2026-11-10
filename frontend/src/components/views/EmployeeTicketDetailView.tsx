import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bot, ArrowRight, Clock, CheckCircle2, User, Send } from 'lucide-react';

import { TicketItem, UserAccount } from '../../types/figma-tickets';

interface Props {
  ticket?: TicketItem;
  currentUser?: UserAccount | null;
  onBackToList?: () => void;
  onAddComment?: (ticketId: string, commentText: string) => void;
}

export const EmployeeTicketDetailView: React.FC<Props> = ({
  ticket,
  currentUser,
  onBackToList,
  onAddComment
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [comentario, setComentario] = useState('');

  const currentId = ticket ? ticket.id : 'TCK-1048';
  const currentStatus = ticket ? ticket.estado : 'En progreso';
  const currentPriority = ticket ? ticket.prioridad : 'Alta';
  const currentCategory = ticket ? ticket.categoria : 'Acceso';
  const currentAsunto = ticket ? ticket.asunto : 'No puedo conectarme a la VPN desde mi laptop fuera de la oficina. El cliente indica que no puede validar mis credenciales.';

  const handleSendComment = () => {
    if (!comentario.trim()) return;
    onAddComment?.(currentId, comentario.trim());
    setComentario('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6"
    >
      {/* Top Header & Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-md transition"
            >
              ← Volver
            </button>
          )}
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentId}</h1>
          <span className={`text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs inline-flex items-center gap-1.5 ${
            currentStatus === 'Resuelto' ? 'bg-emerald-700' : currentStatus === 'En progreso' ? 'bg-blue-600' : 'bg-amber-500'
          }`}>
            {currentStatus === 'Resuelto' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {currentStatus === 'En progreso' && <Clock className="w-3.5 h-3.5" />}
            <span>{currentStatus}</span>
          </span>
          <span className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-2 py-0.5 rounded uppercase">
            PRIORIDAD {currentPriority.toUpperCase()}
          </span>
          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold px-2 py-0.5 rounded">
            {currentCategory.toUpperCase()}
          </span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Creado 15 oct 2026 - 09:23
        </div>
      </div>

      {/* Black Alert Banner */}
      <div className="bg-slate-900 text-white px-5 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-slate-100 uppercase">SEGUIMIENTO ACTIVO</span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> SLA restante 01 h 12 min
          </span>
        </div>
        <div className="text-slate-300 font-medium">
          Técnico asignado: <strong className="text-white">{ticket?.asignacion || 'Mesa de ayuda - Nivel 1'}</strong>
        </div>
      </div>

      {/* 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Descripción */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Descripción</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              {currentAsunto}
            </p>
          </div>

          {/* Contexto transferido desde RIALSA IA */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>Contexto transferido desde RIALSA IA</span>
            </h3>
            <div className="bg-blue-50/40 border border-blue-200/70 rounded-xl p-4 space-y-2 text-xs">
              <p className="text-slate-700">
                El sistema generó un diagnóstico previo con el usuario. El último modelo indicó: credenciales no
                válidas en gateway secundario. Fuente técnica consultada:{' '}
                <strong className="text-blue-800">KB-231 v2 (Acceso VPN GlobalProtect)</strong>.
              </p>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1 pt-1"
              >
                <span>Ver conversación completa</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Historial de Comentarios Persistentes */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Historial de conversación y notas ({ticket?.comentariosPublicos?.length || 0})</span>
              <span className="text-[10px] text-slate-400 font-normal">Visible para solicitante y técnicos</span>
            </h3>

            {ticket?.comentariosPublicos && ticket.comentariosPublicos.length > 0 ? (
              <div className="space-y-2.5">
                {ticket.comentariosPublicos.map((c) => {
                  const isMine = Boolean(
                    currentUser?.nombre && c.autor.toLowerCase().includes(currentUser.nombre.toLowerCase().split(' ')[0])
                  );

                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition ${
                        isMine
                          ? 'bg-blue-50/50 border-blue-200'
                          : c.rol === 'tecnico'
                          ? 'bg-slate-50 border-slate-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                              c.rol === 'tecnico'
                                ? 'bg-blue-600 text-white'
                                : c.rol === 'admin'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-700 text-white'
                            }`}
                          >
                            {c.rol === 'tecnico' ? '🛠 Técnico' : c.rol === 'admin' ? '🛡 Admin' : '👤 Empleado'}
                          </span>
                          <span>{c.autor}</span>
                          {isMine && <span className="text-blue-600 font-bold">(Tú)</span>}
                        </div>
                        <span className="text-slate-400 font-mono text-[9px]">{c.fecha}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-normal">{c.texto}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 italic">
                Aún no hay comentarios en este ticket. Escribe abajo para comunicarte con soporte técnico.
              </div>
            )}
          </div>

          {/* Agregar comentario */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Agregar comentario</h3>
            <textarea
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe información adicional para el técnico..."
              className="w-full text-xs border border-slate-300 rounded-lg p-3 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
            <div className="flex justify-end">
              <motion.button
                type="button"
                onClick={handleSendComment}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Enviar comentario</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column - Seguimiento */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Seguimiento</h3>

            {/* Timeline */}
            <div className="space-y-4 text-xs relative pl-4 border-l border-slate-200 ml-1">
              {/* Event 1 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <div className="font-semibold text-slate-800">Asignado a técnico</div>
                <div className="text-[11px] text-slate-600 font-medium">{ticket?.asignacion || 'Mesa de ayuda - Nivel 1'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">15 Oct 09:35</div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-white" />
                <div className="font-semibold text-slate-800">Escalado desde IA</div>
                <div className="text-[11px] text-slate-500">Contexto y fuentes adjuntas</div>
                <div className="text-[10px] text-slate-400 mt-0.5">15 Oct 09:30</div>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-white" />
                <div className="font-semibold text-slate-800">Ticket creado</div>
                <div className="text-[11px] text-slate-500">
                  Por {ticket?.solicitante || currentUser?.nombre || 'Usuario'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">15 Oct 09:23</div>
              </div>
            </div>

            {/* Info Card */}
            <div className="pt-4 border-t border-slate-200/70 text-xs space-y-1.5">
              <div className="text-slate-500 font-semibold">Técnico asignado:</div>
              <div className="font-bold text-slate-800 text-sm">{ticket?.asignacion || 'Mesa de ayuda - Nivel 1'}</div>
              <div className="text-[11px] text-slate-500">
                SLA objetivo: {ticket?.prioridad === 'Crítica' ? '1 hora (Crítico)' : ticket?.prioridad === 'Alta' ? '4 horas (Alta prioridad)' : ticket?.prioridad === 'Media' ? '8 horas' : '24 horas'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
