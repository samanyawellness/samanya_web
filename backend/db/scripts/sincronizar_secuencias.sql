-- =============================================================================
-- PROYECTO: SAMANYA OS
-- ARCHIVO: sincronizar_secuencias.sql
-- DESCRIPCIÓN: Script para sincronizar automáticamente el valor de todas
--              las secuencias Oracle del esquema SAMANYA con el MAX(ID)
--              de sus respectivas tablas.
--              Evita el error ORA-00001 (Unique constraint violated en PKs)
--              cuando se insertan registros tras poblar datos dummy o manuales.
--              Cumple estrictamente con el estándar arquitectónico corporativo
--              (Sintaxis tradicional Oracle, sin ANSI JOIN).
-- =============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;

PROMPT ============================================================================
PROMPT   INICIANDO SINCRONIZACIÓN DE SECUENCIAS ORACLE - SAMANYA OS
PROMPT ============================================================================

DECLARE
    v_max_id NUMBER;
    v_curr   NUMBER;
    v_sql    VARCHAR2(500);
    v_count  NUMBER := 0;
BEGIN
    FOR r IN (
        SELECT t.table_name, d.referenced_name AS sequence_name
          FROM user_triggers t,
               user_dependencies d
         WHERE t.trigger_name = d.name
           AND d.type = 'TRIGGER'
           AND d.referenced_type = 'SEQUENCE'
         ORDER BY t.table_name
    ) LOOP
        BEGIN
            v_sql := 'SELECT NVL(MAX(ID), 0) FROM "' || r.table_name || '"';
            EXECUTE IMMEDIATE v_sql INTO v_max_id;

            IF v_max_id > 0 THEN
                LOOP
                    v_sql := 'SELECT "' || r.sequence_name || '".NEXTVAL FROM DUAL';
                    EXECUTE IMMEDIATE v_sql INTO v_curr;
                    EXIT WHEN v_curr >= v_max_id;
                END LOOP;
                v_count := v_count + 1;
                DBMS_OUTPUT.PUT_LINE('  [OK] Sincronizada: ' || RPAD(r.table_name, 35) || ' -> ' || RPAD(r.sequence_name, 30) || ' [Nuevo NEXTVAL: ' || (v_curr + 1) || ']');
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  [!] Error en ' || r.table_name || ' (' || r.sequence_name || '): ' || SQLERRM);
        END;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('============================================================================');
    DBMS_OUTPUT.PUT_LINE('  SINCRONIZACIÓN FINALIZADA');
    DBMS_OUTPUT.PUT_LINE('  Total tablas/secuencias sincronizadas: ' || v_count);
    DBMS_OUTPUT.PUT_LINE('============================================================================');
END;
/
