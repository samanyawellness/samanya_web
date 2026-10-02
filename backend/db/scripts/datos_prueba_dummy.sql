-- =============================================================================
-- SISTEMA DE GESTIÓN INTEGRAL PARA CENTROS GERIÁTRICOS (SAMANYA OS)
-- SCRIPT DE POBLACIÓN DE DATOS DE PRUEBA (DUMMY DATA)
-- =============================================================================
-- Archivo: datos_prueba_dummy.sql
-- Propósito: Llenar la base de datos con un conjunto de datos realista y coherente
--            para pruebas de la aplicación web, backend y aplicación móvil.
-- Requisitos cumplidos:
--  - Al menos 10 Residentes (10 residentes con historial clínico completo).
--  - Al menos 4 Empleados (4 empleados asistenciales + 1 usuario administrador).
--  - Al menos 14 Familiares / Acudientes (14 acudientes con usuarios activos).
--  - Al menos 2 Residentes con 2 o más familiares vinculados:
--      * Residente 1 (Álvaro Delgado) vinculado a 3 familiares (Lucía, Carlos y Sofía).
--      * Residente 2 (Elena Pérez) vinculada a 3 familiares (Javier, Beatriz y Valentina).
--  - Datos operacionales completos:
--      * Turnos de cuidadores (Mañana, Tarde, Noche).
--      * Prescripciones médicas y administración de medicamentos.
--      * Signos vitales con registros normales y alertas clínicas.
--      * Bitácora asistencial multidisciplinaria visible para familiares.
--      * Consentimientos informados (firmados y pendientes con canvas de firma).
--      * Tareas operativas diarias (individuales y grupales).
--      * Incidentes y eventos adversos con trazabilidad y acudiente notificado.
--      * Eventos de calendario del centro geriátrico.
--      * Mensajería interna y notificaciones push / sistema.
--      * Sincronización automática de secuencias para evitar colisiones de ID.
--
-- CREDENCIALES DE ACCESO GENERALES (Contraseña universal para todas las cuentas):
--  Contraseña:  Samanya2026*
--
--  USUARIOS PRINCIPALES:
--   - Rol ADMIN:      admin         / Samanya2026* (Administrador General)
--   - Rol CUIDADOR:   mrodriguez    / Samanya2026* (Martha Rodríguez - Enf. Jefe)
--                     cramirez      / Samanya2026* (Carlos Ramírez - Cuidador TM)
--                     lmartinez     / Samanya2026* (Laura Martínez - Cuidadora TT)
--                     agomez        / Samanya2026* (Andrés Gómez - Aux. Enfermería TN)
--   - Rol FAMILIAR:   ldelgado      / Samanya2026* (Lucía Delgado - Familiar Residente 1)
--                     cdelgado      / Samanya2026* (Carlos Delgado - Familiar Residente 1)
--                     jperez        / Samanya2026* (Javier Pérez - Familiar Residente 2)
--                     bperez        / Samanya2026* (Beatriz Pérez - Familiar Residente 2)
--                     mlopez        / Samanya2026* (Mariana López - Familiar Residente 3)
--                     rhernandez    / Samanya2026* (Roberto Hernández - Familiar Residente 4)
--                     atorres       / Samanya2026* (Ana María Torres - Familiar Residente 5)
--                     jcastro       / Samanya2026* (Jorge Castro - Familiar Residente 6)
--                     cmorales      / Samanya2026* (Claudia Morales - Familiar Residente 7)
--                     fsanchez      / Samanya2026* (Fernando Sánchez - Familiar Residente 8)
--                     pnavarro      / Samanya2026* (Patricia Navarro - Familiar Residente 9)
--                     gcastillo     / Samanya2026* (Gustavo Castillo - Familiar Residente 10)
--                     sdelgado      / Samanya2026* (Sofía Delgado - 3er Familiar Residente 1)
--                     vperez        / Samanya2026* (Valentina Pérez - 3er Familiar Residente 2)
-- =============================================================================
-- CONFIGURACIÓN DE CODIFICACIÓN REGIONAL (NLS_LANG / UTF-8)
-- =============================================================================
-- NOTA OBLIGATORIA PARA EJECUCIÓN EN WINDOWS (SQL*Plus / CMD / PowerShell):
-- Para evitar que las tildes y caracteres especiales se corrompan (mojibake),
-- configure la variable NLS_LANG antes de invocar el cliente de base de datos:
--
--   En CMD / Símbolo del Sistema:
--     chcp 65001
--     set NLS_LANG=SPANISH_SPAIN.AL32UTF8
--     sqlplus usuario/clave@tns @datos_prueba_dummy.sql
--
--   En PowerShell:
--     [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
--     $env:NLS_LANG = "SPANISH_SPAIN.AL32UTF8"
--     sqlplus usuario/clave@tns @datos_prueba_dummy.sql
--
--   En Oracle SQL Developer:
--     Herramientas -> Preferencias -> Entorno -> Codificación -> UTF-8
-- =============================================================================

SET DEFINE OFF;
SET SERVEROUTPUT ON SIZE UNLIMITED;
ALTER SESSION DISABLE PARALLEL DML;

-- Ajuste de sesión regional y formato de fechas en español
ALTER SESSION SET NLS_LANGUAGE = 'SPANISH';
ALTER SESSION SET NLS_TERRITORY = 'COLOMBIA';

PROMPT ============================================================================
PROMPT   INICIANDO CARGA DE DATOS DUMMY - SAMANYA OS
PROMPT   NLS_LANG REQUERIDO: SPANISH_SPAIN.AL32UTF8
PROMPT   HORA OFICIAL (Bogotá, Colombia - UTC-5): CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)
PROMPT ============================================================================

-- =============================================================================
-- 0. ORGANIZACIONES Y CENTROS GERIÁTRICOS (ESTRUCTURA MULTI-TENANT)
--    Garantiza aislamiento de datos y catálogos maestros asignados a cada organización
-- =============================================================================
PROMPT 0. Garantizando Organizaciones y Centros Multi-Tenant...

MERGE INTO SMY_ORGANIZACIONES dest
USING (
    SELECT 1 AS ID, 'ORG-SAMANYA' AS CODIGO_ORGANIZACION, 'Samanya Wellness Care S.A.S.' AS RAZON_SOCIAL,
           'Samanya Senior Living' AS NOMBRE_COMERCIAL, '901.452.883-1' AS NUMERO_IDENTIFICACION_TRIB,
           1 AS ID_TIPO_IDENTIFICACION, 'contacto@samanya.com' AS EMAIL_CORPORATIVO, '+57 310 445 5667' AS TELEFONO_CONTACTO, 1 AS ID_ESTADO_ORGANIZACION FROM DUAL
    UNION ALL
    SELECT 2, 'ORG-VITALIA', 'Vitalia Senior Care S.A.S.', 'Vitalia Hogares', '900.871.220-4', 1, 'info@vitalia.com', '+57 320 889 1234', 1 FROM DUAL
) src ON (dest.ID = src.ID)
WHEN NOT MATCHED THEN
INSERT (ID, CODIGO_ORGANIZACION, RAZON_SOCIAL, NOMBRE_COMERCIAL, NUMERO_IDENTIFICACION_TRIB, ID_TIPO_IDENTIFICACION, EMAIL_CORPORATIVO, TELEFONO_CONTACTO, ID_ESTADO_ORGANIZACION)
VALUES (src.ID, src.CODIGO_ORGANIZACION, src.RAZON_SOCIAL, src.NOMBRE_COMERCIAL, src.NUMERO_IDENTIFICACION_TRIB, src.ID_TIPO_IDENTIFICACION, src.EMAIL_CORPORATIVO, src.TELEFONO_CONTACTO, src.ID_ESTADO_ORGANIZACION);

MERGE INTO SMY_CENTROS dest
USING (
    SELECT 1 AS ID, 1 AS ID_ORGANIZACION, 'SEDE-CENTRAL' AS CODIGO_CENTRO, 'Sede Central Bogotá' AS NOMBRE_CENTRO,
           'sede_central_bogota' AS SLUG_DIRECTORIO, 'Bogotá D.C.' AS CIUDAD, 'Calle 127 # 19-45, Usaquén' AS DIRECCION, 60 AS CAPACIDAD_RESIDENTES FROM DUAL
    UNION ALL
    SELECT 2, 1, 'SEDE-NORTE', 'Sede Campestre La Calera', 'sede_campestre_calera', 'La Calera', 'Km 4 Vía La Calera', 45 FROM DUAL
    UNION ALL
    SELECT 3, 2, 'SEDE-VITALIA-MEDELLIN', 'Sede Poblado Medellín', 'sede_poblado_medellin', 'Medellín', 'Carrera 43A # 1-50, El Poblado', 50 FROM DUAL
) src ON (dest.ID = src.ID)
WHEN NOT MATCHED THEN
INSERT (ID, ID_ORGANIZACION, CODIGO_CENTRO, NOMBRE_CENTRO, SLUG_DIRECTORIO, CIUDAD, DIRECCION, CAPACIDAD_RESIDENTES)
VALUES (src.ID, src.ID_ORGANIZACION, src.CODIGO_CENTRO, src.NOMBRE_CENTRO, src.SLUG_DIRECTORIO, src.CIUDAD, src.DIRECCION, src.CAPACIDAD_RESIDENTES);

COMMIT;

-- =============================================================================
-- 0.5 ARCHIVOS DEL SISTEMA (SMY_ARCHIVOS)
--     Almacenamiento unificado de archivos con estructura jerárquica estricta:
--     Samanya / {Nombre_Sede} / {Residentes | Talento Humano} / {id_archivo}_{identificacion} / Documentos / {hash}.{ext}
-- =============================================================================
PROMPT 0.5 Insertando Archivos del Sistema (SMY_ARCHIVOS)...

-- Fotos de perfil de Talento Humano (Admin + Cuidadores)
INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    1, 1, 7, NULL, NULL,
    'avatar_admin.jpg', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.jpg',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'jpg', 'image/jpeg', 45210,
    'Samanya/Sede Central Bogotá/Talento Humano/1_admin/Documentos/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.jpg',
    'Samanya/Sede Central Bogotá/Talento Humano/1_admin/Documentos/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    2, 1, 7, NULL, NULL,
    'foto_mrodriguez.jpg', '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069.jpg',
    '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 'jpg', 'image/jpeg', 52310,
    'Samanya/Sede Central Bogotá/Talento Humano/2_52345678/Documentos/7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069.jpg',
    'Samanya/Sede Central Bogotá/Talento Humano/2_52345678/Documentos/7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    3, 1, 7, NULL, NULL,
    'foto_cramirez.jpg', 'cramirez1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8550123.jpg',
    'cramirez1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8550123', 'jpg', 'image/jpeg', 48920,
    'Samanya/Sede Central Bogotá/Talento Humano/3_80123456/Documentos/cramirez1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8550123.jpg',
    'Samanya/Sede Central Bogotá/Talento Humano/3_80123456/Documentos/cramirez1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8550123.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    4, 2, 7, NULL, NULL,
    'foto_lmartinez.jpg', 'lmartinezc149afbf4c8996fb92427ae41e4649b934ca495991b7852b8554567.jpg',
    'lmartinezc149afbf4c8996fb92427ae41e4649b934ca495991b7852b8554567', 'jpg', 'image/jpeg', 51100,
    'Samanya/Sede Campestre La Calera/Talento Humano/4_1018234567/Documentos/lmartinezc149afbf4c8996fb92427ae41e4649b934ca495991b7852b8554567.jpg',
    'Samanya/Sede Campestre La Calera/Talento Humano/4_1018234567/Documentos/lmartinezc149afbf4c8996fb92427ae41e4649b934ca495991b7852b8554567.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    5, 1, 7, NULL, NULL,
    'foto_agomez.jpg', 'agomez89afbf4c8996fb92427ae41e4649b934ca495991b7852b8558901abcd.jpg',
    'agomez89afbf4c8996fb92427ae41e4649b934ca495991b7852b8558901abcd', 'jpg', 'image/jpeg', 47800,
    'Samanya/Sede Central Bogotá/Talento Humano/5_1020456789/Documentos/agomez89afbf4c8996fb92427ae41e4649b934ca495991b7852b8558901abcd.jpg',
    'Samanya/Sede Central Bogotá/Talento Humano/5_1020456789/Documentos/agomez89afbf4c8996fb92427ae41e4649b934ca495991b7852b8558901abcd.jpg',
    1

);

-- Fotos de perfil de Residentes
INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    101, 1, 7, NULL, NULL,
    'foto_alvaro_delgado.jpg', 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0.jpg',
    'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', 'jpg', 'image/jpeg', 63200,
    'Samanya/Sede Central Bogotá/Residentes/101_19234567/Documentos/a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0.jpg',
    'Samanya/Sede Central Bogotá/Residentes/101_19234567/Documentos/a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    102, 1, 7, NULL, NULL,
    'foto_elena_perez.jpg', 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01.jpg',
    'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01', 'jpg', 'image/jpeg', 59400,
    'Samanya/Sede Central Bogotá/Residentes/102_24567890/Documentos/b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01.jpg',
    'Samanya/Sede Central Bogotá/Residentes/102_24567890/Documentos/b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    103, 1, 7, NULL, NULL,
    'foto_fernando_lopez.jpg', 'c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012.jpg',
    'c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012', 'jpg', 'image/jpeg', 61800,
    'Samanya/Sede Central Bogotá/Residentes/103_17890123/Documentos/c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012.jpg',
    'Samanya/Sede Central Bogotá/Residentes/103_17890123/Documentos/c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    104, 1, 7, NULL, NULL,
    'foto_mercedes_hernandez.jpg', 'd4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0123.jpg',
    'd4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0123', 'jpg', 'image/jpeg', 58700,
    'Samanya/Sede Central Bogotá/Residentes/104_32456781/Documentos/d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0123.jpg',
    'Samanya/Sede Central Bogotá/Residentes/104_32456781/Documentos/d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0123.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    105, 1, 7, NULL, NULL,
    'foto_gustavo_torres.jpg', 'e5f67890123456789abcdef0123456789abcdef0123456789abcdef01234.jpg',
    'e5f67890123456789abcdef0123456789abcdef0123456789abcdef01234', 'jpg', 'image/jpeg', 64100,
    'Samanya/Sede Central Bogotá/Residentes/105_14321987/Documentos/e5f67890123456789abcdef0123456789abcdef0123456789abcdef01234.jpg',
    'Samanya/Sede Central Bogotá/Residentes/105_14321987/Documentos/e5f67890123456789abcdef0123456789abcdef0123456789abcdef01234.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    106, 1, 7, NULL, NULL,
    'foto_carmen_castro.jpg', 'f67890123456789abcdef0123456789abcdef0123456789abcdef012345.jpg',
    'f67890123456789abcdef0123456789abcdef0123456789abcdef012345', 'jpg', 'image/jpeg', 56300,
    'Samanya/Sede Central Bogotá/Residentes/106_28765432/Documentos/f67890123456789abcdef0123456789abcdef0123456789abcdef012345.jpg',
    'Samanya/Sede Central Bogotá/Residentes/106_28765432/Documentos/f67890123456789abcdef0123456789abcdef0123456789abcdef012345.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    107, 2, 7, NULL, NULL,
    'foto_roberto_morales.jpg', '7890123456789abcdef0123456789abcdef0123456789abcdef0123456.jpg',
    '7890123456789abcdef0123456789abcdef0123456789abcdef0123456', 'jpg', 'image/jpeg', 67400,
    'Samanya/Sede Campestre La Calera/Residentes/107_19876543/Documentos/7890123456789abcdef0123456789abcdef0123456789abcdef0123456.jpg',
    'Samanya/Sede Campestre La Calera/Residentes/107_19876543/Documentos/7890123456789abcdef0123456789abcdef0123456789abcdef0123456.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    108, 2, 7, NULL, NULL,
    'foto_teresa_sanchez.jpg', '890123456789abcdef0123456789abcdef0123456789abcdef01234567.jpg',
    '890123456789abcdef0123456789abcdef0123456789abcdef01234567', 'jpg', 'image/jpeg', 62900,
    'Samanya/Sede Campestre La Calera/Residentes/108_23456123/Documentos/890123456789abcdef0123456789abcdef0123456789abcdef01234567.jpg',
    'Samanya/Sede Campestre La Calera/Residentes/108_23456123/Documentos/890123456789abcdef0123456789abcdef0123456789abcdef01234567.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    109, 2, 7, NULL, NULL,
    'foto_guillermo_navarro.jpg', '90123456789abcdef0123456789abcdef0123456789abcdef012345678.jpg',
    '90123456789abcdef0123456789abcdef0123456789abcdef012345678', 'jpg', 'image/jpeg', 58100,
    'Samanya/Sede Campestre La Calera/Residentes/109_16543210/Documentos/90123456789abcdef0123456789abcdef0123456789abcdef012345678.jpg',
    'Samanya/Sede Campestre La Calera/Residentes/109_16543210/Documentos/90123456789abcdef0123456789abcdef0123456789abcdef012345678.jpg',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    110, 2, 7, NULL, NULL,
    'foto_blanca_castillo.jpg', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789.jpg',
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789', 'jpg', 'image/jpeg', 65400,
    'Samanya/Sede Campestre La Calera/Residentes/110_31234567/Documentos/0123456789abcdef0123456789abcdef0123456789abcdef0123456789.jpg',
    'Samanya/Sede Campestre La Calera/Residentes/110_31234567/Documentos/0123456789abcdef0123456789abcdef0123456789abcdef0123456789.jpg',
    1

);

