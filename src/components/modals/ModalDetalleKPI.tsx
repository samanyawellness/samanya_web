import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Package,
  AlertTriangle,
  Layers,
  ArrowLeftRight,
  TrendingDown,
  Building2,
  Calendar,
  Clock,
  User,
  Plus,
  ArrowDownLeft,
  CheckCircle2,
  DollarSign,
  History,
  FileText,
  Boxes,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  SedeCentro,
  InventarioStockSede,
  BodegaSede,
  ArticuloCatalogo,
  TrasladoSedes
} from '../../types';

export type TipoKPIModal = 'ARTICULOS_STOCK' | 'STOCK_BAJO' | 'UNIDADES_TOTALES' | 'TRASLADOS_RECIBIR';

interface ModalDetalleKPIProps {
  isOpen: boolean;
  tipoKPI: TipoKPIModal | null;
  onClose: () => void;
  activeSede: SedeCentro;
  stockDeSede: InventarioStockSede[];
  bodegasDeSede: BodegaSede[];
  articulosCatalogo: ArticuloCatalogo[];
  trasladosPendientes: TrasladoSedes[];
  manejaPrecios: boolean;
  permiteTraslados: boolean;
  onVerEnTablaStock: (filtroAlerta?: 'TODOS' | 'BAJO') => void;
  onVerEnTraslados: () => void;
  onRecibirTraslado: (idTraslado: number, codigo: string) => Promise<void>;
  onAbrirMovimiento: () => void;
  onAbrirTraslado: () => void;
  onVerKardexArticulo: (articulo: ArticuloCatalogo) => void;
}

