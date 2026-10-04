-- =============================================================================
-- SISTEMA DE GESTIÓN INTEGRAL PARA CENTROS GERIÁTRICOS (SAMANYA OS)
-- SCRIPT: AGREGAR_MANEJA_COSTOS.SQL
-- PROPÓSITO: Agregar y configurar el parámetro MANEJA_COSTOS_INVENTARIO
-- =============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
SET LINESIZE 140;
SET PAGESIZE 50;
SET FEEDBACK ON;

ALTER SESSION SET NLS_LANGUAGE = 'SPANISH';
ALTER SESSION SET NLS_TERRITORY = 'COLOMBIA';

PROMPT ============================================================================
PROMPT ADICIÓN DEL PARÁMETRO: MANEJA_COSTOS_INVENTARIO (ORGANIZACIONES Y SEDES)
PROMPT ============================================================================

-- -----------------------------------------------------------------------------
-- 1. AGREGAR COLUMNA A SMY_ORGANIZACIONES
-- -----------------------------------------------------------------------------
PROMPT 1. Verificando columna en SMY_ORGANIZACIONES...

DECLARE
    v_col_count NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_col_count
      FROM user_tab_cols
     WHERE table_name = 'SMY_ORGANIZACIONES'
       AND column_name = 'MANEJA_COSTOS_INVENTARIO';

    IF v_col_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE SMY_ORGANIZACIONES ADD (
            MANEJA_COSTOS_INVENTARIO CHAR(1) DEFAULT ''S'' NOT NULL,
            CONSTRAINT CK_SMY_ORG_MAN_COST CHECK (MANEJA_COSTOS_INVENTARIO IN (''S'', ''N''))
        )';
        DBMS_OUTPUT.PUT_LINE('  [+] Columna MANEJA_COSTOS_INVENTARIO agregada a SMY_ORGANIZACIONES.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('  [.] Columna MANEJA_COSTOS_INVENTARIO ya existe en SMY_ORGANIZACIONES.');
    END IF;
END;
/

COMMENT ON COLUMN SMY_ORGANIZACIONES.MANEJA_COSTOS_INVENTARIO IS 'Flag maestro: Indica si la organización maneja costos/precios en inventario (S) o solo control de cantidades físicas (N).';

-- -----------------------------------------------------------------------------
-- 2. AGREGAR COLUMNA A SMY_CENTROS
-- -----------------------------------------------------------------------------
PROMPT 2. Verificando columna en SMY_CENTROS...

DECLARE
    v_col_count NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_col_count
      FROM user_tab_cols
     WHERE table_name = 'SMY_CENTROS'
       AND column_name = 'MANEJA_COSTOS_INVENTARIO';

    IF v_col_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE SMY_CENTROS ADD (
            MANEJA_COSTOS_INVENTARIO CHAR(1) DEFAULT ''S'' NOT NULL,
            CONSTRAINT CK_SMY_CEN_MAN_COST CHECK (MANEJA_COSTOS_INVENTARIO IN (''S'', ''N''))
        )';
        DBMS_OUTPUT.PUT_LINE('  [+] Columna MANEJA_COSTOS_INVENTARIO agregada a SMY_CENTROS.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('  [.] Columna MANEJA_COSTOS_INVENTARIO ya existe en SMY_CENTROS.');
    END IF;
END;
/

COMMENT ON COLUMN SMY_CENTROS.MANEJA_COSTOS_INVENTARIO IS 'Indica si la sede gestiona precios y valorización económica (S) o si opera estrictamente por cantidades físicas (N). Si es N, no se piden ni muestran precios.';

-- -----------------------------------------------------------------------------
-- 3. ACTUALIZACIÓN / CONFIGURACIÓN DE SEDES (AJUSTAR SEGÚN SU CASO)
-- -----------------------------------------------------------------------------
PROMPT 3. Configurando valor inicial por sede...

-- Ejemplo: Marcar sedes que manejan Precios y Costos monetarios (S)
-- UPDATE SMY_CENTROS SET MANEJA_COSTOS_INVENTARIO = 'S' WHERE ID = 1;

-- Ejemplo: Marcar sedes que operan ÚNICAMENTE por Cantidades Físicas (N - sin precios)
-- UPDATE SMY_CENTROS SET MANEJA_COSTOS_INVENTARIO = 'N' WHERE ID = 2;

COMMIT;

-- -----------------------------------------------------------------------------
-- 4. REPORTE DE AUDITORÍA Y VERIFICACIÓN
-- -----------------------------------------------------------------------------
PROMPT ============================================================================
PROMPT ESTADO ACTUAL DE SEDES: INVENTARIO Y COSTOS
PROMPT ============================================================================

SELECT c.id,
       c.codigo_centro,
       c.nombre_centro,
       c.maneja_inventario,
       c.maneja_costos_inventario,
       CASE 
           WHEN c.maneja_inventario = 'N' THEN 'Módulo Oculto'
           WHEN c.maneja_costos_inventario = 'S' THEN 'Activo con Precios y Costos COP'
           ELSE 'Activo Solo Cantidades Físicas'
       END AS modalidad_frontend
  FROM smy_centros c
 ORDER BY c.id;