-- Consentimientos y Firmas Digitales
INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    201, 1, 1, NULL, NULL,
    'CONS-2024-001-Plan-Fisioterapia.pdf', 'e4b1a2c3d5f67890123456789abcdef0123456789abcdef0123456789abcdef1.pdf',
    'e4b1a2c3d5f67890123456789abcdef0123456789abcdef0123456789abcdef1', 'pdf', 'application/pdf', 250880,
    'Samanya/Sede Central Bogotá/Residentes/201_19234567/Documentos/e4b1a2c3d5f67890123456789abcdef0123456789abcdef0123456789abcdef1.pdf',
    'Samanya/Sede Central Bogotá/Residentes/201_19234567/Documentos/e4b1a2c3d5f67890123456789abcdef0123456789abcdef0123456789abcdef1.pdf',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    202, 1, 8, NULL, NULL,
    'firma_lucia_delgado_2024.png', '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069.png',
    '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 'png', 'image/png', 32400,
    'Samanya/Sede Central Bogotá/Residentes/202_19234567/Documentos/7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069.png',
    'Samanya/Sede Central Bogotá/Residentes/202_19234567/Documentos/7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069.png',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    203, 1, 1, NULL, NULL,
    'CONS-2024-002-Salida-Familiar.pdf', 'f5c2b3a4d6e7890123456789abcdef0123456789abcdef0123456789abcdef2.pdf',
    'f5c2b3a4d6e7890123456789abcdef0123456789abcdef0123456789abcdef2', 'pdf', 'application/pdf', 184320,
    'Samanya/Sede Central Bogotá/Residentes/203_24567890/Documentos/f5c2b3a4d6e7890123456789abcdef0123456789abcdef0123456789abcdef2.pdf',
    'Samanya/Sede Central Bogotá/Residentes/203_24567890/Documentos/f5c2b3a4d6e7890123456789abcdef0123456789abcdef0123456789abcdef2.pdf',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    204, 1, 8, NULL, NULL,
    'firma_javier_perez_2024.png', '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a.png',
    '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a', 'png', 'image/png', 28900,
    'Samanya/Sede Central Bogotá/Residentes/204_24567890/Documentos/4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a.png',
    'Samanya/Sede Central Bogotá/Residentes/204_24567890/Documentos/4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a.png',
    1

);

INSERT INTO SMY_ARCHIVOS (
    ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
    NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
    TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO, ID_ESTADO_ARCHIVO
) VALUES (
    205, 1, 1, NULL, NULL,
    'CONS-2024-003-Odontologia-Geriatrica.pdf', 'a6d3c4b5e7f8890123456789abcdef0123456789abcdef0123456789abcdef3.pdf',
    'a6d3c4b5e7f8890123456789abcdef0123456789abcdef0123456789abcdef3', 'pdf', 'application/pdf', 317440,
    'Samanya/Sede Central Bogotá/Residentes/205_17890123/Documentos/a6d3c4b5e7f8890123456789abcdef0123456789abcdef0123456789abcdef3.pdf',
    'Samanya/Sede Central Bogotá/Residentes/205_17890123/Documentos/a6d3c4b5e7f8890123456789abcdef0123456789abcdef0123456789abcdef3.pdf',
    1

);

COMMIT;

-- =============================================================================
-- 1. USUARIOS DEL SISTEMA (SMY_USUARIOS)
-- Total: 19 usuarios (1 Admin, 4 Empleados/Cuidadores, 14 Acudientes/Familiares)
-- =============================================================================
PROMPT 1. Insertando Usuarios del Sistema (SMY_USUARIOS)...

-- 1.1 Administrador General
INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    1, 1, 1, 'admin', 'admin@samanya.com.co', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Administrador Principal Samanya', '+57 310 123 4567', 1, 3, 1
);

-- 1.2 Empleados / Personal Asistencial (Cuidadores)
INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    2, 2, 2, 'mrodriguez', 'mrodriguez@samanya.com.co', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Martha Cecilia Rodríguez Peña', '+57 311 234 5678', 2, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    3, 2, 2, 'cramirez', 'cramirez@samanya.com.co', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Carlos Eduardo Ramírez Soto', '+57 312 345 6789', 3, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    4, 2, 2, 'lmartinez', 'lmartinez@samanya.com.co', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Laura Marcela Martínez Ruiz', '+57 313 456 7890', 4, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    5, 2, 2, 'agomez', 'agomez@samanya.com.co', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Andrés Felipe Gómez Duarte', '+57 314 567 8901', 5, 3, 1
);

-- 1.3 Familiares / Acudientes (14 usuarios)
INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    6, 3, 3, 'ldelgado', 'lucia.delgado@gmail.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Lucía Delgado Silva', '+57 315 678 9012', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    7, 3, 3, 'cdelgado', 'carlos.delgado@outlook.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Carlos Alberto Delgado Silva', '+57 316 789 0123', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    8, 3, 3, 'jperez', 'javier.perez@hotmail.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Javier Pérez Gómez', '+57 317 890 1234', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    9, 3, 3, 'bperez', 'beatriz.perez@gmail.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Beatriz Pérez Gómez', '+57 318 901 2345', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    10, 3, 3, 'mlopez', 'mariana.lopez@yahoo.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Mariana López Vega', '+57 319 012 3456', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    11, 3, 3, 'rhernandez', 'roberto.hernandez@gmail.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Roberto Hernández Rivas', '+57 320 123 4567', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    12, 3, 3, 'atorres', 'ana.torres@gmail.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Ana María Torres Ortiz', '+57 321 234 5678', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    13, 3, 3, 'jcastro', 'jorge.castro@empresa.com.co', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Jorge Enrique Castro Pardo', '+57 322 345 6789', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    14, 3, 3, 'cmorales', 'claudia.morales@gmail.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Claudia Morales Beltrán', '+57 323 456 7890', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    15, 3, 3, 'fsanchez', 'fernando.sanchez@outlook.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Fernando Sánchez Meza', '+57 324 567 8901', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    16, 3, 3, 'pnavarro', 'patricia.navarro@gmail.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Patricia Navarro Lozano', '+57 325 678 9012', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    17, 3, 3, 'gcastillo', 'gustavo.castillo@yahoo.es', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Gustavo Castillo Prieto', '+57 326 789 0123', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    18, 3, 3, 'sdelgado', 'sofia.delgado@gmail.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Sofía Delgado Silva', '+57 327 890 1234', NULL, 3, 1
);

INSERT INTO SMY_USUARIOS (
    ID, ID_ROL, ID_TIPO_USUARIO, USERNAME, EMAIL, PASSWORD_HASH,
    NOMBRE_COMPLETO, TELEFONO, ID_ARCHIVO_FOTO_PERFIL, ID_CANAL_NOTIF_PREF, ID_ESTADO_USUARIO
) VALUES (
    19, 3, 3, 'vperez', 'valentina.perez@hotmail.com', '$2a$10$lPpRZAu19I3zuGnOiKZzZ.WapQvuJf1R5vsm8NZp7Ql5YaYVDjzSO',
    'Valentina Pérez Gómez', '+57 328 901 2345', NULL, 3, 1
);

COMMIT;

-- =============================================================================
-- 1.1 GOBERNANZA: DUEÑOS DE ORGANIZACIÓN (SMY_ORGANIZACION_DUENOS)
-- =============================================================================
PROMPT 1.1 Insertando Dueños de Organización (SMY_ORGANIZACION_DUENOS)...

-- Admin es dueño al 100% y representante legal de ORG-SAMANYA (Org 1)
INSERT INTO SMY_ORGANIZACION_DUENOS (
    ID, ID_ORGANIZACION, ID_USUARIO, PORCENTAJE_PARTICIPACION, ES_REPRESENTANTE_LEGAL, ESTADO_ACTIVO
) VALUES (
    1, 1, 1, 100.00, 'S', 'S'
);

-- Admin también es socio inversionista (40%) en ORG-VITALIA (Org 2)
INSERT INTO SMY_ORGANIZACION_DUENOS (
    ID, ID_ORGANIZACION, ID_USUARIO, PORCENTAJE_PARTICIPACION, ES_REPRESENTANTE_LEGAL, ESTADO_ACTIVO
) VALUES (
    2, 2, 1, 40.00, 'N', 'S'
);

-- Jorge Castro (Usuario 13) es socio mayoritario (60%) y representante legal de ORG-VITALIA (Org 2)
INSERT INTO SMY_ORGANIZACION_DUENOS (
    ID, ID_ORGANIZACION, ID_USUARIO, PORCENTAJE_PARTICIPACION, ES_REPRESENTANTE_LEGAL, ESTADO_ACTIVO
) VALUES (
    3, 2, 13, 60.00, 'S', 'S'
);

-- =============================================================================
-- 1.2 MATRIZ MULTI-SEDE: ASIGNACIÓN DE USUARIOS A CENTROS (SMY_CENTRO_USUARIOS)
-- =============================================================================
PROMPT 1.2 Insertando Asignación de Usuarios a Sedes (SMY_CENTRO_USUARIOS)...

-- Administrador General con autorización en múltiples sedes geriátricas
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (1, 1, 1, 1, 'S', 'S');

INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (2, 2, 1, 1, 'N', 'S');

INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (3, 3, 1, 1, 'N', 'S');

-- Martha Rodríguez (Enfermera Jefe) en Sede Central (principal) y apoyo en Sede Campestre (Multi-centro)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (4, 1, 2, 2, 'S', 'S');

INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (5, 2, 2, 2, 'N', 'S');

-- Carlos Ramírez adscrito únicamente a Sede Central (Mono-centro -> Acceso directo)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (6, 1, 3, 2, 'S', 'S');

-- Laura Martínez adscrita a Sede Campestre La Calera
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (7, 2, 4, 2, 'S', 'S');

-- Andrés Gómez adscrito a Sede Central
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (8, 1, 5, 2, 'S', 'S');

-- Familiares y Acudientes asignados a la(s) sede(s) donde residen sus familiares
-- Lucía Delgado (Residente 1 en Sede Central)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (9, 1, 6, 3, 'S', 'S');

-- Carlos Delgado (Residente 1 en Sede Central)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (10, 1, 7, 3, 'S', 'S');

-- Javier Pérez (Residente 2 en Sede Central)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (11, 1, 8, 3, 'S', 'S');

-- Beatriz Pérez (Residente 2 en Sede Central)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (12, 1, 9, 3, 'S', 'S');

-- Mariana López (Residente 3 en Sede Central)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (13, 1, 10, 3, 'S', 'S');

-- Roberto Hernández (Residente 4 en Sede Central)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (14, 1, 11, 3, 'S', 'S');

-- Ana María Torres (Residente 5 en Sede Central)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (15, 1, 12, 3, 'S', 'S');

-- Jorge Castro (Residente 6 en Sede Campestre La Calera)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (16, 2, 13, 3, 'S', 'S');

-- Claudia Morales (Residente 7 en Sede Campestre La Calera)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (17, 2, 14, 3, 'S', 'S');

-- Fernando Sánchez (Residente 8 en Sede Campestre La Calera)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (18, 2, 15, 3, 'S', 'S');

-- Patricia Navarro (Residente 9 en Sede Campestre La Calera)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (19, 2, 16, 3, 'S', 'S');

-- Gustavo Castillo (Residente 10 en Sede Campestre La Calera)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (20, 2, 17, 3, 'S', 'S');

-- Sofía Delgado (Familiar con presencia en Sede Central y Campestre -> Multi-centro)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (21, 1, 18, 3, 'S', 'S');

INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (22, 2, 18, 3, 'N', 'S');

-- Valentina Pérez (Residente 2 en Sede Central)
INSERT INTO SMY_CENTRO_USUARIOS (ID, ID_CENTRO, ID_USUARIO, ID_ROL, ES_SEDE_PRINCIPAL, ESTADO_ACTIVO)
VALUES (23, 1, 19, 3, 'S', 'S');

COMMIT;

-- =============================================================================
-- 2. EMPLEADOS DEL CENTRO GERIÁTRICO (SMY_EMPLEADOS)
-- Total: 4 Empleados asistenciales
-- =============================================================================
PROMPT 2. Insertando Empleados (SMY_EMPLEADOS)...

INSERT INTO SMY_EMPLEADOS (
    ID, ID_CENTRO, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    ID_CARGO_EMPLEADO, ID_AREA_EMPLEADO, UNIDAD_ASIGNADA, TELEFONO, EMAIL_CORP,
    FECHA_CONTRATACION, ID_ESTADO_EMPLEADO
) VALUES (
    1, 1, 2, 1, '52345678', 'Martha Cecilia', 'Rodríguez Peña',
    1, 1, 'Enfermería General Piso 1', '+57 311 234 5678', 'mrodriguez@samanya.com.co',
    TO_DATE('2023-01-15', 'YYYY-MM-DD'), 1
);

INSERT INTO SMY_EMPLEADOS (
    ID, ID_CENTRO, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    ID_CARGO_EMPLEADO, ID_AREA_EMPLEADO, UNIDAD_ASIGNADA, TELEFONO, EMAIL_CORP,
    FECHA_CONTRATACION, ID_ESTADO_EMPLEADO
) VALUES (
    2, 1, 3, 1, '80123456', 'Carlos Eduardo', 'Ramírez Soto',
    3, 2, 'Ala Norte - Habitaciones 101-105', '+57 312 345 6789', 'cramirez@samanya.com.co',
    TO_DATE('2023-03-01', 'YYYY-MM-DD'), 1
);

INSERT INTO SMY_EMPLEADOS (
    ID, ID_CENTRO, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    ID_CARGO_EMPLEADO, ID_AREA_EMPLEADO, UNIDAD_ASIGNADA, TELEFONO, EMAIL_CORP,
    FECHA_CONTRATACION, ID_ESTADO_EMPLEADO
) VALUES (
    3, 2, 4, 1, '1018234567', 'Laura Marcela', 'Martínez Ruiz',
    3, 2, 'Ala Sur - Habitaciones 106-110', '+57 313 456 7890', 'lmartinez@samanya.com.co',
    TO_DATE('2023-06-10', 'YYYY-MM-DD'), 1
);

