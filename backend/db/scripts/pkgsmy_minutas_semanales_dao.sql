-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO DAO: PKGSMY_MINUTAS_SEMANALES_DAO
-- TABLA: SMY_MINUTAS_SEMANALES
-- ESTÁNDAR: DAO CORPORATIVO (PLANTILLA OFICIAL DE 18 MÉTODOS)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGSMY_MINUTAS_SEMANALES_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_MINUTAS_SEMANALES_DAO
    || Propósito: Capa de acceso a datos exclusiva para la tabla SMY_MINUTAS_SEMANALES
    || Métodos: 18 operaciones estándar por ID y ROWID sin transaccionalidad.
    || =========================================================================
    */

    TYPE ta_smy_minutas_semanales IS TABLE OF smy_minutas_semanales%ROWTYPE INDEX BY BINARY_INTEGER;

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE
    );

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_minutas_semanales.id%TYPE
    ) RETURN smy_minutas_semanales%ROWTYPE;

    -- 3. Traer todos los registros
    PROCEDURE p_traer (
        pta_smy_minutas_semanales OUT PKGSMY_MINUTAS_SEMANALES_DAO.ta_smy_minutas_semanales
    );

    -- 4. Eliminar por registro
    PROCEDURE p_eliminar (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE
    );

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_minutas_semanales.id%TYPE
    );

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_minutas_semanales.id%TYPE
    ) RETURN BOOLEAN;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_minutas_semanales.id%TYPE,
        pro_smy_minutas_semanales  OUT smy_minutas_semanales%ROWTYPE
    ) RETURN BOOLEAN;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_minutas_semanales.id%TYPE,
        pro_smy_minutas_semanales  OUT smy_minutas_semanales%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_minutas_semanales  OUT smy_minutas_semanales%ROWTYPE
    ) RETURN BOOLEAN;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE
    );

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE,
        pty_id      IN smy_minutas_semanales.id%TYPE
    );

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE,
        p_rowid     IN VARCHAR2
    );

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE
    );

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_minutas_semanales IN OUT smy_minutas_semanales%ROWTYPE
    );

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_minutas_semanales.id%TYPE,
        p_json_smy_minutas_semanales  OUT CLOB
    ) RETURN NUMBER;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_minutas_semanales.id%TYPE
    ) RETURN CLOB;

END PKGSMY_MINUTAS_SEMANALES_DAO;
/

