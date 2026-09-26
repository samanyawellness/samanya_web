-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_SUPERADMIN
-- FAMILIA: pkgln_ (Lógica de Negocio, validaciones y orquestación del Superusuario)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- REGLA ESTRICTA 1: CERO sentencias SQL directas (CERO SELECT, CERO INSERT,
--                   CERO UPDATE, CERO DELETE). Toda consulta va por pkgcn_
--                   o DAOs; todo DML por DAOs o pkgcn_.
-- REGLA ESTRICTA 2: Toda interacción de entrada y salida se realiza mediante
--                   un parámetro CLOB que contiene un JSON nativo.
-- REGLA ESTRICTA 3: COMMIT controlado mediante p_do_commit; captura con uti_ge_excepciones_pkg.
-- REGLA ESTRICTA 4: Validación mandatoria de ID_TIPO_USUARIO = 1 para ingreso.
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_SUPERADMIN
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_SUPERADMIN
    || Propósito: Orquestación de Lógica de Negocio para el Superusuario Principal.
    ||            Maneja entrada/salida 100% JSON en parámetros CLOB y delega
    ||            las consultas multi-tabla a PKGCN_SUPERADMIN y el acceso a datos
    ||            mono-tabla por PK a los paquetes DAO.
    || Estándar: oracle-plsql-architecture (Familia pkgln_)
    || =========================================================================
    */

    -- 1. Autenticación y validación de Superusuario (ID_TIPO_USUARIO = 1)
    PROCEDURE pr_login (
        p_json IN OUT NOCOPY CLOB
    );

    -- 2. Registrar auditoría de accesos
    PROCEDURE pr_registrar_auditoria (
        p_json IN OUT NOCOPY CLOB
    );

    -- 3. Organizaciones (Listar y Guardar/Actualizar)
    PROCEDURE pr_listar_organizaciones (
        p_json IN OUT NOCOPY CLOB
    );

    PROCEDURE pr_guardar_organizacion (
        p_json IN OUT NOCOPY CLOB
    );

    -- 4. Centros / Sedes (Listar y Guardar/Actualizar)
    PROCEDURE pr_listar_centros (
        p_json IN OUT NOCOPY CLOB
    );

    PROCEDURE pr_guardar_centro (
        p_json IN OUT NOCOPY CLOB
    );

    -- 5. Directorio de Usuarios (Listar y Guardar/Actualizar)
    PROCEDURE pr_listar_usuarios (
        p_json IN OUT NOCOPY CLOB
    );

    PROCEDURE pr_guardar_usuario (
        p_json IN OUT NOCOPY CLOB
    );

    -- 6. Parámetros Globales (Listar y Guardar/Actualizar)
    PROCEDURE pr_listar_parametros (
        p_json IN OUT NOCOPY CLOB
    );

    PROCEDURE pr_guardar_parametro (
        p_json IN OUT NOCOPY CLOB
    );

    -- 7. Editor de Tablas Maestras (Catálogos)
    PROCEDURE pr_listar_catalogo (
        p_json IN OUT NOCOPY CLOB
    );

    PROCEDURE pr_guardar_catalogo (
        p_json IN OUT NOCOPY CLOB
    );

    -- 8. Dashboard y Métricas Ejecutivas
    PROCEDURE pr_obtener_metricas_dashboard (
        p_json IN OUT NOCOPY CLOB
    );

