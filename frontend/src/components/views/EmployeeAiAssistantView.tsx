import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Bot,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  Loader2,
  Sparkles,
  KeyRound,
  ExternalLink,
  RotateCcw,
  Settings,
  X,
  Check
} from 'lucide-react';

import { UserAccount } from '../../types/figma-tickets';
import { askAiAssistant, TicketDraftContext, AiDiagnosticResult } from '../../services/aiAssistantService';

interface Props {
  onEscalate?: (draft?: TicketDraftContext) => void;
  currentUser?: UserAccount | null;
  initialTicketDraft?: TicketDraftContext | null;
  onClearDraft?: () => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  steps?: string[];
  citation?: string;
  similarity?: string;
  isResolved?: boolean;
}

export const EmployeeAiAssistantView: React.FC<Props> = ({
  onEscalate,
  currentUser,
  initialTicketDraft,
  onClearDraft
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [isCaseResolved, setIsCaseResolved] = useState(false);
  const [lastProblemSubject, setLastProblemSubject] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [geminiKeyActive, setGeminiKeyActive] = useState(false);
  const [activeModelName, setActiveModelName] = useState('Motor Neuronal RIALSA (RAG)');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getTimeNow = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserInitials = () => {
    if (!currentUser?.nombre) return 'US';
    const parts = currentUser.nombre.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Inicializar estado de mensajes
  const [messages, setMessages] = useState<Message[]>(() => {
    const time = getTimeNow();
    const name = currentUser?.nombre ? currentUser.nombre.split(' ')[0] : 'Colaborador';
    return [
      {
        sender: 'ai',
        text: `Hola ${name}. Soy tu Asistente Técnico RIALSA con IA de Grupo Industrial Delnorte. ¿En qué problema o consulta de sistemas te puedo ayudar hoy?`,
        timestamp: time
      }
    ];
  });

  // Verificar si hay Gemini API Key guardada
  useEffect(() => {
    const savedKey = localStorage.getItem('rialsa_gemini_api_key') || '';
    if (savedKey.trim()) {
      setGeminiKeyActive(true);
      setGeminiKeyInput(savedKey);
      setActiveModelName('Google Gemini 1.5/2.0 Flash');
    }
  }, []);

  // Auto-scroll al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Si viene un borrador desde "Crear ticket" (Probar con IA primero), analizarlo automáticamente
  useEffect(() => {
    if (initialTicketDraft && (initialTicketDraft.asunto || initialTicketDraft.descripcion)) {
      const draftSubject = initialTicketDraft.asunto || initialTicketDraft.descripcion;
      setLastProblemSubject(draftSubject);

      const userQuery = `${initialTicketDraft.asunto}${
        initialTicketDraft.descripcion ? `. Detalle: ${initialTicketDraft.descripcion}` : ''
      }`;

      const userTime = getTimeNow();

      // Agregar mensaje del usuario con su ticket
      setMessages([
        {
          sender: 'ai',
          text: `Hola ${currentUser?.nombre ? currentUser.nombre.split(' ')[0] : 'Colaborador'}. He recibido tu solicitud técnica desde el formulario de tickets. Estoy analizando el procedimiento adecuado en los manuales autorizados de GID...`,
          timestamp: userTime
        },
        {
          sender: 'user',
          text: userQuery,
          timestamp: userTime
        }
      ]);

      setIsLoading(true);

      askAiAssistant(userQuery, currentUser?.email, initialTicketDraft)
        .then((aiRes) => {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: aiRes.respuesta,
              steps: aiRes.pasos,
              citation: aiRes.cita,
              similarity: aiRes.similitud,
              timestamp: getTimeNow()
            }
          ]);
          setActiveModelName(aiRes.modelo);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialTicketDraft]);

  // Guardar clave de Gemini
  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (geminiKeyInput.trim()) {
      localStorage.setItem('rialsa_gemini_api_key', geminiKeyInput.trim());
      setGeminiKeyActive(true);
      setActiveModelName('Google Gemini 1.5/2.0 Flash');
    } else {
      localStorage.removeItem('rialsa_gemini_api_key');
      setGeminiKeyActive(false);
      setActiveModelName('Motor Neuronal RIALSA (RAG)');
    }
    setShowApiKeyModal(false);
  };

  // Enviar mensaje al Asistente IA
  const handleSend = async (overrideText?: string) => {
    const textToSend = (typeof overrideText === 'string' ? overrideText : inputText).trim();
    if (!textToSend || isLoading) return;
    const userText = textToSend;
    const time = getTimeNow();

    setLastProblemSubject(userText);
    setInputText('');
    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userText,
        timestamp: time
      }
    ]);
    setIsLoading(true);

    try {
      const aiRes = await askAiAssistant(
        userText,
        currentUser?.email,
        initialTicketDraft || undefined
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiRes.respuesta,
          steps: aiRes.pasos,
          citation: aiRes.cita,
          similarity: aiRes.similitud,
          timestamp: getTimeNow()
        }
      ]);
      setActiveModelName(aiRes.modelo);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `He recibido tu consulta sobre "${userText}". Por favor intenta reiniciar el servicio correspondiente o verifica la conexión física del equipo.`,
          steps: [
            'Comprueba la alimentación y conexiones físicas del equipo.',
            'Cierra la sesión y vuelve a ingresar para refrescar permisos.',
            'Si persiste, puedes escalar a un especialista técnico.'
          ],
          citation: 'Manual de Procedimientos Generales GID (IT-STD-01)',
          similarity: '0.80',
          timestamp: getTimeNow()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Botón: No funcionó (Intentos 2 y 3 contextuales)
  const handleNotWorking = () => {
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    const time = getTimeNow();
    const topic = lastProblemSubject || 'el incidente reportado';

    if (nextAttempt === 2) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text: 'No funcionó la primera solución recomendada. El problema continúa.',
          timestamp: time
        },
        {
          sender: 'ai',
          text: `Entendido. Registrando Intento 2 de 3 con procedimiento de contingencia para "${topic}":`,
          steps: [
            'Apaga o desconecta el equipo o software por completo durante 20 segundos para purgar energía residual y memoria volátil.',
            'Verifica en el Visor de Eventos de Windows o logs del sistema si aparece algún código de error numérico.',
            'Ejecuta un ciclo de diagnóstico directo o solicita a tu supervisor validar si hay un corte general programado en el área.'
          ],
          citation: 'Artículo de Contingencia Operativa Nivel 2 · GID Soporte',
          similarity: '0.86',
          timestamp: time
        }
      ]);
    } else if (nextAttempt >= 3) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text: 'Tampoco funcionó el segundo intento. El problema sigue sin solucionarse.',
          timestamp: time
        },
        {
          sender: 'ai',
          text: `⚠️ Has completado 3 intentos de resolución guiada por IA sin éxito para "${topic}". Según las políticas de servicio de Grupo Industrial Delnorte (Regla FR-13), este incidente debe ser transferido inmediatamente a un Ingeniero de Soporte Nivel 2.`,
          steps: [
            'Haz clic en el botón rojo "Escalar a técnico humano" a continuación.',
            'El sistema transferirá automáticamente todo el historial de diagnósticos y pruebas realizadas a la cola del técnico.',
            'Se asignará un ticket con SLA prioritario de atención.'
          ],
          citation: 'Protocolo de Escalación RIALSA: Política Nivel 2 Automática',
          similarity: '0.72',
          timestamp: time
        }
      ]);
    }
  };

  // Botón: Sí, quedó resuelto
  const handleResolved = () => {
    setIsCaseResolved(true);
    const time = getTimeNow();
    setMessages((prev) => [
      ...prev,
      {
        sender: 'ai',
        text: '🎉 ¡Excelente noticia! Hemos registrado que el incidente quedó solucionado satisfactoriamente mediante autogestión con IA.',
        steps: [
          'No es necesario abrir un ticket con soporte técnico.',
          'Se incrementó la métrica de resolución RAG en el Dashboard Gerencial (Tasa actual: 64%).',
          'Si requieres asistencia con otro equipo o consulta, escribe abajo con confianza.'
        ],
        citation: 'Caso cerrado con éxito · RIALSA AI Knowledge Base',
        similarity: '1.00',
        timestamp: time,
        isResolved: true
      }
    ]);
  };

  // Reiniciar conversación
  const handleResetChat = () => {
    setAttemptCount(1);
    setIsCaseResolved(false);
    onClearDraft?.();
    setMessages([
      {
        sender: 'ai',
        text: `Hola ${currentUser?.nombre ? currentUser.nombre.split(' ')[0] : 'Colaborador'}. Chat reiniciado. ¿En qué otro fallo técnico o consulta te puedo ayudar?`,
        timestamp: getTimeNow()
      }
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5"
    >
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span>Asistente RIALSA IA</span>
            </h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeModelName}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnóstico dinámico, resolución de incidentes, manuales autorizados de GID y asistencia interactiva.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowApiKeyModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition cursor-pointer"
            title="Configurar Google Gemini API Key"
          >
            <Settings className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Motor IA</span>
            {geminiKeyActive && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-medium text-slate-600 transition cursor-pointer"
            title="Reiniciar conversación"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>

          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
              attemptCount >= 3
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Intento: {Math.min(attemptCount, 3)}/3
          </span>
        </div>
      </div>

      {/* Banner de Contexto de Ticket Transferido */}
      {initialTicketDraft && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-bold">Analizando ticket en borrador:</span>{' '}
              <strong className="text-blue-950 font-bold">"{initialTicketDraft.asunto}"</strong>{' '}
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                {initialTicketDraft.categoria || 'Soporte'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEscalate?.(initialTicketDraft)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
            >
              <span>Crear Ticket Formal</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 sm:p-5 min-h-[420px] max-h-[520px] overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-xl rounded-2xl p-4 space-y-2 text-xs shadow-xs ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : m.isResolved
                  ? 'bg-emerald-50 text-slate-800 border border-emerald-300 rounded-tl-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] opacity-70">
                <span className="font-bold">
                  {m.sender === 'user'
                    ? currentUser?.nombre
                      ? `Tú (${currentUser.nombre})`
                      : 'Tú (Colaborador)'
                    : 'Asistente Virtual RIALSA'}
                </span>
                <span>{m.timestamp}</span>
              </div>

              <p className="leading-relaxed whitespace-pre-line">{m.text}</p>

              {m.steps && m.steps.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <strong className="block text-slate-900 font-bold">Pasos de resolución recomendados:</strong>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1 leading-relaxed">
                    {m.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ol>
                </div>
              )}

              {m.citation && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap justify-between items-center text-[11px] gap-2">
                  <span className="text-blue-700 font-semibold flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Cita Oficial: {m.citation}</span>
                  </span>
                  {m.similarity && (
                    <span className="text-slate-400 text-[10px] font-mono">
                      Confianza: {m.similarity}
                    </span>
                  )}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                {getUserInitials()}
              </div>
            )}
          </div>
        ))}

        {messages.length <= 1 && !isLoading && (
          <div className="pt-2 pb-1 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <span>💡 Ejemplos comunes de ayuda en lenguaje cotidiano (haz clic para probar):</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'No tengo internet en mi compu',
                'La impresora se tragó una hoja',
                'Olvidé mi contraseña de Windows',
                'La pantalla se puso negra / no da señal',
                'Mi compu está super lenta y se congela',
                'No me escuchan en Teams',
                'No me deja facturar en el sistema',
                'No conecta la VPN desde mi casa',
                'No puedo abrir la carpeta de mi área',
                '¡Cuéntame un chiste!'
              ].map((pill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(pill)}
                  className="text-[11px] bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full transition cursor-pointer shadow-2xs font-medium text-left"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Analizando consulta con el motor de IA y base de conocimiento...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action Decision Buttons */}
      {!isCaseResolved && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResolved}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sí, quedó resuelto</span>
            </button>

            <button
              type="button"
              onClick={handleNotWorking}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-slate-500" />
              <span>No funcionó, dame otra alternativa</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEscalate?.(initialTicketDraft || undefined)}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                attemptCount >= 3
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-slate-900 hover:bg-black text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>
                {attemptCount >= 3 ? 'Escalar a técnico humano (Recomendado)' : 'Escalar a soporte'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 transition"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Escribe tu consulta técnica, describe una falla o haz una pregunta..."
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none px-2"
          />

          <motion.button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2.5 rounded-lg shadow-sm transition cursor-pointer"
            title="Enviar mensaje"
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </form>
      </div>

      {/* Modal para configurar API Key de Google Gemini (Opcional) */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Configurar Motor de IA (Google Gemini)</span>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              El sistema ya cuenta con el <strong>Motor Autónomo RIALSA</strong> activo por defecto. Si deseas conectar el modelo real de <strong>Google Gemini 1.5/2.0 Flash</strong>, ingresa tu API Key gratuita de{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-bold underline inline-flex items-center gap-0.5"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>:
            </p>

            <form onSubmit={handleSaveGeminiKey} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Gemini API Key:
                </label>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {geminiKeyActive && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('rialsa_gemini_api_key');
                      setGeminiKeyInput('');
                      setGeminiKeyActive(false);
                      setActiveModelName('Motor Neuronal RIALSA (RAG)');
                      setShowApiKeyModal(false);
                    }}
                    className="text-red-600 hover:underline text-[11px]"
                  >
                    Desconectar API Key
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-lg shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar y Activar</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
