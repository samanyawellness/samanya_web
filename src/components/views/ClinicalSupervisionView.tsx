import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Residente, BitacoraResidente } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  X,
  Filter,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  HeartHandshake,
  RefreshCw,
  FileText,
  ChevronRight,
  List,
  Eye,
  Send,
  Building2,
  Pill,
  RotateCcw,
  CalendarDays,
  Users
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarUtils';
import { ViewModeSelector, ViewMode } from '../common/ViewModeSelector';
import { PaginadorTabla } from '../common/PaginadorTabla';
import { extraerDatosIncidente, obtenerClasesSeveridad } from '../../utils/incidenteUtils';

// Helper para normalizar fechas al formato YYYY-MM-DD para comparaciones de rango
function normalizarFecha(f: string | undefined): string {
  if (!f) return '';
  const trimmed = f.trim();
  // Formato DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const parts = trimmed.split('/');
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }
  // Formato YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
  if (trimmed.length >= 10 && trimmed[4] === '-' && trimmed[7] === '-') {
    return trimmed.substring(0, 10);
  }
  return trimmed;
}

export const ClinicalSupervisionView: React.FC = () => {
  const {
    residentes,
    trabajadores,
    activeSede,
    currentUser,
    agregarEntradaBitacora,
    cargarBitacoraResidente,
    setSelectedResidente,
    setIsResidenteDetailOpen,
    incidentes,
    setIsRegisterIncidentOpen,
    actualizarEstadoIncidente
  } = useAdmin();

  // Sub-tabs principales de la vista
  const [subTab, setSubTab] = useState<'llenar' | 'historial_general' | 'incidentes'>('llenar');

  // Pacientes de la sede actual
  const sedeResidentes = useMemo(() => {
    return residentes.filter((r) => r.idCentro === activeSede.id);
  }, [residentes, activeSede.id]);

  // Residente seleccionado para llenar bitácora
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Auto-seleccionar primer residente si no hay ninguno seleccionado
  useEffect(() => {
    if (sedeResidentes.length > 0) {
      if (!selectedId || !sedeResidentes.some((r) => r.id === selectedId)) {
        setSelectedId(sedeResidentes[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [sedeResidentes, selectedId]);

  const selectedResidente = useMemo(() => {
    return sedeResidentes.find((r) => r.id === selectedId) || null;
  }, [sedeResidentes, selectedId]);

  // Cargar bitácora desde backend cuando cambia el residente seleccionado
  const [cargandoBitacora, setCargandoBitacora] = useState(false);
  useEffect(() => {
    if (selectedResidente?.id) {
      setCargandoBitacora(true);
      cargarBitacoraResidente(selectedResidente.id)
        .catch(() => {})
        .finally(() => setCargandoBitacora(false));
    }
  }, [selectedResidente?.id]);

  // Buscador de residentes para la columna izquierda
  const [searchResidente, setSearchResidente] = useState('');
  const [filterEstadoRes, setFilterEstadoRes] = useState<string>('TODOS');

  const residentesFiltrados = useMemo(() => {
    return sedeResidentes.filter((r) => {
      const q = searchResidente.trim().toLowerCase();
      if (q) {
        const cleanQ = q.replace(/[.,]/g, '');
        const match =
          r.nombreCompleto.toLowerCase().includes(q) ||
          r.identificacion.includes(cleanQ) ||
          r.habitacion.toLowerCase().includes(q) ||
          r.codigoExpediente.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filterEstadoRes !== 'TODOS' && r.estado !== filterEstadoRes) {
        return false;
      }
      return true;
    });
  }, [sedeResidentes, searchResidente, filterEstadoRes]);

  // Estado del formulario de nueva nota
  const [categoriaNuevaNota, setCategoriaNuevaNota] = useState<string>('Rutina');
  const [textoNuevaNota, setTextoNuevaNota] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // ---------------------------------------------------------------------------
  // Recopilar lista de todos los autores / talento humano disponibles
  // ---------------------------------------------------------------------------
  const todasLasNotas = useMemo(() => {
    const lista: (BitacoraResidente & { residenteObj?: Residente })[] = [];
    sedeResidentes.forEach((res) => {
      if (res.bitacora && res.bitacora.length > 0) {
        res.bitacora.forEach((b) => {
          lista.push({
            ...b,
            nombreResidente: b.nombreResidente || res.nombreCompleto,
            habitacion: b.habitacion || res.habitacion,
            cama: b.cama || res.cama,
            residenteObj: res
          });
        });
      }
    });

    lista.sort((a, b) => {
      const fechaA = `${normalizarFecha(a.fecha)} ${a.hora || ''}`;
      const fechaB = `${normalizarFecha(b.fecha)} ${b.hora || ''}`;
      return fechaB.localeCompare(fechaA);
    });

    return lista;
  }, [sedeResidentes]);

  const autoresDisponibles = useMemo(() => {
    const setAutores = new Set<string>();
    todasLasNotas.forEach((n) => {
      const autor = (n.nombreUsuario || n.nombreEmpleado || '').trim();
      if (autor) setAutores.add(autor);
    });
    trabajadores.forEach((t) => {
      if (t.nombreCompleto) setAutores.add(t.nombreCompleto.trim());
    });
    return Array.from(setAutores).sort();
  }, [todasLasNotas, trabajadores]);

  // ---------------------------------------------------------------------------
  // Filtros, Modos de Vista y Paginación para Notas del Paciente Seleccionado
  // ---------------------------------------------------------------------------
  const [busquedaNota, setBusquedaNota] = useState('');
  const [filtroCategoriaNota, setFiltroCategoriaNota] = useState('TODAS');
  const [fechaDesdeNota, setFechaDesdeNota] = useState('');
  const [fechaHastaNota, setFechaHastaNota] = useState('');
  const [filtroAutorNota, setFiltroAutorNota] = useState('TODOS');
  const [viewModeNota, setViewModeNota] = useState<ViewMode>('list');
  const [paginaNota, setPaginaNota] = useState(1);

  const itemsPorPaginaNota = viewModeNota === 'grid' ? 6 : 8;

  // Resetear página al modificar filtros en notas del paciente
  useEffect(() => {
    setPaginaNota(1);
  }, [
    selectedId,
    busquedaNota,
    filtroCategoriaNota,
    fechaDesdeNota,
    fechaHastaNota,
    filtroAutorNota,
    viewModeNota
  ]);

  const notasFiltradas = useMemo(() => {
    if (!selectedResidente?.bitacora) return [];
    return selectedResidente.bitacora.filter((nota) => {
      // Filtro Categoría
      if (filtroCategoriaNota !== 'TODAS') {
        if (filtroCategoriaNota === 'Incidente / Evento Adverso') {
          if (nota.categoria !== 'Incidente / Evento Adverso' && !extraerDatosIncidente(nota)) {
            return false;
          }
        } else if ((nota.categoria || 'Rutina') !== filtroCategoriaNota) {
          return false;
        }
      }
      // Filtro Rango de Fechas
      const fNorm = normalizarFecha(nota.fecha);
      if (fechaDesdeNota && fNorm && fNorm < fechaDesdeNota) {
        return false;
      }
      if (fechaHastaNota && fNorm && fNorm > fechaHastaNota) {
        return false;
      }
      // Filtro Talento Humano / Autor
      if (filtroAutorNota !== 'TODOS') {
        const autorNota = (nota.nombreUsuario || nota.nombreEmpleado || '').toLowerCase().trim();
        const filtroLower = filtroAutorNota.toLowerCase().trim();
        if (!autorNota.includes(filtroLower) && !filtroLower.includes(autorNota)) {
          return false;
        }
      }
      // Filtro Texto
      if (busquedaNota.trim()) {
        const q = busquedaNota.toLowerCase();
        const dInc = extraerDatosIncidente(nota);
        const match =
          nota.contenido.toLowerCase().includes(q) ||
          (dInc && (dInc.tipo.toLowerCase().includes(q) || dInc.severidad.toLowerCase().includes(q))) ||
          (nota.nombreUsuario && nota.nombreUsuario.toLowerCase().includes(q)) ||
          (nota.nombreEmpleado && nota.nombreEmpleado.toLowerCase().includes(q)) ||
          nota.fecha.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [
    selectedResidente?.bitacora,
    busquedaNota,
    filtroCategoriaNota,
    fechaDesdeNota,
    fechaHastaNota,
    filtroAutorNota
  ]);

  const totalPaginasNota = Math.ceil(notasFiltradas.length / itemsPorPaginaNota) || 1;
  const notasPaginadas = useMemo(() => {
    const inicio = (paginaNota - 1) * itemsPorPaginaNota;
    return notasFiltradas.slice(inicio, inicio + itemsPorPaginaNota);
  }, [notasFiltradas, paginaNota, itemsPorPaginaNota]);

  const hayFiltrosActivosNota = Boolean(
    busquedaNota ||
      filtroCategoriaNota !== 'TODAS' ||
      fechaDesdeNota ||
      fechaHastaNota ||
      filtroAutorNota !== 'TODOS'
  );

  const limpiarFiltrosNota = () => {
    setBusquedaNota('');
    setFiltroCategoriaNota('TODAS');
    setFechaDesdeNota('');
    setFechaHastaNota('');
    setFiltroAutorNota('TODOS');
  };

  // Manejar envío de nueva nota de bitácora
  const handleGuardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidente || !textoNuevaNota.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await agregarEntradaBitacora(selectedResidente.id, {
        contenido: textoNuevaNota.trim(),
        categoria: categoriaNuevaNota
      });
      setTextoNuevaNota('');
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Filtros, Modos de Vista y Paginación para Historial General de la Sede
  // ---------------------------------------------------------------------------
  const [searchHistorialGeneral, setSearchHistorialGeneral] = useState('');
  const [filtroCategoriaGeneral, setFiltroCategoriaGeneral] = useState('TODAS');
  const [fechaDesdeGeneral, setFechaDesdeGeneral] = useState('');
  const [fechaHastaGeneral, setFechaHastaGeneral] = useState('');
  const [filtroAutorGeneral, setFiltroAutorGeneral] = useState('TODOS');
  const [viewModeGeneral, setViewModeGeneral] = useState<ViewMode>('list');
  const [paginaGeneral, setPaginaGeneral] = useState(1);

  const itemsPorPaginaGeneral = viewModeGeneral === 'grid' ? 6 : 10;

  // Resetear página al modificar filtros en historial general
  useEffect(() => {
    setPaginaGeneral(1);
  }, [
    searchHistorialGeneral,
    filtroCategoriaGeneral,
    fechaDesdeGeneral,
    fechaHastaGeneral,
    filtroAutorGeneral,
    viewModeGeneral
  ]);

  const historialGeneralFiltrado = useMemo(() => {
    return todasLasNotas.filter((n) => {
      // Filtro Categoría
      if (filtroCategoriaGeneral !== 'TODAS') {
        if (filtroCategoriaGeneral === 'Incidente / Evento Adverso') {
          if (n.categoria !== 'Incidente / Evento Adverso' && !extraerDatosIncidente(n)) {
            return false;
          }
        } else if ((n.categoria || 'Rutina') !== filtroCategoriaGeneral) {
          return false;
        }
      }
      // Filtro Rango de Fechas
      const fNorm = normalizarFecha(n.fecha);
      if (fechaDesdeGeneral && fNorm && fNorm < fechaDesdeGeneral) {
        return false;
      }
      if (fechaHastaGeneral && fNorm && fNorm > fechaHastaGeneral) {
        return false;
      }
      // Filtro Talento Humano / Autor
      if (filtroAutorGeneral !== 'TODOS') {
        const autorNota = (n.nombreUsuario || n.nombreEmpleado || '').toLowerCase().trim();
        const filtroLower = filtroAutorGeneral.toLowerCase().trim();
        if (!autorNota.includes(filtroLower) && !filtroLower.includes(autorNota)) {
          return false;
        }
      }
      // Filtro Texto
      if (searchHistorialGeneral.trim()) {
        const q = searchHistorialGeneral.toLowerCase();
        const dInc = extraerDatosIncidente(n);
        const match =
          n.contenido.toLowerCase().includes(q) ||
          (dInc && (dInc.tipo.toLowerCase().includes(q) || dInc.severidad.toLowerCase().includes(q))) ||
          (n.nombreResidente && n.nombreResidente.toLowerCase().includes(q)) ||
          (n.habitacion && n.habitacion.toLowerCase().includes(q)) ||
          (n.categoria && n.categoria.toLowerCase().includes(q)) ||
          (n.nombreUsuario && n.nombreUsuario.toLowerCase().includes(q)) ||
          (n.nombreEmpleado && n.nombreEmpleado.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [
    todasLasNotas,
    searchHistorialGeneral,
    filtroCategoriaGeneral,
    fechaDesdeGeneral,
    fechaHastaGeneral,
    filtroAutorGeneral
  ]);

  const totalPaginasGeneral = Math.ceil(historialGeneralFiltrado.length / itemsPorPaginaGeneral) || 1;
  const historialGeneralPaginado = useMemo(() => {
    const inicio = (paginaGeneral - 1) * itemsPorPaginaGeneral;
    return historialGeneralFiltrado.slice(inicio, inicio + itemsPorPaginaGeneral);
  }, [historialGeneralFiltrado, paginaGeneral, itemsPorPaginaGeneral]);

  const hayFiltrosActivosGeneral = Boolean(
    searchHistorialGeneral ||
      filtroCategoriaGeneral !== 'TODAS' ||
      fechaDesdeGeneral ||
      fechaHastaGeneral ||
      filtroAutorGeneral !== 'TODOS'
  );

  const limpiarFiltrosGeneral = () => {
    setSearchHistorialGeneral('');
    setFiltroCategoriaGeneral('TODAS');
    setFechaDesdeGeneral('');
    setFechaHastaGeneral('');
    setFiltroAutorGeneral('TODOS');
  };

  // Incidentes de la sede
  const sedeIncidentes = useMemo(() => {
    return incidentes.filter((i) => i.idCentro === activeSede.id);
  }, [incidentes, activeSede.id]);

  // Filtros y Paginación de Incidentes
  const [searchIncidente, setSearchIncidente] = useState('');
  const [filtroSeveridadIncidente, setFiltroSeveridadIncidente] = useState<string>('TODAS');
  const [filtroEstadoIncidente, setFiltroEstadoIncidente] = useState<string>('TODOS');
  const [paginaIncidentes, setPaginaIncidentes] = useState(1);
  const itemsPorPaginaIncidentes = 5;

  const incidentesFiltrados = useMemo(() => {
    return sedeIncidentes.filter((inc) => {
      if (filtroSeveridadIncidente !== 'TODAS' && inc.severidad !== filtroSeveridadIncidente) {
        return false;
      }
      if (filtroEstadoIncidente !== 'TODOS' && inc.estado !== filtroEstadoIncidente) {
        return false;
      }
      if (searchIncidente.trim()) {
        const term = searchIncidente.toLowerCase();
        const match =
          inc.nombreResidente.toLowerCase().includes(term) ||
          inc.habitacion.toLowerCase().includes(term) ||
          inc.descripcion.toLowerCase().includes(term) ||
          inc.accionesTomadas.toLowerCase().includes(term) ||
          inc.reportadoPor.toLowerCase().includes(term) ||
          inc.tipo.toLowerCase().includes(term);
        if (!match) return false;
      }
      return true;
    });
  }, [sedeIncidentes, filtroSeveridadIncidente, filtroEstadoIncidente, searchIncidente]);

  const totalPaginasIncidentes = Math.max(1, Math.ceil(incidentesFiltrados.length / itemsPorPaginaIncidentes));
  const incidentesPaginados = useMemo(() => {
    const inicio = (paginaIncidentes - 1) * itemsPorPaginaIncidentes;
    return incidentesFiltrados.slice(inicio, inicio + itemsPorPaginaIncidentes);
  }, [incidentesFiltrados, paginaIncidentes, itemsPorPaginaIncidentes]);

  const hayFiltrosActivosIncidentes = Boolean(
    searchIncidente || filtroSeveridadIncidente !== 'TODAS' || filtroEstadoIncidente !== 'TODOS'
  );

  const limpiarFiltrosIncidentes = () => {
    setSearchIncidente('');
    setFiltroSeveridadIncidente('TODAS');
    setFiltroEstadoIncidente('TODOS');
    setPaginaIncidentes(1);
  };

  useEffect(() => {
    setPaginaIncidentes(1);
  }, [searchIncidente, filtroSeveridadIncidente, filtroEstadoIncidente]);

  // Acudiente principal del paciente seleccionado
  const acudientePrincipal = useMemo(() => {
    return (
      selectedResidente?.acudientes?.find((a) => a.esPrincipal) ||
      selectedResidente?.acudientes?.[0]
    );
  }, [selectedResidente]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* CABECERA DE LA VISTA */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#182F28]">
              Bitácora de Pacientes & Novedades
            </h2>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#182F28] text-[#DCB87F] border border-[#DCB87F]/30">
              {activeSede.nombre}
            </span>
          </div>
          <p className="text-xs text-[#5C6058] mt-0.5">
            Registro diario de novedades asistenciales, cuidados médicos, evoluciones y seguimiento de los residentes
          </p>
        </div>

        {/* Resumen rápido de métricas */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-white rounded-xl border border-[#DEDBD1] text-xs shadow-2xs">
            <span className="text-[#7A745F] block text-[10px] uppercase font-mono">Residentes</span>
            <span className="font-bold text-[#182F28]">{sedeResidentes.length} activos</span>
          </div>
          <div className="px-3 py-2 bg-[#DFF3E7] rounded-xl border border-[#1E7A4C]/30 text-xs shadow-2xs">
            <span className="text-[#1E7A4C] block text-[10px] uppercase font-mono">Notas Registradas</span>
            <span className="font-bold text-[#182F28]">{todasLasNotas.length} en historial</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NAVEGACIÓN POR PESTAÑAS (SUB-TABS) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#DEDBD1] p-1.5 flex items-center gap-1.5 shadow-2xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setSubTab('llenar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'llenar'
              ? 'bg-[#182F28] text-white shadow-xs'
              : 'text-[#5C6058] hover:text-[#182F28] hover:bg-[#F7F6F2]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#DCB87F]" />
          <span>Llenar Bitácora por Paciente</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('historial_general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'historial_general'
              ? 'bg-[#182F28] text-white shadow-xs'
              : 'text-[#5C6058] hover:text-[#182F28] hover:bg-[#F7F6F2]'
          }`}
        >
          <List className="w-4 h-4 text-[#DCB87F]" />
          <span>Historial General de la Sede</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-[#DCB87F]">
            {todasLasNotas.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('incidentes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'incidentes'
              ? 'bg-[#182F28] text-white shadow-xs'
              : 'text-[#5C6058] hover:text-[#182F28] hover:bg-[#F7F6F2]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-[#DCB87F]" />
          <span>Supervisión de Incidentes</span>
          {sedeIncidentes.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#A4453A] text-white">
              {sedeIncidentes.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: LLENAR BITÁCORA POR PACIENTE */}
      {/* ========================================================================= */}
      {subTab === 'llenar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* --------------------------------------------------------------------- */}
          {/* PANEL IZQUIERDO: DIRECTORIO DE PACIENTES (4 Columnas) */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#DEDBD1] p-4 shadow-xs space-y-3 sticky top-4">
            <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-2.5">
              <span className="font-serif font-bold text-sm text-[#182F28] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#274A3F]" />
                <span>Seleccionar Paciente</span>
              </span>
              <span className="text-[11px] font-mono text-[#7A745F]">
                {residentesFiltrados.length} residente(s)
              </span>
            </div>

            {/* Buscador de Residentes */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A745F]" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento o habitación..."
                value={searchResidente}
                onChange={(e) => setSearchResidente(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
              {searchResidente && (
                <button
                  type="button"
                  onClick={() => setSearchResidente('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filtro Estado */}
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3 h-3 text-[#B3803F]" />
              <select
                value={filterEstadoRes}
                onChange={(e) => setFilterEstadoRes(e.target.value)}
                className="w-full px-2.5 py-1 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#26241F] focus:outline-none"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="Activo">Activos</option>
                <option value="En Observación">En Observación</option>
                <option value="Hospitalizado">Hospitalizados</option>
              </select>
            </div>

            {/* Lista scrolleable de Pacientes */}
            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {residentesFiltrados.map((res) => {
                const isSelected = selectedId === res.id;
                const notasCount = res.bitacora?.length || 0;
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setSelectedId(res.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                      isSelected
                        ? 'bg-[#EAE7DC]/90 border-[#B3803F] shadow-xs'
                        : 'bg-[#F7F6F2]/60 hover:bg-[#F7F6F2] border-transparent hover:border-[#DEDBD1]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={resolverAvatarUrl(res.fotoUrl)}
                        alt={res.nombreCompleto}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                        className="w-10 h-10 rounded-xl object-cover border border-[#DEDBD1] shrink-0"
                      />
                      <div className="min-w-0">
                        <h4
                          className={`font-serif font-bold text-xs truncate ${
                            isSelected ? 'text-[#182F28]' : 'text-[#26241F]'
                          }`}
                        >
                          {res.nombreCompleto}
                        </h4>
                        <div className="text-[11px] text-[#7A745F] flex items-center gap-1">
                          <span>Hab. {res.habitacion}</span>
                          <span>•</span>
                          <span>Cama {res.cama}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          res.estado === 'Activo'
                            ? 'bg-[#DFF3E7] text-[#1E7A4C]'
                            : res.estado === 'En Observación'
                            ? 'bg-[#FEF7EE] text-[#9A5B12]'
                            : 'bg-[#FBE8E6] text-[#A4453A]'
                        }`}
                      >
                        {res.estado}
                      </span>
                      <span className="text-[10px] font-mono text-[#7A745F] flex items-center gap-0.5">
                        <BookOpen className="w-2.5 h-2.5 text-[#B3803F]" />
                        <span>{notasCount}</span>
                      </span>
                    </div>
                  </button>
                );
              })}

              {residentesFiltrados.length === 0 && (
                <div className="p-6 text-center text-xs text-[#7A745F] italic">
                  No se encontraron residentes con el filtro especificado.
                </div>
              )}
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* PANEL DERECHO: FORMULARIO Y HISTORIAL DEL PACIENTE (8 Columnas) */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-6">
            {selectedResidente ? (
              <>
                {/* 1. Tarjeta Resumen del Paciente Seleccionado */}
                <div className="bg-[#182F28] text-white rounded-2xl p-5 shadow-xs border border-[#274A3F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={resolverAvatarUrl(selectedResidente.fotoUrl)}
                      alt={selectedResidente.nombreCompleto}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#DCB87F]/40 shadow-sm shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-bold text-lg text-white">
                          {selectedResidente.nombreCompleto}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/30">
                          {selectedResidente.codigoExpediente}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            selectedResidente.estado === 'Activo'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {selectedResidente.estado}
                        </span>
                      </div>
                      <div className="text-xs text-[#DCB87F] mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>{selectedResidente.edad} años</span>
                        <span>•</span>
                        <span>Habitación {selectedResidente.habitacion} (Cama {selectedResidente.cama})</span>
                        <span>•</span>
                        <span>Movilidad: {selectedResidente.nivelMovilidad}</span>
                        <span>•</span>
                        <span>EPS: {selectedResidente.eps}</span>
                      </div>
                      {acudientePrincipal && (
                        <div className="text-[11px] text-[#DEDBD1] mt-1">
                          Acudiente: <strong>{acudientePrincipal.nombreCompleto}</strong> ({acudientePrincipal.parentesco}) • Tel: {acudientePrincipal.telefono}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acceso a ficha completa */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedResidente(selectedResidente);
                        setIsResidenteDetailOpen(true);
                      }}
                      className="px-3.5 py-2 bg-[#274A3F] hover:bg-[#346153] text-[#DCB87F] hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all border border-[#DCB87F]/40 cursor-pointer shadow-xs"
                      title="Ver expediente clínico y valoración completa"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Expediente</span>
                    </button>
                  </div>
                </div>

                {/* 2. Formulario: Llenar Nota de Bitácora */}
                <div className="bg-white rounded-2xl border border-[#DEDBD1] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#B3803F]/15 text-[#B3803F] flex items-center justify-center border border-[#DCB87F]/30">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#182F28]">
                          Registrar Nueva Nota en la Bitácora
                        </h4>
                        <p className="text-[11px] text-[#7A745F]">
                          Anotación de evolución, signos, cuidados o novedades del paciente
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] text-[#7A745F] font-mono">
                      Registrando como: <strong className="text-[#182F28]">{currentUser?.nombreCompleto || 'Administrador'}</strong>
                    </span>
                  </div>

                  <form onSubmit={handleGuardarNota} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Categoría */}
                      <div>
                        <label className="block text-[11px] font-bold text-[#182F28] uppercase font-mono mb-1">
                          Categoría de la Novedad:
                        </label>
                        <select
                          value={categoriaNuevaNota}
                          onChange={(e) => setCategoriaNuevaNota(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                        >
                          <option value="Rutina">Rutina / Cuidados Generales</option>
                          <option value="Salud">Salud / Evolución Médica / Signos</option>
                          <option value="Comportamiento">Comportamiento / Estado de Ánimo</option>
                          <option value="Alimentación">Alimentación / Nutrición</option>
                          <option value="Visita Familiar">Visita Familiar / Acudiente</option>
                          <option value="Actividad Recreativa">Actividad Recreativa / Terapia</option>
                          <option value="Alerta">Alerta Preventiva / Cuidado Especial</option>
                        </select>
                      </div>

                      {/* Fecha y Hora actuales (Informativo) */}
                      <div>
                        <label className="block text-[11px] font-bold text-[#182F28] uppercase font-mono mb-1">
                          Fecha & Hora de Registro:
                        </label>
                        <div className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#5C6058] flex items-center justify-between font-mono">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#274A3F]" />
                            {new Date().toLocaleDateString('es-CO')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#274A3F]" />
                            {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contenido / Observación */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-[#182F28] uppercase font-mono">
                          Observación o Novedad Asistencial:
                        </label>
                        <span className="text-[10px] text-[#7A745F]">
                          {textoNuevaNota.length} caracteres
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        required
                        placeholder={`Escriba detalladamente la novedad o cuidado brindado a ${selectedResidente.nombreCompleto}...`}
                        value={textoNuevaNota}
                        onChange={(e) => setTextoNuevaNota(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#182F28] focus:outline-none focus:border-[#B3803F] focus:bg-white transition-all resize-y"
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs text-[#5C6058]">
                        <CheckCircle2 className="w-4 h-4 text-[#1E7A4C]" />
                        <span>Se registrará con zona horaria oficial y visibilidad en el portal</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {guardadoExitoso && (
                          <span className="text-xs font-bold text-[#1E7A4C] flex items-center gap-1 animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>¡Nota guardada!</span>
                          </span>
                        )}

                        <button
                          type="submit"
                          disabled={!textoNuevaNota.trim() || isSaving}
                          className="px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Guardando...' : 'Guardar en Bitácora'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* 3. Historial de Notas del Paciente Seleccionado */}
                <div className="bg-white rounded-2xl border border-[#DEDBD1] p-5 shadow-xs space-y-4">
                  {/* Encabezado del Historial */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDBD1] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#274A3F] text-[#DCB87F] flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#182F28]">
                          Historial de Bitácora ({selectedResidente.bitacora?.length || 0} notas)
                        </h4>
                        <p className="text-[11px] text-[#7A745F]">
                          Línea de tiempo de observaciones registradas para este paciente
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={cargandoBitacora}
                        onClick={async () => {
                          setCargandoBitacora(true);
                          try {
                            await cargarBitacoraResidente(selectedResidente.id);
                          } finally {
                            setCargandoBitacora(false);
                          }
                        }}
                        className="p-2 hover:bg-[#EAE7DC] text-[#274A3F] rounded-xl transition-colors cursor-pointer border border-[#DEDBD1] text-xs flex items-center gap-1.5 font-bold"
                        title="Sincronizar y recargar desde base de datos Oracle"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${cargandoBitacora ? 'animate-spin' : ''}`} />
                        <span>Sincronizar</span>
                      </button>
                    </div>
                  </div>

                  {/* Barra de Filtros Avanzada: Buscador, Categoría, Rango de Fechas, Talento Humano y Selector de Vista */}
                  <div className="p-3.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] space-y-3">
                    {/* Fila 1: Buscador, Categoría y Selector de Vista */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
                        {/* Buscador */}
                        <div className="relative flex-1 min-w-[180px]">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A745F]" />
                          <input
                            type="text"
                            placeholder="Buscar en notas de este paciente..."
                            value={busquedaNota}
                            onChange={(e) => setBusquedaNota(e.target.value)}
                            className="w-full pl-8 pr-6 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                          />
                          {busquedaNota && (
                            <button
                              type="button"
                              onClick={() => setBusquedaNota('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Categoría */}
                        <select
                          value={filtroCategoriaNota}
                          onChange={(e) => setFiltroCategoriaNota(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs font-semibold text-[#26241F] focus:outline-none"
                        >
                          <option value="TODAS">Todas las Categorías</option>
                          <option value="Incidente / Evento Adverso">⚠️ Incidentes / Eventos Adversos</option>
                          <option value="Rutina">Rutina</option>
                          <option value="Salud">Salud</option>
                          <option value="Comportamiento">Comportamiento</option>
                          <option value="Alimentación">Alimentación</option>
                          <option value="Visita Familiar">Visita Familiar</option>
                          <option value="Actividad Recreativa">Actividad Recreativa</option>
                          <option value="Alerta">Alerta</option>
                        </select>
                      </div>

                      {/* Selector de Modo de Visualización (Tarjeta, Lista, Tabla) */}
                      <div className="flex items-center gap-2">
                        <ViewModeSelector viewMode={viewModeNota} onChange={setViewModeNota} />
                      </div>
                    </div>

                    {/* Fila 2: Rango de Fechas (Desde - Hasta) y Filtro por Talento Humano */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#DEDBD1]/60 text-xs">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Rango de Fechas */}
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-[#274A3F]" />
                          <span className="font-mono text-[11px] text-[#7A745F] font-bold">DESDE:</span>
                          <input
                            type="date"
                            value={fechaDesdeNota}
                            onChange={(e) => setFechaDesdeNota(e.target.value)}
                            className="px-2 py-1 rounded-lg border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-[#7A745F] font-bold">HASTA:</span>
                          <input
                            type="date"
                            value={fechaHastaNota}
                            onChange={(e) => setFechaHastaNota(e.target.value)}
                            className="px-2 py-1 rounded-lg border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none"
                          />
                        </div>

                        {/* Filtro Talento Humano */}
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#B3803F]" />
                          <span className="font-mono text-[11px] text-[#7A745F] font-bold">TALENTO HUMANO:</span>
                          <select
                            value={filtroAutorNota}
                            onChange={(e) => setFiltroAutorNota(e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-[#DEDBD1] bg-white text-xs font-semibold text-[#26241F] focus:outline-none max-w-[200px] truncate"
                          >
                            <option value="TODOS">Todos los Autores</option>
                            {autoresDisponibles.map((autor, idx) => (
                              <option key={idx} value={autor}>
                                {autor}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Botón para limpiar filtros */}
                      <div className="flex items-center gap-2">
                        {hayFiltrosActivosNota && (
                          <button
                            type="button"
                            onClick={limpiarFiltrosNota}
                            className="text-xs text-[#A4453A] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Limpiar Filtros</span>
                          </button>
                        )}
                        <span className="font-mono text-[11px] text-[#7A745F]">
                          {notasFiltradas.length} nota(s) encontrada(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ============================================================= */}
                  {/* VISUALIZACIÓN 1: MODO TARJETAS (GRID) */}
                  {/* ============================================================= */}
                  {viewModeNota === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {notasPaginadas.map((item, idx) => {
                        const esRegistroAdmision = item.contenido.includes('[REGISTRO DEL RESIDENTE]');
                        const esCambioEstado = item.contenido.includes('[CAMBIO DE ESTADO]');
                        const datosIncidente = extraerDatosIncidente(item);
                        return (
                          <div
                            key={item.id || idx}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                              esRegistroAdmision
                                ? 'bg-[#F2F8F5] border-[#274A3F]/40 shadow-xs'
                                : esCambioEstado
                                ? 'bg-[#FEF9F2] border-amber-300/80 shadow-xs'
                                : datosIncidente
                                ? 'bg-[#FFF8F7] border-[#F5C2BC] shadow-xs'
                                : 'bg-[#F7F6F2]/40 hover:bg-[#F7F6F2] border-[#DEDBD1] shadow-2xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {esRegistroAdmision ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#182F28] text-[#DCB87F]">
                                      ⭐ Admisión
                                    </span>
                                  ) : esCambioEstado ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                      🔄 Cambio Estado
                                    </span>
                                  ) : datosIncidente ? (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBE8E6] text-[#A4453A] border border-[#F5C2BC] flex items-center gap-1 shadow-2xs">
                                        <ShieldAlert className="w-3 h-3 text-[#A4453A] shrink-0" />
                                        <span>Incidente: {datosIncidente.tipo}</span>
                                      </span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${obtenerClasesSeveridad(datosIncidente.severidad)}`}>
                                        {datosIncidente.severidad}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE7DC] text-[#274A3F] border border-[#DEDBD1]">
                                      {item.categoria || 'Rutina'}
                                    </span>
                                  )}
                                  <span className="text-xs text-[#7A745F] font-mono flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#274A3F]" />
                                    <span>{item.fecha}</span>
                                    <span>•</span>
                                    <Clock className="w-3 h-3 text-[#274A3F]" />
                                    <span>{item.hora}</span>
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-[#26241F] font-serif leading-relaxed pl-1 whitespace-pre-line">
                                {item.contenido}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-[#DEDBD1]/60 flex items-center justify-between text-[11px] text-[#7A745F]">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-[#B3803F]" />
                                <span>Por: <strong className="text-[#182F28]">{item.nombreUsuario || item.nombreEmpleado || 'Administrador'}</strong></span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ============================================================= */}
                  {/* VISUALIZACIÓN 2: MODO LISTA COMPACTA */}
                  {/* ============================================================= */}
                  {viewModeNota === 'list' && (
                    <div className="space-y-2.5">
                      {notasPaginadas.map((item, idx) => {
                        const esRegistroAdmision = item.contenido.includes('[REGISTRO DEL RESIDENTE]');
                        const esCambioEstado = item.contenido.includes('[CAMBIO DE ESTADO]');
                        const datosIncidente = extraerDatosIncidente(item);
                        return (
                          <div
                            key={item.id || idx}
                            className={`p-3.5 rounded-xl border transition-all ${
                              esRegistroAdmision
                                ? 'bg-[#F2F8F5] border-[#274A3F]/40 shadow-xs'
                                : esCambioEstado
                                ? 'bg-[#FEF9F2] border-amber-300/80 shadow-xs'
                                : datosIncidente
                                ? 'bg-[#FFF8F7] border-[#F5C2BC] shadow-xs'
                                : 'bg-white hover:bg-[#F7F6F2]/50 border-[#DEDBD1] shadow-2xs'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                {esRegistroAdmision ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#182F28] text-[#DCB87F]">
                                    ⭐ Admisión
                                  </span>
                                ) : esCambioEstado ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                    🔄 Cambio Estado
                                  </span>
                                ) : datosIncidente ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBE8E6] text-[#A4453A] border border-[#F5C2BC] flex items-center gap-1 shadow-2xs">
                                      <ShieldAlert className="w-3 h-3 text-[#A4453A] shrink-0" />
                                      <span>Incidente: {datosIncidente.tipo}</span>
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${obtenerClasesSeveridad(datosIncidente.severidad)}`}>
                                      {datosIncidente.severidad}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE7DC] text-[#274A3F] border border-[#DEDBD1]">
                                    {item.categoria || 'Rutina'}
                                  </span>
                                )}

                                <span className="text-xs text-[#7A745F] font-mono flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#274A3F]" />
                                  <span>{item.fecha}</span>
                                  <span>•</span>
                                  <Clock className="w-3 h-3 text-[#274A3F]" />
                                  <span>{item.hora}</span>
                                </span>
                              </div>

                              <span className="text-[11px] text-[#7A745F]">
                                Por: <strong className="text-[#182F28]">{item.nombreUsuario || item.nombreEmpleado || 'Administrador'}</strong>
                              </span>
                            </div>

                            <p className="text-xs text-[#26241F] font-serif leading-relaxed pl-1 whitespace-pre-line">
                              {item.contenido}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ============================================================= */}
                  {/* VISUALIZACIÓN 3: MODO TABLA DE DATOS */}
                  {/* ============================================================= */}
                  {viewModeNota === 'table' && (
                    <div className="bg-white rounded-2xl border border-[#DEDBD1] shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#182F28] text-white border-b border-[#274A3F]">
                              <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">
                                Fecha & Hora
                              </th>
                              <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">
                                Categoría
                              </th>
                              <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px]">
                                Talento Humano / Autor
                              </th>
                              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                                Novedad / Observación
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DEDBD1]/60">
                            {notasPaginadas.map((item, idx) => {
                              const esRegistroAdmision = item.contenido.includes('[REGISTRO DEL RESIDENTE]');
                              const esCambioEstado = item.contenido.includes('[CAMBIO DE ESTADO]');
                              const datosIncidente = extraerDatosIncidente(item);
                              return (
                                <tr key={item.id || idx} className="hover:bg-[#F7F6F2]/70 transition-colors">
                                  {/* Fecha & Hora */}
                                  <td className="py-3 px-3 font-mono text-[#5C6058] whitespace-nowrap">
                                    <div>{item.fecha}</div>
                                    <div className="text-[10px] text-[#7A745F]">{item.hora}</div>
                                  </td>

                                  {/* Categoría */}
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    {esRegistroAdmision ? (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#182F28] text-[#DCB87F]">
                                        ⭐ Admisión
                                      </span>
                                    ) : esCambioEstado ? (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                        🔄 Cambio
                                      </span>
                                    ) : datosIncidente ? (
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBE8E6] text-[#A4453A] border border-[#F5C2BC] flex items-center gap-1 shadow-2xs">
                                          <ShieldAlert className="w-3 h-3 text-[#A4453A] shrink-0" />
                                          <span>Incidente: {datosIncidente.tipo}</span>
                                        </span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${obtenerClasesSeveridad(datosIncidente.severidad)}`}>
                                          {datosIncidente.severidad}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE7DC] text-[#274A3F] border border-[#DEDBD1]">
                                        {item.categoria || 'Rutina'}
                                      </span>
                                    )}
                                  </td>

                                  {/* Talento Humano */}
                                  <td className="py-3 px-3 font-bold text-[#182F28] whitespace-nowrap">
                                    {item.nombreUsuario || item.nombreEmpleado || 'Administrador'}
                                  </td>

                                  {/* Observación */}
                                  <td className="py-3 px-4 text-[#26241F] font-serif leading-relaxed max-w-[380px]">
                                    {item.contenido}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Estado cuando no hay notas */}
                  {cargandoBitacora ? (
                    <div className="p-8 text-center text-xs text-[#7A745F] flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#274A3F]" />
                      <span>Consultando bitácora desde la base de datos Oracle...</span>
                    </div>
                  ) : notasFiltradas.length === 0 ? (
                    <div className="p-8 text-center bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-2">
                      <BookOpen className="w-8 h-8 text-[#B3803F] mx-auto opacity-70" />
                      <h5 className="font-serif font-bold text-sm text-[#182F28]">
                        {hayFiltrosActivosNota
                          ? 'No hay notas con los filtros aplicados'
                          : 'Sin notas registradas'}
                      </h5>
                      <p className="text-xs text-[#7A745F] max-w-sm mx-auto">
                        {hayFiltrosActivosNota
                          ? 'Intente ajustar el rango de fechas, la categoría o el talento humano.'
                          : 'Aún no se han añadido observaciones en la bitácora de este residente.'}
                      </p>
                    </div>
                  ) : null}

                  {/* Paginador para notas del paciente */}
                  <PaginadorTabla
                    paginaActual={paginaNota}
                    totalPaginas={totalPaginasNota}
                    totalItems={notasFiltradas.length}
                    itemsPorPagina={itemsPorPaginaNota}
                    itemLabel="notas del paciente"
                    onCambiarPagina={setPaginaNota}
                    className="rounded-xl border border-[#DEDBD1]"
                  />
                </div>
              </>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#DEDBD1] space-y-3">
                <User className="w-10 h-10 text-[#7A745F] mx-auto" />
                <h4 className="font-serif font-bold text-base text-[#182F28]">
                  Seleccione un paciente de la lista
                </h4>
                <p className="text-xs text-[#7A745F]">
                  Haga clic en cualquiera de los pacientes de la columna izquierda para abrir su bitácora y registrar novedades.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: HISTORIAL GENERAL DE TODA LA SEDE */}
      {/* ========================================================================= */}
      {subTab === 'historial_general' && (
        <div className="space-y-4">
          {/* Barra de Filtros Avanzada de la Sede */}
          <div className="p-4 bg-white rounded-2xl border border-[#DEDBD1] shadow-xs space-y-3">
            {/* Fila 1: Buscador, Categoría y Selector de Vista */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                {/* Buscador */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A745F]" />
                  <input
                    type="text"
                    placeholder="Buscar por paciente, habitación, contenido o autor..."
                    value={searchHistorialGeneral}
                    onChange={(e) => setSearchHistorialGeneral(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  />
                  {searchHistorialGeneral && (
                    <button
                      type="button"
                      onClick={() => setSearchHistorialGeneral('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Categoría */}
                <select
                  value={filtroCategoriaGeneral}
                  onChange={(e) => setFiltroCategoriaGeneral(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none"
                >
                  <option value="TODAS">Todas las Categorías</option>
                  <option value="Incidente / Evento Adverso">⚠️ Incidentes / Eventos Adversos</option>
                  <option value="Rutina">Rutina</option>
                  <option value="Salud">Salud</option>
                  <option value="Comportamiento">Comportamiento</option>
                  <option value="Alimentación">Alimentación</option>
                  <option value="Visita Familiar">Visita Familiar</option>
                  <option value="Actividad Recreativa">Actividad Recreativa</option>
                  <option value="Alerta">Alerta</option>
                </select>
              </div>

              {/* Selector de Modo de Visualización */}
              <div className="flex items-center gap-2">
                <ViewModeSelector viewMode={viewModeGeneral} onChange={setViewModeGeneral} />
              </div>
            </div>

            {/* Fila 2: Rango de Fechas y Filtro por Talento Humano */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#DEDBD1]/60 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Rango de Fechas */}
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[#274A3F]" />
                  <span className="font-mono text-[11px] text-[#7A745F] font-bold">DESDE:</span>
                  <input
                    type="date"
                    value={fechaDesdeGeneral}
                    onChange={(e) => setFechaDesdeGeneral(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#182F28] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-[#7A745F] font-bold">HASTA:</span>
                  <input
                    type="date"
                    value={fechaHastaGeneral}
                    onChange={(e) => setFechaHastaGeneral(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#182F28] focus:outline-none"
                  />
                </div>

                {/* Filtro Talento Humano */}
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#B3803F]" />
                  <span className="font-mono text-[11px] text-[#7A745F] font-bold">TALENTO HUMANO:</span>
                  <select
                    value={filtroAutorGeneral}
                    onChange={(e) => setFiltroAutorGeneral(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#26241F] focus:outline-none max-w-[220px] truncate"
                  >
                    <option value="TODOS">Todos los Autores</option>
                    {autoresDisponibles.map((autor, idx) => (
                      <option key={idx} value={autor}>
                        {autor}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón para limpiar filtros */}
              <div className="flex items-center gap-2">
                {hayFiltrosActivosGeneral && (
                  <button
                    type="button"
                    onClick={limpiarFiltrosGeneral}
                    className="text-xs text-[#A4453A] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpiar Filtros</span>
                  </button>
                )}
                <span className="font-mono text-[11px] text-[#7A745F]">
                  Total {historialGeneralFiltrado.length} nota(s) encontrada(s)
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* VISUALIZACIÓN 1: MODO TARJETAS (GRID) */}
          {/* ============================================================= */}
          {viewModeGeneral === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historialGeneralPaginado.map((item, idx) => {
                const esRegistroAdmision = item.contenido.includes('[REGISTRO DEL RESIDENTE]');
                const esCambioEstado = item.contenido.includes('[CAMBIO DE ESTADO]');
                const datosIncidente = extraerDatosIncidente(item);
                return (
                  <div
                    key={item.id || idx}
                    className={`admin-card p-4 transition-all flex flex-col justify-between space-y-3 ${
                      datosIncidente
                        ? 'border-[#F5C2BC] bg-[#FFF8F7] shadow-xs'
                        : 'hover:border-[#B3803F]'
                    }`}
                  >
                    <div>
                      {/* Cabecera de la tarjeta con Paciente */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#DEDBD1]/60 pb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.residenteObj && (
                            <img
                              src={resolverAvatarUrl(item.residenteObj.fotoUrl)}
                              alt={item.nombreResidente}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_AVATAR;
                              }}
                              className="w-10 h-10 rounded-xl object-cover border border-[#DEDBD1] shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <h4 className="font-serif font-bold text-xs text-[#182F28] truncate">
                              {item.nombreResidente}
                            </h4>
                            <span className="text-[11px] text-[#7A745F] font-mono">
                              Hab. {item.habitacion || '—'}
                            </span>
                          </div>
                        </div>

                        {esRegistroAdmision ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#182F28] text-[#DCB87F] shrink-0">
                            ⭐ Admisión
                          </span>
                        ) : esCambioEstado ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 shrink-0">
                            🔄 Cambio
                          </span>
                        ) : datosIncidente ? (
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBE8E6] text-[#A4453A] border border-[#F5C2BC] flex items-center gap-1 shadow-2xs shrink-0">
                              <ShieldAlert className="w-3 h-3 text-[#A4453A] shrink-0" />
                              <span>Incidente: {datosIncidente.tipo}</span>
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${obtenerClasesSeveridad(datosIncidente.severidad)}`}>
                              {datosIncidente.severidad}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE7DC] text-[#274A3F] border border-[#DEDBD1] shrink-0">
                            {item.categoria || 'Rutina'}
                          </span>
                        )}
                      </div>

                      {/* Contenido */}
                      <p className="text-xs text-[#26241F] font-serif leading-relaxed pt-1 whitespace-pre-line line-clamp-4">
                        {item.contenido}
                      </p>
                    </div>

                    {/* Pie de tarjeta: Autor, Fecha y Botón Ir a Bitácora */}
                    <div className="pt-2 border-t border-[#DEDBD1]/60 flex items-center justify-between text-[11px] text-[#7A745F]">
                      <div>
                        <div>Por: <strong className="text-[#182F28]">{item.nombreUsuario || item.nombreEmpleado || 'Administrador'}</strong></div>
                        <div className="font-mono text-[10px]">{item.fecha} {item.hora}</div>
                      </div>

                      {item.residenteObj && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(item.idResidente);
                            setSubTab('llenar');
                          }}
                          className="px-2.5 py-1 bg-[#F7F6F2] hover:bg-[#EAE7DC] text-[#182F28] rounded-lg text-xs font-bold transition-colors cursor-pointer border border-[#DEDBD1]"
                        >
                          Ir a Bitácora
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ============================================================= */}
          {/* VISUALIZACIÓN 2: MODO LISTA COMPACTA */}
          {/* ============================================================= */}
          {viewModeGeneral === 'list' && (
            <div className="space-y-3">
              {historialGeneralPaginado.map((item, idx) => {
                const esRegistroAdmision = item.contenido.includes('[REGISTRO DEL RESIDENTE]');
                const esCambioEstado = item.contenido.includes('[CAMBIO DE ESTADO]');
                const datosIncidente = extraerDatosIncidente(item);
                return (
                  <div
                    key={item.id || idx}
                    className={`rounded-2xl border p-4 transition-all shadow-2xs space-y-2 ${
                      datosIncidente
                        ? 'bg-[#FFF8F7] border-[#F5C2BC]'
                        : 'bg-white border-[#DEDBD1] hover:border-[#B3803F]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDBD1]/60 pb-2">
                      <div className="flex items-center gap-3">
                        {item.residenteObj && (
                          <img
                            src={resolverAvatarUrl(item.residenteObj.fotoUrl)}
                            alt={item.nombreResidente}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_AVATAR;
                            }}
                            className="w-9 h-9 rounded-xl object-cover border border-[#DEDBD1] shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-sm text-[#182F28]">
                              {item.nombreResidente}
                            </h4>
                            <span className="text-xs text-[#5C6058]">
                              (Hab. {item.habitacion || '—'})
                            </span>
                          </div>
                          <span className="text-[11px] text-[#7A745F]">
                            Por: <strong className="text-[#182F28]">{item.nombreUsuario || item.nombreEmpleado || 'Administrador'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {esRegistroAdmision ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#182F28] text-[#DCB87F]">
                            ⭐ Admisión
                          </span>
                        ) : esCambioEstado ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            🔄 Cambio Estado
                          </span>
                        ) : datosIncidente ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBE8E6] text-[#A4453A] border border-[#F5C2BC] flex items-center gap-1 shadow-2xs">
                              <ShieldAlert className="w-3 h-3 text-[#A4453A] shrink-0" />
                              <span>Incidente: {datosIncidente.tipo}</span>
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${obtenerClasesSeveridad(datosIncidente.severidad)}`}>
                              {datosIncidente.severidad}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE7DC] text-[#274A3F]">
                            {item.categoria || 'Rutina'}
                          </span>
                        )}

                        <span className="text-xs font-mono text-[#7A745F] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#274A3F]" />
                          <span>{item.fecha} {item.hora}</span>
                        </span>

                        {item.residenteObj && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(item.idResidente);
                              setSubTab('llenar');
                            }}
                            className="px-2.5 py-1 bg-[#F7F6F2] hover:bg-[#EAE7DC] text-[#182F28] rounded-lg text-xs font-bold transition-colors cursor-pointer border border-[#DEDBD1]"
                            title="Ir a la bitácora de este paciente"
                          >
                            Ir a Bitácora
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#26241F] font-serif leading-relaxed whitespace-pre-line pl-1">
                      {item.contenido}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ============================================================= */}
          {/* VISUALIZACIÓN 3: MODO TABLA COMPLETA */}
          {/* ============================================================= */}
          {viewModeGeneral === 'table' && (
            <div className="bg-white rounded-2xl border border-[#DEDBD1] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#182F28] text-white border-b border-[#274A3F]">
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">
                        Fecha & Hora
                      </th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px]">
                        Paciente
                      </th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px]">
                        Habitación
                      </th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px]">
                        Categoría
                      </th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px]">
                        Talento Humano / Autor
                      </th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                        Novedad / Observación
                      </th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-center">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DEDBD1]/60">
                    {historialGeneralPaginado.map((item, idx) => {
                      const esRegistroAdmision = item.contenido.includes('[REGISTRO DEL RESIDENTE]');
                      const esCambioEstado = item.contenido.includes('[CAMBIO DE ESTADO]');
                      const datosIncidente = extraerDatosIncidente(item);
                      return (
                        <tr key={item.id || idx} className="hover:bg-[#F7F6F2]/70 transition-colors">
                          {/* Fecha & Hora */}
                          <td className="py-3 px-3 font-mono text-[#5C6058] whitespace-nowrap">
                            <div>{item.fecha}</div>
                            <div className="text-[10px] text-[#7A745F]">{item.hora}</div>
                          </td>

                          {/* Paciente */}
                          <td className="py-3 px-3 font-semibold text-[#182F28] whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {item.residenteObj && (
                                <img
                                  src={resolverAvatarUrl(item.residenteObj.fotoUrl)}
                                  alt={item.nombreResidente}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = DEFAULT_AVATAR;
                                  }}
                                  className="w-7 h-7 rounded-lg object-cover border border-[#DEDBD1] shrink-0"
                                />
                              )}
                              <span>{item.nombreResidente}</span>
                            </div>
                          </td>

                          {/* Habitación */}
                          <td className="py-3 px-3 font-mono text-[#7A745F] whitespace-nowrap">
                            Hab. {item.habitacion || '—'}
                          </td>

                          {/* Categoría */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {esRegistroAdmision ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#182F28] text-[#DCB87F]">
                                ⭐ Admisión
                              </span>
                            ) : esCambioEstado ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                🔄 Cambio
                              </span>
                            ) : datosIncidente ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBE8E6] text-[#A4453A] border border-[#F5C2BC] flex items-center gap-1 shadow-2xs">
                                  <ShieldAlert className="w-3 h-3 text-[#A4453A] shrink-0" />
                                  <span>Incidente: {datosIncidente.tipo}</span>
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${obtenerClasesSeveridad(datosIncidente.severidad)}`}>
                                  {datosIncidente.severidad}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE7DC] text-[#274A3F] border border-[#DEDBD1]">
                                {item.categoria || 'Rutina'}
                              </span>
                            )}
                          </td>

                          {/* Talento Humano */}
                          <td className="py-3 px-3 font-bold text-[#182F28] whitespace-nowrap">
                            {item.nombreUsuario || item.nombreEmpleado || 'Administrador'}
                          </td>

                          {/* Observación */}
                          <td className="py-3 px-4 text-[#26241F] font-serif leading-relaxed max-w-[340px]">
                            {item.contenido}
                          </td>

                          {/* Acción */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {item.residenteObj && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedId(item.idResidente);
                                  setSubTab('llenar');
                                }}
                                className="px-2.5 py-1 bg-[#F7F6F2] hover:bg-[#EAE7DC] text-[#182F28] rounded-lg text-xs font-bold transition-colors cursor-pointer border border-[#DEDBD1]"
                              >
                                Ver
                              </button>
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

          {historialGeneralFiltrado.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#DEDBD1] space-y-2">
              <BookOpen className="w-10 h-10 text-[#7A745F] mx-auto" />
              <h4 className="font-serif font-bold text-base text-[#182F28]">
                No se encontraron notas en el historial
              </h4>
              <p className="text-xs text-[#7A745F]">
                Intente ajustar el rango de fechas, la categoría o el colaborador seleccionado.
              </p>
            </div>
          )}

          {/* Paginación */}
          <PaginadorTabla
            paginaActual={paginaGeneral}
            totalPaginas={totalPaginasGeneral}
            totalItems={historialGeneralFiltrado.length}
            itemsPorPagina={itemsPorPaginaGeneral}
            itemLabel="notas de bitácora"
            onCambiarPagina={setPaginaGeneral}
            className="rounded-2xl border border-[#DEDBD1]"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: SUPERVISIÓN DE INCIDENTES CLÍNICOS & PROTOCOLOS */}
      {/* ========================================================================= */}
      {subTab === 'incidentes' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* BARRA SUPERIOR DE ACCIONES Y CONTADORES */}
          <div className="bg-white rounded-2xl border border-[#DEDBD1] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#FBE8E6] text-[#A4453A] border border-[#A4453A]/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#182F28]">
                    Supervisión de Incidentes & Eventos Adversos
                  </h3>
                  <p className="text-xs text-[#7A745F]">
                    Monitoreo en tiempo real, trazabilidad y activación de protocolos en {activeSede.nombre}
                  </p>
                </div>
              </div>

              {/* Badges de estados */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F7F6F2] border border-[#DEDBD1] text-[#26241F]">
                  Total: {sedeIncidentes.length}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FBE8E6] border border-[#A4453A]/30 text-[#A4453A]">
                  Abiertos: {sedeIncidentes.filter((i) => i.estado === 'Abierto').length}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEF7EE] border border-[#DCB87F]/40 text-[#9A5B12]">
                  En Seguimiento: {sedeIncidentes.filter((i) => i.estado === 'En Seguimiento').length}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#DFF3E7] border border-[#1E7A4C]/30 text-[#1E7A4C]">
                  Cerrados: {sedeIncidentes.filter((i) => i.estado === 'Cerrado').length}
                </span>
              </div>
            </div>

            {/* BOTÓN AGREGAR INCIDENTE */}
            <button
              type="button"
              onClick={() => setIsRegisterIncidentOpen(true)}
              className="px-4 py-2.5 bg-[#A4453A] hover:bg-[#8B3A31] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Reportar Incidente</span>
            </button>
          </div>

          {/* FILTROS DE INCIDENTES */}
          <div className="bg-white rounded-2xl border border-[#DEDBD1] p-3.5 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              {/* Buscador */}
              <div className="lg:col-span-5 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A745F]" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, habitación, descripción o quién reportó..."
                  value={searchIncidente}
                  onChange={(e) => setSearchIncidente(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
                {searchIncidente && (
                  <button
                    type="button"
                    onClick={() => setSearchIncidente('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtro Severidad */}
              <div className="lg:col-span-3">
                <select
                  value={filtroSeveridadIncidente}
                  onChange={(e) => setFiltroSeveridadIncidente(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                >
                  <option value="TODAS">Todas las Severidades</option>
                  <option value="Crítica">Crítica (Rojo intenso)</option>
                  <option value="Alta">Alta (Urgente)</option>
                  <option value="Media">Media (Atención requerida)</option>
                  <option value="Baja">Baja (Monitoreo preventivo)</option>
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="lg:col-span-3">
                <select
                  value={filtroEstadoIncidente}
                  onChange={(e) => setFiltroEstadoIncidente(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="Abierto">Abiertos</option>
                  <option value="En Seguimiento">En Seguimiento</option>
                  <option value="Cerrado">Cerrados</option>
                </select>
              </div>

              {/* Limpiar filtros */}
              <div className="lg:col-span-1 flex justify-end">
                {hayFiltrosActivosIncidentes ? (
                  <button
                    type="button"
                    onClick={limpiarFiltrosIncidentes}
                    title="Limpiar filtros"
                    className="p-2 rounded-xl border border-[#DEDBD1] hover:bg-[#F7F6F2] text-[#A4453A] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center w-full"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-[#7A745F] text-center w-full">
                    {incidentesFiltrados.length} reg.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* LISTADO DE TARJETAS DE INCIDENTES */}
          <div className="space-y-4">
            {incidentesPaginados.map((inc) => {
              const resAsociado = sedeResidentes.find((r) => r.id === inc.idResidente);
              return (
                <div
                  key={inc.id}
                  className="bg-white rounded-2xl border border-[#DEDBD1] p-5 space-y-4 hover:border-[#B3803F] transition-all shadow-xs"
                >
                  {/* Fila Superior */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDBD1] pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                          inc.severidad === 'Crítica' || inc.severidad === 'Alta'
                            ? 'bg-[#FBE8E6] text-[#A4453A] border border-[#A4453A]/30'
                            : inc.severidad === 'Media'
                            ? 'bg-[#FEF7EE] text-[#9A5B12] border border-[#DCB87F]/40'
                            : 'bg-[#DFF3E7] text-[#1E7A4C] border border-[#1E7A4C]/30'
                        }`}
                      >
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-base text-[#182F28]">
                            {inc.nombreResidente}
                          </h4>
                          <span className="text-xs text-[#5C6058]">
                            (Habitación {inc.habitacion})
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F7F6F2] text-[#26241F] border border-[#DEDBD1]">
                            Tipo: {inc.tipo}
                          </span>
                        </div>
                        <div className="text-xs text-[#7A745F] flex items-center gap-2 mt-0.5">
                          <span>
                            Reportado por: <strong className="text-[#182F28]">{inc.reportadoPor}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-[#B3803F]" />
                            {inc.fechaHora}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Severidad y Cambio Rápido de Estado */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          inc.severidad === 'Crítica'
                            ? 'bg-[#A4453A] text-white border-[#A4453A]'
                            : inc.severidad === 'Alta'
                            ? 'bg-[#FBE8E6] text-[#A4453A] border-[#A4453A]/40'
                            : inc.severidad === 'Media'
                            ? 'bg-[#FEF7EE] text-[#9A5B12] border-[#DCB87F]/60'
                            : 'bg-[#DFF3E7] text-[#1E7A4C] border-[#1E7A4C]/40'
                        }`}
                      >
                        Severidad {inc.severidad}
                      </span>

                      {/* Selector de Estado interactivo */}
                      <select
                        value={inc.estado}
                        onChange={(e) =>
                          actualizarEstadoIncidente(
                            inc.id,
                            e.target.value as 'Abierto' | 'En Seguimiento' | 'Cerrado'
                          )
                        }
                        className={`text-xs font-bold px-3 py-1 rounded-full border cursor-pointer focus:outline-none ${
                          inc.estado === 'Cerrado'
                            ? 'bg-[#DFF3E7] text-[#1E7A4C] border-[#1E7A4C]/30'
                            : inc.estado === 'En Seguimiento'
                            ? 'bg-[#FEF7EE] text-[#9A5B12] border-[#DCB87F]/40'
                            : 'bg-[#FBE8E6] text-[#A4453A] border-[#A4453A]/30'
                        }`}
                      >
                        <option value="Abierto">Abierto</option>
                        <option value="En Seguimiento">En Seguimiento</option>
                        <option value="Cerrado">Cerrado</option>
                      </select>
                    </div>
                  </div>

                  {/* Cuerpo: Descripción y Acciones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="font-mono text-[#7A745F] uppercase font-bold text-[10px] block">
                        Descripción del Evento:
                      </span>
                      <p className="font-medium bg-[#F7F6F2] p-3 rounded-xl border border-[#DEDBD1] text-[#26241F] min-h-[58px]">
                        {inc.descripcion}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-[#7A745F] uppercase font-bold text-[10px] block">
                        Acciones Tomadas / Protocolo Activado:
                      </span>
                      <p className="font-medium bg-[#E8F1EC] p-3 rounded-xl border border-[#1E7A4C]/20 text-[#182F28] min-h-[58px]">
                        {inc.accionesTomadas}
                      </p>
                    </div>
                  </div>

                  {/* Pie de la tarjeta */}
                  <div className="pt-2 border-t border-[#DEDBD1]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-[#B3803F]" />
                      <span className="text-[#5C6058]">Notificación a Acudiente:</span>
                      {inc.notificadoFamiliar ? (
                        <span className="text-[#1E7A4C] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Notificado oportunamente
                        </span>
                      ) : (
                        <span className="text-[#7A745F] italic">No requerida / Pendiente</span>
                      )}
                    </div>

                    {/* Botón para ver la bitácora del residente */}
                    {resAsociado && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(resAsociado.id);
                          setSubTab('llenar');
                        }}
                        className="px-3 py-1.5 bg-[#F7F6F2] hover:bg-[#EAE7DC] text-[#182F28] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[#DEDBD1] flex items-center gap-1.5 self-end sm:self-auto"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#B3803F]" />
                        <span>Ver Bitácora del Residente</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#7A745F]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Estado Vacío */}
            {incidentesFiltrados.length === 0 && (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#DEDBD1] space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#1E7A4C] mx-auto" />
                <h4 className="font-serif font-bold text-base text-[#182F28]">
                  No se encontraron incidentes registrados
                </h4>
                <p className="text-xs text-[#7A745F] max-w-md mx-auto">
                  {hayFiltrosActivosIncidentes
                    ? 'No hay registros que coincidan con los filtros aplicados. Intente restablecer los filtros de búsqueda.'
                    : 'No se registran eventos adversos ni incidentes clínicos activos en esta sede.'}
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  {hayFiltrosActivosIncidentes && (
                    <button
                      type="button"
                      onClick={limpiarFiltrosIncidentes}
                      className="px-4 py-2 bg-[#F7F6F2] text-[#182F28] rounded-xl text-xs font-bold border border-[#DEDBD1] hover:bg-[#EAE7DC] transition-colors cursor-pointer"
                    >
                      Limpiar Filtros
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsRegisterIncidentOpen(true)}
                    className="px-4 py-2 bg-[#A4453A] text-white rounded-xl text-xs font-bold hover:bg-[#8B3A31] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Reportar Incidente</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Paginación de Incidentes */}
          {incidentesFiltrados.length > 0 && (
            <PaginadorTabla
              paginaActual={paginaIncidentes}
              totalPaginas={totalPaginasIncidentes}
              totalItems={incidentesFiltrados.length}
              itemsPorPagina={itemsPorPaginaIncidentes}
              itemLabel="incidentes registrados"
              onCambiarPagina={setPaginaIncidentes}
              className="rounded-2xl border border-[#DEDBD1]"
            />
          )}
        </div>
      )}
    </div>
  );
};
