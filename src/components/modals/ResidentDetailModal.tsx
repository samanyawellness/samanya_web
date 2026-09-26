import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  HeartHandshake,
  Phone,
  Mail,
  User,
  ShieldAlert,
  Sparkles,
  Building2,
  Edit3,
  Pill,
  Clock,
  Calendar,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  ClipboardList,
  CheckCircle2,
  Printer,
  Paperclip,
  FileText,
  ExternalLink
} from 'lucide-react';
import { ResidentAvatar } from '../common/ResidentAvatar';
import { DotacionResidente } from '../../types';
import { ImprimirSolicitudDotacionModal } from './ImprimirSolicitudDotacionModal';

export const ResidentDetailModal: React.FC = () => {
  const {
    isResidenteDetailOpen,
    setIsResidenteDetailOpen,
    selectedResidente,
    activeSede,
    setEditingResidente,
    setIsEditResidenteOpen,
    familiares,
    setEditingFamiliar,
    setIsEditFamiliarOpen,
    dotaciones,
    agregarArticuloDotacionResidente,
    registrarRecambioDotacion,
    abrirSolicitarDotacion,
    entregarDotacionSolicitada
  } = useAdmin();

  const [mostrarFormAgregarDotacion, setMostrarFormAgregarDotacion] = useState(false);
  const [nuevoArticuloDotacion, setNuevoArticuloDotacion] = useState({
    nombre: '',
    categoria: 'Lencería y Ropa de Cama',
    cantidad: 1,
    frecuenciaMeses: 12 as number | null
  });

  const [itemParaRecambio, setItemParaRecambio] = useState<DotacionResidente | null>(null);
  const [motivoRecambio, setMotivoRecambio] = useState('Cumplimiento de ciclo de recambio programado');
  const [condicionNuevo, setCondicionNuevo] = useState('Nuevo de paquete');
  const [observacionesRecambio, setObservacionesRecambio] = useState('');

  const dotacionesResidente = (dotaciones || []).filter((d) => d.idResidente === selectedResidente?.id);
  const dotacionesSolicitadas = dotacionesResidente.filter((d) => d.estadoElemento === 'Solicitado');
  const [mostrarModalImprimir, setMostrarModalImprimir] = useState(false);

  if (!isResidenteDetailOpen || !selectedResidente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl lg:max-w-5xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ResidentAvatar
              fotoUrl={selectedResidente.fotoUrl}
              nombres={selectedResidente.nombres}
              apellidos={selectedResidente.apellidos}
              nombreCompleto={selectedResidente.nombreCompleto}
              sizeClass="w-14 h-14"
              roundedClass="rounded-2xl"
              textClass="text-xl"
              className="border-2 border-[#DCB87F]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-white">
                  {selectedResidente.nombreCompleto}
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/30">
                  {selectedResidente.codigoExpediente}
                </span>
              </div>
              <p className="text-xs text-[#DCB87F] mt-0.5">
                {selectedResidente.edad} años • Habitación {selectedResidente.habitacion} (Cama {selectedResidente.cama}) • {activeSede.nombre}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsResidenteDetailOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Alertas Clínicas */}
          {selectedResidente.alertasClinicas && (
            <div className="p-4 bg-[#FEF7EE] border-l-4 border-[#B3803F] rounded-r-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9A5B12] uppercase font-mono">
                <ShieldAlert className="w-4 h-4" />
                <span>Alertas y Consideraciones Clínicas</span>
              </div>
              <p className="text-sm font-semibold text-[#26241F] mt-1">
                {selectedResidente.alertasClinicas}
              </p>
            </div>
          )}

          {/* Grid de Datos Generales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Identificación</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.tipoIdentificacion} {selectedResidente.identificacion}
              </span>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Nivel Movilidad</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.nivelMovilidad}
              </span>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Tipo de Dieta</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.tipoDieta}
              </span>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">EPS / Salud</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.eps}
              </span>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Grupo Sanguíneo</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.tipoSangre}
              </span>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Fecha Ingreso</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.fechaIngreso}
              </span>
            </div>
          </div>

          {/* Farmacoterapia & Medicamentos Prescritos */}
          <div className="border border-[#DEDBD1] rounded-2xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#DFF3E7] text-[#1E7A4C] flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Farmacoterapia & Medicamentos Prescritos
                  </h4>
                  <p className="text-[11px] text-[#7A745F]">
                    Plan terapéutico activo del residente
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#1E7A4C] font-mono font-bold bg-[#DFF3E7] px-2 py-0.5 rounded-full">
                {selectedResidente.medicamentos?.length || 0} medicamento(s)
              </span>
            </div>

            {selectedResidente.medicamentos && selectedResidente.medicamentos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedResidente.medicamentos.map((med, idx) => (
                  <div
                    key={med.id || idx}
                    className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex flex-col justify-between space-y-2 hover:border-[#1E7A4C]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#182F28] block">
                          {med.medicamento}
                        </span>
                        <span className="text-[11px] text-[#7A4F9E] font-semibold">
                          Cantidad / Dosis: {med.cantidad}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#DEDBD1] text-[#182F28] font-bold">
                        Rx #{idx + 1}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-[#DEDBD1]/60 text-[11px] text-[#5C6058] space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#068591]" />
                        <span>Frecuencia: <strong className="text-[#182F28]">{med.frecuencia}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#B3803F]" />
                        <span>
                          Hasta:{' '}
                          <strong className="text-[#182F28]">
                            {med.fechaFin ? med.fechaFin : 'Tratamiento Continuo'}
                          </strong>
                        </span>
                      </div>
                      {med.indicaciones && (
                        <p className="text-[10px] text-[#7A745F] italic mt-1 bg-white/70 p-1.5 rounded-md">
                          {med.indicaciones}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#F7F6F2] rounded-xl text-center text-xs text-[#7A745F]">
                No tiene medicamentos registrados actualmente.
              </div>
            )}
          </div>

          {/* Familiares y Acudientes Responsables */}
          <div className="border border-[#DEDBD1] rounded-2xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#B3803F]" />
                <h4 className="font-serif font-bold text-sm text-[#182F28]">
                  Familiares & Acudientes Vinculados
                </h4>
              </div>
              <span className="text-xs text-[#7A745F] font-mono">
                {selectedResidente.acudientes.length} registrado(s)
              </span>
            </div>

            {selectedResidente.acudientes.length > 0 ? (
              <div className="space-y-2.5">
                {selectedResidente.acudientes.map((acu) => (
                    <div
                      key={acu.id}
                      className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#182F28]">{acu.nombreCompleto}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#DCB87F]/30 text-[#694819] font-semibold">
                            {acu.parentesco}
                          </span>
                          {acu.esPrincipal && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E7A4C] text-white font-bold">
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#5C6058] mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#068591]" />
                            {acu.telefono}
                          </span>
                          {acu.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-[#068591]" />
                              {acu.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const fam = familiares.find((f) => f.id === acu.id);
                          if (fam) {
                            setEditingFamiliar(fam);
                            setIsEditFamiliarOpen(true);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#DCB87F] shrink-0"
                        title="Editar información del familiar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#F7F6F2] rounded-xl text-center text-xs text-[#7A745F]">
                No tiene acudientes registrados. Puedes vincular uno desde la sección de Familiares.
              </div>
            )}
          </div>

          {/* Dotación y Elementos Entregados al Residente */}
          <div className="border border-[#DEDBD1] rounded-2xl p-4 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#B3803F]" />
                <h4 className="font-serif font-bold text-sm text-[#182F28]">
                  Dotación & Artículos Entregados al Residente
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7A745F] font-mono">
                  {dotacionesResidente.length} artículo(s)
                </span>
                {dotacionesSolicitadas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMostrarModalImprimir(true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs border border-[#DCB87F]/40"
                    title="Imprimir solicitud de dotación pendiente en PDF o compartir por WhatsApp/Correo"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#DCB87F]" />
                    <span>Imprimir Solicitud ({dotacionesSolicitadas.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => abrirSolicitarDotacion(selectedResidente)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#DCB87F] hover:bg-[#c9a56c] text-[#182F28] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Ingresar requerimiento o solicitud de dotación para este residente"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-[#182F28]" />
                  <span>Solicitar Dotación</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormAgregarDotacion(!mostrarFormAgregarDotacion)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#182F28] hover:bg-[#274A3F] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Entregar Artículo</span>
                </button>
              </div>
            </div>

            {/* Formulario rápido para agregar artículo adicional */}
            {mostrarFormAgregarDotacion && (
              <div className="p-4 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] space-y-3 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-[#182F28] uppercase font-mono block">
                  Registrar Entrega de Artículo Adicional
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Nombre Artículo</label>
                    <input
                      type="text"
                      placeholder="Ej. Cobija extra, Paquete de toallas"
                      value={nuevoArticuloDotacion.nombre}
                      onChange={(e) => setNuevoArticuloDotacion({ ...nuevoArticuloDotacion, nombre: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Categoría</label>
                    <select
                      value={nuevoArticuloDotacion.categoria}
                      onChange={(e) => setNuevoArticuloDotacion({ ...nuevoArticuloDotacion, categoria: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
                    >
                      <option value="Lencería y Ropa de Cama">Lencería</option>
                      <option value="Aseo y Cuidado Personal">Aseo Personal</option>
                      <option value="Menaje">Menaje</option>
                      <option value="Ayudas Técnicas">Ayudas Técnicas</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Periodicidad</label>
                    <select
                      value={nuevoArticuloDotacion.frecuenciaMeses ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        setNuevoArticuloDotacion({ ...nuevoArticuloDotacion, frecuenciaMeses: val });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
                    >
                      <option value="">Única vez</option>
                      <option value="6">6 meses</option>
                      <option value="12">12 meses (1 año)</option>
                      <option value="24">24 meses (2 años)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarFormAgregarDotacion(false)}
                    className="px-3 py-1 text-xs text-[#5C6058] font-bold hover:bg-[#EFECE6] rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!nuevoArticuloDotacion.nombre.trim()) {
                        alert('Ingrese el nombre del artículo.');
                        return;
                      }
                      await agregarArticuloDotacionResidente(selectedResidente.id, {
                        nombreElemento: nuevoArticuloDotacion.nombre.trim(),
                        categoria: nuevoArticuloDotacion.categoria,
                        cantidad: 1,
                        frecuenciaCambioMeses: nuevoArticuloDotacion.frecuenciaMeses,
                        condicionEntrega: 'Nuevo',
                        notas: 'Entrega física directa al residente'
                      });
                      setNuevoArticuloDotacion({
                        nombre: '',
                        categoria: 'Lencería y Ropa de Cama',
                        cantidad: 1,
                        frecuenciaMeses: 12
                      });
                      setMostrarFormAgregarDotacion(false);
                    }}
                    className="px-4 py-1.5 bg-[#182F28] hover:bg-[#274A3F] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Guardar y Entregar
                  </button>
                </div>
              </div>
            )}

            {/* Modal flotante o diálogo para Registrar Recambio */}
            {itemParaRecambio && (
              <div className="p-4 bg-[#FEF7EE] rounded-xl border-2 border-[#DCB87F] space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#DCB87F]/40">
                  <span className="text-xs font-bold text-[#9A5B12] uppercase font-mono flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Registrar Recambio: {itemParaRecambio.nombreElemento}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setItemParaRecambio(null)}
                    className="text-xs text-[#9A5B12] hover:text-[#182F28] font-bold cursor-pointer"
                  >
                    ✕ Cerrar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Motivo de Renovación</label>
                    <input
                      type="text"
                      value={motivoRecambio}
                      onChange={(e) => setMotivoRecambio(e.target.value)}
                      placeholder="Ej. Cumplimiento de ciclo anual (12 meses)"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#182F28]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Condición del Nuevo Artículo</label>
                    <select
                      value={condicionNuevo}
                      onChange={(e) => setCondicionNuevo(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#182F28]"
                    >
                      <option value="Nuevo de paquete">Nuevo de paquete</option>
                      <option value="Excelente estado (Lavandería)">Excelente estado (Lavandería)</option>
                      <option value="Reemplazo por donación">Reemplazo por donación</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Observaciones</label>
                  <input
                    type="text"
                    value={observacionesRecambio}
                    onChange={(e) => setObservacionesRecambio(e.target.value)}
                    placeholder="Ej. Se retira juego de sábanas anterior deteriorado y se entrega juego nuevo color beige."
                    className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#182F28]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#7A745F]">
                    Próximo recambio calculado en: <strong>{itemParaRecambio.frecuenciaCambioMeses || 12} meses</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setItemParaRecambio(null)}
                      className="px-3 py-1 text-xs text-[#5C6058] font-bold hover:bg-[#fcecd7] rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await registrarRecambioDotacion(itemParaRecambio.id, {
                          motivo: motivoRecambio,
                          condicionNuevo,
                          observaciones: observacionesRecambio
                        });
                        setItemParaRecambio(null);
                        setMotivoRecambio('Cumplimiento de ciclo de recambio programado');
                        setObservacionesRecambio('');
                      }}
                      className="px-4 py-1.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Confirmar y Renovar Ciclo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Listado de Artículos con Semáforo de Recambio */}
            {dotacionesResidente.length > 0 ? (
              <div className="space-y-3">
                {dotacionesResidente.map((dot) => {
                  const dias = dot.diasParaCambio;
                  const semaforo = dot.semaforoCambio;

                  return (
                    <div
                      key={dot.id}
                      className="p-3.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#182F28]">
                              {dot.nombreElemento}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCB87F]/30 text-[#694819]">
                              {dot.categoria}
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#DEDBD1] text-[#182F28] font-bold">
                              {dot.cantidad} unidad(es)
                            </span>
                            {dot.estadoElemento === 'Solicitado' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                                SOLICITADO
                              </span>
                            )}
                          </div>

                          {dot.estadoElemento === 'Solicitado' ? (
                            <div className="text-xs text-[#5C6058] mt-1.5 space-y-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                {dot.fechaSolicitud && (
                                  <span>
                                    Fecha Solicitud: <strong className="text-[#182F28]">{dot.fechaSolicitud}</strong>
                                  </span>
                                )}
                                {dot.fechaRequerida && (
                                  <span>
                                    Requerido para: <strong className="text-[#182F28]">{dot.fechaRequerida}</strong>
                                  </span>
                                )}
                                {dot.condicionEntrega && (
                                  <span className="font-semibold text-[#9A5B12]">
                                    {dot.condicionEntrega}
                                  </span>
                                )}
                              </div>
                              {dot.notas && (
                                <p className="text-[11px] text-[#7A745F] italic">
                                  {dot.notas}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-4 text-xs text-[#5C6058] mt-1.5 flex-wrap">
                              <span>
                                Entrega inicial: <strong className="text-[#182F28]">{dot.fechaEntrega}</strong>
                              </span>
                              {dot.frecuenciaCambioMeses ? (
                                <span>
                                  Ciclo de reposición: <strong className="text-[#182F28]">{dot.frecuenciaCambioMeses} meses</strong>
                                </span>
                              ) : (
                                <span>Entrega única</span>
                              )}
                              {dot.fechaUltimoCambio && dot.fechaUltimoCambio !== dot.fechaEntrega && (
                                <span>
                                  Último recambio: <strong className="text-[#182F28]">{dot.fechaUltimoCambio}</strong>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Semáforo de Estado de Recambio o Estado Solicitado */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {dot.estadoElemento === 'Solicitado' ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>Pendiente Recibir</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => entregarDotacionSolicitada(dot.id)}
                                className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#182F28] hover:bg-[#274A3F] text-white transition-all cursor-pointer shadow-2xs"
                                title="Confirmar recepción física y entrega al residente"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#DCB87F]" />
                                <span>Marcar Entregado</span>
                              </button>
                            </>
                          ) : (
                            <>
                              {semaforo === 'VENCIDO' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-300">
                                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                  <span>Vencido ({Math.abs(dias || 0)} días)</span>
                                </span>
                              )}

                              {semaforo === 'PROXIMO' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                                  <span>Próximo recambio ({dias} días)</span>
                                </span>
                              )}

                              {semaforo === 'VIGENTE' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                  <span>Vigente ({dias} días)</span>
                                </span>
                              )}

                              {semaforo === 'SIN_VENCIMIENTO' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                                  Sin vencimiento
                                </span>
                              )}

                              {/* Botón para registrar recambio */}
                              {dot.frecuenciaCambioMeses && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setItemParaRecambio(dot);
                                    setMotivoRecambio(
                                      semaforo === 'VENCIDO'
                                        ? 'Renovación por vencimiento de ciclo'
                                        : 'Recambio periódico programado'
                                    );
                                  }}
                                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-[#DEDBD1] hover:border-[#182F28] text-[#182F28] hover:bg-[#182F28] hover:text-white transition-all cursor-pointer shadow-2xs"
                                  title="Registrar nuevo recambio físico y resetear ciclo"
                                >
                                  <RotateCcw className="w-3 h-3 text-[#B3803F]" />
                                  <span>Registrar Recambio</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Historial de recambios previos si existen */}
                      {dot.historial && dot.historial.length > 0 && (
                        <div className="pt-2 border-t border-[#DEDBD1]/60 text-[11px] text-[#7A745F]">
                          <span className="font-bold text-[#182F28] block mb-1">
                            📋 Historial de Recambios ({dot.historial.length}):
                          </span>
                          <div className="space-y-1 pl-2 border-l-2 border-[#DCB87F]">
                            {dot.historial.map((h, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span>
                                  <strong>{h.fechaCambio}</strong>: {h.motivo} ({h.condicionNuevo})
                                </span>
                                <span className="text-[10px] text-[#5C6058]">{h.usuarioRegistra}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-[#F7F6F2] rounded-xl text-center text-xs text-[#7A745F]">
                No tiene elementos de dotación asignados todavía. Utilice el botón "Entregar Artículo" para asignarle sábanas, cobijas o toallas.
              </div>
            )}
          </div>

          {/* Archivos y Documentos Adjuntos del Residente */}
          <div className="space-y-3 pt-3 border-t border-[#DEDBD1]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase text-[#7A745F] tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-[#274A3F]" />
                <span>Documentos & Archivos Adjuntos ({selectedResidente.archivosAdjuntos?.length || 0})</span>
              </h4>
            </div>

            {selectedResidente.archivosAdjuntos && selectedResidente.archivosAdjuntos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedResidente.archivosAdjuntos.map((arch, idx) => {
                  // Resolver la ruta oficial en la jerarquía: Samanya / {Sede} / Residentes / {id}_{identificacion} / Documentos / {nombre}
                  const sedeNombre = activeSede?.nombre || 'Sede Central Bogotá';
                  const docIdentificacion = selectedResidente.identificacion || 'SIN_DOC';
                  const sujetoFolder = `${selectedResidente.id || idx + 1}_${docIdentificacion}`;
                  const nombreFichero = arch.nombreAlmacenado || arch.nombreArchivo;

                  const rutaOficialCalculada = `Samanya/${sedeNombre}/Residentes/${sujetoFolder}/Documentos/${nombreFichero}`;
                  let rutaOficial = arch.rutaRelativa || rutaOficialCalculada;
                  if (sedeNombre === 'Sede Campestre La Calera') {
                    rutaOficial = rutaOficial.replace('Sede Campestre El Nogal', 'Sede Campestre La Calera');
                  } else if (sedeNombre === 'Sede Central Bogotá') {
                    rutaOficial = rutaOficial
                      .replace('Sede Principal Santa Bárbara', 'Sede Central Bogotá')
                      .replace('Sede Principal Santa Barbara', 'Sede Central Bogotá');
                  }

                  // URL prioritaria: abrir directamente en Google Drive, con fallback a URL web o ruta oficial
                  let openUrl = arch.driveUrl || (arch.url && arch.url.includes('drive.google.com') ? arch.url : undefined);
                  if (!openUrl) {
                    if (arch.url && (arch.url.startsWith('http://') || arch.url.startsWith('https://'))) {
                      openUrl = arch.url;
                    } else {
                      openUrl = `/${encodeURI(rutaOficial.replace(/^\//, ''))}`;
                    }
                  }

                  return (
                    <div
                      key={arch.id || idx}
                      className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between gap-3 shadow-2xs hover:border-[#274A3F]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#DEDBD1] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-[#274A3F]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[#182F28] truncate block max-w-[170px]" title={arch.nombreArchivo}>
                              {arch.nombreArchivo}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#274A3F]/10 text-[#274A3F] border border-[#274A3F]/20">
                              {arch.claseArchivo}
                            </span>
                            {arch.tamanoBytes && (
                              <span className="text-[10px] text-[#7A745F]">
                                {(arch.tamanoBytes / 1024).toFixed(1)} KB
                              </span>
                            )}
                          </div>
                          {arch.descripcion && (
                            <p className="text-[11px] text-[#5C6058] truncate mt-0.5">
                              {arch.descripcion}
                            </p>
                          )}
                          {/* Ruta oficial del archivo en el sistema */}
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-[#274A3F] bg-[#EAE7DC]/70 px-2 py-0.5 rounded border border-[#DEDBD1] truncate max-w-[280px]" title={rutaOficial}>
                            <span className="shrink-0">📁</span>
                            <span className="truncate">{rutaOficial}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={openUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-white hover:bg-[#ECE7DB] border border-[#DEDBD1] rounded-lg text-[#274A3F] transition-colors flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                          title="Abrir en Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-[#F7F6F2] rounded-xl text-center text-xs text-[#7A745F]">
                No se adjuntaron documentos durante la admisión del residente.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DEDBD1] bg-[#F7F6F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingResidente(selectedResidente);
                setIsEditResidenteOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#DCB87F]"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Información</span>
            </button>

            {dotacionesSolicitadas.length > 0 && (
              <button
                type="button"
                onClick={() => setMostrarModalImprimir(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#DCB87F]/40 shadow-xs"
                title="Generar PDF e imprimir solicitud de dotación pendiente, o enviar por WhatsApp/Correo"
              >
                <Printer className="w-4 h-4 text-[#DCB87F]" />
                <span>Imprimir Solicitud Pendiente ({dotacionesSolicitadas.length})</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsResidenteDetailOpen(false)}
            className="px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>

      {/* Modal para Imprimir Solicitud de Dotación */}
      <ImprimirSolicitudDotacionModal
        isOpen={mostrarModalImprimir}
        onClose={() => setMostrarModalImprimir(false)}
        residente={selectedResidente}
        articulos={dotacionesSolicitadas}
        activeSede={activeSede}
      />
    </div>
  );
};
