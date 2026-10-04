-- =============================================================================
-- SISTEMA DE GESTIÓN INTEGRAL PARA CENTROS GERIÁTRICOS (SAMANYA OS)
-- SCRIPT DE MIGRACIÓN: CAMBIOS_BD_FICHA.SQL
-- PROPÓSITO: Ficha Técnica de Ingreso y Valoración Integral del Adulto Mayor
-- ESTÁNDAR: Oracle 11g / 12c / 19c / 21c / 23c (UTC-5 Bogotá, Colombia)
-- =============================================================================
-- INSTRUCCIONES:
-- Ejecute este script como usuario del esquema SAMANYA en SQL*Plus, SQLcl o SQL Developer.
-- =============================================================================

ALTER SESSION SET NLS_LANGUAGE = 'SPANISH';
ALTER SESSION SET NLS_TERRITORY = 'COLOMBIA';

PROMPT ============================================================================
PROMPT INICIANDO APLICACIÓN DE CAMBIOS PARA FICHA TÉCNICA DE INGRESO
PROMPT ============================================================================

-- -----------------------------------------------------------------------------
-- 1. CREACIÓN DE CATÁLOGO MAESTRO: SMY_ESTADOS_CIVILES
-- -----------------------------------------------------------------------------
PROMPT 1. Creando tabla SMY_ESTADOS_CIVILES y secuencia...

CREATE TABLE SMY_ESTADOS_CIVILES (
    ID                              NUMBER(10)          NOT NULL,
    NOMBRE_ESTADO_CIVIL             VARCHAR2(50)        NOT NULL,
    DESCRIPCION                     VARCHAR2(200),
    FECHA_CREACION                  DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) NOT NULL,
    ID_USUARIO_ULTIMA_MODIFICACION  NUMBER(10),
    CONSTRAINT PK_SMY_ESTADOS_CIVILES PRIMARY KEY (ID),
    CONSTRAINT UQ_SMY_ESTCIV_NOMBRE   UNIQUE (NOMBRE_ESTADO_CIVIL)
);

CREATE SEQUENCE SEQ_SMY_ESTADOS_CIVILES START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_SMY_ESTADOS_CIVILES_BI
BEFORE INSERT ON SMY_ESTADOS_CIVILES FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT SEQ_SMY_ESTADOS_CIVILES.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

COMMENT ON TABLE SMY_ESTADOS_CIVILES IS 'Catálogo maestro de estados civiles para residentes y personas vinculadas.';
COMMENT ON COLUMN SMY_ESTADOS_CIVILES.ID IS 'Clave primaria autoincremental de estado civil.';
COMMENT ON COLUMN SMY_ESTADOS_CIVILES.NOMBRE_ESTADO_CIVIL IS 'Nombre formal del estado civil (SOLTERO(A), CASADO(A), UNION_LIBRE, etc.).';
COMMENT ON COLUMN SMY_ESTADOS_CIVILES.DESCRIPCION IS 'Descripción operativa del estado civil.';
COMMENT ON COLUMN SMY_ESTADOS_CIVILES.FECHA_CREACION IS 'Fecha y hora de registro con zona horaria legal de Bogotá (UTC-5).';
COMMENT ON COLUMN SMY_ESTADOS_CIVILES.ID_USUARIO_ULTIMA_MODIFICACION IS 'Usuario que realizó la última modificación.';

