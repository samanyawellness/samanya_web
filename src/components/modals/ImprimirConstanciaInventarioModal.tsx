import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Building2,
  User,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet
} from 'lucide-react';
import { Residente, SedeCentro, MovimientoInventario } from '../../types';

interface InsumoResidenteData {
  idArticulo: number;
  codigoArticulo: string;
  nombreArticulo: string;
  categoria: string;
  unidadMedida: string;
  tipoEmpaque?: string;
  unidadesPorEmpaque?: number;
  totalEntradas: number;
  totalSalidas: number;
  saldoDisponible: number;
  bodegaNombre: string;
  empaquesEquivalentes?: string;
}

interface ImprimirConstanciaInventarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  residente: Residente;
  activeSede: SedeCentro;
  insumos: InsumoResidenteData[];
  movimientos: MovimientoInventario[];
}

export const ImprimirConstanciaInventarioModal: React.FC<ImprimirConstanciaInventarioModalProps> = ({
  isOpen,
  onClose,
  residente,
  activeSede,
  insumos,
  movimientos
}) => {
  const [copiadoTexto, setCopiadoTexto] = useState(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  if (!isOpen) return null;

  const hoy = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const radicado = `INV-RES-${residente.codigoExpediente}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
  const acudientePrincipal = residente.acudientes && residente.acudientes.length > 0
    ? (residente.acudientes.find(a => a.esPrincipal) || residente.acudientes[0])
    : null;

  const totalUnidadesDisponibles = insumos.reduce((acc, i) => acc + i.saldoDisponible, 0);
  const totalUnidadesRecibidas = insumos.reduce((acc, i) => acc + i.totalEntradas, 0);
  const totalUnidadesConsumidas = insumos.reduce((acc, i) => acc + i.totalSalidas, 0);

  const entradas = movimientos.filter(
    m => m.tipoMovimiento.startsWith('ENTRADA') || m.tipoMovimiento === 'AJUSTE_FISICO_POSITIVO'
  );
  const salidas = movimientos.filter(
    m => m.tipoMovimiento.startsWith('SALIDA') || m.tipoMovimiento === 'AJUSTE_FISICO_NEGATIVO'
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopiarWhatsApp = () => {
    let mensaje = `📋 *SAMANYA WELLNESS - BALANCE DE INSUMOS*\n`;
    mensaje += `*Sede:* ${activeSede.nombre}\n`;
    mensaje += `*Residente:* ${residente.nombreCompleto} (${residente.codigoExpediente})\n`;
    mensaje += `*Habitación:* ${residente.habitacion}\n`;
    mensaje += `*Fecha de Corte:* ${hoy}\n`;
    mensaje += `*Radicado:* ${radicado}\n\n`;
    mensaje += `📦 *EXISTENCIAS EN CUSTODIA (BODEGA):*\n`;

    if (insumos.length === 0) {
      mensaje += `_Sin insumos registrados actualmente en bodega._\n`;
    } else {
      insumos.forEach((ins, idx) => {
        mensaje += `${idx + 1}. *${ins.nombreArticulo}*\n`;
        mensaje += `   • Saldo Disponible: *${ins.saldoDisponible} ${ins.unidadMedida}s*`;
        if (ins.empaquesEquivalentes) {
          mensaje += ` (${ins.empaquesEquivalentes})`;
        }
        mensaje += `\n   • Histórico Recibido: ${ins.totalEntradas} uds | Consumido: ${ins.totalSalidas} uds\n`;
      });
    }

    mensaje += `\n📊 *RESUMEN TOTAL:* ${totalUnidadesDisponibles} unidades disponibles en custodia.\n`;
    mensaje += `\nCualquier inquietud con gusto es atendida por el equipo asistencial de ${activeSede.nombre}.`;

    navigator.clipboard.writeText(mensaje).then(() => {
      setCopiadoTexto(true);
      setToastMensaje('Resumen copiado para WhatsApp');
      setTimeout(() => {
        setCopiadoTexto(false);
        setToastMensaje(null);
      }, 3000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header no imprimible */}
        <div className="p-4 sm:p-5 bg-[#182F28] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#274A3F] border border-[#DCB87F]/40 flex items-center justify-center text-[#DCB87F]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <span>Constancia de Insumos en Custodia</span>
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-[#274A3F] text-[#DCB87F]">
                  {radicado}
                </span>
              </h3>
              <p className="text-xs text-[#DCB87F]">
                {residente.nombreCompleto} — {activeSede.nombre}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopiarWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#274A3F] hover:bg-[#346052] text-[#DCB87F] text-xs font-bold rounded-xl transition-colors cursor-pointer border border-[#DCB87F]/30"
              title="Copiar resumen en formato texto para WhatsApp"
            >
              {copiadoTexto ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiadoTexto ? '¡Copiado!' : 'Copiar WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#DCB87F] hover:bg-[#c9a56c] text-[#182F28] text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Imprimir constancia o guardar en PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#7A745F] hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación Toast interna */}
        {toastMensaje && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold flex items-center justify-center gap-2 print:hidden animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMensaje}</span>
          </div>
        )}

        {/* Contenido imprimible (Hoja formal) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white print:p-0 print:m-0 print:overflow-visible">
          <div className="border border-[#DEDBD1] rounded-2xl p-6 sm:p-8 bg-white shadow-2xs print:border-none print:shadow-none print:p-0 space-y-6">
            
            {/* Membrete Oficial */}
            <div className="flex items-start justify-between border-b-2 border-[#182F28] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-serif font-black tracking-wide text-[#182F28]">
                    SAMANYA WELLNESS
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#182F28] text-[#DCB87F] px-2 py-0.5 rounded">
                    Almacén e Inventarios
                  </span>
                </div>
                <p className="text-xs text-[#5C6058] mt-0.5">
                  Centro de Cuidado Integral del Adulto Mayor
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[#7A745F] mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#182F28]" />
                    {activeSede.nombre} — {activeSede.ciudad}
                  </span>
                  <span>•</span>
                  <span>{activeSede.direccion}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-[#182F28] bg-[#F7F6F2] px-3 py-1 rounded-lg border border-[#DEDBD1] inline-block">
                  {radicado}
                </div>
                <div className="text-[11px] text-[#7A745F] mt-1 flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Emisión: {hoy}</span>
                </div>
              </div>
            </div>

            {/* Datos del Residente y Acudiente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] text-xs">
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A745F]">
                  Información del Residente
                </div>
                <div className="font-bold text-sm text-[#182F28]">
                  {residente.nombreCompleto}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#5C6058]">
                  <div>
                    <span className="font-semibold text-[#182F28]">Expediente:</span> {residente.codigoExpediente}
                  </div>
                  <div>
                    <span className="font-semibold text-[#182F28]">Documento:</span> {residente.identificacion}
                  </div>
                  <div>
                    <span className="font-semibold text-[#182F28]">Habitación:</span> {residente.habitacion}
                  </div>
                  <div>
                    <span className="font-semibold text-[#182F28]">Edad:</span> {residente.edad} años
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#DEDBD1] pt-3 md:pt-0 md:pl-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A745F]">
                  Acudiente / Contacto Principal
                </div>
                <div className="font-bold text-sm text-[#182F28]">
                  {acudientePrincipal ? acudientePrincipal.nombreCompleto : 'No registrado'}
                </div>
                <div className="space-y-1 text-[#5C6058]">
                  {acudientePrincipal && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#182F28]">Parentesco:</span> {acudientePrincipal.parentesco || 'Familiar'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#068591]" />
                        <span>{acudientePrincipal.telefono}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen Métricas */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
                <div className="text-[10px] uppercase font-bold text-emerald-800">Saldo Disponible en Custodia</div>
                <div className="text-xl font-bold text-emerald-700 font-mono mt-0.5">
                  {totalUnidadesDisponibles} uds
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Listas para dispensación</div>
              </div>

              <div className="p-3 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE]">
                <div className="text-[10px] uppercase font-bold text-blue-800">Total Histórico Recibido</div>
                <div className="text-xl font-bold text-blue-700 font-mono mt-0.5">
                  {totalUnidadesRecibidas} uds
                </div>
                <div className="text-[10px] text-blue-600 mt-0.5">Aportes de familiares</div>
              </div>

              <div className="p-3 bg-[#FEF2F2] rounded-xl border border-[#FECACA]">
                <div className="text-[10px] uppercase font-bold text-rose-800">Total Histórico Suministrado</div>
                <div className="text-xl font-bold text-rose-700 font-mono mt-0.5">
                  {totalUnidadesConsumidas} uds
                </div>
                <div className="text-[10px] text-rose-600 mt-0.5">Consumo en atención</div>
              </div>
            </div>

            {/* Tabla 1: Saldos Actuales por Insumo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-1">
                <h4 className="font-serif font-bold text-sm text-[#182F28] flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#1E7A4C]" />
                  <span>1. Estado de Existencias Actuales en Custodia</span>
                </h4>
                <span className="text-[11px] text-[#7A745F] font-mono">{insumos.length} producto(s)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#DEDBD1] rounded-xl overflow-hidden">
                  <thead className="bg-[#182F28] text-white font-serif">
                    <tr>
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Artículo / Insumo</th>
                      <th className="py-2 px-3">Bodega</th>
                      <th className="py-2 px-3 text-center">Recibido</th>
                      <th className="py-2 px-3 text-center">Consumido</th>
                      <th className="py-2 px-3 text-center">Saldo Actual</th>
                      <th className="py-2 px-3 text-right">Empaques Comerciales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DEDBD1]">
                    {insumos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-[#7A745F]">
                          No hay insumos registrados en custodia para este residente.
                        </td>
                      </tr>
                    ) : (
                      insumos.map((it) => (
                        <tr key={it.idArticulo} className="hover:bg-[#F7F6F2]">
                          <td className="py-2.5 px-3 font-mono font-bold text-[11px] text-[#182F28]">
                            {it.codigoArticulo}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-[#182F28]">{it.nombreArticulo}</div>
                            <div className="text-[10px] text-[#7A745F]">{it.categoria}</div>
                          </td>
                          <td className="py-2.5 px-3 text-[#5C6058]">{it.bodegaNombre}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-blue-700 font-semibold">
                            {it.totalEntradas}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-rose-700 font-semibold">
                            {it.totalSalidas}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-800 bg-emerald-50">
                            {it.saldoDisponible} {it.unidadMedida}s
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-[#182F28]">
                            {it.empaquesEquivalentes || `${it.saldoDisponible} uds`}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabla 2: Histórico Reciente de Movimientos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-1">
                <h4 className="font-serif font-bold text-sm text-[#182F28]">
                  2. Histórico de Movimientos (Entradas y Salidas)
                </h4>
                <span className="text-[11px] text-[#7A745F] font-mono">{movimientos.length} registro(s)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#DEDBD1] rounded-xl overflow-hidden">
                  <thead className="bg-[#F7F6F2] text-[#182F28] font-bold border-b border-[#DEDBD1]">
                    <tr>
                      <th className="py-2 px-3">Fecha y Hora</th>
                      <th className="py-2 px-3">Documento</th>
                      <th className="py-2 px-3">Tipo</th>
                      <th className="py-2 px-3">Insumo</th>
                      <th className="py-2 px-3 text-center">Cantidad</th>
                      <th className="py-2 px-3">Responsable / Donante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DEDBD1]">
                    {movimientos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-[#7A745F]">
                          Sin movimientos registrados.
                        </td>
                      </tr>
                    ) : (
                      movimientos.slice(0, 10).map((mov) => {
                        const esEntrada = mov.tipoMovimiento.startsWith('ENTRADA') || mov.tipoMovimiento === 'AJUSTE_FISICO_POSITIVO';
                        const primerDetalle = mov.detalles[0];
                        return (
                          <tr key={mov.id} className="hover:bg-[#F7F6F2]">
                            <td className="py-2 px-3 text-[11px] text-[#5C6058] whitespace-nowrap">
                              {mov.fechaMovimiento}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-[11px] text-[#182F28]">
                              {mov.numeroDocumento}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                  esEntrada
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {esEntrada ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                {esEntrada ? 'Aporte Familiar' : 'Dispensación'}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-semibold text-[#182F28]">
                              {primerDetalle?.nombreArticulo || 'Insumo'}
                              {primerDetalle?.cantidadEmpaques && primerDetalle?.unidadesPorEmpaque && (
                                <span className="text-[10px] text-[#7A745F] block font-normal">
                                  {primerDetalle.cantidadEmpaques} {primerDetalle.tipoEmpaque}(s) x {primerDetalle.unidadesPorEmpaque} uds
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold">
                              <span className={esEntrada ? 'text-emerald-700' : 'text-rose-700'}>
                                {esEntrada ? `+${primerDetalle?.cantidad || mov.totalArticulos}` : `-${primerDetalle?.cantidad || mov.totalArticulos}`}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[11px] text-[#5C6058]">
                              <div className="font-semibold text-[#182F28]">
                                {mov.nombreUsuarioRegistra}
                              </div>
                              {mov.observaciones && (
                                <div className="text-[10px] text-[#7A745F] truncate max-w-[220px]" title={mov.observaciones}>
                                  {mov.observaciones}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Firmas de Constancia */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-[#DEDBD1] text-center text-xs">
              <div className="space-y-1">
                <div className="border-b border-black w-4/5 mx-auto mb-2"></div>
                <div className="font-bold text-[#182F28]">Responsable de Almacén / Farmacia</div>
                <div className="text-[11px] text-[#7A745F]">Samanya Wellness — {activeSede.nombre}</div>
              </div>

              <div className="space-y-1">
                <div className="border-b border-black w-4/5 mx-auto mb-2"></div>
                <div className="font-bold text-[#182F28]">Enfermera(o) Jefe / Asistencial</div>
                <div className="text-[11px] text-[#7A745F]">Verificación de Custodia y Suministro</div>
              </div>

              <div className="space-y-1">
                <div className="border-b border-black w-4/5 mx-auto mb-2"></div>
                <div className="font-bold text-[#182F28]">Familiar / Acudiente Receptor</div>
                <div className="text-[11px] text-[#7A745F]">
                  {acudientePrincipal ? acudientePrincipal.nombreCompleto : 'C.C. ___________________'}
                </div>
              </div>
            </div>

            {/* Cláusula de Transparencia */}
            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] text-[10px] text-[#7A745F] text-center">
              Constancia oficial generada automáticamente por el módulo de inventarios de Samanya Wellness OS. Los insumos custodiados son de uso exclusivo y confidencial para la atención integral y digna de {residente.nombreCompleto}.
            </div>

          </div>
        </div>

        {/* Footer no imprimible */}
        <div className="p-4 bg-[#F7F6F2] border-t border-[#DEDBD1] flex items-center justify-between print:hidden">
          <div className="text-xs text-[#7A745F]">
            Fecha y hora de corte: {hoy}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cerrar Constancia
          </button>
        </div>
      </div>
    </div>
  );
};
