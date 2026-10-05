-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO DAO: PKGSMY_REGISTROS_ALIMENTACION_DAO
-- TABLA: SMY_REGISTROS_ALIMENTACION
-- ESTÁNDAR: DAO CORPORATIVO (PLANTILLA OFICIAL DE 18 MÉTODOS)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGSMY_REGISTROS_ALIMENTACION_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_REGISTROS_ALIMENTACION_DAO
    || Propósito: Capa de acceso a datos exclusiva para la tabla SMY_REGISTROS_ALIMENTACION
    || Métodos: 18 operaciones estándar por ID y ROWID sin transaccionalidad.
    || =========================================================================
    */

    TYPE ta_smy_registros_alimentacion IS TABLE OF smy_registros_alimentacion%ROWTYPE INDEX BY BINARY_INTEGER;

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE
    );

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_registros_alimentacion.id%TYPE
    ) RETURN smy_registros_alimentacion%ROWTYPE;

    -- 3. Traer todos los registros
    PROCEDURE p_traer (
        pta_smy_registros_alimentacion OUT PKGSMY_REGISTROS_ALIMENTACION_DAO.ta_smy_registros_alimentacion
    );

    -- 4. Eliminar por registro
    PROCEDURE p_eliminar (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE
    );

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_registros_alimentacion.id%TYPE
    );

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_registros_alimentacion.id%TYPE
    ) RETURN BOOLEAN;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_registros_alimentacion.id%TYPE,
        pro_smy_registros_alimentacion  OUT smy_registros_alimentacion%ROWTYPE
    ) RETURN BOOLEAN;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_registros_alimentacion.id%TYPE,
        pro_smy_registros_alimentacion  OUT smy_registros_alimentacion%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_registros_alimentacion  OUT smy_registros_alimentacion%ROWTYPE
    ) RETURN BOOLEAN;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE
    );

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE,
        pty_id      IN smy_registros_alimentacion.id%TYPE
    );

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE,
        p_rowid     IN VARCHAR2
    );

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE
    );

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_registros_alimentacion IN OUT smy_registros_alimentacion%ROWTYPE
    );

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_registros_alimentacion.id%TYPE,
        p_json_smy_registros_alimentacion  OUT CLOB
    ) RETURN NUMBER;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_registros_alimentacion.id%TYPE
    ) RETURN CLOB;

END PKGSMY_REGISTROS_ALIMENTACION_DAO;
/

