-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO DAO: PKGSMY_CONSENTIMIENTO_DESTINATARIOS_DAO
-- TABLA: SMY_CONSENTIMIENTO_DESTINATARIOS
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Plantilla oficial 18 métodos)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGSMY_CONSENTIMIENTO_DESTINATARIOS_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_CONSENTIMIENTO_DESTINATARIOS_DAO
    || Propósito: Capa de acceso a datos exclusiva para la tabla SMY_CONSENTIMIENTO_DESTINATARIOS
    || Estándar: Plantilla oficial DAO PL/SQL Oracle
    || =========================================================================
    */

    -- Tipo de colección estándar para registros de la tabla
    TYPE ta_smy_consentimiento_destinatarios IS TABLE OF smy_consentimiento_destinatarios%ROWTYPE INDEX BY BINARY_INTEGER;

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_consentimiento_destinatarios IN smy_consentimiento_destinatarios%ROWTYPE
    );

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_consentimiento_destinatarios.id%TYPE
    ) RETURN smy_consentimiento_destinatarios%ROWTYPE;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_consentimiento_destinatarios OUT PKGSMY_CONSENTIMIENTO_DESTINATARIOS_DAO.ta_smy_consentimiento_destinatarios
    );

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    );

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_consentimiento_destinatarios.id%TYPE
    );

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_consentimiento_destinatarios.id%TYPE
    ) RETURN BOOLEAN;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_consentimiento_destinatarios.id%TYPE,
        pro_smy_consentimiento_destinatarios  OUT smy_consentimiento_destinatarios%ROWTYPE
    ) RETURN BOOLEAN;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_consentimiento_destinatarios.id%TYPE,
        pro_smy_consentimiento_destinatarios  OUT smy_consentimiento_destinatarios%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_consentimiento_destinatarios  OUT smy_consentimiento_destinatarios%ROWTYPE
    ) RETURN BOOLEAN;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_consentimiento_destinatarios IN smy_consentimiento_destinatarios%ROWTYPE
    );

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_consentimiento_destinatarios IN smy_consentimiento_destinatarios%ROWTYPE,
        pty_id      IN smy_consentimiento_destinatarios.id%TYPE
    );

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_consentimiento_destinatarios IN smy_consentimiento_destinatarios%ROWTYPE,
        p_rowid     IN VARCHAR2
    );

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_consentimiento_destinatarios IN smy_consentimiento_destinatarios%ROWTYPE
    );

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_consentimiento_destinatarios IN OUT smy_consentimiento_destinatarios%ROWTYPE
    );

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_consentimiento_destinatarios.id%TYPE,
        p_json_smy_consentimiento_destinatarios  OUT CLOB
    ) RETURN NUMBER;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_consentimiento_destinatarios.id%TYPE
    ) RETURN CLOB;

END PKGSMY_CONSENTIMIENTO_DESTINATARIOS_DAO;
/

