import React, { useState } from 'react';
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
  Edit3
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarUtils';

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

  const filtered = trabajadores.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const cleanQ = q.replace(/[.,]/g, '');
      const match =
        t.nombreCompleto.toLowerCase().includes(q) ||
        t.identificacion.includes(cleanQ) ||
        t.cargo.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q);
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

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-[#DEDBD1]">
        <span className="text-xs font-bold text-[#182F28] font-mono">FILTRAR ÁREA:</span>
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none"
        >
          <option value="TODAS">Todas las Áreas</option>
          <option value="Enfermería">Enfermería</option>
          <option value="Cuidado Asistencial">Cuidado Asistencial</option>
          <option value="Medicina / Especialistas">Medicina / Especialistas</option>
          <option value="Nutrición / Cocina">Nutrición / Cocina</option>
          <option value="Servicios Generales">Servicios Generales</option>
          <option value="Administrativo">Administrativo</option>
        </select>

        <span className="text-xs font-bold text-[#182F28] font-mono ml-2">ESTADO:</span>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none"
        >
          <option value="TODOS">Todos los Estados</option>
          <option value="Activo">Activos</option>
          <option value="En Permiso">En Permiso / Baja</option>
          <option value="Inactivo">Inactivos</option>
        </select>

        <span className="ml-auto text-xs text-[#7A745F] font-mono">
          {filtered.length} trabajador(es) encontrado(s)
        </span>
      </div>

      {/* Grid de Trabajadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((worker) => (
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
