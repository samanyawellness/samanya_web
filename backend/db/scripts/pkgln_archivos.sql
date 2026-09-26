-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_ARCHIVOS
-- FAMILIA: pkgln_ (Lógica de Negocio, validaciones y orquestación del caso de uso)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- REGLA ESTRICTA: Sin sentencias DML directas. Las consultas y modificaciones se
--                 realizan vía PKGSMY_ARCHIVOS_DAO y PKGCN. En este va el COMMIT.
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_ARCHIVOS
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_ARCHIVOS
    || Propósito: Lógica de negocio integral para la gestión y administración de
    ||            archivos y documentos del sistema SAMANYA (Google Drive / Storage).
    || Estándar: oracle-plsql-architecture (Familia pkgln_)
    || =========================================================================
    */

    -- -------------------------------------------------------------------------
    -- 1. Utilidades de cálculo, formateo y hashing
    -- -------------------------------------------------------------------------
    FUNCTION fn_generar_nombre_almacenado (
        p_id        IN NUMBER,
        p_extension IN VARCHAR2
    ) RETURN VARCHAR2;

    FUNCTION fn_sanitizar_cadena (
        p_cadena IN VARCHAR2
    ) RETURN VARCHAR2;

    FUNCTION fn_normalizar_extension (
        p_nombre_o_ext IN VARCHAR2
    ) RETURN VARCHAR2;

    FUNCTION fn_construir_ruta_sede (
        p_id_sede     IN NUMBER,
        p_nombre_sede IN VARCHAR2
    ) RETURN VARCHAR2;

    FUNCTION fn_construir_ruta_residente (
        p_id_residente   IN NUMBER,
        p_identificacion IN VARCHAR2
    ) RETURN VARCHAR2;

    FUNCTION fn_construir_ruta_documentos (
        p_id_sede        IN NUMBER,
        p_nombre_sede    IN VARCHAR2,
        p_id_residente   IN NUMBER,
        p_identificacion IN VARCHAR2
    ) RETURN VARCHAR2;

    FUNCTION fn_construir_ruta_talento_humano (
        p_id_usuario     IN NUMBER,
        p_identificacion IN VARCHAR2
    ) RETURN VARCHAR2;

    FUNCTION fn_resolver_mime_type (
        p_extension IN VARCHAR2
    ) RETURN VARCHAR2;

    FUNCTION fn_validar_extension (
        p_extension         IN VARCHAR2,
        p_lista_permitidas  IN VARCHAR2 DEFAULT 'pdf,jpg,jpeg,png,docx,xlsx,txt'
    ) RETURN BOOLEAN;

    -- -------------------------------------------------------------------------
    -- 2. Lógica de negocio y orquestación transaccional (con COMMIT)
    -- -------------------------------------------------------------------------
    PROCEDURE pr_preparar_carga_archivo (
        p_id_centro                  IN  smy_centros.id%TYPE,
        p_id_residente               IN  smy_residentes.id%TYPE,
        p_nombre_original            IN  VARCHAR2,
        p_id_clase_archivo           IN  smy_clases_archivos.id%TYPE,
        p_id_reserva                 OUT smy_archivos.id%TYPE,
        p_nombre_almacenado          OUT VARCHAR2,
        p_nombre_carpeta_sede        OUT VARCHAR2,
        p_nombre_carpeta_residente   OUT VARCHAR2,
        p_ruta_relativa              OUT VARCHAR2,
        p_extension                  OUT VARCHAR2,
        p_tipo_mime                  OUT VARCHAR2
    );

    PROCEDURE pr_registrar_archivo (
        p_id                         IN  smy_archivos.id%TYPE,
        p_nombre_archivo             IN  smy_archivos.nombre_archivo%TYPE,
        p_nombre_archivo_almacenado  IN  smy_archivos.nombre_archivo_almacenado%TYPE,
        p_hash_archivo               IN  smy_archivos.hash_archivo%TYPE,
        p_ruta_relativa              IN  smy_archivos.ruta_relativa%TYPE,
        p_ruta_completa_almacenamiento IN smy_archivos.ruta_completa_almacenamiento%TYPE,
        p_extension                  IN  smy_archivos.extension%TYPE,
        p_tipo_mime                  IN  smy_archivos.tipo_mime%TYPE,
        p_tamano_bytes               IN  smy_archivos.tamano_bytes%TYPE,
        p_id_clase_archivo           IN  smy_archivos.id_clase_archivo%TYPE,
        p_id_centro                  IN  smy_archivos.id_centro%TYPE,
        p_id_residente               IN  smy_archivos.id_residente%TYPE,
        p_tabla_origen               IN  smy_archivos.tabla_origen%TYPE DEFAULT NULL,
        p_id_registro_origen         IN  smy_archivos.id_registro_origen%TYPE DEFAULT NULL,
        p_metadatos_json             IN  CLOB DEFAULT NULL,
        p_id_usuario_creacion        IN  smy_usuarios.id%TYPE,
        p_mensaje_resultado          OUT VARCHAR2
    );

    PROCEDURE pr_borrar_archivo (
        p_id_archivo        IN  smy_archivos.id%TYPE,
        p_id_usuario        IN  smy_usuarios.id%TYPE,
        p_motivo            IN  VARCHAR2 DEFAULT NULL,
        p_mensaje_resultado OUT VARCHAR2
    );

    PROCEDURE pr_renombrar_archivo (
        p_id_archivo        IN  smy_archivos.id%TYPE,
        p_nuevo_nombre      IN  smy_archivos.nombre_archivo%TYPE,
        p_id_usuario        IN  smy_usuarios.id%TYPE,
        p_mensaje_resultado OUT VARCHAR2
    );

    PROCEDURE pr_copiar_archivo (
        p_id_archivo_origen  IN  smy_archivos.id%TYPE,
        p_nuevo_id_residente IN  smy_residentes.id%TYPE DEFAULT NULL,
        p_nuevo_id_centro    IN  smy_centros.id%TYPE DEFAULT NULL,
        p_nuevo_nombre       IN  smy_archivos.nombre_archivo%TYPE DEFAULT NULL,
        p_id_usuario         IN  smy_usuarios.id%TYPE,
        p_id_nuevo_archivo   OUT smy_archivos.id%TYPE,
        p_mensaje_resultado  OUT VARCHAR2
    );

    PROCEDURE pr_restaurar_archivo (
        p_id_archivo        IN  smy_archivos.id%TYPE,
        p_id_usuario        IN  smy_usuarios.id%TYPE,
        p_mensaje_resultado OUT VARCHAR2
    );

    PROCEDURE pr_preparar_carga_foto_talento (
        pcl_json      IN  CLOB,
        p_json_salida OUT CLOB
    );

    PROCEDURE pr_registrar_foto_talento_humano (
        pcl_json IN CLOB
    );

    PROCEDURE pr_registrar_soporte_talento_humano (
        pcl_json IN CLOB
    );

    PROCEDURE pr_subir_foto_talento_humano (
        pcl_json IN CLOB
    );

    -- -------------------------------------------------------------------------
    -- 3. Consultas y representación de datos
    -- -------------------------------------------------------------------------
    FUNCTION fn_consultar_archivos_residente (
        p_id_residente  IN smy_residentes.id%TYPE,
        p_solo_visibles IN NUMBER DEFAULT 1
    ) RETURN SYS_REFCURSOR;

    FUNCTION fn_obtener_archivo_json (
        p_id_archivo IN smy_archivos.id%TYPE
    ) RETURN CLOB;

    -- -------------------------------------------------------------------------
    -- 4. Procesos multi-entidad de documentos clínicos (vía DAOs con COMMIT)
    -- -------------------------------------------------------------------------
    PROCEDURE pr_vincular_archivo_doc_clinico (
        pro_archivo            IN  smy_archivos%ROWTYPE,
        p_id_documento_clinico IN  smy_documentos_clinicos.id%TYPE,
        p_id_usuario           IN  smy_usuarios.id%TYPE
    );

    PROCEDURE pr_desvincular_archivo_doc_clinico (
        p_id_archivo           IN  smy_archivos.id%TYPE,
        p_id_documento_clinico IN  smy_documentos_clinicos.id%TYPE,
        p_id_usuario           IN  smy_usuarios.id%TYPE
    );

