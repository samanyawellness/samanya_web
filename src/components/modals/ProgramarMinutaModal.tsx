import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Calendar,
  X,
  Save,
  Plus,
  Trash2,
  Edit2,
  UtensilsCrossed,
  AlertCircle,
  Clock,
  Flame,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { MinutaSemanal, MinutaItem } from '../../types';

interface ProgramarMinutaModalProps {
  isOpen: boolean;
  onClose: () => void;
  minutaAEditar?: MinutaSemanal | null;
}

export const ProgramarMinutaModal: React.FC<ProgramarMinutaModalProps> = ({
  isOpen,
  onClose,
  minutaAEditar
}) => {
  const { activeSede, tiemposComida, guardarMinutaSemanal } = useAdmin();

  const diasSemana = [
    { num: 1, nombre: 'Lunes' },
    { num: 2, nombre: 'Martes' },
    { num: 3, nombre: 'Miércoles' },
    { num: 4, nombre: 'Jueves' },
    { num: 5, nombre: 'Viernes' },
    { num: 6, nombre: 'Sábado' },
    { num: 7, nombre: 'Domingo' }
  ];

  // Datos Cabecera
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  const [items, setItems] = useState<MinutaItem[]>([]);
  const [diaActivo, setDiaActivo] = useState<number>(1);

  // Formulario de edición/creación de Item
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [itemTiempoComida, setItemTiempoComida] = useState<number>(1);
  const [itemPlato, setItemPlato] = useState('');
  const [itemAcomp, setItemAcomp] = useState('');
  const [itemBebida, setItemBebida] = useState('');
  const [itemPostre, setItemPostre] = useState('');
  const [itemCalorias, setItemCalorias] = useState<number>(450);
  const [itemObservaciones, setItemObservaciones] = useState('');
  const [isFormItemOpen, setIsFormItemOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar al abrir
  useEffect(() => {
    if (minutaAEditar) {
      setNombre(minutaAEditar.nombre);
      setDescripcion(minutaAEditar.descripcion || '');
      setFechaInicio(minutaAEditar.fechaInicio);
      setFechaFin(minutaAEditar.fechaFin);
      setEstado(minutaAEditar.estado);
      setItems(minutaAEditar.items ? [...minutaAEditar.items] : []);
    } else {
      const hoy = new Date();
      // Calcular lunes de esta semana
      const diaNum = hoy.getDay();
      const diffLunes = hoy.getDate() - (diaNum === 0 ? 6 : diaNum - 1);
      const lunes = new Date(hoy.setDate(diffLunes));
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);

      const fIni = lunes.toISOString().split('T')[0];
      const fFin = domingo.toISOString().split('T')[0];

      setNombre(`Minuta Semanal - Ciclo ${activeSede.nombre}`);
      setDescripcion('Menú balanceado geriátrico con adaptaciones para texturas IDDSI y dietas restringidas.');
      setFechaInicio(fIni);
      setFechaFin(fFin);
      setEstado('ACTIVO');
      setItems([]);
    }
    setDiaActivo(1);
    setIsFormItemOpen(false);
    setEditingItemId(null);
  }, [minutaAEditar, isOpen, activeSede.nombre]);

  if (!isOpen) return null;

  // Preparaciones del día seleccionado
  const itemsDia = items.filter(i => i.diaSemana === diaActivo);

  const handleOpenNuevoItem = () => {
    setEditingItemId(null);
    setItemTiempoComida(1);
    setItemPlato('');
    setItemAcomp('');
    setItemBebida('');
    setItemPostre('');
    setItemCalorias(450);
    setItemObservaciones('');
    setIsFormItemOpen(true);
  };

  const handleEditItem = (item: MinutaItem) => {
    setEditingItemId(item.id);
    setItemTiempoComida(item.idTiempoComida);
    setItemPlato(item.platoPrincipal);
    setItemAcomp(item.acompanamiento || '');
    setItemBebida(item.bebida || '');
    setItemPostre(item.postre || '');
    setItemCalorias(item.caloriasEstimadas || 450);
    setItemObservaciones(item.observacionesDietas || '');
    setIsFormItemOpen(true);
  };

  const handleDeleteItem = (idItem: number) => {
    setItems(prev => prev.filter(i => i.id !== idItem));
  };

  const handleGuardarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemPlato.trim()) return;

    const tc = tiemposComida.find(t => t.id === itemTiempoComida);
    const diaNombre = diasSemana.find(d => d.num === diaActivo)?.nombre || 'Día';

    if (editingItemId) {
      setItems(prev =>
        prev.map(i => {
          if (i.id === editingItemId) {
            return {
              ...i,
              idTiempoComida: itemTiempoComida,
              tiempoComidaNombre: tc ? tc.nombre : i.tiempoComidaNombre,
              horaSugerida: tc?.horaSugerida,
              platoPrincipal: itemPlato.trim(),
              acompanamiento: itemAcomp.trim() || undefined,
              bebida: itemBebida.trim() || undefined,
              postre: itemPostre.trim() || undefined,
              caloriasEstimadas: Number(itemCalorias) || 450,
              observacionesDietas: itemObservaciones.trim() || undefined
            };
          }
          return i;
        })
      );
    } else {
      const nuevo: MinutaItem = {
        id: Date.now(),
        idMinuta: minutaAEditar?.id || 1,
        diaSemana: diaActivo,
        nombreDia: diaNombre,
        idTiempoComida: itemTiempoComida,
        tiempoComidaNombre: tc ? tc.nombre : 'Comida',
        horaSugerida: tc?.horaSugerida,
        platoPrincipal: itemPlato.trim(),
        acompanamiento: itemAcomp.trim() || undefined,
        bebida: itemBebida.trim() || undefined,
        postre: itemPostre.trim() || undefined,
        caloriasEstimadas: Number(itemCalorias) || 450,
        observacionesDietas: itemObservaciones.trim() || undefined
      };
      setItems(prev => [...prev, nuevo]);
    }

    setIsFormItemOpen(false);
    setEditingItemId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !fechaInicio || !fechaFin) {
      setError('Por favor complete el nombre y rango de fechas de la minuta.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: Partial<MinutaSemanal> & {
        idCentro: number;
        nombre: string;
        fechaInicio: string;
        fechaFin: string;
      } = {
        id: minutaAEditar?.id,
        idCentro: activeSede.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        estado: estado,
        items: items
      };

      const ok = await guardarMinutaSemanal(payload);
      if (ok) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Error guardando minuta semanal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B3803F]/30 flex items-center justify-center text-[#DCB87F]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                {minutaAEditar ? 'Editar Minuta Semanal y Menú' : 'Programar Nueva Minuta Semanal'}
              </h3>
              <p className="text-xs text-[#DCB87F]">
                {activeSede.nombre} • Ciclo de preparaciones y tiempos de comida
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-[#FBE8E6] border border-[#E9A8A0] text-[#A4453A] rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Datos Generales de la Minuta */}
          <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#DEDBD1] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Nombre de la Minuta Semanal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Minuta Semanal Balanceada Octubre - Ciclo 1"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Fecha Fin *
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Descripción / Pautas Nutricionales del Menú
              </label>
              <input
                type="text"
                placeholder="Ej: Menú bajo en sodio con adaptación a consistencias mecánicas y puré..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-medium text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
            </div>
          </div>

          {/* Selector de Días de la Semana */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3">
              <div>
                <h4 className="font-serif text-sm font-bold text-[#182F28]">
                  Programación de Platos por Día
                </h4>
                <p className="text-[11px] text-[#7A745F]">
                  Selecciona el día de la semana para configurar los platos de cada tiempo de comida
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNuevoItem}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Plato</span>
              </button>
            </div>

            {/* Pestañas de Días */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {diasSemana.map(d => {
                const count = items.filter(i => i.diaSemana === d.num).length;
                const isSelected = diaActivo === d.num;

                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => {
                      setDiaActivo(d.num);
                      setIsFormItemOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#182F28] text-white shadow-xs'
                        : 'bg-[#F7F6F2] text-[#4B4636] hover:bg-[#EAE7DC]'
                    }`}
                  >
                    <span>{d.nombre}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-[#DCB87F] text-[#182F28]' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Formulario Inline para Crear/Editar Plato */}
            {isFormItemOpen && (
              <div className="p-4 bg-[#FEF7EE] rounded-2xl border border-[#DCB87F] space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-[#DCB87F]/40 pb-2">
                  <h5 className="font-bold text-xs text-[#9A5B12] flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>{editingItemId ? 'Editar Plato / Preparación' : `Nueva Preparación para el ${diasSemana.find(d => d.num === diaActivo)?.nombre}`}</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => setIsFormItemOpen(false)}
                    className="text-[#9A5B12] hover:text-[#182F28] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#182F28] mb-1">
                      Tiempo de Comida *
                    </label>
                    <select
                      value={itemTiempoComida}
                      onChange={(e) => setItemTiempoComida(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none"
                    >
                      {tiemposComida.map(tc => (
                        <option key={tc.id} value={tc.id}>
                          {tc.nombre} ({tc.horaSugerida})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-[#182F28] mb-1">
                      Plato Principal *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Pechuga a la plancha con finas hierbas"
                      value={itemPlato}
                      onChange={(e) => setItemPlato(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#182F28] mb-1">
                      Acompañamiento
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Puré de papa y arroz"
                      value={itemAcomp}
                      onChange={(e) => setItemAcomp(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#182F28] mb-1">
                      Bebida
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Jugo de guayaba sin azúcar"
                      value={itemBebida}
                      onChange={(e) => setItemBebida(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#182F28] mb-1">
                      Postre / Fruta
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Compota de manzana"
                      value={itemPostre}
                      onChange={(e) => setItemPostre(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#182F28] mb-1">
                      Calorías Estimadas (kcal)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="1500"
                      value={itemCalorias}
                      onChange={(e) => setItemCalorias(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#182F28] mb-1">
                    Adaptación para Dietas / Disfagia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Licuar proteína para consistencia papilla. Espesar bebida con Nivel 2 IDDSI."
                    value={itemObservaciones}
                    onChange={(e) => setItemObservaciones(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsFormItemOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#7A745F] hover:text-[#182F28] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardarItem}
                    className="px-4 py-1.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    {editingItemId ? 'Actualizar Plato' : 'Añadir al Menú'}
                  </button>
                </div>
              </div>
            )}

            {/* Listado de Preparaciones del Día */}
            <div className="space-y-2.5">
              {itemsDia.length === 0 ? (
                <div className="p-8 text-center bg-[#F7F6F2] rounded-2xl border border-dashed border-[#DEDBD1] text-xs text-[#7A745F]">
                  No hay preparaciones registradas para el {diasSemana.find(d => d.num === diaActivo)?.nombre}.
                  Haz click en "Agregar Plato" para programar el menú.
                </div>
              ) : (
                itemsDia.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white rounded-xl border border-[#DEDBD1] hover:border-[#B3803F] transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#182F28] text-[#DCB87F] uppercase tracking-wider font-mono">
                          {item.tiempoComidaNombre}
                        </span>
                        <span className="text-[10px] text-[#7A745F] font-mono">
                          ~{item.caloriasEstimadas} kcal
                        </span>
                        {item.observacionesDietas && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {item.observacionesDietas}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-[#182F28]">
                        {item.platoPrincipal}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#7A745F]">
                        {item.acompanamiento && <span><strong>Acomp:</strong> {item.acompanamiento}</span>}
                        {item.bebida && <span><strong>Bebida:</strong> {item.bebida}</span>}
                        {item.postre && <span><strong>Postre:</strong> {item.postre}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditItem(item)}
                        className="p-1.5 text-[#7A745F] hover:text-[#B3803F] hover:bg-[#F7F6F2] rounded-lg transition-colors cursor-pointer"
                        title="Editar preparación"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-[#7A745F] hover:text-[#A4453A] hover:bg-[#FBE8E6] rounded-lg transition-colors cursor-pointer"
                        title="Eliminar preparación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
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
              className="flex items-center gap-2 px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#DCB87F]" />
              <span>{submitting ? 'Guardando...' : minutaAEditar ? 'Actualizar Minuta' : 'Guardar Minuta Semanal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
