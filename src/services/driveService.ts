/**
 * Servicio de Almacenamiento y Jerarquía en Google Drive y Oracle (SMY_ARCHIVOS)
 * 
 * Reglas de almacenamiento y jerarquía estricta:
 * 1. Nivel 1: "Samanya"
 * 2. Nivel 2: "{Nombre_Sede}" (ej: "Sede Central Bogotá")
 * 3. Nivel 3: "Residentes" | "Talento Humano"
 * 4. Nivel 4: "{id_archivo}_{identificacion}" (sin puntos ni comas en identificacion)
 * 5. Nivel 5: "Documentos"
 * 6. Archivo: "{hash_sha256}.{extension}"
 * 
 * Centralización:
 * - Todos los metadatos se persisten exclusivamente en la tabla SMY_ARCHIVOS.
 * - Las demás tablas referencian el archivo mediante su ID (FK ID_ARCHIVO).
 */

import { adminApi } from './api';

export interface UploadFotoTalentoParams {
  file: File;
  idUsuario: number;
  identificacion: string;
  idCentro?: number;
  nombreSede?: string;
  idEmpleado?: number;
  idTrabajador?: number;
  nombreCompleto?: string;
}

export interface UploadFotoTalentoResult {
  success: boolean;
  avatarUrl: string;
  nombreAlmacenado: string;
  hash: string;
  rutaRelativa: string;
  directorioRaiz: string;
  directorioUsuario: string;
  idArchivo?: number;
  mensaje?: string;
}

/**
 * Calcula el Hash SHA-256 criptográfico de un archivo File en el navegador
 */
export async function calcularSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitiza identificaciones o cadenas eliminando puntos y comas
 */
