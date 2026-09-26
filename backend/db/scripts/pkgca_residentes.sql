-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_RESIDENTES
-- FAMILIA: pkgca_ (Consultas avanzadas, filtros multi-criterio, SYS_REFCURSOR y JSON nativo)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_RESIDENTES
AS
    /**
     * Retorna cursor multi-fila con censo de residentes activos filtrados por centro, estado o texto
     * Parámetro pcl_json: Documento JSON con filtros: { "idCentro": 1, "idEstado": 1, "filtroTexto": "Gomez" }
     */
    PROCEDURE p_consultar_censo (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    );

    /**
     * Retorna detalle clínico y general de un residente en formato JSON nativo (CLOB)
     * Parámetro pcl_json: Documento JSON con el ID del residente: { "idResidente": 1 }
     */
    FUNCTION f_obtener_ficha_json (
        pcl_json    IN  CLOB
    ) RETURN CLOB;

END PKGCA_RESIDENTES;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_RESIDENTES
AS

    PROCEDURE p_consultar_censo (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    ) IS
        v_id_centro    smy_residentes.id_centro%TYPE;
        v_id_estado    smy_residentes.id_estado_residente%TYPE;
        v_filtro_texto VARCHAR2(150);
    BEGIN
        -- Extracción obligatoria mediante JSON_VALUE
        v_id_centro    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_estado    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEstado'));
        v_filtro_texto := JSON_VALUE(pcl_json, '$.filtroTexto');

        -- Sintaxis tradicional Oracle (CERO JOIN, uniones externas con (+))
        OPEN p_cursor FOR
            SELECT 
                r.id,
                r.id_centro,
                c.nombre_centro,
                r.codigo_expediente,
                r.identificacion,
                r.nombres,
                r.apellidos,
                r.nombres || ' ' || r.apellidos AS nombre_completo,
                TRUNC(MONTHS_BETWEEN(f_fecha_actual, r.fecha_nacimiento) / 12) AS edad,
                TO_CHAR(r.fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento,
                r.habitacion,
                r.cama,
                r.id_archivo_foto_perfil,
                arc.ruta_completa_almacenamiento AS foto_url,
                NVL(m.nombre_nivel_movilidad, 'Independiente') AS nivel_movilidad,
                NVL(d.nombre_tipo_dieta, 'Normal / General') AS tipo_dieta,
                r.alertas_clinicas,
                NVL(e.nombre_estado_residente, 'Activo') AS estado
            FROM smy_residentes r,
                 smy_centros c,
                 smy_estados_residentes e,
                 smy_niveles_movilidad m,
                 smy_tipos_dietas d,
                 smy_archivos arc
            WHERE r.id_centro = c.id
              AND r.id_estado_residente = e.id
              AND r.id_nivel_movilidad = m.id(+)
              AND r.id_tipo_dieta = d.id(+)
              AND r.id_archivo_foto_perfil = arc.id(+)
              AND (v_id_centro IS NULL OR r.id_centro = v_id_centro)
              AND (v_id_estado IS NULL OR r.id_estado_residente = v_id_estado)
              AND (v_filtro_texto IS NULL OR (
                    UPPER(r.nombres) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(r.apellidos) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(r.habitacion) LIKE '%' || UPPER(v_filtro_texto) || '%' OR
                    UPPER(r.cama) LIKE '%' || UPPER(v_filtro_texto) || '%'
                  ))
            ORDER BY r.habitacion, r.cama;
    END p_consultar_censo;

    FUNCTION f_obtener_ficha_json (
        pcl_json    IN  CLOB
    ) RETURN CLOB IS
        v_id_residente smy_residentes.id%TYPE;
        vcl_resultado  CLOB;
    BEGIN
        -- Extracción obligatoria mediante JSON_VALUE
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));

        SELECT JSON_OBJECT(
            'id'                  VALUE r.id,
            'idCentro'            VALUE r.id_centro,
            'nombreCentro'        VALUE c.nombre_centro,
            'codigoExpediente'    VALUE r.codigo_expediente,
            'identificacion'      VALUE r.identificacion,
            'nombres'             VALUE r.nombres,
            'apellidos'           VALUE r.apellidos,
            'nombreCompleto'      VALUE r.nombres || ' ' || r.apellidos,
            'edad'                VALUE TRUNC(MONTHS_BETWEEN(f_fecha_actual, r.fecha_nacimiento) / 12),
            'fechaNacimiento'     VALUE TO_CHAR(r.fecha_nacimiento, 'YYYY-MM-DD'),
            'habitacion'          VALUE r.habitacion,
            'cama'                VALUE r.cama,
            'idArchivo'           VALUE r.id_archivo_foto_perfil,
            'fotoUrl'             VALUE arc.ruta_completa_almacenamiento,
            'eps'                 VALUE r.eps,
            'planComplementario'  VALUE r.plan_complementario,
            'tipoSangre'          VALUE r.tipo_sangre,
            'movilidad'           VALUE m.nombre_nivel_movilidad,
            'dieta'               VALUE d.nombre_tipo_dieta,
            'alertasClinicas'     VALUE r.alertas_clinicas,
            'estado'              VALUE e.nombre_estado_residente,
            'fechaIngreso'        VALUE TO_CHAR(r.fecha_ingreso, 'YYYY-MM-DD'),
            'responsables'        VALUE (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id'            VALUE a.id,
                        'nombres'       VALUE a.nombres,
                        'apellidos'     VALUE a.apellidos,
                        'parentesco'    VALUE p.nombre_parentesco,
                        'telefono'      VALUE a.telefono_principal,
                        'email'         VALUE a.email
                    ) RETURNING CLOB
                )
                FROM smy_residente_acudiente ra,
                     smy_acudientes a,
                     smy_parentescos p
                WHERE ra.id_acudiente = a.id
                  AND ra.id_parentesco = p.id
                  AND ra.id_residente = r.id
            )
            RETURNING CLOB
        )
        INTO vcl_resultado
        FROM smy_residentes r,
             smy_centros c,
             smy_estados_residentes e,
             smy_niveles_movilidad m,
             smy_tipos_dietas d,
             smy_archivos arc
        WHERE r.id_centro = c.id
          AND r.id_estado_residente = e.id
          AND r.id_nivel_movilidad = m.id(+)
          AND r.id_tipo_dieta = d.id(+)
          AND r.id_archivo_foto_perfil = arc.id(+)
          AND r.id = v_id_residente;

        RETURN vcl_resultado;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_obtener_ficha_json;

END PKGCA_RESIDENTES;
/
