import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { X, UserCheck, Briefcase, Camera } from 'lucide-react';
import { subirFotoTalentoHumano } from '../../services/driveService';
import { limpiarIdentificacion } from '../../utils/formatters';

export const RegisterWorkerModal: React.FC = () => {
  const { isRegisterWorkerOpen, setIsRegisterWorkerOpen, registrarTrabajador, activeSede } = useAdmin();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tipoIdentificacion: 'CC',
    identificacion: '',
    nombres: '',
    apellidos: '',
    cargo: 'Cuidador(a) Gerontológico',
    area: 'Cuidado Asistencial' as const,
    unidadAsignada: 'Piso 1',
    telefono: '',
    email: '',
    tipoContrato: 'Término Indefinido' as const,
    eps: 'Sanitas EPS',
    arl: 'Sura ARL',
    estado: 'Activo' as const,
    turnoHabitual: 'Mañana (07:00 - 15:00)'
  });

  if (!isRegisterWorkerOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres || !formData.apellidos || !formData.identificacion || !formData.telefono) {
      alert('Por favor complete los campos obligatorios del trabajador.');
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarFinalUrl = fotoPreview || `https://images.unsplash.com/photo-1594824813590-7815d9b68c2d?w=150&auto=format&fit=crop&q=80`;
      let idArchivoFotoPerfilFinal: number | undefined = undefined;

      // Si se seleccionó archivo físico, ejecutar flujo Google Drive y PKGLN_ARCHIVOS
      if (selectedFile) {
        try {
          const uploadRes = await subirFotoTalentoHumano({
            file: selectedFile,
            idUsuario: Math.floor(Math.random() * 9000) + 1000,
            identificacion: limpiarIdentificacion(formData.identificacion),
            idCentro: activeSede.id,
            nombreSede: activeSede?.nombre || 'Sede Central Bogotá',
            nombreCompleto: `${formData.nombres} ${formData.apellidos}`.trim()
          });
          if (uploadRes.avatarUrl) {
            avatarFinalUrl = uploadRes.avatarUrl;
            idArchivoFotoPerfilFinal = uploadRes.idArchivo;
          }
        } catch (uploadErr) {
          console.warn('Carga a Google Drive / PKGLN_ARCHIVOS en modo local:', uploadErr);
        }
      }

      await registrarTrabajador({
        idCentro: activeSede.id,
        tipoIdentificacion: formData.tipoIdentificacion,
        identificacion: limpiarIdentificacion(formData.identificacion),
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        cargo: formData.cargo,
        area: formData.area,
        unidadAsignada: formData.unidadAsignada,
        telefono: formData.telefono,
        email: formData.email,
        tipoContrato: formData.tipoContrato,
        eps: formData.eps,
        arl: formData.arl,
        estado: formData.estado,
        turnoHabitual: formData.turnoHabitual,
        avatarUrl: avatarFinalUrl,
        idArchivoFotoPerfil: idArchivoFotoPerfilFinal
      });

      setIsRegisterWorkerOpen(false);
      setFotoPreview(undefined);
      setSelectedFile(null);
      setFormData({
        tipoIdentificacion: 'CC',
        identificacion: '',
        nombres: '',
        apellidos: '',
        cargo: 'Cuidador(a) Gerontológico',
        area: 'Cuidado Asistencial',
        unidadAsignada: 'Piso 1',
        telefono: '',
        email: '',
        tipoContrato: 'Término Indefinido',
        eps: 'Sanitas EPS',
        arl: 'Sura ARL',
        estado: 'Activo',
        turnoHabitual: 'Mañana (07:00 - 15:00)'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7A4F9E]/25 flex items-center justify-center text-[#DCB87F] border border-[#DCB87F]/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Registrar Colaborador / Trabajador
              </h3>
              <p className="text-xs text-[#DCB87F]">
                Vinculación al talento humano de {activeSede.nombre}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRegisterWorkerOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Foto del Trabajador (Opcional) */}
          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] flex items-center gap-4">
            <div className="relative">
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Vista previa colaborador"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#7A4F9E] shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#E8E4D9] flex items-center justify-center text-[#7A745F] border border-[#DEDBD1]">
                  <Camera className="w-7 h-7 text-[#9A917A]" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Foto del Colaborador <span className="text-[#7A745F] font-normal">(Opcional)</span>
              </label>
              <p className="text-[11px] text-[#7A745F] mb-2">
                Foto para el carné institucional y panel de turnos asistenciales.
              </p>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-white hover:bg-[#ECE7DB] border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                  <Camera className="w-3.5 h-3.5 text-[#7A4F9E]" />
                  <span>{fotoPreview ? 'Cambiar Foto' : 'Seleccionar Archivo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {fotoPreview && (
                  <button
                    type="button"
                    onClick={() => setFotoPreview(undefined)}
                    className="px-2.5 py-1.5 text-xs text-[#A4453A] hover:bg-[#FBE8E6] rounded-xl transition-colors cursor-pointer"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Nombres *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Sandra Milena"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Torres Beltrán"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Tipo Doc.
              </label>
              <select
                value={formData.tipoIdentificacion}
                onChange={(e) => setFormData({ ...formData, tipoIdentificacion: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
              >
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="PA">Pasaporte</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Número de Identificación *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 1020789456"
                value={formData.identificacion}
                onChange={(e) => setFormData({ ...formData, identificacion: limpiarIdentificacion(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Área Operativa *
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
              >
                <option value="Enfermería">Enfermería (Jefes y Auxiliares)</option>
                <option value="Cuidado Asistencial">Cuidado Asistencial / Cuidadores</option>
                <option value="Medicina / Especialistas">Medicina / Especialistas</option>
                <option value="Nutrición / Cocina">Nutrición / Cocina</option>
                <option value="Servicios Generales">Servicios Generales / Mantenimiento</option>
                <option value="Administrativo">Coordinación Administrativa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Cargo Específico *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Auxiliar de Enfermería"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Teléfono de Contacto *
              </label>
              <input
                type="text"
                required
                placeholder="311 234 5678"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Correo Corporativo / Personal
              </label>
              <input
                type="email"
                placeholder="colaborador@samanyacare.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Tipo Contrato
              </label>
              <select
                value={formData.tipoContrato}
                onChange={(e) => setFormData({ ...formData, tipoContrato: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
              >
                <option value="Término Indefinido">Indefinido</option>
                <option value="Término Fijo">Término Fijo</option>
                <option value="Prestación de Servicios">Prestación Serv.</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                EPS
              </label>
              <input
                type="text"
                placeholder="Sanitas, Sura..."
                value={formData.eps}
                onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                ARL
              </label>
              <input
                type="text"
                placeholder="Sura, Positiva..."
                value={formData.arl}
                onChange={(e) => setFormData({ ...formData, arl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">
              Turno Habitual Asignado
            </label>
            <select
              value={formData.turnoHabitual}
              onChange={(e) => setFormData({ ...formData, turnoHabitual: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
            >
              <option value="Mañana (07:00 - 15:00)">Mañana (07:00 - 15:00)</option>
              <option value="Tarde (14:00 - 22:00)">Tarde (14:00 - 22:00)</option>
              <option value="Noche (21:00 - 07:00)">Noche (21:00 - 07:00)</option>
              <option value="Jornada Completa Diurna (08:00 - 17:00)">Jornada Completa Diurna</option>
            </select>
          </div>

          {/* Footer Modal */}
          <div className="pt-4 border-t border-[#DEDBD1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRegisterWorkerOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#5C6058] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Registrar Colaborador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
