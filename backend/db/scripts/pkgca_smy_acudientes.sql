-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_ACUDIENTES
-- FAMILIA: pkgca_ (Consultas avanzadas, filtros multi-criterio y SYS_REFCURSOR)
-- ENTIDAD: SMY_ACUDIENTES
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_ACUDIENTES
AS
    /*
    || =========================================================================
    || Paquete: PKGCA_SMY_ACUDIENTES
    || Propósito: Consultas multi-criterio y listados de familiares y acudientes.
    || Estándar: Familia pkgca_, parámetro pcl_json IN CLOB, extracción JSON_VALUE,
    ||           sintaxis tradicional Oracle (CERO ANSI JOIN).
    || =========================================================================
    */

    /**
     * Retorna cursor multi-fila con familiares y sus residentes asociados
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "filtroTexto": "Delgado"
     * }
     */
    PROCEDURE p_consultar_acudientes (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

END PKGCA_SMY_ACUDIENTES;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_ACUDIENTES
AS

    PROCEDURE p_consultar_acudientes (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
        v_id_centro    smy_residentes.id_centro%TYPE;
        v_filtro_texto VARCHAR2(150);
    BEGIN
        -- 1. Extracción de parámetros con JSON_VALUE obligatoria
        v_id_centro    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_filtro_texto := JSON_VALUE(pcl_json, '$.filtroTexto');

        -- 2. Apertura de SYS_REFCURSOR con sintaxis tradicional Oracle (CERO ANSI JOIN)
        OPEN p_cursor FOR
            SELECT 
                a.id,
                NVL(t.sigla, 'CC') AS tipo_identificacion,
                a.identificacion,
                a.nombres,
                a.apellidos,
                a.nombres || ' ' || a.apellidos AS nombre_completo,
                a.telefono_principal,
                a.telefono_secundario,
                a.email,
                a.direccion,
                a.ciudad,
                NVL(cn.nombre_canal_notificacion, 'WhatsApp') AS canal_notificacion_pref,
                u.id_archivo_foto_perfil,
                arc.ruta_completa_almacenamiento AS avatar_url,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'idResidente'        VALUE ra.id_residente,
                            'nombreResidente'    VALUE (r.nombres || ' ' || r.apellidos),
                            'parentesco'         VALUE NVL(p.nombre_parentesco, 'Familiar'),
                            'esPrincipal'        VALUE CASE WHEN ra.es_principal = 'S' OR ra.es_principal = '1' THEN 1 ELSE 0 END,
                            'autorizadoSalidas'  VALUE CASE WHEN ra.autorizado_salidas = 'S' OR ra.autorizado_salidas = '1' THEN 1 ELSE 0 END,
                            'responsablePago'    VALUE CASE WHEN ra.es_responsable_pago = 'S' OR ra.es_responsable_pago = '1' THEN 1 ELSE 0 END
                        ) RETURNING CLOB
                    )
                    FROM smy_residente_acudiente ra,
                         smy_residentes r,
                         smy_parentescos p
                    WHERE ra.id_acudiente = a.id
                      AND ra.id_residente = r.id
                      AND ra.id_parentesco = p.id(+)
                ) AS residentes_asociados_json
            FROM smy_acudientes a,
                 smy_usuarios u,
                 smy_tipos_identificacion t,
                 smy_canales_notificacion cn,
                 smy_archivos arc
            WHERE a.id_usuario = u.id(+)
              AND a.id_tipo_identificacion = t.id(+)
              AND a.id_canal_notif_pref = cn.id(+)
              AND u.id_archivo_foto_perfil = arc.id(+)
              AND (v_filtro_texto IS NULL OR (
                    UPPER(a.nombres) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(a.apellidos) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(a.identificacion) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(a.email) LIKE '%' || UPPER(v_filtro_texto) || '%'
                  ))
              AND (v_id_centro IS NULL OR EXISTS (
                    SELECT 1
                      FROM smy_residente_acudiente ra2,
                           smy_residentes r2
                     WHERE ra2.id_acudiente = a.id
                       AND ra2.id_residente = r2.id
                       AND r2.id_centro = v_id_centro
                  ))
            ORDER BY a.id;
    END p_consultar_acudientes;

END PKGCA_SMY_ACUDIENTES;
/
