-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_VALORACIONES_INGRESO
-- FAMILIA: pkgca_ (Consultas multi-criterio, filtros y JSON sobre SMY_VALORACIONES_INGRESO)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_VALORACIONES_INGRESO
AS
    /*
    || =========================================================================
    || Paquete: PKGCA_SMY_VALORACIONES_INGRESO
    || Propósito: Capa de consultas, filtros y lectura de fichas de valoración
    ||            integral de ingreso por residente y sede.
    || Estándar: Sin ANSI JOIN (sintaxis tradicional Oracle FROM t1, t2 WHERE),
    ||           parámetros CLOB JSON con JSON_VALUE, retorno SYS_REFCURSOR y JSON nativo.
    || =========================================================================
    */

    /**
     * Retorna cursor con las valoraciones de ingreso de un residente o sede
     * Parámetro pcl_json:
     * {
     *   "idResidente": 1,
     *   "idCentro": 1
     * }
     */
    PROCEDURE p_consultar_por_residente (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    );

    /**
     * Retorna el documento JSON completo de la última valoración de ingreso del residente
     * Parámetro pcl_json:
     * {
     *   "idResidente": 1
     * }
     */
    FUNCTION f_traer_ultima_ficha_json (
        pcl_json IN CLOB
    ) RETURN CLOB;

