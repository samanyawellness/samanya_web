import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Building2,
  ChevronDown,
  Search,
  Plus,
  UserPlus,
  HeartHandshake,
  UserCheck,
  CalendarPlus,
  Bell,
  CheckCircle2,
  Edit3,
  X,
  Users,
  ArrowRight,
  RefreshCw,
  Database,
  LogOut,
  UserCog
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR, obtenerIniciales } from '../../utils/avatarUtils';
import { ResidentAvatar } from '../common/ResidentAvatar';

export const AdminHeader: React.FC = () => {
  const {
    sedes,
    activeSedeId,
    activeSede,
    setActiveSedeId,
    searchQuery,
    setSearchQuery,
    setIsRegisterResidentOpen,
    setIsRegisterFamilyOpen,
    setIsRegisterWorkerOpen,
    setIsProgramarTurnosOpen,
    setIsEditSedeOpen,
    metrics,
    residentes,
    trabajadores,
    familiares,
    setActiveTab,
    setSelectedResidente,
    setIsResidenteDetailOpen,
    isSyncingGlobal,
    isOracleLive,
    sincronizarTodoConOracle,
    limpiarCacheYReconectarOracle,
    currentUser,
    logout,
    showConfirm,
    setIsUserProfileOpen
  } = useAdmin();

  const [isSedeDropdownOpen, setIsSedeDropdownOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.avatarUrl]);

  const query = searchQuery.trim().toLowerCase();

  const matchedResidentes = query
    ? residentes
        .filter(
          (r) =>
            r.idCentro === activeSedeId &&
            (r.nombreCompleto.toLowerCase().includes(query) ||
              r.identificacion.toLowerCase().includes(query) ||
              r.habitacion.toLowerCase().includes(query) ||
              r.codigoExpediente.toLowerCase().includes(query))
        )
        .slice(0, 4)
    : [];

  const matchedTrabajadores = query
    ? trabajadores
        .filter(
          (t) =>
            t.nombreCompleto.toLowerCase().includes(query) ||
            t.identificacion.toLowerCase().includes(query) ||
            t.cargo.toLowerCase().includes(query) ||
            t.area.toLowerCase().includes(query)
        )
        .slice(0, 3)
    : [];

  const matchedFamiliares = query
    ? familiares
        .filter(
          (f) =>
            f.nombreCompleto.toLowerCase().includes(query) ||
            f.identificacion.toLowerCase().includes(query) ||
            f.telefonoPrincipal.toLowerCase().includes(query)
        )
        .slice(0, 3)
    : [];

  const totalResultsCount =
    matchedResidentes.length + matchedTrabajadores.length + matchedFamiliares.length;

  return (
    <header className="h-16 bg-white border-b border-[#DEDBD1] px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* 1. Sede Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsSedeDropdownOpen(!isSedeDropdownOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-semibold text-sm transition-all border border-[#DEDBD1] cursor-pointer"
        >
          <Building2 className="w-4 h-4 text-[#B3803F]" />
          <span className="font-serif font-bold text-sm truncate max-w-[200px] md:max-w-xs">
            {activeSede.nombre}
          </span>
          <ChevronDown className="w-4 h-4 text-[#5C6058]" />
        </button>

        {isSedeDropdownOpen && (
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#DEDBD1] py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 text-[11px] font-mono uppercase text-[#7A745F] font-bold border-b border-[#DEDBD1]/60">
              Seleccionar Sede del Centro
            </div>
            {sedes.map((sede) => (
              <button
                key={sede.id}
                type="button"
                onClick={() => {
                  setActiveSedeId(sede.id);
                  setIsSedeDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-[#F7F6F2] transition-colors cursor-pointer ${
                  sede.id === activeSedeId ? 'bg-[#F7F6F2] font-bold text-[#182F28]' : 'text-[#4B4636]'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{sede.nombre}</div>
                  <div className="text-xs text-[#7A745F]">{sede.ciudad} • Cap: {sede.capacidadTotal}</div>
                </div>
                {sede.id === activeSedeId && (
                  <CheckCircle2 className="w-4 h-4 text-[#1E7A4C]" />
                )}
              </button>
            ))}

            <div className="p-2 border-t border-[#DEDBD1]/60 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsSedeDropdownOpen(false);
                  setIsEditSedeOpen(true);
                }}
                className="w-full px-3 py-2 text-xs font-bold text-[#9A5B12] hover:bg-[#FEF7EE] rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#DCB87F]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Sede y Capacidad de Camas</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Global Search Bar with Live Spotlight Dropdown */}
      <div className="flex-1 max-w-md mx-6 hidden md:block relative">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7A745F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o habitación..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#F7F6F2] border border-[#DEDBD1] text-sm text-[#26241F] placeholder:text-[#9A917A] focus:outline-none focus:border-[#B3803F] focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A745F] hover:text-[#182F28] p-1 rounded-full hover:bg-[#ECE7DB] transition-colors cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Dropdown */}
        {isSearchFocused && query && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsSearchFocused(false)}
            />
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#DEDBD1] py-2 z-40 max-h-[75vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#DEDBD1]/60 flex items-center justify-between text-xs text-[#7A745F]">
                <span className="font-mono font-bold uppercase">Resultados en {activeSede.nombre}</span>
                <span className="font-semibold text-[#B3803F]">{totalResultsCount} encontrados</span>
              </div>

              {totalResultsCount === 0 ? (
                <div className="p-5 text-center text-sm text-[#7A745F]">
                  <p className="font-semibold text-[#182F28]">Sin coincidencias</p>
                  <p className="text-xs mt-1 text-[#5C6058]">
                    No se encontró ningún residente, colaborador o familiar con "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#DEDBD1]/40">
                  {/* Categoría: Residentes */}
                  {matchedResidentes.length > 0 && (
                    <div className="py-1.5">
                      <div className="px-4 py-1 text-[11px] font-bold text-[#B3803F] uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        <span>Residentes ({matchedResidentes.length})</span>
                      </div>
                      {matchedResidentes.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => {
                            setSelectedResidente(res);
                            setIsResidenteDetailOpen(true);
                            setIsSearchFocused(false);
                          }}
                          className="px-4 py-2 hover:bg-[#F7F6F2] cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <ResidentAvatar
                              fotoUrl={res.fotoUrl}
                              nombres={res.nombres}
                              apellidos={res.apellidos}
                              nombreCompleto={res.nombreCompleto}
                              sizeClass="w-8 h-8"
                              roundedClass="rounded-full"
                              textClass="text-[11px]"
                            />
                            <div>
                              <div className="text-sm font-bold text-[#182F28]">{res.nombreCompleto}</div>
                              <div className="text-xs text-[#7A745F]">
                                Hab. {res.habitacion} • Cama {res.cama} • CC {res.identificacion}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#1E7A4C] bg-[#DFF3E7] px-2 py-0.5 rounded-md">
                            {res.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Categoría: Talento Humano */}
                  {matchedTrabajadores.length > 0 && (
                    <div className="py-1.5">
                      <div className="px-4 py-1 text-[11px] font-bold text-[#274A3F] uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3 h-3" />
                        <span>Talento Humano ({matchedTrabajadores.length})</span>
                      </div>
                      {matchedTrabajadores.map((worker) => (
                        <div
                          key={worker.id}
                          onClick={() => {
                            setActiveTab('trabajadores');
                            setIsSearchFocused(false);
                          }}
                          className="px-4 py-2 hover:bg-[#F7F6F2] cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={resolverAvatarUrl(worker.avatarUrl)}
                              alt={worker.nombreCompleto}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_AVATAR;
                              }}
                              className="w-8 h-8 rounded-full object-cover border border-[#DEDBD1]"
                            />
                            <div>
                              <div className="text-sm font-bold text-[#182F28]">{worker.nombreCompleto}</div>
                              <div className="text-xs text-[#7A745F]">
                                {worker.cargo} • <span className="text-[#274A3F]">{worker.area}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#075158] bg-[#D9F0F1] px-2 py-0.5 rounded-md">
                            {worker.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Categoría: Familiares */}
                  {matchedFamiliares.length > 0 && (
                    <div className="py-1.5">
                      <div className="px-4 py-1 text-[11px] font-bold text-[#7A4F9E] uppercase tracking-wider flex items-center gap-1.5">
                        <HeartHandshake className="w-3 h-3" />
                        <span>Familiares & Acudientes ({matchedFamiliares.length})</span>
                      </div>
                      {matchedFamiliares.map((fam) => (
                        <div
                          key={fam.id}
                          onClick={() => {
                            setActiveTab('familiares');
                            setIsSearchFocused(false);
                          }}
                          className="px-4 py-2 hover:bg-[#F7F6F2] cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <div className="text-sm font-bold text-[#182F28]">{fam.nombreCompleto}</div>
                            <div className="text-xs text-[#7A745F]">
                              Tel: {fam.telefonoPrincipal} • {fam.residentesAsociados?.[0]?.parentesco || 'Acudiente'}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#7A745F]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 3. Action Buttons & Admin Profile */}
      <div className="flex items-center gap-2.5">
        {/* Indicador y botón de Sincronización Oracle Cloud */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => sincronizarTodoConOracle(false)}
            disabled={isSyncingGlobal}
            title="Conectado a Oracle Autonomous DB. Clic para sincronizar en vivo."
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              isSyncingGlobal
                ? 'bg-[#FEF7EE] text-[#9A5B12] border-[#DCB87F]'
                : isOracleLive
                ? 'bg-[#DFF3E7] text-[#1E7A4C] border-[#1E7A4C]/30 hover:bg-[#cbebd6]'
                : 'bg-[#F7F6F2] text-[#4B4636] border-[#DEDBD1] hover:bg-[#ECE7DB]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGlobal ? 'animate-spin text-[#9A5B12]' : isOracleLive ? 'text-[#1E7A4C]' : 'text-[#7A745F]'}`} />
            <span className="hidden sm:inline">
              {isSyncingGlobal ? 'Sincronizando...' : isOracleLive ? 'Oracle Live' : 'Conectar Oracle'}
            </span>
          </button>

          <button
            type="button"
            onClick={limpiarCacheYReconectarOracle}
            title="Depurar caché local (localStorage) y consultar estado limpio desde Oracle"
            className="p-1.5 rounded-xl text-[#7A745F] hover:text-[#A4453A] hover:bg-[#FBE8E6] border border-transparent hover:border-[#A4453A]/30 transition-all cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Action Button Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#274A3F] hover:bg-[#182F28] text-white rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Registro</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isQuickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#DEDBD1] py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsRegisterResidentOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F7F6F2] flex items-center gap-2.5 text-[#182F28] font-medium cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#274A3F]/10 text-[#274A3F] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Registrar Residente</div>
                  <div className="text-[11px] text-[#7A745F]">Nueva admisión y ficha</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsRegisterFamilyOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F7F6F2] flex items-center gap-2.5 text-[#182F28] font-medium cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#B3803F]/10 text-[#B3803F] flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Registrar Familiar</div>
                  <div className="text-[11px] text-[#7A745F]">Contacto y acudiente</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsRegisterWorkerOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F7F6F2] flex items-center gap-2.5 text-[#182F28] font-medium cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#7A4F9E]/10 text-[#7A4F9E] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Registrar Trabajador</div>
                  <div className="text-[11px] text-[#7A745F]">Colaborador / Personal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsProgramarTurnosOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F7F6F2] flex items-center gap-2.5 text-[#182F28] font-medium cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#274A3F]/10 text-[#274A3F] flex items-center justify-center">
                  <CalendarPlus className="w-4 h-4 text-[#B3803F]" />
                </div>
                <div>
                  <div className="font-semibold">Programar Turnos</div>
                  <div className="text-[11px] text-[#7A745F]">Cuadrantes por rango de fechas</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="w-10 h-10 rounded-xl bg-[#F7F6F2] hover:bg-[#ECE7DB] border border-[#DEDBD1] flex items-center justify-center text-[#4B4636] relative transition-colors cursor-pointer"
            title="Notificaciones Operativas"
          >
            <Bell className="w-4 h-4" />
            {metrics.alertasCriticas > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#A4453A] absolute top-2 right-2 ring-2 ring-white" />
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#DEDBD1] p-3 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-mono font-bold text-[#7A745F] uppercase mb-2">
                Avisos del Centro
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-[#FEF7EE] border border-[#DCB87F] rounded-xl text-xs text-[#26241F]">
                  <div className="font-bold text-[#9A5B12]">Turno Tarde por iniciar</div>
                  <p className="mt-0.5 text-[#4B4636]">Revisar cobertura de cuidadores asignados.</p>
                </div>
                <div className="p-2.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl text-xs text-[#26241F]">
                  <div className="font-bold text-[#182F28]">2 Solicitudes de permiso</div>
                  <p className="mt-0.5 text-[#4B4636]">Pendientes de aprobación por coordinación.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#DEDBD1]">
          <button
            type="button"
            onClick={() => setIsUserProfileOpen(true)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F7F6F2] transition-colors text-left cursor-pointer group"
            title="Editar mi perfil y contraseña"
          >
            <div className="relative shrink-0">
              {currentUser?.avatarUrl && currentUser.avatarUrl.trim() !== '' && !avatarError ? (
                <img
                  src={resolverAvatarUrl(currentUser.avatarUrl)}
                  alt=""
                  onError={() => setAvatarError(true)}
                  className="w-9 h-9 rounded-full object-cover border border-[#B3803F]/40 shadow-2xs group-hover:border-[#182F28] transition-colors"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full bg-[#182F28] border border-[#DCB87F]/60 text-[#DCB87F] flex items-center justify-center font-serif font-bold text-xs shadow-2xs tracking-wider select-none"
                  title={currentUser?.nombreCompleto}
                >
                  {obtenerIniciales(undefined, undefined, currentUser?.nombreCompleto || 'Admin Principal')}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#182F28] text-white rounded-full flex items-center justify-center border border-white">
                <UserCog className="w-2 h-2 text-[#DCB87F]" />
              </div>
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-xs font-bold text-[#182F28] max-w-[150px] truncate group-hover:text-[#B3803F] transition-colors">
                {currentUser?.nombreCompleto || 'Administrador Principal'}
              </div>
              <div className="text-[11px] text-[#7A745F]">
                {currentUser?.nombreRol || 'Administrador del Centro'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsUserProfileOpen(true)}
            className="w-8 h-8 rounded-xl bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#4B4636] hover:text-[#182F28] border border-[#DEDBD1] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Editar perfil y cambiar contraseña"
          >
            <UserCog className="w-3.5 h-3.5 text-[#7A745F]" />
          </button>

          <button
            type="button"
            onClick={async () => {
              const confirmed = await showConfirm({
                title: 'Cerrar Sesión',
                message: '¿Está seguro de cerrar su sesión de administrador?',
                type: 'warning',
                confirmText: 'Sí, Salir',
                cancelText: 'Permanecer'
              });
              if (confirmed) {
                logout();
              }
            }}
            className="w-8 h-8 rounded-xl bg-[#F7F6F2] hover:bg-[#FBE8E6] text-[#7A745F] hover:text-[#A4453A] border border-[#DEDBD1] hover:border-[#E9A8A0] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