-- Inserción de catálogo base
INSERT INTO SMY_ESTADOS_CIVILES (ID, NOMBRE_ESTADO_CIVIL, DESCRIPCION) VALUES (1, 'SOLTERO(A)', 'Persona que no ha contraído matrimonio ni convive en unión libre.');
INSERT INTO SMY_ESTADOS_CIVILES (ID, NOMBRE_ESTADO_CIVIL, DESCRIPCION) VALUES (2, 'CASADO(A)', 'Persona unida legalmente en matrimonio.');
INSERT INTO SMY_ESTADOS_CIVILES (ID, NOMBRE_ESTADO_CIVIL, DESCRIPCION) VALUES (3, 'UNION_LIBRE', 'Persona que convive en unión marital de hecho.');
INSERT INTO SMY_ESTADOS_CIVILES (ID, NOMBRE_ESTADO_CIVIL, DESCRIPCION) VALUES (4, 'VIUDO(A)', 'Persona cuyo cónyuge o compañero ha fallecido.');
INSERT INTO SMY_ESTADOS_CIVILES (ID, NOMBRE_ESTADO_CIVIL, DESCRIPCION) VALUES (5, 'DIVORCIADO(A)', 'Persona que ha disuelto legalmente su vínculo matrimonial.');
COMMIT;

-- -----------------------------------------------------------------------------
-- 2. AMPLIACIÓN DE SMY_RESIDENTES (DATOS BIOGRÁFICOS Y PERSONALES)
-- -----------------------------------------------------------------------------
PROMPT 2. Modificando tabla SMY_RESIDENTES con nuevos atributos biográficos...

ALTER TABLE SMY_RESIDENTES ADD (
    LUGAR_NACIMIENTO        VARCHAR2(100),
    ID_ESTADO_CIVIL         NUMBER(10),
    OCUPACION_HISTORICA     VARCHAR2(150),
    NIVEL_EDUCATIVO         VARCHAR2(80),
    RELIGION_CREENCIA       VARCHAR2(80),
    CONSTRAINT FK_SMY_RES_EST_CIVIL FOREIGN KEY (ID_ESTADO_CIVIL) REFERENCES SMY_ESTADOS_CIVILES(ID)
);

COMMENT ON COLUMN SMY_RESIDENTES.LUGAR_NACIMIENTO IS 'Municipio y departamento o país de nacimiento del adulto mayor.';
COMMENT ON COLUMN SMY_RESIDENTES.ID_ESTADO_CIVIL IS 'Clave foránea hacia SMY_ESTADOS_CIVILES.';
COMMENT ON COLUMN SMY_RESIDENTES.OCUPACION_HISTORICA IS 'Oficio, profesión o actividad laboral que desempeñó durante su vida.';
COMMENT ON COLUMN SMY_RESIDENTES.NIVEL_EDUCATIVO IS 'Nivel de escolaridad alcanzado (Primaria, Secundaria, Técnico, Universitario, etc.).';
COMMENT ON COLUMN SMY_RESIDENTES.RELIGION_CREENCIA IS 'Creencia religiosa o espiritual del adulto mayor.';

-- -----------------------------------------------------------------------------
-- 3. AMPLIACIÓN DE SMY_RESIDENTE_ACUDIENTE (RED FAMILIAR Y AUTORIZACIONES)
-- -----------------------------------------------------------------------------
PROMPT 3. Modificando tabla SMY_RESIDENTE_ACUDIENTE con roles afectivos y permisos...

ALTER TABLE SMY_RESIDENTE_ACUDIENTE ADD (
    ES_CERCANIA_AFECTIVA        CHAR(1)      DEFAULT 'N' NOT NULL,
    ASUME_ACOMPANAMIENTO        CHAR(1)      DEFAULT 'N' NOT NULL,
    FRECUENCIA_CONTACTO         VARCHAR2(40),
    AUTORIZADO_INFO_MEDICA      CHAR(1)      DEFAULT 'S' NOT NULL,
    AUTORIZADO_ACOMPANAR_CITAS  CHAR(1)      DEFAULT 'S' NOT NULL,
    AUTORIZADO_TRAMITES         CHAR(1)      DEFAULT 'S' NOT NULL,
    RELACION_NOTAS              VARCHAR2(500),
    CONSTRAINT CK_SMY_RESACU_CERCA   CHECK (ES_CERCANIA_AFECTIVA IN ('S', 'N')),
    CONSTRAINT CK_SMY_RESACU_ACOMP   CHECK (ASUME_ACOMPANAMIENTO IN ('S', 'N')),
    CONSTRAINT CK_SMY_RESACU_INFOMED CHECK (AUTORIZADO_INFO_MEDICA IN ('S', 'N')),
    CONSTRAINT CK_SMY_RESACU_ACITAS  CHECK (AUTORIZADO_ACOMPANAR_CITAS IN ('S', 'N')),
    CONSTRAINT CK_SMY_RESACU_TRAM    CHECK (AUTORIZADO_TRAMITES IN ('S', 'N'))
);

