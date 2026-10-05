-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_MINUTAS_SEMANALES
-- FAMILIA: pkgca_ (Consultas avanzadas, filtros multi-criterio y DML mono-tabla no-PK)
-- ENTIDAD: SMY_MINUTAS_SEMANALES
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_MINUTAS_SEMANALES
AS
    /*
    || =========================================================================
    || Paquete: PKGCA_SMY_MINUTAS_SEMANALES
    || Propósito: Consultas operativas de minutas de alimentación y menús semanales.
    || Estándar: Familia pkgca_, parámetro pcl_json IN CLOB, extracción JSON_VALUE,
    ||           sintaxis tradicional Oracle (CERO ANSI JOIN).
    || =========================================================================
    */

    /**
     * Consulta minutas semanales de un centro por estado o rango de fechas
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "estado": "ACTIVO",
     *   "fecha": "2026-10-04"
     * }
     */
    PROCEDURE p_consultar_minutas_centro (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    /**
     * Consulta los ítems de una minuta semanal específica organizados por día y tiempo de comida
     * Parámetro pcl_json:
     * {
     *   "idMinuta": 1,
     *   "diaSemana": 1
     * }
     */
    PROCEDURE p_consultar_items_minuta (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    /**
     * DML mono-tabla: Desactiva minutas anteriores de una sede cuando se activa una nueva (no por PK)
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "actualizadoPor": "ADMIN"
     * }
     */
    PROCEDURE p_desactivar_minutas_anteriores (
        pcl_json IN CLOB
    );

END PKGCA_SMY_MINUTAS_SEMANALES;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_MINUTAS_SEMANALES
AS

    PROCEDURE p_consultar_minutas_centro (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    )
    IS
        v_id_centro   NUMBER;
        v_estado      VARCHAR2(20);
        v_fecha_str   VARCHAR2(20);
        v_fecha       DATE;
    BEGIN
        v_id_centro := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_estado    := JSON_VALUE(pcl_json, '$.estado');
        v_fecha_str := JSON_VALUE(pcl_json, '$.fecha');

        IF v_fecha_str IS NOT NULL THEN
            v_fecha := TO_DATE(v_fecha_str, 'YYYY-MM-DD');
        END IF;

        OPEN p_cursor FOR
            SELECT m.id,
                   m.id_centro,
                   c.nombre_centro AS nombre_centro,
                   m.nombre,
                   m.descripcion,
                   m.fecha_inicio,
                   m.fecha_fin,
                   m.estado,
                   m.creado_por,
                   m.fecha_creacion,
                   m.actualizado_por,
                   m.fecha_actualizacion
              FROM smy_minutas_semanales m,
                   smy_centros c
             WHERE m.id_centro = c.id
               AND (v_id_centro IS NULL OR m.id_centro = v_id_centro)
               AND (v_estado IS NULL OR m.estado = v_estado)
               AND (v_fecha IS NULL OR (m.fecha_inicio <= v_fecha AND m.fecha_fin >= v_fecha))
             ORDER BY m.fecha_inicio DESC, m.id DESC;
    END p_consultar_minutas_centro;

    PROCEDURE p_consultar_items_minuta (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    )
    IS
        v_id_minuta    NUMBER;
        v_dia_semana   NUMBER;
    BEGIN
        v_id_minuta  := TO_NUMBER(JSON_VALUE(pcl_json, '$.idMinuta'));
        v_dia_semana := TO_NUMBER(JSON_VALUE(pcl_json, '$.diaSemana'));

        OPEN p_cursor FOR
            SELECT mi.id,
                   mi.id_minuta,
                   mi.dia_semana,
                   CASE mi.dia_semana
                       WHEN 1 THEN 'Lunes'
                       WHEN 2 THEN 'Martes'
                       WHEN 3 THEN 'Miércoles'
                       WHEN 4 THEN 'Jueves'
                       WHEN 5 THEN 'Viernes'
                       WHEN 6 THEN 'Sábado'
                       WHEN 7 THEN 'Domingo'
                       ELSE 'Otro'
                   END AS nombre_dia,
                   mi.id_tiempo_comida,
                   tc.codigo AS codigo_tiempo,
                   tc.nombre AS nombre_tiempo_comida,
                   tc.hora_sugerida,
                   mi.plato_principal,
                   mi.acompanamiento,
                   mi.bebida,
                   mi.postre,
                   mi.calorias_estimadas,
                   mi.observaciones_dietas,
                   mi.creado_por,
                   mi.fecha_creacion
              FROM smy_minuta_items mi,
                   smy_tiempos_comida tc
             WHERE mi.id_tiempo_comida = tc.id
               AND mi.id_minuta = v_id_minuta
               AND (v_dia_semana IS NULL OR mi.dia_semana = v_dia_semana)
             ORDER BY mi.dia_semana ASC, tc.orden ASC;
    END p_consultar_items_minuta;

    PROCEDURE p_desactivar_minutas_anteriores (
        pcl_json IN CLOB
    )
    IS
        v_id_centro       NUMBER;
        v_actualizado_por VARCHAR2(100);
    BEGIN
        v_id_centro       := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_actualizado_por := NVL(JSON_VALUE(pcl_json, '$.actualizadoPor'), 'SISTEMA');

        UPDATE smy_minutas_semanales
           SET estado = 'INACTIVO',
               actualizado_por = v_actualizado_por,
               fecha_actualizacion = f_fecha_actual
         WHERE id_centro = v_id_centro
           AND estado = 'ACTIVO';
    END p_desactivar_minutas_anteriores;

END PKGCA_SMY_MINUTAS_SEMANALES;
/
