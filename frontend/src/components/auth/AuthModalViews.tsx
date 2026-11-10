import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Mail,
  CheckCircle2,
  Lock,
  Clock,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { AuthScreen } from '../../types/figma-tickets';

interface Props {
  currentScreen: AuthScreen;
  onNavigate?: (screen: AuthScreen) => void;
  onBackToLogin?: () => void;
}

export const AuthModalViews: React.FC<Props> = ({
  currentScreen,
  onNavigate = () => {},
  onBackToLogin = () => {}
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState('carlos.mendez@gid.com.mx');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const modalVariants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-[850px] w-full bg-[#0B0D11] text-slate-100 flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden font-sans select-none">
      
      {/* Top Header */}
      <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="font-mono text-slate-400 text-[11px] font-semibold tracking-wider">
            AUTH / MODAL FLOW
          </span>
        </div>

        {/* Quick Modal Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#14171f] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onNavigate('auth_recuperar')}
            className={`px-2 py-0.5 rounded text-[11px] transition ${
              currentScreen === 'auth_recuperar' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Recuperar contraseña
          </button>
          <button
            onClick={() => onNavigate('auth_recuperacion_enviada')}
            className={`px-2 py-0.5 rounded text-[11px] transition ${
              currentScreen === 'auth_recuperacion_enviada' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Correo enviado
          </button>
          <button
            onClick={() => onNavigate('auth_nueva_password')}
            className={`px-2 py-0.5 rounded text-[11px] transition ${
              currentScreen === 'auth_nueva_password' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Nueva contraseña
          </button>
          <button
            onClick={() => onNavigate('auth_password_actualizada')}
            className={`px-2 py-0.5 rounded text-[11px] transition ${
              currentScreen === 'auth_password_actualizada' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Contraseña OK
          </button>
          <button
            onClick={() => onNavigate('auth_sesion_expirada')}
            className={`px-2 py-0.5 rounded text-[11px] transition ${
              currentScreen === 'auth_sesion_expirada' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sesión expirada
          </button>
          <button
            onClick={() => onNavigate('auth_acceso_denegado')}
            className={`px-2 py-0.5 rounded text-[11px] transition ${
              currentScreen === 'auth_acceso_denegado' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Acceso denegado
          </button>
        </div>
      </div>

      {/* Main Centered Content */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto">
        
        {/* RIALSA Centered Logo */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-white tracking-widest">RIALSA</h1>
          <p className="text-[11px] text-slate-500">Gestión de Acceso y Credenciales</p>
        </div>

        {/* ========================================================= */}
        {/* 1. RECUPERAR CONTRASEÑA                                   */}
        {/* ========================================================= */}
        {currentScreen === 'auth_recuperar' && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md bg-white text-slate-800 rounded-2xl p-8 sm:p-9 shadow-2xl border border-slate-200"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Recupera tu acceso
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ingresa tu correo institucional y te enviaremos un enlace de recuperación seguro.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onNavigate('auth_recuperacion_enviada');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@delnorte.com.mx"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Enviar enlace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="w-full text-slate-600 hover:text-slate-900 text-xs font-medium py-2 flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al inicio de sesión</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 2. RECUPERACIÓN ENVIADA                                   */}
        {/* ========================================================= */}
        {currentScreen === 'auth_recuperacion_enviada' && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md bg-white text-slate-800 rounded-2xl p-8 sm:p-9 shadow-2xl border border-slate-200 text-center"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-50/50">
              <Mail className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Revisa tu correo
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
              <strong className="text-slate-900">{email}</strong>.
            </p>

            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <button
                type="button"
                onClick={() => onNavigate('auth_nueva_password')}
                className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition"
              >
                Abrir enlace recibido (Simular clic)
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full text-slate-600 hover:text-slate-900 text-xs font-medium py-2 flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al inicio de sesión</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 3. ESTABLECE UNA NUEVA CONTRASEÑA                         */}
        {/* ========================================================= */}
        {currentScreen === 'auth_nueva_password' && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md bg-white text-slate-800 rounded-2xl p-8 sm:p-9 shadow-2xl border border-slate-200"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Establece una nueva contraseña
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Debe contener al menos 8 caracteres, números y un símbolo especial.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onNavigate('auth_password_actualizada');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Guardar contraseña</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 4. CONTRASEÑA ACTUALIZADA                                 */}
        {/* ========================================================= */}
        {currentScreen === 'auth_password_actualizada' && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md bg-white text-slate-800 rounded-2xl p-8 sm:p-9 shadow-2xl border border-slate-200 text-center"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Contraseña actualizada
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
            </p>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition"
              >
                Iniciar sesión ahora
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 5. SESIÓN EXPIRADA                                        */}
        {/* ========================================================= */}
        {currentScreen === 'auth_sesion_expirada' && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md bg-white text-slate-800 rounded-2xl p-8 sm:p-9 shadow-2xl border border-slate-200 text-center"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50/50">
              <Clock className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Tu sesión expiró
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Por motivos de seguridad y cumplimiento de la política de TI, tu sesión ha finalizado tras un período de inactividad.
            </p>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Volver a iniciar sesión</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 6. ACCESO DENEGADO                                        */}
        {/* ========================================================= */}
        {currentScreen === 'auth_acceso_denegado' && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md bg-white text-slate-800 rounded-2xl p-8 sm:p-9 shadow-2xl border border-slate-200 text-center"
          >
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-red-50/50">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              No tienes acceso a esta sección
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Tu rol institucional actual no cuenta con los permisos requeridos para consultar este panel.
              Contacta a tu jefe de área o a la Mesa de Ayuda TI si necesitas habilitar este módulo.
            </p>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition"
              >
                Volver al portal principal
              </button>
            </div>
          </motion.div>
        )}

      </div>

      <footer className="text-center text-[11px] text-slate-500 pt-6">
        © 2026 Grupo Industrial Delnorte S.A. de C.V. — Todos los derechos reservados.
      </footer>
    </div>
  );
};