COMMENT ON COLUMN SMY_RESIDENTE_ACUDIENTE.ES_CERCANIA_AFECTIVA IS 'Indica si es la persona de mayor cercanía afectiva identificada (S/N).';
COMMENT ON COLUMN SMY_RESIDENTE_ACUDIENTE.ASUME_ACOMPANAMIENTO IS 'Indica si es la persona que asume principalmente el acompañamiento (S/N).';
COMMENT ON COLUMN SMY_RESIDENTE_ACUDIENTE.FRECUENCIA_CONTACTO IS 'Frecuencia esperada de contacto/visita (DIARIO, SEMANAL, QUINCENAL, MENSUAL, ESPORADICO).';
COMMENT ON COLUMN SMY_RESIDENTE_ACUDIENTE.AUTORIZADO_INFO_MEDICA IS 'Autorizado formalmente para recibir información médica confidencial (S/N).';
COMMENT ON COLUMN SMY_RESIDENTE_ACUDIENTE.AUTORIZADO_ACOMPANAR_CITAS IS 'Autorizado para acompañar al residente a citas médicas externas (S/N).';
COMMENT ON COLUMN SMY_RESIDENTE_ACUDIENTE.AUTORIZADO_TRAMITES IS 'Autorizado para realizar diligencias y trámites institucionales (S/N).';
COMMENT ON COLUMN SMY_RESIDENTE_ACUDIENTE.RELACION_NOTAS IS 'Observaciones sobre la relación o dinámicas familiares relevantes.';

-- -----------------------------------------------------------------------------
-- 4. CREACIÓN DE TABLA: SMY_VALORACIONES_INGRESO
-- -----------------------------------------------------------------------------
PROMPT 4. Creando tabla SMY_VALORACIONES_INGRESO y secuencia...

