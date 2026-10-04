import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Package,
  Layers,
  Building2,
  Calendar,
  User,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Residente, ArticuloCatalogo, BodegaSede, RegistrarMovimientoPayload } from '../../types';

// =========================================================================
// 1. MODAL: REGISTRAR APORTE / DONACIÓN DE FAMILIAR PARA EL RESIDENTE
// =========================================================================
interface ModalRecibirInsumoFamiliarProps {
  isOpen: boolean;
  onClose: () => void;
  residente: Residente;
  familiares: any[];
  articulosCatalogo: ArticuloCatalogo[];
  bodegasSede: BodegaSede[];
  onSave: (payload: RegistrarMovimientoPayload) => Promise<boolean>;
}

export const ModalRecibirInsumoFamiliar: React.FC<ModalRecibirInsumoFamiliarProps> = ({
  isOpen,
  onClose,
  residente,
  familiares,
  articulosCatalogo,
  bodegasSede,
  onSave
}) => {
  const [idArticulo, setIdArticulo] = useState<number>(articulosCatalogo[0]?.id || 1);
  const [idBodega, setIdBodega] = useState<number>(bodegasSede[0]?.id || 1);
  const [familiarDonante, setFamiliarDonante] = useState<string>(
    residente.acudientes && residente.acudientes.length > 0
      ? `${residente.acudientes[0].nombreCompleto} (${residente.acudientes[0].parentesco || 'Acudiente'})`
      : 'Familiar del Residente'
  );

  // Modo de conteo y empaques
  const [modoConteo, setModoConteo] = useState<'EMPAQUES' | 'UNIDADES'>('EMPAQUES');
  const [tipoEmpaque, setTipoEmpaque] = useState<string>('Paquete');
  const [cantidadEmpaques, setCantidadEmpaques] = useState<number>(5);
  const [unidadesPorEmpaque, setUnidadesPorEmpaque] = useState<number>(30);
  const [cantidadUnidadesDirectas, setCantidadUnidadesDirectas] = useState<number>(30);

  const [numeroLote, setNumeroLote] = useState('LOTE-2026');
  const [fechaVencimiento, setFechaVencimiento] = useState('2027-12-31');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const articuloSeleccionado = articulosCatalogo.find((a) => a.id === idArticulo);

  // Al cambiar el artículo, precargar si tiene empaque configurado
  useEffect(() => {
    if (articuloSeleccionado) {
      if (articuloSeleccionado.unidadesPorEmpaque && articuloSeleccionado.unidadesPorEmpaque > 1) {
        setUnidadesPorEmpaque(articuloSeleccionado.unidadesPorEmpaque);
        setModoConteo('EMPAQUES');
      } else {
        setModoConteo('UNIDADES');
      }
      if (articuloSeleccionado.tipoEmpaque) {
        setTipoEmpaque(articuloSeleccionado.tipoEmpaque);
      }
    }
  }, [idArticulo, articuloSeleccionado]);

  if (!isOpen) return null;

  const unidadesTotalesCalculadas =
    modoConteo === 'EMPAQUES'
      ? cantidadEmpaques * unidadesPorEmpaque
      : cantidadUnidadesDirectas;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unidadesTotalesCalculadas <= 0) {
      alert('La cantidad a ingresar debe ser mayor a cero.');
      return;
    }

    setLoading(true);
    try {
      const notaFinal = `Aporte entregado por ${familiarDonante} para custodia personal del residente. ${
        modoConteo === 'EMPAQUES'
          ? `(${cantidadEmpaques} ${tipoEmpaque}(s) x ${unidadesPorEmpaque} uds = ${unidadesTotalesCalculadas} uds totales). `
          : `(${unidadesTotalesCalculadas} unidades físicas). `
      }${observaciones.trim()}`;

      const payload: RegistrarMovimientoPayload = {
        idCentro: residente.idCentro,
        idBodega,
        tipoMovimiento: 'ENTRADA_DONACION',
        idResidente: residente.id,
        observaciones: notaFinal,
        detalles: [
          {
            idArticulo,
            cantidad: unidadesTotalesCalculadas,
            numeroLote: articuloSeleccionado?.requiereLoteVencimiento ? numeroLote : undefined,
            fechaVencimiento: articuloSeleccionado?.requiereLoteVencimiento ? fechaVencimiento : undefined,
            costoUnitario: articuloSeleccionado?.costoEstandar || 0,
            cantidadEmpaques: modoConteo === 'EMPAQUES' ? cantidadEmpaques : undefined,
            unidadesPorEmpaque: modoConteo === 'EMPAQUES' ? unidadesPorEmpaque : 1,
            tipoEmpaque: modoConteo === 'EMPAQUES' ? tipoEmpaque : 'Unidad'
          }
        ]
      };

      const ok = await onSave(payload);
      if (ok) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Recibir Insumo de Familiar
              </h3>
              <p className="text-xs text-[#DCB87F]">
                Custodia personal para {residente.nombreCompleto} ({residente.codigoExpediente})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Familiar Donante */}
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-[#B3803F]" />
              <span>Familiar o Acudiente que Entrega</span>
            </label>
            <div className="space-y-1.5">
              {residente.acudientes && residente.acudientes.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {residente.acudientes.map((acu) => {
                    const tag = `${acu.nombreCompleto} (${acu.parentesco || 'Acudiente'})`;
                    const selected = familiarDonante === tag;
                    return (
                      <button
                        key={acu.id}
                        type="button"
                        onClick={() => setFamiliarDonante(tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#182F28] text-[#DCB87F] border-[#182F28]'
                            : 'bg-[#F7F6F2] text-[#4B4636] border-[#DEDBD1] hover:bg-[#EAE7DC]'
                        }`}
                      >
                        {acu.nombreCompleto} ({acu.parentesco})
                      </button>
                    );
                  })}
                </div>
              )}
              <input
                type="text"
                value={familiarDonante}
                onChange={(e) => setFamiliarDonante(e.target.value)}
                placeholder="Nombre del familiar o persona que entrega"
                className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] focus:border-[#182F28] focus:ring-1 focus:ring-[#182F28] outline-none"
                required
              />
            </div>
          </div>

          {/* Selección de Artículo del Catálogo */}
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">
              Artículo / Insumo Recibido
            </label>
            <select
              value={idArticulo}
              onChange={(e) => setIdArticulo(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] focus:border-[#182F28] outline-none"
            >
              {articulosCatalogo.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.codigoArticulo} — {art.nombreArticulo} ({art.nombreCategoria})
                </option>
              ))}
            </select>
          </div>

          {/* Bodega Receptora */}
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#274A3F]" />
              <span>Bodega de Custodia</span>
            </label>
            <select
              value={idBodega}
              onChange={(e) => setIdBodega(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] focus:border-[#182F28] outline-none"
            >
              {bodegasSede.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombreBodega} {b.esBodegaPrincipal ? '(Principal)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Conmutador Modo Conteo: Por Empaque / Por Unidades */}
          <div className="p-3.5 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Modalidad de Recepción</span>
              </span>
              <div className="inline-flex rounded-lg border border-[#BBF7D0] bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setModoConteo('EMPAQUES')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    modoConteo === 'EMPAQUES'
                      ? 'bg-[#182F28] text-white shadow-2xs'
                      : 'text-[#5C6058] hover:text-[#182F28]'
                  }`}
                >
                  Por Empaque / Paquete
                </button>
                <button
                  type="button"
                  onClick={() => setModoConteo('UNIDADES')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    modoConteo === 'UNIDADES'
                      ? 'bg-[#182F28] text-white shadow-2xs'
                      : 'text-[#5C6058] hover:text-[#182F28]'
                  }`}
                >
                  Unidades Sueltas
                </button>
              </div>
            </div>

            {modoConteo === 'EMPAQUES' ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#182F28] mb-0.5">
                      Tipo Empaque
                    </label>
                    <input
                      type="text"
                      value={tipoEmpaque}
                      onChange={(e) => setTipoEmpaque(e.target.value)}
                      placeholder="Paquete, Caja, Bolsa"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#BBF7D0] rounded-lg text-xs font-semibold text-[#182F28] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#182F28] mb-0.5">
                      Cant. Empaques
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={cantidadEmpaques}
                      onChange={(e) => setCantidadEmpaques(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#BBF7D0] rounded-lg text-xs font-mono font-bold text-[#182F28] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#182F28] mb-0.5">
                      Uds x Empaque
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={unidadesPorEmpaque}
                      onChange={(e) => setUnidadesPorEmpaque(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#BBF7D0] rounded-lg text-xs font-mono font-bold text-[#182F28] outline-none"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-[#BBF7D0] flex items-center justify-between">
                  <span className="text-xs text-[#5C6058]">
                    Cálculo: <strong className="text-[#182F28]">{cantidadEmpaques} {tipoEmpaque}(s)</strong> × <strong className="text-[#182F28]">{unidadesPorEmpaque} uds</strong>
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    = {unidadesTotalesCalculadas} {articuloSeleccionado?.unidadMedida || 'UNIDAD'}(s)
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-[#182F28] mb-0.5">
                  Cantidad Total de Unidades Físicas
                </label>
                <input
                  type="number"
                  min={1}
                  value={cantidadUnidadesDirectas}
                  onChange={(e) => setCantidadUnidadesDirectas(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-white border border-[#BBF7D0] rounded-xl text-sm font-mono font-bold text-[#182F28] outline-none"
                />
              </div>
            )}
          </div>

          {/* Lote y Vencimiento si aplica */}
          {articuloSeleccionado?.requiereLoteVencimiento && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#FEF7EE] rounded-xl border border-[#DCB87F]/60">
              <div>
                <label className="block text-[11px] font-bold text-[#9A5B12] mb-0.5">
                  Número de Lote
                </label>
                <input
                  type="text"
                  value={numeroLote}
                  onChange={(e) => setNumeroLote(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#DCB87F] rounded-lg text-xs font-mono font-semibold text-[#182F28] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#9A5B12] mb-0.5">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#DCB87F] rounded-lg text-xs font-mono font-semibold text-[#182F28] outline-none"
                  required
                />
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">
              Observaciones / Novedad del Paquete
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Empaques sellados de fábrica, entregados en recepción..."
              className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] focus:border-[#182F28] outline-none"
            />
          </div>

          {/* Footer Botones */}
          <div className="pt-3 border-t border-[#DEDBD1] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5C6058] hover:bg-[#F2EFE9] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Package className="w-4 h-4" />
              <span>{loading ? 'Registrando...' : `Ingresar ${unidadesTotalesCalculadas} Unidades`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// 2. MODAL: REGISTRAR DISPENSACIÓN / CONSUMO ASISTENCIAL DEL RESIDENTE
// =========================================================================
interface InsumoDisponibleDispensar {
  idArticulo: number;
  codigoArticulo: string;
  nombreArticulo: string;
  categoria: string;
  unidadMedida: string;
  saldoDisponible: number;
  bodegaNombre: string;
  tipoEmpaque?: string;
  unidadesPorEmpaque?: number;
}

interface ModalDispensarInsumoResidenteProps {
  isOpen: boolean;
  onClose: () => void;
  residente: Residente;
  insumosDisponibles: InsumoDisponibleDispensar[];
  bodegasSede: BodegaSede[];
  onSave: (payload: RegistrarMovimientoPayload) => Promise<boolean>;
}

export const ModalDispensarInsumoResidente: React.FC<ModalDispensarInsumoResidenteProps> = ({
  isOpen,
  onClose,
  residente,
  insumosDisponibles,
  bodegasSede,
  onSave
}) => {
  const [idArticulo, setIdArticulo] = useState<number>(insumosDisponibles[0]?.idArticulo || 0);
  const [cantidad, setCantidad] = useState<number>(1);
  const [idBodega, setIdBodega] = useState<number>(bodegasSede[0]?.id || 1);
  const [motivoTurno, setMotivoTurno] = useState('Suministro y cuidado asistencial en turno diario');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (insumosDisponibles.length > 0 && !idArticulo) {
      setIdArticulo(insumosDisponibles[0].idArticulo);
    }
  }, [insumosDisponibles, idArticulo]);

  if (!isOpen) return null;

  const insumoSeleccionado = insumosDisponibles.find((i) => i.idArticulo === idArticulo) || insumosDisponibles[0];
  const saldoMax = insumoSeleccionado?.saldoDisponible || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoSeleccionado) {
      alert('Debe seleccionar un insumo con saldo disponible.');
      return;
    }

    if (cantidad <= 0 || cantidad > saldoMax) {
      alert(`La cantidad debe ser entre 1 y el saldo disponible (${saldoMax} unidades).`);
      return;
    }

    setLoading(true);
    try {
      const notaFinal = `Dispensación asistencial para el residente ${residente.nombreCompleto} (Habitación ${residente.habitacion}). Motivo: ${motivoTurno}`;

      const payload: RegistrarMovimientoPayload = {
        idCentro: residente.idCentro,
        idBodega,
        tipoMovimiento: 'SALIDA_ENTREGA_RESIDENTE',
        idResidente: residente.id,
        observaciones: notaFinal,
        detalles: [
          {
            idArticulo: insumoSeleccionado.idArticulo,
            cantidad,
            costoUnitario: 0
          }
        ]
      };

      const ok = await onSave(payload);
      if (ok) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Minus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Dispensar Insumo Asistencial
              </h3>
              <p className="text-xs text-[#DCB87F]">
                Descontar de la custodia de {residente.nombreCompleto}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {insumosDisponibles.length === 0 ? (
            <div className="p-6 bg-[#FEF2F2] rounded-2xl border border-[#FECACA] text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h4 className="font-serif font-bold text-sm text-rose-900">
                Sin Insumos Custodiados con Saldo
              </h4>
              <p className="text-xs text-rose-700">
                El residente no tiene existencias disponibles en este momento. Primero debe registrarse un ingreso o aporte familiar.
              </p>
            </div>
          ) : (
            <>
              {/* Selector de Insumo */}
              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Insumo en Custodia a Dispensar
                </label>
                <select
                  value={idArticulo}
                  onChange={(e) => {
                    const nid = Number(e.target.value);
                    setIdArticulo(nid);
                    setCantidad(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] focus:border-[#182F28] outline-none"
                >
                  {insumosDisponibles.map((ins) => (
                    <option key={ins.idArticulo} value={ins.idArticulo}>
                      {ins.nombreArticulo} — Saldo Disponible: {ins.saldoDisponible} {ins.unidadMedida}s
                    </option>
                  ))}
                </select>
              </div>

              {/* Saldo y Cantidad a Dispensar */}
              <div className="p-3.5 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5C6058]">Saldo actual en bodega:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {saldoMax} {insumoSeleccionado?.unidadMedida}s
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Cantidad a Dispensar (Unidades Físicas)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                      className="w-9 h-9 rounded-xl bg-white border border-[#DEDBD1] font-bold text-[#182F28] hover:bg-[#EAE7DC] flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={saldoMax}
                      value={cantidad}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setCantidad(Math.min(saldoMax, Math.max(1, val)));
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-center text-sm font-mono font-bold text-[#182F28] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCantidad((prev) => Math.min(saldoMax, prev + 1))}
                      className="w-9 h-9 rounded-xl bg-white border border-[#DEDBD1] font-bold text-[#182F28] hover:bg-[#EAE7DC] flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-[#7A745F] text-right">
                  Nuevo saldo tras entrega: <strong className="font-mono text-[#182F28]">{saldoMax - cantidad}</strong> {insumoSeleccionado?.unidadMedida}s
                </div>
              </div>

              {/* Bodega */}
              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Bodega de Despacho
                </label>
                <select
                  value={idBodega}
                  onChange={(e) => setIdBodega(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] focus:border-[#182F28] outline-none"
                >
                  {bodegasSede.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombreBodega} {b.esBodegaPrincipal ? '(Principal)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motivo de Turno */}
              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Justificación Clínica / Turno de Atención
                </label>
                <textarea
                  rows={2}
                  value={motivoTurno}
                  onChange={(e) => setMotivoTurno(e.target.value)}
                  placeholder="Ej: Cambio de pañal turno noche, curación asistencial..."
                  className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] focus:border-[#182F28] outline-none"
                  required
                />
              </div>
            </>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-[#DEDBD1] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5C6058] hover:bg-[#F2EFE9] rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            {insumosDisponibles.length > 0 && (
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
                <span>{loading ? 'Dispensando...' : `Dispensar ${cantidad} Unidades`}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
