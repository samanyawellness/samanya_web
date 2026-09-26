import React, { useState } from 'react';
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
  ClipboardList
} from 'lucide-react';
import { ResidentAvatar } from '../common/ResidentAvatar';

export const ResidentsView: React.FC = () => {
  const {
    residentes,
    familiares,
    activeSede,
    searchQuery,
    setIsRegisterResidentOpen,
    setSelectedResidente,
    setIsResidenteDetailOpen,
    setEditingResidente,
    setIsEditResidenteOpen,
    setEditingFamiliar,
    setIsEditFamiliarOpen,
    sincronizarResidentes,
    setIsGestionDotacionOpen,
    abrirSolicitarDotacion,
    dotaciones
  } = useAdmin();

  const [isSyncing, setIsSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterMobility, setFilterMobility] = useState<string>('TODOS');

  // Filtrado
  const filtered = residentes.filter((r) => {
    if (r.idCentro !== activeSede.id) return false;

    // Filtro por búsqueda
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const cleanQ = q.replace(/[.,]/g, '');
      const match =
        r.nombreCompleto.toLowerCase().includes(q) ||
        r.identificacion.includes(cleanQ) ||
        r.habitacion.toLowerCase().includes(q) ||
        r.codigoExpediente.toLowerCase().includes(q);
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

  const handleOpenDetail = (res: Residente) => {
    setSelectedResidente(res);
    setIsResidenteDetailOpen(true);
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

        <div className="flex items-center gap-2">
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

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-[#DEDBD1]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#182F28] font-mono">
          <Filter className="w-4 h-4 text-[#B3803F]" />
          <span>FILTROS:</span>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none"
        >
          <option value="TODOS">Todos los Estados</option>
          <option value="Activo">Activos</option>
          <option value="En Observación">En Observación</option>
          <option value="Hospitalizado">Hospitalizados</option>
          <option value="Egresado">Egresados</option>
        </select>

        <select
          value={filterMobility}
          onChange={(e) => setFilterMobility(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none"
        >
          <option value="TODOS">Toda Movilidad</option>
          <option value="Independiente">Independiente</option>
          <option value="Asistencia Leve">Asistencia Leve</option>
          <option value="Asistencia Moderada">Asistencia Moderada</option>
          <option value="Dependiente Total">Dependiente Total</option>
        </select>

        <span className="ml-auto text-xs text-[#7A745F] font-mono">
          Mostrando {filtered.length} de {residentes.filter((r) => r.idCentro === activeSede.id).length} residentes
        </span>
      </div>

      {/* Grid de Tarjetas de Residentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => {
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
              </div>

              {/* Botones Ficha, Solicitar y Editar */}
              <div className="pt-3 border-t border-[#DEDBD1]/60 mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDetail(res)}
                  className="flex-1 py-2 px-3 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DEDBD1]"
                >
                  <Eye className="w-3.5 h-3.5 text-[#B3803F]" />
                  <span>Ver Ficha</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirSolicitarDotacion(res)}
                  className="py-2 px-2.5 bg-white hover:bg-[#F2EFE9] text-[#182F28] font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#DEDBD1]"
                  title="Solicitar dotación para este residente"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-[#B3803F]" />
                  <span className="hidden sm:inline">Solicitar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEditResident(res)}
                  className="py-2 px-3 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DCB87F]"
                  title="Editar información del residente"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
