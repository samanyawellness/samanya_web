-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO DAO: PKGSMY_PLAN_NUTRICIONAL_DAO
-- TABLA: SMY_PLAN_NUTRICIONAL
-- ESTÁNDAR: DAO CORPORATIVO (PLANTILLA OFICIAL DE 18 MÉTODOS)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGSMY_PLAN_NUTRICIONAL_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_PLAN_NUTRICIONAL_DAO
    || Propósito: Capa de acceso a datos exclusiva para la tabla SMY_PLAN_NUTRICIONAL
    || Métodos: 18 operaciones estándar por ID y ROWID sin transaccionalidad.
    || =========================================================================
    */

    TYPE ta_smy_plan_nutricional IS TABLE OF smy_plan_nutricional%ROWTYPE INDEX BY BINARY_INTEGER;

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE
    );

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_plan_nutricional.id%TYPE
    ) RETURN smy_plan_nutricional%ROWTYPE;

    -- 3. Traer todos los registros
    PROCEDURE p_traer (
        pta_smy_plan_nutricional OUT PKGSMY_PLAN_NUTRICIONAL_DAO.ta_smy_plan_nutricional
    );

    -- 4. Eliminar por registro
    PROCEDURE p_eliminar (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE
    );

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_plan_nutricional.id%TYPE
    );

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_plan_nutricional.id%TYPE
    ) RETURN BOOLEAN;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_plan_nutricional.id%TYPE,
        pro_smy_plan_nutricional  OUT smy_plan_nutricional%ROWTYPE
    ) RETURN BOOLEAN;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_plan_nutricional.id%TYPE,
        pro_smy_plan_nutricional  OUT smy_plan_nutricional%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_plan_nutricional  OUT smy_plan_nutricional%ROWTYPE
    ) RETURN BOOLEAN;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE
    );

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE,
        pty_id      IN smy_plan_nutricional.id%TYPE
    );

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE,
        p_rowid     IN VARCHAR2
    );

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE
    );

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_plan_nutricional IN OUT smy_plan_nutricional%ROWTYPE
    );

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_plan_nutricional.id%TYPE,
        p_json_smy_plan_nutricional  OUT CLOB
    ) RETURN NUMBER;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_plan_nutricional.id%TYPE
    ) RETURN CLOB;

END PKGSMY_PLAN_NUTRICIONAL_DAO;
/

