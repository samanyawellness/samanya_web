import sys
import os
import json
import urllib.request
import urllib.parse
import hashlib
import uuid
import oracledb

def load_gdrive_config():
    client_id = os.environ.get("GDRIVE_CLIENT_ID")
    client_secret = os.environ.get("GDRIVE_CLIENT_SECRET")
    refresh_token = os.environ.get("GDRIVE_REFRESH_TOKEN")
    
    if not (client_id and client_secret and refresh_token):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        possible_paths = [
            os.path.join(script_dir, "gdrive_credentials.json"),
            os.path.join(os.path.dirname(script_dir), "gdrive_credentials.json"),
            os.path.join(os.path.dirname(script_dir), "backend", "gdrive_credentials.json")
        ]
        for p in possible_paths:
            if os.path.exists(p):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        cfg = json.load(f)
                        client_id = client_id or cfg.get("client_id")
                        client_secret = client_secret or cfg.get("client_secret")
                        refresh_token = refresh_token or cfg.get("refresh_token")
                        break
                except Exception:
                    pass
    return client_id, client_secret, refresh_token

def get_access_token():
    client_id, client_secret, refresh_token = load_gdrive_config()
    if not (client_id and client_secret and refresh_token):
        raise ValueError("Credenciales Google Drive no configuradas en backend/gdrive_credentials.json. Ejecute 'python backend/oauth_setup.py'.")

    url = "https://oauth2.googleapis.com/token"
    data = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            return res["access_token"]
    except urllib.error.HTTPError as he:
        body = he.read().decode("utf-8")
        if "invalid_grant" in body:
            raise ValueError("El Refresh Token de Google Drive ha expirado o fue revocado por Google (en modo de prueba personal de Google Cloud los tokens expiran cada 7 días). Por favor ejecute en su terminal 'python backend/oauth_setup.py' para re-autorizar su cuenta.")
        raise ValueError(f"Error de Google OAuth al renovar token ({he.code}): {body}")

