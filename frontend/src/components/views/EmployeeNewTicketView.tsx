import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { UploadCloud, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
  onSubmitTicket?: (ticket: { asunto: string; descripcion: string; categoria: string; prioridad: string }) => void;
  onTryAiFirst?: () => void;
}

export const EmployeeNewTicketView: React.FC<Props> = ({
  onCancel,
  onSubmitSuccess,
  onSubmitTicket,
  onTryAiFirst
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(1);
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridad, setPrioridad] = useState('');

  const handleCreate = () => {
    if (onSubmitTicket) {
      onSubmitTicket({
        asunto: asunto.trim() || 'Sin asunto especificado',
        descripcion: descripcion.trim() || 'Sin descripción adicional.',
        categoria: categoria || 'Acceso',
        prioridad: prioridad || 'Media'
      });
    } else {
      onSubmitSuccess?.();
    }
  };

  const steps = [
    { num: '01', label: 'Contacto' },
    { num: '02', label: 'Detalle' },
    { num: '03', label: 'Adjuntos' },
    { num: '04', label: 'Envío' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
    >
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crear ticket</h1>
        <p className="text-xs text-slate-500 mt-1">
          Registra tu incidente o con el asistente interactivo para que soporte pueda actuar con rapidez.
        </p>
      </div>

      {/* Step Pills */}
      <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-5">
        {steps.map((s, idx) => {
          const isActive = currentStep === idx + 1;
          return (
            <button
              key={s.num}
              onClick={() => setCurrentStep(idx + 1)}
              className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-colors ${isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              {s.num}. {s.label}
            </button>
          );
        })}
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Asunto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Asunto</label>
            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Describe brevemente el problema"
              className="w-full text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Descripción</label>
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Indica qué estabas haciendo, el mensaje de error y cuándo comenzó el problema..."
              className="w-full text-xs border border-slate-300 rounded-lg p-3.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Categoría y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-slate-700"
              >
                <option value="">Selecciona una categoría</option>
                <option value="Acceso">Acceso y Credenciales</option>
                <option value="Software">Software y Aplicaciones</option>
                <option value="Hardware">Hardware y Equipos</option>
                <option value="Red">Red y Conectividad</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prioridad</label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-slate-700"
              >
                <option value="">Selecciona la prioridad</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>
          </div>

          {/* Adjuntos Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adjuntos</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center">
              <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-xs text-slate-600 font-medium">
                Arrastra archivos o <span className="text-blue-600 underline">selecciona desde tu equipo</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, PDF hasta 10MB</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <motion.button
              type="button"
              onClick={handleCreate}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              className="text-xs font-semibold bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-lg shadow-sm transition"
            >
              Crear ticket
            </motion.button>
          </div>
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-4">
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Antes de enviar</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Un buen ticket evita preguntas adicionales y acelera la solución con soporte.
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Mensaje de error exacto</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Equipo o sistema afectado</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Momento en que comenzó</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Captura de pantalla si aplica</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60">
              <button
                type="button"
                onClick={onTryAiFirst}
                className="w-full text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between group p-1"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Probar con IA primero</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
