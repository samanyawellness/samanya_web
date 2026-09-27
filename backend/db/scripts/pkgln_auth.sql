-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_AUTH
-- FAMILIA: pkgln_ (Lógica de Negocio, validaciones y orquestación del caso de uso)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- REGLA ESTRICTA: Sin sentencias DML directas. Consultas y modificaciones vía
--                 _DAO y PKGCN. En este va el COMMIT.
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_AUTH
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_AUTH
    || Propósito: Lógica de negocio de autenticación, control de accesos y gestión
    ||            de tokens de dispositivos móviles push.
    || Estándar: oracle-plsql-architecture (Familia pkgln_)
    || =========================================================================
    */

    -- Autenticación y orquestación del proceso de acceso
    PROCEDURE pr_autenticar (
        p_usuario_o_email   IN VARCHAR2,
        p_direccion_ip      IN VARCHAR2,
        p_dispositivo_info  IN VARCHAR2,
        p_cursor_usuario    OUT SYS_REFCURSOR
    );

    -- Registro de acceso exitoso actualizando usuario e insertando auditoría vía DAOs con COMMIT
    PROCEDURE pr_registrar_acceso_exitoso (
        p_id_usuario        IN smy_usuarios.id%TYPE,
        p_direccion_ip      IN VARCHAR2,
        p_dispositivo_info  IN VARCHAR2
    );

    -- Registro y actualización de token push para dispositivos móviles
    PROCEDURE pr_registrar_dispositivo_push (
        p_id_usuario        IN smy_usuarios.id%TYPE,
        p_token_dispositivo IN smy_dispositivos_push.token_dispositivo%TYPE,
        p_plataforma        IN smy_dispositivos_push.plataforma%TYPE
    );

    -- Desactivación de token push al cerrar sesión
    PROCEDURE pr_desactivar_dispositivo_push (
        p_id_usuario        IN smy_usuarios.id%TYPE,
        p_token_dispositivo IN smy_dispositivos_push.token_dispositivo%TYPE
    );

    -- Actualización de información de perfil del usuario
    PROCEDURE pr_actualizar_perfil (
        pcl_json IN CLOB
    );

    -- Cambio seguro de contraseña de usuario
    PROCEDURE pr_cambiar_clave (
        pcl_json IN CLOB
    );

