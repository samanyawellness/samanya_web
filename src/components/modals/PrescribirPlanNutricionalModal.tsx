import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  UtensilsCrossed,
  X,
  Save,
  AlertCircle,
  HeartPulse,
  ShieldAlert,
  User,
  Activity,
  Flame,
  FileText
} from 'lucide-react';
import { PlanNutricional } from '../../types';

interface PrescribirPlanNutricionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  planAEditar?: PlanNutricional | null;
  idResidenteInicial?: number;
}

export const PrescribirPlanNutricionalModal: React.FC<PrescribirPlanNutricionalModalProps> = ({
  isOpen,
  onClose,
  planAEditar,
  idResidenteInicial
}) => {
  const { activeSede, residentes, nivelesEspesante, guardarPlanNutricional } = useAdmin();

  // Residentes activos de la sede activa
  const residentesSede = useMemo(() => {
    return residentes.filter(r => r.idCentro === activeSede.id && r.estado === 'Activo');
  }, [residentes, activeSede.id]);

  // Catálogo estándar de tipos de dieta clínica geriátrica
  const tiposDietaCatalogo = [
    { id: 1, nombre: 'Normal / General', desc: 'Sin restricciones de sodio ni carbohidratos simples' },
    { id: 2, nombre: 'Hiposódica (Baja en sal)', desc: 'Control estricto de sodio para hipertensión y cardiopatías' },
    { id: 3, nombre: 'Diabética / Baja en Carbohidratos', desc: 'Sin azúcares refinados, carbohidratos de bajo índice glucémico' },
    { id: 4, nombre: 'Blanda Mecánica', desc: 'Alimentos cocidos suaves de fácil masticación y deglución' },
    { id: 5, nombre: 'Papilla / Licuada / Disfagia', desc: 'Texturas homogéneas tipo puré fino para disfagia motora' },
    { id: 6, nombre: 'Hipoproteica / Renal', desc: 'Restricción proteica y control de potasio/fósforo' },
    { id: 7, nombre: 'Hipercalórica / Hiperproteica', desc: 'Aporte reforzado para desnutrición o sarcopenia' },
    { id: 8, nombre: 'Astringente / Gastroentérica', desc: 'Baja en grasas y fibra para cuadros digestivos agudos' }
  ];

  // Catálogo estándar de consistencias
  const consistenciasCatalogo = [
    { id: 1, nombre: 'Sólida Regular' },
    { id: 2, nombre: 'Blanda Fácil Masticación' },
    { id: 3, nombre: 'Puré Suave / Licuada' },
    { id: 4, nombre: 'Líquida Espesada' }
  ];

  // Estados del Formulario
  const [idResidente, setIdResidente] = useState<number>(() => {
    if (planAEditar) return planAEditar.idResidente;
    if (idResidenteInicial) return idResidenteInicial;
    return residentesSede[0]?.id || 0;
  });

  const [idTipoDieta, setIdTipoDieta] = useState<number>(planAEditar?.idTipoDieta || 1);
  const [tipoDietaNombre, setTipoDietaNombre] = useState<string>(planAEditar?.tipoDietaNombre || 'Normal / General');
  const [consistenciaNombre, setConsistenciaNombre] = useState<string>(planAEditar?.consistenciaNombre || 'Sólida Regular');
  const [idNivelEspesante, setIdNivelEspesante] = useState<number | undefined>(planAEditar?.idNivelEspesante);
  const [requerimientoCaloricoKcal, setRequerimientoCaloricoKcal] = useState<number>(planAEditar?.requerimientoCaloricoKcal || 1800);
  const [requiereAsistencia, setRequiereAsistencia] = useState<boolean>(planAEditar?.requiereAsistencia || false);
  const [restriccionesAlergias, setRestriccionesAlergias] = useState<string>(planAEditar?.restriccionesAlergias || '');
  const [alimentosPreferidos, setAlimentosPreferidos] = useState<string>(planAEditar?.alimentosPreferidos || '');
  const [alimentosRechazados, setAlimentosRechazados] = useState<string>(planAEditar?.alimentosRechazados || '');
  const [suplementoNutricional, setSuplementoNutricional] = useState<string>(planAEditar?.suplementoNutricional || '');
  const [observaciones, setObservaciones] = useState<string>(planAEditar?.observaciones || '');
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>(planAEditar?.estado || 'ACTIVO');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar campos cuando cambie planAEditar o idResidenteInicial
  useEffect(() => {
    if (planAEditar) {
      setIdResidente(planAEditar.idResidente);
      setIdTipoDieta(planAEditar.idTipoDieta || 1);
      setTipoDietaNombre(planAEditar.tipoDietaNombre || 'Normal / General');
      setConsistenciaNombre(planAEditar.consistenciaNombre || 'Sólida Regular');
      setIdNivelEspesante(planAEditar.idNivelEspesante);
      setRequerimientoCaloricoKcal(planAEditar.requerimientoCaloricoKcal || 1800);
      setRequiereAsistencia(planAEditar.requiereAsistencia || false);
      setRestriccionesAlergias(planAEditar.restriccionesAlergias || '');
      setAlimentosPreferidos(planAEditar.alimentosPreferidos || '');
      setAlimentosRechazados(planAEditar.alimentosRechazados || '');
      setSuplementoNutricional(planAEditar.suplementoNutricional || '');
      setObservaciones(planAEditar.observaciones || '');
      setEstado(planAEditar.estado || 'ACTIVO');
    } else {
      const selectedId = idResidenteInicial || residentesSede[0]?.id || 0;
      setIdResidente(selectedId);
      const res = residentes.find(r => r.id === selectedId);
      if (res?.tipoDieta) {
        const match = tiposDietaCatalogo.find(t => t.nombre.toLowerCase().includes(res.tipoDieta?.toLowerCase() || ''));
        if (match) {
          setIdTipoDieta(match.id);
          setTipoDietaNombre(match.nombre);
        }
      }
      setConsistenciaNombre('Sólida Regular');
      setIdNivelEspesante(undefined);
      setRequerimientoCaloricoKcal(1800);
      setRequiereAsistencia(false);
      setRestriccionesAlergias(res?.alertasClinicas || '');
      setAlimentosPreferidos('');
      setAlimentosRechazados('');
      setSuplementoNutricional('');
      setObservaciones('');
      setEstado('ACTIVO');
    }
  }, [planAEditar, idResidenteInicial, isOpen, residentesSede]);

  if (!isOpen) return null;

  const residenteSeleccionado = residentes.find(r => r.id === idResidente);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idResidente) {
      setError('Debe seleccionar un residente para el plan nutricional.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const espesanteObj = nivelesEspesante.find(n => n.id === idNivelEspesante);

      const payload: Partial<PlanNutricional> & { idCentro: number; idResidente: number } = {
        id: planAEditar?.id,
        idCentro: activeSede.id,
        idResidente: idResidente,
        idTipoDieta: idTipoDieta,
        tipoDietaNombre: tipoDietaNombre,
        consistenciaNombre: consistenciaNombre,
        idNivelEspesante: idNivelEspesante,
        nivelEspesanteNombre: espesanteObj?.nombre,
        requerimientoCaloricoKcal: Number(requerimientoCaloricoKcal),
        requiereAsistencia: requiereAsistencia,
        restriccionesAlergias: restriccionesAlergias.trim() || undefined,
        alimentosPreferidos: alimentosPreferidos.trim() || undefined,
        alimentosRechazados: alimentosRechazados.trim() || undefined,
        suplementoNutricional: suplementoNutricional.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
        estado: estado
      };

      const ok = await guardarPlanNutricional(payload);
      if (ok) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Error guardando plan nutricional');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B3803F]/30 flex items-center justify-center text-[#DCB87F]">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                {planAEditar ? 'Modificar Plan Nutricional Clínico' : 'Prescribir Nuevo Plan Nutricional'}
              </h3>
              <p className="text-xs text-[#DCB87F]">
                {activeSede.nombre} • Valoración dietética y deglutoria
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

          {/* Selección de Residente */}
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#B3803F]" />
              <span>Residente Comensal *</span>
            </label>
            {planAEditar ? (
              <div className="p-3 rounded-xl bg-[#F7F6F2] border border-[#DEDBD1] text-xs font-bold text-[#182F28] flex items-center justify-between">
                <span>{residenteSeleccionado ? `${residenteSeleccionado.nombres} ${residenteSeleccionado.apellidos}` : 'Residente'}</span>
                <span className="text-[11px] text-[#7A745F] font-mono">
                  Hab: {residenteSeleccionado?.habitacion} • Cama: {residenteSeleccionado?.cama}
                </span>
              </div>
            ) : (
              <select
                required
                value={idResidente}
                onChange={(e) => setIdResidente(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              >
                {residentesSede.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nombres} {r.apellidos} (Hab. {r.habitacion || 'S/N'} - Cama {r.cama || 'S/N'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Grid: Tipo de Dieta y Consistencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1.5 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tipo de Dieta Prescrita *</span>
              </label>
              <select
                required
                value={idTipoDieta}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setIdTipoDieta(val);
                  const matched = tiposDietaCatalogo.find(t => t.id === val);
                  if (matched) setTipoDietaNombre(matched.nombre);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              >
                {tiposDietaCatalogo.map(td => (
                  <option key={td.id} value={td.id}>
                    {td.nombre}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#7A745F] mt-1">
                {tiposDietaCatalogo.find(t => t.id === idTipoDieta)?.desc}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Consistencia / Textura *</span>
              </label>
              <select
                required
                value={consistenciaNombre}
                onChange={(e) => setConsistenciaNombre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              >
                {consistenciasCatalogo.map(c => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Espesante IDDSI y Calorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1.5 flex items-center gap-1.5">
                <span>Nivel de Espesante IDDSI (Disfagia)</span>
              </label>
              <select
                value={idNivelEspesante ?? ''}
                onChange={(e) => setIdNivelEspesante(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              >
                <option value="">Ninguno / Líquidos estándar</option>
                {nivelesEspesante.map(ne => (
                  <option key={ne.id} value={ne.id}>
                    {ne.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Meta Calórica Diaria (kcal)</span>
              </label>
              <input
                type="number"
                min="1000"
                max="3500"
                step="50"
                value={requerimientoCaloricoKcal}
                onChange={(e) => setRequerimientoCaloricoKcal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
            </div>
          </div>

          {/* Switch: Requiere Asistencia en Alimentación */}
          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#182F28]">Requiere Asistencia de Enfermería/Cuidador</div>
              <div className="text-[11px] text-[#7A745F]">
                Indica si el residente necesita apoyo directo para llevar el plato o líquidos a la boca.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={requiereAsistencia}
              onClick={() => setRequiereAsistencia(!requiereAsistencia)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                requiereAsistencia ? 'bg-[#182F28]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  requiereAsistencia ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Restricciones y Alergias */}
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#A4453A]" />
              <span>Alergias e Intolerancias Alimentarias</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Sin lácteos enteros, alergia a mariscos, intolerancia al gluten..."
              value={restriccionesAlergias}
              onChange={(e) => setRestriccionesAlergias(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-medium text-[#182F28] focus:outline-none focus:border-[#B3803F]"
            />
          </div>

          {/* Alimentos Preferidos y Rechazados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Alimentos Preferidos / Aceptados
              </label>
              <input
                type="text"
                placeholder="Ej: Purés dulces, sopas tibias, frutas picadas..."
                value={alimentosPreferidos}
                onChange={(e) => setAlimentosPreferidos(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-medium text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Alimentos Rechazados / Aversiones
              </label>
              <input
                type="text"
                placeholder="Ej: Carnes rojas duras, coliflor, café amargo..."
                value={alimentosRechazados}
                onChange={(e) => setAlimentosRechazados(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-medium text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
            </div>
          </div>

          {/* Suplemento Nutricional */}
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">
              Suplementación Nutricional (Fórmula Enteral / Módulo Proteico)
            </label>
            <input
              type="text"
              placeholder="Ej: Ensure Advance 1 toma a las 16:00 / Glucerna 1 lata..."
              value={suplementoNutricional}
              onChange={(e) => setSuplementoNutricional(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-medium text-[#182F28] focus:outline-none focus:border-[#B3803F]"
            />
          </div>

          {/* Observaciones Clínicas */}
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#B3803F]" />
              <span>Observaciones e Indicaciones para Cuidadores</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Mantener al residente en posición Fowler 90° durante la comida y 30 minutos después para prevenir broncoaspiración..."
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
              <span>{submitting ? 'Guardando...' : planAEditar ? 'Actualizar Plan' : 'Prescribir Plan Clínico'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