INSERT INTO SMY_EMPLEADOS (
    ID, ID_CENTRO, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    ID_CARGO_EMPLEADO, ID_AREA_EMPLEADO, UNIDAD_ASIGNADA, TELEFONO, EMAIL_CORP,
    FECHA_CONTRATACION, ID_ESTADO_EMPLEADO
) VALUES (
    4, 1, 5, 1, '1020456789', 'Andrés Felipe', 'Gómez Duarte',
    2, 1, 'Atención Nocturna y Cuidados Críticos', '+57 314 567 8901', 'agomez@samanya.com.co',
    TO_DATE('2023-09-01', 'YYYY-MM-DD'), 1
);

COMMIT;

-- =============================================================================
-- 3. RESIDENTES DEL CENTRO GERIÁTRICO (SMY_RESIDENTES)
-- Total: 10 Residentes con información clínica, habitaciones y alertas
-- =============================================================================
PROMPT 3. Insertando Residentes (SMY_RESIDENTES)...

INSERT INTO SMY_RESIDENTES (
    ID, ID_CENTRO, CODIGO_EXPEDIENTE, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    FECHA_NACIMIENTO, ID_GENERO, ID_ARCHIVO_FOTO_PERFIL, HABITACION, CAMA, EPS, PLAN_COMPLEMENTARIO,
    TIPO_SANGRE, ID_NIVEL_MOVILIDAD, ID_TIPO_DIETA, ALERTAS_CLINICAS, ID_ESTADO_RESIDENTE,
    CODIGO_QR_TOKEN, FECHA_INGRESO
) VALUES (
    1, 1, 'EXP-2024-001', 1, '19234567', 'Álvaro', 'Delgado Mora',
    TO_DATE('1942-05-14', 'YYYY-MM-DD'), 2, 101,
    '101', 'A', 'Sanitas EPS', 'Colsanitas Integral', 'O+',
    2, 4, 'Hipertensión arterial severa. Alergia a Penicilina. Riesgo de caídas.', 1,
    'QR-RES-001-ALVARO-DELGADO-2024', TO_DATE('2024-01-10', 'YYYY-MM-DD')
);

INSERT INTO SMY_RESIDENTES (
    ID, ID_CENTRO, CODIGO_EXPEDIENTE, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    FECHA_NACIMIENTO, ID_GENERO, ID_ARCHIVO_FOTO_PERFIL, HABITACION, CAMA, EPS, PLAN_COMPLEMENTARIO,
    TIPO_SANGRE, ID_NIVEL_MOVILIDAD, ID_TIPO_DIETA, ALERTAS_CLINICAS, ID_ESTADO_RESIDENTE,
    CODIGO_QR_TOKEN, FECHA_INGRESO
) VALUES (
    2, 1, 'EXP-2024-002', 1, '24567890', 'Elena', 'Pérez de Gómez',
    TO_DATE('1939-11-20', 'YYYY-MM-DD'), 1, 102,
    '101', 'B', 'Sura EPS', 'Sura Salud Global', 'A+',
    1, 3, 'Diabetes Mellitus Tipo 2. Control estricto de glucosa capilar matutina.', 1,
    'QR-RES-002-ELENA-PEREZ-2024', TO_DATE('2024-01-15', 'YYYY-MM-DD')
);

INSERT INTO SMY_RESIDENTES (
    ID, ID_CENTRO, CODIGO_EXPEDIENTE, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    FECHA_NACIMIENTO, ID_GENERO, ID_ARCHIVO_FOTO_PERFIL, HABITACION, CAMA, EPS, PLAN_COMPLEMENTARIO,
    TIPO_SANGRE, ID_NIVEL_MOVILIDAD, ID_TIPO_DIETA, ALERTAS_CLINICAS, ID_ESTADO_RESIDENTE,
    CODIGO_QR_TOKEN, FECHA_INGRESO
) VALUES (
    3, 1, 'EXP-2024-003', 1, '17890123', 'Fernando', 'López Castro',
    TO_DATE('1946-08-03', 'YYYY-MM-DD'), 2, 103,
    '102', 'A', 'Compensar EPS', 'Compensar Preferencial', 'B+',
    3, 1, 'Secuelas de ACV isquémico izquierdo. Hemiparesia facio-braquial. En silla de ruedas.', 1,
    'QR-RES-003-FERNANDO-LOPEZ-2024', TO_DATE('2024-02-01', 'YYYY-MM-DD')
);

INSERT INTO SMY_RESIDENTES (
    ID, ID_CENTRO, CODIGO_EXPEDIENTE, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    FECHA_NACIMIENTO, ID_GENERO, ID_ARCHIVO_FOTO_PERFIL, HABITACION, CAMA, EPS, PLAN_COMPLEMENTARIO,
    TIPO_SANGRE, ID_NIVEL_MOVILIDAD, ID_TIPO_DIETA, ALERTAS_CLINICAS, ID_ESTADO_RESIDENTE,
    CODIGO_QR_TOKEN, FECHA_INGRESO
) VALUES (
    4, 1, 'EXP-2024-004', 1, '32456781', 'Mercedes', 'Hernández de Silva',
    TO_DATE('1944-01-25', 'YYYY-MM-DD'), 1, 104,
    '102', 'B', 'Famisanar EPS', 'Colmédica Zafiro', 'O-',
    2, 2, 'Disfagia leve a sólidos. Requiere supervisión en ingesta de alimentos.', 1,
    'QR-RES-004-MERCEDES-HERNANDEZ-2024', TO_DATE('2024-02-10', 'YYYY-MM-DD')
);

INSERT INTO SMY_RESIDENTES (
    ID, ID_CENTRO, CODIGO_EXPEDIENTE, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    FECHA_NACIMIENTO, ID_GENERO, ID_ARCHIVO_FOTO_PERFIL, HABITACION, CAMA, EPS, PLAN_COMPLEMENTARIO,
    TIPO_SANGRE, ID_NIVEL_MOVILIDAD, ID_TIPO_DIETA, ALERTAS_CLINICAS, ID_ESTADO_RESIDENTE,
    CODIGO_QR_TOKEN, FECHA_INGRESO
) VALUES (
    5, 1, 'EXP-2024-005', 1, '14321987', 'Gustavo', 'Torres Valderrama',
    TO_DATE('1938-09-18', 'YYYY-MM-DD'), 2, 105,
    '103', 'A', 'Nueva EPS', 'Particular', 'AB+',
    1, 1, 'Deterioro cognitivo leve (GDS 3). Marcapasos bicameral implantado en 2021.', 1,
    'QR-RES-005-GUSTAVO-TORRES-2024', TO_DATE('2024-02-15', 'YYYY-MM-DD')
);

INSERT INTO SMY_RESIDENTES (
    ID, ID_CENTRO, CODIGO_EXPEDIENTE, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    FECHA_NACIMIENTO, ID_GENERO, ID_ARCHIVO_FOTO_PERFIL, HABITACION, CAMA, EPS, PLAN_COMPLEMENTARIO,
    TIPO_SANGRE, ID_NIVEL_MOVILIDAD, ID_TIPO_DIETA, ALERTAS_CLINICAS, ID_ESTADO_RESIDENTE,
    CODIGO_QR_TOKEN, FECHA_INGRESO
) VALUES (
    6, 1, 'EXP-2024-006', 1, '28765432', 'Carmen Rosa', 'Castro Pardo',
    TO_DATE('1947-12-05', 'YYYY-MM-DD'), 1, 106,
    '103', 'B', 'Sanitas EPS', 'Medisanitas', 'A-',
    4, 5, 'Enfermedad de Parkinson avanzada (Hoehn & Yahr 4). Encamada. Alergia a Sulfas.', 1,
    'QR-RES-006-CARMEN-CASTRO-2024', TO_DATE('2024-03-01', 'YYYY-MM-DD')
);

INSERT INTO SMY_RESIDENTES (
    ID, ID_CENTRO, CODIGO_EXPEDIENTE, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    FECHA_NACIMIENTO, ID_GENERO, ID_ARCHIVO_FOTO_PERFIL, HABITACION, CAMA, EPS, PLAN_COMPLEMENTARIO,
    TIPO_SANGRE, ID_NIVEL_MOVILIDAD, ID_TIPO_DIETA, ALERTAS_CLINICAS, ID_ESTADO_RESIDENTE,
    CODIGO_QR_TOKEN, FECHA_INGRESO
) VALUES (
    7, 2, 'EXP-2024-007', 1, '19876543', 'Roberto', 'Morales Duque',
    TO_DATE('1943-07-11', 'YYYY-MM-DD'), 2, 107,
    '104', 'A', 'Sura EPS', 'Sura Clásico', 'O+',
    2, 4, 'Insuficiencia cardíaca congestiva controlada NYHA II. Control estricto de líquidos.', 1,
    'QR-RES-007-ROBERTO-MORALES-2024', TO_DATE('2024-03-10', 'YYYY-MM-DD')
);

INSERT INTO SMY_RESIDENTES (
    ID, ID_CENTRO, CODIGO_EXPEDIENTE, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    FECHA_NACIMIENTO, ID_GENERO, ID_ARCHIVO_FOTO_PERFIL, HABITACION, CAMA, EPS, PLAN_COMPLEMENTARIO,
    TIPO_SANGRE, ID_NIVEL_MOVILIDAD, ID_TIPO_DIETA, ALERTAS_CLINICAS, ID_ESTADO_RESIDENTE,
    CODIGO_QR_TOKEN, FECHA_INGRESO
) VALUES (
    8, 2, 'EXP-2024-008', 1, '23456123', 'Teresa de Jesús', 'Sánchez',
    TO_DATE('1940-04-30', 'YYYY-MM-DD'), 1, 108,
    '104', 'B', 'Compensar EPS', 'Compensar Básico', 'B-',
    1, 1, 'Osteoporosis severa con antecedente de fractura de Colles derecha en 2022.', 1,
    'QR-RES-008-TERESA-SANCHEZ-2024', TO_DATE('2024-03-20', 'YYYY-MM-DD')
);

INSERT INTO SMY_RESIDENTES (
    ID, ID_CENTRO, CODIGO_EXPEDIENTE, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    FECHA_NACIMIENTO, ID_GENERO, ID_ARCHIVO_FOTO_PERFIL, HABITACION, CAMA, EPS, PLAN_COMPLEMENTARIO,
    TIPO_SANGRE, ID_NIVEL_MOVILIDAD, ID_TIPO_DIETA, ALERTAS_CLINICAS, ID_ESTADO_RESIDENTE,
    CODIGO_QR_TOKEN, FECHA_INGRESO
) VALUES (
    9, 2, 'EXP-2024-009', 1, '16543210', 'Guillermo', 'Navarro Soler',
    TO_DATE('1945-10-15', 'YYYY-MM-DD'), 2, 109,
    '105', 'A', 'Salud Total EPS', 'Salud Total Élite', 'O+',
    2, 3, 'Diabetes con neuropatía periférica. Curación diaria pie derecho grado Wagner 1.', 1,
    'QR-RES-009-GUILLERMO-NAVARRO-2024', TO_DATE('2024-04-01', 'YYYY-MM-DD')
);

INSERT INTO SMY_RESIDENTES (
    ID, ID_CENTRO, CODIGO_EXPEDIENTE, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    FECHA_NACIMIENTO, ID_GENERO, ID_ARCHIVO_FOTO_PERFIL, HABITACION, CAMA, EPS, PLAN_COMPLEMENTARIO,
    TIPO_SANGRE, ID_NIVEL_MOVILIDAD, ID_TIPO_DIETA, ALERTAS_CLINICAS, ID_ESTADO_RESIDENTE,
    CODIGO_QR_TOKEN, FECHA_INGRESO
) VALUES (
    10, 2, 'EXP-2024-010', 1, '31234567', 'Blanca Nieves', 'Castillo',
    TO_DATE('1948-02-28', 'YYYY-MM-DD'), 1, 110,
    '105', 'B', 'Sanitas EPS', 'Colsanitas Médico', 'A+',
    3, 2, 'Artritis reumatoide seropositiva en deformidad en ráfaga cubital. Hipoacusia bilateral.', 1,
    'QR-RES-010-BLANCA-CASTILLO-2024', TO_DATE('2024-04-15', 'YYYY-MM-DD')
);

COMMIT;

-- Asociar archivos con los respectivos empleados y residentes creados
UPDATE SMY_ARCHIVOS SET ID_EMPLEADO = 1 WHERE ID = 2;
UPDATE SMY_ARCHIVOS SET ID_EMPLEADO = 2 WHERE ID = 3;
UPDATE SMY_ARCHIVOS SET ID_EMPLEADO = 3 WHERE ID = 4;
UPDATE SMY_ARCHIVOS SET ID_EMPLEADO = 4 WHERE ID = 5;

UPDATE SMY_ARCHIVOS SET ID_RESIDENTE = 1 WHERE ID IN (101, 201, 202);
UPDATE SMY_ARCHIVOS SET ID_RESIDENTE = 2 WHERE ID IN (102, 203, 204);
UPDATE SMY_ARCHIVOS SET ID_RESIDENTE = 3 WHERE ID IN (103, 205);
UPDATE SMY_ARCHIVOS SET ID_RESIDENTE = 4 WHERE ID = 104;
UPDATE SMY_ARCHIVOS SET ID_RESIDENTE = 5 WHERE ID = 105;
UPDATE SMY_ARCHIVOS SET ID_RESIDENTE = 6 WHERE ID = 106;
UPDATE SMY_ARCHIVOS SET ID_RESIDENTE = 7 WHERE ID = 107;
UPDATE SMY_ARCHIVOS SET ID_RESIDENTE = 8 WHERE ID = 108;
UPDATE SMY_ARCHIVOS SET ID_RESIDENTE = 9 WHERE ID = 109;
UPDATE SMY_ARCHIVOS SET ID_RESIDENTE = 10 WHERE ID = 110;
COMMIT;

-- =============================================================================
-- 4. HISTORIAS CLÍNICAS BASE (SMY_HISTORIAS_CLINICAS)
-- Total: 10 Historias Clínicas correspondientes a los 10 Residentes
-- =============================================================================
PROMPT 4. Insertando Historias Clínicas (SMY_HISTORIAS_CLINICAS)...

INSERT INTO SMY_HISTORIAS_CLINICAS (
    ID, ID_RESIDENTE, DIAGNOSTICOS_BASE, ANTECEDENTES_QUIRUR, ANTECEDENTES_FAM,
    ALERGIAS_MEDICAMENT, ALERGIAS_ALIMENTAR, MEDICO_TRATANTE, TELEFONO_MEDICO
) VALUES (
    1, 1, 'Hipertensión Arterial Estadio 2, Dislipidemia mixta, Hiperplasia Prostática Benigna.',
    'Apendicectomía (1965), Colecistectomía laparoscópica (2010).', 'Padre hipertenso, madre con DM2.',
    'Penicilinas y derivados betalactámicos.', 'Ninguna conocida.', 'Dr. Camilo Echeverri (Geriatra)', '+57 310 987 6543'
);

INSERT INTO SMY_HISTORIAS_CLINICAS (
    ID, ID_RESIDENTE, DIAGNOSTICOS_BASE, ANTECEDENTES_QUIRUR, ANTECEDENTES_FAM,
    ALERGIAS_MEDICAMENT, ALERGIAS_ALIMENTAR, MEDICO_TRATANTE, TELEFONO_MEDICO
) VALUES (
    2, 2, 'Diabetes Mellitus no insulinodependiente tipo 2, Hipotiroidismo primario tratado, Gonartrosis bilateral.',
    'Histerectomía total abdominal (1998), Reemplazo articular rodilla derecha (2018).', 'Hermanos con diabetes y cardiopatía isquémica.',
    'AINEs (Ácido acetilsalicílico, Ibuprofeno - produce epigastralgia severa).', 'Mariscos.', 'Dra. Patricia Salamanca (Internista)', '+57 312 876 5432'
);

