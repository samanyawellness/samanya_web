-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_ALIMENTACION
-- FAMILIA: pkgln_ (Lógica de Negocio y Reglas de Dominio)
-- DOMINIO: Módulo de Alimentación, Dietas y Nutrición
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_ALIMENTACION
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_ALIMENTACION
    || Propósito: Orquestación de lógica de negocio del módulo de alimentación,
    ||           planes nutricionales, menús semanales, control de ingesta y
    ||           asistencia a comedores.
    || Estándar: Sin DML directos, validación con DAOs/pkgca/pkgcn, transacciones con
    ||           p_do_commit, captura WHEN OTHERS con uti_ge_excepciones_pkg.p_grabar_log.
    || =========================================================================
    */

    /**
     * Habilita o deshabilita el módulo de alimentación para una sede
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "manejaAlimentacion": "S",
     *   "actualizadoPor": "ADMIN"
     * }
     */
    PROCEDURE pr_configurar_modulo_alimentacion (
        pcl_json IN CLOB
    );

    /**
     * Registra o actualiza el plan nutricional individual de un residente
     * Parámetro pcl_json:
     * {
     *   "id": 1,
     *   "idCentro": 1,
     *   "idResidente": 5,
     *   "idTipoDieta": 2,
     *   "idConsistencia": 1,
     *   "idNivelEspesante": 3,
     *   "requerimientoCaloricoKcal": 1800,
     *   "restriccionesAlergias": "Sin mariscos ni lácteos enteros",
     *   "alimentosPreferidos": "Frutas suaves, pescado",
     *   "alimentosRechazados": "Brócoli, coliflor",
     *   "requiereAsistencia": "S",
     *   "suplementoNutricional": "Ensure Advance 1 toma a las 16:00",
     *   "observaciones": "Comer en posición fowler 90 grados",
     *   "usuario": "NUTRICIONISTA_ANA"
     * }
     */
    PROCEDURE pr_guardar_plan_nutricional (
        pcl_json IN CLOB
    );

    /**
     * Registra o actualiza la cabecera de una minuta semanal
     * Parámetro pcl_json:
     * {
     *   "id": 1,
     *   "idCentro": 1,
     *   "nombre": "Menú Semana 41 - Salud Cardiovascular",
     *   "descripcion": "Menú balanceado bajo en sodio",
     *   "fechaInicio": "2026-10-05",
     *   "fechaFin": "2026-10-11",
     *   "estado": "ACTIVO",
     *   "usuario": "CHEF_CARLOS"
     * }
     */
    PROCEDURE pr_guardar_minuta_semanal (
        pcl_json IN CLOB
    );

    /**
     * Registra o actualiza un plato en la minuta semanal
     * Parámetro pcl_json:
     * {
     *   "id": 1,
     *   "idMinuta": 1,
     *   "diaSemana": 1,
     *   "idTiempoComida": 3,
     *   "platoPrincipal": "Pechuga a la plancha con finas hierbas",
     *   "acompanamiento": "Arroz integral y ensalada de verduras al vapor",
     *   "bebida": "Jugo de guanábana sin azúcar",
     *   "postre": "Papaya picada",
     *   "caloriasEstimadas": 550,
     *   "observacionesDietas": "Adaptar consistencia para papilla a residentes con disfagia",
     *   "usuario": "CHEF_CARLOS"
     * }
     */
    PROCEDURE pr_guardar_item_minuta (
        pcl_json IN CLOB
    );

    /**
     * Registra o actualiza la ingesta de un residente en el comedor
     * Parámetro pcl_json:
     * {
     *   "id": 10,
     *   "idCentro": 1,
     *   "idResidente": 5,
     *   "fecha": "2026-10-04",
     *   "idTiempoComida": 3,
     *   "porcentajeIngesta": 40,
     *   "liquidosMl": 150,
     *   "tolerancia": "REGULAR",
     *   "asistio": "S",
     *   "observaciones": "Rechazó la proteína, refiere inapetencia",
     *   "idEmpleadoRegistra": 2,
     *   "usuario": "AUX_ENFERMERIA_LAURA"
     * }
     */
    PROCEDURE pr_registrar_ingesta_comedor (
        pcl_json IN CLOB
    );

    /**
     * Precarga los registros de comedor del día para un tiempo de comida específico
     */
    PROCEDURE pr_precargar_asistencia_dia (
        pcl_json IN CLOB
    );

    /**
     * Consultas operativas que delegan a paquetes pkgca_ / pkgcn_
     */
    PROCEDURE pr_consultar_planes_centro (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    PROCEDURE pr_consultar_minutas_centro (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    PROCEDURE pr_consultar_comedor_dia (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    FUNCTION fn_resumen_comedor_dia_json (
        pcl_json IN CLOB
    ) RETURN CLOB;

END PKGLN_ALIMENTACION;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_ALIMENTACION
AS

    PROCEDURE pr_configurar_modulo_alimentacion (
        pcl_json IN CLOB
    )
    IS
        v_id_centro       NUMBER;
        v_maneja_alim     VARCHAR2(1);
        v_usuario         VARCHAR2(100);
        vro_centro        smy_centros%ROWTYPE;
        vro_error         smy_errores%ROWTYPE;
    BEGIN
        v_id_centro   := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_maneja_alim := UPPER(TRIM(NVL(JSON_VALUE(pcl_json, '$.manejaAlimentacion'), 'S')));
        v_usuario     := NVL(JSON_VALUE(pcl_json, '$.actualizadoPor'), 'SISTEMA');

        IF v_id_centro IS NULL THEN
            RAISE_APPLICATION_ERROR(-20010, 'El ID del centro es obligatorio.');
        END IF;

        IF v_maneja_alim NOT IN ('S', 'N') THEN
            RAISE_APPLICATION_ERROR(-20011, 'El valor para manejaAlimentacion debe ser S o N.');
        END IF;

        IF PKGSMY_CENTROS_DAO.f_existe(v_id_centro, vro_centro) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20012, 'El centro o sede no existe.');
        END IF;

        vro_centro.maneja_alimentacion := v_maneja_alim;

        PKGSMY_CENTROS_DAO.p_actualizar(vro_centro);

        p_do_commit('pkgln_alimentacion.pr_configurar_modulo_alimentacion');
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ALIMENTACION';
            vro_error.nombre_metodo   := 'PR_CONFIGURAR_MODULO_ALIMENTACION';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_configurar_modulo_alimentacion;

    PROCEDURE pr_guardar_plan_nutricional (
        pcl_json IN CLOB
    )
    IS
        v_id                   NUMBER;
        v_id_centro            NUMBER;
        v_id_residente         NUMBER;
        v_id_tipo_dieta        NUMBER;
        v_id_consistencia      NUMBER;
        v_id_nivel_espesante   NUMBER;
        v_req_calorico         NUMBER;
        v_restricciones        VARCHAR2(1000);
        v_preferidos           VARCHAR2(1000);
        v_rechazados           VARCHAR2(1000);
        v_req_asistencia       VARCHAR2(1);
        v_suplemento           VARCHAR2(500);
        v_observaciones        VARCHAR2(2000);
        v_usuario              VARCHAR2(100);
        v_inactivar_json       CLOB;
        vro_plan               smy_plan_nutricional%ROWTYPE;
        vro_residente          smy_residentes%ROWTYPE;
        vro_error              smy_errores%ROWTYPE;
    BEGIN
        v_id                 := TO_NUMBER(JSON_VALUE(pcl_json, '$.id'));
        v_id_centro          := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_residente       := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_id_tipo_dieta      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoDieta'));
        v_id_consistencia    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idConsistencia'));
        v_id_nivel_espesante := TO_NUMBER(JSON_VALUE(pcl_json, '$.idNivelEspesante'));
        v_req_calorico       := TO_NUMBER(JSON_VALUE(pcl_json, '$.requerimientoCaloricoKcal'));
        v_restricciones      := TRIM(JSON_VALUE(pcl_json, '$.restriccionesAlergias'));
        v_preferidos         := TRIM(JSON_VALUE(pcl_json, '$.alimentosPreferidos'));
        v_rechazados         := TRIM(JSON_VALUE(pcl_json, '$.alimentosRechazados'));
        v_req_asistencia     := UPPER(TRIM(NVL(JSON_VALUE(pcl_json, '$.requiereAsistencia'), 'N')));
        v_suplemento         := TRIM(JSON_VALUE(pcl_json, '$.suplementoNutricional'));
        v_observaciones      := TRIM(JSON_VALUE(pcl_json, '$.observaciones'));
        v_usuario            := NVL(JSON_VALUE(pcl_json, '$.usuario'), 'SISTEMA');

        IF v_id_residente IS NULL THEN
            RAISE_APPLICATION_ERROR(-20020, 'El ID del residente es obligatorio para el plan nutricional.');
        END IF;

        IF PKGSMY_RESIDENTES_DAO.f_existe(v_id_residente, vro_residente) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20021, 'El residente especificado no existe.');
        END IF;

        IF v_id_centro IS NULL THEN
            v_id_centro := vro_residente.id_centro;
        END IF;

        IF v_id_tipo_dieta IS NOT NULL THEN
            IF PKGSMY_TIPOS_DIETAS_DAO.f_existe(v_id_tipo_dieta) = FALSE THEN
                RAISE_APPLICATION_ERROR(-20022, 'El tipo de dieta especificado no existe.');
            END IF;
        END IF;

        IF v_id_consistencia IS NOT NULL THEN
            IF PKGSMY_CONSISTENCIAS_DIETA_DAO.f_existe(v_id_consistencia) = FALSE THEN
                RAISE_APPLICATION_ERROR(-20023, 'La consistencia de dieta especificada no existe.');
            END IF;
        END IF;

        IF v_id_nivel_espesante IS NOT NULL THEN
            IF PKGSMY_NIVELES_ESPESANTE_DAO.f_existe(v_id_nivel_espesante) = FALSE THEN
                RAISE_APPLICATION_ERROR(-20024, 'El nivel de espesante especificado no existe.');
            END IF;
        END IF;

        IF v_id IS NOT NULL AND v_id > 0 THEN
            IF PKGSMY_PLAN_NUTRICIONAL_DAO.f_existe(v_id, vro_plan) = FALSE THEN
                RAISE_APPLICATION_ERROR(-20025, 'El plan nutricional especificado no existe.');
            END IF;

            vro_plan.id_centro                   := v_id_centro;
            vro_plan.id_tipo_dieta               := v_id_tipo_dieta;
            vro_plan.id_consistencia             := v_id_consistencia;
            vro_plan.id_nivel_espesante          := v_id_nivel_espesante;
            vro_plan.requerimiento_calorico_kcal := v_req_calorico;
            vro_plan.restricciones_alergias      := v_restricciones;
            vro_plan.alimentos_preferidos        := v_preferidos;
            vro_plan.alimentos_rechazados        := v_rechazados;
            vro_plan.requiere_asistencia         := v_req_asistencia;
            vro_plan.suplemento_nutricional      := v_suplemento;
            vro_plan.observaciones               := v_observaciones;
            vro_plan.actualizado_por             := v_usuario;
            vro_plan.fecha_actualizacion         := f_fecha_actual;

            PKGSMY_PLAN_NUTRICIONAL_DAO.p_actualizar(vro_plan);
        ELSE
            -- Inactivar planes anteriores para este residente
            v_inactivar_json := '{"idResidente":' || v_id_residente || ',"actualizadoPor":"' || v_usuario || '"}';
            PKGCA_SMY_PLAN_NUTRICIONAL.p_inactivar_planes_anteriores(v_inactivar_json);

            -- Insertar nuevo plan activo
            vro_plan.id                          := SEQ_SMY_PLAN_NUTRICIONAL.NEXTVAL;
            vro_plan.id_centro                   := v_id_centro;
            vro_plan.id_residente                := v_id_residente;
            vro_plan.id_tipo_dieta               := v_id_tipo_dieta;
            vro_plan.id_consistencia             := v_id_consistencia;
            vro_plan.id_nivel_espesante          := v_id_nivel_espesante;
            vro_plan.requerimiento_calorico_kcal := v_req_calorico;
            vro_plan.restricciones_alergias      := v_restricciones;
            vro_plan.alimentos_preferidos        := v_preferidos;
            vro_plan.alimentos_rechazados        := v_rechazados;
            vro_plan.requiere_asistencia         := v_req_asistencia;
            vro_plan.suplemento_nutricional      := v_suplemento;
            vro_plan.observaciones               := v_observaciones;
            vro_plan.estado                      := 'ACTIVO';
            vro_plan.creado_por                  := v_usuario;
            vro_plan.fecha_creacion              := f_fecha_actual;

            PKGSMY_PLAN_NUTRICIONAL_DAO.p_insertar(vro_plan);
        END IF;

        p_do_commit('pkgln_alimentacion.pr_guardar_plan_nutricional');
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ALIMENTACION';
            vro_error.nombre_metodo   := 'PR_GUARDAR_PLAN_NUTRICIONAL';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_guardar_plan_nutricional;

    PROCEDURE pr_guardar_minuta_semanal (
        pcl_json IN CLOB
    )
    IS
        v_id             NUMBER;
        v_id_centro      NUMBER;
        v_nombre         VARCHAR2(150);
        v_descripcion    VARCHAR2(500);
        v_fecha_ini_str  VARCHAR2(20);
        v_fecha_fin_str  VARCHAR2(20);
        v_fecha_inicio   DATE;
        v_fecha_fin      DATE;
        v_estado         VARCHAR2(20);
        v_usuario        VARCHAR2(100);
        vro_minuta       smy_minutas_semanales%ROWTYPE;
        vro_error        smy_errores%ROWTYPE;
    BEGIN
        v_id            := TO_NUMBER(JSON_VALUE(pcl_json, '$.id'));
        v_id_centro     := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_nombre        := TRIM(JSON_VALUE(pcl_json, '$.nombre'));
        v_descripcion   := TRIM(JSON_VALUE(pcl_json, '$.descripcion'));
        v_fecha_ini_str := JSON_VALUE(pcl_json, '$.fechaInicio');
        v_fecha_fin_str := JSON_VALUE(pcl_json, '$.fechaFin');
        v_estado        := UPPER(TRIM(NVL(JSON_VALUE(pcl_json, '$.estado'), 'ACTIVO')));
        v_usuario       := NVL(JSON_VALUE(pcl_json, '$.usuario'), 'SISTEMA');

        IF v_id_centro IS NULL THEN
            RAISE_APPLICATION_ERROR(-20030, 'El ID de la sede o centro es obligatorio.');
        END IF;

        IF PKGSMY_CENTROS_DAO.f_existe(v_id_centro) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20031, 'El centro especificado no existe.');
        END IF;

        IF v_nombre IS NULL THEN
            RAISE_APPLICATION_ERROR(-20032, 'El nombre de la minuta semanal es obligatorio.');
        END IF;

        IF v_fecha_ini_str IS NOT NULL THEN
            v_fecha_inicio := TO_DATE(v_fecha_ini_str, 'YYYY-MM-DD');
        ELSE
            v_fecha_inicio := TRUNC(f_fecha_actual);
        END IF;

        IF v_fecha_fin_str IS NOT NULL THEN
            v_fecha_fin := TO_DATE(v_fecha_fin_str, 'YYYY-MM-DD');
        ELSE
            v_fecha_fin := v_fecha_inicio + 6;
        END IF;

        IF v_estado = 'ACTIVO' THEN
            -- Desactivar minutas anteriores activas para el centro
            PKGCA_SMY_MINUTAS_SEMANALES.p_desactivar_minutas_anteriores(
                '{"idCentro":' || v_id_centro || ',"actualizadoPor":"' || v_usuario || '"}'
            );
        END IF;

        IF v_id IS NOT NULL AND v_id > 0 THEN
            IF PKGSMY_MINUTAS_SEMANALES_DAO.f_existe(v_id, vro_minuta) = FALSE THEN
                RAISE_APPLICATION_ERROR(-20033, 'La minuta especificada no existe.');
            END IF;

            vro_minuta.id_centro           := v_id_centro;
            vro_minuta.nombre              := v_nombre;
            vro_minuta.descripcion         := v_descripcion;
            vro_minuta.fecha_inicio        := v_fecha_inicio;
            vro_minuta.fecha_fin           := v_fecha_fin;
            vro_minuta.estado              := v_estado;
            vro_minuta.actualizado_por     := v_usuario;
            vro_minuta.fecha_actualizacion := f_fecha_actual;

            PKGSMY_MINUTAS_SEMANALES_DAO.p_actualizar(vro_minuta);
        ELSE
            vro_minuta.id             := SEQ_SMY_MINUTAS_SEMANALES.NEXTVAL;
            vro_minuta.id_centro      := v_id_centro;
            vro_minuta.nombre         := v_nombre;
            vro_minuta.descripcion    := v_descripcion;
            vro_minuta.fecha_inicio   := v_fecha_inicio;
            vro_minuta.fecha_fin      := v_fecha_fin;
            vro_minuta.estado         := v_estado;
            vro_minuta.creado_por     := v_usuario;
            vro_minuta.fecha_creacion := f_fecha_actual;

            PKGSMY_MINUTAS_SEMANALES_DAO.p_insertar(vro_minuta);
        END IF;

        p_do_commit('pkgln_alimentacion.pr_guardar_minuta_semanal');
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ALIMENTACION';
            vro_error.nombre_metodo   := 'PR_GUARDAR_MINUTA_SEMANAL';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_guardar_minuta_semanal;

    PROCEDURE pr_guardar_item_minuta (
        pcl_json IN CLOB
    )
    IS
        v_id              NUMBER;
        v_id_minuta       NUMBER;
        v_dia_semana      NUMBER;
        v_id_tiempo       NUMBER;
        v_plato           VARCHAR2(300);
        v_acompanamiento  VARCHAR2(300);
        v_bebida          VARCHAR2(200);
        v_postre          VARCHAR2(200);
        v_calorias        NUMBER;
        v_observaciones   VARCHAR2(500);
        v_usuario         VARCHAR2(100);
        vro_item          smy_minuta_items%ROWTYPE;
        vro_error         smy_errores%ROWTYPE;
    BEGIN
        v_id             := TO_NUMBER(JSON_VALUE(pcl_json, '$.id'));
        v_id_minuta      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idMinuta'));
        v_dia_semana     := TO_NUMBER(JSON_VALUE(pcl_json, '$.diaSemana'));
        v_id_tiempo      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTiempoComida'));
        v_plato          := TRIM(JSON_VALUE(pcl_json, '$.platoPrincipal'));
        v_acompanamiento := TRIM(JSON_VALUE(pcl_json, '$.acompanamiento'));
        v_bebida         := TRIM(JSON_VALUE(pcl_json, '$.bebida'));
        v_postre         := TRIM(JSON_VALUE(pcl_json, '$.postre'));
        v_calorias       := TO_NUMBER(JSON_VALUE(pcl_json, '$.caloriasEstimadas'));
        v_observaciones  := TRIM(JSON_VALUE(pcl_json, '$.observacionesDietas'));
        v_usuario        := NVL(JSON_VALUE(pcl_json, '$.usuario'), 'SISTEMA');

        IF v_id_minuta IS NULL THEN
            RAISE_APPLICATION_ERROR(-20040, 'El ID de la minuta es obligatorio.');
        END IF;

        IF PKGSMY_MINUTAS_SEMANALES_DAO.f_existe(v_id_minuta) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20041, 'La minuta especificada no existe.');
        END IF;

        IF v_dia_semana IS NULL OR v_dia_semana NOT BETWEEN 1 AND 7 THEN
            RAISE_APPLICATION_ERROR(-20042, 'El día de la semana debe ser un valor entre 1 (Lunes) y 7 (Domingo).');
        END IF;

        IF v_id_tiempo IS NULL THEN
            RAISE_APPLICATION_ERROR(-20043, 'El tiempo de comida es obligatorio.');
        END IF;

        IF PKGSMY_TIEMPOS_COMIDA_DAO.f_existe(v_id_tiempo) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20044, 'El tiempo de comida especificado no existe.');
        END IF;

        IF v_id IS NOT NULL AND v_id > 0 THEN
            IF PKGSMY_MINUTA_ITEMS_DAO.f_existe(v_id, vro_item) = FALSE THEN
                RAISE_APPLICATION_ERROR(-20045, 'El plato de minuta especificado no existe.');
            END IF;

            vro_item.id_minuta            := v_id_minuta;
            vro_item.dia_semana           := v_dia_semana;
            vro_item.id_tiempo_comida     := v_id_tiempo;
            vro_item.plato_principal      := v_plato;
            vro_item.acompanamiento       := v_acompanamiento;
            vro_item.bebida               := v_bebida;
            vro_item.postre               := v_postre;
            vro_item.calorias_estimadas   := v_calorias;
            vro_item.observaciones_dietas := v_observaciones;
            vro_item.actualizado_por      := v_usuario;
            vro_item.fecha_actualizacion  := f_fecha_actual;

            PKGSMY_MINUTA_ITEMS_DAO.p_actualizar(vro_item);
        ELSE
            vro_item.id                   := SEQ_SMY_MINUTA_ITEMS.NEXTVAL;
            vro_item.id_minuta            := v_id_minuta;
            vro_item.dia_semana           := v_dia_semana;
            vro_item.id_tiempo_comida     := v_id_tiempo;
            vro_item.plato_principal      := v_plato;
            vro_item.acompanamiento       := v_acompanamiento;
            vro_item.bebida               := v_bebida;
            vro_item.postre               := v_postre;
            vro_item.calorias_estimadas   := v_calorias;
            vro_item.observaciones_dietas := v_observaciones;
            vro_item.creado_por           := v_usuario;
            vro_item.fecha_creacion       := f_fecha_actual;

            PKGSMY_MINUTA_ITEMS_DAO.p_insertar(vro_item);
        END IF;

        p_do_commit('pkgln_alimentacion.pr_guardar_item_minuta');
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ALIMENTACION';
            vro_error.nombre_metodo   := 'PR_GUARDAR_ITEM_MINUTA';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_guardar_item_minuta;

    PROCEDURE pr_registrar_ingesta_comedor (
        pcl_json IN CLOB
    )
    IS
        v_id              NUMBER;
        v_id_centro       NUMBER;
        v_id_residente    NUMBER;
        v_fecha_str       VARCHAR2(20);
        v_fecha           DATE;
        v_id_tiempo       NUMBER;
        v_porcentaje      NUMBER;
        v_liquidos        NUMBER;
        v_tolerancia      VARCHAR2(30);
        v_asistio         VARCHAR2(1);
        v_observaciones   VARCHAR2(1000);
        v_id_empleado     NUMBER;
        v_usuario         VARCHAR2(100);
        vro_ingesta       smy_registros_alimentacion%ROWTYPE;
        vro_error         smy_errores%ROWTYPE;
    BEGIN
        v_id           := TO_NUMBER(JSON_VALUE(pcl_json, '$.id'));
        v_id_centro    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_fecha_str    := JSON_VALUE(pcl_json, '$.fecha');
        v_id_tiempo    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTiempoComida'));
        v_porcentaje   := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.porcentajeIngesta')), 0);
        v_liquidos     := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.liquidosMl')), 0);
        v_tolerancia   := NVL(TRIM(JSON_VALUE(pcl_json, '$.tolerancia')), 'BUENA');
        v_asistio      := UPPER(TRIM(NVL(JSON_VALUE(pcl_json, '$.asistio'), 'S')));
        v_observaciones:= TRIM(JSON_VALUE(pcl_json, '$.observaciones'));
        v_id_empleado  := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEmpleadoRegistra'));
        v_usuario      := NVL(JSON_VALUE(pcl_json, '$.usuario'), 'SISTEMA');

        IF v_fecha_str IS NOT NULL THEN
            v_fecha := TO_DATE(v_fecha_str, 'YYYY-MM-DD');
        ELSE
            v_fecha := TRUNC(f_fecha_actual);
        END IF;

        IF v_id IS NOT NULL AND v_id > 0 THEN
            IF PKGSMY_REGISTROS_ALIMENTACION_DAO.f_existe(v_id, vro_ingesta) = FALSE THEN
                RAISE_APPLICATION_ERROR(-20050, 'El registro de alimentación especificado no existe.');
            END IF;

            vro_ingesta.porcentaje_ingesta   := v_porcentaje;
            vro_ingesta.liquidos_ml          := v_liquidos;
            vro_ingesta.tolerancia           := v_tolerancia;
            vro_ingesta.asistio              := v_asistio;
            vro_ingesta.observaciones        := v_observaciones;
            vro_ingesta.id_empleado_registra := v_id_empleado;
            vro_ingesta.actualizado_por      := v_usuario;
            vro_ingesta.fecha_actualizacion  := f_fecha_actual;

            PKGSMY_REGISTROS_ALIMENTACION_DAO.p_actualizar(vro_ingesta);
        ELSE
            -- Registro mono-tabla por criterios no-PK si ya existe para este residente/fecha/tiempo
            PKGCA_SMY_REGISTROS_ALIMENTACION.p_actualizar_ingesta(pcl_json);
        END IF;

        p_do_commit('pkgln_alimentacion.pr_registrar_ingesta_comedor');
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ALIMENTACION';
            vro_error.nombre_metodo   := 'PR_REGISTRAR_INGESTA_COMEDOR';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_ingesta_comedor;

    PROCEDURE pr_precargar_asistencia_dia (
        pcl_json IN CLOB
    )
    IS
        vro_error smy_errores%ROWTYPE;
    BEGIN
        PKGCN_ALIMENTACION.p_precargar_ingestas_dia(pcl_json);
        p_do_commit('pkgln_alimentacion.pr_precargar_asistencia_dia');
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ALIMENTACION';
            vro_error.nombre_metodo   := 'PR_PRECARGAR_ASISTENCIA_DIA';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_precargar_asistencia_dia;

    PROCEDURE pr_consultar_planes_centro (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
    BEGIN
        PKGCA_SMY_PLAN_NUTRICIONAL.p_consultar_planes_centro(
            pcl_json => pcl_json,
            p_cursor => p_cursor
        );
    END pr_consultar_planes_centro;

    PROCEDURE pr_consultar_minutas_centro (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
    BEGIN
        PKGCA_SMY_MINUTAS_SEMANALES.p_consultar_minutas_centro(
            pcl_json => pcl_json,
            p_cursor => p_cursor
        );
    END pr_consultar_minutas_centro;

    PROCEDURE pr_consultar_comedor_dia (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
    BEGIN
        PKGCA_SMY_REGISTROS_ALIMENTACION.p_consultar_comedor_dia(
            pcl_json => pcl_json,
            p_cursor => p_cursor
        );
    END pr_consultar_comedor_dia;

    FUNCTION fn_resumen_comedor_dia_json (
        pcl_json IN CLOB
    ) RETURN CLOB
    IS
    BEGIN
        RETURN PKGCN_ALIMENTACION.f_resumen_comedor_dia_json(pcl_json);
    END fn_resumen_comedor_dia_json;

END PKGLN_ALIMENTACION;
/
