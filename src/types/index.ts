export type SedeCentro = {
  id: number;
  nombre: string;
  codigo: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  capacidadTotal: number;
  esSedePrincipal?: boolean;
  idOrganizacion?: number;
};

export type MedicamentoPrescrito = {
  id?: number;
  idResidente?: number;
  medicamento: string;
  cantidad: string; // Ej: '1 tableta', '10 ml', '500 mg'
  frecuencia: string; // Ej: 'Cada 8 horas', 'Cada 12 horas', 'En el desayuno'
  fechaFin?: string; // Ej: '2026-12-31' o vacío para continuo
  indicaciones?: string;
  activo?: boolean;
};

export type ClaseArchivoResidente =
  | 'Historia Clínica / Epicrisis'
  | 'Exámenes / Laboratorios'
  | 'Fórmulas y Órdenes Médicas'
  | 'Documento de Identidad'
  | 'Consentimiento Informado'
  | 'Afiliación EPS / Seguro'
  | 'Otro / Soporte General';

export type ArchivoAdjuntoResidente = {
  id?: number | string;
  idArchivo?: number;
  idArchivoClinico?: number;
  nombreArchivo: string;
  nombreAlmacenado?: string;
  claseArchivo: ClaseArchivoResidente;
  tamanoBytes?: number;
  tipoMime?: string;
  hash?: string;
  rutaRelativa?: string;
  rutaDrive?: string;
  driveUrl?: string;
  localUrl?: string;
  url?: string;
  fileBase64?: string;
  fechaSubida?: string;
  descripcion?: string;
};

export type Residente = {
  id: number;
  idCentro: number;
  codigoExpediente: string;
  tipoIdentificacion: string;
  identificacion: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  edad: number;
  genero: 'M' | 'F' | 'OTRO';
  fotoUrl?: string;
  idArchivoFotoPerfil?: number;
  habitacion: string;
  cama: string;
  eps: string;
  planComplementario?: string;
  tipoSangre: string;
  nivelMovilidad: 'Independiente' | 'Asistencia Leve' | 'Asistencia Moderada' | 'Dependiente Total';
  tipoDieta: 'Normal / General' | 'Blanda' | 'Hiposódica' | 'Diabética' | 'Licuada / Papilla';
  alertasClinicas?: string;
  estado: 'Activo' | 'En Observación' | 'Hospitalizado' | 'Egresado';
  fechaIngreso: string;
  medicamentos?: MedicamentoPrescrito[];
  acudientes: Array<{
    id: number;
    nombreCompleto: string;
    parentesco: string;
    telefono: string;
    email: string;
    esPrincipal: boolean;
  }>;
  archivosAdjuntos?: ArchivoAdjuntoResidente[];
  observaciones?: string;
  bitacora?: BitacoraResidente[];
};

export type BitacoraResidente = {
  id: number;
  idResidente: number;
  nombreResidente?: string;
  habitacion?: string;
  cama?: string;
  idEmpleado?: number;
  nombreEmpleado?: string;
  idUsuario: number;
  nombreUsuario?: string;
  fecha: string;
  hora: string;
  idCategoriaBitacora: number;
  categoria?: string;
  contenido: string;
  grabadoPorVoz?: boolean;
  visibleAcudiente?: boolean;
  fechaCreacion?: string;
};

export type FamiliarAcudiente = {
  id: number;
  tipoIdentificacion: string;
  identificacion: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  telefonoPrincipal: string;
  telefonoSecundario?: string;
  email: string;
  direccion: string;
  ciudad: string;
  canalNotificacionPref: 'WhatsApp' | 'Correo' | 'Push App' | 'Llamada';
  fotoUrl?: string;
  idArchivoFotoPerfil?: number;
  residentesAsociados: Array<{
    idResidente: number;
    nombreResidente: string;
    parentesco: string;
    esPrincipal: boolean;
    autorizadoSalidas: boolean;
    responsablePago: boolean;
  }>;
};

export type TrabajadorEmpleado = {
  id: number;
  idCentro: number;
  tipoIdentificacion: string;
  identificacion: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  cargo: string;
  area: 'Enfermería' | 'Cuidado Asistencial' | 'Medicina / Especialistas' | 'Nutrición / Cocina' | 'Servicios Generales' | 'Administrativo';
  unidadAsignada?: string;
  telefono: string;
  email: string;
  fechaContratacion: string;
  tipoContrato: 'Término Indefinido' | 'Término Fijo' | 'Prestación de Servicios';
  eps: string;
  arl: string;
  estado: 'Activo' | 'En Permiso' | 'Inactivo';
  avatarUrl?: string;
  idArchivoFotoPerfil?: number;
  turnoHabitual?: string;
};