INSERT INTO SMY_HISTORIAS_CLINICAS (
    ID, ID_RESIDENTE, DIAGNOSTICOS_BASE, ANTECEDENTES_QUIRUR, ANTECEDENTES_FAM,
    ALERGIAS_MEDICAMENT, ALERGIAS_ALIMENTAR, MEDICO_TRATANTE, TELEFONO_MEDICO
) VALUES (
    3, 3, 'Secuelas de Accidente Cerebrovascular Isquémico en territorio de ACM izquierda (2020), Afasia mixta leve.',
    'Endarterectomía carotídea derecha (2021).', 'Madre fallecida por ACV a los 72 años.',
    'Ninguna conocida.', 'Lactosa (intolerancia digestiva moderada).', 'Dr. Felipe Caicedo (Neurólogo)', '+57 315 765 4321'
);

INSERT INTO SMY_HISTORIAS_CLINICAS (
    ID, ID_RESIDENTE, DIAGNOSTICOS_BASE, ANTECEDENTES_QUIRUR, ANTECEDENTES_FAM,
    ALERGIAS_MEDICAMENT, ALERGIAS_ALIMENTAR, MEDICO_TRATANTE, TELEFONO_MEDICO
) VALUES (
    4, 4, 'Enfermedad por Reflujo Gastroesofágico severa, Disfagia orofaríngea leve a sólidos, Osteoartritis de columna.',
    'Cirugía de cataratas bilateral (2019).', 'Madre con osteoporosis severa.',
    'Dipirona / Metamizol sódico.', 'Nueces y frutos secos.', 'Dra. Claudia Vengoechea (Gastroenteróloga)', '+57 318 654 3210'
);

INSERT INTO SMY_HISTORIAS_CLINICAS (
    ID, ID_RESIDENTE, DIAGNOSTICOS_BASE, ANTECEDENTES_QUIRUR, ANTECEDENTES_FAM,
    ALERGIAS_MEDICAMENT, ALERGIAS_ALIMENTAR, MEDICO_TRATANTE, TELEFONO_MEDICO
) VALUES (
    5, 5, 'Trastorno Neurocognitivo Menor tipo Alzheimer (CDR 1), Bloqueo AV completo con marcapasos.',
    'Implante de marcapasos bicameral definitivo (2021).', 'Padre con demencia senil no especificada.',
    'Sulfamidas.', 'Fresas.', 'Dr. Jorge Hernán Ospina (Cardiólogo)', '+57 311 543 2109'
);

INSERT INTO SMY_HISTORIAS_CLINICAS (
    ID, ID_RESIDENTE, DIAGNOSTICOS_BASE, ANTECEDENTES_QUIRUR, ANTECEDENTES_FAM,
    ALERGIAS_MEDICAMENT, ALERGIAS_ALIMENTAR, MEDICO_TRATANTE, TELEFONO_MEDICO
) VALUES (
    6, 6, 'Enfermedad de Parkinson Idiopática estadio IV, Depresión secundaria, Constipación crónica severa.',
    'Fijación interna de cadera izquierda por fractura transtrocantérica (2022).', 'Sin antecedentes neurológicos familiares relevantes.',
    'Sulfametoxazol / Trimetoprim.', 'Pescado blanco.', 'Dr. Ricardo Moncada (Neurólogo)', '+57 314 432 1098'
);

INSERT INTO SMY_HISTORIAS_CLINICAS (
    ID, ID_RESIDENTE, DIAGNOSTICOS_BASE, ANTECEDENTES_QUIRUR, ANTECEDENTES_FAM,
    ALERGIAS_MEDICAMENT, ALERGIAS_ALIMENTAR, MEDICO_TRATANTE, TELEFONO_MEDICO
) VALUES (
    7, 7, 'Insuficiencia Cardíaca Congestiva con FEVI reducida (38%), Fibrilación Auricular paroxística anticoagulada.',
    'Angioplastia coronaria con colocación de stent medicado en DA (2017).', 'Padre fallecido por infarto agudo de miocardio a los 60 años.',
    'Tramadol (náuseas y vómito incoercible).', 'Ninguna.', 'Dr. Gabriel Santamaría (Cardiólogo)', '+57 317 321 0987'
);

INSERT INTO SMY_HISTORIAS_CLINICAS (
    ID, ID_RESIDENTE, DIAGNOSTICOS_BASE, ANTECEDENTES_QUIRUR, ANTECEDENTES_FAM,
    ALERGIAS_MEDICAMENT, ALERGIAS_ALIMENTAR, MEDICO_TRATANTE, TELEFONO_MEDICO
) VALUES (
    8, 8, 'Osteoporosis posmenopáusica grave con fractura vertebral L3 aplastada, Hipovitaminosis D corregida.',
    'Reducción abierta fractura radio distal derecho (2022).', 'Madre con joroba de viuda y fractura de cadera.',
    'Ciprofloxacino.', 'Gluten (sensibilidad no celíaca).', 'Dra. María Jimena Hurtado (Reumatóloga)', '+57 316 210 9876'
);

INSERT INTO SMY_HISTORIAS_CLINICAS (
    ID, ID_RESIDENTE, DIAGNOSTICOS_BASE, ANTECEDENTES_QUIRUR, ANTECEDENTES_FAM,
    ALERGIAS_MEDICAMENT, ALERGIAS_ALIMENTAR, MEDICO_TRATANTE, TELEFONO_MEDICO
) VALUES (
    9, 9, 'Diabetes Mellitus Tipo 2 de larga evolución, Neuropatía y Arteriopatía periférica con lesión en talón derecho.',
    'Revascularización endovascular miembro inferior derecho (2023).', 'Madre amputada supracondílea por pie diabético.',
    'Eritromicina.', 'Huevo.', 'Dr. Sergio Barreto (Cirujano Vascular)', '+57 319 109 8765'
);

INSERT INTO SMY_HISTORIAS_CLINICAS (
    ID, ID_RESIDENTE, DIAGNOSTICOS_BASE, ANTECEDENTES_QUIRUR, ANTECEDENTES_FAM,
    ALERGIAS_MEDICAMENT, ALERGIAS_ALIMENTAR, MEDICO_TRATANTE, TELEFONO_MEDICO
) VALUES (
    10, 10, 'Artritis Reumatoide activa seropositiva, Hipoacusia sensorineural bilateral con audífono, Síndrome de Sjögren.',
    'Sinovectomía quirúrgica muñeca derecha (2015).', 'Hermana con lupus eritematoso sistémico.',
    'Metotrexato oral (toxicidad hepática previa, actualmente en biológico).', 'Soja y derivados.', 'Dra. Natalia Quintero (Reumatóloga)', '+57 313 098 7654'
);

COMMIT;

-- =============================================================================
-- 5. ACUDIENTES / FAMILIARES (SMY_ACUDIENTES)
-- Total: 14 Acudientes vinculados a sus respectivos usuarios
-- =============================================================================
PROMPT 5. Insertando Acudientes (SMY_ACUDIENTES)...

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    1, 6, 1, '53123456', 'Lucía', 'Delgado Silva',
    '+57 315 678 9012', '+57 601 234 5678', 'lucia.delgado@gmail.com',
    'Calle 127 # 15-32 Apto 502', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    2, 7, 1, '80234567', 'Carlos Alberto', 'Delgado Silva',
    '+57 316 789 0123', '+57 601 345 6789', 'carlos.delgado@outlook.com',
    'Carrera 7 # 116-50 Torre B Of. 704', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    3, 8, 1, '79345678', 'Javier', 'Pérez Gómez',
    '+57 317 890 1234', '+57 601 456 7890', 'javier.perez@hotmail.com',
    'Calle 140 # 11-45', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    4, 9, 1, '52456789', 'Beatriz', 'Pérez Gómez',
    '+57 318 901 2345', '+57 601 567 8901', 'beatriz.perez@gmail.com',
    'Carrera 19 # 106-25 Casa 4', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    5, 10, 1, '1014567890', 'Mariana', 'López Vega',
    '+57 319 012 3456', '+57 601 678 9012', 'mariana.lopez@yahoo.com',
    'Calle 170 # 8-20 Conjunto Rosales', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    6, 11, 1, '80567890', 'Roberto', 'Hernández Rivas',
    '+57 320 123 4567', '+57 601 789 0123', 'roberto.hernandez@gmail.com',
    'Diagonal 108A # 2-30', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    7, 12, 1, '53678901', 'Ana María', 'Torres Ortiz',
    '+57 321 234 5678', '+57 601 890 1234', 'ana.torres@gmail.com',
    'Transversal 23 # 97-40', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    8, 13, 1, '79789012', 'Jorge Enrique', 'Castro Pardo',
    '+57 322 345 6789', '+57 601 901 2345', 'jorge.castro@empresa.com.co',
    'Carrera 15 # 85-30 Piso 3', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    9, 14, 1, '52890123', 'Claudia', 'Morales Beltrán',
    '+57 323 456 7890', '+57 601 012 3456', 'claudia.morales@gmail.com',
    'Calle 134 # 9-51 Interior 2', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    10, 15, 1, '80901234', 'Fernando', 'Sánchez Meza',
    '+57 324 567 8901', '+57 601 123 4567', 'fernando.sanchez@outlook.com',
    'Calle 100 # 19A-20', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    11, 16, 1, '53012345', 'Patricia', 'Navarro Lozano',
    '+57 325 678 9012', '+57 601 234 5678', 'patricia.navarro@gmail.com',
    'Carrera 58 # 137-10 Casa 12', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    12, 17, 1, '79123450', 'Gustavo', 'Castillo Prieto',
    '+57 326 789 0123', '+57 601 345 6789', 'gustavo.castillo@yahoo.es',
    'Calle 153 # 50-25', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    13, 18, 1, '1022334455', 'Sofía', 'Delgado Silva',
    '+57 327 890 1234', '+57 601 456 7890', 'sofia.delgado@gmail.com',
    'Calle 127 # 15-32 Apto 401', 'Bogotá', 3
);

INSERT INTO SMY_ACUDIENTES (
    ID, ID_USUARIO, ID_TIPO_IDENTIFICACION, IDENTIFICACION, NOMBRES, APELLIDOS,
    TELEFONO_PRINCIPAL, TELEFONO_SECUNDARIO, EMAIL, DIRECCION, CIUDAD, ID_CANAL_NOTIF_PREF
) VALUES (
    14, 19, 1, '1033445566', 'Valentina', 'Pérez Gómez',
    '+57 328 901 2345', '+57 601 567 8901', 'valentina.perez@hotmail.com',
    'Calle 140 # 11-45 Interior 1', 'Bogotá', 3
);

COMMIT;

-- =============================================================================
-- 6. VÍNCULO RESIDENTE - ACUDIENTE (SMY_RESIDENTE_ACUDIENTE)
-- Cumple la regla: Al menos 2 residentes tienen 2 o más familiares vinculados
--  * Residente 1: Lucía Delgado (Hija), Carlos Delgado (Hijo), Sofía Delgado (Sobrino/a) -> 3 familiares
--  * Residente 2: Javier Pérez (Hijo), Beatriz Pérez (Hija), Valentina Pérez (Sobrino/a) -> 3 familiares
--  * Residentes 3 al 10: Tienen sus respectivos acudientes principales.
-- Total de vínculos: 14
-- =============================================================================
PROMPT 6. Insertando Relación Residente-Acudiente (SMY_RESIDENTE_ACUDIENTE)...

-- Residente 1 (Álvaro Delgado) -> 3 Acudientes
INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    1, 1, 1, 1, 'S', 'S', 'S' -- Lucía Delgado (Hija, Principal, Pagador)
);

INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    2, 1, 2, 1, 'N', 'N', 'S' -- Carlos Delgado (Hijo, Secundario)
);

INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    3, 1, 13, 5, 'N', 'N', 'S' -- Sofía Delgado (Sobrino/a)
);

-- Residente 2 (Elena Pérez) -> 3 Acudientes
INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    4, 2, 3, 1, 'S', 'S', 'S' -- Javier Pérez (Hijo, Principal, Pagador)
);

INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    5, 2, 4, 1, 'N', 'N', 'S' -- Beatriz Pérez (Hija, Secundario)
);

INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    6, 2, 14, 5, 'N', 'N', 'S' -- Valentina Pérez (Sobrino/a)
);

-- Residente 3 (Fernando López) -> Acudiente 5
INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    7, 3, 5, 1, 'S', 'S', 'S' -- Mariana López (Hija)
);

-- Residente 4 (Mercedes Hernández) -> Acudiente 6
INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    8, 4, 6, 1, 'S', 'S', 'S' -- Roberto Hernández (Hijo)
);

-- Residente 5 (Gustavo Torres) -> Acudiente 7
INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    9, 5, 7, 1, 'S', 'S', 'S' -- Ana María Torres (Hija)
);

-- Residente 6 (Carmen Rosa Castro) -> Acudiente 8
INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    10, 6, 8, 3, 'S', 'S', 'S' -- Jorge Enrique Castro (Hermano)
);

-- Residente 7 (Roberto Morales) -> Acudiente 9
INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    11, 7, 9, 1, 'S', 'S', 'S' -- Claudia Morales (Hija)
);

-- Residente 8 (Teresa Sánchez) -> Acudiente 10
INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    12, 8, 10, 1, 'S', 'S', 'S' -- Fernando Sánchez (Hijo)
);

-- Residente 9 (Guillermo Navarro) -> Acudiente 11
INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    13, 9, 11, 1, 'S', 'S', 'S' -- Patricia Navarro (Hija)
);

-- Residente 10 (Blanca Castillo) -> Acudiente 12
INSERT INTO SMY_RESIDENTE_ACUDIENTE (
    ID, ID_RESIDENTE, ID_ACUDIENTE, ID_PARENTESCO, ES_PRINCIPAL, ES_RESPONSABLE_PAGO, AUTORIZADO_SALIDAS
) VALUES (
    14, 10, 12, 1, 'S', 'S', 'S' -- Gustavo Castillo (Hijo)
);

COMMIT;

-- =============================================================================
-- 7. TURNOS ASIGNADOS A CUIDADORES (SMY_TURNOS_ASIGNADOS)
-- Asignación para hoy y mañana cubriendo los 3 turnos
-- =============================================================================
PROMPT 7. Insertando Turnos Asignados (SMY_TURNOS_ASIGNADOS)...

INSERT INTO SMY_TURNOS_ASIGNADOS (
    ID, ID_EMPLEADO, ID_PLANTILLA_TURNO, FECHA_TURNO, AREA_ASIGNADA, OBSERVACIONES, ID_ESTADO_TURNO
) VALUES (
    1, 1, 1, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)),
    'Enfermería General', 'Supervisión de medicación y signos matutinos', 2
);

INSERT INTO SMY_TURNOS_ASIGNADOS (
    ID, ID_EMPLEADO, ID_PLANTILLA_TURNO, FECHA_TURNO, AREA_ASIGNADA, OBSERVACIONES, ID_ESTADO_TURNO
) VALUES (
    2, 2, 1, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)),
    'Ala Norte - Hab. 101 a 105', 'Asistencia en desayuno, higiene y movilidad', 2
);

INSERT INTO SMY_TURNOS_ASIGNADOS (
    ID, ID_EMPLEADO, ID_PLANTILLA_TURNO, FECHA_TURNO, AREA_ASIGNADA, OBSERVACIONES, ID_ESTADO_TURNO
) VALUES (
    3, 3, 2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)),
    'Ala Sur y Sala de Estar', 'Acompañamiento en merienda y terapias vespertinas', 1
);

