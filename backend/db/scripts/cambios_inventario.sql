-- =============================================================================
-- SISTEMA DE GESTIÓN INTEGRAL PARA CENTROS GERIÁTRICOS (SAMANYA OS)
-- SCRIPT DE MIGRACIÓN: CAMBIOS_INVENTARIO.SQL
-- PROPÓSITO: Módulo de Gestión de Inventario, Bodegas y Kardex Multisede con Feature Flags
-- ESTÁNDAR: Oracle 11g / 12c / 19c / 21c / 23c (UTC-5 Bogotá, Colombia)
-- =============================================================================
-- INSTRUCCIONES:
-- Ejecute este script como usuario del esquema SAMANYA en SQL*Plus, SQLcl o SQL Developer.
-- =============================================================================

ALTER SESSION SET NLS_LANGUAGE = 'SPANISH';
ALTER SESSION SET NLS_TERRITORY = 'COLOMBIA';

PROMPT ============================================================================
PROMPT INICIANDO INSTALACIÓN DEL MÓDULO DE INVENTARIO Y ALMACÉN MULTISEDE
PROMPT ============================================================================

-- -----------------------------------------------------------------------------
-- 1. FEATURE FLAGS: CONFIGURACIÓN MODULAR EN ORGANIZACIÓN Y SEDES (CENTROS)
-- -----------------------------------------------------------------------------
PROMPT 1. Configurando Feature Flags (MANEJA_INVENTARIO, MANEJA_COSTOS_INVENTARIO) en Organizaciones y Sedes...

-- 1.1 Agregar columnas a SMY_ORGANIZACIONES si no existen
DECLARE
    v_col_count NUMBER := 0;
