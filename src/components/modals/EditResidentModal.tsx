import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  Save,
  User,
  Bed,
  HeartPulse,
  ShieldAlert,
  Camera,
  Pill,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Paperclip,
  FileText,
  FilePlus,
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Residente, MedicamentoPrescrito, ClaseArchivoResidente, ArchivoAdjuntoResidente } from '../../types';
import { obtenerIniciales } from '../../utils/avatarUtils';
import { limpiarIdentificacion } from '../../utils/formatters';
import { subirArchivoResidente } from '../../services/driveService';

export const EditResidentModal: React.FC = () => {
  const {
    editingResidente,
    setEditingResidente,
    isEditResidenteOpen,
    setIsEditResidenteOpen,
    actualizarResidente,
    activeSede
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'personales' | 'cuidado' | 'salud' | 'medicamentos' | 'archivos'>('personales');

  const [formData, setFormData] = useState<Partial<Residente>>({});
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);
  const [medicamentos, setMedicamentos] = useState<MedicamentoPrescrito[]>([]);
  const [nuevoMed, setNuevoMed] = useState<MedicamentoPrescrito>({
    medicamento: '',
    cantidad: '',
    frecuencia: '',
    fechaFin: '',
    indicaciones: ''
  });

  // Gestión de Archivos y Documentos
  const CLASES_ARCHIVOS: ClaseArchivoResidente[] = [
    'Historia Clínica / Epicrisis',
    'Exámenes / Laboratorios',
    'Fórmulas y Órdenes Médicas',
    'Documento de Identidad',
    'Consentimiento Informado',
    'Afiliación EPS / Seguro',
    'Otro / Soporte General'
  ];

  const [archivosExistentes, setArchivosExistentes] = useState<ArchivoAdjuntoResidente[]>([]);
  const [nuevosArchivos, setNuevosArchivos] = useState<
    Array<{
      id: string;
      file: File;
      nombreArchivo: string;
      claseArchivo: ClaseArchivoResidente;
      descripcion?: string;
      tamanoBytes: number;
      tipoMime: string;
    }>
  >([]);
  const [nuevoArchivoClase, setNuevoArchivoClase] = useState<ClaseArchivoResidente>('Historia Clínica / Epicrisis');
  const [nuevoArchivoDescripcion, setNuevoArchivoDescripcion] = useState<string>('');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingResidente) {
      setFormData({
        nombres: editingResidente.nombres,
        apellidos: editingResidente.apellidos,
        tipoIdentificacion: editingResidente.tipoIdentificacion,
        identificacion: limpiarIdentificacion(editingResidente.identificacion),
        fechaNacimiento: editingResidente.fechaNacimiento,
        genero: editingResidente.genero,
        habitacion: editingResidente.habitacion,
        cama: editingResidente.cama,
        eps: editingResidente.eps,
        planComplementario: editingResidente.planComplementario || '',
        tipoSangre: editingResidente.tipoSangre,
        nivelMovilidad: editingResidente.nivelMovilidad,
        tipoDieta: editingResidente.tipoDieta,
        alertasClinicas: editingResidente.alertasClinicas || '',
        estado: editingResidente.estado,
        fechaIngreso: editingResidente.fechaIngreso,
        fotoUrl: editingResidente.fotoUrl
      });
      setFotoPreview(editingResidente.fotoUrl);
      setMedicamentos(editingResidente.medicamentos ? [...editingResidente.medicamentos] : []);
      setArchivosExistentes(editingResidente.archivosAdjuntos ? [...editingResidente.archivosAdjuntos] : []);
      setNuevosArchivos([]);
      setArchivoSeleccionado(null);
      setNuevoArchivoDescripcion('');
      setNuevoArchivoClase('Historia Clínica / Epicrisis');
      setActiveTab('personales');
    }
  }, [editingResidente]);

  if (!isEditResidenteOpen || !editingResidente) return null;

  const handleClose = () => {
    setIsEditResidenteOpen(false);
    setEditingResidente(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAgregarMedicamento = () => {
    if (!nuevoMed.medicamento.trim() || !nuevoMed.cantidad.trim() || !nuevoMed.frecuencia.trim()) {
      alert('Por favor ingrese el nombre del medicamento, la cantidad/dosis y la frecuencia.');
      return;
    }
    setMedicamentos((prev) => [...prev, { ...nuevoMed }]);
    setNuevoMed({
      medicamento: '',
      cantidad: '',
      frecuencia: '',
      fechaFin: '',
      indicaciones: ''
    });
  };

  const handleEliminarMedicamento = (index: number) => {
    setMedicamentos((prev) => prev.filter((_, i) => i !== index));
  };

  // Manejo de Archivos
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setArchivoSeleccionado(f);
    }
  };

  const handleAgregarNuevoArchivo = () => {
    if (!archivoSeleccionado) {
      alert('Por favor seleccione un archivo desde su equipo.');
      return;
    }

    const idUnico = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setNuevosArchivos((prev) => [
      ...prev,
      {
        id: idUnico,
        file: archivoSeleccionado,
        nombreArchivo: archivoSeleccionado.name,
        claseArchivo: nuevoArchivoClase,
        descripcion: nuevoArchivoDescripcion.trim(),
        tamanoBytes: archivoSeleccionado.size,
        tipoMime: archivoSeleccionado.type
      }
    ]);

    setArchivoSeleccionado(null);
    setNuevoArchivoDescripcion('');
    const inputElem = document.getElementById('input-archivo-residente-edit') as HTMLInputElement;
    if (inputElem) inputElem.value = '';
  };

  const handleEliminarNuevoArchivo = (id: string) => {
    setNuevosArchivos((prev) => prev.filter((a) => a.id !== id));
  };

  const handleEliminarArchivoExistente = (id?: string | number, index?: number) => {
    setArchivosExistentes((prev) => prev.filter((a, i) => (id !== undefined ? a.id !== id : i !== index)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Subir los nuevos archivos si existen
      const todosLosNuevos = [...nuevosArchivos];
      if (archivoSeleccionado) {
        todosLosNuevos.push({
          id: `doc-${Date.now()}`,
          file: archivoSeleccionado,
          nombreArchivo: archivoSeleccionado.name,
          claseArchivo: nuevoArchivoClase,
          descripcion: nuevoArchivoDescripcion.trim(),
          tamanoBytes: archivoSeleccionado.size,
          tipoMime: archivoSeleccionado.type
        });
      }

      const archivosSubidos: ArchivoAdjuntoResidente[] = [];
      const identificacionRes = limpiarIdentificacion(formData.identificacion || editingResidente.identificacion);
      const nombreCompletoRes = `${formData.nombres || editingResidente.nombres} ${formData.apellidos || editingResidente.apellidos}`.trim();

      for (const arch of todosLosNuevos) {
        try {
          const resSubida = await subirArchivoResidente({
            file: arch.file,
            identificacion: identificacionRes,
            claseArchivo: arch.claseArchivo,
            descripcion: arch.descripcion,
            nombreCompleto: nombreCompletoRes,
            idCentro: editingResidente.idCentro || activeSede.id,
            nombreSede: activeSede?.nombre || 'Sede Central Bogotá'
          });

          archivosSubidos.push({
            id: arch.id,
            idArchivo: resSubida.idArchivo,
            idArchivoClinico: resSubida.idArchivo,
            nombreArchivo: arch.nombreArchivo,
            nombreAlmacenado: resSubida.nombreAlmacenado,
            claseArchivo: arch.claseArchivo,
            descripcion: arch.descripcion,
            tamanoBytes: arch.tamanoBytes,
            tipoMime: arch.tipoMime,
            hash: resSubida.hash,
            rutaRelativa: resSubida.rutaRelativa,
            rutaDrive: resSubida.rutaRelativa,
            driveUrl: resSubida.driveUrl,
            localUrl: resSubida.localUrl,
            url: resSubida.url || (resSubida.rutaRelativa ? `/${resSubida.rutaRelativa}` : resSubida.localUrl),
            fechaSubida: new Date().toISOString()
          });
        } catch (errSub) {
          console.warn('Carga de archivo en modo local:', errSub);
          const fallbackRuta = `Samanya/Residentes/${identificacionRes}/Documentos/${arch.nombreArchivo}`;
          archivosSubidos.push({
            id: arch.id,
            nombreArchivo: arch.nombreArchivo,
            claseArchivo: arch.claseArchivo,
            descripcion: arch.descripcion,
            tamanoBytes: arch.tamanoBytes,
            tipoMime: arch.tipoMime,
            rutaRelativa: fallbackRuta,
            url: URL.createObjectURL(arch.file),
            fechaSubida: new Date().toISOString()
          });
        }
      }

      const archivosFinales = [...archivosExistentes, ...archivosSubidos];

      await actualizarResidente(editingResidente.id, {
        ...formData,
        identificacion: identificacionRes,
        fotoUrl: fotoPreview,
        medicamentos,
        archivosAdjuntos: archivosFinales.length > 0 ? archivosFinales : undefined
      });

      handleClose();
    } catch (err) {
      console.error('[EditResidentModal] Error al actualizar residente:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalArchivos = archivosExistentes.length + nuevosArchivos.length + (archivoSeleccionado ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl lg:max-w-4xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B3803F]/30 flex items-center justify-center text-[#DCB87F] border border-[#DCB87F]/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Editar Información del Residente
              </h3>
              <p className="text-xs text-[#DCB87F]">
                {editingResidente.codigoExpediente} • {editingResidente.nombreCompleto} • {activeSede.nombre}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Pestañas (Tabs) */}
        <div className="flex border-b border-[#DEDBD1] bg-[#F7F6F2] px-6 py-2.5 text-xs font-semibold text-[#5C6058] overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('personales')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer shrink-0 transition-colors ${
              activeTab === 'personales' ? 'bg-[#274A3F] text-white font-bold shadow-2xs' : 'hover:text-[#182F28] hover:bg-white/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Datos Personales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cuidado')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer shrink-0 transition-colors ${
              activeTab === 'cuidado' ? 'bg-[#274A3F] text-white font-bold shadow-2xs' : 'hover:text-[#182F28] hover:bg-white/60'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>2. Cuidado & Dieta</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('salud')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer shrink-0 transition-colors ${
              activeTab === 'salud' ? 'bg-[#274A3F] text-white font-bold shadow-2xs' : 'hover:text-[#182F28] hover:bg-white/60'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>3. Salud & Alertas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('medicamentos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer shrink-0 transition-colors ${
              activeTab === 'medicamentos' ? 'bg-[#274A3F] text-white font-bold shadow-2xs' : 'hover:text-[#182F28] hover:bg-white/60'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>4. Farmacoterapia</span>
            {medicamentos.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'medicamentos' ? 'bg-[#DCB87F] text-[#182F28]' : 'bg-[#DFF3E7] text-[#1E7A4C]'
              }`}>
                {medicamentos.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('archivos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer shrink-0 transition-colors ${
              activeTab === 'archivos' ? 'bg-[#274A3F] text-white font-bold shadow-2xs' : 'hover:text-[#182F28] hover:bg-white/60'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>5. Documentos & Archivos</span>
            {totalArchivos > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'archivos' ? 'bg-[#DCB87F] text-[#182F28]' : 'bg-[#274A3F]/10 text-[#274A3F]'
              }`}>
                {totalArchivos}
              </span>
            )}
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DATOS PERSONALES */}
          {activeTab === 'personales' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Foto Opcional del Residente */}
              <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] flex items-center gap-4">
                <div className="relative">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt={editingResidente.nombreCompleto}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#B3803F] shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#182F28] text-[#DCB87F] border border-[#DCB87F]/40 font-serif font-bold text-xl flex items-center justify-center shrink-0 shadow-inner">
                      {obtenerIniciales(
                        formData.nombres || editingResidente.nombres,
                        formData.apellidos || editingResidente.apellidos,
                        editingResidente.nombreCompleto
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Foto del Residente <span className="text-[#7A745F] font-normal">(Opcional)</span>
                  </label>
                  <p className="text-[11px] text-[#7A745F] mb-2">
                    Actualice la foto de perfil o carné de identificación.
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-white hover:bg-[#ECE7DB] border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                      <Camera className="w-3.5 h-3.5 text-[#B3803F]" />
                      <span>{fotoPreview ? 'Cambiar Foto' : 'Seleccionar Archivo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {fotoPreview && (
                      <button
                        type="button"
                        onClick={() => setFotoPreview(undefined)}
                        className="px-2.5 py-1.5 text-xs text-[#A4453A] hover:bg-[#FBE8E6] rounded-xl transition-colors cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#B3803F]" />
                  Identificación y Datos Personales
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombres || ''}
                      onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.apellidos || ''}
                      onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#4B4636] mb-1">
                        Tipo Doc
                      </label>
                      <select
                        value={formData.tipoIdentificacion || 'CC'}
                        onChange={(e) => setFormData({ ...formData, tipoIdentificacion: e.target.value })}
                        className="w-full px-2 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                      >
                        <option value="CC">CC</option>
                        <option value="CE">CE</option>
                        <option value="TI">TI</option>
                        <option value="PAS">PAS</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-[#4B4636] mb-1">
                        Número Identificación *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.identificacion || ''}
                        onChange={(e) => setFormData({ ...formData, identificacion: limpiarIdentificacion(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#4B4636] mb-1">
                        Fecha Nacimiento
                      </label>
                      <input
                        type="date"
                        value={formData.fechaNacimiento || ''}
                        onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4B4636] mb-1">
                        Género
                      </label>
                      <select
                        value={formData.genero || 'F'}
                        onChange={(e) => setFormData({ ...formData, genero: e.target.value as 'M' | 'F' | 'OTRO' })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                      >
                        <option value="F">Femenino</option>
                        <option value="M">Masculino</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUIDADO & DIETA */}
          {activeTab === 'cuidado' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-[#B3803F]" />
                Habitación y Cuidados Asistenciales
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Habitación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.habitacion || ''}
                    onChange={(e) => setFormData({ ...formData, habitacion: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Cama Asignada *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cama || ''}
                    onChange={(e) => setFormData({ ...formData, cama: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#B3803F]" />
                    <span>Fecha de Ingreso *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaIngreso || ''}
                    onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Estado Administrativo
                  </label>
                  <select
                    value={formData.estado || 'Activo'}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  >
                    <option value="Activo">Activo</option>
                    <option value="En Observación">En Observación</option>
                    <option value="Hospitalizado">Hospitalizado</option>
                    <option value="Egresado">Egresado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Nivel de Movilidad
                  </label>
                  <select
                    value={formData.nivelMovilidad || 'Independiente'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nivelMovilidad: e.target.value as
                          | 'Independiente'
                          | 'Asistencia Leve'
                          | 'Asistencia Moderada'
                          | 'Dependiente Total'
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  >
                    <option value="Independiente">Independiente</option>
                    <option value="Asistencia Leve">Asistencia Leve</option>
                    <option value="Asistencia Moderada">Asistencia Moderada</option>
                    <option value="Dependiente Total">Dependiente Total</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Tipo de Dieta
                  </label>
                  <select
                    value={formData.tipoDieta || 'Normal / General'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoDieta: e.target.value as
                          | 'Normal / General'
                          | 'Blanda'
                          | 'Hiposódica'
                          | 'Diabética'
                          | 'Licuada / Papilla'
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  >
                    <option value="Normal / General">Normal / General</option>
                    <option value="Blanda">Blanda</option>
                    <option value="Hiposódica">Hiposódica</option>
                    <option value="Diabética">Diabética</option>
                    <option value="Licuada / Papilla">Licuada / Papilla</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SALUD & ALERTAS */}
          {activeTab === 'salud' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-[#B3803F]" />
                Cobertura de Salud y Alertas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    EPS
                  </label>
                  <input
                    type="text"
                    value={formData.eps || ''}
                    onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Plan Complementario
                  </label>
                  <input
                    type="text"
                    value={formData.planComplementario || ''}
                    onChange={(e) => setFormData({ ...formData, planComplementario: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Grupo Sanguíneo
                  </label>
                  <select
                    value={formData.tipoSangre || 'O+'}
                    onChange={(e) => setFormData({ ...formData, tipoSangre: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-[#4B4636] mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#B3803F]" />
                    <span>Alertas Clínicas y Alergias</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.alertasClinicas || ''}
                    onChange={(e) => setFormData({ ...formData, alertasClinicas: e.target.value })}
                    placeholder="Ej. Alergia a la penicilina, antecedentes de caídas, hipertenso controlado"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FARMACOTERAPIA */}
          {activeTab === 'medicamentos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-mono font-bold uppercase text-[#7A745F] tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-[#1E7A4C]" />
                <span>Farmacoterapia & Medicamentos Prescritos</span>
              </h4>

              <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#182F28] mb-1">
                      Medicamento
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Losartán 50mg, Enoxaparina..."
                      value={nuevoMed.medicamento}
                      onChange={(e) => setNuevoMed({ ...nuevoMed, medicamento: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#182F28] mb-1">
                      Cantidad / Dosis
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 1 tableta, 10 ml, 500 mg..."
                      value={nuevoMed.cantidad}
                      onChange={(e) => setNuevoMed({ ...nuevoMed, cantidad: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#182F28] mb-1">
                      Frecuencia
                    </label>
                    <input
                      type="text"
                      list="frecuencias-sugeridas-edit"
                      placeholder="Ej. Cada 8 horas, En el desayuno..."
                      value={nuevoMed.frecuencia}
                      onChange={(e) => setNuevoMed({ ...nuevoMed, frecuencia: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                    />
                    <datalist id="frecuencias-sugeridas-edit">
                      <option value="Cada 8 horas" />
                      <option value="Cada 12 horas" />
                      <option value="Cada 24 horas (Mañana)" />
                      <option value="Cada 24 horas (Noche)" />
                      <option value="Con el desayuno" />
                      <option value="Antes de dormir" />
                      <option value="Según necesidad / SOS" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#182F28] mb-1">
                      Hasta qué fecha <span className="text-[#7A745F] font-normal">(Vacío = Continuo)</span>
                    </label>
                    <input
                      type="date"
                      value={nuevoMed.fechaFin}
                      onChange={(e) => setNuevoMed({ ...nuevoMed, fechaFin: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Indicaciones Especiales <span className="text-[#7A745F] font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Tomar en ayunas con abundante agua..."
                    value={nuevoMed.indicaciones}
                    onChange={(e) => setNuevoMed({ ...nuevoMed, indicaciones: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAgregarMedicamento}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Medicamento</span>
                  </button>
                </div>
              </div>

              {/* Lista actual de medicamentos */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-[#7A745F]">
                  Medicamentos Prescritos ({medicamentos.length})
                </span>

                {medicamentos.length === 0 ? (
                  <div className="p-3 bg-[#F7F6F2] rounded-xl text-center text-xs text-[#7A745F]">
                    No tiene medicamentos prescritos registrados.
                  </div>
                ) : (
                  medicamentos.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-[#DEDBD1] flex items-center justify-between gap-3 shadow-2xs hover:border-[#1E7A4C]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#DFF3E7] text-[#1E7A4C] flex items-center justify-center shrink-0">
                          <Pill className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#182F28] flex items-center gap-2">
                            <span>{m.medicamento}</span>
                            <span className="text-[10px] bg-[#FEF7EE] text-[#9A5B12] px-1.5 py-0.5 rounded font-medium border border-[#DCB87F]/30">
                              Dosis: {m.cantidad}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5C6058] flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#068591]" />
                              {m.frecuencia}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#B3803F]" />
                              Hasta: {m.fechaFin ? m.fechaFin : 'Continuo'}
                            </span>
                          </div>
                          {m.indicaciones && (
                            <div className="text-[10px] text-[#7A745F] italic mt-0.5">
                              {m.indicaciones}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEliminarMedicamento(idx)}
                        className="w-7 h-7 rounded-lg bg-[#FBE8E6] text-[#A4453A] hover:bg-[#f7d6d3] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Eliminar medicamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTOS & ARCHIVOS */}
          {activeTab === 'archivos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-[#F2F7F4] border border-[#274A3F]/20 rounded-2xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#274A3F] text-white shrink-0 mt-0.5">
                  <Paperclip className="w-5 h-5 text-[#DCB87F]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#182F28]">
                    Expediente Digital y Archivos Adjuntos
                  </h4>
                  <p className="text-xs text-[#5C6058] mt-0.5 leading-relaxed">
                    Puede adjuntar o retirar documentos del residente (Historia clínica, epicrisis, exámenes médicos, documentos de identidad, consentimientos, etc.). 
                    Al seleccionar un archivo se le solicitará indicar la <strong className="text-[#274A3F]">clase de archivo</strong> correspondiente.
                  </p>
                </div>
              </div>

              {/* Formulario para Adjuntar Nuevo Archivo */}
              <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-3">
                <h5 className="text-xs font-bold text-[#182F28] flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <FilePlus className="w-4 h-4 text-[#B3803F]" />
                  <span>Subir Nuevo Documento</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#182F28] mb-1">
                      Seleccionar Archivo (PDF, JPG, PNG, DOCX)
                    </label>
                    <input
                      id="input-archivo-residente-edit"
                      type="file"
                      accept=".pdf,image/*,.doc,.docx"
                      onChange={handleFileSelected}
                      className="w-full text-xs text-[#5C6058] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border file:border-[#DEDBD1] file:text-xs file:font-bold file:bg-white file:text-[#182F28] hover:file:bg-[#ECE7DB] file:cursor-pointer cursor-pointer border border-[#DEDBD1] rounded-xl p-1 bg-white"
                    />
                    {archivoSeleccionado && (
                      <span className="text-[11px] text-[#274A3F] font-semibold mt-1 block">
                        ✓ Seleccionado: {archivoSeleccionado.name} ({(archivoSeleccionado.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#182F28] mb-1">
                      Clase de Archivo *
                    </label>
                    <select
                      value={nuevoArchivoClase}
                      onChange={(e) => setNuevoArchivoClase(e.target.value as ClaseArchivoResidente)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                    >
                      {CLASES_ARCHIVOS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Título o Descripción del Documento <span className="text-[#7A745F] font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Epicrisis reciente de hospitalización, Exámenes de sangre, Consentimiento firmado..."
                    value={nuevoArchivoDescripcion}
                    onChange={(e) => setNuevoArchivoDescripcion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAgregarNuevoArchivo}
                    disabled={!archivoSeleccionado}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar a la Lista</span>
                  </button>
                </div>
              </div>

              {/* Lista de Documentos: Existentes y Pendientes de Guardar */}
              <div className="space-y-3">
                {/* Nuevos por Guardar */}
                {nuevosArchivos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase text-[#274A3F] flex items-center gap-1.5">
                      <span>Nuevos Archivos por Subir ({nuevosArchivos.length})</span>
                    </span>
                    {nuevosArchivos.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 bg-[#F2F7F4] rounded-xl border border-[#274A3F]/30 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#274A3F]/30 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-[#274A3F]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#182F28] truncate max-w-[220px]">
                                {a.nombreArchivo}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#274A3F] text-white">
                                {a.claseArchivo}
                              </span>
                              <span className="text-[10px] text-[#7A745F]">
                                ({(a.tamanoBytes / 1024).toFixed(1)} KB)
                              </span>
                              <span className="text-[10px] text-[#B3803F] font-bold">
                                • Pendiente de guardar
                              </span>
                            </div>
                            {a.descripcion && (
                              <p className="text-[11px] text-[#5C6058] truncate mt-0.5">
                                {a.descripcion}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEliminarNuevoArchivo(a.id)}
                          className="p-1.5 hover:bg-[#FBE8E6] text-[#A4453A] rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Quitar de la lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Archivos Existentes */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#7A745F]">
                    Archivos Registrados en el Expediente ({archivosExistentes.length})
                  </span>

                  {archivosExistentes.length === 0 ? (
                    <div className="p-4 bg-[#F7F6F2] rounded-xl text-center text-xs text-[#7A745F]">
                      El residente no tiene archivos registrados previamente.
                    </div>
                  ) : (
                    archivosExistentes.map((a, idx) => (
                      <div
                        key={a.id || idx}
                        className="p-3 bg-white rounded-xl border border-[#DEDBD1] flex items-center justify-between gap-3 shadow-2xs hover:border-[#274A3F]/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#F7F6F2] border border-[#DEDBD1] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-[#274A3F]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#182F28] truncate max-w-[220px]">
                                {a.nombreArchivo}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#274A3F]/10 text-[#274A3F] border border-[#274A3F]/20">
                                {a.claseArchivo}
                              </span>
                              {a.tamanoBytes && (
                                <span className="text-[10px] text-[#7A745F]">
                                  ({(a.tamanoBytes / 1024).toFixed(1)} KB)
                                </span>
                              )}
                            </div>
                            {a.descripcion && (
                              <p className="text-[11px] text-[#5C6058] truncate mt-0.5">
                                {a.descripcion}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {a.url && (
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-[#F7F6F2] hover:bg-[#ECE7DB] border border-[#DEDBD1] rounded-lg text-[#274A3F] transition-colors flex items-center gap-1 text-[11px] font-bold"
                              title="Abrir documento"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Ver</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEliminarArchivoExistente(a.id, idx)}
                            className="p-1.5 hover:bg-[#FBE8E6] text-[#A4453A] rounded-lg transition-colors cursor-pointer"
                            title="Eliminar archivo del residente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-[#DEDBD1] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-[#7A745F] hover:text-[#182F28] rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando en Base de Datos...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
