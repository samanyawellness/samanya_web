-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_USUARIOS
-- FAMILIA: pkgca_ (Consultas avanzadas, filtros multi-criterio, SYS_REFCURSOR y búsquedas no-PK)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_USUARIOS
AS
    /*
    || =========================================================================
    || Paquete: PKGCA_SMY_USUARIOS
    || Propósito: Consultas, filtros y búsquedas no-PK sobre la entidad SMY_USUARIOS.
    || Estándar: oracle-plsql-architecture (Familia pkgca_)
    || =========================================================================
    */

    -- Busca el ID de un usuario por username o correo electrónico normalizado
    FUNCTION fn_buscar_por_username_email (
        p_usuario_o_email IN VARCHAR2
    ) RETURN smy_usuarios.id%TYPE;

    -- Retorna el cursor multi-tabla para la sesión de usuario autenticado
    PROCEDURE pr_cursor_login (
        p_id_usuario     IN  smy_usuarios.id%TYPE,
        p_cursor_usuario OUT SYS_REFCURSOR
    );

END PKGCA_SMY_USUARIOS;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_USUARIOS
AS

    FUNCTION fn_buscar_por_username_email (
        p_usuario_o_email IN VARCHAR2
    ) RETURN smy_usuarios.id%TYPE
    IS
        l_id smy_usuarios.id%TYPE;
    BEGIN
        SELECT id
          INTO l_id
          FROM smy_usuarios
         WHERE (LOWER(username) = LOWER(TRIM(p_usuario_o_email)) 
             OR LOWER(email) = LOWER(TRIM(p_usuario_o_email)))
           AND ROWNUM = 1;

        RETURN l_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END fn_buscar_por_username_email;

    PROCEDURE pr_cursor_login (
        p_id_usuario     IN  smy_usuarios.id%TYPE,
        p_cursor_usuario OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor_usuario FOR
            SELECT u.id,
                   u.username,
                   u.email,
                   u.password_hash,
                   u.nombre_completo,
                   u.telefono,
                   u.id_archivo_foto_perfil,
                   arc.ruta_completa_almacenamiento AS avatar_url,
                   u.id_estado_usuario,
                   r.codigo AS codigo_rol,
                   r.nombre AS nombre_rol,
                   e.nombre_estado_usuario
              FROM smy_usuarios u,
                   smy_roles r,
                   smy_estados_usuarios e,
                    smy_archivos arc
             WHERE u.id_rol = r.id
               AND u.id_estado_usuario = e.id
               AND u.id_archivo_foto_perfil = arc.id(+)
               AND u.id = p_id_usuario;
    END pr_cursor_login;

END PKGCA_SMY_USUARIOS;
/
