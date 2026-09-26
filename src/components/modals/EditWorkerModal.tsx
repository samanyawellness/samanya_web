import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { X, Save, UserCheck, Briefcase, Phone, Mail, Shield, Camera } from 'lucide-react';
import { TrabajadorEmpleado } from '../../types';
import { subirFotoTalentoHumano } from '../../services/driveService';
import { resolverAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarUtils';
import { limpiarIdentificacion } from '../../utils/formatters';

export const EditWorkerModal: React.FC = () => {
  const {
    editingTrabajador,
    setEditingTrabajador,
    isEditTrabajadorOpen,
    setIsEditTrabajadorOpen,
    actualizarTrabajador,
    activeSede,
    showToast
  } = useAdmin();

  const [formData, setFormData] = useState<Partial<TrabajadorEmpleado>>({});
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTrabajador) {
      setFormData({
        nombres: editingTrabajador.nombres,
        apellidos: editingTrabajador.apellidos,
        tipoIdentificacion: editingTrabajador.tipoIdentificacion,
        identificacion: limpiarIdentificacion(editingTrabajador.identificacion),
        cargo: editingTrabajador.cargo,
        area: editingTrabajador.area,
        unidadAsignada: editingTrabajador.unidadAsignada || '',
        telefono: editingTrabajador.telefono,
        email: editingTrabajador.email,
        tipoContrato: editingTrabajador.tipoContrato,
        eps: editingTrabajador.eps,
        arl: editingTrabajador.arl,
        turnoHabitual: editingTrabajador.turnoHabitual || 'Rotativo',
        estado: editingTrabajador.estado,
        avatarUrl: editingTrabajador.avatarUrl
      });
      setFotoPreview(editingTrabajador.avatarUrl);
      setSelectedFile(null);
    }
  }, [editingTrabajador]);

  if (!isEditTrabajadorOpen || !editingTrabajador) return null;

  const handleClose = () => {
    setIsEditTrabajadorOpen(false);
    setEditingTrabajador(null);
    setSelectedFile(null);
  };

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
    setLoading(true);
    try {
      let avatarFinalUrl = fotoPreview;

      let idArchivoFotoPerfilFinal: number | undefined = editingTrabajador.idArchivoFotoPerfil;

      // Si se cargó un archivo físico, ejecutar el flujo Google Drive + PKGLN_ARCHIVOS
      if (selectedFile) {
        try {
          const uploadRes = await subirFotoTalentoHumano({
            file: selectedFile,
            idUsuario: editingTrabajador.id,
            idEmpleado: editingTrabajador.id,
            identificacion: limpiarIdentificacion(formData.identificacion || editingTrabajador.identificacion),
            idCentro: editingTrabajador.idCentro || activeSede.id,
            nombreSede: activeSede?.nombre || 'Sede Central Bogotá',
            nombreCompleto: `${formData.nombres || editingTrabajador.nombres} ${formData.apellidos || editingTrabajador.apellidos}`.trim()
          });
          if (uploadRes.avatarUrl) {
            avatarFinalUrl = uploadRes.avatarUrl;
            idArchivoFotoPerfilFinal = uploadRes.idArchivo;
            showToast('Fotografía almacenada en Google Drive y registrada en Oracle exitosamente', 'success');
          }
        } catch (uploadErr: any) {
          console.error('Carga a Google Drive / PKGLN_ARCHIVOS falló:', uploadErr);
          showToast(`Error al subir fotografía a Drive/Oracle: ${uploadErr.message || uploadErr}`, 'alert');
          throw uploadErr;
        }
      }

      await actualizarTrabajador(editingTrabajador.id, {
        ...formData,
        identificacion: limpiarIdentificacion(formData.identificacion || editingTrabajador.identificacion),
        avatarUrl: avatarFinalUrl,
        idArchivoFotoPerfil: idArchivoFotoPerfilFinal
      });
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#274A3F] flex items-center justify-center text-[#DFF3E7]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Editar Información del Colaborador
              </h3>
              <p className="text-xs text-[#DCB87F]">
                {editingTrabajador.cargo} • {editingTrabajador.nombreCompleto}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Foto del Trabajador (Opcional) */}
          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] flex items-center gap-4">
            <div className="relative">
              {fotoPreview ? (
                <img
                  src={resolverAvatarUrl(fotoPreview)}
                  alt={editingTrabajador.nombreCompleto}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#274A3F] shadow-xs"
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
                Actualice la foto de perfil para el carné institucional y asignación de turnos.
              </p>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-white hover:bg-[#ECE7DB] border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                  <Camera className="w-3.5 h-3.5 text-[#274A3F]" />
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

          {/* 1. Datos Personales */}
          <div>
            <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#274A3F]" />
              1. Identificación y Nombres
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombres || ''}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#274A3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellidos || ''}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#274A3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Tipo Doc
                </label>
                <select
                  value={formData.tipoIdentificacion || 'CC'}
                  onChange={(e) => setFormData({ ...formData, tipoIdentificacion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="CC">CC - Cédula de Ciudadanía</option>
                  <option value="CE">CE - Cédula de Extranjería</option>
                  <option value="PAS">PAS - Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Número de Identificación *
                </label>
                <input
                  type="text"
                  required
                  value={formData.identificacion || ''}
                  onChange={(e) => setFormData({ ...formData, identificacion: limpiarIdentificacion(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#274A3F]"
                />
              </div>
            </div>
          </div>

          {/* 2. Rol y Operación */}
          <div className="pt-4 border-t border-[#DEDBD1]">
            <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#274A3F]" />
              2. Asignación Operativa y Cargo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Cargo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cargo || ''}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#274A3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Área Asistencial / Operativa *
                </label>
                <select
                  value={formData.area || 'Enfermería'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      area: e.target.value as
                        | 'Enfermería'
                        | 'Cuidado Asistencial'
                        | 'Medicina / Especialistas'
                        | 'Nutrición / Cocina'
                        | 'Servicios Generales'
                        | 'Administrativo'
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="Enfermería">Enfermería</option>
                  <option value="Cuidado Asistencial">Cuidado Asistencial</option>
                  <option value="Medicina / Especialistas">Medicina / Especialistas</option>
                  <option value="Nutrición / Cocina">Nutrición / Cocina</option>
                  <option value="Servicios Generales">Servicios Generales</option>
                  <option value="Administrativo">Administrativo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Unidad / Piso Asignado
                </label>
                <input
                  type="text"
                  value={formData.unidadAsignada || ''}
                  onChange={(e) => setFormData({ ...formData, unidadAsignada: e.target.value })}
                  placeholder="Ej. Piso 1, Torre A"
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#274A3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Estado del Trabajador
                </label>
                <select
                  value={formData.estado || 'Activo'}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'Activo' | 'En Permiso' | 'Inactivo' })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="Activo">Activo</option>
                  <option value="En Permiso">En Permiso</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Tipo de Contrato
                </label>
                <select
                  value={formData.tipoContrato || 'Término Indefinido'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipoContrato: e.target.value as
                        | 'Término Indefinido'
                        | 'Término Fijo'
                        | 'Prestación de Servicios'
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="Término Indefinido">Término Indefinido</option>
                  <option value="Término Fijo">Término Fijo</option>
                  <option value="Prestación de Servicios">Prestación de Servicios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Turno Habitual
                </label>
                <select
                  value={formData.turnoHabitual || 'Rotativo'}
                  onChange={(e) => setFormData({ ...formData, turnoHabitual: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="Mañana (06:00 - 14:00)">Mañana (06:00 - 14:00)</option>
                  <option value="Tarde (14:00 - 22:00)">Tarde (14:00 - 22:00)</option>
                  <option value="Noche (22:00 - 06:00)">Noche (22:00 - 06:00)</option>
                  <option value="Diurno Administrativo">Diurno Administrativo</option>
                  <option value="Rotativo">Rotativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Contacto y Afiliaciones */}
          <div className="pt-4 border-t border-[#DEDBD1]">
            <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#274A3F]" />
              3. Contacto y Seguridad Social
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Teléfono Móvil *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#274A3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#274A3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  EPS
                </label>
                <input
                  type="text"
                  value={formData.eps || ''}
                  onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  ARL
                </label>
                <input
                  type="text"
                  value={formData.arl || ''}
                  onChange={(e) => setFormData({ ...formData, arl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-[#DEDBD1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold text-[#7A745F] hover:text-[#182F28] rounded-xl cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
