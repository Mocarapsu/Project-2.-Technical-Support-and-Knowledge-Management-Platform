import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Loader2, ArrowRight, Lock, Mail, Eye, EyeOff, UserPlus, CheckCircle2, Database } from 'lucide-react';
import { AuthScreen, UserAccount } from '../../types/figma-tickets';
import { getStoredUsers, saveNewUser } from '../../services/db';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface Props {
  initialState?: 'default' | 'error' | 'loading';
  onLoginSuccess?: (user: UserAccount) => void;
  onForgotPassword?: () => void;
  onNavigateState?: (screen: AuthScreen) => void;
  onOpenDatabaseModal?: () => void;
}

export const LoginSplitView: React.FC<Props> = ({
  onLoginSuccess,
  onForgotPassword,
  onOpenDatabaseModal
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [usersList, setUsersList] = useState<UserAccount[]>([]);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'empleado' | 'tecnico' | 'admin'>('empleado');
  const [regDept, setRegDept] = useState('Operaciones');
  const [regPassword, setRegPassword] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    setUsersList(getStoredUsers());
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const lower = email.toLowerCase().trim();

      if (lower.includes('error')) {
        setErrorMessage('Credenciales inválidas. Revisa tu correo o contraseña.');
        return;
      }

      // 1. Buscar en la base de datos de usuarios
      const existingUsers = getStoredUsers();
      const matched = existingUsers.find((u) => u.email.toLowerCase() === lower);

      if (matched) {
        onLoginSuccess?.(matched);
        return;
      }

      // 2. Si no coincide exactamente, detectar el rol y crear la cuenta al vuelo
      let detectedRole: 'empleado' | 'tecnico' | 'admin' = 'empleado';
      let detectedName = email.split('@')[0].replace('.', ' ');
      detectedName = detectedName.charAt(0).toUpperCase() + detectedName.slice(1);

      if (lower.includes('tecnico') || lower.includes('soporte') || lower.includes('alfredo')) {
        detectedRole = 'tecnico';
      } else if (lower.includes('admin') || lower.includes('ciso') || lower.includes('bautista')) {
        detectedRole = 'admin';
        detectedName = 'Ing. José Luis Bautista';
      }

      const autoUser = saveNewUser({
        nombre: detectedName,
        email: lower,
        rol: detectedRole,
        departamento: detectedRole === 'admin' ? 'Dirección TI' : 'Operaciones'
      });

      onLoginSuccess?.(autoUser);
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const newUser = saveNewUser({
        nombre: regName.trim(),
        email: regEmail.toLowerCase().trim(),
        rol: regRole,
        departamento: regDept.trim(),
        password: regPassword || 'Password123!'
      });

      setRegisterSuccess(true);
      setTimeout(() => {
        onLoginSuccess?.(newUser);
      }, 1000);
    }, 500);
  };

  const handleQuickLogin = (targetUser: UserAccount) => {
    onLoginSuccess?.(targetUser);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0D11] text-slate-100 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-hidden font-sans select-none">

      {/* Top Header - Pure Corporate Branding */}
      <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-bold text-white text-xs tracking-wider uppercase">
            RIALSA · Grupo Industrial Delnorte
          </span>
          <span className="text-slate-500 text-xs hidden sm:inline">|</span>
          <span className="text-slate-400 text-xs hidden sm:inline">
            Plataforma Centralizada de Soporte TI
          </span>
        </div>
      </div>

      {/* Main Split Screen Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full my-auto">

        {/* LEFT COLUMN: HERO TYPOGRAPHY */}
        <div className="lg:col-span-6 space-y-8 pr-4 lg:pr-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Portal de Soporte y Conocimiento GID</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-wider mb-8">
              RIALSA
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Resolver antes.<br />
              Escalar con<br />
              contexto.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-md leading-relaxed font-normal pt-2">
              Una plataforma centralizada para mesas de ayuda, técnicos de campo y dirección con
              asistencia de IA basada únicamente en manuales autorizados.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/60 flex items-center gap-4 text-xs text-slate-500 font-mono">
            <span>Universidad Politécnica de Durango</span>
            <span>·</span>
            <span>Software Projects Management</span>
          </div>
        </div>

        {/* RIGHT COLUMN: CRISP WHITE CARD */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full max-w-md bg-white text-slate-800 rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-200"
          >
            {/* Top Bar inside card with Database status */}
            {onOpenDatabaseModal && (
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={onOpenDatabaseModal}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition flex items-center gap-1.5 cursor-pointer ${
                    isSupabaseConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                  title="Configuración de Base de Datos Cloud"
                >
                  <Database className="w-3 h-3" />
                  <span>{isSupabaseConfigured ? 'BD Cloud: Conectada' : 'Conectar BD Supabase'}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                </button>
              </div>
            )}

            {/* Tabs: Iniciar Sesión / Crear Cuenta */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 pb-3 text-xs font-bold transition border-b-2 text-center ${activeTab === 'login'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 pb-3 text-xs font-bold transition border-b-2 text-center flex items-center justify-center gap-1.5 ${activeTab === 'register'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Cuenta</span>
              </button>
            </div>

            {/* TAB A: INICIAR SESIÓN */}
            {activeTab === 'login' && (
              <>
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido de vuelta</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Accede con tu cuenta institucional o selecciona un usuario abajo.
                  </p>
                </div>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>{errorMessage}</div>
                  </motion.div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Correo institucional
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ej: tu.nombre@gid.com.mx"
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Contraseña</label>
                      <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full text-xs pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-black text-white transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span>Validando credenciales...</span>
                      </>
                    ) : (
                      <>
                        <span>Iniciar sesión</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Access Profiles from Database */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold text-center mb-1">
                    Acceso Rápido por Perfil (Base de Datos)
                  </p>
                  
                  {/* ADMIN */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wider block">
                      🛡 Dirección TI (Admin):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {usersList.filter((u) => u.rol === 'admin').map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickLogin(u)}
                          className="text-[10px] py-1 px-2.5 rounded-md font-bold transition bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200"
                          title={`${u.email} (${u.departamento})`}
                        >
                          🛡 {u.nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TÉCNICOS */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block">
                      🛠 Técnicos Resolutores (Mesa de Ayuda TI):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {usersList.filter((u) => u.rol === 'tecnico').map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickLogin(u)}
                          className="text-[10px] py-1 px-2 rounded-md font-semibold transition bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
                          title={`${u.email} (${u.departamento})`}
                        >
                          🛠 {u.nombre.split(' ')[0]} {u.nombre.split(' ')[1] || ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* EMPLEADOS */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">
                      👤 Empleados / Clientes (Solicitantes):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {usersList.filter((u) => u.rol === 'empleado').map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickLogin(u)}
                          className="text-[10px] py-1 px-2 rounded-md font-semibold transition bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                          title={`${u.email} (${u.departamento})`}
                        >
                          👤 {u.nombre.split(' ')[0]} {u.nombre.split(' ')[1] || ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB B: CREAR CUENTA NUEVA */}
            {activeTab === 'register' && (
              <>
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Crear Cuenta</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Registra tu nombre para que el sistema te reconozca en todas las pantallas.
                  </p>
                </div>

                {registerSuccess ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-5 rounded-xl text-center space-y-2"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-sm">¡Cuenta creada para {regName}!</h4>
                    <p className="text-xs">Guardada en base de datos. Iniciando sesión...</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="ej: Daniel López Morales"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Institucional</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="daniel.lopez@gid.com.mx"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Rol</label>
                        <select
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value as any)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="empleado">👤 Empleado (Levantar solicitudes)</option>
                          <option value="tecnico">🛠 Técnico TI (Resolver y atender)</option>
                          <option value="admin">🛡 Administrador TI (CISO / Dirección)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento</label>
                        <input
                          type="text"
                          value={regDept}
                          onChange={(e) => setRegDept(e.target.value)}
                          placeholder="ej: Almacén / Planta 1"
                          className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-2 shadow-sm mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Guardando en base de datos...</span>
                        </>
                      ) : (
                        <>
                          <span>Registrar y Entrar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}

            <div className="mt-5 pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Soporte de TI: <a href="mailto:soporte@gid.com.mx" className="text-blue-600 font-semibold hover:underline">soporte@gid.com.mx</a>
              </p>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Bottom Legal Footer */}
      <footer className="text-center text-[11px] text-slate-500 pt-6">
        © 2026 Grupo Industrial Delnorte S.A. de C.V. — Todos los derechos reservados.
      </footer>
    </div>
  );
};
