/**
 * Utilidades de formato y sanitización de datos
 */

/**
 * Elimina puntos y comas de cualquier valor de identificación ingresado por el usuario
 * Ejemplos:
 *  "52.489.120" -> "52489120"
 *  "1,020,789,456" -> "1020789456"
 *  "79.345,889" -> "79345889"
 */
export function limpiarIdentificacion(valor: string | undefined | null): string {
  if (!valor) return '';
  return valor.replace(/[.,]/g, '');
}
