import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SedeCentro,
  Residente,
  FamiliarAcudiente,
  TrabajadorEmpleado,
  TurnoAsignado,
  PermisoAusencia,
  IncidenteOperativo,
  AdminDashboardMetrics,
  ElementoDotacionCatalogo,
  DotacionResidente,
  HistorialCambioDotacion,
  SolicitudDotacionPayload,
  ProgramarTurnosRangoPayload,
  AuthUser,
  BitacoraResidente,
  ValoracionIngreso,
  EstadoCivil,
  CategoriaArticulo,
  ArticuloCatalogo,
  BodegaSede,
  InventarioStockSede,
  MovimientoInvDetalle,
  MovimientoInventario,
  TrasladoSedes,
  RegistrarMovimientoPayload,
  RegistrarTrasladoPayload
} from '../types';
import {
  SEED_SEDES,
  SEED_RESIDENTES,
  SEED_FAMILIARES,
  SEED_TRABAJADORES,
  SEED_TURNOS,
  SEED_PERMISOS,
  SEED_INCIDENTES,
  SEED_CATALOGO_DOTACION,
  SEED_DOTACIONES_RESIDENTES,
  SEED_CATEGORIAS_ARTICULOS,
  SEED_ARTICULOS_CATALOGO,
  SEED_BODEGAS_SEDE,
  SEED_INVENTARIO_STOCK,
  SEED_MOVIMIENTOS_INVENTARIO,
  SEED_TRASLADOS_SEDES
} from '../data/seedData';
import { adminApi } from '../services/api';
import { limpiarIdentificacion } from '../utils/formatters';

// Utilidades de Fecha y Hora oficial para Bogotá - Colombia (UTC-5 / America/Bogota)
export const obtenerFechaBogota = (): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());

export const obtenerHoraBogota = (): string =>
  new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());

export const obtenerIsoBogota = (): string =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date()).replace(' ', 'T');

export type AdminTab =
  | 'dashboard'
  | 'residentes'
  | 'familiares'
  | 'trabajadores'
  | 'turnos'
  | 'permisos'
  | 'clinico'
  | 'inventario';

interface AdminContextType {
  // Autenticación y Perfil de Administradores
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (usuario: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isUserProfileOpen: boolean;
  setIsUserProfileOpen: (open: boolean) => void;
  updateProfile: (datos: { nombreCompleto: string; email: string; telefono?: string; avatarUrl?: string }) => Promise<boolean>;
  changePassword: (datos: { claveActual: string; claveNueva: string }) => Promise<boolean>;

  // Navegación y Sedes
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  sedes: SedeCentro[];
  activeSedeId: number;
  activeSede: SedeCentro;
  setActiveSedeId: (id: number) => void;
  actualizarSede: (idCentro: number, data: Partial<SedeCentro>) => Promise<void>;

  // Datos principales
  residentes: Residente[];
  familiares: FamiliarAcudiente[];
  trabajadores: TrabajadorEmpleado[];
  turnos: TurnoAsignado[];
  permisos: PermisoAusencia[];
  incidentes: IncidenteOperativo[];
  metrics: AdminDashboardMetrics;

  // Búsqueda global
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Modales
  isRegisterResidentOpen: boolean;
  setIsRegisterResidentOpen: (open: boolean) => void;
  isRegisterFamilyOpen: boolean;
  setIsRegisterFamilyOpen: (open: boolean) => void;
  isRegisterWorkerOpen: boolean;
  setIsRegisterWorkerOpen: (open: boolean) => void;
  isRegisterLeaveOpen: boolean;
  setIsRegisterLeaveOpen: (open: boolean) => void;
  isAssignShiftOpen: boolean;
  setIsAssignShiftOpen: (open: boolean) => void;
  isProgramarTurnosOpen: boolean;
  setIsProgramarTurnosOpen: (open: boolean) => void;
  turnoModalFechaInicial?: string;
  setTurnoModalFechaInicial: (fecha?: string) => void;
  selectedResidente: Residente | null;
  setSelectedResidente: (res: Residente | null) => void;
  isResidenteDetailOpen: boolean;
  setIsResidenteDetailOpen: (open: boolean) => void;
  tabInicialResidenteDetail: 'general' | 'bitacora' | 'medicamentos' | 'familiares' | 'dotacion' | 'documentos' | 'inventario';
  setTabInicialResidenteDetail: (tab: 'general' | 'bitacora' | 'medicamentos' | 'familiares' | 'dotacion' | 'documentos' | 'inventario') => void;
  abrirInventarioResidente: (residente: Residente) => void;
  isGestionDotacionOpen: boolean;
  setIsGestionDotacionOpen: (open: boolean) => void;
  isSolicitarDotacionOpen: boolean;
  setIsSolicitarDotacionOpen: (open: boolean) => void;
  solicitarDotacionResidentePreseleccionado: Residente | null;
  setSolicitarDotacionResidentePreseleccionado: (res: Residente | null) => void;
  abrirSolicitarDotacion: (residente?: Residente | null) => void;

  // Ficha Técnica de Ingreso y Valoración Multidimensional
  isFichaIngresoOpen: boolean;
  setIsFichaIngresoOpen: (open: boolean) => void;
  selectedResidenteParaFicha: Residente | null;
  setSelectedResidenteParaFicha: (res: Residente | null) => void;
  abrirFichaIngreso: (residente: Residente) => void;
  cerrarFichaIngreso: () => void;
  guardarFichaIngreso: (payload: Record<string, any>) => Promise<void>;
  cargarFichaIngreso: (idResidente: number) => Promise<any>;
  estadosCiviles: EstadoCivil[];

  // Dotación
  catalogoDotacion: ElementoDotacionCatalogo[];
  dotaciones: DotacionResidente[];
  guardarElementoCatalogo: (item: Partial<ElementoDotacionCatalogo>) => Promise<void>;
  eliminarElementoCatalogo: (id: number) => Promise<void>;
  registrarDotacionResidente: (idResidente: number, items: Array<Partial<DotacionResidente>>) => Promise<void>;
  agregarArticuloDotacionResidente: (idResidente: number, item: Partial<DotacionResidente>) => Promise<void>;
  registrarSolicitudDotacion: (payload: SolicitudDotacionPayload) => Promise<void>;
  entregarDotacionSolicitada: (idDotacionResidente: number, condicion?: string, notas?: string) => Promise<void>;
  registrarRecambioDotacion: (
    idDotacionResidente: number,
    cambio: { motivo: string; condicionNuevo?: string; observaciones?: string }
  ) => Promise<void>;

  // Módulo de Inventario y Almacén Multisede
  categoriasArticulos: CategoriaArticulo[];
  articulosCatalogo: ArticuloCatalogo[];
  bodegasSede: BodegaSede[];
  inventarioStock: InventarioStockSede[];
  movimientosInventario: MovimientoInventario[];
  trasladosSedes: TrasladoSedes[];
  registrarMovimientoStock: (payload: RegistrarMovimientoPayload) => Promise<boolean>;
  despacharTraslado: (payload: RegistrarTrasladoPayload) => Promise<boolean>;
  recibirTraslado: (idTraslado: number, notasRecepcion?: string) => Promise<boolean>;
  crearArticuloCatalogo: (articulo: Omit<ArticuloCatalogo, 'id'>) => Promise<boolean>;
  actualizarArticuloCatalogo: (id: number, datos: Partial<ArticuloCatalogo>) => Promise<boolean>;

  // Modales de Edición
  editingResidente: Residente | null;
  setEditingResidente: (res: Residente | null) => void;
  isEditResidenteOpen: boolean;
  setIsEditResidenteOpen: (open: boolean) => void;
  editingTrabajador: TrabajadorEmpleado | null;
  setEditingTrabajador: (t: TrabajadorEmpleado | null) => void;
  isEditTrabajadorOpen: boolean;
  setIsEditTrabajadorOpen: (open: boolean) => void;
  editingFamiliar: FamiliarAcudiente | null;
  setEditingFamiliar: (f: FamiliarAcudiente | null) => void;
  isEditFamiliarOpen: boolean;
  setIsEditFamiliarOpen: (open: boolean) => void;
  isEditSedeOpen: boolean;
  setIsEditSedeOpen: (open: boolean) => void;

  // Acciones de Negocio (sin DML en el front)
  registrarResidente: (data: Omit<Residente, 'id' | 'codigoExpediente' | 'edad'> & {
    fechaIngreso?: string;
    familiarContacto?: {
      nombres: string;
      apellidos: string;
      identificacion: string;
      parentesco: string;
      telefono: string;
      email: string;
    };
    dotacionInicial?: Array<Partial<DotacionResidente>>;
    observaciones?: string;
  }) => Promise<void>;

  actualizarResidente: (
    idResidente: number,
    data: Partial<Residente> & { observacionCambioEstado?: string; idUsuario?: number }
  ) => Promise<void>;
  cargarBitacoraResidente: (idResidente: number) => Promise<BitacoraResidente[]>;
  agregarEntradaBitacora: (idResidente: number, entrada: { contenido: string; idCategoriaBitacora?: number; categoria?: string }) => Promise<void>;
  sincronizarResidentes: (silencioso?: boolean) => Promise<void>;

  registrarFamiliar: (data: Omit<FamiliarAcudiente, 'id' | 'nombreCompleto'> & {
    idResidenteVinculado?: number;
    parentesco?: string;
    esPrincipal?: boolean;
    fotoUrl?: string;
  }) => Promise<void>;

  actualizarFamiliar: (idFamiliar: number, data: Partial<FamiliarAcudiente> & { esPrincipal?: boolean }) => Promise<void>;

  eliminarFamiliar: (idFamiliar: number) => Promise<void>;

  registrarTrabajador: (data: Omit<TrabajadorEmpleado, 'id' | 'nombreCompleto' | 'fechaContratacion'>) => Promise<void>;

  actualizarTrabajador: (idTrabajador: number, data: Partial<TrabajadorEmpleado>) => Promise<void>;

  actualizarEstadoTrabajador: (idTrabajador: number, nuevoEstado: 'Activo' | 'En Permiso' | 'Inactivo') => Promise<void>;

  asignarTrabajadorATurno: (idTurno: number, idTrabajador: number) => Promise<void>;
  programarTurnosRango: (payload: ProgramarTurnosRangoPayload) => Promise<{ turnosGenerados: number; asignacionesGeneradas: number }>;
  desasignarTrabajadorDeTurno: (idTurno: number, idTrabajador: number) => Promise<void>;

  aprobarPermiso: (idPermiso: number, comentarios: string) => Promise<void>;
  rechazarPermiso: (idPermiso: number, comentarios: string) => Promise<void>;
  registrarPermiso: (nuevoPermiso: Omit<PermisoAusencia, 'id' | 'fechaSolicitud'> & { fechaSolicitud?: string }) => Promise<void>;

  // Notificaciones Toast y Alertas con Estilo Samanya
  toast: { message: string; type: 'success' | 'alert' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'alert' | 'info') => void;
  alertModal: {
    isOpen: boolean;
    title?: string;
    message: string;
    type?: 'alert' | 'warning' | 'info' | 'success' | 'danger';
    confirmText?: string;
    cancelText?: string;
    isConfirm?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null;
  showAlert: (
    message: string,
    title?: string,
    type?: 'alert' | 'warning' | 'info' | 'success' | 'danger',
    confirmText?: string,
    onConfirm?: () => void
  ) => void;
  showConfirm: (options: {
    message: string;
    title?: string;
    type?: 'alert' | 'warning' | 'info' | 'success' | 'danger';
    confirmText?: string;
    cancelText?: string;
  }) => Promise<boolean>;
  closeAlert: (wasConfirmed?: boolean) => void;

  // Conexión y sincronización en vivo con Oracle
  isSyncingGlobal: boolean;
  isOracleLive: boolean;
  sincronizarTodoConOracle: (silencioso?: boolean) => Promise<void>;
  sincronizarTrabajadores: (silencioso?: boolean) => Promise<void>;
  sincronizarFamiliares: (silencioso?: boolean) => Promise<void>;
  sincronizarCatalogoDotacion: (silencioso?: boolean) => Promise<void>;
  limpiarCacheYReconectarOracle: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Sedes
  const [sedes, setSedes] = useState<SedeCentro[]>(() => {
    const saved = localStorage.getItem('samanya_admin_sedes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrar en caliente nombres antiguos y banderas de inventario guardadas en caché local
          const migrado = parsed.map((s: SedeCentro) => {
            const seedMatch = SEED_SEDES.find((seed) => seed.id === s.id);
            const manejaInv = s.manejaInventario !== undefined ? s.manejaInventario : (seedMatch?.manejaInventario ?? true);
            const manejaCostos = s.manejaCostosInventario !== undefined ? s.manejaCostosInventario : (seedMatch?.manejaCostosInventario ?? true);
            let updated: SedeCentro = { ...s, manejaInventario: manejaInv, manejaCostosInventario: manejaCostos };

            if (s.id === 1 && (s.nombre.includes('Santa Bárbara') || s.nombre.includes('Santa Barbara'))) {
              updated = { ...updated, nombre: 'Sede Central Bogotá', codigo: 'SEDE-CENTRAL' };
            }
            if (s.id === 2 && (s.nombre.includes('El Nogal') || s.nombre.includes('Nogal'))) {
              updated = {
                ...updated,
                nombre: 'Sede Campestre La Calera',
                codigo: 'SEDE-NORTE',
                ciudad: 'La Calera, Cundinamarca',
                direccion: 'Km 4 Vía La Calera',
                capacidadTotal: 45
              };
            }
            return updated;
          });
          localStorage.setItem('samanya_admin_sedes', JSON.stringify(migrado));
          return migrado;
        }
      } catch (e) {
        // En caso de error de parseo, usar SEED_SEDES
      }
    }
    return SEED_SEDES;
  });

  const [activeSedeId, setActiveSedeIdState] = useState<number>(() => {
    const saved = localStorage.getItem('samanya_active_sede_id');
    return saved ? Number(saved) : 1;
  });

  const setActiveSedeId = (id: number) => {
    setActiveSedeIdState(id);
    localStorage.setItem('samanya_active_sede_id', String(id));
  };

  const activeSede = sedes.find((s) => s.id === activeSedeId) || sedes[0];

  // 2. Tab activo
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // 3. Estados con persistencia local (inicializan vacíos si la BD de Oracle está limpia)
  const [residentes, setResidentes] = useState<Residente[]>(() => {
    const saved = localStorage.getItem('samanya_admin_residentes');
    return saved ? JSON.parse(saved) : [];
  });

  const [familiares, setFamiliares] = useState<FamiliarAcudiente[]>(() => {
    const saved = localStorage.getItem('samanya_admin_familiares');
    return saved ? JSON.parse(saved) : [];
  });

  const [trabajadores, setTrabajadores] = useState<TrabajadorEmpleado[]>(() => {
    const saved = localStorage.getItem('samanya_admin_trabajadores');
    return saved ? JSON.parse(saved) : [];
  });

  const [turnos, setTurnos] = useState<TurnoAsignado[]>(() => {
    const saved = localStorage.getItem('samanya_admin_turnos');
    return saved ? JSON.parse(saved) : [];
  });

  const [permisos, setPermisos] = useState<PermisoAusencia[]>(() => {
    const saved = localStorage.getItem('samanya_admin_permisos');
    return saved ? JSON.parse(saved) : [];
  });

