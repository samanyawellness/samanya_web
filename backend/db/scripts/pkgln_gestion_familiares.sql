-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_GESTION_FAMILIARES
-- PROCESO: Registro, Actualización y Vinculación de Familiares y Acudientes
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Lógica de Negocio)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_GESTION_FAMILIARES
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_GESTION_FAMILIARES
    || Propósito: Gestionar el ciclo de vida de los acudientes y familiares de
    ||            los residentes, administración de canales de notificación
    ||            y permisos de autorización de firmas y salidas.
    || Estándar: Sin DML directos, parámetros CLOB JSON, uso exclusivo de DAOs
    ||           y p_do_commit para control transaccional.
    || =========================================================================
    */

    /**
     * Registra un nuevo familiar / acudiente en el sistema y opcionalmente lo vincula a un residente
     * Parámetro pcl_json:
     * {
     *   "tipoIdentificacion": "CC",
     *   "identificacion": "79.345.889",
     *   "nombres": "Mauricio Andrés",
     *   "apellidos": "Restrepo Gómez",
     *   "telefonoPrincipal": "3156781234",
     *   "telefonoSecundario": "3001234567",
     *   "email": "mauricio@empresa.com",
     *   "direccion": "Calle 134 # 9-45",
     *   "ciudad": "Bogota D.C.",
     *   "idCanalNotifPref": 1,
     *   "idResidente": 1,
     *   "idParentesco": 2,
     *   "esPrincipal": 1,
     *   "autorizadoSalidas": 1,
     *   "responsablePago": 0
     * }
     */
    PROCEDURE pr_registrar_familiar (
        pcl_json IN CLOB
    );

    /**
     * Vincula un familiar existente con otro residente
     * Parámetro pcl_json:
     * {
     *   "idAcudiente": 102,
     *   "idResidente": 2,
     *   "idParentesco": 3,
     *   "esPrincipal": 0,
     *   "autorizadoSalidas": 1,
     *   "responsablePago": 0
     * }
     */
    PROCEDURE pr_vincular_familiar_residente (
        pcl_json IN CLOB
    );

    /**
     * Actualiza la información personal, de contacto o dirección de un familiar / acudiente
     * Parámetro pcl_json:
     * {
     *   "idAcudiente": 102,
     *   "nombres": "Mauricio Andrés",
     *   "apellidos": "Restrepo Gómez",
     *   "identificacion": "79.345.889",
     *   "idTipoIdentificacion": 1,
     *   "telefonoPrincipal": "3156781234",
     *   "telefonoSecundario": "3001234567",
     *   "email": "mauricio@empresa.com",
     *   "direccion": "Calle 134 # 9-45",
     *   "ciudad": "Bogota D.C.",
     *   "idCanalNotifPref": 2
     * }
     */
    PROCEDURE pr_actualizar_familiar (
        pcl_json IN CLOB
    );

    /**
     * Elimina un familiar / acudiente y sus relaciones con residentes
     * Parámetro pcl_json:
     * {
     *   "idAcudiente": 102
     * }
     */
    PROCEDURE pr_eliminar_familiar (
        pcl_json IN CLOB
    );

