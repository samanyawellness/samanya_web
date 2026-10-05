import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Utensils,
  X,
  Save,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  HeartPulse,
  UserCheck,
  ShieldAlert,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { RegistroAlimentacion, PlanNutricional } from '../../types';

interface DetalleIngestaComedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  registro: RegistroAlimentacion | null;
  plan?: PlanNutricional | null;
}

export const DetalleIngestaComedorModal: React.FC<DetalleIngestaComedorModalProps> = ({
  isOpen,
  onClose,
  registro,
  plan
}) => {
  const { currentUser, registrarIngestaComedor } = useAdmin();

  const [porcentaje, setPorcentaje] = useState<number>(100);
  const [liquidos, setLiquidos] = useState<number>(200);
  const [tolerancia, setTolerancia] = useState<'BUENA' | 'REGULAR' | 'MALA'>('BUENA');
  const [asistio, setAsistio] = useState<boolean>(true);
  const [requiereAsistencia, setRequiereAsistencia] = useState<boolean>(false);
  const [observaciones, setObservaciones] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (registro) {
      setPorcentaje(registro.porcentajeIngesta ?? 100);
      setLiquidos(registro.liquidosMl ?? 200);
      setTolerancia(registro.tolerancia || 'BUENA');
      setAsistio(registro.asistio ?? true);
      setRequiereAsistencia(registro.requiereAsistencia ?? plan?.requiereAsistencia ?? false);
      setObservaciones(registro.observaciones || '');
    }
  }, [registro, plan]);

  if (!isOpen || !registro) return null;

  const handleUpdatePorcentaje = (val: number) => {
    setPorcentaje(val);
    if (val <= 25) setTolerancia('MALA');
    else if (val <= 50) setTolerancia('REGULAR');
    else setTolerancia('BUENA');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const ok = await registrarIngestaComedor({
        id: registro.id,
        idCentro: registro.idCentro,
        idResidente: registro.idResidente,
        fecha: registro.fecha,
        idTiempoComida: registro.idTiempoComida,
        porcentajeIngesta: Number(porcentaje),
        liquidosMl: Number(liquidos),
        tolerancia: tolerancia,
        asistio: asistio,
        requiereAsistencia: requiereAsistencia,
        observaciones: observaciones.trim() || undefined,
        idEmpleadoRegistra: currentUser?.id || 1,
        nombreEmpleadoRegistra: currentUser?.nombreCompleto || 'Auxiliar de Enfermería'
      });

      if (ok) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Error guardando registro de ingesta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B3803F]/30 flex items-center justify-center text-[#DCB87F]">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Registro de Ingesta en Comedor
              </h3>
              <p className="text-xs text-[#DCB87F]">
                {registro.tiempoComidaNombre} • {registro.fecha}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
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

          {/* Tarjeta de Residente y Dieta Prescrita */}
          <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#DEDBD1] space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#182F28]">
                  {registro.residenteNombre}
                </h4>
                <div className="text-xs text-[#7A745F]">
                  Habitación {registro.habitacion || '101'} • Cama {registro.cama || 'A'}
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#182F28] text-[#DCB87F]">
                {plan?.tipoDietaNombre || registro.tipoDieta || 'Normal'}
              </span>
            </div>

            <div className="pt-2 border-t border-[#DEDBD1]/60 flex flex-wrap items-center gap-3 text-xs text-[#4B4636]">
              <span><strong>Consistencia:</strong> {plan?.consistenciaNombre || registro.consistencia || 'Regular'}</span>
              {(plan?.nivelEspesanteNombre || registro.espesante) && (
                <span className="text-amber-700 font-semibold">
                  <strong>Espesante:</strong> {plan?.nivelEspesanteNombre || registro.espesante}
                </span>
              )}
            </div>

            {plan?.restriccionesAlergias && (
              <div className="p-2 bg-[#FBE8E6] border border-[#E9A8A0] text-[#A4453A] rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Restricción: {plan.restriccionesAlergias}</span>
              </div>
            )}
          </div>

          {/* Selector de Porcentaje Ingerido */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#182F28]">
                Porcentaje del Plato Consumido *
              </label>
              <span className={`text-sm font-black font-mono px-2 py-0.5 rounded-lg ${
                porcentaje >= 75
                  ? 'bg-emerald-100 text-emerald-800'
                  : porcentaje >= 50
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {porcentaje}%
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[100, 75, 50, 25, 0].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleUpdatePorcentaje(val)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    porcentaje === val
                      ? val >= 75
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : val >= 50
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-rose-600 text-white shadow-xs'
                      : 'bg-[#F7F6F2] text-[#7A745F] hover:bg-[#EAE7DC]'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          {/* Líquidos Ingeridos (ml) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#182F28] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Líquidos Consumidos (ml)</span>
              </span>
              <span className="font-mono font-bold text-xs text-blue-800">{liquidos} ml</span>
            </label>

            <div className="flex items-center gap-2">
              {[100, 150, 200, 250, 300].map(cant => (
                <button
                  key={cant}
                  type="button"
                  onClick={() => setLiquidos(cant)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    liquidos === cant
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[#F7F6F2] text-[#4B4636] hover:bg-[#EAE7DC]'
                  }`}
                >
                  {cant}ml
                </button>
              ))}
            </div>
          </div>

          {/* Tolerancia y Asistencia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1.5">
                Tolerancia Digestiva
              </label>
              <div className="flex items-center gap-1.5">
                {(['BUENA', 'REGULAR', 'MALA'] as const).map(tol => (
                  <button
                    key={tol}
                    type="button"
                    onClick={() => setTolerancia(tol)}
                    className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      tolerancia === tol
                        ? tol === 'BUENA'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : tol === 'REGULAR'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                        : 'bg-[#F7F6F2] text-[#7A745F] hover:bg-[#EAE7DC]'
                    }`}
                  >
                    {tol}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1.5">
                Alimentación Asistida
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRequiereAsistencia(true)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    requiereAsistencia
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-[#F7F6F2] text-[#7A745F] hover:bg-[#EAE7DC]'
                  }`}
                >
                  Sí (Asistida)
                </button>
                <button
                  type="button"
                  onClick={() => setRequiereAsistencia(false)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    !requiereAsistencia
                      ? 'bg-[#182F28] text-white shadow-xs'
                      : 'bg-[#F7F6F2] text-[#7A745F] hover:bg-[#EAE7DC]'
                  }`}
                >
                  Autónomo
                </button>
              </div>
            </div>
          </div>

          {/* Observaciones Clínicas */}
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">
              Observaciones / Novedades de la Ingesta
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Rechazó proteína, refiere inapetencia / Comió con agrado en posición erguida..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-medium text-[#182F28] focus:outline-none focus:border-[#B3803F] resize-none"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-[#DEDBD1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#7A745F] hover:text-[#182F28] rounded-xl cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Guardando...' : 'Guardar Ingesta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
