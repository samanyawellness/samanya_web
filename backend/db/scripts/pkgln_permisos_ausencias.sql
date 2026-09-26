-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_PERMISOS_AUSENCIAS
-- PROCESO: Solicitud, Aprobación y Gestión de Permisos, Bajas e Incapacidades
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Lógica de Negocio)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_PERMISOS_AUSENCIAS
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_PERMISOS_AUSENCIAS
    || Propósito: Gestionar el flujo de aprobación o rechazo de solicitudes de
    ||            ausencias, vacaciones e incapacidades médicas del personal.
    || Estándar: Sin DML directos, parámetros CLOB JSON, uso exclusivo de DAOs
    ||           y p_do_commit para control transaccional.
    || =========================================================================
    */

    /**
     * Registra una nueva solicitud o novedad de permiso / incapacidad para talento humano.
     * Parámetro pcl_json:
     * {
     *   "idTrabajador": 204,
     *   "idTipoPermiso": 2, // 1 = Vacaciones, 2 = Incapacidad Médica, 3 = Permiso Personal, 5 = Licencia
     *   "fechaInicio": "2025-02-18",
     *   "fechaFin": "2025-02-21",
     *   "motivo": "Cuadro gripal certificado por EPS.",
     *   "urlSoporte": "incapacidad.pdf",
     *   "idEstadoPermiso": 1, // 1 = Pendiente, 2 = Aprobado
     *   "observacionesAdmin": "Aprobado por administración."
     * }
     */
    PROCEDURE pr_registrar_permiso (
        pcl_json IN CLOB
    );

    /**
     * Aprueba o rechaza una solicitud de permiso y actualiza el estado del colaborador
     * Parámetro pcl_json:
     * {
     *   "idSolicitud": 401,
     *   "idEstadoPermiso": 2, // 2 = Aprobado, 3 = Rechazado
     *   "comentariosAdmin": "Aprobada incapacidad médica por 3 días."
     * }
     */
    PROCEDURE pr_gestionar_solicitud_permiso (
        pcl_json IN CLOB
    );

