import { MedicamentoPrescrito, ValoracionIngreso, EstadoCivil } from '../types';

/**
 * Capa de Servicios API para el Portal de Administradores
 * 
 * Regla arquitectónica:
 * - CERO instrucciones DML en el frontend.
 * - Toda interacción de escritura/lectura se realiza a través de contratos JSON
 *   que mapean 1:1 con los paquetes de lógica de negocio Oracle (PKGLN_).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function postToPackage<T>(endpoint: string, jsonPayload: Record<string, any>): Promise<T> {
  // Si existe backend configurado, despacha la petición HTTP
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('samanya_admin_token') || ''}`,
        'x-centro-id': localStorage.getItem('samanya_active_centro_id') || '1'
      },
      body: JSON.stringify(jsonPayload)
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success === false) {
        console.error(`[Samanya Oracle API Error] en ${endpoint}:`, data.error);
        throw new Error(data.error || 'Error en base de datos Oracle');
      }
      return data;
    } else {
      let errorMsg = `Error HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.error || errorMsg;
      } catch {
        const errText = await response.text();
        if (errText) errorMsg = errText;
      }
      console.error(`[Samanya Oracle API HTTP Error ${response.status}] en ${endpoint}:`, errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.warn(`[Samanya Oracle API] Despacho a ${endpoint}:`, error);
    throw error;
  }
}

export const adminApi = {
  // 0. Autenticación de Administradores (PKGLN_AUTH)
  auth: {
    async login(payload: { usuario: string; password?: string }) {
      return postToPackage<{
        success: boolean;
        message: string;
        token: string;
        user: {
          id: number;
          username: string;
          email: string;
          nombreCompleto: string;
          telefono?: string;
          avatarUrl?: string;
          rol: string;
          nombreRol: string;
        };
      }>('/pkgln_auth/pr_autenticar', payload);
    },

    async actualizarPerfil(payload: {
      idUsuario: number;
      nombreCompleto: string;
      email: string;
      telefono?: string;
      avatarUrl?: string;
    }) {
      return postToPackage<{
        success: boolean;
        message: string;
        user?: {
          id: number;
          username: string;
          email: string;
          nombreCompleto: string;
          telefono?: string;
          avatarUrl?: string;
          rol: string;
          nombreRol: string;
        };
      }>('/pkgln_auth/pr_actualizar_perfil', payload);
    },

    async cambiarClave(payload: {
      idUsuario: number;
      claveActual: string;
      claveNueva: string;
    }) {
      return postToPackage<{
        success: boolean;
        message: string;
      }>('/pkgln_auth/pr_cambiar_clave', payload);
    }
  },

  // 1. Métricas e Incidentes (PKGLN_DASHBOARD_ADMINISTRADOR)
  dashboard: {
    async obtenerMetricas(idCentro: number) {
      return postToPackage<{ success: boolean; data: any }>('/pkgln_dashboard_administrador/f_obtener_resumen_json', { idCentro });
    }
  },

  // 2. Admisión y Ficha de Residentes (PKGLN_ADMISION_RESIDENTE)
  residentes: {
    async registrarResidente(payload: {
      idCentro: number;
      tipoIdentificacion?: string;
      idTipoIdentificacion?: number;
      identificacion: string;
      nombres: string;
      apellidos: string;
      fechaNacimiento: string;
      genero?: string;
      idGenero?: number;
      habitacion: string;
      cama: string;
      eps: string;
      planComplementario?: string;
      tipoSangre: string;
      nivelMovilidad?: string;
      idNivelMovilidad?: number;
      tipoDieta?: string;
      idTipoDieta?: number;
      idEstadoResidente?: number;
      fechaIngreso?: string;
      alertasClinicas?: string;
      medicamentos?: MedicamentoPrescrito[];
      acudienteAsociado?: {
        nombres: string;
        apellidos: string;
        identificacion: string;
        parentesco?: string;
        idParentesco?: number;
        idTipoIdentificacion?: number;
        idCanalNotifPref?: number;
        telefono: string;
        email: string;
        esPrincipal?: boolean;
      };
      observaciones?: string;
    }) {
      return postToPackage('/pkgln_admision_residente/pr_registrar_residente', payload);
    },

    async actualizarResidente(payload: {
      idResidente: number;
      nombres?: string;
      apellidos?: string;
      identificacion?: string;
      idTipoIdentificacion?: number;
      fechaNacimiento?: string;
      idGenero?: number;
      eps?: string;
      planComplementario?: string;
      tipoSangre?: string;
      habitacion?: string;
      cama?: string;
      idNivelMovilidad?: number;
      idTipoDieta?: number;
      alertasClinicas?: string;
      medicamentos?: MedicamentoPrescrito[];
      idEstadoResidente?: number;
      fechaIngreso?: string;
      observacionCambioEstado?: string;
      observaciones?: string;
      idUsuario?: number;
    }) {
      return postToPackage('/pkgln_admision_residente/pr_actualizar_residente', payload);
    },

    async consultarBitacora(idResidente: number): Promise<{ success: boolean; data?: any[] }> {
      return postToPackage('/pkgca_smy_bitacora_residente/f_consultar_por_residente_json', { idResidente });
    },

    async consultarCenso(idCentro?: number): Promise<{ success: boolean; data?: any[]; count?: number }> {
      return postToPackage('/pkgca_residentes/p_consultar_censo', { idCentro });
    },

    async consultarFichaIngreso(idResidente: number): Promise<{ success: boolean; data?: any }> {
      return postToPackage('/pkgca_smy_valoraciones_ingreso/f_traer_ultima_ficha_json', { idResidente });
    },

    async guardarFichaIngreso(payload: Record<string, any>): Promise<{ success: boolean; message?: string }> {
      return postToPackage('/pkgln_admision_residente/pr_guardar_valoracion_ingreso', payload);
    },

    async consultarEstadosCiviles(): Promise<{ success: boolean; data?: EstadoCivil[] }> {
      return postToPackage('/pkgca_smy_estados_civiles/p_consultar_vigentes', {});
    }
  },

  // 3. Gestión de Familiares y Acudientes (PKGLN_GESTION_FAMILIARES / PKGCA_SMY_ACUDIENTES)
  familiares: {
    async consultarFamiliares(idCentro?: number): Promise<{ success: boolean; data?: any[]; count?: number }> {
      return postToPackage('/pkgca_smy_acudientes/p_consultar_acudientes', { idCentro });
    },

    async registrarFamiliar(payload: {
      idTipoIdentificacion?: number;
      tipoIdentificacion: string;
      identificacion: string;
      nombres: string;
      apellidos: string;
      telefonoPrincipal: string;
      telefonoSecundario?: string;
      email: string;
      direccion: string;
      ciudad: string;
      idCanalNotifPref?: number;
      canalNotificacionPref: string;
      idResidente?: number;
      idParentesco?: number;
      parentesco?: string;
      esPrincipal?: boolean | number;
      autorizadoSalidas?: boolean | number;
      responsablePago?: boolean | number;
    }) {
      return postToPackage('/pkgln_gestion_familiares/pr_registrar_familiar', payload);
    },

    async actualizarFamiliar(payload: {
      idAcudiente: number;
      nombres?: string;
      apellidos?: string;
      identificacion?: string;
      idTipoIdentificacion?: number;
      telefonoPrincipal?: string;
      telefonoSecundario?: string;
      email?: string;
      direccion?: string;
      ciudad?: string;
      idCanalNotifPref?: number;
    }) {
      return postToPackage('/pkgln_gestion_familiares/pr_actualizar_familiar', payload);
    },

    async eliminarFamiliar(payload: { idAcudiente: number }) {
      return postToPackage('/pkgln_gestion_familiares/pr_eliminar_familiar', payload);
    },

    async vincularFamiliarResidente(payload: {
      idAcudiente: number;
      idResidente: number;
      idParentesco: number;
      esPrincipal: boolean;
      autorizadoSalidas: boolean;
      responsablePago: boolean;
    }) {
      return postToPackage('/pkgln_gestion_familiares/pr_vincular_familiar_residente', payload);
    }
  },

  // 4. Talento Humano y Trabajadores (PKGLN_TALENTO_HUMANO / PKGCA_SMY_EMPLEADOS)
  trabajadores: {
    async consultarTrabajadores(idCentro?: number): Promise<{ success: boolean; data?: any[]; count?: number }> {
      return postToPackage('/pkgca_smy_empleados/p_consultar_empleados', { idCentro });
    },

    async registrarTrabajador(payload: {
      idCentro: number;
      tipoIdentificacion: string;
      identificacion: string;
      nombres: string;
      apellidos: string;
      cargo: string;
      area: string;
      unidadAsignada?: string;
      telefono: string;
      emailCorp: string;
      fechaContratacion: string;
      tipoContrato: string;
      eps: string;
      arl: string;
      turnoHabitual?: string;
    }) {
      return postToPackage('/pkgln_talento_humano/pr_registrar_trabajador', payload);
    },

    async actualizarTrabajador(payload: {
      idTrabajador: number;
      nombres?: string;
      apellidos?: string;
      identificacion?: string;
      idTipoIdentificacion?: number;
      idCargoEmpleado?: number;
      idAreaEmpleado?: number;
      unidadAsignada?: string;
      telefono?: string;
      emailCorp?: string;
      idEstadoEmpleado?: number;
    }) {
      return postToPackage('/pkgln_talento_humano/pr_actualizar_trabajador', payload);
    },

    async actualizarEstadoTrabajador(payload: {
      idTrabajador: number;
      idEstadoEmpleado: number;
      motivo?: string;
    }) {
      return postToPackage('/pkgln_talento_humano/pr_actualizar_estado_trabajador', payload);
    }
  },

  // 5. Cuadrantes y Turnos (PKGLN_CUADRANTES_TURNOS)
  turnos: {
    async asignarTurno(payload: {
      idCentro: number;
      idTrabajador: number;
      idTurno: number;
      fechaTurno: string;
      observaciones?: string;
    }) {
      return postToPackage('/pkgln_cuadrantes_turnos/pr_asignar_turno_trabajador', payload);
    }
  },

  // 6. Permisos y Ausencias (PKGLN_PERMISOS_AUSENCIAS)
  permisos: {
    async registrarPermiso(payload: {
      idTrabajador: number;
      idTipoPermiso: number;
      fechaInicio: string;
      fechaFin: string;
      motivo: string;
      urlSoporte?: string;
      idArchivoSoporte?: number;
      idArchivo?: number;
      idEstadoPermiso?: number;
      observacionesAdmin?: string;
    }) {
      return postToPackage('/pkgln_permisos_ausencias/pr_registrar_permiso', payload);
    },

    async gestionarSolicitud(payload: {
      idSolicitud: number;
      idEstadoPermiso: number; // 2 = Aprobado, 3 = Rechazado
      comentariosAdmin: string;
    }) {
      return postToPackage('/pkgln_permisos_ausencias/pr_gestionar_solicitud_permiso', payload);
    }
  },

  // 7. Configuración de Sedes (SMY_CENTROS)
  sedes: {
    async actualizarSede(payload: {
      idCentro: number;
      capacidadTotal?: number;
      nombre?: string;
      direccion?: string;
      telefono?: string;
    }) {
      return postToPackage('/pkgsmy_centros_dao/p_actualizar', payload);
    }
  },

  // 8. Gestión de Archivos y Google Drive (PKGLN_ARCHIVOS)
  archivos: {
    async prepararCargaFotoTalento(payload: {
      idUsuario: number;
      identificacion: string;
      nombreOriginal: string;
      idCentro?: number;
    }) {
      return postToPackage('/pkgln_archivos/pr_preparar_carga_foto_talento', payload);
    },

    async registrarFotoTalentoHumano(payload: {
      id?: number;
      idUsuario: number;
      idEmpleado?: number;
      idTrabajador?: number;
      identificacion: string;
      nombreArchivo: string;
      nombreArchivoAlmacenado: string;
      hashArchivo: string;
      rutaRelativa: string;
      rutaCompletaAlmacenamiento: string;
      avatarUrl: string;
      tamanoBytes?: number;
      extension?: string;
      tipoMime?: string;
      idCentro?: number;
      idUsuarioCreacion?: number;
    }) {
      return postToPackage('/pkgln_archivos/pr_registrar_foto_talento_humano', payload);
    },

    async subirFotoTalentoHumano(payload: Record<string, any>) {
      return postToPackage('/pkgln_archivos/pr_subir_foto_talento_humano', payload);
    }
  },

  // 9. Control de Dotación e Inventario de Residentes (PKGLN_DOTACION_RESIDENTES)
  dotacion: {
    async consultarCatalogo(idOrganizacion?: number) {
      return postToPackage<{ success: boolean; data?: any[]; count?: number }>('/pkgln_dotacion_residentes/pr_consultar_catalogo', { idOrganizacion });
    },

    async guardarArticuloCatalogo(payload: {
      id?: number;
      idOrganizacion?: number;
      nombreElemento: string;
      categoria?: string;
      cantidadDefecto?: number;
      frecuenciaCambioMeses?: number | null;
      descripcion?: string;
      esSugeridoIngreso?: number;
      estado?: string;
      idUsuario?: number;
    }) {
      return postToPackage('/pkgln_dotacion_residentes/pr_guardar_articulo_catalogo', payload);
    },

    async consultarDotacionResidente(idResidente: number) {
      return postToPackage('/pkgln_dotacion_residentes/pr_consultar_dotacion_residente', { idResidente });
    },

    async registrarEntregaIngreso(payload: {
      idResidente: number;
      idUsuario?: number;
      articulos: Array<{
        idElementoCatalogo?: number | null;
        nombreElemento: string;
        categoria?: string;
        cantidad: number;
        frecuenciaCambioMeses?: number | null;
        condicionEntrega?: string;
        notas?: string;
      }>;
    }) {
      return postToPackage('/pkgln_dotacion_residentes/pr_registrar_entrega_ingreso', payload);
    },

    async agregarArticuloResidente(payload: {
      idResidente: number;
      idElementoCatalogo?: number | null;
      nombreElemento: string;
      categoria?: string;
      cantidad: number;
      frecuenciaCambioMeses?: number | null;
      condicionEntrega?: string;
      notas?: string;
      idUsuario?: number;
    }) {
      return postToPackage('/pkgln_dotacion_residentes/pr_agregar_articulo_residente', payload);
    },

    async registrarRecambio(payload: {
      idDotacionResidente: number;
      motivo?: string;
      condicionNuevo?: string;
      observaciones?: string;
      idUsuario?: number;
    }) {
      return postToPackage('/pkgln_dotacion_residentes/pr_registrar_recambio', payload);
    },

    async solicitarDotacionResidente(payload: {
      idResidente: number;
      prioridad?: 'Normal' | 'Alta' | 'Urgente';
      motivoSolicitud?: string;
      fechaRequerida?: string;
      notas?: string;
      idUsuario?: number;
      articulos?: Array<{
        idElementoCatalogo?: number | null;
        nombreElemento: string;
        categoria?: string;
        cantidad: number;
        frecuenciaCambioMeses?: number | null;
        especificaciones?: string;
        notas?: string;
      }>;
      idElementoCatalogo?: number | null;
      nombreElemento?: string;
      categoria?: string;
      cantidad?: number;
      frecuenciaCambioMeses?: number | null;
      especificaciones?: string;
    }) {
      return postToPackage('/pkgln_dotacion_residentes/pr_solicitar_dotacion_residente', payload);
    },

    async entregarDotacionSolicitada(payload: {
      idDotacionResidente: number;
      condicionEntrega?: string;
      notas?: string;
      idUsuario?: number;
    }) {
      return postToPackage('/pkgln_dotacion_residentes/pr_entregar_dotacion_solicitada', payload);
    }
  }
};


