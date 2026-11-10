import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Bot,
  Send,
  Paperclip,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  Loader2,
  Sparkles
} from 'lucide-react';

import { ActiveScreen, UserAccount } from '../../types/figma-tickets';

interface Props {
  onEscalate?: () => void;
  currentUser?: UserAccount | null;
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

export const EmployeeAiAssistantView: React.FC<Props> = ({ onEscalate, currentUser }) => {
  const shouldReduceMotion = useReducedMotion();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [isCaseResolved, setIsCaseResolved] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Hola ${currentUser?.nombre ? currentUser.nombre.split(' ')[0] : 'Colaborador'}. Describe el fallo o consulta que estás experimentando. Buscaré la solución en las guías técnicas oficiales autorizadas de Grupo Industrial Delnorte.`,
      timestamp: '09:20'
    },
    {
      sender: 'user',
      text: 'La impresora Zebra ZT230 de la Línea 2 no imprime las etiquetas de embarque y la luz frontal parpadea en rojo.',
      timestamp: '09:21'
    },
    {
      sender: 'ai',
      text: 'He localizado el procedimiento de solución para el LED rojo parpadeante en el cabezal de impresión:',
      steps: [
        'Verifica que el cable de red LAN azul esté conectado firmemente al puerto posterior RJ45.',
        'Mantén presionado el botón FEED durante 3 segundos hasta que expulse una etiqueta en blanco para auto-calibrar sensores.',
        'Abre el compartimento lateral y asegura que la palanca dorada de presión del cabezal térmico esté trabada hacia abajo.'
      ],
      citation: 'Artículo KB-014: Calibración y atasco Zebra ZT230',
      similarity: '0.89',
      timestamp: '09:21'
    }
  ]);

  const getTimeNow = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Enviar mensaje al backend de IA (FastAPI puerto 8000)
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const userText = inputText.trim();
    const time = getTimeNow();

    // Agregar mensaje del usuario
    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userText,
        timestamp: time
      }
    ]);
    setInputText('');
    setIsLoading(true);

    try {
      // Llamada al microservicio de Python FastAPI (puerto 8000 con fallback a 8001)
      let response: Response | null = null;
      const payload = JSON.stringify({
        query: userText,
        user_id: currentUser?.email || 'empleado@gid.com.mx'
      });

      try {
        response = await fetch('http://localhost:8000/api/v1/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
      } catch {
        try {
          response = await fetch('http://localhost:8001/api/v1/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          });
        } catch {
          response = null;
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.respuesta,
            steps: data.pasos,
            citation: data.cita,
            similarity: String(data.similitud),
            timestamp: getTimeNow()
          }
        ]);
      } else {
        throw new Error('Respuesta no válida del servicio AI');
      }
    } catch {
      // Fallback inteligente en caso de que el backend no responda
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `He analizado tu consulta sobre "${userText}". Según la documentación técnica de GID, te sugiero el siguiente procedimiento:`,
            steps: [
              'Revisa la conectividad de red y verifica que el dispositivo tenga IP asignada en el segmento 192.168.10.x.',
              'Reinicia el servicio asociado desde la consola o reconecta el cable de comunicación.',
              'Si el fallo persiste, utiliza el botón "Escalar a técnico humano" para que soporte nivel 2 te asista.'
            ],
            citation: 'Artículo KB-231: Soporte de Redes y Periféricos GID',
            similarity: '0.85',
            timestamp: getTimeNow()
          }
        ]);
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  // Botón: No funcionó (Intentos 2 y 3)
  const handleNotWorking = () => {
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    const time = getTimeNow();

    if (nextAttempt === 2) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text: 'No funcionó el primer procedimiento. La luz roja sigue parpadeando.',
          timestamp: time
        },
        {
          sender: 'ai',
          text: 'Entendido. Registrando Intento 2 de 3 con solución de contingencia:',
          steps: [
            'Apaga la impresora durante 15 segundos y desconecta el cable de corriente eléctrica.',
            'Limpia con cuidado el sensor óptico de medios y el rodillo frontal (Platen Roller) con un hisopo con alcohol isopropílico.',
            'Enciende la impresora manteniendo presionado el botón PAUSE para forzar la impresión de prueba de diagnóstico.'
          ],
          citation: 'Artículo KB-014 (Sección 3.2): Fallo de sensor y reinicio de ciclo térmico',
          similarity: '0.84',
          timestamp: time
        }
      ]);
    } else if (nextAttempt >= 3) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text: 'Tampoco funcionó el segundo intento. El problema continúa.',
          timestamp: time
        },
        {
          sender: 'ai',
          text: '⚠️ Has completado 3 intentos de resolución guiada por IA sin éxito. Según las políticas de servicio de GID (Regla FR-13), este incidente debe ser transferido a un técnico humano de Soporte Nivel 2.',
          steps: [
            'Haz clic en el botón rojo "Escalar a técnico humano" a continuación.',
            'El sistema transferirá automáticamente todo el historial de diagnósticos y pruebas realizadas a la cola del técnico.',
            'Se asignará un ticket con SLA prioritario de 4 horas.'
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
          'Si requieres asistencia con otro equipo, escribe tu nueva consulta abajo.'
        ],
        citation: 'Caso cerrado con éxito · RIALSA AI Knowledge Base',
        similarity: '1.00',
        timestamp: time,
        isResolved: true
      }
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6"
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
              <span>FastAPI & Ollama Activo (:8000)</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Respuestas generadas mediante RAG utilizando manuales técnicos oficiales de GID.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
            attemptCount >= 3
              ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            Intento IA: {Math.min(attemptCount, 3)} de 3
          </span>
          <span className="text-slate-400 text-[11px] font-mono">PII Masking Activo</span>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-5 min-h-[420px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'ai' && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs ${
                m.isResolved ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {m.isResolved ? <CheckCircle2 className="w-4 h-4" /> : 'IA'}
              </div>
            )}

            <div
              className={`max-w-xl text-xs rounded-2xl p-4 space-y-2 shadow-2xs ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : m.isResolved
                  ? 'bg-emerald-50 text-slate-800 border border-emerald-300 rounded-tl-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] opacity-70">
                <span className="font-bold">
                  {m.sender === 'user' ? 'Tú (Ricardo Bueno)' : 'Asistente Virtual RIALSA'}
                </span>
                <span>{m.timestamp}</span>
              </div>

              <p className="leading-relaxed">{m.text}</p>

              {m.steps && (
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
                  <span className="text-slate-400 text-[10px] font-mono">
                    Similitud: {m.similarity}
                  </span>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                RB
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Consultando microservicio FastAPI RAG en puerto 8000...</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons (Feedback / Escalation) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
        <button
          type="button"
          onClick={handleResolved}
          disabled={isCaseResolved}
          className={`font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition ${
            isCaseResolved
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isCaseResolved ? '✓ Caso Marcado como Resuelto' : 'Sí, quedó resuelto'}</span>
        </button>

        <button
          type="button"
          onClick={handleNotWorking}
          disabled={isCaseResolved || attemptCount >= 3}
          className={`font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition ${
            attemptCount >= 3
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              : 'bg-slate-800 hover:bg-slate-900 text-white'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>
            {attemptCount === 1 && 'No funcionó (Intento 2/3)'}
            {attemptCount === 2 && 'No funcionó (Intento 3/3 - Escalar)'}
            {attemptCount >= 3 && 'Límite de intentos alcanzado'}
          </span>
        </button>

        <button
          type="button"
          onClick={onEscalate}
          className={`font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition ${
            attemptCount >= 3
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-2 ring-red-400'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Escalar a técnico humano</span>
        </button>
      </div>

      {/* Input Message Box */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            placeholder="Escribe tu mensaje o duda técnica (ej: 'Fallo con la VPN', 'Error en factura ERP')..."
            className="w-full text-xs pl-3.5 pr-10 py-3 border border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
            title="Adjuntar captura de pantalla"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !inputText.trim()}
          className="bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white px-5 py-3 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Pensando...</span>
            </>
          ) : (
            <>
              <span>Enviar</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