END PKGCA_SMY_VALORACIONES_INGRESO;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_VALORACIONES_INGRESO
AS

    PROCEDURE p_consultar_por_residente (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    ) IS
        v_id_residente  NUMBER;
        v_id_centro     NUMBER;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_id_centro    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));

        -- Consulta multi-tabla tradicional Oracle (CERO ANSI JOIN)
        OPEN p_cursor FOR
            SELECT 
                v.id,
                v.codigo_ficha,
                v.id_residente,
                r.nombres || ' ' || r.apellidos AS nombre_residente,
                r.identificacion AS identificacion_residente,
                v.id_centro,
                c.nombre_centro AS nombre_centro,
                TO_CHAR(v.fecha_valoracion, 'YYYY-MM-DD HH24:MI:SS') AS fecha_valoracion,
                v.nombre_evaluador,
                v.cargo_evaluador,
                v.riesgo_caidas,
                v.riesgo_ulceras_presion,
                v.riesgo_fuga,
                v.riesgo_broncoaspiracion,
                v.grado_dependencia_global,
                v.nombre_entrega_responsable,
                v.parentesco_entrega,
                v.telefono_entrega,
                v.aceptacion_terminos
            FROM 
                smy_valoraciones_ingreso v,
                smy_residentes r,
                smy_centros c
            WHERE 
                v.id_residente = r.id
                AND v.id_centro = c.id
                AND (v_id_residente IS NULL OR v.id_residente = v_id_residente)
                AND (v_id_centro IS NULL OR v.id_centro = v_id_centro)
            ORDER BY v.fecha_valoracion DESC;
    END p_consultar_por_residente;

    FUNCTION f_traer_ultima_ficha_json (
        pcl_json IN CLOB
    ) RETURN CLOB
    IS
        v_id_residente  NUMBER;
        v_json          CLOB;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));

        IF v_id_residente IS NULL THEN
            RETURN NULL;
        END IF;

        -- Subconsulta tradicional Oracle para la última ficha
        SELECT JSON_OBJECT(
                   'id' VALUE v.id,
                   'codigoFicha' VALUE v.codigo_ficha,
                   'idResidente' VALUE v.id_residente,
                   'nombreResidente' VALUE r.nombres || ' ' || r.apellidos,
                   'identificacion' VALUE r.identificacion,
                   'fechaNacimiento' VALUE TO_CHAR(r.fecha_nacimiento, 'YYYY-MM-DD'),
                   'lugarNacimiento' VALUE r.lugar_nacimiento,
                   'idEstadoCivil' VALUE r.id_estado_civil,
                   'estadoCivil' VALUE ec.nombre_estado_civil,
                   'ocupacionHistorica' VALUE r.ocupacion_historica,
                   'nivelEducativo' VALUE r.nivel_educativo,
                   'religionCreencia' VALUE r.religion_creencia,
                   'habitacion' VALUE r.habitacion,
                   'cama' VALUE r.cama,
                   'eps' VALUE r.eps,
                   'planComplementario' VALUE r.plan_complementario,
                   'tipoSangre' VALUE r.tipo_sangre,
                   'idCentro' VALUE v.id_centro,
                   'fechaValoracion' VALUE TO_CHAR(v.fecha_valoracion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'nombreEvaluador' VALUE v.nombre_evaluador,
                   'cargoEvaluador' VALUE v.cargo_evaluador,
                   'lugarCrecimiento' VALUE v.lugar_crecimiento,
                   'acontecimientosImportantes' VALUE v.acontecimientos_importantes,
                   'perdidasDuelosSignificativos' VALUE v.perdidas_duelos_significativos,
                   'costumbresTradiciones' VALUE v.costumbres_tradiciones,
                   'gustosPasatiemposMusica' VALUE v.gustos_pasatiempos_musica,
                   'aspectosTranquilidad' VALUE v.aspectos_tranquilidad,
                   'aspectosTemorIncomodidad' VALUE v.aspectos_temor_incomodidad,
                   'rasgosPersonalidad' VALUE v.rasgos_personalidad,
                   'rutinasHabitosDiarios' VALUE v.rutinas_habitos_diarios,
                   'motivoIngreso' VALUE v.motivo_ingreso,
                   'expectativasIngreso' VALUE v.expectativas_ingreso,
                   'disposicionAdaptacion' VALUE v.disposicion_adaptacion,
                   'estadoGeneralIngreso' VALUE v.estado_general_ingreso,
                   'signosVitalesJson' VALUE v.signos_vitales_json,
                   'cognitivoOrientacion' VALUE v.cognitivo_orientacion,
                   'emocionalConductual' VALUE v.emocional_conductual,
                   'movilidadFuncional' VALUE v.movilidad_funcional,
                   'nutricionAlimentacion' VALUE v.nutricion_alimentacion,
                   'eliminacionContinencia' VALUE v.eliminacion_continencia,
                   'higieneAutocuidado' VALUE v.higiene_autocuidado,
                   'patronSueno' VALUE v.patron_sueno,
                   'terapiasApoyosExternos' VALUE v.terapias_apoyos_externos,
                   'ayudasTecnicas' VALUE v.ayudas_tecnicas,
                   'riesgoCaidas' VALUE v.riesgo_caidas,
                   'riesgoUlcerasPresion' VALUE v.riesgo_ulceras_presion,
                   'riesgoFuga' VALUE v.riesgo_fuga,
                   'riesgoBroncoaspiracion' VALUE v.riesgo_broncoaspiracion,
                   'gradoDependenciaGlobal' VALUE v.grado_dependencia_global,
                   'condicionesFisicasPiel' VALUE v.condiciones_fisicas_piel,
                   'redApoyoNoFamiliar' VALUE v.red_apoyo_no_familiar,
                   'datosGenogramaJson' VALUE v.datos_genograma_json,
                   'idArchivoGenograma' VALUE v.id_archivo_genograma,
                   'conceptoGeneralIngreso' VALUE v.concepto_general_ingreso,
                   'recomendacionesPlanCuidados' VALUE v.recomendaciones_plan_cuidados,
                   'nombreEntregaResponsable' VALUE v.nombre_entrega_responsable,
                   'identificacionEntrega' VALUE v.identificacion_entrega,
                   'parentescoEntrega' VALUE v.parentesco_entrega,
                   'telefonoEntrega' VALUE v.telefono_entrega,
                   'aceptacionTerminos' VALUE v.aceptacion_terminos,
                   'idArchivoFirmaEntrega' VALUE v.id_archivo_firma_entrega,
                    'firmaEntregaBase64' VALUE v.firma_entrega_base64
                   RETURNING CLOB
               )
          INTO v_json
          FROM 
               smy_valoraciones_ingreso v,
               smy_residentes r,
               smy_estados_civiles ec
         WHERE 
               v.id_residente = r.id
           AND r.id_estado_civil = ec.id(+)
           AND v.id_residente = v_id_residente
           AND v.id = (
               SELECT MAX(v2.id)
                 FROM smy_valoraciones_ingreso v2
                WHERE v2.id_residente = v_id_residente
           );

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_traer_ultima_ficha_json;

END PKGCA_SMY_VALORACIONES_INGRESO;
/
