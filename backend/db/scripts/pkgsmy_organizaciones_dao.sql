-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO DAO: PKGSMY_ORGANIZACIONES_DAO
-- TABLA: SMY_ORGANIZACIONES
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Plantilla oficial 18 métodos)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGSMY_ORGANIZACIONES_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_ORGANIZACIONES_DAO
    || Propósito: Capa de acceso a datos exclusiva para la tabla SMY_ORGANIZACIONES
    || Estándar: Plantilla oficial DAO PL/SQL Oracle
    || =========================================================================
    */

    -- Tipo de colección estándar para registros de la tabla
    TYPE ta_smy_organizaciones IS TABLE OF smy_organizaciones%ROWTYPE INDEX BY BINARY_INTEGER;

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_organizaciones IN smy_organizaciones%ROWTYPE
    );

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_organizaciones.id%TYPE
    ) RETURN smy_organizaciones%ROWTYPE;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_organizaciones OUT PKGSMY_ORGANIZACIONES_DAO.ta_smy_organizaciones
    );

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    );

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_organizaciones.id%TYPE
    );

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_organizaciones.id%TYPE
    ) RETURN BOOLEAN;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id                 IN  smy_organizaciones.id%TYPE,
        pro_smy_organizaciones OUT smy_organizaciones%ROWTYPE
    ) RETURN BOOLEAN;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id                 IN  smy_organizaciones.id%TYPE,
        pro_smy_organizaciones OUT smy_organizaciones%ROWTYPE,
        p_rowid                OUT VARCHAR2
    ) RETURN BOOLEAN;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid                IN  VARCHAR2,
        pro_smy_organizaciones OUT smy_organizaciones%ROWTYPE
    ) RETURN BOOLEAN;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_organizaciones IN smy_organizaciones%ROWTYPE
    );

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_organizaciones IN smy_organizaciones%ROWTYPE,
        pty_id                 IN smy_organizaciones.id%TYPE
    );

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_organizaciones IN smy_organizaciones%ROWTYPE,
        p_rowid                IN VARCHAR2
    );

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_organizaciones IN smy_organizaciones%ROWTYPE
    );

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_organizaciones IN OUT smy_organizaciones%ROWTYPE
    );

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id                       IN  smy_organizaciones.id%TYPE,
        p_json_smy_organizaciones OUT CLOB
    ) RETURN NUMBER;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_organizaciones.id%TYPE
    ) RETURN CLOB;

END PKGSMY_ORGANIZACIONES_DAO;
/

