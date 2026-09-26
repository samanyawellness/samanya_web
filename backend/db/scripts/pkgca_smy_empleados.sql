-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_EMPLEADOS
-- FAMILIA: pkgca_ (Consultas avanzadas, filtros multi-criterio y SYS_REFCURSOR)
-- ENTIDAD: SMY_EMPLEADOS
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_EMPLEADOS
AS
    /*
    || =========================================================================
    || Paquete: PKGCA_SMY_EMPLEADOS
    || Propósito: Consultas multi-criterio y filtros del personal de talento humano.
    || Estándar: Familia pkgca_, parámetro pcl_json IN CLOB, extracción JSON_VALUE,
    ||           sintaxis tradicional Oracle (CERO ANSI JOIN).
    || =========================================================================
    */

    /**
     * Retorna cursor multi-fila con colaboradores filtrados por centro, estado o búsqueda textual
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "idEstado": 1,
     *   "filtroTexto": "Rodriguez"
     * }
     */
    PROCEDURE p_consultar_empleados (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

END PKGCA_SMY_EMPLEADOS;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_EMPLEADOS
AS

    PROCEDURE p_consultar_empleados (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
        v_id_centro    smy_empleados.id_centro%TYPE;
        v_id_estado    smy_empleados.id_estado_empleado%TYPE;
        v_filtro_texto VARCHAR2(150);
    BEGIN
        -- 1. Extracción de parámetros con JSON_VALUE obligatoria
        v_id_centro    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_estado    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEstado'));
        v_filtro_texto := JSON_VALUE(pcl_json, '$.filtroTexto');

        -- 2. Apertura de SYS_REFCURSOR con sintaxis tradicional Oracle (CERO ANSI JOIN)
        OPEN p_cursor FOR
            SELECT 
                e.id,
                e.id_centro,
                NVL(t.sigla, 'CC') AS tipo_identificacion,
                e.identificacion,
                e.nombres,
                e.apellidos,
                e.nombres || ' ' || e.apellidos AS nombre_completo,
                NVL(c.nombre_cargo_empleado, 'Cuidador') AS cargo,
                NVL(a.nombre_area_empleado, 'Cuidado Asistencial') AS area,
                e.unidad_asignada,
                e.telefono,
                NVL(e.email_corp, u.email) AS email,
                TO_CHAR(e.fecha_contratacion, 'YYYY-MM-DD') AS fecha_contratacion,
                NVL(es.nombre_estado_empleado, 'Activo') AS estado,
                u.id_archivo_foto_perfil,
                arc.ruta_completa_almacenamiento AS avatar_url
            FROM smy_empleados e,
                 smy_usuarios u,
                 smy_cargos_empleados c,
                 smy_areas_empleados a,
                 smy_estados_empleados es,
                 smy_tipos_identificacion t,
                 smy_archivos arc
            WHERE e.id_usuario = u.id(+)
              AND e.id_cargo_empleado = c.id(+)
              AND e.id_area_empleado = a.id(+)
              AND e.id_estado_empleado = es.id(+)
              AND e.id_tipo_identificacion = t.id(+)
              AND u.id_archivo_foto_perfil = arc.id(+)
              AND (v_id_centro IS NULL OR e.id_centro = v_id_centro)
              AND (v_id_estado IS NULL OR e.id_estado_empleado = v_id_estado)
              AND (v_filtro_texto IS NULL OR (
                    UPPER(e.nombres) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(e.apellidos) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(e.identificacion) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(c.nombre_cargo_empleado) LIKE '%' || UPPER(v_filtro_texto) || '%'
                  ))
            ORDER BY e.id;
    END p_consultar_empleados;

END PKGCA_SMY_EMPLEADOS;
/