export function sanitizarIdentificador(cadena: string): string {
  if (!cadena) return 'SIN_DOC';
  return cadena
    .replace(/[.,]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Normaliza la extensión del archivo (con punto inicial)
 */
export function normalizarExtension(nombreArchivo: string): string {
  if (!nombreArchivo) return '.jpg';
  const lastDot = nombreArchivo.lastIndexOf('.');
  if (lastDot >= 0) {
    return nombreArchivo.substring(lastDot).toLowerCase();
  }
  return '.jpg';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Flujo completo de carga de foto de Talento Humano a Google Drive y Oracle SMY_ARCHIVOS
 */
export async function subirFotoTalentoHumano(
  params: UploadFotoTalentoParams
): Promise<UploadFotoTalentoResult> {
  const { file, idUsuario, identificacion, idCentro = 1, idEmpleado, idTrabajador } = params;

  try {
    const hash = await calcularSha256(file);
    const extension = normalizarExtension(file.name);
    const docSanitizado = sanitizarIdentificador(identificacion);
    const fileBase64 = await fileToBase64(file);

    // Despacho al servicio backend de Google Drive y Oracle
    const response = await fetch('/api/drive/subir-foto-talento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileBase64,
        idUsuario,
        idEmpleado: idEmpleado || idTrabajador || idUsuario,
        identificacion: docSanitizado,
        nombreOriginal: file.name,
        nombreCompleto: params.nombreCompleto || `Colaborador ${idUsuario}`,
        tipoMime: file.type || 'image/jpeg',
        idCentro,
        nombreSede: params.nombreSede
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error en servidor (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    if (!resJson.success) {
      throw new Error(resJson.error || 'Error subiendo fotografía a Google Drive y Oracle');
    }

    return {
      success: true,
      avatarUrl: resJson.avatarUrl,
      nombreAlmacenado: resJson.nombreAlmacenado || `${hash}${extension}`,
      hash: resJson.hash || hash,
      rutaRelativa: resJson.rutaRelativa || `Samanya/Talento_humano/${idUsuario}_${docSanitizado}`,
      directorioRaiz: resJson.directorioRaiz || 'Samanya/Talento_humano',
      directorioUsuario: resJson.directorioUsuario || `${idUsuario}_${docSanitizado}`,
      idArchivo: resJson.idArchivo || Date.now(),
      mensaje: resJson.mensaje || 'Fotografía almacenada en Google Drive y registrada en Oracle con éxito'
    };
  } catch (error: any) {
    console.error('Error al subir fotografía de talento humano a Google Drive:', error);
    throw error;
  }
}

export interface UploadSoportePermisoParams {
  file: File;
  idEmpleado: number;
  identificacion: string;
  idCentro?: number;
  nombreSede?: string;
  nombreCompleto?: string;
  idSolicitudPermiso?: number;
}

export interface UploadSoportePermisoResult {
  success: boolean;
  driveUrl: string;
  nombreArchivo: string;
  nombreAlmacenado: string;
  hash: string;
  rutaRelativa: string;
  idArchivo?: number;
  fileId?: string;
  mensaje?: string;
}

/**
 * Carga de Documento de Soporte (Incapacidad, Vacaciones o Permiso) a Google Drive:
 * Ruta: Samanya/Talento_humano/{id}_{identificacion}/{archivo}
 * y registro en la tabla SMY_ARCHIVOS vía PKGLN_ARCHIVOS.PR_REGISTRAR_SOPORTE_TALENTO_HUMANO
 */
export async function subirSoportePermiso(
  params: UploadSoportePermisoParams
): Promise<UploadSoportePermisoResult> {
  const { file, idEmpleado, identificacion, idCentro = 1, nombreCompleto, idSolicitudPermiso } = params;

  try {
    const hash = await calcularSha256(file);
    const extension = normalizarExtension(file.name);
    const docSanitizado = sanitizarIdentificador(identificacion);
    const fileBase64 = await fileToBase64(file);

    const response = await fetch('/api/drive/subir-soporte-talento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileBase64,
        idEmpleado,
        idUsuario: idEmpleado,
        identificacion: docSanitizado,
        nombreOriginal: file.name,
        nombreCompleto: nombreCompleto || `Colaborador ${idEmpleado}`,
        tipoMime: file.type || (extension === '.pdf' ? 'application/pdf' : 'application/octet-stream'),
        tipoDocumento: 'soporte',
        idCentro,
        nombreSede: params.nombreSede,
        idSolicitudPermiso
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error en servidor (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    if (!resJson.success) {
      throw new Error(resJson.error || 'Error subiendo soporte a Google Drive y Oracle');
    }

    return {
      success: true,
      driveUrl: resJson.driveUrl || '',
      nombreArchivo: file.name,
      nombreAlmacenado: resJson.nombreAlmacenado || file.name,
      hash: resJson.hash || hash,
      rutaRelativa: resJson.rutaRelativa || `Samanya/Talento_humano/${idEmpleado}_${docSanitizado}`,
      idArchivo: resJson.idArchivo || Date.now(),
      fileId: resJson.fileId,
      mensaje: resJson.mensaje || 'Soporte adjunto subido exitosamente a Google Drive y registrado en SMY_ARCHIVOS'
    };
  } catch (error: any) {
    console.error('Error al subir soporte de permiso a Google Drive:', error);
    throw error;
  }
}

export interface UploadArchivoResidenteParams {
  file: File;
  identificacion: string;
  claseArchivo: string;
  idResidente?: number;
  idCentro?: number;
  nombreSede?: string;
  nombreCompleto?: string;
  descripcion?: string;
}

export interface UploadArchivoResidenteResult {
  success: boolean;
  url: string;
  driveUrl: string;
  localUrl: string;
  nombreArchivo: string;
  nombreAlmacenado: string;
  hash: string;
  rutaRelativa: string;
  idArchivo?: number;
  fileId?: string;
  mensaje?: string;
}

/**
 * Carga de Documentos / Archivos de Residentes a Google Drive:
 * Ruta: Samanya/Residentes/{idResidente}_{identificacion}/{archivo}
 */
export async function subirArchivoResidente(
  params: UploadArchivoResidenteParams
): Promise<UploadArchivoResidenteResult> {
  const { file, identificacion, claseArchivo, idResidente = 0, idCentro = 1, nombreCompleto, descripcion } = params;

  try {
    const hash = await calcularSha256(file);
    const extension = normalizarExtension(file.name);
    const docSanitizado = sanitizarIdentificador(identificacion);
    const fileBase64 = await fileToBase64(file);

    const response = await fetch('/api/drive/subir-archivo-residente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileBase64,
        idResidente,
        idUsuario: idResidente,
        identificacion: docSanitizado,
        nombreOriginal: file.name,
        nombreCompleto: nombreCompleto || `Residente ${docSanitizado}`,
        tipoMime: file.type || (extension === '.pdf' ? 'application/pdf' : 'application/octet-stream'),
        tipoDocumento: 'residente',
        tipoEntidad: 'residente',
        claseArchivo,
        descripcion,
        idCentro,
        nombreSede: params.nombreSede
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error en servidor (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    if (!resJson.success) {
      throw new Error(resJson.error || 'Error subiendo archivo a Google Drive y servidor local');
    }

    const finalRutaRelativa = resJson.rutaRelativa || `Samanya/Residentes/${idResidente}_${docSanitizado}/Documentos/${resJson.nombreAlmacenado || file.name}`;
    const officialUrl = resJson.url || `/${finalRutaRelativa}`;

    return {
      success: true,
      url: officialUrl,
      driveUrl: resJson.driveUrl || '',
      localUrl: resJson.localUrl || officialUrl,
      nombreArchivo: file.name,
      nombreAlmacenado: resJson.nombreAlmacenado || file.name,
      hash: resJson.hash || hash,
      rutaRelativa: finalRutaRelativa,
      idArchivo: resJson.idArchivo || Date.now(),
      fileId: resJson.fileId,
      mensaje: resJson.mensaje || 'Documento adjunto almacenado exitosamente'
    };
  } catch (error: any) {
    console.error('Error al subir archivo de residente:', error);
    throw error;
  }
}

