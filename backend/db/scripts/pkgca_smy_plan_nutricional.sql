-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_PLAN_NUTRICIONAL
-- FAMILIA: pkgca_ (Consultas avanzadas, filtros multi-criterio y DML mono-tabla no-PK)
-- ENTIDAD: SMY_PLAN_NUTRICIONAL
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_PLAN_NUTRICIONAL
AS
    /*
    || =========================================================================
    || Paquete: PKGCA_SMY_PLAN_NUTRICIONAL
    || Propósito: Consultas avanzadas, filtros y operaciones no-PK sobre planes nutricionales.
    || Estándar: Familia pkgca_, parámetro pcl_json IN CLOB, extracción JSON_VALUE,
    ||           sintaxis tradicional Oracle (CERO ANSI JOIN).
    || =========================================================================
    */

    /**
     * Consulta el censo nutricional de residentes de una sede con sus dietas y consistencias
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "idTipoDieta": 2,
     *   "idConsistencia": 1,
     *   "filtroTexto": "Delgado"
     * }
     */
    PROCEDURE p_consultar_censo_nutricional (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    /**
     * Consulta el plan nutricional individual de un residente por su ID_RESIDENTE
     * Parámetro pcl_json:
     * {
     *   "idResidente": 10
     * }
     */
    PROCEDURE p_consultar_por_residente (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    /**
     * DML mono-tabla: Actualiza o sincroniza el plan nutricional por ID_RESIDENTE (no por PK)
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "idResidente": 10,
     *   "idTipoDieta": 2,
     *   "idConsistencia": 1,
     *   "idNivelEspesante": null,
     *   "requerimientoCaloricoKcal": 1800,
     *   "restriccionesAlergias": "Sin sal",
     *   "alimentosPreferidos": "Frutas",
     *   "alimentosRechazados": "Cebolla",
     *   "requiereAsistencia": "S",
     *   "suplementoNutricional": "Ensure",
     *   "observaciones": "Buena ingesta",
     *   "usuario": "NUTRICIONISTA"
     * }
     */
    PROCEDURE p_actualizar_por_residente (
        pcl_json IN CLOB
    );

    /**
     * Consulta planes nutricionales de una sede (alias operativo de censo)
     */
    PROCEDURE p_consultar_planes_centro (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    /**
     * DML mono-tabla: Inactiva planes nutricionales anteriores de un residente (no por PK)
     */
    PROCEDURE p_inactivar_planes_anteriores (
        pcl_json IN CLOB
    );

END PKGCA_SMY_PLAN_NUTRICIONAL;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_PLAN_NUTRICIONAL
AS

    PROCEDURE p_consultar_censo_nutricional (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
        v_id_centro            smy_plan_nutricional.id_centro%TYPE;
        v_id_tipo_dieta        smy_plan_nutricional.id_tipo_dieta%TYPE;
        v_id_consistencia      smy_plan_nutricional.id_consistencia%TYPE;
        v_filtro_texto         VARCHAR2(150);
    BEGIN
        v_id_centro       := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_tipo_dieta   := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoDieta'));
        v_id_consistencia := TO_NUMBER(JSON_VALUE(pcl_json, '$.idConsistencia'));
        v_filtro_texto    := JSON_VALUE(pcl_json, '$.filtroTexto');

        OPEN p_cursor FOR
            SELECT 
                r.id AS id_residente,
                r.id_centro,
                r.nombres,
                r.apellidos,
                r.nombres || ' ' || r.apellidos AS nombre_completo,
                r.identificacion,
                r.habitacion,
                r.cama,
                r.id_archivo_foto_perfil,
                p.id AS id_plan_nutricional,
                NVL(td.id, r.id_tipo_dieta) AS id_tipo_dieta,
                NVL(td.nombre_tipo_dieta, 'Normal / General') AS tipo_dieta,
                NVL(cd.id, 1) AS id_consistencia,
                NVL(cd.nombre_consistencia_dieta, 'Sólida / Normal') AS consistencia_dieta,
                ne.id AS id_nivel_espesante,
                NVL(ne.nombre, 'Sin Espesante') AS nivel_espesante,
                p.requerimiento_calorico_kcal,
                p.restricciones_alergias,
                p.alimentos_preferidos,
                p.alimentos_rechazados,
                NVL(p.requiere_asistencia, 'N') AS requiere_asistencia,
                p.suplemento_nutricional,
                p.observaciones,
                TO_CHAR(p.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_actualizacion
            FROM smy_residentes r,
                 smy_plan_nutricional p,
                 smy_tipos_dietas td,
                 smy_consistencias_dieta cd,
                 smy_niveles_espesante ne
            WHERE r.id = p.id_residente(+)
              AND p.id_tipo_dieta = td.id(+)
              AND p.id_consistencia = cd.id(+)
              AND p.id_nivel_espesante = ne.id(+)
              AND (v_id_centro IS NULL OR r.id_centro = v_id_centro)
              AND (v_id_tipo_dieta IS NULL OR p.id_tipo_dieta = v_id_tipo_dieta OR r.id_tipo_dieta = v_id_tipo_dieta)
              AND (v_id_consistencia IS NULL OR p.id_consistencia = v_id_consistencia)
              AND (v_filtro_texto IS NULL OR (
                    UPPER(r.nombres) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(r.apellidos) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(r.identificacion) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(p.restricciones_alergias) LIKE '%' || UPPER(v_filtro_texto) || '%'
                  ))
            ORDER BY r.habitacion, r.cama, r.apellidos, r.nombres;
    END p_consultar_censo_nutricional;

    PROCEDURE p_consultar_por_residente (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
        v_id_residente smy_plan_nutricional.id_residente%TYPE;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));

        OPEN p_cursor FOR
            SELECT 
                p.id,
                p.id_centro,
                p.id_residente,
                r.nombres || ' ' || r.apellidos AS nombre_residente,
                r.habitacion,
                r.cama,
                p.id_tipo_dieta,
                NVL(td.nombre_tipo_dieta, 'Normal / General') AS tipo_dieta,
                p.id_consistencia,
                NVL(cd.nombre_consistencia_dieta, 'Sólida / Normal') AS consistencia_dieta,
                p.id_nivel_espesante,
                ne.nombre AS nivel_espesante,
                p.requerimiento_calorico_kcal,
                p.restricciones_alergias,
                p.alimentos_preferidos,
                p.alimentos_rechazados,
                p.requiere_asistencia,
                p.suplemento_nutricional,
                p.observaciones,
                p.estado,
                TO_CHAR(p.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_creacion,
                TO_CHAR(p.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_actualizacion
            FROM smy_plan_nutricional p,
                 smy_residentes r,
                 smy_tipos_dietas td,
                 smy_consistencias_dieta cd,
                 smy_niveles_espesante ne
            WHERE p.id_residente = r.id
              AND p.id_tipo_dieta = td.id(+)
              AND p.id_consistencia = cd.id(+)
              AND p.id_nivel_espesante = ne.id(+)
              AND p.id_residente = v_id_residente;
    END p_consultar_por_residente;

    PROCEDURE p_actualizar_por_residente (
        pcl_json IN CLOB
    ) IS
        v_id_residente          smy_plan_nutricional.id_residente%TYPE;
        v_id_centro             smy_plan_nutricional.id_centro%TYPE;
        v_id_tipo_dieta         smy_plan_nutricional.id_tipo_dieta%TYPE;
        v_id_consistencia       smy_plan_nutricional.id_consistencia%TYPE;
        v_id_nivel_espesante    smy_plan_nutricional.id_nivel_espesante%TYPE;
        v_calorias              smy_plan_nutricional.requerimiento_calorico_kcal%TYPE;
        v_restricciones         smy_plan_nutricional.restricciones_alergias%TYPE;
        v_preferidos            smy_plan_nutricional.alimentos_preferidos%TYPE;
        v_rechazados            smy_plan_nutricional.alimentos_rechazados%TYPE;
        v_asistencia            smy_plan_nutricional.requiere_asistencia%TYPE;
        v_suplemento            smy_plan_nutricional.suplemento_nutricional%TYPE;
        v_observaciones         smy_plan_nutricional.observaciones%TYPE;
        v_usuario               VARCHAR2(100);
    BEGIN
        v_id_residente       := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_id_centro          := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_tipo_dieta      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoDieta'));
        v_id_consistencia    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idConsistencia'));
        v_id_nivel_espesante := TO_NUMBER(JSON_VALUE(pcl_json, '$.idNivelEspesante'));
        v_calorias           := TO_NUMBER(JSON_VALUE(pcl_json, '$.requerimientoCaloricoKcal'));
        v_restricciones      := JSON_VALUE(pcl_json, '$.restriccionesAlergias');
        v_preferidos         := JSON_VALUE(pcl_json, '$.alimentosPreferidos');
        v_rechazados         := JSON_VALUE(pcl_json, '$.alimentosRechazados');
        v_asistencia         := NVL(JSON_VALUE(pcl_json, '$.requiereAsistencia'), 'N');
        v_suplemento         := JSON_VALUE(pcl_json, '$.suplementoNutricional');
        v_observaciones      := JSON_VALUE(pcl_json, '$.observaciones');
        v_usuario            := NVL(JSON_VALUE(pcl_json, '$.usuario'), 'SISTEMA');

        UPDATE smy_plan_nutricional
           SET id_tipo_dieta               = v_id_tipo_dieta,
               id_consistencia             = v_id_consistencia,
               id_nivel_espesante          = v_id_nivel_espesante,
               requerimiento_calorico_kcal = v_calorias,
               restricciones_alergias      = v_restricciones,
               alimentos_preferidos        = v_preferidos,
               alimentos_rechazados        = v_rechazados,
               requiere_asistencia         = v_asistencia,
               suplemento_nutricional      = v_suplemento,
               observaciones               = v_observaciones,
               fecha_actualizacion         = f_fecha_actual,
               actualizado_por             = v_usuario
         WHERE id_residente = v_id_residente;
    END p_actualizar_por_residente;

    PROCEDURE p_consultar_planes_centro (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
    BEGIN
        p_consultar_censo_nutricional(pcl_json, p_cursor);
    END p_consultar_planes_centro;

    PROCEDURE p_inactivar_planes_anteriores (
        pcl_json IN CLOB
    ) IS
        v_id_residente NUMBER;
        v_usuario      VARCHAR2(100);
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_usuario      := NVL(JSON_VALUE(pcl_json, '$.actualizadoPor'), 'SISTEMA');

        UPDATE smy_plan_nutricional
           SET estado = 'INACTIVO',
               actualizado_por = v_usuario,
               fecha_actualizacion = f_fecha_actual
         WHERE id_residente = v_id_residente
           AND estado = 'ACTIVO';
    END p_inactivar_planes_anteriores;

END PKGCA_SMY_PLAN_NUTRICIONAL;
/
