-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCN_ALIMENTACION
-- FAMILIA: pkgcn_ (Sentencias DML de proceso multi-tabla y SELECT multi-tabla nativos JSON)
-- PROCESO: Gestión de Alimentación y Nutrición
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCN_ALIMENTACION
AS
    /*
    || =========================================================================
    || Paquete: PKGCN_ALIMENTACION
    || Propósito: Procesos multi-tabla de alimentación y consultas JSON consolidadas.
    || Estándar: Familia pkgcn_, parámetro pcl_json IN CLOB, extracción JSON_VALUE,
    ||           sintaxis tradicional Oracle (CERO ANSI JOIN), JSON_OBJECT nativo.
    || =========================================================================
    */

    /**
     * DML multi-tabla: Precarga registros de ingesta para todos los residentes activos
     * de una sede que tengan plan nutricional activo y aún no tengan registro para la fecha/tiempo.
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "idTiempoComida": 3,
     *   "fecha": "2026-10-04",
     *   "creadoPor": "SISTEMA"
     * }
     */
    PROCEDURE p_precargar_ingestas_dia (
        pcl_json IN CLOB
    );

    /**
     * Consulta multi-tabla que retorna el JSON consolidado de una minuta semanal con sus items
     * Parámetro pcl_json:
     * {
     *   "idMinuta": 1
     * }
     */
    FUNCTION f_minuta_completa_json (
        pcl_json IN CLOB
    ) RETURN CLOB;

    /**
     * Consulta multi-tabla que retorna el resumen consolidado en JSON del comedor del día
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "idTiempoComida": 3,
     *   "fecha": "2026-10-04"
     * }
     */
    FUNCTION f_resumen_comedor_dia_json (
        pcl_json IN CLOB
    ) RETURN CLOB;

END PKGCN_ALIMENTACION;
/

