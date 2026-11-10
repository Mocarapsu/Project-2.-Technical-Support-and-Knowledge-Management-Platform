import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bot, Clock, AlertTriangle, Shield, Check, Lock, ChevronLeft, CheckCircle2, MessageSquare, Send } from 'lucide-react';

import { TicketItem, UserAccount } from '../../types/figma-tickets';

interface Props {
  ticket?: TicketItem;
  currentUser?: UserAccount | null;
  onBackToQueue?: () => void;
  onResolveTicket?: (ticketId: string) => void;
  onAssignTicket?: (ticketId: string, techName: string) => void;
  onAddNote?: (ticketId: string, noteText: string) => void;
  onAddComment?: (ticketId: string, commentText: string) => void;
}

export const TechnicianTicketDetailView: React.FC<Props> = ({
  ticket,
  currentUser,
  onBackToQueue,
  onResolveTicket,
  onAssignTicket,
  onAddNote,
  onAddComment
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [notaInterna, setNotaInterna] = useState('');
  const [respuestaPublica, setRespuestaPublica] = useState('');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const initialNotes = ticket?.notasInternas && ticket.notasInternas.length > 0
    ? ticket.notasInternas
    : ['Se verificó en Active Directory y el usuario tiene la cuenta bloqueada por intentos fallidos de NTLM.'];

  const [localNotes, setLocalNotes] = useState<string[]>(initialNotes);

  const currentId = ticket ? ticket.id : 'TCK-1048';
  const isResolved = ticket ? ticket.estado === 'Resuelto' : false;
  const currentAssignee = ticket ? ticket.asignacion : 'Mesa Nivel 1';

  const handleSaveNote = () => {
    if (!notaInterna.trim()) return;
    const noteText = notaInterna.trim();
    setLocalNotes((prev) => [...prev, noteText]);
    onAddNote?.(currentId, noteText);
    setNotaInterna('');
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3500);
  };

  const handleSendPublicResponse = () => {
    if (!respuestaPublica.trim()) return;
    onAddComment?.(currentId, respuestaPublica.trim());
    setRespuestaPublica('');
  };

  const handleResolve = () => {
    if (onResolveTicket) {
      onResolveTicket(currentId);
    }
  };

  const handleAssignMe = () => {
    if (onAssignTicket) {
      onAssignTicket(currentId, currentUser?.nombre || 'Alfredo González Soto');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6"
    >
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToQueue}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold pr-2 border-r border-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Cola</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentId}</h1>
          {isResolved ? (
            <span className="bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resuelto</span>
            </span>
          ) : (
            <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>En progreso</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAssignMe}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition"
          >
            {currentAssignee === 'Ing. Bautista (Técnico)' ? 'Asignado a ti' : 'Asignarme'}
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition"
          >
            Escalar
          </button>
          <motion.button
            type="button"
            onClick={handleResolve}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            className={`text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 ${
              isResolved
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-black text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isResolved ? 'Ticket Resuelto' : 'Resolver'}</span>
          </motion.button>
        </div>
      </div>

      {/* Black SLA Alert Banner */}
      <div className="bg-slate-900 text-white px-5 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-slate-100 uppercase">SLA Y PRIORIDAD</span>
          <span className="text-slate-500">·</span>
          <span className="text-red-400 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Alta (4 horas) - SLA 12 min restante
          </span>
        </div>
        <div className="text-slate-400 font-medium">
          Última actividad: <span className="text-slate-200">09:54</span>
        </div>
      </div>

      {/* 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Incidencia reportada */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Incidencia reportada
              </h3>
              <span className="text-[11px] text-slate-400">
                Reportó {ticket?.solicitante || 'Empleado RIALSA'} · En vivo
              </span>
            </div>
            <div className="text-xs text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 leading-relaxed">
              No puedo conectarme a la VPN desde mi laptop fuera de la oficina. El cliente indica que no puede
              validar mis credenciales de dominio corporativo.
            </div>
          </div>

          {/* Contexto de RIALSA IA */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>Contexto de RIALSA IA</span>
            </h3>
            <div className="bg-blue-50/40 border border-blue-200/70 rounded-xl p-4 text-xs space-y-1.5">
              <div className="font-semibold text-slate-800">
                3 intentos guiados · Escalado automático por fallo repetido.
              </div>
              <div className="text-slate-600">
                El usuario intentó restablecer token y reiniciar adaptador virtual TAP-Windows según KB-231.
              </div>
              <div className="pt-1">
                <span className="text-blue-700 font-mono text-[11px] bg-blue-100/60 px-2 py-0.5 rounded">
                  Sesión IA-4123 | Consulta: VPN remoto - v2
                </span>
              </div>
            </div>
          </div>

          {/* Conversación pública con el Solicitante (Comentarios sincronizados) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Conversación con el Solicitante ({ticket?.comentariosPublicos?.length || 0})</span>
              </h3>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Público / Visible para el Cliente
              </span>
            </div>

            {ticket?.comentariosPublicos && ticket.comentariosPublicos.length > 0 ? (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {ticket.comentariosPublicos.map((c) => {
                  const isTech = c.rol === 'tecnico' || c.rol === 'admin';
                  return (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        isTech
                          ? 'bg-blue-50/60 border-blue-200'
                          : 'bg-slate-50 border-slate-200'
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
                            {c.rol === 'tecnico' ? '🛠 Técnico TI' : c.rol === 'admin' ? '🛡 Admin TI' : '👤 Cliente'}
                          </span>
                          <span>{c.autor}</span>
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
                El solicitante aún no ha enviado mensajes en este ticket. Puedes escribirle a continuación.
              </div>
            )}

            {/* Responder públicamente al cliente */}
            <div className="space-y-2 pt-1">
              <textarea
                rows={2}
                value={respuestaPublica}
                onChange={(e) => setRespuestaPublica(e.target.value)}
                placeholder="Escribe una respuesta directa para el cliente..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSendPublicResponse}
                  disabled={!respuestaPublica.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Enviar mensaje al cliente</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notas Guardadas */}
          {localNotes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Notas técnicas previas ({localNotes.length})</span>
              </h3>
              <div className="space-y-2">
                {localNotes.map((nota, idx) => (
                  <div key={idx} className="bg-amber-50/50 border border-amber-200/70 rounded-lg p-3 text-xs text-slate-700">
                    <div className="text-[10px] text-amber-900 font-bold mb-1 flex items-center justify-between">
                      <span>Mesa de Ayuda (TI) · {currentUser?.nombre || 'Técnico Especialista'}:</span>
                      <span className="text-amber-700 font-mono text-[9px] bg-amber-100/80 px-1.5 py-0.5 rounded">FR-06 Privada</span>
                    </div>
                    {nota}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback de guardado */}
          {showSavedFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Nota interna guardada con éxito en el ticket y registrada en auditoría (FR-06).</span>
            </motion.div>
          )}

          {/* Editor Nota Interna */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-700" />
                <span>Nota interna (Privada para TI)</span>
              </h3>
              <span className="text-[11px] text-slate-400">No visible para el empleado</span>
            </div>
            <textarea
              rows={3}
              value={notaInterna}
              onChange={(e) => setNotaInterna(e.target.value)}
              placeholder="Visible únicamente para el equipo de TI..."
              className="w-full text-xs border border-slate-300 rounded-lg p-3 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded text-blue-600" />
                <span>Notificar al solicitante al actualizar resolución</span>
              </label>
              <motion.button
                type="button"
                onClick={handleSaveNote}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Guardar nota interna
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column - Datos del Ticket & Auditoría */}
        <div className="lg:col-span-4 space-y-5">
          {/* Datos del ticket */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Datos del ticket</h3>
            <div className="space-y-2 divide-y divide-slate-200/60 pt-1">
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Solicitante:</span>
                <span className="font-semibold text-slate-800">{ticket?.solicitante || 'Empleado RIALSA'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Departamento:</span>
                <span className="font-semibold text-slate-800">Operaciones / TI2</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Asignado:</span>
                <span className="font-semibold text-slate-800">{ticket?.asignacion || currentAssignee || 'Sin asignar'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Prioridad:</span>
                <span className={`font-bold px-2 py-0.5 rounded border ${
                  ticket?.prioridad === 'Crítica'
                    ? 'text-red-700 bg-red-50 border-red-200'
                    : ticket?.prioridad === 'Alta'
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : ticket?.prioridad === 'Media'
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : 'text-slate-700 bg-slate-50 border-slate-200'
                }`}>
                  {ticket?.prioridad || 'Media'}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Categoría:</span>
                <span className="font-semibold text-slate-800">{ticket?.categoria || 'General'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">SLA:</span>
                <span className={`font-bold ${
                  ticket?.prioridad === 'Crítica' ? 'text-red-600' : 'text-slate-700'
                }`}>
                  {ticket?.prioridad === 'Crítica' ? '1h (Crítico)' : ticket?.prioridad === 'Alta' ? '4h estándar' : '8h estándar'}
                </span>
              </div>
            </div>
          </div>

          {/* Auditoría */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Auditoría</span>
            </h3>
            <div className="space-y-3 relative pl-3 border-l border-slate-200 ml-1 text-[11px]">
              {ticket?.historialAuditoria && ticket.historialAuditoria.map((aud, i) => (
                <div key={i} className="text-amber-800 font-semibold bg-amber-50 p-1.5 rounded border border-amber-200/60">
                  {aud}
                </div>
              ))}
              <div>
                <div className="font-semibold text-slate-800">09:54 · Auto-diagnóstico IA falló</div>
                <div className="text-slate-500">Escalado automático a cola</div>
              </div>
              <div>
                <div className="font-semibold text-slate-800">09:35 · Asignado a: {ticket?.asignacion || currentAssignee || 'Mesa de Ayuda'}</div>
                <div className="text-slate-500">Algoritmo Least-Loaded / Asignación Admin</div>
              </div>
              <div>
                <div className="font-semibold text-slate-800">09:23 · Creado por: {ticket?.solicitante || 'Empleado'}</div>
                <div className="text-slate-500">Portal web de soporte</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
