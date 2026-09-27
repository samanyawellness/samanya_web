import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Building2, Sparkles } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAdmin();

  const [usuario, setUsuario] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim()) {
      setErrorMessage('Por favor ingrese su usuario o correo electrónico.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await login(usuario.trim(), password);
      if (!result.success) {
        setErrorMessage(result.error || 'No se pudo iniciar sesión. Verifique sus credenciales.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servicio de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsuario(user);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#10221D] flex flex-col justify-between relative overflow-hidden text-[#ECE7DB] selection:bg-[#DCB87F] selection:text-[#182F28]">
      {/* Elementos decorativos de fondo con gradientes orgánicos */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1E3B33] opacity-40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#B3803F] opacity-20 blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#182F28] opacity-50 blur-[180px] pointer-events-none" />

      {/* Top Header institucional */}
      <header className="px-8 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1E3B33] border border-[#DCB87F]/30 flex items-center justify-center shadow-lg shadow-black/20">
            <Building2 className="w-5 h-5 text-[#DCB87F]" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-wide text-white flex items-center gap-2">
              SAMANYA <span className="text-[#DCB87F] text-xs font-sans px-2 py-0.5 rounded-full bg-[#DCB87F]/10 border border-[#DCB87F]/20">OS</span>
            </h1>
            <p className="text-[11px] text-[#A69F8E] tracking-wider uppercase">
              Plataforma de Gestión Asistencial Geriátrica
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#C5BFA9]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Oracle Autonomous Cloud • Online</span>
        </div>
      </header>

      {/* Contenedor central del Formulario */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 relative">
        <div className="w-full max-w-md">
          {/* Tarjeta de Login Glassmorphic */}
          <div className="bg-[#182F28]/85 backdrop-blur-xl border border-[#DCB87F]/25 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/50 relative overflow-hidden">
            {/* Acento dorado superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#DCB87F] to-transparent opacity-80" />

            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCB87F]/10 border border-[#DCB87F]/20 text-[#DCB87F] text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Control de Acceso Seguro</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Portal de Administración
              </h2>
              <p className="text-xs text-[#B5AF9D] mt-2 leading-relaxed">
                Ingrese sus credenciales de administrador para gestionar las sedes, residentes y novedades.
              </p>
            </div>

            {/* Mensaje de Error / Alerta */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-[#3B1E1E]/90 border border-[#E9A8A0]/40 text-[#FBE8E6] text-xs flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="w-5 h-5 text-[#E9A8A0] shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold block mb-0.5">Acceso no autorizado</span>
                  {errorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Usuario */}
              <div>
                <label className="block text-xs font-semibold text-[#DCB87F] mb-2 uppercase tracking-wider">
                  Usuario o Correo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8472]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="ej. admin o admin@samanya.com.co"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0E1F1A]/80 border border-white/10 text-sm text-white placeholder-[#6B6554] focus:outline-none focus:border-[#DCB87F] focus:ring-1 focus:ring-[#DCB87F] transition-all"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[#DCB87F] uppercase tracking-wider">
                    Contraseña
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8472]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#0E1F1A]/80 border border-white/10 text-sm text-white placeholder-[#6B6554] focus:outline-none focus:border-[#DCB87F] focus:ring-1 focus:ring-[#DCB87F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C8472] hover:text-[#DCB87F] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#DCB87F] via-[#E2C391] to-[#C9A265] hover:brightness-105 active:scale-[0.99] text-[#182F28] font-bold text-sm tracking-wide shadow-lg shadow-[#DCB87F]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#182F28] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Ingresar al Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Selector rápido para pruebas de roles */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#A69F8E] uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#DCB87F]" />
                <span>Acceso de Prueba</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'admin123')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-[#DCB87F] flex items-center justify-between">
                    <span>Admin</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Permitido</span>
                  </div>
                  <div className="text-[10px] text-[#8C8472] truncate">admin / admin123</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('mrodriguez', 'admin123')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-[#E9A8A0] flex items-center justify-between">
                    <span>Cuidador</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">Bloqueado</span>
                  </div>
                  <div className="text-[10px] text-[#8C8472] truncate">mrodriguez / admin123</div>
                </button>
              </div>
              <p className="text-[10px] text-[#7A745F] mt-2.5 text-center">
                * El acceso está estrictamente restringido al rol <strong className="text-[#DCB87F]">ADMIN</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-5 text-center text-xs text-[#7A745F] border-t border-white/5 z-10 relative">
        <p>© 2026 Samanya OS • Sistema de Gestión Clínica y Asistencial Especializada</p>
      </footer>
    </div>
  );
};