BEGIN
    -- Flag para activar/desactivar el módulo de inventario
    SELECT COUNT(*) INTO v_col_count
      FROM user_tab_cols
     WHERE table_name = 'SMY_ORGANIZACIONES'
       AND column_name = 'MANEJA_INVENTARIO';

    IF v_col_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE SMY_ORGANIZACIONES ADD (
            MANEJA_INVENTARIO CHAR(1) DEFAULT ''S'' NOT NULL,
            CONSTRAINT CK_SMY_ORG_MAN_INV CHECK (MANEJA_INVENTARIO IN (''S'', ''N''))
        )';
        DBMS_OUTPUT.PUT_LINE('  [+] Columna MANEJA_INVENTARIO agregada a SMY_ORGANIZACIONES.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('  [.] Columna MANEJA_INVENTARIO ya existe en SMY_ORGANIZACIONES.');
    END IF;

    -- Flag para activar gestión de precios/costos o solo cantidades físicas
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

COMMENT ON COLUMN SMY_ORGANIZACIONES.MANEJA_INVENTARIO IS 'Flag maestro: Indica si la organización tiene contratado/habilitado el módulo de inventarios (S/N).';
COMMENT ON COLUMN SMY_ORGANIZACIONES.MANEJA_COSTOS_INVENTARIO IS 'Flag maestro: Indica si la organización maneja costos/precios en inventario (S) o solo control de cantidades físicas (N).';

-- 1.2 Agregar columnas a SMY_CENTROS si no existen
DECLARE
    v_col_count NUMBER := 0;
BEGIN
    -- Flag para activar/desactivar el módulo de inventario por sede
    SELECT COUNT(*) INTO v_col_count
      FROM user_tab_cols
     WHERE table_name = 'SMY_CENTROS'
       AND column_name = 'MANEJA_INVENTARIO';

    IF v_col_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE SMY_CENTROS ADD (
            MANEJA_INVENTARIO CHAR(1) DEFAULT ''S'' NOT NULL,
            CONSTRAINT CK_SMY_CEN_MAN_INV CHECK (MANEJA_INVENTARIO IN (''S'', ''N''))
        )';
        DBMS_OUTPUT.PUT_LINE('  [+] Columna MANEJA_INVENTARIO agregada a SMY_CENTROS.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('  [.] Columna MANEJA_INVENTARIO ya existe en SMY_CENTROS.');
    END IF;

    -- Flag para definir si la sede maneja precios/costos o solo cantidades físicas
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

COMMENT ON COLUMN SMY_CENTROS.MANEJA_INVENTARIO IS 'Indica si esta sede geriátrica gestiona inventario físico de insumos y bodegas (S/N). Si es N, los menús y widgets permanecen ocultos.';
COMMENT ON COLUMN SMY_CENTROS.MANEJA_COSTOS_INVENTARIO IS 'Indica si la sede gestiona precios y valorización económica (S) o si opera estrictamente por cantidades físicas (N). Si es N, no se piden ni muestran precios.';

-- -----------------------------------------------------------------------------
-- 2. CATÁLOGO MAESTRO: SMY_CATEGORIAS_ARTICULOS
-- -----------------------------------------------------------------------------
PROMPT 2. Creando tabla SMY_CATEGORIAS_ARTICULOS y secuencia...

BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE SMY_CATEGORIAS_ARTICULOS (
        ID                              NUMBER(10)          NOT NULL,
        ID_ORGANIZACION                 NUMBER(10)          NOT NULL,
        CODIGO_CATEGORIA                VARCHAR2(30)        NOT NULL,
        NOMBRE_CATEGORIA                VARCHAR2(80)        NOT NULL,
        DESCRIPCION                     VARCHAR2(250),
        COLOR_HEX                       VARCHAR2(10)        DEFAULT ''#10B981'',
        ESTADO                          VARCHAR2(20)        DEFAULT ''Activo'' NOT NULL,
        FECHA_CREACION                  DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE ''-05:00'' AS DATE) NOT NULL,
        ID_USUARIO_ULTIMA_MODIFICACION  NUMBER(10),
        CONSTRAINT PK_SMY_CAT_ARTICULOS PRIMARY KEY (ID),
        CONSTRAINT UQ_SMY_CAT_ART_COD   UNIQUE (ID_ORGANIZACION, CODIGO_CATEGORIA),
        CONSTRAINT FK_SMY_CAT_ART_ORG   FOREIGN KEY (ID_ORGANIZACION) REFERENCES SMY_ORGANIZACIONES (ID),
        CONSTRAINT CK_SMY_CAT_ART_EST   CHECK (ESTADO IN (''Activo'', ''Inactivo''))
    )';
    DBMS_OUTPUT.PUT_LINE('  [+] Tabla SMY_CATEGORIAS_ARTICULOS creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('  [.] Tabla SMY_CATEGORIAS_ARTICULOS ya existía.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_SMY_CATEGORIAS_ARTICULOS START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('  [+] Secuencia SEQ_SMY_CATEGORIAS_ARTICULOS creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_SMY_CATEGORIAS_ART_BI
BEFORE INSERT ON SMY_CATEGORIAS_ARTICULOS FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT SEQ_SMY_CATEGORIAS_ARTICULOS.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

COMMENT ON TABLE SMY_CATEGORIAS_ARTICULOS IS 'Categorías de clasificación para artículos de inventario y suministros.';
COMMENT ON COLUMN SMY_CATEGORIAS_ARTICULOS.ID IS 'Clave primaria autoincremental de la categoría.';
COMMENT ON COLUMN SMY_CATEGORIAS_ARTICULOS.CODIGO_CATEGORIA IS 'Código mnemónico de la categoría (ej. ASIST, MED_URG, ASEO, LENC, ALIM, EQUIP).';
COMMENT ON COLUMN SMY_CATEGORIAS_ARTICULOS.NOMBRE_CATEGORIA IS 'Nombre descriptivo de la categoría.';
COMMENT ON COLUMN SMY_CATEGORIAS_ARTICULOS.COLOR_HEX IS 'Color distintivo para etiquetas en la interfaz de usuario.';

-- -----------------------------------------------------------------------------
-- 3. CATÁLOGO MAESTRO DE PRODUCTOS: SMY_ARTICULOS_CATALOGO
-- -----------------------------------------------------------------------------
PROMPT 3. Creando tabla SMY_ARTICULOS_CATALOGO y secuencia...

BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE SMY_ARTICULOS_CATALOGO (
        ID                              NUMBER(10)          NOT NULL,
        ID_ORGANIZACION                 NUMBER(10)          NOT NULL,
        ID_CATEGORIA                    NUMBER(10)          NOT NULL,
        CODIGO_ARTICULO                 VARCHAR2(30)        NOT NULL,
        NOMBRE_ARTICULO                 VARCHAR2(120)       NOT NULL,
        DESCRIPCION                     VARCHAR2(300),
        UNIDAD_MEDIDA                   VARCHAR2(20)        DEFAULT ''UNIDAD'' NOT NULL,
        REQUIERE_LOTE_VENCIMIENTO       CHAR(1)             DEFAULT ''N'' NOT NULL,
        ES_DESCONTABLE_POR_RESIDENTE    CHAR(1)             DEFAULT ''S'' NOT NULL,
        COSTO_ESTANDAR                  NUMBER(12,2)        DEFAULT 0 NOT NULL,
        ESTADO                          VARCHAR2(20)        DEFAULT ''Activo'' NOT NULL,
        FECHA_CREACION                  DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE ''-05:00'' AS DATE) NOT NULL,
        ID_USUARIO_ULTIMA_MODIFICACION  NUMBER(10),
        CONSTRAINT PK_SMY_ART_CATALOGO  PRIMARY KEY (ID),
        CONSTRAINT UQ_SMY_ART_CAT_COD   UNIQUE (ID_ORGANIZACION, CODIGO_ARTICULO),
        CONSTRAINT FK_SMY_ART_CAT_ORG   FOREIGN KEY (ID_ORGANIZACION) REFERENCES SMY_ORGANIZACIONES (ID),
        CONSTRAINT FK_SMY_ART_CAT_CAT   FOREIGN KEY (ID_CATEGORIA) REFERENCES SMY_CATEGORIAS_ARTICULOS (ID),
        CONSTRAINT CK_SMY_ART_CAT_LOTE  CHECK (REQUIERE_LOTE_VENCIMIENTO IN (''S'', ''N'')),
        CONSTRAINT CK_SMY_ART_CAT_DESC  CHECK (ES_DESCONTABLE_POR_RESIDENTE IN (''S'', ''N'')),
        CONSTRAINT CK_SMY_ART_CAT_EST   CHECK (ESTADO IN (''Activo'', ''Inactivo''))
    )';
    DBMS_OUTPUT.PUT_LINE('  [+] Tabla SMY_ARTICULOS_CATALOGO creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('  [.] Tabla SMY_ARTICULOS_CATALOGO ya existía.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_SMY_ARTICULOS_CATALOGO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('  [+] Secuencia SEQ_SMY_ARTICULOS_CATALOGO creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_SMY_ARTICULOS_CAT_BI
BEFORE INSERT ON SMY_ARTICULOS_CATALOGO FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT SEQ_SMY_ARTICULOS_CATALOGO.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

COMMENT ON TABLE SMY_ARTICULOS_CATALOGO IS 'Maestro de artículos, insumos, medicamentos de stock, dotación y suministros de la organización.';
COMMENT ON COLUMN SMY_ARTICULOS_CATALOGO.CODIGO_ARTICULO IS 'Código único de inventario del producto (ej. INS-GLUC-01, ASEO-JAB-02).';
COMMENT ON COLUMN SMY_ARTICULOS_CATALOGO.UNIDAD_MEDIDA IS 'Unidad de manejo: UNIDAD, CAJA, PAQUETE, FRASCO, LITRO, KILO, ROLLO.';
COMMENT ON COLUMN SMY_ARTICULOS_CATALOGO.REQUIERE_LOTE_VENCIMIENTO IS 'Indica si exige registrar número de lote y fecha de vencimiento (S/N).';
COMMENT ON COLUMN SMY_ARTICULOS_CATALOGO.ES_DESCONTABLE_POR_RESIDENTE IS 'Indica si este artículo puede ser cargado o asignado al consumo de un residente (S/N).';

-- -----------------------------------------------------------------------------
-- 4. BODEGAS Y ÁREAS DE ALMACENAMIENTO POR SEDE: SMY_BODEGAS_SEDE
-- -----------------------------------------------------------------------------
PROMPT 4. Creando tabla SMY_BODEGAS_SEDE y secuencia...

BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE SMY_BODEGAS_SEDE (
        ID                              NUMBER(10)          NOT NULL,
        ID_CENTRO                       NUMBER(10)          NOT NULL,
        CODIGO_BODEGA                   VARCHAR2(30)        NOT NULL,
        NOMBRE_BODEGA                   VARCHAR2(80)        NOT NULL,
        DESCRIPCION                     VARCHAR2(200),
        ES_BODEGA_PRINCIPAL             CHAR(1)             DEFAULT ''S'' NOT NULL,
        ESTADO                          VARCHAR2(20)        DEFAULT ''Activo'' NOT NULL,
        FECHA_CREACION                  DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE ''-05:00'' AS DATE) NOT NULL,
        ID_USUARIO_ULTIMA_MODIFICACION  NUMBER(10),
        CONSTRAINT PK_SMY_BODEGAS_SEDE  PRIMARY KEY (ID),
        CONSTRAINT UQ_SMY_BOD_CEN_COD   UNIQUE (ID_CENTRO, CODIGO_BODEGA),
        CONSTRAINT FK_SMY_BOD_CENTRO    FOREIGN KEY (ID_CENTRO) REFERENCES SMY_CENTROS (ID),
        CONSTRAINT CK_SMY_BOD_PRIN      CHECK (ES_BODEGA_PRINCIPAL IN (''S'', ''N'')),
        CONSTRAINT CK_SMY_BOD_ESTADO    CHECK (ESTADO IN (''Activo'', ''Inactivo''))
    )';
    DBMS_OUTPUT.PUT_LINE('  [+] Tabla SMY_BODEGAS_SEDE creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('  [.] Tabla SMY_BODEGAS_SEDE ya existía.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_SMY_BODEGAS_SEDE START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('  [+] Secuencia SEQ_SMY_BODEGAS_SEDE creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_SMY_BODEGAS_SEDE_BI
BEFORE INSERT ON SMY_BODEGAS_SEDE FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT SEQ_SMY_BODEGAS_SEDE.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

COMMENT ON TABLE SMY_BODEGAS_SEDE IS 'Almacenes, bodegas y farmacias físicas pertenecientes a cada sede asistencial.';
COMMENT ON COLUMN SMY_BODEGAS_SEDE.ID_CENTRO IS 'Clave foránea hacia SMY_CENTROS(ID).';
COMMENT ON COLUMN SMY_BODEGAS_SEDE.CODIGO_BODEGA IS 'Código de la bodega dentro de la sede (ej. BOD-PRIN, FARM-SEDE, ALAC-COCINA).';
COMMENT ON COLUMN SMY_BODEGAS_SEDE.ES_BODEGA_PRINCIPAL IS 'Indica si es el almacén receptor principal por defecto de la sede (S/N).';

-- -----------------------------------------------------------------------------
-- 5. CONTROL DE EXISTENCIAS Y SALDOS: SMY_INVENTARIO_STOCK_SEDE
-- -----------------------------------------------------------------------------
PROMPT 5. Creando tabla SMY_INVENTARIO_STOCK_SEDE y secuencia...

BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE SMY_INVENTARIO_STOCK_SEDE (
        ID                              NUMBER(10)          NOT NULL,
        ID_CENTRO                       NUMBER(10)          NOT NULL,
        ID_BODEGA                       NUMBER(10)          NOT NULL,
        ID_ARTICULO                     NUMBER(10)          NOT NULL,
        NUMERO_LOTE                     VARCHAR2(50),
        FECHA_VENCIMIENTO               DATE,
        CANTIDAD_DISPONIBLE             NUMBER(12,2)        DEFAULT 0 NOT NULL,
        CANTIDAD_RESERVADA              NUMBER(12,2)        DEFAULT 0 NOT NULL,
        STOCK_MINIMO                    NUMBER(10,2)        DEFAULT 5 NOT NULL,
        STOCK_MAXIMO                    NUMBER(10,2)        DEFAULT 50 NOT NULL,
        PUNTO_REORDEN                   NUMBER(10,2)        DEFAULT 10,
        UBICACION_ESTANTE               VARCHAR2(60),
        FECHA_ULTIMO_MOVIMIENTO         DATE,
        FECHA_CREACION                  DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE ''-05:00'' AS DATE) NOT NULL,
        ID_USUARIO_ULTIMA_MODIFICACION  NUMBER(10),
        CONSTRAINT PK_SMY_INV_STOCK     PRIMARY KEY (ID),
        CONSTRAINT FK_SMY_STK_CENTRO    FOREIGN KEY (ID_CENTRO) REFERENCES SMY_CENTROS (ID),
        CONSTRAINT FK_SMY_STK_BODEGA    FOREIGN KEY (ID_BODEGA) REFERENCES SMY_BODEGAS_SEDE (ID),
        CONSTRAINT FK_SMY_STK_ARTICULO  FOREIGN KEY (ID_ARTICULO) REFERENCES SMY_ARTICULOS_CATALOGO (ID),
        CONSTRAINT CK_SMY_STK_DISP      CHECK (CANTIDAD_DISPONIBLE >= 0),
        CONSTRAINT CK_SMY_STK_RES       CHECK (CANTIDAD_RESERVADA >= 0)
    )';
    DBMS_OUTPUT.PUT_LINE('  [+] Tabla SMY_INVENTARIO_STOCK_SEDE creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('  [.] Tabla SMY_INVENTARIO_STOCK_SEDE ya existía.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_SMY_INV_STOCK_SEDE START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('  [+] Secuencia SEQ_SMY_INV_STOCK_SEDE creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_SMY_INV_STOCK_SEDE_BI
BEFORE INSERT ON SMY_INVENTARIO_STOCK_SEDE FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT SEQ_SMY_INV_STOCK_SEDE.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

COMMENT ON TABLE SMY_INVENTARIO_STOCK_SEDE IS 'Control de existencias físicas, lotes, fechas de vencimiento y niveles de stock por bodega en cada sede.';
COMMENT ON COLUMN SMY_INVENTARIO_STOCK_SEDE.CANTIDAD_DISPONIBLE IS 'Existencia real en físico disponible para consumo o entrega.';
COMMENT ON COLUMN SMY_INVENTARIO_STOCK_SEDE.STOCK_MINIMO IS 'Nivel mínimo tolerable antes de disparar alerta roja de desabastecimiento.';
COMMENT ON COLUMN SMY_INVENTARIO_STOCK_SEDE.PUNTO_REORDEN IS 'Nivel de alerta amarilla preventiva para realizar pedido de compra.';

-- -----------------------------------------------------------------------------
-- 6. CABECERA DE MOVIMIENTOS (KARDEX): SMY_MOVIMIENTOS_INVENTARIO
-- -----------------------------------------------------------------------------
PROMPT 6. Creando tabla SMY_MOVIMIENTOS_INVENTARIO y secuencia...

BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE SMY_MOVIMIENTOS_INVENTARIO (
        ID                              NUMBER(10)          NOT NULL,
        ID_CENTRO                       NUMBER(10)          NOT NULL,
        NUMERO_DOCUMENTO                VARCHAR2(30)        NOT NULL,
        TIPO_MOVIMIENTO                 VARCHAR2(30)        NOT NULL,
        FECHA_MOVIMIENTO                DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE ''-05:00'' AS DATE) NOT NULL,
        ID_USUARIO_REGISTRA             NUMBER(10)          NOT NULL,
        ID_RESIDENTE                    NUMBER(10),
        ID_PROVEEDOR                    NUMBER(10),
        OBSERVACIONES                   VARCHAR2(500),
        ESTADO                          VARCHAR2(20)        DEFAULT ''APLICADO'' NOT NULL,
        FECHA_CREACION                  DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE ''-05:00'' AS DATE) NOT NULL,
        ID_USUARIO_ULTIMA_MODIFICACION  NUMBER(10),
        CONSTRAINT PK_SMY_MOV_INV       PRIMARY KEY (ID),
        CONSTRAINT UQ_SMY_MOV_DOC       UNIQUE (NUMERO_DOCUMENTO),
        CONSTRAINT FK_SMY_MOV_CENTRO    FOREIGN KEY (ID_CENTRO) REFERENCES SMY_CENTROS (ID),
        CONSTRAINT FK_SMY_MOV_USUARIO   FOREIGN KEY (ID_USUARIO_REGISTRA) REFERENCES SMY_USUARIOS (ID),
        CONSTRAINT FK_SMY_MOV_RESID     FOREIGN KEY (ID_RESIDENTE) REFERENCES SMY_RESIDENTES (ID) ON DELETE SET NULL,
        CONSTRAINT CK_SMY_MOV_TIPO      CHECK (TIPO_MOVIMIENTO IN (
            ''ENTRADA_COMPRA'', ''ENTRADA_DONACION'', ''SALIDA_CONSUMO_SEDE'',
            ''SALIDA_ENTREGA_RESIDENTE'', ''SALIDA_MERMA_VENCIDO'',
            ''AJUSTE_FISICO_POSITIVO'', ''AJUSTE_FISICO_NEGATIVO'',
            ''TRASLADO_SALIDA'', ''TRASLADO_ENTRADA''
        )),
        CONSTRAINT CK_SMY_MOV_EST       CHECK (ESTADO IN (''APLICADO'', ''ANULADO''))
    )';
    DBMS_OUTPUT.PUT_LINE('  [+] Tabla SMY_MOVIMIENTOS_INVENTARIO creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('  [.] Tabla SMY_MOVIMIENTOS_INVENTARIO ya existía.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_SMY_MOV_INVENTARIO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('  [+] Secuencia SEQ_SMY_MOV_INVENTARIO creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_SMY_MOV_INVENTARIO_BI
BEFORE INSERT ON SMY_MOVIMIENTOS_INVENTARIO FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT SEQ_SMY_MOV_INVENTARIO.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

COMMENT ON TABLE SMY_MOVIMIENTOS_INVENTARIO IS 'Cabecera de movimientos de almacén, entradas, salidas asistenciales, traslados y ajustes de inventario.';
COMMENT ON COLUMN SMY_MOVIMIENTOS_INVENTARIO.NUMERO_DOCUMENTO IS 'Número oficial del comprobante (ej. INV-ENT-2026-0001, INV-SAL-2026-0042).';
COMMENT ON COLUMN SMY_MOVIMIENTOS_INVENTARIO.ID_RESIDENTE IS 'Clave foránea hacia SMY_RESIDENTES(ID) si el insumo fue entregado o consumido por un residente.';

-- -----------------------------------------------------------------------------
-- 7. DETALLE DE MOVIMIENTOS (LÍNEAS KARDEX): SMY_MOVIMIENTOS_INV_DETALLE
-- -----------------------------------------------------------------------------
PROMPT 7. Creando tabla SMY_MOVIMIENTOS_INV_DETALLE y secuencia...

BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE SMY_MOVIMIENTOS_INV_DETALLE (
        ID                              NUMBER(10)          NOT NULL,
        ID_MOVIMIENTO                   NUMBER(10)          NOT NULL,
        ID_BODEGA                       NUMBER(10)          NOT NULL,
        ID_ARTICULO                     NUMBER(10)          NOT NULL,
        NUMERO_LOTE                     VARCHAR2(50),
        FECHA_VENCIMIENTO               DATE,
        CANTIDAD                        NUMBER(12,2)        NOT NULL,
        COSTO_UNITARIO                  NUMBER(12,2)        DEFAULT 0 NOT NULL,
        COSTO_TOTAL                     NUMBER(12,2)        DEFAULT 0 NOT NULL,
        SALDO_ANTERIOR                  NUMBER(12,2)        DEFAULT 0 NOT NULL,
        SALDO_POSTERIOR                 NUMBER(12,2)        DEFAULT 0 NOT NULL,
        FECHA_CREACION                  DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE ''-05:00'' AS DATE) NOT NULL,
        CONSTRAINT PK_SMY_MOV_DET       PRIMARY KEY (ID),
        CONSTRAINT FK_SMY_MOVDET_MOV    FOREIGN KEY (ID_MOVIMIENTO) REFERENCES SMY_MOVIMIENTOS_INVENTARIO (ID) ON DELETE CASCADE,
        CONSTRAINT FK_SMY_MOVDET_BOD    FOREIGN KEY (ID_BODEGA) REFERENCES SMY_BODEGAS_SEDE (ID),
        CONSTRAINT FK_SMY_MOVDET_ART    FOREIGN KEY (ID_ARTICULO) REFERENCES SMY_ARTICULOS_CATALOGO (ID),
        CONSTRAINT CK_SMY_MOVDET_CANT   CHECK (CANTIDAD > 0)
    )';
    DBMS_OUTPUT.PUT_LINE('  [+] Tabla SMY_MOVIMIENTOS_INV_DETALLE creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('  [.] Tabla SMY_MOVIMIENTOS_INV_DETALLE ya existía.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_SMY_MOV_INV_DET START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('  [+] Secuencia SEQ_SMY_MOV_INV_DET creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_SMY_MOV_INV_DET_BI
BEFORE INSERT ON SMY_MOVIMIENTOS_INV_DETALLE FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT SEQ_SMY_MOV_INV_DET.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

COMMENT ON TABLE SMY_MOVIMIENTOS_INV_DETALLE IS 'Renglones y líneas de kardex detalladas con auditoría de saldos antes y después de la operación.';
COMMENT ON COLUMN SMY_MOVIMIENTOS_INV_DETALLE.SALDO_ANTERIOR IS 'Existencia de la bodega antes de aplicar la transacción.';
COMMENT ON COLUMN SMY_MOVIMIENTOS_INV_DETALLE.SALDO_POSTERIOR IS 'Existencia resultante en bodega tras aplicar la transacción.';

-- -----------------------------------------------------------------------------
-- 8. TRASLADOS INTER-SEDES: SMY_TRASLADOS_SEDES Y DETALLE
-- -----------------------------------------------------------------------------
PROMPT 8. Creando tablas de Traslados Inter-Sedes (SMY_TRASLADOS_SEDES / DETALLE)...

BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE SMY_TRASLADOS_SEDES (
        ID                              NUMBER(10)          NOT NULL,
        CODIGO_TRASLADO                 VARCHAR2(30)        NOT NULL,
        ID_CENTRO_ORIGEN                NUMBER(10)          NOT NULL,
        ID_CENTRO_DESTINO               NUMBER(10)          NOT NULL,
        FECHA_ENVIO                     DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE ''-05:00'' AS DATE) NOT NULL,
        FECHA_RECEPCION                 DATE,
        ESTADO_TRASLADO                 VARCHAR2(30)        DEFAULT ''EN_TRANSITO'' NOT NULL,
        ID_USUARIO_DESPACHA             NUMBER(10)          NOT NULL,
        ID_USUARIO_RECIBE               NUMBER(10),
        NOTAS_DESPACHO                  VARCHAR2(400),
        NOTAS_RECEPCION                 VARCHAR2(400),
        FECHA_CREACION                  DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE ''-05:00'' AS DATE) NOT NULL,
        ID_USUARIO_ULTIMA_MODIFICACION  NUMBER(10),
        CONSTRAINT PK_SMY_TRASLADOS     PRIMARY KEY (ID),
        CONSTRAINT UQ_SMY_TRS_COD       UNIQUE (CODIGO_TRASLADO),
        CONSTRAINT FK_SMY_TRS_ORIGEN    FOREIGN KEY (ID_CENTRO_ORIGEN) REFERENCES SMY_CENTROS (ID),
        CONSTRAINT FK_SMY_TRS_DESTINO   FOREIGN KEY (ID_CENTRO_DESTINO) REFERENCES SMY_CENTROS (ID),
        CONSTRAINT FK_SMY_TRS_USUDESP   FOREIGN KEY (ID_USUARIO_DESPACHA) REFERENCES SMY_USUARIOS (ID),
        CONSTRAINT FK_SMY_TRS_USUREC    FOREIGN KEY (ID_USUARIO_RECIBE) REFERENCES SMY_USUARIOS (ID),
        CONSTRAINT CK_SMY_TRS_DIFF      CHECK (ID_CENTRO_ORIGEN <> ID_CENTRO_DESTINO),
        CONSTRAINT CK_SMY_TRS_ESTADO    CHECK (ESTADO_TRASLADO IN (''EN_TRANSITO'', ''RECIBIDO_CONFORME'', ''RECIBIDO_CON_NOVEDAD'', ''CANCELADO''))
    )';
    DBMS_OUTPUT.PUT_LINE('  [+] Tabla SMY_TRASLADOS_SEDES creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('  [.] Tabla SMY_TRASLADOS_SEDES ya existía.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_SMY_TRASLADOS_SEDES START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('  [+] Secuencia SEQ_SMY_TRASLADOS_SEDES creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_SMY_TRASLADOS_SEDES_BI
BEFORE INSERT ON SMY_TRASLADOS_SEDES FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT SEQ_SMY_TRASLADOS_SEDES.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE SMY_TRASLADOS_SEDES_DETALLE (
        ID                              NUMBER(10)          NOT NULL,
        ID_TRASLADO                     NUMBER(10)          NOT NULL,
        ID_ARTICULO                     NUMBER(10)          NOT NULL,
        NUMERO_LOTE                     VARCHAR2(50),
        FECHA_VENCIMIENTO               DATE,
        CANTIDAD_ENVIADA                NUMBER(12,2)        NOT NULL,
        CANTIDAD_RECIBIDA               NUMBER(12,2),
        ESTADO_ITEM                     VARCHAR2(30)        DEFAULT ''EN_TRANSITO'' NOT NULL,
        FECHA_CREACION                  DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE ''-05:00'' AS DATE) NOT NULL,
        CONSTRAINT PK_SMY_TRS_DET       PRIMARY KEY (ID),
        CONSTRAINT FK_SMY_TRSDET_TRS    FOREIGN KEY (ID_TRASLADO) REFERENCES SMY_TRASLADOS_SEDES (ID) ON DELETE CASCADE,
        CONSTRAINT FK_SMY_TRSDET_ART    FOREIGN KEY (ID_ARTICULO) REFERENCES SMY_ARTICULOS_CATALOGO (ID),
        CONSTRAINT CK_SMY_TRSDET_CANT   CHECK (CANTIDAD_ENVIADA > 0)
    )';
    DBMS_OUTPUT.PUT_LINE('  [+] Tabla SMY_TRASLADOS_SEDES_DETALLE creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('  [.] Tabla SMY_TRASLADOS_SEDES_DETALLE ya existía.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_SMY_TRASLADOS_DET START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('  [+] Secuencia SEQ_SMY_TRASLADOS_DET creada.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_SMY_TRASLADOS_DET_BI
BEFORE INSERT ON SMY_TRASLADOS_SEDES_DETALLE FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT SEQ_SMY_TRASLADOS_DET.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

-- -----------------------------------------------------------------------------
-- 9. ÍNDICES DE RENDIMIENTO PARA EL MÓDULO DE INVENTARIO
-- -----------------------------------------------------------------------------
PROMPT 9. Creando índices de rendimiento...

BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_SMY_STK_CENTRO ON SMY_INVENTARIO_STOCK_SEDE(ID_CENTRO, ID_ARTICULO)';
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_SMY_STK_VENCE  ON SMY_INVENTARIO_STOCK_SEDE(FECHA_VENCIMIENTO)';
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_SMY_MOV_CENTRO ON SMY_MOVIMIENTOS_INVENTARIO(ID_CENTRO, FECHA_MOVIMIENTO)';
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_SMY_MOVDET_ART ON SMY_MOVIMIENTOS_INV_DETALLE(ID_ARTICULO)';
    DBMS_OUTPUT.PUT_LINE('  [+] Índices creados.');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('  [.] Índices ya existían o verificados.');
END;
/

-- =============================================================================
-- 10. SCRIPT DE CONFIGURACIÓN Y MARCACIÓN DE SEDES (ACTIVACIÓN DE INVENTARIO)
-- =============================================================================
PROMPT ============================================================================
PROMPT 10. CONFIGURACIÓN DE SEDES PARA GESTIÓN DE INVENTARIOS
PROMPT ============================================================================

-- Asegurar que la organización principal tenga habilitado el inventario
UPDATE SMY_ORGANIZACIONES
   SET MANEJA_INVENTARIO = 'S'
 WHERE MANEJA_INVENTARIO IS NULL OR MANEJA_INVENTARIO = 'N';

-- Configuración de sedes: Por defecto marcamos las sedes principales en 'S'
-- Ajuste aquí según las necesidades de su centro geriátrico:
UPDATE SMY_CENTROS
   SET MANEJA_INVENTARIO = 'S'
 WHERE ID IN (1, 2); -- Sede Chía Campestre y Sede Bogotá Norte

COMMIT;

-- Creación automática de Bodega Principal para cada sede que maneje inventario si aún no existe
DECLARE
    v_existe NUMBER := 0;
BEGIN
    FOR reg_cen IN (SELECT ID, CODIGO_CENTRO, NOMBRE_CENTRO FROM SMY_CENTROS WHERE MANEJA_INVENTARIO = 'S') LOOP
        SELECT COUNT(*) INTO v_existe
          FROM SMY_BODEGAS_SEDE
         WHERE ID_CENTRO = reg_cen.ID
           AND CODIGO_BODEGA = 'BOD-PRIN';

        IF v_existe = 0 THEN
            INSERT INTO SMY_BODEGAS_SEDE (
                ID_CENTRO, CODIGO_BODEGA, NOMBRE_BODEGA, DESCRIPCION, ES_BODEGA_PRINCIPAL, ESTADO
            ) VALUES (
                reg_cen.ID,
                'BOD-PRIN',
                'Almacén Principal - ' || SUBSTR(reg_cen.NOMBRE_CENTRO, 1, 50),
                'Bodega central de insumos asistenciales y abastecimiento para ' || reg_cen.NOMBRE_CENTRO,
                'S',
                'Activo'
            );
            DBMS_OUTPUT.PUT_LINE('  [+] Bodega Principal generada para sede: ' || reg_cen.NOMBRE_CENTRO);
        END IF;
    END LOOP;
END;
/

COMMIT;

-- -----------------------------------------------------------------------------
-- 11. INSERCIÓN DE CATÁLOGO MAESTRO SEMILLA (CATEGORÍAS Y ARTÍCULOS BASE)
-- -----------------------------------------------------------------------------
PROMPT 11. Población de Catálogos Semilla de Inventario...

-- Categorías
MERGE INTO SMY_CATEGORIAS_ARTICULOS c
USING (
    SELECT 1 AS ID_ORG, 'ASIST_CUR' AS COD, 'Insumos Asistenciales y Curación' AS NOM, '#0EA5E9' AS COL FROM DUAL UNION ALL
    SELECT 1, 'MED_URG',   'Medicamentos y Fármacos de Urgencia',   '#EF4444' FROM DUAL UNION ALL
    SELECT 1, 'ASEO_DES',  'Aseo y Desinfección Hospitalaria',      '#10B981' FROM DUAL UNION ALL
    SELECT 1, 'LENC_CAMA', 'Lencería y Ropa de Cama',               '#8B5CF6' FROM DUAL UNION ALL
    SELECT 1, 'NUT_ALIM',  'Nutrición y Suplementos Especiales',    '#F59E0B' FROM DUAL UNION ALL
    SELECT 1, 'EQUIP_BIO', 'Equipamiento Menor y Dispositivos',     '#64748B' FROM DUAL
) v ON (c.ID_ORGANIZACION = v.ID_ORG AND c.CODIGO_CATEGORIA = v.COD)
WHEN NOT MATCHED THEN
    INSERT (ID_ORGANIZACION, CODIGO_CATEGORIA, NOMBRE_CATEGORIA, COLOR_HEX, ESTADO)
    VALUES (v.ID_ORG, v.COD, v.NOM, v.COL, 'Activo');

COMMIT;

-- Artículos Semilla para prueba operativa inmediata
DECLARE
    v_cat_asist NUMBER;
    v_cat_med   NUMBER;
    v_cat_aseo  NUMBER;
    v_cat_lenc  NUMBER;
    v_cat_nut   NUMBER;
BEGIN
    SELECT ID INTO v_cat_asist FROM SMY_CATEGORIAS_ARTICULOS WHERE CODIGO_CATEGORIA = 'ASIST_CUR' AND ROWNUM = 1;
    SELECT ID INTO v_cat_med   FROM SMY_CATEGORIAS_ARTICULOS WHERE CODIGO_CATEGORIA = 'MED_URG'   AND ROWNUM = 1;
    SELECT ID INTO v_cat_aseo  FROM SMY_CATEGORIAS_ARTICULOS WHERE CODIGO_CATEGORIA = 'ASEO_DES'  AND ROWNUM = 1;
    SELECT ID INTO v_cat_lenc  FROM SMY_CATEGORIAS_ARTICULOS WHERE CODIGO_CATEGORIA = 'LENC_CAMA' AND ROWNUM = 1;
    SELECT ID INTO v_cat_nut   FROM SMY_CATEGORIAS_ARTICULOS WHERE CODIGO_CATEGORIA = 'NUT_ALIM'  AND ROWNUM = 1;

    -- Insumo 1: Pañales Adulto
    MERGE INTO SMY_ARTICULOS_CATALOGO a
    USING (SELECT 1 AS ID_ORG, 'INS-PAN-01' AS COD FROM DUAL) v ON (a.ID_ORGANIZACION = v.ID_ORG AND a.CODIGO_ARTICULO = v.COD)
    WHEN NOT MATCHED THEN
        INSERT (ID_ORGANIZACION, ID_CATEGORIA, CODIGO_ARTICULO, NOMBRE_ARTICULO, DESCRIPCION, UNIDAD_MEDIDA, REQUIERE_LOTE_VENCIMIENTO, ES_DESCONTABLE_POR_RESIDENTE, COSTO_ESTANDAR)
        VALUES (1, v_cat_asist, 'INS-PAN-01', 'Pañal Desechable Adulto Talla G (Paquete x 30)', 'Pañales para incontinencia severa con indicador de humedad', 'PAQUETE', 'N', 'S', 58000);

    -- Insumo 2: Tiras Reactivas Glucometría
    MERGE INTO SMY_ARTICULOS_CATALOGO a
    USING (SELECT 1 AS ID_ORG, 'INS-GLU-02' AS COD FROM DUAL) v ON (a.ID_ORGANIZACION = v.ID_ORG AND a.CODIGO_ARTICULO = v.COD)
    WHEN NOT MATCHED THEN
        INSERT (ID_ORGANIZACION, ID_CATEGORIA, CODIGO_ARTICULO, NOMBRE_ARTICULO, DESCRIPCION, UNIDAD_MEDIDA, REQUIERE_LOTE_VENCIMIENTO, ES_DESCONTABLE_POR_RESIDENTE, COSTO_ESTANDAR)
        VALUES (1, v_cat_asist, 'INS-GLU-02', 'Tiras Reactivas Glucometría Accu-Chek (Caja x 50)', 'Tiras para monitoreo de glucosa capilar preprandial', 'CAJA', 'S', 'S', 95000);

    -- Insumo 3: Solución Salina 0.9%
    MERGE INTO SMY_ARTICULOS_CATALOGO a
    USING (SELECT 1 AS ID_ORG, 'MED-SOL-01' AS COD FROM DUAL) v ON (a.ID_ORGANIZACION = v.ID_ORG AND a.CODIGO_ARTICULO = v.COD)
    WHEN NOT MATCHED THEN
        INSERT (ID_ORGANIZACION, ID_CATEGORIA, CODIGO_ARTICULO, NOMBRE_ARTICULO, DESCRIPCION, UNIDAD_MEDIDA, REQUIERE_LOTE_VENCIMIENTO, ES_DESCONTABLE_POR_RESIDENTE, COSTO_ESTANDAR)
        VALUES (1, v_cat_med, 'MED-SOL-01', 'Solución Salina Normal 0.9% Bolsa 500ml', 'Bolsa para irrigación, curaciones e hidratación', 'UNIDAD', 'S', 'S', 6500);

    -- Insumo 4: Jabón Quirúrgico Clorhexidina
    MERGE INTO SMY_ARTICULOS_CATALOGO a
    USING (SELECT 1 AS ID_ORG, 'ASE-CLX-01' AS COD FROM DUAL) v ON (a.ID_ORGANIZACION = v.ID_ORG AND a.CODIGO_ARTICULO = v.COD)
    WHEN NOT MATCHED THEN
        INSERT (ID_ORGANIZACION, ID_CATEGORIA, CODIGO_ARTICULO, NOMBRE_ARTICULO, DESCRIPCION, UNIDAD_MEDIDA, REQUIERE_LOTE_VENCIMIENTO, ES_DESCONTABLE_POR_RESIDENTE, COSTO_ESTANDAR)
        VALUES (1, v_cat_aseo, 'ASE-CLX-01', 'Jabón Quirúrgico Clorhexidina 4% Galón', 'Antiséptico de alto nivel para lavado clínico de manos y superficies', 'FRASCO', 'S', 'N', 82000);

    -- Insumo 5: Juego de Sábanas Institucionales
    MERGE INTO SMY_ARTICULOS_CATALOGO a
    USING (SELECT 1 AS ID_ORG, 'LEN-SAB-01' AS COD FROM DUAL) v ON (a.ID_ORGANIZACION = v.ID_ORG AND a.CODIGO_ARTICULO = v.COD)
    WHEN NOT MATCHED THEN
        INSERT (ID_ORGANIZACION, ID_CATEGORIA, CODIGO_ARTICULO, NOMBRE_ARTICULO, DESCRIPCION, UNIDAD_MEDIDA, REQUIERE_LOTE_VENCIMIENTO, ES_DESCONTABLE_POR_RESIDENTE, COSTO_ESTANDAR)
        VALUES (1, v_cat_lenc, 'LEN-SAB-01', 'Juego de Sábanas Cama Sencilla Algodón 180H', 'Sábana ajustable, sobre-sábana y funda color blanco institucional', 'UNIDAD', 'N', 'S', 45000);

    -- Insumo 6: Suplemento Nutricional Ensure Advance
    MERGE INTO SMY_ARTICULOS_CATALOGO a
    USING (SELECT 1 AS ID_ORG, 'NUT-ENS-01' AS COD FROM DUAL) v ON (a.ID_ORGANIZACION = v.ID_ORG AND a.CODIGO_ARTICULO = v.COD)
    WHEN NOT MATCHED THEN
        INSERT (ID_ORGANIZACION, ID_CATEGORIA, CODIGO_ARTICULO, NOMBRE_ARTICULO, DESCRIPCION, UNIDAD_MEDIDA, REQUIERE_LOTE_VENCIMIENTO, ES_DESCONTABLE_POR_RESIDENTE, COSTO_ESTANDAR)
        VALUES (1, v_cat_nut, 'NUT-ENS-01', 'Ensure Advance Vainilla Lata 850g', 'Nutrición enteral completa con HMB para masa muscular', 'FRASCO', 'S', 'S', 89000);

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('  [+] Catálogo de productos semilla insertado con éxito.');
END;
/

-- -----------------------------------------------------------------------------
-- 12. POBLAR SALDOS DE INVENTARIO INICIALES PARA SEDE 1 (CHÍA)
-- -----------------------------------------------------------------------------
PROMPT 12. Creando saldos de demostración para Sede 1...

DECLARE
    v_bodega_id NUMBER;
BEGIN
    SELECT ID INTO v_bodega_id
      FROM SMY_BODEGAS_SEDE
     WHERE ID_CENTRO = 1
       AND ES_BODEGA_PRINCIPAL = 'S'
       AND ROWNUM = 1;

    FOR reg_art IN (SELECT ID, CODIGO_ARTICULO, REQUIERE_LOTE_VENCIMIENTO FROM SMY_ARTICULOS_CATALOGO) LOOP
        -- Si aún no tiene registro de stock, insertar saldo
        MERGE INTO SMY_INVENTARIO_STOCK_SEDE s
        USING (SELECT 1 AS ID_CEN, v_bodega_id AS ID_BOD, reg_art.ID AS ID_ART FROM DUAL) v
           ON (s.ID_CENTRO = v.ID_CEN AND s.ID_BODEGA = v.ID_BOD AND s.ID_ARTICULO = v.ID_ART)
        WHEN NOT MATCHED THEN
            INSERT (
                ID_CENTRO, ID_BODEGA, ID_ARTICULO, NUMERO_LOTE, FECHA_VENCIMIENTO,
                CANTIDAD_DISPONIBLE, CANTIDAD_RESERVADA, STOCK_MINIMO, STOCK_MAXIMO, PUNTO_REORDEN,
                UBICACION_ESTANTE, FECHA_ULTIMO_MOVIMIENTO
            ) VALUES (
                1, v_bodega_id, reg_art.ID,
                CASE WHEN reg_art.REQUIERE_LOTE_VENCIMIENTO = 'S' THEN 'LOTE-2026-A1' ELSE NULL END,
                CASE WHEN reg_art.REQUIERE_LOTE_VENCIMIENTO = 'S' THEN ADD_MONTHS(TRUNC(SYSDATE), 8) ELSE NULL END,
                CASE reg_art.CODIGO_ARTICULO
                    WHEN 'INS-PAN-01' THEN 45
                    WHEN 'INS-GLU-02' THEN 8  -- Stock bajo de prueba
                    WHEN 'MED-SOL-01' THEN 30
                    WHEN 'ASE-CLX-01' THEN 12
                    WHEN 'LEN-SAB-01' THEN 25
                    WHEN 'NUT-ENS-01' THEN 15
                    ELSE 20
                END,
                0,
                10, 50, 15,
                'Estante A-1',
                CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)
            );
    END LOOP;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('  [+] Saldos iniciales creados para Sede 1.');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('  [!] Nota saldos iniciales: ' || SQLERRM);
END;
/

PROMPT ============================================================================
PROMPT SCRIPT CAMBIOS_INVENTARIO.SQL COMPLETADO EXITOSAMENTE
PROMPT ============================================================================
