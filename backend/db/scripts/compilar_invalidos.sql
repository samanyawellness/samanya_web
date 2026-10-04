-- =============================================================================
-- SISTEMA DE GESTIÓN INTEGRAL PARA CENTROS GERIÁTRICOS (SAMANYA OS)
-- SCRIPT DE RECOMPILACIÓN MASIVA: COMPILAR_INVALIDOS.SQL
-- PROPÓSITO: Recompilar de forma recursiva y segura todos los objetos inválidos
--            del esquema actual y emitir un informe detallado con diagnóstico.
-- =============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
ALTER SESSION SET NLS_LANGUAGE = 'SPANISH';
ALTER SESSION SET NLS_TERRITORY = 'COLOMBIA';

DECLARE
    v_total_inicial   NUMBER := 0;
    v_total_final     NUMBER := 0;
    v_recompilados    NUMBER := 0;
    v_sql             VARCHAR2(1000);
    v_fecha_bogota    VARCHAR2(50);
    v_hubo_cambios    BOOLEAN := TRUE;
    v_iteracion       NUMBER := 0;
    v_max_iteraciones CONSTANT NUMBER := 5;
BEGIN
    SELECT TO_CHAR(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE), 'YYYY-MM-DD HH24:MI:SS')
      INTO v_fecha_bogota
      FROM DUAL;

    DBMS_OUTPUT.PUT_LINE('============================================================================');
    DBMS_OUTPUT.PUT_LINE('  INICIANDO RECOMPILACIÓN DE OBJETOS INVÁLIDOS - SAMANYA OS');
    DBMS_OUTPUT.PUT_LINE('  ESQUEMA: ' || USER);
    DBMS_OUTPUT.PUT_LINE('  HORA OFICIAL (Bogotá, Colombia - UTC-5): ' || v_fecha_bogota);
    DBMS_OUTPUT.PUT_LINE('============================================================================');

    -- Conteo inicial de inválidos
    SELECT COUNT(*)
      INTO v_total_inicial
      FROM user_objects
     WHERE status = 'INVALID'
       AND object_name NOT LIKE 'BIN$%';

    IF v_total_inicial = 0 THEN
        DBMS_OUTPUT.PUT_LINE('>> No se detectaron objetos inválidos en el esquema. Todos están en estado VALID.');
        DBMS_OUTPUT.PUT_LINE('============================================================================');
        RETURN;
    END IF;

    DBMS_OUTPUT.PUT_LINE('>> Se encontraron ' || v_total_inicial || ' objeto(s) inválido(s) al iniciar.');
    DBMS_OUTPUT.PUT_LINE('----------------------------------------------------------------------------');

    -- 1. Intentar primero compilación nativa rápida de esquema vía DBMS_UTILITY
    BEGIN
        DBMS_UTILITY.COMPILE_SCHEMA(schema => USER, compile_all => FALSE);
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('  [!] Nota: Falló compile_schema masivo, continuando con barrido selectivo...');
    END;

    -- 2. Barrido iterativo multi-paso para resolver árboles de dependencias
    WHILE v_hubo_cambios AND v_iteracion < v_max_iteraciones LOOP
        v_iteracion := v_iteracion + 1;
        v_hubo_cambios := FALSE;

        -- Orden: TIPOS -> VISTAS -> ESPECIFICACIONES DE PAQUETE -> PROCEDIMIENTOS/FUNCIONES -> CUERPOS DE PAQUETE -> TRIGGERS
        FOR r IN (
            SELECT object_name, object_type
              FROM user_objects
             WHERE status = 'INVALID'
               AND object_name NOT LIKE 'BIN$%'
             ORDER BY CASE object_type
                          WHEN 'TYPE' THEN 1
                          WHEN 'VIEW' THEN 2
                          WHEN 'PACKAGE' THEN 3
                          WHEN 'FUNCTION' THEN 4
                          WHEN 'PROCEDURE' THEN 5
                          WHEN 'PACKAGE BODY' THEN 6
                          WHEN 'TRIGGER' THEN 7
                          ELSE 8
                      END, object_name
        ) LOOP
            BEGIN
                IF r.object_type = 'PACKAGE BODY' THEN
                    v_sql := 'ALTER PACKAGE "' || r.object_name || '" COMPILE BODY';
                ELSIF r.object_type = 'TYPE BODY' THEN
                    v_sql := 'ALTER TYPE "' || r.object_name || '" COMPILE BODY';
                ELSE
                    v_sql := 'ALTER ' || r.object_type || ' "' || r.object_name || '" COMPILE';
                END IF;

                EXECUTE IMMEDIATE v_sql;
                v_hubo_cambios := TRUE;
            EXCEPTION
                WHEN OTHERS THEN
                    -- Se deja para el siguiente ciclo si depende de otro objeto aún no compilado
                    NULL;
            END;
        END LOOP;
    END LOOP;

    -- 3. Conteo final y diagnóstico
    SELECT COUNT(*)
      INTO v_total_final
      FROM user_objects
     WHERE status = 'INVALID'
       AND object_name NOT LIKE 'BIN$%';

    v_recompilados := v_total_inicial - v_total_final;

    DBMS_OUTPUT.PUT_LINE('============================================================================');
    DBMS_OUTPUT.PUT_LINE('  RESUMEN DE RECOMPILACIÓN');
    DBMS_OUTPUT.PUT_LINE('============================================================================');
    DBMS_OUTPUT.PUT_LINE('  - Objetos inválidos iniciales : ' || v_total_inicial);
    DBMS_OUTPUT.PUT_LINE('  - Objetos revalidados con éxito: ' || v_recompilados);
    DBMS_OUTPUT.PUT_LINE('  - Objetos aún INVÁLIDOS       : ' || v_total_final);
    DBMS_OUTPUT.PUT_LINE('============================================================================');

    IF v_total_final = 0 THEN
        DBMS_OUTPUT.PUT_LINE('  >>> OK: TODOS LOS OBJETOS DEL ESQUEMA SE ENCUENTRAN EN ESTADO VALID <<<');
    ELSE
        DBMS_OUTPUT.PUT_LINE('  >>> ATENCIÓN: DETALLE DE LOS ' || v_total_final || ' OBJETO(S) QUE SIGUEN INVÁLIDOS:');
        FOR r_inv IN (
            SELECT object_type, object_name
              FROM user_objects
             WHERE status = 'INVALID'
               AND object_name NOT LIKE 'BIN$%'
             ORDER BY object_type, object_name
        ) LOOP
            DBMS_OUTPUT.PUT_LINE('  * [' || r_inv.object_type || '] ' || r_inv.object_name);

            -- Extraer primeros errores de compilación desde USER_ERRORS
            FOR err IN (
                SELECT line, position, text
                  FROM user_errors
                 WHERE name = r_inv.object_name
                   AND type = r_inv.object_type
                 ORDER BY sequence
                 FETCH FIRST 3 ROWS ONLY
            ) LOOP
                DBMS_OUTPUT.PUT_LINE('      -> Línea ' || err.line || ' Col ' || err.position || ': ' || err.text);
            END LOOP;
        END LOOP;
    END IF;
    DBMS_OUTPUT.PUT_LINE('============================================================================');
END;
/
