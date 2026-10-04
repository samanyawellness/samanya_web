import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { X, Save, Building2, Bed, MapPin, Phone, AlertCircle, Boxes, CheckCircle2, DollarSign } from 'lucide-react';

export const EditSedeModal: React.FC = () => {
  const {
    activeSede,
    isEditSedeOpen,
    setIsEditSedeOpen,
    actualizarSede,
    residentes
  } = useAdmin();

  const [formData, setFormData] = useState({
    nombre: '',
    capacidadTotal: 40,
    direccion: '',
    ciudad: '',
    telefono: '',
    manejaInventario: true,
    manejaCostosInventario: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Residentes activos en esta sede
  const residentesEnSede = residentes.filter(
    (r) => r.idCentro === activeSede?.id && r.estado === 'Activo'
  ).length;

  useEffect(() => {
    if (activeSede) {
      setFormData({
        nombre: activeSede.nombre,
        capacidadTotal: activeSede.capacidadTotal,
        direccion: activeSede.direccion,
        ciudad: activeSede.ciudad,
        telefono: activeSede.telefono,
        manejaInventario: activeSede.manejaInventario !== false,
        manejaCostosInventario: activeSede.manejaCostosInventario !== false
      });
      setError(null);
    }
  }, [activeSede, isEditSedeOpen]);

  if (!isEditSedeOpen || !activeSede) return null;

  const handleClose = () => {
    setIsEditSedeOpen(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const capacidad = Number(formData.capacidadTotal);
    if (isNaN(capacidad) || capacidad <= 0) {
      setError('La capacidad de camas debe ser un número entero mayor a cero.');
      return;
    }

    if (capacidad < residentesEnSede) {
      setError(
        `La sede cuenta con ${residentesEnSede} residentes activos actualmente. El número de camas no puede ser inferior a la ocupación actual.`
      );
      return;
    }

    setLoading(true);
    try {
      await actualizarSede(activeSede.id, {
        nombre: formData.nombre.trim(),
        capacidadTotal: capacidad,
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        telefono: formData.telefono.trim(),
        manejaInventario: formData.manejaInventario,
        manejaCostosInventario: formData.manejaCostosInventario
      });
      handleClose();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al actualizar la sede. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B3803F]/30 flex items-center justify-center text-[#DCB87F]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Editar Capacidad de Camas y Sede
              </h3>
              <p className="text-xs text-[#DCB87F]">
                {activeSede.codigo} • {activeSede.nombre}
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
          {error && (
            <div className="p-3 bg-[#FBE8E6] border border-[#E9A8A0] text-[#A4453A] rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ocupación actual info */}
          <div className="p-4 bg-[#FEF7EE] rounded-2xl border border-[#DCB87F] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#B3803F]/20 flex items-center justify-center text-[#9A5B12]">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#182F28]">Ocupación Actual de la Sede</div>
                <div className="text-[11px] text-[#7A745F]">
                  {residentesEnSede} camas ocupadas por residentes activos
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-serif text-[#182F28]">{residentesEnSede}</span>
              <span className="text-xs text-[#7A745F]"> / {formData.capacidadTotal}</span>
            </div>
          </div>

          {/* Campo Principal: Capacidad Total de Camas */}
          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1]">
            <label className="block text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#B3803F]" />
              Número Total de Camas Habilitadas *
            </label>
            <p className="text-[11px] text-[#7A745F] mb-3">
              Modifique el aforo institucional y la capacidad instalada para admisiones y cálculo de porcentajes de ocupación.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={residentesEnSede || 1}
                max={500}
                required
                value={formData.capacidadTotal}
                onChange={(e) => setFormData({ ...formData, capacidadTotal: Number(e.target.value) })}
                className="w-36 px-4 py-2.5 rounded-xl border border-[#DEDBD1] bg-white text-base font-bold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
              <span className="text-xs font-semibold text-[#5C6058]">
                camas censables totales
              </span>
            </div>
          </div>

          {/* Datos Generales de la Sede */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#B3803F]" />
              Información de la Sede
            </h4>

            <div>
              <label className="block text-xs font-bold text-[#4B4636] mb-1">
                Nombre de la Sede *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4B4636] mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#B3803F]" />
                  Dirección
                </label>
                <input
                  type="text"
                  required
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  required
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B4636] mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#B3803F]" />
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
            </div>
          </div>

          {/* Módulos Opcionales / Feature Flags */}
          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  formData.manejaInventario ? 'bg-[#182F28] text-[#DCB87F]' : 'bg-[#E5E0D8] text-[#7A745F]'
                }`}>
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#182F28]">
                    Módulo de Inventario y Almacén
                  </h4>
                  <p className="text-[11px] text-[#7A745F]">
                    {formData.manejaInventario
                      ? 'Habilitado: El módulo de inventario y existencias de almacén estará disponible para esta sede.'
                      : 'Deshabilitado: El menú y operaciones de inventario estarán completamente ocultos.'}
                  </p>
                </div>
              </div>

              {/* Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={formData.manejaInventario}
                onClick={() => setFormData(prev => ({ ...prev, manejaInventario: !prev.manejaInventario }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.manejaInventario ? 'bg-[#182F28]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    formData.manejaInventario ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sub-parámetro: Manejo de Costos y Precios vs Solo Cantidades */}
            {formData.manejaInventario && (
              <div className="pt-3 border-t border-[#DEDBD1] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    formData.manejaCostosInventario ? 'bg-[#B3803F]/20 text-[#B3803F]' : 'bg-[#E5E0D8] text-[#7A745F]'
                  }`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#182F28]">
                      Gestión de Precios y Costos Monetarios
                    </h5>
                    <p className="text-[11px] text-[#7A745F]">
                      {formData.manejaCostosInventario
                        ? 'Activo: Se solicitan y muestran costos unitarios, totales y valorización de stock.'
                        : 'Inactivo: Solo control de cantidades físicas. Se ocultan campos y columnas de precios.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.manejaCostosInventario}
                  onClick={() => setFormData(prev => ({ ...prev, manejaCostosInventario: !prev.manejaCostosInventario }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.manejaCostosInventario ? 'bg-[#B3803F]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      formData.manejaCostosInventario ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}
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
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Configuración'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
