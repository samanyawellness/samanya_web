-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCN_SUPERADMIN
-- FAMILIA: pkgcn_ (Consultas y sentencias multi-tabla con JSON CLOB)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- REGLA 1: Parámetro de entrada en formato CLOB con JSON nativo.
-- REGLA 2: Nomenclatura SQL tradicional SIN cláusula JOIN (unión vía WHERE y (+)).
-- REGLA 3: Generación nativa de JSON con JSON_OBJECT y JSON_ARRAYAGG RETURNING CLOB.
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCN_SUPERADMIN
AS
    /*
    || =========================================================================
    || Paquete: PKGCN_SUPERADMIN
    || Propósito: Sentencias SQL multi-tabla y generación de JSON CLOB
    ||            para el módulo de Superusuario Principal de Samanya OS.
    ||            Sintaxis SQL tradicional sin JOIN.
    || Estándar: oracle-plsql-architecture (Familia pkgcn_)
    || =========================================================================
    */

    -- 1. Obtener datos de usuario para login en JSON CLOB
    FUNCTION fn_obtener_usuario_login_json (
        p_json IN CLOB
    ) RETURN CLOB;

    -- 2. Listar organizaciones con conteo de sedes en JSON CLOB
    FUNCTION fn_listar_organizaciones_json (
        p_json IN CLOB DEFAULT NULL
    ) RETURN CLOB;

    -- 3. Listar centros/sedes en JSON CLOB
    FUNCTION fn_listar_centros_json (
        p_json IN CLOB DEFAULT NULL
    ) RETURN CLOB;

    -- 4. Listar usuarios con roles y tipos en JSON CLOB
    FUNCTION fn_listar_usuarios_json (
        p_json IN CLOB DEFAULT NULL
    ) RETURN CLOB;

    -- 5. Listar parámetros globales filtrados en JSON CLOB
    FUNCTION fn_listar_parametros_json (
        p_json IN CLOB DEFAULT NULL
    ) RETURN CLOB;

    -- 6. Listar catálogo de tablas maestras dinámico en JSON CLOB
    FUNCTION fn_listar_catalogo_json (
        p_json IN CLOB
    ) RETURN CLOB;

    -- 7. Métricas del Dashboard y registros de auditoría en JSON CLOB
    FUNCTION fn_obtener_metricas_dashboard_json (
        p_json IN CLOB DEFAULT NULL
    ) RETURN CLOB;

END PKGCN_SUPERADMIN;
/

