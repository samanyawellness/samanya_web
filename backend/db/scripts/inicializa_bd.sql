-- =============================================================================
-- PROYECTO: SAMANYA OS
-- ARCHIVO: inicializar_bd.sql
-- DESCRIPCIÓN: Script universal para inicialización y purga total de la base
--              de datos Oracle.
--              100% compatible con Oracle APEX (Taller de SQL / Scripts de SQL),
--              Oracle Cloud Database, SQL Developer, SQLcl, SQL*Plus y DBeaver.
--              No utiliza comandos restringidos de cliente (SET, WHENEVER,
--              COLUMN, DEFINE, VARIABLE) evitando el error SP2-0738.
--
--              Elimina de forma ordenada, recursiva y segura todos los objetos:
--              1. Trabajos de Scheduler (Jobs)
--              2. Restricciones foráneas (Disable Constraints)
--              3. Vistas Materializadas
--              4. Vistas
--              5. Paquetes (Spec y Body)
--              6. Procedimientos
--              7. Funciones
--              8. Triggers independientes
--              9. Tablas (CASCADE CONSTRAINTS PURGE)
--              10. Secuencias
--              11. Tipos de datos (FORCE)
--              12. Sinónimos privados
--              13. Enlaces a bases de datos (DB Links)
--              14. Barrido recursivo multi-paso de objetos dependientes
--              15. Purga de papelera de reciclaje (PURGE RECYCLEBIN)
--              16. Auditoría final y recuento de objetos restantes
-- =============================================================================

DECLARE
    v_schema       VARCHAR2(128);
    v_fecha_bogota VARCHAR2(50);
    v_count        NUMBER := 0;
    v_errors       NUMBER := 0;
    v_remaining    NUMBER := 0;
    v_drop_stmt    VARCHAR2(1000);
    v_t_ini        NUMBER;
    v_t_fin        NUMBER;