INSERT INTO SMY_TURNOS_ASIGNADOS (
    ID, ID_EMPLEADO, ID_PLANTILLA_TURNO, FECHA_TURNO, AREA_ASIGNADA, OBSERVACIONES, ID_ESTADO_TURNO
) VALUES (
    4, 4, 3, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)),
    'Ronda General Nocturna', 'Monitoreo de sueño y cambios de posición', 1
);

INSERT INTO SMY_TURNOS_ASIGNADOS (
    ID, ID_EMPLEADO, ID_PLANTILLA_TURNO, FECHA_TURNO, AREA_ASIGNADA, OBSERVACIONES, ID_ESTADO_TURNO
) VALUES (
    5, 1, 1, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)) + 1,
    'Enfermería General', 'Entrega de turno y valoración médica programada', 1
);

INSERT INTO SMY_TURNOS_ASIGNADOS (
    ID, ID_EMPLEADO, ID_PLANTILLA_TURNO, FECHA_TURNO, AREA_ASIGNADA, OBSERVACIONES, ID_ESTADO_TURNO
) VALUES (
    6, 2, 1, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)) + 1,
    'Ala Norte - Hab. 101 a 105', 'Turno programado de fin de semana', 1
);

COMMIT;

-- =============================================================================
-- 8. MEDICAMENTOS PRESCRITOS (SMY_MEDICAMENTOS_PRESCRITOS)
-- Medicación clínica real y común en adultos mayores
-- =============================================================================
PROMPT 8. Insertando Medicamentos Prescritos (SMY_MEDICAMENTOS_PRESCRITOS)...

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    1, 1, 'Losartán Potásico 50mg', 'Losartán', '50 mg', '1 tableta',
    1, 12, '08:00, 20:00', 'Tomar con medio vaso de agua después del desayuno y cena.',
    'N', TO_DATE('2024-01-10', 'YYYY-MM-DD'), 60, 15, 1, 'Dr. Camilo Echeverri'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    2, 1, 'Amlodipino 5mg', 'Amlodipino Besilato', '5 mg', '1 tableta',
    1, 24, '08:00', 'Control antihipertensivo adicional por la mañana.',
    'N', TO_DATE('2024-01-10', 'YYYY-MM-DD'), 30, 10, 1, 'Dr. Camilo Echeverri'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    3, 2, 'Metformina 850mg', 'Metformina Clorhidrato', '850 mg', '1 tableta',
    1, 12, '07:30, 19:30', 'Administrar con las comidas principales. Vigilar tolerancia GI.',
    'N', TO_DATE('2024-01-15', 'YYYY-MM-DD'), 45, 15, 1, 'Dra. Patricia Salamanca'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    4, 2, 'Levotiroxina Sódica 50mcg', 'Levotiroxina', '50 mcg', '1 tableta',
    1, 24, '06:00', 'Tomar en ayunas estricto, 30 minutos antes de desayuno.',
    'N', TO_DATE('2024-01-15', 'YYYY-MM-DD'), 50, 10, 1, 'Dra. Patricia Salamanca'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    5, 3, 'Atorvastatina 40mg', 'Atorvastatina Cálcica', '40 mg', '1 tableta',
    1, 24, '21:00', 'Prevención secundaria post-ACV. Administrar con agua por la noche.',
    'N', TO_DATE('2024-02-01', 'YYYY-MM-DD'), 28, 10, 1, 'Dr. Felipe Caicedo'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    6, 3, 'Clopidogrel 75mg', 'Clopidogrel', '75 mg', '1 tableta',
    1, 24, '12:00', 'Antiagregante plaquetario.',
    'N', TO_DATE('2024-02-01', 'YYYY-MM-DD'), 30, 10, 1, 'Dr. Felipe Caicedo'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    7, 4, 'Omeprazol 20mg', 'Omeprazol', '20 mg', '1 cápsula',
    1, 24, '07:00', 'Protección gástrica. En ayunas.',
    'N', TO_DATE('2024-02-10', 'YYYY-MM-DD'), 40, 15, 1, 'Dra. Claudia Vengoechea'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    8, 5, 'Donepezilo 10mg', 'Donepezilo Clorhidrato', '10 mg', '1 tableta',
    1, 24, '21:00', 'Tratamiento de deterioro cognitivo. Antes de dormir.',
    'N', TO_DATE('2024-02-15', 'YYYY-MM-DD'), 25, 10, 1, 'Dr. Jorge Hernán Ospina'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    9, 6, 'Levodopa + Carbidopa 250/25mg', 'Levodopa/Carbidopa', '1 tableta', '1 tableta',
    1, 8, '07:00, 15:00, 23:00', 'Horario estricto antiparkinsoniano. 30 min antes de comidas.',
    'S', TO_DATE('2024-03-01', 'YYYY-MM-DD'), 90, 20, 1, 'Dr. Ricardo Moncada'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    10, 7, 'Carvedilol 6.25mg', 'Carvedilol', '6.25 mg', '1 tableta',
    1, 12, '08:00, 20:00', 'Monitorear frecuencia cardíaca antes de administrar.',
    'N', TO_DATE('2024-03-10', 'YYYY-MM-DD'), 40, 15, 1, 'Dr. Gabriel Santamaría'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    11, 8, 'Calcio + Vitamina D3', 'Carbonato de Calcio / Colecalciferol', '600mg / 400UI', '1 tableta',
    1, 12, '12:00, 18:00', 'Administrar con alimentos principales.',
    'N', TO_DATE('2024-03-20', 'YYYY-MM-DD'), 60, 20, 1, 'Dra. María Jimena Hurtado'
);

INSERT INTO SMY_MEDICAMENTOS_PRESCRITOS (
    ID, ID_RESIDENTE, NOMBRE_MEDICAMENTO, PRINCIPIO_ACTIVO, DOSIS, CANTIDAD,
    ID_VIA_ADMINISTRACION, FRECUENCIA_HORAS, HORARIOS_FIJOS, INDICACIONES,
    REQUIERE_FOTO_COMP, FECHA_INICIO, STOCK_ACTUAL, STOCK_MINIMO, ID_ESTADO_MEDICAMENTO, PRESCRITO_POR
) VALUES (
    12, 10, 'Gotas Oftálmicas Lubricantes', 'Carboximetilcelulosa 0.5%', '1 gota en cada ojo', '2 gotas',
    6, 8, '08:00, 14:00, 20:00', 'Para alivio del ojo seco secundario a Sjögren.',
    'N', TO_DATE('2024-04-15', 'YYYY-MM-DD'), 3, 1, 1, 'Dra. Natalia Quintero'
);

COMMIT;

-- =============================================================================
-- 9. REGISTROS DE ADMINISTRACIÓN DE MEDICAMENTOS (SMY_REGISTROS_ADMIN_MED)
-- Registros del día de hoy (administrados en la mañana, pendientes en la tarde/noche)
-- =============================================================================
PROMPT 9. Insertando Registros de Administración de Medicamentos (SMY_REGISTROS_ADMIN_MED)...

INSERT INTO SMY_REGISTROS_ADMIN_MED (
    ID, ID_MEDICAMENTO_PRESCRITO, ID_RESIDENTE, FECHA_PROGRAMADA, HORA_PROGRAMADA,
    FECHA_ADMINISTRADA, HORA_ADMINISTRADA, ID_USUARIO_ADMINISTRO, ID_ESTADO_ADMIN_MED, NOTAS
) VALUES (
    1, 1, 1, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '08:00',
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE), '08:05', 2, 2, 'Administrado sin contratiempos con desayuno.'
);

INSERT INTO SMY_REGISTROS_ADMIN_MED (
    ID, ID_MEDICAMENTO_PRESCRITO, ID_RESIDENTE, FECHA_PROGRAMADA, HORA_PROGRAMADA,
    FECHA_ADMINISTRADA, HORA_ADMINISTRADA, ID_USUARIO_ADMINISTRO, ID_ESTADO_ADMIN_MED, NOTAS
) VALUES (
    2, 2, 1, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '08:00',
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE), '08:06', 2, 2, 'Administrado junto con Losartán.'
);

INSERT INTO SMY_REGISTROS_ADMIN_MED (
    ID, ID_MEDICAMENTO_PRESCRITO, ID_RESIDENTE, FECHA_PROGRAMADA, HORA_PROGRAMADA,
    FECHA_ADMINISTRADA, HORA_ADMINISTRADA, ID_USUARIO_ADMINISTRO, ID_ESTADO_ADMIN_MED, NOTAS
) VALUES (
    3, 4, 2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '06:00',
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE), '06:02', 5, 2, 'Levotiroxina en ayunas estricto.'
);

INSERT INTO SMY_REGISTROS_ADMIN_MED (
    ID, ID_MEDICAMENTO_PRESCRITO, ID_RESIDENTE, FECHA_PROGRAMADA, HORA_PROGRAMADA,
    FECHA_ADMINISTRADA, HORA_ADMINISTRADA, ID_USUARIO_ADMINISTRO, ID_ESTADO_ADMIN_MED, NOTAS
) VALUES (
    4, 3, 2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '07:30',
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE), '07:35', 2, 2, 'Metformina administrada con huevo revuelto y té.'
);

INSERT INTO SMY_REGISTROS_ADMIN_MED (
    ID, ID_MEDICAMENTO_PRESCRITO, ID_RESIDENTE, FECHA_PROGRAMADA, HORA_PROGRAMADA,
    ID_ESTADO_ADMIN_MED, NOTAS
) VALUES (
    5, 1, 1, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '20:00',
    1, 'Programado para el turno noche.'
);

INSERT INTO SMY_REGISTROS_ADMIN_MED (
    ID, ID_MEDICAMENTO_PRESCRITO, ID_RESIDENTE, FECHA_PROGRAMADA, HORA_PROGRAMADA,
    ID_ESTADO_ADMIN_MED, NOTAS
) VALUES (
    6, 3, 2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '19:30',
    1, 'Programado para la cena.'
);

INSERT INTO SMY_REGISTROS_ADMIN_MED (
    ID, ID_MEDICAMENTO_PRESCRITO, ID_RESIDENTE, FECHA_PROGRAMADA, HORA_PROGRAMADA,
    FECHA_ADMINISTRADA, HORA_ADMINISTRADA, ID_USUARIO_ADMINISTRO, ID_ESTADO_ADMIN_MED, NOTAS
) VALUES (
    7, 7, 4, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '07:00',
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE), '07:05', 2, 2, 'Omeprazol en ayunas verificado.'
);

INSERT INTO SMY_REGISTROS_ADMIN_MED (
    ID, ID_MEDICAMENTO_PRESCRITO, ID_RESIDENTE, FECHA_PROGRAMADA, HORA_PROGRAMADA,
    FECHA_ADMINISTRADA, HORA_ADMINISTRADA, ID_USUARIO_ADMINISTRO, ID_ESTADO_ADMIN_MED, NOTAS
) VALUES (
    8, 9, 6, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '07:00',
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE), '07:01', 2, 2, 'Dosis matutina de Levodopa recibida.'
);

COMMIT;

-- =============================================================================
-- 10. SIGNOS VITALES (SMY_SIGNOS_VITALES)
-- Registros normales y uno con ES_ALERTA_RANGO = 'S' para pruebas de alertas
-- =============================================================================
PROMPT 10. Insertando Signos Vitales (SMY_SIGNOS_VITALES)...

-- Residente 1: Toma matutina normal
INSERT INTO SMY_SIGNOS_VITALES (
    ID, ID_RESIDENTE, ID_USUARIO_REGISTRO, FECHA, HORA,
    PRESION_SISTOLICA, PRESION_DIASTOLICA, FRECUENCIA_CARDIACA, SATURACION_OXIGENO,
    TEMPERATURA, GLUCOMETRIA, PESO_KG, OBSERVACIONES, ES_ALERTA_RANGO
) VALUES (
    1, 1, 2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '07:30',
    128, 78, 68, 96.00, 36.50, 95.00, 68.50, 'Signos vitales estables en reposo.', 'N'
);

-- Residente 1: Registro con ALERTA clínica (Alza tensional)
INSERT INTO SMY_SIGNOS_VITALES (
    ID, ID_RESIDENTE, ID_USUARIO_REGISTRO, FECHA, HORA,
    PRESION_SISTOLICA, PRESION_DIASTOLICA, FRECUENCIA_CARDIACA, SATURACION_OXIGENO,
    TEMPERATURA, GLUCOMETRIA, PESO_KG, OBSERVACIONES, ES_ALERTA_RANGO
) VALUES (
    2, 1, 2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '11:30',
    165, 102, 88, 94.00, 36.80, NULL, NULL, 'Alza tensional reportada. Residente refiere cefalea leve. Se reposa en cama.', 'S'
);

-- Residente 2: Toma matutina (Monitoreo de glucosa)
INSERT INTO SMY_SIGNOS_VITALES (
    ID, ID_RESIDENTE, ID_USUARIO_REGISTRO, FECHA, HORA,
    PRESION_SISTOLICA, PRESION_DIASTOLICA, FRECUENCIA_CARDIACA, SATURACION_OXIGENO,
    TEMPERATURA, GLUCOMETRIA, PESO_KG, OBSERVACIONES, ES_ALERTA_RANGO
) VALUES (
    3, 2, 2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '06:30',
    120, 72, 70, 97.00, 36.30, 118.00, 62.00, 'Glucometría en ayunas en rango adecuado.', 'N'
);

-- Residente 3: Monitoreo
INSERT INTO SMY_SIGNOS_VITALES (
    ID, ID_RESIDENTE, ID_USUARIO_REGISTRO, FECHA, HORA,
    PRESION_SISTOLICA, PRESION_DIASTOLICA, FRECUENCIA_CARDIACA, SATURACION_OXIGENO,
    TEMPERATURA, GLUCOMETRIA, PESO_KG, OBSERVACIONES, ES_ALERTA_RANGO
) VALUES (
    4, 3, 2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '08:15',
    130, 82, 74, 95.00, 36.60, 102.00, 71.20, 'Estable. Colaborador en terapia de movilidad.', 'N'
);

-- Residente 4: Monitoreo
INSERT INTO SMY_SIGNOS_VITALES (
    ID, ID_RESIDENTE, ID_USUARIO_REGISTRO, FECHA, HORA,
    PRESION_SISTOLICA, PRESION_DIASTOLICA, FRECUENCIA_CARDIACA, SATURACION_OXIGENO,
    TEMPERATURA, GLUCOMETRIA, PESO_KG, OBSERVACIONES, ES_ALERTA_RANGO
) VALUES (
    5, 4, 3, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '09:00',
    115, 70, 66, 98.00, 36.40, NULL, 58.00, 'Patrón respiratorio normal sin dificultad.', 'N'
);

-- Residente 5: Monitoreo con Marcapasos
INSERT INTO SMY_SIGNOS_VITALES (
    ID, ID_RESIDENTE, ID_USUARIO_REGISTRO, FECHA, HORA,
    PRESION_SISTOLICA, PRESION_DIASTOLICA, FRECUENCIA_CARDIACA, SATURACION_OXIGENO,
    TEMPERATURA, GLUCOMETRIA, PESO_KG, OBSERVACIONES, ES_ALERTA_RANGO
) VALUES (
    6, 5, 2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '08:45',
    125, 75, 60, 96.00, 36.50, NULL, 65.40, 'Frecuencia cardíaca rítmica a 60 lpm por marcapasos.', 'N'
);

COMMIT;

-- =============================================================================
-- 11. BITÁCORA ASISTENCIAL (SMY_BITACORA_RESIDENTE)
-- Novedades diarias con categorías: Rutina, Salud, Visita Familiar, Actividad
-- =============================================================================
PROMPT 11. Insertando Bitácora Asistencial (SMY_BITACORA_RESIDENTE)...