CREATE OR REPLACE PACKAGE BODY PKGSMY_ORGANIZACIONES_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_ORGANIZACIONES_DAO (Body)
    || Propósito: Implementación de operaciones CRUD para SMY_ORGANIZACIONES
    || Reglas: Sin COMMIT/ROLLBACK, sin lógica de negocio, manejo nativo de JSON
    || =========================================================================
    */

    -- 1. Insertar
    PROCEDURE p_insertar (
        pro_smy_organizaciones IN smy_organizaciones%ROWTYPE
    )
    IS
    BEGIN
        INSERT INTO smy_organizaciones VALUES pro_smy_organizaciones;
    END p_insertar;

    -- 2. Traer por PK
    FUNCTION f_traer (
        pty_id IN smy_organizaciones.id%TYPE
    ) RETURN smy_organizaciones%ROWTYPE
    IS
        v_registro smy_organizaciones%ROWTYPE;
    BEGIN
        SELECT *
          INTO v_registro
          FROM smy_organizaciones
         WHERE id = pty_id;

        RETURN v_registro;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_traer;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_organizaciones OUT PKGSMY_ORGANIZACIONES_DAO.ta_smy_organizaciones
    )
    IS
    BEGIN
        SELECT *
          BULK COLLECT INTO pta_smy_organizaciones
          FROM smy_organizaciones
         ORDER BY id;
    END p_consultar_registros;

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    )
    IS
    BEGIN
        DELETE FROM smy_organizaciones
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_eliminar_rowid;

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_organizaciones.id%TYPE
    )
    IS
    BEGIN
        DELETE FROM smy_organizaciones
         WHERE id = pty_id;
    END p_eliminar;

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros
    IS
    BEGIN
        DELETE FROM smy_organizaciones;
    END p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_organizaciones.id%TYPE
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER(1);
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_organizaciones
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id                 IN  smy_organizaciones.id%TYPE,
        pro_smy_organizaciones OUT smy_organizaciones%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_organizaciones
          FROM smy_organizaciones
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id                 IN  smy_organizaciones.id%TYPE,
        pro_smy_organizaciones OUT smy_organizaciones%ROWTYPE,
        p_rowid                OUT VARCHAR2
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT ROWIDTOCHAR(ROWID)
          INTO p_rowid
          FROM smy_organizaciones
         WHERE id = pty_id;

        SELECT *
          INTO pro_smy_organizaciones
          FROM smy_organizaciones
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_rowid := NULL;
            RETURN FALSE;
    END f_existe;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER(1);
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_organizaciones
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid                IN  VARCHAR2,
        pro_smy_organizaciones OUT smy_organizaciones%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_organizaciones
          FROM smy_organizaciones
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_organizaciones IN smy_organizaciones%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_organizaciones
           SET codigo_organizacion            = pro_smy_organizaciones.codigo_organizacion,
               razon_social                   = pro_smy_organizaciones.razon_social,
               nombre_comercial               = pro_smy_organizaciones.nombre_comercial,
               numero_identificacion_trib     = pro_smy_organizaciones.numero_identificacion_trib,
               id_tipo_identificacion         = pro_smy_organizaciones.id_tipo_identificacion,
               email_corporativo              = pro_smy_organizaciones.email_corporativo,
               telefono_contacto              = pro_smy_organizaciones.telefono_contacto,
               sitio_web                      = pro_smy_organizaciones.sitio_web,
               id_archivo_logo                = pro_smy_organizaciones.id_archivo_logo,
               id_estado_organizacion         = pro_smy_organizaciones.id_estado_organizacion,
               id_usuario_ultima_modificacion = pro_smy_organizaciones.id_usuario_ultima_modificacion
         WHERE id = pro_smy_organizaciones.id;
    END p_actualizar;

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_organizaciones IN smy_organizaciones%ROWTYPE,
        pty_id                 IN smy_organizaciones.id%TYPE
    )
    IS
    BEGIN
        UPDATE smy_organizaciones
           SET codigo_organizacion            = pro_smy_organizaciones.codigo_organizacion,
               razon_social                   = pro_smy_organizaciones.razon_social,
               nombre_comercial               = pro_smy_organizaciones.nombre_comercial,
               numero_identificacion_trib     = pro_smy_organizaciones.numero_identificacion_trib,
               id_tipo_identificacion         = pro_smy_organizaciones.id_tipo_identificacion,
               email_corporativo              = pro_smy_organizaciones.email_corporativo,
               telefono_contacto              = pro_smy_organizaciones.telefono_contacto,
               sitio_web                      = pro_smy_organizaciones.sitio_web,
               id_archivo_logo                = pro_smy_organizaciones.id_archivo_logo,
               id_estado_organizacion         = pro_smy_organizaciones.id_estado_organizacion,
               id_usuario_ultima_modificacion = pro_smy_organizaciones.id_usuario_ultima_modificacion
         WHERE id = pty_id;
    END p_actualizar;

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_organizaciones IN smy_organizaciones%ROWTYPE,
        p_rowid                IN VARCHAR2
    )
    IS
    BEGIN
        UPDATE smy_organizaciones
           SET codigo_organizacion            = pro_smy_organizaciones.codigo_organizacion,
               razon_social                   = pro_smy_organizaciones.razon_social,
               nombre_comercial               = pro_smy_organizaciones.nombre_comercial,
               numero_identificacion_trib     = pro_smy_organizaciones.numero_identificacion_trib,
               id_tipo_identificacion         = pro_smy_organizaciones.id_tipo_identificacion,
               email_corporativo              = pro_smy_organizaciones.email_corporativo,
               telefono_contacto              = pro_smy_organizaciones.telefono_contacto,
               sitio_web                      = pro_smy_organizaciones.sitio_web,
               id_archivo_logo                = pro_smy_organizaciones.id_archivo_logo,
               id_estado_organizacion         = pro_smy_organizaciones.id_estado_organizacion,
               id_usuario_ultima_modificacion = pro_smy_organizaciones.id_usuario_ultima_modificacion
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_actualizar_rowid;

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_organizaciones IN smy_organizaciones%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_organizaciones
           SET codigo_organizacion            = pro_smy_organizaciones.codigo_organizacion,
               razon_social                   = pro_smy_organizaciones.razon_social,
               nombre_comercial               = pro_smy_organizaciones.nombre_comercial,
               numero_identificacion_trib     = pro_smy_organizaciones.numero_identificacion_trib,
               id_tipo_identificacion         = pro_smy_organizaciones.id_tipo_identificacion,
               email_corporativo              = pro_smy_organizaciones.email_corporativo,
               telefono_contacto              = pro_smy_organizaciones.telefono_contacto,
               sitio_web                      = pro_smy_organizaciones.sitio_web,
               id_archivo_logo                = pro_smy_organizaciones.id_archivo_logo,
               id_estado_organizacion         = pro_smy_organizaciones.id_estado_organizacion,
               id_usuario_ultima_modificacion = pro_smy_organizaciones.id_usuario_ultima_modificacion;
    END p_actualizar_registros;

    -- 16. Valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_organizaciones IN OUT smy_organizaciones%ROWTYPE
    )
    IS
    BEGIN
        pro_smy_organizaciones.id                     := NULL;
        pro_smy_organizaciones.id_estado_organizacion := 1;
        pro_smy_organizaciones.fecha_creacion         := CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE);
    END p_valores_defecto;

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id                       IN  smy_organizaciones.id%TYPE,
        p_json_smy_organizaciones OUT CLOB
    ) RETURN NUMBER
    IS
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'codigo_organizacion' VALUE t.codigo_organizacion,
                   'razon_social' VALUE t.razon_social,
                   'nombre_comercial' VALUE t.nombre_comercial,
                   'numero_identificacion_trib' VALUE t.numero_identificacion_trib,
                   'id_tipo_identificacion' VALUE t.id_tipo_identificacion,
                   'email_corporativo' VALUE t.email_corporativo,
                   'telefono_contacto' VALUE t.telefono_contacto,
                   'sitio_web' VALUE t.sitio_web,
                   'id_archivo_logo' VALUE t.id_archivo_logo,
                   'id_estado_organizacion' VALUE t.id_estado_organizacion,
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO p_json_smy_organizaciones
          FROM smy_organizaciones t
         WHERE t.id = p_id;

        RETURN 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_json_smy_organizaciones := NULL;
            RETURN 0;
    END f_existe_json;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_organizaciones.id%TYPE
    ) RETURN CLOB
    IS
        v_json CLOB;
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'codigo_organizacion' VALUE t.codigo_organizacion,
                   'razon_social' VALUE t.razon_social,
                   'nombre_comercial' VALUE t.nombre_comercial,
                   'numero_identificacion_trib' VALUE t.numero_identificacion_trib,
                   'id_tipo_identificacion' VALUE t.id_tipo_identificacion,
                   'email_corporativo' VALUE t.email_corporativo,
                   'telefono_contacto' VALUE t.telefono_contacto,
                   'sitio_web' VALUE t.sitio_web,
                   'id_archivo_logo' VALUE t.id_archivo_logo,
                   'id_estado_organizacion' VALUE t.id_estado_organizacion,
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO v_json
          FROM smy_organizaciones t
         WHERE t.id = p_id;

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_json;

END PKGSMY_ORGANIZACIONES_DAO;
/
