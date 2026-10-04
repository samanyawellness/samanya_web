-- =============================================================================
-- SISTEMA DE GESTIÓN INTEGRAL PARA CENTROS GERIÁTRICOS (SAMANYA OS)
-- SCRIPT DE UTILIDAD: CONFIGURAR_SEDES_INVENTARIO.SQL
-- PROPÓSITO: Marcar, activar/desactivar y auditar qué sedes manejan inventario
-- =============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
SET LINESIZE 160;
SET PAGESIZE 50;
SET FEEDBACK ON;

ALTER SESSION SET NLS_LANGUAGE = 'SPANISH';
ALTER SESSION SET NLS_TERRITORY = 'COLOMBIA';

PROMPT ============================================================================
PROMPT CONFIGURACIÓN DE SEDES PARA EL MÓDULO DE INVENTARIOS Y ALMACÉN
PROMPT ============================================================================

-- -----------------------------------------------------------------------------
-- 1. CONFIGURACIÓN DESEADA (AJUSTE MANUAL SEGÚN SU OPERACIÓN)
-- -----------------------------------------------------------------------------
-- Modos de operación por Sede:
--   MANEJA_INVENTARIO = 'S' | MANEJA_COSTOS_INVENTARIO = 'S' -> Módulo activo con costos, precios y valorización económica
--   MANEJA_INVENTARIO = 'S' | MANEJA_COSTOS_INVENTARIO = 'N' -> Módulo activo en modo SOLO CANTIDADES FÍSICAS (sin precios)
--   MANEJA_INVENTARIO = 'N' | (Cualquiera)                  -> Módulo completamente oculto para esta sede

PROMPT >> Aplicando configuración de sedes...

-- Ejemplo: Sede 1 maneja Inventario con Costos/Precios
UPDATE SMY_CENTROS
   SET MANEJA_INVENTARIO = 'S',
       MANEJA_COSTOS_INVENTARIO = 'S'
 WHERE ID = 1;

-- Ejemplo: Sede 2 maneja Inventario pero SOLO CANTIDADES FÍSICAS (sin precios ni costos)
UPDATE SMY_CENTROS
   SET MANEJA_INVENTARIO = 'S',
       MANEJA_COSTOS_INVENTARIO = 'N'
 WHERE ID = 2;

-- Ejemplo: Desactivar inventario para sedes satélites o de estancia de día (opcional):
-- UPDATE SMY_CENTROS
--    SET MANEJA_INVENTARIO = 'N',
--        MANEJA_COSTOS_INVENTARIO = 'N'
--  WHERE ID NOT IN (1, 2);

COMMIT;

-- -----------------------------------------------------------------------------
-- 2. GARANTIZAR BODEGA PRINCIPAL PARA CADA SEDE CON INVENTARIO ACTIVO
-- -----------------------------------------------------------------------------
PROMPT >> Verificando bodegas principales para sedes activas...

DECLARE
    v_cuenta NUMBER := 0;
BEGIN
    FOR reg IN (
        SELECT ID, CODIGO_CENTRO, NOMBRE_CENTRO
          FROM SMY_CENTROS
         WHERE MANEJA_INVENTARIO = 'S'
         ORDER BY ID
    ) LOOP
        SELECT COUNT(*) INTO v_cuenta
          FROM SMY_BODEGAS_SEDE
         WHERE ID_CENTRO = reg.ID
           AND ES_BODEGA_PRINCIPAL = 'S';

        IF v_cuenta = 0 THEN
            INSERT INTO SMY_BODEGAS_SEDE (
                ID_CENTRO, CODIGO_BODEGA, NOMBRE_BODEGA, DESCRIPCION, ES_BODEGA_PRINCIPAL, ESTADO
            ) VALUES (
                reg.ID,
                'BOD-PRIN',
                'Almacén Principal - ' || SUBSTR(reg.NOMBRE_CENTRO, 1, 50),
                'Bodega receptora y almacén central de ' || reg.NOMBRE_CENTRO,
                'S',
                'Activo'
            );
            DBMS_OUTPUT.PUT_LINE('  [+] Creada Bodega Principal para: [' || reg.CODIGO_CENTRO || '] ' || reg.NOMBRE_CENTRO);
        ELSE
            DBMS_OUTPUT.PUT_LINE('  [OK] Bodega Principal ya existe para: [' || reg.CODIGO_CENTRO || '] ' || reg.NOMBRE_CENTRO);
        END IF;
    END LOOP;
END;
/

COMMIT;

-- -----------------------------------------------------------------------------
-- 3. REPORTE AUDITORÍA DE SEDES Y ESTADO DEL MÓDULO DE INVENTARIOS
-- -----------------------------------------------------------------------------
PROMPT ============================================================================
PROMPT REPORTE CONSOLIDADO DE SEDES Y DISPONIBILIDAD DEL MÓDULO EN EL APLICATIVO
PROMPT ============================================================================

DECLARE
    v_bodegas NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE(RPAD('ID', 5) || ' ' || RPAD('CÓDIGO', 14) || ' ' || RPAD('NOMBRE SEDE', 30) || ' ' || RPAD('INV?', 7) || ' ' || RPAD('PRECIOS?', 10) || ' ' || RPAD('BODEGAS', 8) || ' ' || 'MODALIDAD FRONTEND');
    DBMS_OUTPUT.PUT_LINE(RPAD('-', 120, '-'));

    FOR reg IN (
        SELECT ID, CODIGO_CENTRO, NOMBRE_CENTRO, 
               NVL(MANEJA_INVENTARIO, 'N') AS MANEJA_INV,
               NVL(MANEJA_COSTOS_INVENTARIO, 'S') AS MANEJA_COSTOS
          FROM SMY_CENTROS
         ORDER BY ID
    ) LOOP
        SELECT COUNT(*) INTO v_bodegas FROM SMY_BODEGAS_SEDE WHERE ID_CENTRO = reg.ID;
        
        DBMS_OUTPUT.PUT_LINE(
            RPAD(TO_CHAR(reg.ID), 5) || ' ' ||
            RPAD(reg.CODIGO_CENTRO, 14) || ' ' ||
            RPAD(SUBSTR(reg.NOMBRE_CENTRO, 1, 30), 30) || ' ' ||
            RPAD(CASE reg.MANEJA_INV WHEN 'S' THEN '[SÍ]' ELSE '[NO]' END, 7) || ' ' ||
            RPAD(CASE WHEN reg.MANEJA_INV = 'N' THEN 'N/A' WHEN reg.MANEJA_COSTOS = 'S' THEN '[SÍ] Precios' ELSE '[NO] Cantidad' END, 10) || ' ' ||
            RPAD(TO_CHAR(v_bodegas), 8) || ' ' ||
            CASE 
                WHEN reg.MANEJA_INV = 'S' AND reg.MANEJA_COSTOS = 'S' THEN 'ACTIVO CON PRECIOS Y VALORIZACIÓN COP'
                WHEN reg.MANEJA_INV = 'S' AND reg.MANEJA_COSTOS = 'N' THEN 'ACTIVO MODO SOLO CANTIDADES FÍSICAS'
                ELSE 'MÓDULO TOTALMENTE OCULTO'
            END
        );
    END LOOP;
    DBMS_OUTPUT.PUT_LINE(RPAD('=', 120, '='));
END;
/