export const ModalDetalleKPI: React.FC<ModalDetalleKPIProps> = ({
  isOpen,
  tipoKPI,
  onClose,
  activeSede,
  stockDeSede,
  bodegasDeSede,
  articulosCatalogo,
  trasladosPendientes,
  manejaPrecios,
  permiteTraslados,
  onVerEnTablaStock,
  onVerEnTraslados,
  onRecibirTraslado,
  onAbrirMovimiento,
  onAbrirTraslado,
  onVerKardexArticulo
}) => {
  // Estado local para buscador y paginación dentro del modal
  const [searchTerm, setSearchTerm] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 6;

  // Reiniciar filtros de búsqueda y página cuando cambia el KPI o se abre el modal
  useEffect(() => {
    setSearchTerm('');
    setPaginaActual(1);
  }, [tipoKPI, isOpen]);

  // Cálculos de items con stock bajo
  const itemsBajos = useMemo(() => {
    return stockDeSede.filter((s) => s.estadoSuministro === 'BAJO');
  }, [stockDeSede]);

  // Filtrado y paginación para ARTICULOS_STOCK
  const stockFiltrado = useMemo(() => {
    if (!searchTerm.trim()) return stockDeSede;
    const q = searchTerm.toLowerCase();
    return stockDeSede.filter((item) => {
      const art = articulosCatalogo.find((a) => a.id === item.idArticulo);
      const cod = (item.codigoArticulo || '').toLowerCase();
      const nom = (item.nombreArticulo || '').toLowerCase();
      const cat = (item.categoria || '').toLowerCase();
      const bod = (item.nombreBodega || '').toLowerCase();
      const desc = (art?.descripcion || '').toLowerCase();
      return cod.includes(q) || nom.includes(q) || cat.includes(q) || bod.includes(q) || desc.includes(q);
    });
  }, [stockDeSede, searchTerm, articulosCatalogo]);

  const totalPaginasStock = Math.ceil(stockFiltrado.length / itemsPorPagina) || 1;
  const stockPaginado = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return stockFiltrado.slice(inicio, inicio + itemsPorPagina);
  }, [stockFiltrado, paginaActual, itemsPorPagina]);

  // Filtrado y paginación para STOCK_BAJO
  const itemsBajosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return itemsBajos;
    const q = searchTerm.toLowerCase();
    return itemsBajos.filter((item) => {
      const cod = (item.codigoArticulo || '').toLowerCase();
      const nom = (item.nombreArticulo || '').toLowerCase();
      const cat = (item.categoria || '').toLowerCase();
      const bod = (item.nombreBodega || '').toLowerCase();
      return cod.includes(q) || nom.includes(q) || cat.includes(q) || bod.includes(q);
    });
  }, [itemsBajos, searchTerm]);

  const totalPaginasBajos = Math.ceil(itemsBajosFiltrados.length / 4) || 1;
  const itemsBajosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * 4;
    return itemsBajosFiltrados.slice(inicio, inicio + 4);
  }, [itemsBajosFiltrados, paginaActual]);

  // Filtrado y paginación para TRASLADOS_RECIBIR
  const trasladosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return trasladosPendientes;
    const q = searchTerm.toLowerCase();
    return trasladosPendientes.filter((t) => {
      const cod = (t.codigoTraslado || '').toLowerCase();
      const ori = (t.nombreCentroOrigen || '').toLowerCase();
      const des = (t.nombreCentroDestino || '').toLowerCase();
      const obs = (t.notasDespacho || '').toLowerCase();
      const matchItem = t.detalles.some((d) => (d.nombreArticulo || '').toLowerCase().includes(q));
      return cod.includes(q) || ori.includes(q) || des.includes(q) || obs.includes(q) || matchItem;
    });
  }, [trasladosPendientes, searchTerm]);

  const totalPaginasTraslados = Math.ceil(trasladosFiltrados.length / 3) || 1;
  const trasladosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * 3;
    return trasladosFiltrados.slice(inicio, inicio + 3);
  }, [trasladosFiltrados, paginaActual]);

  // Cálculos de distribución por bodega
  const desgloseBodegas = useMemo(() => {
    return bodegasDeSede.map((b) => {
      const itemsBodega = stockDeSede.filter((s) => s.idBodega === b.id);
      const totalUds = itemsBodega.reduce((acc, curr) => acc + curr.cantidadDisponible, 0);
      const valorTot = itemsBodega.reduce((acc, curr) => acc + (curr.valorTotalStock || 0), 0);
      return {
        bodega: b,
        totalArticulos: itemsBodega.length,
        totalUnidades: totalUds,
        valorTotal: valorTot
      };
    });
  }, [bodegasDeSede, stockDeSede]);

  // Cálculos de distribución por categoría
  const desgloseCategorias = useMemo(() => {
    const categoriasMap = new Map<
      string,
      { nombre: string; color?: string; totalUds: number; totalArticulos: number }
    >();
    stockDeSede.forEach((s) => {
      const cat = s.categoria || 'General';
      if (!categoriasMap.has(cat)) {
        categoriasMap.set(cat, {
          nombre: cat,
          color: s.colorCategoria,
          totalUds: 0,
          totalArticulos: 0
        });
      }
      const c = categoriasMap.get(cat)!;
      c.totalUds += s.cantidadDisponible;
      c.totalArticulos += 1;
    });
    return Array.from(categoriasMap.values());
  }, [stockDeSede]);

  const totalUnidadesFisicas = useMemo(() => {
    return stockDeSede.reduce((acc, curr) => acc + curr.cantidadDisponible, 0);
  }, [stockDeSede]);

  const valorTotalInventario = useMemo(() => {
    return stockDeSede.reduce((acc, curr) => acc + (curr.valorTotalStock || 0), 0);
  }, [stockDeSede]);

  if (!isOpen || !tipoKPI) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* ========================================================================= */}
        {/* HEADER DEL MODAL */}
        {/* ========================================================================= */}
        <div className="p-5 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tipoKPI === 'ARTICULOS_STOCK' && (
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
            )}
            {tipoKPI === 'STOCK_BAJO' && (
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            {tipoKPI === 'UNIDADES_TOTALES' && (
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                {manejaPrecios ? <DollarSign className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
              </div>
            )}
            {tipoKPI === 'TRASLADOS_RECIBIR' && (
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
            )}

            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                {tipoKPI === 'ARTICULOS_STOCK' && `Artículos en Stock (${stockDeSede.length})`}
                {tipoKPI === 'STOCK_BAJO' && `Artículos con Stock Bajo / Reorden (${itemsBajos.length})`}
                {tipoKPI === 'UNIDADES_TOTALES' &&
                  (manejaPrecios
                    ? `Valorización de Stock ($${valorTotalInventario.toLocaleString('es-CO')})`
                    : `Unidades Físicas Totales (${totalUnidadesFisicas.toLocaleString('es-CO')} uds.)`)}
                {tipoKPI === 'TRASLADOS_RECIBIR' && `Traslados Por Recibir (${trasladosPendientes.length})`}
              </h3>
              <p className="text-xs text-[#DCB87F]">
                Sede Activa: {activeSede.nombre} — Control de Almacén
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

        {/* ========================================================================= */}
        {/* CUERPO DEL MODAL (SEGÚN TIPO DE KPI) */}
        {/* ========================================================================= */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* ----------------------------------------------------------------------- */}
          {/* CASO 1: ARTÍCULOS EN STOCK */}
          {/* ----------------------------------------------------------------------- */}
          {tipoKPI === 'ARTICULOS_STOCK' && (
            <div className="space-y-4">
              {/* Buscador y Resumen */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F7F6F2] p-3 rounded-2xl border border-[#DEDBD1]">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A745F]" />
                  <input
                    type="text"
                    placeholder="Buscar por código, artículo, bodega o categoría..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPaginaActual(1);
                    }}
                    className="w-full pl-10 pr-8 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setPaginaActual(1);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[#5C6058]">
                  <span>
                    Mostrando <strong>{stockFiltrado.length}</strong> de <strong>{stockDeSede.length}</strong> artículos
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onVerEnTablaStock('TODOS');
                    }}
                    className="font-bold text-[#182F28] hover:text-[#B3803F] underline cursor-pointer whitespace-nowrap"
                  >
                    Ver en tabla general →
                  </button>
                </div>
              </div>

              {/* Tabla de Artículos en Stock */}
              <div className="border border-[#DEDBD1] rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#182F28] text-white font-serif">
                      <tr>
                        <th className="py-3 px-3">Código</th>
                        <th className="py-3 px-3">Artículo / Categoría</th>
                        <th className="py-3 px-3">Bodega</th>
                        <th className="py-3 px-3 text-center">Disponible</th>
                        <th className="py-3 px-3 text-center">Stock Mínimo</th>
                        {/* Columna de Estado ampliada con ancho y alineación generosos */}
                        <th className="py-3 px-4 text-center min-w-[130px] w-36">Estado</th>
                        <th className="py-3 px-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DEDBD1]">
                      {stockPaginado.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#7A745F]">
                            No se encontraron artículos con el criterio de búsqueda "{searchTerm}".
                          </td>
                        </tr>
                      ) : (
                        stockPaginado.map((item) => {
                          const art = articulosCatalogo.find((a) => a.id === item.idArticulo);
                          const esBajo = item.estadoSuministro === 'BAJO';
                          const uEmpaque = art?.unidadesPorEmpaque || 1;
                          const empaquesTexto =
                            uEmpaque > 1
                              ? `${Math.floor(item.cantidadDisponible / uEmpaque)} ${art?.tipoEmpaque || 'paq'}(s) + ${item.cantidadDisponible % uEmpaque} uds`
                              : null;

                          return (
                            <tr key={item.id} className="hover:bg-[#F7F6F2] transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-[#182F28]">
                                {item.codigoArticulo}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-[#182F28]">{item.nombreArticulo}</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className="text-[10px] font-bold px-1.5 py-0.2 rounded text-white"
                                    style={{ backgroundColor: item.colorCategoria || '#0EA5E9' }}
                                  >
                                    {item.categoria}
                                  </span>
                                  {empaquesTexto && (
                                    <span className="text-[10px] text-[#7A745F] font-mono">
                                      {empaquesTexto}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-[#5C6058]">{item.nombreBodega}</td>
                              <td className="py-3 px-3 text-center font-mono font-bold text-sm text-[#182F28]">
                                {item.cantidadDisponible} <span className="text-[10px] font-normal text-[#7A745F]">{item.unidadMedida}s</span>
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-[#5C6058]">
                                {item.stockMinimo} uds
                              </td>
                              {/* Celda de Estado con badge sin saltos de línea (whitespace-nowrap) */}
                              <td className="py-3 px-4 text-center min-w-[130px]">
                                <span
                                  className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap inline-flex items-center justify-center shadow-2xs ${
                                    esBajo
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  }`}
                                >
                                  {esBajo ? 'Stock Bajo' : 'Óptimo'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                {art && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      onVerKardexArticulo(art);
                                    }}
                                    className="py-1 px-2.5 bg-[#F7F6F2] hover:bg-[#EAE7DC] text-[#182F28] font-bold text-[11px] rounded-lg border border-[#DEDBD1] transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <History className="w-3 h-3 text-[#B3803F]" />
                                    <span>Kardex</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Barra de Paginación */}
                {totalPaginasStock > 1 && (
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#F7F6F2] border-t border-[#DEDBD1] text-xs">
                    <span className="text-[#7A745F] font-mono">
                      Página {paginaActual} de {totalPaginasStock} ({stockFiltrado.length} artículos)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={paginaActual === 1}
                        onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                        className="px-2.5 py-1 rounded-lg border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#EAE7DC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 font-semibold"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Anterior</span>
                      </button>
                      <span className="font-bold text-[#182F28] px-2 font-mono">
                        {paginaActual}
                      </span>
                      <button
                        type="button"
                        disabled={paginaActual === totalPaginasStock}
                        onClick={() => setPaginaActual((prev) => Math.min(totalPaginasStock, prev + 1))}
                        className="px-2.5 py-1 rounded-lg border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#EAE7DC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Siguiente</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* CASO 2: STOCK BAJO / REORDEN */}
          {/* ----------------------------------------------------------------------- */}
          {tipoKPI === 'STOCK_BAJO' && (
            <div className="space-y-4">
              {itemsBajos.length === 0 ? (
                <div className="p-8 text-center bg-[#F0FDF4] rounded-3xl border border-[#BBF7D0] space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-base text-emerald-950">
                    ¡Niveles Óptimos de Existencias!
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Actualmente ningún artículo se encuentra por debajo de su umbral mínimo de seguridad en {activeSede.nombre}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3.5 bg-[#FEF7EE] rounded-2xl border border-[#DCB87F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[#9A5B12]">
                      <AlertTriangle className="w-4 h-4 text-[#B3803F] shrink-0" />
                      <span>
                        Se detectaron <strong>{itemsBajos.length}</strong> artículo(s) con existencias críticas que requieren reposición.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onAbrirMovimiento();
                        }}
                        className="px-3 py-1.5 bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Registrar Entrada</span>
                      </button>
                    </div>
                  </div>

                  {/* Buscador de artículos con stock bajo */}
                  {itemsBajos.length > 3 && (
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A745F]" />
                      <input
                        type="text"
                        placeholder="Buscar artículo en alerta por código, nombre o bodega..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPaginaActual(1);
                        }}
                        className="w-full pl-10 pr-8 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {itemsBajosPaginados.map((item) => {
                      const art = articulosCatalogo.find((a) => a.id === item.idArticulo);
                      const deficit = Math.max(0, item.stockMinimo - item.cantidadDisponible);

                      return (
                        <div
                          key={item.id}
                          className="p-4 bg-white rounded-2xl border-2 border-rose-300 shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                  {item.codigoArticulo}
                                </span>
                                <span className="text-[10px] font-bold text-[#7A745F]">
                                  {item.categoria}
                                </span>
                              </div>
                              <h5 className="font-bold text-sm text-[#182F28] mt-1">
                                {item.nombreArticulo}
                              </h5>
                              <p className="text-[11px] text-[#5C6058] flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-[#274A3F]" />
                                <span>{item.nombreBodega}</span>
                              </p>
                            </div>

                            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse whitespace-nowrap">
                              Déficit: {deficit} uds
                            </span>
                          </div>

                          {/* Comparativa */}
                          <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] text-center text-xs">
                            <div>
                              <span className="text-[10px] text-[#7A745F] uppercase block font-semibold">
                                Saldo Actual
                              </span>
                              <span className="font-mono font-bold text-base text-rose-700">
                                {item.cantidadDisponible} {item.unidadMedida}s
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#7A745F] uppercase block font-semibold">
                                Stock Mínimo
                              </span>
                              <span className="font-mono font-bold text-base text-[#182F28]">
                                {item.stockMinimo} uds
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#7A745F] uppercase block font-semibold">
                                Punto Reorden
                              </span>
                              <span className="font-mono font-bold text-base text-[#9A5B12]">
                                {item.puntoReorden || item.stockMinimo * 1.5} uds
                              </span>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onAbrirMovimiento();
                              }}
                              className="flex-1 py-1.5 px-3 bg-[#274A3F] hover:bg-[#182F28] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#DCB87F]" />
                              <span>Reabastecer</span>
                            </button>

                            {art && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onVerKardexArticulo(art);
                                }}
                                className="py-1.5 px-3 bg-[#F7F6F2] hover:bg-[#EAE7DC] text-[#182F28] border border-[#DEDBD1] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <History className="w-3.5 h-3.5 text-[#B3803F]" />
                                <span>Kardex</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Paginación Stock Bajo */}
                  {totalPaginasBajos > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl text-xs">
                      <span className="text-[#7A745F] font-mono">
                        Página {paginaActual} de {totalPaginasBajos}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={paginaActual === 1}
                          onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                          className="px-2.5 py-1 rounded-lg border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#EAE7DC] disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                        >
                          Anterior
                        </button>
                        <span className="font-mono font-bold">{paginaActual}</span>
                        <button
                          type="button"
                          disabled={paginaActual === totalPaginasBajos}
                          onClick={() => setPaginaActual((prev) => Math.min(totalPaginasBajos, prev + 1))}
                          className="px-2.5 py-1 rounded-lg border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#EAE7DC] disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* CASO 3: UNIDADES TOTALES / VALORIZACIÓN */}
          {/* ----------------------------------------------------------------------- */}
          {tipoKPI === 'UNIDADES_TOTALES' && (
            <div className="space-y-6">
              {/* Tarjetas resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F7F6F2] border border-[#DEDBD1] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase text-[#7A745F] font-semibold">
                      Total Existencias
                    </span>
                    <div className="text-2xl font-serif font-bold text-[#182F28] mt-1">
                      {totalUnidadesFisicas.toLocaleString('es-CO')} uds.
                    </div>
                    <span className="text-[11px] text-[#5C6058]">
                      Distribuido en {bodegasDeSede.length} bodega(s)
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#182F28]/10 text-[#182F28] flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                </div>

                {manejaPrecios ? (
                  <div className="p-4 rounded-2xl bg-[#F7F6F2] border border-[#DEDBD1] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase text-[#7A745F] font-semibold">
                        Valorización Total (COP)
                      </span>
                      <div className="text-2xl font-serif font-bold text-[#182F28] mt-1">
                        ${valorTotalInventario.toLocaleString('es-CO')}
                      </div>
                      <span className="text-[11px] text-[#5C6058]">
                        Cálculo a costo estándar
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#B3803F]/20 text-[#B3803F] flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#F7F6F2] border border-[#DEDBD1] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase text-[#7A745F] font-semibold">
                        Líneas de Artículos
                      </span>
                      <div className="text-2xl font-serif font-bold text-[#182F28] mt-1">
                        {stockDeSede.length}
                      </div>
                      <span className="text-[11px] text-[#5C6058]">
                        En {desgloseCategorias.length} categoría(s)
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#274A3F]/10 text-[#274A3F] flex items-center justify-center">
                      <Boxes className="w-6 h-6" />
                    </div>
                  </div>
                )}
              </div>

              {/* Distribución por Bodega */}
              <div>
                <h4 className="font-serif font-bold text-sm text-[#182F28] mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#B3803F]" />
                  <span>Distribución por Bodega Física</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {desgloseBodegas.map((item) => {
                    const pct = totalUnidadesFisicas > 0 ? Math.round((item.totalUnidades / totalUnidadesFisicas) * 100) : 0;
                    return (
                      <div
                        key={item.bodega.id}
                        className="p-4 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#182F28]">
                            {item.bodega.nombreBodega}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#182F28]/10 text-[#182F28]">
                            {item.bodega.esBodegaPrincipal ? 'Principal' : item.bodega.codigoBodega}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-xs pt-1">
                          <span className="text-[#7A745F]">Existencias:</span>
                          <span className="font-mono font-bold text-sm text-[#182F28]">
                            {item.totalUnidades.toLocaleString('es-CO')} uds ({pct}%)
                          </span>
                        </div>

                        {manejaPrecios && (
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="text-[#7A745F]">Valorización:</span>
                            <span className="font-mono font-bold text-xs text-[#B3803F]">
                              ${item.valorTotal.toLocaleString('es-CO')}
                            </span>
                          </div>
                        )}

                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#274A3F] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Distribución por Categoría */}
              <div>
                <h4 className="font-serif font-bold text-sm text-[#182F28] mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#B3803F]" />
                  <span>Existencias por Categoría</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {desgloseCategorias.map((cat) => {
                    const pct = totalUnidadesFisicas > 0 ? Math.round((cat.totalUds / totalUnidadesFisicas) * 100) : 0;
                    return (
                      <div
                        key={cat.nombre}
                        className="p-3 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs text-xs space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color || '#274A3F' }}
                          />
                          <span className="font-bold text-[#182F28] truncate">{cat.nombre}</span>
                        </div>
                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-[#7A745F] font-mono">{cat.totalArticulos} artículos</span>
                          <span className="font-mono font-bold text-[#182F28]">{cat.totalUds} uds ({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* CASO 4: TRASLADOS EN TRÁNSITO */}
          {/* ----------------------------------------------------------------------- */}
          {tipoKPI === 'TRASLADOS_RECIBIR' && (
            <div className="space-y-4">
              {trasladosPendientes.length === 0 ? (
                <div className="p-8 text-center bg-[#F0FDF4] rounded-3xl border border-[#BBF7D0] space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-base text-emerald-950">
                    Sin Envíos Pendientes
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Actualmente no hay traslados en tránsito en camino hacia la sede {activeSede.nombre}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-900">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>
                        Se registran <strong>{trasladosPendientes.length}</strong> traslado(s) inter-sedes en ruta hacia esta sede.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onVerEnTraslados();
                      }}
                      className="font-bold text-purple-800 hover:text-purple-950 underline cursor-pointer whitespace-nowrap"
                    >
                      Ir a vista de traslados →
                    </button>
                  </div>

                  {/* Buscador de traslados si hay más de 2 */}
                  {trasladosPendientes.length > 2 && (
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A745F]" />
                      <input
                        type="text"
                        placeholder="Buscar por código de traslado, sede origen o artículo..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPaginaActual(1);
                        }}
                        className="w-full pl-10 pr-8 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {trasladosPaginados.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7DC] pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-[#182F28]">
                                {t.codigoTraslado}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                EN TRÁNSITO
                              </span>
                            </div>
                            <div className="text-xs text-[#5C6058] mt-1 flex items-center gap-1.5">
                              <span className="font-semibold text-[#B3803F]">
                                Desde: {t.nombreCentroOrigen}
                              </span>
                              <span>→</span>
                              <span className="font-semibold text-[#274A3F]">
                                Hacia: {t.nombreCentroDestino}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              await onRecibirTraslado(t.id, t.codigoTraslado);
                              onClose();
                            }}
                            className="px-4 py-2 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#DCB87F]" />
                            <span>Recibir en Bodega</span>
                          </button>
                        </div>

                        {/* Insumos que viajan en el furgón */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase text-[#7A745F] font-semibold block">
                            Insumos en Despacho ({t.detalles.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {t.detalles.map((det) => (
                              <div
                                key={det.id}
                                className="p-2 rounded-xl bg-[#F7F6F2] border border-[#EAE7DC] text-xs flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-bold text-[#182F28]">{det.nombreArticulo}</div>
                                  <div className="text-[10px] font-mono text-[#7A745F]">
                                    {det.codigoArticulo} {det.numeroLote ? `• Lote: ${det.numeroLote}` : ''}
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-xs text-[#274A3F] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                                  {det.cantidadEnviada} {det.unidadMedida}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {t.notasDespacho && (
                          <div className="text-[11px] text-[#7A745F] italic bg-[#FDFBF7] p-2 rounded-lg border border-[#EAE7DC]">
                            Nota de despacho: "{t.notasDespacho}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Paginación Traslados */}
                  {totalPaginasTraslados > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl text-xs">
                      <span className="text-[#7A745F] font-mono">
                        Página {paginaActual} de {totalPaginasTraslados}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={paginaActual === 1}
                          onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                          className="px-2.5 py-1 rounded-lg border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#EAE7DC] disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                        >
                          Anterior
                        </button>
                        <span className="font-mono font-bold">{paginaActual}</span>
                        <button
                          type="button"
                          disabled={paginaActual === totalPaginasTraslados}
                          onClick={() => setPaginaActual((prev) => Math.min(totalPaginasTraslados, prev + 1))}
                          className="px-2.5 py-1 rounded-lg border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#EAE7DC] disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FOOTER DEL MODAL */}
        {/* ========================================================================= */}
        <div className="p-4 bg-[#F7F6F2] border-t border-[#DEDBD1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tipoKPI === 'ARTICULOS_STOCK' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerEnTablaStock('TODOS');
                }}
                className="px-4 py-2 bg-white hover:bg-[#EAE7DC] text-[#182F28] border border-[#DEDBD1] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Ver en Tabla de Existencias
              </button>
            )}

            {tipoKPI === 'STOCK_BAJO' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerEnTablaStock('BAJO');
                }}
                className="px-4 py-2 bg-white hover:bg-[#EAE7DC] text-[#9A5B12] border border-[#DCB87F] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Filtrar Stock Bajo en Tabla
              </button>
            )}

            {tipoKPI === 'UNIDADES_TOTALES' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerEnTablaStock('TODOS');
                }}
                className="px-4 py-2 bg-white hover:bg-[#EAE7DC] text-[#182F28] border border-[#DEDBD1] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Ver Todas las Existencias
              </button>
            )}

            {tipoKPI === 'TRASLADOS_RECIBIR' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerEnTraslados();
                }}
                className="px-4 py-2 bg-white hover:bg-[#EAE7DC] text-[#7A4F9E] border border-[#D8B4FE] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Ir a Módulo de Traslados
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};