END PKGLN_ARCHIVOS;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_ARCHIVOS
AS
    vro_error smy_errores%ROWTYPE;

    -- =========================================================================
    -- 1. Utilidades de cálculo, formateo y hashing
    -- =========================================================================

    FUNCTION fn_generar_nombre_almacenado (
        p_id        IN NUMBER,
        p_extension IN VARCHAR2
    ) RETURN VARCHAR2
    IS
        v_extension_norm VARCHAR2(30);
        v_hash_hex       VARCHAR2(64);
    BEGIN
        IF p_id IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El ID de archivo no puede ser nulo para generar el nombre almacenado.');
        END IF;

        v_extension_norm := fn_normalizar_extension(p_extension);

        -- STANDARD_HASH es función SQL de Oracle; se ejecuta en contexto SQL vía SELECT ... INTO FROM DUAL
        SELECT LOWER(STANDARD_HASH(TO_CHAR(p_id), 'SHA256'))
          INTO v_hash_hex
          FROM DUAL;

        RETURN v_hash_hex || v_extension_norm;
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'FN_GENERAR_NOMBRE_ALMACENADO';
            vro_error.parametros          := 'p_id: ' || p_id || ', p_extension: ' || p_extension;
            vro_error.id_usuario_creacion := NULL;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END fn_generar_nombre_almacenado;

    FUNCTION fn_sanitizar_cadena (
        p_cadena IN VARCHAR2
    ) RETURN VARCHAR2
    IS
        v_cadena VARCHAR2(500);
    BEGIN
        IF p_cadena IS NULL THEN
            RETURN 'DESCONOCIDO';
        END IF;

        v_cadena := UPPER(TRIM(p_cadena));
        v_cadena := REPLACE(v_cadena, 'Á', 'A');
        v_cadena := REPLACE(v_cadena, 'É', 'E');
        v_cadena := REPLACE(v_cadena, 'Í', 'I');
        v_cadena := REPLACE(v_cadena, 'Ó', 'O');
        v_cadena := REPLACE(v_cadena, 'Ú', 'U');
        v_cadena := REPLACE(v_cadena, 'Ñ', 'N');
        v_cadena := REPLACE(v_cadena, 'Ü', 'U');
        v_cadena := REGEXP_REPLACE(v_cadena, '[^A-Z0-9_\-]', '_');
        v_cadena := REGEXP_REPLACE(v_cadena, '_+', '_');
        v_cadena := TRIM(BOTH '_' FROM v_cadena);

        IF v_cadena IS NULL OR LENGTH(v_cadena) = 0 THEN
            v_cadena := 'GENERAL';
        END IF;

        RETURN v_cadena;
    END fn_sanitizar_cadena;

    FUNCTION fn_normalizar_extension (
        p_nombre_o_ext IN VARCHAR2
    ) RETURN VARCHAR2
    IS
        v_ext VARCHAR2(30);
    BEGIN
        IF p_nombre_o_ext IS NULL THEN
            RETURN '';
        END IF;

        v_ext := LOWER(TRIM(p_nombre_o_ext));
        IF INSTR(v_ext, '.') > 0 THEN
            v_ext := SUBSTR(v_ext, INSTR(v_ext, '.', -1));
        ELSE
            v_ext := '.' || v_ext;
        END IF;

        RETURN v_ext;
    END fn_normalizar_extension;

    FUNCTION fn_construir_ruta_sede (
        p_id_sede     IN NUMBER,
        p_nombre_sede IN VARCHAR2
    ) RETURN VARCHAR2
    IS
    BEGIN
        RETURN p_id_sede || '_' || fn_sanitizar_cadena(p_nombre_sede);
    END fn_construir_ruta_sede;

    FUNCTION fn_construir_ruta_residente (
        p_id_residente   IN NUMBER,
        p_identificacion IN VARCHAR2
    ) RETURN VARCHAR2
    IS
    BEGIN
        RETURN p_id_residente || '_' || fn_sanitizar_cadena(p_identificacion);
    END fn_construir_ruta_residente;

    FUNCTION fn_construir_ruta_documentos (
        p_id_sede        IN NUMBER,
        p_nombre_sede    IN VARCHAR2,
        p_id_residente   IN NUMBER,
        p_identificacion IN VARCHAR2
    ) RETURN VARCHAR2
    IS
    BEGIN
        RETURN fn_construir_ruta_sede(p_id_sede, p_nombre_sede)
               || '/'
               || fn_construir_ruta_residente(p_id_residente, p_identificacion)
               || '/Documentos';
    END fn_construir_ruta_documentos;

    FUNCTION fn_construir_ruta_talento_humano (
        p_id_usuario     IN NUMBER,
        p_identificacion IN VARCHAR2
    ) RETURN VARCHAR2
    IS
    BEGIN
        RETURN 'Samanya/Talento_humano/'
               || p_id_usuario
               || '_'
               || fn_sanitizar_cadena(p_identificacion);
    END fn_construir_ruta_talento_humano;

    FUNCTION fn_resolver_mime_type (
        p_extension IN VARCHAR2
    ) RETURN VARCHAR2
    IS
        v_ext VARCHAR2(30);
    BEGIN
        v_ext := fn_normalizar_extension(p_extension);

        CASE v_ext
            WHEN '.pdf'  THEN RETURN 'application/pdf';
            WHEN '.jpg'  THEN RETURN 'image/jpeg';
            WHEN '.jpeg' THEN RETURN 'image/jpeg';
            WHEN '.png'  THEN RETURN 'image/png';
            WHEN '.gif'  THEN RETURN 'image/gif';
            WHEN '.webp' THEN RETURN 'image/webp';
            WHEN '.docx' THEN RETURN 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            WHEN '.doc'  THEN RETURN 'application/msword';
            WHEN '.xlsx' THEN RETURN 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            WHEN '.xls'  THEN RETURN 'application/vnd.ms-excel';
            WHEN '.txt'  THEN RETURN 'text/plain';
            WHEN '.csv'  THEN RETURN 'text/csv';
            WHEN '.zip'  THEN RETURN 'application/zip';
            ELSE              RETURN 'application/octet-stream';
        END CASE;
    END fn_resolver_mime_type;

    FUNCTION fn_validar_extension (
        p_extension         IN VARCHAR2,
        p_lista_permitidas  IN VARCHAR2 DEFAULT 'pdf,jpg,jpeg,png,docx,xlsx,txt'
    ) RETURN BOOLEAN
    IS
        v_ext        VARCHAR2(30);
        v_ext_limpia VARCHAR2(30);
    BEGIN
        v_ext := fn_normalizar_extension(p_extension);
        v_ext_limpia := LTRIM(v_ext, '.');

        IF INSTR(',' || LOWER(p_lista_permitidas) || ',', ',' || v_ext_limpia || ',') > 0 THEN
            RETURN TRUE;
        ELSE
            RETURN FALSE;
        END IF;
    END fn_validar_extension;

    -- =========================================================================
    -- 2. Lógica de negocio y orquestación transaccional (con COMMIT)
    -- =========================================================================

    PROCEDURE pr_preparar_carga_archivo (
        p_id_centro                  IN  smy_centros.id%TYPE,
        p_id_residente               IN  smy_residentes.id%TYPE,
        p_nombre_original            IN  VARCHAR2,
        p_id_clase_archivo           IN  smy_clases_archivos.id%TYPE,
        p_id_reserva                 OUT smy_archivos.id%TYPE,
        p_nombre_almacenado          OUT VARCHAR2,
        p_nombre_carpeta_sede        OUT VARCHAR2,
        p_nombre_carpeta_residente   OUT VARCHAR2,
        p_ruta_relativa              OUT VARCHAR2,
        p_extension                  OUT VARCHAR2,
        p_tipo_mime                  OUT VARCHAR2
    )
    IS
        v_extension_norm  VARCHAR2(30);
        vro_residente     smy_residentes%ROWTYPE;
        vro_centro        smy_centros%ROWTYPE;
        vro_clase         smy_clases_archivos%ROWTYPE;
        vn_id_centro_ef   smy_centros.id%TYPE;
    BEGIN
        IF p_nombre_original IS NULL OR TRIM(p_nombre_original) IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El nombre del archivo original es obligatorio.');
        END IF;

        IF p_id_residente IS NULL THEN
            RAISE_APPLICATION_ERROR(-20002, 'El identificador del residente es obligatorio para construir la jerarquía.');
        END IF;

        -- 1. Validar existencia del residente vía DAO
        vro_residente := PKGSMY_RESIDENTES_DAO.f_traer(p_id_residente);
        IF vro_residente.id IS NULL THEN
            RAISE_APPLICATION_ERROR(-20003, 'El residente con ID ' || p_id_residente || ' no existe en el sistema.');
        END IF;

        vn_id_centro_ef := NVL(p_id_centro, 1);

        -- 2. Validar sede / centro vía DAO
        vro_centro := PKGSMY_CENTROS_DAO.f_traer(vn_id_centro_ef);
        IF vro_centro.id IS NULL THEN
            p_nombre_carpeta_sede := fn_construir_ruta_sede(vn_id_centro_ef, 'SEDE-PRINCIPAL');
        ELSE
            p_nombre_carpeta_sede := fn_construir_ruta_sede(vro_centro.id, vro_centro.nombre_centro);
        END IF;

        -- 3. Carpeta del residente
        p_nombre_carpeta_residente := fn_construir_ruta_residente(vro_residente.id, vro_residente.identificacion);

        -- 4. Validar clase de archivo si fue provista
        IF p_id_clase_archivo IS NOT NULL THEN
            vro_clase := PKGSMY_CLASES_ARCHIVOS_DAO.f_traer(p_id_clase_archivo);
            IF vro_clase.id IS NULL THEN
                RAISE_APPLICATION_ERROR(-20004, 'La clase de archivo especificada no existe.');
            END IF;
        END IF;

        -- 5. Normalizar extensión y tipo MIME
        v_extension_norm := fn_normalizar_extension(p_nombre_original);
        p_extension      := v_extension_norm;
        p_tipo_mime      := fn_resolver_mime_type(v_extension_norm);

        -- 6. Reservar el próximo ID de la secuencia SMY_ARCHIVOS (asignación directa)
        p_id_reserva := SEQ_SMY_ARCHIVOS.NEXTVAL;

        -- 7. Generar nombre de archivo almacenado con el hash SHA-256 del ID reservado
        p_nombre_almacenado := fn_generar_nombre_almacenado(p_id_reserva, v_extension_norm);

        -- 8. Ruta relativa estándar
        p_ruta_relativa := p_nombre_carpeta_sede || '/' || p_nombre_carpeta_residente || '/Documentos';

    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_PREPARAR_CARGA_ARCHIVO';
            vro_error.parametros          := 'p_id_residente: ' || p_id_residente || ', p_nombre_original: ' || p_nombre_original;
            vro_error.id_usuario_creacion := NULL;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_preparar_carga_archivo;

    PROCEDURE pr_registrar_archivo (
        p_id                         IN  smy_archivos.id%TYPE,
        p_nombre_archivo             IN  smy_archivos.nombre_archivo%TYPE,
        p_nombre_archivo_almacenado  IN  smy_archivos.nombre_archivo_almacenado%TYPE,
        p_hash_archivo               IN  smy_archivos.hash_archivo%TYPE,
        p_ruta_relativa              IN  smy_archivos.ruta_relativa%TYPE,
        p_ruta_completa_almacenamiento IN smy_archivos.ruta_completa_almacenamiento%TYPE,
        p_extension                  IN  smy_archivos.extension%TYPE,
        p_tipo_mime                  IN  smy_archivos.tipo_mime%TYPE,
        p_tamano_bytes               IN  smy_archivos.tamano_bytes%TYPE,
        p_id_clase_archivo           IN  smy_archivos.id_clase_archivo%TYPE,
        p_id_centro                  IN  smy_archivos.id_centro%TYPE,
        p_id_residente               IN  smy_archivos.id_residente%TYPE,
        p_tabla_origen               IN  smy_archivos.tabla_origen%TYPE DEFAULT NULL,
        p_id_registro_origen         IN  smy_archivos.id_registro_origen%TYPE DEFAULT NULL,
        p_metadatos_json             IN  CLOB DEFAULT NULL,
        p_id_usuario_creacion        IN  smy_usuarios.id%TYPE,
        p_mensaje_resultado          OUT VARCHAR2
    )
    IS
        vro_archivo smy_archivos%ROWTYPE;
    BEGIN
        -- 1. Validaciones obligatorias de negocio
        IF p_nombre_archivo IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El nombre lógico del archivo no puede ser nulo.');
        END IF;

        IF p_nombre_archivo_almacenado IS NULL THEN
            RAISE_APPLICATION_ERROR(-20002, 'El nombre almacenado (hash) no puede ser nulo.');
        END IF;

        IF p_ruta_completa_almacenamiento IS NULL THEN
            RAISE_APPLICATION_ERROR(-20003, 'La ruta de almacenamiento en Google Drive es obligatoria.');
        END IF;

        -- 2. Asignar registro (asignación directa de secuencia)
        IF p_id IS NOT NULL THEN
            vro_archivo.id := p_id;
        ELSE
            vro_archivo.id := SEQ_SMY_ARCHIVOS.NEXTVAL;
        END IF;

        vro_archivo.nombre_archivo               := TRIM(p_nombre_archivo);
        vro_archivo.nombre_archivo_almacenado    := TRIM(p_nombre_archivo_almacenado);
        vro_archivo.hash_archivo                 := p_hash_archivo;
        vro_archivo.ruta_relativa                := p_ruta_relativa;
        vro_archivo.ruta_completa_almacenamiento := p_ruta_completa_almacenamiento;
        vro_archivo.extension                    := fn_normalizar_extension(NVL(p_extension, p_nombre_archivo));
        vro_archivo.tipo_mime                    := NVL(p_tipo_mime, fn_resolver_mime_type(vro_archivo.extension));
        vro_archivo.tamano_bytes                 := NVL(p_tamano_bytes, 0);
        vro_archivo.id_clase_archivo             := p_id_clase_archivo;
        vro_archivo.id_centro                    := p_id_centro;
        vro_archivo.id_residente                 := p_id_residente;
        vro_archivo.id_estado_archivo            := 1; -- 1 = Activo / Visible
        vro_archivo.tabla_origen                 := p_tabla_origen;
        vro_archivo.id_registro_origen           := p_id_registro_origen;
        vro_archivo.metadatos_json               := p_metadatos_json;
        vro_archivo.fecha_creacion               := f_fecha_actual;
        vro_archivo.fecha_ultima_modificacion    := f_fecha_actual;
        vro_archivo.id_usuario_ultima_modificacion := p_id_usuario_creacion;

        -- 3. Inserción delegada al DAO (Cero DML directo en pkgln_)
        PKGSMY_ARCHIVOS_DAO.p_insertar(vro_archivo);

        -- 4. Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_archivos.pr_registrar_archivo');

        p_mensaje_resultado := 'Archivo registrado exitosamente con ID ' || vro_archivo.id;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_REGISTRAR_ARCHIVO';
            vro_error.parametros          := 'p_id: ' || p_id || ', p_nombre_archivo: ' || p_nombre_archivo;
            vro_error.id_usuario_creacion := p_id_usuario_creacion;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_archivo;

    PROCEDURE pr_borrar_archivo (
        p_id_archivo        IN  smy_archivos.id%TYPE,
        p_id_usuario        IN  smy_usuarios.id%TYPE,
        p_motivo            IN  VARCHAR2 DEFAULT NULL,
        p_mensaje_resultado OUT VARCHAR2
    )
    IS
        vro_archivo smy_archivos%ROWTYPE;
    BEGIN
        vro_archivo := PKGSMY_ARCHIVOS_DAO.f_traer(p_id_archivo);
        IF vro_archivo.id IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El archivo con ID ' || p_id_archivo || ' no existe en el sistema.');
        END IF;

        IF vro_archivo.id_estado_archivo = 2 THEN
            p_mensaje_resultado := 'El archivo ya se encontraba marcado como no visible / eliminado.';
            RETURN;
        END IF;

        -- Actualizar a estado 2 (Eliminado / Papelera / No visible)
        vro_archivo.id_estado_archivo            := 2;
        vro_archivo.fecha_eliminacion            := f_fecha_actual;
        vro_archivo.id_usuario_eliminacion       := p_id_usuario;
        vro_archivo.fecha_ultima_modificacion    := f_fecha_actual;
        vro_archivo.id_usuario_ultima_modificacion := p_id_usuario;

        -- Actualización delegada al DAO
        PKGSMY_ARCHIVOS_DAO.p_actualizar(vro_archivo);

        -- Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_archivos.pr_borrar_archivo');

        p_mensaje_resultado := 'Archivo ID ' || p_id_archivo || ' marcado como no visible exitosamente.';
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_BORRAR_ARCHIVO';
            vro_error.parametros          := 'p_id_archivo: ' || p_id_archivo || ', p_id_usuario: ' || p_id_usuario || ', p_motivo: ' || p_motivo;
            vro_error.id_usuario_creacion := p_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_borrar_archivo;

    PROCEDURE pr_renombrar_archivo (
        p_id_archivo        IN  smy_archivos.id%TYPE,
        p_nuevo_nombre      IN  smy_archivos.nombre_archivo%TYPE,
        p_id_usuario        IN  smy_usuarios.id%TYPE,
        p_mensaje_resultado OUT VARCHAR2
    )
    IS
        vro_archivo smy_archivos%ROWTYPE;
    BEGIN
        IF p_nuevo_nombre IS NULL OR TRIM(p_nuevo_nombre) IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El nuevo nombre del archivo no puede ser nulo o vacío.');
        END IF;

        vro_archivo := PKGSMY_ARCHIVOS_DAO.f_traer(p_id_archivo);
        IF vro_archivo.id IS NULL THEN
            RAISE_APPLICATION_ERROR(-20002, 'El archivo solicitado (ID: ' || p_id_archivo || ') no existe.');
        END IF;

        vro_archivo.nombre_archivo               := TRIM(p_nuevo_nombre);
        vro_archivo.fecha_ultima_modificacion    := f_fecha_actual;
        vro_archivo.id_usuario_ultima_modificacion := p_id_usuario;

        PKGSMY_ARCHIVOS_DAO.p_actualizar(vro_archivo);

        -- Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_archivos.pr_renombrar_archivo');

        p_mensaje_resultado := 'Archivo ID ' || p_id_archivo || ' renombrado exitosamente a "' || vro_archivo.nombre_archivo || '".';
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_RENOMBRAR_ARCHIVO';
            vro_error.parametros          := 'p_id_archivo: ' || p_id_archivo || ', p_nuevo_nombre: ' || p_nuevo_nombre;
            vro_error.id_usuario_creacion := p_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_renombrar_archivo;

    PROCEDURE pr_copiar_archivo (
        p_id_archivo_origen  IN  smy_archivos.id%TYPE,
        p_nuevo_id_residente IN  smy_residentes.id%TYPE DEFAULT NULL,
        p_nuevo_id_centro    IN  smy_centros.id%TYPE DEFAULT NULL,
        p_nuevo_nombre       IN  smy_archivos.nombre_archivo%TYPE DEFAULT NULL,
        p_id_usuario         IN  smy_usuarios.id%TYPE,
        p_id_nuevo_archivo   OUT smy_archivos.id%TYPE,
        p_mensaje_resultado  OUT VARCHAR2
    )
    IS
        vro_orig  smy_archivos%ROWTYPE;
        vro_nuevo smy_archivos%ROWTYPE;
    BEGIN
        vro_orig := PKGSMY_ARCHIVOS_DAO.f_traer(p_id_archivo_origen);
        IF vro_orig.id IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El archivo origen a copiar (ID: ' || p_id_archivo_origen || ') no existe.');
        END IF;

        p_id_nuevo_archivo := SEQ_SMY_ARCHIVOS.NEXTVAL;

        vro_nuevo := vro_orig;
        vro_nuevo.id                        := p_id_nuevo_archivo;
        vro_nuevo.nombre_archivo            := NVL(p_nuevo_nombre, 'Copia_' || vro_orig.nombre_archivo);
        vro_nuevo.nombre_archivo_almacenado := fn_generar_nombre_almacenado(p_id_nuevo_archivo, vro_orig.extension);
        
        IF p_nuevo_id_residente IS NOT NULL THEN
            vro_nuevo.id_residente := p_nuevo_id_residente;
        END IF;
        IF p_nuevo_id_centro IS NOT NULL THEN
            vro_nuevo.id_centro := p_nuevo_id_centro;
        END IF;

        vro_nuevo.id_estado_archivo            := 1; -- Activo
        vro_nuevo.fecha_eliminacion            := NULL;
        vro_nuevo.id_usuario_eliminacion       := NULL;
        vro_nuevo.fecha_creacion               := f_fecha_actual;
        vro_nuevo.fecha_ultima_modificacion    := f_fecha_actual;
        vro_nuevo.id_usuario_ultima_modificacion := p_id_usuario;

        PKGSMY_ARCHIVOS_DAO.p_insertar(vro_nuevo);

        -- Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_archivos.pr_copiar_archivo');

        p_mensaje_resultado := 'Copia generada exitosamente con nuevo ID ' || p_id_nuevo_archivo;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_COPIAR_ARCHIVO';
            vro_error.parametros          := 'p_id_archivo_origen: ' || p_id_archivo_origen || ', p_nuevo_id_residente: ' || p_nuevo_id_residente;
            vro_error.id_usuario_creacion := p_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_copiar_archivo;

    PROCEDURE pr_restaurar_archivo (
        p_id_archivo        IN  smy_archivos.id%TYPE,
        p_id_usuario        IN  smy_usuarios.id%TYPE,
        p_mensaje_resultado OUT VARCHAR2
    )
    IS
        vro_archivo smy_archivos%ROWTYPE;
    BEGIN
        vro_archivo := PKGSMY_ARCHIVOS_DAO.f_traer(p_id_archivo);
        IF vro_archivo.id IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El archivo solicitado (ID: ' || p_id_archivo || ') no existe.');
        END IF;

        vro_archivo.id_estado_archivo            := 1; -- 1 = Activo / Disponible
        vro_archivo.fecha_eliminacion            := NULL;
        vro_archivo.id_usuario_eliminacion       := NULL;
        vro_archivo.fecha_ultima_modificacion    := f_fecha_actual;
        vro_archivo.id_usuario_ultima_modificacion := p_id_usuario;

        PKGSMY_ARCHIVOS_DAO.p_actualizar(vro_archivo);

        -- Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_archivos.pr_restaurar_archivo');

        p_mensaje_resultado := 'Archivo ID ' || p_id_archivo || ' restaurado a visible exitosamente.';
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_RESTAURAR_ARCHIVO';
            vro_error.parametros          := 'p_id_archivo: ' || p_id_archivo || ', p_id_usuario: ' || p_id_usuario;
            vro_error.id_usuario_creacion := p_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_restaurar_archivo;

    PROCEDURE pr_preparar_carga_foto_talento (
        pcl_json      IN  CLOB,
        p_json_salida OUT CLOB
    )
    IS
        v_id_usuario        smy_usuarios.id%TYPE;
        v_identificacion    VARCHAR2(50);
        v_nombre_original   VARCHAR2(255);
        v_id_centro         smy_centros.id%TYPE;
        v_extension_norm    VARCHAR2(30);
        v_id_reserva        smy_archivos.id%TYPE;
        v_nombre_almacenado VARCHAR2(255);
        v_ruta_relativa     VARCHAR2(500);
        v_tipo_mime         VARCHAR2(100);
        vro_usuario         smy_usuarios%ROWTYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_id_usuario      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario'));
        v_identificacion  := TRIM(JSON_VALUE(pcl_json, '$.identificacion'));
        v_nombre_original := TRIM(JSON_VALUE(pcl_json, '$.nombreOriginal'));
        v_id_centro       := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));

        -- 2. Validaciones de negocio
        IF v_id_usuario IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El ID de usuario (smy_usuarios) es obligatorio para preparar la carga.');
        END IF;

        IF v_nombre_original IS NULL THEN
            RAISE_APPLICATION_ERROR(-20002, 'El nombre original de la fotografía es obligatorio.');
        END IF;

        IF PKGSMY_USUARIOS_DAO.f_existe(v_id_usuario, vro_usuario) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20003, 'El usuario con ID ' || v_id_usuario || ' no existe en el sistema.');
        END IF;

        IF v_identificacion IS NULL THEN
            v_identificacion := vro_usuario.username;
        END IF;

        -- 3. Normalizar extensión y tipo MIME
        v_extension_norm := fn_normalizar_extension(v_nombre_original);
        v_tipo_mime      := fn_resolver_mime_type(v_extension_norm);

        -- 4. Reservar ID de secuencia (asignación directa)
        v_id_reserva := SEQ_SMY_ARCHIVOS.NEXTVAL;

        -- 5. Generar nombre almacenado con el hash SHA-256 del ID reservado + extensión
        v_nombre_almacenado := fn_generar_nombre_almacenado(v_id_reserva, v_extension_norm);

        -- 6. Construir ruta relativa estándar: Talento_humano/{id_usuario}_{identificacion}
        v_ruta_relativa := fn_construir_ruta_talento_humano(v_id_usuario, v_identificacion);

        -- 7. Generar JSON de salida nativo
        SELECT JSON_OBJECT(
                   'idReserva'          VALUE v_id_reserva,
                   'nombreAlmacenado'   VALUE v_nombre_almacenado,
                   'directorioRaiz'     VALUE 'Samanya/Talento_humano',
                   'directorioUsuario'  VALUE v_id_usuario || '_' || fn_sanitizar_cadena(v_identificacion),
                   'rutaRelativa'       VALUE v_ruta_relativa,
                   'extension'          VALUE v_extension_norm,
                   'tipoMime'           VALUE v_tipo_mime,
                   'idCentro'           VALUE NVL(v_id_centro, 1)
                   RETURNING CLOB
               )
          INTO p_json_salida
          FROM DUAL;

    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_PREPARAR_CARGA_FOTO_TALENTO';
            vro_error.parametros          := pcl_json;
            vro_error.id_usuario_creacion := v_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_preparar_carga_foto_talento;

    PROCEDURE pr_registrar_foto_talento_humano (
        pcl_json IN CLOB
    )
    IS
        v_id                          smy_archivos.id%TYPE;
        v_id_usuario                  smy_usuarios.id%TYPE;
        v_id_empleado                 smy_empleados.id%TYPE;
        v_identificacion              VARCHAR2(50);
        v_nombre_archivo              smy_archivos.nombre_archivo%TYPE;
        v_nombre_archivo_almacenado   smy_archivos.nombre_archivo_almacenado%TYPE;
        v_hash_archivo                smy_archivos.hash_archivo%TYPE;
        v_ruta_relativa               smy_archivos.ruta_relativa%TYPE;
        v_ruta_completa               smy_archivos.ruta_completa_almacenamiento%TYPE;
        v_avatar_url                  VARCHAR2(1000);
        v_extension                   smy_archivos.extension%TYPE;
        v_tipo_mime                   smy_archivos.tipo_mime%TYPE;
        v_tamano_bytes                smy_archivos.tamano_bytes%TYPE;
        v_id_centro                   smy_archivos.id_centro%TYPE;
        v_id_usuario_creacion         smy_usuarios.id%TYPE;
        v_json_busqueda               CLOB;
        v_id_existente                smy_archivos.id%TYPE;

        vro_archivo                   smy_archivos%ROWTYPE;
        vro_usuario                   smy_usuarios%ROWTYPE;
        vro_empleado                  smy_empleados%ROWTYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_id                        := TO_NUMBER(JSON_VALUE(pcl_json, '$.id'));
        v_id_usuario                := TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario'));
        v_id_empleado               := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEmpleado'));
        IF v_id_empleado IS NULL THEN
            v_id_empleado := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTrabajador'));
        END IF;

        v_identificacion            := TRIM(JSON_VALUE(pcl_json, '$.identificacion'));
        v_nombre_archivo            := TRIM(JSON_VALUE(pcl_json, '$.nombreArchivo'));
        v_nombre_archivo_almacenado := TRIM(JSON_VALUE(pcl_json, '$.nombreArchivoAlmacenado'));
        v_hash_archivo              := TRIM(JSON_VALUE(pcl_json, '$.hashArchivo'));
        v_ruta_relativa             := TRIM(JSON_VALUE(pcl_json, '$.rutaRelativa'));
        v_ruta_completa             := TRIM(JSON_VALUE(pcl_json, '$.rutaCompletaAlmacenamiento'));
        v_avatar_url                := TRIM(JSON_VALUE(pcl_json, '$.avatarUrl'));
        v_extension                 := TRIM(JSON_VALUE(pcl_json, '$.extension'));
        v_tipo_mime                 := TRIM(JSON_VALUE(pcl_json, '$.tipoMime'));
        v_tamano_bytes              := TO_NUMBER(JSON_VALUE(pcl_json, '$.tamanoBytes'));
        v_id_centro                 := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_usuario_creacion       := TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuarioCreacion'));

        -- Si no se suministró idUsuario pero sí idEmpleado/idTrabajador, resolverlo vía DAO
        IF v_id_usuario IS NULL AND v_id_empleado IS NOT NULL THEN
            IF PKGSMY_EMPLEADOS_DAO.f_existe(v_id_empleado, vro_empleado) = TRUE THEN
                v_id_usuario := vro_empleado.id_usuario;
                IF v_identificacion IS NULL THEN
                    v_identificacion := vro_empleado.identificacion;
                END IF;
                IF v_id_centro IS NULL THEN
                    v_id_centro := vro_empleado.id_centro;
                END IF;
            END IF;
        END IF;

        -- 2. Validaciones obligatorias de negocio
        IF v_id_usuario IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El ID de usuario (smy_usuarios) es obligatorio para registrar la foto.');
        END IF;

        IF v_avatar_url IS NULL AND v_ruta_completa IS NOT NULL THEN
            v_avatar_url := v_ruta_completa;
        ELSIF v_ruta_completa IS NULL AND v_avatar_url IS NOT NULL THEN
            v_ruta_completa := v_avatar_url;
        END IF;

        IF v_avatar_url IS NULL THEN
            RAISE_APPLICATION_ERROR(-20003, 'La URL del avatar es obligatoria para actualizar el perfil.');
        END IF;

        -- Si el usuario no existe aún en SMY_USUARIOS, se auto-aprovisiona vía DAO
        IF PKGSMY_USUARIOS_DAO.f_existe(v_id_usuario, vro_usuario) = FALSE THEN
            vro_usuario.id                             := v_id_usuario;
            vro_usuario.id_rol                         := 2;
            vro_usuario.id_tipo_usuario                 := 2;
            vro_usuario.username                       := LOWER(SUBSTR(NVL(v_identificacion, 'usr_' || v_id_usuario), 1, 30));
            vro_usuario.email                          := LOWER(NVL(JSON_VALUE(pcl_json, '$.email'), 'colaborador' || v_id_usuario || '@samanyacare.com'));
            vro_usuario.nombre_completo                := NVL(JSON_VALUE(pcl_json, '$.nombreCompleto'), 'Colaborador ' || v_id_usuario);
            vro_usuario.telefono                       := NVL(JSON_VALUE(pcl_json, '$.telefono'), '3000000000');
            vro_usuario.id_archivo_foto_perfil         := v_id;
            vro_usuario.id_canal_notif_pref            := 1;
            vro_usuario.id_estado_usuario              := 1;
            vro_usuario.fecha_creacion                 := f_fecha_actual;
            vro_usuario.id_usuario_ultima_modificacion := NVL(v_id_usuario_creacion, v_id_usuario);
            PKGSMY_USUARIOS_DAO.p_insertar(vro_usuario);
        END IF;

        IF v_identificacion IS NULL THEN
            v_identificacion := vro_usuario.username;
        END IF;

        IF v_nombre_archivo IS NULL THEN
            v_nombre_archivo := 'foto_talento_' || v_id_usuario || '.jpg';
        END IF;

        v_extension := fn_normalizar_extension(NVL(v_extension, v_nombre_archivo));
        IF v_tipo_mime IS NULL THEN
            v_tipo_mime := fn_resolver_mime_type(v_extension);
        END IF;

        -- Asignación directa de secuencia si no se pasó reserva previa
        IF v_id IS NOT NULL THEN
            vro_archivo.id := v_id;
        ELSE
            vro_archivo.id := SEQ_SMY_ARCHIVOS.NEXTVAL;
        END IF;

        IF v_nombre_archivo_almacenado IS NULL THEN
            v_nombre_archivo_almacenado := fn_generar_nombre_almacenado(vro_archivo.id, v_extension);
        END IF;

        IF v_hash_archivo IS NULL THEN
            v_hash_archivo := SUBSTR(v_nombre_archivo_almacenado, 1, INSTR(v_nombre_archivo_almacenado, '.') - 1);
            IF v_hash_archivo IS NULL THEN
                v_hash_archivo := v_nombre_archivo_almacenado;
            END IF;
        END IF;

        -- Ruta relativa exacta requerida: Talento_humano/{id_usuario}_{identificacion}
        IF v_ruta_relativa IS NULL THEN
            v_ruta_relativa := fn_construir_ruta_talento_humano(v_id_usuario, v_identificacion);
        END IF;

        -- 3. Asignación del registro en SMY_ARCHIVOS
        vro_archivo.nombre_archivo               := v_nombre_archivo;
        vro_archivo.nombre_archivo_almacenado    := v_nombre_archivo_almacenado;
        vro_archivo.hash_archivo                 := v_hash_archivo;
        vro_archivo.nombre_directorio_bd         := NULL;
        vro_archivo.ruta_relativa                := v_ruta_relativa;
        vro_archivo.ruta_completa_almacenamiento := v_ruta_completa;
        vro_archivo.extension                    := v_extension;
        vro_archivo.tipo_mime                    := v_tipo_mime;
        vro_archivo.tamano_bytes                 := NVL(v_tamano_bytes, 0);
        vro_archivo.id_clase_archivo             := 5; -- Evidencia / Foto asistencial o clase configurada
        vro_archivo.id_centro                    := NVL(v_id_centro, 1);
        vro_archivo.id_residente                 := NULL;
        vro_archivo.id_estado_archivo            := 1; -- Activo / Disponible
        vro_archivo.tabla_origen                 := 'SMY_USUARIOS';
        vro_archivo.id_registro_origen           := v_id_usuario;
        SELECT JSON_OBJECT(
                   'modulo'         VALUE 'TALENTO_HUMANO',
                   'identificacion' VALUE v_identificacion,
                   'avatarUrl'      VALUE v_avatar_url,
                   'directorioRaiz' VALUE 'Samanya/Talento_humano'
                   RETURNING CLOB
               )
          INTO vro_archivo.metadatos_json
          FROM DUAL;
        vro_archivo.fecha_creacion               := f_fecha_actual;
        vro_archivo.fecha_ultima_modificacion    := f_fecha_actual;
        vro_archivo.id_usuario_ultima_modificacion := NVL(v_id_usuario_creacion, v_id_usuario);

        -- Verificar si ya existe registro con este nombre almacenado para evitar ORA-00001 en UQ_SMY_ARC_ALMACENADO
        SELECT JSON_OBJECT(
                   'nombreArchivoAlmacenado' VALUE vro_archivo.nombre_archivo_almacenado
                   RETURNING CLOB
               )
          INTO v_json_busqueda
          FROM DUAL;

        v_id_existente := PKGCA_SMY_ARCHIVOS.fn_obtener_id_por_almacenado(v_json_busqueda);

        IF v_id_existente IS NOT NULL THEN
            vro_archivo.id := v_id_existente;
            PKGSMY_ARCHIVOS_DAO.p_actualizar(vro_archivo);
        ELSE
            PKGSMY_ARCHIVOS_DAO.p_insertar(vro_archivo);
        END IF;

        -- 4. Actualización del campo avatar_url en SMY_USUARIOS vía DAO
        vro_usuario.id_archivo_foto_perfil         := v_id;
        vro_usuario.fecha_creacion                 := NVL(vro_usuario.fecha_creacion, f_fecha_actual);
        vro_usuario.id_usuario_ultima_modificacion := NVL(v_id_usuario_creacion, v_id_usuario);
        PKGSMY_USUARIOS_DAO.p_actualizar(vro_usuario);

        -- 5. Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_archivos.pr_registrar_foto_talento_humano');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_REGISTRAR_FOTO_TALENTO_HUMANO';
            vro_error.parametros          := pcl_json;
            vro_error.id_usuario_creacion := NVL(v_id_usuario_creacion, v_id_usuario);
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_foto_talento_humano;

    PROCEDURE pr_subir_foto_talento_humano (
        pcl_json IN CLOB
    )
    IS
    BEGIN
        -- Orquesta la persistencia completa delegando la transacción controlada
        pr_registrar_foto_talento_humano(pcl_json);
    END pr_subir_foto_talento_humano;

    PROCEDURE pr_registrar_soporte_talento_humano (
        pcl_json IN CLOB
    )
    IS
        v_id                          smy_archivos.id%TYPE;
        v_id_usuario                  smy_usuarios.id%TYPE;
        v_id_empleado                 smy_empleados.id%TYPE;
        v_identificacion              VARCHAR2(50);
        v_nombre_archivo              smy_archivos.nombre_archivo%TYPE;
        v_nombre_archivo_almacenado   smy_archivos.nombre_archivo_almacenado%TYPE;
        v_hash_archivo                smy_archivos.hash_archivo%TYPE;
        v_ruta_relativa               smy_archivos.ruta_relativa%TYPE;
        v_ruta_completa               smy_archivos.ruta_completa_almacenamiento%TYPE;
        v_extension                   smy_archivos.extension%TYPE;
        v_tipo_mime                   smy_archivos.tipo_mime%TYPE;
        v_tamano_bytes                smy_archivos.tamano_bytes%TYPE;
        v_id_centro                   smy_archivos.id_centro%TYPE;
        v_id_solicitud_permiso        smy_solicitudes_permisos.id%TYPE;
        v_id_usuario_creacion         smy_usuarios.id%TYPE;
        v_json_busqueda               CLOB;
        v_id_existente                smy_archivos.id%TYPE;

        vro_archivo                   smy_archivos%ROWTYPE;
        vro_empleado                  smy_empleados%ROWTYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_id                        := TO_NUMBER(JSON_VALUE(pcl_json, '$.id'));
        v_id_empleado               := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEmpleado'));
        IF v_id_empleado IS NULL THEN
            v_id_empleado           := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTrabajador'));
        END IF;
        v_id_usuario                := TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario'));
        v_identificacion            := TRIM(JSON_VALUE(pcl_json, '$.identificacion'));
        v_nombre_archivo            := TRIM(JSON_VALUE(pcl_json, '$.nombreArchivo'));
        v_nombre_archivo_almacenado := TRIM(JSON_VALUE(pcl_json, '$.nombreArchivoAlmacenado'));
        v_hash_archivo              := TRIM(JSON_VALUE(pcl_json, '$.hashArchivo'));
        v_ruta_relativa             := TRIM(JSON_VALUE(pcl_json, '$.rutaRelativa'));
        v_ruta_completa             := TRIM(JSON_VALUE(pcl_json, '$.rutaCompletaAlmacenamiento'));
        v_extension                 := TRIM(JSON_VALUE(pcl_json, '$.extension'));
        v_tipo_mime                 := TRIM(JSON_VALUE(pcl_json, '$.tipoMime'));
        v_tamano_bytes              := TO_NUMBER(JSON_VALUE(pcl_json, '$.tamanoBytes'));
        v_id_centro                 := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_id_solicitud_permiso      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idSolicitudPermiso'));
        v_id_usuario_creacion       := TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuarioCreacion'));

        -- Resolver empleado y sede si faltan
        IF v_id_empleado IS NOT NULL THEN
            IF PKGSMY_EMPLEADOS_DAO.f_existe(v_id_empleado, vro_empleado) = TRUE THEN
                IF v_id_usuario IS NULL THEN
                    v_id_usuario := vro_empleado.id_usuario;
                END IF;
                IF v_identificacion IS NULL THEN
                    v_identificacion := vro_empleado.identificacion;
                END IF;
                IF v_id_centro IS NULL THEN
                    v_id_centro := vro_empleado.id_centro;
                END IF;
            END IF;
        END IF;

        IF v_nombre_archivo IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El nombre original del archivo de soporte es obligatorio.');
        END IF;

        IF v_ruta_completa IS NULL THEN
            RAISE_APPLICATION_ERROR(-20002, 'La ruta de almacenamiento en Google Drive es obligatoria.');
        END IF;

        v_extension := fn_normalizar_extension(NVL(v_extension, v_nombre_archivo));
        IF v_tipo_mime IS NULL THEN
            v_tipo_mime := fn_resolver_mime_type(v_extension);
        END IF;

        -- Ruta relativa requerida: Samanya/Talento_humano/{id}_{identificacion}
        IF v_ruta_relativa IS NULL THEN
            v_ruta_relativa := 'Samanya/Talento_humano/' || NVL(v_id_empleado, NVL(v_id_usuario, 1)) || '_' || NVL(v_identificacion, 'DOC');
        END IF;

        -- Asignación directa de secuencia
        IF v_id IS NOT NULL THEN
            vro_archivo.id := v_id;
        ELSE
            vro_archivo.id := SEQ_SMY_ARCHIVOS.NEXTVAL;
        END IF;

        IF v_nombre_archivo_almacenado IS NULL THEN
            v_nombre_archivo_almacenado := NVL(v_hash_archivo, fn_generar_nombre_almacenado(vro_archivo.id, v_extension)) || v_extension;
        END IF;

        IF v_hash_archivo IS NULL THEN
            v_hash_archivo := SUBSTR(v_nombre_archivo_almacenado, 1, INSTR(v_nombre_archivo_almacenado, '.') - 1);
            IF v_hash_archivo IS NULL THEN
                v_hash_archivo := v_nombre_archivo_almacenado;
            END IF;
        END IF;

        -- Llenado del registro smy_archivos
        vro_archivo.nombre_archivo               := v_nombre_archivo;
        vro_archivo.nombre_archivo_almacenado    := v_nombre_archivo_almacenado;
        vro_archivo.hash_archivo                 := v_hash_archivo;
        vro_archivo.nombre_directorio_bd         := NULL;
        vro_archivo.ruta_relativa                := v_ruta_relativa;
        vro_archivo.ruta_completa_almacenamiento := v_ruta_completa;
        vro_archivo.extension                    := v_extension;
        vro_archivo.tipo_mime                    := v_tipo_mime;
        vro_archivo.tamano_bytes                 := NVL(v_tamano_bytes, 0);
        vro_archivo.id_clase_archivo             := 6; -- Documentación / Soporte
        vro_archivo.id_centro                    := NVL(v_id_centro, 1);
        vro_archivo.id_residente                 := NULL;
        vro_archivo.id_estado_archivo            := 1; -- Activo
        vro_archivo.tabla_origen                 := 'SMY_SOLICITUDES_PERMISOS';
        vro_archivo.id_registro_origen           := NVL(v_id_solicitud_permiso, v_id_empleado);
        SELECT JSON_OBJECT(
                   'modulo'                  VALUE 'TALENTO_HUMANO',
                   'tipo'                    VALUE 'SOPORTE_PERMISO',
                   'identificacion'          VALUE v_identificacion,
                   'idEmpleado'              VALUE v_id_empleado,
                   'directorioRaiz'          VALUE 'Samanya/Talento_humano',
                   'directorioColaborador'   VALUE NVL(v_id_empleado, v_id_usuario) || '_' || v_identificacion
                   RETURNING CLOB
               )
          INTO vro_archivo.metadatos_json
          FROM DUAL;
        vro_archivo.fecha_creacion               := f_fecha_actual;
        vro_archivo.fecha_ultima_modificacion    := f_fecha_actual;
        vro_archivo.id_usuario_ultima_modificacion := NVL(v_id_usuario_creacion, NVL(v_id_usuario, 1));

        -- Verificar si ya existe registro con este nombre almacenado
        SELECT JSON_OBJECT(
                   'nombreArchivoAlmacenado' VALUE vro_archivo.nombre_archivo_almacenado
                   RETURNING CLOB
               )
          INTO v_json_busqueda
          FROM DUAL;

        v_id_existente := PKGCA_SMY_ARCHIVOS.fn_obtener_id_por_almacenado(v_json_busqueda);

        IF v_id_existente IS NOT NULL THEN
            vro_archivo.id := v_id_existente;
            PKGSMY_ARCHIVOS_DAO.p_actualizar(vro_archivo);
        ELSE
            PKGSMY_ARCHIVOS_DAO.p_insertar(vro_archivo);
        END IF;

        -- Control transaccional en pkgln_
        p_do_commit('pkgln_archivos.pr_registrar_soporte_talento_humano');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_REGISTRAR_SOPORTE_TALENTO_HUMANO';
            vro_error.parametros          := pcl_json;
            vro_error.id_usuario_creacion := NVL(v_id_usuario_creacion, 1);
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_soporte_talento_humano;

    -- =========================================================================
    -- 3. Consultas y representación de datos
    -- =========================================================================

    FUNCTION fn_consultar_archivos_residente (
        p_id_residente  IN smy_residentes.id%TYPE,
        p_solo_visibles IN NUMBER DEFAULT 1
    ) RETURN SYS_REFCURSOR
    IS
    BEGIN
        RETURN PKGCA_SMY_ARCHIVOS.fn_consultar_archivos_residente(p_id_residente, p_solo_visibles);
    END fn_consultar_archivos_residente;

    FUNCTION fn_obtener_archivo_json (
        p_id_archivo IN smy_archivos.id%TYPE
    ) RETURN CLOB
    IS
    BEGIN
        RETURN PKGCA_SMY_ARCHIVOS.fn_obtener_archivo_json(p_id_archivo);
    END fn_obtener_archivo_json;

    PROCEDURE pr_vincular_archivo_doc_clinico (
        pro_archivo            IN  smy_archivos%ROWTYPE,
        p_id_documento_clinico IN  smy_documentos_clinicos.id%TYPE,
        p_id_usuario           IN  smy_usuarios.id%TYPE
    ) IS
        vro_doc smy_documentos_clinicos%ROWTYPE;
    BEGIN
        -- 1. Insertar o registrar archivo vía DAO
        IF NOT PKGSMY_ARCHIVOS_DAO.f_existe(pro_archivo.id) THEN
            PKGSMY_ARCHIVOS_DAO.p_insertar(pro_archivo);
        END IF;

        -- 2. Actualizar documento clínico vía DAO
        IF PKGSMY_DOCUMENTOS_CLINICOS_DAO.f_existe(p_id_documento_clinico, vro_doc) = TRUE THEN
            vro_doc.id_archivo_clinico             := pro_archivo.id;
            vro_doc.id_usuario_ultima_modificacion := p_id_usuario;
            PKGSMY_DOCUMENTOS_CLINICOS_DAO.p_actualizar(vro_doc);
        END IF;

        -- 3. Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_archivos.pr_vincular_archivo_doc_clinico');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_VINCULAR_ARCHIVO_DOC_CLINICO';
            vro_error.parametros          := 'p_id_archivo: ' || pro_archivo.id || ', p_id_doc: ' || p_id_documento_clinico;
            vro_error.id_usuario_creacion := p_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_vincular_archivo_doc_clinico;

    PROCEDURE pr_desvincular_archivo_doc_clinico (
        p_id_archivo           IN  smy_archivos.id%TYPE,
        p_id_documento_clinico IN  smy_documentos_clinicos.id%TYPE,
        p_id_usuario           IN  smy_usuarios.id%TYPE
    ) IS
        vro_archivo smy_archivos%ROWTYPE;
        vro_doc     smy_documentos_clinicos%ROWTYPE;
    BEGIN
        -- 1. Actualizar estado de archivo a eliminado lógico vía DAO
        IF PKGSMY_ARCHIVOS_DAO.f_existe(p_id_archivo, vro_archivo) = TRUE THEN
            vro_archivo.id_estado_archivo              := 2; -- No visible
            vro_archivo.fecha_eliminacion              := f_fecha_actual;
            vro_archivo.id_usuario_eliminacion         := p_id_usuario;
            vro_archivo.fecha_ultima_modificacion      := f_fecha_actual;
            vro_archivo.id_usuario_ultima_modificacion := p_id_usuario;
            PKGSMY_ARCHIVOS_DAO.p_actualizar(vro_archivo);
        END IF;

        -- 2. Desvincular en documento clínico vía DAO
        IF PKGSMY_DOCUMENTOS_CLINICOS_DAO.f_existe(p_id_documento_clinico, vro_doc) = TRUE THEN
            vro_doc.id_archivo_clinico             := NULL;
            vro_doc.id_usuario_ultima_modificacion := p_id_usuario;
            PKGSMY_DOCUMENTOS_CLINICOS_DAO.p_actualizar(vro_doc);
        END IF;

        -- 3. Control transaccional en pkgln_ (COMMIT controlado)
        p_do_commit('pkgln_archivos.pr_desvincular_archivo_doc_clinico');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            vro_error.nombre_programa     := 'PKGLN_ARCHIVOS';
            vro_error.nombre_metodo       := 'PR_DESVINCULAR_ARCHIVO_DOC_CLINICO';
            vro_error.parametros          := 'p_id_archivo: ' || p_id_archivo || ', p_id_doc: ' || p_id_documento_clinico;
            vro_error.id_usuario_creacion := p_id_usuario;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_desvincular_archivo_doc_clinico;

END PKGLN_ARCHIVOS;
/