CREATE OR REPLACE PACKAGE BODY PKGCN_SUPERADMIN
AS

    -- -------------------------------------------------------------------------
    -- 1. DATOS DE USUARIO PARA LOGIN (SIN JOIN, ENTRADA JSON CLOB)
    -- -------------------------------------------------------------------------
    FUNCTION fn_obtener_usuario_login_json (
        p_json IN CLOB
    ) RETURN CLOB
    IS
        v_in_obj          JSON_OBJECT_T;
        v_usuario_o_email VARCHAR2(150);
        v_clob            CLOB;
    BEGIN
        IF p_json IS NOT NULL AND LENGTH(p_json) > 0 THEN
            v_in_obj          := JSON_OBJECT_T.parse(p_json);
            v_usuario_o_email := v_in_obj.get_string('usernameOrEmail');
        END IF;

        -- Sintaxis relacional tradicional Oracle (SIN JOIN)
        SELECT JSON_OBJECT(
                   'id'                   VALUE u.id,
                   'username'             VALUE u.username,
                   'email'                VALUE u.email,
                   'passwordHash'         VALUE u.password_hash,
                   'nombreCompleto'       VALUE u.nombre_completo,
                   'telefono'             VALUE u.telefono,
                   'idArchivo'            VALUE u.id_archivo_foto_perfil,
                   'avatarUrl'            VALUE arc.ruta_completa_almacenamiento,
                   'idTipoUsuario'        VALUE u.id_tipo_usuario,
                   'nombreTipoUsuario'    VALUE tu.nombre_tipo_usuario,
                   'idRol'                VALUE u.id_rol,
                   'codigoRol'            VALUE r.codigo,
                   'nombreRol'            VALUE r.nombre,
                   'idEstadoUsuario'      VALUE u.id_estado_usuario,
                   'nombreEstadoUsuario'  VALUE eu.nombre_estado_usuario,
                   'ultimoAcceso'         VALUE TO_CHAR(u.ultimo_acceso, 'YYYY-MM-DD"T"HH24:MI:SS')
                   RETURNING CLOB
               )
          INTO v_clob
          FROM smy_usuarios u,
               smy_tipos_usuarios tu,
               smy_roles r,
               smy_estados_usuarios eu,
               smy_archivos arc
         WHERE tu.id = u.id_tipo_usuario
           AND u.id_archivo_foto_perfil = arc.id(+)
           AND r.id = u.id_rol
           AND eu.id = u.id_estado_usuario
           AND (LOWER(u.username) = LOWER(TRIM(v_usuario_o_email))
            OR LOWER(u.email) = LOWER(TRIM(v_usuario_o_email)))
           AND ROWNUM = 1;

        RETURN v_clob;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END fn_obtener_usuario_login_json;

    -- -------------------------------------------------------------------------
    -- 2. LISTADO DE ORGANIZACIONES (SIN JOIN, ENTRADA JSON CLOB)
    -- -------------------------------------------------------------------------
    FUNCTION fn_listar_organizaciones_json (
        p_json IN CLOB DEFAULT NULL
    ) RETURN CLOB
    IS
        v_clob CLOB;
    BEGIN
        -- Sintaxis relacional tradicional Oracle (SIN JOIN)
        SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'id'                       VALUE o.id,
                       'codigoOrganizacion'       VALUE o.codigo_organizacion,
                       'razonSocial'              VALUE o.razon_social,
                       'nombreComercial'          VALUE o.nombre_comercial,
                       'numeroIdentificacionTrib' VALUE o.numero_identificacion_trib,
                       'idTipoIdentificacion'     VALUE o.id_tipo_identificacion,
                       'nombreTipoIdentificacion' VALUE ti.nombre_tipo_identificacion,
                       'emailCorporativo'         VALUE o.email_corporativo,
                       'telefonoContacto'         VALUE o.telefono_contacto,
                       'sitioWeb'                 VALUE o.sitio_web,
                       'idArchivo'                VALUE o.id_archivo_logo,
                       'logoUrl'                  VALUE arc.ruta_completa_almacenamiento,
                       'idEstadoOrganizacion'     VALUE o.id_estado_organizacion,
                       'nombreEstadoOrganizacion' VALUE eo.nombre_estado,
                       'fechaCreacion'            VALUE TO_CHAR(o.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                       'totalCentros'             VALUE (SELECT COUNT(*) FROM smy_centros c WHERE c.id_organizacion = o.id)
                       RETURNING CLOB
                   )
                   RETURNING CLOB
               )
          INTO v_clob
          FROM smy_organizaciones o,
               smy_tipos_identificacion ti,
               smy_estados_organizaciones eo,
               smy_archivos arc
         WHERE ti.id = o.id_tipo_identificacion
           AND o.id_archivo_logo = arc.id(+)
           AND eo.id = o.id_estado_organizacion
         ORDER BY o.id DESC;

        RETURN NVL(v_clob, '[]');
    END fn_listar_organizaciones_json;

    -- -------------------------------------------------------------------------
    -- 3. LISTADO DE CENTROS / SEDES (SIN JOIN, ENTRADA JSON CLOB)
    -- -------------------------------------------------------------------------
    FUNCTION fn_listar_centros_json (
        p_json IN CLOB DEFAULT NULL
    ) RETURN CLOB
    IS
        v_in_obj          JSON_OBJECT_T;
        v_id_organizacion NUMBER(10);
        v_clob            CLOB;
    BEGIN
        IF p_json IS NOT NULL AND LENGTH(p_json) > 0 THEN
            v_in_obj          := JSON_OBJECT_T.parse(p_json);
            v_id_organizacion := v_in_obj.get_number('idOrganizacion');
        END IF;

        -- Sintaxis relacional tradicional Oracle (SIN JOIN)
        SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'id'                  VALUE c.id,
                       'idOrganizacion'      VALUE c.id_organizacion,
                       'nombreOrganizacion'  VALUE o.nombre_comercial,
                       'codigoCentro'        VALUE c.codigo_centro,
                       'nombreCentro'        VALUE c.nombre_centro,
                       'slugDirectorio'      VALUE c.slug_directorio,
                       'ciudad'              VALUE c.ciudad,
                       'direccion'           VALUE c.direccion,
                       'telefono'            VALUE c.telefono,
                       'emailContacto'       VALUE c.email_contacto,
                       'capacidadResidentes' VALUE c.capacidad_residentes,
                       'idEstadoCentro'      VALUE c.id_estado_centro,
                       'fechaCreacion'       VALUE TO_CHAR(c.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                       'totalResidentes'     VALUE (SELECT COUNT(*) FROM smy_residentes r WHERE r.id_centro = c.id)
                       RETURNING CLOB
                   )
                   RETURNING CLOB
               )
          INTO v_clob
          FROM smy_centros c,
               smy_organizaciones o
         WHERE o.id = c.id_organizacion
           AND (v_id_organizacion IS NULL OR c.id_organizacion = v_id_organizacion)
         ORDER BY c.id DESC;

        RETURN NVL(v_clob, '[]');
    END fn_listar_centros_json;

    -- -------------------------------------------------------------------------
    -- 4. LISTADO DE USUARIOS (SIN JOIN, ENTRADA JSON CLOB)
    -- -------------------------------------------------------------------------
    FUNCTION fn_listar_usuarios_json (
        p_json IN CLOB DEFAULT NULL
    ) RETURN CLOB
    IS
        v_in_obj          JSON_OBJECT_T;
        v_id_rol          NUMBER(10);
        v_id_tipo_usuario NUMBER(10);
        v_id_estado       NUMBER(10);
        v_clob            CLOB;
    BEGIN
        IF p_json IS NOT NULL AND LENGTH(p_json) > 0 THEN
            v_in_obj          := JSON_OBJECT_T.parse(p_json);
            v_id_rol          := v_in_obj.get_number('idRol');
            v_id_tipo_usuario := v_in_obj.get_number('idTipoUsuario');
            v_id_estado       := v_in_obj.get_number('idEstado');
        END IF;

        -- Sintaxis relacional tradicional Oracle (SIN JOIN)
        SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'id'                       VALUE u.id,
                       'idRol'                    VALUE u.id_rol,
                       'codigoRol'                VALUE r.codigo,
                       'nombreRol'                VALUE r.nombre,
                       'idTipoUsuario'            VALUE u.id_tipo_usuario,
                       'nombreTipoUsuario'        VALUE tu.nombre_tipo_usuario,
                       'username'                 VALUE u.username,
                       'email'                    VALUE u.email,
                       'nombreCompleto'           VALUE u.nombre_completo,
                       'telefono'                 VALUE u.telefono,
                       'idArchivo'                VALUE u.id_archivo_foto_perfil,
                       'avatarUrl'                VALUE arc.ruta_completa_almacenamiento,
                       'idCanalNotifPref'         VALUE u.id_canal_notif_pref,
                       'nombreCanalNotificacion'  VALUE cn.nombre_canal_notificacion,
                       'idEstadoUsuario'          VALUE u.id_estado_usuario,
                       'nombreEstadoUsuario'      VALUE eu.nombre_estado_usuario,
                       'ultimoAcceso'             VALUE TO_CHAR(u.ultimo_acceso, 'YYYY-MM-DD"T"HH24:MI:SS'),
                       'fechaCreacion'            VALUE TO_CHAR(u.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS')
                       RETURNING CLOB
                   )
                   RETURNING CLOB
               )
          INTO v_clob
          FROM smy_usuarios u,
               smy_roles r,
               smy_tipos_usuarios tu,
               smy_canales_notificacion cn,
               smy_estados_usuarios eu,
               smy_archivos arc
         WHERE r.id = u.id_rol
           AND u.id_archivo_foto_perfil = arc.id(+)
           AND tu.id = u.id_tipo_usuario
           AND cn.id = u.id_canal_notif_pref
           AND eu.id = u.id_estado_usuario
           AND (v_id_rol IS NULL OR u.id_rol = v_id_rol)
           AND (v_id_tipo_usuario IS NULL OR u.id_tipo_usuario = v_id_tipo_usuario)
           AND (v_id_estado IS NULL OR u.id_estado_usuario = v_id_estado)
         ORDER BY u.id DESC;

        RETURN NVL(v_clob, '[]');
    END fn_listar_usuarios_json;

    -- -------------------------------------------------------------------------
    -- 5. LISTADO DE PARÁMETROS (SIN JOIN, ENTRADA JSON CLOB)
    -- -------------------------------------------------------------------------
    FUNCTION fn_listar_parametros_json (
        p_json IN CLOB DEFAULT NULL
    ) RETURN CLOB
    IS
        v_in_obj          JSON_OBJECT_T;
        v_grupo           VARCHAR2(50);
        v_id_organizacion NUMBER(10);
        v_id_centro       NUMBER(10);
        v_clob            CLOB;
    BEGIN
        IF p_json IS NOT NULL AND LENGTH(p_json) > 0 THEN
            v_in_obj          := JSON_OBJECT_T.parse(p_json);
            v_grupo           := v_in_obj.get_string('grupo');
            v_id_organizacion := v_in_obj.get_number('idOrganizacion');
            v_id_centro       := v_in_obj.get_number('idCentro');
        END IF;

        -- Sintaxis relacional tradicional Oracle con (+) para Outer Joins (SIN JOIN)
        SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'id'                       VALUE p.id,
                       'idOrganizacion'           VALUE p.id_organizacion,
                       'nombreOrganizacion'       VALUE o.nombre_comercial,
                       'idCentro'                 VALUE p.id_centro,
                       'nombreCentro'             VALUE c.nombre_centro,
                       'codigoParametro'          VALUE p.codigo_parametro,
                       'nombreParametro'          VALUE p.nombre_parametro,
                       'descripcion'              VALUE p.descripcion,
                       'grupoParametro'           VALUE p.grupo_parametro,
                       'valorTexto'               VALUE p.valor_texto,
                       'valorClob'                VALUE p.valor_clob,
                       'valorNumerico'            VALUE p.valor_numerico,
                       'valorFecha'               VALUE TO_CHAR(p.valor_fecha, 'YYYY-MM-DD"T"HH24:MI:SS'),
                       'esEncriptado'             VALUE p.es_encriptado,
                       'esSistema'                VALUE p.es_sistema,
                       'idEstadoParametro'        VALUE p.id_estado_parametro,
                       'nombreEstadoParametro'    VALUE ep.nombre_estado_parametro,
                       'fechaCreacion'            VALUE TO_CHAR(p.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                       'fechaUltimaModificacion'  VALUE TO_CHAR(p.fecha_ultima_modificacion, 'YYYY-MM-DD"T"HH24:MI:SS')
                       RETURNING CLOB
                   )
                   RETURNING CLOB
               )
          INTO v_clob
          FROM smy_parametros p,
               smy_organizaciones o,
               smy_centros c,
               smy_estados_parametros ep
         WHERE o.id(+) = p.id_organizacion
           AND c.id(+) = p.id_centro
           AND ep.id(+) = p.id_estado_parametro
           AND (v_grupo IS NULL OR UPPER(p.grupo_parametro) = UPPER(TRIM(v_grupo)))
           AND (v_id_organizacion IS NULL OR p.id_organizacion = v_id_organizacion)
           AND (v_id_centro IS NULL OR p.id_centro = v_id_centro)
         ORDER BY p.grupo_parametro ASC, p.codigo_parametro ASC;

        RETURN NVL(v_clob, '[]');
    END fn_listar_parametros_json;

    -- -------------------------------------------------------------------------
    -- 6. LISTADO DE TABLAS MAESTRAS (ENTRADA JSON CLOB, MULTI-TENANT POR ORGANIZACIÓN)
    -- -------------------------------------------------------------------------
    FUNCTION fn_listar_catalogo_json (
        p_json IN CLOB
    ) RETURN CLOB
    IS
        v_in_obj          JSON_OBJECT_T;
        v_tabla           VARCHAR2(60);
        v_id_organizacion NUMBER(10);
        v_clob            CLOB;
    BEGIN
        IF p_json IS NOT NULL AND LENGTH(p_json) > 0 THEN
            v_in_obj := JSON_OBJECT_T.parse(p_json);
            v_tabla  := UPPER(TRIM(v_in_obj.get_string('tabla')));
            IF v_in_obj.has('idOrganizacion') AND NOT v_in_obj.get('idOrganizacion').is_null THEN
                v_id_organizacion := v_in_obj.get_number('idOrganizacion');
            END IF;
        END IF;

        CASE v_tabla
            WHEN 'SMY_TIPOS_USUARIOS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_tipo_usuario,
                               'descripcion'     VALUE m.descripcion,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_tipos_usuarios m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_ROLES' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'codigo'          VALUE m.codigo,
                               'nombre'          VALUE m.nombre,
                               'descripcion'     VALUE m.descripcion,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_roles m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_ESTADOS_ROLES' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_estado_rol,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_estados_roles m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_ESTADOS_USUARIOS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_estado_usuario,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_estados_usuarios m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_CANALES_NOTIFICACION' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_canal_notificacion,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_canales_notificacion m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_TIPOS_IDENTIFICACION' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'codigo'          VALUE m.sigla,
                               'nombre'          VALUE m.nombre_tipo_identificacion,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_tipos_identificacion m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_ESTADOS_ORGANIZACIONES' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'            VALUE id,
                               'nombre'        VALUE nombre_estado,
                               'descripcion'   VALUE descripcion,
                               'fechaCreacion' VALUE TO_CHAR(fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_estados_organizaciones
                 ORDER BY id;

            WHEN 'SMY_ESTADOS_PARAMETROS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_estado_parametro,
                               'descripcion'     VALUE m.descripcion,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_estados_parametros m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_AREAS_EMPLEADOS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_area_empleado,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_areas_empleados m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_CARGOS_EMPLEADOS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_cargo_empleado,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_cargos_empleados m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_GENEROS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_genero,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_generos m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_NIVELES_MOVILIDAD' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_nivel_movilidad,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_niveles_movilidad m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_TIPOS_DIETAS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_tipo_dieta,
                               'descripcion'     VALUE m.descripcion,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_tipos_dietas m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_ESTADOS_RESIDENTES' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_estado_residente,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_estados_residentes m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_PARENTESCOS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_parentesco,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_parentescos m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_ESTADOS_EMPLEADOS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_estado_empleado,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_estados_empleados m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_TIPOS_TAREAS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_tipo_tarea,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_tipos_tareas m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_ESTADOS_TAREAS' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_estado_tarea,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_estados_tareas m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_TIPOS_INCIDENTES' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_tipo_incidente,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_tipos_incidentes m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_SEVERIDADES_INCIDENTES' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_severidad_incidente,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_severidades_incidentes m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            WHEN 'SMY_ESTADOS_INCIDENTES' THEN
                SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id'              VALUE m.id,
                               'idOrganizacion'  VALUE m.id_organizacion,
                               'organizacion'    VALUE o.razon_social,
                               'nombre'          VALUE m.nombre_estado_incidente,
                               'fechaCreacion'   VALUE TO_CHAR(m.fecha_creacion, 'YYYY-MM-DD')
                           ) RETURNING CLOB
                       )
                  INTO v_clob
                  FROM smy_estados_incidentes m,
                       smy_organizaciones o
                 WHERE o.id(+) = m.id_organizacion
                   AND (v_id_organizacion IS NULL OR m.id_organizacion = v_id_organizacion)
                 ORDER BY m.id;

            ELSE
                v_clob := '[]';
        END CASE;

        RETURN NVL(v_clob, '[]');
    END fn_listar_catalogo_json;

    -- -------------------------------------------------------------------------
    -- 7. MÉTRICAS Y AUDITORÍA RECIENTE (SIN JOIN, ENTRADA JSON CLOB)
    -- -------------------------------------------------------------------------
    FUNCTION fn_obtener_metricas_dashboard_json (
        p_json IN CLOB DEFAULT NULL
    ) RETURN CLOB
    IS
        v_metricas  CLOB;
        v_auditoria CLOB;
        v_resultado CLOB;
    BEGIN
        -- 1. Métricas cuantitativas
        SELECT JSON_OBJECT(
                   'totalOrganizacionesActivas' VALUE (SELECT COUNT(*) FROM smy_organizaciones WHERE id_estado_organizacion = 1),
                   'totalCentrosActivos'        VALUE (SELECT COUNT(*) FROM smy_centros WHERE id_estado_centro = 1),
                   'totalUsuariosActivos'       VALUE (SELECT COUNT(*) FROM smy_usuarios WHERE id_estado_usuario = 1),
                   'totalSuperusuarios'         VALUE (SELECT COUNT(*) FROM smy_usuarios WHERE id_tipo_usuario = 1),
                   'totalParametros'            VALUE (SELECT COUNT(*) FROM smy_parametros WHERE id_estado_parametro = 1),
                   'totalResidentes'            VALUE (SELECT COUNT(*) FROM smy_residentes)
                   RETURNING CLOB
               )
          INTO v_metricas
          FROM DUAL;

        -- 2. Últimos 20 registros de auditoría (SIN JOIN, usando coma y (+))
        SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'id'             VALUE a.id,
                       'idUsuario'      VALUE a.id_usuario,
                       'username'       VALUE a.username,
                       'nombreCompleto' VALUE a.nombre_completo,
                       'accion'         VALUE a.accion,
                       'direccionIp'    VALUE a.direccion_ip,
                       'detalles'       VALUE a.detalles,
                       'fechaCreacion'  VALUE TO_CHAR(a.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS')
                       RETURNING CLOB
                   )
                   RETURNING CLOB
               )
          INTO v_auditoria
          FROM (
              SELECT a.id,
                     a.id_usuario,
                     a.accion,
                     a.direccion_ip,
                     a.detalles,
                     a.fecha_creacion,
                     u.username,
                     u.nombre_completo
                FROM smy_auditoria_accesos a,
                     smy_usuarios u
               WHERE u.id(+) = a.id_usuario
               ORDER BY a.id DESC
               FETCH FIRST 20 ROWS ONLY
          ) a;

        -- 3. JSON unificado
        SELECT JSON_OBJECT(
                   'metricas'  VALUE JSON_QUERY(v_metricas, '$'),
                   'auditoria' VALUE JSON_QUERY(NVL(v_auditoria, '[]'), '$')
                   RETURNING CLOB
               )
          INTO v_resultado
          FROM DUAL;

        RETURN v_resultado;
    END fn_obtener_metricas_dashboard_json;

END PKGCN_SUPERADMIN;
/
