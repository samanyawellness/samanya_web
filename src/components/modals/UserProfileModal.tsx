import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { resolverAvatarUrl, obtenerIniciales } from '../../utils/avatarUtils';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    isUserProfileOpen,
    setIsUserProfileOpen,
    updateProfile,
    changePassword,
    showToast
  } = useAdmin();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'perfil' | 'clave'>('perfil');

  // Estado del formulario de perfil
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Estado del formulario de cambio de clave
  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [claveConfirmacion, setClaveConfirmacion] = useState('');
  const [showClaveActual, setShowClaveActual] = useState(false);
  const [showClaveNueva, setShowClaveNueva] = useState(false);
  const [showClaveConfirm, setShowClaveConfirm] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Iniciales calculadas en tiempo real para cuando no hay foto
  const iniciales = obtenerIniciales(
    undefined,
    undefined,
    nombreCompleto || currentUser?.nombreCompleto || 'Admin Principal'
  );

  // Cargar datos actuales cuando se abre el modal
  useEffect(() => {
    if (currentUser && isUserProfileOpen) {
      setNombreCompleto(currentUser.nombreCompleto || '');
      setEmail(currentUser.email || '');
      setTelefono(currentUser.telefono || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setClaveActual('');
      setClaveNueva('');
      setClaveConfirmacion('');
      setPasswordError(null);
    }
  }, [currentUser, isUserProfileOpen]);

  if (!isUserProfileOpen || !currentUser) return null;

  // Manejo de carga de archivo local para la foto de perfil
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Por favor seleccione un archivo de imagen válido (JPG, PNG, WebP).', 'alert');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen seleccionada no debe superar los 5MB.', 'alert');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAvatarUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuitarFoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validaciones de contraseña
  const tieneLongitudMinima = claveNueva.length >= 6;
  const clavesCoinciden = claveNueva.length > 0 && claveNueva === claveConfirmacion;
  const puedeCambiarClave =
    claveActual.trim().length > 0 && tieneLongitudMinima && clavesCoinciden && !isSavingPassword;

  // Manejo de guardar perfil
  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCompleto.trim() || !email.trim()) return;

    setIsSavingProfile(true);
    const exito = await updateProfile({
      nombreCompleto: nombreCompleto.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(),
      avatarUrl: avatarUrl.trim()
    });
    setIsSavingProfile(false);
    if (exito) {
      setIsUserProfileOpen(false);
    }
  };

  // Manejo de cambiar contraseña
  const handleCambiarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!claveActual) {
      setPasswordError('Ingrese su contraseña actual.');
      return;
    }
    if (!tieneLongitudMinima) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!clavesCoinciden) {
      setPasswordError('La confirmación de contraseña no coincide.');
      return;
    }

    setIsSavingPassword(true);
    const exito = await changePassword({
      claveActual,
      claveNueva
    });
    setIsSavingPassword(false);

    if (exito) {
      setClaveActual('');
      setClaveNueva('');
      setClaveConfirmacion('');
      setIsUserProfileOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#DEDBD1] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header Premium Samanya */}
        <div className="px-6 py-5 bg-[#182F28] text-white flex items-center justify-between border-b border-[#DCB87F]/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-radial from-[#DCB87F]/15 via-transparent to-transparent pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-[#DCB87F]/40 flex items-center justify-center text-[#DCB87F] shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white tracking-wide flex items-center gap-2">
                Mi Perfil y Seguridad
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#DCB87F]/20 text-[#DCB87F] border border-[#DCB87F]/30">
                  {currentUser.rol}
                </span>
              </h2>
              <p className="text-xs text-white/70">
                Administración de datos personales y credenciales de acceso
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsUserProfileOpen(false)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-[#DEDBD1] bg-[#F7F6F2] px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t border-x ${
              activeTab === 'perfil'
                ? 'bg-white text-[#182F28] border-[#DEDBD1] shadow-xs -mb-[1px]'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Información del Perfil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clave')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t border-x ${
              activeTab === 'clave'
                ? 'bg-white text-[#182F28] border-[#DEDBD1] shadow-xs -mb-[1px]'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Cambiar Contraseña
          </button>
        </div>

        {/* Contenido de Pestañas */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'perfil' ? (
            <form onSubmit={handleGuardarPerfil} className="space-y-5">
              {/* Sección Avatar con iniciales o foto cargada y botón de selección de archivo */}
              <div className="p-4 rounded-xl bg-[#F7F6F2] border border-[#DEDBD1]">
                <div className="flex items-center gap-4">
                  {/* Avatar Circular o Iniciales */}
                  <div className="relative shrink-0">
                    {avatarUrl && avatarUrl.trim() !== '' ? (
                      <img
                        src={resolverAvatarUrl(avatarUrl)}
                        alt={nombreCompleto || 'Usuario'}
                        className="w-18 h-18 rounded-full object-cover border-2 border-[#DCB87F] shadow-sm bg-white"
                      />
                    ) : (
                      <div
                        className="w-18 h-18 rounded-full bg-[#182F28] border-2 border-[#DCB87F] text-[#DCB87F] flex items-center justify-center font-serif font-bold text-2xl shadow-sm tracking-wider select-none"
                        title={`Iniciales: ${iniciales}`}
                      >
                        {iniciales}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#182F28] border-2 border-white text-white flex items-center justify-center hover:bg-[#0E1F1A] hover:border-[#DCB87F] cursor-pointer shadow-sm transition-all"
                      title="Seleccionar foto de perfil desde el equipo"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#DCB87F]" />
                    </button>
                  </div>

                  {/* Datos del Usuario y Acciones de Foto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-mono font-bold text-[#7A745F] uppercase">
                          USUARIO DEL SISTEMA
                        </div>
                        <div className="text-base font-bold text-[#182F28] truncate">
                          @{currentUser.username}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#DCB87F]/20 text-[#8B642A] border border-[#DCB87F]/40 shrink-0">
                        <Sparkles className="w-3 h-3" />
                        {currentUser.nombreRol || 'Administrador del Centro'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#ECE7DB] border border-[#DEDBD1] text-[#182F28] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#B3803F]" />
                        <span>{avatarUrl ? 'Cambiar Foto' : 'Escoger Archivo'}</span>
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleQuitarFoto}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#A4453A] hover:bg-[#FBE8E6] transition-colors cursor-pointer"
                          title="Eliminar foto y usar iniciales"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Quitar Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {!avatarUrl && (
                  <p className="mt-2.5 text-[11px] text-[#7A745F] italic border-t border-[#DEDBD1]/60 pt-2">
                    💡 Sin foto cargada: se mostrarán automáticamente las iniciales <strong>({iniciales})</strong> correspondientes a su nombre y apellido.
                  </p>
                )}
              </div>

              {/* Nombre Completo */}
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1.5">
                  Nombre Completo <span className="text-[#A4453A]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A745F]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Ej. Martha Cecilia Rodríguez"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-white border border-[#DEDBD1] focus:outline-none focus:border-[#182F28] focus:ring-1 focus:ring-[#182F28] font-medium text-[#182F28]"
                  />
                </div>
              </div>

              {/* Correo Electrónico y Teléfono */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1.5">
                    Correo Electrónico <span className="text-[#A4453A]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A745F]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@samanya.com.co"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-white border border-[#DEDBD1] focus:outline-none focus:border-[#182F28] focus:ring-1 focus:ring-[#182F28] text-[#182F28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1.5">
                    Teléfono Móvil
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A745F]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+57 310 123 4567"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-white border border-[#DEDBD1] focus:outline-none focus:border-[#182F28] focus:ring-1 focus:ring-[#182F28] text-[#182F28]"
                    />
                  </div>
                </div>
              </div>

              {/* Botón Guardar Perfil */}
              <div className="pt-2 flex justify-end gap-3 border-t border-[#DEDBD1]">
                <button
                  type="button"
                  onClick={() => setIsUserProfileOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#4B4636] border border-[#DEDBD1] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#182F28] hover:bg-[#0E1F1A] text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCambiarClave} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-[#FBE8E6] border border-[#E9A8A0] rounded-xl flex items-center gap-2.5 text-xs text-[#A4453A]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Contraseña Actual */}
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1.5">
                  Contraseña Actual <span className="text-[#A4453A]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A745F]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showClaveActual ? 'text' : 'password'}
                    required
                    value={claveActual}
                    onChange={(e) => setClaveActual(e.target.value)}
                    placeholder="Ingrese su contraseña actual"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white border border-[#DEDBD1] focus:outline-none focus:border-[#182F28] focus:ring-1 focus:ring-[#182F28] text-[#182F28]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClaveActual(!showClaveActual)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7A745F] hover:text-[#182F28] cursor-pointer"
                  >
                    {showClaveActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1.5">
                  Nueva Contraseña <span className="text-[#A4453A]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A745F]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showClaveNueva ? 'text' : 'password'}
                    required
                    value={claveNueva}
                    onChange={(e) => setClaveNueva(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white border border-[#DEDBD1] focus:outline-none focus:border-[#182F28] focus:ring-1 focus:ring-[#182F28] text-[#182F28]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClaveNueva(!showClaveNueva)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7A745F] hover:text-[#182F28] cursor-pointer"
                  >
                    {showClaveNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1.5">
                  Confirmar Nueva Contraseña <span className="text-[#A4453A]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A745F]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showClaveConfirm ? 'text' : 'password'}
                    required
                    value={claveConfirmacion}
                    onChange={(e) => setClaveConfirmacion(e.target.value)}
                    placeholder="Repita la nueva contraseña"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white border border-[#DEDBD1] focus:outline-none focus:border-[#182F28] focus:ring-1 focus:ring-[#182F28] text-[#182F28]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClaveConfirm(!showClaveConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7A745F] hover:text-[#182F28] cursor-pointer"
                  >
                    {showClaveConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Requisitos y Ayuda Visual */}
              <div className="p-3.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] space-y-2">
                <div className="text-[11px] font-bold text-[#4B4636]">
                  Requisitos de Seguridad:
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      tieneLongitudMinima ? 'text-[#1E7A4C]' : 'text-[#7A745F]'
                    }`}
                  />
                  <span className={tieneLongitudMinima ? 'text-[#182F28] font-medium' : 'text-[#7A745F]'}>
                    Longitud mínima de 6 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      clavesCoinciden ? 'text-[#1E7A4C]' : 'text-[#7A745F]'
                    }`}
                  />
                  <span className={clavesCoinciden ? 'text-[#182F28] font-medium' : 'text-[#7A745F]'}>
                    Las contraseñas ingresadas coinciden exactamente
                  </span>
                </div>
              </div>

              {/* Botón Cambiar Contraseña */}
              <div className="pt-2 flex justify-end gap-3 border-t border-[#DEDBD1]">
                <button
                  type="button"
                  onClick={() => setIsUserProfileOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#4B4636] border border-[#DEDBD1] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!puedeCambiarClave}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#182F28] hover:bg-[#0E1F1A] text-white transition-all shadow-md cursor-pointer disabled:opacity-40"
                >
                  {isSavingPassword ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      Actualizar Contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