CREATE OR REPLACE PACKAGE BODY PKGSMY_CONSENTIMIENTO_DESTINATARIOS_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_CONSENTIMIENTO_DESTINATARIOS_DAO (Body)
    || Propósito: Implementación de operaciones CRUD para SMY_CONSENTIMIENTO_DESTINATARIOS
    || Reglas: Sin COMMIT/ROLLBACK, sin lógica de negocio, manejo nativo de JSON
    || =========================================================================
    */

    -- 1. Insertar
    PROCEDURE p_insertar (
        pro_smy_consentimiento_destinatarios IN smy_consentimiento_destinatarios%ROWTYPE
    )
    IS
    BEGIN
        INSERT INTO smy_consentimiento_destinatarios VALUES pro_smy_consentimiento_destinatarios;
    END p_insertar;

    -- 2. Traer por PK
    FUNCTION f_traer (
        pty_id IN smy_consentimiento_destinatarios.id%TYPE
    ) RETURN smy_consentimiento_destinatarios%ROWTYPE
    IS
        v_registro smy_consentimiento_destinatarios%ROWTYPE;
    BEGIN
        SELECT *
          INTO v_registro
          FROM smy_consentimiento_destinatarios
         WHERE id = pty_id;

        RETURN v_registro;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_traer;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_consentimiento_destinatarios OUT PKGSMY_CONSENTIMIENTO_DESTINATARIOS_DAO.ta_smy_consentimiento_destinatarios
    )
    IS
    BEGIN
        SELECT *
          BULK COLLECT INTO pta_smy_consentimiento_destinatarios
          FROM smy_consentimiento_destinatarios;
    END p_consultar_registros;

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    )
    IS
    BEGIN
        DELETE FROM smy_consentimiento_destinatarios
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_eliminar_rowid;

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_consentimiento_destinatarios.id%TYPE
    )
    IS
    BEGIN
        DELETE FROM smy_consentimiento_destinatarios
         WHERE id = pty_id;
    END p_eliminar;

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros
    IS
    BEGIN
        DELETE FROM smy_consentimiento_destinatarios;
    END p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_consentimiento_destinatarios.id%TYPE
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_consentimiento_destinatarios
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_consentimiento_destinatarios.id%TYPE,
        pro_smy_consentimiento_destinatarios  OUT smy_consentimiento_destinatarios%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_consentimiento_destinatarios
          FROM smy_consentimiento_destinatarios
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_consentimiento_destinatarios.id%TYPE,
        pro_smy_consentimiento_destinatarios  OUT smy_consentimiento_destinatarios%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT ROWIDTOCHAR(ROWID)
          INTO p_rowid
          FROM smy_consentimiento_destinatarios
         WHERE id = pty_id;

        SELECT *
          INTO pro_smy_consentimiento_destinatarios
          FROM smy_consentimiento_destinatarios
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_consentimiento_destinatarios
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_consentimiento_destinatarios  OUT smy_consentimiento_destinatarios%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_consentimiento_destinatarios
          FROM smy_consentimiento_destinatarios
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_consentimiento_destinatarios IN smy_consentimiento_destinatarios%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_consentimiento_destinatarios
           SET ROW = pro_smy_consentimiento_destinatarios
         WHERE id = pro_smy_consentimiento_destinatarios.id;
    END p_actualizar;

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_consentimiento_destinatarios IN smy_consentimiento_destinatarios%ROWTYPE,
        pty_id      IN smy_consentimiento_destinatarios.id%TYPE
    )
    IS
    BEGIN
        UPDATE smy_consentimiento_destinatarios
           SET ROW = pro_smy_consentimiento_destinatarios
         WHERE id = pty_id;
    END p_actualizar;

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_consentimiento_destinatarios IN smy_consentimiento_destinatarios%ROWTYPE,
        p_rowid     IN VARCHAR2
    )
    IS
    BEGIN
        UPDATE smy_consentimiento_destinatarios
           SET ROW = pro_smy_consentimiento_destinatarios
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_actualizar_rowid;

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_consentimiento_destinatarios IN smy_consentimiento_destinatarios%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_consentimiento_destinatarios
           SET ROW = pro_smy_consentimiento_destinatarios;
    END p_actualizar_registros;

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_consentimiento_destinatarios IN OUT smy_consentimiento_destinatarios%ROWTYPE
    )
    IS
    BEGIN
        pro_smy_consentimiento_destinatarios.fecha_creacion := NVL(pro_smy_consentimiento_destinatarios.fecha_creacion, CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE));
        -- pro_smy_consentimiento_destinatarios.id_estado_firma_cons := NVL(pro_smy_consentimiento_destinatarios.id_estado_firma_cons, 1);
    END p_valores_defecto;

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_consentimiento_destinatarios.id%TYPE,
        p_json_smy_consentimiento_destinatarios  OUT CLOB
    ) RETURN NUMBER
    IS
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'id_consentimiento' VALUE t.id_consentimiento,
                   'id_acudiente' VALUE t.id_acudiente,
                   'nombre_destinatario' VALUE t.nombre_destinatario,
                   'id_parentesco' VALUE t.id_parentesco,
                   'email' VALUE t.email,
                   'id_estado_firma_cons' VALUE t.id_estado_firma_cons,
                   'fecha_accion' VALUE TO_CHAR(t.fecha_accion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'ip_firma' VALUE t.ip_firma,
                   'firma_digital_hash' VALUE t.firma_digital_hash,
                   'id_archivo_consentimiento' VALUE t.id_archivo_consentimiento,
                   'firma_canvas_base64' VALUE t.firma_canvas_base64,
                   'motivo_rechazo' VALUE t.motivo_rechazo,
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO p_json_smy_consentimiento_destinatarios
          FROM smy_consentimiento_destinatarios t
         WHERE t.id = p_id;

        RETURN 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_json_smy_consentimiento_destinatarios := NULL;
            RETURN 0;
    END f_existe_json;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_consentimiento_destinatarios.id%TYPE
    ) RETURN CLOB
    IS
        v_json CLOB;
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'id_consentimiento' VALUE t.id_consentimiento,
                   'id_acudiente' VALUE t.id_acudiente,
                   'nombre_destinatario' VALUE t.nombre_destinatario,
                   'id_parentesco' VALUE t.id_parentesco,
                   'email' VALUE t.email,
                   'id_estado_firma_cons' VALUE t.id_estado_firma_cons,
                   'fecha_accion' VALUE TO_CHAR(t.fecha_accion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'ip_firma' VALUE t.ip_firma,
                   'firma_digital_hash' VALUE t.firma_digital_hash,
                   'id_archivo_consentimiento' VALUE t.id_archivo_consentimiento,
                   'firma_canvas_base64' VALUE t.firma_canvas_base64,
                   'motivo_rechazo' VALUE t.motivo_rechazo,
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO v_json
          FROM smy_consentimiento_destinatarios t
         WHERE t.id = p_id;

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_json;

END PKGSMY_CONSENTIMIENTO_DESTINATARIOS_DAO;
/
