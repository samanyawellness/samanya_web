-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO DAO: PKGSMY_ARCHIVOS_DAO
-- TABLA: SMY_ARCHIVOS
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Plantilla oficial 18 métodos)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGSMY_ARCHIVOS_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_ARCHIVOS_DAO
    || Propósito: Capa de acceso a datos exclusiva para la tabla SMY_ARCHIVOS
    || Estándar: Plantilla oficial DAO PL/SQL Oracle
    || =========================================================================
    */

    -- Tipo de colección estándar para registros de la tabla
    TYPE ta_smy_archivos IS TABLE OF smy_archivos%ROWTYPE INDEX BY BINARY_INTEGER;

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_archivos IN smy_archivos%ROWTYPE
    );

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_archivos.id%TYPE
    ) RETURN smy_archivos%ROWTYPE;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_archivos OUT PKGSMY_ARCHIVOS_DAO.ta_smy_archivos
    );

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    );

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_archivos.id%TYPE
    );

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_archivos.id%TYPE
    ) RETURN BOOLEAN;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_archivos.id%TYPE,
        pro_smy_archivos  OUT smy_archivos%ROWTYPE
    ) RETURN BOOLEAN;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_archivos.id%TYPE,
        pro_smy_archivos  OUT smy_archivos%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_archivos  OUT smy_archivos%ROWTYPE
    ) RETURN BOOLEAN;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_archivos IN smy_archivos%ROWTYPE
    );

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_archivos IN smy_archivos%ROWTYPE,
        pty_id      IN smy_archivos.id%TYPE
    );

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_archivos IN smy_archivos%ROWTYPE,
        p_rowid     IN VARCHAR2
    );

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_archivos IN smy_archivos%ROWTYPE
    );

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_archivos IN OUT smy_archivos%ROWTYPE
    );

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_archivos.id%TYPE,
        p_json_smy_archivos  OUT CLOB
    ) RETURN NUMBER;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_archivos.id%TYPE
    ) RETURN CLOB;

END PKGSMY_ARCHIVOS_DAO;
/