BEGIN
    v_t_ini := DBMS_UTILITY.GET_TIME;

    -- Obtener esquema actual y hora legal de Bogotá, Colombia (UTC-5)
    SELECT USER INTO v_schema FROM DUAL;
    SELECT TO_CHAR(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE), 'YYYY-MM-DD HH24:MI:SS')
      INTO v_fecha_bogota
      FROM DUAL;

    DBMS_OUTPUT.PUT_LINE('============================================================================');
    DBMS_OUTPUT.PUT_LINE('  INICIANDO LIMPIEZA Y PURGA TOTAL DEL ESQUEMA - SAMANYA OS');
    DBMS_OUTPUT.PUT_LINE('  HORA OFICIAL (Bogotá, Colombia - UTC-5): ' || v_fecha_bogota);
    DBMS_OUTPUT.PUT_LINE('  ESQUEMA OBJETIVO: ' || v_schema);
    DBMS_OUTPUT.PUT_LINE('============================================================================');

    -- -------------------------------------------------------------------------
    -- 1. DETENER Y ELIMINAR TRABAJOS DE SCHEDULER (JOBS)
    -- -------------------------------------------------------------------------
    FOR r_job IN (SELECT job_name FROM user_scheduler_jobs) LOOP
        BEGIN
            DBMS_SCHEDULER.DROP_JOB(job_name => '"' || r_job.job_name || '"', force => TRUE);
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP SCHEDULER JOB: ' || r_job.job_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar JOB ' || r_job.job_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 2. DESHABILITAR RESTRICCIONES FORÁNEAS (EVITAR INTERBLOQUEOS)
    -- -------------------------------------------------------------------------
    FOR r_fk IN (SELECT table_name, constraint_name 
                   FROM user_constraints 
                  WHERE constraint_type = 'R' 
                    AND status = 'ENABLED') LOOP
        BEGIN
            EXECUTE IMMEDIATE 'ALTER TABLE "' || r_fk.table_name || '" DISABLE CONSTRAINT "' || r_fk.constraint_name || '"';
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 3. ELIMINAR VISTAS MATERIALIZADAS
    -- -------------------------------------------------------------------------
    FOR r_mv IN (SELECT mview_name FROM user_mviews) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP MATERIALIZED VIEW "' || r_mv.mview_name || '"';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP MATERIALIZED VIEW: ' || r_mv.mview_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar MVIEW ' || r_mv.mview_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 4. ELIMINAR VISTAS
    -- -------------------------------------------------------------------------
    FOR r_viw IN (SELECT view_name FROM user_views) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP VIEW "' || r_viw.view_name || '" CASCADE CONSTRAINTS';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP VIEW: ' || r_viw.view_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar VIEW ' || r_viw.view_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 5. ELIMINAR PAQUETES (SPEC & BODY)
    -- -------------------------------------------------------------------------
    FOR r_pkg IN (SELECT object_name 
                    FROM user_objects 
                   WHERE object_type = 'PACKAGE' 
                   ORDER BY object_name) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP PACKAGE "' || r_pkg.object_name || '"';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP PACKAGE: ' || r_pkg.object_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar PACKAGE ' || r_pkg.object_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 6. ELIMINAR PROCEDIMIENTOS
    -- -------------------------------------------------------------------------
    FOR r_prc IN (SELECT object_name 
                    FROM user_objects 
                   WHERE object_type = 'PROCEDURE' 
                   ORDER BY object_name) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP PROCEDURE "' || r_prc.object_name || '"';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP PROCEDURE: ' || r_prc.object_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar PROCEDURE ' || r_prc.object_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 7. ELIMINAR FUNCIONES
    -- -------------------------------------------------------------------------
    FOR r_fnc IN (SELECT object_name 
                    FROM user_objects 
                   WHERE object_type = 'FUNCTION' 
                   ORDER BY object_name) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP FUNCTION "' || r_fnc.object_name || '"';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP FUNCTION: ' || r_fnc.object_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar FUNCTION ' || r_fnc.object_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 8. ELIMINAR TRIGGERS INDEPENDIENTES
    -- -------------------------------------------------------------------------
    FOR r_trg IN (SELECT trigger_name FROM user_triggers ORDER BY trigger_name) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP TRIGGER "' || r_trg.trigger_name || '"';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP TRIGGER: ' || r_trg.trigger_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar TRIGGER ' || r_trg.trigger_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 9. ELIMINAR TABLAS (CON CASCADE CONSTRAINTS PURGE)
    -- -------------------------------------------------------------------------
    FOR r_tab IN (SELECT table_name 
                    FROM user_tables 
                   WHERE table_name NOT LIKE 'BIN$%'
                     AND (nested IS NULL OR nested = 'NO')
                   ORDER BY table_name) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP TABLE "' || r_tab.table_name || '" CASCADE CONSTRAINTS PURGE';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP TABLE: ' || r_tab.table_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar TABLE ' || r_tab.table_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 10. ELIMINAR SECUENCIAS
    -- -------------------------------------------------------------------------
    FOR r_seq IN (SELECT sequence_name FROM user_sequences ORDER BY sequence_name) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP SEQUENCE "' || r_seq.sequence_name || '"';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP SEQUENCE: ' || r_seq.sequence_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar SEQUENCE ' || r_seq.sequence_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 11. ELIMINAR TIPOS (TYPES) CON FORCE
    -- -------------------------------------------------------------------------
    FOR r_typ IN (SELECT type_name FROM user_types ORDER BY type_name) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP TYPE "' || r_typ.type_name || '" FORCE';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP TYPE: ' || r_typ.type_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar TYPE ' || r_typ.type_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 12. ELIMINAR SINÓNIMOS PRIVADOS
    -- -------------------------------------------------------------------------
    FOR r_syn IN (SELECT synonym_name FROM user_synonyms ORDER BY synonym_name) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP SYNONYM "' || r_syn.synonym_name || '"';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP SYNONYM: ' || r_syn.synonym_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar SYNONYM ' || r_syn.synonym_name || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 13. ELIMINAR ENLACES A BASES DE DATOS (DATABASE LINKS)
    -- -------------------------------------------------------------------------
    FOR r_dbl IN (SELECT db_link FROM user_db_links ORDER BY db_link) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP DATABASE LINK "' || r_dbl.db_link || '"';
            v_count := v_count + 1;
            DBMS_OUTPUT.PUT_LINE('  [-] DROP DATABASE LINK: ' || r_dbl.db_link);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error al eliminar DATABASE LINK ' || r_dbl.db_link || ': ' || SQLERRM);
                v_errors := v_errors + 1;
        END;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 14. BARRIDO FINAL RECURSIVO (HASTA 3 PASADAS PARA DEPENDENCIAS RESIDUALES)
    -- -------------------------------------------------------------------------
    FOR v_pass IN 1..3 LOOP
        FOR r_rem IN (
            SELECT object_type, object_name 
              FROM user_objects 
             WHERE object_name NOT LIKE 'BIN$%'
               AND object_type NOT IN (
                   'LOB', 'LOB INDEX', 'INDEX PARTITION', 'TABLE PARTITION', 
                   'PACKAGE BODY', 'TYPE BODY', 'TRIGGER'
               )
             ORDER BY object_type, object_name
        ) LOOP
            BEGIN
                IF r_rem.object_type = 'TABLE' THEN
                    v_drop_stmt := 'DROP TABLE "' || r_rem.object_name || '" CASCADE CONSTRAINTS PURGE';
                ELSIF r_rem.object_type = 'TYPE' THEN
                    v_drop_stmt := 'DROP TYPE "' || r_rem.object_name || '" FORCE';
                ELSIF r_rem.object_type = 'VIEW' THEN
                    v_drop_stmt := 'DROP VIEW "' || r_rem.object_name || '" CASCADE CONSTRAINTS';
                ELSIF r_rem.object_type = 'INDEX' THEN
                    v_drop_stmt := 'DROP INDEX "' || r_rem.object_name || '"';
                ELSE
                    v_drop_stmt := 'DROP ' || r_rem.object_type || ' "' || r_rem.object_name || '"';
                END IF;

                EXECUTE IMMEDIATE v_drop_stmt;
                v_count := v_count + 1;
                DBMS_OUTPUT.PUT_LINE('  [-] [BARRIDO PASADA ' || v_pass || '] DROP ' || r_rem.object_type || ': ' || r_rem.object_name);
            EXCEPTION
                WHEN OTHERS THEN NULL;
            END;
        END LOOP;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- 15. PURGA DE LA PAPELERA DE RECICLAJE
    -- -------------------------------------------------------------------------
    BEGIN
        EXECUTE IMMEDIATE 'PURGE RECYCLEBIN';
        DBMS_OUTPUT.PUT_LINE('  [+] Papelera de reciclaje purgada satisfactoriamente (PURGE RECYCLEBIN).');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('  [!] Advertencia al ejecutar PURGE RECYCLEBIN: ' || SQLERRM);
    END;

    -- -------------------------------------------------------------------------
    -- 16. AUDITORÍA FINAL Y RECUENTO DE OBJETOS REMANENTES
    -- -------------------------------------------------------------------------
    SELECT COUNT(*) INTO v_remaining 
      FROM user_objects 
     WHERE object_name NOT LIKE 'BIN$%';

    v_t_fin := DBMS_UTILITY.GET_TIME;

    DBMS_OUTPUT.PUT_LINE('----------------------------------------------------------------------------');
    IF v_remaining = 0 THEN
        DBMS_OUTPUT.PUT_LINE('============================================================================');
        DBMS_OUTPUT.PUT_LINE('  >>> RESULTADO: ESQUEMA COMPLETAMENTE LIMPIO.');
        DBMS_OUTPUT.PUT_LINE('  >>> Total objetos eliminados durante la sesión: ' || v_count);
        DBMS_OUTPUT.PUT_LINE('  >>> Objetos restantes en USER_OBJECTS: 0');
        DBMS_OUTPUT.PUT_LINE('  >>> Tiempo de ejecución: ' || 
                             LTRIM(TO_CHAR((v_t_fin - v_t_ini) / 100, '9990.99')) || ' s');
        DBMS_OUTPUT.PUT_LINE('============================================================================');
    ELSE
        DBMS_OUTPUT.PUT_LINE('============================================================================');
        DBMS_OUTPUT.PUT_LINE('  >>> ADVERTENCIA: Restan ' || v_remaining || ' objeto(s) en el esquema:');
        FOR r_rest IN (
            SELECT object_type, object_name, status 
              FROM user_objects 
             WHERE object_name NOT LIKE 'BIN$%' 
             ORDER BY object_type, object_name
        ) LOOP
            DBMS_OUTPUT.PUT_LINE('      * [' || r_rest.object_type || '] ' || r_rest.object_name || ' (Estado: ' || r_rest.status || ')');
        END LOOP;
        DBMS_OUTPUT.PUT_LINE('  >>> Tiempo de ejecución: ' || 
                             LTRIM(TO_CHAR((v_t_fin - v_t_ini) / 100, '9990.99')) || ' s');
        DBMS_OUTPUT.PUT_LINE('============================================================================');
    END IF;
END;
/