export type TurnoAsignado = {
  id: number;
  idCentro: number;
  nombre: string;
  tipo: 'Mañana' | 'Tarde' | 'Noche' | '24 Horas';
  horario: string;
  fecha: string;
  coberturaMinimaRequerida: number;
  trabajadoresAsignados: Array<{
    idTrabajador: number;
    nombre: string;
    cargo: string;
    area: string;
    avatarUrl?: string;
  }>;
  estado: 'Programado' | 'Activo' | 'Finalizado' | 'Alerta Cobertura';
  alertas?: string;
  area?: string;
  observaciones?: string;
};

export type ProgramarTurnosRangoPayload = {
  idCentro: number;
  idTurnoPlantilla?: number;
  nombreTurno: string;
  tipo: 'Mañana' | 'Tarde' | 'Noche' | '24 Horas';
  horario: string;
  coberturaMinimaRequerida: number;
  idsTrabajadores: number[];
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;    // YYYY-MM-DD
  diasSemana: number[]; // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb
  area?: string;
  observaciones?: string;
};

export type PermisoAusencia = {
  id: number;
  idTrabajador: number;
  nombreTrabajador: string;
  area: string;
  tipo: 'Incapacidad Médica' | 'Vacaciones' | 'Permiso Personal' | 'Licencia';
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  soporteUrl?: string;
  idArchivoSoporte?: number;
  idArchivo?: number;
  driveUrl?: string;
  rutaDrive?: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
  comentariosAdmin?: string;
  fechaSolicitud: string;
};

export type IncidenteOperativo = {
  id: number;
  idCentro: number;
  idResidente: number;
  nombreResidente: string;
  habitacion: string;
  tipo: 'Caída' | 'Alteración de Signos' | 'Traslado a Urgencias' | 'Comportamiento / Agitación' | 'Otro';
  severidad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  descripcion: string;
  accionesTomadas: string;
  reportadoPor: string;
  fechaHora: string;
  estado: 'Abierto' | 'En Seguimiento' | 'Cerrado';
  notificadoFamiliar: boolean;
  idArchivoIncidente?: number;
};

export type AdminDashboardMetrics = {
  totalResidentes: number;
  capacidadTotal: number;
  porcentajeOcupacion: number;
  personalActivoTurno: number;
  tareasCumplimiento: number;
  incidentesActivos: number;
  permisosPendientes: number;
  alertasCriticas: number;
};

export type ElementoDotacionCatalogo = {
  id: number;
  idOrganizacion?: number;
  nombreElemento: string;
  categoria: string;
  cantidadDefecto: number;
  frecuenciaCambioMeses?: number | null;
  descripcion?: string;
  esSugeridoIngreso: boolean;
  estado: 'Activo' | 'Inactivo';
};

export type HistorialCambioDotacion = {
  id: number;
  idDotacionResidente: number;
  fechaCambio: string;
  motivo: string;
  condicionNuevo?: string;
  observaciones?: string;
  usuarioRegistra?: string;
};

export type DotacionResidente = {
  id: number;
  idResidente: number;
  idElementoCatalogo?: number | null;
  nombreElemento: string;
  categoria: string;
  cantidad: number;
  fechaEntrega?: string;
  fechaSolicitud?: string;
  fechaRequerida?: string;
  frecuenciaCambioMeses?: number | null;
  fechaProximoCambio?: string | null;
  fechaUltimoCambio?: string | null;
  estadoElemento: 'Solicitado' | 'En Trámite' | 'Entregado' | 'Cambio Pendiente' | 'Renovado' | 'Devuelto' | 'Baja / Deterioro';
  prioridad?: 'Normal' | 'Alta' | 'Urgente';
  motivoSolicitud?: string;
  especificaciones?: string;
  condicionEntrega?: string;
  notas?: string;
  usuarioEntrega?: string;
  usuarioSolicita?: string;
  semaforoCambio?: 'VIGENTE' | 'PROXIMO' | 'VENCIDO' | 'SIN_VENCIMIENTO' | 'SOLICITADO';
  diasParaCambio?: number | null;
  historial?: HistorialCambioDotacion[];
};

export type ArticuloSolicitudDotacion = {
  idElementoCatalogo?: number | null;
  nombreElemento: string;
  categoria: string;
  cantidad: number;
  frecuenciaCambioMeses?: number | null;
  especificaciones?: string;
  notas?: string;
};

export type SolicitudDotacionPayload = {
  idResidente: number;
  prioridad: 'Normal' | 'Alta' | 'Urgente';
  motivoSolicitud: string;
  fechaRequerida?: string;
  notas?: string;
  articulos: ArticuloSolicitudDotacion[];
  // Campos opcionales por compatibilidad mono-artículo
  idElementoCatalogo?: number | null;
  nombreElemento?: string;
  categoria?: string;
  cantidad?: number;
  frecuenciaCambioMeses?: number | null;
  especificaciones?: string;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  nombreCompleto: string;
  telefono?: string;
  avatarUrl?: string;
  rol: 'ADMIN';
  nombreRol: string;
};
