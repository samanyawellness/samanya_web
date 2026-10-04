import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Boxes,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Warehouse,
  History,
  Tag,
  DollarSign,
  User,
  Clock,
  TrendingDown,
  Layers,
  X,
  Pencil,
  Calculator,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  ArticuloCatalogo,
  BodegaSede,
  InventarioStockSede,
  MovimientoInventario,
  TrasladoSedes,
  TipoMovimientoInventario,
  RegistrarMovimientoPayload,
  RegistrarTrasladoPayload
} from '../../types';
import { ModalDetalleKPI, TipoKPIModal } from '../modals/ModalDetalleKPI';

// =========================================================================
// COMPONENTE DE PAGINACIÓN ESTANDARIZADO PARA INVENTARIOS
// =========================================================================
interface PaginadorTablaProps {
  paginaActual: number;
  totalPaginas: number;
  totalItems: number;
  itemsPorPagina: number;
  itemLabel: string;
  onCambiarPagina: (p: number) => void;
}

const PaginadorTabla: React.FC<PaginadorTablaProps> = ({
  paginaActual,
  totalPaginas,
  totalItems,
  itemsPorPagina,
  itemLabel,
  onCambiarPagina
}) => {
  if (totalItems <= itemsPorPagina) return null;

  const inicio = (paginaActual - 1) * itemsPorPagina + 1;
  const fin = Math.min(totalItems, paginaActual * itemsPorPagina);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-[#F7F6F2] border-t border-[#DEDBD1] text-xs">
      <div className="text-[#5C6058] font-mono">
        Mostrando <span className="font-bold text-[#182F28]">{inicio}</span> a{' '}
        <span className="font-bold text-[#182F28]">{fin}</span> de{' '}
        <span className="font-bold text-[#182F28]">{totalItems}</span> {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={paginaActual === 1}
          onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
          className="px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#EAE7DC] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-1 px-2">
          <span className="font-mono font-bold text-[#182F28]">{paginaActual}</span>
          <span className="text-[#7A745F]">/</span>
          <span className="font-mono text-[#7A745F]">{totalPaginas}</span>
        </div>

        <button
          type="button"
          disabled={paginaActual === totalPaginas}
          onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
          className="px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#EAE7DC] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
        >
          <span>Siguiente</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const InventoryView: React.FC = () => {
  const {
    activeSede,
    sedes,
    residentes,
    categoriasArticulos,
    articulosCatalogo,
    bodegasSede,
    inventarioStock,
    movimientosInventario,
    trasladosSedes,
    registrarMovimientoStock,
    despacharTraslado,
    recibirTraslado,
    crearArticuloCatalogo,
    actualizarArticuloCatalogo,
    showToast,
    showConfirm
  } = useAdmin();

  // Flag de control: ¿Esta sede maneja precios y costos, o solo cantidades físicas?
  const manejaPrecios = activeSede.manejaCostosInventario !== false;

  // Sedes de la organización a la que pertenece la sede activa
  const sedesOrganizacion = useMemo(() => {
    return sedes.filter(s => {
      if (activeSede.idOrganizacion && s.idOrganizacion) {
        return s.idOrganizacion === activeSede.idOrganizacion;
      }
      return true;
    });
  }, [sedes, activeSede.idOrganizacion]);

  // Otras sedes de la organización que gestionen inventario (posibles contrapartes de traslado)
  const sedesContraparteInventario = useMemo(() => {
    return sedesOrganizacion.filter(s => s.id !== activeSede.id && s.manejaInventario !== false);
  }, [sedesOrganizacion, activeSede.id]);

  // Si solo hay una sola sede para la organización (o ninguna otra sede maneja inventario), se deshabilita todo lo referente a traslados
  const permiteTraslados = sedesOrganizacion.length > 1 && sedesContraparteInventario.length > 0;

  // Sub-pestañas principales
  const [subTab, setSubTab] = useState<'stock' | 'kardex' | 'traslados' | 'catalogo'>('stock');

  // Si la organización no tiene traslados y el usuario estaba en dicha pestaña, regresar a stock
  useEffect(() => {
    if (!permiteTraslados && subTab === 'traslados') {
      setSubTab('stock');
    }
  }, [permiteTraslados, subTab]);

  // Filtros de Stock
  const [searchStock, setSearchStock] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | 'TODAS'>('TODAS');
  const [alertaFiltro, setAlertaFiltro] = useState<'TODOS' | 'BAJO' | 'OPTIMO'>('TODOS');
  const [bodegaSeleccionadaId, setBodegaSeleccionadaId] = useState<number | 'TODAS'>('TODAS');

  // Filtros de Kardex
  const [searchKardex, setSearchKardex] = useState('');
  const [tipoMovFiltro, setTipoMovFiltro] = useState<string>('TODOS');

  // Filtros de Traslados
  const [estadoTrasladoFiltro, setEstadoTrasladoFiltro] = useState<string>('TODOS');
  const [searchTraslados, setSearchTraslados] = useState('');

  // Filtros de Catálogo
  const [searchCatalogo, setSearchCatalogo] = useState('');
  const [categoriaCatalogoFiltro, setCategoriaCatalogoFiltro] = useState<number | 'TODAS'>('TODAS');

  // Estados de paginación por pestaña
  const [paginaStock, setPaginaStock] = useState(1);
  const itemsPorPaginaStock = 10;

  const [paginaKardex, setPaginaKardex] = useState(1);
  const itemsPorPaginaKardex = 8;

  const [paginaTraslados, setPaginaTraslados] = useState(1);
  const itemsPorPaginaTraslados = 6;

  const [paginaCatalogo, setPaginaCatalogo] = useState(1);
  const itemsPorPaginaCatalogo = 10;

  // Modales
  const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false);
  const [isTrasladoModalOpen, setIsTrasladoModalOpen] = useState(false);
  const [isNuevoArticuloModalOpen, setIsNuevoArticuloModalOpen] = useState(false);
  const [articuloAEditar, setArticuloAEditar] = useState<ArticuloCatalogo | null>(null);
  const [articuloKardexSeleccionado, setArticuloKardexSeleccionado] = useState<ArticuloCatalogo | null>(null);
  const [modalDetalleKPI, setModalDetalleKPI] = useState<TipoKPIModal | null>(null);

  // Resetear páginas a 1 cuando cambien filtros de búsqueda o selectores
  useEffect(() => {
    setPaginaStock(1);
  }, [searchStock, categoriaFiltro, alertaFiltro, bodegaSeleccionadaId]);

  useEffect(() => {
    setPaginaKardex(1);
  }, [searchKardex, tipoMovFiltro]);

  useEffect(() => {
    setPaginaTraslados(1);
  }, [searchTraslados, estadoTrasladoFiltro]);

  useEffect(() => {
    setPaginaCatalogo(1);
  }, [searchCatalogo, categoriaCatalogoFiltro]);

  // Bodegas de la sede activa
  const bodegasDeSede = useMemo(() => {
    return bodegasSede.filter(b => b.idCentro === activeSede.id && b.estado === 'Activo');
  }, [bodegasSede, activeSede.id]);

  // Stock filtrado para la sede activa
  const stockDeSede = useMemo(() => {
    return inventarioStock.filter(s => {
      if (s.idCentro !== activeSede.id) return false;
      if (bodegaSeleccionadaId !== 'TODAS' && s.idBodega !== bodegaSeleccionadaId) return false;

      const art = articulosCatalogo.find(a => a.id === s.idArticulo);
      if (!art) return false;

      if (categoriaFiltro !== 'TODAS' && art.idCategoria !== categoriaFiltro) return false;
      if (alertaFiltro === 'BAJO' && s.estadoSuministro !== 'BAJO') return false;
      if (alertaFiltro === 'OPTIMO' && s.estadoSuministro !== 'OPTIMO') return false;

      if (searchStock.trim()) {
        const query = searchStock.toLowerCase();
        const matchCode = art.codigoArticulo.toLowerCase().includes(query);
        const matchName = art.nombreArticulo.toLowerCase().includes(query);
        const matchDesc = (art.descripcion || '').toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchDesc) return false;
      }

      return true;
    });
  }, [inventarioStock, activeSede.id, bodegaSeleccionadaId, categoriaFiltro, alertaFiltro, searchStock, articulosCatalogo]);

  // Paginación Stock
  const totalPaginasStock = Math.ceil(stockDeSede.length / itemsPorPaginaStock) || 1;
  const stockDeSedePaginado = useMemo(() => {
    const inicio = (paginaStock - 1) * itemsPorPaginaStock;
    return stockDeSede.slice(inicio, inicio + itemsPorPaginaStock);
  }, [stockDeSede, paginaStock, itemsPorPaginaStock]);

  // Movimientos de la sede activa
  const movimientosDeSede = useMemo(() => {
    return movimientosInventario
      .filter(m => {
        if (m.idCentro !== activeSede.id) return false;
        if (tipoMovFiltro !== 'TODOS' && m.tipoMovimiento !== tipoMovFiltro) return false;
        if (searchKardex.trim()) {
          const q = searchKardex.toLowerCase();
          const matchDoc = m.numeroDocumento.toLowerCase().includes(q);
          const matchUser = (m.nombreUsuarioRegistra || '').toLowerCase().includes(q);
          const matchRes = (m.nombreResidente || '').toLowerCase().includes(q);
          const matchArt = m.detalles.some(d => (d.nombreArticulo || '').toLowerCase().includes(q) || (d.codigoArticulo || '').toLowerCase().includes(q));
          if (!matchDoc && !matchUser && !matchRes && !matchArt) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.fechaMovimiento).getTime() - new Date(a.fechaMovimiento).getTime());
  }, [movimientosInventario, activeSede.id, tipoMovFiltro, searchKardex]);

  // Paginación Kardex
  const totalPaginasKardex = Math.ceil(movimientosDeSede.length / itemsPorPaginaKardex) || 1;
  const movimientosDeSedePaginados = useMemo(() => {
    const inicio = (paginaKardex - 1) * itemsPorPaginaKardex;
    return movimientosDeSede.slice(inicio, inicio + itemsPorPaginaKardex);
  }, [movimientosDeSede, paginaKardex, itemsPorPaginaKardex]);

  // Traslados vinculados a la sede activa (como origen o destino)
  const trasladosDeSede = useMemo(() => {
    return trasladosSedes
      .filter(t => {
        const participa = t.idCentroOrigen === activeSede.id || t.idCentroDestino === activeSede.id;
        if (!participa) return false;
        if (estadoTrasladoFiltro !== 'TODOS' && t.estadoTraslado !== estadoTrasladoFiltro) return false;
        if (searchTraslados.trim()) {
          const q = searchTraslados.toLowerCase();
          const matchCod = t.codigoTraslado.toLowerCase().includes(q);
          const matchOri = (t.nombreCentroOrigen || '').toLowerCase().includes(q);
          const matchDes = (t.nombreCentroDestino || '').toLowerCase().includes(q);
          const matchObs = (t.notasDespacho || '').toLowerCase().includes(q);
          const matchItem = t.detalles.some(d => (d.nombreArticulo || '').toLowerCase().includes(q) || (d.codigoArticulo || '').toLowerCase().includes(q));
          if (!matchCod && !matchOri && !matchDes && !matchObs && !matchItem) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime());
  }, [trasladosSedes, activeSede.id, estadoTrasladoFiltro, searchTraslados]);

  // Paginación Traslados
  const totalPaginasTraslados = Math.ceil(trasladosDeSede.length / itemsPorPaginaTraslados) || 1;
  const trasladosDeSedePaginados = useMemo(() => {
    const inicio = (paginaTraslados - 1) * itemsPorPaginaTraslados;
    return trasladosDeSede.slice(inicio, inicio + itemsPorPaginaTraslados);
  }, [trasladosDeSede, paginaTraslados, itemsPorPaginaTraslados]);

  // Catálogo maestro filtrado
  const catalogoFiltrado = useMemo(() => {
    return articulosCatalogo.filter(art => {
      if (categoriaCatalogoFiltro !== 'TODAS' && art.idCategoria !== categoriaCatalogoFiltro) return false;
      if (searchCatalogo.trim()) {
        const q = searchCatalogo.toLowerCase();
        const matchCod = art.codigoArticulo.toLowerCase().includes(q);
        const matchNom = art.nombreArticulo.toLowerCase().includes(q);
        const matchDesc = (art.descripcion || '').toLowerCase().includes(q);
        const matchEmp = (art.tipoEmpaque || '').toLowerCase().includes(q);
        if (!matchCod && !matchNom && !matchDesc && !matchEmp) return false;
      }
      return true;
    });
  }, [articulosCatalogo, categoriaCatalogoFiltro, searchCatalogo]);

  // Paginación Catálogo
  const totalPaginasCatalogo = Math.ceil(catalogoFiltrado.length / itemsPorPaginaCatalogo) || 1;
  const catalogoPaginado = useMemo(() => {
    const inicio = (paginaCatalogo - 1) * itemsPorPaginaCatalogo;
    return catalogoFiltrado.slice(inicio, inicio + itemsPorPaginaCatalogo);
  }, [catalogoFiltrado, paginaCatalogo, itemsPorPaginaCatalogo]);

  // KPIs de la Sede
  const metricasSede = useMemo(() => {
    const totalArticulosRegistrados = stockDeSede.length;
    const itemsEnStockBajo = stockDeSede.filter(s => s.estadoSuministro === 'BAJO').length;
    const totalUnidadesFisicas = stockDeSede.reduce((acc, curr) => acc + curr.cantidadDisponible, 0);
    const valorTotalInventario = stockDeSede.reduce((acc, curr) => acc + (curr.valorTotalStock || 0), 0);
    const trasladosPendientesRecepcion = trasladosSedes.filter(
      t => t.idCentroDestino === activeSede.id && t.estadoTraslado === 'EN_TRANSITO'
    ).length;

    return {
      totalArticulosRegistrados,
      itemsEnStockBajo,
      totalUnidadesFisicas,
      valorTotalInventario,
      trasladosPendientesRecepcion
    };
  }, [stockDeSede, trasladosSedes, activeSede.id]);

  // Lista detallada de traslados pendientes con destino a esta sede
  const trasladosPendientesRecepcionLista = useMemo(() => {
    return trasladosSedes.filter(
      t => t.idCentroDestino === activeSede.id && t.estadoTraslado === 'EN_TRANSITO'
    );
  }, [trasladosSedes, activeSede.id]);

  // Confirmar recepción de traslado
  const handleRecibirTraslado = async (idTraslado: number, numeroDoc: string) => {
    const confirmed = await showConfirm({
      title: 'Confirmar Ingreso de Traslado a Bodega',
      message: `¿Desea dar ingreso formal a los insumos del traslado ${numeroDoc} en la bodega receptora de la sede ${activeSede.nombre}? Esta acción actualizará los saldos de existencias automáticamente.`,
      type: 'warning',
      confirmText: 'Sí, Ingresar a Stock',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      const ok = await recibirTraslado(idTraslado, 'Recepción física y verificación de precintos completada.');
      if (ok) {
        showToast(`Traslado ${numeroDoc} recepcionado y cargado a stock`, 'success');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado y Selector de Bodega */}
      <div className="bg-white rounded-3xl p-6 border border-[#DEDBD1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#182F28] text-[#DCB87F] flex items-center justify-center shadow-sm">
            <Boxes className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-serif font-bold text-[#182F28]">
                Inventario & Almacén
              </h1>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-[#274A3F] text-[#ECE7DB] border border-[#DCB87F]/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#DCB87F]" />
                Sede Activa: {activeSede.nombre}
              </span>

              {/* Indicador de modo de precios / cantidades */}
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border flex items-center gap-1.5 ${
                manejaPrecios
                  ? 'bg-[#FEF7EE] text-[#9A5B12] border-[#DCB87F]'
                  : 'bg-[#F7F6F2] text-[#5C6058] border-[#DEDBD1]'
              }`}>
                {manejaPrecios ? <DollarSign className="w-3.5 h-3.5 text-[#B3803F]" /> : <Package className="w-3.5 h-3.5 text-[#7A745F]" />}
                {manejaPrecios ? 'Precios y Valorización: Activos' : 'Modo: Solo Cantidades Físicas (Sin Precios)'}
              </span>
            </div>
            <p className="text-xs text-[#7A745F] mt-1">
              {permiteTraslados
                ? 'Control multisede de existencias, dispensación asistencial, lotes de caducidad y traslados inter-centros.'
                : 'Control de existencias, dispensación asistencial y lotes de caducidad en almacén.'}
            </p>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMovimientoModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 text-[#DCB87F]" />
            <span>Registrar Movimiento</span>
          </button>

          {permiteTraslados && (
            <button
              type="button"
              onClick={() => setIsTrasladoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Solicitar Traslado</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsNuevoArticuloModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#F7F6F2] hover:bg-[#EAE7DC] text-[#182F28] border border-[#DEDBD1] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#B3803F]" />
            <span>Nuevo Artículo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${permiteTraslados ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
        {/* Card 1: Total Artículos */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setModalDetalleKPI('ARTICULOS_STOCK')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalDetalleKPI('ARTICULOS_STOCK'); } }}
          title="Haga clic para ver el detalle de todos los artículos en stock"
          className="bg-white p-5 rounded-2xl border border-[#DEDBD1] hover:border-[#274A3F] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between group text-left relative overflow-hidden"
        >
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A745F] group-hover:text-[#274A3F] font-semibold transition-colors flex items-center gap-1.5">
              <span>Artículos en Stock</span>
              <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-sans font-normal text-[#274A3F]">Ver detalle →</span>
            </div>
            <div className="text-2xl font-serif font-bold text-[#182F28] mt-1">
              {metricasSede.totalArticulosRegistrados}
            </div>
            <div className="text-[11px] text-[#5C6058] mt-0.5">
              En {bodegasDeSede.length} bodega(s) de la sede
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#274A3F]/10 group-hover:bg-[#274A3F] text-[#182F28] group-hover:text-white flex items-center justify-center transition-all shadow-xs">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Stock Bajo / Alertas */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setModalDetalleKPI('STOCK_BAJO')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalDetalleKPI('STOCK_BAJO'); } }}
          title="Haga clic para ver artículos con stock bajo o necesidad de reorden"
          className={`p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between group text-left relative overflow-hidden ${
            metricasSede.itemsEnStockBajo > 0
              ? 'bg-[#FEF7EE] border-[#DCB87F] hover:border-[#9A5B12]'
              : 'bg-white border-[#DEDBD1] hover:border-[#B3803F]'
          }`}
        >
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9A5B12] font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B3803F]" />
              <span>Stock Bajo / Reorden</span>
              <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-sans font-normal text-[#9A5B12]">Ver detalle →</span>
            </div>
            <div className="text-2xl font-serif font-bold text-[#9A5B12] mt-1">
              {metricasSede.itemsEnStockBajo}
            </div>
            <div className="text-[11px] text-[#7A745F] mt-0.5">
              {metricasSede.itemsEnStockBajo > 0 ? 'Requieren reabastecimiento' : 'Niveles óptimos de suministro'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#B3803F]/20 group-hover:bg-[#B3803F] text-[#B3803F] group-hover:text-white flex items-center justify-center transition-all shadow-xs">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Valor Total Inventario o Unidades Físicas (según manejaPrecios) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setModalDetalleKPI('UNIDADES_TOTALES')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalDetalleKPI('UNIDADES_TOTALES'); } }}
          title="Haga clic para ver el desglose por bodegas y categorías"
          className="bg-white p-5 rounded-2xl border border-[#DEDBD1] hover:border-[#182F28] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between group text-left relative overflow-hidden"
        >
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A745F] group-hover:text-[#182F28] font-semibold transition-colors flex items-center gap-1.5">
              <span>{manejaPrecios ? 'Valorización de Stock' : 'Unidades Físicas Totales'}</span>
              <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-sans font-normal text-[#182F28]">Ver detalle →</span>
            </div>
            <div className="text-2xl font-serif font-bold text-[#182F28] mt-1">
              {manejaPrecios
                ? `$${metricasSede.valorTotalInventario.toLocaleString('es-CO')}`
                : `${metricasSede.totalUnidadesFisicas.toLocaleString('es-CO')} uds.`}
            </div>
            <div className="text-[11px] text-[#5C6058] mt-0.5">
              {manejaPrecios ? 'Costo estándar valorizado (COP)' : 'Existencias en todas las bodegas'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#182F28]/10 group-hover:bg-[#182F28] text-[#182F28] group-hover:text-white flex items-center justify-center transition-all shadow-xs">
            {manejaPrecios ? <DollarSign className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
          </div>
        </div>

        {/* Card 4: Traslados en Tránsito */}
        {permiteTraslados && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setModalDetalleKPI('TRASLADOS_RECIBIR')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalDetalleKPI('TRASLADOS_RECIBIR'); } }}
            title="Haga clic para ver los traslados pendientes de recepción en esta sede"
            className="bg-white p-5 rounded-2xl border border-[#DEDBD1] hover:border-[#7A4F9E] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between group text-left relative overflow-hidden"
          >
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A745F] group-hover:text-[#7A4F9E] font-semibold transition-colors flex items-center gap-1.5">
                <span>Traslados Por Recibir</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-sans font-normal text-[#7A4F9E]">Ver detalle →</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#182F28] mt-1">
                {metricasSede.trasladosPendientesRecepcion}
              </div>
              <div className="text-[11px] text-[#5C6058] mt-0.5">
                Envíos inter-sedes en tránsito
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#7A4F9E]/15 group-hover:bg-[#7A4F9E] text-[#7A4F9E] group-hover:text-white flex items-center justify-center transition-all shadow-xs">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      {/* Navegación por Sub-pestañas */}
      <div className="border-b border-[#DEDBD1] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSubTab('stock')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            subTab === 'stock'
              ? 'border-[#B3803F] text-[#182F28]'
              : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
          }`}
        >
          <Package className="w-4 h-4 text-[#B3803F]" />
          <span>Existencias & Control de Stock</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#182F28]/10 font-mono font-semibold">
            {stockDeSede.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('kardex')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            subTab === 'kardex'
              ? 'border-[#B3803F] text-[#182F28]'
              : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
          }`}
        >
          <History className="w-4 h-4 text-[#B3803F]" />
          <span>Kardex & Movimientos</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#182F28]/10 font-mono font-semibold">
            {movimientosDeSede.length}
          </span>
        </button>

        {permiteTraslados && (
          <button
            type="button"
            onClick={() => setSubTab('traslados')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              subTab === 'traslados'
                ? 'border-[#B3803F] text-[#182F28]'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-[#B3803F]" />
            <span>Traslados Inter-Sedes</span>
            {metricasSede.trasladosPendientesRecepcion > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#A4453A] text-white font-mono font-semibold animate-pulse">
                {metricasSede.trasladosPendientesRecepcion}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setSubTab('catalogo')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            subTab === 'catalogo'
              ? 'border-[#B3803F] text-[#182F28]'
              : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
          }`}
        >
          <Tag className="w-4 h-4 text-[#B3803F]" />
          <span>Catálogo Maestro</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#182F28]/10 font-mono font-semibold">
            {articulosCatalogo.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 1: EXISTENCIAS Y CONTROL DE STOCK */}
      {/* ========================================================================= */}
      {subTab === 'stock' && (
        <div className="space-y-4">
          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              {/* Buscador */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A745F]" />
                <input
                  type="text"
                  placeholder="Buscar por código, nombre o descripción..."
                  value={searchStock}
                  onChange={(e) => setSearchStock(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              {/* Filtro Bodega */}
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-[#7A745F]" />
                <select
                  value={bodegaSeleccionadaId}
                  onChange={(e) => setBodegaSeleccionadaId(e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                >
                  <option value="TODAS">Todas las Bodegas</option>
                  {bodegasDeSede.map(b => (
                    <option key={b.id} value={b.id}>{b.nombreBodega}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Categoría */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#7A745F]" />
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                >
                  <option value="TODAS">Todas las Categorías</option>
                  {categoriasArticulos.map(c => (
                    <option key={c.id} value={c.id}>{c.nombreCategoria}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Estado de Suministro */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                <button
                  type="button"
                  onClick={() => setAlertaFiltro('TODOS')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    alertaFiltro === 'TODOS' ? 'bg-white text-[#182F28] shadow-xs' : 'text-[#7A745F]'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setAlertaFiltro('BAJO')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    alertaFiltro === 'BAJO' ? 'bg-[#FEF7EE] text-[#9A5B12] shadow-xs' : 'text-[#7A745F]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#B3803F]" />
                  Stock Bajo
                </button>
                <button
                  type="button"
                  onClick={() => setAlertaFiltro('OPTIMO')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    alertaFiltro === 'OPTIMO' ? 'bg-white text-[#182F28] shadow-xs' : 'text-[#7A745F]'
                  }`}
                >
                  Óptimo
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Existencias */}
          <div className="bg-white rounded-2xl border border-[#DEDBD1] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F6F2] border-b border-[#DEDBD1] text-[#7A745F] font-mono uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Código / SKU</th>
                    <th className="py-3.5 px-4">Artículo & Categoría</th>
                    <th className="py-3.5 px-4">Bodega / Ubicación</th>
                    <th className="py-3.5 px-4 text-center">Nivel de Stock</th>
                    <th className="py-3.5 px-4 text-center min-w-[130px] w-36">Estado</th>
                    <th className="py-3.5 px-4 text-right">Disponible</th>
                    {manejaPrecios && <th className="py-3.5 px-4 text-right">Costo Unit.</th>}
                    {manejaPrecios && <th className="py-3.5 px-4 text-right">Valor Total</th>}
                    <th className="py-3.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7DC]">
                  {stockDeSede.length === 0 ? (
                    <tr>
                      <td colSpan={manejaPrecios ? 9 : 7} className="py-12 text-center text-[#7A745F]">
                        <div className="max-w-sm mx-auto space-y-2">
                          <Package className="w-8 h-8 mx-auto text-[#B3803F]/60" />
                          <p className="font-bold text-[#182F28]">No se encontraron artículos</p>
                          <p className="text-xs">No hay existencias que coincidan con los filtros seleccionados para esta sede.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stockDeSedePaginado.map((item) => {
                      const art = articulosCatalogo.find(a => a.id === item.idArticulo);
                      const cat = categoriasArticulos.find(c => c.id === art?.idCategoria);
                      const bod = bodegasSede.find(b => b.id === item.idBodega);

                      // Porcentaje respecto al máximo
                      const maximo = item.stockMaximo || 100;
                      const porcentaje = Math.min(100, Math.round((item.cantidadDisponible / maximo) * 100));

                      const esBajo = item.estadoSuministro === 'BAJO' || item.cantidadDisponible <= (item.puntoReorden || item.stockMinimo);

                      return (
                        <tr key={item.id} className="hover:bg-[#FDFBF7] transition-colors">
                          {/* Código */}
                          <td className="py-3 px-4 font-mono font-bold text-[#182F28]">
                            {art?.codigoArticulo || 'SKU'}
                          </td>

                          {/* Nombre & Categoría */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#182F28]">{art?.nombreArticulo}</div>
                            <div className="text-[11px] text-[#7A745F] flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.5 bg-[#F7F6F2] rounded text-[10px] font-mono border border-[#DEDBD1]">
                                {cat?.nombreCategoria || 'General'}
                              </span>
                              {art?.requiereLoteVencimiento && (
                                <span className="text-[10px] text-[#B3803F] font-semibold">
                                  • Control Lote/Vence
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Bodega & Estante */}
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#182F28] flex items-center gap-1.5">
                              <Warehouse className="w-3.5 h-3.5 text-[#B3803F]" />
                              {bod?.nombreBodega || 'Bodega Principal'}
                            </div>
                            <div className="text-[11px] text-[#7A745F] font-mono mt-0.5">
                              Ubic: {item.ubicacionEstante || 'Estante Central'}
                            </div>
                          </td>

                          {/* Barra de Nivel de Stock */}
                          <td className="py-3 px-4">
                            <div className="w-32 mx-auto space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#7A745F]">
                                <span>Mín: {item.stockMinimo}</span>
                                <span>Máx: {item.stockMaximo}</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    esBajo ? 'bg-[#A4453A]' : 'bg-[#274A3F]'
                                  }`}
                                  style={{ width: `${porcentaje}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Estado Badge Ampliado sin saltos de línea */}
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

                          {/* Cantidad Disponible */}
                          <td className="py-3 px-4 text-right">
                            <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded-lg ${
                              esBajo ? 'bg-[#FBE8E6] text-[#A4453A]' : 'bg-[#EBF3EF] text-[#274A3F]'
                            }`}>
                              {item.cantidadDisponible} {art?.unidadMedida}
                            </span>
                            {esBajo && (
                              <div className="text-[10px] text-[#A4453A] font-bold mt-1">
                                Stock Crítico
                              </div>
                            )}
                          </td>

                          {/* Costo Unitario (Solo si manejaPrecios) */}
                          {manejaPrecios && (
                            <td className="py-3 px-4 text-right font-mono text-[#5C6058]">
                              ${(item.costoEstandar || 0).toLocaleString('es-CO')}
                            </td>
                          )}

                          {/* Valor Total (Solo si manejaPrecios) */}
                          {manejaPrecios && (
                            <td className="py-3 px-4 text-right font-mono font-bold text-[#182F28]">
                              ${(item.valorTotalStock || 0).toLocaleString('es-CO')}
                            </td>
                          )}

                          {/* Acciones */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                title="Ver Kardex histórico de este artículo"
                                onClick={() => {
                                  if (art) setArticuloKardexSeleccionado(art);
                                }}
                                className="p-1.5 rounded-lg bg-[#F7F6F2] hover:bg-[#EAE7DC] text-[#182F28] transition-colors cursor-pointer"
                              >
                                <History className="w-3.5 h-3.5 text-[#B3803F]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación de Stock */}
            <PaginadorTabla
              paginaActual={paginaStock}
              totalPaginas={totalPaginasStock}
              totalItems={stockDeSede.length}
              itemsPorPagina={itemsPorPaginaStock}
              itemLabel="artículos en existencias"
              onCambiarPagina={setPaginaStock}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 2: KARDEX Y HISTORIAL DE MOVIMIENTOS */}
      {/* ========================================================================= */}
      {subTab === 'kardex' && (
        <div className="space-y-4">
          {/* Filtros Kardex */}
          <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A745F]" />
                <input
                  type="text"
                  placeholder="Buscar por documento, usuario, residente o artículo..."
                  value={searchKardex}
                  onChange={(e) => setSearchKardex(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#7A745F]" />
                <select
                  value={tipoMovFiltro}
                  onChange={(e) => setTipoMovFiltro(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                >
                  <option value="TODOS">Todos los Tipos de Movimiento</option>
                  <option value="ENTRADA_COMPRA">Entrada por Compra</option>
                  <option value="SALIDA_ENTREGA_RESIDENTE">Salida Asistencial a Residente</option>
                  <option value="SALIDA_CONSUMO_SEDE">Salida por Consumo General en Sede</option>
                  <option value="SALIDA_MERMA_VENCIDO">Salida por Merma / Vencimiento</option>
                  {permiteTraslados && (
                    <>
                      <option value="TRASLADO_SALIDA">Traslado Saliente</option>
                      <option value="TRASLADO_ENTRADA">Traslado Entrante</option>
                    </>
                  )}
                  <option value="AJUSTE_FISICO_POSITIVO">Ajuste Positivo</option>
                  <option value="AJUSTE_FISICO_NEGATIVO">Ajuste Negativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listado de Documentos de Movimiento */}
          <div className="space-y-3">
            {movimientosDeSede.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#DEDBD1] text-center text-[#7A745F]">
                <History className="w-8 h-8 mx-auto text-[#B3803F]/60 mb-2" />
                <p className="font-bold text-[#182F28]">No hay movimientos registrados</p>
                <p className="text-xs">Los movimientos de almacén para esta sede aparecerán registrados aquí.</p>
              </div>
            ) : (
              movimientosDeSedePaginados.map((mov) => {
                const esEntrada = mov.tipoMovimiento.startsWith('ENTRADA') || mov.tipoMovimiento === 'AJUSTE_FISICO_POSITIVO' || mov.tipoMovimiento === 'TRASLADO_ENTRADA';

                return (
                  <div key={mov.id} className="bg-white rounded-2xl border border-[#DEDBD1] p-5 shadow-xs hover:border-[#B3803F] transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EAE7DC] pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          esEntrada ? 'bg-[#EBF3EF] text-[#274A3F]' : 'bg-[#FBE8E6] text-[#A4453A]'
                        }`}>
                          {esEntrada ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#182F28]">
                              {mov.numeroDocumento}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              esEntrada ? 'bg-[#EBF3EF] text-[#274A3F]' : 'bg-[#FBE8E6] text-[#A4453A]'
                            }`}>
                              {mov.tipoMovimiento.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#7A745F] flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#B3803F]" />
                              {mov.fechaMovimiento}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-[#B3803F]" />
                              {mov.nombreUsuarioRegistra || 'Administrador'}
                            </span>
                            {mov.nombreResidente && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-[#182F28] bg-[#FEF7EE] px-1.5 py-0.5 rounded border border-[#DCB87F]">
                                  Residente: {mov.nombreResidente}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Total Documento: Oculto si la sede no maneja precios */}
                      {manejaPrecios && (
                        <div className="text-right">
                          <div className="text-xs font-mono text-[#7A745F]">Total Documento</div>
                          <div className="text-base font-mono font-bold text-[#182F28]">
                            ${(mov.costoTotal || 0).toLocaleString('es-CO')}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Detalle de Artículos Movidos */}
                    <div className="pt-3">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A745F] font-semibold mb-2">
                        Artículos Procesados ({mov.detalles.length})
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {mov.detalles.map((det) => (
                          <div key={det.id} className="p-2.5 rounded-xl bg-[#F7F6F2] border border-[#EAE7DC] text-xs flex items-center justify-between">
                            <div>
                              <div className="font-bold text-[#182F28]">{det.nombreArticulo}</div>
                              <div className="text-[10px] text-[#7A745F] font-mono">
                                Lote: {det.numeroLote || 'N/A'} {det.fechaVencimiento && `• Vence: ${det.fechaVencimiento}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold font-mono text-[#182F28]">
                                {esEntrada ? '+' : '-'}{det.cantidad} {det.unidadMedida}
                              </div>
                              <div className="text-[10px] text-[#5C6058] font-mono">
                                Saldo: {det.saldoPosterior}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {mov.observaciones && (
                        <p className="text-[11px] text-[#7A745F] italic mt-3 bg-white p-2 rounded-lg border border-[#EAE7DC]">
                          "{mov.observaciones}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Paginación de Kardex */}
            <PaginadorTabla
              paginaActual={paginaKardex}
              totalPaginas={totalPaginasKardex}
              totalItems={movimientosDeSede.length}
              itemsPorPagina={itemsPorPaginaKardex}
              itemLabel="movimientos registrados"
              onCambiarPagina={setPaginaKardex}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 3: TRASLADOS INTER-SEDES */}
      {/* ========================================================================= */}
      {subTab === 'traslados' && permiteTraslados && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Buscador de Traslados */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A745F]" />
                <input
                  type="text"
                  placeholder="Buscar por guía, sede de origen/destino o insumo..."
                  value={searchTraslados}
                  onChange={(e) => setSearchTraslados(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
                {searchTraslados && (
                  <button
                    type="button"
                    onClick={() => setSearchTraslados('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtro Estado */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#182F28]">Estado:</span>
                <div className="flex items-center gap-1.5 p-1 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                  {['TODOS', 'EN_TRANSITO', 'RECIBIDO_CONFORME', 'CANCELADO'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEstadoTrasladoFiltro(st)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        estadoTrasladoFiltro === st ? 'bg-white text-[#182F28] shadow-xs' : 'text-[#7A745F]'
                      }`}
                    >
                      {st === 'TODOS' ? 'Todos' : st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTrasladoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#B3803F] hover:bg-[#9a6c32] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Solicitar Nuevo Traslado</span>
            </button>
          </div>

          <div className="space-y-3">
            {trasladosDeSede.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#DEDBD1] text-center text-[#7A745F]">
                <ArrowLeftRight className="w-8 h-8 mx-auto text-[#B3803F]/60 mb-2" />
                <p className="font-bold text-[#182F28]">No hay traslados activos</p>
                <p className="text-xs">No hay envíos ni recepciones entre sedes para los criterios seleccionados.</p>
              </div>
            ) : (
              trasladosDeSedePaginados.map((tras) => {
                const esOrigen = tras.idCentroOrigen === activeSede.id;
                const esDestino = tras.idCentroDestino === activeSede.id;
                const puedeRecibir = esDestino && tras.estadoTraslado === 'EN_TRANSITO';

                return (
                  <div key={tras.id} className="bg-white rounded-2xl border border-[#DEDBD1] p-5 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EAE7DC] pb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-[#182F28]">
                            {tras.codigoTraslado}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            tras.estadoTraslado === 'RECIBIDO_CONFORME'
                              ? 'bg-[#EBF3EF] text-[#274A3F]'
                              : tras.estadoTraslado === 'EN_TRANSITO'
                              ? 'bg-[#FEF7EE] text-[#9A5B12]'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {tras.estadoTraslado.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Ruta del Traslado */}
                        <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-[#182F28]">
                          <span className={esOrigen ? 'text-[#B3803F] font-bold' : ''}>
                            {tras.nombreCentroOrigen || 'Sede Origen'}
                          </span>
                          <ArrowLeftRight className="w-3.5 h-3.5 text-[#7A745F]" />
                          <span className={esDestino ? 'text-[#274A3F] font-bold' : ''}>
                            {tras.nombreCentroDestino || 'Sede Destino'}
                          </span>
                        </div>
                      </div>

                      {/* Botón de Recepción */}
                      {puedeRecibir && (
                        <button
                          type="button"
                          onClick={() => handleRecibirTraslado(tras.id, tras.codigoTraslado)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#274A3F] hover:bg-[#182F28] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#DCB87F]" />
                          <span>Confirmar Recepción e Ingreso a Stock</span>
                        </button>
                      )}
                    </div>

                    {/* Detalle de Artículos Trasladados */}
                    <div className="pt-3">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A745F] font-semibold mb-2">
                        Artículos en Despacho ({tras.detalles.length})
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {tras.detalles.map((det) => (
                          <div key={det.id} className="p-2.5 rounded-xl bg-[#F7F6F2] border border-[#EAE7DC] text-xs flex items-center justify-between">
                            <div>
                              <div className="font-bold text-[#182F28]">{det.nombreArticulo}</div>
                              <div className="text-[10px] text-[#7A745F] font-mono">
                                Lote: {det.numeroLote || 'N/A'} {det.fechaVencimiento && `• Vence: ${det.fechaVencimiento}`}
                              </div>
                            </div>
                            <div className="font-bold font-mono text-[#182F28]">
                              {det.cantidadEnviada} {det.unidadMedida}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Paginación de Traslados */}
            <PaginadorTabla
              paginaActual={paginaTraslados}
              totalPaginas={totalPaginasTraslados}
              totalItems={trasladosDeSede.length}
              itemsPorPagina={itemsPorPaginaTraslados}
              itemLabel="traslados de insumos"
              onCambiarPagina={setPaginaTraslados}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 4: CATÁLOGO MAESTRO DE ARTÍCULOS */}
      {/* ========================================================================= */}
      {subTab === 'catalogo' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Buscador de Catálogo */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A745F]" />
                <input
                  type="text"
                  placeholder="Buscar en catálogo por código, nombre o empaque..."
                  value={searchCatalogo}
                  onChange={(e) => setSearchCatalogo(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
                {searchCatalogo && (
                  <button
                    type="button"
                    onClick={() => setSearchCatalogo('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtro por Categoría */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#7A745F]" />
                <select
                  value={categoriaCatalogoFiltro}
                  onChange={(e) => setCategoriaCatalogoFiltro(e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                >
                  <option value="TODAS">Todas las Categorías</option>
                  {categoriasArticulos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombreCategoria}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNuevoArticuloModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#B3803F] hover:bg-[#9a6c32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Artículo al Catálogo</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#DEDBD1] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F6F2] border-b border-[#DEDBD1] text-[#7A745F] font-mono uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Código SKU</th>
                    <th className="py-3 px-4">Nombre del Artículo</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Empaque Comercial</th>
                    <th className="py-3 px-4">Unidad Base</th>
                    {manejaPrecios && <th className="py-3 px-4 text-right">Costo Estándar</th>}
                    <th className="py-3 px-4 text-center">Control Lote</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7DC]">
                  {catalogoFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan={manejaPrecios ? 8 : 7} className="py-12 text-center text-[#7A745F]">
                        <div className="max-w-sm mx-auto space-y-2">
                          <Tag className="w-8 h-8 mx-auto text-[#B3803F]/60" />
                          <p className="font-bold text-[#182F28]">No se encontraron artículos en catálogo</p>
                          <p className="text-xs">No hay insumos que coincidan con la búsqueda o filtro de categoría.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    catalogoPaginado.map((art) => {
                      const cat = categoriasArticulos.find(c => c.id === art.idCategoria);
                      return (
                        <tr key={art.id} className="hover:bg-[#FDFBF7] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#182F28]">{art.codigoArticulo}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#182F28]">{art.nombreArticulo}</div>
                            {art.descripcion && (
                              <div className="text-[11px] text-[#7A745F]">{art.descripcion}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-[#F7F6F2] rounded text-[11px] font-mono border border-[#DEDBD1]">
                              {cat?.nombreCategoria || 'General'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {art.unidadesPorEmpaque && art.unidadesPorEmpaque > 1 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FEF7EE] text-[#9A5B12] border border-[#DCB87F]/40 font-mono text-[11px] font-semibold">
                                1 {art.tipoEmpaque || 'paquete'} = {art.unidadesPorEmpaque} uds
                              </span>
                            ) : (
                              <span className="text-[#A5A08D] italic text-[11px]">1 a 1 (Directo)</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono">{art.unidadMedida}</td>
                          {manejaPrecios && (
                            <td className="py-3 px-4 text-right font-mono font-bold text-[#182F28]">
                              ${art.costoEstandar.toLocaleString('es-CO')}
                            </td>
                          )}
                          <td className="py-3 px-4 text-center">
                            {art.requiereLoteVencimiento ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3EF] text-[#274A3F]">
                                Obligatorio
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[10px]">No</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setArticuloAEditar(art)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F6F2] hover:bg-[#EAE7DC] text-[#182F28] border border-[#DEDBD1] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                              title="Editar información del artículo"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#B3803F]" />
                              <span>Editar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación Catálogo Maestro */}
            <PaginadorTabla
              paginaActual={paginaCatalogo}
              totalPaginas={totalPaginasCatalogo}
              totalItems={catalogoFiltrado.length}
              itemsPorPagina={itemsPorPaginaCatalogo}
              itemLabel="artículos del catálogo institucional"
              onCambiarPagina={setPaginaCatalogo}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR MOVIMIENTO (ENTRADA / CONSUMO RESIDENTE / AJUSTE) */}
      {/* ========================================================================= */}
      {isMovimientoModalOpen && (
        <ModalRegistrarMovimiento
          onClose={() => setIsMovimientoModalOpen(false)}
          activeSede={activeSede}
          bodegasDeSede={bodegasDeSede}
          articulosCatalogo={articulosCatalogo}
          residentes={residentes}
          manejaPrecios={manejaPrecios}
          onSave={registrarMovimientoStock}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SOLICITAR / DESPACHAR TRASLADO */}
      {/* ========================================================================= */}
      {isTrasladoModalOpen && permiteTraslados && (
        <ModalRegistrarTraslado
          onClose={() => setIsTrasladoModalOpen(false)}
          activeSede={activeSede}
          sedes={sedesOrganizacion}
          bodegasSede={bodegasSede}
          articulosCatalogo={articulosCatalogo}
          onSave={despacharTraslado}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: NUEVO ARTÍCULO CATÁLOGO */}
      {/* ========================================================================= */}
      {isNuevoArticuloModalOpen && (
        <ModalNuevoArticulo
          onClose={() => setIsNuevoArticuloModalOpen(false)}
          categoriasArticulos={categoriasArticulos}
          manejaPrecios={manejaPrecios}
          onSave={crearArticuloCatalogo}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 3B: EDITAR ARTÍCULO CATÁLOGO */}
      {/* ========================================================================= */}
      {articuloAEditar && (
        <ModalEditarArticulo
          articulo={articuloAEditar}
          categoriasArticulos={categoriasArticulos}
          manejaPrecios={manejaPrecios}
          onClose={() => setArticuloAEditar(null)}
          onSave={actualizarArticuloCatalogo}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: KARDEX RÁPIDO DE ARTÍCULO ESPECÍFICO */}
      {/* ========================================================================= */}
      {articuloKardexSeleccionado && (
        <ModalKardexArticulo
          articulo={articuloKardexSeleccionado}
          movimientos={movimientosInventario.filter(m => m.idCentro === activeSede.id)}
          onClose={() => setArticuloKardexSeleccionado(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DETALLE INTERACTIVO DE KPIS */}
      {/* ========================================================================= */}
      {modalDetalleKPI && (
        <ModalDetalleKPI
          isOpen={modalDetalleKPI !== null}
          tipoKPI={modalDetalleKPI}
          onClose={() => setModalDetalleKPI(null)}
          activeSede={activeSede}
          stockDeSede={stockDeSede}
          bodegasDeSede={bodegasDeSede}
          articulosCatalogo={articulosCatalogo}
          trasladosPendientes={trasladosPendientesRecepcionLista}
          manejaPrecios={manejaPrecios}
          permiteTraslados={permiteTraslados}
          onVerEnTablaStock={(filtroAlerta) => {
            setSubTab('stock');
            if (filtroAlerta) {
              setAlertaFiltro(filtroAlerta);
            }
          }}
          onVerEnTraslados={() => {
            setSubTab('traslados');
            setEstadoTrasladoFiltro('EN_TRANSITO');
          }}
          onRecibirTraslado={handleRecibirTraslado}
          onAbrirMovimiento={() => setIsMovimientoModalOpen(true)}
          onAbrirTraslado={() => setIsTrasladoModalOpen(true)}
          onVerKardexArticulo={(articulo) => setArticuloKardexSeleccionado(articulo)}
        />
      )}
    </div>
  );
};

// =========================================================================
// SUB-MODAL 1: REGISTRAR MOVIMIENTO
// =========================================================================
interface ModalRegistrarMovimientoProps {
  onClose: () => void;
  activeSede: any;
  bodegasDeSede: BodegaSede[];
  articulosCatalogo: ArticuloCatalogo[];
  residentes: any[];
  manejaPrecios: boolean;
  onSave: (payload: RegistrarMovimientoPayload) => Promise<boolean>;
}

const ModalRegistrarMovimiento: React.FC<ModalRegistrarMovimientoProps> = ({
  onClose,
  activeSede,
  bodegasDeSede,
  articulosCatalogo,
  residentes,
  manejaPrecios,
  onSave
}) => {
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimientoInventario>('ENTRADA_DONACION');
  const [idBodega, setIdBodega] = useState<number>(bodegasDeSede[0]?.id || 1);
  const [idResidente, setIdResidente] = useState<number | undefined>(undefined);
  const [observaciones, setObservaciones] = useState('');

  // Línea de artículo
  const [idArticulo, setIdArticulo] = useState<number>(articulosCatalogo[0]?.id || 1);
  const [cantidad, setCantidad] = useState<number>(1);
  const [numeroLote, setNumeroLote] = useState('LOT-2025-01');
  const [fechaVencimiento, setFechaVencimiento] = useState('2026-12-31');
  const [costoUnitario, setCostoUnitario] = useState<number>(articulosCatalogo[0]?.costoEstandar || 1000);
  const [loading, setLoading] = useState(false);

  // Conversión de Empaques a Unidades Físicas
  const [modoConteo, setModoConteo] = useState<'UNIDADES' | 'EMPAQUES'>('EMPAQUES');
  const [tipoEmpaque, setTipoEmpaque] = useState<string>('Paquete');
  const [cantidadEmpaques, setCantidadEmpaques] = useState<number>(5);
  const [unidadesPorEmpaque, setUnidadesPorEmpaque] = useState<number>(30);

  const articuloSeleccionado = articulosCatalogo.find(a => a.id === idArticulo);

  // Al cambiar de artículo, precargar si tiene empaque comercial configurado
  useEffect(() => {
    if (articuloSeleccionado) {
      if (articuloSeleccionado.unidadesPorEmpaque && articuloSeleccionado.unidadesPorEmpaque > 1) {
        setUnidadesPorEmpaque(articuloSeleccionado.unidadesPorEmpaque);
        setModoConteo('EMPAQUES');
      }
      if (articuloSeleccionado.tipoEmpaque) {
        setTipoEmpaque(articuloSeleccionado.tipoEmpaque);
      }
    }
  }, [idArticulo]);

  const unidadesTotalesCalculadas = modoConteo === 'EMPAQUES'
    ? cantidadEmpaques * unidadesPorEmpaque
    : cantidad;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unidadesTotalesCalculadas <= 0) return;

    setLoading(true);
    const notaEmpaque = modoConteo === 'EMPAQUES'
      ? `[Ingreso de ${cantidadEmpaques} ${tipoEmpaque.toLowerCase()}(s) x ${unidadesPorEmpaque} uds = ${unidadesTotalesCalculadas} unidades físicas]`
      : '';

    const observacionesFinales = [notaEmpaque, observaciones.trim()].filter(Boolean).join(' - ');

    const ok = await onSave({
      idCentro: activeSede.id,
      idBodega,
      tipoMovimiento,
      idResidente: (tipoMovimiento === 'SALIDA_ENTREGA_RESIDENTE' || tipoMovimiento === 'ENTRADA_DONACION') ? idResidente : undefined,
      observaciones: observacionesFinales,
      detalles: [
        {
          idArticulo,
          cantidad: unidadesTotalesCalculadas,
          costoUnitario: manejaPrecios ? costoUnitario : 0,
          cantidadEmpaques: modoConteo === 'EMPAQUES' ? cantidadEmpaques : undefined,
          unidadesPorEmpaque: modoConteo === 'EMPAQUES' ? unidadesPorEmpaque : undefined,
          tipoEmpaque: modoConteo === 'EMPAQUES' ? tipoEmpaque : undefined,
          numeroLote: articuloSeleccionado?.requiereLoteVencimiento ? numeroLote : undefined,
          fechaVencimiento: articuloSeleccionado?.requiereLoteVencimiento ? fechaVencimiento : undefined
        }
      ]
    });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCB87F]/20 flex items-center justify-center text-[#DCB87F]">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Registrar Movimiento de Almacén</h3>
              <p className="text-xs text-[#DCB87F]">
                {activeSede.nombre} {!manejaPrecios && '• Modo Solo Cantidades'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[#CFC9B8] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">Tipo de Movimiento *</label>
            <select
              value={tipoMovimiento}
              onChange={(e) => setTipoMovimiento(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
            >
              <option value="ENTRADA_DONACION">Entrada / Recepción de Insumos de Residente (Familiar / Acudiente)</option>
              <option value="ENTRADA_COMPRA">Entrada por Compra / Reabastecimiento General</option>
              <option value="SALIDA_ENTREGA_RESIDENTE">Salida Asistencial a Residente (Consumo)</option>
              <option value="SALIDA_CONSUMO_SEDE">Salida por Consumo General en Sede</option>
              <option value="SALIDA_MERMA_VENCIDO">Salida por Merma / Vencimiento</option>
              <option value="AJUSTE_FISICO_POSITIVO">Ajuste Físico (+) Sobrante</option>
              <option value="AJUSTE_FISICO_NEGATIVO">Ajuste Físico (-) Faltante</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">Bodega de la Sede *</label>
              <select
                value={idBodega}
                onChange={(e) => setIdBodega(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
              >
                {bodegasDeSede.map(b => (
                  <option key={b.id} value={b.id}>{b.nombreBodega}</option>
                ))}
              </select>
            </div>

            {(tipoMovimiento === 'SALIDA_ENTREGA_RESIDENTE' || tipoMovimiento === 'ENTRADA_DONACION') && (
              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  {tipoMovimiento === 'ENTRADA_DONACION' ? 'Residente Asociado (Insumos Propios)' : 'Residente Asignado'}
                </label>
                <select
                  value={idResidente || ''}
                  onChange={(e) => setIdResidente(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
                >
                  <option value="">(Uso general en sede / Sin asignar)</option>
                  {residentes.filter(r => r.idCentro === activeSede.id).map(r => (
                    <option key={r.id} value={r.id}>{r.nombreCompleto} (Hab. {r.habitacion})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Selección de Artículo y Conversión de Empaques */}
          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#182F28]">
              Artículo a Despachar / Ingresar
            </h4>

            <div>
              <label className="block text-xs font-bold text-[#4B4636] mb-1">Seleccionar Artículo *</label>
              <select
                value={idArticulo}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setIdArticulo(val);
                  const art = articulosCatalogo.find(a => a.id === val);
                  if (art && manejaPrecios) setCostoUnitario(art.costoEstandar);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28]"
              >
                {articulosCatalogo.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.codigoArticulo} - {a.nombreArticulo} ({a.unidadMedida})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Modalidad: Por Unidades Sueltas vs Por Empaque / Paquetes */}
            <div className="p-3 bg-white rounded-xl border border-[#DEDBD1] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4B4636]">Modalidad de Conteo:</span>
                <div className="inline-flex p-0.5 bg-[#F7F6F2] rounded-xl text-[11px] font-bold border border-[#DEDBD1]">
                  <button
                    type="button"
                    onClick={() => setModoConteo('UNIDADES')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      modoConteo === 'UNIDADES' ? 'bg-[#182F28] text-white shadow-xs' : 'text-[#7A745F]'
                    }`}
                  >
                    Unidades Sueltas
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoConteo('EMPAQUES')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      modoConteo === 'EMPAQUES' ? 'bg-[#B3803F] text-white shadow-xs' : 'text-[#7A745F]'
                    }`}
                  >
                    Por Paquete / Empaque
                  </button>
                </div>
              </div>

              {modoConteo === 'EMPAQUES' ? (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#4B4636] mb-1">Tipo Empaque</label>
                      <input
                        type="text"
                        value={tipoEmpaque}
                        onChange={(e) => setTipoEmpaque(e.target.value)}
                        placeholder="Ej. Paquete, Caja"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4B4636] mb-1">Cant. Empaques *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={cantidadEmpaques}
                        onChange={(e) => setCantidadEmpaques(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-bold text-[#182F28]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4B4636] mb-1">Uds. x Empaque *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={unidadesPorEmpaque}
                        onChange={(e) => setUnidadesPorEmpaque(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-bold text-[#182F28]"
                      />
                    </div>
                  </div>

                  {/* Banner de Conversión Matemática en Vivo */}
                  <div className="p-2.5 bg-[#EBF3EF] border border-[#274A3F]/30 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-[#274A3F]" />
                      <span className="text-xs font-semibold text-[#182F28]">
                        {cantidadEmpaques} {tipoEmpaque.toLowerCase()}(s) × {unidadesPorEmpaque} uds =
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#274A3F] text-white font-mono font-bold text-xs shadow-xs">
                      {unidadesTotalesCalculadas} {articuloSeleccionado?.unidadMedida || 'unidades'} ingresarán al stock
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Cantidad en Unidades Físicas ({articuloSeleccionado?.unidadMedida || 'UNIDADES'}) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-bold text-[#182F28]"
                  />
                </div>
              )}
            </div>

            {/* Costo Unitario: Solo se pide si manejaPrecios está activo */}
            {manejaPrecios && (
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">Costo Unitario (COP)</label>
                <input
                  type="number"
                  min={0}
                  value={costoUnitario}
                  onChange={(e) => setCostoUnitario(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-mono text-[#182F28]"
                />
              </div>
            )}

            {articuloSeleccionado?.requiereLoteVencimiento && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">Lote</label>
                  <input
                    type="text"
                    value={numeroLote}
                    onChange={(e) => setNumeroLote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-mono text-[#182F28]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28]"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">Observaciones / Justificación</label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas de entrega de familiares, acudientes, turno o proveedor..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
            />
          </div>

          <div className="pt-3 border-t border-[#DEDBD1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#7A745F] hover:text-[#182F28] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Procesando...' : `Confirmar Ingreso (${unidadesTotalesCalculadas} uds)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-MODAL 2: REGISTRAR TRASLADO INTER-SEDES
// =========================================================================
interface ModalRegistrarTrasladoProps {
  onClose: () => void;
  activeSede: any;
  sedes: any[];
  bodegasSede: BodegaSede[];
  articulosCatalogo: ArticuloCatalogo[];
  onSave: (payload: RegistrarTrasladoPayload) => Promise<boolean>;
}

const ModalRegistrarTraslado: React.FC<ModalRegistrarTrasladoProps> = ({
  onClose,
  activeSede,
  sedes,
  articulosCatalogo,
  onSave
}) => {
  // Sedes destino que manejan inventario (excluyendo la actual)
  const sedesDestinoValidas = sedes.filter(s => s.id !== activeSede.id && s.manejaInventario !== false);

  const [idCentroDestino, setIdCentroDestino] = useState<number>(sedesDestinoValidas[0]?.id || 2);
  const [motivo, setMotivo] = useState('Reabastecimiento de insumos por alta demanda asistencial');
  const [idArticulo, setIdArticulo] = useState<number>(articulosCatalogo[0]?.id || 1);
  const [cantidad, setCantidad] = useState<number>(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cantidad <= 0 || !idCentroDestino) return;

    setLoading(true);
    const ok = await onSave({
      idCentroOrigen: activeSede.id,
      idCentroDestino,
      notasDespacho: motivo,
      detalles: [
        {
          idArticulo,
          cantidadEnviada: cantidad,
          numeroLote: 'LOT-TRAS-01',
          fechaVencimiento: '2026-10-30'
        }
      ]
    });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 bg-[#B3803F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-6 h-6" />
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Solicitar Traslado Inter-Sedes</h3>
              <p className="text-xs text-[#FEF7EE]">Despacho desde: {activeSede.nombre}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">Sede Receptora de Destino *</label>
            <select
              value={idCentroDestino}
              onChange={(e) => setIdCentroDestino(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
            >
              {sedesDestinoValidas.map(s => (
                <option key={s.id} value={s.id}>{s.nombre} ({s.ciudad})</option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#182F28]">
              Insumo a Trasladar
            </h4>

            <div>
              <label className="block text-xs font-bold text-[#4B4636] mb-1">Artículo *</label>
              <select
                value={idArticulo}
                onChange={(e) => setIdArticulo(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28]"
              >
                {articulosCatalogo.map(a => (
                  <option key={a.id} value={a.id}>{a.codigoArticulo} - {a.nombreArticulo} ({a.unidadMedida})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B4636] mb-1">Cantidad a Enviar *</label>
              <input
                type="number"
                min={1}
                required
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-bold text-[#182F28]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">Motivo / Justificación de Traslado</label>
            <textarea
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
            />
          </div>

          <div className="pt-3 border-t border-[#DEDBD1] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#7A745F] cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Despachando...' : 'Despachar Traslado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-MODAL 3: NUEVO ARTÍCULO CATÁLOGO
// =========================================================================
interface ModalNuevoArticuloProps {
  onClose: () => void;
  categoriasArticulos: any[];
  manejaPrecios: boolean;
  onSave: (art: Omit<ArticuloCatalogo, 'id'>) => Promise<boolean>;
}

const ModalNuevoArticulo: React.FC<ModalNuevoArticuloProps> = ({
  onClose,
  categoriasArticulos,
  manejaPrecios,
  onSave
}) => {
  const [codigoArticulo, setCodigoArticulo] = useState(`ART-${Math.floor(100 + Math.random() * 900)}`);
  const [nombreArticulo, setNombreArticulo] = useState('');
  const [idCategoria, setIdCategoria] = useState<number>(categoriasArticulos[0]?.id || 1);
  const [unidadMedida, setUnidadMedida] = useState<'UNIDAD' | 'CAJA' | 'PAQUETE' | 'FRASCO' | 'LITRO' | 'KILO' | 'ROLLO'>('UNIDAD');
  const [tipoEmpaque, setTipoEmpaque] = useState('Paquete');
  const [unidadesPorEmpaque, setUnidadesPorEmpaque] = useState(1);
  const [costoEstandar, setCostoEstandar] = useState(15000);
  const [requiereLoteVencimiento, setRequiereLoteVencimiento] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreArticulo.trim()) return;

    setLoading(true);
    const ok = await onSave({
      idOrganizacion: 1,
      idCategoria,
      codigoArticulo: codigoArticulo.trim().toUpperCase(),
      nombreArticulo: nombreArticulo.trim(),
      unidadMedida,
      tipoEmpaque: tipoEmpaque.trim(),
      unidadesPorEmpaque: Number(unidadesPorEmpaque) > 0 ? Number(unidadesPorEmpaque) : 1,
      costoEstandar: manejaPrecios ? costoEstandar : 0,
      requiereLoteVencimiento,
      esDescontablePorResidente: true,
      estado: 'Activo'
    });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-[#DCB87F]" />
            <h3 className="font-serif text-lg font-bold text-white">Nuevo Artículo en Catálogo</h3>
          </div>
          <button type="button" onClick={onClose} className="text-[#CFC9B8] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">Código SKU *</label>
              <input
                type="text"
                required
                value={codigoArticulo}
                onChange={(e) => setCodigoArticulo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-mono font-bold text-[#182F28]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">Categoría *</label>
              <select
                value={idCategoria}
                onChange={(e) => setIdCategoria(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
              >
                {categoriasArticulos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombreCategoria}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">Nombre del Insumo / Suministro *</label>
            <input
              type="text"
              required
              value={nombreArticulo}
              onChange={(e) => setNombreArticulo(e.target.value)}
              placeholder="Ej. Pañal Desechable Adulto Talla M..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
            />
          </div>

          {/* Configuración de Empaque y Conversión */}
          <div className="p-3.5 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-2.5">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#182F28] flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#B3803F]" />
              Unidad Base y Presentación Comercial
            </h4>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#4B4636] mb-1">Unidad Base</label>
                <select
                  value={unidadMedida}
                  onChange={(e) => setUnidadMedida(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28]"
                >
                  <option value="UNIDAD">UNIDAD</option>
                  <option value="PAQUETE">PAQUETE</option>
                  <option value="CAJA">CAJA</option>
                  <option value="FRASCO">FRASCO</option>
                  <option value="ROLLO">ROLLO</option>
                  <option value="LITRO">LITRO</option>
                  <option value="KILO">KILO</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B4636] mb-1">Empaque</label>
                <input
                  type="text"
                  value={tipoEmpaque}
                  onChange={(e) => setTipoEmpaque(e.target.value)}
                  placeholder="Ej: Paquete"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B4636] mb-1">Uds. x Empaque</label>
                <input
                  type="number"
                  min={1}
                  value={unidadesPorEmpaque}
                  onChange={(e) => setUnidadesPorEmpaque(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-bold text-[#182F28]"
                />
              </div>
            </div>
            <p className="text-[10px] text-[#7A745F]">
              Permite recibir paquetes o cajas y convertirlos automáticamente al inventario físico por unidades (ej: 1 {tipoEmpaque.toLowerCase() || 'paquete'} = {unidadesPorEmpaque} {unidadMedida.toLowerCase()}(s)).
            </p>
          </div>

          <div className={manejaPrecios ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
            {/* Costo Estándar: Solo se solicita si manejaPrecios está activo */}
            {manejaPrecios && (
              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">Costo Estándar (COP)</label>
                <input
                  type="number"
                  min={0}
                  value={costoEstandar}
                  onChange={(e) => setCostoEstandar(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-mono text-[#182F28]"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="reqLote"
                checked={requiereLoteVencimiento}
                onChange={(e) => setRequiereLoteVencimiento(e.target.checked)}
                className="rounded text-[#182F28] focus:ring-0"
              />
              <label htmlFor="reqLote" className="text-xs font-semibold text-[#182F28] cursor-pointer">
                Exigir lote y caducidad
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DEDBD1] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#7A745F] cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-MODAL 3B: EDITAR ARTÍCULO DEL CATÁLOGO
// =========================================================================
interface ModalEditarArticuloProps {
  articulo: ArticuloCatalogo;
  categoriasArticulos: any[];
  manejaPrecios: boolean;
  onClose: () => void;
  onSave: (id: number, datos: Partial<ArticuloCatalogo>) => Promise<boolean>;
}

const ModalEditarArticulo: React.FC<ModalEditarArticuloProps> = ({
  articulo,
  categoriasArticulos,
  manejaPrecios,
  onClose,
  onSave
}) => {
  const [codigoArticulo, setCodigoArticulo] = useState(articulo.codigoArticulo);
  const [nombreArticulo, setNombreArticulo] = useState(articulo.nombreArticulo);
  const [descripcion, setDescripcion] = useState(articulo.descripcion || '');
  const [idCategoria, setIdCategoria] = useState<number>(articulo.idCategoria);
  const [unidadMedida, setUnidadMedida] = useState<any>(articulo.unidadMedida || 'UNIDAD');
  const [tipoEmpaque, setTipoEmpaque] = useState(articulo.tipoEmpaque || 'Paquete');
  const [unidadesPorEmpaque, setUnidadesPorEmpaque] = useState(articulo.unidadesPorEmpaque || 1);
  const [costoEstandar, setCostoEstandar] = useState(articulo.costoEstandar || 0);
  const [requiereLoteVencimiento, setRequiereLoteVencimiento] = useState(articulo.requiereLoteVencimiento);
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>(articulo.estado || 'Activo');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreArticulo.trim() || !codigoArticulo.trim()) return;

    setLoading(true);
    const cat = categoriasArticulos.find(c => c.id === idCategoria);
    const ok = await onSave(articulo.id, {
      codigoArticulo: codigoArticulo.trim().toUpperCase(),
      nombreArticulo: nombreArticulo.trim(),
      descripcion: descripcion.trim(),
      idCategoria,
      nombreCategoria: cat?.nombreCategoria,
      colorCategoria: cat?.colorHex,
      unidadMedida,
      tipoEmpaque: tipoEmpaque.trim(),
      unidadesPorEmpaque: Number(unidadesPorEmpaque) > 0 ? Number(unidadesPorEmpaque) : 1,
      costoEstandar: manejaPrecios ? Number(costoEstandar) : 0,
      requiereLoteVencimiento,
      estado
    });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCB87F]/20 flex items-center justify-center text-[#DCB87F]">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Editar Artículo del Catálogo</h3>
              <p className="text-xs text-[#DCB87F]">Modificación de ficha técnica y parámetros</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[#CFC9B8] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">Código SKU *</label>
              <input
                type="text"
                required
                value={codigoArticulo}
                onChange={(e) => setCodigoArticulo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-mono font-bold text-[#182F28]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">Categoría *</label>
              <select
                value={idCategoria}
                onChange={(e) => setIdCategoria(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
              >
                {categoriasArticulos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombreCategoria}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">Nombre del Insumo / Suministro *</label>
            <input
              type="text"
              required
              value={nombreArticulo}
              onChange={(e) => setNombreArticulo(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182F28] mb-1">Descripción o Especificaciones</label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
            />
          </div>

          {/* Conversión y Empaque Comercial */}
          <div className="p-3.5 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-2.5">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#182F28] flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#B3803F]" />
              Unidades y Empaque Comercial
            </h4>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#4B4636] mb-1">Unidad Base</label>
                <select
                  value={unidadMedida}
                  onChange={(e) => setUnidadMedida(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28]"
                >
                  <option value="UNIDAD">UNIDAD</option>
                  <option value="PAQUETE">PAQUETE</option>
                  <option value="CAJA">CAJA</option>
                  <option value="FRASCO">FRASCO</option>
                  <option value="ROLLO">ROLLO</option>
                  <option value="LITRO">LITRO</option>
                  <option value="KILO">KILO</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B4636] mb-1">Tipo Empaque</label>
                <input
                  type="text"
                  value={tipoEmpaque}
                  onChange={(e) => setTipoEmpaque(e.target.value)}
                  placeholder="Ej: Paquete"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B4636] mb-1">Uds. x Empaque</label>
                <input
                  type="number"
                  min={1}
                  value={unidadesPorEmpaque}
                  onChange={(e) => setUnidadesPorEmpaque(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-bold text-[#182F28]"
                />
              </div>
            </div>
            <p className="text-[10px] text-[#7A745F]">
              Permite recibir paquetes o cajas y convertirlos automáticamente al inventario físico por unidades (ej: 1 {tipoEmpaque.toLowerCase() || 'paquete'} = {unidadesPorEmpaque} {unidadMedida.toLowerCase()}(s)).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {manejaPrecios && (
              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">Costo Estándar (COP)</label>
                <input
                  type="number"
                  min={0}
                  value={costoEstandar}
                  onChange={(e) => setCostoEstandar(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-mono text-[#182F28]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">Estado en Catálogo</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28]"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="reqLoteEdit"
              checked={requiereLoteVencimiento}
              onChange={(e) => setRequiereLoteVencimiento(e.target.checked)}
              className="rounded text-[#182F28] focus:ring-0"
            />
            <label htmlFor="reqLoteEdit" className="text-xs font-semibold text-[#182F28] cursor-pointer">
              Exigir número de lote y fecha de caducidad en movimientos
            </label>
          </div>

          <div className="pt-3 border-t border-[#DEDBD1] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#7A745F] cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-MODAL 4: KARDEX RÁPIDO DE ARTÍCULO
// =========================================================================
interface ModalKardexArticuloProps {
  articulo: ArticuloCatalogo;
  movimientos: MovimientoInventario[];
  onClose: () => void;
}

const ModalKardexArticulo: React.FC<ModalKardexArticuloProps> = ({
  articulo,
  movimientos,
  onClose
}) => {
  // Filtrar movimientos que afectaron a este artículo
  const movimientosArticulo = movimientos.filter(m =>
    m.detalles.some(d => d.idArticulo === articulo.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-[#DCB87F]" />
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Kardex de Artículo</h3>
              <p className="text-xs text-[#DCB87F]">
                {articulo.codigoArticulo} • {articulo.nombreArticulo}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[#CFC9B8] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3">
          {movimientosArticulo.length === 0 ? (
            <p className="text-center py-8 text-xs text-[#7A745F]">
              No hay movimientos registrados para este artículo en esta sede.
            </p>
          ) : (
            movimientosArticulo.map(mov => {
              const det = mov.detalles.find(d => d.idArticulo === articulo.id);
              if (!det) return null;
              const esEntrada = mov.tipoMovimiento.startsWith('ENTRADA') || mov.tipoMovimiento === 'AJUSTE_FISICO_POSITIVO' || mov.tipoMovimiento === 'TRASLADO_ENTRADA';

              return (
                <div key={mov.id} className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#DEDBD1] flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#182F28]">{mov.numeroDocumento}</span>
                      <span className="text-[10px] text-[#7A745F]">• {mov.fechaMovimiento}</span>
                    </div>
                    <div className="text-[11px] text-[#5C6058] mt-0.5">
                      Tipo: {mov.tipoMovimiento.replace(/_/g, ' ')} {mov.nombreResidente ? `• Residente: ${mov.nombreResidente}` : ''}
                    </div>
                    {det.numeroLote && (
                      <div className="text-[10px] font-mono text-[#7A745F]">
                        Lote: {det.numeroLote} • Vence: {det.fechaVencimiento || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      esEntrada ? 'bg-[#EBF3EF] text-[#274A3F]' : 'bg-[#FBE8E6] text-[#A4453A]'
                    }`}>
                      {esEntrada ? '+' : '-'}{det.cantidad} {det.unidadMedida}
                    </span>
                    <div className="text-[10px] text-[#7A745F] font-mono mt-1">
                      Saldo: {det.saldoPosterior}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
