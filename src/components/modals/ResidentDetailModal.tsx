import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  HeartHandshake,
  Phone,
  Mail,
  User,
  ShieldAlert,
  Building2,
  Edit3,
  Pill,
  Clock,
  Calendar,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  ClipboardList,
  CheckCircle2,
  Printer,
  Paperclip,
  FileText,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Boxes
} from 'lucide-react';
import { ResidentAvatar } from '../common/ResidentAvatar';
import { DotacionResidente } from '../../types';
import { ImprimirSolicitudDotacionModal } from './ImprimirSolicitudDotacionModal';
import { ResidentInventoryTabContent } from './ResidentInventoryTabContent';

type TabFicha = 'general' | 'bitacora' | 'medicamentos' | 'familiares' | 'dotacion' | 'documentos' | 'inventario';

export const ResidentDetailModal: React.FC = () => {
  const {
    isResidenteDetailOpen,
    setIsResidenteDetailOpen,
    tabInicialResidenteDetail,
    selectedResidente,
    residentes,
    activeSede,
    abrirFichaIngreso,
    setEditingResidente,
    setIsEditResidenteOpen,
    familiares,
    setEditingFamiliar,
    setIsEditFamiliarOpen,
    dotaciones,
    agregarArticuloDotacionResidente,
    registrarRecambioDotacion,
    abrirSolicitarDotacion,
    entregarDotacionSolicitada,
    agregarEntradaBitacora,
    cargarBitacoraResidente,
    movimientosInventario,
    articulosCatalogo,
    bodegasSede,
    registrarMovimientoStock
  } = useAdmin();

  const [tabActiva, setTabActiva] = useState<TabFicha>('general');
  const [textoNuevaNota, setTextoNuevaNota] = useState('');
  const [categoriaNuevaNota, setCategoriaNuevaNota] = useState('Rutina');
  const [cargandoBitacora, setCargandoBitacora] = useState(false);

  const [mostrarFormAgregarDotacion, setMostrarFormAgregarDotacion] = useState(false);
  const [nuevoArticuloDotacion, setNuevoArticuloDotacion] = useState({
    nombre: '',
    categoria: 'Lencería y Ropa de Cama',
    cantidad: 1,
    frecuenciaMeses: 12 as number | null
  });

  const [itemParaRecambio, setItemParaRecambio] = useState<DotacionResidente | null>(null);
  const [motivoRecambio, setMotivoRecambio] = useState('Cumplimiento de ciclo de recambio programado');
  const [condicionNuevo, setCondicionNuevo] = useState('Nuevo de paquete');
  const [observacionesRecambio, setObservacionesRecambio] = useState('');

  // Sincronización reactiva con la lista global de residentes
  const resident = residentes.find((r) => r.id === selectedResidente?.id) || selectedResidente;

  // Cargar bitácora desde Oracle al abrir el modal o cambiar de residente
  useEffect(() => {
    if (isResidenteDetailOpen && resident?.id) {
      setCargandoBitacora(true);
      cargarBitacoraResidente(resident.id).finally(() => setCargandoBitacora(false));
    }
  }, [isResidenteDetailOpen, resident?.id]);

  // Sincronizar pestaña inicial si se abrió con una pestaña específica
  useEffect(() => {
    if (isResidenteDetailOpen && tabInicialResidenteDetail) {
      if (tabInicialResidenteDetail === 'inventario' && activeSede?.manejaInventario === false) {
        setTabActiva('general');
      } else {
        setTabActiva(tabInicialResidenteDetail);
      }
    }
  }, [isResidenteDetailOpen, tabInicialResidenteDetail, activeSede?.manejaInventario]);

  // Si la sede no maneja inventario y está en la pestaña inventario, regresar a general
  useEffect(() => {
    if (activeSede?.manejaInventario === false && tabActiva === 'inventario') {
      setTabActiva('general');
    }
  }, [activeSede?.manejaInventario, tabActiva]);

  const totalInsumosResidente = useMemo(() => {
    if (!resident?.id) return 0;
    const movs = (movimientosInventario || []).filter((m) => m.idResidente === resident.id);
    return new Set(movs.flatMap((m) => m.detalles.map((d) => d.idArticulo))).size;
  }, [movimientosInventario, resident?.id]);

  const dotacionesResidente = (dotaciones || []).filter((d) => d.idResidente === resident?.id);
  const dotacionesSolicitadas = dotacionesResidente.filter((d) => d.estadoElemento === 'Solicitado');
  const [mostrarModalImprimir, setMostrarModalImprimir] = useState(false);

  // Acudientes reactivos deduplicados y enriquecidos con los datos más recientes de familiares
  const acudientesActualizados = useMemo(() => {
    const list = resident?.acudientes || selectedResidente?.acudientes;
    if (!list) return [];
    const map = new Map<string, typeof list[0]>();
    list.forEach((acu) => {
      const fam = familiares.find(
        (f) =>
          f.id === acu.id ||
          (f.email && acu.email && f.email.toLowerCase() === acu.email.toLowerCase()) ||
          (f.nombreCompleto && f.nombreCompleto === acu.nombreCompleto)
      );
      const idFinal = fam?.id || acu.id;
      const nombreFinal = fam?.nombreCompleto || acu.nombreCompleto;
      const telFinal = fam?.telefonoPrincipal || acu.telefono;
      const emailFinal = fam?.email || acu.email;
      const key = `${idFinal}-${nombreFinal}`;
      if (!map.has(key)) {
        map.set(key, {
          ...acu,
          id: idFinal,
          nombreCompleto: nombreFinal,
          telefono: telFinal,
          email: emailFinal
        });
      }
    });
    return Array.from(map.values());
  }, [resident?.acudientes, selectedResidente?.acudientes, familiares]);

  if (!isResidenteDetailOpen || !selectedResidente || !resident) return null;

  const acudientePrincipal = acudientesActualizados.find((a) => a.esPrincipal) || acudientesActualizados[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl lg:max-w-5xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ResidentAvatar
              fotoUrl={selectedResidente.fotoUrl}
              nombres={selectedResidente.nombres}
              apellidos={selectedResidente.apellidos}
              nombreCompleto={selectedResidente.nombreCompleto}
              sizeClass="w-14 h-14"
              roundedClass="rounded-2xl"
              textClass="text-xl"
              className="border-2 border-[#DCB87F]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-white">
                  {selectedResidente.nombreCompleto}
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/30">
                  {selectedResidente.codigoExpediente}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedResidente.estado === 'Activo'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : selectedResidente.estado === 'En Observación'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  {selectedResidente.estado}
                </span>
              </div>
              <p className="text-xs text-[#DCB87F] mt-0.5 flex items-center gap-2">
                <span>{selectedResidente.edad} años</span>
                <span>•</span>
                <span>Habitación {selectedResidente.habitacion} (Cama {selectedResidente.cama})</span>
                <span>•</span>
                <span>{activeSede.nombre}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (resident) abrirFichaIngreso(resident);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#DCB87F]/20 hover:bg-[#DCB87F]/30 text-[#DCB87F] hover:text-white border border-[#DCB87F]/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="Abrir Ficha Técnica de Ingreso y Valoración Multidimensional"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ficha de Ingreso</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResidenteDetailOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Pestañas (Tabs Navigation) */}
        <div className="bg-[#F7F6F2] border-b border-[#DEDBD1] px-6 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setTabActiva('general')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'general'
                ? 'border-[#182F28] text-[#182F28] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28] hover:bg-[#EAE7DC]/60'
            }`}
          >
            <User className="w-4 h-4 text-[#274A3F]" />
            <span>Información General</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('bitacora')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'bitacora'
                ? 'border-[#182F28] text-[#182F28] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28] hover:bg-[#EAE7DC]/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#274A3F]" />
            <span>Bitácora Diaria</span>
            {(resident.bitacora?.length || 0) > 0 ? (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#274A3F]/15 text-[#274A3F]">
                {resident.bitacora?.length}
              </span>
            ) : cargandoBitacora ? (
              <RefreshCw className="w-3 h-3 text-[#274A3F] animate-spin" />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('medicamentos')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'medicamentos'
                ? 'border-[#182F28] text-[#182F28] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28] hover:bg-[#EAE7DC]/60'
            }`}
          >
            <Pill className="w-4 h-4 text-[#1E7A4C]" />
            <span>Farmacoterapia</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#1E7A4C]/15 text-[#1E7A4C]">
              {selectedResidente.medicamentos?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('familiares')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'familiares'
                ? 'border-[#182F28] text-[#182F28] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28] hover:bg-[#EAE7DC]/60'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-[#B3803F]" />
            <span>Familiares & Acudientes</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#DCB87F]/30 text-[#694819]">
              {acudientesActualizados.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('dotacion')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'dotacion'
                ? 'border-[#182F28] text-[#182F28] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28] hover:bg-[#EAE7DC]/60'
            }`}
          >
            <Package className="w-4 h-4 text-[#B3803F]" />
            <span>Dotación & Enseres</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#182F28]/10 text-[#182F28]">
              {dotacionesResidente.length}
            </span>
          </button>

          {activeSede?.manejaInventario !== false && (
            <button
              type="button"
              onClick={() => setTabActiva('inventario')}
              className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                tabActiva === 'inventario'
                  ? 'border-[#182F28] text-[#182F28] bg-white rounded-t-xl shadow-2xs'
                  : 'border-transparent text-[#7A745F] hover:text-[#182F28] hover:bg-[#EAE7DC]/60'
              }`}
            >
              <Boxes className="w-4 h-4 text-[#1E7A4C]" />
              <span>Inventario e Insumos</span>
              {totalInsumosResidente > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {totalInsumosResidente}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setTabActiva('documentos')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'documentos'
                ? 'border-[#182F28] text-[#182F28] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28] hover:bg-[#EAE7DC]/60'
            }`}
          >
            <Paperclip className="w-4 h-4 text-[#274A3F]" />
            <span>Documentos Adjuntos</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#274A3F]/15 text-[#274A3F]">
              {selectedResidente.archivosAdjuntos?.length || 0}
            </span>
          </button>
        </div>

        {/* Content Body con Scroll */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ========================================================================= */}
          {/* PESTAÑA 1: INFORMACIÓN GENERAL & CLÍNICA */}
          {/* ========================================================================= */}
          {tabActiva === 'general' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Alertas Clínicas */}
              {selectedResidente.alertasClinicas && (
                <div className="p-4 bg-[#FEF7EE] border-l-4 border-[#B3803F] rounded-r-2xl shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#9A5B12] uppercase font-mono">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Alertas y Consideraciones Clínicas</span>
                  </div>
                  <p className="text-sm font-semibold text-[#26241F] mt-1">
                    {selectedResidente.alertasClinicas}
                  </p>
                </div>
              )}

              {/* Grid de Datos Generales */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                  <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Identificación</span>
                  <span className="text-sm font-bold text-[#182F28]">
                    {selectedResidente.tipoIdentificacion} {selectedResidente.identificacion}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                  <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Nivel Movilidad</span>
                  <span className="text-sm font-bold text-[#182F28]">
                    {selectedResidente.nivelMovilidad}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                  <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Tipo de Dieta</span>
                  <span className="text-sm font-bold text-[#182F28]">
                    {selectedResidente.tipoDieta}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                  <span className="text-[11px] font-mono text-[#7A745F] uppercase block">EPS / Salud</span>
                  <span className="text-sm font-bold text-[#182F28]">
                    {selectedResidente.eps}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                  <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Grupo Sanguíneo</span>
                  <span className="text-sm font-bold text-[#182F28]">
                    {selectedResidente.tipoSangre}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                  <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Fecha Ingreso</span>
                  <span className="text-sm font-bold text-[#182F28]">
                    {selectedResidente.fechaIngreso}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                  <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Ubicación Actual</span>
                  <span className="text-sm font-bold text-[#182F28]">
                    Habitación {selectedResidente.habitacion} • Cama {selectedResidente.cama}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                  <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Plan Complementario</span>
                  <span className="text-sm font-bold text-[#182F28]">
                    {selectedResidente.planComplementario || 'Ninguno'}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                  <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Sede Asignada</span>
                  <span className="text-sm font-bold text-[#182F28] truncate block">
                    {activeSede.nombre}
                  </span>
                </div>
              </div>

              {/* Tarjetas de Resumen y Acceso Directo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div
                  onClick={() => setTabActiva('medicamentos')}
                  className="p-3.5 bg-white rounded-xl border border-[#DEDBD1] hover:border-[#1E7A4C] cursor-pointer transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#DFF3E7] text-[#1E7A4C] flex items-center justify-center">
                        <Pill className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#182F28]">Medicamentos</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#7A745F] group-hover:text-[#182F28] transition-colors" />
                  </div>
                  <p className="text-xs text-[#5C6058] mt-2">
                    <strong className="text-[#182F28] font-bold">{selectedResidente.medicamentos?.length || 0}</strong> prescripciones registradas en el plan terapéutico.
                  </p>
                </div>

                <div
                  onClick={() => setTabActiva('familiares')}
                  className="p-3.5 bg-white rounded-xl border border-[#DEDBD1] hover:border-[#B3803F] cursor-pointer transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FEF7EE] text-[#B3803F] flex items-center justify-center">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#182F28]">Acudiente</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#7A745F] group-hover:text-[#182F28] transition-colors" />
                  </div>
                  <p className="text-xs text-[#5C6058] mt-2 truncate">
                    {acudientePrincipal ? (
                      <>
                        <strong className="text-[#182F28] font-bold">{acudientePrincipal.nombreCompleto}</strong> ({acudientePrincipal.parentesco})
                      </>
                    ) : (
                      'Sin familiares vinculados'
                    )}
                  </p>
                </div>

                <div
                  onClick={() => setTabActiva('documentos')}
                  className="p-3.5 bg-white rounded-xl border border-[#DEDBD1] hover:border-[#274A3F] cursor-pointer transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#EAE7DC] text-[#274A3F] flex items-center justify-center">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#182F28]">Expediente Digital</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#7A745F] group-hover:text-[#182F28] transition-colors" />
                  </div>
                  <p className="text-xs text-[#5C6058] mt-2">
                    <strong className="text-[#182F28] font-bold">{selectedResidente.archivosAdjuntos?.length || 0}</strong> documento(s) clínico(s) en Google Drive.
                  </p>
                </div>
              </div>

              {/* Widget Destacado de Última Nota en Bitácora dentro de Información General */}
              <div className="p-4 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#274A3F] text-[#DCB87F] flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-serif font-bold text-xs text-[#182F28]">Última Novedad en Bitácora</h5>
                      <span className="text-[10px] text-[#7A745F]">
                        {resident.bitacora && resident.bitacora.length > 0
                          ? `${resident.bitacora.length} nota(s) en historial`
                          : cargandoBitacora
                          ? 'Consultando base de datos Oracle...'
                          : 'Sin notas registradas'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTabActiva('bitacora')}
                    className="text-xs font-bold text-[#274A3F] hover:text-[#182F28] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Ver Historial Completo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {cargandoBitacora ? (
                  <div className="p-3 bg-[#F7F6F2] rounded-xl text-center text-xs text-[#7A745F] flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#274A3F]" />
                    <span>Cargando bitácora desde base de datos Oracle...</span>
                  </div>
                ) : resident.bitacora && resident.bitacora.length > 0 ? (
                  <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]/60 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-[#7A745F] mb-1">
                      <span className="font-bold text-[#182F28]">{resident.bitacora[0].categoria || 'Rutina'}</span>
                      <span className="font-mono">{resident.bitacora[0].fecha} • {resident.bitacora[0].hora}</span>
                    </div>
                    <p className="text-[#26241F] line-clamp-2 italic font-serif">
                      "{resident.bitacora[0].contenido}"
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#7A745F] italic">
                    No hay anotaciones registradas aún en la bitácora de este residente.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA: BITÁCORA ASISTENCIAL & HISTORIAL */}
          {/* ========================================================================= */}
          {tabActiva === 'bitacora' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#274A3F] text-[#DCB87F] flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#182F28]">
                      Bitácora y Novedades del Residente
                    </h4>
                    <p className="text-[11px] text-[#7A745F]">
                      Registro cronológico de novedades diarias, cuidados y notas de admisión
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={cargandoBitacora}
                    onClick={async () => {
                      if (!resident?.id) return;
                      setCargandoBitacora(true);
                      try {
                        await cargarBitacoraResidente(resident.id);
                      } finally {
                        setCargandoBitacora(false);
                      }
                    }}
                    className="p-1.5 hover:bg-[#EAE7DC] text-[#274A3F] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Recargar bitácora desde la base de datos Oracle"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cargandoBitacora ? 'animate-spin' : ''}`} />
                  </button>
                  <span className="text-xs text-[#274A3F] font-mono font-bold bg-[#EAE7DC] px-2.5 py-1 rounded-full border border-[#DEDBD1]">
                    {resident.bitacora?.length || 0} nota(s)
                  </span>
                </div>
              </div>

              {/* Formulario rápido para nueva nota */}
              <div className="p-3.5 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#182F28] flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#274A3F]" />
                    <span>Agregar Nota a la Bitácora</span>
                  </span>
                  <select
                    value={categoriaNuevaNota}
                    onChange={(e) => setCategoriaNuevaNota(e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-[#DEDBD1] bg-white text-[#182F28]"
                  >
                    <option value="Rutina">Rutina / General</option>
                    <option value="Comportamiento">Comportamiento</option>
                    <option value="Salud">Salud / Médico</option>
                    <option value="Visita Familiar">Visita Familiar</option>
                    <option value="Actividad Recreativa">Actividad Recreativa</option>
                    <option value="Alerta">Alerta</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder="Escriba una observación o novedad asistencial..."
                    value={textoNuevaNota}
                    onChange={(e) => setTextoNuevaNota(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                  />
                  <button
                    type="button"
                    disabled={!textoNuevaNota.trim()}
                    onClick={async () => {
                      if (!textoNuevaNota.trim()) return;
                      await agregarEntradaBitacora(resident.id, {
                        contenido: textoNuevaNota.trim(),
                        categoria: categoriaNuevaNota
                      });
                      setTextoNuevaNota('');
                    }}
                    className="px-4 py-2 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer shrink-0 self-end"
                  >
                    Guardar
                  </button>
                </div>
              </div>

              {/* Lista de entradas de bitácora */}
              {resident.bitacora && resident.bitacora.length > 0 ? (
                <div className="space-y-3">
                  {resident.bitacora.map((item, idx) => {
                    const esRegistroAdmision = item.contenido.includes('[REGISTRO DEL RESIDENTE]');
                    const esCambioEstado = item.contenido.includes('[CAMBIO DE ESTADO]');
                    return (
                      <div
                        key={item.id || idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          esRegistroAdmision
                            ? 'bg-[#F2F8F5] border-[#274A3F]/40 shadow-xs'
                            : esCambioEstado
                            ? 'bg-[#FEF9F2] border-amber-300/80 shadow-xs'
                            : 'bg-white border-[#DEDBD1] hover:border-[#B3803F]/50 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {esRegistroAdmision ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#182F28] text-[#DCB87F] border border-[#DCB87F]/40 flex items-center gap-1 shadow-2xs">
                                <span>⭐</span>
                                <span>Registro Inicial de Admisión</span>
                              </span>
                            ) : esCambioEstado ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/70 flex items-center gap-1 shadow-2xs">
                                <span>🔄</span>
                                <span>Cambio de Estado Administrativo</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE7DC] text-[#274A3F] border border-[#DEDBD1]">
                                {item.categoria || 'Rutina'}
                              </span>
                            )}
                            <span className="text-xs text-[#7A745F] font-medium flex items-center gap-1">
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

                        <p className="text-xs text-[#182F28] leading-relaxed whitespace-pre-wrap">
                          {item.contenido}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 bg-[#F7F6F2] rounded-2xl text-center text-xs text-[#7A745F] border border-[#DEDBD1]">
                  No hay anotaciones registradas en la bitácora aún.
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 2: FARMACOTERAPIA & MEDICAMENTOS */}
          {/* ========================================================================= */}
          {tabActiva === 'medicamentos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#DFF3E7] text-[#1E7A4C] flex items-center justify-center">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#182F28]">
                      Farmacoterapia & Medicamentos Prescritos
                    </h4>
                    <p className="text-[11px] text-[#7A745F]">
                      Plan terapéutico activo del residente
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#1E7A4C] font-mono font-bold bg-[#DFF3E7] px-2.5 py-1 rounded-full">
                  {selectedResidente.medicamentos?.length || 0} medicamento(s)
                </span>
              </div>

              {selectedResidente.medicamentos && selectedResidente.medicamentos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedResidente.medicamentos.map((med, idx) => (
                    <div
                      key={med.id || idx}
                      className="p-3.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex flex-col justify-between space-y-2 hover:border-[#1E7A4C]/50 transition-colors shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-sm font-bold text-[#182F28] block">
                            {med.medicamento}
                          </span>
                          <span className="text-xs text-[#7A4F9E] font-semibold">
                            Cantidad / Dosis: {med.cantidad}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#DEDBD1] text-[#182F28] font-bold">
                          Rx #{idx + 1}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[#DEDBD1]/60 text-xs text-[#5C6058] space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#068591]" />
                          <span>Frecuencia: <strong className="text-[#182F28]">{med.frecuencia}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#B3803F]" />
                          <span>
                            Hasta:{' '}
                            <strong className="text-[#182F28]">
                              {med.fechaFin ? med.fechaFin : 'Tratamiento Continuo'}
                            </strong>
                          </span>
                        </div>
                        {med.indicaciones && (
                          <p className="text-[11px] text-[#7A745F] italic mt-1 bg-white p-2 rounded-lg border border-[#DEDBD1]">
                            {med.indicaciones}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-[#F7F6F2] rounded-2xl text-center text-xs text-[#7A745F] border border-[#DEDBD1]">
                  No tiene medicamentos prescritos actualmente.
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 3: FAMILIARES & ACUDIENTES */}
          {/* ========================================================================= */}
          {tabActiva === 'familiares' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FEF7EE] text-[#B3803F] flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#182F28]">
                      Familiares & Acudientes Responsables
                    </h4>
                    <p className="text-[11px] text-[#7A745F]">
                      Contactos autorizados y responsables del residente
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#694819] font-mono font-bold bg-[#DCB87F]/30 px-2.5 py-1 rounded-full">
                  {acudientesActualizados.length} registrado(s)
                </span>
              </div>

              {acudientesActualizados.length > 0 ? (
                <div className="space-y-3">
                  {acudientesActualizados.map((acu) => (
                    <div
                      key={acu.id}
                      className="p-4 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between gap-4 shadow-2xs hover:border-[#DCB87F] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#182F28]">{acu.nombreCompleto}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#DCB87F]/30 text-[#694819] font-semibold">
                            {acu.parentesco}
                          </span>
                          {acu.esPrincipal && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1E7A4C] text-white font-bold">
                              Acudiente Principal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-5 text-xs text-[#5C6058] mt-2 flex-wrap">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Phone className="w-4 h-4 text-[#068591]" />
                            {acu.telefono}
                          </span>
                          {acu.email && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <Mail className="w-4 h-4 text-[#068591]" />
                              {acu.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const fam = familiares.find(
                            (f) =>
                              f.id === acu.id ||
                              (f.email && acu.email && f.email.toLowerCase() === acu.email.toLowerCase()) ||
                              (f.nombreCompleto && f.nombreCompleto === acu.nombreCompleto)
                          );
                          if (fam) {
                            setEditingFamiliar(fam);
                            setIsEditFamiliarOpen(true);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#DCB87F] shrink-0"
                        title="Editar información del familiar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-[#F7F6F2] rounded-2xl text-center text-xs text-[#7A745F] border border-[#DEDBD1]">
                  No tiene acudientes registrados. Puedes vincular uno desde la sección de Familiares.
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 4: DOTACIÓN & ENSERES */}
          {/* ========================================================================= */}
          {tabActiva === 'dotacion' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FEF7EE] text-[#B3803F] flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#182F28]">
                      Dotación & Artículos Entregados al Residente
                    </h4>
                    <p className="text-[11px] text-[#7A745F]">
                      Control de lencería, enseres y ciclos de reposición
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[#7A745F] font-mono">
                    {dotacionesResidente.length} artículo(s)
                  </span>
                  {dotacionesSolicitadas.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMostrarModalImprimir(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs border border-[#DCB87F]/40"
                      title="Imprimir solicitud de dotación pendiente en PDF o compartir por WhatsApp/Correo"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#DCB87F]" />
                      <span>Imprimir Solicitud ({dotacionesSolicitadas.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => abrirSolicitarDotacion(selectedResidente)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#DCB87F] hover:bg-[#c9a56c] text-[#182F28] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title="Ingresar requerimiento o solicitud de dotación para este residente"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-[#182F28]" />
                    <span>Solicitar Dotación</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarFormAgregarDotacion(!mostrarFormAgregarDotacion)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#182F28] hover:bg-[#274A3F] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Entregar Artículo</span>
                  </button>
                </div>
              </div>

              {/* Formulario rápido para agregar artículo adicional */}
              {mostrarFormAgregarDotacion && (
                <div className="p-4 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] space-y-3 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-[#182F28] uppercase font-mono block">
                    Registrar Entrega de Artículo Adicional
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Nombre Artículo</label>
                      <input
                        type="text"
                        placeholder="Ej. Cobija extra, Paquete de toallas"
                        value={nuevoArticuloDotacion.nombre}
                        onChange={(e) => setNuevoArticuloDotacion({ ...nuevoArticuloDotacion, nombre: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Categoría</label>
                      <select
                        value={nuevoArticuloDotacion.categoria}
                        onChange={(e) => setNuevoArticuloDotacion({ ...nuevoArticuloDotacion, categoria: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
                      >
                        <option value="Lencería y Ropa de Cama">Lencería</option>
                        <option value="Aseo y Cuidado Personal">Aseo Personal</option>
                        <option value="Menaje">Menaje</option>
                        <option value="Ayudas Técnicas">Ayudas Técnicas</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Periodicidad</label>
                      <select
                        value={nuevoArticuloDotacion.frecuenciaMeses ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value);
                          setNuevoArticuloDotacion({ ...nuevoArticuloDotacion, frecuenciaMeses: val });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
                      >
                        <option value="">Única vez</option>
                        <option value="6">6 meses</option>
                        <option value="12">12 meses (1 año)</option>
                        <option value="24">24 meses (2 años)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMostrarFormAgregarDotacion(false)}
                      className="px-3 py-1 text-xs text-[#5C6058] font-bold hover:bg-[#EFECE6] rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!nuevoArticuloDotacion.nombre.trim()) {
                          alert('Ingrese el nombre del artículo.');
                          return;
                        }
                        await agregarArticuloDotacionResidente(selectedResidente.id, {
                          nombreElemento: nuevoArticuloDotacion.nombre.trim(),
                          categoria: nuevoArticuloDotacion.categoria,
                          cantidad: 1,
                          frecuenciaCambioMeses: nuevoArticuloDotacion.frecuenciaMeses,
                          condicionEntrega: 'Nuevo',
                          notas: 'Entrega física directa al residente'
                        });
                        setNuevoArticuloDotacion({
                          nombre: '',
                          categoria: 'Lencería y Ropa de Cama',
                          cantidad: 1,
                          frecuenciaMeses: 12
                        });
                        setMostrarFormAgregarDotacion(false);
                      }}
                      className="px-4 py-1.5 bg-[#182F28] hover:bg-[#274A3F] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Guardar y Entregar
                    </button>
                  </div>
                </div>
              )}

              {/* Modal flotante o diálogo para Registrar Recambio */}
              {itemParaRecambio && (
                <div className="p-4 bg-[#FEF7EE] rounded-xl border-2 border-[#DCB87F] space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCB87F]/40">
                    <span className="text-xs font-bold text-[#9A5B12] uppercase font-mono flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Registrar Recambio: {itemParaRecambio.nombreElemento}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setItemParaRecambio(null)}
                      className="text-xs text-[#9A5B12] hover:text-[#182F28] font-bold cursor-pointer"
                    >
                      ✕ Cerrar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Motivo de Renovación</label>
                      <input
                        type="text"
                        value={motivoRecambio}
                        onChange={(e) => setMotivoRecambio(e.target.value)}
                        placeholder="Ej. Cumplimiento de ciclo anual (12 meses)"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#182F28]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Condición del Nuevo Artículo</label>
                      <select
                        value={condicionNuevo}
                        onChange={(e) => setCondicionNuevo(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#182F28]"
                      >
                        <option value="Nuevo de paquete">Nuevo de paquete</option>
                        <option value="Excelente estado (Lavandería)">Excelente estado (Lavandería)</option>
                        <option value="Reemplazo por donación">Reemplazo por donación</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Observaciones</label>
                    <input
                      type="text"
                      value={observacionesRecambio}
                      onChange={(e) => setObservacionesRecambio(e.target.value)}
                      placeholder="Ej. Se retira juego de sábanas anterior deteriorado y se entrega juego nuevo color beige."
                      className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#182F28]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-[#7A745F]">
                      Próximo recambio calculado en: <strong>{itemParaRecambio.frecuenciaCambioMeses || 12} meses</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setItemParaRecambio(null)}
                        className="px-3 py-1 text-xs text-[#5C6058] font-bold hover:bg-[#fcecd7] rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await registrarRecambioDotacion(itemParaRecambio.id, {
                            motivo: motivoRecambio,
                            condicionNuevo,
                            observaciones: observacionesRecambio
                          });
                          setItemParaRecambio(null);
                          setMotivoRecambio('Cumplimiento de ciclo de recambio programado');
                          setObservacionesRecambio('');
                        }}
                        className="px-4 py-1.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Confirmar y Renovar Ciclo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Listado de Artículos con Semáforo de Recambio */}
              {dotacionesResidente.length > 0 ? (
                <div className="space-y-3">
                  {dotacionesResidente.map((dot) => {
                    const dias = dot.diasParaCambio;
                    const semaforo = dot.semaforoCambio;

                    return (
                      <div
                        key={dot.id}
                        className="p-3.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-[#182F28]">
                                {dot.nombreElemento}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCB87F]/30 text-[#694819]">
                                {dot.categoria}
                              </span>
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#DEDBD1] text-[#182F28] font-bold">
                                {dot.cantidad} unidad(es)
                              </span>
                              {dot.estadoElemento === 'Solicitado' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                                  SOLICITADO
                                </span>
                              )}
                            </div>

                            {dot.estadoElemento === 'Solicitado' ? (
                              <div className="text-xs text-[#5C6058] mt-1.5 space-y-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                  {dot.fechaSolicitud && (
                                    <span>
                                      Fecha Solicitud: <strong className="text-[#182F28]">{dot.fechaSolicitud}</strong>
                                    </span>
                                  )}
                                  {dot.fechaRequerida && (
                                    <span>
                                      Requerido para: <strong className="text-[#182F28]">{dot.fechaRequerida}</strong>
                                    </span>
                                  )}
                                  {dot.condicionEntrega && (
                                    <span className="font-semibold text-[#9A5B12]">
                                      {dot.condicionEntrega}
                                    </span>
                                  )}
                                </div>
                                {dot.notas && (
                                  <p className="text-[11px] text-[#7A745F] italic">
                                    {dot.notas}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-4 text-xs text-[#5C6058] mt-1.5 flex-wrap">
                                <span>
                                  Entrega inicial: <strong className="text-[#182F28]">{dot.fechaEntrega}</strong>
                                </span>
                                {dot.frecuenciaCambioMeses ? (
                                  <span>
                                    Ciclo de reposición: <strong className="text-[#182F28]">{dot.frecuenciaCambioMeses} meses</strong>
                                  </span>
                                ) : (
                                  <span>Entrega única</span>
                                )}
                                {dot.fechaUltimoCambio && dot.fechaUltimoCambio !== dot.fechaEntrega && (
                                  <span>
                                    Último recambio: <strong className="text-[#182F28]">{dot.fechaUltimoCambio}</strong>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Semáforo de Estado de Recambio o Estado Solicitado */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {dot.estadoElemento === 'Solicitado' ? (
                              <>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                                  <Clock className="w-3 h-3 text-blue-600" />
                                  <span>Pendiente Recibir</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => entregarDotacionSolicitada(dot.id)}
                                  className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#182F28] hover:bg-[#274A3F] text-white transition-all cursor-pointer shadow-2xs"
                                  title="Confirmar recepción física y entrega al residente"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#DCB87F]" />
                                  <span>Marcar Entregado</span>
                                </button>
                              </>
                            ) : (
                              <>
                                {semaforo === 'VENCIDO' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-300">
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                    <span>Vencido ({Math.abs(dias || 0)} días)</span>
                                  </span>
                                )}

                                {semaforo === 'PROXIMO' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span>Próximo recambio ({dias} días)</span>
                                  </span>
                                )}

                                {semaforo === 'VIGENTE' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                    <span>Vigente ({dias} días)</span>
                                  </span>
                                )}

                                {semaforo === 'SIN_VENCIMIENTO' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                                    Sin vencimiento
                                  </span>
                                )}

                                {/* Botón para registrar recambio */}
                                {dot.frecuenciaCambioMeses && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setItemParaRecambio(dot);
                                      setMotivoRecambio(
                                        semaforo === 'VENCIDO'
                                          ? 'Renovación por vencimiento de ciclo'
                                          : 'Recambio periódico programado'
                                      );
                                    }}
                                    className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-[#DEDBD1] hover:border-[#182F28] text-[#182F28] hover:bg-[#182F28] hover:text-white transition-all cursor-pointer shadow-2xs"
                                    title="Registrar nuevo recambio físico y resetear ciclo"
                                  >
                                    <RotateCcw className="w-3 h-3 text-[#B3803F]" />
                                    <span>Registrar Recambio</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Historial de recambios previos si existen */}
                        {dot.historial && dot.historial.length > 0 && (
                          <div className="pt-2 border-t border-[#DEDBD1]/60 text-[11px] text-[#7A745F]">
                            <span className="font-bold text-[#182F28] block mb-1">
                              📋 Historial de Recambios ({dot.historial.length}):
                            </span>
                            <div className="space-y-1 pl-2 border-l-2 border-[#DCB87F]">
                              {dot.historial.map((h, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <span>
                                    <strong>{h.fechaCambio}</strong>: {h.motivo} ({h.condicionNuevo})
                                  </span>
                                  <span className="text-[10px] text-[#5C6058]">{h.usuarioRegistra}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 bg-[#F7F6F2] rounded-2xl text-center text-xs text-[#7A745F] border border-[#DEDBD1]">
                  No tiene elementos de dotación asignados todavía. Utilice el botón "Entregar Artículo" para asignarle sábanas, cobijas o toallas.
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 5: DOCUMENTOS ADJUNTOS */}
          {/* ========================================================================= */}
          {tabActiva === 'documentos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EAE7DC] text-[#274A3F] flex items-center justify-center">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#182F28]">
                      Documentos & Archivos Adjuntos
                    </h4>
                    <p className="text-[11px] text-[#7A745F]">
                      Expediente digital alojado en Google Drive y Oracle SMY_ARCHIVOS
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#274A3F] font-mono font-bold bg-[#274A3F]/15 px-2.5 py-1 rounded-full">
                  {selectedResidente.archivosAdjuntos?.length || 0} archivo(s)
                </span>
              </div>

              {selectedResidente.archivosAdjuntos && selectedResidente.archivosAdjuntos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedResidente.archivosAdjuntos.map((arch, idx) => {
                    // Resolver la ruta oficial en la jerarquía: Samanya / {Sede} / Residentes / {id}_{identificacion} / Documentos / {nombre}
                    const sedeNombre = activeSede?.nombre || 'Sede Central Bogotá';
                    const docIdentificacion = selectedResidente.identificacion || 'SIN_DOC';
                    const sujetoFolder = `${selectedResidente.id || idx + 1}_${docIdentificacion}`;
                    const nombreFichero = arch.nombreAlmacenado || arch.nombreArchivo;

                    const rutaOficialCalculada = `Samanya/${sedeNombre}/Residentes/${sujetoFolder}/Documentos/${nombreFichero}`;
                    let rutaOficial = arch.rutaRelativa || rutaOficialCalculada;
                    if (sedeNombre === 'Sede Campestre La Calera') {
                      rutaOficial = rutaOficial.replace('Sede Campestre El Nogal', 'Sede Campestre La Calera');
                    } else if (sedeNombre === 'Sede Central Bogotá') {
                      rutaOficial = rutaOficial
                        .replace('Sede Principal Santa Bárbara', 'Sede Central Bogotá')
                        .replace('Sede Principal Santa Barbara', 'Sede Central Bogotá');
                    }

                    // URL prioritaria: abrir directamente en Google Drive, con fallback a URL web o ruta oficial
                    let openUrl = arch.driveUrl || (arch.url && arch.url.includes('drive.google.com') ? arch.url : undefined);
                    if (!openUrl) {
                      if (arch.url && (arch.url.startsWith('http://') || arch.url.startsWith('https://'))) {
                        openUrl = arch.url;
                      } else {
                        openUrl = `/${encodeURI(rutaOficial.replace(/^\//, ''))}`;
                      }
                    }

                    return (
                      <div
                        key={arch.id || idx}
                        className="p-3.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between gap-3 shadow-2xs hover:border-[#274A3F]/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#DEDBD1] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-[#274A3F]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-[#182F28] truncate block max-w-[170px]" title={arch.nombreArchivo}>
                                {arch.nombreArchivo}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#274A3F]/10 text-[#274A3F] border border-[#274A3F]/20">
                                {arch.claseArchivo}
                              </span>
                              {arch.tamanoBytes && (
                                <span className="text-[10px] text-[#7A745F]">
                                  {(arch.tamanoBytes / 1024).toFixed(1)} KB
                                </span>
                              )}
                            </div>
                            {arch.descripcion && (
                              <p className="text-[11px] text-[#5C6058] truncate mt-0.5">
                                {arch.descripcion}
                              </p>
                            )}
                            {/* Ruta oficial del archivo en el sistema */}
                            <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-[#274A3F] bg-[#EAE7DC]/70 px-2 py-0.5 rounded border border-[#DEDBD1] truncate max-w-[280px]" title={rutaOficial}>
                              <span className="shrink-0">📁</span>
                              <span className="truncate">{rutaOficial}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={openUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-white hover:bg-[#ECE7DB] border border-[#DEDBD1] rounded-lg text-[#274A3F] transition-colors flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                            title="Abrir en Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 bg-[#F7F6F2] rounded-2xl text-center text-xs text-[#7A745F] border border-[#DEDBD1]">
                  No se adjuntaron documentos durante la admisión del residente.
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 7: INVENTARIO & INSUMOS EN CUSTODIA (Condicional a sede) */}
          {/* ========================================================================= */}
          {activeSede?.manejaInventario !== false && tabActiva === 'inventario' && (
            <ResidentInventoryTabContent
              resident={resident}
              activeSede={activeSede}
              familiares={familiares}
              movimientosInventario={movimientosInventario}
              articulosCatalogo={articulosCatalogo}
              bodegasSede={bodegasSede}
              registrarMovimientoStock={registrarMovimientoStock}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DEDBD1] bg-[#F7F6F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingResidente(selectedResidente);
                setIsEditResidenteOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#DCB87F]"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Información</span>
            </button>

            {dotacionesSolicitadas.length > 0 && (
              <button
                type="button"
                onClick={() => setMostrarModalImprimir(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#DCB87F]/40 shadow-xs"
                title="Generar PDF e imprimir solicitud de dotación pendiente, o enviar por WhatsApp/Correo"
              >
                <Printer className="w-4 h-4 text-[#DCB87F]" />
                <span>Imprimir Solicitud Pendiente ({dotacionesSolicitadas.length})</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsResidenteDetailOpen(false)}
            className="px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>

      {/* Modal para Imprimir Solicitud de Dotación */}
      <ImprimirSolicitudDotacionModal
        isOpen={mostrarModalImprimir}
        onClose={() => setMostrarModalImprimir(false)}
        residente={selectedResidente}
        articulos={dotacionesSolicitadas}
        activeSede={activeSede}
      />
    </div>
  );
};
