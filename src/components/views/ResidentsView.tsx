import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Residente } from '../../types';
import {
  Users,
  UserPlus,
  RefreshCw,
  Filter,
  Eye,
  Edit3,
  ShieldAlert,
  Phone,
  Bed,
  Utensils,
  Activity,
  Pill,
  Package,
  ClipboardList,
  FileText,
  Boxes,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { ResidentAvatar } from '../common/ResidentAvatar';
import { PaginadorTabla } from '../common/PaginadorTabla';
import { ViewModeSelector, ViewMode } from '../common/ViewModeSelector';

export const ResidentsView: React.FC = () => {
  const {
    residentes,
    familiares,
    activeSede,
    searchQuery,
    setIsRegisterResidentOpen,
    setSelectedResidente,
    setIsResidenteDetailOpen,
    abrirFichaIngreso,
    setEditingResidente,
    setIsEditResidenteOpen,
    setEditingFamiliar,
    setIsEditFamiliarOpen,
    sincronizarResidentes,
    setIsGestionDotacionOpen,
    abrirSolicitarDotacion,
    dotaciones,
    cargarBitacoraResidente,
    abrirInventarioResidente,
    movimientosInventario
  } = useAdmin();

  const [isSyncing, setIsSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterMobility, setFilterMobility] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [paginaActual, setPaginaActual] = useState(1);

  const itemsPorPagina = viewMode === 'grid' ? 9 : 10;
  const manejaInventarioSede = activeSede?.manejaInventario !== false;

  // Reseteo de página al cambiar filtros o modo
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, filterStatus, filterMobility, searchQuery, viewMode]);

  // Filtrado de Residentes
  const filtered = useMemo(() => {
    return residentes.filter((r) => {
      if (r.idCentro !== activeSede.id) return false;

      // Filtro por búsqueda global o local
      const effectiveQuery = (searchTerm || searchQuery || '').trim().toLowerCase();
      if (effectiveQuery) {
        const cleanQ = effectiveQuery.replace(/[.,]/g, '');
        const match =
          r.nombreCompleto.toLowerCase().includes(effectiveQuery) ||
          r.identificacion.includes(cleanQ) ||
          r.habitacion.toLowerCase().includes(effectiveQuery) ||
          r.codigoExpediente.toLowerCase().includes(effectiveQuery) ||
          (r.alertasClinicas && r.alertasClinicas.toLowerCase().includes(effectiveQuery)) ||
          r.acudientes.some((a) => a.nombreCompleto.toLowerCase().includes(effectiveQuery));
        if (!match) return false;
      }

      // Filtro por estado
      if (filterStatus !== 'TODOS' && r.estado !== filterStatus) {
        return false;
      }

      // Filtro por movilidad
      if (filterMobility !== 'TODOS' && r.nivelMovilidad !== filterMobility) {
        return false;
      }

      return true;
    });
  }, [residentes, activeSede.id, searchTerm, searchQuery, filterStatus, filterMobility]);

  // Paginación
  const totalPaginas = Math.ceil(filtered.length / itemsPorPagina) || 1;
  const paginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return filtered.slice(inicio, inicio + itemsPorPagina);
  }, [filtered, paginaActual, itemsPorPagina]);

  const handleOpenDetail = (res: Residente) => {
    setSelectedResidente(res);
    setIsResidenteDetailOpen(true);
    cargarBitacoraResidente(res.id).catch(() => {});
  };

  const handleEditResident = (res: Residente) => {
    setEditingResidente(res);
    setIsEditResidenteOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#182F28]">
            Directorio y Admisión de Residentes
          </h2>
          <p className="text-xs text-[#5C6058] mt-0.5">
            Gestión de expedientes, asignación de habitaciones y seguimiento clínico de {activeSede.nombre}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isSyncing}
            onClick={async () => {
              setIsSyncing(true);
              try {
                await sincronizarResidentes();
              } finally {
                setIsSyncing(false);
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-[#F2EFE9] text-[#182F28] border border-[#DEDBD1] font-semibold rounded-xl text-sm shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Consultar y sincronizar censo real desde la base de datos Oracle"
          >
            <RefreshCw className={`w-4 h-4 text-[#274A3F] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar con Oracle'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGestionDotacionOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-[#F2EFE9] text-[#182F28] border border-[#DEDBD1] font-semibold rounded-xl text-sm shadow-2xs transition-all cursor-pointer"
            title="Administrar plantilla genérica y catálogo de dotación de ingreso"
          >
            <Package className="w-4 h-4 text-[#B3803F]" />
            <span>Catálogo Dotación</span>
          </button>

          <button
            type="button"
            onClick={() => abrirSolicitarDotacion()}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/40 font-bold rounded-xl text-sm shadow-2xs transition-all cursor-pointer"
            title="Ingresar solicitud de dotación, lencería o insumos para cualquier residente"
          >
            <ClipboardList className="w-4 h-4 text-[#DCB87F]" />
            <span>Solicitar Dotación</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRegisterResidentOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-sm shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admitir Nuevo Residente</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda, Filtros y Selector de Visualización */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#DEDBD1] shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Buscador de Residentes */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A745F]" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento, habitación o expediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#B3803F]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none focus:border-[#B3803F]"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="Activo">Activos</option>
              <option value="En Observación">En Observación</option>
              <option value="Hospitalizado">Hospitalizados</option>
              <option value="Egresado">Egresados</option>
            </select>
          </div>

          {/* Filtro por Movilidad */}
          <select
            value={filterMobility}
            onChange={(e) => setFilterMobility(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none focus:border-[#B3803F]"
          >
            <option value="TODOS">Toda Movilidad</option>
            <option value="Independiente">Independiente</option>
            <option value="Asistencia Leve">Asistencia Leve</option>
            <option value="Asistencia Moderada">Asistencia Moderada</option>
            <option value="Dependiente Total">Dependiente Total</option>
          </select>
        </div>

        {/* Selector de Modo de Visualización (Tarjetas, Lista, Tabla) */}
        <div className="flex items-center gap-3">
          <ViewModeSelector viewMode={viewMode} onChange={setViewMode} />
          <span className="text-xs text-[#7A745F] font-mono whitespace-nowrap hidden md:inline">
            {filtered.length} residente(s)
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: TARJETAS (GRID) */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginados.map((res) => {
            const mainAcudiente = res.acudientes.find((a) => a.esPrincipal) || res.acudientes[0];

            return (
              <div
                key={res.id}
                className="admin-card p-5 space-y-4 hover:border-[#B3803F] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Cabecera Tarjeta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ResidentAvatar
                        fotoUrl={res.fotoUrl}
                        nombres={res.nombres}
                        apellidos={res.apellidos}
                        nombreCompleto={res.nombreCompleto}
                        sizeClass="w-12 h-12"
                        roundedClass="rounded-xl"
                        textClass="text-base"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#182F28] leading-snug">
                          {res.nombreCompleto}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#7A745F] font-mono">
                            {res.codigoExpediente}
                          </span>
                          <span className="text-xs text-[#5C6058]">
                            • {res.edad} años
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        res.estado === 'Activo'
                          ? 'bg-[#DFF3E7] text-[#1E7A4C]'
                          : res.estado === 'En Observación'
                          ? 'bg-[#FEF7EE] text-[#9A5B12]'
                          : 'bg-[#FBE8E6] text-[#A4453A]'
                      }`}
                    >
                      {res.estado}
                    </span>
                  </div>

                  {/* Info Cuidado */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#DEDBD1]/60 text-xs text-[#4B4636]">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-[#B3803F]" />
                      <span>Hab. <strong>{res.habitacion}</strong> ({res.cama})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#068591]" />
                      <span className="truncate">{res.nivelMovilidad}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Utensils className="w-3.5 h-3.5 text-[#7A4F9E]" />
                      <span>Dieta: <strong>{res.tipoDieta}</strong></span>
                    </div>
                  </div>

                  {/* Alertas Clínicas */}
                  {res.alertasClinicas && (
                    <div className="mt-3 p-2 bg-[#FEF7EE] rounded-lg border border-[#DCB87F] text-[11px] text-[#9A5B12] flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{res.alertasClinicas}</span>
                    </div>
                  )}

                  {/* Medicamentos Prescritos */}
                  {res.medicamentos && res.medicamentos.length > 0 && (
                    <div className="mt-2.5 p-2 bg-[#F2F8F5] rounded-lg border border-[#BDE0D0] text-[11px] text-[#1E7A4C] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <Pill className="w-3.5 h-3.5 shrink-0 text-[#1E7A4C]" />
                        <span className="font-medium truncate">
                          {res.medicamentos.length === 1
                            ? `${res.medicamentos[0].medicamento} (${res.medicamentos[0].cantidad})`
                            : `${res.medicamentos.length} medicamentos prescritos`}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold font-mono uppercase bg-[#DFF3E7] px-1.5 py-0.5 rounded text-[#185A37] shrink-0 ml-1">
                        {res.medicamentos.length} Rx
                      </span>
                    </div>
                  )}

                  {/* Familiar Responsable */}
                  {mainAcudiente && (
                    <div className="mt-3 p-2.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-mono uppercase text-[#7A745F] font-bold">
                          Familiar Contacto ({mainAcudiente.parentesco})
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const fam = familiares.find((f) => f.id === mainAcudiente.id);
                            if (fam) {
                              setEditingFamiliar(fam);
                              setIsEditFamiliarOpen(true);
                            }
                          }}
                          className="text-[11px] font-bold text-[#9A5B12] hover:text-[#7d480a] flex items-center gap-1 hover:underline cursor-pointer"
                          title="Editar información del familiar"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      </div>
                      <div className="font-bold text-[#182F28]">
                        {mainAcudiente.nombreCompleto}
                      </div>
                      <div className="text-[11px] text-[#5C6058] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#068591]" />
                        {mainAcudiente.telefono}
                      </div>
                    </div>
                  )}

                  {/* Resumen de Dotación del Residente */}
                  {(() => {
                    const resDot = (dotaciones || []).filter((d) => d.idResidente === res.id);
                    const vencidos = resDot.filter((d) => d.semaforoCambio === 'VENCIDO').length;
                    const proximos = resDot.filter((d) => d.semaforoCambio === 'PROXIMO').length;
                    const solicitados = resDot.filter((d) => d.estadoElemento === 'Solicitado' || d.estadoElemento === 'En Trámite').length;

                    if (resDot.length === 0) {
                      return (
                        <div className="mt-2.5 p-2 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-[#7A745F]">
                            <Package className="w-3.5 h-3.5 text-[#B3803F]" />
                            <span>Sin dotación asignada</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirSolicitarDotacion(res);
                            }}
                            className="text-[11px] font-bold text-[#9A5B12] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <ClipboardList className="w-3 h-3" />
                            <span>Solicitar</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="mt-2.5 p-2 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#182F28] font-semibold">
                          <Package className="w-3.5 h-3.5 text-[#B3803F]" />
                          <span>{resDot.length} artículo(s)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {solicitados > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                              {solicitados} solic.
                            </span>
                          )}
                          {vencidos > 0 ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                              {vencidos} vencido(s)
                            </span>
                          ) : proximos > 0 ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              {proximos} por renovar
                            </span>
                          ) : solicitados === 0 ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Vigente
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Resumen Insumos / Inventario en Custodia */}
                  {manejaInventarioSede && (() => {
                    const movs = (movimientosInventario || []).filter((m) => m.idResidente === res.id);
                    const totalArticulos = new Set(movs.flatMap((m) => m.detalles.map((d) => d.idArticulo))).size;
                    if (totalArticulos === 0) return null;
                    return (
                      <div className="mt-2 p-2 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#166534] font-semibold">
                          <Boxes className="w-3.5 h-3.5 text-[#166534]" />
                          <span>{totalArticulos} insumo(s) en custodia</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirInventarioResidente(res);
                          }}
                          className="text-[11px] font-bold text-[#15803D] hover:underline cursor-pointer flex items-center gap-0.5"
                          title="Ver existencias, donaciones e historial de insumos"
                        >
                          <span>Ver Insumos</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Botones de Acción del Residente */}
                <div className="pt-3 border-t border-[#DEDBD1]/60 mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(res)}
                      className="py-2 px-3 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DEDBD1]"
                      title="Ver expediente clínico y bitácora diaria"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#B3803F]" />
                      <span>Expediente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => abrirFichaIngreso(res)}
                      className="py-2 px-3 bg-[#F0F8F4] hover:bg-[#d9eee3] text-[#1E7A4C] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#BDE0D0]"
                      title="Ficha Técnica de Ingreso y Valoración Multidimensional"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#1E7A4C]" />
                      <span>Valoración</span>
                    </button>
                  </div>

                  {manejaInventarioSede ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => abrirInventarioResidente(res)}
                        className="py-1.5 px-2 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#86EFAC] shadow-2xs"
                        title="Ver toda la información del inventario y donaciones de este residente"
                      >
                        <Boxes className="w-3.5 h-3.5 text-[#166534]" />
                        <span>Inventario</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirSolicitarDotacion(res)}
                        className="py-1.5 px-2 bg-white hover:bg-[#F2EFE9] text-[#4B4636] font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#DEDBD1]"
                        title="Solicitar dotación para este residente"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-[#B3803F]" />
                        <span>Solicitar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditResident(res)}
                        className="py-1.5 px-2 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#DCB87F]"
                        title="Editar información del residente"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#9A5B12]" />
                        <span>Editar</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => abrirSolicitarDotacion(res)}
                        className="py-1.5 px-2.5 bg-white hover:bg-[#F2EFE9] text-[#4B4636] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DEDBD1]"
                        title="Solicitar dotación para este residente"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-[#B3803F]" />
                        <span>Solicitar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditResident(res)}
                        className="py-1.5 px-2.5 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DCB87F]"
                        title="Editar información del residente"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#9A5B12]" />
                        <span>Editar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: LISTA COMPACTA */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {paginados.map((res) => {
            const mainAcudiente = res.acudientes.find((a) => a.esPrincipal) || res.acudientes[0];

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-[#DEDBD1] p-4 shadow-xs hover:border-[#B3803F] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Info Identificación & Avatar */}
                <div className="flex items-center gap-3 min-w-[260px]">
                  <ResidentAvatar
                    fotoUrl={res.fotoUrl}
                    nombres={res.nombres}
                    apellidos={res.apellidos}
                    nombreCompleto={res.nombreCompleto}
                    sizeClass="w-11 h-11"
                    roundedClass="rounded-xl"
                    textClass="text-sm"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#182F28] leading-tight">
                      {res.nombreCompleto}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#7A745F]">
                      <span className="font-mono font-semibold">{res.codigoExpediente}</span>
                      <span>•</span>
                      <span>{res.edad} años</span>
                      <span>•</span>
                      <span className="font-mono">{res.tipoIdentificacion} {res.identificacion}</span>
                    </div>
                  </div>
                </div>

                {/* Ubicación y Cuidado */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#4B4636]">
                  <div className="flex items-center gap-1 bg-[#F7F6F2] px-2.5 py-1 rounded-lg border border-[#DEDBD1]">
                    <Bed className="w-3.5 h-3.5 text-[#B3803F]" />
                    <span>Hab. <strong>{res.habitacion}</strong> ({res.cama})</span>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F7F6F2] px-2.5 py-1 rounded-lg border border-[#DEDBD1]">
                    <Activity className="w-3.5 h-3.5 text-[#068591]" />
                    <span>{res.nivelMovilidad}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F7F6F2] px-2.5 py-1 rounded-lg border border-[#DEDBD1]">
                    <Utensils className="w-3.5 h-3.5 text-[#7A4F9E]" />
                    <span>Dieta: {res.tipoDieta}</span>
                  </div>
                </div>

                {/* Acudiente */}
                <div className="text-xs text-[#5C6058] min-w-[180px]">
                  {mainAcudiente ? (
                    <div>
                      <div className="font-bold text-[#182F28] truncate">{mainAcudiente.nombreCompleto}</div>
                      <div className="text-[11px] flex items-center gap-1 text-[#7A745F]">
                        <Phone className="w-3 h-3 text-[#068591]" />
                        <span>{mainAcudiente.telefono} ({mainAcudiente.parentesco})</span>
                      </div>
                    </div>
                  ) : (
                    <span className="italic text-[#7A745F]">Sin acudiente registrado</span>
                  )}
                </div>

                {/* Estado */}
                <div className="text-center min-w-[110px]">
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap inline-flex items-center justify-center ${
                      res.estado === 'Activo'
                        ? 'bg-[#DFF3E7] text-[#1E7A4C] border border-[#BDE0D0]'
                        : res.estado === 'En Observación'
                        ? 'bg-[#FEF7EE] text-[#9A5B12] border border-[#DCB87F]'
                        : 'bg-[#FBE8E6] text-[#A4453A] border border-[#F5C2BC]'
                    }`}
                  >
                    {res.estado}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(res)}
                    className="p-2 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] rounded-xl border border-[#DEDBD1] transition-colors cursor-pointer"
                    title="Ver Expediente Clínico"
                  >
                    <Eye className="w-4 h-4 text-[#B3803F]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => abrirFichaIngreso(res)}
                    className="p-2 bg-[#F0F8F4] hover:bg-[#d9eee3] text-[#1E7A4C] rounded-xl border border-[#BDE0D0] transition-colors cursor-pointer"
                    title="Ficha Técnica y Valoración"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  {manejaInventarioSede && (
                    <button
                      type="button"
                      onClick={() => abrirInventarioResidente(res)}
                      className="p-2 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] rounded-xl border border-[#86EFAC] transition-colors cursor-pointer"
                      title="Ver Insumos e Inventario"
                    >
                      <Boxes className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleEditResident(res)}
                    className="p-2 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] rounded-xl border border-[#DCB87F] transition-colors cursor-pointer"
                    title="Editar Residente"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: TABLA DE DATOS */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#DEDBD1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6F2] border-b border-[#DEDBD1] text-[#7A745F] font-mono uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Residente</th>
                  <th className="py-3.5 px-4">Documento</th>
                  <th className="py-3.5 px-4">Ubicación</th>
                  <th className="py-3.5 px-4">Movilidad & Dieta</th>
                  <th className="py-3.5 px-4">Acudiente Principal</th>
                  <th className="py-3.5 px-4 text-center min-w-[130px] w-36">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7DC]">
                {paginados.map((res) => {
                  const mainAcudiente = res.acudientes.find((a) => a.esPrincipal) || res.acudientes[0];

                  return (
                    <tr key={res.id} className="hover:bg-[#FDFBF7] transition-colors">
                      {/* Residente Avatar + Nombre */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <ResidentAvatar
                            fotoUrl={res.fotoUrl}
                            nombres={res.nombres}
                            apellidos={res.apellidos}
                            nombreCompleto={res.nombreCompleto}
                            sizeClass="w-10 h-10"
                            roundedClass="rounded-xl"
                            textClass="text-xs"
                          />
                          <div>
                            <div className="font-bold text-[#182F28]">{res.nombreCompleto}</div>
                            <div className="text-[11px] text-[#7A745F] font-mono">
                              Exp: {res.codigoExpediente} • {res.edad} años
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Identificación */}
                      <td className="py-3 px-4 font-mono font-semibold text-[#182F28]">
                        {res.tipoIdentificacion} {res.identificacion}
                      </td>

                      {/* Habitación & Cama */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#182F28] flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5 text-[#B3803F]" />
                          <span>Hab. {res.habitacion}</span>
                        </div>
                        <div className="text-[11px] text-[#7A745F] font-mono">
                          Cama: {res.cama}
                        </div>
                      </td>

                      {/* Movilidad & Dieta */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#182F28]">{res.nivelMovilidad}</div>
                        <div className="text-[11px] text-[#7A745F]">Dieta: {res.tipoDieta}</div>
                      </td>

                      {/* Acudiente */}
                      <td className="py-3 px-4">
                        {mainAcudiente ? (
                          <div>
                            <div className="font-bold text-[#182F28]">{mainAcudiente.nombreCompleto}</div>
                            <div className="text-[11px] text-[#5C6058] flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#068591]" />
                              <span>{mainAcudiente.telefono} ({mainAcudiente.parentesco})</span>
                            </div>
                          </div>
                        ) : (
                          <span className="italic text-[#7A745F]">Sin acudiente</span>
                        )}
                      </td>

                      {/* Estado con Badge Amplio */}
                      <td className="py-3 px-4 text-center min-w-[130px]">
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap inline-flex items-center justify-center shadow-2xs ${
                            res.estado === 'Activo'
                              ? 'bg-[#DFF3E7] text-[#1E7A4C] border border-[#BDE0D0]'
                              : res.estado === 'En Observación'
                              ? 'bg-[#FEF7EE] text-[#9A5B12] border border-[#DCB87F]'
                              : 'bg-[#FBE8E6] text-[#A4453A] border border-[#F5C2BC]'
                          }`}
                        >
                          {res.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(res)}
                            className="p-1.5 rounded-lg bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] transition-colors cursor-pointer border border-[#DEDBD1]"
                            title="Ver Expediente Clínico"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#B3803F]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => abrirFichaIngreso(res)}
                            className="p-1.5 rounded-lg bg-[#F0F8F4] hover:bg-[#d9eee3] text-[#1E7A4C] transition-colors cursor-pointer border border-[#BDE0D0]"
                            title="Ficha Técnica y Valoración"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {manejaInventarioSede && (
                            <button
                              type="button"
                              onClick={() => abrirInventarioResidente(res)}
                              className="p-1.5 rounded-lg bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] transition-colors cursor-pointer border border-[#86EFAC]"
                              title="Ver Insumos e Inventario"
                            >
                              <Boxes className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEditResident(res)}
                            className="p-1.5 rounded-lg bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] transition-colors cursor-pointer border border-[#DCB87F]"
                            title="Editar Residente"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      <PaginadorTabla
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={filtered.length}
        itemsPorPagina={itemsPorPagina}
        itemLabel="residentes"
        onCambiarPagina={setPaginaActual}
        className="rounded-2xl border border-[#DEDBD1]"
      />

      {/* Estado Vacío */}
      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#DEDBD1] space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#DFF3E7] text-[#1E7A4C] mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-lg text-[#182F28]">
              {residentes.length === 0
                ? 'Base de Datos Oracle Conectada (Sin Residentes)'
                : 'No se encontraron residentes con los filtros aplicados'}
            </h4>
            <p className="text-xs text-[#7A745F] max-w-md mx-auto leading-relaxed">
              {residentes.length === 0
                ? 'El censo en Oracle Autonomous Database está actualmente vacío o recién inicializado. Puedes admitir el primer residente o sincronizar en cualquier momento.'
                : 'Ajusta los criterios de búsqueda o limpia los filtros para ver todos los residentes.'}
            </p>
          </div>
          {residentes.length === 0 && (
            <button
              type="button"
              onClick={() => setIsRegisterResidentOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Admitir Primer Residente</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