CREATE OR REPLACE PACKAGE BODY PKGSMY_ARCHIVOS_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_ARCHIVOS_DAO (Body)
    || Propósito: Implementación de operaciones CRUD para SMY_ARCHIVOS
    || Reglas: Sin COMMIT/ROLLBACK, sin lógica de negocio, manejo nativo de JSON
    || =========================================================================
    */

    -- 1. Insertar
    PROCEDURE p_insertar (
        pro_smy_archivos IN smy_archivos%ROWTYPE
    )
    IS
    BEGIN
        INSERT INTO smy_archivos VALUES pro_smy_archivos;
    END p_insertar;

    -- 2. Traer por PK
    FUNCTION f_traer (
        pty_id IN smy_archivos.id%TYPE
    ) RETURN smy_archivos%ROWTYPE
    IS
        v_registro smy_archivos%ROWTYPE;
    BEGIN
        SELECT *
          INTO v_registro
          FROM smy_archivos
         WHERE id = pty_id;

        RETURN v_registro;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_traer;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_archivos OUT PKGSMY_ARCHIVOS_DAO.ta_smy_archivos
    )
    IS
    BEGIN
        SELECT *
          BULK COLLECT INTO pta_smy_archivos
          FROM smy_archivos;
    END p_consultar_registros;

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    )
    IS
    BEGIN
        DELETE FROM smy_archivos
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_eliminar_rowid;

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_archivos.id%TYPE
    )
    IS
    BEGIN
        DELETE FROM smy_archivos
         WHERE id = pty_id;
    END p_eliminar;

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros
    IS
    BEGIN
        DELETE FROM smy_archivos;
    END p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_archivos.id%TYPE
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_archivos
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id       IN  smy_archivos.id%TYPE,
        pro_smy_archivos  OUT smy_archivos%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_archivos
          FROM smy_archivos
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id       IN  smy_archivos.id%TYPE,
        pro_smy_archivos  OUT smy_archivos%ROWTYPE,
        p_rowid      OUT VARCHAR2
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT ROWIDTOCHAR(ROWID)
          INTO p_rowid
          FROM smy_archivos
         WHERE id = pty_id;

        SELECT *
          INTO pro_smy_archivos
          FROM smy_archivos
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
          FROM smy_archivos
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid      IN  VARCHAR2,
        pro_smy_archivos  OUT smy_archivos%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_archivos
          FROM smy_archivos
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_archivos IN smy_archivos%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_archivos
           SET ROW = pro_smy_archivos
         WHERE id = pro_smy_archivos.id;
    END p_actualizar;

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_archivos IN smy_archivos%ROWTYPE,
        pty_id      IN smy_archivos.id%TYPE
    )
    IS
    BEGIN
        UPDATE smy_archivos
           SET ROW = pro_smy_archivos
         WHERE id = pty_id;
    END p_actualizar;

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_archivos IN smy_archivos%ROWTYPE,
        p_rowid     IN VARCHAR2
    )
    IS
    BEGIN
        UPDATE smy_archivos
           SET ROW = pro_smy_archivos
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_actualizar_rowid;

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_archivos IN smy_archivos%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_archivos
           SET ROW = pro_smy_archivos;
    END p_actualizar_registros;

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_archivos IN OUT smy_archivos%ROWTYPE
    )
    IS
    BEGIN
        pro_smy_archivos.id_estado_archivo := NVL(pro_smy_archivos.id_estado_archivo, 1);
        pro_smy_archivos.fecha_creacion := NVL(pro_smy_archivos.fecha_creacion, f_fecha_actual);
    END p_valores_defecto;

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id            IN  smy_archivos.id%TYPE,
        p_json_smy_archivos  OUT CLOB
    ) RETURN NUMBER
    IS
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'nombre_archivo' VALUE t.nombre_archivo,
                   'nombre_archivo_almacenado' VALUE t.nombre_archivo_almacenado,
                   'hash_archivo' VALUE t.hash_archivo,
                   'nombre_directorio_bd' VALUE t.nombre_directorio_bd,
                   'ruta_relativa' VALUE t.ruta_relativa,
                   'ruta_completa_almacenamiento' VALUE t.ruta_completa_almacenamiento,
                   'extension' VALUE t.extension,
                   'tipo_mime' VALUE t.tipo_mime,
                   'tamano_bytes' VALUE t.tamano_bytes,
                   'id_clase_archivo' VALUE t.id_clase_archivo,
                   'id_centro' VALUE t.id_centro,
                   'id_residente' VALUE t.id_residente,
                   'id_empleado' VALUE t.id_empleado,
                   'id_estado_archivo' VALUE t.id_estado_archivo,
                   'tabla_origen' VALUE t.tabla_origen,
                   'id_registro_origen' VALUE t.id_registro_origen,
                   'metadatos_json' VALUE t.metadatos_json,
                   'fecha_eliminacion' VALUE TO_CHAR(t.fecha_eliminacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_eliminacion' VALUE t.id_usuario_eliminacion,
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'fecha_ultima_modificacion' VALUE TO_CHAR(t.fecha_ultima_modificacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO p_json_smy_archivos
          FROM smy_archivos t
         WHERE t.id = p_id;

        RETURN 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_json_smy_archivos := NULL;
            RETURN 0;
    END f_existe_json;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_archivos.id%TYPE
    ) RETURN CLOB
    IS
        v_json CLOB;
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'nombre_archivo' VALUE t.nombre_archivo,
                   'nombre_archivo_almacenado' VALUE t.nombre_archivo_almacenado,
                   'hash_archivo' VALUE t.hash_archivo,
                   'nombre_directorio_bd' VALUE t.nombre_directorio_bd,
                   'ruta_relativa' VALUE t.ruta_relativa,
                   'ruta_completa_almacenamiento' VALUE t.ruta_completa_almacenamiento,
                   'extension' VALUE t.extension,
                   'tipo_mime' VALUE t.tipo_mime,
                   'tamano_bytes' VALUE t.tamano_bytes,
                   'id_clase_archivo' VALUE t.id_clase_archivo,
                   'id_centro' VALUE t.id_centro,
                   'id_residente' VALUE t.id_residente,
                   'id_empleado' VALUE t.id_empleado,
                   'id_estado_archivo' VALUE t.id_estado_archivo,
                   'tabla_origen' VALUE t.tabla_origen,
                   'id_registro_origen' VALUE t.id_registro_origen,
                   'metadatos_json' VALUE t.metadatos_json,
                   'fecha_eliminacion' VALUE TO_CHAR(t.fecha_eliminacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_eliminacion' VALUE t.id_usuario_eliminacion,
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'fecha_ultima_modificacion' VALUE TO_CHAR(t.fecha_ultima_modificacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO v_json
          FROM smy_archivos t
         WHERE t.id = p_id;

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_json;

END PKGSMY_ARCHIVOS_DAO;
/
