import React, { useRef, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Printer, Download, X, FileCheck } from 'lucide-react';
import { TicketItem, TechnicianProfile } from '../types/figma-tickets';
import { generateReportHTML, printExecutiveReport, downloadReportHTML } from '../services/reportGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tickets: TicketItem[];
  technicians: TechnicianProfile[];
}

export const ExecutiveReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tickets,
  technicians
}) => {
  const shouldReduceMotion = useReducedMotion();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reportHTML = useMemo(() => {
    return generateReportHTML(tickets, technicians);
  }, [tickets, technicians]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } else {
      printExecutiveReport(tickets, technicians);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
        className="bg-[#0B0D11] border border-slate-700 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Top Control Bar (Dark SaaS Frame) */}
        <div className="px-5 py-3.5 bg-[#0e1117] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Informe Ejecutivo Oficial de Operaciones TI</span>
                <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                  Formato Carta / A4 Oficial
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Dictamen corporativo auditado. Cero capturas de pantalla de la interfaz web.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Guardar como PDF / Imprimir</span>
            </button>

            <button
              type="button"
              onClick={() => downloadReportHTML(tickets, technicians)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar HTML</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Area - 100% Isolated inside IFrame with pure white background */}
        <div className="flex-1 p-3 sm:p-5 bg-slate-950/90 overflow-hidden flex justify-center">
          <iframe
            ref={iframeRef}
            srcDoc={reportHTML}
            className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-300"
            title="Vista Previa Informe Ejecutivo"
          />
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2 bg-[#0e1117] border-t border-slate-800 text-center text-[11px] text-slate-400">
          Tip: Haz clic en <strong>Guardar como PDF / Imprimir</strong> para guardar el archivo PDF oficial con hoja membretada, firmas y sello SHA-256.
        </div>
      </motion.div>
    </div>
  );
};