-- 11.1 REGISTROS INICIALES DE ADMISIÓN (Primer registro cronológico de cada residente)
-- Residente 1 (Álvaro Delgado Mora - Ingreso: 2024-01-10)
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    1, 1, 1, 1, TO_DATE('2024-01-10', 'YYYY-MM-DD'), '08:00',
    1, '[REGISTRO DEL RESIDENTE]: Ingreso oficial a la institución en compañía de su hija Lucía Delgado. Se asigna habitación 101-A. Trae pertenencias personales completas y silla de ruedas. Se realiza valoración médica inicial con antecedentes de hipertensión arterial severa y alergia a Penicilina. Se entrega protocolo de cuidados y plan de alimentación hiposódica a la familia.',
    'N', NULL, 'S'
);

-- Residente 2 (Elena Pérez de Gómez - Ingreso: 2024-01-15)
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    2, 2, 1, 1, TO_DATE('2024-01-15', 'YYYY-MM-DD'), '08:30',
    1, '[REGISTRO DEL RESIDENTE]: Admisión e ingreso formal a la sede en compañía de su hijo Javier Pérez. Ubicada en habitación 101-B con pertenencias rotuladas. Se recibe con glucómetro y esquema de insulina. Se establece protocolo de glucometría capilar matutina diaria y dieta para diabéticos.',
    'N', NULL, 'S'
);

-- Residente 3 (Fernando López Castro - Ingreso: 2024-02-01)
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    3, 3, 1, 1, TO_DATE('2024-02-01', 'YYYY-MM-DD'), '09:00',
    1, '[REGISTRO DEL RESIDENTE]: Ingreso del residente en silla de ruedas asistido por su acudiente. Asignado a habitación 102-A. Antecedente de secuelas de ACV isquémico izquierdo con hemiparesia facio-braquial. Se define programa integral de fisioterapia pasiva y movilización asistida.',
    'N', NULL, 'S'
);

-- Residente 4 (Mercedes Hernández de Silva - Ingreso: 2024-02-10)
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    4, 4, 1, 1, TO_DATE('2024-02-10', 'YYYY-MM-DD'), '09:15',
    1, '[REGISTRO DEL RESIDENTE]: Admisión inicial en habitación 102-B en compañía de su familia. Se consigna disfagia leve a sólidos, iniciando con dieta blanda de fácil masticación y supervisión estrecha durante los horarios de alimentación.',
    'N', NULL, 'S'
);

-- Residente 5 (Gustavo Torres Valderrama - Ingreso: 2024-02-15)
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    5, 5, 1, 1, TO_DATE('2024-02-15', 'YYYY-MM-DD'), '08:45',
    1, '[REGISTRO DEL RESIDENTE]: Ingreso formal a la institución asignado a habitación 103-A. Portador de marcapasos bicameral implantado en 2021. Se entrega expediente clínico completo y se instruye al personal en monitorización de frecuencia cardíaca y estimulación cognitiva.',
    'N', NULL, 'S'
);

-- Residente 6 (Carmen Rosa Castro Pardo - Ingreso: 2024-03-01)
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    6, 6, 1, 1, TO_DATE('2024-03-01', 'YYYY-MM-DD'), '10:00',
    1, '[REGISTRO DEL RESIDENTE]: Admisión en habitación 103-B. Residente encamada con diagnóstico de Parkinson avanzado y alergia a Sulfas. Se activa protocolo estricto de prevención de lesiones por presión con cambios posturales cada dos horas y colchón antiescaras.',
    'N', NULL, 'S'
);

-- Residente 7 (Roberto Morales Duque - Ingreso: 2024-03-10)
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    7, 7, 1, 1, TO_DATE('2024-03-10', 'YYYY-MM-DD'), '08:30',
    1, '[REGISTRO DEL RESIDENTE]: Ingreso a la Sede Campestre La Calera en habitación 104-A. Residente con insuficiencia cardíaca congestiva controlada NYHA II. Se activa control estricto de balance hídrico, peso interdiario y dieta hiposódica.',
    'N', NULL, 'S'
);

-- Residente 8 (Teresa de Jesús Sánchez - Ingreso: 2024-03-20)
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    8, 8, 1, 1, TO_DATE('2024-03-20', 'YYYY-MM-DD'), '09:30',
    1, '[REGISTRO DEL RESIDENTE]: Admisión en habitación 104-B. Paciente funcionalmente independiente con osteoporosis severa y antecedente de fractura de Colles. Se realiza ambientación segura de la habitación libre de desniveles y se entrega calzado antideslizante.',
    'N', NULL, 'S'
);

-- Residente 9 (Guillermo Navarro Soler - Ingreso: 2024-04-01)
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    9, 9, 1, 1, TO_DATE('2024-04-01', 'YYYY-MM-DD'), '08:15',
    1, '[REGISTRO DEL RESIDENTE]: Ingreso a la Sede Campestre en habitación 105-A. Requiere curación diaria y vigilancia estrecha de lesión en pie derecho grado Wagner 1 por neuropatía diabética. Se agenda valoración semanal de cicatrización con enfermería jefe.',
    'N', NULL, 'S'
);

-- Residente 10 (Blanca Nieves Castillo - Ingreso: 2024-04-15)
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    10, 10, 1, 1, TO_DATE('2024-04-15', 'YYYY-MM-DD'), '10:30',
    1, '[REGISTRO DEL RESIDENTE]: Admisión inicial en habitación 105-B. Diagnóstico de artritis reumatoide e hipoacusia bilateral. Se rotula dispositivo auditivo de ayuda y se establecen pautas de comunicación frente a frente y asistencia en actividades de motricidad fina.',
    'N', NULL, 'S'
);

-- 11.2 NOVEDADES ASISTENCIALES Y SEGUIMIENTO DIARIO
INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    11, 1, 2, 3, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '08:30',
    1, 'Don Álvaro amanece de buen ánimo. Se realiza baño asistido sin eventualidades. Desayuna el 100% de la porción hiposódica.',
    'N', 2, 'S'
);

INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    12, 1, 1, 2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '11:45',
    6, 'Se detecta cifra tensional de 165/102 mmHg. Se coloca al residente en reposo en posición semifowler. Se notifica al médico tratante y se agenda control en 2 horas.',
    'N', 1, 'S'
);

INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    13, 2, 2, 3, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '09:15',
    5, 'Doña Elena participa activamente en la sesión matutina de estimulación cognitiva y memoria musical. Muy sonriente y comunicativa.',
    'N', 2, 'S'
);

INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    14, 3, 2, 3, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '10:00',
    3, 'Sesión de fisioterapia pasiva en miembro superior izquierdo completada con el terapeuta. Se observa mejor tolerancia al estiramiento.',
    'N', 2, 'S'
);

INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    15, 2, 3, 4, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)) - 1, '16:00',
    4, 'Visita de su hijo Javier Pérez. Compartieron en el jardín central durante 45 minutos. La residente estuvo muy complacida.',
    'N', 3, 'S'
);

INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    16, 5, 2, 3, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '11:00',
    5, 'Caminata asistida en zonas verdes con el cuidador. Marcha estable con apoyo, buen estado de ánimo y excelente oxigenación posterior.',
    'N', 2, 'S'
);

INSERT INTO SMY_BITACORA_RESIDENTE (
    ID, ID_RESIDENTE, ID_EMPLEADO, ID_USUARIO, FECHA, HORA,
    ID_CATEGORIA_BITACORA, CONTENIDO, GRABADO_POR_VOZ, ID_TURNO_ASIGNADO, VISIBLE_ACUDIENTE
) VALUES (
    17, 7, 2, 3, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '07:45',
    3, 'Control matutino de diuresis y signos vitales sin signos de sobrecarga hídrica. Se administra medicación antihipertensiva con desayuno.',
    'N', 2, 'S'
);

COMMIT;

-- =============================================================================
-- 12. CONSENTIMIENTOS INFORMADOS (SMY_CONSENTIMIENTOS y DESTINATARIOS)
-- Incluye aprobados/firmados con datos de firma digital y uno pendiente
-- =============================================================================
PROMPT 12. Insertando Consentimientos Informados (SMY_CONSENTIMIENTOS y SMY_CONSENTIMIENTO_DESTINATARIOS)...

-- 12.1 Consentimiento Tratamiento Fisioterapia (Residente 1 - Aprobado y Firmado)
INSERT INTO SMY_CONSENTIMIENTOS (
    ID, ID_RESIDENTE, ID_TIPO_CONSENTIMIENTO, DESCRIPCION,
    ID_ARCHIVO_CONSENTIMIENTO,
    FECHA_ENVIO, FECHA_RESPUESTA, ID_ESTADO_CONSENTIMIENTO, ID_USUARIO_CREADOR
) VALUES (
    1, 1, 1, 'Autorización para inicio de sesiones de movilidad asistida y fortalecimiento muscular con el equipo de fisioterapia de la institución.',
    201,
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - 5,
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - 4,
    2, 1
);

INSERT INTO SMY_CONSENTIMIENTO_DESTINATARIOS (
    ID, ID_CONSENTIMIENTO, ID_ACUDIENTE, NOMBRE_DESTINATARIO, ID_PARENTESCO, EMAIL,
    ID_ESTADO_FIRMA_CONS, FECHA_ACCION, IP_FIRMA, FIRMA_DIGITAL_HASH, ID_ARCHIVO_CONSENTIMIENTO
) VALUES (
    1, 1, 1, 'Lucía Delgado Silva', 1, 'lucia.delgado@gmail.com',
    3, CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - 4, '190.158.45.12',
    'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    202
);

-- 12.2 Consentimiento Salida de Fin de Semana (Residente 2 - Aprobado y Firmado)
INSERT INTO SMY_CONSENTIMIENTOS (
    ID, ID_RESIDENTE, ID_TIPO_CONSENTIMIENTO, DESCRIPCION,
    ID_ARCHIVO_CONSENTIMIENTO,
    FECHA_ENVIO, FECHA_RESPUESTA, ID_ESTADO_CONSENTIMIENTO, ID_USUARIO_CREADOR
) VALUES (
    2, 2, 2, 'Permiso para salida recreativa al club campestre el día domingo con su acudiente Javier Pérez, con retorno a las 18:00 horas.',
    203,
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - 2,
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - 1,
    2, 1
);

INSERT INTO SMY_CONSENTIMIENTO_DESTINATARIOS (
    ID, ID_CONSENTIMIENTO, ID_ACUDIENTE, NOMBRE_DESTINATARIO, ID_PARENTESCO, EMAIL,
    ID_ESTADO_FIRMA_CONS, FECHA_ACCION, IP_FIRMA, FIRMA_DIGITAL_HASH, ID_ARCHIVO_CONSENTIMIENTO
) VALUES (
    2, 2, 3, 'Javier Pérez Gómez', 1, 'javier.perez@hotmail.com',
    3, CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - 1, '181.61.12.98',
    'SHA256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    204
);

-- 12.3 Consentimiento Procedimiento Odontológico (Residente 3 - Pendiente de Firma)
INSERT INTO SMY_CONSENTIMIENTOS (
    ID, ID_RESIDENTE, ID_TIPO_CONSENTIMIENTO, DESCRIPCION,
    ID_ARCHIVO_CONSENTIMIENTO,
    FECHA_ENVIO, FECHA_RESPUESTA, ID_ESTADO_CONSENTIMIENTO, ID_USUARIO_CREADOR
) VALUES (
    3, 3, 3, 'Valoración y profilaxis odontológica programada por brigada geriátrica de salud oral.',
    205,
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE),
    NULL,
    1, 1
);

INSERT INTO SMY_CONSENTIMIENTO_DESTINATARIOS (
    ID, ID_CONSENTIMIENTO, ID_ACUDIENTE, NOMBRE_DESTINATARIO, ID_PARENTESCO, EMAIL,
    ID_ESTADO_FIRMA_CONS, ID_ARCHIVO_CONSENTIMIENTO
) VALUES (
    3, 3, 5, 'Mariana López Vega', 1, 'mariana.lopez@yahoo.com',
    1, NULL -- Estado enviado, pendiente por firmar
);

COMMIT;

-- =============================================================================
-- 13. TAREAS OPERATIVAS (SMY_TAREAS_OPERATIVAS y ASIGNACIONES)
-- Tareas individuales y grupales para cuidadores
-- =============================================================================
PROMPT 13. Insertando Tareas Operativas (SMY_TAREAS_OPERATIVAS y SMY_TAREA_RESIDENTES)...

-- Tarea 1: Baño e Higiene Matutina (Individual - Residente 1 - Completada)
INSERT INTO SMY_TAREAS_OPERATIVAS (
    ID, FECHA_PROGRAMADA, HORA_PROGRAMADA, TITULO, ID_TIPO_TAREA, ID_ALCANCE_TAREA,
    ID_RESIDENTE, CANTIDAD_RESIDENTES, DESCRIPCION, ID_ESTADO_TAREA,
    ID_USUARIO_ASIGNADO, ID_USUARIO_COMPLETO, COMPLETADO_EL
) VALUES (
    1, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '07:00',
    'Aseo y Baño Asistido Don Álvaro', 4, 2, 1, 1,
    'Baño en ducha asistido con silla ergonómica, cambio de ropa y lubricación de piel.',
    3, 3, 3, CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - (4/24)
);

-- Tarea 2: Taller de Estimulación Cognitiva (Grupal - En curso)
INSERT INTO SMY_TAREAS_OPERATIVAS (
    ID, FECHA_PROGRAMADA, HORA_PROGRAMADA, TITULO, ID_TIPO_TAREA, ID_ALCANCE_TAREA,
    ID_RESIDENTE, CANTIDAD_RESIDENTES, DESCRIPCION, ID_ESTADO_TAREA,
    ID_USUARIO_ASIGNADO
) VALUES (
    2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '10:00',
    'Taller de Memoria y Musicoterapia', 5, 1, NULL, 5,
    'Actividad lúdica de memoria episódica mediante canciones colombianas de época en el salón comunal.',
    2, 4
);

-- Residentes asignados a la tarea grupal
INSERT INTO SMY_TAREA_RESIDENTES (ID, ID_TAREA_OPERATIVA, ID_RESIDENTE, ASISTIO, OBSERVACIONES)
VALUES (1, 2, 1, 'S', 'Participó activamente cantando boleros.');

INSERT INTO SMY_TAREA_RESIDENTES (ID, ID_TAREA_OPERATIVA, ID_RESIDENTE, ASISTIO, OBSERVACIONES)
VALUES (2, 2, 2, 'S', 'Gran entusiasmo y respuesta cognitiva rápida.');

INSERT INTO SMY_TAREA_RESIDENTES (ID, ID_TAREA_OPERATIVA, ID_RESIDENTE, ASISTIO, OBSERVACIONES)
VALUES (3, 2, 3, 'S', 'Asistió en su silla de ruedas. Muy atento.');

INSERT INTO SMY_TAREA_RESIDENTES (ID, ID_TAREA_OPERATIVA, ID_RESIDENTE, ASISTIO, OBSERVACIONES)
VALUES (4, 2, 5, 'S', 'Reconoció melodías de su juventud.');

-- Tarea 3: Ronda de Signos Vitales Vespertina (Pendiente)
INSERT INTO SMY_TAREAS_OPERATIVAS (
    ID, FECHA_PROGRAMADA, HORA_PROGRAMADA, TITULO, ID_TIPO_TAREA, ID_ALCANCE_TAREA,
    ID_RESIDENTE, CANTIDAD_RESIDENTES, DESCRIPCION, ID_ESTADO_TAREA,
    ID_USUARIO_ASIGNADO
) VALUES (
    3, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)), '15:00',
    'Toma de Tensión y Glucometría Vespertina', 2, 1, NULL, 10,
    'Medición y registro de signos vitales para todos los residentes del ala norte.',
    1, 2
);

COMMIT;

-- =============================================================================
-- 14. INCIDENTES Y REPORTES DE SEGURIDAD (SMY_INCIDENTES)
-- =============================================================================
PROMPT 14. Insertando Incidentes (SMY_INCIDENTES y SMY_INCIDENTE_RESIDENTES)...

