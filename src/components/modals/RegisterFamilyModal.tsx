import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { X, HeartHandshake, MapPin, Camera, Star } from 'lucide-react';
import { limpiarIdentificacion } from '../../utils/formatters';

export const RegisterFamilyModal: React.FC = () => {
  const { isRegisterFamilyOpen, setIsRegisterFamilyOpen, registrarFamiliar, residentes, activeSede } = useAdmin();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);

  // Form State
  const [formData, setFormData] = useState({
    tipoIdentificacion: 'CC',
    identificacion: '',
    nombres: '',
    apellidos: '',
    telefonoPrincipal: '',
    telefonoSecundario: '',
    email: '',
    direccion: '',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'WhatsApp' as const,
    idResidenteVinculado: residentes[0]?.id || 0,
    parentesco: 'Hijo/a',
    esPrincipal: true,
    autorizadoSalidas: true,
    responsablePago: true
  });

  if (!isRegisterFamilyOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFotoPreview(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres?.trim() || !formData.apellidos?.trim() || !formData.telefonoPrincipal?.trim() || !formData.email?.trim()) {
      alert('Por favor complete los campos obligatorios del familiar: nombres, apellidos, teléfono y correo electrónico.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert('Por favor ingrese un correo electrónico válido (ej. nombre@dominio.com).');
      return;
    }

    setIsSubmitting(true);
    try {
      await registrarFamiliar({
        tipoIdentificacion: formData.tipoIdentificacion,
        identificacion: limpiarIdentificacion(formData.identificacion).trim(),
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        telefonoPrincipal: formData.telefonoPrincipal.trim(),
        telefonoSecundario: formData.telefonoSecundario?.trim(),
        email: formData.email.trim(),
        direccion: formData.direccion || activeSede.direccion,
        ciudad: formData.ciudad || activeSede.ciudad,
        canalNotificacionPref: formData.canalNotificacionPref,
        idResidenteVinculado: formData.idResidenteVinculado && Number(formData.idResidenteVinculado) > 0 ? Number(formData.idResidenteVinculado) : undefined,
        parentesco: formData.parentesco,
        esPrincipal: formData.esPrincipal,
        fotoUrl: fotoPreview,
        residentesAsociados: []
      });

      setIsRegisterFamilyOpen(false);
      setFormData({
        tipoIdentificacion: 'CC',
        identificacion: '',
        nombres: '',
        apellidos: '',
        telefonoPrincipal: '',
        telefonoSecundario: '',
        email: '',
        direccion: '',
        ciudad: 'Bogotá D.C.',
        canalNotificacionPref: 'WhatsApp',
        idResidenteVinculado: residentes[0]?.id || 0,
        parentesco: 'Hijo/a',
        esPrincipal: true,
        autorizadoSalidas: true,
        responsablePago: true
      });
      setFotoPreview(undefined);
    } catch (err: any) {
      console.warn('[RegisterFamilyModal] No se pudo completar el registro del familiar:', err);
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
            <div className="w-10 h-10 rounded-xl bg-[#B3803F]/20 flex items-center justify-center text-[#DCB87F] border border-[#DCB87F]/30">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Registrar Familiar / Acudiente
              </h3>
              <p className="text-xs text-[#DCB87F]">
                Vinculación de contacto responsable y apoderado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRegisterFamilyOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          data-lpignore="true"
          data-form-type="other"
          className="p-6 overflow-y-auto flex-1 space-y-4"
        >
          {/* Foto del Familiar (Opcional) */}
          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] flex items-center gap-4">
            <div className="relative">
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Vista previa"
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
                Suba una foto clara para facilitar la identificación y seguridad en recepción.
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

          {/* 1. Nombres y Documento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Nombres *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Mauricio Andrés"
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
                placeholder="Ej. Restrepo Gómez"
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
                Documento de Identidad
              </label>
              <input
                type="text"
                placeholder="Ej. 79345889"
                value={formData.identificacion}
                onChange={(e) => setFormData({ ...formData, identificacion: limpiarIdentificacion(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
              />
            </div>
          </div>

          {/* 2. Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Teléfono Principal / WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="315 678 1234"
                value={formData.telefonoPrincipal}
                onChange={(e) => setFormData({ ...formData, telefonoPrincipal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Teléfono Secundario
              </label>
              <input
                type="text"
                placeholder="601 345 6789"
                value={formData.telefonoSecundario}
                onChange={(e) => setFormData({ ...formData, telefonoSecundario: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1 flex items-center justify-between">
              <span>Correo Electrónico *</span>
              <span className="text-[10px] text-[#B3803F] font-semibold">Obligatorio</span>
            </label>
            <input
              type="email"
              required
              placeholder="contacto@correo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
                !formData.email?.trim()
                  ? 'border-amber-300 bg-amber-50/20 focus:border-[#B3803F]'
                  : 'border-[#DEDBD1] bg-[#F7F6F2] focus:border-[#B3803F] focus:bg-white'
              }`}
            />
            <span className="text-[10px] text-[#5C6058] mt-1 block">
              Obligatorio por base de datos para la cuenta y notificaciones del familiar.
            </span>
          </div>

          {/* 3. Dirección de Residencia */}
          <div className="p-4 bg-[#F7F6F2] border border-[#DEDBD1] rounded-2xl space-y-3">
            <div className="text-xs font-mono font-bold text-[#182F28] uppercase flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#B3803F]" />
              Dirección de Residencia
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Ej. Calle 127 # 19-45 Apto 302"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-sm focus:outline-none focus:border-[#B3803F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  placeholder="Bogotá D.C."
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-sm focus:outline-none focus:border-[#B3803F]"
                />
              </div>
            </div>
          </div>

          {/* 4. Vinculación y Contacto Principal */}
          <div className="p-4 bg-[#F7F6F2] border border-[#DEDBD1] rounded-2xl space-y-3">
            <div className="text-xs font-mono font-bold text-[#182F28] uppercase">
              Vinculación a Residente y Rol
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Residente Vinculado *
                </label>
                <select
                  value={formData.idResidenteVinculado}
                  onChange={(e) => setFormData({ ...formData, idResidenteVinculado: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-white text-sm focus:outline-none focus:border-[#B3803F]"
                >
                  <option value={0}>Seleccione un residente...</option>
                  {residentes.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.nombreCompleto} (Hab. {res.habitacion})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Parentesco / Relación
                </label>
                <select
                  value={formData.parentesco}
                  onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-white text-sm focus:outline-none focus:border-[#B3803F]"
                >
                  <option value="Hijo/a">Hijo / Hija</option>
                  <option value="Cónyuge">Cónyuge / Pareja</option>
                  <option value="Hermano/a">Hermano / Hermana</option>
                  <option value="Nieto/a">Nieto / Nieta</option>
                  <option value="Sobrino/a">Sobrino / Sobrina</option>
                  <option value="Tutor / Apoderado">Tutor / Apoderado Legal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Canal de Notificación Preferido
                </label>
                <select
                  value={formData.canalNotificacionPref}
                  onChange={(e) => setFormData({ ...formData, canalNotificacionPref: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-white text-sm focus:outline-none focus:border-[#B3803F]"
                >
                  <option value="WhatsApp">WhatsApp (Inmediato)</option>
                  <option value="Correo">Correo Electrónico</option>
                  <option value="Push App">Notificación Móvil</option>
                  <option value="Llamada">Llamada Telefónica</option>
                </select>
              </div>

              {/* Indicador de Contacto Principal */}
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2.5 text-xs font-bold text-[#182F28] cursor-pointer bg-white px-3 py-2 rounded-xl border border-[#DEDBD1] w-full">
                  <input
                    type="checkbox"
                    checked={formData.esPrincipal}
                    onChange={(e) => setFormData({ ...formData, esPrincipal: e.target.checked })}
                    className="w-4 h-4 accent-[#274A3F] rounded"
                  />
                  <Star className={`w-4 h-4 ${formData.esPrincipal ? 'text-[#B3803F] fill-[#B3803F]' : 'text-[#9A917A]'}`} />
                  <span>Contacto / Acudiente Principal</span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2 border-t border-[#DEDBD1]/60">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#182F28] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autorizadoSalidas}
                  onChange={(e) => setFormData({ ...formData, autorizadoSalidas: e.target.checked })}
                  className="w-4 h-4 accent-[#274A3F] rounded"
                />
                <span>Autorizado para retirar al residente</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#182F28] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.responsablePago}
                  onChange={(e) => setFormData({ ...formData, responsablePago: e.target.checked })}
                  className="w-4 h-4 accent-[#274A3F] rounded"
                />
                <span>Responsable de pagos/facturación</span>
              </label>
            </div>
          </div>

          {/* Footer Modal */}
          <div className="pt-4 border-t border-[#DEDBD1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRegisterFamilyOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#5C6058] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Registrar Familiar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
