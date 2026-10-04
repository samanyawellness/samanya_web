import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  UserCheck,
  UserPlus,
  Phone,
  Mail,
  Briefcase,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Search,
  X,
  Filter
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarUtils';
import { ViewModeSelector, ViewMode } from '../common/ViewModeSelector';
import { PaginadorTabla } from '../common/PaginadorTabla';

export const WorkersView: React.FC = () => {
  const {
    trabajadores,
    searchQuery,
    setIsRegisterWorkerOpen,
    actualizarEstadoTrabajador,
    activeSede,
    setEditingTrabajador,
    setIsEditTrabajadorOpen
  } = useAdmin();

  const [filterArea, setFilterArea] = useState<string>('TODAS');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [paginaActual, setPaginaActual] = useState(1);

  const itemsPorPagina = viewMode === 'grid' ? 9 : 10;

  // Reset pagination on filter or view mode changes
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, searchQuery, filterArea, filterEstado, viewMode]);

  const filtered = useMemo(() => {
    return trabajadores.filter((t) => {
      const effectiveQuery = (searchTerm || searchQuery || '').trim().toLowerCase();
      if (effectiveQuery) {
        const cleanQ = effectiveQuery.replace(/[.,]/g, '');
        const match =
          t.nombreCompleto.toLowerCase().includes(effectiveQuery) ||
          t.identificacion.includes(cleanQ) ||
          t.cargo.toLowerCase().includes(effectiveQuery) ||
          t.area.toLowerCase().includes(effectiveQuery) ||
          (t.telefono && t.telefono.includes(effectiveQuery)) ||
          (t.email && t.email.toLowerCase().includes(effectiveQuery)) ||
          (t.eps && t.eps.toLowerCase().includes(effectiveQuery)) ||
          (t.arl && t.arl.toLowerCase().includes(effectiveQuery));
        if (!match) return false;
      }

      if (filterArea !== 'TODAS' && t.area !== filterArea) {
        return false;
      }

      if (filterEstado !== 'TODOS' && t.estado !== filterEstado) {
        return false;
      }

      return true;
    });
  }, [trabajadores, searchTerm, searchQuery, filterArea, filterEstado]);

  // Pagination calculation
  const totalPaginas = Math.ceil(filtered.length / itemsPorPagina) || 1;
  const paginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return filtered.slice(inicio, inicio + itemsPorPagina);
  }, [filtered, paginaActual, itemsPorPagina]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#182F28]">
            Talento Humano & Personal del Centro
          </h2>
          <p className="text-xs text-[#5C6058] mt-0.5">
            Gestión de colaboradores asistenciales, áreas operativas, contratos y disponibilidad para {activeSede.nombre}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterWorkerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-sm shadow-xs transition-all cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Registrar Colaborador</span>
        </button>
      </div>

      {/* Barra de Búsqueda, Filtros y Selector de Vista */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#DEDBD1] shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A745F]" />
            <input
              type="text"
              placeholder="Buscar por nombre, cargo, documento, área o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#274A3F]"
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

          {/* Filtro Área */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#274A3F]" />
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none focus:border-[#274A3F]"
            >
              <option value="TODAS">Todas las Áreas</option>
              <option value="Enfermería">Enfermería</option>
              <option value="Cuidado Asistencial">Cuidado Asistencial</option>
              <option value="Medicina / Especialistas">Medicina / Especialistas</option>
              <option value="Nutrición / Cocina">Nutrición / Cocina</option>
              <option value="Servicios Generales">Servicios Generales</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>

          {/* Filtro Estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none focus:border-[#274A3F]"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="Activo">Activos</option>
            <option value="En Permiso">En Permiso / Baja</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>

        {/* Selector de Modo de Visualización */}
        <div className="flex items-center gap-3">
          <ViewModeSelector viewMode={viewMode} onChange={setViewMode} />
          <span className="text-xs text-[#7A745F] font-mono whitespace-nowrap hidden md:inline">
            {filtered.length} colaborador(es)
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: MODO TARJETAS (GRID) */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginados.map((worker) => (
            <div
              key={worker.id}
              className="admin-card p-5 space-y-4 hover:border-[#274A3F] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Cabecera */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolverAvatarUrl(worker.avatarUrl)}
                      alt={worker.nombreCompleto}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                      className="w-12 h-12 rounded-xl object-cover border border-[#274A3F]/20 shrink-0"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#182F28] leading-snug">
                        {worker.nombreCompleto}
                      </h4>
                      <div className="text-xs text-[#B3803F] font-semibold">
                        {worker.cargo}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      worker.estado === 'Activo'
                        ? 'bg-[#DFF3E7] text-[#1E7A4C]'
                        : worker.estado === 'En Permiso'
                        ? 'bg-[#FEF7EE] text-[#9A5B12]'
                        : 'bg-[#FBE8E6] text-[#A4453A]'
                    }`}
                  >
                    {worker.estado}
                  </span>
                </div>

                {/* Área y Contrato */}
                <div className="mt-4 pt-3 border-t border-[#DEDBD1]/60 space-y-2 text-xs text-[#4B4636]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A745F]">Área:</span>
                    <span className="font-bold text-[#182F28] bg-[#F7F6F2] px-2 py-0.5 rounded-md border border-[#DEDBD1]">
                      {worker.area}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#7A745F]">Contrato:</span>
                    <span className="font-semibold text-[#182F28]">{worker.tipoContrato}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#7A745F]">Turno Habitual:</span>
                    <span className="font-semibold text-[#075158] bg-[#D9F0F1] px-2 py-0.5 rounded-md text-[11px]">
                      {worker.turnoHabitual || 'Rotativo'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A745F] pt-1">
                    <span>EPS: {worker.eps}</span>
                    <span>ARL: {worker.arl}</span>
                  </div>
                </div>

                {/* Contacto */}
                <div className="mt-3 pt-2 border-t border-[#DEDBD1]/40 space-y-1 text-xs text-[#5C6058]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#274A3F]" />
                    <span>{worker.telefono}</span>
                  </div>
                  {worker.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#7A745F]" />
                      <span className="truncate">{worker.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones Editar y Cambiar Estado */}
              <div className="pt-3 border-t border-[#DEDBD1]/60 mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTrabajador(worker);
                    setIsEditTrabajadorOpen(true);
                  }}
                  className="py-1.5 px-3 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-[#DEDBD1]"
                  title="Editar colaborador"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#274A3F]" />
                  <span>Editar</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#7A745F] font-mono hidden sm:inline">
                    {worker.tipoIdentificacion} {worker.identificacion}
                  </span>

                  {worker.estado === 'Activo' ? (
                    <button
                      type="button"
                      onClick={() => actualizarEstadoTrabajador(worker.id, 'Inactivo')}
                      className="text-xs font-bold text-[#A4453A] hover:underline cursor-pointer"
                    >
                      Inactivar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => actualizarEstadoTrabajador(worker.id, 'Activo')}
                      className="text-xs font-bold text-[#1E7A4C] hover:underline cursor-pointer"
                    >
                      Activar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: MODO LISTA COMPACTA */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {paginados.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-[#DEDBD1] p-4 hover:border-[#274A3F] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={resolverAvatarUrl(worker.avatarUrl)}
                  alt={worker.nombreCompleto}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                  className="w-12 h-12 rounded-xl object-cover border border-[#274A3F]/20 shrink-0"
                />

                <div className="space-y-1 flex-1 min-w-[200px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif font-bold text-base text-[#182F28]">
                      {worker.nombreCompleto}
                    </h4>
                    <span className="text-xs text-[#B3803F] font-semibold">
                      • {worker.cargo}
                    </span>
                    <span className="font-bold text-[#182F28] bg-[#F7F6F2] px-2 py-0.5 rounded-md border border-[#DEDBD1] text-[11px]">
                      {worker.area}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        worker.estado === 'Activo'
                          ? 'bg-[#DFF3E7] text-[#1E7A4C]'
                          : worker.estado === 'En Permiso'
                          ? 'bg-[#FEF7EE] text-[#9A5B12]'
                          : 'bg-[#FBE8E6] text-[#A4453A]'
                      }`}
                    >
                      {worker.estado}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5C6058]">
                    <span className="font-mono text-[#7A745F]">
                      {worker.tipoIdentificacion} {worker.identificacion}
                    </span>
                    <span className="flex items-center gap-1 text-[#182F28] font-medium">
                      <Phone className="w-3 h-3 text-[#274A3F]" />
                      {worker.telefono}
                    </span>
                    {worker.email && (
                      <span className="flex items-center gap-1 text-[#7A745F]">
                        <Mail className="w-3 h-3 text-[#7A745F]" />
                        {worker.email}
                      </span>
                    )}
                    <span className="text-[#075158] font-semibold bg-[#D9F0F1] px-1.5 py-0.2 rounded text-[11px]">
                      {worker.turnoHabitual || 'Rotativo'}
                    </span>
                    <span className="text-[11px] text-[#7A745F]">
                      {worker.tipoContrato}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción compactos */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#DEDBD1]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTrabajador(worker);
                    setIsEditTrabajadorOpen(true);
                  }}
                  className="p-2 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-[#DEDBD1]"
                  title="Editar colaborador"
                >
                  <Edit3 className="w-4 h-4 text-[#274A3F]" />
                  <span className="hidden sm:inline">Editar</span>
                </button>

                {worker.estado === 'Activo' ? (
                  <button
                    type="button"
                    onClick={() => actualizarEstadoTrabajador(worker.id, 'Inactivo')}
                    className="px-3 py-2 bg-[#FBE8E6] hover:bg-[#f7d6d3] text-[#A4453A] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Inactivar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => actualizarEstadoTrabajador(worker.id, 'Activo')}
                    className="px-3 py-2 bg-[#DFF3E7] hover:bg-[#d0ebd9] text-[#1E7A4C] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Activar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: MODO TABLA COMPLETA */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#DEDBD1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#182F28] text-white border-b border-[#274A3F]">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Colaborador
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Identificación
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Cargo & Área
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Contacto
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Turno / Contrato
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Seguridad Social
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Estado
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEDBD1]/60">
                {paginados.map((worker) => (
                  <tr key={worker.id} className="hover:bg-[#F7F6F2]/70 transition-colors">
                    {/* Colaborador */}
                    <td className="py-3 px-4 font-semibold text-[#182F28]">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={resolverAvatarUrl(worker.avatarUrl)}
                          alt={worker.nombreCompleto}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                          className="w-9 h-9 rounded-xl object-cover border border-[#274A3F]/20 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[#182F28]">{worker.nombreCompleto}</div>
                        </div>
                      </div>
                    </td>

                    {/* Identificación */}
                    <td className="py-3 px-4 font-mono text-[#5C6058] whitespace-nowrap">
                      {worker.tipoIdentificacion} {worker.identificacion}
                    </td>

                    {/* Cargo & Área */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#182F28]">{worker.cargo}</div>
                      <div className="text-[11px] text-[#7A745F]">{worker.area}</div>
                    </td>

                    {/* Contacto */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#274A3F]" />
                        <span className="font-bold text-[#182F28]">{worker.telefono}</span>
                      </div>
                      {worker.email && (
                        <div className="text-[10px] text-[#7A745F] truncate max-w-[150px]">
                          {worker.email}
                        </div>
                      )}
                    </td>

                    {/* Turno / Contrato */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-semibold text-[#075158] bg-[#D9F0F1] px-2 py-0.5 rounded">
                        {worker.turnoHabitual || 'Rotativo'}
                      </span>
                      <div className="text-[10px] text-[#7A745F] mt-0.5">{worker.tipoContrato}</div>
                    </td>

                    {/* Seguridad Social */}
                    <td className="py-3 px-4 whitespace-nowrap text-[11px] text-[#5C6058]">
                      <div>EPS: {worker.eps}</div>
                      <div>ARL: {worker.arl}</div>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          worker.estado === 'Activo'
                            ? 'bg-[#DFF3E7] text-[#1E7A4C]'
                            : worker.estado === 'En Permiso'
                            ? 'bg-[#FEF7EE] text-[#9A5B12]'
                            : 'bg-[#FBE8E6] text-[#A4453A]'
                        }`}
                      >
                        {worker.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTrabajador(worker);
                            setIsEditTrabajadorOpen(true);
                          }}
                          className="p-1.5 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] rounded-lg border border-[#DEDBD1] transition-colors"
                          title="Editar colaborador"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#274A3F]" />
                        </button>

                        {worker.estado === 'Activo' ? (
                          <button
                            type="button"
                            onClick={() => actualizarEstadoTrabajador(worker.id, 'Inactivo')}
                            className="px-2 py-1 bg-[#FBE8E6] hover:bg-[#f7d6d3] text-[#A4453A] font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                          >
                            Inactivar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => actualizarEstadoTrabajador(worker.id, 'Activo')}
                            className="px-2 py-1 bg-[#DFF3E7] hover:bg-[#d0ebd9] text-[#1E7A4C] font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginador */}
      <PaginadorTabla
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={filtered.length}
        itemsPorPagina={itemsPorPagina}
        itemLabel="colaboradores"
        onCambiarPagina={setPaginaActual}
        className="rounded-2xl border border-[#DEDBD1]"
      />

      {/* Estado Vacío */}
      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#DEDBD1] space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#DFF3E7] text-[#1E7A4C] mx-auto flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-lg text-[#182F28]">
              {trabajadores.length === 0
                ? 'Base de Datos Oracle Conectada (Sin Colaboradores)'
                : 'No se encontraron colaboradores con los filtros aplicados'}
            </h4>
            <p className="text-xs text-[#7A745F] max-w-md mx-auto leading-relaxed">
              {trabajadores.length === 0
                ? 'Actualmente no hay colaboradores registrados en la base de datos de esta sede. Puedes vincular el primer colaborador ahora.'
                : 'Ajusta los criterios de búsqueda para visualizar el personal.'}
            </p>
          </div>
          {trabajadores.length === 0 && (
            <button
              type="button"
              onClick={() => setIsRegisterWorkerOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Primer Colaborador</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

