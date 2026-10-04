-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_ADMISION_RESIDENTE
-- PROCESO: Admisión, Registro Integral y Gestión de Fichas de Residentes
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Lógica de Negocio)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_ADMISION_RESIDENTE
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_ADMISION_RESIDENTE
    || Propósito: Gestionar el flujo de negocio de admisión de nuevos residentes,
    ||            validación de cupos y habitaciones, asignación de cuidados,
    ||            y vinculación con su acudiente responsable inicial.
    || Estándar: Sin sentencias DML directas, interacción vía DAOs por PK,
    ||           parámetros CLOB JSON, commit controlado vía p_do_commit.
    || =========================================================================
    */

    /**
     * Registra la admisión completa de un nuevo residente y su acudiente opcional
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "tipoIdentificacion": "CC",
     *   "identificacion": "24.312.890",
     *   "nombres": "Blanca",
     *   "apellidos": "Gomez de Restrepo",
     *   "fechaNacimiento": "1942-05-14",
     *   "genero": "F",
     *   "habitacion": "104",
     *   "cama": "104-A",
     *   "eps": "Sanitas EPS",
     *   "planComplementario": "Colmedica",
     *   "tipoSangre": "O+",
     *   "idNivelMovilidad": 2,
     *   "idTipoDieta": 3,
     *   "alertasClinicas": "Alergia a penicilina",
     *   "medicamentos": [
     *       {
     *           "medicamento": "Losartan 50mg",
     *           "cantidad": "1 tableta",
     *           "frecuencia": "Cada 12 horas",
     *           "fechaFin": "2026-12-31",
     *           "indicaciones": "Tomar con abundante agua"
     *       }
     *   ],
     *   "acudienteAsociado": {
     *       "nombres": "Claudia Patricia",
     *       "apellidos": "Restrepo Gomez",
     *       "identificacion": "52.489.120",
     *       "idParentesco": 1,
     *       "telefono": "3108459921",
     *       "email": "claudia@gmail.com"
     *   },
     *   "observaciones": "Residente ingresa orientado y colaborador en compañía de su hija. Trae pertenencias completas."
     * }
     */
    PROCEDURE pr_registrar_residente (
        pcl_json IN CLOB
    );

    /**
     * Actualiza la información personal, ubicación, dieta o consideraciones clínicas de un residente existente
     * Parámetro pcl_json:
     * {
     *   "idResidente": 105,
     *   "nombres": "Blanca Ines",
     *   "apellidos": "Gomez de Restrepo",
     *   "identificacion": "24.312.890",
     *   "idTipoIdentificacion": 1,
     *   "fechaNacimiento": "1942-05-14",
     *   "idGenero": 2,
     *   "eps": "Sanitas EPS",
     *   "planComplementario": "Colmedica",
     *   "tipoSangre": "O+",
     *   "habitacion": "108",
     *   "cama": "108-B",
     *   "idNivelMovilidad": 3,
     *   "idTipoDieta": 2,
     *   "alertasClinicas": "Nueva dieta blanda prescrita",
     *   "idEstadoResidente": 1
     * }
     */
    PROCEDURE pr_actualizar_residente (
        pcl_json IN CLOB
    );

    /**
     * Registra o actualiza la Ficha Técnica de Ingreso y Valoración Multidimensional Integral del Adulto Mayor
     */
    PROCEDURE pr_guardar_valoracion_ingreso (
        pcl_json IN CLOB
    );