END PKGLN_AUTH;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_AUTH
AS
    vro_error smy_errores%ROWTYPE;

    PROCEDURE pr_registrar_acceso_exitoso (
        p_id_usuario        IN smy_usuarios.id%TYPE,
        p_direccion_ip      IN VARCHAR2,
        p_dispositivo_info  IN VARCHAR2
    ) IS
        vro_usuario           smy_usuarios%ROWTYPE;
        vro_auditoria_accesos smy_auditoria_accesos%ROWTYPE;
    BEGIN
        -- 1. Actualización mono-tabla de usuario vía DAO
        IF pkgsmy_usuarios_dao.f_existe(p_id_usuario, vro_usuario) = TRUE THEN
            vro_usuario.ultimo_acceso := f_fecha_actual;
            pkgsmy_usuarios_dao.p_actualizar(vro_usuario);
        END IF;

        -- 2. Inserción mono-tabla de auditoría vía DAO (Asignación directa de secuencia)
        vro_auditoria_accesos.id              := SEQ_SMY_AUDITORIA_ACCESOS.NEXTVAL;
        vro_auditoria_accesos.id_usuario      := p_id_usuario;
        vro_auditoria_accesos.accion          := 'LOGIN_EXITOSO';
        vro_auditoria_accesos.direccion_ip    := SUBSTR(p_direccion_ip, 1, 45);
        vro_auditoria_accesos.detalles        := 'Dispositivo: ' || SUBSTR(p_dispositivo_info, 1, 200) || ' | Autenticación exitosa';
        vro_auditoria_accesos.fecha_creacion  := f_fecha_actual;

        pkgsmy_auditoria_accesos_dao.p_insertar(vro_auditoria_accesos);

        -- 3. Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_auth.pr_registrar_acceso_exitoso');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            vro_error.nombre_programa     := 'PKGLN_AUTH';
            vro_error.nombre_metodo       := 'PR_REGISTRAR_ACCESO_EXITOSO';
            vro_error.parametros          := 'p_id_usuario: ' || p_id_usuario || CHR(10) ||
                                             'p_direccion_ip: ' || p_direccion_ip;
            vro_error.id_usuario_creacion := p_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_acceso_exitoso;

    PROCEDURE pr_autenticar (
        p_usuario_o_email   IN VARCHAR2,
        p_direccion_ip      IN VARCHAR2,
        p_dispositivo_info  IN VARCHAR2,
        p_cursor_usuario    OUT SYS_REFCURSOR
    ) IS
        l_id_usuario  smy_usuarios.id%TYPE;
        vro_auditoria smy_auditoria_accesos%ROWTYPE;
    BEGIN
        -- 1. Validaciones de parámetros
        IF p_usuario_o_email IS NULL OR TRIM(p_usuario_o_email) IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El usuario o correo electrónico es obligatorio.');
        END IF;

        -- 2. Buscar usuario mediante paquete de consulta PKGCA_SMY_USUARIOS (Cero SELECT directo)
        l_id_usuario := PKGCA_SMY_USUARIOS.fn_buscar_por_username_email(p_usuario_o_email);

        IF l_id_usuario IS NULL THEN
            -- Registrar intento fallido vía DAO (Asignación directa de secuencia)
            BEGIN
                vro_auditoria.id             := SEQ_SMY_AUDITORIA_ACCESOS.NEXTVAL;
                vro_auditoria.id_usuario     := NULL;
                vro_auditoria.accion         := 'LOGIN_FALLIDO';
                vro_auditoria.direccion_ip   := SUBSTR(p_direccion_ip, 1, 45);
                vro_auditoria.detalles       := 'Dispositivo: ' || SUBSTR(p_dispositivo_info, 1, 200) || ' | Identificador: ' || p_usuario_o_email || ' | Motivo: Usuario o correo no encontrado';
                vro_auditoria.fecha_creacion := f_fecha_actual;
                
                PKGSMY_AUDITORIA_ACCESOS_DAO.p_insertar(vro_auditoria);
                p_do_commit('pkgln_auth.pr_autenticar');
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END;
            RAISE_APPLICATION_ERROR(-20001, 'Credenciales inválidas');
        END IF;

        -- 3. Invocar registro de acceso exitoso (orquestado en pkgln_ con DAOs y COMMIT)
        pr_registrar_acceso_exitoso(
            p_id_usuario       => l_id_usuario,
            p_direccion_ip     => p_direccion_ip,
            p_dispositivo_info => p_dispositivo_info
        );

        -- 4. Abrir cursor multi-tabla mediante PKGCA_SMY_USUARIOS
        PKGCA_SMY_USUARIOS.pr_cursor_login(l_id_usuario, p_cursor_usuario);

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_AUTH';
            vro_error.nombre_metodo       := 'PR_AUTENTICAR';
            vro_error.parametros          := 'p_usuario_o_email: ' || p_usuario_o_email || CHR(10) ||
                                             'p_direccion_ip: ' || p_direccion_ip;
            vro_error.id_usuario_creacion := l_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_autenticar;

    PROCEDURE pr_registrar_dispositivo_push (
        p_id_usuario        IN smy_usuarios.id%TYPE,
        p_token_dispositivo IN smy_dispositivos_push.token_dispositivo%TYPE,
        p_plataforma        IN smy_dispositivos_push.plataforma%TYPE
    ) IS
        vro_disp smy_dispositivos_push%ROWTYPE;
    BEGIN
        IF p_token_dispositivo IS NULL OR TRIM(p_token_dispositivo) IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El token del dispositivo no puede ser nulo.');
        END IF;

        -- Buscar existencia de token mediante PKGCA_SMY_DISPOSITIVOS_PUSH (Cero SELECT directo)
        IF PKGCA_SMY_DISPOSITIVOS_PUSH.fn_buscar_por_token(p_token_dispositivo, vro_disp) = TRUE THEN
            -- Actualizar vía DAO
            vro_disp.id_usuario                     := p_id_usuario;
            vro_disp.plataforma                     := p_plataforma;
            vro_disp.activo                         := 'S';
            vro_disp.fecha_ultimo_uso               := f_fecha_actual;
            vro_disp.id_usuario_ultima_modificacion := p_id_usuario;

            PKGSMY_DISPOSITIVOS_PUSH_DAO.p_actualizar(vro_disp);
        ELSE
            -- Insertar vía DAO con asignación directa de secuencia
            vro_disp.id                             := SEQ_SMY_DISPOSITIVOS_PUSH.NEXTVAL;
            vro_disp.id_usuario                     := p_id_usuario;
            vro_disp.token_dispositivo              := p_token_dispositivo;
            vro_disp.plataforma                     := p_plataforma;
            vro_disp.activo                         := 'S';
            vro_disp.fecha_ultimo_uso               := f_fecha_actual;
            vro_disp.fecha_creacion                 := f_fecha_actual;
            vro_disp.id_usuario_ultima_modificacion := p_id_usuario;

            PKGSMY_DISPOSITIVOS_PUSH_DAO.p_insertar(vro_disp);
        END IF;

        -- Control transaccional (COMMIT controlado)
        p_do_commit('pkgln_auth.pr_registrar_dispositivo_push');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_AUTH';
            vro_error.nombre_metodo       := 'PR_REGISTRAR_DISPOSITIVO_PUSH';
            vro_error.parametros          := 'p_id_usuario: ' || p_id_usuario || ', p_plataforma: ' || p_plataforma;
            vro_error.id_usuario_creacion := p_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_dispositivo_push;

    PROCEDURE pr_desactivar_dispositivo_push (
        p_id_usuario        IN smy_usuarios.id%TYPE,
        p_token_dispositivo IN smy_dispositivos_push.token_dispositivo%TYPE
    ) IS
        vro_disp smy_dispositivos_push%ROWTYPE;
    BEGIN
        -- Buscar existencia de token mediante PKGCA_SMY_DISPOSITIVOS_PUSH (Cero SELECT directo)
        IF PKGCA_SMY_DISPOSITIVOS_PUSH.fn_buscar_por_token(p_token_dispositivo, vro_disp) = TRUE THEN
            vro_disp.activo                         := 'N';
            vro_disp.id_usuario_ultima_modificacion := p_id_usuario;

            PKGSMY_DISPOSITIVOS_PUSH_DAO.p_actualizar(vro_disp);
        END IF;

        -- Control transaccional (COMMIT controlado)
        p_do_commit('pkgln_auth.pr_desactivar_dispositivo_push');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_AUTH';
            vro_error.nombre_metodo       := 'PR_DESACTIVAR_DISPOSITIVO_PUSH';
            vro_error.parametros          := 'p_id_usuario: ' || p_id_usuario;
            vro_error.id_usuario_creacion := p_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_desactivar_dispositivo_push;

    PROCEDURE pr_actualizar_perfil (
        pcl_json IN CLOB
    ) IS
        v_id_usuario      smy_usuarios.id%TYPE;
        v_nombre_completo VARCHAR2(200);
        v_email           VARCHAR2(200);
        v_telefono        VARCHAR2(50);
        vro_usuario       smy_usuarios%ROWTYPE;
        vro_auditoria     smy_auditoria_accesos%ROWTYPE;
    BEGIN
        -- 1. Extracción de parámetros obligatorios mediante JSON_VALUE
        v_id_usuario      := TO_NUMBER(JSON_VALUE(pcl_json, '$.id_usuario'));
        v_nombre_completo := TRIM(JSON_VALUE(pcl_json, '$.nombre_completo'));
        v_email           := LOWER(TRIM(JSON_VALUE(pcl_json, '$.email')));
        v_telefono        := TRIM(JSON_VALUE(pcl_json, '$.telefono'));

        IF v_id_usuario IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El identificador del usuario es obligatorio.');
        END IF;

        IF v_nombre_completo IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El nombre completo es obligatorio.');
        END IF;

        IF v_email IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El correo electrónico es obligatorio.');
        END IF;

        -- 2. Validación de existencia por PK exclusivamente vía DAO (Cero SELECT directo)
        IF NOT pkgsmy_usuarios_dao.f_existe(v_id_usuario, vro_usuario) THEN
            RAISE_APPLICATION_ERROR(-20001, 'El usuario no existe en la base de datos.');
        END IF;

        -- 3. Actualización mono-tabla de usuario vía DAO
        vro_usuario.nombre_completo                := SUBSTR(v_nombre_completo, 1, 150);
        vro_usuario.email                          := SUBSTR(v_email, 1, 120);
        vro_usuario.telefono                       := SUBSTR(v_telefono, 1, 30);
        vro_usuario.id_usuario_ultima_modificacion := v_id_usuario;

        pkgsmy_usuarios_dao.p_actualizar(vro_usuario);

        -- 4. Registro de auditoría vía DAO (Asignación directa de secuencia)
        vro_auditoria.id             := SEQ_SMY_AUDITORIA_ACCESOS.NEXTVAL;
        vro_auditoria.id_usuario     := v_id_usuario;
        vro_auditoria.accion         := 'ACTUALIZAR_PERFIL';
        vro_auditoria.direccion_ip   := '127.0.0.1';
        vro_auditoria.detalles       := 'Actualización de perfil para el usuario: ' || vro_usuario.username;
        vro_auditoria.fecha_creacion := f_fecha_actual;

        pkgsmy_auditoria_accesos_dao.p_insertar(vro_auditoria);

        -- 5. Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_auth.pr_actualizar_perfil');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_AUTH';
            vro_error.nombre_metodo       := 'PR_ACTUALIZAR_PERFIL';
            vro_error.parametros          := pcl_json;
            vro_error.id_usuario_creacion := v_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_actualizar_perfil;

    PROCEDURE pr_cambiar_clave (
        pcl_json IN CLOB
    ) IS
        v_id_usuario    smy_usuarios.id%TYPE;
        v_password_hash VARCHAR2(255);
        vro_usuario     smy_usuarios%ROWTYPE;
        vro_auditoria   smy_auditoria_accesos%ROWTYPE;
    BEGIN
        -- 1. Extracción de parámetros mediante JSON_VALUE
        v_id_usuario    := TO_NUMBER(JSON_VALUE(pcl_json, '$.id_usuario'));
        v_password_hash := TRIM(JSON_VALUE(pcl_json, '$.password_hash'));

        IF v_id_usuario IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El identificador del usuario es obligatorio.');
        END IF;

        IF v_password_hash IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El hash de contraseña es obligatorio.');
        END IF;

        -- 2. Validación de existencia por PK exclusivamente vía DAO
        IF NOT pkgsmy_usuarios_dao.f_existe(v_id_usuario, vro_usuario) THEN
            RAISE_APPLICATION_ERROR(-20001, 'El usuario no existe en la base de datos.');
        END IF;

        -- 3. Actualización de hash de clave vía DAO
        vro_usuario.password_hash                  := v_password_hash;
        vro_usuario.id_usuario_ultima_modificacion := v_id_usuario;

        pkgsmy_usuarios_dao.p_actualizar(vro_usuario);

        -- 4. Registro de auditoría vía DAO
        vro_auditoria.id             := SEQ_SMY_AUDITORIA_ACCESOS.NEXTVAL;
        vro_auditoria.id_usuario     := v_id_usuario;
        vro_auditoria.accion         := 'CAMBIO_PASSWORD';
        vro_auditoria.direccion_ip   := '127.0.0.1';
        vro_auditoria.detalles       := 'Cambio seguro de clave para el usuario: ' || vro_usuario.username;
        vro_auditoria.fecha_creacion := f_fecha_actual;

        pkgsmy_auditoria_accesos_dao.p_insertar(vro_auditoria);

        -- 5. Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_auth.pr_cambiar_clave');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_AUTH';
            vro_error.nombre_metodo       := 'PR_CAMBIAR_CLAVE';
            vro_error.parametros          := pcl_json;
            vro_error.id_usuario_creacion := v_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_cambiar_clave;

END PKGLN_AUTH;
/