CREATE OR REPLACE PACKAGE BODY PKGSMY_REGISTROS_ALIMENTACION_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_REGISTROS_ALIMENTACION_DAO (Body)
    || Propósito: Implementación de operaciones CRUD para SMY_REGISTROS_ALIMENTACION
    || =========================================================================
    */

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE
    )
    IS
    BEGIN
        INSERT INTO smy_registros_alimentacion VALUES pro_smy_registros_alimentacion;
    END p_insertar;

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_registros_alimentacion.id%TYPE
    ) RETURN smy_registros_alimentacion%ROWTYPE
    IS
        v_registro smy_registros_alimentacion%ROWTYPE;
    BEGIN
        SELECT *
          INTO v_registro
          FROM smy_registros_alimentacion
         WHERE id = pty_id;

        RETURN v_registro;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_traer;

    -- 3. Traer todos los registros
    PROCEDURE p_traer (
        pta_smy_registros_alimentacion OUT PKGSMY_REGISTROS_ALIMENTACION_DAO.ta_smy_registros_alimentacion
    )
    IS
    BEGIN
        SELECT *
          BULK COLLECT INTO pta_smy_registros_alimentacion
          FROM smy_registros_alimentacion
         ORDER BY fecha DESC, id_tiempo_comida ASC;
    END p_traer;

    -- 4. Eliminar por registro
    PROCEDURE p_eliminar (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE
    )
    IS
    BEGIN
        DELETE FROM smy_registros_alimentacion
         WHERE id = pro_smy_registros_alimentacion.id;
    END p_eliminar;

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_registros_alimentacion.id%TYPE
    )
    IS
    BEGIN
        DELETE FROM smy_registros_alimentacion
         WHERE id = pty_id;
    END p_eliminar;

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar
    IS
    BEGIN
        DELETE FROM smy_registros_alimentacion;
    END p_eliminar;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_registros_alimentacion.id%TYPE
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_registros_alimentacion
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_registros_alimentacion.id%TYPE,
        pro_smy_registros_alimentacion  OUT smy_registros_alimentacion%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_registros_alimentacion
          FROM smy_registros_alimentacion
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_registros_alimentacion.id%TYPE,
        pro_smy_registros_alimentacion  OUT smy_registros_alimentacion%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT ROWIDTOCHAR(ROWID)
          INTO p_rowid
          FROM smy_registros_alimentacion
         WHERE id = pty_id;

        SELECT *
          INTO pro_smy_registros_alimentacion
          FROM smy_registros_alimentacion
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
          FROM smy_registros_alimentacion
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_registros_alimentacion  OUT smy_registros_alimentacion%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_registros_alimentacion
          FROM smy_registros_alimentacion
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_registros_alimentacion
           SET ROW = pro_smy_registros_alimentacion
         WHERE id = pro_smy_registros_alimentacion.id;
    END p_actualizar;

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE,
        pty_id      IN smy_registros_alimentacion.id%TYPE
    )
    IS
    BEGIN
        UPDATE smy_registros_alimentacion
           SET ROW = pro_smy_registros_alimentacion
         WHERE id = pty_id;
    END p_actualizar;

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE,
        p_rowid     IN VARCHAR2
    )
    IS
    BEGIN
        UPDATE smy_registros_alimentacion
           SET ROW = pro_smy_registros_alimentacion
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_actualizar_rowid;

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_registros_alimentacion IN smy_registros_alimentacion%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_registros_alimentacion
           SET ROW = pro_smy_registros_alimentacion;
    END p_actualizar_registros;

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_registros_alimentacion IN OUT smy_registros_alimentacion%ROWTYPE
    )
    IS
    BEGIN
        pro_smy_registros_alimentacion.porcentaje_ingesta := NVL(pro_smy_registros_alimentacion.porcentaje_ingesta, 0);
        pro_smy_registros_alimentacion.liquidos_ml := NVL(pro_smy_registros_alimentacion.liquidos_ml, 0);
        pro_smy_registros_alimentacion.tolerancia := NVL(pro_smy_registros_alimentacion.tolerancia, 'BUENA');
        pro_smy_registros_alimentacion.asistio := NVL(pro_smy_registros_alimentacion.asistio, 'S');
        pro_smy_registros_alimentacion.creado_por := NVL(pro_smy_registros_alimentacion.creado_por, 'SISTEMA');
        pro_smy_registros_alimentacion.fecha_creacion := NVL(pro_smy_registros_alimentacion.fecha_creacion, f_fecha_actual);
    END p_valores_defecto;

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_registros_alimentacion.id%TYPE,
        p_json_smy_registros_alimentacion  OUT CLOB
    ) RETURN NUMBER
    IS
    BEGIN
        SELECT JSON_OBJECT(
                   'id'                   VALUE t.id,
                   'id_centro'            VALUE t.id_centro,
                   'id_residente'         VALUE t.id_residente,
                   'fecha'                VALUE TO_CHAR(t.fecha, 'YYYY-MM-DD'),
                   'id_tiempo_comida'     VALUE t.id_tiempo_comida,
                   'id_plan_nutricional'  VALUE t.id_plan_nutricional,
                   'porcentaje_ingesta'   VALUE t.porcentaje_ingesta,
                   'liquidos_ml'          VALUE t.liquidos_ml,
                   'tolerancia'           VALUE t.tolerancia,
                   'asistio'              VALUE t.asistio,
                   'observaciones'        VALUE t.observaciones,
                   'id_empleado_registra' VALUE t.id_empleado_registra,
                   'creado_por'           VALUE t.creado_por,
                   'fecha_creacion'       VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'actualizado_por'      VALUE t.actualizado_por,
                   'fecha_actualizacion'  VALUE TO_CHAR(t.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS')
                   RETURNING CLOB
               )
          INTO p_json_smy_registros_alimentacion
          FROM smy_registros_alimentacion t
         WHERE t.id = p_id;

        RETURN 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_json_smy_registros_alimentacion := NULL;
            RETURN 0;
    END f_existe_json;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_registros_alimentacion.id%TYPE
    ) RETURN CLOB
    IS
        v_json CLOB;
    BEGIN
        SELECT JSON_OBJECT(
                   'id'                   VALUE t.id,
                   'id_centro'            VALUE t.id_centro,
                   'id_residente'         VALUE t.id_residente,
                   'fecha'                VALUE TO_CHAR(t.fecha, 'YYYY-MM-DD'),
                   'id_tiempo_comida'     VALUE t.id_tiempo_comida,
                   'id_plan_nutricional'  VALUE t.id_plan_nutricional,
                   'porcentaje_ingesta'   VALUE t.porcentaje_ingesta,
                   'liquidos_ml'          VALUE t.liquidos_ml,
                   'tolerancia'           VALUE t.tolerancia,
                   'asistio'              VALUE t.asistio,
                   'observaciones'        VALUE t.observaciones,
                   'id_empleado_registra' VALUE t.id_empleado_registra,
                   'creado_por'           VALUE t.creado_por,
                   'fecha_creacion'       VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'actualizado_por'      VALUE t.actualizado_por,
                   'fecha_actualizacion'  VALUE TO_CHAR(t.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS')
                   RETURNING CLOB
               )
          INTO v_json
          FROM smy_registros_alimentacion t
         WHERE t.id = p_id;

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_json;

END PKGSMY_REGISTROS_ALIMENTACION_DAO;
/
