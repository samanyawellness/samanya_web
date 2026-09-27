import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  Package,
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import { ElementoDotacionCatalogo } from '../../types';

export const GestionDotacionModal: React.FC = () => {
  const {
    isGestionDotacionOpen,
    setIsGestionDotacionOpen,
    catalogoDotacion,
    guardarElementoCatalogo,
    eliminarElementoCatalogo,
    showConfirm,
    showAlert
  } = useAdmin();

  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [elementoEditando, setElementoEditando] = useState<Partial<ElementoDotacionCatalogo>>({
    nombreElemento: '',
    categoria: 'Lencería y Ropa de Cama',
    cantidadDefecto: 1,
    frecuenciaCambioMeses: 12,
    descripcion: '',
    esSugeridoIngreso: true,
    estado: 'Activo'
  });

  if (!isGestionDotacionOpen) return null;

  const categorias = Array.from(new Set(catalogoDotacion.map((c) => c.categoria)));

  const catalogoFiltrado = catalogoDotacion.filter((item) => {
    if (categoriaFiltro !== 'TODAS' && item.categoria !== categoriaFiltro) {
      return false;
    }
    return true;
  });

  const handleIniciarNuevo = () => {
    setElementoEditando({
      nombreElemento: '',
      categoria: 'Lencería y Ropa de Cama',
      cantidadDefecto: 1,
      frecuenciaCambioMeses: 12,
      descripcion: '',
      esSugeridoIngreso: true,
      estado: 'Activo'
    });
    setModoEdicion(true);
  };

  const handleIniciarEditar = (item: ElementoDotacionCatalogo) => {
    setElementoEditando({ ...item });
    setModoEdicion(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!elementoEditando.nombreElemento?.trim()) {
      showAlert('Por favor ingrese el nombre del artículo.', 'Campo Requerido', 'warning');
      return;
    }

    await guardarElementoCatalogo(elementoEditando);
    setModoEdicion(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#274A3F] border border-[#DCB87F]/40 flex items-center justify-center text-[#DCB87F]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-white">
                  Plantilla y Catálogo de Dotación de Ingreso
                </h3>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#DCB87F]/20 text-[#DCB87F] border border-[#DCB87F]/30">
                  {catalogoDotacion.length} artículos
                </span>
              </div>
              <p className="text-xs text-[#CFC9B8] mt-0.5">
                Configure la lista genérica sugerida al admitir residentes y su periodicidad obligatoria de recambio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsGestionDotacionOpen(false);
              setModoEdicion(false);
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {modoEdicion ? (
            <form onSubmit={handleGuardar} className="p-5 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DEDBD1]">
                <h4 className="font-serif font-bold text-sm text-[#182F28] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#B3803F]" />
                  <span>{elementoEditando.id ? 'Editar Artículo del Catálogo' : 'Nuevo Artículo para la Plantilla'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setModoEdicion(false)}
                  className="text-xs text-[#7A745F] hover:text-[#182F28] font-bold"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Nombre del Artículo *
                  </label>
                  <input
                    type="text"
                    required
                    value={elementoEditando.nombreElemento || ''}
                    onChange={(e) => setElementoEditando({ ...elementoEditando, nombreElemento: e.target.value })}
                    placeholder="Ej. Juego de sábanas completo"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-sm text-[#182F28] focus:outline-none focus:border-[#182F28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Categoría *
                  </label>
                  <select
                    value={elementoEditando.categoria || 'Lencería y Ropa de Cama'}
                    onChange={(e) => setElementoEditando({ ...elementoEditando, categoria: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-sm text-[#182F28] focus:outline-none focus:border-[#182F28]"
                  >
                    <option value="Lencería y Ropa de Cama">Lencería y Ropa de Cama</option>
                    <option value="Aseo y Cuidado Personal">Aseo y Cuidado Personal</option>
                    <option value="Menaje">Menaje</option>
                    <option value="Ayudas Técnicas">Ayudas Técnicas</option>
                    <option value="Vestuario">Vestuario</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Cantidad por Defecto *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={elementoEditando.cantidadDefecto || 1}
                    onChange={(e) => setElementoEditando({ ...elementoEditando, cantidadDefecto: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-sm text-[#182F28] focus:outline-none focus:border-[#182F28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Periodicidad de Cambio (Meses)
                  </label>
                  <select
                    value={elementoEditando.frecuenciaCambioMeses ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseInt(e.target.value);
                      setElementoEditando({ ...elementoEditando, frecuenciaCambioMeses: val });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-sm text-[#182F28] focus:outline-none focus:border-[#182F28]"
                  >
                    <option value="">Entrega Única (Sin reposición periódica)</option>
                    <option value="1">Cada mes (1 mes) - Consumibles de higiene</option>
                    <option value="3">Cada trimestre (3 meses)</option>
                    <option value="6">Cada semestre (6 meses) - Toallas / calzado</option>
                    <option value="12">Cada año (12 meses) - Sábanas / almohadas</option>
                    <option value="24">Cada 2 años (24 meses) - Cobijas térmicas / colchas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Descripción o Especificaciones
                </label>
                <textarea
                  rows={2}
                  value={elementoEditando.descripcion || ''}
                  onChange={(e) => setElementoEditando({ ...elementoEditando, descripcion: e.target.value })}
                  placeholder="Especificaciones técnicas, telas hipoalergénicas, medidas estándar, etc."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-sm text-[#182F28] focus:outline-none focus:border-[#182F28]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#182F28]">
                  <input
                    type="checkbox"
                    checked={elementoEditando.esSugeridoIngreso ?? true}
                    onChange={(e) => setElementoEditando({ ...elementoEditando, esSugeridoIngreso: e.target.checked })}
                    className="rounded border-[#DEDBD1] text-[#182F28] focus:ring-[#182F28]"
                  />
                  <span>Sugerir automáticamente al admitir un residente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#182F28]">
                  <input
                    type="checkbox"
                    checked={elementoEditando.estado === 'Activo'}
                    onChange={(e) => setElementoEditando({ ...elementoEditando, estado: e.target.checked ? 'Activo' : 'Inactivo' })}
                    className="rounded border-[#DEDBD1] text-[#182F28] focus:ring-[#182F28]"
                  />
                  <span>Artículo Activo en el catálogo</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DEDBD1]">
                <button
                  type="button"
                  onClick={() => setModoEdicion(false)}
                  className="px-4 py-2 bg-white border border-[#DEDBD1] text-xs font-bold text-[#5C6058] rounded-xl hover:bg-[#EFECE6] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-[#182F28] hover:bg-[#274A3F] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Artículo</span>
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Barra de herramientas */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#7A745F] font-mono uppercase">Filtrar:</span>
                  <button
                    type="button"
                    onClick={() => setCategoriaFiltro('TODAS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      categoriaFiltro === 'TODAS'
                        ? 'bg-[#182F28] text-white'
                        : 'bg-white text-[#5C6058] border border-[#DEDBD1] hover:bg-[#EFECE6]'
                    }`}
                  >
                    Todas ({catalogoDotacion.length})
                  </button>
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoriaFiltro(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        categoriaFiltro === cat
                          ? 'bg-[#182F28] text-white'
                          : 'bg-white text-[#5C6058] border border-[#DEDBD1] hover:bg-[#EFECE6]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleIniciarNuevo}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-[#DCB87F]" />
                  <span>+ Agregar Artículo a la Plantilla</span>
                </button>
              </div>

              {/* Lista de Artículos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {catalogoFiltrado.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-2xl border border-[#DEDBD1] hover:border-[#B3803F] transition-all shadow-sm space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#DCB87F]/25 text-[#694819]">
                            {item.categoria}
                          </span>
                          <h4 className="font-bold text-sm text-[#182F28] mt-1">
                            {item.nombreElemento}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleIniciarEditar(item)}
                            className="p-1.5 hover:bg-[#FEF7EE] text-[#9A5B12] rounded-lg transition-colors cursor-pointer"
                            title="Editar artículo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const confirmed = await showConfirm({
                                title: 'Eliminar de Plantilla',
                                message: `¿Desea eliminar "${item.nombreElemento}" de la plantilla del catálogo?`,
                                type: 'danger',
                                confirmText: 'Sí, Eliminar',
                                cancelText: 'Cancelar'
                              });
                              if (confirmed) {
                                eliminarElementoCatalogo(item.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar artículo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.descripcion && (
                        <p className="text-xs text-[#5C6058] mt-1 leading-relaxed">
                          {item.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#DEDBD1]/60 flex items-center justify-between text-xs text-[#7A745F]">
                      <div className="flex items-center gap-3">
                        <span>
                          Cant. sugerida: <strong className="text-[#182F28]">{item.cantidadDefecto}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#B3803F]" />
                          {item.frecuenciaCambioMeses
                            ? `Recambio cada ${item.frecuenciaCambioMeses} meses`
                            : 'Entrega única'}
                        </span>
                      </div>

                      {item.esSugeridoIngreso && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1E7A4C]/15 text-[#1E7A4C]">
                          En Admisión
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DEDBD1] bg-[#F7F6F2] flex items-center justify-between">
          <span className="text-xs text-[#7A745F]">
            💡 Los artículos activos con "En Admisión" aparecerán pre-seleccionados al admitir nuevos residentes.
          </span>
          <button
            type="button"
            onClick={() => {
              setIsGestionDotacionOpen(false);
              setModoEdicion(false);
            }}
            className="px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cerrar Gestión
          </button>
        </div>
      </div>
    </div>
  );
};