END PKGLN_PERMISOS_AUSENCIAS;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_PERMISOS_AUSENCIAS
AS
    vro_error smy_errores%ROWTYPE;

    PROCEDURE pr_registrar_permiso (
        pcl_json IN CLOB
    ) IS
        v_id_empleado        smy_solicitudes_permisos.id_empleado%TYPE;
        v_id_tipo_permiso    smy_solicitudes_permisos.id_tipo_permiso%TYPE;
        v_fecha_inicio_str   VARCHAR2(20);
        v_fecha_fin_str      VARCHAR2(20);
        v_fecha_inicio       DATE;
        v_fecha_fin          DATE;
        v_motivo             smy_solicitudes_permisos.motivo%TYPE;
        v_id_archivo         smy_solicitudes_permisos.id_archivo_soporte%TYPE;
        v_id_estado_permiso  smy_solicitudes_permisos.id_estado_permiso%TYPE;
        v_observaciones      smy_solicitudes_permisos.observaciones_admin%TYPE;

        vro_permiso          smy_solicitudes_permisos%ROWTYPE;
        vro_empleado         smy_empleados%ROWTYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_id_empleado       := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTrabajador'));
        IF v_id_empleado IS NULL THEN
            v_id_empleado   := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEmpleado'));
        END IF;
        v_id_tipo_permiso   := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoPermiso'));
        v_fecha_inicio_str  := TRIM(JSON_VALUE(pcl_json, '$.fechaInicio'));
        v_fecha_fin_str     := TRIM(JSON_VALUE(pcl_json, '$.fechaFin'));
        v_motivo            := TRIM(JSON_VALUE(pcl_json, '$.motivo'));
        v_id_archivo        := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idArchivoSoporte')), TO_NUMBER(JSON_VALUE(pcl_json, '$.idArchivo')));
        v_id_estado_permiso := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idEstadoPermiso')), 1);
        v_observaciones     := TRIM(JSON_VALUE(pcl_json, '$.observacionesAdmin'));

        -- 2. Validaciones obligatorias
        IF v_id_empleado IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El identificador del empleado es obligatorio.');
        END IF;

        IF v_id_tipo_permiso IS NULL THEN
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de permiso es obligatorio.');
        END IF;

        IF v_fecha_inicio_str IS NULL OR v_fecha_fin_str IS NULL THEN
            RAISE_APPLICATION_ERROR(-20003, 'Las fechas de inicio y fin son obligatorias.');
        END IF;

        IF v_motivo IS NULL THEN
            RAISE_APPLICATION_ERROR(-20004, 'El motivo o justificación del permiso es obligatorio.');
        END IF;

        v_fecha_inicio := TO_DATE(SUBSTR(v_fecha_inicio_str, 1, 10), 'YYYY-MM-DD');
        v_fecha_fin    := TO_DATE(SUBSTR(v_fecha_fin_str, 1, 10), 'YYYY-MM-DD');

        IF v_fecha_fin < v_fecha_inicio THEN
            RAISE_APPLICATION_ERROR(-20005, 'La fecha fin no puede ser anterior a la fecha de inicio.');
        END IF;

        -- 3. Validar existencia del colaborador vía DAO
        IF PKGSMY_EMPLEADOS_DAO.f_existe(v_id_empleado, vro_empleado) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20006, 'El colaborador indicado no se encuentra registrado.');
        END IF;

        -- 4. Asignación directa de secuencia
        vro_permiso.id := SEQ_SMY_SOLICITUDES_PERMISOS.NEXTVAL;
        vro_permiso.id_empleado                    := v_id_empleado;
        vro_permiso.id_tipo_permiso                := v_id_tipo_permiso;
        vro_permiso.fecha_inicio                   := v_fecha_inicio;
        vro_permiso.fecha_fin                      := v_fecha_fin;
        vro_permiso.motivo                         := v_motivo;
        vro_permiso.id_archivo_soporte             := v_id_archivo;
        vro_permiso.id_estado_permiso              := v_id_estado_permiso;
        vro_permiso.observaciones_admin            := v_observaciones;
        vro_permiso.fecha_creacion                 := f_fecha_actual;
        vro_permiso.id_usuario_ultima_modificacion := NULL;

        -- 5. Si fue registrado como Aprobado (2), marcar fecha de respuesta y cambiar estado del trabajador a 'En Permiso' (2)
        IF v_id_estado_permiso = 2 THEN
            vro_permiso.fecha_respuesta     := f_fecha_actual;
            vro_empleado.id_estado_empleado := 2; -- En Permiso
            PKGSMY_EMPLEADOS_DAO.p_actualizar(vro_empleado);
        END IF;

        -- 6. Inserción exclusiva vía DAO
        PKGSMY_SOLICITUDES_PERMISOS_DAO.p_insertar(vro_permiso);

        -- 7. Commit controlado corporativo
        p_do_commit('pkgln_permisos_ausencias.pr_registrar_permiso');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_PERMISOS_AUSENCIAS';
            vro_error.nombre_metodo   := 'PR_REGISTRAR_PERMISO';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_permiso;

    PROCEDURE pr_gestionar_solicitud_permiso (
        pcl_json IN CLOB
    ) IS
        v_id_solicitud       smy_solicitudes_permisos.id%TYPE;
        v_id_estado_permiso  smy_solicitudes_permisos.id_estado_permiso%TYPE;
        v_comentarios        VARCHAR2(500);

        vro_permiso          smy_solicitudes_permisos%ROWTYPE;
        vro_empleado         smy_empleados%ROWTYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_id_solicitud      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idSolicitud'));
        v_id_estado_permiso := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEstadoPermiso'));
        v_comentarios       := TRIM(JSON_VALUE(pcl_json, '$.comentariosAdmin'));

        -- 2. Validaciones de negocio
        IF v_id_solicitud IS NULL OR v_id_estado_permiso IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'Identificador de la solicitud y nuevo estado son obligatorios.');
        END IF;

        IF PKGSMY_SOLICITUDES_PERMISOS_DAO.f_existe(v_id_solicitud, vro_permiso) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20002, 'La solicitud de permiso indicada no existe.');
        END IF;

        -- 3. Actualizar solicitud vía DAO
        vro_permiso.id_estado_permiso   := v_id_estado_permiso;
        vro_permiso.observaciones_admin := v_comentarios;
        vro_permiso.fecha_respuesta     := f_fecha_actual;

        PKGSMY_SOLICITUDES_PERMISOS_DAO.p_actualizar(vro_permiso);

        -- 4. Si la solicitud fue aprobada (estado = 2), actualizar estado del trabajador a 'En Permiso' (2)
        IF v_id_estado_permiso = 2 THEN
            IF PKGSMY_EMPLEADOS_DAO.f_existe(vro_permiso.id_empleado, vro_empleado) = TRUE THEN
                vro_empleado.id_estado_empleado := 2; -- En Permiso
                PKGSMY_EMPLEADOS_DAO.p_actualizar(vro_empleado);
            END IF;
        END IF;

        -- 5. Commit controlado
        p_do_commit('pkgln_permisos_ausencias.pr_gestionar_solicitud_permiso');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_PERMISOS_AUSENCIAS';
            vro_error.nombre_metodo   := 'PR_GESTIONAR_SOLICITUD_PERMISO';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_gestionar_solicitud_permiso;

END PKGLN_PERMISOS_AUSENCIAS;
/
