import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  HeartHandshake,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Building2,
  Users,
  Edit3,
  Search,
  X,
  Filter
} from 'lucide-react';
import { ViewModeSelector, ViewMode } from '../common/ViewModeSelector';
import { PaginadorTabla } from '../common/PaginadorTabla';

export const FamilyMembersView: React.FC = () => {
  const {
    familiares,
    searchQuery,
    setIsRegisterFamilyOpen,
    activeSede,
    setEditingFamiliar,
    setIsEditFamiliarOpen
  } = useAdmin();

  const [filterCanal, setFilterCanal] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [paginaActual, setPaginaActual] = useState(1);

  const itemsPorPagina = viewMode === 'grid' ? 9 : 10;

  // Reset pagination on filter or view mode changes
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, searchQuery, filterCanal, viewMode]);

  const filtered = useMemo(() => {
    return familiares.filter((f) => {
      const effectiveQuery = (searchTerm || searchQuery || '').trim().toLowerCase();
      if (effectiveQuery) {
        const cleanQ = effectiveQuery.replace(/[.,]/g, '');
        const match =
          f.nombreCompleto.toLowerCase().includes(effectiveQuery) ||
          f.identificacion.includes(cleanQ) ||
          f.telefonoPrincipal.includes(effectiveQuery) ||
          (f.telefonoSecundario && f.telefonoSecundario.includes(effectiveQuery)) ||
          (f.email && f.email.toLowerCase().includes(effectiveQuery)) ||
          f.residentesAsociados.some(
            (r) =>
              r.nombreResidente.toLowerCase().includes(effectiveQuery) ||
              r.parentesco.toLowerCase().includes(effectiveQuery)
          );
        if (!match) return false;
      }

      if (filterCanal !== 'TODOS' && f.canalNotificacionPref !== filterCanal) {
        return false;
      }

      return true;
    });
  }, [familiares, searchTerm, searchQuery, filterCanal]);

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
            Directorio de Familiares & Acudientes
          </h2>
          <p className="text-xs text-[#5C6058] mt-0.5">
            Registro de contactos legales, responsables familiares y canales autorizados de notificación
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterFamilyOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-sm shadow-xs transition-all cursor-pointer"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Registrar Familiar / Acudiente</span>
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
              placeholder="Buscar por acudiente, documento, teléfono, correo o residente..."
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

          {/* Filtro Canal */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#B3803F]" />
            <select
              value={filterCanal}
              onChange={(e) => setFilterCanal(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none focus:border-[#B3803F]"
            >
              <option value="TODOS">Todos los Canales</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Correo">Correo</option>
              <option value="Push App">Notificación App</option>
              <option value="Llamada">Llamada</option>
            </select>
          </div>
        </div>

        {/* Selector de Modo de Visualización */}
        <div className="flex items-center gap-3">
          <ViewModeSelector viewMode={viewMode} onChange={setViewMode} />
          <span className="text-xs text-[#7A745F] font-mono whitespace-nowrap hidden md:inline">
            {filtered.length} acudiente(s)
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: MODO TARJETAS (GRID) */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginados.map((fam) => (
            <div
              key={fam.id}
              className="admin-card p-5 space-y-4 hover:border-[#B3803F] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Cabecera */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#B3803F]/15 flex items-center justify-center text-[#B3803F] font-serif font-bold text-lg border border-[#DCB87F]/30">
                      {fam.nombres.charAt(0)}
                      {fam.apellidos.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#182F28] leading-snug">
                        {fam.nombreCompleto}
                      </h4>
                      <span className="text-xs text-[#7A745F] font-mono">
                        {fam.tipoIdentificacion} {fam.identificacion}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9F0F1] text-[#075158] uppercase font-mono">
                    {fam.canalNotificacionPref}
                  </span>
                </div>

                {/* Residentes a Cargo */}
                <div className="mt-4 pt-3 border-t border-[#DEDBD1]/60 space-y-2">
                  <span className="text-[11px] font-mono uppercase text-[#7A745F] font-bold block">
                    Residente(s) Vinculado(s)
                  </span>
                  {fam.residentesAsociados.length > 0 ? (
                    fam.residentesAsociados.map((res, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-[#182F28]">{res.nombreResidente}</div>
                          <div className="text-[11px] text-[#5C6058]">Parentesco: {res.parentesco}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {res.esPrincipal && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#1E7A4C] text-white">
                              Principal
                            </span>
                          )}
                          {res.autorizadoSalidas && (
                            <span className="text-[9px] text-[#075158] font-semibold">
                              ✓ Retiro autorizado
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#7A745F] italic">Sin residente vinculado</div>
                  )}
                </div>

                {/* Datos de Contacto */}
                <div className="mt-4 space-y-1.5 text-xs text-[#4B4636]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#B3803F]" />
                    <a
                      href={`tel:${fam.telefonoPrincipal.replace(/\s+/g, '')}`}
                      className="font-bold hover:underline"
                    >
                      {fam.telefonoPrincipal}
                    </a>
                    {fam.telefonoSecundario && (
                      <span className="text-[11px] text-[#7A745F]">/ {fam.telefonoSecundario}</span>
                    )}
                  </div>

                  {fam.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#068591]" />
                      <span className="truncate">{fam.email}</span>
                    </div>
                  )}

                  {fam.direccion && (
                    <div className="flex items-center gap-2 text-[11px] text-[#7A745F]">
                      <MapPin className="w-3.5 h-3.5 text-[#7A4F9E]" />
                      <span className="truncate">{fam.direccion}, {fam.ciudad}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones directas */}
              <div className="pt-3 border-t border-[#DEDBD1]/60 mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingFamiliar(fam);
                    setIsEditFamiliarOpen(true);
                  }}
                  className="py-2 px-3 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DCB87F]"
                  title="Editar acudiente"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <a
                  href={`https://wa.me/57${fam.telefonoPrincipal.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-[#DFF3E7] hover:bg-[#d0ebd9] text-[#1E7A4C] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${fam.telefonoPrincipal.replace(/\s+/g, '')}`}
                  className="flex-1 py-2 px-3 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#DEDBD1]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Llamar</span>
                </a>
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
          {paginados.map((fam) => (
            <div
              key={fam.id}
              className="bg-white rounded-2xl border border-[#DEDBD1] p-4 hover:border-[#B3803F] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-[#B3803F]/15 flex items-center justify-center text-[#B3803F] font-serif font-bold text-lg border border-[#DCB87F]/30 shrink-0">
                  {fam.nombres.charAt(0)}
                  {fam.apellidos.charAt(0)}
                </div>

                <div className="space-y-1 flex-1 min-w-[200px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif font-bold text-base text-[#182F28]">
                      {fam.nombreCompleto}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9F0F1] text-[#075158] uppercase font-mono">
                      {fam.canalNotificacionPref}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5C6058]">
                    <span className="font-mono text-[#7A745F]">
                      {fam.tipoIdentificacion} {fam.identificacion}
                    </span>
                    <span className="flex items-center gap-1 text-[#182F28] font-medium">
                      <Phone className="w-3 h-3 text-[#B3803F]" />
                      {fam.telefonoPrincipal}
                    </span>
                    {fam.email && (
                      <span className="flex items-center gap-1 text-[#7A745F]">
                        <Mail className="w-3 h-3 text-[#068591]" />
                        {fam.email}
                      </span>
                    )}
                  </div>

                  {/* Residente vinculado resumen */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[#7A745F]">Residentes:</span>
                    {fam.residentesAsociados.length > 0 ? (
                      fam.residentesAsociados.map((res, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-[#F7F6F2] rounded-lg border border-[#DEDBD1] text-[#182F28]"
                        >
                          <span className="font-semibold">{res.nombreResidente}</span>
                          <span className="text-[#7A745F]">({res.parentesco})</span>
                          {res.esPrincipal && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1E7A4C]" title="Principal" />
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#7A745F] italic">Sin vincular</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción compactos */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#DEDBD1]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingFamiliar(fam);
                    setIsEditFamiliarOpen(true);
                  }}
                  className="p-2 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-[#DCB87F]"
                  title="Editar acudiente"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar</span>
                </button>

                <a
                  href={`https://wa.me/57${fam.telefonoPrincipal.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-[#DFF3E7] hover:bg-[#d0ebd9] text-[#1E7A4C] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  title="Escribir por WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${fam.telefonoPrincipal.replace(/\s+/g, '')}`}
                  className="px-3 py-2 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-[#DEDBD1]"
                  title="Llamar teléfono principal"
                >
                  <Phone className="w-4 h-4" />
                  <span>Llamar</span>
                </a>
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
                    Familiar / Acudiente
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Identificación
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Residente(s) a Cargo
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Teléfono(s)
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Correo Electrónico
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Canal Notif.
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEDBD1]/60">
                {paginados.map((fam) => (
                  <tr key={fam.id} className="hover:bg-[#F7F6F2]/70 transition-colors">
                    {/* Familiar / Acudiente */}
                    <td className="py-3 px-4 font-semibold text-[#182F28]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#B3803F]/15 flex items-center justify-center text-[#B3803F] font-serif font-bold text-xs border border-[#DCB87F]/30 shrink-0">
                          {fam.nombres.charAt(0)}
                          {fam.apellidos.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#182F28]">{fam.nombreCompleto}</div>
                          {fam.direccion && (
                            <div className="text-[10px] text-[#7A745F] truncate max-w-[150px]">
                              {fam.direccion}, {fam.ciudad}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Identificación */}
                    <td className="py-3 px-4 font-mono text-[#5C6058] whitespace-nowrap">
                      {fam.tipoIdentificacion} {fam.identificacion}
                    </td>

                    {/* Residentes a cargo */}
                    <td className="py-3 px-4">
                      {fam.residentesAsociados.length > 0 ? (
                        <div className="space-y-1">
                          {fam.residentesAsociados.map((res, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-bold text-[#182F28]">{res.nombreResidente}</span>
                              <span className="text-[#7A745F]">({res.parentesco})</span>
                              {res.esPrincipal && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#1E7A4C] text-white">
                                  Principal
                                </span>
                              )}
                              {res.autorizadoSalidas && (
                                <span className="text-[9px] text-[#075158] font-semibold">
                                  ✓ Salidas
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#7A745F] italic">Sin residentes</span>
                      )}
                    </td>

                    {/* Teléfonos */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#B3803F]" />
                        <span className="font-bold text-[#182F28]">{fam.telefonoPrincipal}</span>
                      </div>
                      {fam.telefonoSecundario && (
                        <div className="text-[10px] text-[#7A745F]">Sec: {fam.telefonoSecundario}</div>
                      )}
                    </td>

                    {/* Correo Electrónico */}
                    <td className="py-3 px-4 text-[#5C6058] max-w-[180px] truncate">
                      {fam.email || '—'}
                    </td>

                    {/* Canal de Notificación */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9F0F1] text-[#075158] uppercase font-mono">
                        {fam.canalNotificacionPref}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFamiliar(fam);
                            setIsEditFamiliarOpen(true);
                          }}
                          className="p-1.5 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] rounded-lg border border-[#DCB87F] transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={`https://wa.me/57${fam.telefonoPrincipal.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-[#DFF3E7] hover:bg-[#d0ebd9] text-[#1E7A4C] rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={`tel:${fam.telefonoPrincipal.replace(/\s+/g, '')}`}
                          className="p-1.5 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] rounded-lg border border-[#DEDBD1] transition-colors"
                          title="Llamar"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
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
        itemLabel="familiares"
        onCambiarPagina={setPaginaActual}
        className="rounded-2xl border border-[#DEDBD1]"
      />

      {/* Estado Vacío */}
      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#DEDBD1] space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF7EE] text-[#9A5B12] mx-auto flex items-center justify-center">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-lg text-[#182F28]">
              {familiares.length === 0
                ? 'Base de Datos Oracle Conectada (Sin Familiares)'
                : 'No se encontraron familiares con los filtros aplicados'}
            </h4>
            <p className="text-xs text-[#7A745F] max-w-md mx-auto leading-relaxed">
              {familiares.length === 0
                ? 'Actualmente no hay familiares o acudientes registrados en la base de datos. Puedes registrar un nuevo contacto familiar.'
                : 'Ajusta los criterios de búsqueda para visualizar los acudientes.'}
            </p>
          </div>
          {familiares.length === 0 && (
            <button
              type="button"
              onClick={() => setIsRegisterFamilyOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Registrar Primer Familiar</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