  const [incidentes, setIncidentes] = useState<IncidenteOperativo[]>(() => {
    const saved = localStorage.getItem('samanya_admin_incidentes');
    return saved ? JSON.parse(saved) : [];
  });

  // Catálogo y Dotación de Residentes (se sincroniza en vivo desde SMY_DOTACION_CATALOGO)
  const [catalogoDotacion, setCatalogoDotacion] = useState<ElementoDotacionCatalogo[]>(() => {
    const saved = localStorage.getItem('samanya_admin_catalogo_dotacion');
    return saved ? JSON.parse(saved) : [];
  });

  const [dotaciones, setDotaciones] = useState<DotacionResidente[]>(() => {
    const saved = localStorage.getItem('samanya_admin_dotaciones');
    return saved ? JSON.parse(saved) : [];
  });

  const [isGestionDotacionOpen, setIsGestionDotacionOpen] = useState(false);
  const [isSolicitarDotacionOpen, setIsSolicitarDotacionOpen] = useState(false);
  const [solicitarDotacionResidentePreseleccionado, setSolicitarDotacionResidentePreseleccionado] = useState<Residente | null>(null);
  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);
  const [isOracleLive, setIsOracleLive] = useState(false);
  const [oracleMetrics, setOracleMetrics] = useState<AdminDashboardMetrics | null>(null);

  // Módulo de Inventario y Almacén Multisede
  const [categoriasArticulos, setCategoriasArticulos] = useState<CategoriaArticulo[]>(() => {
    const saved = localStorage.getItem('samanya_admin_categorias_inv');
    return saved ? JSON.parse(saved) : SEED_CATEGORIAS_ARTICULOS;
  });

  const [articulosCatalogo, setArticulosCatalogo] = useState<ArticuloCatalogo[]>(() => {
    const saved = localStorage.getItem('samanya_admin_articulos_inv');
    return saved ? JSON.parse(saved) : SEED_ARTICULOS_CATALOGO;
  });

  const [bodegasSede, setBodegasSede] = useState<BodegaSede[]>(() => {
    const saved = localStorage.getItem('samanya_admin_bodegas_inv');
    return saved ? JSON.parse(saved) : SEED_BODEGAS_SEDE;
  });

  const [inventarioStock, setInventarioStock] = useState<InventarioStockSede[]>(() => {
    const saved = localStorage.getItem('samanya_admin_stock_inv');
    return saved ? JSON.parse(saved) : SEED_INVENTARIO_STOCK;
  });

  const [movimientosInventario, setMovimientosInventario] = useState<MovimientoInventario[]>(() => {
    const saved = localStorage.getItem('samanya_admin_movimientos_inv');
    return saved ? JSON.parse(saved) : SEED_MOVIMIENTOS_INVENTARIO;
  });

  const [trasladosSedes, setTrasladosSedes] = useState<TrasladoSedes[]>(() => {
    const saved = localStorage.getItem('samanya_admin_traslados_inv');
    return saved ? JSON.parse(saved) : SEED_TRASLADOS_SEDES;
  });

  useEffect(() => {
    localStorage.setItem('samanya_admin_categorias_inv', JSON.stringify(categoriasArticulos));
  }, [categoriasArticulos]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_articulos_inv', JSON.stringify(articulosCatalogo));
  }, [articulosCatalogo]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_bodegas_inv', JSON.stringify(bodegasSede));
  }, [bodegasSede]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_stock_inv', JSON.stringify(inventarioStock));
  }, [inventarioStock]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_movimientos_inv', JSON.stringify(movimientosInventario));
  }, [movimientosInventario]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_traslados_inv', JSON.stringify(trasladosSedes));
  }, [trasladosSedes]);

  // Guardado en localStorage al mutar
  useEffect(() => {
    localStorage.setItem('samanya_admin_sedes', JSON.stringify(sedes));
  }, [sedes]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_residentes', JSON.stringify(residentes));
  }, [residentes]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_familiares', JSON.stringify(familiares));
  }, [familiares]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_trabajadores', JSON.stringify(trabajadores));
  }, [trabajadores]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_turnos', JSON.stringify(turnos));
  }, [turnos]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_permisos', JSON.stringify(permisos));
  }, [permisos]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_incidentes', JSON.stringify(incidentes));
  }, [incidentes]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_catalogo_dotacion', JSON.stringify(catalogoDotacion));
  }, [catalogoDotacion]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_dotaciones', JSON.stringify(dotaciones));
  }, [dotaciones]);

  // Sincronizar en caliente los trabajadores asignados en turnos con la lista maestra de trabajadores
  useEffect(() => {
    setTurnos((prevTurnos) => {
      let changed = false;
      const synced = prevTurnos.map((turno) => {
        let turnoChanged = false;
        const updatedWorkers = turno.trabajadoresAsignados.map((w) => {
          const master = trabajadores.find((t) => t.id === w.idTrabajador);
          if (!master) return w;
          const masterName = master.nombreCompleto || `${master.nombres} ${master.apellidos}`.trim();
          if (
            w.nombre !== masterName ||
            (master.avatarUrl && w.avatarUrl !== master.avatarUrl) ||
            (master.cargo && w.cargo !== master.cargo) ||
            (master.area && w.area !== master.area)
          ) {
            turnoChanged = true;
            return {
              ...w,
              nombre: masterName,
              avatarUrl: master.avatarUrl || w.avatarUrl,
              cargo: master.cargo || w.cargo,
              area: master.area || w.area
            };
          }
          return w;
        });

        if (turnoChanged) {
          changed = true;
          return { ...turno, trabajadoresAsignados: updatedWorkers };
        }
        return turno;
      });

      return changed ? synced : prevTurnos;
    });
  }, [trabajadores]);

  // Sincronización en tiempo real de Residentes desde Oracle
  const sincronizarResidentes = async (silencioso = false) => {
    try {
      const resp = await adminApi.residentes.consultarCenso(activeSede.id);
      if (resp && resp.success && Array.isArray(resp.data)) {
        const rows = resp.data;
        const mapped: Residente[] = rows.map((r: any) => {
          let estadoVal: Residente['estado'] = 'Activo';
          const est = String(r.estado || '').toUpperCase();
          if (est.includes('OBSERVACION') || est.includes('OBSERVACIÓN')) estadoVal = 'En Observación';
          else if (est.includes('HOSPITAL')) estadoVal = 'Hospitalizado';
          else if (est.includes('EGRESADO')) estadoVal = 'Egresado';

          let movVal: Residente['nivelMovilidad'] = 'Independiente';
          const mov = String(r.nivel_movilidad || '').toLowerCase();
          if (mov.includes('leve') || mov.includes('asistida')) movVal = 'Asistencia Leve';
          else if (mov.includes('moderada') || mov.includes('silla')) movVal = 'Asistencia Moderada';
          else if (mov.includes('dependiente') || mov.includes('encamado')) movVal = 'Dependiente Total';

          return {
            id: Number(r.id),
            idCentro: Number(r.id_centro) || activeSede.id,
            codigoExpediente: r.codigo_expediente || `RES-${r.id}`,
            tipoIdentificacion: 'CC',
            identificacion: limpiarIdentificacion(String(r.identificacion || '')),
            nombres: r.nombres || '',
            apellidos: r.apellidos || '',
            nombreCompleto: r.nombre_completo || `${r.nombres || ''} ${r.apellidos || ''}`.trim(),
            fechaNacimiento: r.fecha_nacimiento ? String(r.fecha_nacimiento).slice(0, 10) : '1945-01-01',
            edad: Number(r.edad) || 75,
            genero: 'M',
            fotoUrl: r.foto_url,
            habitacion: String(r.habitacion || '101'),
            cama: String(r.cama || 'A'),
            eps: 'Sanitas EPS',
            planComplementario: '',
            tipoSangre: 'O+',
            nivelMovilidad: movVal,
            tipoDieta: (r.tipo_dieta as any) || 'Normal / General',
            alertasClinicas: r.alertas_clinicas || '',
            estado: estadoVal,
            fechaIngreso: r.fecha_ingreso ? String(r.fecha_ingreso).slice(0, 10) : '2024-01-10',
            medicamentos: [],
            acudientes: []
          };
        });

        setResidentes(mapped);
        localStorage.setItem('samanya_admin_residentes', JSON.stringify(mapped));
        if (!silencioso) {
          showToast(`✅ Sincronizados ${mapped.length} residentes desde la base de datos Oracle`, 'success');
        }
      }
    } catch (err: any) {
      console.error('[AdminContext] Error al sincronizar residentes con Oracle:', err);
      if (!silencioso) {
        showToast(`❌ Error al conectar con Oracle: ${err.message || 'Error de conexión'}`, 'alert');
      }
    }
  };

  // Sincronización en tiempo real de Talento Humano / Empleados desde Oracle (SMY_EMPLEADOS / PKGCA_SMY_EMPLEADOS)
  const sincronizarTrabajadores = async (silencioso = false) => {
    try {
      const resp = await adminApi.trabajadores.consultarTrabajadores(activeSede.id);
      if (resp && resp.success && Array.isArray(resp.data)) {
        const mapped: TrabajadorEmpleado[] = resp.data.map((w: any) => {
          let areaVal: TrabajadorEmpleado['area'] = 'Cuidado Asistencial';
          const a = String(w.area || '').toLowerCase();
          if (a.includes('enferm')) areaVal = 'Enfermería';
          else if (a.includes('med')) areaVal = 'Medicina / Especialistas';
          else if (a.includes('nutri') || a.includes('coci')) areaVal = 'Nutrición / Cocina';
          else if (a.includes('admin')) areaVal = 'Administrativo';
          else if (a.includes('serv')) areaVal = 'Servicios Generales';

          let estVal: TrabajadorEmpleado['estado'] = 'Activo';
          const e = String(w.estado || '').toUpperCase();
          if (e.includes('PERMISO') || e.includes('LICENCIA')) estVal = 'En Permiso';
          else if (e.includes('INACT')) estVal = 'Inactivo';

          return {
            id: Number(w.id),
            idCentro: Number(w.id_centro) || activeSede.id,
            tipoIdentificacion: w.tipo_identificacion || 'CC',
            identificacion: limpiarIdentificacion(String(w.identificacion || '')),
            nombres: w.nombres || '',
            apellidos: w.apellidos || '',
            nombreCompleto: w.nombre_completo || `${w.nombres || ''} ${w.apellidos || ''}`.trim(),
            cargo: w.cargo || 'Cuidador',
            area: areaVal,
            unidadAsignada: w.unidad_asignada || 'Piso 1',
            telefono: w.telefono || '',
            email: w.email || '',
            fechaContratacion: w.fecha_contratacion ? String(w.fecha_contratacion).slice(0, 10) : '2023-01-15',
            tipoContrato: 'Término Indefinido',
            eps: 'Sanitas EPS',
            arl: 'Sura ARL',
            estado: estVal,
            avatarUrl: w.avatar_url
          };
        });
        setTrabajadores(mapped);
        localStorage.setItem('samanya_admin_trabajadores', JSON.stringify(mapped));
        if (!silencioso) {
          showToast(`✅ Sincronizados ${mapped.length} colaboradores desde Oracle`, 'success');
        }
      }
    } catch (err: any) {
      console.error('[AdminContext] Error al sincronizar trabajadores con Oracle:', err);
    }
  };

  // Sincronización en tiempo real de Familiares y Acudientes desde Oracle (SMY_ACUDIENTES / PKGCA_SMY_ACUDIENTES)
  const sincronizarFamiliares = async (silencioso = false) => {
    try {
      const resp = await adminApi.familiares.consultarFamiliares(activeSede.id);
      if (resp && resp.success && Array.isArray(resp.data)) {
        const mapped: FamiliarAcudiente[] = resp.data.map((f: any) => {
          let asociados: FamiliarAcudiente['residentesAsociados'] = [];
          if (Array.isArray(f.residentes_asociados)) {
            asociados = f.residentes_asociados;
          } else if (typeof f.residentes_asociados_json === 'string') {
            try {
              asociados = JSON.parse(f.residentes_asociados_json || '[]');
            } catch {
              asociados = [];
            }
          } else if (Array.isArray(f.residentes_asociados_json)) {
            asociados = f.residentes_asociados_json;
          }

          let canalVal: FamiliarAcudiente['canalNotificacionPref'] = 'WhatsApp';
          const c = String(f.canal_notificacion_pref || '').toUpperCase();
          if (c.includes('CORREO') || c.includes('EMAIL')) canalVal = 'Correo';
          else if (c.includes('PUSH') || c.includes('APP')) canalVal = 'Push App';
          else if (c.includes('LLAMADA')) canalVal = 'Llamada';

          return {
            id: Number(f.id),
            tipoIdentificacion: f.tipo_identificacion || 'CC',
            identificacion: limpiarIdentificacion(String(f.identificacion || '')),
            nombres: f.nombres || '',
            apellidos: f.apellidos || '',
            nombreCompleto: f.nombre_completo || `${f.nombres || ''} ${f.apellidos || ''}`.trim(),
            telefonoPrincipal: f.telefono_principal || '',
            telefonoSecundario: f.telefono_secundario || '',
            email: f.email || '',
            direccion: f.direccion || '',
            ciudad: f.ciudad || 'Bogotá',
            canalNotificacionPref: canalVal,
            fotoUrl: f.avatar_url,
            residentesAsociados: asociados
          };
        });
        setFamiliares(mapped);
        localStorage.setItem('samanya_admin_familiares', JSON.stringify(mapped));
        if (!silencioso) {
          showToast(`✅ Sincronizados ${mapped.length} familiares desde Oracle`, 'success');
        }
      }
    } catch (err: any) {
      console.error('[AdminContext] Error al sincronizar familiares con Oracle:', err);
    }
  };

  // Sincronización en tiempo real del Catálogo de Dotación desde Oracle (SMY_DOTACION_CATALOGO)
  const sincronizarCatalogoDotacion = async (silencioso = false) => {
    try {
      const orgId = activeSede?.idOrganizacion || 1;
      const resp = await adminApi.dotacion.consultarCatalogo(orgId);
      if (resp && resp.success && Array.isArray(resp.data)) {
        const mapped: ElementoDotacionCatalogo[] = resp.data.map((item: any) => ({
          id: Number(item.id),
          idOrganizacion: Number(item.id_organizacion) || orgId,
          nombreElemento: item.nombre_elemento,
          categoria: item.categoria || 'General',
          cantidadDefecto: Number(item.cantidad_defecto) || 1,
          frecuenciaCambioMeses: item.frecuencia_cambio_meses ? Number(item.frecuencia_cambio_meses) : null,
          descripcion: item.descripcion || '',
          esSugeridoIngreso: Number(item.es_sugerido_ingreso) === 1,
          estado: (item.estado === 'Inactivo' ? 'Inactivo' : 'Activo') as 'Activo' | 'Inactivo'
        }));
        setCatalogoDotacion(mapped);
        localStorage.setItem('samanya_admin_catalogo_dotacion', JSON.stringify(mapped));
      }
    } catch (err: any) {
      console.error('[AdminContext] Error al sincronizar catálogo con Oracle:', err);
    }
  };

  // Sincronización de Métricas del Dashboard desde Oracle (PKGLN_DASHBOARD_ADMINISTRADOR.F_OBTENER_RESUMEN_JSON)
  const sincronizarMetricasDashboard = async () => {
    try {
      const resp = await adminApi.dashboard.obtenerMetricas(activeSede.id);
      if (resp && resp.success && resp.data) {
        setOracleMetrics({
          totalResidentes: Number(resp.data.totalResidentes) || 0,
          capacidadTotal: Number(resp.data.capacidadTotal) || activeSede?.capacidadTotal || 40,
          porcentajeOcupacion: Number(resp.data.porcentajeOcupacion) || 0,
          personalActivoTurno: Number(resp.data.personalActivoTurno) || 0,
          tareasCumplimiento: 100,
          incidentesActivos: Number(resp.data.incidentesActivos) || 0,
          permisosPendientes: Number(resp.data.permisosPendientes) || 0,
          alertasCriticas: Number(resp.data.incidentesActivos) > 0 ? 1 : 0
        });
      }
    } catch (err: any) {
      console.error('[AdminContext] Error al sincronizar métricas con Oracle:', err);
    }
  };

  // Sincronizar todo en vivo contra Oracle
  const sincronizarTodoConOracle = async (silencioso = false) => {
    setIsSyncingGlobal(true);
    try {
      await Promise.all([
        sincronizarResidentes(silencioso),
        sincronizarTrabajadores(silencioso),
        sincronizarFamiliares(silencioso),
        sincronizarCatalogoDotacion(silencioso),
        sincronizarMetricasDashboard()
      ]);
      setIsOracleLive(true);
      if (!silencioso) {
        showToast('✅ Sincronización completa con Oracle Cloud Database exitosa', 'success');
      }
    } catch (err: any) {
      setIsOracleLive(false);
      if (!silencioso) {
        showToast('⚠️ No se pudo sincronizar completamente con Oracle', 'alert');
      }
    } finally {
      setIsSyncingGlobal(false);
    }
  };

  // Limpiar caché local y forzar lectura limpia desde Oracle
  const limpiarCacheYReconectarOracle = async () => {
    localStorage.removeItem('samanya_admin_sedes');
    localStorage.removeItem('samanya_admin_residentes');
    localStorage.removeItem('samanya_admin_familiares');
    localStorage.removeItem('samanya_admin_trabajadores');
    localStorage.removeItem('samanya_admin_turnos');
    localStorage.removeItem('samanya_admin_permisos');
    localStorage.removeItem('samanya_admin_incidentes');
    localStorage.removeItem('samanya_admin_dotaciones');
    localStorage.removeItem('samanya_admin_catalogo_dotacion');

    setSedes(SEED_SEDES);
    setResidentes([]);
    setFamiliares([]);
    setTrabajadores([]);
    setTurnos([]);
    setPermisos([]);
    setIncidentes([]);
    setDotaciones([]);
    setCatalogoDotacion([]);
    setOracleMetrics(null);

    await sincronizarTodoConOracle(false);
    showToast('🧹 Caché local depurada y datos restablecidos en vivo desde Oracle', 'info');
  };

  // Sincronizar automáticamente con Oracle al cargar o cambiar sede
  useEffect(() => {
    sincronizarTodoConOracle(true);
  }, [activeSede.id]);

  // Búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  // Modales
  const [isRegisterResidentOpen, setIsRegisterResidentOpen] = useState(false);
  const [isRegisterFamilyOpen, setIsRegisterFamilyOpen] = useState(false);
  const [isRegisterWorkerOpen, setIsRegisterWorkerOpen] = useState(false);
  const [isRegisterLeaveOpen, setIsRegisterLeaveOpen] = useState(false);
  const [isAssignShiftOpen, setIsAssignShiftOpen] = useState(false);
  const [isProgramarTurnosOpen, setIsProgramarTurnosOpen] = useState(false);
  const [turnoModalFechaInicial, setTurnoModalFechaInicial] = useState<string | undefined>(undefined);
  const [selectedResidente, setSelectedResidente] = useState<Residente | null>(null);
  const [isResidenteDetailOpen, setIsResidenteDetailOpen] = useState(false);
  const [tabInicialResidenteDetail, setTabInicialResidenteDetail] = useState<
    'general' | 'bitacora' | 'medicamentos' | 'familiares' | 'dotacion' | 'documentos' | 'inventario'
  >('general');

  const abrirInventarioResidente = (residente: Residente) => {
    setSelectedResidente(residente);
    setTabInicialResidenteDetail('inventario');
    setIsResidenteDetailOpen(true);
  };

  // Ficha Técnica de Ingreso y Valoración Multidimensional
  const [isFichaIngresoOpen, setIsFichaIngresoOpen] = useState(false);
  const [selectedResidenteParaFicha, setSelectedResidenteParaFicha] = useState<Residente | null>(null);
  const [estadosCiviles, setEstadosCiviles] = useState<EstadoCivil[]>([
    { id: 1, codigo: 'SOLTERO', nombre: 'Soltero(a)' },
    { id: 2, codigo: 'CASADO', nombre: 'Casado(a)' },
    { id: 3, codigo: 'UNION_LIBRE', nombre: 'Unión Libre / Compañero(a) Permanente' },
    { id: 4, codigo: 'VIUDO', nombre: 'Viudo(a)' },
    { id: 5, codigo: 'DIVORCIADO', nombre: 'Divorciado(a)' },
    { id: 6, codigo: 'SEPARADO', nombre: 'Separado(a)' },
    { id: 7, codigo: 'RELIGIOSO', nombre: 'Sacerdote / Religioso(a)' }
  ]);

  // Cargar catálogo de estados civiles desde Oracle al iniciar
  useEffect(() => {
    adminApi.residentes.consultarEstadosCiviles()
      .then((res) => {
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setEstadosCiviles(res.data);
        }
      })
      .catch((err) => console.warn('[AdminContext] Usando catálogo local de estados civiles:', err));
  }, []);

  const abrirFichaIngreso = (residente: Residente) => {
    setSelectedResidenteParaFicha(residente);
    setIsFichaIngresoOpen(true);
  };

  const cerrarFichaIngreso = () => {
    setIsFichaIngresoOpen(false);
    setSelectedResidenteParaFicha(null);
  };

  const cargarFichaIngreso = async (idResidente: number) => {
    try {
      const resp = await adminApi.residentes.consultarFichaIngreso(idResidente);
      if (resp && resp.data) {
        return resp.data;
      }
      return null;
    } catch (err) {
      console.warn('[AdminContext] Error al consultar ficha de ingreso:', err);
      return null;
    }
  };

  const guardarFichaIngreso = async (payload: Record<string, any>) => {
    try {
      const resp = await adminApi.residentes.guardarFichaIngreso(payload);
      if (resp && resp.success) {
        showToast('✅ Ficha Técnica y Valoración de Ingreso guardada exitosamente en Oracle', 'success');
        if (payload.idResidente) {
          await sincronizarResidentes(true);
        }
      } else {
        throw new Error(resp?.message || 'Error al guardar la ficha técnica');
      }
    } catch (err: any) {
      console.error('[AdminContext] Error en guardarFichaIngreso:', err);
      showToast(`❌ Error al guardar valoración: ${err.message || 'Error en base de datos'}`, 'alert');
      throw err;
    }
  };

  // Modales de Edición
  const [editingResidente, setEditingResidente] = useState<Residente | null>(null);
  const [isEditResidenteOpen, setIsEditResidenteOpen] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState<TrabajadorEmpleado | null>(null);
  const [isEditTrabajadorOpen, setIsEditTrabajadorOpen] = useState(false);
  const [editingFamiliar, setEditingFamiliar] = useState<FamiliarAcudiente | null>(null);
  const [isEditFamiliarOpen, setIsEditFamiliarOpen] = useState(false);
  const [isEditSedeOpen, setIsEditSedeOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Autenticación de Administradores
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('samanya_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.rol === 'ADMIN') {
          return parsed;
        }
      } catch {}
    }
    return null;
  });

  const isAuthenticated = !!currentUser && currentUser.rol === 'ADMIN';

  const login = async (usuario: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const resp = await adminApi.auth.login({ usuario, password });
      if (resp && resp.success && resp.user) {
        if (resp.user.rol !== 'ADMIN') {
          return {
            success: false,
            error: `Acceso denegado: Este portal es exclusivo para Administradores. Su rol actual es '${resp.user.nombreRol}'.`
          };
        }
        const userObj: AuthUser = {
          id: resp.user.id,
          username: resp.user.username,
          email: resp.user.email,
          nombreCompleto: resp.user.nombreCompleto,
          telefono: resp.user.telefono,
          avatarUrl: resp.user.avatarUrl,
          rol: 'ADMIN',
          nombreRol: resp.user.nombreRol
        };
        setCurrentUser(userObj);
        localStorage.setItem('samanya_auth_user', JSON.stringify(userObj));
        if (resp.token) {
          localStorage.setItem('samanya_admin_token', resp.token);
        }
        showToast(`Bienvenido de nuevo, ${userObj.nombreCompleto}`, 'success');
        return { success: true };
      } else {
        return {
          success: false,
          error: (resp as any)?.error || 'Credenciales no válidas.'
        };
      }
    } catch (err: any) {
      const msg = err.message || 'Error de conexión con el servidor.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('samanya_auth_user');
    localStorage.removeItem('samanya_admin_token');
    showToast('Sesión finalizada correctamente', 'info');
  };

  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  const updateProfile = async (datos: {
    nombreCompleto: string;
    email: string;
    telefono?: string;
    avatarUrl?: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const resp = await adminApi.auth.actualizarPerfil({
        idUsuario: currentUser.id,
        nombreCompleto: datos.nombreCompleto,
        email: datos.email,
        telefono: datos.telefono,
        avatarUrl: datos.avatarUrl
      });
      if (resp && resp.success) {
        const rawAvatar = resp.user?.avatarUrl !== undefined ? resp.user.avatarUrl : datos.avatarUrl;
        const finalAvatar = rawAvatar && rawAvatar.startsWith('/uploads/')
          ? `${rawAvatar.split('?')[0]}?t=${Date.now()}`
          : rawAvatar;

        const updatedUser: AuthUser = {
          ...currentUser,
          nombreCompleto: datos.nombreCompleto,
          email: datos.email,
          telefono: datos.telefono || currentUser.telefono,
          avatarUrl: finalAvatar
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('samanya_auth_user', JSON.stringify(updatedUser));
        showToast('Perfil actualizado correctamente', 'success');
        return true;
      } else {
        showToast((resp as any)?.error || 'No se pudo actualizar el perfil', 'alert');
        return false;
      }
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar perfil en Oracle', 'alert');
      return false;
    }
  };

  const changePassword = async (datos: { claveActual: string; claveNueva: string }): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const resp = await adminApi.auth.cambiarClave({
        idUsuario: currentUser.id,
        claveActual: datos.claveActual,
        claveNueva: datos.claveNueva
      });
      if (resp && resp.success) {
        showToast('Contraseña actualizada exitosamente', 'success');
        return true;
      } else {
        showToast((resp as any)?.error || 'No se pudo actualizar la contraseña', 'alert');
        return false;
      }
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar contraseña en Oracle', 'alert');
      return false;
    }
  };

  // Diálogo / Alerta y Confirmación con estilo institucional Samanya
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: 'alert' | 'warning' | 'info' | 'success' | 'danger';
    confirmText?: string;
    cancelText?: string;
    isConfirm?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showAlert = (
    message: string,
    title?: string,
    type: 'alert' | 'warning' | 'info' | 'success' | 'danger' = 'alert',
    confirmText?: string,
    onConfirm?: () => void
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      confirmText: confirmText || 'Aceptar',
      isConfirm: false,
      onConfirm
    });
  };

  const showConfirm = (options: {
    message: string;
    title?: string;
    type?: 'alert' | 'warning' | 'info' | 'success' | 'danger';
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertModal({
        isOpen: true,
        title: options.title || 'Confirmación requerida',
        message: options.message,
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Aceptar',
        cancelText: options.cancelText || 'Cancelar',
        isConfirm: true,
        onConfirm: () => {
          setAlertModal(null);
          resolve(true);
        },
        onCancel: () => {
          setAlertModal(null);
          resolve(false);
        }
      });
    });
  };

  const closeAlert = (wasConfirmed: boolean = false) => {
    if (alertModal) {
      if (wasConfirmed && alertModal.onConfirm) {
        alertModal.onConfirm();
      } else if (!wasConfirmed && alertModal.onCancel) {
        alertModal.onCancel();
      }
    }
    setAlertModal(null);
  };

  // Interceptar window.alert para que cualquier mensaje use el diseño institucional Samanya
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      showAlert(String(msg ?? ''), 'Atención', 'alert');
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Cálculo de Métricas del Dashboard
  const sedeResidentes = residentes.filter((r) => r.idCentro === activeSedeId);
  const residentesActivos = sedeResidentes.filter((r) => r.estado === 'Activo').length;
  const porcentajeOcupacion = Math.round((residentesActivos / (activeSede?.capacidadTotal || 40)) * 100);

  const turnoActual = turnos.find((t) => t.idCentro === activeSedeId && t.estado === 'Activo');
  const personalActivo = turnoActual ? turnoActual.trabajadoresAsignados.length : 0;
  const permisosPendientesCount = permisos.filter((p) => p.estado === 'Pendiente').length;
  const incidentesActivosCount = incidentes.filter(
    (i) => i.idCentro === activeSedeId && (i.estado === 'Abierto' || i.estado === 'En Seguimiento')
  ).length;

  const metrics: AdminDashboardMetrics = oracleMetrics || {
    totalResidentes: residentesActivos,
    capacidadTotal: activeSede?.capacidadTotal || 40,
    porcentajeOcupacion,
    personalActivoTurno: personalActivo,
    tareasCumplimiento: 100,
    incidentesActivos: incidentesActivosCount,
    permisosPendientes: permisosPendientesCount,
    alertasCriticas: incidentesActivosCount > 0 ? 1 : 0
  };

  // =========================================================================
  // ACCIONES DE NEGOCIO (Despacho JSON hacia la lógica de negocio)
  // =========================================================================

  // 1. Registrar Residente (Flujo de Admisión)
  const registrarResidente = async (
    data: Omit<Residente, 'id' | 'codigoExpediente' | 'edad'> & {
      fechaIngreso?: string;
      familiarContacto?: {
        nombres: string;
        apellidos: string;
        identificacion: string;
        parentesco: string;
        telefono: string;
        email: string;
      };
      dotacionInicial?: Array<Partial<DotacionResidente>>;
      observaciones?: string;
    }
  ): Promise<void> => {
    // Cálculo de edad
    const birth = new Date(data.fechaNacimiento);
    const today = new Date();
    let edad = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      edad--;
    }

    const newId = Date.now();
    const codigoExpediente = `RES-2025-${String(residentes.length + 1).padStart(3, '0')}`;
    const fechaIngreso = data.fechaIngreso || new Date().toISOString().split('T')[0];

    // Mapeo a IDs de catálogo requeridos por Oracle
    const idTipoIdentificacion = data.tipoIdentificacion === 'CC' ? 1 : data.tipoIdentificacion === 'CE' ? 2 : 3;
    const idGenero = data.genero === 'M' ? 1 : data.genero === 'F' ? 2 : 3;
    const idNivelMovilidad =
      data.nivelMovilidad === 'Independiente' ? 1 :
      data.nivelMovilidad === 'Asistencia Leve' ? 2 :
      data.nivelMovilidad === 'Asistencia Moderada' ? 3 : 4;
    const idTipoDieta =
      data.tipoDieta === 'Normal / General' ? 1 :
      data.tipoDieta === 'Blanda' ? 2 :
      data.tipoDieta === 'Hiposódica' ? 3 :
      data.tipoDieta === 'Diabética' ? 4 : 5;
    const idEstadoResidente =
      data.estado === 'Activo' ? 1 :
      data.estado === 'En Observación' ? 2 :
      data.estado === 'Hospitalizado' ? 3 : 4;

    const idParentesco =
      data.familiarContacto?.parentesco === 'Hijo/a' ? 1 :
      data.familiarContacto?.parentesco === 'Cónyuge' ? 2 :
      data.familiarContacto?.parentesco === 'Hermano/a' ? 3 :
      data.familiarContacto?.parentesco === 'Tutor Legal' ? 4 :
      data.familiarContacto?.parentesco === 'Sobrino/a' ? 5 : 6;

    // Payload para el paquete Oracle PKGLN_ADMISION_RESIDENTE
    const payload = {
      idCentro: data.idCentro || activeSedeId,
      idTipoIdentificacion,
      tipoIdentificacion: data.tipoIdentificacion,
      identificacion: limpiarIdentificacion(data.identificacion),
      nombres: data.nombres,
      apellidos: data.apellidos,
      fechaNacimiento: data.fechaNacimiento,
      idGenero,
      genero: data.genero,
      habitacion: data.habitacion,
      cama: data.cama,
      eps: data.eps,
      planComplementario: data.planComplementario,
      tipoSangre: data.tipoSangre,
      idNivelMovilidad,
      nivelMovilidad: data.nivelMovilidad,
      idTipoDieta,
      tipoDieta: data.tipoDieta,
      idEstadoResidente,
      fechaIngreso,
      alertasClinicas: data.alertasClinicas,
      observaciones: data.observaciones?.trim() || undefined,
      medicamentos: data.medicamentos,
      acudienteAsociado: data.familiarContacto
        ? {
            ...data.familiarContacto,
            idTipoIdentificacion: 1,
            idParentesco,
            idCanalNotifPref: 1,
            esPrincipal: true
          }
        : undefined
    };

    try {
      // Despacho a API Oracle
      await adminApi.residentes.registrarResidente(payload);

      // Si se incluyó acudiente en el formulario, registrarlo en la lista de familiares
      let acudientesAsociados = [...data.acudientes];
      if (data.familiarContacto && data.familiarContacto.nombres.trim()) {
        const nuevoFamiliarId = Date.now() + 1;
        const nuevoFamiliar: FamiliarAcudiente = {
          id: nuevoFamiliarId,
          tipoIdentificacion: 'CC',
          identificacion: limpiarIdentificacion(data.familiarContacto.identificacion),
          nombres: data.familiarContacto.nombres,
          apellidos: data.familiarContacto.apellidos,
          nombreCompleto: `${data.familiarContacto.nombres} ${data.familiarContacto.apellidos}`.trim(),
          telefonoPrincipal: data.familiarContacto.telefono,
          email: data.familiarContacto.email,
          direccion: activeSede.direccion,
          ciudad: activeSede.ciudad,
          canalNotificacionPref: 'WhatsApp',
          residentesAsociados: [
            {
              idResidente: newId,
              nombreResidente: `${data.nombres} ${data.apellidos}`.trim(),
              parentesco: data.familiarContacto.parentesco,
              esPrincipal: true,
              autorizadoSalidas: true,
              responsablePago: true
            }
          ]
        };

        setFamiliares((prev) => [nuevoFamiliar, ...prev]);

        acudientesAsociados.push({
          id: nuevoFamiliarId,
          nombreCompleto: nuevoFamiliar.nombreCompleto,
          parentesco: data.familiarContacto.parentesco,
          telefono: data.familiarContacto.telefono,
          email: data.familiarContacto.email,
          esPrincipal: true
        });
      }

      // Sincronizar censo real desde Oracle para obtener el ID asignado por la secuencia SEQ_SMY_RESIDENTES
      await sincronizarResidentes(true);
      const respCenso = await adminApi.residentes.consultarCenso(activeSede.id);
      const resCreado = respCenso?.data?.find(
        (r: any) => limpiarIdentificacion(String(r.identificacion)) === limpiarIdentificacion(data.identificacion)
      );
      const realId = resCreado ? Number(resCreado.id) : newId;

      // Crear asiento inicial en la bitácora con la distinción del registro del residente
      const textoObservacion = data.observaciones?.trim()
        ? `[REGISTRO DEL RESIDENTE]: ${data.observaciones.trim()}`
        : `[REGISTRO DEL RESIDENTE]: Admisión inicial y apertura de expediente del residente en sede ${activeSede.nombre}.`;

      const bitacoraInicial: BitacoraResidente[] = [
        {
          id: Date.now(),
          idResidente: realId,
          nombreResidente: `${data.nombres} ${data.apellidos}`.trim(),
          habitacion: data.habitacion,
          cama: data.cama,
          idUsuario: currentUser?.id || 1,
          nombreUsuario: currentUser?.nombreCompleto || 'Administrador',
          fecha: fechaIngreso || obtenerFechaBogota(),
          hora: obtenerHoraBogota(),
          idCategoriaBitacora: 1,
          categoria: 'Rutina',
          contenido: textoObservacion,
          grabadoPorVoz: false,
          visibleAcudiente: true,
          fechaCreacion: obtenerIsoBogota()
        }
      ];

      setResidentes((prev) =>
        prev.map((r) =>
          r.id === realId || r.identificacion === limpiarIdentificacion(data.identificacion)
            ? {
                ...r,
                id: realId,
                observaciones: data.observaciones?.trim(),
                bitacora: bitacoraInicial,
                archivosAdjuntos: data.archivosAdjuntos || r.archivosAdjuntos,
                fotoUrl: data.fotoUrl || r.fotoUrl
              }
            : r
        )
      );

      // Si incluye dotación inicial acordada al ingreso, registrarla con el ID real de Oracle
      if (data.dotacionInicial && data.dotacionInicial.length > 0) {
        await registrarDotacionResidente(realId, data.dotacionInicial);
      }

      showToast(`✅ Residente ${data.nombres} ${data.apellidos} guardado exitosamente en la base de datos Oracle`, 'success');
    } catch (err: any) {
      console.error('[Error registrarResidente Oracle]:', err);
      showToast(`❌ Error al guardar en base de datos Oracle: ${err.message || 'No se pudo completar la operación'}`, 'alert');
      throw err;
    }
  };

  // =========================================================================
  // FUNCIONES DE CONTROL DE DOTACIÓN E INVENTARIO (PKGLN_DOTACION_RESIDENTES)
  // =========================================================================

  const calcularSemaforo = (fechaProximo?: string | null): { semaforo: 'VIGENTE' | 'PROXIMO' | 'VENCIDO' | 'SIN_VENCIMIENTO'; dias: number | null } => {
    if (!fechaProximo) return { semaforo: 'SIN_VENCIMIENTO', dias: null };
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const prox = new Date(fechaProximo);
    prox.setHours(0, 0, 0, 0);
    const diffTime = prox.getTime() - hoy.getTime();
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (dias < 0) return { semaforo: 'VENCIDO', dias };
    if (dias <= 30) return { semaforo: 'PROXIMO', dias };
    return { semaforo: 'VIGENTE', dias };
  };

  const calcularFechaProximo = (fechaInicio: string, meses?: number | null): string | null => {
    if (!meses || meses <= 0) return null;
    const d = new Date(fechaInicio);
    d.setMonth(d.getMonth() + meses);
    return d.toISOString().split('T')[0];
  };

  const guardarElementoCatalogo = async (item: Partial<ElementoDotacionCatalogo>) => {
    try {
      await adminApi.dotacion.guardarArticuloCatalogo({
        id: item.id,
        idOrganizacion: 1,
        nombreElemento: item.nombreElemento || '',
        categoria: item.categoria,
        cantidadDefecto: item.cantidadDefecto,
        frecuenciaCambioMeses: item.frecuenciaCambioMeses,
        descripcion: item.descripcion,
        esSugeridoIngreso: item.esSugeridoIngreso ? 1 : 0,
        estado: item.estado
      }).catch(() => null);

      if (item.id) {
        setCatalogoDotacion((prev) =>
          prev.map((el) => (el.id === item.id ? ({ ...el, ...item } as ElementoDotacionCatalogo) : el))
        );
        showToast('✅ Elemento del catálogo actualizado', 'success');
      } else {
        const nuevo: ElementoDotacionCatalogo = {
          id: Date.now(),
          idOrganizacion: 1,
          nombreElemento: item.nombreElemento || '',
          categoria: item.categoria || 'General',
          cantidadDefecto: item.cantidadDefecto || 1,
          frecuenciaCambioMeses: item.frecuenciaCambioMeses ?? null,
          descripcion: item.descripcion || '',
          esSugeridoIngreso: item.esSugeridoIngreso ?? true,
          estado: item.estado || 'Activo'
        };
        setCatalogoDotacion((prev) => [...prev, nuevo]);
        showToast('✅ Nuevo artículo agregado al catálogo genérico', 'success');
      }
    } catch (err: any) {
      console.error('Error al guardar artículo de catálogo:', err);
    }
  };

  const eliminarElementoCatalogo = async (id: number) => {
    setCatalogoDotacion((prev) => prev.filter((el) => el.id !== id));
    showToast('🗑️ Elemento eliminado del catálogo', 'info');
  };

  const registrarDotacionResidente = async (idResidente: number, items: Array<Partial<DotacionResidente>>) => {
    const hoy = new Date().toISOString().split('T')[0];
    const nuevasDotaciones: DotacionResidente[] = items.map((it, idx) => {
      const fechaEntrega = it.fechaEntrega || hoy;
      const fechaProximo = calcularFechaProximo(fechaEntrega, it.frecuenciaCambioMeses);
      const { semaforo, dias } = calcularSemaforo(fechaProximo);
      return {
        id: Date.now() + idx,
        idResidente,
        idElementoCatalogo: it.idElementoCatalogo ?? null,
        nombreElemento: it.nombreElemento || 'Artículo de Dotación',
        categoria: it.categoria || 'General',
        cantidad: it.cantidad || 1,
        fechaEntrega,
        frecuenciaCambioMeses: it.frecuenciaCambioMeses ?? null,
        fechaProximoCambio: fechaProximo,
        fechaUltimoCambio: fechaEntrega,
        estadoElemento: 'Entregado',
        condicionEntrega: it.condicionEntrega || 'Nuevo',
        notas: it.notas || '',
        usuarioEntrega: 'Administrador',
        semaforoCambio: semaforo,
        diasParaCambio: dias,
        historial: []
      };
    });

    try {
      await adminApi.dotacion.registrarEntregaIngreso({
        idResidente,
        articulos: nuevasDotaciones.map((d) => ({
          idElementoCatalogo: d.idElementoCatalogo,
          nombreElemento: d.nombreElemento,
          categoria: d.categoria,
          cantidad: d.cantidad,
          frecuenciaCambioMeses: d.frecuenciaCambioMeses,
          condicionEntrega: d.condicionEntrega,
          notas: d.notas
        }))
      }).catch(() => null);
    } catch (err) {
      console.warn('Backend sync failed, stored in frontend state:', err);
    }

    setDotaciones((prev) => [...nuevasDotaciones, ...prev]);
  };

  const agregarArticuloDotacionResidente = async (idResidente: number, item: Partial<DotacionResidente>) => {
    const hoy = new Date().toISOString().split('T')[0];
    const fechaEntrega = item.fechaEntrega || hoy;
    const fechaProximo = calcularFechaProximo(fechaEntrega, item.frecuenciaCambioMeses);
    const { semaforo, dias } = calcularSemaforo(fechaProximo);
    const nueva: DotacionResidente = {
      id: Date.now(),
      idResidente,
      idElementoCatalogo: item.idElementoCatalogo ?? null,
      nombreElemento: item.nombreElemento || 'Artículo Adicional',
      categoria: item.categoria || 'General',
      cantidad: item.cantidad || 1,
      fechaEntrega,
      frecuenciaCambioMeses: item.frecuenciaCambioMeses ?? null,
      fechaProximoCambio: fechaProximo,
      fechaUltimoCambio: fechaEntrega,
      estadoElemento: 'Entregado',
      condicionEntrega: item.condicionEntrega || 'Nuevo',
      notas: item.notas || '',
      usuarioEntrega: 'Administrador',
      semaforoCambio: semaforo,
      diasParaCambio: dias,
      historial: []
    };

    try {
      await adminApi.dotacion.agregarArticuloResidente({
        idResidente,
        idElementoCatalogo: nueva.idElementoCatalogo,
        nombreElemento: nueva.nombreElemento,
        categoria: nueva.categoria,
        cantidad: nueva.cantidad,
        frecuenciaCambioMeses: nueva.frecuenciaCambioMeses,
        condicionEntrega: nueva.condicionEntrega,
        notas: nueva.notas
      }).catch(() => null);
    } catch (err) {
      console.warn('Backend sync failed, stored locally:', err);
    }

    setDotaciones((prev) => [nueva, ...prev]);
    showToast(`✅ Artículo "${nueva.nombreElemento}" entregado y asignado`, 'success');
  };

  const registrarRecambioDotacion = async (
    idDotacionResidente: number,
    cambio: { motivo: string; condicionNuevo?: string; observaciones?: string }
  ) => {
    const hoy = new Date().toISOString().split('T')[0];
    try {
      await adminApi.dotacion.registrarRecambio({
        idDotacionResidente,
        motivo: cambio.motivo,
        condicionNuevo: cambio.condicionNuevo,
        observaciones: cambio.observaciones
      }).catch(() => null);
    } catch (err) {
      console.warn('Backend sync failed, stored locally:', err);
    }

    setDotaciones((prev) =>
      prev.map((d) => {
        if (d.id !== idDotacionResidente) return d;
        const nuevoProximo = calcularFechaProximo(hoy, d.frecuenciaCambioMeses);
        const { semaforo, dias } = calcularSemaforo(nuevoProximo);
        const nuevoHistorial: HistorialCambioDotacion = {
          id: Date.now(),
          idDotacionResidente,
          fechaCambio: hoy,
          motivo: cambio.motivo,
          condicionNuevo: cambio.condicionNuevo || 'Nuevo de paquete',
          observaciones: cambio.observaciones || '',
          usuarioRegistra: 'Administrador'
        };
        return {
          ...d,
          fechaUltimoCambio: hoy,
          fechaProximoCambio: nuevoProximo,
          condicionEntrega: cambio.condicionNuevo || d.condicionEntrega,
          semaforoCambio: semaforo,
          diasParaCambio: dias,
          estadoElemento: 'Renovado',
          historial: [nuevoHistorial, ...(d.historial || [])]
        };
      })
    );
    showToast('🔄 Recambio de dotación registrado exitosamente', 'success');
  };

  const abrirSolicitarDotacion = (residente?: Residente | null) => {
    setSolicitarDotacionResidentePreseleccionado(residente || null);
    setIsSolicitarDotacionOpen(true);
  };

  const registrarSolicitudDotacion = async (payload: SolicitudDotacionPayload) => {
    const hoy = new Date().toISOString().split('T')[0];
    const itemsParaRegistrar: Array<{
      idElementoCatalogo?: number | null;
      nombreElemento: string;
      categoria: string;
      cantidad: number;
      frecuenciaCambioMeses?: number | null;
      especificaciones?: string;
      notas?: string;
    }> =
      payload.articulos && payload.articulos.length > 0
        ? payload.articulos
        : [
            {
              idElementoCatalogo: payload.idElementoCatalogo ?? null,
              nombreElemento: payload.nombreElemento || 'Artículo de Dotación',
              categoria: payload.categoria || 'General',
              cantidad: payload.cantidad || 1,
              frecuenciaCambioMeses: payload.frecuenciaCambioMeses ?? null,
              especificaciones: payload.especificaciones,
              notas: payload.notas
            }
          ];

    const nuevasDotaciones: DotacionResidente[] = itemsParaRegistrar.map((it, idx) => ({
      id: Date.now() + idx,
      idResidente: payload.idResidente,
      idElementoCatalogo: it.idElementoCatalogo ?? null,
      nombreElemento: it.nombreElemento,
      categoria: it.categoria || 'General',
      cantidad: it.cantidad || 1,
      fechaSolicitud: hoy,
      fechaRequerida: payload.fechaRequerida,
      frecuenciaCambioMeses: it.frecuenciaCambioMeses ?? null,
      estadoElemento: 'Solicitado',
      prioridad: payload.prioridad || 'Normal',
      motivoSolicitud: payload.motivoSolicitud,
      especificaciones: it.especificaciones,
      condicionEntrega: `Prioridad: ${payload.prioridad || 'Normal'}`,
      notas: [
        payload.motivoSolicitud ? `Motivo: ${payload.motivoSolicitud}` : '',
        it.especificaciones ? `Especificaciones: ${it.especificaciones}` : '',
        it.notas || payload.notas || ''
      ]
        .filter(Boolean)
        .join(' | '),
      usuarioSolicita: 'Administrador',
      semaforoCambio: 'SOLICITADO',
      historial: []
    }));

    try {
      await adminApi.dotacion.solicitarDotacionResidente({
        idResidente: payload.idResidente,
        prioridad: payload.prioridad,
        motivoSolicitud: payload.motivoSolicitud,
        fechaRequerida: payload.fechaRequerida,
        notas: payload.notas,
        articulos: itemsParaRegistrar
      }).catch(() => null);
    } catch (err) {
      console.warn('Backend sync failed, stored locally:', err);
    }

    setDotaciones((prev) => [...nuevasDotaciones, ...prev]);
    showToast(
      `📋 Solicitud de ${nuevasDotaciones.length} artículo(s) registrada exitosamente`,
      'success'
    );
    setIsSolicitarDotacionOpen(false);
  };

  const entregarDotacionSolicitada = async (
    idDotacionResidente: number,
    condicion: string = 'Nuevo de paquete',
    notasEntrega: string = 'Entrega física completada'
  ) => {
    const hoy = new Date().toISOString().split('T')[0];
    try {
      await adminApi.dotacion.entregarDotacionSolicitada({
        idDotacionResidente,
        condicionEntrega: condicion,
        notas: notasEntrega
      }).catch(() => null);
    } catch (err) {
      console.warn('Backend sync failed, stored locally:', err);
    }

    setDotaciones((prev) =>
      prev.map((d) => {
        if (d.id !== idDotacionResidente) return d;
        const nuevoProximo = calcularFechaProximo(hoy, d.frecuenciaCambioMeses);
        const { semaforo, dias } = calcularSemaforo(nuevoProximo);
        return {
          ...d,
          fechaEntrega: hoy,
          fechaUltimoCambio: hoy,
          fechaProximoCambio: nuevoProximo,
          estadoElemento: 'Entregado',
          condicionEntrega: condicion,
          semaforoCambio: semaforo,
          diasParaCambio: dias,
          usuarioEntrega: 'Administrador'
        };
      })
    );
    showToast('✅ Dotación entregada físicamente al residente', 'success');
  };

  // 2. Registrar Familiar / Acudiente
  const registrarFamiliar = async (
    data: Omit<FamiliarAcudiente, 'id' | 'nombreCompleto'> & {
      idResidenteVinculado?: number;
      parentesco?: string;
      esPrincipal?: boolean;
      fotoUrl?: string;
    }
  ) => {
    const newId = Date.now();
    const nombreCompleto = `${data.nombres} ${data.apellidos}`.trim();
    const esPrincipal = data.esPrincipal ?? true;

    let residentesAsociados = [...data.residentesAsociados];
    if (data.idResidenteVinculado && data.parentesco) {
      const res = residentes.find((r) => r.id === data.idResidenteVinculado);
      if (res) {
        residentesAsociados.push({
          idResidente: res.id,
          nombreResidente: res.nombreCompleto,
          parentesco: data.parentesco,
          esPrincipal,
          autorizadoSalidas: true,
          responsablePago: true
        });

        // Actualizar el residente con el acudiente
        setResidentes((prev) =>
          prev.map((r) =>
            r.id === res.id
              ? {
                  ...r,
                  acudientes: [
                    ...r.acudientes,
                    {
                      id: newId,
                      nombreCompleto,
                      parentesco: data.parentesco || 'Familiar',
                      telefono: data.telefonoPrincipal,
                      email: data.email,
                      esPrincipal
                    }
                  ]
                }
              : r
          )
        );
      }
    }

    // Mapeo de catálogos requeridos por Oracle PKGLN_GESTION_FAMILIARES
    const idTipoIdentificacion = data.tipoIdentificacion === 'CC' ? 1 : data.tipoIdentificacion === 'CE' ? 2 : 3;
    const idCanalNotifPref =
      data.canalNotificacionPref === 'Correo' ? 2 :
      data.canalNotificacionPref === 'Push App' ? 3 :
      data.canalNotificacionPref === 'Llamada' ? 4 : 1;

    let idParentesco = 1;
    const par = (data.parentesco || '').toLowerCase();
    if (par.includes('cónyuge') || par.includes('conyuge')) idParentesco = 2;
    else if (par.includes('herman')) idParentesco = 3;
    else if (par.includes('tutor')) idParentesco = 4;
    else if (par.includes('sobrin')) idParentesco = 5;
    else if (par.includes('otro')) idParentesco = 6;
    else idParentesco = 1;

    // Solo enviar idResidente si es un ID válido de la base de datos (< 1000000)
    const validIdResidente =
      data.idResidenteVinculado && Number(data.idResidenteVinculado) < 1000000
        ? Number(data.idResidenteVinculado)
        : undefined;

    // Payload para el paquete Oracle PKGLN_GESTION_FAMILIARES
    const payload = {
      idTipoIdentificacion,
      tipoIdentificacion: data.tipoIdentificacion,
      identificacion: limpiarIdentificacion(data.identificacion),
      nombres: data.nombres,
      apellidos: data.apellidos,
      telefonoPrincipal: data.telefonoPrincipal,
      telefonoSecundario: data.telefonoSecundario,
      email: data.email,
      direccion: data.direccion,
      ciudad: data.ciudad,
      idCanalNotifPref,
      canalNotificacionPref: data.canalNotificacionPref,
      idResidente: validIdResidente,
      idParentesco,
      parentesco: data.parentesco,
      esPrincipal: esPrincipal ? 1 : 0,
      autorizadoSalidas: 1,
      responsablePago: 1
    };

    try {
      await adminApi.familiares.registrarFamiliar(payload);

      // Obtener el ID numérico real generado por la secuencia Oracle en lugar de Date.now()
      let realId = newId;
      try {
        const respFam = await adminApi.familiares.consultarFamiliares(activeSede.id);
        if (respFam && respFam.data) {
          const identBuscada = limpiarIdentificacion(data.identificacion);
          const matching = respFam.data.find(
            (f: any) =>
              (identBuscada && limpiarIdentificacion(String(f.identificacion)) === identBuscada) ||
              (f.email && data.email && f.email.toLowerCase() === data.email.toLowerCase())
          );
          if (matching && matching.id) {
            realId = Number(matching.id);
          }
        }
      } catch (e) {
        console.warn('Error resolviendo ID real del familiar registrado:', e);
      }

      const nuevoFamiliar: FamiliarAcudiente = {
        ...data,
        id: realId,
        nombreCompleto,
        residentesAsociados,
        fotoUrl: data.fotoUrl
      };

      setFamiliares((prev) => [nuevoFamiliar, ...prev]);

      // Si se vinculó a un residente, actualizar el ID del acudiente en el residente
      if (data.idResidenteVinculado && realId !== newId) {
        setResidentes((prev) =>
          prev.map((r) =>
            r.id === data.idResidenteVinculado
              ? {
                  ...r,
                  acudientes: r.acudientes.map((a) => (a.id === newId ? { ...a, id: realId } : a))
                }
              : r
          )
        );
      }

      showToast(`✅ Familiar ${nombreCompleto} registrado exitosamente en la base de datos Oracle`, 'success');
    } catch (err: any) {
      console.error('[Error registrarFamiliar Oracle]:', err);
      showToast(`❌ Error al registrar familiar en Oracle: ${err.message || 'Fallo de inserción'}`, 'alert');
      throw err;
    }
  };

  // 3. Registrar Trabajador / Empleado
  const registrarTrabajador = async (
    data: Omit<TrabajadorEmpleado, 'id' | 'nombreCompleto' | 'fechaContratacion'>
  ) => {
    const newId = Date.now();
    const nombreCompleto = `${data.nombres} ${data.apellidos}`.trim();
    const fechaContratacion = new Date().toISOString().split('T')[0];

    // Payload para el paquete Oracle PKGLN_TALENTO_HUMANO
    const payload = {
      idCentro: data.idCentro || activeSedeId,
      tipoIdentificacion: data.tipoIdentificacion,
      identificacion: limpiarIdentificacion(data.identificacion),
      nombres: data.nombres,
      apellidos: data.apellidos,
      cargo: data.cargo,
      area: data.area,
      unidadAsignada: data.unidadAsignada,
      telefono: data.telefono,
      emailCorp: data.email,
      fechaContratacion,
      tipoContrato: data.tipoContrato,
      eps: data.eps,
      arl: data.arl,
      turnoHabitual: data.turnoHabitual
    };

    await adminApi.trabajadores.registrarTrabajador(payload);

    const nuevoTrabajador: TrabajadorEmpleado = {
      ...data,
      id: newId,
      nombreCompleto,
      fechaContratacion
    };

    setTrabajadores((prev) => [nuevoTrabajador, ...prev]);
    showToast(`Colaborador ${nombreCompleto} registrado en Talento Humano`, 'success');
  };

  // 4. Actualizar Estado de Trabajador
  const actualizarEstadoTrabajador = async (
    idTrabajador: number,
    nuevoEstado: 'Activo' | 'En Permiso' | 'Inactivo'
  ) => {
    const estadoId = nuevoEstado === 'Activo' ? 1 : nuevoEstado === 'En Permiso' ? 2 : 3;

    await adminApi.trabajadores.actualizarEstadoTrabajador({
      idTrabajador,
      idEstadoEmpleado: estadoId
    });

    setTrabajadores((prev) =>
      prev.map((t) => (t.id === idTrabajador ? { ...t, estado: nuevoEstado } : t))
    );

    showToast(`Estado del trabajador actualizado a ${nuevoEstado}`, 'info');
  };

  // 5. Asignar Trabajador a Turno
  const asignarTrabajadorATurno = async (idTurno: number, idTrabajador: number) => {
    const trabajador = trabajadores.find((t) => t.id === idTrabajador);
    if (!trabajador) return;

    await adminApi.turnos.asignarTurno({
      idCentro: activeSedeId,
      idTrabajador,
      idTurno,
      fechaTurno: new Date().toISOString().split('T')[0]
    });

    setTurnos((prev) =>
      prev.map((t) => {
        if (t.id !== idTurno) return t;
        const yaExiste = t.trabajadoresAsignados.some((w) => w.idTrabajador === idTrabajador);
        if (yaExiste) return t;

        const updatedWorkers = [
          ...t.trabajadoresAsignados,
          {
            idTrabajador: trabajador.id,
            nombre: trabajador.nombreCompleto,
            cargo: trabajador.cargo,
            area: trabajador.area,
            avatarUrl: trabajador.avatarUrl
          }
        ];

        // Verificar cobertura
        const cumpleCobertura = updatedWorkers.length >= t.coberturaMinimaRequerida;

        return {
          ...t,
          trabajadoresAsignados: updatedWorkers,
          alertas: cumpleCobertura ? undefined : t.alertas
        };
      })
    );

    showToast(`${trabajador.nombreCompleto} asignado al turno exitosamente`, 'success');
  };

  // 5.1 Programar Turnos por Rango de Fechas
  const programarTurnosRango = async (payload: ProgramarTurnosRangoPayload): Promise<{ turnosGenerados: number; asignacionesGeneradas: number }> => {
    const {
      idCentro,
      idTurnoPlantilla,
      nombreTurno,
      tipo,
      horario,
      coberturaMinimaRequerida,
      idsTrabajadores,
      fechaInicio,
      fechaFin,
      diasSemana,
      area,
      observaciones
    } = payload;

    const [yStart, mStart, dStart] = fechaInicio.split('-').map(Number);
    const [yEnd, mEnd, dEnd] = fechaFin.split('-').map(Number);
    const start = new Date(yStart, mStart - 1, dStart);
    const end = new Date(yEnd, mEnd - 1, dEnd);
    const fechasValidas: string[] = [];

    const curr = new Date(start);
    while (curr <= end) {
      const dayOfWeek = curr.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
      if (diasSemana.includes(dayOfWeek)) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        fechasValidas.push(`${y}-${m}-${d}`);
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (fechasValidas.length === 0) {
      throw new Error('No hay fechas en el rango seleccionado que coincidan con los días elegidos de la semana.');
    }

    const colaboradores = trabajadores.filter((t) => idsTrabajadores.includes(t.id));
    if (colaboradores.length === 0) {
      throw new Error('Debe seleccionar al menos un colaborador activo para asignar turnos.');
    }

    const turnoPlantillaId = idTurnoPlantilla || (tipo === 'Mañana' ? 301 : tipo === 'Tarde' ? 302 : 303);
    let totalAsignaciones = 0;

    // Despacho a Oracle para cada asignación individual
    for (const fecha of fechasValidas) {
      for (const colab of colaboradores) {
        try {
          await adminApi.turnos.asignarTurno({
            idCentro,
            idTrabajador: colab.id,
            idTurno: turnoPlantillaId,
            fechaTurno: fecha,
            observaciones: observaciones || `Asignación programada rango ${fechaInicio} a ${fechaFin}`
          });
          totalAsignaciones++;
        } catch (err) {
          console.warn(`[programarTurnosRango] Aviso Oracle al asignar ${colab.id} en ${fecha}:`, err);
        }
      }
    }

    // Actualización de estado en caliente
    setTurnos((prevTurnos) => {
      let turnosActualizados = [...prevTurnos];

      for (const fecha of fechasValidas) {
        const turnoExistenteIndex = turnosActualizados.findIndex(
          (t) => t.idCentro === idCentro && t.fecha === fecha && t.tipo === tipo
        );

        if (turnoExistenteIndex >= 0) {
          const turnoExistente = turnosActualizados[turnoExistenteIndex];
          const yaAsignadosIds = new Set(turnoExistente.trabajadoresAsignados.map((w) => w.idTrabajador));
          
          const nuevosParaTurno = colaboradores
            .filter((c) => !yaAsignadosIds.has(c.id))
            .map((c) => ({
              idTrabajador: c.id,
              nombre: c.nombreCompleto,
              cargo: c.cargo,
              area: c.area,
              avatarUrl: c.avatarUrl
            }));

          if (nuevosParaTurno.length > 0) {
            const updatedWorkers = [...turnoExistente.trabajadoresAsignados, ...nuevosParaTurno];
            const cumple = updatedWorkers.length >= turnoExistente.coberturaMinimaRequerida;
            turnosActualizados[turnoExistenteIndex] = {
              ...turnoExistente,
              trabajadoresAsignados: updatedWorkers,
              alertas: cumple ? undefined : turnoExistente.alertas,
              area: area || turnoExistente.area,
              observaciones: observaciones || turnoExistente.observaciones
            };
          }
        } else {
          const nuevoTurnoId = Date.now() + Math.floor(Math.random() * 100000) + turnosActualizados.length;
          const trabajadoresList = colaboradores.map((c) => ({
            idTrabajador: c.id,
            nombre: c.nombreCompleto,
            cargo: c.cargo,
            area: c.area,
            avatarUrl: c.avatarUrl
          }));
          const cumple = trabajadoresList.length >= coberturaMinimaRequerida;

          turnosActualizados.push({
            id: nuevoTurnoId,
            idCentro,
            nombre: nombreTurno,
            tipo,
            horario,
            fecha,
            coberturaMinimaRequerida,
            trabajadoresAsignados: trabajadoresList,
            estado: cumple ? 'Programado' : 'Alerta Cobertura',
            alertas: cumple ? undefined : `Alerta: Se requieren ${coberturaMinimaRequerida - trabajadoresList.length} persona(s) adicional(es).`,
            area: area || 'Asistencial',
            observaciones
          });
        }
      }

      return turnosActualizados;
    });

    showToast(
      `Se programaron exitosamente ${fechasValidas.length} días de turnos para ${colaboradores.length} colaborador(es).`,
      'success'
    );

    return {
      turnosGenerados: fechasValidas.length,
      asignacionesGeneradas: totalAsignaciones || (fechasValidas.length * colaboradores.length)
    };
  };

  const desasignarTrabajadorDeTurno = async (idTurno: number, idTrabajador: number) => {
    setTurnos((prev) =>
      prev.map((t) => {
        if (t.id !== idTurno) return t;
        const updatedWorkers = t.trabajadoresAsignados.filter((w) => w.idTrabajador !== idTrabajador);
        const cumple = updatedWorkers.length >= t.coberturaMinimaRequerida;
        return {
          ...t,
          trabajadoresAsignados: updatedWorkers,
          alertas: cumple ? undefined : `Alerta: Se requieren ${t.coberturaMinimaRequerida - updatedWorkers.length} persona(s) adicional(es).`,
          estado: cumple ? t.estado : 'Alerta Cobertura'
        };
      })
    );
    showToast('Colaborador desasignado del turno.', 'info');
  };

  // 6. Gestionar Permisos
  const aprobarPermiso = async (idPermiso: number, comentarios: string) => {
    try {
      await adminApi.permisos.gestionarSolicitud({
        idSolicitud: idPermiso,
        idEstadoPermiso: 2, // Aprobado
        comentariosAdmin: comentarios
      });
    } catch (err) {
      console.warn('Aprobación de permiso en backend Oracle no completado (modo local/offline activo):', err);
    }

    const permiso = permisos.find((p) => p.id === idPermiso);
    if (permiso) {
      // Actualizar estado del trabajador a 'En Permiso'
      setTrabajadores((prev) =>
        prev.map((t) => (t.id === permiso.idTrabajador ? { ...t, estado: 'En Permiso' } : t))
      );
    }

    setPermisos((prev) =>
      prev.map((p) =>
        p.id === idPermiso ? { ...p, estado: 'Aprobado', comentariosAdmin: comentarios } : p
      )
    );

    showToast('Solicitud de permiso aprobada', 'success');
  };

  const rechazarPermiso = async (idPermiso: number, comentarios: string) => {
    try {
      await adminApi.permisos.gestionarSolicitud({
        idSolicitud: idPermiso,
        idEstadoPermiso: 3, // Rechazado
        comentariosAdmin: comentarios
      });
    } catch (err) {
      console.warn('Rechazo de permiso en backend Oracle no completado (modo local/offline activo):', err);
    }

    setPermisos((prev) =>
      prev.map((p) =>
        p.id === idPermiso ? { ...p, estado: 'Rechazado', comentariosAdmin: comentarios } : p
      )
    );

    showToast('Solicitud de permiso rechazada', 'alert');
  };

  const registrarPermiso = async (
    nuevoPermiso: Omit<PermisoAusencia, 'id' | 'fechaSolicitud'> & { fechaSolicitud?: string }
  ) => {
    const newId = Math.max(0, ...permisos.map((p) => p.id)) + 1;
    const fechaSolicitud = nuevoPermiso.fechaSolicitud || new Date().toISOString().split('T')[0];

    const registroCompleto: PermisoAusencia = {
      ...nuevoPermiso,
      id: newId,
      fechaSolicitud
    };

    // Mapeo a IDs de catálogo requeridos por Oracle
    const tipoMap: Record<string, number> = {
      'Vacaciones': 1,
      'Incapacidad Médica': 2,
      'Permiso Personal': 3,
      'Licencia': 5
    };

    const idTipoPermiso = tipoMap[nuevoPermiso.tipo] || 3;
    const idEstadoPermiso =
      nuevoPermiso.estado === 'Aprobado' ? 2 : nuevoPermiso.estado === 'Rechazado' ? 3 : 1;

    try {
      await adminApi.permisos.registrarPermiso({
        idTrabajador: nuevoPermiso.idTrabajador,
        idTipoPermiso,
        fechaInicio: nuevoPermiso.fechaInicio,
        fechaFin: nuevoPermiso.fechaFin,
        motivo: nuevoPermiso.motivo,
        urlSoporte: nuevoPermiso.soporteUrl,
        idArchivoSoporte: nuevoPermiso.idArchivoSoporte || nuevoPermiso.idArchivo,
        idArchivo: nuevoPermiso.idArchivoSoporte || nuevoPermiso.idArchivo,
        idEstadoPermiso,
        observacionesAdmin: nuevoPermiso.comentariosAdmin
      });
    } catch (err) {
      console.warn('Registro de permiso en backend Oracle no completado (modo local/offline activo):', err);
    }

    // Si se crea en estado 'Aprobado', cambiar estado del colaborador a 'En Permiso'
    if (nuevoPermiso.estado === 'Aprobado') {
      setTrabajadores((prev) =>
        prev.map((t) => (t.id === nuevoPermiso.idTrabajador ? { ...t, estado: 'En Permiso' } : t))
      );
    }

    setPermisos((prev) => [registroCompleto, ...prev]);
    showToast('Novedad de personal registrada exitosamente', 'success');
  };

  // 7. Actualizar Residente
  const actualizarResidente = async (
    idResidente: number,
    data: Partial<Residente> & { observacionCambioEstado?: string; idUsuario?: number }
  ) => {
    let idReal = idResidente;
    const resActual = residentes.find((r) => r.id === idResidente);

    // Si el ID proviene de Date.now() (excede los 9-10 dígitos de NUMBER(10) en Oracle)
    if (idReal > 999999999) {
      try {
        const respCenso = await adminApi.residentes.consultarCenso(activeSede.id);
        if (respCenso && respCenso.data) {
          const identBuscada = limpiarIdentificacion(String(data.identificacion || resActual?.identificacion || ''));
          if (identBuscada) {
            const matching = respCenso.data.find(
              (r: any) => limpiarIdentificacion(String(r.identificacion)) === identBuscada
            );
            if (matching && matching.id) {
              idReal = Number(matching.id);
            }
          }
        }
      } catch (e) {
        console.warn('Error resolviendo ID real del residente:', e);
      }
    }

    // Mapeo canónico a SMY_ESTADOS_RESIDENTES:
    // 1: ACTIVO, 2: EGRESADO, 3: HOSPITALIZADO, 4: FALLECIDO, 5: EN OBSERVACION
    let idEstadoResidenteNum: number | undefined = undefined;
    if (data.estado) {
      switch (data.estado) {
        case 'Activo':
          idEstadoResidenteNum = 1;
          break;
        case 'Egresado':
          idEstadoResidenteNum = 2;
          break;
        case 'Hospitalizado':
          idEstadoResidenteNum = 3;
          break;
        case 'En Observación':
          idEstadoResidenteNum = 5;
          break;
        default:
          idEstadoResidenteNum = 1;
      }
    }

    const payload = {
      idResidente: idReal,
      nombres: data.nombres,
      apellidos: data.apellidos,
      identificacion: data.identificacion ? limpiarIdentificacion(data.identificacion) : undefined,
      idTipoIdentificacion: data.tipoIdentificacion === 'CC' ? 1 : 2,
      fechaNacimiento: data.fechaNacimiento,
      idGenero: data.genero === 'F' ? 2 : 1,
      eps: data.eps,
      planComplementario: data.planComplementario,
      tipoSangre: data.tipoSangre,
      habitacion: data.habitacion,
      cama: data.cama,
      idNivelMovilidad: data.nivelMovilidad
        ? data.nivelMovilidad === 'Independiente'
          ? 1
          : data.nivelMovilidad === 'Asistencia Leve'
          ? 2
          : data.nivelMovilidad === 'Asistencia Moderada'
          ? 3
          : 4
        : undefined,
      idTipoDieta: data.tipoDieta
        ? data.tipoDieta === 'Normal / General'
          ? 1
          : data.tipoDieta === 'Blanda'
          ? 2
          : data.tipoDieta === 'Hiposódica'
          ? 3
          : data.tipoDieta === 'Diabética'
          ? 4
          : 5
        : undefined,
      alertasClinicas: data.alertasClinicas,
      fechaIngreso: data.fechaIngreso,
      idEstadoResidente: idEstadoResidenteNum,
      estado: data.estado,
      nombreEstado: data.estado,
      medicamentos: data.medicamentos,
      observacionCambioEstado: data.observacionCambioEstado?.trim() || undefined,
      idUsuario: data.idUsuario || currentUser?.id || 1
    };

    try {
      await adminApi.residentes.actualizarResidente(payload);

      const hayCambioEstado = Boolean(data.estado && resActual && data.estado !== resActual.estado);
      const obsTexto = data.observacionCambioEstado?.trim();

      const nuevaNotaBitacora: BitacoraResidente | null = hayCambioEstado && resActual ? {
        id: Date.now(),
        idResidente: idReal,
        nombreResidente: resActual.nombreCompleto,
        habitacion: data.habitacion || resActual.habitacion,
        cama: data.cama || resActual.cama,
        idUsuario: currentUser?.id || 1,
        nombreUsuario: currentUser?.nombreCompleto || 'Administrador',
        fecha: obtenerFechaBogota(),
        hora: obtenerHoraBogota(),
        idCategoriaBitacora: 1,
        categoria: 'Novedad Administrativa',
        contenido: `[CAMBIO DE ESTADO]: De "${resActual.estado}" a "${data.estado}".${obsTexto ? ` Observación: ${obsTexto}` : ''}`,
        grabadoPorVoz: false,
        visibleAcudiente: true,
        fechaCreacion: obtenerIsoBogota()
      } : null;

      setResidentes((prev) =>
        prev.map((r) => {
          if (r.id !== idResidente && r.id !== idReal) return r;
          const nombreCompleto =
            data.nombres && data.apellidos
              ? `${data.nombres} ${data.apellidos}`.trim()
              : data.nombres || data.apellidos
              ? `${data.nombres || r.nombres} ${data.apellidos || r.apellidos}`.trim()
              : r.nombreCompleto;

          let edad = r.edad;
          if (data.fechaNacimiento) {
            const birth = new Date(data.fechaNacimiento);
            const today = new Date();
            edad = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
              edad--;
            }
          }

          const bitacoraActualizada = nuevaNotaBitacora
            ? [nuevaNotaBitacora, ...(r.bitacora || [])]
            : r.bitacora;

          return {
            ...r,
            ...data,
            id: idReal,
            nombreCompleto,
            edad,
            fechaIngreso: data.fechaIngreso || r.fechaIngreso,
            estado: data.estado || r.estado,
            medicamentos: data.medicamentos !== undefined ? data.medicamentos : r.medicamentos,
            bitacora: bitacoraActualizada
          };
        })
      );

      setSelectedResidente((prev) => {
        if (!prev || (prev.id !== idResidente && prev.id !== idReal)) return prev;
        const nombreCompleto =
          data.nombres && data.apellidos
            ? `${data.nombres} ${data.apellidos}`.trim()
            : prev.nombreCompleto;
        const bitacoraActualizada = nuevaNotaBitacora
          ? [nuevaNotaBitacora, ...(prev.bitacora || [])]
          : prev.bitacora;
        return { ...prev, ...data, id: idReal, nombreCompleto, bitacora: bitacoraActualizada };
      });

      showToast('✅ Cambios del residente guardados exitosamente en Oracle', 'success');
      sincronizarResidentes(true).catch(() => {});
    } catch (err: any) {
      console.error('[Error actualizarResidente Oracle]:', err);
      showToast(`❌ Error al actualizar en base de datos Oracle: ${err.message || 'Fallo de actualización'}`, 'alert');
      throw err;
    }
  };

  // 7.1 Cargar Bitácora del Residente desde Oracle (SMY_BITACORA_RESIDENTE)
  const cargarBitacoraResidente = async (idResidente: number): Promise<BitacoraResidente[]> => {
    let idReal = idResidente;
    const resActual = residentes.find((r) => r.id === idResidente);
    if (idReal > 999999999) {
      try {
        const respCenso = await adminApi.residentes.consultarCenso(activeSede.id);
        if (respCenso && respCenso.data) {
          const identBuscada = limpiarIdentificacion(String(resActual?.identificacion || ''));
          if (identBuscada) {
            const matching = respCenso.data.find(
              (r: any) => limpiarIdentificacion(String(r.identificacion)) === identBuscada
            );
            if (matching && matching.id) {
              idReal = Number(matching.id);
            }
          }
        }
      } catch (e) {
        console.warn('Error resolviendo ID real del residente para bitácora:', e);
      }
    }

    try {
      const resp = await adminApi.residentes.consultarBitacora(idReal);
      if (resp && resp.success && Array.isArray(resp.data)) {
        const bitacoraMapeada: BitacoraResidente[] = resp.data.map((b: any) => ({
          id: Number(b.id),
          idResidente: Number(b.idResidente) || idReal,
          nombreResidente: b.nombreResidente || resActual?.nombreCompleto || '',
          habitacion: b.habitacion || resActual?.habitacion || '',
          cama: b.cama || resActual?.cama || '',
          idEmpleado: b.idEmpleado ? Number(b.idEmpleado) : undefined,
          nombreEmpleado: b.nombreEmpleado,
          idUsuario: Number(b.idUsuario) || 1,
          nombreUsuario: b.nombreUsuario || 'Usuario del Sistema',
          fecha: b.fecha ? String(b.fecha).slice(0, 10) : obtenerFechaBogota(),
          hora: b.hora || obtenerHoraBogota(),
          idCategoriaBitacora: Number(b.idCategoriaBitacora) || 1,
          categoria: b.categoria || 'Rutina',
          contenido: b.contenido || '',
          grabadoPorVoz: b.grabadoPorVoz === 'S' || b.grabadoPorVoz === true,
          visibleAcudiente: b.visibleAcudiente === 'S' || b.visibleAcudiente === true,
          fechaCreacion: b.fechaCreacion || obtenerIsoBogota()
        }));

        setResidentes((prev) =>
          prev.map((r) =>
            r.id === idResidente || r.id === idReal
              ? { ...r, bitacora: bitacoraMapeada }
              : r
          )
        );

        setSelectedResidente((prev) =>
          prev && (prev.id === idResidente || prev.id === idReal)
            ? { ...prev, bitacora: bitacoraMapeada }
            : prev
        );

        return bitacoraMapeada;
      }
    } catch (err) {
      console.error('[AdminContext] Error al consultar bitácora desde Oracle:', err);
    }
    return resActual?.bitacora || [];
  };

  // 8. Actualizar Trabajador
  const actualizarTrabajador = async (idTrabajador: number, data: Partial<TrabajadorEmpleado>) => {
    const payload = {
      idTrabajador,
      nombres: data.nombres,
      apellidos: data.apellidos,
      identificacion: data.identificacion ? limpiarIdentificacion(data.identificacion) : undefined,
      idTipoIdentificacion: data.tipoIdentificacion === 'CC' ? 1 : 2,
      idCargoEmpleado: 1,
      idAreaEmpleado: 1,
      unidadAsignada: data.unidadAsignada,
      telefono: data.telefono,
      emailCorp: data.email,
      idEstadoEmpleado: data.estado === 'Activo' ? 1 : data.estado === 'En Permiso' ? 2 : 3
    };

    await adminApi.trabajadores.actualizarTrabajador(payload);

    let updatedNombreCompleto = '';

    setTrabajadores((prev) =>
      prev.map((t) => {
        if (t.id !== idTrabajador) return t;
        const nombreCompleto =
          data.nombres && data.apellidos
            ? `${data.nombres} ${data.apellidos}`.trim()
            : data.nombres || data.apellidos
            ? `${data.nombres || t.nombres} ${data.apellidos || t.apellidos}`.trim()
            : t.nombreCompleto;
        updatedNombreCompleto = nombreCompleto;
        return {
          ...t,
          ...data,
          nombreCompleto
        };
      })
    );

    // Sincronizar de inmediato los turnos donde este trabajador esté asignado
    setTurnos((prevTurnos) =>
      prevTurnos.map((turno) => ({
        ...turno,
        trabajadoresAsignados: turno.trabajadoresAsignados.map((w) => {
          if (w.idTrabajador !== idTrabajador) return w;
          return {
            ...w,
            nombre: updatedNombreCompleto || (data.nombres ? `${data.nombres} ${data.apellidos || ''}`.trim() : w.nombre),
            cargo: data.cargo || w.cargo,
            area: data.area || w.area,
            avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : w.avatarUrl
          };
        })
      }))
    );

    showToast('Información del colaborador actualizada exitosamente', 'success');
  };

  // 9. Actualizar Familiar
  const actualizarFamiliar = async (
    idFamiliar: number,
    data: Partial<FamiliarAcudiente> & { esPrincipal?: boolean }
  ) => {
    let idReal = idFamiliar;
    // Si el ID proviene de Date.now() (excede los 9-10 dígitos de NUMBER(10) en Oracle)
    if (idReal > 999999999) {
      try {
        const respFam = await adminApi.familiares.consultarFamiliares(activeSede.id);
        if (respFam && respFam.data) {
          const famActual = familiares.find((f) => f.id === idFamiliar);
          const identBuscada = limpiarIdentificacion(String(data.identificacion || famActual?.identificacion || ''));
          const emailBuscado = (data.email || famActual?.email || '').toLowerCase();
          const matching = respFam.data.find(
            (f: any) =>
              (identBuscada && limpiarIdentificacion(String(f.identificacion)) === identBuscada) ||
              (f.email && emailBuscado && f.email.toLowerCase() === emailBuscado)
          );
          if (matching && matching.id) {
            idReal = Number(matching.id);
          }
        }
      } catch (e) {
        console.warn('Error resolviendo ID real del familiar:', e);
      }
    }

    const payload = {
      idAcudiente: idReal,
      nombres: data.nombres,
      apellidos: data.apellidos,
      identificacion: data.identificacion ? limpiarIdentificacion(data.identificacion) : undefined,
      idTipoIdentificacion: data.tipoIdentificacion === 'CC' ? 1 : 2,
      telefonoPrincipal: data.telefonoPrincipal,
      telefonoSecundario: data.telefonoSecundario,
      email: data.email,
      direccion: data.direccion,
      ciudad: data.ciudad,
      idCanalNotifPref:
        data.canalNotificacionPref === 'WhatsApp'
          ? 1
          : data.canalNotificacionPref === 'Correo'
          ? 2
          : data.canalNotificacionPref === 'Llamada'
          ? 3
          : 4
    };

    await adminApi.familiares.actualizarFamiliar(payload);

    const nombreCompleto =
      data.nombres && data.apellidos
        ? `${data.nombres} ${data.apellidos}`.trim()
        : data.nombres || data.apellidos
        ? `${data.nombres || ''} ${data.apellidos || ''}`.trim()
        : undefined;

    setFamiliares((prev) =>
      prev.map((f) => {
        if (f.id !== idFamiliar && f.id !== idReal) return f;
        const updatedResidentesAsociados =
          data.esPrincipal !== undefined
            ? f.residentesAsociados.map((ra) => ({ ...ra, esPrincipal: data.esPrincipal! }))
            : f.residentesAsociados;

        return {
          ...f,
          ...data,
          id: idReal,
          residentesAsociados: updatedResidentesAsociados,
          nombreCompleto:
            nombreCompleto ||
            (data.nombres || data.apellidos
              ? `${data.nombres || f.nombres} ${data.apellidos || f.apellidos}`.trim()
              : f.nombreCompleto)
        };
      })
    );

    setResidentes((prev) =>
      prev.map((r) => ({
        ...r,
        acudientes: r.acudientes.map((a) => {
          if (a.id !== idFamiliar && a.id !== idReal) return a;
          return {
            ...a,
            id: idReal,
            nombreCompleto: nombreCompleto || a.nombreCompleto,
            telefono: data.telefonoPrincipal || a.telefono,
            email: data.email || a.email,
            esPrincipal: data.esPrincipal !== undefined ? data.esPrincipal : a.esPrincipal
          };
        })
      }))
    );

    setSelectedResidente((curr) => {
      if (!curr) return null;
      return {
        ...curr,
        acudientes: curr.acudientes.map((a) => {
          if (a.id !== idFamiliar && a.id !== idReal) return a;
          return {
            ...a,
            id: idReal,
            nombreCompleto: nombreCompleto || a.nombreCompleto,
            telefono: data.telefonoPrincipal || a.telefono,
            email: data.email || a.email,
            esPrincipal: data.esPrincipal !== undefined ? data.esPrincipal : a.esPrincipal
          };
        })
      };
    });

    showToast('Información del familiar/acudiente actualizada exitosamente', 'success');
  };

  // 10. Eliminar Familiar
  const eliminarFamiliar = async (idFamiliar: number) => {
    let idReal = idFamiliar;
    const fam = familiares.find((f) => f.id === idFamiliar);
    const nombreBuscado = fam?.nombreCompleto;
    const identBuscada = fam ? limpiarIdentificacion(fam.identificacion) : '';

    if (idReal > 999999999) {
      if (fam) {
        try {
          const respFam = await adminApi.familiares.consultarFamiliares(activeSede.id);
          if (respFam && respFam.data) {
            const matching = respFam.data.find(
              (f: any) =>
                (identBuscada && limpiarIdentificacion(String(f.identificacion)) === identBuscada) ||
                (f.email && fam.email && f.email.toLowerCase() === fam.email.toLowerCase())
            );
            if (matching && matching.id) {
              idReal = Number(matching.id);
            }
          }
        } catch (e) {
          console.warn('Error resolviendo ID real para eliminar:', e);
        }
      }
    }

    await adminApi.familiares.eliminarFamiliar({ idAcudiente: idReal });

    setFamiliares((prev) =>
      prev.filter(
        (f) =>
          f.id !== idFamiliar &&
          f.id !== idReal &&
          (!identBuscada || limpiarIdentificacion(f.identificacion) !== identBuscada)
      )
    );
    setResidentes((prev) =>
      prev.map((r) => ({
        ...r,
        acudientes: r.acudientes.filter(
          (a) =>
            a.id !== idFamiliar &&
            a.id !== idReal &&
            (!nombreBuscado || a.nombreCompleto !== nombreBuscado)
        )
      }))
    );

    setSelectedResidente((curr) => {
      if (!curr) return null;
      return {
        ...curr,
        acudientes: curr.acudientes.filter(
          (a) =>
            a.id !== idFamiliar &&
            a.id !== idReal &&
            (!nombreBuscado || a.nombreCompleto !== nombreBuscado)
        )
      };
    });

    showToast('Familiar / Acudiente eliminado exitosamente', 'info');
  };

  // 11. Actualizar Sede y Camas
  const actualizarSede = async (idCentro: number, data: Partial<SedeCentro>) => {
    try {
      await adminApi.sedes.actualizarSede({
        idCentro,
        capacidadTotal: data.capacidadTotal,
        nombre: data.nombre,
        direccion: data.direccion,
        telefono: data.telefono
      });
    } catch (e) {
      // Ignorar si api offline
    }

    setSedes((prev) => {
      const updated = prev.map((s) => (s.id === idCentro ? { ...s, ...data } : s));
      localStorage.setItem('samanya_admin_sedes', JSON.stringify(updated));
      return updated;
    });

    showToast('Configuración de la sede actualizada exitosamente', 'success');
  };

  // 12. Métodos del Módulo de Inventario y Almacén Multisede
  const registrarMovimientoStock = async (payload: RegistrarMovimientoPayload): Promise<boolean> => {
    try {
      const fechaActual = `${obtenerFechaBogota()} ${obtenerHoraBogota()}:00`;
      const docNumero = `INV-${payload.tipoMovimiento.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
      const bodega = bodegasSede.find(b => b.id === payload.idBodega) || bodegasSede[0];
      const centro = sedes.find(s => s.id === payload.idCentro) || activeSede;
      const residenteObj = payload.idResidente ? residentes.find(r => r.id === payload.idResidente) : undefined;

      const detallesGenerados: MovimientoInvDetalle[] = [];
      let nuevoStock = [...inventarioStock];

      for (const item of payload.detalles) {
        const art = articulosCatalogo.find(a => a.id === item.idArticulo);
        let stockItem = nuevoStock.find(
          s => s.idCentro === payload.idCentro && s.idBodega === payload.idBodega && s.idArticulo === item.idArticulo
        );

        const saldoAnt = stockItem ? stockItem.cantidadDisponible : 0;
        let saldoPost = saldoAnt;

        if (
          payload.tipoMovimiento.startsWith('ENTRADA') ||
          payload.tipoMovimiento === 'AJUSTE_FISICO_POSITIVO' ||
          payload.tipoMovimiento === 'TRASLADO_ENTRADA'
        ) {
          saldoPost = saldoAnt + item.cantidad;
        } else {
          saldoPost = Math.max(0, saldoAnt - item.cantidad);
        }

        const costoUnit = item.costoUnitario || art?.costoEstandar || 0;
        const costoTot = costoUnit * item.cantidad;

        detallesGenerados.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          idMovimiento: 0,
          idBodega: payload.idBodega,
          idArticulo: item.idArticulo,
          codigoArticulo: art?.codigoArticulo || 'ART',
          nombreArticulo: art?.nombreArticulo || 'Artículo',
          unidadMedida: art?.unidadMedida || 'UNIDAD',
          numeroLote: item.numeroLote,
          fechaVencimiento: item.fechaVencimiento,
          cantidad: item.cantidad,
          costoUnitario: costoUnit,
          costoTotal: costoTot,
          saldoAnterior: saldoAnt,
          saldoPosterior: saldoPost,
          cantidadEmpaques: item.cantidadEmpaques,
          unidadesPorEmpaque: item.unidadesPorEmpaque,
          tipoEmpaque: item.tipoEmpaque
        });

        if (stockItem) {
          nuevoStock = nuevoStock.map(s => {
            if (s.id === stockItem!.id) {
              const valorTot = saldoPost * (s.costoEstandar || costoUnit);
              const estadoSum: 'OPTIMO' | 'REORDEN' | 'BAJO' =
                saldoPost <= s.stockMinimo ? 'BAJO' : saldoPost <= (s.puntoReorden || s.stockMinimo * 1.5) ? 'REORDEN' : 'OPTIMO';
              return {
                ...s,
                cantidadDisponible: saldoPost,
                valorTotalStock: valorTot,
                estadoSuministro: estadoSum,
                fechaUltimoMovimiento: obtenerFechaBogota(),
                numeroLote: item.numeroLote || s.numeroLote,
                fechaVencimiento: item.fechaVencimiento || s.fechaVencimiento
              };
            }
            return s;
          });
        } else {
          const nuevoStockItem: InventarioStockSede = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            idCentro: payload.idCentro,
            nombreCentro: centro.nombre,
            idBodega: payload.idBodega,
            nombreBodega: bodega?.nombreBodega || 'Bodega Principal',
            idArticulo: item.idArticulo,
            codigoArticulo: art?.codigoArticulo || 'ART',
            nombreArticulo: art?.nombreArticulo || 'Artículo',
            categoria: art?.nombreCategoria || 'General',
            colorCategoria: art?.colorCategoria || '#10B981',
            unidadMedida: art?.unidadMedida || 'UNIDAD',
            numeroLote: item.numeroLote,
            fechaVencimiento: item.fechaVencimiento,
            cantidadDisponible: saldoPost,
            cantidadReservada: 0,
            stockMinimo: 10,
            stockMaximo: 50,
            puntoReorden: 15,
            ubicacionEstante: 'Bodega Principal',
            fechaUltimoMovimiento: obtenerFechaBogota(),
            costoEstandar: costoUnit,
            valorTotalStock: saldoPost * costoUnit,
            estadoSuministro: saldoPost <= 10 ? 'BAJO' : 'OPTIMO'
          };
          nuevoStock.push(nuevoStockItem);
        }
      }

      setInventarioStock(nuevoStock);

      const nuevoMov: MovimientoInventario = {
        id: Date.now(),
        idCentro: payload.idCentro,
        nombreCentro: centro.nombre,
        numeroDocumento: docNumero,
        tipoMovimiento: payload.tipoMovimiento,
        fechaMovimiento: fechaActual,
        idUsuarioRegistra: currentUser?.id || 1,
        nombreUsuarioRegistra: currentUser?.nombreCompleto || 'Administrador',
        idResidente: payload.idResidente,
        nombreResidente: residenteObj ? `${residenteObj.nombres} ${residenteObj.apellidos}` : undefined,
        observaciones: payload.observaciones,
        estado: 'APLICADO',
        totalArticulos: payload.detalles.reduce((acc, d) => acc + d.cantidad, 0),
        costoTotal: detallesGenerados.reduce((acc, d) => acc + d.costoTotal, 0),
        detalles: detallesGenerados
      };

      setMovimientosInventario(prev => [nuevoMov, ...prev]);
      showToast(`Movimiento ${docNumero} registrado exitosamente`, 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error registrando movimiento de inventario', 'alert');
      return false;
    }
  };

  const despacharTraslado = async (payload: RegistrarTrasladoPayload): Promise<boolean> => {
    try {
      const centroOrigen = sedes.find(s => s.id === payload.idCentroOrigen);
      const centroDestino = sedes.find(s => s.id === payload.idCentroDestino);
      const codigoTraslado = `TRS-${Date.now().toString().slice(-4)}`;

      // Descontar del centro origen
      let nuevoStock = [...inventarioStock];
      for (const item of payload.detalles) {
        nuevoStock = nuevoStock.map(s => {
          if (s.idCentro === payload.idCentroOrigen && s.idArticulo === item.idArticulo) {
            const saldoPost = Math.max(0, s.cantidadDisponible - item.cantidadEnviada);
            return {
              ...s,
              cantidadDisponible: saldoPost,
              valorTotalStock: saldoPost * (s.costoEstandar || 0)
            };
          }
          return s;
        });
      }
      setInventarioStock(nuevoStock);

      const nuevoTraslado: TrasladoSedes = {
        id: Date.now(),
        codigoTraslado,
        idCentroOrigen: payload.idCentroOrigen,
        nombreCentroOrigen: centroOrigen?.nombre || 'Sede Origen',
        idCentroDestino: payload.idCentroDestino,
        nombreCentroDestino: centroDestino?.nombre || 'Sede Destino',
        fechaEnvio: `${obtenerFechaBogota()} ${obtenerHoraBogota()}:00`,
        estadoTraslado: 'EN_TRANSITO',
        idUsuarioDespacha: currentUser?.id || 1,
        nombreUsuarioDespacha: currentUser?.nombreCompleto || 'Administrador',
        notasDespacho: payload.notasDespacho,
        detalles: payload.detalles.map(d => {
          const art = articulosCatalogo.find(a => a.id === d.idArticulo);
          return {
            id: Date.now() + Math.floor(Math.random() * 1000),
            idTraslado: 0,
            idArticulo: d.idArticulo,
            codigoArticulo: art?.codigoArticulo,
            nombreArticulo: art?.nombreArticulo,
            unidadMedida: art?.unidadMedida,
            numeroLote: d.numeroLote,
            fechaVencimiento: d.fechaVencimiento,
            cantidadEnviada: d.cantidadEnviada,
            estadoItem: 'EN_TRANSITO'
          };
        })
      };

      setTrasladosSedes(prev => [nuevoTraslado, ...prev]);
      showToast(`Traslado ${codigoTraslado} despachado en tránsito`, 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error despachando traslado', 'alert');
      return false;
    }
  };

  const recibirTraslado = async (idTraslado: number, notasRecepcion?: string): Promise<boolean> => {
    try {
      const traslado = trasladosSedes.find(t => t.id === idTraslado);
      if (!traslado) return false;

      // Incrementar stock en centro destino
      let nuevoStock = [...inventarioStock];
      const bodegaDestino = bodegasSede.find(b => b.idCentro === traslado.idCentroDestino) || bodegasSede[0];

      for (const item of traslado.detalles) {
        const art = articulosCatalogo.find(a => a.id === item.idArticulo);
        let stockItem = nuevoStock.find(
          s => s.idCentro === traslado.idCentroDestino && s.idArticulo === item.idArticulo
        );

        if (stockItem) {
          nuevoStock = nuevoStock.map(s => {
            if (s.id === stockItem!.id) {
              const saldoPost = s.cantidadDisponible + item.cantidadEnviada;
              return {
                ...s,
                cantidadDisponible: saldoPost,
                valorTotalStock: saldoPost * (s.costoEstandar || 0),
                fechaUltimoMovimiento: obtenerFechaBogota()
              };
            }
            return s;
          });
        } else {
          nuevoStock.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            idCentro: traslado.idCentroDestino,
            nombreCentro: traslado.nombreCentroDestino,
            idBodega: bodegaDestino ? bodegaDestino.id : 1,
            nombreBodega: bodegaDestino ? bodegaDestino.nombreBodega : 'Bodega Principal',
            idArticulo: item.idArticulo,
            codigoArticulo: art?.codigoArticulo || 'ART',
            nombreArticulo: art?.nombreArticulo || 'Artículo',
            categoria: art?.nombreCategoria || 'General',
            colorCategoria: art?.colorCategoria || '#10B981',
            unidadMedida: art?.unidadMedida || 'UNIDAD',
            numeroLote: item.numeroLote,
            fechaVencimiento: item.fechaVencimiento,
            cantidadDisponible: item.cantidadEnviada,
            cantidadReservada: 0,
            stockMinimo: 10,
            stockMaximo: 50,
            puntoReorden: 15,
            ubicacionEstante: 'Bodega Principal',
            fechaUltimoMovimiento: obtenerFechaBogota(),
            costoEstandar: art?.costoEstandar || 0,
            valorTotalStock: item.cantidadEnviada * (art?.costoEstandar || 0),
            estadoSuministro: 'OPTIMO'
          });
        }
      }

      setInventarioStock(nuevoStock);

      // Actualizar estado del traslado
      setTrasladosSedes(prev =>
        prev.map(t => {
          if (t.id === idTraslado) {
            return {
              ...t,
              estadoTraslado: 'RECIBIDO_CONFORME',
              fechaRecepcion: `${obtenerFechaBogota()} ${obtenerHoraBogota()}:00`,
              idUsuarioRecibe: currentUser?.id || 1,
              nombreUsuarioRecibe: currentUser?.nombreCompleto || 'Administrador',
              notasRecepcion: notasRecepcion || 'Recepción conforme en almacén de sede'
            };
          }
          return t;
        })
      );

      showToast(`Traslado ${traslado.codigoTraslado} recibido e ingresado a bodega`, 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error recibiendo traslado', 'alert');
      return false;
    }
  };

  const crearArticuloCatalogo = async (articulo: Omit<ArticuloCatalogo, 'id'>): Promise<boolean> => {
    try {
      const nuevoId = Date.now();
      const nuevoArticulo: ArticuloCatalogo = {
        ...articulo,
        id: nuevoId
      };
      setArticulosCatalogo(prev => [...prev, nuevoArticulo]);

      // Generar registro inicial de stock en cada sede que maneja inventario
      const nuevasLineasStock: InventarioStockSede[] = sedes
        .filter(s => s.manejaInventario)
        .map(s => {
          const bod = bodegasSede.find(b => b.idCentro === s.id) || bodegasSede[0];
          return {
            id: Date.now() + s.id,
            idCentro: s.id,
            nombreCentro: s.nombre,
            idBodega: bod ? bod.id : 1,
            nombreBodega: bod ? bod.nombreBodega : 'Almacén Principal',
            idArticulo: nuevoId,
            codigoArticulo: articulo.codigoArticulo,
            nombreArticulo: articulo.nombreArticulo,
            categoria: articulo.nombreCategoria || 'General',
            colorCategoria: articulo.colorCategoria || '#10B981',
            unidadMedida: articulo.unidadMedida,
            cantidadDisponible: 0,
            cantidadReservada: 0,
            stockMinimo: 10,
            stockMaximo: 50,
            puntoReorden: 15,
            ubicacionEstante: 'Por Asignar',
            costoEstandar: articulo.costoEstandar,
            valorTotalStock: 0,
            estadoSuministro: 'BAJO'
          };
        });

      setInventarioStock(prev => [...prev, ...nuevasLineasStock]);
      showToast(`Artículo ${articulo.codigoArticulo} registrado en el catálogo`, 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error creando artículo', 'alert');
      return false;
    }
  };

  const actualizarArticuloCatalogo = async (id: number, datos: Partial<ArticuloCatalogo>): Promise<boolean> => {
    try {
      setArticulosCatalogo(prev =>
        prev.map(art => {
          if (art.id === id) {
            return { ...art, ...datos };
          }
          return art;
        })
      );

      // Sincronizar cambios relevantes en inventarioStock
      setInventarioStock(prev =>
        prev.map(stock => {
          if (stock.idArticulo === id) {
            const nuevoCosto = datos.costoEstandar !== undefined ? datos.costoEstandar : stock.costoEstandar;
            return {
              ...stock,
              codigoArticulo: datos.codigoArticulo || stock.codigoArticulo,
              nombreArticulo: datos.nombreArticulo || stock.nombreArticulo,
              categoria: datos.nombreCategoria || stock.categoria,
              colorCategoria: datos.colorCategoria || stock.colorCategoria,
              unidadMedida: datos.unidadMedida || stock.unidadMedida,
              costoEstandar: nuevoCosto,
              valorTotalStock: nuevoCosto !== undefined ? stock.cantidadDisponible * nuevoCosto : stock.valorTotalStock,
              stockMinimo: datos.stockMinimoSede !== undefined ? datos.stockMinimoSede : stock.stockMinimo,
              stockMaximo: datos.stockMaximoSede !== undefined ? datos.stockMaximoSede : stock.stockMaximo
            };
          }
          return stock;
        })
      );

      showToast('Artículo actualizado exitosamente en el catálogo', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error actualizando artículo', 'alert');
      return false;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sedes,
        activeSedeId,
        activeSede,
        setActiveSedeId,
        residentes,
        familiares,
        trabajadores,
        turnos,
        permisos,
        incidentes,
        metrics,
        searchQuery,
        setSearchQuery,
        isRegisterResidentOpen,
        setIsRegisterResidentOpen,
        isRegisterFamilyOpen,
        setIsRegisterFamilyOpen,
        isRegisterWorkerOpen,
        setIsRegisterWorkerOpen,
        isRegisterLeaveOpen,
        setIsRegisterLeaveOpen,
        isAssignShiftOpen,
        setIsAssignShiftOpen,
        isProgramarTurnosOpen,
        setIsProgramarTurnosOpen,
        turnoModalFechaInicial,
        setTurnoModalFechaInicial,
        selectedResidente,
        setSelectedResidente,
        isResidenteDetailOpen,
        setIsResidenteDetailOpen,
        tabInicialResidenteDetail,
        setTabInicialResidenteDetail,
        abrirInventarioResidente,
        editingResidente,
        setEditingResidente,
        isEditResidenteOpen,
        setIsEditResidenteOpen,
        editingTrabajador,
        setEditingTrabajador,
        isEditTrabajadorOpen,
        setIsEditTrabajadorOpen,
        editingFamiliar,
        setEditingFamiliar,
        isEditFamiliarOpen,
        setIsEditFamiliarOpen,
        isEditSedeOpen,
        setIsEditSedeOpen,
        registrarResidente,
        actualizarResidente,
        cargarBitacoraResidente,
        agregarEntradaBitacora: async (
          idResidente: number,
          entrada: { contenido: string; idCategoriaBitacora?: number; categoria?: string }
        ) => {
          let idReal = idResidente;
          const res = residentes.find((r) => r.id === idResidente);
          if (idReal > 999999999) {
            try {
              const respCenso = await adminApi.residentes.consultarCenso(activeSede.id);
              if (respCenso && respCenso.data) {
                const identBuscada = limpiarIdentificacion(String(res?.identificacion || ''));
                if (identBuscada) {
                  const matching = respCenso.data.find(
                    (r: any) => limpiarIdentificacion(String(r.identificacion)) === identBuscada
                  );
                  if (matching && matching.id) {
                    idReal = Number(matching.id);
                  }
                }
              }
            } catch (e) {
              console.warn('Error resolviendo ID real del residente:', e);
            }
          }

          // Persistir en Oracle con la función horaria legal f_fecha_actual
          try {
            await adminApi.residentes.actualizarResidente({
              idResidente: idReal,
              observaciones: entrada.contenido.trim(),
              idUsuario: currentUser?.id || 1
            });
          } catch (err) {
            console.warn('[agregarEntradaBitacora] Fallo al persistir en Oracle, guardando localmente:', err);
          }

          const nuevaNota: BitacoraResidente = {
            id: Date.now(),
            idResidente: idReal,
            nombreResidente: res?.nombreCompleto,
            habitacion: res?.habitacion,
            cama: res?.cama,
            idUsuario: currentUser?.id || 1,
            nombreUsuario: currentUser?.nombreCompleto || 'Administrador',
            fecha: obtenerFechaBogota(),
            hora: obtenerHoraBogota(),
            idCategoriaBitacora: entrada.idCategoriaBitacora || 1,
            categoria: entrada.categoria || 'Rutina',
            contenido: entrada.contenido.trim(),
            grabadoPorVoz: false,
            visibleAcudiente: true,
            fechaCreacion: obtenerIsoBogota()
          };
          setResidentes((prev) =>
            prev.map((r) =>
              r.id === idResidente || r.id === idReal
                ? {
                    ...r,
                    bitacora: [nuevaNota, ...(r.bitacora || [])]
                  }
                : r
            )
          );
          setSelectedResidente((prev) =>
            prev && (prev.id === idResidente || prev.id === idReal)
              ? { ...prev, bitacora: [nuevaNota, ...(prev.bitacora || [])] }
              : prev
          );
          showToast('Nota agregada a la bitácora del residente exitosamente', 'success');
          cargarBitacoraResidente(idReal).catch(() => {});
        },
        sincronizarResidentes,
        registrarFamiliar,
        actualizarFamiliar,
        eliminarFamiliar,
        actualizarSede,
        registrarTrabajador,
        actualizarTrabajador,
        actualizarEstadoTrabajador,
        asignarTrabajadorATurno,
        programarTurnosRango,
        desasignarTrabajadorDeTurno,
        aprobarPermiso,
        rechazarPermiso,
        registrarPermiso,
        toast,
        showToast,
        alertModal,
        showAlert,
        closeAlert,
        showConfirm,
        catalogoDotacion,
        dotaciones,
        isGestionDotacionOpen,
        setIsGestionDotacionOpen,
        isSolicitarDotacionOpen,
        setIsSolicitarDotacionOpen,
        solicitarDotacionResidentePreseleccionado,
        setSolicitarDotacionResidentePreseleccionado,
        abrirSolicitarDotacion,
        isFichaIngresoOpen,
        setIsFichaIngresoOpen,
        selectedResidenteParaFicha,
        setSelectedResidenteParaFicha,
        abrirFichaIngreso,
        cerrarFichaIngreso,
        guardarFichaIngreso,
        cargarFichaIngreso,
        estadosCiviles,
        registrarSolicitudDotacion,
        entregarDotacionSolicitada,
        guardarElementoCatalogo,
        eliminarElementoCatalogo,
        registrarDotacionResidente,
        agregarArticuloDotacionResidente,
        registrarRecambioDotacion,
        isSyncingGlobal,
        isOracleLive,
        sincronizarTodoConOracle,
        sincronizarTrabajadores,
        sincronizarFamiliares,
        sincronizarCatalogoDotacion,
        limpiarCacheYReconectarOracle,
        currentUser,
        isAuthenticated,
        login,
        logout,
        isUserProfileOpen,
        setIsUserProfileOpen,
        updateProfile,
        changePassword,
        // Inventario y Almacén Multisede
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
        actualizarArticuloCatalogo
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin debe utilizarse dentro de un AdminProvider');
  }
  return context;
};