def find_or_create_folder(access_token, folder_name, parent_id=None):
    if parent_id:
        q = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed = false"
    else:
        q = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    
    url = f"https://www.googleapis.com/drive/v3/files?q={urllib.parse.quote(q)}&fields=files(id,name)&spaces=drive"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            if res.get("files"):
                return res["files"][0]["id"]
    except Exception as e:
        sys.stderr.write(f"Aviso al listar carpeta '{folder_name}': {e}\n")
            
    # Si no existe, crear la carpeta automáticamente en la jerarquía
    meta = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder"
    }
    if parent_id:
        meta["parents"] = [parent_id]
        
    req = urllib.request.Request(
        "https://www.googleapis.com/drive/v3/files",
        data=json.dumps(meta).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        return res["id"]

def upload_file_to_drive(access_token, parent_folder_id, file_name, file_bytes, mime_type="image/jpeg"):
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    metadata = {
        "name": file_name,
        "parents": [parent_folder_id]
    }
    
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b"Content-Type: application/json; charset=UTF-8\r\n\r\n")
    body.extend(json.dumps(metadata).encode("utf-8"))
    body.extend(b"\r\n")
    
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f"Content-Type: {mime_type}\r\n\r\n".encode("utf-8"))
    body.extend(file_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))
    
    upload_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink"
    req = urllib.request.Request(
        upload_url,
        data=bytes(body),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": f"multipart/related; boundary={boundary}"
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        file_id = res["id"]
        
    # Public reader permission for avatar display
    perm_url = f"https://www.googleapis.com/drive/v3/files/{file_id}/permissions"
    perm_req = urllib.request.Request(
        perm_url,
        data=json.dumps({"role": "reader", "type": "anyone"}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(perm_req) as resp:
            pass
    except Exception as pe:
        pass
        
    return {
        "fileId": file_id,
        "name": file_name,
        "avatarUrl": f"https://lh3.googleusercontent.com/d/{file_id}"
    }

def get_oracle_conn():
    try:
        return oracledb.connect(
            user='SAMANYA',
            password='T3k3r_2025_DEV',
            dsn=os.environ.get('ORACLE_DSN', 'samanya_tp'),
            config_dir='./wallet',
            wallet_location='./wallet',
            wallet_password='Samanya2026*'
        )
    except Exception as oe:
        sys.stderr.write(f"Aviso Oracle Connection: {str(oe)}\n")
        return None

def get_next_archivo_id(conn):
    if conn:
        try:
            with conn.cursor() as c:
                c.execute("SELECT SEQ_SMY_ARCHIVOS.NEXTVAL FROM DUAL")
                row = c.fetchone()
                if row and row[0]:
                    return int(row[0])
        except Exception as e:
            sys.stderr.write(f"Aviso al obtener SEQ_SMY_ARCHIVOS.NEXTVAL: {e}\n")
    import time
    return int(time.time() * 1000) % 2000000000

def get_nombre_sede(conn, id_centro):
    if conn:
        try:
            with conn.cursor() as c:
                c.execute("SELECT NOMBRE_CENTRO FROM SMY_CENTROS WHERE ID = :1", [id_centro])
                row = c.fetchone()
                if row and row[0]:
                    return str(row[0]).strip()
        except Exception:
            pass
    return "Sede Central Bogotá" if id_centro == 1 else f"Sede {id_centro}"

def register_smy_archivo(conn, id_archivo, id_centro, id_clase, id_residente, id_empleado,
                         nombre_original, nombre_almacenado, hash_sha256, ext, mime_type,
                         tamano_bytes, ruta_relativa, ruta_drive, id_drive, descripcion=None):
    if not conn:
        return False
    try:
        import json
        metadatos = json.dumps({
            "id_drive": id_drive,
            "descripcion": descripcion,
            "ruta_drive": ruta_drive
        }, ensure_ascii=False)
        with conn.cursor() as c:
            sql = """
                MERGE INTO SMY_ARCHIVOS dest
                USING (SELECT :id AS ID FROM DUAL) src
                ON (dest.ID = src.ID)
                WHEN MATCHED THEN
                    UPDATE SET
                        ID_CENTRO = :id_centro,
                        ID_CLASE_ARCHIVO = :id_clase,
                        ID_RESIDENTE = :id_residente,
                        ID_EMPLEADO = :id_empleado,
                        NOMBRE_ARCHIVO = :nombre_archivo,
                        NOMBRE_ARCHIVO_ALMACENADO = :nombre_almacenado,
                        HASH_ARCHIVO = :hash_archivo,
                        EXTENSION = :ext,
                        TIPO_MIME = :tipo_mime,
                        TAMANO_BYTES = :tamano_bytes,
                        RUTA_RELATIVA = :ruta_relativa,
                        RUTA_COMPLETA_ALMACENAMIENTO = :ruta_completa,
                        ID_ESTADO_ARCHIVO = 1,
                        METADATOS_JSON = :metadatos,
                        FECHA_ULTIMA_MODIFICACION = CAST(SYSTIMESTAMP AT TIME ZONE '-05:00' AS DATE)
                WHEN NOT MATCHED THEN
                    INSERT (
                        ID, ID_CENTRO, ID_CLASE_ARCHIVO, ID_RESIDENTE, ID_EMPLEADO,
                        NOMBRE_ARCHIVO, NOMBRE_ARCHIVO_ALMACENADO, HASH_ARCHIVO, EXTENSION,
                        TIPO_MIME, TAMANO_BYTES, RUTA_RELATIVA, RUTA_COMPLETA_ALMACENAMIENTO,
                        ID_ESTADO_ARCHIVO, METADATOS_JSON
                    ) VALUES (
                        :id, :id_centro, :id_clase, :id_residente, :id_empleado,
                        :nombre_archivo, :nombre_almacenado, :hash_archivo, :ext,
                        :tipo_mime, :tamano_bytes, :ruta_relativa, :ruta_completa,
                        1, :metadatos
                    )
            """
            c.execute(sql, {
                "id": id_archivo,
                "id_centro": id_centro,
                "id_clase": id_clase,
                "id_residente": id_residente,
                "id_empleado": id_empleado,
                "nombre_archivo": nombre_original,
                "nombre_almacenado": nombre_almacenado,
                "hash_archivo": hash_sha256,
                "ext": ext.replace(".", "")[:20],
                "tipo_mime": mime_type[:100],
                "tamano_bytes": tamano_bytes,
                "ruta_relativa": ruta_relativa[:1000],
                "ruta_completa": (ruta_drive or ruta_relativa)[:1500],
                "metadatos": metadatos
            })
        conn.commit()
        return True
    except Exception as e:
        sys.stderr.write(f"Error al registrar en SMY_ARCHIVOS: {str(e)}\n")
        return False

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
            print(json.dumps({"success": False, "error": "No input provided"}))
            return
            
        data = json.loads(raw_input)
        
        file_base64 = data.get("fileBase64")
        if not file_base64:
            print(json.dumps({"success": False, "error": "fileBase64 is required"}))
            return
            
        import base64
        file_bytes = base64.b64decode(file_base64)
        
        tipo_documento = data.get("tipoDocumento", "foto")
        id_centro = int(data.get("idCentro", 1))
        
        # Conexión Oracle para consultas y persistencia
        conn = get_oracle_conn()
        
        # 1. Obtener o generar id_archivo
        id_archivo = int(data.get("idArchivo") or 0)
        if not id_archivo:
            id_archivo = get_next_archivo_id(conn)
            
        # Identificación del sujeto (sin puntos ni guiones)
        identificacion = str(data.get("identificacion", "SIN_DOC")).strip().replace(".", "").replace("-", "").replace(",", "")
        
        # Tipo de entidad: Residente o Talento Humano
        es_residente = (tipo_documento == "residente" or data.get("tipoEntidad") == "residente" or "idResidente" in data)
        id_residente = int(data.get("idResidente") or 0) if es_residente else None
        id_empleado = int(data.get("idEmpleado") or data.get("idUsuario") or 0) if not es_residente else None
        
        # Resolver clase de archivo
        id_clase = int(data.get("idClaseArchivo") or 0)
        if not id_clase:
            if es_residente:
                clase_str = str(data.get("claseArchivo", "")).upper()
                if "IDENTIFICACION" in clase_str:
                    id_clase = 3
                elif "EPS" in clase_str or "AFILIACION" in clase_str:
                    id_clase = 4
                elif "FOTO" in clase_str:
                    id_clase = 7
                else:
                    id_clase = 1  # HISTORIA_CLINICA general
            else:
                if tipo_documento == "soporte":
                    id_clase = 9  # SOPORTE_LABORAL
                elif tipo_documento == "firma":
                    id_clase = 8  # FIRMA_DIGITAL
                else:
                    id_clase = 7  # FOTO_PERFIL
                    
        nombre_original = data.get("nombreOriginal", "archivo.pdf" if tipo_documento == "soporte" else "archivo.jpg")
        ext = os.path.splitext(nombre_original)[1].lower()
        if not ext:
            ext = ".pdf" if tipo_documento == "soporte" else ".jpg"
            
        tipo_mime = data.get("tipoMime")
        if not tipo_mime:
            if ext == ".pdf":
                tipo_mime = "application/pdf"
            elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
                tipo_mime = f"image/{ext.replace('.', '')}"
            else:
                tipo_mime = "application/octet-stream"

        # 2. Calcular HASH SHA-256 criptográfico real del contenido
        hash_sha256 = hashlib.sha256(file_bytes).hexdigest()
        nombre_almacenado = f"{hash_sha256}{ext}"
        
        # 3. Estructura estricta de rutas:
        # Samanya / {Nombre_Sede} / {Residentes | Talento Humano} / {id_archivo}_{identificacion} / Documentos / {hash}.{extension}
        nombre_sede = data.get("nombreSede") or get_nombre_sede(conn, id_centro)
        carpeta_modulo = "Residentes" if es_residente else "Talento Humano"
        sujeto_folder = f"{id_archivo}_{identificacion}"
        
        ruta_relativa = f"Samanya/{nombre_sede}/{carpeta_modulo}/{sujeto_folder}/Documentos/{nombre_almacenado}"
        
        # 4. Cargar a Google Drive siguiendo los 5 niveles exactos
        token = None
        file_id = None
        drive_url = ""
        try:
            token = get_access_token()
            folder_samanya = find_or_create_folder(token, "Samanya")
            folder_sede = find_or_create_folder(token, nombre_sede, parent_id=folder_samanya)
            folder_modulo = find_or_create_folder(token, carpeta_modulo, parent_id=folder_sede)
            folder_sujeto = find_or_create_folder(token, sujeto_folder, parent_id=folder_modulo)
            folder_documentos = find_or_create_folder(token, "Documentos", parent_id=folder_sujeto)
            
            upload_result = upload_file_to_drive(token, folder_documentos, nombre_almacenado, file_bytes, mime_type=tipo_mime)
            file_id = upload_result.get("fileId")
            if file_id:
                drive_url = f"https://drive.google.com/uc?export=view&id={file_id}"
        except Exception as e_drive:
            sys.stderr.write(f"Aviso Google Drive: {e_drive}\n")
            
        # 5. Guardar copia física con la estructura jerárquica exacta:
        # Samanya / {Nombre_Sede} / {Residentes | Talento Humano} / {id_archivo}_{identificacion} / Documentos / {hash}.{ext}
        samanya_dir = os.path.join("public", "Samanya", nombre_sede, carpeta_modulo, sujeto_folder, "Documentos")
        os.makedirs(samanya_dir, exist_ok=True)
        samanya_file_path = os.path.join(samanya_dir, nombre_almacenado)
        with open(samanya_file_path, "wb") as f:
            f.write(file_bytes)

        samanya_local_url = f"/Samanya/{nombre_sede}/{carpeta_modulo}/{sujeto_folder}/Documentos/{nombre_almacenado}"

        # Copia secundaria en uploads para compatibilidad histórica
        subcarpeta_local = "residentes" if es_residente else "talento_humano"
        local_dir = os.path.join("public", "uploads", subcarpeta_local, sujeto_folder, "Documentos")
        os.makedirs(local_dir, exist_ok=True)
        local_file_path = os.path.join(local_dir, nombre_almacenado)
        with open(local_file_path, "wb") as f:
            f.write(file_bytes)
            
        local_url = f"/uploads/{subcarpeta_local}/{sujeto_folder}/Documentos/{nombre_almacenado}"
        
        # 6. Persistencia centralizada en la tabla SMY_ARCHIVOS
        descripcion = data.get("descripcion") or f"{nombre_original} - {carpeta_modulo} {identificacion}"
        register_smy_archivo(
            conn=conn,
            id_archivo=id_archivo,
            id_centro=id_centro,
            id_clase=id_clase,
            id_residente=id_residente,
            id_empleado=id_empleado,
            nombre_original=nombre_original,
            nombre_almacenado=nombre_almacenado,
            hash_sha256=hash_sha256,
            ext=ext,
            mime_type=tipo_mime,
            tamano_bytes=len(file_bytes),
            ruta_relativa=ruta_relativa,
            ruta_drive=drive_url or ruta_relativa,
            id_drive=file_id,
            descripcion=descripcion
        )
        
        if conn:
            try:
                conn.close()
            except Exception:
                pass
        
        canonical_drive_url = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing" if file_id else ""

        response = {
            "success": True,
            "idArchivo": id_archivo,
            "hash": hash_sha256,
            "nombreOriginal": nombre_original,
            "nombreAlmacenado": nombre_almacenado,
            "rutaRelativa": ruta_relativa,
            "driveUrl": canonical_drive_url or drive_url or samanya_local_url,
            "fileId": file_id,
            "avatarUrl": samanya_local_url,
            "localUrl": samanya_local_url,
            "url": samanya_local_url,
            "mensaje": f"Archivo guardado exitosamente en {ruta_relativa}"
        }
        print(json.dumps(response))
        
    except Exception as e:
        import traceback
        err_msg = str(e)
        tb = traceback.format_exc()
        print(json.dumps({"success": False, "error": err_msg, "traceback": tb}))

def get_photo(file_id):
    try:
        token = get_access_token()
        url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            sys.stdout.buffer.write(data)
    except Exception as e:
        sys.stderr.write(str(e))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--get-photo":
        get_photo(sys.argv[2])
    else:
        main()
