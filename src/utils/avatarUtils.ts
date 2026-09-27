/**
 * Utilidad de resolución de URLs de Avatar
 * 
 * Resuelve URLs de avatares evitando restricciones de CORS/CORP impuestas por Google Drive:
 * 1. Si es ruta local (/uploads/...), se retorna directamente.
 * 2. Si es URL de Google Drive (lh3.googleusercontent.com o drive.google.com), se extrae el fileId
 *    y se redirige a través del proxy `/api/drive/foto/:fileId`.
 * 3. Si no existe, se retorna el avatar por defecto.
 */

export const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23274A3F"/><circle cx="32" cy="24" r="12" fill="%23FFFFFF"/><path d="M14 56c0-10 8-16 18-16s18 6 18 16" fill="%23FFFFFF"/></svg>';

/**
 * Obtiene la inicial del primer nombre + la inicial del primer apellido
 * Ejemplos:
 * - "Orlando", "Valverde" -> "OV"
 * - "Orlando Arturo", "Valverde Ramirez" -> "OV"
 * - nombreCompleto: "Orlando Valverde" -> "OV"
 */
export function obtenerIniciales(
  nombres?: string,
  apellidos?: string,
  nombreCompleto?: string
): string {
  let iniNombre = '';
  let iniApellido = '';

  if (nombres && nombres.trim()) {
    const primerNombre = nombres.trim().split(/\s+/)[0];
    if (primerNombre) iniNombre = primerNombre.charAt(0).toUpperCase();
  }

  if (apellidos && apellidos.trim()) {
    const primerApellido = apellidos.trim().split(/\s+/)[0];
    if (primerApellido) iniApellido = primerApellido.charAt(0).toUpperCase();
  }

  if (!iniNombre && !iniApellido && nombreCompleto && nombreCompleto.trim()) {
    const partes = nombreCompleto.trim().split(/\s+/);
    iniNombre = partes[0]?.charAt(0).toUpperCase() || '';
    if (partes.length > 1) {
      // En nombres en español con 3 o 4 palabras (e.g. "Orlando Arturo Valverde Ramirez")
      // partes[0] = Orlando, partes[1] = Arturo, partes[2] = Valverde
      const idxApellido = partes.length >= 3 ? 2 : 1;
      iniApellido = partes[idxApellido]?.charAt(0).toUpperCase() || '';
    }
  }

  const iniciales = `${iniNombre}${iniApellido}`.trim();
  return iniciales || 'R';
}

/**
 * Genera un SVG como Data URI con las iniciales solicitadas, con paleta institucional
 */
export function generarAvatarInicialesSvg(
  iniciales: string,
  bgColor: string = '%23182F28',
  textColor: string = '%23DCB87F'
): string {
  const safeInitials = (iniciales || 'R').slice(0, 3).toUpperCase();
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${bgColor}"/><text x="50%" y="54%" font-family="ui-serif, Georgia, serif" font-weight="bold" font-size="24" fill="${textColor}" dominant-baseline="middle" text-anchor="middle" letter-spacing="1">${safeInitials}</text></svg>`;
}

export function resolverAvatarUrl(avatarUrl?: string, fallbackInitials?: string): string {
  if (!avatarUrl || avatarUrl.trim() === '') {
    if (fallbackInitials) {
      return generarAvatarInicialesSvg(fallbackInitials);
    }
    return DEFAULT_AVATAR;
  }

  const url = avatarUrl.trim();

  // Si contiene la URL genérica anterior de Unsplash y no hay foto personalizada
  if (url.includes('photo-1594824813590-7815d9b68c2d')) {
    if (fallbackInitials) {
      return generarAvatarInicialesSvg(fallbackInitials);
    }
    return DEFAULT_AVATAR;
  }

  // Si ya es un asset local servido por la app
  if (url.startsWith('/uploads/')) {
    return url.includes('?') ? url : `${url}?v=1`;
  }
  if (url.startsWith('/') || url.startsWith('data:')) {
    return url;
  }

  // Si es URL externa directa de Unsplash o CDN compatible
  if (url.includes('images.unsplash.com')) {
    return url;
  }

  // Si contiene el hash conocido de popochito o archivo subido
  if (url.includes('27842950a090dfd62caa00788cab283a3a112305bde3599d8282036a02b2feba')) {
    return '/uploads/talento_humano/27842950a090dfd62caa00788cab283a3a112305bde3599d8282036a02b2feba.jpg';
  }

  // Si es un enlace de Google Drive (lh3 o drive.google.com)
  if (url.includes('googleusercontent.com') || url.includes('drive.google.com')) {
    // Buscar el ID en export=view&id=XYZ o /d/XYZ o id=XYZ
    const match = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]{20,})/);
    if (match && match[1]) {
      return `/api/drive/foto/${match[1]}`;
    }
  }

  return url;
}
