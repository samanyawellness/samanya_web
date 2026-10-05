import React, { useState, useEffect } from 'react';
import { useAdmin, AdminTab } from '../../context/AdminContext';
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  UserCheck,
  CalendarDays,
  FileCheck2,
  Stethoscope,
  Building2,
  ShieldCheck,
  LogOut,
  UserCog,
  Boxes,
  BookOpen,
  UtensilsCrossed
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR, obtenerIniciales } from '../../utils/avatarUtils';

export const AdminSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    residentes,
    familiares,
    trabajadores,
    permisos,
    activeSede,
    currentUser,
    inventarioStock,
    logout,
    showConfirm,
    setIsUserProfileOpen
  } = useAdmin();

  const [avatarError, setAvatarError] = useState(false);
  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.avatarUrl]);

  // Si la sede actual tiene deshabilitado el inventario y se encuentra en esa pestaña, redirigir al resumen general
  useEffect(() => {
    if (activeTab === 'inventario' && activeSede && activeSede.manejaInventario === false) {
      setActiveTab('dashboard');
    }
  }, [activeTab, activeSede, setActiveTab]);

  // Si la sede actual tiene deshabilitada la alimentación y se encuentra en esa pestaña, redirigir al resumen general
  useEffect(() => {
    if (activeTab === 'alimentacion' && activeSede && activeSede.manejaAlimentacion === false) {
      setActiveTab('dashboard');
    }
  }, [activeTab, activeSede, setActiveTab]);

  const sedeResidentesCount = residentes.filter(r => r.idCentro === activeSede.id).length;
  const permisosPendientesCount = permisos.filter(p => p.estado === 'Pendiente').length;
  const stockBajoCount = inventarioStock.filter(s => s.idCentro === activeSede.id && s.estadoSuministro === 'BAJO').length;

  const navItems: Array<{
    tab: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      tab: 'dashboard',
      label: 'Resumen General',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      tab: 'residentes',
      label: 'Residentes & Fichas',
      icon: <Users className="w-5 h-5" />,
      badge: sedeResidentesCount
    },
    {
      tab: 'familiares',
      label: 'Familiares & Acudientes',
      icon: <HeartHandshake className="w-5 h-5" />,
      badge: familiares.length
    },
    {
      tab: 'trabajadores',
      label: 'Talento Humano',
      icon: <UserCheck className="w-5 h-5" />,
      badge: trabajadores.length
    },
    {
      tab: 'turnos',
      label: 'Turnos & Cuadrantes',
      icon: <CalendarDays className="w-5 h-5" />
    },
    {
      tab: 'permisos',
      label: 'Permisos & Bajas',
      icon: <FileCheck2 className="w-5 h-5" />,
      badge: permisosPendientesCount > 0 ? permisosPendientesCount : undefined,
      badgeColor: 'bg-[#A4453A] text-white'
    },
    {
      tab: 'clinico',
      label: 'Bitácora',
      icon: <BookOpen className="w-5 h-5" />
    },
    // Módulo condicional por Sede: Solo visible si la sede no tiene deshabilitado manejaInventario = false
    ...(activeSede && activeSede.manejaInventario !== false ? [{
      tab: 'inventario' as AdminTab,
      label: 'Inventario & Almacén',
      icon: <Boxes className="w-5 h-5" />,
      badge: stockBajoCount > 0 ? stockBajoCount : undefined,
      badgeColor: 'bg-amber-600 text-white'
    }] : []),
    // Módulo condicional por Sede: Solo visible si la sede no tiene deshabilitado manejaAlimentacion = false
    ...(activeSede && activeSede.manejaAlimentacion !== false ? [{
      tab: 'alimentacion' as AdminTab,
      label: 'Alimentación & Dietas',
      icon: <UtensilsCrossed className="w-5 h-5" />
    }] : [])
  ];

  return (
    <aside className="w-64 bg-[#182F28] text-[#ECE7DB] flex flex-col shrink-0 h-screen sticky top-0 border-r border-[#0E1F1A] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#274A3F] flex items-center justify-center text-[#DCB87F] shadow-sm border border-[#DCB87F]/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="font-serif text-lg font-bold text-white tracking-wide leading-tight">
              Samanya Care
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#DCB87F] font-mono font-semibold">
              Portal Médico Admin
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mt-4 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#7A4F9E]/25 border border-[#7A4F9E]/40 text-[#DCB87F] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#D8B4F8]" />
          <span className="text-[#EAD7FD]">Administrador de Centro</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#274A3F] text-white shadow-xs font-bold border-l-4 border-[#B3803F]'
                  : 'text-[#CFC9B8] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#DCB87F]' : 'text-[#9A917A]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                    item.badgeColor || 'bg-white/10 text-[#ECE7DB]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Usuario y Sede */}
      <div className="p-4 border-t border-white/10 bg-[#0E1F1A]/80 space-y-3">
        {currentUser && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <button
              type="button"
              onClick={() => setIsUserProfileOpen(true)}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group flex-1"
              title="Click para editar mi perfil o cambiar contraseña"
            >
              <div className="relative shrink-0">
                {currentUser.avatarUrl && currentUser.avatarUrl.trim() !== '' && !avatarError ? (
                  <img
                    src={resolverAvatarUrl(currentUser.avatarUrl)}
                    alt=""
                    onError={() => setAvatarError(true)}
                    className="w-8 h-8 rounded-full object-cover border border-[#DCB87F]/40 group-hover:border-[#DCB87F] transition-colors"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full bg-[#182F28] border border-[#DCB87F]/60 text-[#DCB87F] flex items-center justify-center font-serif font-bold text-[11px] shadow-2xs tracking-wider select-none shrink-0"
                    title={currentUser.nombreCompleto}
                  >
                    {obtenerIniciales(undefined, undefined, currentUser.nombreCompleto || 'Admin')}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#DCB87F] rounded-full flex items-center justify-center">
                  <UserCog className="w-2 h-2 text-[#182F28]" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate group-hover:text-[#DCB87F] transition-colors">
                  {currentUser.nombreCompleto}
                </div>
                <div className="text-[10px] text-[#DCB87F] font-mono uppercase tracking-wider">
                  {currentUser.nombreRol}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={async () => {
                const confirmed = await showConfirm({
                  title: 'Cerrar Sesión',
                  message: '¿Desea cerrar la sesión del portal administrativo?',
                  type: 'warning',
                  confirmText: 'Sí, Salir',
                  cancelText: 'Permanecer'
                });
                if (confirmed) {
                  logout();
                }
              }}
              title="Cerrar Sesión"
              className="p-1.5 rounded-lg text-[#9A917A] hover:text-[#E9A8A0] hover:bg-[#A4453A]/20 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        <div>
          <div className="text-[10px] text-[#9A917A] mb-0.5 font-mono tracking-wider">SEDE ACTIVA</div>
          <div className="text-xs font-semibold text-white truncate">
            {activeSede.nombre}
          </div>
          <div className="text-[11px] text-[#DCB87F]/80 truncate">
            {activeSede.ciudad}
          </div>
        </div>
      </div>
    </aside>
  );
};
