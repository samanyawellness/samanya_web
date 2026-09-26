import React, { useState } from 'react';
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
  Edit3
} from 'lucide-react';

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

  const filtered = familiares.filter((f) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const cleanQ = q.replace(/[.,]/g, '');
      const match =
        f.nombreCompleto.toLowerCase().includes(q) ||
        f.identificacion.includes(cleanQ) ||
        f.telefonoPrincipal.includes(q) ||
        f.residentesAsociados.some((r) => r.nombreResidente.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filterCanal !== 'TODOS' && f.canalNotificacionPref !== filterCanal) {
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

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-[#DEDBD1]">
        <span className="text-xs font-bold text-[#182F28] font-mono">CANAL PREFERIDO:</span>
        <select
          value={filterCanal}
          onChange={(e) => setFilterCanal(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none"
        >
          <option value="TODOS">Todos los Canales</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Correo">Correo</option>
          <option value="Push App">Notificación App</option>
          <option value="Llamada">Llamada</option>
        </select>

        <span className="ml-auto text-xs text-[#7A745F] font-mono">
          Total {filtered.length} acudiente(s) registrados
        </span>
      </div>

      {/* Grid de Familiares */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((fam) => (
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
