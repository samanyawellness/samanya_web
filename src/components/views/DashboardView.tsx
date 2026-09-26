import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  HeartHandshake,
  UserCheck,
  Building2,
  CalendarDays,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
  Edit3,
  Search,
  X
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarUtils';
import { ResidentAvatar } from '../common/ResidentAvatar';

export const DashboardView: React.FC = () => {
  const {
    activeSede,
    metrics,
    turnos,
    trabajadores,
    residentes,
    incidentes,
    permisos,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    setIsRegisterResidentOpen,
    setIsRegisterFamilyOpen,
    setIsRegisterWorkerOpen,
    setIsEditSedeOpen,
    setSelectedResidente,
    setIsResidenteDetailOpen
  } = useAdmin();

  const activeShift = turnos.find((t) => t.idCentro === activeSede.id && t.estado === 'Activo') || turnos[0];
  const sedeResidentes = residentes.filter((r) => r.idCentro === activeSede.id);
  const pendingLeaves = permisos.filter((p) => p.estado === 'Pendiente');
  const activeIncidents = incidentes.filter((i) => i.idCentro === activeSede.id && i.estado !== 'Cerrado');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Bienvenida & Resumen Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#182F28] to-[#274A3F] p-6 rounded-3xl text-white shadow-md">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#DCB87F]">
            Panel de Dirección • {activeSede.nombre}
          </span>
          <h2 className="font-serif text-2xl font-bold mt-1 text-white">
            Resumen Operativo y Clínico del Día
          </h2>
          <p className="text-sm text-[#CFC9B8] mt-1 max-w-xl">
            Supervisión integral de ocupación de camas, cobertura de turnos asistenciales, talento humano y novedades de residentes.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsRegisterResidentOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admitir Residente</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterFamilyOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition-all cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-[#DCB87F]" />
            <span>Registrar Familiar</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterWorkerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-[#D8B4F8]" />
            <span>Nuevo Colaborador</span>
          </button>
        </div>
      </div>

      {/* 1.5. Sección Activa de Resultados si se busca desde la cabecera */}
      {searchQuery.trim() && (
        <div className="bg-[#FAF8F5] border-2 border-[#B3803F] rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#DEDBD1] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#B3803F]/15 text-[#B3803F] flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#182F28]">
                  Resultados para: <span className="text-[#B3803F]">"{searchQuery}"</span>
                </h3>
                <p className="text-xs text-[#7A745F]">
                  Coincidencias en residentes, habitaciones y personal asistencial de {activeSede.nombre}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#7A745F] hover:text-[#182F28] bg-white border border-[#DEDBD1] rounded-xl hover:bg-[#F7F6F2] transition-colors cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4" />
              <span>Limpiar búsqueda</span>
            </button>
          </div>

          {/* Tarjetas de resultados filtrados */}
          {(() => {
            const q = searchQuery.toLowerCase().trim();
            const cleanQ = q.replace(/[.,]/g, '');
            const matchedRes = sedeResidentes.filter(
              (r) =>
                r.nombreCompleto.toLowerCase().includes(q) ||
                r.identificacion.toLowerCase().includes(cleanQ) ||
                r.habitacion.toLowerCase().includes(q) ||
                r.codigoExpediente.toLowerCase().includes(q)
            );
            const matchedWork = trabajadores.filter(
              (t) =>
                t.nombreCompleto.toLowerCase().includes(q) ||
                t.identificacion.toLowerCase().includes(cleanQ) ||
                t.cargo.toLowerCase().includes(q) ||
                t.area.toLowerCase().includes(q)
            );

            if (matchedRes.length === 0 && matchedWork.length === 0) {
              return (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#DEDBD1] space-y-1">
                  <p className="font-semibold text-sm text-[#182F28]">
                    No se encontraron coincidencias para "{searchQuery}"
                  </p>
                  <p className="text-xs text-[#7A745F]">
                    Prueba buscando por nombre, número de documento, habitación o especialidad.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedRes.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      setSelectedResidente(res);
                      setIsResidenteDetailOpen(true);
                    }}
                    className="p-4 bg-white rounded-2xl border border-[#DEDBD1] hover:border-[#B3803F] shadow-2xs cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ResidentAvatar
                          fotoUrl={res.fotoUrl}
                          nombres={res.nombres}
                          apellidos={res.apellidos}
                          nombreCompleto={res.nombreCompleto}
                          sizeClass="w-11 h-11"
                          roundedClass="rounded-full"
                          textClass="text-sm"
                        />
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#182F28] group-hover:text-[#B3803F] transition-colors">
                            {res.nombreCompleto}
                          </h4>
                          <div className="text-xs text-[#7A745F] font-mono">
                            {res.codigoExpediente} • CC {res.identificacion}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#1E7A4C] bg-[#DFF3E7] px-2 py-0.5 rounded-md">
                        {res.estado}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#DEDBD1]/60 text-[#5C6058]">
                      <span className="font-semibold text-[#182F28]">
                        Hab. {res.habitacion} • Cama {res.cama}
                      </span>
                      <span className="text-[#B3803F] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Ver Expediente →
                      </span>
                    </div>
                  </div>
                ))}

                {matchedWork.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setActiveTab('trabajadores')}
                    className="p-4 bg-white rounded-2xl border border-[#DEDBD1] hover:border-[#274A3F] shadow-2xs cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolverAvatarUrl(w.avatarUrl)}
                          alt={w.nombreCompleto}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                          className="w-11 h-11 rounded-xl object-cover border border-[#274A3F]/20 shrink-0"
                        />
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#182F28] group-hover:text-[#274A3F] transition-colors">
                            {w.nombreCompleto}
                          </h4>
                          <div className="text-xs text-[#B3803F] font-semibold">{w.cargo}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#075158] bg-[#D9F0F1] px-2 py-0.5 rounded-md">
                        {w.estado}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#DEDBD1]/60 text-[#5C6058]">
                      <span>Área: <strong className="text-[#274A3F]">{w.area}</strong></span>
                      <span className="text-[#274A3F] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Ver en Personal →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* 2. Tarjetas de Indicadores (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ocupación */}
        <div
          onClick={() => setActiveTab('residentes')}
          className="admin-card p-5 cursor-pointer hover:border-[#B3803F] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C6058] uppercase font-mono">Ocupación de Camas</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditSedeOpen(true);
                }}
                className="p-1.5 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] rounded-lg border border-[#DCB87F] transition-colors cursor-pointer"
                title="Editar número de camas y sede"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-[#274A3F]/10 text-[#274A3F] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-[#182F28]">
              {metrics.porcentajeOcupacion}%
            </span>
            <span className="text-xs text-[#5C6058]">
              ({metrics.totalResidentes} de {metrics.capacidadTotal} camas)
            </span>
          </div>
          <div className="w-full h-2 bg-[#F1EDE3] rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-[#B3803F] rounded-full"
              style={{ width: `${metrics.porcentajeOcupacion}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Personal en Turno */}
        <div
          onClick={() => setActiveTab('turnos')}
          className="admin-card p-5 cursor-pointer hover:border-[#068591] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C6058] uppercase font-mono">Personal Activo Ahora</span>
            <div className="w-8 h-8 rounded-xl bg-[#068591]/10 text-[#068591] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-[#182F28]">
              {activeShift ? activeShift.trabajadoresAsignados.length : metrics.personalActivoTurno}
            </span>
            <span className="text-xs font-semibold text-[#1E7A4C] bg-[#DFF3E7] px-2 py-0.5 rounded-md">
              {activeShift ? activeShift.tipo : 'Sin turno'}
            </span>
          </div>
          <p className="text-xs text-[#5C6058] mt-2">
            Cobertura mínima requerida: {activeShift ? activeShift.coberturaMinimaRequerida : 0} personas
          </p>
        </div>

        {/* KPI 3: Permisos Pendientes */}
        <div
          onClick={() => setActiveTab('permisos')}
          className="admin-card p-5 cursor-pointer hover:border-[#7A4F9E] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C6058] uppercase font-mono">Permisos Pendientes</span>
            <div className="w-8 h-8 rounded-xl bg-[#7A4F9E]/10 text-[#7A4F9E] flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-[#182F28]">
              {pendingLeaves.length}
            </span>
            <span className="text-xs text-[#5C6058]">por coordinar</span>
          </div>
          <p className="text-xs text-[#5C6058] mt-2">
            Incapacidades y licencias de personal
          </p>
        </div>

        {/* KPI 4: Incidentes Activos */}
        <div
          onClick={() => setActiveTab('clinico')}
          className="admin-card p-5 cursor-pointer hover:border-[#A4453A] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C6058] uppercase font-mono">Incidentes Clínicos</span>
            <div className="w-8 h-8 rounded-xl bg-[#A4453A]/10 text-[#A4453A] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-[#182F28]">
              {activeIncidents.length}
            </span>
            <span className="text-xs font-semibold text-[#A4453A] bg-[#FBE8E6] px-2 py-0.5 rounded-md">
              En seguimiento
            </span>
          </div>
          <p className="text-xs text-[#5C6058] mt-2">
            Caídas o variaciones de signos vitales
          </p>
        </div>
      </div>

      {/* 3. Sección Doble: Turno Activo y Censo Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Personal en Guardia Activa */}
        <div className="lg:col-span-2 admin-card p-6 space-y-4">
          {activeShift ? (
            <>
              <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#1E7A4C] animate-pulse" />
                  <h3 className="font-serif font-bold text-base text-[#182F28]">
                    {activeShift.nombre}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#075158] bg-[#D9F0F1] px-2.5 py-1 rounded-lg">
                    {activeShift.horario}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('turnos')}
                    className="text-xs font-bold text-[#B3803F] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Gestionar Turnos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {activeShift.alertas && (
                <div className="p-3 bg-[#FEF7EE] border border-[#DCB87F] rounded-xl flex items-center gap-2.5 text-xs text-[#9A5B12] font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{activeShift.alertas}</span>
                </div>
              )}

              <div className="space-y-2.5">
                {activeShift.trabajadoresAsignados.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#7A745F]">
                    No hay colaboradores asignados a este turno actualmente.
                  </div>
                ) : (
                  activeShift.trabajadoresAsignados.map((worker) => {
                    const master = trabajadores.find((t) => t.id === worker.idTrabajador);
                    const nombre = master?.nombreCompleto || worker.nombre;
                    const cargo = master?.cargo || worker.cargo;
                    const area = master?.area || worker.area;
                    const avatar = master?.avatarUrl || worker.avatarUrl;

                    return (
                      <div
                        key={worker.idTrabajador}
                        className="flex items-center justify-between p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={resolverAvatarUrl(avatar)}
                            alt={nombre}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_AVATAR;
                            }}
                            className="w-10 h-10 rounded-full object-cover border border-[#274A3F]/20"
                          />
                          <div>
                            <div className="text-sm font-bold text-[#182F28]">{nombre}</div>
                            <div className="text-xs text-[#5C6058]">{cargo} • <span className="text-[#274A3F] font-semibold">{area}</span></div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-[#DEDBD1] text-[#1E7A4C]">
                          En servicio activo
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center space-y-2">
              <Clock className="w-8 h-8 text-[#7A745F] mx-auto opacity-40" />
              <h4 className="font-serif font-bold text-sm text-[#182F28]">
                Sin turnos activos asignados
              </h4>
              <p className="text-xs text-[#7A745F]">
                No hay cuadrantes activos configurados para esta sede en la base de datos Oracle.
              </p>
            </div>
          )}
        </div>

        {/* Columna Derecha: Alertas Clínicas y Novedades */}
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3">
            <h3 className="font-serif font-bold text-base text-[#182F28]">
              Alertas Clínicas Recientes
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('clinico')}
              className="text-xs font-bold text-[#B3803F] hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {activeIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3 bg-[#FEF7EE] rounded-xl border border-[#DCB87F] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9A5B12] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {inc.tipo} • Hab. {inc.habitacion}
                  </span>
                  <span className="text-[10px] font-mono text-[#7A745F]">
                    {inc.fechaHora}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#182F28]">
                  {inc.nombreResidente}
                </p>
                <p className="text-[11px] text-[#5C6058] line-clamp-2">
                  {inc.descripcion}
                </p>
              </div>
            ))}

            {activeIncidents.length === 0 && (
              <div className="p-6 text-center text-xs text-[#7A745F]">
                No hay alertas críticas activas en este turno.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
