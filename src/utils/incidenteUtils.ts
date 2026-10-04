import { BitacoraResidente } from '../types';

export interface DatosIncidenteBitacora {
  tipo: string;
  severidad: string;
}

/**
 * Extrae el tipo y severidad de un incidente a partir de un registro de bitácora,
 * ya sea de sus propiedades directas (tipoIncidente, severidadIncidente)
 * o analizando el contenido estructurado [INCIDENTE REGISTRADO - Tipo (Severidad: Sev)].
 */
export function extraerDatosIncidente(item: BitacoraResidente): DatosIncidenteBitacora | null {
  if (!item) return null;

  // 1. Si ya viene tipificado directamente
  if (item.tipoIncidente && item.tipoIncidente.trim().length > 0) {
    return {
      tipo: item.tipoIncidente.trim(),
      severidad: item.severidadIncidente?.trim() || 'Media'
    };
  }

  // 2. Si la categoría es de incidente o el contenido contiene el encabezado de incidente
  const esCategoriaIncidente = item.categoria === 'Incidente / Evento Adverso';
  const contenido = item.contenido || '';
  const tienePatronIncidente = contenido.includes('[INCIDENTE');

  if (esCategoriaIncidente || tienePatronIncidente) {
    // Ejemplo de formato: [INCIDENTE REGISTRADO - Caída (Severidad: Alta)]: Descripción...
    const match = contenido.match(/\[INCIDENTE(?:\s+REGISTRADO)?\s*-\s*([^(:\]\n\r]+)(?:\(Severidad:\s*([^)\n\r]+)\))?/i);
    if (match && match[1]) {
      return {
        tipo: match[1].trim(),
        severidad: match[2]?.trim() || item.severidadIncidente || 'Media'
      };
    }

    return {
      tipo: 'Incidente / Evento Adverso',
      severidad: item.severidadIncidente || 'Media'
    };
  }

  return null;
}

/**
 * Retorna las clases de Tailwind CSS apropiadas para la etiqueta de severidad.
 */
export function obtenerClasesSeveridad(severidad: string): string {
  const s = (severidad || '').toLowerCase();
  if (s.includes('crítica') || s.includes('critica') || s.includes('alta')) {
    return 'bg-red-100 text-red-800 border-red-300';
  }
  if (s.includes('media')) {
    return 'bg-amber-100 text-amber-800 border-amber-300';
  }
  return 'bg-emerald-100 text-emerald-800 border-emerald-300';
}