CREATE TABLE SMY_VALORACIONES_INGRESO (
    ID                              NUMBER(10)          NOT NULL,
    ID_RESIDENTE                    NUMBER(10)          NOT NULL,
    ID_CENTRO                       NUMBER(10)          NOT NULL,
    CODIGO_FICHA                    VARCHAR2(30)        NOT NULL,
    FECHA_VALORACION                DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) NOT NULL,
    ID_USUARIO_EVALUADOR            NUMBER(10),
    NOMBRE_EVALUADOR                VARCHAR2(150),
    CARGO_EVALUADOR                 VARCHAR2(100),
    -- Historia de Vida y Enfoque Biográfico
    LUGAR_CRECIMIENTO               VARCHAR2(150),
    ACONTECIMIENTOS_IMPORTANTES     CLOB,
    PERDIDAS_DUELOS_SIGNIFICATIVOS  CLOB,
    COSTUMBRES_TRADICIONES          CLOB,
    GUSTOS_PASATIEMPOS_MUSICA       CLOB,
    ASPECTOS_TRANQUILIDAD           CLOB,
    ASPECTOS_TEMOR_INCOMODIDAD      CLOB,
    RASGOS_PERSONALIDAD             CLOB,
    RUTINAS_HABITOS_DIARIOS         CLOB,
    -- Motivo y Adaptación
    MOTIVO_INGRESO                  CLOB,
    EXPECTATIVAS_INGRESO            CLOB,
    DISPOSICION_ADAPTACION          VARCHAR2(500),
    -- Valoración Clínica y Dominios Geriátricos
    ESTADO_GENERAL_INGRESO          CLOB,
    SIGNOS_VITALES_JSON             CLOB,
    COGNITIVO_ORIENTACION           CLOB,
    EMOCIONAL_CONDUCTUAL            CLOB,
    MOVILIDAD_FUNCIONAL             CLOB,
    NUTRICION_ALIMENTACION          CLOB,
    ELIMINACION_CONTINENCIA         CLOB,
    HIGIENE_AUTOCUIDADO             CLOB,
    PATRON_SUENO                    CLOB,
    TERAPIAS_APOYOS_EXTERNOS        CLOB,
    AYUDAS_TECNICAS                 CLOB,
    -- Matriz de Riesgos y Nivel de Dependencia
    RIESGO_CAIDAS                   VARCHAR2(20),       -- 'BAJO', 'MEDIO', 'ALTO'
    RIESGO_ULCERAS_PRESION          VARCHAR2(20),       -- 'BAJO', 'MEDIO', 'ALTO'
    RIESGO_FUGA                     VARCHAR2(20),       -- 'BAJO', 'MEDIO', 'ALTO'
    RIESGO_BRONCOASPIRACION         VARCHAR2(20),       -- 'BAJO', 'MEDIO', 'ALTO'
    GRADO_DEPENDENCIA_GLOBAL        VARCHAR2(50),       -- 'INDEPENDIENTE', 'ASISTENCIA_LEVE', 'ASISTENCIA_MODERADA', 'GRAN_DEPENDENCIA'
    CONDICIONES_FISICAS_PIEL        CLOB,
    -- Genograma y Red de Apoyo No Familiar
    RED_APOYO_NO_FAMILIAR           CLOB,
    DATOS_GENOGRAMA_JSON            CLOB,
    ID_ARCHIVO_GENOGRAMA            NUMBER(10),
    -- Concepto y Cierre
    CONCEPTO_GENERAL_INGRESO        CLOB,
    RECOMENDACIONES_PLAN_CUIDADOS   CLOB,
    NOMBRE_ENTREGA_RESPONSABLE      VARCHAR2(150),
    IDENTIFICACION_ENTREGA          VARCHAR2(30),
    PARENTESCO_ENTREGA              VARCHAR2(50),
    TELEFONO_ENTREGA                VARCHAR2(30),
    ACEPTACION_TERMINOS             CHAR(1)             DEFAULT 'S' NOT NULL,
    ID_ARCHIVO_FIRMA_ENTREGA        NUMBER(10),
    FIRMA_ENTREGA_BASE64            CLOB,
    -- Auditoría
    FECHA_CREACION                  DATE                DEFAULT CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE) NOT NULL,
    ID_USUARIO_ULTIMA_MODIFICACION  NUMBER(10),
    CONSTRAINT PK_SMY_VALORACIONES_INGRESO PRIMARY KEY (ID),
    CONSTRAINT UQ_SMY_VALING_CODFICHA      UNIQUE (CODIGO_FICHA),
    CONSTRAINT FK_SMY_VALING_RESIDENTE     FOREIGN KEY (ID_RESIDENTE)             REFERENCES SMY_RESIDENTES(ID),
    CONSTRAINT FK_SMY_VALING_CENTRO        FOREIGN KEY (ID_CENTRO)                REFERENCES SMY_CENTROS(ID),
    CONSTRAINT FK_SMY_VALING_USUEVAL       FOREIGN KEY (ID_USUARIO_EVALUADOR)     REFERENCES SMY_USUARIOS(ID),
    CONSTRAINT FK_SMY_VALING_ARCHGEN       FOREIGN KEY (ID_ARCHIVO_GENOGRAMA)     REFERENCES SMY_ARCHIVOS(ID),
    CONSTRAINT FK_SMY_VALING_ARCHFIRMA     FOREIGN KEY (ID_ARCHIVO_FIRMA_ENTREGA) REFERENCES SMY_ARCHIVOS(ID),
    CONSTRAINT CK_SMY_VALING_ACEPTA        CHECK (ACEPTACION_TERMINOS IN ('S', 'N'))
);


