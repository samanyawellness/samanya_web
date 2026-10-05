-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_REGISTROS_ALIMENTACION
-- FAMILIA: pkgca_ (Consultas avanzadas, filtros multi-criterio y DML mono-tabla no-PK)
-- ENTIDAD: SMY_REGISTROS_ALIMENTACION
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_REGISTROS_ALIMENTACION
AS
    /*
    || =========================================================================
    || Paquete: PKGCA_SMY_REGISTROS_ALIMENTACION
    || Propósito: Consultas operativas de comedor e ingesta diaria de alimentos.
    || Estándar: Familia pkgca_, parámetro pcl_json IN CLOB, extracción JSON_VALUE,
    ||           sintaxis tradicional Oracle (CERO ANSI JOIN).
    || =========================================================================
    */

    /**
     * Consulta el pase de comedor del día para una sede y tiempo de comida
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "fecha": "2026-10-04",
     *   "idTiempoComida": 3
     * }
     */
    PROCEDURE p_consultar_comedor_dia (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    /**
     * Consulta el historial de ingesta de un residente en un rango de fechas
     * Parámetro pcl_json:
     * {
     *   "idResidente": 1,
     *   "fechaDesde": "2026-09-01",
     *   "fechaHasta": "2026-10-04"
     * }
     */
    PROCEDURE p_consultar_historial_ingesta (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    /**
     * DML mono-tabla: Actualiza la ingesta de un residente por fecha y tiempo de comida (no por PK)
     * Parámetro pcl_json:
     * {
     *   "idResidente": 1,
     *   "fecha": "2026-10-04",
     *   "idTiempoComida": 3,
     *   "porcentajeIngesta": 75,
     *   "liquidosMl": 200,
     *   "tolerancia": "Buena",
     *   "observaciones": "Consumió casi toda la proteína",
     *   "idEmpleadoRegistra": 2
     * }
     */
    PROCEDURE p_actualizar_ingesta_residente (
        pcl_json IN CLOB
    );

    /**
     * DML mono-tabla: Alias de actualización de ingesta
     */
    PROCEDURE p_actualizar_ingesta (
        pcl_json IN CLOB
    );

END PKGCA_SMY_REGISTROS_ALIMENTACION;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_REGISTROS_ALIMENTACION
AS

    PROCEDURE p_consultar_comedor_dia (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
        v_id_centro        smy_registros_alimentacion.id_centro%TYPE;
        v_fecha_str        VARCHAR2(20);
        v_fecha            DATE;
        v_id_tiempo_comida smy_registros_alimentacion.id_tiempo_comida%TYPE;
    BEGIN
        v_id_centro        := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_fecha_str        := JSON_VALUE(pcl_json, '$.fecha');
        v_id_tiempo_comida := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTiempoComida'));

        IF v_fecha_str IS NOT NULL THEN
            v_fecha := TO_DATE(SUBSTR(v_fecha_str, 1, 10), 'YYYY-MM-DD');
        ELSE
            v_fecha := TRUNC(f_fecha_actual);
        END IF;

        OPEN p_cursor FOR
            SELECT 
                r.id AS id_residente,
                r.id_centro,
                r.nombres || ' ' || r.apellidos AS nombre_residente,
                r.habitacion,
                r.cama,
                r.id_archivo_foto_perfil,
                NVL(td.nombre_tipo_dieta, 'Normal / General') AS tipo_dieta,
                NVL(cd.nombre_consistencia_dieta, 'Sólida / Normal') AS consistencia_dieta,
                ne.nombre AS nivel_espesante,
                pn.restricciones_alergias,
                NVL(pn.requiere_asistencia, 'N') AS requiere_asistencia,
                reg.id AS id_registro_alimentacion,
                reg.porcentaje_ingesta,
                NVL(reg.liquidos_ml, 0) AS liquidos_ml,
                NVL(reg.tolerancia, 'BUENA') AS tolerancia,
                reg.observaciones,
                TO_CHAR(reg.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_registro,
                reg.id_empleado_registra,
                emp.nombres || ' ' || emp.apellidos AS nombre_empleado_registra
            FROM smy_residentes r,
                 smy_plan_nutricional pn,
                 smy_tipos_dietas td,
                 smy_consistencias_dieta cd,
                 smy_niveles_espesante ne,
                 smy_registros_alimentacion reg,
                 smy_empleados emp
            WHERE r.id = pn.id_residente(+)
              AND pn.id_tipo_dieta = td.id(+)
              AND pn.id_consistencia = cd.id(+)
              AND pn.id_nivel_espesante = ne.id(+)
              AND r.id = reg.id_residente(+)
              AND reg.fecha(+) = v_fecha
              AND reg.id_tiempo_comida(+) = v_id_tiempo_comida
              AND reg.id_empleado_registra = emp.id(+)
              AND (v_id_centro IS NULL OR r.id_centro = v_id_centro)
            ORDER BY r.habitacion, r.cama, r.apellidos, r.nombres;
    END p_consultar_comedor_dia;

    PROCEDURE p_consultar_historial_ingesta (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
        v_id_residente smy_registros_alimentacion.id_residente%TYPE;
        v_desde_str    VARCHAR2(20);
        v_hasta_str    VARCHAR2(20);
        v_desde        DATE;
        v_hasta        DATE;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_desde_str    := JSON_VALUE(pcl_json, '$.fechaDesde');
        v_hasta_str    := JSON_VALUE(pcl_json, '$.fechaHasta');

        IF v_desde_str IS NOT NULL THEN
            v_desde := TO_DATE(SUBSTR(v_desde_str, 1, 10), 'YYYY-MM-DD');
        ELSE
            v_desde := TRUNC(f_fecha_actual) - 7;
        END IF;

        IF v_hasta_str IS NOT NULL THEN
            v_hasta := TO_DATE(SUBSTR(v_hasta_str, 1, 10), 'YYYY-MM-DD');
        ELSE
            v_hasta := TRUNC(f_fecha_actual);
        END IF;

        OPEN p_cursor FOR
            SELECT 
                reg.id,
                reg.id_centro,
                reg.id_residente,
                TO_CHAR(reg.fecha, 'YYYY-MM-DD') AS fecha,
                tc.id AS id_tiempo_comida,
                tc.nombre AS nombre_tiempo_comida,
                reg.porcentaje_ingesta,
                reg.liquidos_ml,
                reg.tolerancia,
                reg.observaciones,
                TO_CHAR(reg.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_registro,
                emp.nombres || ' ' || emp.apellidos AS nombre_empleado_registra
            FROM smy_registros_alimentacion reg,
                 smy_tiempos_comida tc,
                 smy_empleados emp
            WHERE reg.id_tiempo_comida = tc.id
              AND reg.id_empleado_registra = emp.id(+)
              AND reg.id_residente = v_id_residente
              AND reg.fecha BETWEEN v_desde AND v_hasta
            ORDER BY reg.fecha DESC, tc.orden ASC;
    END p_consultar_historial_ingesta;

    PROCEDURE p_actualizar_ingesta_residente (
        pcl_json IN CLOB
    ) IS
        v_id_residente smy_registros_alimentacion.id_residente%TYPE;
        v_fecha_str    VARCHAR2(20);
        v_fecha        DATE;
        v_id_tc        smy_registros_alimentacion.id_tiempo_comida%TYPE;
        v_porcentaje   smy_registros_alimentacion.porcentaje_ingesta%TYPE;
        v_liquidos     smy_registros_alimentacion.liquidos_ml%TYPE;
        v_tolerancia   smy_registros_alimentacion.tolerancia%TYPE;
        v_observ       smy_registros_alimentacion.observaciones%TYPE;
        v_empleado     smy_registros_alimentacion.id_empleado_registra%TYPE;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_fecha_str    := JSON_VALUE(pcl_json, '$.fecha');
        v_id_tc        := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTiempoComida'));
        v_porcentaje   := TO_NUMBER(JSON_VALUE(pcl_json, '$.porcentajeIngesta'));
        v_liquidos     := TO_NUMBER(JSON_VALUE(pcl_json, '$.liquidosMl'));
        v_tolerancia   := JSON_VALUE(pcl_json, '$.tolerancia');
        v_observ       := JSON_VALUE(pcl_json, '$.observaciones');
        v_empleado     := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEmpleadoRegistra'));

        IF v_fecha_str IS NOT NULL THEN
            v_fecha := TO_DATE(SUBSTR(v_fecha_str, 1, 10), 'YYYY-MM-DD');
        ELSE
            v_fecha := TRUNC(f_fecha_actual);
        END IF;

        UPDATE smy_registros_alimentacion
           SET porcentaje_ingesta   = v_porcentaje,
               liquidos_ml          = NVL(v_liquidos, 0),
               tolerancia           = NVL(v_tolerancia, 'Buena'),
               observaciones        = v_observ,
               id_empleado_registra = v_empleado,
               fecha_actualizacion  = f_fecha_actual
         WHERE id_residente = v_id_residente
           AND fecha = v_fecha
           AND id_tiempo_comida = v_id_tc;
    END p_actualizar_ingesta_residente;

    PROCEDURE p_actualizar_ingesta (
        pcl_json IN CLOB
    ) IS
    BEGIN
        p_actualizar_ingesta_residente(pcl_json);
    END p_actualizar_ingesta;

END PKGCA_SMY_REGISTROS_ALIMENTACION;
/