END PKGLN_ADMISION_RESIDENTE;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_ADMISION_RESIDENTE
AS
    vro_error smy_errores%ROWTYPE;

    PROCEDURE pr_registrar_residente (
        pcl_json IN CLOB
    ) IS
        v_id_centro            smy_residentes.id_centro%TYPE;
        v_identificacion       smy_residentes.identificacion%TYPE;
        v_nombres              smy_residentes.nombres%TYPE;
        v_apellidos            smy_residentes.apellidos%TYPE;
        v_habitacion           smy_residentes.habitacion%TYPE;
        v_cama                 smy_residentes.cama%TYPE;
        v_fecha_nac_str        VARCHAR2(30);

        vro_residente          smy_residentes%ROWTYPE;
        vro_acudiente          smy_acudientes%ROWTYPE;
        vro_res_acu            smy_residente_acudiente%ROWTYPE;
        vro_med                smy_medicamentos_prescritos%ROWTYPE;
        vro_bitacora           smy_bitacora_residente%ROWTYPE;
        v_observaciones        VARCHAR2(4000);

        -- Datos acudiente asociado
        v_acu_nombres          smy_acudientes.nombres%TYPE;
        v_acu_apellidos        smy_acudientes.apellidos%TYPE;
        v_acu_identificacion   smy_acudientes.identificacion%TYPE;
        v_acu_parentesco       smy_residente_acudiente.id_parentesco%TYPE;
        v_acu_telefono         smy_acudientes.telefono_principal%TYPE;
        v_acu_email            smy_acudientes.email%TYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_id_centro      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_identificacion := TRIM(JSON_VALUE(pcl_json, '$.identificacion'));
        v_nombres        := TRIM(JSON_VALUE(pcl_json, '$.nombres'));
        v_apellidos      := TRIM(JSON_VALUE(pcl_json, '$.apellidos'));
        v_habitacion     := TRIM(JSON_VALUE(pcl_json, '$.habitacion'));
        v_cama           := TRIM(JSON_VALUE(pcl_json, '$.cama'));
        v_fecha_nac_str  := JSON_VALUE(pcl_json, '$.fechaNacimiento');

        -- 2. Validaciones de negocio
        IF v_id_centro IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El identificador del centro es obligatorio.');
        END IF;
        IF v_nombres IS NULL OR v_apellidos IS NULL THEN
            RAISE_APPLICATION_ERROR(-20002, 'Los nombres y apellidos del residente son obligatorios.');
        END IF;
        IF v_identificacion IS NULL THEN
            RAISE_APPLICATION_ERROR(-20003, 'El número de identificación del residente es obligatorio.');
        END IF;
        IF v_habitacion IS NULL THEN
            RAISE_APPLICATION_ERROR(-20004, 'La asignación de habitación es obligatoria para la admisión.');
        END IF;

        -- 3. Asignación directa de secuencia y estructuración del registro
        vro_residente.id                     := SEQ_SMY_RESIDENTES.NEXTVAL;
        vro_residente.id_centro              := v_id_centro;
        vro_residente.codigo_expediente      := 'RES-' || TO_CHAR(f_fecha_actual, 'YYYY') || '-' || LPAD(TO_CHAR(vro_residente.id), 4, '0');
        vro_residente.id_tipo_identificacion := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoIdentificacion')), 1);
        vro_residente.identificacion         := v_identificacion;
        vro_residente.nombres                := v_nombres;
        vro_residente.apellidos              := v_apellidos;
        IF v_fecha_nac_str IS NOT NULL THEN
            vro_residente.fecha_nacimiento   := TO_DATE(SUBSTR(v_fecha_nac_str, 1, 10), 'YYYY-MM-DD');
        ELSE
            vro_residente.fecha_nacimiento   := TO_DATE('1945-01-01', 'YYYY-MM-DD');
        END IF;
        vro_residente.id_genero              := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idGenero')), 1);
        vro_residente.habitacion             := v_habitacion;
        vro_residente.cama                   := NVL(v_cama, v_habitacion || '-A');
        vro_residente.eps                    := JSON_VALUE(pcl_json, '$.eps');
        vro_residente.plan_complementario    := JSON_VALUE(pcl_json, '$.planComplementario');
        vro_residente.tipo_sangre            := NVL(JSON_VALUE(pcl_json, '$.tipoSangre'), 'O+');
        vro_residente.id_nivel_movilidad     := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idNivelMovilidad')), 1);
        vro_residente.id_tipo_dieta          := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoDieta')), 1);
        vro_residente.alertas_clinicas       := JSON_VALUE(pcl_json, '$.alertasClinicas');
        vro_residente.id_estado_residente    := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idEstadoResidente')), 1);
        IF JSON_VALUE(pcl_json, '$.fechaIngreso') IS NOT NULL THEN
            vro_residente.fecha_ingreso      := TO_DATE(SUBSTR(JSON_VALUE(pcl_json, '$.fechaIngreso'), 1, 10), 'YYYY-MM-DD');
        ELSE
            vro_residente.fecha_ingreso      := f_fecha_actual;
        END IF;
        vro_residente.fecha_creacion         := f_fecha_actual;

        -- 4. Inserción delegada al DAO exclusivo de la tabla
        PKGSMY_RESIDENTES_DAO.p_insertar(vro_residente);

        -- 5. Si incluye acudiente asociado, se procesa vía sus respectivos DAOs
        v_acu_nombres := TRIM(JSON_VALUE(pcl_json, '$.acudienteAsociado.nombres'));
        IF v_acu_nombres IS NOT NULL THEN
            v_acu_apellidos      := TRIM(JSON_VALUE(pcl_json, '$.acudienteAsociado.apellidos'));
            v_acu_identificacion := TRIM(JSON_VALUE(pcl_json, '$.acudienteAsociado.identificacion'));
            v_acu_parentesco     := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.acudienteAsociado.idParentesco')), 1);
            v_acu_telefono       := TRIM(JSON_VALUE(pcl_json, '$.acudienteAsociado.telefono'));
            v_acu_email          := TRIM(JSON_VALUE(pcl_json, '$.acudienteAsociado.email'));

            vro_acudiente.id                     := SEQ_SMY_ACUDIENTES.NEXTVAL;
            vro_acudiente.id_tipo_identificacion := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.acudienteAsociado.idTipoIdentificacion')), 1);
            vro_acudiente.identificacion         := NVL(v_acu_identificacion, 'PENDIENTE');
            vro_acudiente.nombres                := v_acu_nombres;
            vro_acudiente.apellidos              := v_acu_apellidos;
            vro_acudiente.telefono_principal     := v_acu_telefono;
            vro_acudiente.email                  := v_acu_email;
            vro_acudiente.id_canal_notif_pref    := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.acudienteAsociado.idCanalNotifPref')), 1);
            vro_acudiente.fecha_creacion         := f_fecha_actual;
            PKGSMY_ACUDIENTES_DAO.p_insertar(vro_acudiente);

            -- Registro de la relación Residente-Acudiente
            vro_res_acu.id                 := SEQ_SMY_RESIDENTE_ACUDIENTE.NEXTVAL;
            vro_res_acu.id_residente       := vro_residente.id;
            vro_res_acu.id_acudiente       := vro_acudiente.id;
            vro_res_acu.id_parentesco      := v_acu_parentesco;
            vro_res_acu.es_principal       := 'S';
            vro_res_acu.es_responsable_pago:= 'S';
            vro_res_acu.autorizado_salidas := 'S';
            vro_res_acu.fecha_creacion     := f_fecha_actual;
            PKGSMY_RESIDENTE_ACUDIENTE_DAO.p_insertar(vro_res_acu);
        END IF;

        -- 5.1 Si incluye medicamentos prescritos, se insertan vía su DAO exclusivo
        FOR r_med IN (
            SELECT medicamento,
                   cantidad,
                   frecuencia,
                   fecha_fin,
                   indicaciones
            FROM JSON_TABLE(pcl_json, '$.medicamentos[*]'
                COLUMNS (
                    medicamento  VARCHAR2(120) PATH '$.medicamento',
                    cantidad     VARCHAR2(50)  PATH '$.cantidad',
                    frecuencia   VARCHAR2(100) PATH '$.frecuencia',
                    fecha_fin    VARCHAR2(30)  PATH '$.fechaFin',
                    indicaciones VARCHAR2(500) PATH '$.indicaciones'
                )
            )
        ) LOOP
            IF TRIM(r_med.medicamento) IS NOT NULL THEN
                vro_med.id                     := SEQ_SMY_MEDICAMENTOS_PRESCRITOS.NEXTVAL;
                vro_med.id_residente           := vro_residente.id;
                vro_med.nombre_medicamento     := TRIM(r_med.medicamento);
                vro_med.dosis                  := NVL(TRIM(r_med.cantidad), '1 toma');
                vro_med.cantidad               := TRIM(r_med.cantidad);
                vro_med.id_via_administracion  := 1; -- Vía oral estándar
                vro_med.horarios_fijos         := TRIM(r_med.frecuencia);
                vro_med.indicaciones           := TRIM(r_med.indicaciones);
                vro_med.requiere_foto_comp     := 'N';
                vro_med.fecha_inicio           := f_fecha_actual;
                IF r_med.fecha_fin IS NOT NULL AND LENGTH(TRIM(r_med.fecha_fin)) >= 10 THEN
                    vro_med.fecha_fin          := TO_DATE(SUBSTR(r_med.fecha_fin, 1, 10), 'YYYY-MM-DD');
                ELSE
                    vro_med.fecha_fin          := NULL;
                END IF;
                vro_med.id_estado_medicamento  := 1; -- Activo
                vro_med.fecha_creacion         := f_fecha_actual;
                PKGSMY_MEDICAMENTOS_PRESCRITOS_DAO.p_insertar(vro_med);
            END IF;
        END LOOP;

        -- 5.2 Registro de la observación inicial de admisión en la bitácora del residente (SMY_BITACORA_RESIDENTE)
        -- Regla arquitectónica: Genera el primer registro de bitácora delegando la inserción al DAO de la tabla.
        -- Incluye la distinción '[REGISTRO DEL RESIDENTE]:' al principio del contenido.
        v_observaciones := TRIM(JSON_VALUE(pcl_json, '$.observaciones'));
        IF v_observaciones IS NULL THEN
            v_observaciones := TRIM(JSON_VALUE(pcl_json, '$.observacionesIngreso'));
        END IF;

        IF v_observaciones IS NOT NULL AND LENGTH(v_observaciones) > 0 THEN
            vro_bitacora.contenido := '[REGISTRO DEL RESIDENTE]: ' || v_observaciones;
        ELSE
            vro_bitacora.contenido := '[REGISTRO DEL RESIDENTE]: Admisión inicial y apertura de expediente del residente en sede.';
        END IF;

        vro_bitacora.id                             := SEQ_SMY_BITACORA_RESIDENTE.NEXTVAL;
        vro_bitacora.id_residente                   := vro_residente.id;
        vro_bitacora.id_empleado                    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEmpleado'));
        vro_bitacora.id_usuario                     := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario')), 1);
        vro_bitacora.fecha                          := TRUNC(NVL(vro_residente.fecha_ingreso, f_fecha_actual));
        vro_bitacora.hora                           := TO_CHAR(f_fecha_actual, 'HH24:MI');
        vro_bitacora.id_categoria_bitacora          := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idCategoriaBitacora')), 1); -- 1: Rutina / General
        vro_bitacora.grabado_por_voz                := 'N';
        vro_bitacora.id_archivo_audio               := NULL;
        vro_bitacora.id_archivo_foto                := NULL;
        vro_bitacora.id_turno_asignado              := NULL;
        vro_bitacora.visible_acudiente              := NVL(JSON_VALUE(pcl_json, '$.visibleAcudiente'), 'S');
        vro_bitacora.fecha_creacion                 := f_fecha_actual;
        vro_bitacora.id_usuario_ultima_modificacion := vro_bitacora.id_usuario;

        PKGSMY_BITACORA_RESIDENTE_DAO.p_insertar(vro_bitacora);

        -- 6. Control transaccional mediante p_do_commit
        p_do_commit('pkgln_admision_residente.pr_registrar_residente');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ADMISION_RESIDENTE';
            vro_error.nombre_metodo   := 'PR_REGISTRAR_RESIDENTE';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_residente;

    PROCEDURE pr_actualizar_residente (
        pcl_json IN CLOB
    ) IS
        v_id_residente  smy_residentes.id%TYPE;
        vro_residente   smy_residentes%ROWTYPE;
        v_id_estado_ant smy_residentes.id_estado_residente%TYPE;
        vro_error       smy_errores%ROWTYPE;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));

        IF v_id_residente IS NULL THEN
            RAISE_APPLICATION_ERROR(-20005, 'El identificador del residente es obligatorio.');
        END IF;

        -- Consultar estado actual mediante DAO
        IF PKGSMY_RESIDENTES_DAO.f_existe(v_id_residente, vro_residente) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20006, 'El residente indicado no existe.');
        END IF;

        v_id_estado_ant := vro_residente.id_estado_residente;

        -- Actualizar campos proporcionados
        IF JSON_VALUE(pcl_json, '$.nombres') IS NOT NULL THEN
            vro_residente.nombres := TRIM(JSON_VALUE(pcl_json, '$.nombres'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.apellidos') IS NOT NULL THEN
            vro_residente.apellidos := TRIM(JSON_VALUE(pcl_json, '$.apellidos'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.identificacion') IS NOT NULL THEN
            vro_residente.identificacion := TRIM(JSON_VALUE(pcl_json, '$.identificacion'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.idTipoIdentificacion') IS NOT NULL THEN
            vro_residente.id_tipo_identificacion := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoIdentificacion'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.fechaNacimiento') IS NOT NULL THEN
            vro_residente.fecha_nacimiento := TO_DATE(SUBSTR(JSON_VALUE(pcl_json, '$.fechaNacimiento'), 1, 10), 'YYYY-MM-DD');
        END IF;
        IF JSON_VALUE(pcl_json, '$.idGenero') IS NOT NULL THEN
            vro_residente.id_genero := TO_NUMBER(JSON_VALUE(pcl_json, '$.idGenero'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.eps') IS NOT NULL THEN
            vro_residente.eps := TRIM(JSON_VALUE(pcl_json, '$.eps'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.planComplementario') IS NOT NULL THEN
            vro_residente.plan_complementario := TRIM(JSON_VALUE(pcl_json, '$.planComplementario'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.tipoSangre') IS NOT NULL THEN
            vro_residente.tipo_sangre := TRIM(JSON_VALUE(pcl_json, '$.tipoSangre'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.habitacion') IS NOT NULL THEN
            vro_residente.habitacion := TRIM(JSON_VALUE(pcl_json, '$.habitacion'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.cama') IS NOT NULL THEN
            vro_residente.cama := TRIM(JSON_VALUE(pcl_json, '$.cama'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.idNivelMovilidad') IS NOT NULL THEN
            vro_residente.id_nivel_movilidad := TO_NUMBER(JSON_VALUE(pcl_json, '$.idNivelMovilidad'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.idTipoDieta') IS NOT NULL THEN
            vro_residente.id_tipo_dieta := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoDieta'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.alertasClinicas') IS NOT NULL THEN
            vro_residente.alertas_clinicas := JSON_VALUE(pcl_json, '$.alertasClinicas');
        END IF;
        IF JSON_VALUE(pcl_json, '$.fechaIngreso') IS NOT NULL THEN
            vro_residente.fecha_ingreso := TO_DATE(SUBSTR(JSON_VALUE(pcl_json, '$.fechaIngreso'), 1, 10), 'YYYY-MM-DD');
        END IF;

        -- Manejo robusto del estado del residente (por ID numérico o por nombre)
        DECLARE
            v_nuevo_estado NUMBER(10);
            v_nom_est_in   VARCHAR2(50);
        BEGIN
            IF JSON_VALUE(pcl_json, '$.idEstadoResidente') IS NOT NULL THEN
                v_nuevo_estado := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEstadoResidente'));
            END IF;

            v_nom_est_in := UPPER(TRIM(NVL(JSON_VALUE(pcl_json, '$.estado'), JSON_VALUE(pcl_json, '$.nombreEstado'))));
            IF v_nom_est_in IS NOT NULL THEN
                IF v_nom_est_in LIKE '%ACTIVO%' THEN
                    v_nuevo_estado := 1;
                ELSIF v_nom_est_in LIKE '%EGRESAD%' THEN
                    v_nuevo_estado := 2;
                ELSIF v_nom_est_in LIKE '%HOSPITAL%' THEN
                    v_nuevo_estado := 3;
                ELSIF v_nom_est_in LIKE '%FALLEC%' THEN
                    v_nuevo_estado := 4;
                ELSIF v_nom_est_in LIKE '%OBSERVA%' THEN
                    v_nuevo_estado := 5;
                END IF;
            END IF;

            IF v_nuevo_estado IS NOT NULL THEN
                -- Garantizar que el estado 5 (EN OBSERVACION) exista en SMY_ESTADOS_RESIDENTES
                IF v_nuevo_estado = 5 THEN
                    DECLARE
                        vro_chk_5 smy_estados_residentes%ROWTYPE;
                    BEGIN
                        IF NOT PKGSMY_ESTADOS_RESIDENTES_DAO.f_existe(5, vro_chk_5) THEN
                            vro_chk_5.id                             := 5;
                            vro_chk_5.id_organizacion                := NVL(vro_residente.id_centro, 1);
                            vro_chk_5.nombre_estado_residente        := 'EN OBSERVACION';
                            vro_chk_5.fecha_creacion                 := f_fecha_actual;
                            vro_chk_5.id_usuario_ultima_modificacion := 1;
                            PKGSMY_ESTADOS_RESIDENTES_DAO.p_valores_defecto(vro_chk_5);
                            PKGSMY_ESTADOS_RESIDENTES_DAO.p_insertar(vro_chk_5);
                        END IF;
                    END;
                END IF;

                vro_residente.id_estado_residente := v_nuevo_estado;

                -- Ajustar fecha de egreso según el estado con hora oficial de Bogotá
                IF vro_residente.id_estado_residente IN (2, 4) AND vro_residente.fecha_egreso IS NULL THEN
                    vro_residente.fecha_egreso := f_fecha_actual;
                ELSIF vro_residente.id_estado_residente NOT IN (2, 4) THEN
                    vro_residente.fecha_egreso := NULL;
                END IF;
            END IF;
        END;

        -- Auditoría de modificación
        vro_residente.id_usuario_ultima_modificacion := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario')), 1);

        -- Modificación delegada al DAO exclusivo de la tabla
        PKGSMY_RESIDENTES_DAO.p_actualizar(vro_residente);

        -- Registrar en bitácora si hubo cambio de estado administrativo
        IF vro_residente.id_estado_residente IS NOT NULL 
           AND v_id_estado_ant IS NOT NULL 
           AND vro_residente.id_estado_residente <> v_id_estado_ant THEN
            
            DECLARE
                vro_estado_ant    smy_estados_residentes%ROWTYPE;
                vro_estado_nuevo  smy_estados_residentes%ROWTYPE;
                v_nom_ant         VARCHAR2(100) := 'Desconocido';
                v_nom_nuevo       VARCHAR2(100) := 'Desconocido';
                v_obs_cambio      VARCHAR2(4000);
                vro_bitacora      smy_bitacora_residente%ROWTYPE;
            BEGIN
                IF PKGSMY_ESTADOS_RESIDENTES_DAO.f_existe(v_id_estado_ant, vro_estado_ant) THEN
                    v_nom_ant := vro_estado_ant.nombre_estado_residente;
                END IF;

                IF PKGSMY_ESTADOS_RESIDENTES_DAO.f_existe(vro_residente.id_estado_residente, vro_estado_nuevo) THEN
                    v_nom_nuevo := vro_estado_nuevo.nombre_estado_residente;
                END IF;

                v_obs_cambio := TRIM(JSON_VALUE(pcl_json, '$.observacionCambioEstado'));
                IF v_obs_cambio IS NULL THEN
                    v_obs_cambio := TRIM(JSON_VALUE(pcl_json, '$.observaciones'));
                END IF;

                vro_bitacora.id                             := SEQ_SMY_BITACORA_RESIDENTE.NEXTVAL;
                vro_bitacora.id_residente                   := v_id_residente;
                vro_bitacora.id_empleado                    := NULL;
                vro_bitacora.id_usuario                     := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario')), 1);
                vro_bitacora.fecha                          := TRUNC(f_fecha_actual);
                vro_bitacora.hora                           := TO_CHAR(f_fecha_actual, 'HH24:MI');
                vro_bitacora.id_categoria_bitacora          := 1;
                vro_bitacora.contenido                      := '[CAMBIO DE ESTADO]: De "' || v_nom_ant || '" a "' || v_nom_nuevo || '".' 
                                                              || CASE WHEN v_obs_cambio IS NOT NULL THEN ' Observación: ' || v_obs_cambio ELSE '' END;
                vro_bitacora.grabado_por_voz                := 'N';
                vro_bitacora.id_archivo_audio               := NULL;
                vro_bitacora.id_archivo_foto                := NULL;
                vro_bitacora.id_turno_asignado              := NULL;
                vro_bitacora.visible_acudiente              := 'S';
                vro_bitacora.fecha_creacion                 := f_fecha_actual;
                vro_bitacora.id_usuario_ultima_modificacion := vro_bitacora.id_usuario;

                PKGSMY_BITACORA_RESIDENTE_DAO.p_valores_defecto(vro_bitacora);
                PKGSMY_BITACORA_RESIDENTE_DAO.p_insertar(vro_bitacora);
            END;
        ELSIF TRIM(JSON_VALUE(pcl_json, '$.observaciones')) IS NOT NULL 
           OR TRIM(JSON_VALUE(pcl_json, '$.observacionCambioEstado')) IS NOT NULL THEN
            DECLARE
                v_obs_extra        VARCHAR2(4000);
                vro_bitacora_extra smy_bitacora_residente%ROWTYPE;
            BEGIN
                v_obs_extra := TRIM(NVL(JSON_VALUE(pcl_json, '$.observacionCambioEstado'), JSON_VALUE(pcl_json, '$.observaciones')));
                IF v_obs_extra IS NOT NULL THEN
                    vro_bitacora_extra.id                             := SEQ_SMY_BITACORA_RESIDENTE.NEXTVAL;
                    vro_bitacora_extra.id_residente                   := v_id_residente;
                    vro_bitacora_extra.id_empleado                    := NULL;
                    vro_bitacora_extra.id_usuario                     := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario')), 1);
                    vro_bitacora_extra.fecha                          := TRUNC(f_fecha_actual);
                    vro_bitacora_extra.hora                           := TO_CHAR(f_fecha_actual, 'HH24:MI');
                    vro_bitacora_extra.id_categoria_bitacora          := 1;
                    vro_bitacora_extra.contenido                      := '[ACTUALIZACION]: ' || v_obs_extra;
                    vro_bitacora_extra.grabado_por_voz                := 'N';
                    vro_bitacora_extra.id_archivo_audio               := NULL;
                    vro_bitacora_extra.id_archivo_foto                := NULL;
                    vro_bitacora_extra.id_turno_asignado              := NULL;
                    vro_bitacora_extra.visible_acudiente              := 'S';
                    vro_bitacora_extra.fecha_creacion                 := f_fecha_actual;
                    vro_bitacora_extra.id_usuario_ultima_modificacion := vro_bitacora_extra.id_usuario;

                    PKGSMY_BITACORA_RESIDENTE_DAO.p_valores_defecto(vro_bitacora_extra);
                    PKGSMY_BITACORA_RESIDENTE_DAO.p_insertar(vro_bitacora_extra);
                END IF;
            END;
        END IF;

        -- Commit controlado
        p_do_commit('pkgln_admision_residente.pr_actualizar_residente');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ADMISION_RESIDENTE';
            vro_error.nombre_metodo   := 'PR_ACTUALIZAR_RESIDENTE';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_actualizar_residente;

    PROCEDURE pr_guardar_valoracion_ingreso (
        pcl_json IN CLOB
    ) IS
        v_id_residente      smy_residentes.id%TYPE;
        v_id_centro         smy_centros.id%TYPE;
        v_id_valing         smy_valoraciones_ingreso.id%TYPE;
        vro_valing          smy_valoraciones_ingreso%ROWTYPE;
        vro_residente       smy_residentes%ROWTYPE;
        v_existe_residente  BOOLEAN;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_id_centro    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_valing    := TO_NUMBER(JSON_VALUE(pcl_json, '$.id'));

        IF v_id_residente IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El identificador del residente es obligatorio para registrar la valoración.');
        END IF;

        v_existe_residente := PKGSMY_RESIDENTES_DAO.f_existe(v_id_residente, vro_residente);
        IF NOT v_existe_residente THEN
            RAISE_APPLICATION_ERROR(-20002, 'El residente especificado no existe en el sistema.');
        END IF;

        IF v_id_centro IS NULL THEN
            v_id_centro := vro_residente.id_centro;
        END IF;

        -- 1. Actualizar datos biográficos permanentes en el residente si vienen en el payload
        IF JSON_VALUE(pcl_json, '$.lugarNacimiento') IS NOT NULL THEN
            vro_residente.lugar_nacimiento := TRIM(JSON_VALUE(pcl_json, '$.lugarNacimiento'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.idEstadoCivil') IS NOT NULL THEN
            vro_residente.id_estado_civil := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEstadoCivil'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.ocupacionHistorica') IS NOT NULL THEN
            vro_residente.ocupacion_historica := TRIM(JSON_VALUE(pcl_json, '$.ocupacionHistorica'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.nivelEducativo') IS NOT NULL THEN
            vro_residente.nivel_educativo := TRIM(JSON_VALUE(pcl_json, '$.nivelEducativo'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.religionCreencia') IS NOT NULL THEN
            vro_residente.religion_creencia := TRIM(JSON_VALUE(pcl_json, '$.religionCreencia'));
        END IF;
        PKGSMY_RESIDENTES_DAO.p_actualizar(vro_residente);

        -- 2. Poblar registro de valoración de ingreso
        IF v_id_valing IS NOT NULL AND PKGSMY_VALORACIONES_INGRESO_DAO.f_existe(v_id_valing, vro_valing) THEN
            -- Actualización de ficha existente
            NULL;
        ELSE
            -- Nueva ficha
            vro_valing.id                 := SEQ_SMY_VALORACIONES_INGRESO.NEXTVAL;
            vro_valing.codigo_ficha       := 'VAL-' || TO_CHAR(f_fecha_actual, 'YYYY') || '-' || LPAD(TO_CHAR(vro_valing.id), 4, '0');
            vro_valing.fecha_creacion     := f_fecha_actual;
            vro_valing.fecha_valoracion   := f_fecha_actual;
        END IF;

        vro_valing.id_residente                   := v_id_residente;
        vro_valing.id_centro                      := v_id_centro;
        vro_valing.id_usuario_evaluador           := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuarioEvaluador')), 1);
        vro_valing.nombre_evaluador               := TRIM(JSON_VALUE(pcl_json, '$.nombreEvaluador'));
        vro_valing.cargo_evaluador                := TRIM(JSON_VALUE(pcl_json, '$.cargoEvaluador'));
        vro_valing.lugar_crecimiento              := TRIM(JSON_VALUE(pcl_json, '$.lugarCrecimiento'));
        vro_valing.acontecimientos_importantes    := JSON_VALUE(pcl_json, '$.acontecimientosImportantes');
        vro_valing.perdidas_duelos_significativos := JSON_VALUE(pcl_json, '$.perdidasDuelosSignificativos');
        vro_valing.costumbres_tradiciones         := JSON_VALUE(pcl_json, '$.costumbresTradiciones');
        vro_valing.gustos_pasatiempos_musica      := JSON_VALUE(pcl_json, '$.gustosPasatiemposMusica');
        vro_valing.aspectos_tranquilidad          := JSON_VALUE(pcl_json, '$.aspectosTranquilidad');
        vro_valing.aspectos_temor_incomodidad     := JSON_VALUE(pcl_json, '$.aspectosTemorIncomodidad');
        vro_valing.rasgos_personalidad            := JSON_VALUE(pcl_json, '$.rasgosPersonalidad');
        vro_valing.rutinas_habitos_diarios        := JSON_VALUE(pcl_json, '$.rutinasHabitosDiarios');
        vro_valing.motivo_ingreso                 := JSON_VALUE(pcl_json, '$.motivoIngreso');
        vro_valing.expectativas_ingreso           := JSON_VALUE(pcl_json, '$.expectativasIngreso');
        vro_valing.disposicion_adaptacion         := TRIM(JSON_VALUE(pcl_json, '$.disposicionAdaptacion'));
        vro_valing.estado_general_ingreso         := JSON_VALUE(pcl_json, '$.estadoGeneralIngreso');
        vro_valing.signos_vitales_json            := JSON_VALUE(pcl_json, '$.signosVitalesJson');
        vro_valing.cognitivo_orientacion          := JSON_VALUE(pcl_json, '$.cognitivoOrientacion');
        vro_valing.emocional_conductual           := JSON_VALUE(pcl_json, '$.emocionalConductual');
        vro_valing.movilidad_funcional            := JSON_VALUE(pcl_json, '$.movilidadFuncional');
        vro_valing.nutricion_alimentacion         := JSON_VALUE(pcl_json, '$.nutricionAlimentacion');
        vro_valing.eliminacion_continencia        := JSON_VALUE(pcl_json, '$.eliminacionContinencia');
        vro_valing.higiene_autocuidado            := JSON_VALUE(pcl_json, '$.higieneAutocuidado');
        vro_valing.patron_sueno                   := JSON_VALUE(pcl_json, '$.patronSueno');
        vro_valing.terapias_apoyos_externos       := JSON_VALUE(pcl_json, '$.terapiasApoyosExternos');
        vro_valing.ayudas_tecnicas                := JSON_VALUE(pcl_json, '$.ayudasTecnicas');
        vro_valing.riesgo_caidas                  := NVL(TRIM(JSON_VALUE(pcl_json, '$.riesgoCaidas')), 'BAJO');
        vro_valing.riesgo_ulceras_presion         := NVL(TRIM(JSON_VALUE(pcl_json, '$.riesgoUlcerasPresion')), 'BAJO');
        vro_valing.riesgo_fuga                    := NVL(TRIM(JSON_VALUE(pcl_json, '$.riesgoFuga')), 'BAJO');
        vro_valing.riesgo_broncoaspiracion        := NVL(TRIM(JSON_VALUE(pcl_json, '$.riesgoBroncoaspiracion')), 'BAJO');
        vro_valing.grado_dependencia_global       := NVL(TRIM(JSON_VALUE(pcl_json, '$.gradoDependenciaGlobal')), 'INDEPENDIENTE');
        vro_valing.condiciones_fisicas_piel       := JSON_VALUE(pcl_json, '$.condicionesFisicasPiel');
        vro_valing.red_apoyo_no_familiar          := JSON_VALUE(pcl_json, '$.redApoyoNoFamiliar');
        vro_valing.datos_genograma_json           := JSON_VALUE(pcl_json, '$.datosGenogramaJson');
        vro_valing.id_archivo_genograma           := TO_NUMBER(JSON_VALUE(pcl_json, '$.idArchivoGenograma'));
        vro_valing.concepto_general_ingreso       := JSON_VALUE(pcl_json, '$.conceptoGeneralIngreso');
        vro_valing.recomendaciones_plan_cuidados  := JSON_VALUE(pcl_json, '$.recomendacionesPlanCuidados');
        vro_valing.nombre_entrega_responsable     := TRIM(JSON_VALUE(pcl_json, '$.nombreEntregaResponsable'));
        vro_valing.identificacion_entrega         := TRIM(JSON_VALUE(pcl_json, '$.identificacionEntrega'));
        vro_valing.parentesco_entrega             := TRIM(JSON_VALUE(pcl_json, '$.parentescoEntrega'));
        vro_valing.telefono_entrega               := TRIM(JSON_VALUE(pcl_json, '$.telefonoEntrega'));
        vro_valing.aceptacion_terminos            := NVL(TRIM(JSON_VALUE(pcl_json, '$.aceptacionTerminos')), 'S');
        vro_valing.id_archivo_firma_entrega       := TO_NUMBER(JSON_VALUE(pcl_json, '$.idArchivoFirmaEntrega'));
        IF JSON_VALUE(pcl_json, '$.firmaEntregaBase64') IS NOT NULL THEN
            vro_valing.firma_entrega_base64       := JSON_VALUE(pcl_json, '$.firmaEntregaBase64' RETURNING CLOB);
        END IF;
        vro_valing.id_usuario_ultima_modificacion := vro_valing.id_usuario_evaluador;

        IF v_id_valing IS NOT NULL AND PKGSMY_VALORACIONES_INGRESO_DAO.f_existe(v_id_valing) THEN
            PKGSMY_VALORACIONES_INGRESO_DAO.p_actualizar(vro_valing);
        ELSE
            PKGSMY_VALORACIONES_INGRESO_DAO.p_insertar(vro_valing);
        END IF;

        -- Commit controlado
        p_do_commit('pkgln_admision_residente.pr_guardar_valoracion_ingreso');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ADMISION_RESIDENTE';
            vro_error.nombre_metodo   := 'PR_GUARDAR_VALORACION_INGRESO';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_guardar_valoracion_ingreso;

END PKGLN_ADMISION_RESIDENTE;
/