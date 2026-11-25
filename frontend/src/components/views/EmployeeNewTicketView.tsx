import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { UploadCloud, Sparkles, CheckCircle2, ArrowRight, AlertCircle, Shield, X } from 'lucide-react';
import { determineAutomaticPriority } from '../../services/ticketDomain';

interface Props {
  busy?: boolean;
  internal?: boolean;
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
  onSubmitTicket?: (ticket: { asunto: string; descripcion: string; categoria: string; prioridad: string; contextoIa?: string; adjuntos?: string[] }) => void | Promise<boolean>; 
  onTryAiFirst?: (draft?: { asunto: string; descripcion: string; categoria: string; prioridad: string; adjuntos?: string[] }) => void;
  initialDraft?: { asunto: string; descripcion: string; categoria: string; prioridad?: string; contextoIa?: string; adjuntos?: string[] } | null;
}

export const EmployeeNewTicketView: React.FC<Props> = ({
  onCancel,
  onSubmitSuccess,
  onSubmitTicket,
  onTryAiFirst,
  initialDraft, busy = false, internal = false
}) => {
  const shouldReduceMotion = useReducedMotion();
  const formRef = useRef<HTMLDivElement>(null);
  const [asunto, setAsunto] = useState(initialDraft?.asunto || '');
  const [descripcion, setDescripcion] = useState(initialDraft?.descripcion || '');
  const [categoria, setCategoria] = useState(initialDraft?.categoria || '');
  const [prioridad, setPrioridad] = useState(initialDraft?.prioridad || '');
  const [adjuntos, setAdjuntos] = useState<string[]>(initialDraft?.adjuntos || []);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ asunto?: string; descripcion?: string; categoria?: string; prioridad?: string }>({});

  const handleFiles = (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setAdjuntos((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdjunto = (index: number) => {
    setAdjuntos((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) handleFiles([file]);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: { asunto?: string; descripcion?: string; categoria?: string; prioridad?: string } = {};

    if (!asunto.trim()) {
      newErrors.asunto = 'El asunto del ticket es obligatorio.';
    } else if (asunto.trim().length < 5) {
      newErrors.asunto = 'El asunto debe tener al menos 5 caracteres explicativos.';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción del incidente es obligatoria.';
    } else if (descripcion.trim().length < 10) {
      newErrors.descripcion = 'Por favor describe qué sucedió (mínimo 10 caracteres).';
    }

    if (!categoria) {
      newErrors.categoria = 'Debes seleccionar una categoría técnica.';
    }

    if (internal && !prioridad) {
      newErrors.prioridad = 'Debes seleccionar la prioridad estimada.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length) requestAnimationFrame(() => document.getElementById(`ticket-${Object.keys(newErrors)[0]}`)?.focus());
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (busy || !validate()) return;

    const finalPrioridad = (internal && prioridad)
      ? prioridad
      : determineAutomaticPriority(categoria, asunto, descripcion);

    if (onSubmitTicket) {
      onSubmitTicket({
        asunto: asunto.trim(),
        descripcion: descripcion.trim(),
        categoria,
        prioridad: finalPrioridad,
        contextoIa: initialDraft?.contextoIa,
        adjuntos
      });
    } else {
      onSubmitSuccess?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg p-8 border border-slate-200 "
    >
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{internal ? "Crear ticket interno" : "Crear ticket"}</h1>
        <p className="text-xs text-slate-500 mt-1">
          Completa los datos de la incidencia para que soporte pueda atenderla.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div ref={formRef} onPaste={handlePaste} className="lg:col-span-8 space-y-5">
          {initialDraft?.contextoIa && <details className="rounded-lg border border-slate-200 p-3 text-sm"><summary className="cursor-pointer font-medium">Contexto de IA que se adjuntará al ticket</summary><pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-600 font-sans">{initialDraft.contextoIa}</pre></details>}
          {/* Asunto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Asunto <span className="text-red-500">*</span></span>
              {errors.asunto && <span id="ticket-asunto-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.asunto}</span>}
            </label>
            <input
              type="text"
              id="ticket-asunto" aria-label="Asunto" aria-invalid={Boolean(errors.asunto)} aria-describedby={errors.asunto ? "ticket-asunto-error" : undefined} value={asunto}
              onChange={(e) => {
                setAsunto(e.target.value);
                if (errors.asunto) setErrors((prev) => ({ ...prev, asunto: undefined }));
              }}
              placeholder="Describe brevemente el problema (ej: Fallo en impresora térmica de almacén)"
              className={`w-full text-xs border rounded-lg px-3.5 py-2.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none transition ${
                errors.asunto ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
              }`}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Descripción detallada <span className="text-red-500">*</span></span>
              {errors.descripcion && <span id="ticket-descripcion-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.descripcion}</span>}
            </label>
            <textarea
              rows={4}
              id="ticket-descripcion" aria-label="Descripcion" aria-invalid={Boolean(errors.descripcion)} aria-describedby={errors.descripcion ? "ticket-descripcion-error" : undefined} value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                if (errors.descripcion) setErrors((prev) => ({ ...prev, descripcion: undefined }));
              }}
              placeholder="Indica qué estabas haciendo, el mensaje de error exacto y cuándo comenzó el problema..."
              className={`w-full text-xs border rounded-lg p-3.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none transition ${
                errors.descripcion ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
              }`}
            />
          </div>

          {/* Categoría y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Categoría <span className="text-red-500">*</span></span>
                {errors.categoria && <span id="ticket-categoria-error" role="alert" className="text-xs text-red-600 font-medium">{errors.categoria}</span>}
              </label>
              <select
                id="ticket-categoria" aria-label="Categoria" aria-invalid={Boolean(errors.categoria)} aria-describedby={errors.categoria ? "ticket-categoria-error" : undefined} value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value);
                  if (errors.categoria) setErrors((prev) => ({ ...prev, categoria: undefined }));
                }}
                className={`w-full text-xs border rounded-lg px-3.5 py-2.5 bg-white focus:outline-none transition text-slate-700 ${
                  errors.categoria ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              >
                <option value="">Selecciona una categoría</option>
                <option value="Acceso">Acceso</option>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Redes">Redes</option>
              </select>
            </div>
            <div>
              {internal ? (
                <>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Prioridad técnica <span className="text-red-500">*</span></span>
                    {errors.prioridad && <span id="ticket-prioridad-error" role="alert" className="text-xs text-red-600 font-medium">{errors.prioridad}</span>}
                  </label>
                  <select
                    id="ticket-prioridad" aria-label="Prioridad" aria-invalid={Boolean(errors.prioridad)} aria-describedby={errors.prioridad ? "ticket-prioridad-error" : undefined} value={prioridad}
                    onChange={(e) => {
                      setPrioridad(e.target.value);
                      if (errors.prioridad) setErrors((prev) => ({ ...prev, prioridad: undefined }));
                    }}
                    className={`w-full text-xs border rounded-lg px-3.5 py-2.5 bg-white focus:outline-none transition text-slate-700 ${
                      errors.prioridad ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                    }`}
                  >
                    <option value="">Selecciona la prioridad</option>
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </>
              ) : (
                <>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Prioridad del ticket</span>
                  </label>
                  <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-2.5 text-xs text-blue-900 space-y-0.5">
                    <div className="font-semibold flex items-center gap-1.5 text-blue-950">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>Asignación automática por impacto</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-tight">
                      El triaje de TI evaluará y determinará la prioridad técnica según el servicio y criticidad del incidente.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Adjuntos Dropzone Real */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Evidencias y capturas de pantalla ({adjuntos.length})
              </label>
              <span className="text-[11px] text-slate-400">PNG, JPG o Ctrl+V</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-200'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="w-7 h-7 text-blue-600 mb-1.5" />
              <p className="text-xs font-semibold text-slate-800">
                Arrastra aquí tus capturas de error o haz clic para examinar
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                También puedes pegar directamente con <kbd className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono">Ctrl+V</kbd>
              </p>
            </div>

            {adjuntos.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {adjuntos.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-white shadow-xs">
                    <img src={img} alt={`Evidencia ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeAdjunto(idx); }}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-90 hover:opacity-100 shadow transition cursor-pointer"
                      title="Eliminar evidencia"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-mono px-1 py-0.5 rounded">
                      Evidencia #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
              disabled={busy}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              className="text-xs font-semibold bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-lg  transition"
            >
              {busy ? "Creando…" : "Crear ticket"}
            </motion.button>
          </div>
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-4">
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Antes de enviar</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
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

            {onTryAiFirst && <div className="pt-3 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() =>
                  onTryAiFirst?.({
                    asunto: asunto.trim(),
                    descripcion: descripcion.trim(),
                    categoria: categoria || 'General',
                    prioridad: prioridad || 'Media'
                  })
                }
                className="w-full text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between group p-1 cursor-pointer"
                title="Analiza el problema con el Asistente IA antes de abrir el ticket"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span>Probar con IA primero</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
