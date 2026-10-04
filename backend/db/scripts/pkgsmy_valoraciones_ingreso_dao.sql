-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO DAO: PKGSMY_VALORACIONES_INGRESO_DAO
-- TABLA: SMY_VALORACIONES_INGRESO
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Plantilla oficial 18 métodos)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGSMY_VALORACIONES_INGRESO_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_VALORACIONES_INGRESO_DAO
    || Propósito: Capa de acceso a datos exclusiva para la tabla SMY_VALORACIONES_INGRESO
    || Estándar: Plantilla oficial DAO PL/SQL Oracle (18 métodos sin commit/rollback)
    || =========================================================================
    */

    -- Tipo de colección estándar para registros de la tabla
    TYPE ta_smy_valoraciones_ingreso IS TABLE OF smy_valoraciones_ingreso%ROWTYPE INDEX BY BINARY_INTEGER;

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_valing IN smy_valoraciones_ingreso%ROWTYPE
    );

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_valoraciones_ingreso.id%TYPE
    ) RETURN smy_valoraciones_ingreso%ROWTYPE;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_valing OUT PKGSMY_VALORACIONES_INGRESO_DAO.ta_smy_valoraciones_ingreso
    );

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    );

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_valoraciones_ingreso.id%TYPE
    );

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_valoraciones_ingreso.id%TYPE
    ) RETURN BOOLEAN;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id         IN  smy_valoraciones_ingreso.id%TYPE,
        pro_smy_valing OUT smy_valoraciones_ingreso%ROWTYPE
    ) RETURN BOOLEAN;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id         IN  smy_valoraciones_ingreso.id%TYPE,
        pro_smy_valing OUT smy_valoraciones_ingreso%ROWTYPE,
        p_rowid        OUT VARCHAR2
    ) RETURN BOOLEAN;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid        IN  VARCHAR2,
        pro_smy_valing OUT smy_valoraciones_ingreso%ROWTYPE
    ) RETURN BOOLEAN;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_valing IN smy_valoraciones_ingreso%ROWTYPE
    );

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_valing IN smy_valoraciones_ingreso%ROWTYPE,
        pty_id         IN smy_valoraciones_ingreso.id%TYPE
    );

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_valing IN smy_valoraciones_ingreso%ROWTYPE,
        p_rowid        IN VARCHAR2
    );

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_valing IN smy_valoraciones_ingreso%ROWTYPE
    );

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_valing IN OUT smy_valoraciones_ingreso%ROWTYPE
    );

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id             IN  smy_valoraciones_ingreso.id%TYPE,
        p_json_smy_valing OUT CLOB
    ) RETURN NUMBER;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_valoraciones_ingreso.id%TYPE
    ) RETURN CLOB;

END PKGSMY_VALORACIONES_INGRESO_DAO;
/

