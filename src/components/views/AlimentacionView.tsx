import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  UtensilsCrossed,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Coffee,
  Sun,
  Moon,
  Apple,
  Droplets,
  HeartPulse,
  UserCheck,
  FileSpreadsheet,
  ChevronRight,
  ShieldAlert,
  Info,
  Sparkles,
  Settings,
  Pencil,
  Eye,
  Activity,
  Bed,
  Flame,
  SlidersHorizontal,
  Table as TableIcon
} from 'lucide-react';
import {
  PlanNutricional,
  MinutaSemanal,
  RegistroAlimentacion,
  TiempoComida
} from '../../types';
import { ResidentAvatar } from '../common/ResidentAvatar';
import { PaginadorTabla } from '../common/PaginadorTabla';
import { ViewModeSelector, ViewMode } from '../common/ViewModeSelector';
import { PrescribirPlanNutricionalModal } from '../modals/PrescribirPlanNutricionalModal';
import { ProgramarMinutaModal } from '../modals/ProgramarMinutaModal';
import { ImprimirMinutaSemanalModal } from '../modals/ImprimirMinutaSemanalModal';
import { DetalleIngestaComedorModal } from '../modals/DetalleIngestaComedorModal';

export const AlimentacionView: React.FC = () => {
  const {
    activeSede,
    setIsEditSedeOpen,
    residentes,
    tiemposComida,
    nivelesEspesante,
    planesNutricionales,
    minutasSemanales,
    registrosAlimentacion,
    registrarIngestaComedor,
    precargarComedorDia,
    currentUser
  } = useAdmin();

  // Subpestañas del módulo
  const [subTab, setSubTab] = useState<'comedor' | 'planes' | 'minuta'>('comedor');

  // Modos de vista y paginación para Comedor del Día
  const [viewModeComedor, setViewModeComedor] = useState<ViewMode>('table');
  const [paginaComedor, setPaginaComedor] = useState(1);
  const itemsPorPaginaComedor = viewModeComedor === 'grid' ? 6 : 8;

  // Filtros del comedor
  const [selectedFecha, setSelectedFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTiempoComida, setSelectedTiempoComida] = useState<number>(2); // 2 = Almuerzo por defecto
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroDieta, setFiltroDieta] = useState('TODAS');

  // Modos de vista y paginación para Planes Nutricionales
  const [viewModePlanes, setViewModePlanes] = useState<ViewMode>('grid');
  const [paginaPlanes, setPaginaPlanes] = useState(1);
  const itemsPorPaginaPlanes = viewModePlanes === 'grid' ? 6 : 8;
  const [filtroPlanesTexto, setFiltroPlanesTexto] = useState('');
  const [filtroPlanesDieta, setFiltroPlanesDieta] = useState('TODAS');

  // Modo de vista para Minuta Semanal
  const [viewModeMinuta, setViewModeMinuta] = useState<ViewMode>('grid');

  // Estados de Modales
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanNutricional | null>(null);
  const [residenteIdInicialParaPlan, setResidenteIdInicialParaPlan] = useState<number | undefined>();

  const [isMinutaModalOpen, setIsMinutaModalOpen] = useState(false);
  const [minutaSeleccionada, setMinutaSeleccionada] = useState<MinutaSemanal | null>(null);

  const [isImprimirMinutaOpen, setIsImprimirMinutaOpen] = useState(false);

  const [isDetalleIngestaOpen, setIsDetalleIngestaOpen] = useState(false);
  const [registroSeleccionadoParaIngesta, setRegistroSeleccionadoParaIngesta] = useState<RegistroAlimentacion | null>(null);
  const [planSeleccionadoParaIngesta, setPlanSeleccionadoParaIngesta] = useState<PlanNutricional | null>(null);

  // Minuta activa seleccionada para visualización
  const [minutaActivaId, setMinutaActivaId] = useState<number | null>(null);

  // Reset de páginas al cambiar filtros
  useEffect(() => {
    setPaginaComedor(1);
  }, [selectedFecha, selectedTiempoComida, filtroTexto, filtroDieta, viewModeComedor]);

  useEffect(() => {
    setPaginaPlanes(1);
  }, [filtroPlanesTexto, filtroPlanesDieta, viewModePlanes]);

  // =========================================================================
  // CONTROL MULTISEDE Y FEATURE FLAG
  // =========================================================================
  const manejaAlimentacion = activeSede.manejaAlimentacion !== false;

  // Residentes activos de la sede activa
  const residentesSede = useMemo(() => {
    return residentes.filter(r => r.idCentro === activeSede.id && r.estado === 'Activo');
  }, [residentes, activeSede.id]);

  // Planes nutricionales de la sede activa
  const planesSede = useMemo(() => {
    return planesNutricionales.filter(p => p.idCentro === activeSede.id);
  }, [planesNutricionales, activeSede.id]);

  // Minutas semanales de la sede activa
  const minutasSede = useMemo(() => {
    return minutasSemanales.filter(m => m.idCentro === activeSede.id);
  }, [minutasSemanales, activeSede.id]);

  // Minuta actual en foco
  const minutaActiva = useMemo(() => {
    if (minutaActivaId) {
      const found = minutasSede.find(m => m.id === minutaActivaId);
      if (found) return found;
    }
    return minutasSede[0] || null;
  }, [minutasSede, minutaActivaId]);

  // Mapa de Registros de comedor para acceso O(1)
  const mapaRegistros = useMemo(() => {
    const map = new Map<number, RegistroAlimentacion>();
    registrosAlimentacion
      .filter(
        r =>
          r.idCentro === activeSede.id &&
          r.fecha === selectedFecha &&
          r.idTiempoComida === selectedTiempoComida
      )
      .forEach(r => {
        map.set(r.idResidente, r);
      });
    return map;
  }, [registrosAlimentacion, activeSede.id, selectedFecha, selectedTiempoComida]);

  // Estadísticas del comedor para la comida seleccionada
  const estadisticas = useMemo(() => {
    let totalComensales = residentesSede.length;
    let sumaPorcentajes = 0;
    let ingestaBaja = 0;
    let requiereAsistenciaCount = 0;
    let liquidosTotal = 0;
    let registradosCount = 0;

    residentesSede.forEach(res => {
      const reg = mapaRegistros.get(res.id);
      const plan = planesSede.find(p => p.idResidente === res.id);

      if (reg) {
        registradosCount++;
        sumaPorcentajes += reg.porcentajeIngesta;
        if (reg.porcentajeIngesta <= 50) ingestaBaja++;
        liquidosTotal += reg.liquidosMl || 0;
      }
      if (plan?.requiereAsistencia) requiereAsistenciaCount++;
    });

    const promedioIngesta = registradosCount > 0 ? Math.round(sumaPorcentajes / registradosCount) : 0;
    const promedioLiquidos = registradosCount > 0 ? Math.round(liquidosTotal / registradosCount) : 0;

    return {
      totalComensales,
      registradosCount,
      promedioIngesta,
      ingestaBaja,
      requiereAsistenciaCount,
      promedioLiquidos
    };
  }, [residentesSede, mapaRegistros, planesSede]);

  // Handler para actualizar ingesta rápida
  const handleUpdateIngestaRapida = (idResidente: number, porcentaje: number) => {
    const regActual = mapaRegistros.get(idResidente);
    const plan = planesSede.find(p => p.idResidente === idResidente);
    const tc = tiemposComida.find(t => t.id === selectedTiempoComida);
    const res = residentesSede.find(r => r.id === idResidente);

    registrarIngestaComedor({
      id: regActual?.id,
      idCentro: activeSede.id,
      idResidente: idResidente,
      residenteNombre: res ? `${res.nombres} ${res.apellidos}` : regActual?.residenteNombre,
      habitacion: res?.habitacion || regActual?.habitacion,
      cama: res?.cama || regActual?.cama,
      fecha: selectedFecha,
      idTiempoComida: selectedTiempoComida,
      tiempoComidaNombre: tc?.nombre,
      idPlanNutricional: plan?.id,
      tipoDieta: plan?.tipoDietaNombre || regActual?.tipoDieta || 'Normal',
      consistencia: plan?.consistenciaNombre || regActual?.consistencia || 'Sólida Regular',
      espesante: plan?.nivelEspesanteNombre || regActual?.espesante,
      requiereAsistencia: plan?.requiereAsistencia ?? regActual?.requiereAsistencia ?? false,
      porcentajeIngesta: porcentaje,
      liquidosMl: regActual?.liquidosMl || 200,
      tolerancia: porcentaje <= 25 ? 'MALA' : porcentaje <= 50 ? 'REGULAR' : 'BUENA',
      asistio: true,
      observaciones: regActual?.observaciones || ''
    });
  };

  // Abrir modal de detalle de ingesta
  const handleOpenDetalleIngesta = (residenteId: number) => {
    const reg = mapaRegistros.get(residenteId);
    const plan = planesSede.find(p => p.idResidente === residenteId);
    const res = residentesSede.find(r => r.id === residenteId);
    const tc = tiemposComida.find(t => t.id === selectedTiempoComida);

    const registroAEditar: RegistroAlimentacion = reg || {
      id: Date.now(),
      idCentro: activeSede.id,
      idResidente: residenteId,
      residenteNombre: res ? `${res.nombres} ${res.apellidos}` : 'Residente',
      habitacion: res?.habitacion || '101',
      cama: res?.cama || 'A',
      fecha: selectedFecha,
      idTiempoComida: selectedTiempoComida,
      tiempoComidaNombre: tc?.nombre || 'Comida',
      idPlanNutricional: plan?.id,
      tipoDieta: plan?.tipoDietaNombre || 'Normal',
      consistencia: plan?.consistenciaNombre || 'Sólida Regular',
      espesante: plan?.nivelEspesanteNombre,
      requiereAsistencia: plan?.requiereAsistencia ?? false,
      porcentajeIngesta: 100,
      liquidosMl: 250,
      tolerancia: 'BUENA',
      asistio: true,
      observaciones: '',
      idEmpleadoRegistra: currentUser?.id || 1,
      nombreEmpleadoRegistra: currentUser?.nombreCompleto || 'Auxiliar'
    };

    setRegistroSeleccionadoParaIngesta(registroAEditar);
    setPlanSeleccionadoParaIngesta(plan || null);
    setIsDetalleIngestaOpen(true);
  };

  // Precargar comensales del día
  const handlePrecargarComedor = async () => {
    await precargarComedorDia(activeSede.id, selectedFecha, selectedTiempoComida);
  };

  // Icono dinámico según tiempo de comida
  const getTiempoIcon = (codigo: string) => {
    switch (codigo) {
      case 'DES':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'ALM':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'MER':
        return <Apple className="w-4 h-4 text-emerald-600" />;
      case 'CEN':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      default:
        return <UtensilsCrossed className="w-4 h-4 text-[#B3803F]" />;
    }
  };

  // =========================================================================
  // FILTRADO Y PAGINACIÓN: COMEDOR DEL DÍA
  // =========================================================================
  const residentesFiltradosComedor = useMemo(() => {
    return residentesSede.filter(res => {
      const plan = planesSede.find(p => p.idResidente === res.id);
      const nombreCompleto = `${res.nombres} ${res.apellidos}`.toLowerCase();
      const matchTexto =
        nombreCompleto.includes(filtroTexto.toLowerCase()) ||
        res.habitacion?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        res.identificacion?.toLowerCase().includes(filtroTexto.toLowerCase());

      const matchDieta =
        filtroDieta === 'TODAS' ||
        (plan?.tipoDietaNombre && plan.tipoDietaNombre.toLowerCase().includes(filtroDieta.toLowerCase())) ||
        (res.tipoDieta && res.tipoDieta.toLowerCase().includes(filtroDieta.toLowerCase()));

      return matchTexto && matchDieta;
    });
  }, [residentesSede, planesSede, filtroTexto, filtroDieta]);

  const totalPaginasComedor = Math.ceil(residentesFiltradosComedor.length / itemsPorPaginaComedor) || 1;
  const residentesPaginadosComedor = useMemo(() => {
    const inicio = (paginaComedor - 1) * itemsPorPaginaComedor;
    return residentesFiltradosComedor.slice(inicio, inicio + itemsPorPaginaComedor);
  }, [residentesFiltradosComedor, paginaComedor, itemsPorPaginaComedor]);

  // =========================================================================
  // FILTRADO Y PAGINACIÓN: PLANES NUTRICIONALES
  // =========================================================================
  const residentesFiltradosPlanes = useMemo(() => {
    return residentesSede.filter(res => {
      const plan = planesSede.find(p => p.idResidente === res.id);
      const nombreCompleto = `${res.nombres} ${res.apellidos}`.toLowerCase();
      const matchTexto =
        nombreCompleto.includes(filtroPlanesTexto.toLowerCase()) ||
        res.habitacion?.toLowerCase().includes(filtroPlanesTexto.toLowerCase()) ||
        res.identificacion?.toLowerCase().includes(filtroPlanesTexto.toLowerCase());

      const matchDieta =
        filtroPlanesDieta === 'TODAS' ||
        (plan?.tipoDietaNombre && plan.tipoDietaNombre.toLowerCase().includes(filtroPlanesDieta.toLowerCase())) ||
        (res.tipoDieta && res.tipoDieta.toLowerCase().includes(filtroPlanesDieta.toLowerCase()));

      return matchTexto && matchDieta;
    });
  }, [residentesSede, planesSede, filtroPlanesTexto, filtroPlanesDieta]);

  const totalPaginasPlanes = Math.ceil(residentesFiltradosPlanes.length / itemsPorPaginaPlanes) || 1;
  const residentesPaginadosPlanes = useMemo(() => {
    const inicio = (paginaPlanes - 1) * itemsPorPaginaPlanes;
    return residentesFiltradosPlanes.slice(inicio, inicio + itemsPorPaginaPlanes);
  }, [residentesFiltradosPlanes, paginaPlanes, itemsPorPaginaPlanes]);

  // Días de la semana
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Si el Feature Flag está deshabilitado para esta sede:
  if (!manejaAlimentacion) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-[#DEDBD1] shadow-xs text-center space-y-5 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-3xl bg-[#FEF7EE] border border-[#DCB87F] text-[#9A5B12] flex items-center justify-center mx-auto shadow-xs">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider font-mono">
            Módulo Desactivado por Feature Flag
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#182F28]">
            Alimentación Deshabilitada en {activeSede.nombre}
          </h2>
          <p className="text-xs text-[#7A745F] max-w-lg mx-auto">
            La sede seleccionada ({activeSede.codigo} • {activeSede.ciudad}) tiene configurada la opción
            de alimentación inactiva en la base de datos Oracle. Puedes activarla en cualquier momento
            desde la configuración de la sede.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditSedeOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Configurar Sede y Activar Módulo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Módulo con Subpestañas */}
      <div className="bg-white rounded-3xl p-6 border border-[#DEDBD1] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#182F28] flex items-center justify-center text-[#DCB87F] shadow-xs">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[#182F28]">
                  Alimentación & Nutrición
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B3803F]/15 text-[#9A5B12] border border-[#DCB87F]">
                  {activeSede.nombre}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  Multisede Activo
                </span>
              </div>
              <p className="text-xs text-[#7A745F]">
                Planes nutricionales clínicos, control de ingestas en comedor y programación de minutas semanales
              </p>
            </div>
          </div>

          {/* Subpestañas principales */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1]">
            <button
              type="button"
              onClick={() => setSubTab('comedor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'comedor'
                  ? 'bg-[#182F28] text-white shadow-xs'
                  : 'text-[#7A745F] hover:text-[#182F28]'
              }`}
            >
              Comedor del Día
            </button>
            <button
              type="button"
              onClick={() => setSubTab('planes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'planes'
                  ? 'bg-[#182F28] text-white shadow-xs'
                  : 'text-[#7A745F] hover:text-[#182F28]'
              }`}
            >
              Planes Nutricionales
            </button>
            <button
              type="button"
              onClick={() => setSubTab('minuta')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'minuta'
                  ? 'bg-[#182F28] text-white shadow-xs'
                  : 'text-[#7A745F] hover:text-[#182F28]'
              }`}
            >
              Minuta Semanal
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: COMEDOR DEL DÍA                                                 */}
      {/* ========================================================================= */}
      {subTab === 'comedor' && (
        <div className="space-y-6">
          {/* Tarjetas KPI de Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#182F28]/10 text-[#182F28] flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#182F28]">{estadisticas.totalComensales}</div>
                <div className="text-[11px] text-[#7A745F] font-semibold">
                  Comensales ({estadisticas.registradosCount} eval.)
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#182F28]">{estadisticas.promedioIngesta}%</div>
                <div className="text-[11px] text-[#7A745F] font-semibold">Ingesta Promedio</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] flex items-center gap-3.5 shadow-2xs">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                estadisticas.ingestaBaja > 0 ? 'bg-[#FBE8E6] text-[#A4453A]' : 'bg-gray-100 text-gray-500'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-xl font-bold font-serif ${estadisticas.ingestaBaja > 0 ? 'text-[#A4453A]' : 'text-[#182F28]'}`}>
                  {estadisticas.ingestaBaja}
                </div>
                <div className="text-[11px] text-[#7A745F] font-semibold">Baja Ingesta (≤50%)</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#182F28]">{estadisticas.promedioLiquidos} ml</div>
                <div className="text-[11px] text-[#7A745F] font-semibold">Líquidos Promedio</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#182F28]">{estadisticas.requiereAsistenciaCount}</div>
                <div className="text-[11px] text-[#7A745F] font-semibold">Requieren Asistencia</div>
              </div>
            </div>
          </div>

          {/* Barra de Filtros y Selección de Horario */}
          <div className="bg-white rounded-2xl p-4 border border-[#DEDBD1] flex flex-wrap items-center justify-between gap-4">
            {/* Tiempos de Comida Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {tiemposComida.map(tc => {
                const isSelected = selectedTiempoComida === tc.id;
                return (
                  <button
                    key={tc.id}
                    type="button"
                    onClick={() => {
                      setSelectedTiempoComida(tc.id);
                      setPaginaComedor(1);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#B3803F] text-white shadow-xs'
                        : 'bg-[#F7F6F2] text-[#4B4636] hover:bg-[#EAE7DC]'
                    }`}
                  >
                    {getTiempoIcon(tc.codigo)}
                    <span>{tc.nombre}</span>
                    <span className="text-[10px] opacity-75 font-mono">({tc.horaSugerida})</span>
                  </button>
                );
              })}
            </div>

            {/* Fecha, Filtros, Selector de Vista y Buscador */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                <Calendar className="w-4 h-4 text-[#B3803F]" />
                <input
                  type="date"
                  value={selectedFecha}
                  onChange={(e) => {
                    setSelectedFecha(e.target.value);
                    setPaginaComedor(1);
                  }}
                  className="bg-transparent text-xs font-bold text-[#182F28] focus:outline-none"
                />
              </div>

              {/* Filtro por Tipo de Dieta */}
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                <Filter className="w-3.5 h-3.5 text-[#7A745F]" />
                <select
                  value={filtroDieta}
                  onChange={(e) => {
                    setFiltroDieta(e.target.value);
                    setPaginaComedor(1);
                  }}
                  className="bg-transparent text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="TODAS">Todas las Dietas</option>
                  <option value="Normal">Normal / General</option>
                  <option value="Hiposódica">Hiposódica</option>
                  <option value="Diabética">Diabética</option>
                  <option value="Blanda">Blanda Mecánica</option>
                  <option value="Papilla">Papilla / Licuada</option>
                  <option value="Renal">Hipoproteica / Renal</option>
                </select>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7A745F]" />
                <input
                  type="text"
                  placeholder="Buscar comensal..."
                  value={filtroTexto}
                  onChange={(e) => {
                    setFiltroTexto(e.target.value);
                    setPaginaComedor(1);
                  }}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-[#182F28] focus:outline-none focus:border-[#B3803F] w-44"
                />
              </div>

              {/* Selector de Modo de Vista (Tarjetas, Lista, Tabla) */}
              <ViewModeSelector
                viewMode={viewModeComedor}
                onChange={(mode) => {
                  setViewModeComedor(mode);
                  setPaginaComedor(1);
                }}
              />

              {/* Botón Precargar Asistencia */}
              <button
                type="button"
                onClick={handlePrecargarComedor}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#182F28] hover:bg-[#274A3F] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Genera asistencia para todos los residentes activos que no tengan registro en este horario"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#DCB87F]" />
                <span className="hidden sm:inline">Precargar</span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* MODO 1: TABLA (POR DEFECTO EN COMEDOR)                                */}
          {/* ===================================================================== */}
          {viewModeComedor === 'table' && (
            <div className="bg-white rounded-3xl border border-[#DEDBD1] overflow-hidden shadow-xs">
              <div className="p-4 bg-[#F7F6F2] border-b border-[#DEDBD1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-serif text-sm font-bold text-[#182F28] flex items-center gap-2">
                  <span>Comensales Registrados</span>
                  <span className="text-xs text-[#7A745F] font-sans font-normal">
                    ({tiemposComida.find(t => t.id === selectedTiempoComida)?.nombre} • {selectedFecha})
                  </span>
                </h3>
                <span className="text-xs text-[#B3803F] font-semibold">
                  Click en los porcentajes para evaluar al instante o en el lápiz para detalle clínico
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#182F28] text-white uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="py-3 px-4">Residente & Ubicación</th>
                      <th className="py-3 px-4">Plan & Dieta</th>
                      <th className="py-3 px-4">Textura / Espesante</th>
                      <th className="py-3 px-4 text-center">Asistencia</th>
                      <th className="py-3 px-4 text-center">Porcentaje Ingesta</th>
                      <th className="py-3 px-4 text-center">Líquidos (ml)</th>
                      <th className="py-3 px-4">Tolerancia & Alertas</th>
                      <th className="py-3 px-4 text-center">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DEDBD1]">
                    {residentesPaginadosComedor.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-xs text-[#7A745F]">
                          No se encontraron comensales para los filtros aplicados en esta sede.
                        </td>
                      </tr>
                    ) : (
                      residentesPaginadosComedor.map(res => {
                        const plan = planesSede.find(p => p.idResidente === res.id);
                        const reg = mapaRegistros.get(res.id);
                        const porcentaje = reg?.porcentajeIngesta ?? 100;
                        const evaluado = Boolean(reg);

                        return (
                          <tr key={res.id} className="hover:bg-[#FAF9F5] transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <ResidentAvatar
                                  fotoUrl={res.fotoUrl}
                                  nombres={res.nombres}
                                  apellidos={res.apellidos}
                                  nombreCompleto={res.nombreCompleto}
                                  sizeClass="w-8 h-8"
                                  roundedClass="rounded-lg"
                                  textClass="text-[11px]"
                                />
                                <div>
                                  <div className="font-bold text-[#182F28] text-xs">
                                    {res.nombres} {res.apellidos}
                                  </div>
                                  <div className="text-[11px] text-[#7A745F]">
                                    Hab: <span className="font-semibold">{res.habitacion || '101'}</span> • Cama: {res.cama || 'A'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-[#182F28]">
                                {plan?.tipoDietaNombre || res.tipoDieta || 'Normal / General'}
                              </span>
                              {plan?.restriccionesAlergias && (
                                <div className="text-[10px] text-[#A4453A] font-bold flex items-center gap-1 mt-0.5">
                                  <ShieldAlert className="w-3 h-3 shrink-0" />
                                  <span>{plan.restriccionesAlergias}</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="text-xs text-[#4B4636]">
                                {plan?.consistenciaNombre || 'Sólida Regular'}
                              </div>
                              {plan?.nivelEspesanteNombre && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  {plan.nivelEspesanteNombre}
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              {plan?.requiereAsistencia ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                                  Asistida
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#7A745F]">
                                  Autónomo
                                </span>
                              )}
                            </td>

                            {/* Botones de Registro Rápido de Ingesta */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-1">
                                {[100, 75, 50, 25, 0].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleUpdateIngestaRapida(res.id, val)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                      porcentaje === val && evaluado
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
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span className="font-mono font-bold text-xs text-[#182F28]">
                                {reg?.liquidosMl || 200} ml
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  porcentaje >= 75 ? 'bg-emerald-500' : porcentaje >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`} />
                                <span className="text-[11px] font-semibold text-[#4B4636]">
                                  {reg?.tolerancia || 'BUENA'}
                                </span>
                              </div>
                              {reg?.observaciones && (
                                <p className="text-[10px] text-[#7A745F] mt-0.5 truncate max-w-[180px]">
                                  {reg.observaciones}
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenDetalleIngesta(res.id)}
                                className="p-1.5 text-[#7A745F] hover:text-[#B3803F] hover:bg-[#F7F6F2] rounded-xl transition-colors cursor-pointer"
                                title="Editar detalle completo de ingesta"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <PaginadorTabla
                paginaActual={paginaComedor}
                totalPaginas={totalPaginasComedor}
                totalItems={residentesFiltradosComedor.length}
                itemsPorPagina={itemsPorPaginaComedor}
                itemLabel="comensales"
                onCambiarPagina={setPaginaComedor}
              />
            </div>
          )}

          {/* ===================================================================== */}
          {/* MODO 2: TARJETAS (GRID) EN COMEDOR                                    */}
          {/* ===================================================================== */}
          {viewModeComedor === 'grid' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {residentesPaginadosComedor.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-[#DEDBD1] text-xs text-[#7A745F]">
                    No se encontraron comensales para los filtros aplicados.
                  </div>
                ) : (
                  residentesPaginadosComedor.map(res => {
                    const plan = planesSede.find(p => p.idResidente === res.id);
                    const reg = mapaRegistros.get(res.id);
                    const porcentaje = reg?.porcentajeIngesta ?? 100;
                    const evaluado = Boolean(reg);

                    return (
                      <div
                        key={res.id}
                        className="bg-white rounded-3xl p-5 border border-[#DEDBD1] hover:border-[#B3803F] transition-all shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Cabecera Tarjeta */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <ResidentAvatar
                                fotoUrl={res.fotoUrl}
                                nombres={res.nombres}
                                apellidos={res.apellidos}
                                nombreCompleto={res.nombreCompleto}
                                sizeClass="w-12 h-12"
                                roundedClass="rounded-2xl"
                                textClass="text-sm"
                              />
                              <div>
                                <h4 className="font-bold text-sm text-[#182F28] leading-tight">
                                  {res.nombres} {res.apellidos}
                                </h4>
                                <div className="text-[11px] text-[#7A745F] mt-0.5">
                                  Habitación <strong>{res.habitacion || '101'}</strong> • Cama <strong>{res.cama || 'A'}</strong>
                                </div>
                              </div>
                            </div>

                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#182F28] text-[#DCB87F] shrink-0">
                              {plan?.tipoDietaNombre || res.tipoDieta || 'Normal'}
                            </span>
                          </div>

                          {/* Consistencia & Disfagia */}
                          <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#DEDBD1]/60 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[#7A745F] text-[11px]">Consistencia:</span>
                              <span className="font-bold text-[#182F28]">{plan?.consistenciaNombre || 'Sólida Regular'}</span>
                            </div>

                            {plan?.nivelEspesanteNombre && (
                              <div className="flex items-center justify-between text-amber-800">
                                <span className="text-[11px]">Espesante:</span>
                                <span className="font-bold text-[11px]">{plan.nivelEspesanteNombre}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-[#DEDBD1]/40">
                              <span className="text-[#7A745F] text-[11px]">Asistencia:</span>
                              {plan?.requiereAsistencia ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700">
                                  Asistida
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#7A745F] font-semibold">Autónomo</span>
                              )}
                            </div>
                          </div>

                          {/* Alertas */}
                          {plan?.restriccionesAlergias && (
                            <div className="p-2 bg-[#FBE8E6] border border-[#E9A8A0] text-[#A4453A] rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{plan.restriccionesAlergias}</span>
                            </div>
                          )}

                          {/* Botones de Registro Rápido */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-[#182F28]">
                              <span>Evaluación de Ingesta:</span>
                              <span className="font-mono text-xs text-[#B3803F]">{porcentaje}%</span>
                            </div>

                            <div className="grid grid-cols-5 gap-1">
                              {[100, 75, 50, 25, 0].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleUpdateIngestaRapida(res.id, val)}
                                  className={`py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                                    porcentaje === val && evaluado
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

                          {/* Líquidos y Tolerancia */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#DEDBD1]/60 text-xs">
                            <div className="flex items-center gap-1 text-blue-700 font-bold">
                              <Droplets className="w-3.5 h-3.5" />
                              <span>{reg?.liquidosMl || 200} ml</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                porcentaje >= 75 ? 'bg-emerald-500' : porcentaje >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} />
                              <span className="text-[11px] font-semibold text-[#4B4636]">
                                {reg?.tolerancia || 'BUENA'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Botón Detalle */}
                        <div className="pt-3 border-t border-[#DEDBD1]/60">
                          <button
                            type="button"
                            onClick={() => handleOpenDetalleIngesta(res.id)}
                            className="w-full py-2 px-3 bg-[#FAF9F5] hover:bg-[#EAE7DC] text-[#182F28] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DEDBD1]"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#B3803F]" />
                            <span>Detalle Clínico de Ingesta</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="bg-white rounded-2xl border border-[#DEDBD1] overflow-hidden">
                <PaginadorTabla
                  paginaActual={paginaComedor}
                  totalPaginas={totalPaginasComedor}
                  totalItems={residentesFiltradosComedor.length}
                  itemsPorPagina={itemsPorPaginaComedor}
                  itemLabel="comensales"
                  onCambiarPagina={setPaginaComedor}
                />
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* MODO 3: LISTA COMPACTA EN COMEDOR                                     */}
          {/* ===================================================================== */}
          {viewModeComedor === 'list' && (
            <div className="space-y-3">
              <div className="bg-white rounded-3xl border border-[#DEDBD1] overflow-hidden shadow-xs divide-y divide-[#DEDBD1]">
                {residentesPaginadosComedor.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#7A745F]">
                    No se encontraron comensales para los filtros aplicados.
                  </div>
                ) : (
                  residentesPaginadosComedor.map(res => {
                    const plan = planesSede.find(p => p.idResidente === res.id);
                    const reg = mapaRegistros.get(res.id);
                    const porcentaje = reg?.porcentajeIngesta ?? 100;
                    const evaluado = Boolean(reg);

                    return (
                      <div
                        key={res.id}
                        className="p-4 hover:bg-[#FAF9F5] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <ResidentAvatar
                            fotoUrl={res.fotoUrl}
                            nombres={res.nombres}
                            apellidos={res.apellidos}
                            nombreCompleto={res.nombreCompleto}
                            sizeClass="w-10 h-10"
                            roundedClass="rounded-xl"
                            textClass="text-xs"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-[#182F28]">
                                {res.nombres} {res.apellidos}
                              </h4>
                              <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#182F28] text-[#DCB87F]">
                                {plan?.tipoDietaNombre || res.tipoDieta || 'Normal'}
                              </span>
                              {plan?.requiereAsistencia && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                                  Asistida
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#7A745F] mt-0.5">
                              Hab. {res.habitacion || '101'} ({res.cama || 'A'}) • {plan?.consistenciaNombre || 'Sólida Regular'}
                              {plan?.nivelEspesanteNombre && ` • ${plan.nivelEspesanteNombre}`}
                            </div>
                          </div>
                        </div>

                        {/* Botones de porcentaje y métricas */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[100, 75, 50, 25, 0].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleUpdateIngestaRapida(res.id, val)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  porcentaje === val && evaluado
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

                          <span className="font-mono text-xs font-bold text-[#182F28] px-2 py-1 bg-[#F7F6F2] rounded-lg border border-[#DEDBD1]">
                            {reg?.liquidosMl || 200} ml
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenDetalleIngesta(res.id)}
                            className="p-2 text-[#7A745F] hover:text-[#B3803F] hover:bg-[#FAF9F5] rounded-xl border border-[#DEDBD1] transition-colors cursor-pointer"
                            title="Editar detalle clínico"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                <PaginadorTabla
                  paginaActual={paginaComedor}
                  totalPaginas={totalPaginasComedor}
                  totalItems={residentesFiltradosComedor.length}
                  itemsPorPagina={itemsPorPaginaComedor}
                  itemLabel="comensales"
                  onCambiarPagina={setPaginaComedor}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PLANES NUTRICIONALES                                            */}
      {/* ========================================================================= */}
      {subTab === 'planes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#DEDBD1] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#182F28]">
                  Directorio de Planes Nutricionales por Residente
                </h3>
                <p className="text-xs text-[#7A745F]">
                  Prescripciones dietéticas, niveles de consistencia para disfagia y requerimientos calóricos
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Buscador */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7A745F]" />
                  <input
                    type="text"
                    placeholder="Buscar residente..."
                    value={filtroPlanesTexto}
                    onChange={(e) => setFiltroPlanesTexto(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-[#182F28] focus:outline-none focus:border-[#B3803F] w-44"
                  />
                </div>

                {/* Filtro Dieta */}
                <select
                  value={filtroPlanesDieta}
                  onChange={(e) => setFiltroPlanesDieta(e.target.value)}
                  className="px-3 py-1.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="TODAS">Todas las Dietas</option>
                  <option value="Normal">Normal / General</option>
                  <option value="Hiposódica">Hiposódica</option>
                  <option value="Diabética">Diabética</option>
                  <option value="Blanda">Blanda Mecánica</option>
                  <option value="Papilla">Papilla / Licuada</option>
                  <option value="Renal">Hipoproteica / Renal</option>
                </select>

                {/* Selector de Modo de Vista (Tarjetas, Lista, Tabla) */}
                <ViewModeSelector
                  viewMode={viewModePlanes}
                  onChange={(mode) => {
                    setViewModePlanes(mode);
                    setPaginaPlanes(1);
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setPlanSeleccionado(null);
                    setResidenteIdInicialParaPlan(undefined);
                    setIsPlanModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#B3803F] hover:bg-[#9a6c32] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Plan Clínico</span>
                </button>
              </div>
            </div>

            {/* MODO 1: TARJETAS EN PLANES (GRID) */}
            {viewModePlanes === 'grid' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {residentesPaginadosPlanes.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-xs text-[#7A745F]">
                      No se encontraron residentes con los filtros aplicados.
                    </div>
                  ) : (
                    residentesPaginadosPlanes.map(res => {
                      const plan = planesSede.find(p => p.idResidente === res.id);

                      return (
                        <div
                          key={res.id}
                          className="bg-[#FAF9F5] rounded-2xl p-4 border border-[#DEDBD1] hover:border-[#B3803F] transition-all space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2.5">
                                <ResidentAvatar
                                  fotoUrl={res.fotoUrl}
                                  nombres={res.nombres}
                                  apellidos={res.apellidos}
                                  nombreCompleto={res.nombreCompleto}
                                  sizeClass="w-10 h-10"
                                  roundedClass="rounded-xl"
                                  textClass="text-xs"
                                />
                                <div>
                                  <h4 className="font-bold text-sm text-[#182F28]">
                                    {res.nombres} {res.apellidos}
                                  </h4>
                                  <div className="text-[11px] text-[#7A745F]">
                                    Habitación {res.habitacion || '101'} • Cama {res.cama || 'A'}
                                  </div>
                                </div>
                              </div>

                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                plan ? 'bg-[#182F28] text-[#DCB87F]' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {plan?.estado || 'SIN PLAN'}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-[#DEDBD1]/60 space-y-2 text-xs">
                              <div>
                                <span className="text-[#7A745F] text-[11px]">Tipo de Dieta: </span>
                                <span className="font-bold text-[#182F28]">
                                  {plan?.tipoDietaNombre || res.tipoDieta || 'Normal / General'}
                                </span>
                              </div>

                              <div>
                                <span className="text-[#7A745F] text-[11px]">Consistencia: </span>
                                <span className="font-semibold text-[#4B4636]">
                                  {plan?.consistenciaNombre || 'Sólida Regular'}
                                </span>
                              </div>

                              {plan?.nivelEspesanteNombre && (
                                <div>
                                  <span className="text-[#7A745F] text-[11px]">Espesante IDDSI: </span>
                                  <span className="font-bold text-amber-700">{plan.nivelEspesanteNombre}</span>
                                </div>
                              )}

                              {plan?.restriccionesAlergias && (
                                <div className="p-2 rounded-xl bg-[#FBE8E6] border border-[#E9A8A0] text-[#A4453A] text-[11px]">
                                  <strong>Alergia/Restricción: </strong>{plan.restriccionesAlergias}
                                </div>
                              )}

                              {plan?.suplementoNutricional && (
                                <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-[11px]">
                                  <strong>Suplemento: </strong>{plan.suplementoNutricional}
                                </div>
                              )}

                              <div className="flex items-center justify-between text-[11px] pt-1 text-[#7A745F]">
                                <span>Calorías: <strong>{plan?.requerimientoCaloricoKcal || 1800} kcal</strong></span>
                                <span>Asistencia: <strong>{plan?.requiereAsistencia ? 'Sí' : 'No'}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#DEDBD1]/60 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (plan) {
                                  setPlanSeleccionado(plan);
                                  setResidenteIdInicialParaPlan(res.id);
                                } else {
                                  setPlanSeleccionado(null);
                                  setResidenteIdInicialParaPlan(res.id);
                                }
                                setIsPlanModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#EAE7DC] text-[#182F28] border border-[#DEDBD1] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#B3803F]" />
                              <span>{plan ? 'Editar Plan' : 'Prescribir Plan'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <PaginadorTabla
                  paginaActual={paginaPlanes}
                  totalPaginas={totalPaginasPlanes}
                  totalItems={residentesFiltradosPlanes.length}
                  itemsPorPagina={itemsPorPaginaPlanes}
                  itemLabel="planes nutricionales"
                  onCambiarPagina={setPaginaPlanes}
                />
              </div>
            )}

            {/* MODO 2: LISTA COMPACTA EN PLANES */}
            {viewModePlanes === 'list' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-[#DEDBD1] overflow-hidden shadow-xs divide-y divide-[#DEDBD1]">
                  {residentesPaginadosPlanes.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#7A745F]">
                      No se encontraron residentes con los filtros aplicados.
                    </div>
                  ) : (
                    residentesPaginadosPlanes.map(res => {
                      const plan = planesSede.find(p => p.idResidente === res.id);

                      return (
                        <div
                          key={res.id}
                          className="p-4 hover:bg-[#FAF9F5] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <ResidentAvatar
                              fotoUrl={res.fotoUrl}
                              nombres={res.nombres}
                              apellidos={res.apellidos}
                              nombreCompleto={res.nombreCompleto}
                              sizeClass="w-10 h-10"
                              roundedClass="rounded-xl"
                              textClass="text-xs"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs text-[#182F28]">
                                  {res.nombres} {res.apellidos}
                                </h4>
                                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#182F28] text-[#DCB87F]">
                                  {plan?.tipoDietaNombre || res.tipoDieta || 'Normal'}
                                </span>
                                {plan?.requiereAsistencia && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                                    Asistida
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#7A745F] mt-0.5">
                                Hab. {res.habitacion || '101'} • Consistencia: {plan?.consistenciaNombre || 'Sólida Regular'}
                                {plan?.nivelEspesanteNombre && ` • ${plan.nivelEspesanteNombre}`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-[#182F28] px-2.5 py-1 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                              {plan?.requerimientoCaloricoKcal || 1800} kcal/día
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setPlanSeleccionado(plan || null);
                                setResidenteIdInicialParaPlan(res.id);
                                setIsPlanModalOpen(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#EAE7DC] text-[#182F28] font-bold rounded-xl text-xs border border-[#DEDBD1] transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#B3803F]" />
                              <span>{plan ? 'Editar' : 'Prescribir'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <PaginadorTabla
                    paginaActual={paginaPlanes}
                    totalPaginas={totalPaginasPlanes}
                    totalItems={residentesFiltradosPlanes.length}
                    itemsPorPagina={itemsPorPaginaPlanes}
                    itemLabel="planes nutricionales"
                    onCambiarPagina={setPaginaPlanes}
                  />
                </div>
              </div>
            )}

            {/* MODO 3: TABLA EN PLANES */}
            {viewModePlanes === 'table' && (
              <div className="bg-white rounded-3xl border border-[#DEDBD1] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#182F28] text-white uppercase text-[10px] tracking-wider font-mono">
                      <tr>
                        <th className="py-3 px-4">Residente & Ubicación</th>
                        <th className="py-3 px-4">Tipo Dieta</th>
                        <th className="py-3 px-4">Consistencia / Espesante</th>
                        <th className="py-3 px-4 text-center">Meta Kcal</th>
                        <th className="py-3 px-4 text-center">Asistencia</th>
                        <th className="py-3 px-4">Alergias & Restricciones</th>
                        <th className="py-3 px-4">Suplemento</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DEDBD1]">
                      {residentesPaginadosPlanes.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-xs text-[#7A745F]">
                            No se encontraron residentes con los filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        residentesPaginadosPlanes.map(res => {
                          const plan = planesSede.find(p => p.idResidente === res.id);

                          return (
                            <tr key={res.id} className="hover:bg-[#FAF9F5] transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#182F28] text-xs">
                                  {res.nombres} {res.apellidos}
                                </div>
                                <div className="text-[11px] text-[#7A745F]">
                                  Hab. {res.habitacion || '101'} • Cama {res.cama || 'A'}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-bold text-[#182F28]">
                                {plan?.tipoDietaNombre || res.tipoDieta || 'Normal / General'}
                              </td>

                              <td className="py-3.5 px-4">
                                <div>{plan?.consistenciaNombre || 'Sólida Regular'}</div>
                                {plan?.nivelEspesanteNombre && (
                                  <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                    {plan.nivelEspesanteNombre}
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono font-bold">
                                {plan?.requerimientoCaloricoKcal || 1800} kcal
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                {plan?.requiereAsistencia ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                                    Asistida
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-[#7A745F]">Autónomo</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {plan?.restriccionesAlergias ? (
                                  <span className="text-[11px] text-[#A4453A] font-semibold">
                                    {plan.restriccionesAlergias}
                                  </span>
                                ) : (
                                  <span className="text-[#7A745F] text-[11px]">—</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-[11px]">
                                {plan?.suplementoNutricional || '—'}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPlanSeleccionado(plan || null);
                                    setResidenteIdInicialParaPlan(res.id);
                                    setIsPlanModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#EAE7DC] text-[#182F28] font-bold rounded-xl text-xs border border-[#DEDBD1] transition-colors cursor-pointer"
                                >
                                  {plan ? 'Editar' : 'Prescribir'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginadorTabla
                  paginaActual={paginaPlanes}
                  totalPaginas={totalPaginasPlanes}
                  totalItems={residentesFiltradosPlanes.length}
                  itemsPorPagina={itemsPorPaginaPlanes}
                  itemLabel="planes nutricionales"
                  onCambiarPagina={setPaginaPlanes}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: MINUTA SEMANAL                                                   */}
      {/* ========================================================================= */}
      {subTab === 'minuta' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#DEDBD1] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#182F28]">
                    {minutaActiva ? minutaActiva.nombre : 'Sin Minuta Configurada'}
                  </h3>
                  {minutaActiva && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {minutaActiva.estado}
                    </span>
                  )}
                </div>
                {minutaActiva && (
                  <p className="text-xs text-[#7A745F] mt-1">
                    {minutaActiva.descripcion} • Vigencia: {minutaActiva.fechaInicio} al {minutaActiva.fechaFin}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {minutasSede.length > 1 && (
                  <select
                    value={minutaActiva?.id}
                    onChange={(e) => setMinutaActivaId(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                  >
                    {minutasSede.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                )}

                {/* Selector de modo para la Minuta */}
                <ViewModeSelector
                  viewMode={viewModeMinuta}
                  onChange={setViewModeMinuta}
                />

                <button
                  type="button"
                  onClick={() => {
                    setMinutaSeleccionada(null);
                    setIsMinutaModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF9F5] hover:bg-[#EAE7DC] text-[#182F28] border border-[#DEDBD1] rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#B3803F]" />
                  <span>Nueva Minuta</span>
                </button>

                {minutaActiva && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinutaSeleccionada(minutaActiva);
                      setIsMinutaModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF9F5] hover:bg-[#EAE7DC] text-[#182F28] border border-[#DEDBD1] rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-[#B3803F]" />
                    <span>Editar Minuta</span>
                  </button>
                )}

                {minutaActiva && (
                  <button
                    type="button"
                    onClick={() => setIsImprimirMinutaOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#182F28] hover:bg-[#274A3F] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#DCB87F]" />
                    <span>Exportar Menú</span>
                  </button>
                )}
              </div>
            </div>

            {/* MODO 1: DÍAS EN TARJETAS (GRID) */}
            {viewModeMinuta === 'grid' && (
              <div className="space-y-4">
                {diasSemana.map((dia, idx) => {
                  const diaNum = idx + 1;
                  const itemsDia = minutaActiva?.items?.filter(item => item.diaSemana === diaNum) || [];

                  return (
                    <div key={dia} className="border border-[#DEDBD1] rounded-2xl overflow-hidden">
                      <div className="bg-[#F7F6F2] px-4 py-2.5 flex items-center justify-between border-b border-[#DEDBD1]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#B3803F]" />
                          <span className="font-serif font-bold text-sm text-[#182F28]">{dia}</span>
                        </div>
                        <span className="text-[11px] text-[#7A745F]">
                          {itemsDia.length} preparaciones programadas
                        </span>
                      </div>

                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {itemsDia.length > 0 ? (
                          itemsDia.map(item => (
                            <div key={item.id} className="bg-white p-3.5 rounded-xl border border-[#DEDBD1] space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#B3803F] uppercase tracking-wider text-[10px] font-mono">
                                  {item.tiempoComidaNombre}
                                </span>
                                <span className="text-[10px] text-[#7A745F] font-mono">
                                  ~{item.caloriasEstimadas} kcal
                                </span>
                              </div>

                              <div className="text-xs font-semibold text-[#182F28]">
                                {item.platoPrincipal}
                              </div>

                              {item.acompanamiento && (
                                <div className="text-[11px] text-[#7A745F]">
                                  <strong>Acompañamiento: </strong>{item.acompanamiento}
                                </div>
                              )}

                              {item.bebida && (
                                <div className="text-[11px] text-[#7A745F]">
                                  <strong>Bebida: </strong>{item.bebida}
                                </div>
                              )}

                              {item.postre && (
                                <div className="text-[11px] text-[#7A745F]">
                                  <strong>Postre: </strong>{item.postre}
                                </div>
                              )}

                              {item.observacionesDietas && (
                                <div className="mt-1.5 p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 font-medium">
                                  <strong>Nota Dietas: </strong>{item.observacionesDietas}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-4 text-center text-xs text-[#7A745F]">
                            No hay preparaciones registradas para este día en la minuta activa.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODO 2: MATRIZ SEMANAL EN TABLA (TABLE) */}
            {viewModeMinuta === 'table' && (
              <div className="border border-[#DEDBD1] rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#182F28] text-white uppercase text-[10px] tracking-wider font-mono">
                      <tr>
                        <th className="py-3 px-3 w-28">Día</th>
                        <th className="py-3 px-3">Desayuno</th>
                        <th className="py-3 px-3">Almuerzo</th>
                        <th className="py-3 px-3">Merienda / Once</th>
                        <th className="py-3 px-3">Cena</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DEDBD1]">
                      {diasSemana.map((dia, idx) => {
                        const diaNum = idx + 1;
                        const itemsDia = minutaActiva?.items?.filter(item => item.diaSemana === diaNum) || [];
                        const des = itemsDia.find(i => i.idTiempoComida === 1);
                        const alm = itemsDia.find(i => i.idTiempoComida === 2);
                        const mer = itemsDia.find(i => i.idTiempoComida === 3);
                        const cen = itemsDia.find(i => i.idTiempoComida === 4);

                        return (
                          <tr key={dia} className="hover:bg-[#FAF9F5] transition-colors">
                            <td className="py-3 px-3 font-serif font-bold text-[#182F28] bg-[#F7F6F2]">
                              {dia}
                            </td>

                            <td className="py-3 px-3 align-top">
                              {des ? (
                                <div className="space-y-0.5">
                                  <div className="font-bold text-[#182F28]">{des.platoPrincipal}</div>
                                  <div className="text-[10px] text-[#7A745F]">
                                    {des.bebida} {des.postre ? `• ${des.postre}` : ''}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[#7A745F] italic text-[11px]">—</span>
                              )}
                            </td>

                            <td className="py-3 px-3 align-top">
                              {alm ? (
                                <div className="space-y-0.5">
                                  <div className="font-bold text-[#182F28]">{alm.platoPrincipal}</div>
                                  <div className="text-[10px] text-[#7A745F]">
                                    {alm.acompanamiento} • {alm.bebida}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[#7A745F] italic text-[11px]">—</span>
                              )}
                            </td>

                            <td className="py-3 px-3 align-top">
                              {mer ? (
                                <div className="space-y-0.5">
                                  <div className="font-bold text-[#182F28]">{mer.platoPrincipal}</div>
                                  <div className="text-[10px] text-[#7A745F]">{mer.bebida}</div>
                                </div>
                              ) : (
                                <span className="text-[#7A745F] italic text-[11px]">—</span>
                              )}
                            </td>

                            <td className="py-3 px-3 align-top">
                              {cen ? (
                                <div className="space-y-0.5">
                                  <div className="font-bold text-[#182F28]">{cen.platoPrincipal}</div>
                                  <div className="text-[10px] text-[#7A745F]">
                                    {cen.acompanamiento} • {cen.bebida}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[#7A745F] italic text-[11px]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODO 3: LISTA EN MINUTA */}
            {viewModeMinuta === 'list' && (
              <div className="bg-white rounded-3xl border border-[#DEDBD1] overflow-hidden shadow-xs divide-y divide-[#DEDBD1]">
                {(minutaActiva?.items || []).length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#7A745F]">
                    No hay preparaciones registradas en esta minuta.
                  </div>
                ) : (
                  (minutaActiva?.items || []).map(item => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-[#FAF9F5] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-[#182F28]">
                            {item.nombreDia || diasSemana[item.diaSemana - 1]}
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#182F28] text-[#DCB87F] font-mono">
                            {item.tiempoComidaNombre}
                          </span>
                          <span className="text-[#7A745F] font-mono text-[11px]">
                            ~{item.caloriasEstimadas} kcal
                          </span>
                        </div>
                        <div className="font-bold text-[#182F28] text-sm">
                          {item.platoPrincipal}
                        </div>
                        <div className="text-[11px] text-[#7A745F] flex flex-wrap gap-2">
                          {item.acompanamiento && <span><strong>Acomp:</strong> {item.acompanamiento}</span>}
                          {item.bebida && <span><strong>Bebida:</strong> {item.bebida}</span>}
                          {item.postre && <span><strong>Postre:</strong> {item.postre}</span>}
                        </div>
                      </div>

                      {item.observacionesDietas && (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-900 shrink-0">
                          {item.observacionesDietas}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALES DEL MÓDULO DE ALIMENTACIÓN (FASE 2)                               */}
      {/* ========================================================================= */}
      <PrescribirPlanNutricionalModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setPlanSeleccionado(null);
        }}
        planAEditar={planSeleccionado}
        idResidenteInicial={residenteIdInicialParaPlan}
      />

      <ProgramarMinutaModal
        isOpen={isMinutaModalOpen}
        onClose={() => {
          setIsMinutaModalOpen(false);
          setMinutaSeleccionada(null);
        }}
        minutaAEditar={minutaSeleccionada}
      />

      {minutaActiva && (
        <ImprimirMinutaSemanalModal
          isOpen={isImprimirMinutaOpen}
          onClose={() => setIsImprimirMinutaOpen(false)}
          minuta={minutaActiva}
        />
      )}

      <DetalleIngestaComedorModal
        isOpen={isDetalleIngestaOpen}
        onClose={() => {
          setIsDetalleIngestaOpen(false);
          setRegistroSeleccionadoParaIngesta(null);
          setPlanSeleccionadoParaIngesta(null);
        }}
        registro={registroSeleccionadoParaIngesta}
        plan={planSeleccionadoParaIngesta}
      />
    </div>
  );
};