END PKGLN_SUPERADMIN;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_SUPERADMIN
AS
    vro_error smy_errores%ROWTYPE;

    -- -------------------------------------------------------------------------
    -- 1. AUTENTICACIÓN Y VALIDACIÓN ESTRICTA DE SUPERUSUARIO (ID_TIPO_USUARIO = 1)
    -- -------------------------------------------------------------------------
    PROCEDURE pr_login (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj          JSON_OBJECT_T;
        v_out_obj         JSON_OBJECT_T;
        v_usuario_obj     JSON_OBJECT_T;
        v_user_email      VARCHAR2(150);
        v_ip              VARCHAR2(50);
        v_dispositivo     VARCHAR2(250);
        v_usuario_clob    CLOB;
        v_id_usuario      NUMBER(10);
        v_id_tipo_usuario NUMBER(10);
        vro_auditoria     smy_auditoria_accesos%ROWTYPE;
    BEGIN
        v_in_obj      := JSON_OBJECT_T.parse(p_json);
        v_user_email  := v_in_obj.get_string('usernameOrEmail');
        v_ip          := NVL(v_in_obj.get_string('direccionIp'), '127.0.0.1');
        v_dispositivo := NVL(v_in_obj.get_string('dispositivoInfo'), 'Browser');

        v_out_obj := JSON_OBJECT_T();

        -- Consultar datos de usuario en JSON nativo vía pkgcn_ (SIN SELECT directo)
        v_usuario_clob := pkgcn_superadmin.fn_obtener_usuario_login_json(p_json);

        IF v_usuario_clob IS NULL THEN
            v_out_obj.put('success', false);
            v_out_obj.put('codigo', 401);
            v_out_obj.put('mensaje', 'Credenciales no encontradas en el sistema.');
            p_json := v_out_obj.to_clob();
            RETURN;
        END IF;

        -- Parsear JSON del usuario obtenido de pkgcn_
        v_usuario_obj     := JSON_OBJECT_T.parse(v_usuario_clob);
        v_id_usuario      := v_usuario_obj.get_number('id');
        v_id_tipo_usuario := v_usuario_obj.get_number('idTipoUsuario');

        -- VALIDACIÓN MANDATORIA DE DOMINIO: ID_TIPO_USUARIO = 1
        IF v_id_tipo_usuario != 1 THEN
            -- Registrar intento fallido en auditoría vía DAO (Sin INSERT directo)
            vro_auditoria.id             := SEQ_SMY_AUDITORIA_ACCESOS.NEXTVAL;
            vro_auditoria.id_usuario     := v_id_usuario;
            vro_auditoria.accion         := 'ACCESO_DENEGADO_ROL';
            vro_auditoria.direccion_ip   := SUBSTR(v_ip, 1, 45);
            vro_auditoria.detalles       := 'Acceso denegado: El usuario no es Superusuario (ID_TIPO_USUARIO = ' || v_id_tipo_usuario || ')';
            vro_auditoria.fecha_creacion := f_fecha_actual;

            pkgsmy_auditoria_accesos_dao.p_insertar(vro_auditoria);
            p_do_commit('pkgln_superadmin.pr_login');

            v_out_obj.put('success', false);
            v_out_obj.put('codigo', 403);
            v_out_obj.put('mensaje', 'Acceso denegado: Esta plataforma es de uso exclusivo para el Superusuario Principal (ID_TIPO_USUARIO = 1).');
            p_json := v_out_obj.to_clob();
            RETURN;
        END IF;

        -- Respuesta satisfactoria con datos completos del superusuario
        v_out_obj.put('success', true);
        v_out_obj.put('codigo', 200);
        v_out_obj.put('mensaje', 'OK');
        v_out_obj.put('user', v_usuario_obj);
        p_json := v_out_obj.to_clob();

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_LOGIN';
            vro_error.parametros          := 'usuario: ' || v_user_email;
            vro_error.id_usuario_creacion := NULL;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_login;

    -- -------------------------------------------------------------------------
    -- 2. REGISTRAR AUDITORÍA DE ACCESOS
    -- -------------------------------------------------------------------------
    PROCEDURE pr_registrar_auditoria (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj      JSON_OBJECT_T;
        v_out_obj     JSON_OBJECT_T;
        vro_auditoria smy_auditoria_accesos%ROWTYPE;
        vro_usuario   smy_usuarios%ROWTYPE;
        v_id_usuario  NUMBER(10);
        v_accion      VARCHAR2(50);
    BEGIN
        v_in_obj     := JSON_OBJECT_T.parse(p_json);
        v_id_usuario := v_in_obj.get_number('idUsuario');
        v_accion     := v_in_obj.get_string('accion');

        vro_auditoria.id             := SEQ_SMY_AUDITORIA_ACCESOS.NEXTVAL;
        vro_auditoria.id_usuario     := v_id_usuario;
        vro_auditoria.accion         := SUBSTR(v_accion, 1, 50);
        vro_auditoria.direccion_ip   := SUBSTR(NVL(v_in_obj.get_string('direccionIp'), '127.0.0.1'), 1, 45);
        vro_auditoria.detalles       := SUBSTR(v_in_obj.get_string('detalles'), 1, 4000);
        vro_auditoria.fecha_creacion := f_fecha_actual;

        -- Inserción vía DAO (Sin INSERT directo)
        pkgsmy_auditoria_accesos_dao.p_insertar(vro_auditoria);

        -- Si es login exitoso, actualizar último acceso con DAO (Sin UPDATE directo)
        IF v_accion = 'LOGIN_EXITOSO' AND v_id_usuario IS NOT NULL THEN
            IF pkgsmy_usuarios_dao.f_existe(v_id_usuario, vro_usuario) THEN
                vro_usuario.ultimo_acceso := f_fecha_actual;
                pkgsmy_usuarios_dao.p_actualizar(vro_usuario);
            END IF;
        END IF;

        p_do_commit('pkgln_superadmin.pr_registrar_auditoria');

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_REGISTRAR_AUDITORIA';
            vro_error.parametros          := 'idUsuario: ' || v_id_usuario || ', accion: ' || v_accion;
            vro_error.id_usuario_creacion := v_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_auditoria;

    -- -------------------------------------------------------------------------
    -- 3. ORGANIZACIONES (LISTAR Y GUARDAR)
    -- -------------------------------------------------------------------------
    PROCEDURE pr_listar_organizaciones (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_out_obj JSON_OBJECT_T;
        v_clob    CLOB;
    BEGIN
        -- Consultar organizaciones en JSON nativo vía pkgcn_ (Sin SELECT directo)
        v_clob := pkgcn_superadmin.fn_listar_organizaciones_json(p_json);

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('data', JSON_ARRAY_T.parse(v_clob));
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_LISTAR_ORGANIZACIONES';
            vro_error.parametros          := 'Listado general';
            vro_error.id_usuario_creacion := NULL;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_listar_organizaciones;

    PROCEDURE pr_guardar_organizacion (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj   JSON_OBJECT_T;
        v_out_obj  JSON_OBJECT_T;
        vro_org    smy_organizaciones%ROWTYPE;
        v_id       NUMBER(10);
        v_user_id  NUMBER(10);
    BEGIN
        v_in_obj  := JSON_OBJECT_T.parse(p_json);
        v_id      := v_in_obj.get_number('id');
        v_user_id := v_in_obj.get_number('idUsuarioAccion');

        IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_organizaciones_dao.f_existe(v_id, vro_org) THEN
            -- Actualización delegada a DAO (Sin UPDATE directo)
            vro_org.codigo_organizacion            := UPPER(TRIM(v_in_obj.get_string('codigoOrganizacion')));
            vro_org.razon_social                   := TRIM(v_in_obj.get_string('razonSocial'));
            vro_org.nombre_comercial               := TRIM(v_in_obj.get_string('nombreComercial'));
            vro_org.numero_identificacion_trib     := TRIM(v_in_obj.get_string('numeroIdentificacionTrib'));
            vro_org.id_tipo_identificacion        := v_in_obj.get_number('idTipoIdentificacion');
            vro_org.email_corporativo              := LOWER(TRIM(v_in_obj.get_string('emailCorporativo')));
            vro_org.telefono_contacto              := TRIM(v_in_obj.get_string('telefonoContacto'));
            vro_org.sitio_web                      := TRIM(v_in_obj.get_string('sitioWeb'));
            vro_org.id_archivo_logo                := NVL(v_in_obj.get_number('idArchivoLogo'), v_in_obj.get_number('idArchivo'));
            vro_org.id_estado_organizacion         := NVL(v_in_obj.get_number('idEstadoOrganizacion'), vro_org.id_estado_organizacion);
            vro_org.id_usuario_ultima_modificacion := v_user_id;

            pkgsmy_organizaciones_dao.p_actualizar(vro_org);
        ELSE
            -- Inserción delegada a DAO (Sin INSERT directo)
            vro_org.id                             := SEQ_SMY_ORGANIZACIONES.NEXTVAL;
            vro_org.codigo_organizacion            := UPPER(TRIM(v_in_obj.get_string('codigoOrganizacion')));
            vro_org.razon_social                   := TRIM(v_in_obj.get_string('razonSocial'));
            vro_org.nombre_comercial               := TRIM(v_in_obj.get_string('nombreComercial'));
            vro_org.numero_identificacion_trib     := TRIM(v_in_obj.get_string('numeroIdentificacionTrib'));
            vro_org.id_tipo_identificacion        := v_in_obj.get_number('idTipoIdentificacion');
            vro_org.email_corporativo              := LOWER(TRIM(v_in_obj.get_string('emailCorporativo')));
            vro_org.telefono_contacto              := TRIM(v_in_obj.get_string('telefonoContacto'));
            vro_org.sitio_web                      := TRIM(v_in_obj.get_string('sitioWeb'));
            vro_org.id_archivo_logo                := NVL(v_in_obj.get_number('idArchivoLogo'), v_in_obj.get_number('idArchivo'));
            vro_org.id_estado_organizacion         := NVL(v_in_obj.get_number('idEstadoOrganizacion'), 1);
            vro_org.fecha_creacion                 := f_fecha_actual;
            vro_org.id_usuario_ultima_modificacion := v_user_id;

            pkgsmy_organizaciones_dao.p_insertar(vro_org);
        END IF;

        p_do_commit('pkgln_superadmin.pr_guardar_organizacion');

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('id', vro_org.id);
        v_out_obj.put('mensaje', 'Organización guardada exitosamente.');
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_GUARDAR_ORGANIZACION';
            vro_error.parametros          := 'id: ' || v_id;
            vro_error.id_usuario_creacion := v_user_id;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_guardar_organizacion;

    -- -------------------------------------------------------------------------
    -- 4. CENTROS / SEDES (LISTAR Y GUARDAR)
    -- -------------------------------------------------------------------------
    PROCEDURE pr_listar_centros (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj  JSON_OBJECT_T;
        v_out_obj JSON_OBJECT_T;
        v_id_org  NUMBER(10);
        v_clob    CLOB;
    BEGIN
        IF p_json IS NOT NULL AND LENGTH(p_json) > 0 THEN
            v_in_obj := JSON_OBJECT_T.parse(p_json);
            v_id_org := v_in_obj.get_number('idOrganizacion');
        END IF;

        -- Consultar centros en JSON nativo vía pkgcn_ (Sin SELECT directo)
        v_clob := pkgcn_superadmin.fn_listar_centros_json(p_json);

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('data', JSON_ARRAY_T.parse(v_clob));
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_LISTAR_CENTROS';
            vro_error.parametros          := 'idOrg: ' || v_id_org;
            vro_error.id_usuario_creacion := NULL;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_listar_centros;

    PROCEDURE pr_guardar_centro (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj  JSON_OBJECT_T;
        v_out_obj JSON_OBJECT_T;
        vro_org   smy_organizaciones%ROWTYPE;
        vro_cen   smy_centros%ROWTYPE;
        v_id      NUMBER(10);
        v_id_org  NUMBER(10);
        v_user_id NUMBER(10);
    BEGIN
        v_in_obj  := JSON_OBJECT_T.parse(p_json);
        v_id      := v_in_obj.get_number('id');
        v_id_org  := v_in_obj.get_number('idOrganizacion');
        v_user_id := v_in_obj.get_number('idUsuarioAccion');

        -- Validar organización existente vía DAO (Sin SELECT directo)
        IF NOT pkgsmy_organizaciones_dao.f_existe(v_id_org, vro_org) THEN
            RAISE_APPLICATION_ERROR(-20002, 'La organización matriz indicada no existe.');
        END IF;

        IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_centros_dao.f_existe(v_id, vro_cen) THEN
            -- Actualización con DAO (Sin UPDATE directo)
            vro_cen.id_organizacion                := v_id_org;
            vro_cen.codigo_centro                  := UPPER(TRIM(v_in_obj.get_string('codigoCentro')));
            vro_cen.nombre_centro                  := TRIM(v_in_obj.get_string('nombreCentro'));
            vro_cen.slug_directorio                := LOWER(TRIM(v_in_obj.get_string('slugDirectorio')));
            vro_cen.ciudad                         := TRIM(v_in_obj.get_string('ciudad'));
            vro_cen.direccion                      := TRIM(v_in_obj.get_string('direccion'));
            vro_cen.telefono                       := TRIM(v_in_obj.get_string('telefono'));
            vro_cen.email_contacto                 := LOWER(TRIM(v_in_obj.get_string('emailContacto')));
            vro_cen.capacidad_residentes           := NVL(v_in_obj.get_number('capacidadResidentes'), vro_cen.capacidad_residentes);
            vro_cen.id_estado_centro               := NVL(v_in_obj.get_number('idEstadoCentro'), vro_cen.id_estado_centro);
            vro_cen.id_usuario_ultima_modificacion := v_user_id;

            pkgsmy_centros_dao.p_actualizar(vro_cen);
        ELSE
            -- Inserción con DAO (Sin INSERT directo)
            vro_cen.id                             := SEQ_SMY_CENTROS.NEXTVAL;
            vro_cen.id_organizacion                := v_id_org;
            vro_cen.codigo_centro                  := UPPER(TRIM(v_in_obj.get_string('codigoCentro')));
            vro_cen.nombre_centro                  := TRIM(v_in_obj.get_string('nombreCentro'));
            vro_cen.slug_directorio                := LOWER(TRIM(v_in_obj.get_string('slugDirectorio')));
            vro_cen.ciudad                         := TRIM(v_in_obj.get_string('ciudad'));
            vro_cen.direccion                      := TRIM(v_in_obj.get_string('direccion'));
            vro_cen.telefono                       := TRIM(v_in_obj.get_string('telefono'));
            vro_cen.email_contacto                 := LOWER(TRIM(v_in_obj.get_string('emailContacto')));
            vro_cen.capacidad_residentes           := NVL(v_in_obj.get_number('capacidadResidentes'), 0);
            vro_cen.id_estado_centro               := NVL(v_in_obj.get_number('idEstadoCentro'), 1);
            vro_cen.fecha_creacion                 := f_fecha_actual;
            vro_cen.id_usuario_ultima_modificacion := v_user_id;

            pkgsmy_centros_dao.p_insertar(vro_cen);
        END IF;

        p_do_commit('pkgln_superadmin.pr_guardar_centro');

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('id', vro_cen.id);
        v_out_obj.put('mensaje', 'Centro guardado exitosamente.');
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_GUARDAR_CENTRO';
            vro_error.parametros          := 'id: ' || v_id || ', idOrg: ' || v_id_org;
            vro_error.id_usuario_creacion := v_user_id;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_guardar_centro;

    -- -------------------------------------------------------------------------
    -- 5. USUARIOS (LISTAR Y GUARDAR)
    -- -------------------------------------------------------------------------
    PROCEDURE pr_listar_usuarios (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj   JSON_OBJECT_T;
        v_out_obj  JSON_OBJECT_T;
        v_rol      NUMBER(10);
        v_tipo     NUMBER(10);
        v_estado   NUMBER(10);
        v_clob     CLOB;
    BEGIN
        IF p_json IS NOT NULL AND LENGTH(p_json) > 0 THEN
            v_in_obj := JSON_OBJECT_T.parse(p_json);
            v_rol    := v_in_obj.get_number('idRol');
            v_tipo   := v_in_obj.get_number('idTipoUsuario');
            v_estado := v_in_obj.get_number('idEstado');
        END IF;

        -- Consultar usuarios en JSON nativo vía pkgcn_ (Sin SELECT directo)
        v_clob := pkgcn_superadmin.fn_listar_usuarios_json(p_json);

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('data', JSON_ARRAY_T.parse(v_clob));
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_LISTAR_USUARIOS';
            vro_error.parametros          := 'Filtros usuarios';
            vro_error.id_usuario_creacion := NULL;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_listar_usuarios;

    PROCEDURE pr_guardar_usuario (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj   JSON_OBJECT_T;
        v_out_obj  JSON_OBJECT_T;
        vro_usu    smy_usuarios%ROWTYPE;
        v_id       NUMBER(10);
        v_pass     VARCHAR2(255);
        v_user_id  NUMBER(10);
    BEGIN
        v_in_obj  := JSON_OBJECT_T.parse(p_json);
        v_id      := v_in_obj.get_number('id');
        v_pass    := v_in_obj.get_string('passwordHash');
        v_user_id := v_in_obj.get_number('idUsuarioAccion');

        IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_usuarios_dao.f_existe(v_id, vro_usu) THEN
            -- Actualización con DAO (Sin UPDATE directo)
            vro_usu.id_rol                         := v_in_obj.get_number('idRol');
            vro_usu.id_tipo_usuario                := v_in_obj.get_number('idTipoUsuario');
            vro_usu.username                       := LOWER(TRIM(v_in_obj.get_string('username')));
            vro_usu.email                          := LOWER(TRIM(v_in_obj.get_string('email')));
            IF v_pass IS NOT NULL AND LENGTH(TRIM(v_pass)) > 0 THEN
                vro_usu.password_hash              := v_pass;
            END IF;
            vro_usu.nombre_completo                := TRIM(v_in_obj.get_string('nombreCompleto'));
            vro_usu.telefono                       := TRIM(v_in_obj.get_string('telefono'));
            vro_usu.id_archivo_foto_perfil         := NVL(v_in_obj.get_number('idArchivoFotoPerfil'), v_in_obj.get_number('idArchivo'));
            vro_usu.id_canal_notif_pref            := NVL(v_in_obj.get_number('idCanalNotifPref'), vro_usu.id_canal_notif_pref);
            vro_usu.id_estado_usuario              := NVL(v_in_obj.get_number('idEstadoUsuario'), vro_usu.id_estado_usuario);
            vro_usu.id_usuario_ultima_modificacion := v_user_id;

            pkgsmy_usuarios_dao.p_actualizar(vro_usu);
        ELSE
            -- Inserción con DAO (Sin INSERT directo)
            vro_usu.id                             := SEQ_SMY_USUARIOS.NEXTVAL;
            vro_usu.id_rol                         := v_in_obj.get_number('idRol');
            vro_usu.id_tipo_usuario                := v_in_obj.get_number('idTipoUsuario');
            vro_usu.username                       := LOWER(TRIM(v_in_obj.get_string('username')));
            vro_usu.email                          := LOWER(TRIM(v_in_obj.get_string('email')));
            vro_usu.password_hash                  := v_pass;
            vro_usu.nombre_completo                := TRIM(v_in_obj.get_string('nombreCompleto'));
            vro_usu.telefono                       := TRIM(v_in_obj.get_string('telefono'));
            vro_usu.id_archivo_foto_perfil         := NVL(v_in_obj.get_number('idArchivoFotoPerfil'), v_in_obj.get_number('idArchivo'));
            vro_usu.id_canal_notif_pref            := NVL(v_in_obj.get_number('idCanalNotifPref'), 1);
            vro_usu.id_estado_usuario              := NVL(v_in_obj.get_number('idEstadoUsuario'), 1);
            vro_usu.fecha_creacion                 := f_fecha_actual;
            vro_usu.id_usuario_ultima_modificacion := v_user_id;

            pkgsmy_usuarios_dao.p_insertar(vro_usu);
        END IF;

        p_do_commit('pkgln_superadmin.pr_guardar_usuario');

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('id', vro_usu.id);
        v_out_obj.put('mensaje', 'Usuario guardado exitosamente.');
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_GUARDAR_USUARIO';
            vro_error.parametros          := 'id: ' || v_id;
            vro_error.id_usuario_creacion := v_user_id;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_guardar_usuario;

    -- -------------------------------------------------------------------------
    -- 6. PARÁMETROS DEL SISTEMA (LISTAR Y GUARDAR)
    -- -------------------------------------------------------------------------
    PROCEDURE pr_listar_parametros (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj  JSON_OBJECT_T;
        v_out_obj JSON_OBJECT_T;
        v_grupo   VARCHAR2(50);
        v_id_org  NUMBER(10);
        v_id_cen  NUMBER(10);
        v_clob    CLOB;
    BEGIN
        IF p_json IS NOT NULL AND LENGTH(p_json) > 0 THEN
            v_in_obj := JSON_OBJECT_T.parse(p_json);
            v_grupo  := v_in_obj.get_string('grupo');
            v_id_org := v_in_obj.get_number('idOrganizacion');
            v_id_cen := v_in_obj.get_number('idCentro');
        END IF;

        -- Consultar parámetros en JSON nativo vía pkgcn_ (Sin SELECT directo)
        v_clob := pkgcn_superadmin.fn_listar_parametros_json(p_json);

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('data', JSON_ARRAY_T.parse(v_clob));
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_LISTAR_PARAMETROS';
            vro_error.parametros          := 'grupo: ' || v_grupo;
            vro_error.id_usuario_creacion := NULL;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_listar_parametros;

    PROCEDURE pr_guardar_parametro (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj   JSON_OBJECT_T;
        v_out_obj  JSON_OBJECT_T;
        vro_par    smy_parametros%ROWTYPE;
        v_id       NUMBER(10);
        v_user_id  NUMBER(10);
    BEGIN
        v_in_obj  := JSON_OBJECT_T.parse(p_json);
        v_id      := v_in_obj.get_number('id');
        v_user_id := v_in_obj.get_number('idUsuarioAccion');

        IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_parametros_dao.f_existe(v_id, vro_par) THEN
            -- Actualización vía DAO (Sin UPDATE directo)
            vro_par.id_organizacion                := v_in_obj.get_number('idOrganizacion');
            vro_par.id_centro                      := v_in_obj.get_number('idCentro');
            vro_par.codigo_parametro               := UPPER(TRIM(v_in_obj.get_string('codigoParametro')));
            vro_par.nombre_parametro               := TRIM(v_in_obj.get_string('nombreParametro'));
            vro_par.descripcion                    := TRIM(v_in_obj.get_string('descripcion'));
            vro_par.grupo_parametro                := UPPER(TRIM(v_in_obj.get_string('grupoParametro')));
            vro_par.valor_texto                    := v_in_obj.get_string('valorTexto');
            vro_par.valor_clob                     := v_in_obj.get_string('valorClob');
            vro_par.valor_numerico                 := v_in_obj.get_number('valorNumerico');
            vro_par.es_encriptado                  := NVL(v_in_obj.get_string('esEncriptado'), 'N');
            vro_par.es_sistema                     := NVL(v_in_obj.get_string('esSistema'), 'N');
            vro_par.id_estado_parametro            := NVL(v_in_obj.get_number('idEstadoParametro'), 1);
            vro_par.fecha_ultima_modificacion      := f_fecha_actual;
            vro_par.id_usuario_ultima_modificacion := v_user_id;

            pkgsmy_parametros_dao.p_actualizar(vro_par);
        ELSE
            -- Inserción vía DAO (Sin INSERT directo)
            vro_par.id                             := SEQ_SMY_PARAMETROS.NEXTVAL;
            vro_par.id_organizacion                := v_in_obj.get_number('idOrganizacion');
            vro_par.id_centro                      := v_in_obj.get_number('idCentro');
            vro_par.codigo_parametro               := UPPER(TRIM(v_in_obj.get_string('codigoParametro')));
            vro_par.nombre_parametro               := TRIM(v_in_obj.get_string('nombreParametro'));
            vro_par.descripcion                    := TRIM(v_in_obj.get_string('descripcion'));
            vro_par.grupo_parametro                := NVL(UPPER(TRIM(v_in_obj.get_string('grupoParametro'))), 'GENERAL');
            vro_par.valor_texto                    := v_in_obj.get_string('valorTexto');
            vro_par.valor_clob                     := v_in_obj.get_string('valorClob');
            vro_par.valor_numerico                 := v_in_obj.get_number('valorNumerico');
            vro_par.es_encriptado                  := NVL(v_in_obj.get_string('esEncriptado'), 'N');
            vro_par.es_sistema                     := NVL(v_in_obj.get_string('esSistema'), 'N');
            vro_par.id_estado_parametro            := NVL(v_in_obj.get_number('idEstadoParametro'), 1);
            vro_par.fecha_creacion                 := f_fecha_actual;
            vro_par.fecha_ultima_modificacion      := f_fecha_actual;
            vro_par.id_usuario_ultima_modificacion := v_user_id;

            pkgsmy_parametros_dao.p_insertar(vro_par);
        END IF;

        p_do_commit('pkgln_superadmin.pr_guardar_parametro');

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('id', vro_par.id);
        v_out_obj.put('mensaje', 'Parámetro guardado exitosamente.');
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_GUARDAR_PARAMETRO';
            vro_error.parametros          := 'id: ' || v_id;
            vro_error.id_usuario_creacion := v_user_id;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_guardar_parametro;

    -- -------------------------------------------------------------------------
    -- 7. TABLAS MAESTRAS (CATÁLOGOS)
    -- -------------------------------------------------------------------------
    PROCEDURE pr_listar_catalogo (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj  JSON_OBJECT_T;
        v_out_obj JSON_OBJECT_T;
        v_tabla   VARCHAR2(60);
        v_clob    CLOB;
    BEGIN
        v_in_obj := JSON_OBJECT_T.parse(p_json);
        v_tabla  := v_in_obj.get_string('tabla');

        -- Obtener catálogo en JSON nativo vía pkgcn_ (Sin SELECT directo)
        v_clob := pkgcn_superadmin.fn_listar_catalogo_json(p_json);

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('tabla', v_tabla);
        v_out_obj.put('data', JSON_ARRAY_T.parse(v_clob));
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_LISTAR_CATALOGO';
            vro_error.parametros          := 'tabla: ' || v_tabla;
            vro_error.id_usuario_creacion := NULL;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_listar_catalogo;

    -- -------------------------------------------------------------------------
    -- 7.1 GUARDAR / ACTUALIZAR EN TABLA MAESTRA (EXCLUSIVO VÍA DAOs)
    -- -------------------------------------------------------------------------
    PROCEDURE pr_guardar_catalogo (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_in_obj   JSON_OBJECT_T;
        v_out_obj  JSON_OBJECT_T;
        v_tabla    VARCHAR2(60);
        v_id       NUMBER(10);
        v_nombre   VARCHAR2(250);
        v_desc     VARCHAR2(500);
        v_codigo   VARCHAR2(50);
        v_user_id  NUMBER(10);
        v_id_org   NUMBER(10);

        -- Records de DAOs para cada tabla maestra
        vro_tu  smy_tipos_usuarios%ROWTYPE;
        vro_rol smy_roles%ROWTYPE;
        vro_er  smy_estados_roles%ROWTYPE;
        vro_eu  smy_estados_usuarios%ROWTYPE;
        vro_cn  smy_canales_notificacion%ROWTYPE;
        vro_ti  smy_tipos_identificacion%ROWTYPE;
        vro_eo  smy_estados_organizaciones%ROWTYPE;
        vro_ep  smy_estados_parametros%ROWTYPE;
        vro_ae  smy_areas_empleados%ROWTYPE;
        vro_ce  smy_cargos_empleados%ROWTYPE;
        vro_gen smy_generos%ROWTYPE;
        vro_nm  smy_niveles_movilidad%ROWTYPE;
        vro_td  smy_tipos_dietas%ROWTYPE;
        vro_res smy_estados_residentes%ROWTYPE;
        vro_par smy_parentescos%ROWTYPE;
    BEGIN
        v_in_obj   := JSON_OBJECT_T.parse(p_json);
        v_tabla    := UPPER(TRIM(v_in_obj.get_string('tabla')));
        v_id       := v_in_obj.get_number('id');
        v_nombre   := TRIM(v_in_obj.get_string('nombre'));
        v_desc     := TRIM(v_in_obj.get_string('descripcion'));
        v_codigo   := UPPER(TRIM(NVL(v_in_obj.get_string('codigo'), v_in_obj.get_string('sigla'))));
        v_user_id  := v_in_obj.get_number('idUsuarioAccion');
        v_id_org   := NVL(v_in_obj.get_number('idOrganizacion'), 1);

        IF v_nombre IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El nombre/valor es obligatorio para la tabla maestra.');
        END IF;

        CASE v_tabla
            WHEN 'SMY_TIPOS_USUARIOS' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_tipos_usuarios_dao.f_existe(v_id, vro_tu) THEN
                    vro_tu.nombre_tipo_usuario := v_nombre;
                    vro_tu.descripcion := v_desc;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_tu.id_organizacion := v_id_org; END IF;
                    vro_tu.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_tipos_usuarios_dao.p_actualizar(vro_tu);
                ELSE
                    vro_tu.id := SEQ_SMY_TIPOS_USUARIOS.NEXTVAL;
                    vro_tu.id_organizacion := v_id_org;
                    vro_tu.nombre_tipo_usuario := v_nombre;
                    vro_tu.descripcion := v_desc;
                    vro_tu.fecha_creacion := f_fecha_actual;
                    vro_tu.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_tipos_usuarios_dao.p_insertar(vro_tu);
                    v_id := vro_tu.id;
                END IF;

            WHEN 'SMY_ROLES' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_roles_dao.f_existe(v_id, vro_rol) THEN
                    vro_rol.nombre := v_nombre;
                    IF v_codigo IS NOT NULL THEN vro_rol.codigo := v_codigo; END IF;
                    vro_rol.descripcion := v_desc;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_rol.id_organizacion := v_id_org; END IF;
                    vro_rol.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_roles_dao.p_actualizar(vro_rol);
                ELSE
                    vro_rol.id := SEQ_SMY_ROLES.NEXTVAL;
                    vro_rol.id_organizacion := v_id_org;
                    vro_rol.codigo := NVL(v_codigo, UPPER(SUBSTR(v_nombre, 1, 30)));
                    vro_rol.nombre := v_nombre;
                    vro_rol.descripcion := v_desc;
                    vro_rol.id_estado_rol := 1;
                    vro_rol.fecha_creacion := f_fecha_actual;
                    vro_rol.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_roles_dao.p_insertar(vro_rol);
                    v_id := vro_rol.id;
                END IF;

            WHEN 'SMY_ESTADOS_ROLES' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_estados_roles_dao.f_existe(v_id, vro_er) THEN
                    vro_er.nombre_estado_rol := v_nombre;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_er.id_organizacion := v_id_org; END IF;
                    vro_er.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_estados_roles_dao.p_actualizar(vro_er);
                ELSE
                    vro_er.id := SEQ_SMY_ESTADOS_ROLES.NEXTVAL;
                    vro_er.id_organizacion := v_id_org;
                    vro_er.nombre_estado_rol := v_nombre;
                    vro_er.fecha_creacion := f_fecha_actual;
                    vro_er.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_estados_roles_dao.p_insertar(vro_er);
                    v_id := vro_er.id;
                END IF;

            WHEN 'SMY_ESTADOS_USUARIOS' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_estados_usuarios_dao.f_existe(v_id, vro_eu) THEN
                    vro_eu.nombre_estado_usuario := v_nombre;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_eu.id_organizacion := v_id_org; END IF;
                    vro_eu.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_estados_usuarios_dao.p_actualizar(vro_eu);
                ELSE
                    vro_eu.id := SEQ_SMY_ESTADOS_USUARIOS.NEXTVAL;
                    vro_eu.id_organizacion := v_id_org;
                    vro_eu.nombre_estado_usuario := v_nombre;
                    vro_eu.fecha_creacion := f_fecha_actual;
                    vro_eu.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_estados_usuarios_dao.p_insertar(vro_eu);
                    v_id := vro_eu.id;
                END IF;

            WHEN 'SMY_CANALES_NOTIFICACION' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_canales_notificacion_dao.f_existe(v_id, vro_cn) THEN
                    vro_cn.nombre_canal_notificacion := v_nombre;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_cn.id_organizacion := v_id_org; END IF;
                    vro_cn.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_canales_notificacion_dao.p_actualizar(vro_cn);
                ELSE
                    vro_cn.id := SEQ_SMY_CANALES_NOTIFICACION.NEXTVAL;
                    vro_cn.id_organizacion := v_id_org;
                    vro_cn.nombre_canal_notificacion := v_nombre;
                    vro_cn.fecha_creacion := f_fecha_actual;
                    vro_cn.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_canales_notificacion_dao.p_insertar(vro_cn);
                    v_id := vro_cn.id;
                END IF;

            WHEN 'SMY_TIPOS_IDENTIFICACION' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_tipos_identificacion_dao.f_existe(v_id, vro_ti) THEN
                    vro_ti.nombre_tipo_identificacion := v_nombre;
                    IF v_codigo IS NOT NULL THEN vro_ti.sigla := v_codigo; END IF;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_ti.id_organizacion := v_id_org; END IF;
                    vro_ti.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_tipos_identificacion_dao.p_actualizar(vro_ti);
                ELSE
                    vro_ti.id := SEQ_SMY_TIPOS_IDENTIFICACION.NEXTVAL;
                    vro_ti.id_organizacion := v_id_org;
                    vro_ti.nombre_tipo_identificacion := v_nombre;
                    vro_ti.sigla := NVL(v_codigo, UPPER(SUBSTR(v_nombre, 1, 10)));
                    vro_ti.fecha_creacion := f_fecha_actual;
                    vro_ti.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_tipos_identificacion_dao.p_insertar(vro_ti);
                    v_id := vro_ti.id;
                END IF;

            WHEN 'SMY_ESTADOS_ORGANIZACIONES' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_estados_organizaciones_dao.f_existe(v_id, vro_eo) THEN
                    vro_eo.nombre_estado := v_nombre;
                    vro_eo.descripcion := v_desc;
                    vro_eo.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_estados_organizaciones_dao.p_actualizar(vro_eo);
                ELSE
                    vro_eo.id := SEQ_SMY_ESTADOS_ORGANIZACIONES.NEXTVAL;
                    vro_eo.nombre_estado := v_nombre;
                    vro_eo.descripcion := v_desc;
                    vro_eo.fecha_creacion := f_fecha_actual;
                    vro_eo.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_estados_organizaciones_dao.p_insertar(vro_eo);
                    v_id := vro_eo.id;
                END IF;

            WHEN 'SMY_ESTADOS_PARAMETROS' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_estados_parametros_dao.f_existe(v_id, vro_ep) THEN
                    vro_ep.nombre_estado_parametro := v_nombre;
                    vro_ep.descripcion := v_desc;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_ep.id_organizacion := v_id_org; END IF;
                    vro_ep.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_estados_parametros_dao.p_actualizar(vro_ep);
                ELSE
                    vro_ep.id := SEQ_SMY_ESTADOS_PARAMETROS.NEXTVAL;
                    vro_ep.id_organizacion := v_id_org;
                    vro_ep.nombre_estado_parametro := v_nombre;
                    vro_ep.descripcion := v_desc;
                    vro_ep.fecha_creacion := f_fecha_actual;
                    vro_ep.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_estados_parametros_dao.p_insertar(vro_ep);
                    v_id := vro_ep.id;
                END IF;

            WHEN 'SMY_AREAS_EMPLEADOS' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_areas_empleados_dao.f_existe(v_id, vro_ae) THEN
                    vro_ae.nombre_area_empleado := v_nombre;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_ae.id_organizacion := v_id_org; END IF;
                    vro_ae.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_areas_empleados_dao.p_actualizar(vro_ae);
                ELSE
                    vro_ae.id := SEQ_SMY_AREAS_EMPLEADOS.NEXTVAL;
                    vro_ae.id_organizacion := v_id_org;
                    vro_ae.nombre_area_empleado := v_nombre;
                    vro_ae.fecha_creacion := f_fecha_actual;
                    vro_ae.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_areas_empleados_dao.p_insertar(vro_ae);
                    v_id := vro_ae.id;
                END IF;

            WHEN 'SMY_CARGOS_EMPLEADOS' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_cargos_empleados_dao.f_existe(v_id, vro_ce) THEN
                    vro_ce.nombre_cargo_empleado := v_nombre;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_ce.id_organizacion := v_id_org; END IF;
                    vro_ce.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_cargos_empleados_dao.p_actualizar(vro_ce);
                ELSE
                    vro_ce.id := SEQ_SMY_CARGOS_EMPLEADOS.NEXTVAL;
                    vro_ce.id_organizacion := v_id_org;
                    vro_ce.nombre_cargo_empleado := v_nombre;
                    vro_ce.fecha_creacion := f_fecha_actual;
                    vro_ce.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_cargos_empleados_dao.p_insertar(vro_ce);
                    v_id := vro_ce.id;
                END IF;

            WHEN 'SMY_GENEROS' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_generos_dao.f_existe(v_id, vro_gen) THEN
                    vro_gen.nombre_genero := v_nombre;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_gen.id_organizacion := v_id_org; END IF;
                    vro_gen.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_generos_dao.p_actualizar(vro_gen);
                ELSE
                    vro_gen.id := SEQ_SMY_GENEROS.NEXTVAL;
                    vro_gen.id_organizacion := v_id_org;
                    vro_gen.nombre_genero := v_nombre;
                    vro_gen.fecha_creacion := f_fecha_actual;
                    vro_gen.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_generos_dao.p_insertar(vro_gen);
                    v_id := vro_gen.id;
                END IF;

            WHEN 'SMY_NIVELES_MOVILIDAD' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_niveles_movilidad_dao.f_existe(v_id, vro_nm) THEN
                    vro_nm.nombre_nivel_movilidad := v_nombre;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_nm.id_organizacion := v_id_org; END IF;
                    vro_nm.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_niveles_movilidad_dao.p_actualizar(vro_nm);
                ELSE
                    vro_nm.id := SEQ_SMY_NIVELES_MOVILIDAD.NEXTVAL;
                    vro_nm.id_organizacion := v_id_org;
                    vro_nm.nombre_nivel_movilidad := v_nombre;
                    vro_nm.fecha_creacion := f_fecha_actual;
                    vro_nm.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_niveles_movilidad_dao.p_insertar(vro_nm);
                    v_id := vro_nm.id;
                END IF;

            WHEN 'SMY_TIPOS_DIETAS' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_tipos_dietas_dao.f_existe(v_id, vro_td) THEN
                    vro_td.nombre_tipo_dieta := v_nombre;
                    vro_td.descripcion := v_desc;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_td.id_organizacion := v_id_org; END IF;
                    vro_td.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_tipos_dietas_dao.p_actualizar(vro_td);
                ELSE
                    vro_td.id := SEQ_SMY_TIPOS_DIETAS.NEXTVAL;
                    vro_td.id_organizacion := v_id_org;
                    vro_td.nombre_tipo_dieta := v_nombre;
                    vro_td.descripcion := v_desc;
                    vro_td.fecha_creacion := f_fecha_actual;
                    vro_td.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_tipos_dietas_dao.p_insertar(vro_td);
                    v_id := vro_td.id;
                END IF;

            WHEN 'SMY_ESTADOS_RESIDENTES' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_estados_residentes_dao.f_existe(v_id, vro_res) THEN
                    vro_res.nombre_estado_residente := v_nombre;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_res.id_organizacion := v_id_org; END IF;
                    vro_res.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_estados_residentes_dao.p_actualizar(vro_res);
                ELSE
                    vro_res.id := SEQ_SMY_ESTADOS_RESIDENTES.NEXTVAL;
                    vro_res.id_organizacion := v_id_org;
                    vro_res.nombre_estado_residente := v_nombre;
                    vro_res.fecha_creacion := f_fecha_actual;
                    vro_res.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_estados_residentes_dao.p_insertar(vro_res);
                    v_id := vro_res.id;
                END IF;

            WHEN 'SMY_PARENTESCOS' THEN
                IF v_id IS NOT NULL AND v_id > 0 AND pkgsmy_parentescos_dao.f_existe(v_id, vro_par) THEN
                    vro_par.nombre_parentesco := v_nombre;
                    IF v_id_org IS NOT NULL AND v_id_org > 0 THEN vro_par.id_organizacion := v_id_org; END IF;
                    vro_par.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_parentescos_dao.p_actualizar(vro_par);
                ELSE
                    vro_par.id := SEQ_SMY_PARENTESCOS.NEXTVAL;
                    vro_par.id_organizacion := v_id_org;
                    vro_par.nombre_parentesco := v_nombre;
                    vro_par.fecha_creacion := f_fecha_actual;
                    vro_par.id_usuario_ultima_modificacion := v_user_id;
                    pkgsmy_parentescos_dao.p_insertar(vro_par);
                    v_id := vro_par.id;
                END IF;

            ELSE
                RAISE_APPLICATION_ERROR(-20002, 'Tabla maestra no soportada o inexistente: ' || v_tabla);
        END CASE;

        p_do_commit('pkgln_superadmin.pr_guardar_catalogo');

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('id', v_id);
        v_out_obj.put('mensaje', 'Registro de catálogo guardado exitosamente.');
        p_json := v_out_obj.to_clob();

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_GUARDAR_CATALOGO';
            vro_error.parametros          := 'tabla: ' || v_tabla || ' id: ' || v_id;
            vro_error.id_usuario_creacion := v_user_id;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_guardar_catalogo;

    -- -------------------------------------------------------------------------
    -- 8. DASHBOARD Y MÉTRICAS GLOBALES
    -- -------------------------------------------------------------------------
    PROCEDURE pr_obtener_metricas_dashboard (
        p_json IN OUT NOCOPY CLOB
    ) IS
        v_out_obj JSON_OBJECT_T;
        v_clob    CLOB;
    BEGIN
        -- Consultar métricas y auditoría en JSON nativo vía pkgcn_ (Sin SELECT directo)
        v_clob := pkgcn_superadmin.fn_obtener_metricas_dashboard_json(p_json);

        v_out_obj := JSON_OBJECT_T();
        v_out_obj.put('success', true);
        v_out_obj.put('data', JSON_OBJECT_T.parse(v_clob));
        p_json := v_out_obj.to_clob();
    EXCEPTION
        WHEN OTHERS THEN
            vro_error.nombre_programa     := 'PKGLN_SUPERADMIN';
            vro_error.nombre_metodo       := 'PR_OBTENER_METRICAS_DASHBOARD';
            vro_error.parametros          := 'Dashboard';
            vro_error.id_usuario_creacion := NULL;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_obtener_metricas_dashboard;

END PKGLN_SUPERADMIN;
/