-- Garantizar columna FIRMA_ENTREGA_BASE64 si la tabla ya existía
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE SMY_VALORACIONES_INGRESO ADD (FIRMA_ENTREGA_BASE64 CLOB)';
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END;
/

CREATE SEQUENCE SEQ_SMY_VALORACIONES_INGRESO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_SMY_VALORACIONES_INGRESO_BI
BEFORE INSERT ON SMY_VALORACIONES_INGRESO FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT SEQ_SMY_VALORACIONES_INGRESO.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

COMMENT ON TABLE SMY_VALORACIONES_INGRESO IS 'Ficha Técnica de Ingreso y Valoración Multidimensional Integral del Adulto Mayor (Atención Centrada en la Persona).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ID IS 'Clave primaria autoincremental de la valoración.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ID_RESIDENTE IS 'Clave foránea hacia SMY_RESIDENTES.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ID_CENTRO IS 'Sede o centro geriátrico donde se efectúa el ingreso.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.CODIGO_FICHA IS 'Código único documental del expediente de valoración (ej. VAL-2026-001).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.FECHA_VALORACION IS 'Fecha y hora en que se diligenció el instrumento de ingreso.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ID_USUARIO_EVALUADOR IS 'Usuario profesional que realizó la valoración.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.NOMBRE_EVALUADOR IS 'Nombre completo del profesional evaluador.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.CARGO_EVALUADOR IS 'Cargo del evaluador (Enfermero(a) Jefe, Médico(a), Trabajador(a) Social, Psicólogo(a)).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.LUGAR_CRECIMIENTO IS 'Municipio o entorno donde el residente creció y pasó su infancia/juventud.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ACONTECIMIENTOS_IMPORTANTES IS 'Hitos de vida, logros, momentos trascendentales y trayectoria vital.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.PERDIDAS_DUELOS_SIGNIFICATIVOS IS 'Pérdidas familiares recientes, viudez, duelos o experiencias difíciles.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.COSTUMBRES_TRADICIONES IS 'Prácticas culturales, festividades, espiritualidad y costumbres.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.GUSTOS_PASATIEMPOS_MUSICA IS 'Música preferida, lectura, manualidades, juegos y actividades de disfrute.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ASPECTOS_TRANQUILIDAD IS 'Factores, palabras o acciones que le generan calma, alegría y bienestar.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ASPECTOS_TEMOR_INCOMODIDAD IS 'Disparadores de angustia, temor, frustración, irritabilidad o rechazo.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.RASGOS_PERSONALIDAD IS 'Características de personalidad descritas por la familia y por el propio adulto mayor.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.RUTINAS_HABITOS_DIARIOS IS 'Horarios usuales de despertar, siestas, café, lectura, paseo y descanso nocturno.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.MOTIVO_INGRESO IS 'Causas determinantes del ingreso (dependencia, soledad, sobrecarga cuidador, rehabilitación).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.EXPECTATIVAS_INGRESO IS 'Expectativas del residente y de su familia frente a la estadía en el centro.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.DISPOSICION_ADAPTACION IS 'Actitud del residente frente al ingreso (voluntario, receptivo, reacio, confundido).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ESTADO_GENERAL_INGRESO IS 'Descripción clínica y general del estado en el instante de la recepción.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.SIGNOS_VITALES_JSON IS 'Documento JSON con signos vitales iniciales (TA, FC, FR, Temp, SpO2, Peso, Talla, IMC).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.COGNITIVO_ORIENTACION IS 'Orientación temporo-espacial, memoria reciente/remota y atención.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.EMOCIONAL_CONDUCTUAL IS 'Estado anímico, labilidad, signos depresivos o ansiosos, colaboración.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.MOVILIDAD_FUNCIONAL IS 'Capacidad de marcha, transferencias cama-silla, equilibrio y antecedentes de caídas.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.NUTRICION_ALIMENTACION IS 'Autonomía para alimentarse, reflejo de deglución, disfagia, apetito y preferencias.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ELIMINACION_CONTINENCIA IS 'Control vesical y rectal, uso de pañal absorbente, talla y frecuencia estimada de recambio.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.HIGIENE_AUTOCUIDADO IS 'Nivel de asistencia requerido para baño (ducha/cama), aseo bucal, vestido y afeitado.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.PATRON_SUENO IS 'Calidad del sueño nocturno, despertares, siestas diurnas y soporte farmacológico.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.TERAPIAS_APOYOS_EXTERNOS IS 'Requerimiento de terapia física, ocupacional, respiratoria, fonoaudiología o curaciones.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.AYUDAS_TECNICAS IS 'Dispositivos de apoyo utilizados: lentes, audífonos, prótesis dental, bastón, caminador, silla de ruedas.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.RIESGO_CAIDAS IS 'Nivel de riesgo de caídas según valoración (BAJO, MEDIO, ALTO).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.RIESGO_ULCERAS_PRESION IS 'Nivel de riesgo de lesiones por presión según escala Braden (BAJO, MEDIO, ALTO).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.RIESGO_FUGA IS 'Riesgo de deambulación errática o fuga del centro (BAJO, MEDIO, ALTO).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.RIESGO_BRONCOASPIRACION IS 'Riesgo de atragantamiento o broncoaspiración (BAJO, MEDIO, ALTO).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.GRADO_DEPENDENCIA_GLOBAL IS 'Clasificación global de dependencia (INDEPENDIENTE, ASISTENCIA_LEVE, ASISTENCIA_MODERADA, GRAN_DEPENDENCIA).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.CONDICIONES_FISICAS_PIEL IS 'Inspección de piel: integridad cutánea, hidratación, cicatrices, equimosis o escaras.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.RED_APOYO_NO_FAMILIAR IS 'Contactos comunitarios, vecinos, amigos entrañables o cuidadores anteriores significativos.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.DATOS_GENOGRAMA_JSON IS 'Estructura JSON serializada con nodos y enlaces familiares para renderizado visual del árbol genealógico.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ID_ARCHIVO_GENOGRAMA IS 'Referencia a SMY_ARCHIVOS si se anexa una imagen o diagrama escaneado del genograma.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.CONCEPTO_GENERAL_INGRESO IS 'Síntesis diagnóstica y concepto interdisciplinario de ingreso.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.RECOMENDACIONES_PLAN_CUIDADOS IS 'Indicaciones prioritarias para el plan de atención y cuidados diarios.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.NOMBRE_ENTREGA_RESPONSABLE IS 'Nombre del familiar o responsable que entrega formalmente al adulto mayor.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.IDENTIFICACION_ENTREGA IS 'Número de identificación del responsable que entrega.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.PARENTESCO_ENTREGA IS 'Parentesco con el residente.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.TELEFONO_ENTREGA IS 'Teléfono de contacto de quien entrega.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ACEPTACION_TERMINOS IS 'Constancia de conocimiento y aceptación del reglamento institucional y consentimientos (S/N).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ID_ARCHIVO_FIRMA_ENTREGA IS 'Referencia a SMY_ARCHIVOS con la firma digitalizada o acta suscrita.';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.FECHA_CREACION IS 'Fecha y hora de registro con zona horaria legal de Bogotá (UTC-5).';
COMMENT ON COLUMN SMY_VALORACIONES_INGRESO.ID_USUARIO_ULTIMA_MODIFICACION IS 'Usuario que realizó la última modificación.';

PROMPT ============================================================================
PROMPT SCRIPT CAMBIOS_BD_FICHA.SQL COMPLETADO SATISFACTORIAMENTE
PROMPT ============================================================================
