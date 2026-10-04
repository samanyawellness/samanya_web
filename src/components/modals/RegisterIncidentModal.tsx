import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  User,
  Clock,
  Calendar,
  HeartHandshake,
  CheckCircle2,
  BookOpen,
  Phone,
  Activity,
  Ambulance,
  Brain,
  HelpCircle,
  FileText
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarUtils';
import { obtenerFechaBogota, obtenerHoraBogota } from '../../context/AdminContext';
import { IncidenteOperativo } from '../../types';

export const RegisterIncidentModal: React.FC = () => {
  const {
    isRegisterIncidentOpen,
    setIsRegisterIncidentOpen,
    residentes,
    trabajadores,
    activeSede,
    currentUser,
    registrarIncidente,
    showAlert
  } = useAdmin();

  // Filtrar residentes pertenecientes a la sede activa
  const residentesSede = useMemo(() => {
    return residentes.filter((r) => r.idCentro === activeSede.id);
  }, [residentes, activeSede.id]);

  // Filtrar talento humano / colaboradores de la sede activa
  const trabajadoresSede = useMemo(() => {
    return trabajadores
      .filter((t) => (t.idCentro === activeSede.id || t.idCentro === undefined) && t.estado !== 'Inactivo')
      .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
  }, [trabajadores, activeSede.id]);

  // Estados del formulario
  const [selectedResidenteId, setSelectedResidenteId] = useState<number | ''>('');
  const [tipo, setTipo] = useState<IncidenteOperativo['tipo']>('Caída');
  const [severidad, setSeveridad] = useState<IncidenteOperativo['severidad']>('Media');
  const [fecha, setFecha] = useState<string>('');
  const [hora, setHora] = useState<string>('');
  const [reporterSelectValue, setReporterSelectValue] = useState<string>('ADMIN');
  const [reportadoPorManual, setReportadoPorManual] = useState<string>('');
  const [reportadoPor, setReportadoPor] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [accionesTomadas, setAccionesTomadas] = useState<string>('');
  const [estadoInicial, setEstadoInicial] = useState<IncidenteOperativo['estado']>('Abierto');
  const [notificadoFamiliar, setNotificadoFamiliar] = useState<boolean>(false);
  const [registrarEnBitacora, setRegistrarEnBitacora] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchResidente, setSearchResidente] = useState<string>('');

  // Inicializar fecha, hora y reportante al abrir
  useEffect(() => {
    if (isRegisterIncidentOpen) {
      setFecha(obtenerFechaBogota());
      setHora(obtenerHoraBogota());
      setReporterSelectValue('ADMIN');
      setReportadoPorManual('');
      setReportadoPor(currentUser?.nombreCompleto || 'Administrador de Sede');
      setTipo('Caída');
      setSeveridad('Media');
      setDescripcion('');
      setAccionesTomadas('');
      setEstadoInicial('Abierto');
      setNotificadoFamiliar(false);
      setRegistrarEnBitacora(true);
      setSearchResidente('');
      // Si no hay seleccionado, resetear
      if (!selectedResidenteId && residentesSede.length > 0) {
        setSelectedResidenteId(residentesSede[0].id);
      }
    }
  }, [isRegisterIncidentOpen, currentUser, residentesSede]);

  // Residente seleccionado
  const selectedResidente = useMemo(() => {
    if (!selectedResidenteId) return null;
    return residentesSede.find((r) => r.id === Number(selectedResidenteId)) || null;
  }, [selectedResidenteId, residentesSede]);

  // Acudiente principal del residente si existe
  const acudientePrincipal = useMemo(() => {
    if (!selectedResidente || !selectedResidente.acudientes) return null;
    return (
      selectedResidente.acudientes.find((a) => a.esPrincipal) ||
      selectedResidente.acudientes[0] ||
      null
    );
  }, [selectedResidente]);

  // Residentes filtrados por búsqueda
  const residentesFiltrados = useMemo(() => {
    if (!searchResidente.trim()) return residentesSede;
    const term = searchResidente.toLowerCase();
    return residentesSede.filter(
      (r) =>
        r.nombreCompleto.toLowerCase().includes(term) ||
        r.identificacion.toLowerCase().includes(term) ||
        r.habitacion.toLowerCase().includes(term)
    );
  }, [residentesSede, searchResidente]);

  if (!isRegisterIncidentOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setIsRegisterIncidentOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResidenteId) {
      showAlert('Por favor seleccione el residente involucrado en el incidente.', 'Residente requerido', 'warning');
      return;
    }

    if (!descripcion.trim()) {
      showAlert('Por favor ingrese la descripción detallada del evento o incidente.', 'Descripción requerida', 'warning');
      return;
    }

    if (!accionesTomadas.trim()) {
      showAlert('Por favor especifique las acciones inmediatas o protocolos de atención tomados.', 'Acciones requeridas', 'warning');
      return;
    }

    if (!reportadoPor.trim()) {
      showAlert('Por favor seleccione o ingrese quién reporta el incidente (Administrador o colaborador de Talento Humano).', 'Reportante requerido', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const fechaHoraFormateada = `${fecha} ${hora}`;

      await registrarIncidente({
        idResidente: Number(selectedResidenteId),
        tipo,
        severidad,
        descripcion: descripcion.trim(),
        accionesTomadas: accionesTomadas.trim(),
        reportadoPor: reportadoPor.trim() || 'Administrador de Sede',
        fechaHora: fechaHoraFormateada,
        estado: estadoInicial,
        notificadoFamiliar,
        registrarEnBitacora
      });

      setIsRegisterIncidentOpen(false);
    } catch (err: any) {
      console.error('[RegisterIncidentModal] Error al registrar incidente:', err);
      showAlert(
        `Ocurrió un error al registrar el incidente: ${err.message || 'Error desconocido'}`,
        'Error de Registro',
        'alert'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FAF9F5] border border-[#DEDBD1] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-[#26241F]">
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-[#DEDBD1] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FBE8E6] text-[#A4453A] border border-[#A4453A]/30 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#182F28] leading-tight">
                Reportar Incidente Operativo / Clínico
              </h3>
              <p className="text-xs text-[#7A745F]">
                Registro de eventos adversos, alertas y activación de protocolos en{' '}
                <strong className="text-[#182F28]">{activeSede.nombre}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-[#7A745F] hover:text-[#182F28] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Formulario Scrolleable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. SELECCIÓN DEL RESIDENTE */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B3803F]" />
                <span>Residente Involucrado *</span>
              </span>
              <span className="text-[11px] text-[#7A745F] font-normal normal-case">
                ({residentesSede.length} en sede activa)
              </span>
            </label>

            <select
              value={selectedResidenteId}
              onChange={(e) => setSelectedResidenteId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F] focus:ring-1 focus:ring-[#B3803F]"
            >
              <option value="">-- Seleccionar Residente --</option>
              {residentesSede.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombreCompleto} — Hab. {r.habitacion} (Cama {r.cama}) — Doc: {r.identificacion}
                </option>
              ))}
            </select>

            {/* Ficha Resumen del Residente Seleccionado */}
            {selectedResidente && (
              <div className="p-3 bg-white rounded-2xl border border-[#DEDBD1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={resolverAvatarUrl(selectedResidente.fotoUrl)}
                    alt={selectedResidente.nombreCompleto}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                    className="w-10 h-10 rounded-xl object-cover border border-[#DEDBD1] shrink-0"
                  />
                  <div>
                    <h5 className="font-serif font-bold text-sm text-[#182F28]">
                      {selectedResidente.nombreCompleto}
                    </h5>
                    <p className="text-[11px] text-[#7A745F]">
                      Habitación <strong>{selectedResidente.habitacion}</strong> • Cama{' '}
                      <strong>{selectedResidente.cama}</strong> • EPS: {selectedResidente.eps}
                    </p>
                  </div>
                </div>

                {acudientePrincipal && (
                  <div className="bg-[#F7F6F2] px-3 py-1.5 rounded-xl border border-[#DEDBD1] text-[11px] text-[#5C6058] shrink-0">
                    <span className="font-bold text-[#182F28] block">
                      Acudiente: {acudientePrincipal.nombreCompleto} ({acudientePrincipal.parentesco})
                    </span>
                    <span className="flex items-center gap-1 text-[#7A745F]">
                      <Phone className="w-3 h-3 text-[#B3803F]" />
                      {acudientePrincipal.telefono}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. TIPO Y SEVERIDAD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo de Incidente */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#B3803F]" />
                <span>Tipo de Incidente *</span>
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as IncidenteOperativo['tipo'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-bold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              >
                <option value="Caída">Caída</option>
                <option value="Alteración de Signos">Alteración de Signos</option>
                <option value="Traslado a Urgencias">Traslado a Urgencias</option>
                <option value="Comportamiento / Agitación">Comportamiento / Agitación</option>
                <option value="Otro">Otro Evento</option>
              </select>
            </div>

            {/* Severidad */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#B3803F]" />
                <span>Severidad / Nivel de Riesgo *</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Baja', 'Media', 'Alta', 'Crítica'] as const).map((sev) => {
                  const isSel = severidad === sev;
                  const colorClasses =
                    sev === 'Baja'
                      ? isSel
                        ? 'bg-[#DFF3E7] text-[#1E7A4C] border-[#1E7A4C]'
                        : 'bg-white text-[#1E7A4C] border-[#DEDBD1] hover:bg-[#DFF3E7]/40'
                      : sev === 'Media'
                      ? isSel
                        ? 'bg-[#FEF7EE] text-[#9A5B12] border-[#9A5B12]'
                        : 'bg-white text-[#9A5B12] border-[#DEDBD1] hover:bg-[#FEF7EE]/40'
                      : sev === 'Alta'
                      ? isSel
                        ? 'bg-[#FBE8E6] text-[#A4453A] border-[#A4453A]'
                        : 'bg-white text-[#A4453A] border-[#DEDBD1] hover:bg-[#FBE8E6]/40'
                      : isSel
                      ? 'bg-[#A4453A] text-white border-[#A4453A]'
                      : 'bg-white text-[#A4453A] border-[#DEDBD1] hover:bg-[#FBE8E6]/60';

                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeveridad(sev)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${colorClasses}`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. FECHA, HORA Y REPORTADO POR */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#B3803F]" />
                <span>Fecha del Evento</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#B3803F]" />
                <span>Hora del Evento</span>
              </label>
              <input
                type="text"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                placeholder="Ej. 10:30 AM"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
            </div>

            <div className="sm:col-span-6 space-y-1">
              <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-[#B3803F]" />
                  <span>Reportado Por *</span>
                </span>
                <span className="text-[10px] text-[#7A745F] normal-case font-normal">
                  (Admin o Talento Humano)
                </span>
              </label>
              <select
                value={reporterSelectValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setReporterSelectValue(val);
                  if (val === 'ADMIN') {
                    setReportadoPor(currentUser?.nombreCompleto || 'Administrador de Sede');
                  } else if (val.startsWith('TRAB_')) {
                    const id = Number(val.replace('TRAB_', ''));
                    const trab = trabajadoresSede.find((t) => t.id === id);
                    if (trab) {
                      setReportadoPor(trab.nombreCompleto);
                    }
                  } else if (val === 'OTRO') {
                    setReportadoPor(reportadoPorManual);
                  }
                }}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              >
                <optgroup label="Administración de Sede">
                  <option value="ADMIN">
                    👑 {currentUser?.nombreCompleto || 'Administrador de Sede'} (Administrador)
                  </option>
                </optgroup>
                <optgroup label={`Talento Humano (${trabajadoresSede.length} colaboradores)`}>
                  {trabajadoresSede.map((t) => (
                    <option key={t.id} value={`TRAB_${t.id}`}>
                      🩺 {t.nombreCompleto} — {t.cargo} ({t.area})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Otro Profesional / Persona">
                  <option value="OTRO">✍️ Especificar otra persona / profesional externo...</option>
                </optgroup>
              </select>

              {reporterSelectValue === 'OTRO' && (
                <input
                  type="text"
                  value={reportadoPorManual}
                  onChange={(e) => {
                    setReportadoPorManual(e.target.value);
                    setReportadoPor(e.target.value);
                  }}
                  placeholder="Ingrese el nombre completo y cargo de quien reporta..."
                  required
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-[#B3803F] bg-white text-xs font-semibold text-[#182F28] focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* 4. DESCRIPCIÓN DEL EVENTO */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#B3803F]" />
              <span>Descripción Detallada del Evento *</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={3}
              placeholder="Describa con precisión qué ocurrió, lugar del incidente (habitación, pasillo, baño), signos visibles o estado del residente al momento del evento..."
              className="w-full p-3 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#26241F] placeholder:text-[#7A745F] focus:outline-none focus:border-[#B3803F]"
            />
          </div>

          {/* 5. ACCIONES TOMADAS / PROTOCOLO */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#1E7A4C]" />
              <span>Acciones Tomadas / Protocolo Activado *</span>
            </label>
            <textarea
              value={accionesTomadas}
              onChange={(e) => setAccionesTomadas(e.target.value)}
              required
              rows={3}
              placeholder="Detalle los primeros auxilios brindados, toma de signos vitales, valoración médica realizada, medicamentos suministrados o traslados solicitados..."
              className="w-full p-3 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#26241F] placeholder:text-[#7A745F] focus:outline-none focus:border-[#B3803F]"
            />
          </div>

          {/* 6. ESTADO Y NOTIFICACIONES */}
          <div className="p-4 bg-white rounded-2xl border border-[#DEDBD1] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#182F28] block">Estado Inicial del Caso</span>
                <span className="text-[11px] text-[#7A745F]">
                  Indica si el incidente requiere seguimiento continuo o si ya quedó cerrado.
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(['Abierto', 'En Seguimiento', 'Cerrado'] as const).map((est) => (
                  <button
                    key={est}
                    type="button"
                    onClick={() => setEstadoInicial(est)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      estadoInicial === est
                        ? 'bg-[#182F28] text-white border-[#182F28]'
                        : 'bg-[#F7F6F2] text-[#5C6058] border-[#DEDBD1] hover:bg-[#EAE7DC]'
                    }`}
                  >
                    {est}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#DEDBD1] space-y-2">
              {/* Notificación a familiar */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={notificadoFamiliar}
                  onChange={(e) => setNotificadoFamiliar(e.target.checked)}
                  className="rounded border-[#DEDBD1] text-[#1E7A4C] focus:ring-[#1E7A4C] w-4 h-4 cursor-pointer"
                />
                <span className="text-[#182F28] font-medium flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#B3803F]" />
                  <span>Se contactó y notificó oportunamente al familiar / acudiente responsable</span>
                </span>
              </label>

              {/* Registro automático en bitácora */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={registrarEnBitacora}
                  onChange={(e) => setRegistrarEnBitacora(e.target.checked)}
                  className="rounded border-[#DEDBD1] text-[#182F28] focus:ring-[#182F28] w-4 h-4 cursor-pointer"
                />
                <span className="text-[#182F28] font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#182F28]" />
                  <span>Insertar automáticamente una nota de alerta en la Bitácora Clínica del Paciente</span>
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Pie del Modal con Botones de Acción */}
        <div className="px-6 py-4 border-t border-[#DEDBD1] bg-white flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-[#5C6058] hover:text-[#182F28] hover:bg-[#F7F6F2] rounded-xl transition-colors cursor-pointer border border-[#DEDBD1]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#A4453A] hover:bg-[#8B3A31] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Registrando Incidente...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Guardar y Registrar Incidente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
