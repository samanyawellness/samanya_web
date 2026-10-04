import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Package,
  Plus,
  Minus,
  Printer,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  Clock,
  User,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import {
  Residente,
  SedeCentro,
  ArticuloCatalogo,
  BodegaSede,
  MovimientoInventario,
  RegistrarMovimientoPayload
} from '../../types';
import {
  ModalRecibirInsumoFamiliar,
  ModalDispensarInsumoResidente
} from './ResidentInventoryModals';
import { ImprimirConstanciaInventarioModal } from './ImprimirConstanciaInventarioModal';

interface ResidentInventoryTabContentProps {
  resident: Residente;
  activeSede: SedeCentro;
  familiares: any[];
  movimientosInventario: MovimientoInventario[];
  articulosCatalogo: ArticuloCatalogo[];
  bodegasSede: BodegaSede[];
  registrarMovimientoStock: (payload: RegistrarMovimientoPayload) => Promise<boolean>;
}

export const ResidentInventoryTabContent: React.FC<ResidentInventoryTabContentProps> = ({
  resident,
  activeSede,
  familiares,
  movimientosInventario,
  articulosCatalogo,
  bodegasSede,
  registrarMovimientoStock
}) => {
  const [subTab, setSubTab] = useState<'EXISTENCIAS' | 'KARDEX'>('EXISTENCIAS');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'ENTRADAS' | 'SALIDAS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [mostrarModalAporte, setMostrarModalAporte] = useState(false);
  const [mostrarModalDispensar, setMostrarModalDispensar] = useState(false);
  const [mostrarModalConstancia, setMostrarModalConstancia] = useState(false);

  // 1. Filtrar movimientos asociados a este residente
  const movimientosResidente = useMemo(() => {
    if (!resident?.id) return [];
    return (movimientosInventario || [])
      .filter((m) => m.idResidente === resident.id)
      .sort((a, b) => new Date(b.fechaMovimiento).getTime() - new Date(a.fechaMovimiento).getTime());
  }, [movimientosInventario, resident?.id]);

  // 2. Calcular saldos y existencias consolidadas por artículo
  const insumosResidente = useMemo(() => {
    if (!resident?.id || movimientosResidente.length === 0) return [];

    const mapInsumos = new Map<
      number,
      {
        idArticulo: number;
        codigoArticulo: string;
        nombreArticulo: string;
        categoria: string;
        colorCategoria?: string;
        unidadMedida: string;
        tipoEmpaque?: string;
        unidadesPorEmpaque?: number;
        totalEntradas: number;
        totalSalidas: number;
        saldoDisponible: number;
        bodegaNombre: string;
        empaquesEquivalentes?: string;
        ultimaEntrada?: { fecha: string; donante?: string; cantidad: number; empaques?: string };
        ultimoConsumo?: { fecha: string; enfermera?: string; cantidad: number };
      }
    >();

    // Orden cronológico ascendente para construir saldos
    const movsCronologicos = [...movimientosResidente].sort(
      (a, b) => new Date(a.fechaMovimiento).getTime() - new Date(b.fechaMovimiento).getTime()
    );

    for (const mov of movsCronologicos) {
      for (const det of mov.detalles) {
        const art = articulosCatalogo.find((a) => a.id === det.idArticulo);
        const bodega = bodegasSede.find((b) => b.id === det.idBodega);
        const idArt = det.idArticulo;

        if (!mapInsumos.has(idArt)) {
          mapInsumos.set(idArt, {
            idArticulo: idArt,
            codigoArticulo: det.codigoArticulo || art?.codigoArticulo || 'INS',
            nombreArticulo: det.nombreArticulo || art?.nombreArticulo || 'Insumo',
            categoria: art?.nombreCategoria || 'General',
            colorCategoria: art?.colorCategoria || '#0EA5E9',
            unidadMedida: det.unidadMedida || art?.unidadMedida || 'UNIDAD',
            tipoEmpaque: det.tipoEmpaque || art?.tipoEmpaque || 'Paquete',
            unidadesPorEmpaque: det.unidadesPorEmpaque || art?.unidadesPorEmpaque || 1,
            totalEntradas: 0,
            totalSalidas: 0,
            saldoDisponible: 0,
            bodegaNombre: bodega?.nombreBodega || 'Bodega Principal'
          });
        }

        const item = mapInsumos.get(idArt)!;
        const esEntrada =
          mov.tipoMovimiento.startsWith('ENTRADA') || mov.tipoMovimiento === 'AJUSTE_FISICO_POSITIVO';

        if (esEntrada) {
          item.totalEntradas += det.cantidad;
          item.saldoDisponible += det.cantidad;
          const empaqueStr =
            det.cantidadEmpaques && det.unidadesPorEmpaque
              ? `${det.cantidadEmpaques} ${det.tipoEmpaque || 'paq'}(s) x ${det.unidadesPorEmpaque} uds`
              : undefined;
          item.ultimaEntrada = {
            fecha: mov.fechaMovimiento,
            donante: mov.observaciones || mov.nombreUsuarioRegistra,
            cantidad: det.cantidad,
            empaques: empaqueStr
          };
        } else {
          item.totalSalidas += det.cantidad;
          item.saldoDisponible = Math.max(0, item.saldoDisponible - det.cantidad);
          item.ultimoConsumo = {
            fecha: mov.fechaMovimiento,
            enfermera: mov.nombreUsuarioRegistra || 'Enfermería',
            cantidad: det.cantidad
          };
        }
      }
    }

    // Calcular equivalencias en empaques comerciales
    const lista = Array.from(mapInsumos.values()).map((ins) => {
      const uEmpaque = ins.unidadesPorEmpaque || 1;
      let empaqueTexto = `${ins.saldoDisponible} uds`;
      if (uEmpaque > 1) {
        const paqCompletos = Math.floor(ins.saldoDisponible / uEmpaque);
        const sueltas = ins.saldoDisponible % uEmpaque;
        empaqueTexto = `${paqCompletos} ${ins.tipoEmpaque || 'paq'}(s) + ${sueltas} uds`;
      }
      return {
        ...ins,
        empaquesEquivalentes: empaqueTexto
      };
    });

    return lista;
  }, [movimientosResidente, articulosCatalogo, bodegasSede, resident?.id]);

  // Métricas
  const totalInsumosCustodia = insumosResidente.filter((i) => i.saldoDisponible > 0).length;
  const totalUnidadesDisponibles = insumosResidente.reduce((acc, i) => acc + i.saldoDisponible, 0);
  const totalUnidadesRecibidas = insumosResidente.reduce((acc, i) => acc + i.totalEntradas, 0);
  const totalUnidadesConsumidas = insumosResidente.reduce((acc, i) => acc + i.totalSalidas, 0);

  // Insumos disponibles para dispensar
  const insumosParaDispensar = insumosResidente.filter((i) => i.saldoDisponible > 0);

  // Movimientos filtrados
  const movimientosFiltrados = useMemo(() => {
    return movimientosResidente.filter((m) => {
      const esEntrada =
        m.tipoMovimiento.startsWith('ENTRADA') || m.tipoMovimiento === 'AJUSTE_FISICO_POSITIVO';
      const esSalida =
        m.tipoMovimiento.startsWith('SALIDA') || m.tipoMovimiento === 'AJUSTE_FISICO_NEGATIVO';

      if (filtroTipo === 'ENTRADAS' && !esEntrada) return false;
      if (filtroTipo === 'SALIDAS' && !esSalida) return false;

      if (busqueda) {
        const q = busqueda.toLowerCase();
        const matchDoc = m.numeroDocumento.toLowerCase().includes(q);
        const matchObs = (m.observaciones || '').toLowerCase().includes(q);
        const matchArt = m.detalles.some(
          (d) => (d.nombreArticulo || '').toLowerCase().includes(q) || (d.codigoArticulo || '').toLowerCase().includes(q)
        );
        if (!matchDoc && !matchObs && !matchArt) return false;
      }

      return true;
    });
  }, [movimientosResidente, filtroTipo, busqueda]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDBD1] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#1E7A4C] border border-[#A5D6A7] flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-[#182F28] flex items-center gap-2">
              <span>Inventario & Insumos Personales en Custodia</span>
              {totalInsumosCustodia > 0 && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {totalInsumosCustodia} activo(s)
                </span>
              )}
            </h4>
            <p className="text-xs text-[#5C6058]">
              Control de pañales, suplementos y productos entregados por familiares o asignados al residente en {activeSede.nombre}
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setMostrarModalConstancia(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F2EFE9] text-[#182F28] border border-[#DEDBD1] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Generar constancia formal de existencias y consumos para entregar a acudientes"
          >
            <Printer className="w-3.5 h-3.5 text-[#B3803F]" />
            <span>Constancia Acudiente</span>
          </button>

          <button
            type="button"
            onClick={() => setMostrarModalAporte(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs border border-[#DCB87F]/40"
            title="Registrar donación o aporte de insumos traídos por el familiar"
          >
            <Plus className="w-3.5 h-3.5 text-[#DCB87F]" />
            <span>Recibir Insumo de Familiar</span>
          </button>

          <button
            type="button"
            onClick={() => setMostrarModalDispensar(true)}
            disabled={insumosParaDispensar.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            title="Dispensar insumos custodiados para el cuidado del residente"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Dispensar Insumo</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Insumos en Custodia */}
        <div className="p-3.5 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>Insumos Custodiados</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-950">
            {totalInsumosCustodia}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">
            Artículos con existencias activas
          </div>
        </div>

        {/* Card 2: Saldo Disponible */}
        <div className="p-3.5 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] shadow-2xs">
          <div className="flex items-center justify-between text-teal-800 text-xs font-bold uppercase tracking-wider">
            <span>Saldo Físico Total</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-teal-950">
            {totalUnidadesDisponibles} <span className="text-xs font-sans font-semibold">uds</span>
          </div>
          <div className="text-[11px] text-teal-700 mt-0.5">
            Disponibles para uso asistencial
          </div>
        </div>

        {/* Card 3: Total Recibido (Aportes) */}
        <div className="p-3.5 bg-[#EFF6FF] rounded-2xl border border-[#BFDBFE] shadow-2xs">
          <div className="flex items-center justify-between text-blue-800 text-xs font-bold uppercase tracking-wider">
            <span>Aportes Familiares</span>
            <ArrowDownLeft className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-blue-950">
            {totalUnidadesRecibidas} <span className="text-xs font-sans font-semibold">uds</span>
          </div>
          <div className="text-[11px] text-blue-700 mt-0.5">
            Total histórico recibido
          </div>
        </div>

        {/* Card 4: Total Consumido */}
        <div className="p-3.5 bg-[#FFF1F2] rounded-2xl border border-[#FECDD3] shadow-2xs">
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold uppercase tracking-wider">
            <span>Dispensado en Turnos</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-rose-950">
            {totalUnidadesConsumidas} <span className="text-xs font-sans font-semibold">uds</span>
          </div>
          <div className="text-[11px] text-rose-700 mt-0.5">
            Consumo en atención diaria
          </div>
        </div>
      </div>

      {/* Subpestañas: Existencias vs Kardex */}
      <div className="flex items-center justify-between border-b border-[#DEDBD1] gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('EXISTENCIAS')}
            className={`py-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              subTab === 'EXISTENCIAS'
                ? 'border-[#182F28] text-[#182F28] bg-white rounded-t-xl'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-[#1E7A4C]" />
            <span>Existencias y Saldos de Insumos</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {insumosResidente.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('KARDEX')}
            className={`py-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              subTab === 'KARDEX'
                ? 'border-[#182F28] text-[#182F28] bg-white rounded-t-xl'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#274A3F]" />
            <span>Kardex & Movimientos Históricos</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#182F28]/10 text-[#182F28] font-bold">
              {movimientosResidente.length}
            </span>
          </button>
        </div>
      </div>

      {/* VISTA 1: EXISTENCIAS Y SALDOS */}
      {subTab === 'EXISTENCIAS' && (
        <div className="space-y-4">
          {insumosResidente.length === 0 ? (
            <div className="p-8 text-center bg-[#F7F6F2] rounded-3xl border border-[#DEDBD1] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <Boxes className="w-6 h-6" />
              </div>
              <h5 className="font-serif font-bold text-base text-[#182F28]">
                Sin Insumos en Custodia para este Residente
              </h5>
              <p className="text-xs text-[#7A745F] max-w-md mx-auto leading-relaxed">
                Cuando los familiares entreguen pañales, suplementos nutricionales o insumos personales, puedes registrarlos aquí con su factor de empaque y conversión automática a unidades.
              </p>
              <button
                type="button"
                onClick={() => setMostrarModalAporte(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer border border-[#DCB87F]/30"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Primer Aporte de Familiar</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insumosResidente.map((ins) => {
                const porcentajeRestante =
                  ins.totalEntradas > 0
                    ? Math.round((ins.saldoDisponible / ins.totalEntradas) * 100)
                    : 0;

                const esAgotado = ins.saldoDisponible === 0;
                const esBajo = ins.saldoDisponible > 0 && ins.saldoDisponible <= 15;

                return (
                  <div
                    key={ins.idArticulo}
                    className="p-4 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs hover:border-[#182F28]/40 transition-all space-y-3"
                  >
                    {/* Encabezado Insumo */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: ins.colorCategoria || '#0EA5E9' }}
                          >
                            {ins.categoria}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-[#7A745F]">
                            {ins.codigoArticulo}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-[#182F28] leading-snug">
                          {ins.nombreArticulo}
                        </h5>
                        <p className="text-[11px] text-[#5C6058] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#274A3F]" />
                          <span>Custodiado en: <strong>{ins.bodegaNombre}</strong></span>
                        </p>
                      </div>

                      {/* Badge Estado */}
                      <div>
                        {esAgotado ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                            Agotado
                          </span>
                        ) : esBajo ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Por Agotarse</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Óptimo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Saldo y Empaques */}
                    <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#7A745F]">
                          Saldo Disponible
                        </div>
                        <div className="text-xl font-bold font-mono text-[#182F28]">
                          {ins.saldoDisponible}{' '}
                          <span className="text-xs font-sans font-semibold text-[#5C6058]">
                            {ins.unidadMedida}s
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-[#7A745F]">
                          Empaques Comerciales
                        </div>
                        <div className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-200 inline-block font-mono">
                          {ins.empaquesEquivalentes}
                        </div>
                      </div>
                    </div>

                    {/* Barra de Nivel de Existencias */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-[#5C6058]">
                        <span>Nivel de existencias</span>
                        <span className="font-semibold">{porcentajeRestante}% disponible</span>
                      </div>
                      <div className="w-full bg-[#EAE7DC] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            esAgotado
                              ? 'bg-rose-500'
                              : esBajo
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, porcentajeRestante))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#7A745F] font-mono">
                        <span>Recibido: {ins.totalEntradas} uds</span>
                        <span>Consumido: {ins.totalSalidas} uds</span>
                      </div>
                    </div>

                    {/* Última actividad */}
                    <div className="pt-2 border-t border-[#DEDBD1]/60 text-[11px] space-y-1 text-[#5C6058]">
                      {ins.ultimaEntrada && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            <span>Último aporte:</span>
                          </span>
                          <span className="font-medium text-[#182F28]">
                            {ins.ultimaEntrada.fecha.slice(0, 10)}
                            {ins.ultimaEntrada.empaques ? ` (${ins.ultimaEntrada.empaques})` : ''}
                          </span>
                        </div>
                      )}
                      {ins.ultimoConsumo && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                            <span>Última dispensación:</span>
                          </span>
                          <span className="font-medium text-[#182F28]">
                            {ins.ultimoConsumo.fecha.slice(0, 10)} ({ins.ultimoConsumo.cantidad} uds)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botón rápido */}
                    {ins.saldoDisponible > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setMostrarModalDispensar(true)}
                          className="w-full py-1.5 px-3 bg-white hover:bg-[#F2EFE9] text-[#182F28] font-bold text-xs rounded-xl border border-[#DEDBD1] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 text-rose-600" />
                          <span>Dispensar este Insumo</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: KARDEX Y MOVIMIENTOS HISTÓRICOS */}
      {subTab === 'KARDEX' && (
        <div className="space-y-3">
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#F7F6F2] p-2.5 rounded-2xl border border-[#DEDBD1]">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs font-bold text-[#5C6058] px-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Tipo:</span>
              </span>
              <button
                type="button"
                onClick={() => setFiltroTipo('TODOS')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filtroTipo === 'TODOS'
                    ? 'bg-[#182F28] text-white shadow-2xs'
                    : 'bg-white text-[#5C6058] hover:bg-[#EAE7DC]'
                }`}
              >
                Todos ({movimientosResidente.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo('ENTRADAS')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filtroTipo === 'ENTRADAS'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white text-[#5C6058] hover:bg-[#EAE7DC]'
                }`}
              >
                Aportes Familiares
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo('SALIDAS')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filtroTipo === 'SALIDAS'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-white text-[#5C6058] hover:bg-[#EAE7DC]'
                }`}
              >
                Dispensaciones
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A745F]" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por documento, insumo o notas..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DEDBD1] rounded-xl text-xs font-medium text-[#182F28] outline-none"
              />
            </div>
          </div>

          {/* Tabla Kardex */}
          <div className="overflow-x-auto border border-[#DEDBD1] rounded-2xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#182F28] text-white font-serif">
                <tr>
                  <th className="py-2.5 px-3">Fecha & Hora</th>
                  <th className="py-2.5 px-3">Documento</th>
                  <th className="py-2.5 px-3">Tipo Movimiento</th>
                  <th className="py-2.5 px-3">Insumo / Detalle</th>
                  <th className="py-2.5 px-3 text-center">Cantidad Total</th>
                  <th className="py-2.5 px-3">Bodega</th>
                  <th className="py-2.5 px-3">Registrado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEDBD1]">
                {movimientosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#7A745F]">
                      No se encontraron movimientos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  movimientosFiltrados.map((mov) => {
                    const esEntrada =
                      mov.tipoMovimiento.startsWith('ENTRADA') ||
                      mov.tipoMovimiento === 'AJUSTE_FISICO_POSITIVO';

                    return (
                      <tr key={mov.id} className="hover:bg-[#F7F6F2] transition-colors">
                        <td className="py-3 px-3 text-[11px] text-[#5C6058] whitespace-nowrap">
                          <div className="font-semibold text-[#182F28]">
                            {mov.fechaMovimiento.slice(0, 10)}
                          </div>
                          <div className="text-[10px] text-[#7A745F]">
                            {mov.fechaMovimiento.slice(11, 16)}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-[11px] text-[#182F28] whitespace-nowrap">
                          {mov.numeroDocumento}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              esEntrada
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {esEntrada ? (
                              <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-rose-700" />
                            )}
                            {esEntrada ? 'Aporte Familiar' : 'Dispensación Turno'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {mov.detalles.map((det) => (
                            <div key={det.id} className="space-y-0.5">
                              <div className="font-bold text-[#182F28]">
                                {det.nombreArticulo}
                              </div>
                              {det.cantidadEmpaques && det.unidadesPorEmpaque && (
                                <div className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded inline-block border border-emerald-200">
                                  {det.cantidadEmpaques} {det.tipoEmpaque || 'paq'}(s) × {det.unidadesPorEmpaque} uds
                                </div>
                              )}
                            </div>
                          ))}
                          {mov.observaciones && (
                            <p className="text-[10px] text-[#7A745F] mt-1 max-w-[280px] leading-tight">
                              {mov.observaciones}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold whitespace-nowrap">
                          <span
                            className={`text-sm ${
                              esEntrada ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {esEntrada ? `+${mov.totalArticulos}` : `-${mov.totalArticulos}`}
                          </span>
                          <span className="text-[10px] block font-sans font-normal text-[#5C6058]">
                            unidades
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[11px] text-[#5C6058] whitespace-nowrap">
                          {bodegasSede.find((b) => b.id === mov.detalles[0]?.idBodega)?.nombreBodega || 'Bodega Principal'}
                        </td>

                        <td className="py-3 px-3 text-[11px] text-[#5C6058]">
                          <div className="font-semibold text-[#182F28]">
                            {mov.nombreUsuarioRegistra}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submodales */}
      <ModalRecibirInsumoFamiliar
        isOpen={mostrarModalAporte}
        onClose={() => setMostrarModalAporte(false)}
        residente={resident}
        familiares={familiares}
        articulosCatalogo={articulosCatalogo}
        bodegasSede={bodegasSede}
        onSave={registrarMovimientoStock}
      />

      <ModalDispensarInsumoResidente
        isOpen={mostrarModalDispensar}
        onClose={() => setMostrarModalDispensar(false)}
        residente={resident}
        insumosDisponibles={insumosParaDispensar}
        bodegasSede={bodegasSede}
        onSave={registrarMovimientoStock}
      />

      <ImprimirConstanciaInventarioModal
        isOpen={mostrarModalConstancia}
        onClose={() => setMostrarModalConstancia(false)}
        residente={resident}
        activeSede={activeSede}
        insumos={insumosResidente}
        movimientos={movimientosResidente}
      />
    </div>
  );
};
