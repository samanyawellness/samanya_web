import sys
import os
import json
import datetime
import oracledb

# Asegurar codificación UTF-8 estricta en Windows para evitar caracteres corruptos (mojibake)
if hasattr(sys.stdin, 'reconfigure'):
    sys.stdin.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def get_connection():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    wallet_dir = os.path.join(script_dir, "wallet")
    if not os.path.exists(wallet_dir):
        wallet_dir = os.path.abspath("./wallet")

    return oracledb.connect(
        user=os.environ.get('ORACLE_USER', 'SAMANYA'),
        password=os.environ.get('ORACLE_PASSWORD', 'T3k3r_2025_DEV'),
        dsn=os.environ.get('ORACLE_DSN', 'samanya_tp'),
        config_dir=wallet_dir,
        wallet_location=wallet_dir,
        wallet_password=os.environ.get('ORACLE_WALLET_PASSWORD', 'Samanya2026*')
    )

def json_serial(obj):
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
            print(json.dumps({"success": False, "error": "No input provided"}))
            return

        req = json.loads(raw_input)
        pkg = req.get("package", "").upper().strip()
        proc = req.get("procedure", "").upper().strip()
        payload = req.get("payload", {})

        if not pkg or not proc:
            print(json.dumps({"success": False, "error": "Package and procedure are required"}))
            return

        # Solo permitir paquetes y procedimientos válidos alfanuméricos por seguridad
        if not pkg.replace("_", "").isalnum() or not proc.replace("_", "").isalnum():
            print(json.dumps({"success": False, "error": "Invalid package or procedure name"}))
            return

        conn = get_connection()
        c = conn.cursor()
        try:
            c.execute("ALTER SESSION DISABLE PARALLEL DML")
        except Exception:
            pass

        # 1. Si es una función que retorna CLOB JSON nativo (F_*)
        if proc.startswith("F_") or proc.startswith("FN_"):
            c.execute(f"SELECT {pkg}.{proc}(:pcl_json) FROM DUAL", [json.dumps(payload)])
            row = c.fetchone()
            val = row[0] if row else None
            val_str = val.read() if hasattr(val, 'read') else (str(val) if val is not None else "{}")
            try:
                parsed = json.loads(val_str)
                print(json.dumps({"success": True, "data": parsed}, default=json_serial))
            except Exception:
                print(json.dumps({"success": True, "data": val_str}, default=json_serial))
            c.close()
            conn.close()
            return

        # 2. Si es un procedimiento que retorna SYS_REFCURSOR (P_CONSULTAR*, PR_CONSULTAR*, P_LISTAR*, etc.)
        if proc.startswith("P_CONSULTAR") or proc.startswith("PR_CONSULTAR") or proc.startswith("P_LISTAR") or proc.startswith("PR_LISTAR"):
            try:
                ref_cursor = conn.cursor()
                c.callproc(f"{pkg}.{proc}", [json.dumps(payload), ref_cursor])
                cols = [d[0].lower() for d in ref_cursor.description] if ref_cursor.description else []
                rows = ref_cursor.fetchall()
                data = []
                for r in rows:
                    row_dict = {}
                    for col, val in zip(cols, r):
                        if hasattr(val, 'read'):
                            row_dict[col] = val.read()
                        else:
                            row_dict[col] = val
                    data.append(row_dict)
                ref_cursor.close()
                c.close()
                conn.close()

                print(json.dumps({"success": True, "data": data, "count": len(data)}, default=json_serial))
                return
            except Exception as pe:
                err_str = str(pe)
                if ("PLS-00201" in err_str or "ORA-06550" in err_str) and pkg == "PKGCA_SMY_EMPLEADOS":
                    id_centro = payload.get("idCentro")
                    q = """
                    SELECT 
                        e.id,
                        e.id_centro,
                        NVL(t.sigla, 'CC') AS tipo_identificacion,
                        e.identificacion,
                        e.nombres,
                        e.apellidos,
                        e.nombres || ' ' || e.apellidos AS nombre_completo,
                        NVL(c.nombre_cargo_empleado, 'Cuidador') AS cargo,
                        NVL(a.nombre_area_empleado, 'Cuidado Asistencial') AS area,
                        e.unidad_asignada,
                        e.telefono,
                        NVL(e.email_corp, u.email) AS email,
                        TO_CHAR(e.fecha_contratacion, 'YYYY-MM-DD') AS fecha_contratacion,
                        NVL(es.nombre_estado_empleado, 'Activo') AS estado,
                        u.avatar_url
                    FROM smy_empleados e,
                         smy_usuarios u,
                         smy_cargos_empleados c,
                         smy_areas_empleados a,
                         smy_estados_empleados es,
                         smy_tipos_identificacion t
                    WHERE e.id_usuario = u.id(+)
                      AND e.id_cargo_empleado = c.id(+)
                      AND e.id_area_empleado = a.id(+)
                      AND e.id_estado_empleado = es.id(+)
                      AND e.id_tipo_identificacion = t.id(+)
                    """
                    params = []
                    if id_centro:
                        q += " AND e.id_centro = :1"
                        params.append(id_centro)
                    q += " ORDER BY e.id"
                    c.execute(q, params)
                    cols = [d[0].lower() for d in c.description] if c.description else []
                    rows = c.fetchall()
                    data = [dict(zip(cols, r)) for r in rows]
                    c.close()
                    conn.close()
                    print(json.dumps({"success": True, "data": data, "count": len(data)}, default=json_serial))
                    return

                if ("PLS-00201" in err_str or "ORA-06550" in err_str) and pkg == "PKGCA_SMY_ACUDIENTES":
                    id_centro = payload.get("idCentro")
                    q = """
                    SELECT 
                        a.id,
                        NVL(t.sigla, 'CC') AS tipo_identificacion,
                        a.identificacion,
                        a.nombres,
                        a.apellidos,
                        a.nombres || ' ' || a.apellidos AS nombre_completo,
                        a.telefono_principal,
                        a.telefono_secundario,
                        a.email,
                        a.direccion,
                        a.ciudad,
                        NVL(cn.nombre_canal_notificacion, 'WhatsApp') AS canal_notificacion_pref,
                        u.avatar_url,
                        (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'idResidente'        VALUE ra.id_residente,
                                    'nombreResidente'    VALUE (r.nombres || ' ' || r.apellidos),
                                    'parentesco'         VALUE NVL(p.nombre_parentesco, 'Familiar'),
                                    'esPrincipal'        VALUE CASE WHEN ra.es_principal = 'S' OR ra.es_principal = '1' THEN 1 ELSE 0 END,
                                    'autorizadoSalidas'  VALUE CASE WHEN ra.autorizado_salidas = 'S' OR ra.autorizado_salidas = '1' THEN 1 ELSE 0 END,
                                    'responsablePago'    VALUE CASE WHEN ra.es_responsable_pago = 'S' OR ra.es_responsable_pago = '1' THEN 1 ELSE 0 END
                                ) RETURNING CLOB
                            )
                            FROM smy_residente_acudiente ra,
                                 smy_residentes r,
                                 smy_parentescos p
                            WHERE ra.id_acudiente = a.id
                              AND ra.id_residente = r.id
                              AND ra.id_parentesco = p.id(+)
                        ) AS residentes_asociados_json
                    FROM smy_acudientes a,
                         smy_usuarios u,
                         smy_tipos_identificacion t,
                         smy_canales_notificacion cn
                    WHERE a.id_usuario = u.id(+)
                      AND a.id_tipo_identificacion = t.id(+)
                      AND a.id_canal_notif_pref = cn.id(+)
                    """
                    params = []
                    if id_centro:
                        q += """ AND EXISTS (
                            SELECT 1 FROM smy_residente_acudiente ra2, smy_residentes r2
                            WHERE ra2.id_acudiente = a.id AND ra2.id_residente = r2.id AND r2.id_centro = :1
                        )"""
                        params.append(id_centro)
                    q += " ORDER BY a.id"
                    c.execute(q, params)
                    cols = [d[0].lower() for d in c.description] if c.description else []
                    rows = c.fetchall()
                    data = []
                    for r in rows:
                        row_dict = {}
                        for col, val in zip(cols, r):
                            if hasattr(val, 'read'):
                                row_dict[col] = val.read()
                            else:
                                row_dict[col] = val
                        data.append(row_dict)
                    c.close()
                    conn.close()
                    print(json.dumps({"success": True, "data": data, "count": len(data)}, default=json_serial))
                    return

                raise pe

        # 3. Ejecución estándar de procedimiento PL/SQL transaccional (PKGLN_, PKGCN_, etc.)
        plsql = f"BEGIN {pkg}.{proc}(:pcl_json); END;"
        c.execute(plsql, [json.dumps(payload)])
        # Nota: el commit lo realiza el paquete vía p_do_commit; no obstante se asegura cierre
        c.close()
        conn.close()

        print(json.dumps({"success": True, "message": f"{pkg}.{proc} ejecutado exitosamente"}))

    except Exception as e:
        import traceback
        err_msg = str(e)
        print(json.dumps({"success": False, "error": err_msg, "traceback": traceback.format_exc()}))

if __name__ == "__main__":
    main()
