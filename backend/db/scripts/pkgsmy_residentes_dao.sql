-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO DAO: PKGSMY_RESIDENTES_DAO
-- TABLA: SMY_RESIDENTES
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Plantilla oficial 18 métodos)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGSMY_RESIDENTES_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_RESIDENTES_DAO
    || Propósito: Capa de acceso a datos exclusiva para la tabla SMY_RESIDENTES
    || Estándar: Plantilla oficial DAO PL/SQL Oracle
    || =========================================================================
    */

    -- Tipo de colección estándar para registros de la tabla
    TYPE ta_smy_residentes IS TABLE OF smy_residentes%ROWTYPE INDEX BY BINARY_INTEGER;

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_residentes IN smy_residentes%ROWTYPE
    );

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_residentes.id%TYPE
    ) RETURN smy_residentes%ROWTYPE;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_residentes OUT PKGSMY_RESIDENTES_DAO.ta_smy_residentes
    );

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    );

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_residentes.id%TYPE
    );

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_residentes.id%TYPE
    ) RETURN BOOLEAN;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_residentes.id%TYPE,
        pro_smy_residentes  OUT smy_residentes%ROWTYPE
    ) RETURN BOOLEAN;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_residentes.id%TYPE,
        pro_smy_residentes  OUT smy_residentes%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_residentes  OUT smy_residentes%ROWTYPE
    ) RETURN BOOLEAN;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_residentes IN smy_residentes%ROWTYPE
    );

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_residentes IN smy_residentes%ROWTYPE,
        pty_id      IN smy_residentes.id%TYPE
    );

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_residentes IN smy_residentes%ROWTYPE,
        p_rowid     IN VARCHAR2
    );

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_residentes IN smy_residentes%ROWTYPE
    );

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_residentes IN OUT smy_residentes%ROWTYPE
    );

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_residentes.id%TYPE,
        p_json_smy_residentes  OUT CLOB
    ) RETURN NUMBER;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_residentes.id%TYPE
    ) RETURN CLOB;

END PKGSMY_RESIDENTES_DAO;
/

