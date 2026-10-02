-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_BITACORA_RESIDENTE
-- FAMILIA: pkgca_ (Consultas multi-criterio, SYS_REFCURSOR y JSON sobre SMY_BITACORA_RESIDENTE)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_BITACORA_RESIDENTE
AS
    /*
    || =========================================================================
    || Paquete: PKGCA_SMY_BITACORA_RESIDENTE
    || Propósito: Capa de consultas y filtros multi-criterio para la bitácora
    ||            asistencial y de novedades de los residentes.
    || Estándar: Sin ANSI JOIN, parámetros CLOB JSON con JSON_VALUE,
    ||           retorno multi-fila mediante SYS_REFCURSOR y JSON nativo.
    || =========================================================================
    */

    /**
     * Retorna cursor multi-fila con las anotaciones de bitácora de un residente ordenadas cronológicamente
     * Parámetro pcl_json:
     * {
     *   "idResidente": 1,
     *   "idCategoriaBitacora": 1,
     *   "fechaInicio": "2026-01-01",
     *   "fechaFin": "2026-12-31"
     * }
     */
    PROCEDURE p_consultar_por_residente (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    );

    /**
     * Retorna documento JSON con las anotaciones de bitácora del residente
     * Parámetro pcl_json:
     * {
     *   "idResidente": 1
     * }
     */
    FUNCTION f_consultar_por_residente_json (
        pcl_json IN CLOB
    ) RETURN CLOB;

END PKGCA_SMY_BITACORA_RESIDENTE;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_BITACORA_RESIDENTE
AS

    PROCEDURE p_consultar_por_residente (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    ) IS
        v_id_residente          NUMBER;
        v_id_categoria          NUMBER;
        v_fecha_inicio_str      VARCHAR2(30);
        v_fecha_fin_str         VARCHAR2(30);
        v_fecha_inicio          DATE;
        v_fecha_fin             DATE;
    BEGIN
        v_id_residente     := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_id_categoria     := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCategoriaBitacora'));
        v_fecha_inicio_str := JSON_VALUE(pcl_json, '$.fechaInicio');
        v_fecha_fin_str    := JSON_VALUE(pcl_json, '$.fechaFin');

        IF v_fecha_inicio_str IS NOT NULL AND LENGTH(TRIM(v_fecha_inicio_str)) >= 10 THEN
            v_fecha_inicio := TO_DATE(SUBSTR(v_fecha_inicio_str, 1, 10), 'YYYY-MM-DD');
        END IF;

        IF v_fecha_fin_str IS NOT NULL AND LENGTH(TRIM(v_fecha_fin_str)) >= 10 THEN
            v_fecha_fin := TO_DATE(SUBSTR(v_fecha_fin_str, 1, 10), 'YYYY-MM-DD');
        END IF;

        -- Consulta multi-tabla tradicional Oracle (CERO JOIN ANSI)
        OPEN p_cursor FOR
            SELECT 
                b.id,
                b.id_residente,
                r.nombres || ' ' || r.apellidos AS nombre_residente,
                r.habitacion,
                r.cama,
                b.id_empleado,
                NVL(e.nombres || ' ' || e.apellidos, 'Personal de Turno') AS nombre_empleado,
                b.id_usuario,
                NVL(u.nombre_completo, 'Usuario del Sistema') AS nombre_usuario,
                TO_CHAR(b.fecha, 'YYYY-MM-DD') AS fecha,
                b.hora,
                b.id_categoria_bitacora,
                NVL(c.nombre_categoria_bitacora, 'Rutina') AS categoria,
                b.contenido,
                b.grabado_por_voz,
                b.visible_acudiente,
                TO_CHAR(b.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_creacion
            FROM smy_bitacora_residente b,
                 smy_residentes r,
                 smy_empleados e,
                 smy_usuarios u,
                 smy_categorias_bitacora c
            WHERE b.id_residente = r.id
              AND b.id_empleado = e.id(+)
              AND b.id_usuario = u.id(+)
              AND b.id_categoria_bitacora = c.id(+)
              AND b.id_residente = v_id_residente
              AND (v_id_categoria IS NULL OR b.id_categoria_bitacora = v_id_categoria)
              AND (v_fecha_inicio IS NULL OR b.fecha >= v_fecha_inicio)
              AND (v_fecha_fin IS NULL OR b.fecha <= v_fecha_fin)
            ORDER BY b.fecha DESC, b.hora DESC, b.id DESC;
    END p_consultar_por_residente;

    FUNCTION f_consultar_por_residente_json (
        pcl_json IN CLOB
    ) RETURN CLOB IS
        v_id_residente NUMBER;
        v_json_clob    CLOB;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));

        -- Retorno nativo JSON con JSON_ARRAYAGG y JSON_OBJECT (CERO ANSI JOIN)
        SELECT NVL(
                   JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'id'                 VALUE b.id,
                           'idResidente'        VALUE b.id_residente,
                           'nombreResidente'    VALUE r.nombres || ' ' || r.apellidos,
                           'habitacion'         VALUE r.habitacion,
                           'cama'               VALUE r.cama,
                           'idEmpleado'         VALUE b.id_empleado,
                           'nombreEmpleado'     VALUE NVL(e.nombres || ' ' || e.apellidos, 'Personal de Turno'),
                           'idUsuario'          VALUE b.id_usuario,
                           'nombreUsuario'      VALUE NVL(u.nombre_completo, 'Usuario del Sistema'),
                           'fecha'              VALUE TO_CHAR(b.fecha, 'YYYY-MM-DD'),
                           'hora'               VALUE b.hora,
                           'idCategoriaBitacora' VALUE b.id_categoria_bitacora,
                           'categoria'          VALUE NVL(c.nombre_categoria_bitacora, 'Rutina'),
                           'contenido'          VALUE b.contenido,
                           'grabadoPorVoz'      VALUE b.grabado_por_voz,
                           'visibleAcudiente'   VALUE b.visible_acudiente,
                           'fechaCreacion'      VALUE TO_CHAR(b.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS')
                       )
                       ORDER BY b.fecha DESC, b.hora DESC, b.id DESC
                       RETURNING CLOB
                   ),
                   '[]'
               )
          INTO v_json_clob
          FROM smy_bitacora_residente b,
               smy_residentes r,
               smy_empleados e,
               smy_usuarios u,
               smy_categorias_bitacora c
         WHERE b.id_residente = r.id(+)
           AND b.id_empleado = e.id(+)
           AND b.id_usuario = u.id(+)
           AND b.id_categoria_bitacora = c.id(+)
           AND b.id_residente = v_id_residente;

        RETURN v_json_clob;
    END f_consultar_por_residente_json;

END PKGCA_SMY_BITACORA_RESIDENTE;
/