END PKGLN_GESTION_FAMILIARES;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_GESTION_FAMILIARES
AS
    vro_error smy_errores%ROWTYPE;

    PROCEDURE pr_registrar_familiar (
        pcl_json IN CLOB
    ) IS
        v_identificacion     smy_acudientes.identificacion%TYPE;
        v_nombres            smy_acudientes.nombres%TYPE;
        v_apellidos          smy_acudientes.apellidos%TYPE;
        v_telefono           smy_acudientes.telefono_principal%TYPE;
        v_id_residente       smy_residentes.id%TYPE;

        vro_acudiente        smy_acudientes%ROWTYPE;
        vro_res_acu          smy_residente_acudiente%ROWTYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_identificacion := TRIM(JSON_VALUE(pcl_json, '$.identificacion'));
        v_nombres        := TRIM(JSON_VALUE(pcl_json, '$.nombres'));
        v_apellidos      := TRIM(JSON_VALUE(pcl_json, '$.apellidos'));
        v_telefono       := TRIM(JSON_VALUE(pcl_json, '$.telefonoPrincipal'));
        v_id_residente   := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));

        -- 2. Validaciones de negocio
        IF v_nombres IS NULL OR v_apellidos IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'Los nombres y apellidos del familiar son obligatorios.');
        END IF;
        IF v_telefono IS NULL THEN
            RAISE_APPLICATION_ERROR(-20002, 'El teléfono principal de contacto es obligatorio.');
        END IF;

        -- 3. Asignación directa de secuencia
        vro_acudiente.id                     := SEQ_SMY_ACUDIENTES.NEXTVAL;
        vro_acudiente.id_tipo_identificacion := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoIdentificacion')), 1);
        vro_acudiente.identificacion         := NVL(v_identificacion, 'NO REGISTRA');
        vro_acudiente.nombres                := v_nombres;
        vro_acudiente.apellidos              := v_apellidos;
        vro_acudiente.telefono_principal     := v_telefono;
        vro_acudiente.telefono_secundario    := TRIM(JSON_VALUE(pcl_json, '$.telefonoSecundario'));
        vro_acudiente.email                  := TRIM(JSON_VALUE(pcl_json, '$.email'));
        vro_acudiente.direccion              := TRIM(JSON_VALUE(pcl_json, '$.direccion'));
        vro_acudiente.ciudad                 := NVL(TRIM(JSON_VALUE(pcl_json, '$.ciudad')), 'Bogotá D.C.');
        vro_acudiente.id_canal_notif_pref    := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idCanalNotifPref')), 1);
        vro_acudiente.fecha_creacion         := f_fecha_actual;

        -- Inserción delegada al DAO
        PKGSMY_ACUDIENTES_DAO.p_insertar(vro_acudiente);

        -- 4. Si se especificó residente para vincular
        IF v_id_residente IS NOT NULL AND PKGSMY_RESIDENTES_DAO.f_existe(v_id_residente) THEN
            vro_res_acu.id                 := SEQ_SMY_RESIDENTE_ACUDIENTE.NEXTVAL;
            vro_res_acu.id_residente       := v_id_residente;
            vro_res_acu.id_acudiente       := vro_acudiente.id;
            vro_res_acu.id_parentesco      := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idParentesco')), 1);

            IF UPPER(NVL(JSON_VALUE(pcl_json, '$.esPrincipal'), 'S')) IN ('S', '1', 'TRUE') THEN
                vro_res_acu.es_principal   := 'S';
            ELSE
                vro_res_acu.es_principal   := 'N';
            END IF;

            IF UPPER(NVL(JSON_VALUE(pcl_json, '$.responsablePago'), 'N')) IN ('S', '1', 'TRUE') THEN
                vro_res_acu.es_responsable_pago := 'S';
            ELSE
                vro_res_acu.es_responsable_pago := 'N';
            END IF;

            IF UPPER(NVL(JSON_VALUE(pcl_json, '$.autorizadoSalidas'), 'S')) IN ('S', '1', 'TRUE') THEN
                vro_res_acu.autorizado_salidas  := 'S';
            ELSE
                vro_res_acu.autorizado_salidas  := 'N';
            END IF;

            vro_res_acu.fecha_creacion     := f_fecha_actual;

            PKGSMY_RESIDENTE_ACUDIENTE_DAO.p_insertar(vro_res_acu);
        END IF;

        -- 5. Commit controlado
        p_do_commit('pkgln_gestion_familiares.pr_registrar_familiar');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_GESTION_FAMILIARES';
            vro_error.nombre_metodo   := 'PR_REGISTRAR_FAMILIAR';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_familiar;

    PROCEDURE pr_vincular_familiar_residente (
        pcl_json IN CLOB
    ) IS
        v_id_acudiente_in NUMBER;
        v_id_residente_in NUMBER;
        v_id_acudiente    smy_acudientes.id%TYPE;
        v_id_residente    smy_residentes.id%TYPE;
        vro_res_acu       smy_residente_acudiente%ROWTYPE;
    BEGIN
        v_id_acudiente_in := TO_NUMBER(JSON_VALUE(pcl_json, '$.idAcudiente'));
        v_id_residente_in := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));

        IF v_id_acudiente_in IS NULL OR v_id_residente_in IS NULL THEN
            RAISE_APPLICATION_ERROR(-20003, 'Identificadores de acudiente y residente son obligatorios.');
        END IF;

        IF v_id_acudiente_in > 999999999 OR v_id_residente_in > 999999999 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Identificador inválido (excede la precisión de base de datos).');
        END IF;

        v_id_acudiente := v_id_acudiente_in;
        v_id_residente := v_id_residente_in;

        IF PKGSMY_ACUDIENTES_DAO.f_existe(v_id_acudiente) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20004, 'El familiar especificado no existe.');
        END IF;

        IF PKGSMY_RESIDENTES_DAO.f_existe(v_id_residente) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20005, 'El residente especificado no existe.');
        END IF;

        vro_res_acu.id                 := SEQ_SMY_RESIDENTE_ACUDIENTE.NEXTVAL;
        vro_res_acu.id_residente       := v_id_residente;
        vro_res_acu.id_acudiente       := v_id_acudiente;
        vro_res_acu.id_parentesco      := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idParentesco')), 1);

        IF UPPER(NVL(JSON_VALUE(pcl_json, '$.esPrincipal'), 'N')) IN ('S', '1', 'TRUE') THEN
            vro_res_acu.es_principal   := 'S';
        ELSE
            vro_res_acu.es_principal   := 'N';
        END IF;

        IF UPPER(NVL(JSON_VALUE(pcl_json, '$.responsablePago'), 'N')) IN ('S', '1', 'TRUE') THEN
            vro_res_acu.es_responsable_pago := 'S';
        ELSE
            vro_res_acu.es_responsable_pago := 'N';
        END IF;

        IF UPPER(NVL(JSON_VALUE(pcl_json, '$.autorizadoSalidas'), 'S')) IN ('S', '1', 'TRUE') THEN
            vro_res_acu.autorizado_salidas  := 'S';
        ELSE
            vro_res_acu.autorizado_salidas  := 'N';
        END IF;

        vro_res_acu.fecha_creacion     := f_fecha_actual;

        PKGSMY_RESIDENTE_ACUDIENTE_DAO.p_insertar(vro_res_acu);

        p_do_commit('pkgln_gestion_familiares.pr_vincular_familiar_residente');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_GESTION_FAMILIARES';
            vro_error.nombre_metodo   := 'PR_VINCULAR_FAMILIAR_RESIDENTE';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_vincular_familiar_residente;

    PROCEDURE pr_actualizar_familiar (
        pcl_json IN CLOB
    ) IS
        v_id_acudiente_in NUMBER;
        v_id_acudiente    smy_acudientes.id%TYPE;
        vro_acudiente     smy_acudientes%ROWTYPE;
    BEGIN
        v_id_acudiente_in := TO_NUMBER(JSON_VALUE(pcl_json, '$.idAcudiente'));

        IF v_id_acudiente_in IS NULL THEN
            RAISE_APPLICATION_ERROR(-20006, 'El identificador del familiar/acudiente es obligatorio.');
        END IF;

        IF v_id_acudiente_in > 999999999 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Identificador de familiar inválido (excede la precisión de base de datos).');
        END IF;

        v_id_acudiente := v_id_acudiente_in;

        IF PKGSMY_ACUDIENTES_DAO.f_existe(v_id_acudiente, vro_acudiente) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20007, 'El familiar/acudiente indicado no existe.');
        END IF;

        IF JSON_VALUE(pcl_json, '$.nombres') IS NOT NULL THEN
            vro_acudiente.nombres := TRIM(JSON_VALUE(pcl_json, '$.nombres'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.apellidos') IS NOT NULL THEN
            vro_acudiente.apellidos := TRIM(JSON_VALUE(pcl_json, '$.apellidos'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.identificacion') IS NOT NULL THEN
            vro_acudiente.identificacion := TRIM(JSON_VALUE(pcl_json, '$.identificacion'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.idTipoIdentificacion') IS NOT NULL THEN
            vro_acudiente.id_tipo_identificacion := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoIdentificacion'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.telefonoPrincipal') IS NOT NULL THEN
            vro_acudiente.telefono_principal := TRIM(JSON_VALUE(pcl_json, '$.telefonoPrincipal'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.telefonoSecundario') IS NOT NULL THEN
            vro_acudiente.telefono_secundario := TRIM(JSON_VALUE(pcl_json, '$.telefonoSecundario'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.email') IS NOT NULL THEN
            vro_acudiente.email := TRIM(JSON_VALUE(pcl_json, '$.email'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.direccion') IS NOT NULL THEN
            vro_acudiente.direccion := TRIM(JSON_VALUE(pcl_json, '$.direccion'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.ciudad') IS NOT NULL THEN
            vro_acudiente.ciudad := TRIM(JSON_VALUE(pcl_json, '$.ciudad'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.idCanalNotifPref') IS NOT NULL THEN
            vro_acudiente.id_canal_notif_pref := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCanalNotifPref'));
        END IF;

        PKGSMY_ACUDIENTES_DAO.p_actualizar(vro_acudiente);

        p_do_commit('pkgln_gestion_familiares.pr_actualizar_familiar');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_GESTION_FAMILIARES';
            vro_error.nombre_metodo   := 'PR_ACTUALIZAR_FAMILIAR';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_actualizar_familiar;

    PROCEDURE pr_eliminar_familiar (
        pcl_json IN CLOB
    ) IS
        v_id_acudiente_in NUMBER;
        v_id_acudiente    smy_acudientes.id%TYPE;
    BEGIN
        v_id_acudiente_in := TO_NUMBER(JSON_VALUE(pcl_json, '$.idAcudiente'));

        IF v_id_acudiente_in IS NULL THEN
            RAISE_APPLICATION_ERROR(-20008, 'El identificador del familiar/acudiente es obligatorio.');
        END IF;

        IF v_id_acudiente_in > 999999999 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Identificador de familiar inválido (excede la precisión de base de datos).');
        END IF;

        v_id_acudiente := v_id_acudiente_in;

        IF PKGSMY_ACUDIENTES_DAO.f_existe(v_id_acudiente) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20009, 'El familiar/acudiente indicado no existe.');
        END IF;

        -- 1. Eliminar vínculos con residentes mediante paquete PKGCA de la tabla
        PKGCA_SMY_RESIDENTE_ACUDIENTE.pr_eliminar_por_acudiente(pcl_json);

        -- 2. Eliminar registro del acudiente mediante su DAO
        PKGSMY_ACUDIENTES_DAO.p_eliminar(v_id_acudiente);

        -- 3. Commit controlado
        p_do_commit('pkgln_gestion_familiares.pr_eliminar_familiar');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_GESTION_FAMILIARES';
            vro_error.nombre_metodo   := 'PR_ELIMINAR_FAMILIAR';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_eliminar_familiar;

END PKGLN_GESTION_FAMILIARES;
/
