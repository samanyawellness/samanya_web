import React, { useState, useMemo, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  CalendarPlus,
  User,
  Calendar,
  FileText,
  FileCheck2,
  CheckCircle2,
  Clock,
  Paperclip,
  UploadCloud,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarUtils';
import { subirSoportePermiso } from '../../services/driveService';

export const RegisterLeaveModal: React.FC = () => {
  const {
    isRegisterLeaveOpen,
    setIsRegisterLeaveOpen,
    trabajadores,
    activeSede,
    registrarPermiso,
    showConfirm,
    showAlert
  } = useAdmin();

  // Filtrar trabajadores de la sede activa
  const trabajadoresSede = useMemo(() => {
    return trabajadores.filter(
      (t) => t.idCentro === activeSede.id || t.idCentro === undefined
    );
  }, [trabajadores, activeSede.id]);

  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState<number | ''>('');
  const [tipo, setTipo] = useState<'Incapacidad Médica' | 'Vacaciones' | 'Permiso Personal' | 'Licencia'>('Incapacidad Médica');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [motivo, setMotivo] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [soporteManualUrl, setSoporteManualUrl] = useState('');
  const [estadoInicial, setEstadoInicial] = useState<'Pendiente' | 'Aprobado'>('Aprobado');
  const [comentariosAdmin, setComentariosAdmin] = useState('Aprobado directamente por administración de sede.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStepText, setSubmitStepText] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trabajador seleccionado actualmente
  const selectedTrabajador = useMemo(() => {
    if (!selectedTrabajadorId) return null;
    return trabajadores.find((t) => t.id === Number(selectedTrabajadorId)) || null;
  }, [selectedTrabajadorId, trabajadores]);

  // Ruta objetivo en Google Drive para previsualización
  const driveFolderPath = useMemo(() => {
    if (!selectedTrabajador) return 'Samanya/Talento_humano/id_identificacion';
    const id = selectedTrabajador.id;
    const doc = String(selectedTrabajador.identificacion || 'SIN_DOC')
      .trim()
      .replace(/\./g, '')
      .replace(/-/g, '');
    return `Samanya/Talento_humano/${id}_${doc}`;
  }, [selectedTrabajador]);

  // Cálculo de días estimados
  const duracionDias = useMemo(() => {
    if (!fechaInicio || !fechaFin) return 0;
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [fechaInicio, fechaFin]);

  if (!isRegisterLeaveOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño máximo 25MB
      if (file.size > 25 * 1024 * 1024) {
        showAlert('El archivo supera el tamaño máximo permitido de 25MB.', 'Archivo muy pesado', 'warning');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTrabajadorId) {
      showAlert('Por favor seleccione un colaborador de Talento Humano.', 'Selección Requerida', 'warning');
      return;
    }

    if (!motivo.trim()) {
      showAlert('Por favor ingrese el motivo o justificación de la novedad.', 'Campo Requerido', 'warning');
      return;
    }

    if (new Date(fechaFin) < new Date(fechaInicio)) {
      showAlert('La fecha de fin no puede ser anterior a la fecha de inicio.', 'Rango Inválido', 'warning');
      return;
    }

    const trabajador = trabajadores.find((t) => t.id === Number(selectedTrabajadorId));
    if (!trabajador) {
      showAlert('El colaborador seleccionado no es válido.', 'Colaborador no encontrado', 'alert');
      return;
    }

    setIsSubmitting(true);
    let finalSoporteUrl = soporteManualUrl.trim() || undefined;
    let finalDriveUrl: string | undefined = undefined;
    let finalRutaDrive: string | undefined = undefined;
    let finalIdArchivoSoporte: number | undefined = undefined;

    try {
      // 1. Si seleccionó un archivo físico, subirlo a Google Drive y registrar en SMY_ARCHIVOS
      if (selectedFile) {
        setSubmitStepText('Subiendo soporte a Google Drive...');
        try {
          const uploadRes = await subirSoportePermiso({
            file: selectedFile,
            idEmpleado: trabajador.id,
            identificacion: trabajador.identificacion,
            idCentro: activeSede.id,
            nombreSede: activeSede?.nombre || 'Sede Central Bogotá',
            nombreCompleto: trabajador.nombreCompleto
          });

          if (uploadRes && uploadRes.nombreArchivo) {
            finalSoporteUrl = uploadRes.nombreArchivo;
            finalDriveUrl = uploadRes.driveUrl;
            finalRutaDrive = `${uploadRes.rutaRelativa}/${uploadRes.nombreAlmacenado}`;
            finalIdArchivoSoporte = uploadRes.idArchivo;
          }
        } catch (uploadError: any) {
          console.error('Error durante la subida a Drive / SMY_ARCHIVOS:', uploadError);
          const errDetail = uploadError?.message || String(uploadError);
          const confirmProceed = await showConfirm({
            title: 'Aviso sobre Google Drive',
            message: `${errDetail}\n\n¿Desea registrar el permiso de todos modos en modo local (sin respaldo en Google Drive) o prefiere Cancelar para renovar las credenciales?`,
            type: 'warning',
            confirmText: 'Registrar en modo local',
            cancelText: 'Cancelar'
          });
          if (!confirmProceed) {
            setIsSubmitting(false);
            return;
          }
          if (!finalSoporteUrl) {
            finalSoporteUrl = selectedFile.name;
            finalRutaDrive = `Samanya/Talento_humano/${trabajador.id}_${trabajador.identificacion || 'DOC'}/${selectedFile.name}`;
          }
        }
      }

      // 2. Registrar la novedad en el sistema (Contexto y Backend Oracle)
      setSubmitStepText('Guardando novedad de personal...');
      await registrarPermiso({
        idTrabajador: trabajador.id,
        nombreTrabajador: trabajador.nombreCompleto,
        area: trabajador.area,
        tipo,
        fechaInicio,
        fechaFin,
        motivo: motivo.trim(),
        soporteUrl: finalSoporteUrl,
        driveUrl: finalDriveUrl,
        rutaDrive: finalRutaDrive,
        idArchivoSoporte: finalIdArchivoSoporte,
        idArchivo: finalIdArchivoSoporte,
        estado: estadoInicial,
        comentariosAdmin:
          estadoInicial === 'Aprobado'
            ? comentariosAdmin.trim() || 'Aprobado por administración.'
            : undefined
      });

      // Resetear estado del formulario y cerrar modal
      setSelectedTrabajadorId('');
      setMotivo('');
      setSelectedFile(null);
      setSoporteManualUrl('');
      setEstadoInicial('Aprobado');
      setComentariosAdmin('Aprobado directamente por administración de sede.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsRegisterLeaveOpen(false);
    } catch (error) {
      console.error('Error al registrar permiso:', error);
      showAlert('Ocurrió un error al registrar la novedad de personal.', 'Error', 'alert');
    } finally {
      setIsSubmitting(false);
      setSubmitStepText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#DEDBD1] shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="px-6 py-5 bg-[#182F28] text-white flex items-center justify-between border-b border-[#274A3F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B3803F]/20 flex items-center justify-center text-[#B3803F] border border-[#B3803F]/30">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight">
                Registrar Permiso o Incapacidad
              </h3>
              <p className="text-xs text-[#E1DCD2]">
                Registro oficial de novedades de Talento Humano para {activeSede.nombre}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setIsRegisterLeaveOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Selección de Colaborador */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#182F28] uppercase font-mono">
              Colaborador de Talento Humano *
            </label>
            <div className="relative">
              <select
                required
                value={selectedTrabajadorId}
                onChange={(e) => setSelectedTrabajadorId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm text-[#182F28] font-medium focus:outline-none focus:border-[#274A3F] focus:bg-white transition-all cursor-pointer"
              >
                <option value="">-- Seleccionar Colaborador --</option>
                {trabajadoresSede.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombreCompleto} • {t.cargo} ({t.area})
                  </option>
                ))}
              </select>
            </div>

            {/* Vista previa del colaborador seleccionado */}
            {selectedTrabajador && (
              <div className="flex items-center justify-between p-3 mt-2 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                <div className="flex items-center gap-3">
                  <img
                    src={resolverAvatarUrl(selectedTrabajador.avatarUrl, DEFAULT_AVATAR)}
                    alt={selectedTrabajador.nombreCompleto}
                    className="w-9 h-9 rounded-full object-cover border border-[#DEDBD1]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                    }}
                  />
                  <div>
                    <h5 className="font-serif font-bold text-xs text-[#182F28]">
                      {selectedTrabajador.nombreCompleto}
                    </h5>
                    <p className="text-[11px] text-[#5C6058]">
                      {selectedTrabajador.cargo} • CC: {selectedTrabajador.identificacion}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#274A3F]/10 text-[#274A3F]">
                    {selectedTrabajador.area}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedTrabajador.estado === 'Activo'
                        ? 'bg-[#DFF3E7] text-[#1E7A4C]'
                        : selectedTrabajador.estado === 'En Permiso'
                        ? 'bg-[#FEF7EE] text-[#9A5B12]'
                        : 'bg-[#FBE8E6] text-[#A4453A]'
                    }`}
                  >
                    {selectedTrabajador.estado}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Tipo de Novedad y Rango de Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="block text-xs font-bold text-[#182F28] uppercase font-mono">
                Tipo de Novedad *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#182F28] font-bold focus:outline-none focus:border-[#274A3F] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Incapacidad Médica">Incapacidad Médica</option>
                <option value="Vacaciones">Vacaciones</option>
                <option value="Permiso Personal">Permiso Personal</option>
                <option value="Licencia">Licencia</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="block text-xs font-bold text-[#182F28] uppercase font-mono flex items-center justify-between">
                <span>Fecha Inicio *</span>
                <Calendar className="w-3 h-3 text-[#B3803F]" />
              </label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  if (new Date(e.target.value) > new Date(fechaFin)) {
                    setFechaFin(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#182F28] focus:outline-none focus:border-[#274A3F] focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="block text-xs font-bold text-[#182F28] uppercase font-mono flex items-center justify-between">
                <span>Fecha Fin *</span>
                <span className="text-[10px] text-[#B3803F] font-bold">
                  {duracionDias} {duracionDias === 1 ? 'día' : 'días'}
                </span>
              </label>
              <input
                type="date"
                required
                value={fechaFin}
                min={fechaInicio}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#182F28] focus:outline-none focus:border-[#274A3F] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* 3. Motivo / Justificación */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#182F28] uppercase font-mono">
              Motivo / Justificación de la Novedad *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describa el motivo de la incapacidad, permiso o periodo de vacaciones (ej. Cuadro de gastroenteritis con reposo médico certificado por EPS)..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#182F28] focus:outline-none focus:border-[#274A3F] focus:bg-white transition-all resize-none placeholder:text-[#9A917A]"
            />
          </div>

          {/* 4. Documento o Soporte Adjunto (Google Drive & SMY_ARCHIVOS) */}
          <div className="space-y-2 p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-[#B3803F]" />
                <span>Documento o Soporte Adjunto (Opcional)</span>
              </label>
              <span className="text-[10px] text-[#7A745F] font-mono">
                Google Drive & SMY_ARCHIVOS
              </span>
            </div>

            {/* Selector de Archivo Físico */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              id="file-soporte-upload"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#DEDBD1] hover:border-[#274A3F] rounded-xl p-4 text-center cursor-pointer bg-white transition-colors space-y-1 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#274A3F]/10 text-[#274A3F] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[#182F28]">
                  Haga clic para seleccionar el archivo de soporte
                </p>
                <p className="text-[11px] text-[#7A745F]">
                  Formatos admitidos: PDF, JPG, PNG, DOCX (Máx. 25MB)
                </p>
                <div className="mt-2 text-[10px] text-[#274A3F] font-mono bg-[#274A3F]/5 py-1 px-2 rounded-md inline-block">
                  Ruta Drive: 📁 {driveFolderPath}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#274A3F]/40 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#274A3F]/15 flex items-center justify-center text-[#274A3F] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h6 className="font-bold text-xs text-[#182F28] truncate">
                      {selectedFile.name}
                    </h6>
                    <p className="text-[10px] text-[#5C6058] flex items-center gap-2">
                      <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span className="text-[#274A3F] font-mono font-medium truncate">
                        📁 {driveFolderPath}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg text-[#A4453A] hover:bg-[#FBE8E6] transition-colors cursor-pointer"
                    title="Quitar archivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Campo alternativo / adicional para nombre o URL de soporte */}
            <div className="pt-1">
              <input
                type="text"
                placeholder={selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : "O ingrese nombre / URL del soporte manualmente (ej: incapacidad_medica.pdf)"}
                value={soporteManualUrl}
                onChange={(e) => setSoporteManualUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-[11px] text-[#182F28] focus:outline-none focus:border-[#274A3F] transition-all placeholder:text-[#9A917A]"
              />
            </div>
          </div>

          {/* 5. Estado Inicial del Registro */}
          <div className="space-y-2 pt-2 border-t border-[#DEDBD1]">
            <label className="block text-xs font-bold text-[#182F28] uppercase font-mono">
              Resolución Administrativa Inicial *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  estadoInicial === 'Aprobado'
                    ? 'border-[#1E7A4C] bg-[#DFF3E7]/40 ring-1 ring-[#1E7A4C]'
                    : 'border-[#DEDBD1] bg-[#F7F6F2] hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="estadoInicial"
                  value="Aprobado"
                  checked={estadoInicial === 'Aprobado'}
                  onChange={() => setEstadoInicial('Aprobado')}
                  className="mt-0.5 text-[#1E7A4C] focus:ring-[#1E7A4C]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7A4C]" />
                    <span className="font-bold text-xs text-[#182F28]">Aprobado Inmediato</span>
                  </div>
                  <p className="text-[11px] text-[#5C6058] mt-0.5">
                    Autoriza el permiso de inmediato y actualiza el colaborador a estado <strong>"En Permiso"</strong>.
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  estadoInicial === 'Pendiente'
                    ? 'border-[#B3803F] bg-[#FEF7EE]/60 ring-1 ring-[#B3803F]'
                    : 'border-[#DEDBD1] bg-[#F7F6F2] hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="estadoInicial"
                  value="Pendiente"
                  checked={estadoInicial === 'Pendiente'}
                  onChange={() => setEstadoInicial('Pendiente')}
                  className="mt-0.5 text-[#B3803F] focus:ring-[#B3803F]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#9A5B12]" />
                    <span className="font-bold text-xs text-[#182F28]">Pendiente por Revisión</span>
                  </div>
                  <p className="text-[11px] text-[#5C6058] mt-0.5">
                    Registra la solicitud en bandeja para aprobación posterior con soporte o verificación.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 6. Nota de Administración (si es Aprobado) */}
          {estadoInicial === 'Aprobado' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#182F28] uppercase font-mono">
                Nota de Aprobación Administrativa
              </label>
              <input
                type="text"
                placeholder="Observación o detalle del reemplazo de turnos..."
                value={comentariosAdmin}
                onChange={(e) => setComentariosAdmin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs text-[#182F28] focus:outline-none focus:border-[#274A3F] focus:bg-white transition-all"
              />
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-[#DEDBD1] flex items-center justify-between">
            <div className="text-xs text-[#7A745F] font-medium">
              {isSubmitting && (
                <span className="flex items-center gap-2 text-[#274A3F] font-bold animate-pulse">
                  <UploadCloud className="w-4 h-4 animate-spin" />
                  <span>{submitStepText || 'Procesando registro...'}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsRegisterLeaveOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#DEDBD1] text-xs font-bold text-[#5C6058] hover:bg-[#F7F6F2] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <FileCheck2 className="w-4 h-4 text-[#B3803F]" />
                <span>{isSubmitting ? 'Guardando...' : 'Guardar Registro'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