CREATE OR REPLACE PACKAGE BODY PKGSMY_VALORACIONES_INGRESO_DAO
AS

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_valing IN smy_valoraciones_ingreso%ROWTYPE
    )
    IS
    BEGIN
        INSERT INTO smy_valoraciones_ingreso
        VALUES pro_smy_valing;
    END p_insertar;

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_valoraciones_ingreso.id%TYPE
    ) RETURN smy_valoraciones_ingreso%ROWTYPE
    IS
        vro_smy_valing smy_valoraciones_ingreso%ROWTYPE;
    BEGIN
        SELECT *
          INTO vro_smy_valing
          FROM smy_valoraciones_ingreso
         WHERE id = pty_id;

        RETURN vro_smy_valing;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_traer;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_valing OUT PKGSMY_VALORACIONES_INGRESO_DAO.ta_smy_valoraciones_ingreso
    )
    IS
    BEGIN
        SELECT *
          BULK COLLECT INTO pta_smy_valing
          FROM smy_valoraciones_ingreso
         ORDER BY id DESC;
    END p_consultar_registros;

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    )
    IS
    BEGIN
        DELETE FROM smy_valoraciones_ingreso
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_eliminar_rowid;

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_valoraciones_ingreso.id%TYPE
    )
    IS
    BEGIN
        DELETE FROM smy_valoraciones_ingreso
         WHERE id = pty_id;
    END p_eliminar;

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros
    IS
    BEGIN
        DELETE FROM smy_valoraciones_ingreso;
    END p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_valoraciones_ingreso.id%TYPE
    ) RETURN BOOLEAN
    IS
        vn_existe NUMBER;
    BEGIN
        SELECT 1
          INTO vn_existe
          FROM smy_valoraciones_ingreso
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id         IN  smy_valoraciones_ingreso.id%TYPE,
        pro_smy_valing OUT smy_valoraciones_ingreso%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_valing
          FROM smy_valoraciones_ingreso
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id         IN  smy_valoraciones_ingreso.id%TYPE,
        pro_smy_valing OUT smy_valoraciones_ingreso%ROWTYPE,
        p_rowid        OUT VARCHAR2
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT ROWIDTOCHAR(ROWID)
          INTO p_rowid
          FROM smy_valoraciones_ingreso
         WHERE id = pty_id;

        SELECT *
          INTO pro_smy_valing
          FROM smy_valoraciones_ingreso
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
        vn_existe NUMBER;
    BEGIN
        SELECT 1
          INTO vn_existe
          FROM smy_valoraciones_ingreso
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid        IN  VARCHAR2,
        pro_smy_valing OUT smy_valoraciones_ingreso%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_valing
          FROM smy_valoraciones_ingreso
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_valing IN smy_valoraciones_ingreso%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_valoraciones_ingreso
           SET ROW = pro_smy_valing
         WHERE id = pro_smy_valing.id;
    END p_actualizar;

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_valing IN smy_valoraciones_ingreso%ROWTYPE,
        pty_id         IN smy_valoraciones_ingreso.id%TYPE
    )
    IS
    BEGIN
        UPDATE smy_valoraciones_ingreso
           SET ROW = pro_smy_valing
         WHERE id = pty_id;
    END p_actualizar;

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_valing IN smy_valoraciones_ingreso%ROWTYPE,
        p_rowid        IN VARCHAR2
    )
    IS
    BEGIN
        UPDATE smy_valoraciones_ingreso
           SET ROW = pro_smy_valing
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_actualizar_rowid;

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_valing IN smy_valoraciones_ingreso%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_valoraciones_ingreso
           SET ROW = pro_smy_valing;
    END p_actualizar_registros;

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_valing IN OUT smy_valoraciones_ingreso%ROWTYPE
    )
    IS
    BEGIN
        pro_smy_valing.fecha_creacion     := NVL(pro_smy_valing.fecha_creacion, f_fecha_actual);
        pro_smy_valing.fecha_valoracion   := NVL(pro_smy_valing.fecha_valoracion, f_fecha_actual);
        pro_smy_valing.aceptacion_terminos:= NVL(pro_smy_valing.aceptacion_terminos, 'S');
    END p_valores_defecto;

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id             IN  smy_valoraciones_ingreso.id%TYPE,
        p_json_smy_valing OUT CLOB
    ) RETURN NUMBER
    IS
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'id_residente' VALUE t.id_residente,
                   'id_centro' VALUE t.id_centro,
                   'codigo_ficha' VALUE t.codigo_ficha,
                   'fecha_valoracion' VALUE TO_CHAR(t.fecha_valoracion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_evaluador' VALUE t.id_usuario_evaluador,
                   'nombre_evaluador' VALUE t.nombre_evaluador,
                   'cargo_evaluador' VALUE t.cargo_evaluador,
                   'lugar_crecimiento' VALUE t.lugar_crecimiento,
                   'acontecimientos_importantes' VALUE t.acontecimientos_importantes,
                   'perdidas_duelos_significativos' VALUE t.perdidas_duelos_significativos,
                   'costumbres_tradiciones' VALUE t.costumbres_tradiciones,
                   'gustos_pasatiempos_musica' VALUE t.gustos_pasatiempos_musica,
                   'aspectos_tranquilidad' VALUE t.aspectos_tranquilidad,
                   'aspectos_temor_incomodidad' VALUE t.aspectos_temor_incomodidad,
                   'rasgos_personalidad' VALUE t.rasgos_personalidad,
                   'rutinas_habitos_diarios' VALUE t.rutinas_habitos_diarios,
                   'motivo_ingreso' VALUE t.motivo_ingreso,
                   'expectativas_ingreso' VALUE t.expectativas_ingreso,
                   'disposicion_adaptacion' VALUE t.disposicion_adaptacion,
                   'estado_general_ingreso' VALUE t.estado_general_ingreso,
                   'signos_vitales_json' VALUE t.signos_vitales_json,
                   'cognitivo_orientacion' VALUE t.cognitivo_orientacion,
                   'emocional_conductual' VALUE t.emocional_conductual,
                   'movilidad_funcional' VALUE t.movilidad_funcional,
                   'nutricion_alimentacion' VALUE t.nutricion_alimentacion,
                   'eliminacion_continencia' VALUE t.eliminacion_continencia,
                   'higiene_autocuidado' VALUE t.higiene_autocuidado,
                   'patron_sueno' VALUE t.patron_sueno,
                   'terapias_apoyos_externos' VALUE t.terapias_apoyos_externos,
                   'ayudas_tecnicas' VALUE t.ayudas_tecnicas,
                   'riesgo_caidas' VALUE t.riesgo_caidas,
                   'riesgo_ulceras_presion' VALUE t.riesgo_ulceras_presion,
                   'riesgo_fuga' VALUE t.riesgo_fuga,
                   'riesgo_broncoaspiracion' VALUE t.riesgo_broncoaspiracion,
                   'grado_dependencia_global' VALUE t.grado_dependencia_global,
                   'condiciones_fisicas_piel' VALUE t.condiciones_fisicas_piel,
                   'red_apoyo_no_familiar' VALUE t.red_apoyo_no_familiar,
                   'datos_genograma_json' VALUE t.datos_genograma_json,
                   'id_archivo_genograma' VALUE t.id_archivo_genograma,
                   'concepto_general_ingreso' VALUE t.concepto_general_ingreso,
                   'recomendaciones_plan_cuidados' VALUE t.recomendaciones_plan_cuidados,
                   'nombre_entrega_responsable' VALUE t.nombre_entrega_responsable,
                   'identificacion_entrega' VALUE t.identificacion_entrega,
                   'parentesco_entrega' VALUE t.parentesco_entrega,
                   'telefono_entrega' VALUE t.telefono_entrega,
                   'aceptacion_terminos' VALUE t.aceptacion_terminos,
                   'id_archivo_firma_entrega' VALUE t.id_archivo_firma_entrega,
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO p_json_smy_valing
          FROM smy_valoraciones_ingreso t
         WHERE t.id = p_id;

        RETURN 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_json_smy_valing := NULL;
            RETURN 0;
    END f_existe_json;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_valoraciones_ingreso.id%TYPE
    ) RETURN CLOB
    IS
        v_json CLOB;
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'id_residente' VALUE t.id_residente,
                   'id_centro' VALUE t.id_centro,
                   'codigo_ficha' VALUE t.codigo_ficha,
                   'fecha_valoracion' VALUE TO_CHAR(t.fecha_valoracion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_evaluador' VALUE t.id_usuario_evaluador,
                   'nombre_evaluador' VALUE t.nombre_evaluador,
                   'cargo_evaluador' VALUE t.cargo_evaluador,
                   'lugar_crecimiento' VALUE t.lugar_crecimiento,
                   'acontecimientos_importantes' VALUE t.acontecimientos_importantes,
                   'perdidas_duelos_significativos' VALUE t.perdidas_duelos_significativos,
                   'costumbres_tradiciones' VALUE t.costumbres_tradiciones,
                   'gustos_pasatiempos_musica' VALUE t.gustos_pasatiempos_musica,
                   'aspectos_tranquilidad' VALUE t.aspectos_tranquilidad,
                   'aspectos_temor_incomodidad' VALUE t.aspectos_temor_incomodidad,
                   'rasgos_personalidad' VALUE t.rasgos_personalidad,
                   'rutinas_habitos_diarios' VALUE t.rutinas_habitos_diarios,
                   'motivo_ingreso' VALUE t.motivo_ingreso,
                   'expectativas_ingreso' VALUE t.expectativas_ingreso,
                   'disposicion_adaptacion' VALUE t.disposicion_adaptacion,
                   'estado_general_ingreso' VALUE t.estado_general_ingreso,
                   'signos_vitales_json' VALUE t.signos_vitales_json,
                   'cognitivo_orientacion' VALUE t.cognitivo_orientacion,
                   'emocional_conductual' VALUE t.emocional_conductual,
                   'movilidad_funcional' VALUE t.movilidad_funcional,
                   'nutricion_alimentacion' VALUE t.nutricion_alimentacion,
                   'eliminacion_continencia' VALUE t.eliminacion_continencia,
                   'higiene_autocuidado' VALUE t.higiene_autocuidado,
                   'patron_sueno' VALUE t.patron_sueno,
                   'terapias_apoyos_externos' VALUE t.terapias_apoyos_externos,
                   'ayudas_tecnicas' VALUE t.ayudas_tecnicas,
                   'riesgo_caidas' VALUE t.riesgo_caidas,
                   'riesgo_ulceras_presion' VALUE t.riesgo_ulceras_presion,
                   'riesgo_fuga' VALUE t.riesgo_fuga,
                   'riesgo_broncoaspiracion' VALUE t.riesgo_broncoaspiracion,
                   'grado_dependencia_global' VALUE t.grado_dependencia_global,
                   'condiciones_fisicas_piel' VALUE t.condiciones_fisicas_piel,
                   'red_apoyo_no_familiar' VALUE t.red_apoyo_no_familiar,
                   'datos_genograma_json' VALUE t.datos_genograma_json,
                   'id_archivo_genograma' VALUE t.id_archivo_genograma,
                   'concepto_general_ingreso' VALUE t.concepto_general_ingreso,
                   'recomendaciones_plan_cuidados' VALUE t.recomendaciones_plan_cuidados,
                   'nombre_entrega_responsable' VALUE t.nombre_entrega_responsable,
                   'identificacion_entrega' VALUE t.identificacion_entrega,
                   'parentesco_entrega' VALUE t.parentesco_entrega,
                   'telefono_entrega' VALUE t.telefono_entrega,
                   'aceptacion_terminos' VALUE t.aceptacion_terminos,
                   'id_archivo_firma_entrega' VALUE t.id_archivo_firma_entrega,
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO v_json
          FROM smy_valoraciones_ingreso t
         WHERE t.id = p_id;

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_json;

END PKGSMY_VALORACIONES_INGRESO_DAO;
/