CREATE OR REPLACE PACKAGE BODY PKGCN_ALIMENTACION
AS

    PROCEDURE p_precargar_ingestas_dia (
        pcl_json IN CLOB
    )
    IS
        v_id_centro        NUMBER;
        v_id_tiempo_comida NUMBER;
        v_fecha_str        VARCHAR2(20);
        v_fecha            DATE;
        v_creado_por       VARCHAR2(100);
    BEGIN
        v_id_centro        := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_tiempo_comida := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTiempoComida'));
        v_fecha_str        := JSON_VALUE(pcl_json, '$.fecha');
        v_creado_por       := NVL(JSON_VALUE(pcl_json, '$.creadoPor'), 'SISTEMA');

        IF v_fecha_str IS NOT NULL THEN
            v_fecha := TO_DATE(v_fecha_str, 'YYYY-MM-DD');
        ELSE
            v_fecha := TRUNC(f_fecha_actual);
        END IF;

        -- Inserción multi-tabla: Residentes activos con plan nutricional que no tienen registro
        INSERT INTO smy_registros_alimentacion (
            id,
            id_centro,
            id_residente,
            fecha,
            id_tiempo_comida,
            id_plan_nutricional,
            porcentaje_ingesta,
            asistio,
            creado_por,
            fecha_creacion
        )
        SELECT seq_smy_registros_alimentacion.NEXTVAL,
               r.id_centro,
               r.id,
               v_fecha,
               v_id_tiempo_comida,
               pn.id,
               0,
               'N',
               v_creado_por,
               f_fecha_actual
          FROM smy_residentes r,
               smy_estados_residentes e,
               smy_plan_nutricional pn
         WHERE r.id_estado_residente = e.id
           AND r.id = pn.id_residente
           AND pn.estado = 'ACTIVO'
           AND UPPER(e.nombre_estado_residente) = 'ACTIVO'
           AND r.id_centro = v_id_centro
           AND NOT EXISTS (
               SELECT 1
                 FROM smy_registros_alimentacion ra
                WHERE ra.id_residente = r.id
                  AND ra.fecha = v_fecha
                  AND ra.id_tiempo_comida = v_id_tiempo_comida
           );
    END p_precargar_ingestas_dia;

    FUNCTION f_minuta_completa_json (
        pcl_json IN CLOB
    ) RETURN CLOB
    IS
        v_id_minuta NUMBER;
        v_resultado CLOB;
    BEGIN
        v_id_minuta := TO_NUMBER(JSON_VALUE(pcl_json, '$.idMinuta'));

        SELECT JSON_OBJECT(
                   'id' VALUE m.id,
                   'idCentro' VALUE m.id_centro,
                   'nombreCentro' VALUE c.nombre_centro,
                   'nombre' VALUE m.nombre,
                   'descripcion' VALUE m.descripcion,
                   'fechaInicio' VALUE TO_CHAR(m.fecha_inicio, 'YYYY-MM-DD'),
                   'fechaFin' VALUE TO_CHAR(m.fecha_fin, 'YYYY-MM-DD'),
                   'estado' VALUE m.estado,
                   'items' VALUE (
                       SELECT JSON_ARRAYAGG(
                                  JSON_OBJECT(
                                      'id' VALUE mi.id,
                                      'diaSemana' VALUE mi.dia_semana,
                                      'idTiempoComida' VALUE mi.id_tiempo_comida,
                                      'tiempoComida' VALUE tc.nombre,
                                      'horaSugerida' VALUE tc.hora_sugerida,
                                      'platoPrincipal' VALUE mi.plato_principal,
                                      'acompanamiento' VALUE mi.acompanamiento,
                                      'bebida' VALUE mi.bebida,
                                      'postre' VALUE mi.postre,
                                      'caloriasEstimadas' VALUE mi.calorias_estimadas,
                                      'observacionesDietas' VALUE mi.observaciones_dietas
                                  ) RETURNING CLOB
                              )
                         FROM smy_minuta_items mi,
                              smy_tiempos_comida tc
                        WHERE mi.id_tiempo_comida = tc.id
                          AND mi.id_minuta = m.id
                   )
                   RETURNING CLOB
               )
          INTO v_resultado
          FROM smy_minutas_semanales m,
               smy_centros c
         WHERE m.id_centro = c.id
           AND m.id = v_id_minuta;

        RETURN v_resultado;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_minuta_completa_json;

    FUNCTION f_resumen_comedor_dia_json (
        pcl_json IN CLOB
    ) RETURN CLOB
    IS
        v_id_centro        NUMBER;
        v_id_tiempo_comida NUMBER;
        v_fecha_str        VARCHAR2(20);
        v_fecha            DATE;
        v_resultado        CLOB;
    BEGIN
        v_id_centro        := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_tiempo_comida := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTiempoComida'));
        v_fecha_str        := JSON_VALUE(pcl_json, '$.fecha');

        IF v_fecha_str IS NOT NULL THEN
            v_fecha := TO_DATE(v_fecha_str, 'YYYY-MM-DD');
        ELSE
            v_fecha := TRUNC(f_fecha_actual);
        END IF;

        SELECT JSON_OBJECT(
                   'fecha' VALUE TO_CHAR(v_fecha, 'YYYY-MM-DD'),
                   'idCentro' VALUE v_id_centro,
                   'idTiempoComida' VALUE v_id_tiempo_comida,
                   'tiempoComida' VALUE (SELECT nombre FROM smy_tiempos_comida WHERE id = v_id_tiempo_comida),
                   'totalEsperados' VALUE COUNT(ra.id),
                   'totalAsistieron' VALUE COUNT(CASE WHEN ra.asistio = 'S' THEN 1 END),
                   'totalBajaIngesta' VALUE COUNT(CASE WHEN ra.asistio = 'S' AND ra.porcentaje_ingesta < 50 THEN 1 END),
                   'promedioIngesta' VALUE NVL(ROUND(AVG(CASE WHEN ra.asistio = 'S' THEN ra.porcentaje_ingesta END), 2), 0)
                   RETURNING CLOB
               )
          INTO v_resultado
          FROM smy_registros_alimentacion ra,
               smy_residentes r
         WHERE ra.id_residente = r.id
           AND ra.id_centro = v_id_centro
           AND ra.id_tiempo_comida = v_id_tiempo_comida
           AND ra.fecha = v_fecha;

        RETURN v_resultado;
    END f_resumen_comedor_dia_json;

END PKGCN_ALIMENTACION;
/