CREATE OR REPLACE PACKAGE BODY PKGSMY_RESIDENTES_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_RESIDENTES_DAO (Body)
    || Propósito: Implementación de operaciones CRUD para SMY_RESIDENTES
    || Reglas: Sin COMMIT/ROLLBACK, sin lógica de negocio, manejo nativo de JSON
    || =========================================================================
    */

    -- 1. Insertar
    PROCEDURE p_insertar (
        pro_smy_residentes IN smy_residentes%ROWTYPE
    )
    IS
    BEGIN
        INSERT INTO smy_residentes VALUES pro_smy_residentes;
    END p_insertar;

    -- 2. Traer por PK
    FUNCTION f_traer (
        pty_id IN smy_residentes.id%TYPE
    ) RETURN smy_residentes%ROWTYPE
    IS
        v_registro smy_residentes%ROWTYPE;
    BEGIN
        SELECT *
          INTO v_registro
          FROM smy_residentes
         WHERE id = pty_id;

        RETURN v_registro;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_traer;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_residentes OUT PKGSMY_RESIDENTES_DAO.ta_smy_residentes
    )
    IS
    BEGIN
        SELECT *
          BULK COLLECT INTO pta_smy_residentes
          FROM smy_residentes;
    END p_consultar_registros;

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    )
    IS
    BEGIN
        DELETE FROM smy_residentes
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_eliminar_rowid;

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_residentes.id%TYPE
    )
    IS
    BEGIN
        DELETE FROM smy_residentes
         WHERE id = pty_id;
    END p_eliminar;

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros
    IS
    BEGIN
        DELETE FROM smy_residentes;
    END p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_residentes.id%TYPE
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_residentes
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_residentes.id%TYPE,
        pro_smy_residentes  OUT smy_residentes%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_residentes
          FROM smy_residentes
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_residentes.id%TYPE,
        pro_smy_residentes  OUT smy_residentes%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT ROWIDTOCHAR(ROWID)
          INTO p_rowid
          FROM smy_residentes
         WHERE id = pty_id;

        SELECT *
          INTO pro_smy_residentes
          FROM smy_residentes
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
          FROM smy_residentes
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_residentes  OUT smy_residentes%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_residentes
          FROM smy_residentes
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_residentes IN smy_residentes%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_residentes
           SET ROW = pro_smy_residentes
         WHERE id = pro_smy_residentes.id;
    END p_actualizar;

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_residentes IN smy_residentes%ROWTYPE,
        pty_id      IN smy_residentes.id%TYPE
    )
    IS
    BEGIN
        UPDATE smy_residentes
           SET ROW = pro_smy_residentes
         WHERE id = pty_id;
    END p_actualizar;

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_residentes IN smy_residentes%ROWTYPE,
        p_rowid     IN VARCHAR2
    )
    IS
    BEGIN
        UPDATE smy_residentes
           SET ROW = pro_smy_residentes
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_actualizar_rowid;

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_residentes IN smy_residentes%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_residentes
           SET ROW = pro_smy_residentes;
    END p_actualizar_registros;

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_residentes IN OUT smy_residentes%ROWTYPE
    )
    IS
    BEGIN
        pro_smy_residentes.fecha_creacion := NVL(pro_smy_residentes.fecha_creacion, CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE));
        -- pro_smy_residentes.id_estado_residente := NVL(pro_smy_residentes.id_estado_residente, 1);
    END p_valores_defecto;

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_residentes.id%TYPE,
        p_json_smy_residentes  OUT CLOB
    ) RETURN NUMBER
    IS
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'id_centro' VALUE t.id_centro,
                   'codigo_expediente' VALUE t.codigo_expediente,
                   'id_tipo_identificacion' VALUE t.id_tipo_identificacion,
                   'identificacion' VALUE t.identificacion,
                   'nombres' VALUE t.nombres,
                   'apellidos' VALUE t.apellidos,
                   'fecha_nacimiento' VALUE TO_CHAR(t.fecha_nacimiento, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_genero' VALUE t.id_genero,
                   'id_archivo_foto_perfil' VALUE t.id_archivo_foto_perfil,
                   'habitacion' VALUE t.habitacion,
                   'cama' VALUE t.cama,
                   'eps' VALUE t.eps,
                   'plan_complementario' VALUE t.plan_complementario,
                   'tipo_sangre' VALUE t.tipo_sangre,
                   'id_nivel_movilidad' VALUE t.id_nivel_movilidad,
                   'id_tipo_dieta' VALUE t.id_tipo_dieta,
                   'alertas_clinicas' VALUE t.alertas_clinicas,
                   'id_estado_residente' VALUE t.id_estado_residente,
                   'codigo_qr_token' VALUE t.codigo_qr_token,
                   'fecha_ingreso' VALUE TO_CHAR(t.fecha_ingreso, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'fecha_egreso' VALUE TO_CHAR(t.fecha_egreso, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO p_json_smy_residentes
          FROM smy_residentes t
         WHERE t.id = p_id;

        RETURN 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_json_smy_residentes := NULL;
            RETURN 0;
    END f_existe_json;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_residentes.id%TYPE
    ) RETURN CLOB
    IS
        v_json CLOB;
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'id_centro' VALUE t.id_centro,
                   'codigo_expediente' VALUE t.codigo_expediente,
                   'id_tipo_identificacion' VALUE t.id_tipo_identificacion,
                   'identificacion' VALUE t.identificacion,
                   'nombres' VALUE t.nombres,
                   'apellidos' VALUE t.apellidos,
                   'fecha_nacimiento' VALUE TO_CHAR(t.fecha_nacimiento, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_genero' VALUE t.id_genero,
                   'id_archivo_foto_perfil' VALUE t.id_archivo_foto_perfil,
                   'habitacion' VALUE t.habitacion,
                   'cama' VALUE t.cama,
                   'eps' VALUE t.eps,
                   'plan_complementario' VALUE t.plan_complementario,
                   'tipo_sangre' VALUE t.tipo_sangre,
                   'id_nivel_movilidad' VALUE t.id_nivel_movilidad,
                   'id_tipo_dieta' VALUE t.id_tipo_dieta,
                   'alertas_clinicas' VALUE t.alertas_clinicas,
                   'id_estado_residente' VALUE t.id_estado_residente,
                   'codigo_qr_token' VALUE t.codigo_qr_token,
                   'fecha_ingreso' VALUE TO_CHAR(t.fecha_ingreso, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'fecha_egreso' VALUE TO_CHAR(t.fecha_egreso, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO v_json
          FROM smy_residentes t
         WHERE t.id = p_id;

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_json;

END PKGSMY_RESIDENTES_DAO;
/
