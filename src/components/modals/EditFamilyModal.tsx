import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { X, Save, HeartHandshake, Phone, Mail, MapPin, Trash2, Camera, Star } from 'lucide-react';
import { FamiliarAcudiente } from '../../types';
import { limpiarIdentificacion } from '../../utils/formatters';

export const EditFamilyModal: React.FC = () => {
  const {
    editingFamiliar,
    setEditingFamiliar,
    isEditFamiliarOpen,
    setIsEditFamiliarOpen,
    actualizarFamiliar,
    eliminarFamiliar,
    showConfirm,
    showAlert
  } = useAdmin();

  const [formData, setFormData] = useState<Partial<FamiliarAcudiente>>({});
  const [esPrincipal, setEsPrincipal] = useState<boolean>(true);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (editingFamiliar) {
      setFormData({
        nombres: editingFamiliar.nombres,
        apellidos: editingFamiliar.apellidos,
        tipoIdentificacion: editingFamiliar.tipoIdentificacion,
        identificacion: limpiarIdentificacion(editingFamiliar.identificacion),
        telefonoPrincipal: editingFamiliar.telefonoPrincipal,
        telefonoSecundario: editingFamiliar.telefonoSecundario || '',
        email: editingFamiliar.email,
        direccion: editingFamiliar.direccion || '',
        ciudad: editingFamiliar.ciudad || 'Bogotá D.C.',
        canalNotificacionPref: editingFamiliar.canalNotificacionPref,
        fotoUrl: editingFamiliar.fotoUrl
      });
      const isMain = editingFamiliar.residentesAsociados?.[0]?.esPrincipal ?? true;
      setEsPrincipal(isMain);
      setFotoPreview(editingFamiliar.fotoUrl);
    }
  }, [editingFamiliar]);

  if (!isEditFamiliarOpen || !editingFamiliar) return null;

  const handleClose = () => {
    setIsEditFamiliarOpen(false);
    setEditingFamiliar(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFotoPreview(base64);
        setFormData((prev) => ({ ...prev, fotoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFotoPreview(undefined);
    setFormData((prev) => ({ ...prev, fotoUrl: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres?.trim() || !formData.apellidos?.trim() || !formData.identificacion?.trim() || !formData.telefonoPrincipal?.trim() || !formData.email?.trim()) {
      showAlert('Por favor complete los campos obligatorios: nombres, apellidos, identificación, teléfono y correo electrónico.', 'Campos Requeridos', 'warning');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showAlert('Por favor ingrese un correo electrónico válido (ej. nombre@dominio.com).', 'Correo Inválido', 'warning');
      return;
    }

    setLoading(true);
    try {
      await actualizarFamiliar(editingFamiliar.id, {
        ...formData,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        identificacion: limpiarIdentificacion(formData.identificacion).trim(),
        telefonoPrincipal: formData.telefonoPrincipal.trim(),
        telefonoSecundario: formData.telefonoSecundario?.trim(),
        email: formData.email.trim(),
        fotoUrl: fotoPreview,
        esPrincipal
      });
      handleClose();
    } catch (err: any) {
      console.error(err);
      showAlert(`Error al actualizar el familiar:\n${err.message || 'Error en la base de datos'}`, 'Error en Base de Datos', 'alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = await showConfirm({
      title: 'Eliminar Familiar / Acudiente',
      message: `¿Está seguro de eliminar al familiar/acudiente ${editingFamiliar.nombreCompleto}?\n\nEsta acción lo desvinculará de los residentes asociados y lo removerá del directorio institucional.`,
      type: 'danger',
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar'
    });
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await eliminarFamiliar(editingFamiliar.id);
      handleClose();
    } catch (err: any) {
      console.error(err);
      showAlert(`Error al eliminar el familiar:\n${err?.message || 'Error en el servidor'}`, 'Error al Eliminar', 'alert');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B3803F]/30 flex items-center justify-center text-[#DCB87F]">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Editar Información del Familiar / Acudiente
              </h3>
              <p className="text-xs text-[#DCB87F]">
                {editingFamiliar.nombreCompleto} • {editingFamiliar.tipoIdentificacion} {editingFamiliar.identificacion}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Foto del Familiar (Opcional) */}
          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] flex items-center gap-4">
            <div className="relative">
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt={editingFamiliar.nombreCompleto}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#B3803F] shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#E8E4D9] flex items-center justify-center text-[#7A745F] border border-[#DEDBD1]">
                  <Camera className="w-7 h-7 text-[#9A917A]" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Foto del Familiar / Acudiente <span className="text-[#7A745F] font-normal">(Opcional)</span>
              </label>
              <p className="text-[11px] text-[#7A745F] mb-2">
                Suba una foto clara en formato JPG o PNG para identificación rápida.
              </p>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-white hover:bg-[#ECE7DB] border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                  <Camera className="w-3.5 h-3.5 text-[#B3803F]" />
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
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 text-xs text-[#A4453A] hover:bg-[#FBE8E6] rounded-xl transition-colors cursor-pointer"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Indicador de Principal */}
          <div className="p-3.5 bg-[#FEF7EE] rounded-2xl border border-[#DCB87F] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Star className={`w-5 h-5 ${esPrincipal ? 'text-[#B3803F] fill-[#B3803F]' : 'text-[#9A917A]'}`} />
              <div>
                <div className="text-xs font-bold text-[#182F28]">Contacto / Acudiente Principal</div>
                <div className="text-[11px] text-[#7A745F]">
                  Receptor prioritario de novedades médicas, autorizaciones y pagos
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={esPrincipal}
                onChange={(e) => setEsPrincipal(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#DEDBD1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#274A3F]"></div>
            </label>
          </div>

          {/* 1. Nombres y Documento */}
          <div>
            <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-[#B3803F]" />
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
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
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
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
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
                  Número Identificación *
                </label>
                <input
                  type="text"
                  required
                  value={formData.identificacion || ''}
                  onChange={(e) => setFormData({ ...formData, identificacion: limpiarIdentificacion(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>
            </div>
          </div>

          {/* 2. Canales de Contacto */}
          <div className="pt-4 border-t border-[#DEDBD1]">
            <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#B3803F]" />
              2. Canales de Contacto y Notificación
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Teléfono Principal (Móvil/WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefonoPrincipal || ''}
                  onChange={(e) => setFormData({ ...formData, telefonoPrincipal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Teléfono Secundario
                </label>
                <input
                  type="tel"
                  value={formData.telefonoSecundario || ''}
                  onChange={(e) => setFormData({ ...formData, telefonoSecundario: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4B4636] mb-1 flex items-center justify-between">
                  <span>Correo Electrónico *</span>
                  <span className="text-[10px] text-[#B3803F] font-semibold">Obligatorio</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold text-[#182F28] focus:outline-none ${
                    !formData.email?.trim()
                      ? 'border-amber-300 bg-amber-50/20 focus:border-[#B3803F]'
                      : 'border-[#DEDBD1] bg-[#F7F6F2] focus:border-[#B3803F]'
                  }`}
                />
                <span className="text-[10px] text-[#5C6058] mt-0.5 block">
                  Requerido por base de datos para la cuenta y notificaciones del familiar.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Canal Preferido de Notificación
                </label>
                <select
                  value={formData.canalNotificacionPref || 'WhatsApp'}
                  onChange={(e) => setFormData({ ...formData, canalNotificacionPref: e.target.value as 'WhatsApp' | 'Correo' | 'Push App' | 'Llamada' })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="WhatsApp">WhatsApp (Reportes y Signos)</option>
                  <option value="Correo">Correo Electrónico</option>
                  <option value="Push App">Notificación App Móvil</option>
                  <option value="Llamada">Llamada Telefónica</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Domicilio */}
          <div className="pt-4 border-t border-[#DEDBD1]">
            <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#B3803F]" />
              3. Dirección de Residencia
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.ciudad || ''}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer de Acciones con Botón de Eliminar */}
          <div className="pt-4 border-t border-[#DEDBD1] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FBE8E6] hover:bg-[#f8d2ce] text-[#A4453A] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#E9A8A0] disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Eliminando...' : 'Eliminar Familiar'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-[#7A745F] hover:text-[#182F28] rounded-xl cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || deleting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