CREATE OR REPLACE PACKAGE BODY PKGSMY_MINUTAS_SEMANALES_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_MINUTAS_SEMANALES_DAO (Body)
    || Propósito: Implementación de operaciones CRUD para SMY_MINUTAS_SEMANALES
    || =========================================================================
    */

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE
    )
    IS
    BEGIN
        INSERT INTO smy_minutas_semanales VALUES pro_smy_minutas_semanales;
    END p_insertar;

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_minutas_semanales.id%TYPE
    ) RETURN smy_minutas_semanales%ROWTYPE
    IS
        v_registro smy_minutas_semanales%ROWTYPE;
    BEGIN
        SELECT *
          INTO v_registro
          FROM smy_minutas_semanales
         WHERE id = pty_id;

        RETURN v_registro;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_traer;

    -- 3. Traer todos los registros
    PROCEDURE p_traer (
        pta_smy_minutas_semanales OUT PKGSMY_MINUTAS_SEMANALES_DAO.ta_smy_minutas_semanales
    )
    IS
    BEGIN
        SELECT *
          BULK COLLECT INTO pta_smy_minutas_semanales
          FROM smy_minutas_semanales
         ORDER BY fecha_inicio DESC;
    END p_traer;

    -- 4. Eliminar por registro
    PROCEDURE p_eliminar (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE
    )
    IS
    BEGIN
        DELETE FROM smy_minutas_semanales
         WHERE id = pro_smy_minutas_semanales.id;
    END p_eliminar;

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_minutas_semanales.id%TYPE
    )
    IS
    BEGIN
        DELETE FROM smy_minutas_semanales
         WHERE id = pty_id;
    END p_eliminar;

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar
    IS
    BEGIN
        DELETE FROM smy_minutas_semanales;
    END p_eliminar;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_minutas_semanales.id%TYPE
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_minutas_semanales
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_minutas_semanales.id%TYPE,
        pro_smy_minutas_semanales  OUT smy_minutas_semanales%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_minutas_semanales
          FROM smy_minutas_semanales
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_minutas_semanales.id%TYPE,
        pro_smy_minutas_semanales  OUT smy_minutas_semanales%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT ROWIDTOCHAR(ROWID)
          INTO p_rowid
          FROM smy_minutas_semanales
         WHERE id = pty_id;

        SELECT *
          INTO pro_smy_minutas_semanales
          FROM smy_minutas_semanales
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
          FROM smy_minutas_semanales
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_minutas_semanales  OUT smy_minutas_semanales%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_minutas_semanales
          FROM smy_minutas_semanales
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_minutas_semanales
           SET ROW = pro_smy_minutas_semanales
         WHERE id = pro_smy_minutas_semanales.id;
    END p_actualizar;

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE,
        pty_id      IN smy_minutas_semanales.id%TYPE
    )
    IS
    BEGIN
        UPDATE smy_minutas_semanales
           SET ROW = pro_smy_minutas_semanales
         WHERE id = pty_id;
    END p_actualizar;

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE,
        p_rowid     IN VARCHAR2
    )
    IS
    BEGIN
        UPDATE smy_minutas_semanales
           SET ROW = pro_smy_minutas_semanales
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_actualizar_rowid;

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_minutas_semanales IN smy_minutas_semanales%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_minutas_semanales
           SET ROW = pro_smy_minutas_semanales;
    END p_actualizar_registros;

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_minutas_semanales IN OUT smy_minutas_semanales%ROWTYPE
    )
    IS
    BEGIN
        pro_smy_minutas_semanales.estado := NVL(pro_smy_minutas_semanales.estado, 'ACTIVO');
        pro_smy_minutas_semanales.creado_por := NVL(pro_smy_minutas_semanales.creado_por, 'SISTEMA');
        pro_smy_minutas_semanales.fecha_creacion := NVL(pro_smy_minutas_semanales.fecha_creacion, f_fecha_actual);
    END p_valores_defecto;

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_minutas_semanales.id%TYPE,
        p_json_smy_minutas_semanales  OUT CLOB
    ) RETURN NUMBER
    IS
    BEGIN
        SELECT JSON_OBJECT(
                   'id'                  VALUE t.id,
                   'id_centro'           VALUE t.id_centro,
                   'nombre'              VALUE t.nombre,
                   'descripcion'         VALUE t.descripcion,
                   'fecha_inicio'        VALUE TO_CHAR(t.fecha_inicio, 'YYYY-MM-DD'),
                   'fecha_fin'           VALUE TO_CHAR(t.fecha_fin, 'YYYY-MM-DD'),
                   'estado'              VALUE t.estado,
                   'creado_por'          VALUE t.creado_por,
                   'fecha_creacion'      VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'actualizado_por'     VALUE t.actualizado_por,
                   'fecha_actualizacion' VALUE TO_CHAR(t.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS')
                   RETURNING CLOB
               )
          INTO p_json_smy_minutas_semanales
          FROM smy_minutas_semanales t
         WHERE t.id = p_id;

        RETURN 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_json_smy_minutas_semanales := NULL;
            RETURN 0;
    END f_existe_json;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_minutas_semanales.id%TYPE
    ) RETURN CLOB
    IS
        v_json CLOB;
    BEGIN
        SELECT JSON_OBJECT(
                   'id'                  VALUE t.id,
                   'id_centro'           VALUE t.id_centro,
                   'nombre'              VALUE t.nombre,
                   'descripcion'         VALUE t.descripcion,
                   'fecha_inicio'        VALUE TO_CHAR(t.fecha_inicio, 'YYYY-MM-DD'),
                   'fecha_fin'           VALUE TO_CHAR(t.fecha_fin, 'YYYY-MM-DD'),
                   'estado'              VALUE t.estado,
                   'creado_por'          VALUE t.creado_por,
                   'fecha_creacion'      VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'actualizado_por'     VALUE t.actualizado_por,
                   'fecha_actualizacion' VALUE TO_CHAR(t.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS')
                   RETURNING CLOB
               )
          INTO v_json
          FROM smy_minutas_semanales t
         WHERE t.id = p_id;

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_json;

END PKGSMY_MINUTAS_SEMANALES_DAO;
/