CREATE OR REPLACE PACKAGE BODY PKGSMY_PLAN_NUTRICIONAL_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_PLAN_NUTRICIONAL_DAO (Body)
    || Propósito: Implementación de operaciones CRUD para SMY_PLAN_NUTRICIONAL
    || =========================================================================
    */

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE
    )
    IS
    BEGIN
        INSERT INTO smy_plan_nutricional VALUES pro_smy_plan_nutricional;
    END p_insertar;

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_plan_nutricional.id%TYPE
    ) RETURN smy_plan_nutricional%ROWTYPE
    IS
        v_registro smy_plan_nutricional%ROWTYPE;
    BEGIN
        SELECT *
          INTO v_registro
          FROM smy_plan_nutricional
         WHERE id = pty_id;

        RETURN v_registro;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_traer;

    -- 3. Traer todos los registros
    PROCEDURE p_traer (
        pta_smy_plan_nutricional OUT PKGSMY_PLAN_NUTRICIONAL_DAO.ta_smy_plan_nutricional
    )
    IS
    BEGIN
        SELECT *
          BULK COLLECT INTO pta_smy_plan_nutricional
          FROM smy_plan_nutricional;
    END p_traer;

    -- 4. Eliminar por registro
    PROCEDURE p_eliminar (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE
    )
    IS
    BEGIN
        DELETE FROM smy_plan_nutricional
         WHERE id = pro_smy_plan_nutricional.id;
    END p_eliminar;

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_plan_nutricional.id%TYPE
    )
    IS
    BEGIN
        DELETE FROM smy_plan_nutricional
         WHERE id = pty_id;
    END p_eliminar;

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar
    IS
    BEGIN
        DELETE FROM smy_plan_nutricional;
    END p_eliminar;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_plan_nutricional.id%TYPE
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_plan_nutricional
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_plan_nutricional.id%TYPE,
        pro_smy_plan_nutricional  OUT smy_plan_nutricional%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_plan_nutricional
          FROM smy_plan_nutricional
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_plan_nutricional.id%TYPE,
        pro_smy_plan_nutricional  OUT smy_plan_nutricional%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT ROWIDTOCHAR(ROWID)
          INTO p_rowid
          FROM smy_plan_nutricional
         WHERE id = pty_id;

        SELECT *
          INTO pro_smy_plan_nutricional
          FROM smy_plan_nutricional
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
          FROM smy_plan_nutricional
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_plan_nutricional  OUT smy_plan_nutricional%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_plan_nutricional
          FROM smy_plan_nutricional
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_plan_nutricional
           SET ROW = pro_smy_plan_nutricional
         WHERE id = pro_smy_plan_nutricional.id;
    END p_actualizar;

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE,
        pty_id      IN smy_plan_nutricional.id%TYPE
    )
    IS
    BEGIN
        UPDATE smy_plan_nutricional
           SET ROW = pro_smy_plan_nutricional
         WHERE id = pty_id;
    END p_actualizar;

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE,
        p_rowid     IN VARCHAR2
    )
    IS
    BEGIN
        UPDATE smy_plan_nutricional
           SET ROW = pro_smy_plan_nutricional
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_actualizar_rowid;

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_plan_nutricional IN smy_plan_nutricional%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_plan_nutricional
           SET ROW = pro_smy_plan_nutricional;
    END p_actualizar_registros;

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_plan_nutricional IN OUT smy_plan_nutricional%ROWTYPE
    )
    IS
    BEGIN
        pro_smy_plan_nutricional.requiere_asistencia := NVL(pro_smy_plan_nutricional.requiere_asistencia, 'N');
        pro_smy_plan_nutricional.estado := NVL(pro_smy_plan_nutricional.estado, 'ACTIVO');
        pro_smy_plan_nutricional.creado_por := NVL(pro_smy_plan_nutricional.creado_por, 'SISTEMA');
        pro_smy_plan_nutricional.fecha_creacion := NVL(pro_smy_plan_nutricional.fecha_creacion, f_fecha_actual);
    END p_valores_defecto;

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_plan_nutricional.id%TYPE,
        p_json_smy_plan_nutricional  OUT CLOB
    ) RETURN NUMBER
    IS
    BEGIN
        SELECT JSON_OBJECT(
                   'id'                          VALUE t.id,
                   'id_centro'                   VALUE t.id_centro,
                   'id_residente'                VALUE t.id_residente,
                   'id_tipo_dieta'               VALUE t.id_tipo_dieta,
                   'id_consistencia'             VALUE t.id_consistencia,
                   'id_nivel_espesante'          VALUE t.id_nivel_espesante,
                   'requerimiento_calorico_kcal' VALUE t.requerimiento_calorico_kcal,
                   'restricciones_alergias'      VALUE t.restricciones_alergias,
                   'alimentos_preferidos'        VALUE t.alimentos_preferidos,
                   'alimentos_rechazados'        VALUE t.alimentos_rechazados,
                   'requiere_asistencia'         VALUE t.requiere_asistencia,
                   'suplemento_nutricional'      VALUE t.suplemento_nutricional,
                   'observaciones'               VALUE t.observaciones,
                   'estado'                      VALUE t.estado,
                   'creado_por'                  VALUE t.creado_por,
                   'fecha_creacion'              VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'actualizado_por'             VALUE t.actualizado_por,
                   'fecha_actualizacion'         VALUE TO_CHAR(t.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS')
                   RETURNING CLOB
               )
          INTO p_json_smy_plan_nutricional
          FROM smy_plan_nutricional t
         WHERE t.id = p_id;

        RETURN 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_json_smy_plan_nutricional := NULL;
            RETURN 0;
    END f_existe_json;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_plan_nutricional.id%TYPE
    ) RETURN CLOB
    IS
        v_json CLOB;
    BEGIN
        SELECT JSON_OBJECT(
                   'id'                          VALUE t.id,
                   'id_centro'                   VALUE t.id_centro,
                   'id_residente'                VALUE t.id_residente,
                   'id_tipo_dieta'               VALUE t.id_tipo_dieta,
                   'id_consistencia'             VALUE t.id_consistencia,
                   'id_nivel_espesante'          VALUE t.id_nivel_espesante,
                   'requerimiento_calorico_kcal' VALUE t.requerimiento_calorico_kcal,
                   'restricciones_alergias'      VALUE t.restricciones_alergias,
                   'alimentos_preferidos'        VALUE t.alimentos_preferidos,
                   'alimentos_rechazados'        VALUE t.alimentos_rechazados,
                   'requiere_asistencia'         VALUE t.requiere_asistencia,
                   'suplemento_nutricional'      VALUE t.suplemento_nutricional,
                   'observaciones'               VALUE t.observaciones,
                   'estado'                      VALUE t.estado,
                   'creado_por'                  VALUE t.creado_por,
                   'fecha_creacion'              VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'actualizado_por'             VALUE t.actualizado_por,
                   'fecha_actualizacion'         VALUE TO_CHAR(t.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS')
                   RETURNING CLOB
               )
          INTO v_json
          FROM smy_plan_nutricional t
         WHERE t.id = p_id;

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_json;

END PKGSMY_PLAN_NUTRICIONAL_DAO;
/