INSERT INTO SMY_INCIDENTES (
    ID, ID_TIPO_INCIDENTE, ID_SEVERIDAD_INCIDENTE, FECHA_HORA_EVENTO,
    DESCRIPCION, ACCIONES_TOMADAS, ID_USUARIO_REPORTO, ID_ESTADO_INCIDENTE,
    NOTIFICADO_ACUDIENTE, FECHA_CIERRE, ID_USUARIO_CERRO, CONCLUSIONES_CIERRE
) VALUES (
    1, 1, 1, CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - 3,
    'Don Fernando López tuvo una pérdida momentánea de balance al intentar levantarse sin apoyo de la silla en el comedor. Se deslizó sobre la rodilla derecha sin golpear la cabeza.',
    'Se acudió de inmediato en su asistencia. Valoración médica en el sitio descartó contusiones, deformidades o limitación funcional. Se colocó compresas frías en rodilla y se reforzó la indicación de solicitar apoyo para bipedestación.',
    3, 3, 'S', CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - 2, 1,
    'Incidente cerrado satisfactoriamente sin secuelas. La hija fue informada telefónicamente y por aplicativo.'
);

INSERT INTO SMY_INCIDENTE_RESIDENTES (ID, ID_INCIDENTE, ID_RESIDENTE, ID_ROL_INCIDENTE)
VALUES (1, 1, 3, 1); -- Don Fernando como afectado

COMMIT;

-- =============================================================================
-- 15. EVENTOS DEL CALENDARIO INSTITUCIONAL (SMY_EVENTOS_CALENDARIO)
-- =============================================================================
PROMPT 15. Insertando Eventos de Calendario (SMY_EVENTOS_CALENDARIO)...

INSERT INTO SMY_EVENTOS_CALENDARIO (
    ID, TITULO, DESCRIPCION, ID_TIPO_EVENTO,
    FECHA_INICIO, HORA_INICIO, FECHA_FIN, HORA_FIN, LUGAR,
    VISIBLE_ACUDIENTES, ID_ORGANIZADOR
) VALUES (
    1, 'Celebración de Cumpleaños del Mes de Septiembre',
    'Homenaje especial para los residentes que cumplen años en el mes. Habrá torta especial apta para diabéticos y serenata con mariachis.',
    5, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)) + 5, '15:00',
    TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)) + 5, '17:30', 'Jardín Principal Samanya',
    'S', 1
);

INSERT INTO SMY_EVENTOS_CALENDARIO (
    ID, TITULO, DESCRIPCION, ID_TIPO_EVENTO,
    FECHA_INICIO, HORA_INICIO, FECHA_FIN, HORA_FIN, LUGAR,
    VISIBLE_ACUDIENTES, ID_ORGANIZADOR
) VALUES (
    2, 'Jornada de Vacunación Anual contra la Influenza',
    'Aplicación de refuerzo anual antigripal a cargo de la Secretaría de Salud Distrital para todos los residentes con autorización previa.',
    2, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)) + 10, '09:00',
    TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)) + 10, '12:00', 'Consultorio de Enfermería',
    'S', 1
);

INSERT INTO SMY_EVENTOS_CALENDARIO (
    ID, TITULO, DESCRIPCION, ID_TIPO_EVENTO,
    FECHA_INICIO, HORA_INICIO, FECHA_FIN, HORA_FIN, LUGAR,
    VISIBLE_ACUDIENTES, ID_ORGANIZADOR
) VALUES (
    3, 'Taller de Jardinería y Huerto Sensorial',
    'Actividad de terapia ocupacional con plantas aromáticas y macetas decorativas.',
    4, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)) + 2, '10:00',
    TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)) + 2, '11:30', 'Huerta Verde Samanya',
    'S', 1
);

COMMIT;

-- =============================================================================
-- 16. CANALES DE CHAT Y MENSAJERÍA (SMY_CONVERSACIONES_CHAT y MENSAJES)
-- Para pruebas del módulo de mensajería acudiente-cuidador
-- =============================================================================
PROMPT 16. Insertando Mensajería y Chat (SMY_CONVERSACIONES_CHAT, SMY_CHAT_PARTICIPANTES, SMY_MENSAJES_CHAT)...

-- Canal 1: Chat directo Familiares de Don Álvaro con Enfermería
INSERT INTO SMY_CONVERSACIONES_CHAT (
    ID, TITULO, ID_TIPO_CANAL_CHAT, ID_RESIDENTE, ULTIMO_MENSAJE_EL
) VALUES (
    1, 'Familia Álvaro Delgado - Enfermería', 2, 1, CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)
);

-- Participantes: Martha Rodríguez (Enfermera), Lucía Delgado (Acudiente), Carlos Delgado (Acudiente)
INSERT INTO SMY_CHAT_PARTICIPANTES (ID, ID_CONVERSACION_CHAT, ID_USUARIO) VALUES (1, 1, 2);
INSERT INTO SMY_CHAT_PARTICIPANTES (ID, ID_CONVERSACION_CHAT, ID_USUARIO) VALUES (2, 1, 6);
INSERT INTO SMY_CHAT_PARTICIPANTES (ID, ID_CONVERSACION_CHAT, ID_USUARIO) VALUES (3, 1, 7);

-- Mensajes de la conversación
INSERT INTO SMY_MENSAJES_CHAT (
    ID, ID_CONVERSACION_CHAT, ID_REMITENTE, TEXTO, ENVIADO_EL
) VALUES (
    1, 1, 6, 'Buenos días Martha, ¿cómo pasó la noche mi papá? ¿Pudo descansar bien?',
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - (2/24)
);

INSERT INTO SMY_MENSAJES_CHAT (
    ID, ID_CONVERSACION_CHAT, ID_REMITENTE, TEXTO, ENVIADO_EL
) VALUES (
    2, 1, 2, 'Buenos días doña Lucía. Don Álvaro durmió continuo toda la noche. En la mañana desayunó muy bien. Le estamos vigilando la tensión arterial de cerca hoy.',
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - (1/24)
);

INSERT INTO SMY_MENSAJES_CHAT (
    ID, ID_CONVERSACION_CHAT, ID_REMITENTE, TEXTO, ENVIADO_EL
) VALUES (
    3, 1, 7, 'Muchas gracias por la atención Martha. Esta tarde paso a visitarlo sobre las 4:30 pm.',
    CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - (20/1440)
);

COMMIT;

-- =============================================================================
-- 17. NOTIFICACIONES DEL SISTEMA (SMY_NOTIFICACIONES_SISTEMA)
-- =============================================================================
PROMPT 17. Insertando Notificaciones del Sistema (SMY_NOTIFICACIONES_SISTEMA)...

INSERT INTO SMY_NOTIFICACIONES_SISTEMA (
    ID, ID_USUARIO_DESTINO, TITULO, MENSAJE, ID_TIPO_NOTIFICACION,
    PANTALLA_DESTINO, ID_OBJETO_DESTINO, LEIDO
) VALUES (
    1, 6, 'Nueva Novedad Registrada en Bitácora',
    'Se registró una novedad de salud para Álvaro Delgado: Monitoreo de presión arterial.',
    3, 'BitacoraDetalle', 2, 'N'
);

INSERT INTO SMY_NOTIFICACIONES_SISTEMA (
    ID, ID_USUARIO_DESTINO, TITULO, MENSAJE, ID_TIPO_NOTIFICACION,
    PANTALLA_DESTINO, ID_OBJETO_DESTINO, LEIDO
) VALUES (
    2, 10, 'Nuevo Consentimiento Pendiente de Firma',
    'Se ha generado una solicitud de consentimiento para profilaxis dental de Fernando López Castro.',
    5, 'ConsentimientoFirma', 3, 'N'
);

INSERT INTO SMY_NOTIFICACIONES_SISTEMA (
    ID, ID_USUARIO_DESTINO, TITULO, MENSAJE, ID_TIPO_NOTIFICACION,
    PANTALLA_DESTINO, ID_OBJETO_DESTINO, LEIDO, FECHA_LEIDO
) VALUES (
    3, 8, 'Consentimiento Aprobado',
    'La salida con familiar de Elena Pérez de Gómez ha sido aprobada y registrada en el sistema.',
    5, 'ConsentimientoDetalle', 2, 'S', CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) - 1
);

COMMIT;

-- =============================================================================
-- 17.1 SOLICITUDES DE ADMISIÓN (SMY_SOLICITUDES_ADMISION y CONTACTOS)
-- =============================================================================
PROMPT 17.1 Insertando Solicitudes de Admisión (SMY_SOLICITUDES_ADMISION)...

INSERT INTO SMY_SOLICITUDES_ADMISION (
    ID, ID_CENTRO, NOMBRE_COMPLETO, FECHA_NACIMIENTO,
    ID_GENERO, ID_NIVEL_MOVILIDAD, ALERTAS_CLINICAS, FECHA_DESEADA,
    ID_ESTADO_SOLICITUD_ADM, NOTAS_ADICIONALES, ID_USUARIO_REVISO, FECHA_REVISION
) VALUES (
    1, 1, 'Héctor Manuel Gómez Rivas', TO_DATE('1941-03-12', 'YYYY-MM-DD'),
    2, 2, 'Hipertensión controlada, principio de demencia senil.', TO_DATE('2026-04-01', 'YYYY-MM-DD'),
    1, 'Familiares laboran todo el día y requieren cuidado especializado permanente. Pendiente de entrevista.', NULL, NULL
);

INSERT INTO SMY_SOLICITUD_ADM_CONTACTOS (
    ID, ID_SOLICITUD_ADMISION, NOMBRE, ID_PARENTESCO, TELEFONO, EMAIL
) VALUES (
    1, 1, 'Carlos Gómez (Hijo)', 2, '+57 315 889 4433', 'carlos.gomez@gmail.com'
);

INSERT INTO SMY_SOLICITUDES_ADMISION (
    ID, ID_CENTRO, NOMBRE_COMPLETO, FECHA_NACIMIENTO,
    ID_GENERO, ID_NIVEL_MOVILIDAD, ALERTAS_CLINICAS, FECHA_DESEADA,
    ID_ESTADO_SOLICITUD_ADM, NOTAS_ADICIONALES, ID_USUARIO_REVISO, FECHA_REVISION
) VALUES (
    2, 2, 'Leonor Vargas de Serrano', TO_DATE('1937-09-24', 'YYYY-MM-DD'),
    1, 3, 'Artrosis de cadera, requiere andador, lucidez mental completa.', TO_DATE('2026-03-15', 'YYYY-MM-DD'),
    2, 'Documentos clínicos completos. Aprobada para visita médica domiciliaria.', 1, TO_DATE('2024-04-10', 'YYYY-MM-DD')
);

INSERT INTO SMY_SOLICITUD_ADM_CONTACTOS (
    ID, ID_SOLICITUD_ADMISION, NOMBRE, ID_PARENTESCO, TELEFONO, EMAIL
) VALUES (
    2, 2, 'Mariana Serrano (Hija)', 2, '+57 318 776 5522', 'mariana.serrano@gmail.com'
);

COMMIT;

-- =============================================================================
-- 18. PARÁMETROS DEL SISTEMA Y CONFIGURACIÓN GOOGLE DRIVE (SMY_PARAMETROS)
-- Configuración integral para File Server en Google Drive (1 TB), WhatsApp y JWT.
-- Incluye credenciales OAuth 2.0 y Service Account procedentes de smy_parametros.sql.
-- =============================================================================
PROMPT 18. Insertando Parámetros del Sistema y Google Drive (SMY_PARAMETROS)...

-- Limpieza preventiva para garantizar idempotencia sin violar PK ni UQ
DELETE FROM SMY_PARAMETROS
WHERE ID IN (1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19)
   OR CODIGO_PARAMETRO IN (
       'STORAGE_PROVIDER_TYPE', 'STORAGE_ROOT_PATH', 'STORAGE_MAX_UPLOAD_SIZE_MB',
       'API_WHATSAPP_ENDPOINT', 'API_WHATSAPP_BEARER_TOKEN', 'AUTH_JWT_EXPIRATION_MINUTES',
       'GDRIVE_OAUTH_CLIENT_JSON', 'GDRIVE_USER_TOKENS_JSON', 'GDRIVE_SERVICE_ACCOUNT_JSON',
       'GDRIVE_CLIENT_ID', 'GDRIVE_CLIENT_SECRET', 'GDRIVE_REFRESH_TOKEN',
       'GDRIVE_ACCESS_TOKEN', 'GDRIVE_PROJECT_ID', 'GDRIVE_ROOT_FOLDER_NAME',
       'GDRIVE_AUTH_TYPE', 'GDRIVE_SERVICE_ACCOUNT_EMAIL'
   );

COMMIT;

INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('1','STORAGE_PROVIDER_TYPE','Proveedor del File Server','Tipo de almacenamiento externo: LOCAL_DISK, GOOGLE_DRIVE, S3, MINIO','STORAGE','GOOGLE_DRIVE', EMPTY_CLOB(),null,null,'N','S','1',to_date('12/09/26','DD/MM/RR'),to_date('14/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('2','STORAGE_ROOT_PATH','Ruta Base del Servidor de Archivos','Ruta raíz en el disco o punto de montaje donde se estructura el almacenamiento.','STORAGE','/var/samanya/storage', EMPTY_CLOB(),null,null,'N','S','1',to_date('12/09/26','DD/MM/RR'),to_date('12/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('3','STORAGE_MAX_UPLOAD_SIZE_MB','Límite Máximo Global de Carga (MB)','Tamaño máximo permitido para la subida de cualquier archivo.','STORAGE',null, EMPTY_CLOB(),'50',null,'N','N','1',to_date('12/09/26','DD/MM/RR'),to_date('12/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('4','API_WHATSAPP_ENDPOINT','Endpoint API Notificaciones WhatsApp','URL del servicio de mensajería para alertas a acudientes y familiares.','INTEGRACION','https://api.whatsapp.com/v1/messages', EMPTY_CLOB(),null,null,'N','N','1',to_date('12/09/26','DD/MM/RR'),to_date('12/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('5','API_WHATSAPP_BEARER_TOKEN','Bearer Token API WhatsApp','Token de autenticación de larga duración para el gateway de WhatsApp.','INTEGRACION',null,'EAA...TOKEN_DEMOSTRACION_BEARER_WHATSAPP...XYZ',null,null,'S','N','1',to_date('12/09/26','DD/MM/RR'),to_date('12/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('6','AUTH_JWT_EXPIRATION_MINUTES','Tiempo de Expiración Token JWT (Minutos)','Minutos de validez de la sesión antes de requerir refresh token.','SEGURIDAD',null, EMPTY_CLOB(),'15',null,'N','S','1',to_date('12/09/26','DD/MM/RR'),to_date('12/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('8','GDRIVE_OAUTH_CLIENT_JSON','Google Drive - Cliente OAuth 2.0 (Credenciales JSON)','Configuración completa del cliente OAuth 2.0 para Google Drive 1 TB.','STORAGE','000000000000-dummyclientidforgdriveoauthsample.apps.googleusercontent.com','{"installed":{"client_id":"000000000000-dummyclientidforgdriveoauthsample.apps.googleusercontent.com","project_id":"samanya-drive-demo","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"GOCSPX-DUMMY_OAUTH_CLIENT_SECRET_KEY","redirect_uris":["http://localhost"]}}',null,null,'S','S','1',to_date('12/09/26','DD/MM/RR'),to_date('14/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('9','GDRIVE_USER_TOKENS_JSON','Google Drive - Tokens OAuth 2.0 de Usuario (JSON)','Tokens autorizados de usuario para carga y gestión de archivos en Drive.','STORAGE','1//DUMMY_REFRESH_TOKEN_FOR_LOCAL_DEV_ENVIRONMENT_XYZ',TO_CLOB(q'[{"access_token":"ya29.DUMMY_BEARER_TOKEN_FOR_LOCAL_DEV_ENVIRONMENT_XYZ","refresh_token":"1//DUMMY_REFRESH_TOKEN_FOR_LOCAL_DEV_ENVIRONMENT_XYZ","scope":"https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file","token_type":"Bearer","refresh_token_expires_in":604799,"expiry_date":1789446040986}]'),null,to_date('14/09/26','DD/MM/RR'),'S','S','1',to_date('12/09/26','DD/MM/RR'),to_date('14/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('10','GDRIVE_SERVICE_ACCOUNT_JSON','Google Drive - Cuenta de Servicio (Service Account JSON)','Credenciales de la Service Account y llave RSA privada de Google Cloud.','STORAGE','samanya-backend@samanya-drive.iam.gserviceaccount.com',TO_CLOB(q'[{"type":"service_account","project_id":"samanya-drive-demo","private_key_id":"dummy_private_key_id_00000000","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDO8_DUMMY_PRIVATE_KEY_FOR_LOCAL_DEVELOPMENT_ENVIRONMENT_SAMANYA_OS==\n-----END PRIVATE KEY-----\n","client_email":"samanya-backend@samanya-drive-demo.iam.gserviceaccount.com","client_id":"100000000000000000000","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/samanya-backend%40samanya-drive-demo.iam.gserviceaccount.com","universe_domain":"googleapis.com"}]'),null,null,'S','S','1',to_date('12/09/26','DD/MM/RR'),to_date('12/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('11','GDRIVE_CLIENT_ID','Google Drive - Client ID','Client ID de OAuth 2.0 registrado en Google Cloud Console','STORAGE','000000000000-dummyclientidforgdriveoauthsample.apps.googleusercontent.com', EMPTY_CLOB(),null,null,'N','S','1',to_date('12/09/26','DD/MM/RR'),to_date('14/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('12','GDRIVE_CLIENT_SECRET','Google Drive - Client Secret','Clave secreta de la aplicación OAuth 2.0','STORAGE','GOCSPX-DUMMY_OAUTH_CLIENT_SECRET_KEY', EMPTY_CLOB(),null,null,'S','S','1',to_date('12/09/26','DD/MM/RR'),to_date('14/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('13','GDRIVE_REFRESH_TOKEN','Google Drive - Refresh Token','Token permanente de refresco OAuth 2.0 para renovar accesos a Drive','STORAGE','1//DUMMY_REFRESH_TOKEN_FOR_LOCAL_DEV_ENVIRONMENT_XYZ', EMPTY_CLOB(),null,null,'S','S','1',to_date('12/09/26','DD/MM/RR'),to_date('14/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('14','GDRIVE_ACCESS_TOKEN','Google Drive - Access Token Vigente','Token de acceso al portador (Bearer) para peticiones a la API de Drive','STORAGE','ya29.DUMMY_BEARER_TOKEN_FOR_LOCAL_DEV_ENVIRONMENT_XYZ', EMPTY_CLOB(),null,null,'S','S','1',to_date('12/09/26','DD/MM/RR'),to_date('14/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('15','GDRIVE_PROJECT_ID','Google Drive - Project ID','Identificador del proyecto en Google Cloud (samanya-drive)','STORAGE','samanya-drive-508702', EMPTY_CLOB(),null,null,'N','S','1',to_date('12/09/26','DD/MM/RR'),to_date('14/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('16','GDRIVE_ROOT_FOLDER_NAME','Google Drive - Carpeta Raíz','Nombre del directorio raíz en Google Drive para los archivos','STORAGE','Samanya', EMPTY_CLOB(),null,null,'N','S','1',to_date('12/09/26','DD/MM/RR'),to_date('14/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('17','GDRIVE_AUTH_TYPE','Google Drive - Modo de Autenticación','Estrategia de conexión activa: OAUTH_USER (1 TB Personal) o SERVICE_ACCOUNT','STORAGE','OAUTH_USER', EMPTY_CLOB(),null,null,'N','S','1',to_date('12/09/26','DD/MM/RR'),to_date('14/09/26','DD/MM/RR'),null);
INSERT INTO SMY_PARAMETROS (ID,CODIGO_PARAMETRO,NOMBRE_PARAMETRO,DESCRIPCION,GRUPO_PARAMETRO,VALOR_TEXTO,VALOR_CLOB,VALOR_NUMERICO,VALOR_FECHA,ES_ENCRIPTADO,ES_SISTEMA,ID_ESTADO_PARAMETRO,FECHA_CREACION,FECHA_ULTIMA_MODIFICACION,ID_USUARIO_ULTIMA_MODIFICACION) values ('19','GDRIVE_SERVICE_ACCOUNT_EMAIL','Google Drive - Email Cuenta Servicio','Correo de la Service Account de Google Cloud','STORAGE','samanya-backend@samanya-drive.iam.gserviceaccount.com', EMPTY_CLOB(),null,null,'N','S','1',to_date('12/09/26','DD/MM/RR'),to_date('12/09/26','DD/MM/RR'),null);

COMMIT;

-- =============================================================================
-- 18. CONTROL DE DOTACIÓN Y ENTREGAS A RESIDENTES (CATÁLOGO Y ASIGNACIONES)
-- =============================================================================
PROMPT 18. Insertando Dotación Inicial y Entregas a Residentes...

-- 18.1 Catálogo Maestro de Dotación
MERGE INTO SMY_DOTACION_CATALOGO dest
USING (
    SELECT 1 AS ID, 1 AS ID_ORGANIZACION, 'Juego de sábanas completo (Sobresábana, bajera, funda)' AS NOMBRE_ELEMENTO, 'Lencería y Ropa de Cama' AS CATEGORIA, 2 AS CANTIDAD_DEFECTO, 12 AS FRECUENCIA_CAMBIO_MESES, 'Juego 100% algodón 200 hilos para cama hospitalaria/geriátrica. Renovación cada 12 meses.' AS DESCRIPCION, 1 AS ES_SUGERIDO_INGRESO, 'Activo' AS ESTADO FROM DUAL
    UNION ALL SELECT 2, 1, 'Cobija térmica o plumón liviano', 'Lencería y Ropa de Cama', 1, 24, 'Manta térmica hipoalergénica lavable en máquina. Recambio sugerido cada 24 meses.', 1, 'Activo' FROM DUAL
    UNION ALL SELECT 3, 1, 'Almohada ortopédica ergonómica', 'Lencería y Ropa de Cama', 1, 12, 'Almohada viscoelástica con forro antifluido. Cambio recomendado cada año.', 1, 'Activo' FROM DUAL
    UNION ALL SELECT 4, 1, 'Juego de toallas (Cuerpo, manos y pies)', 'Aseo y Cuidado Personal', 2, 6, 'Toallas de baño absorbentes personalizadas. Recambio cada 6 meses.', 1, 'Activo' FROM DUAL
    UNION ALL SELECT 5, 1, 'Protector de colchón antifluido', 'Lencería y Ropa de Cama', 1, 12, 'Cubrecolchón impermeable y transpirable. Recambio anual.', 1, 'Activo' FROM DUAL
    UNION ALL SELECT 6, 1, 'Kit menaje personal (Pocillo térmico, vaso y cubiertos)', 'Menaje', 1, NULL, 'Vajilla personal irrompible libre de BPA. Entrega única al ingreso.', 1, 'Activo' FROM DUAL
    UNION ALL SELECT 7, 1, 'Neceser y kit de higiene personal inicial', 'Aseo y Cuidado Personal', 1, 1, 'Cepillo, crema dental, esponja suave y jabonera. Reposición mensual.', 1, 'Activo' FROM DUAL
) src ON (dest.ID = src.ID)
WHEN NOT MATCHED THEN
INSERT (ID, ID_ORGANIZACION, NOMBRE_ELEMENTO, CATEGORIA, CANTIDAD_DEFECTO, FRECUENCIA_CAMBIO_MESES, DESCRIPCION, ES_SUGERIDO_INGRESO, ESTADO)
VALUES (src.ID, src.ID_ORGANIZACION, src.NOMBRE_ELEMENTO, src.CATEGORIA, src.CANTIDAD_DEFECTO, src.FRECUENCIA_CAMBIO_MESES, src.DESCRIPCION, src.ES_SUGERIDO_INGRESO, src.ESTADO);

-- 18.2 Entregas Físicas a Residentes con Estados de Vigencia y Semáforo de Cambio
MERGE INTO SMY_DOTACION_RESIDENTES dest
USING (
    -- Residente 1 (Álvaro Delgado) - Ingreso hace 11 meses: Sábanas próximas a vencer en 1 mes (Amarillo)
    SELECT 1 AS ID, 1 AS ID_RESIDENTE, 1 AS ID_ELEMENTO_CATALOGO, 'Juego de sábanas completo (Sobresábana, bajera, funda)' AS NOMBRE_ELEMENTO, 'Lencería y Ropa de Cama' AS CATEGORIA, 2 AS CANTIDAD, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), -11) AS FECHA_ENTREGA, 12 AS FRECUENCIA_CAMBIO_MESES, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), 1) AS FECHA_PROXIMO_CAMBIO, 'Entregado' AS ESTADO_ELEMENTO, 'Nuevo' AS CONDICION_ENTREGA, 'Entregado en admisión inicial' AS NOTAS, 1 AS ID_USUARIO_ENTREGA, NULL AS FECHA_ULTIMO_CAMBIO FROM DUAL
    UNION ALL
    SELECT 2, 1, 3, 'Almohada ortopédica ergonómica', 'Lencería y Ropa de Cama', 1, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), -11), 12, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), 1), 'Entregado', 'Nuevo', 'Funda azul marcada con nombre', 1, NULL FROM DUAL
    UNION ALL
    SELECT 3, 1, 4, 'Juego de toallas (Cuerpo, manos y pies)', 'Aseo y Cuidado Personal', 2, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), -5), 6, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), 1), 'Entregado', 'Nuevo', 'Toallas bordadas', 1, NULL FROM DUAL
    UNION ALL
    -- Residente 2 (Elena Pérez) - Sábanas vencidas hace 1 mes: Requiere recambio anual obligatorio (Rojo)
    SELECT 4, 2, 1, 'Juego de sábanas completo (Sobresábana, bajera, funda)', 'Lencería y Ropa de Cama', 2, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), -13), 12, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), -1), 'Cambio Pendiente', 'Nuevo', 'Cumplió 1 año de uso en cama clínica. Requiere recambio programado.', 1, NULL FROM DUAL
    UNION ALL
    SELECT 5, 2, 2, 'Cobija térmica o plumón liviano', 'Lencería y Ropa de Cama', 1, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), -13), 24, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), 11), 'Entregado', 'Nuevo', 'Buen estado de conservación', 1, NULL FROM DUAL
    UNION ALL
    -- Residente 3 (Carlos Mario Restrepo) - Entrega reciente: Vigente por 10 meses (Verde)
    SELECT 6, 3, 1, 'Juego de sábanas completo (Sobresábana, bajera, funda)', 'Lencería y Ropa de Cama', 2, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), -2), 12, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), 10), 'Entregado', 'Nuevo', 'Dotación estándar de admisión', 1, NULL FROM DUAL
    UNION ALL
    SELECT 7, 3, 6, 'Kit menaje personal (Pocillo térmico, vaso y cubiertos)', 'Menaje', 1, ADD_MONTHS(TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)), -2), NULL, NULL, 'Entregado', 'Nuevo', 'Identificado con número de habitación', 1, NULL FROM DUAL
) src ON (dest.ID = src.ID)
WHEN NOT MATCHED THEN
INSERT (ID, ID_RESIDENTE, ID_ELEMENTO_CATALOGO, NOMBRE_ELEMENTO, CATEGORIA, CANTIDAD, FECHA_ENTREGA, FRECUENCIA_CAMBIO_MESES, FECHA_PROXIMO_CAMBIO, ESTADO_ELEMENTO, CONDICION_ENTREGA, NOTAS, ID_USUARIO_ENTREGA, FECHA_ULTIMO_CAMBIO)
VALUES (src.ID, src.ID_RESIDENTE, src.ID_ELEMENTO_CATALOGO, src.NOMBRE_ELEMENTO, src.CATEGORIA, src.CANTIDAD, src.FECHA_ENTREGA, src.FRECUENCIA_CAMBIO_MESES, src.FECHA_PROXIMO_CAMBIO, src.ESTADO_ELEMENTO, src.CONDICION_ENTREGA, src.NOTAS, src.ID_USUARIO_ENTREGA, src.FECHA_ULTIMO_CAMBIO);

-- 18.3 Historial de Recambio de Prueba
MERGE INTO SMY_DOTACION_HISTORIAL dest
USING (
    SELECT 1 AS ID, 3 AS ID_DOTACION_RESIDENTE, TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS DATE)) - 30 AS FECHA_CAMBIO, 'Renovación Periódica' AS MOTIVO, 'Nuevo' AS CONDICION_NUEVO, 'Recambio semestral de toallas de baño efectuado conforme a protocolo.' AS OBSERVACIONES, 1 AS ID_USUARIO_REGISTRA FROM DUAL
) src ON (dest.ID = src.ID)
WHEN NOT MATCHED THEN
INSERT (ID, ID_DOTACION_RESIDENTE, FECHA_CAMBIO, MOTIVO, CONDICION_NUEVO, OBSERVACIONES, ID_USUARIO_REGISTRA)
VALUES (src.ID, src.ID_DOTACION_RESIDENTE, src.FECHA_CAMBIO, src.MOTIVO, src.CONDICION_NUEVO, src.OBSERVACIONES, src.ID_USUARIO_REGISTRA);

COMMIT;

-- =============================================================================
-- 19. SINCRONIZACIÓN DE SECUENCIAS ORACLE (AUTO-INCREMENT)
-- Garantiza que las secuencias queden posicionadas por encima del ID máximo
-- insertado manualmente para que nuevos INSERTs automáticos desde la app no fallen.
-- Compatible con Oracle 11g / 12c / 19c / 21c / 23c.
-- =============================================================================
PROMPT 19. Sincronizando Secuencias Oracle dinámicamente (Todas las tablas)...

DECLARE
    v_max_id NUMBER;
    v_curr   NUMBER;
    v_sql    VARCHAR2(500);
    v_count  NUMBER := 0;
BEGIN
    -- Recorre dinámicamente todas las tablas con secuencias asociadas a sus triggers
    -- Cumpliendo con el estándar: sintaxis tradicional de Oracle (sin ANSI JOIN)
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
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;
    END LOOP;
END;
/

COMMIT;

PROMPT ============================================================================
PROMPT   POBLACIÓN DE DATOS DUMMY COMPLETADA CON ÉXITO
PROMPT   RESUMEN:
PROMPT     - 2 Organizaciones y 3 Centros Geriátricos Multi-Tenant
PROMPT     - 3 Registros de Dueños / Socios y 23 Asignaciones Multi-Sede en SMY_CENTRO_USUARIOS
PROMPT     - 10 Residentes registrados con Historia Clínica (6 en Central, 4 en Campestre)
PROMPT     - 4 Empleados / Cuidadores asignados por sede
PROMPT     - 2 Solicitudes previas de admisión con contactos
PROMPT     - 14 Familiares / Acudientes creados con usuarios
PROMPT     - 2 Residentes con 3 familiares cada uno vinculados
PROMPT     - Turnos, Signos, Medicamentos, Bitácoras y Consentimientos activos
PROMPT     - Dotación de ingreso: Catálogo configurado, entregas físicas y alertas de recambio
PROMPT     - 33 Secuencias Oracle sincronizadas (incluye SEQ_SMY_ARCHIVOS)
PROMPT     - 17 Parámetros del sistema y credenciales Google Drive configurados
PROMPT     - Contraseña universal para todos los usuarios: Samanya2026*
PROMPT ============================================================================
