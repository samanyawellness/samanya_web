import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  User,
  HeartHandshake,
  Activity,
  ShieldAlert,
  FileCheck2,
  Save,
  Printer,
  Calendar,
  Building2,
  Clock,
  Heart,
  Scale,
  Thermometer,
  Wind,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Eye,
  Eraser,
  Sparkles,
  HelpCircle,
  Stethoscope,
  Info,
  BadgeCheck
} from 'lucide-react';
import { ResidentAvatar } from '../common/ResidentAvatar';
import {
  ValoracionIngreso,
  SignosVitalesIngreso,
  DatosGenograma,
  NodoGenograma,
  Residente
} from '../../types';

type FichaTab = 'historia' | 'genograma' | 'multidimensional' | 'riesgos' | 'formalizacion';

export const FichaTecnicaIngresoModal: React.FC = () => {
  const {
    isFichaIngresoOpen,
    cerrarFichaIngreso,
    selectedResidenteParaFicha,
    activeSede,
    currentUser,
    estadosCiviles,
    guardarFichaIngreso,
    cargarFichaIngreso,
    familiares
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<FichaTab>('historia');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Estado principal de la ficha técnica
  const [idFicha, setIdFicha] = useState<number | undefined>(undefined);
  const [codigoFicha, setCodigoFicha] = useState('');
  const [fechaValoracion, setFechaValoracion] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Evaluador
  const [nombreEvaluador, setNombreEvaluador] = useState(
    currentUser?.nombreCompleto || 'Equipo Interdisciplinario Samanya'
  );
  const [cargoEvaluador, setCargoEvaluador] = useState('Director(a) de Cuidados');

  // Pestaña 1: Datos Personales & Historia de Vida
  const [lugarNacimiento, setLugarNacimiento] = useState('');
  const [lugarCrecimiento, setLugarCrecimiento] = useState('');
  const [idEstadoCivil, setIdEstadoCivil] = useState<number>(1);
  const [ocupacionHistorica, setOcupacionHistorica] = useState('');
  const [nivelEducativo, setNivelEducativo] = useState('Secundaria');
  const [religionCreencia, setReligionCreencia] = useState('Católica');
  const [acontecimientosImportantes, setAcontecimientosImportantes] = useState('');
  const [perdidasDuelosSignificativos, setPerdidasDuelosSignificativos] = useState('');
  const [costumbresTradiciones, setCostumbresTradiciones] = useState('');
  const [gustosPasatiemposMusica, setGustosPasatiemposMusica] = useState('');
  const [aspectosTranquilidad, setAspectosTranquilidad] = useState('');
  const [aspectosTemorIncomodidad, setAspectosTemorIncomodidad] = useState('');
  const [rasgosPersonalidad, setRasgosPersonalidad] = useState('');
  const [rutinasHabitosDiarios, setRutinasHabitosDiarios] = useState('');
  const [motivoIngreso, setMotivoIngreso] = useState('');
  const [expectativasIngreso, setExpectativasIngreso] = useState('');
  const [disposicionAdaptacion, setDisposicionAdaptacion] = useState<
    'Muy Favorable' | 'Favorable' | 'Reservada' | 'Reticente / Oposición'
  >('Favorable');

  // Pestaña 2: Genograma y Red Familiar
  const [nodosGenograma, setNodosGenograma] = useState<NodoGenograma[]>([]);
  const [observacionesDinamica, setObservacionesDinamica] = useState('');
  const [situacionesRelevantes, setSituacionesRelevantes] = useState('');
  const [redApoyoNoFamiliar, setRedApoyoNoFamiliar] = useState('');

  // Modal para agregar miembro al genograma
  const [mostrarModalNodo, setMostrarModalNodo] = useState(false);
  const [nuevoNodo, setNuevoNodo] = useState<NodoGenograma>({
    id: '',
    nombre: '',
    parentesco: 'Hijo / Hija',
    genero: 'M',
    edad: 45,
    fallecido: false,
    esCercaniaAfectiva: false,
    asumeCuidado: false,
    relacionConResidente: 'Muy Buena',
    notas: ''
  });

  // Pestaña 3: Valoración Multidimensional & Signos Vitales
  const [estadoGeneralIngreso, setEstadoGeneralIngreso] = useState('');
  const [signosVitales, setSignosVitales] = useState<SignosVitalesIngreso>({
    tensionArterialSistolica: 120,
    tensionArterialDiastolica: 80,
    frecuenciaCardiaca: 72,
    frecuenciaRespiratoria: 18,
    temperatura: 36.5,
    saturacionOxigeno: 95,
    pesoKg: 65,
    tallaCm: 162,
    glucometria: 98,
    observacionesSignos: ''
  });

  const [cognitivoOrientacion, setCognitivoOrientacion] = useState('');
  const [emocionalConductual, setEmocionalConductual] = useState('');
  const [movilidadFuncional, setMovilidadFuncional] = useState('');
  const [nutricionAlimentacion, setNutricionAlimentacion] = useState('');
  const [eliminacionContinencia, setEliminacionContinencia] = useState('');
  const [higieneAutocuidado, setHigieneAutocuidado] = useState('');
  const [patronSueno, setPatronSueno] = useState('');
  const [terapiasApoyosExternos, setTerapiasApoyosExternos] = useState('');
  const [ayudasTecnicas, setAyudasTecnicas] = useState('');

  // Pestaña 4: Matriz de Riesgos
  const [riesgoCaidas, setRiesgoCaidas] = useState<'BAJO' | 'MEDIO' | 'ALTO'>('BAJO');
  const [riesgoUlcerasPresion, setRiesgoUlcerasPresion] = useState<'BAJO' | 'MEDIO' | 'ALTO'>('BAJO');
  const [riesgoFuga, setRiesgoFuga] = useState<'BAJO' | 'MEDIO' | 'ALTO'>('BAJO');
  const [riesgoBroncoaspiracion, setRiesgoBroncoaspiracion] = useState<'BAJO' | 'MEDIO' | 'ALTO'>('BAJO');
  const [gradoDependenciaGlobal, setGradoDependenciaGlobal] = useState<
    'INDEPENDIENTE' | 'DEPENDENCIA_LEVE' | 'DEPENDENCIA_MODERADA' | 'DEPENDENCIA_SEVERA' | 'DEPENDENCIA_TOTAL'
  >('INDEPENDIENTE');
  const [condicionesFisicasPiel, setCondicionesFisicasPiel] = useState('');

  // Pestaña 5: Concepto, Formalización y Firmas
  const [conceptoGeneralIngreso, setConceptoGeneralIngreso] = useState('');
  const [recomendacionesPlanCuidados, setRecomendacionesPlanCuidados] = useState('');
  const [nombreEntregaResponsable, setNombreEntregaResponsable] = useState('');
  const [identificacionEntrega, setIdentificacionEntrega] = useState('');
  const [parentescoEntrega, setParentescoEntrega] = useState('Hijo(a)');
  const [telefonoEntrega, setTelefonoEntrega] = useState('');
  const [aceptacionTerminos, setAceptacionTerminos] = useState<'S' | 'N'>('S');

  // Canvas de firma digital
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [firmaGuardada, setFirmaGuardada] = useState<string>('');
  const [modoNuevaFirma, setModoNuevaFirma] = useState<boolean>(false);

  // Cálculo reactivo del IMC y su clasificación clínica
  const calculoImc = useMemo(() => {
    const peso = Number(signosVitales.pesoKg) || 0;
    const tallaM = (Number(signosVitales.tallaCm) || 0) / 100;
    if (peso > 0 && tallaM > 0.5) {
      const imcVal = Number((peso / (tallaM * tallaM)).toFixed(1));
      let categoria = 'Normal';
      let color = 'text-emerald-700 bg-emerald-50 border-emerald-300';
      if (imcVal < 18.5) {
        categoria = 'Bajo Peso / Desnutrición';
        color = 'text-amber-700 bg-amber-50 border-amber-300';
      } else if (imcVal >= 25 && imcVal < 30) {
        categoria = 'Sobrepeso';
        color = 'text-orange-700 bg-orange-50 border-orange-300';
      } else if (imcVal >= 30) {
        categoria = 'Obesidad';
        color = 'text-rose-700 bg-rose-50 border-rose-300';
      }
      return { valor: imcVal, categoria, color };
    }
    return { valor: 0, categoria: 'Pendiente', color: 'text-gray-500 bg-gray-50 border-gray-200' };
  }, [signosVitales.pesoKg, signosVitales.tallaCm]);

  // Carga inicial de datos de la valoración de ingreso desde Oracle
  useEffect(() => {
    if (!isFichaIngresoOpen || !selectedResidenteParaFicha) return;

    const res = selectedResidenteParaFicha;
    // Precargar datos existentes del residente
    setLugarNacimiento(res.lugarNacimiento || '');
    if (res.idEstadoCivil) setIdEstadoCivil(res.idEstadoCivil);
    setOcupacionHistorica(res.ocupacionHistorica || '');
    setNivelEducativo(res.nivelEducativo || 'Secundaria');
    setReligionCreencia(res.religionCreencia || 'Católica');

    // Precargar datos del acudiente principal si existe
    const mainAcu = res.acudientes?.find((a) => a.esPrincipal) || res.acudientes?.[0];
    if (mainAcu) {
      setNombreEntregaResponsable(mainAcu.nombreCompleto);
      setParentescoEntrega(mainAcu.parentesco);
      setTelefonoEntrega(mainAcu.telefono);
    }

    // Inicializar nodos genograma con el residente como nodo central
    const nodosBase: NodoGenograma[] = [
      {
        id: `res-${res.id}`,
        nombre: res.nombreCompleto,
        parentesco: 'Residente (Focal)',
        genero: res.genero === 'F' ? 'F' : 'M',
        edad: res.edad,
        fallecido: false,
        esCercaniaAfectiva: true,
        asumeCuidado: false,
        relacionConResidente: 'Muy Buena'
      }
    ];

    if (res.acudientes && res.acudientes.length > 0) {
      res.acudientes.forEach((acu, idx) => {
        nodosBase.push({
          id: `acu-${acu.id || idx}`,
          nombre: acu.nombreCompleto,
          parentesco: acu.parentesco || 'Familiar',
          genero: acu.parentesco.toLowerCase().includes('hija') || acu.parentesco.toLowerCase().includes('esposa') ? 'F' : 'M',
          fallecido: false,
          esCercaniaAfectiva: acu.esCercaniaAfectiva ?? acu.esPrincipal,
          asumeCuidado: acu.asumeAcompanamiento ?? acu.esPrincipal,
          relacionConResidente: 'Muy Buena',
          notas: `Tel: ${acu.telefono} - Frecuencia: ${acu.frecuenciaContacto || 'Semanal'}`
        });
      });
    }
    setNodosGenograma(nodosBase);

    // Consultar valoración previa en Oracle
    setCargando(true);
    cargarFichaIngreso(res.id)
      .then((data) => {
        if (data && data.id) {
          setIdFicha(data.id);
          setCodigoFicha(data.codigo_ficha || data.codigoFicha || '');
          if (data.fecha_valoracion) setFechaValoracion(String(data.fecha_valoracion).slice(0, 10));
          if (data.nombre_evaluador) setNombreEvaluador(data.nombre_evaluador);
          if (data.cargo_evaluador) setCargoEvaluador(data.cargo_evaluador);
          if (data.lugar_crecimiento) setLugarCrecimiento(data.lugar_crecimiento);
          if (data.acontecimientos_importantes) setAcontecimientosImportantes(data.acontecimientos_importantes);
          if (data.perdidas_duelos_significativos) setPerdidasDuelosSignificativos(data.perdidas_duelos_significativos);
          if (data.costumbres_tradiciones) setCostumbresTradiciones(data.costumbres_tradiciones);
          if (data.gustos_pasatiempos_musica) setGustosPasatiemposMusica(data.gustos_pasatiempos_musica);
          if (data.aspectos_tranquilidad) setAspectosTranquilidad(data.aspectos_tranquilidad);
          if (data.aspectos_temor_incomodidad) setAspectosTemorIncomodidad(data.aspectos_temor_incomodidad);
          if (data.rasgos_personalidad) setRasgosPersonalidad(data.rasgos_personalidad);
          if (data.rutinas_habitos_diarios) setRutinasHabitosDiarios(data.rutinas_habitos_diarios);
          if (data.motivo_ingreso) setMotivoIngreso(data.motivo_ingreso);
          if (data.expectativas_ingreso) setExpectativasIngreso(data.expectativas_ingreso);
          if (data.disposicion_adaptacion) setDisposicionAdaptacion(data.disposicion_adaptacion);
          if (data.estado_general_ingreso) setEstadoGeneralIngreso(data.estado_general_ingreso);

          // Signos vitales JSON
          if (data.signos_vitales_json) {
            try {
              const sv = typeof data.signos_vitales_json === 'string'
                ? JSON.parse(data.signos_vitales_json)
                : data.signos_vitales_json;
              setSignosVitales((prev) => ({ ...prev, ...sv }));
            } catch (e) {
              console.warn('Error al parsear signos vitales:', e);
            }
          }

          if (data.cognitivo_orientacion) setCognitivoOrientacion(data.cognitivo_orientacion);
          if (data.emocional_conductual) setEmocionalConductual(data.emocional_conductual);
          if (data.movilidad_funcional) setMovilidadFuncional(data.movilidad_funcional);
          if (data.nutricion_alimentacion) setNutricionAlimentacion(data.nutricion_alimentacion);
          if (data.eliminacion_continencia) setEliminacionContinencia(data.eliminacion_continencia);
          if (data.higiene_autocuidado) setHigieneAutocuidado(data.higiene_autocuidado);
          if (data.patron_sueno) setPatronSueno(data.patron_sueno);
          if (data.terapias_apoyos_externos) setTerapiasApoyosExternos(data.terapias_apoyos_externos);
          if (data.ayudas_tecnicas) setAyudasTecnicas(data.ayudas_tecnicas);

          // Riesgos
          if (data.riesgo_caidas) setRiesgoCaidas(data.riesgo_caidas);
          if (data.riesgo_ulceras_presion) setRiesgoUlcerasPresion(data.riesgo_ulceras_presion);
          if (data.riesgo_fuga) setRiesgoFuga(data.riesgo_fuga);
          if (data.riesgo_broncoaspiracion) setRiesgoBroncoaspiracion(data.riesgo_broncoaspiracion);
          if (data.grado_dependencia_global) setGradoDependenciaGlobal(data.grado_dependencia_global);
          if (data.condiciones_fisicas_piel) setCondicionesFisicasPiel(data.condiciones_fisicas_piel);

          // Genograma y red
          if (data.red_apoyo_no_familiar) setRedApoyoNoFamiliar(data.red_apoyo_no_familiar);
          if (data.datos_genograma_json) {
            try {
              const dg = typeof data.datos_genograma_json === 'string'
                ? JSON.parse(data.datos_genograma_json)
                : data.datos_genograma_json;
              if (Array.isArray(dg.nodos) && dg.nodos.length > 0) {
                setNodosGenograma(dg.nodos);
              }
              if (dg.observacionesDinamicaFamiliar) setObservacionesDinamica(dg.observacionesDinamicaFamiliar);
              if (dg.situacionesRelevantes) setSituacionesRelevantes(dg.situacionesRelevantes);
            } catch (e) {
              console.warn('Error al parsear datos de genograma:', e);
            }
          }

          // Concepto y formalización
          if (data.concepto_general_ingreso) setConceptoGeneralIngreso(data.concepto_general_ingreso);
          if (data.recomendaciones_plan_cuidados) setRecomendacionesPlanCuidados(data.recomendaciones_plan_cuidados);
          if (data.nombre_entrega_responsable) setNombreEntregaResponsable(data.nombre_entrega_responsable);
          if (data.identificacion_entrega) setIdentificacionEntrega(data.identificacion_entrega);
          if (data.parentesco_entrega) setParentescoEntrega(data.parentesco_entrega);
          if (data.telefono_entrega) setTelefonoEntrega(data.telefono_entrega);
          if (data.aceptacion_terminos) setAceptacionTerminos(data.aceptacion_terminos);

          // Carga y restauración de la firma digital guardada
          let firmaRecuperada = data.firma_entrega_base64 || data.firmaEntregaBase64 || '';
          if (!firmaRecuperada && data.datos_genograma_json) {
            try {
              const parsedDg = typeof data.datos_genograma_json === 'string'
                ? JSON.parse(data.datos_genograma_json)
                : data.datos_genograma_json;
              if (parsedDg?.firmaEntregaBase64) {
                firmaRecuperada = parsedDg.firmaEntregaBase64;
              }
            } catch (e) {
              console.warn('Error al extraer firma de genograma JSON:', e);
            }
          }

          if (firmaRecuperada && typeof firmaRecuperada === 'string' && firmaRecuperada.length > 30) {
            setFirmaGuardada(firmaRecuperada);
            setHasSignature(true);
            setModoNuevaFirma(false);
          } else {
            setFirmaGuardada('');
            setHasSignature(false);
            setModoNuevaFirma(false);
          }
        }
      })
      .finally(() => setCargando(false));
  }, [isFichaIngresoOpen, selectedResidenteParaFicha]);

  // Manejo del canvas de firma
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#182F28';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Agregar un familiar o nodo al genograma
  const handleAgregarNodoGenograma = () => {
    if (!nuevoNodo.nombre.trim()) return;
    const idGenerado = `nodo-${Date.now()}`;
    setNodosGenograma((prev) => [...prev, { ...nuevoNodo, id: idGenerado }]);
    setNuevoNodo({
      id: '',
      nombre: '',
      parentesco: 'Hijo / Hija',
      genero: 'M',
      edad: 45,
      fallecido: false,
      esCercaniaAfectiva: false,
      asumeCuidado: false,
      relacionConResidente: 'Muy Buena',
      notas: ''
    });
    setMostrarModalNodo(false);
  };

  const handleEliminarNodo = (id: string) => {
    setNodosGenograma((prev) => prev.filter((n) => n.id !== id));
  };

  // Guardar la valoración integral completa en Oracle
  const handleGuardarFicha = async () => {
    if (!selectedResidenteParaFicha) return;
    setGuardando(true);

    let firmaBase64 = '';
    if (modoNuevaFirma && canvasRef.current && hasSignature) {
      try {
        firmaBase64 = canvasRef.current.toDataURL('image/png');
      } catch (e) {
        console.warn('No se pudo exportar firma en canvas:', e);
      }
    } else if (firmaGuardada) {
      firmaBase64 = firmaGuardada;
    } else if (canvasRef.current && hasSignature) {
      try {
        firmaBase64 = canvasRef.current.toDataURL('image/png');
      } catch (e) {
        console.warn('No se pudo exportar firma en canvas:', e);
      }
    }

    const payload: Record<string, any> = {
      id: idFicha,
      idResidente: selectedResidenteParaFicha.id,
      idCentro: selectedResidenteParaFicha.idCentro || activeSede.id,
      idUsuarioEvaluador: currentUser?.id || 1,
      nombreEvaluador: nombreEvaluador.trim(),
      cargoEvaluador: cargoEvaluador.trim(),

      // Datos Biográficos del Residente
      lugarNacimiento: lugarNacimiento.trim(),
      idEstadoCivil: idEstadoCivil,
      ocupacionHistorica: ocupacionHistorica.trim(),
      nivelEducativo: nivelEducativo.trim(),
      religionCreencia: religionCreencia.trim(),

      // Historia Personal y Vida
      lugarCrecimiento: lugarCrecimiento.trim(),
      acontecimientosImportantes: acontecimientosImportantes.trim(),
      perdidasDuelosSignificativos: perdidasDuelosSignificativos.trim(),
      costumbresTradiciones: costumbresTradiciones.trim(),
      gustosPasatiemposMusica: gustosPasatiemposMusica.trim(),
      aspectosTranquilidad: aspectosTranquilidad.trim(),
      aspectosTemorIncomodidad: aspectosTemorIncomodidad.trim(),
      rasgosPersonalidad: rasgosPersonalidad.trim(),
      rutinasHabitosDiarios: rutinasHabitosDiarios.trim(),

      // Ingreso y Adaptación
      motivoIngreso: motivoIngreso.trim(),
      expectativasIngreso: expectativasIngreso.trim(),
      disposicionAdaptacion: disposicionAdaptacion,

      // Valoración Multidimensional
      estadoGeneralIngreso: estadoGeneralIngreso.trim(),
      signosVitalesJson: JSON.stringify({
        ...signosVitales,
        imc: calculoImc.valor,
        clasificacionImc: calculoImc.categoria
      }),
      cognitivoOrientacion: cognitivoOrientacion.trim(),
      emocionalConductual: emocionalConductual.trim(),
      movilidadFuncional: movilidadFuncional.trim(),
      nutricionAlimentacion: nutricionAlimentacion.trim(),
      eliminacionContinencia: eliminacionContinencia.trim(),
      higieneAutocuidado: higieneAutocuidado.trim(),
      patronSueno: patronSueno.trim(),
      terapiasApoyosExternos: terapiasApoyosExternos.trim(),
      ayudasTecnicas: ayudasTecnicas.trim(),

      // Matriz de Riesgos
      riesgoCaidas: riesgoCaidas,
      riesgoUlcerasPresion: riesgoUlcerasPresion,
      riesgoFuga: riesgoFuga,
      riesgoBroncoaspiracion: riesgoBroncoaspiracion,
      gradoDependenciaGlobal: gradoDependenciaGlobal,
      condicionesFisicasPiel: condicionesFisicasPiel.trim(),

      // Red Familiar y Genograma
      redApoyoNoFamiliar: redApoyoNoFamiliar.trim(),
      datosGenogramaJson: JSON.stringify({
        nodos: nodosGenograma,
        observacionesDinamicaFamiliar: observacionesDinamica.trim(),
        situacionesRelevantes: situacionesRelevantes.trim(),
        firmaEntregaBase64: firmaBase64
      }),

      // Concepto y Cuidados
      conceptoGeneralIngreso: conceptoGeneralIngreso.trim(),
      recomendacionesPlanCuidados: recomendacionesPlanCuidados.trim(),

      // Formalización y Entrega
      nombreEntregaResponsable: nombreEntregaResponsable.trim(),
      identificacionEntrega: identificacionEntrega.trim(),
      parentescoEntrega: parentescoEntrega.trim(),
      telefonoEntrega: telefonoEntrega.trim(),
      aceptacionTerminos: aceptacionTerminos,
      firmaEntregaBase64: firmaBase64
    };

    try {
      await guardarFichaIngreso(payload);
      if (firmaBase64) {
        setFirmaGuardada(firmaBase64);
        setModoNuevaFirma(false);
        setHasSignature(true);
      }
    } finally {
      setGuardando(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isFichaIngresoOpen || !selectedResidenteParaFicha) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF9F5] w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl flex flex-col border border-[#DEDBD1] overflow-hidden">
        
        {/* Cabecera Principal del Modal */}
        <div className="bg-gradient-to-r from-[#182F28] via-[#224239] to-[#182F28] text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3.5">
            <ResidentAvatar
              fotoUrl={selectedResidenteParaFicha.fotoUrl}
              nombres={selectedResidenteParaFicha.nombres}
              apellidos={selectedResidenteParaFicha.apellidos}
              nombreCompleto={selectedResidenteParaFicha.nombreCompleto}
              sizeClass="w-12 h-12"
              roundedClass="rounded-2xl"
              textClass="text-base"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#DCB87F]/20 text-[#DCB87F] border border-[#DCB87F]/40 font-bold">
                  {codigoFicha || 'Ficha Técnica Oficial'}
                </span>
                <span className="text-xs text-[#DCB87F]">
                  Sede: {activeSede.nombre}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-white leading-tight">
                {selectedResidenteParaFicha.nombreCompleto}
              </h3>
              <p className="text-xs text-white/70">
                {selectedResidenteParaFicha.codigoExpediente} • {selectedResidenteParaFicha.edad} años • Hab. {selectedResidenteParaFicha.habitacion} (Cama {selectedResidenteParaFicha.cama})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#DCB87F] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
              title="Imprimir Ficha Técnica de Ingreso"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Ficha</span>
            </button>

            <button
              type="button"
              onClick={handleGuardarFicha}
              disabled={guardando}
              className="px-4 py-1.5 rounded-xl bg-[#B3803F] hover:bg-[#9a6c31] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{guardando ? 'Guardando...' : 'Guardar Ficha'}</span>
            </button>

            <button
              type="button"
              onClick={cerrarFichaIngreso}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Pestañas (5 Secciones Obligatorias) */}
        <div className="bg-white border-b border-[#DEDBD1] px-2 sm:px-4 grid grid-cols-5 gap-1 shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('historia')}
            className={`py-3 px-1 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer text-center ${
              activeTab === 'historia'
                ? 'border-[#182F28] text-[#182F28] bg-[#F7F6F2] rounded-t-lg'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
            }`}
          >
            <User className="w-4 h-4 text-[#B3803F] shrink-0" />
            <span className="truncate">1. Historia & Vida</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('genograma')}
            className={`py-3 px-1 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer text-center ${
              activeTab === 'genograma'
                ? 'border-[#182F28] text-[#182F28] bg-[#F7F6F2] rounded-t-lg'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-[#068591] shrink-0" />
            <span className="truncate">2. Red Familiar</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
              {nodosGenograma.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('multidimensional')}
            className={`py-3 px-1 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer text-center ${
              activeTab === 'multidimensional'
                ? 'border-[#182F28] text-[#182F28] bg-[#F7F6F2] rounded-t-lg'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
            }`}
          >
            <Activity className="w-4 h-4 text-[#E65100] shrink-0" />
            <span className="truncate">3. Multidimensional</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riesgos')}
            className={`py-3 px-1 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer text-center ${
              activeTab === 'riesgos'
                ? 'border-[#182F28] text-[#182F28] bg-[#F7F6F2] rounded-t-lg'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#C2185B] shrink-0" />
            <span className="truncate">4. Riesgos & Cuidados</span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                riesgoCaidas === 'ALTO' || riesgoUlcerasPresion === 'ALTO'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {riesgoCaidas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formalizacion')}
            className={`py-3 px-1 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer text-center ${
              activeTab === 'formalizacion'
                ? 'border-[#182F28] text-[#182F28] bg-[#F7F6F2] rounded-t-lg'
                : 'border-transparent text-[#7A745F] hover:text-[#182F28]'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span className="truncate">5. Concepto & Firmas</span>
            {hasSignature && (
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
          </button>
        </div>

        {/* Cuerpo del Formulario con Scroll Interno */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ======================================================== */}
          {/* PESTAÑA 1: IDENTIFICACIÓN & HISTORIA DE VIDA            */}
          {/* ======================================================== */}
          {activeTab === 'historia' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Bloque Profesional Evaluador */}
              <div className="p-4 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#7A745F] uppercase mb-1">
                    Profesional Evaluador(a)
                  </label>
                  <input
                    type="text"
                    value={nombreEvaluador}
                    onChange={(e) => setNombreEvaluador(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#7A745F] uppercase mb-1">
                    Cargo / Especialidad
                  </label>
                  <input
                    type="text"
                    value={cargoEvaluador}
                    onChange={(e) => setCargoEvaluador(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#7A745F] uppercase mb-1">
                    Fecha de la Valoración
                  </label>
                  <input
                    type="date"
                    value={fechaValoracion}
                    onChange={(e) => setFechaValoracion(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                  />
                </div>
              </div>

              {/* Bloque Datos Biográficos del Adulto Mayor */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#DEDBD1] pb-2">
                  <User className="w-4 h-4 text-[#B3803F]" />
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Historia Personal, Biográfica y Civil
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Lugar de Nacimiento
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Sonsón, Antioquia"
                      value={lugarNacimiento}
                      onChange={(e) => setLugarNacimiento(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Lugar donde creció
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Medellín, Barrio Laureles"
                      value={lugarCrecimiento}
                      onChange={(e) => setLugarCrecimiento(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Estado Civil
                    </label>
                    <select
                      value={idEstadoCivil}
                      onChange={(e) => setIdEstadoCivil(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    >
                      {estadosCiviles.map((ec) => (
                        <option key={ec.id} value={ec.id}>
                          {ec.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Oficio / Ocupación Histórica
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Docente de Primaria / Comerciante"
                      value={ocupacionHistorica}
                      onChange={(e) => setOcupacionHistorica(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Nivel Educativo
                    </label>
                    <select
                      value={nivelEducativo}
                      onChange={(e) => setNivelEducativo(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    >
                      <option value="Primaria Incompleta">Primaria Incompleta</option>
                      <option value="Primaria Completa">Primaria Completa</option>
                      <option value="Secundaria">Secundaria / Bachillerato</option>
                      <option value="Técnico / Tecnólogo">Técnico / Tecnólogo</option>
                      <option value="Universitario">Universitario / Profesional</option>
                      <option value="Posgrado / Maestría">Posgrado / Maestría</option>
                      <option value="Sin Escolaridad">Sin Escolaridad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Religión o Creencia Espiritual
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Católica practicante / Cristiana / Ninguna"
                      value={religionCreencia}
                      onChange={(e) => setReligionCreencia(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Acontecimientos Importantes y Trayectoria de Vida
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Hitos de vida significativos, matrimonio, viajes, logros profesionales o personales..."
                      value={acontecimientosImportantes}
                      onChange={(e) => setAcontecimientosImportantes(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Pérdidas y Duelos Significativos
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Fallecimiento de cónyuge, hijos, hermanos, cambios de domicilio o pérdida de autonomía..."
                      value={perdidasDuelosSignificativos}
                      onChange={(e) => setPerdidasDuelosSignificativos(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Gustos, Hábitos y Factores Emocionales */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#DEDBD1] pb-2">
                  <Heart className="w-4 h-4 text-[#C2185B]" />
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Personalidad, Gustos y Bienestar Emocional
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Gustos, Pasatiempos y Preferencias Musicales
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Música favorita (boleros, clásica), pasatiempos (lectura, tejido, jardinería, dominó)..."
                      value={gustosPasatiemposMusica}
                      onChange={(e) => setGustosPasatiemposMusica(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Costumbres y Tradiciones Familiares
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Celebraciones especiales, comidas típicas, devociones religiosas o hábitos arraigados..."
                      value={costumbresTradiciones}
                      onChange={(e) => setCostumbresTradiciones(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E7A4C] mb-1">
                      Aspectos que le dan Tranquilidad y Calma
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Estar acompañado, escuchar música suave, ver fotografías, pasear por el jardín..."
                      value={aspectosTranquilidad}
                      onChange={(e) => setAspectosTranquilidad(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F0F8F4] border border-[#BDE0D0] rounded-xl focus:border-[#1E7A4C] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A4453A] mb-1">
                      Aspectos que le causan Temor o Incomodidad
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ruidos fuertes, oscuridad, estar solo en la noche, personas desconocidas..."
                      value={aspectosTemorIncomodidad}
                      onChange={(e) => setAspectosTemorIncomodidad(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#FDF2F1] border border-[#F5C2BE] rounded-xl focus:border-[#A4453A] outline-hidden resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Rasgos Característicos de Personalidad
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Alegre, sociable, reflexivo, reservado, con carácter fuerte, afectuoso..."
                      value={rasgosPersonalidad}
                      onChange={(e) => setRasgosPersonalidad(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Rutinas y Hábitos Diarios Previos
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Se levanta a las 6am, toma café inmediatamente, siesta a las 2pm..."
                      value={rutinasHabitosDiarios}
                      onChange={(e) => setRutinasHabitosDiarios(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Motivo de Ingreso y Adaptación */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#DEDBD1] pb-2">
                  <Clock className="w-4 h-4 text-[#068591]" />
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Ingreso a la Institución y Proceso de Adaptación
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Motivo Principal del Ingreso
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Causa por la que la familia y el residente deciden institucionalizarse (necesidad de cuidados 24/7, soledad, rehabilitación)..."
                      value={motivoIngreso}
                      onChange={(e) => setMotivoIngreso(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Disposición hacia la Adaptación
                    </label>
                    <select
                      value={disposicionAdaptacion}
                      onChange={(e) => setDisposicionAdaptacion(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    >
                      <option value="Muy Favorable">Muy Favorable (Desea ingresar)</option>
                      <option value="Favorable">Favorable (Acepta con agrado)</option>
                      <option value="Reservada">Reservada (Con cautela o expectativa)</option>
                      <option value="Reticente / Oposición">Reticente / Con Oposición</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Expectativas del Adulto Mayor y su Familia frente a Samanya
                  </label>
                  <input
                    type="text"
                    placeholder="Qué esperan de la estancia, metas de socialización, acompañamiento médico y bienestar..."
                    value={expectativasIngreso}
                    onChange={(e) => setExpectativasIngreso(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PESTAÑA 2: GENOGRAMA & RED FAMILIAR                     */}
          {/* ======================================================== */}
          {activeTab === 'genograma' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Visor Interactivo del Genograma */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-2">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-[#068591]" />
                    <h4 className="font-serif font-bold text-sm text-[#182F28]">
                      Genograma Estructurado y Red Afectiva
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarModalNodo(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#182F28] hover:bg-[#274A3F] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#DCB87F]" />
                    <span>Agregar Miembro a la Red</span>
                  </button>
                </div>

                {/* Lienzo Visual SVG del Genograma */}
                <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] overflow-x-auto min-h-[220px] flex items-center justify-center">
                  <div className="flex flex-wrap items-center justify-center gap-4 py-2">
                    {nodosGenograma.map((nodo) => {
                      const esFocal = nodo.parentesco.includes('Residente');
                      return (
                        <div
                          key={nodo.id}
                          className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center min-w-[130px] max-w-[160px] text-center shadow-xs ${
                            esFocal
                              ? 'bg-gradient-to-b from-[#182F28] to-[#274A3F] text-white border-[#DCB87F] ring-2 ring-[#DCB87F]/30'
                              : nodo.fallecido
                              ? 'bg-gray-100 text-gray-500 border-gray-300 opacity-70'
                              : nodo.esCercaniaAfectiva
                              ? 'bg-[#FEF7EE] text-[#9A5B12] border-[#DCB87F]'
                              : 'bg-white text-[#182F28] border-[#DEDBD1]'
                          }`}
                        >
                          {/* Figura geométrica genograma: Cuadrado (M) o Círculo (F) */}
                          <div
                            className={`w-9 h-9 flex items-center justify-center mb-1.5 font-bold text-xs ${
                              nodo.genero === 'F' ? 'rounded-full' : 'rounded-lg'
                            } ${
                              esFocal
                                ? 'bg-[#DCB87F] text-[#182F28]'
                                : nodo.fallecido
                                ? 'bg-gray-300 text-gray-600 line-through'
                                : 'bg-[#182F28]/10 text-[#182F28]'
                            }`}
                          >
                            {nodo.fallecido ? '†' : nodo.genero}
                          </div>

                          <div className="font-bold text-xs truncate w-full" title={nodo.nombre}>
                            {nodo.nombre}
                          </div>
                          <div className="text-[10px] font-medium opacity-80">
                            {nodo.parentesco}
                          </div>

                          {/* Badges de soporte */}
                          <div className="flex items-center gap-1 mt-1.5">
                            {nodo.esCercaniaAfectiva && (
                              <span
                                className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700"
                                title="Persona de mayor cercanía afectiva"
                              >
                                ♥ Afectivo
                              </span>
                            )}
                            {nodo.asumeCuidado && (
                              <span
                                className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800"
                                title="Asume principalmente acompañamiento"
                              >
                                🤝 Cuidador
                              </span>
                            )}
                          </div>

                          {!esFocal && (
                            <button
                              type="button"
                              onClick={() => handleEliminarNodo(nodo.id)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] shadow-xs cursor-pointer"
                              title="Remover miembro"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Leyenda del Genograma */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#7A745F] pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-lg bg-gray-200 border border-gray-400 inline-block" />
                    <span>Hombre (Cuadrado)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 border border-gray-400 inline-block" />
                    <span>Mujer (Círculo)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-600 font-bold">♥</span>
                    <span>Cercanía Afectiva</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">🤝</span>
                    <span>Acompañamiento Principal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">†</span>
                    <span>Fallecido</span>
                  </div>
                </div>
              </div>

              {/* Matriz de Personas Autorizadas para Trámites y Citas */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#DEDBD1] pb-2">
                  <Users className="w-4 h-4 text-[#B3803F]" />
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Acudientes Registrados y Permisos de Representación
                  </h4>
                </div>

                <div className="divide-y divide-[#DEDBD1]">
                  {selectedResidenteParaFicha.acudientes && selectedResidenteParaFicha.acudientes.length > 0 ? (
                    selectedResidenteParaFicha.acudientes.map((acu) => (
                      <div key={acu.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-[#182F28] flex items-center gap-2">
                            <span>{acu.nombreCompleto}</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#F7F6F2] border border-[#DEDBD1] text-[#7A745F]">
                              {acu.parentesco}
                            </span>
                            {acu.esPrincipal && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                                Acudiente Principal
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#7A745F] mt-0.5">
                            Tel: {acu.telefono} • Email: {acu.email}
                          </p>
                        </div>

                        {/* Matriz de checkboxes autorizaciones */}
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#4B4636]">
                            <input
                              type="checkbox"
                              defaultChecked={acu.autorizadoInfoMedica ?? true}
                              className="rounded border-[#DEDBD1] text-[#182F28]"
                            />
                            <span>Info Médica</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#4B4636]">
                            <input
                              type="checkbox"
                              defaultChecked={acu.autorizadoAcompanarCitas ?? true}
                              className="rounded border-[#DEDBD1] text-[#182F28]"
                            />
                            <span>Acompañar Citas</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#4B4636]">
                            <input
                              type="checkbox"
                              defaultChecked={acu.autorizadoTramites ?? true}
                              className="rounded border-[#DEDBD1] text-[#182F28]"
                            />
                            <span>Trámites / Pagos</span>
                          </label>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#7A745F] py-2">
                      No hay acudientes vinculados a este residente aún.
                    </p>
                  )}
                </div>
              </div>

              {/* Dinámica Familiar y Red No Familiar */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Red de Apoyo No Familiar (Amigos, Vecinos, Antiguos Cuidadores)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mencione amistades cercanas, grupo parroquial, vecinos de confianza o cuidadores previos..."
                    value={redApoyoNoFamiliar}
                    onChange={(e) => setRedApoyoNoFamiliar(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Situaciones Familiares Relevantes y Dinámica Afectiva
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describa conflictos latentes, distancia geográfica de los hijos, disponibilidad de visitas..."
                    value={situacionesRelevantes}
                    onChange={(e) => setSituacionesRelevantes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PESTAÑA 3: VALORACIÓN MULTIDIMENSIONAL INTEGRAL          */}
          {/* ======================================================== */}
          {activeTab === 'multidimensional' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Signos Vitales y Calculadora de IMC */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#E65100]" />
                    <h4 className="font-serif font-bold text-sm text-[#182F28]">
                      Signos Vitales y Antropometría al Ingreso
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#7A745F]">
                      IMC Calculado:
                    </span>
                    <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${calculoImc.color}`}>
                      {calculoImc.valor > 0 ? `${calculoImc.valor} kg/m² (${calculoImc.categoria})` : 'Pendiente datos'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4636] mb-1">
                      TA Sistólica
                    </label>
                    <input
                      type="number"
                      placeholder="120"
                      value={signosVitales.tensionArterialSistolica || ''}
                      onChange={(e) =>
                        setSignosVitales((prev) => ({
                          ...prev,
                          tensionArterialSistolica: Number(e.target.value)
                        }))
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden text-center"
                    />
                    <span className="text-[10px] text-gray-500 block text-center mt-0.5">mmHg</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4636] mb-1">
                      TA Diastólica
                    </label>
                    <input
                      type="number"
                      placeholder="80"
                      value={signosVitales.tensionArterialDiastolica || ''}
                      onChange={(e) =>
                        setSignosVitales((prev) => ({
                          ...prev,
                          tensionArterialDiastolica: Number(e.target.value)
                        }))
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden text-center"
                    />
                    <span className="text-[10px] text-gray-500 block text-center mt-0.5">mmHg</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4636] mb-1">
                      FC (Pulso)
                    </label>
                    <input
                      type="number"
                      placeholder="72"
                      value={signosVitales.frecuenciaCardiaca || ''}
                      onChange={(e) =>
                        setSignosVitales((prev) => ({
                          ...prev,
                          frecuenciaCardiaca: Number(e.target.value)
                        }))
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden text-center"
                    />
                    <span className="text-[10px] text-gray-500 block text-center mt-0.5">lpm</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4636] mb-1">
                      FR
                    </label>
                    <input
                      type="number"
                      placeholder="18"
                      value={signosVitales.frecuenciaRespiratoria || ''}
                      onChange={(e) =>
                        setSignosVitales((prev) => ({
                          ...prev,
                          frecuenciaRespiratoria: Number(e.target.value)
                        }))
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden text-center"
                    />
                    <span className="text-[10px] text-gray-500 block text-center mt-0.5">rpm</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4636] mb-1">
                      Temperatura
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="36.5"
                      value={signosVitales.temperatura || ''}
                      onChange={(e) =>
                        setSignosVitales((prev) => ({
                          ...prev,
                          temperatura: Number(e.target.value)
                        }))
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden text-center"
                    />
                    <span className="text-[10px] text-gray-500 block text-center mt-0.5">°C</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4636] mb-1">
                      Sat. Oxígeno
                    </label>
                    <input
                      type="number"
                      placeholder="95"
                      value={signosVitales.saturacionOxigeno || ''}
                      onChange={(e) =>
                        setSignosVitales((prev) => ({
                          ...prev,
                          saturacionOxigeno: Number(e.target.value)
                        }))
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden text-center"
                    />
                    <span className="text-[10px] text-gray-500 block text-center mt-0.5">% SpO2</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4636] mb-1">
                      Peso
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="65"
                      value={signosVitales.pesoKg || ''}
                      onChange={(e) =>
                        setSignosVitales((prev) => ({
                          ...prev,
                          pesoKg: Number(e.target.value)
                        }))
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden text-center"
                    />
                    <span className="text-[10px] text-gray-500 block text-center mt-0.5">Kg</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B4636] mb-1">
                      Talla (Altura)
                    </label>
                    <input
                      type="number"
                      placeholder="160"
                      value={signosVitales.tallaCm || ''}
                      onChange={(e) =>
                        setSignosVitales((prev) => ({
                          ...prev,
                          tallaCm: Number(e.target.value)
                        }))
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden text-center"
                    />
                    <span className="text-[10px] text-gray-500 block text-center mt-0.5">cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Estado General al Ingreso
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Residente ingresa consciente, hidratado, afebril, hemodinámicamente estable en silla de ruedas..."
                    value={estadoGeneralIngreso}
                    onChange={(e) => setEstadoGeneralIngreso(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                  />
                </div>
              </div>

              {/* Dimensiones Clínicas y Funcionales */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#DEDBD1] pb-2">
                  <Stethoscope className="w-4 h-4 text-[#068591]" />
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Evaluación por Sistemas y Actividades de la Vida Diaria (AVD)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Dimensión Cognitiva y Orientación (Tiempo, Espacio, Memoria)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Orientación alopsíquica y autopsíquica, memoria a corto y largo plazo, juicio..."
                      value={cognitivoOrientacion}
                      onChange={(e) => setCognitivoOrientacion(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Dimensión Emocional y Conductual
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Estado de ánimo, estabilidad afectiva, signos de ansiedad, colaboración..."
                      value={emocionalConductual}
                      onChange={(e) => setEmocionalConductual(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Movilidad Funcional, Marcha y Transferencias
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Capacidad para caminar, levantarse de cama o silla, equilibrio estático y dinámico..."
                      value={movilidadFuncional}
                      onChange={(e) => setMovilidadFuncional(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Nutrición, Deglución y Apetito
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tolerancia a vía oral, reflejo de deglución, uso de prótesis dental, preferencias..."
                      value={nutricionAlimentacion}
                      onChange={(e) => setNutricionAlimentacion(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Eliminación y Continencia de Esfínteres
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Continencia vesical y fecal, uso de pañal protector, hábito intestinal..."
                      value={eliminacionContinencia}
                      onChange={(e) => setEliminacionContinencia(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Higiene, Vestido y Autocuidado
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Nivel de asistencia requerido para el baño, vestirse, cepillado y acicalamiento..."
                      value={higieneAutocuidado}
                      onChange={(e) => setHigieneAutocuidado(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Patrón de Sueño y Descanso Nocturno
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Horas promedio de sueño, insomnio de conciliación, despertares nocturnos, siestas..."
                      value={patronSueno}
                      onChange={(e) => setPatronSueno(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Terapias y Apoyos Profesionales Externos
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Fisioterapia, fonoaudiología, terapia ocupacional, citas de control especialista..."
                      value={terapiasApoyosExternos}
                      onChange={(e) => setTerapiasApoyosExternos(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PESTAÑA 4: MATRIZ DE RIESGOS & ENTORNO                   */}
          {/* ======================================================== */}
          {activeTab === 'riesgos' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Tarjetas de Selección de Riesgos Clínicos */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#DEDBD1] pb-2">
                  <ShieldAlert className="w-4 h-4 text-[#C2185B]" />
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Matriz de Riesgos Clínicos Asistenciales
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Riesgo de Caídas */}
                  <div className="p-4 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] space-y-2">
                    <span className="text-xs font-bold text-[#182F28] block">
                      Riesgo de Caídas (Downton)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['BAJO', 'MEDIO', 'ALTO'] as const).map((nivel) => (
                        <button
                          key={nivel}
                          type="button"
                          onClick={() => setRiesgoCaidas(nivel)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            riesgoCaidas === nivel
                              ? nivel === 'ALTO'
                                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                : nivel === 'MEDIO'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-gray-600 border-[#DEDBD1] hover:bg-gray-100'
                          }`}
                        >
                          {nivel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Riesgo Úlceras por Presión */}
                  <div className="p-4 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] space-y-2">
                    <span className="text-xs font-bold text-[#182F28] block">
                      Riesgo UPP (Braden)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['BAJO', 'MEDIO', 'ALTO'] as const).map((nivel) => (
                        <button
                          key={nivel}
                          type="button"
                          onClick={() => setRiesgoUlcerasPresion(nivel)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            riesgoUlcerasPresion === nivel
                              ? nivel === 'ALTO'
                                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                : nivel === 'MEDIO'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-gray-600 border-[#DEDBD1] hover:bg-gray-100'
                          }`}
                        >
                          {nivel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Riesgo de Fuga */}
                  <div className="p-4 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] space-y-2">
                    <span className="text-xs font-bold text-[#182F28] block">
                      Riesgo de Fuga / Extravío
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['BAJO', 'MEDIO', 'ALTO'] as const).map((nivel) => (
                        <button
                          key={nivel}
                          type="button"
                          onClick={() => setRiesgoFuga(nivel)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            riesgoFuga === nivel
                              ? nivel === 'ALTO'
                                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                : nivel === 'MEDIO'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-gray-600 border-[#DEDBD1] hover:bg-gray-100'
                          }`}
                        >
                          {nivel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Riesgo de Broncoaspiración */}
                  <div className="p-4 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] space-y-2">
                    <span className="text-xs font-bold text-[#182F28] block">
                      Riesgo Broncoaspiración
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['BAJO', 'MEDIO', 'ALTO'] as const).map((nivel) => (
                        <button
                          key={nivel}
                          type="button"
                          onClick={() => setRiesgoBroncoaspiracion(nivel)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            riesgoBroncoaspiracion === nivel
                              ? nivel === 'ALTO'
                                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                : nivel === 'MEDIO'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-gray-600 border-[#DEDBD1] hover:bg-gray-100'
                          }`}
                        >
                          {nivel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grado de Dependencia Global */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[#182F28] mb-1.5">
                    Grado Global de Dependencia Funcional (Barthel / Katz)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {[
                      { key: 'INDEPENDIENTE', label: 'Independiente' },
                      { key: 'DEPENDENCIA_LEVE', label: 'Dependencia Leve' },
                      { key: 'DEPENDENCIA_MODERADA', label: 'Dependencia Moderada' },
                      { key: 'DEPENDENCIA_SEVERA', label: 'Dependencia Severa' },
                      { key: 'DEPENDENCIA_TOTAL', label: 'Dependencia Total' }
                    ].map((g) => (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => setGradoDependenciaGlobal(g.key as any)}
                        className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                          gradoDependenciaGlobal === g.key
                            ? 'bg-[#182F28] text-white border-[#182F28] shadow-xs'
                            : 'bg-[#F7F6F2] text-[#4B4636] border-[#DEDBD1] hover:bg-[#EAE7DC]'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inspección Cutánea y Ayudas Técnicas */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Condiciones Físicas e Inspección de la Piel al Ingreso
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describa presencia de hematomas, cicatrices quirúrgicas, lunares, lesiones previas o signos de resequedad..."
                      value={condicionesFisicasPiel}
                      onChange={(e) => setCondicionesFisicasPiel(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Ayudas Técnicas y Dispositivos de Apoyo
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Bastón, caminador de ruedas, silla de ruedas de traslado, prótesis dental, audífono, gafas formuladas..."
                      value={ayudasTecnicas}
                      onChange={(e) => setAyudasTecnicas(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PESTAÑA 5: CONCEPTO, FIRMAS & FORMALIZACIÓN             */}
          {/* ======================================================== */}
          {activeTab === 'formalizacion' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Concepto General y Plan de Cuidados */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#DEDBD1] pb-2">
                  <FileText className="w-4 h-4 text-[#2E7D32]" />
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Concepto Interdisciplinario y Plan de Atención
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Concepto General de Ingreso
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Síntesis clínica, psicológica y social sobre las condiciones de ingreso del adulto mayor..."
                    value={conceptoGeneralIngreso}
                    onChange={(e) => setConceptoGeneralIngreso(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Recomendaciones para el Plan Integral de Cuidados
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Indicaciones prioritarias para enfermería, cuidadores, nutrición y actividades de estimulación..."
                    value={recomendacionesPlanCuidados}
                    onChange={(e) => setRecomendacionesPlanCuidados(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Responsable de la Entrega y Declaración */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#DEDBD1] pb-2">
                  <User className="w-4 h-4 text-[#B3803F]" />
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Familiar o Responsable que Hace Entrega del Residente
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del familiar"
                      value={nombreEntregaResponsable}
                      onChange={(e) => setNombreEntregaResponsable(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Documento Identificación
                    </label>
                    <input
                      type="text"
                      placeholder="Cédula / Pasaporte"
                      value={identificacionEntrega}
                      onChange={(e) => setIdentificacionEntrega(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Parentesco
                    </label>
                    <input
                      type="text"
                      placeholder="Hijo, Cónyuge, Hermano..."
                      value={parentescoEntrega}
                      onChange={(e) => setParentescoEntrega(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B4636] mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      placeholder="Móvil principal"
                      value={telefonoEntrega}
                      onChange={(e) => setTelefonoEntrega(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl focus:border-[#182F28] outline-hidden"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#F0F8F4] border border-[#BDE0D0] rounded-xl text-xs text-[#1E7A4C] flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="chkAcepto"
                    checked={aceptacionTerminos === 'S'}
                    onChange={(e) => setAceptacionTerminos(e.target.checked ? 'S' : 'N')}
                    className="mt-0.5 rounded border-[#BDE0D0] text-[#182F28]"
                  />
                  <label htmlFor="chkAcepto" className="cursor-pointer">
                    <strong>Declaración de Veracidad:</strong> Certifico que toda la información consignada en esta ficha técnica de valoración es verídica, corresponde al estado real del adulto mayor y autorizo el inicio del protocolo asistencial y residencial en Samanya OS.
                  </label>
                </div>
              </div>

              {/* Panel de Firma Digital */}
              <div className="p-5 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-2">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-[#182F28]" />
                    <h4 className="font-serif font-bold text-sm text-[#182F28]">
                      Firma Digital del Responsable o Acudiente
                    </h4>
                  </div>

                  {firmaGuardada && !modoNuevaFirma ? (
                    <span className="text-[11px] font-bold text-[#1E7A4C] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7A4C]" />
                      <span>Firma Registrada</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {firmaGuardada && (
                        <button
                          type="button"
                          onClick={() => {
                            setModoNuevaFirma(false);
                            setHasSignature(true);
                          }}
                          className="text-xs text-[#7A745F] hover:text-[#182F28] font-bold cursor-pointer px-2 py-0.5 rounded-lg border border-[#DEDBD1] hover:bg-[#F7F6F2]"
                        >
                          Cancelar y mantener actual
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={limpiarFirma}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Limpiar Trazo</span>
                      </button>
                    </div>
                  )}
                </div>

                {firmaGuardada && !modoNuevaFirma ? (
                  <div className="border-2 border-[#BDE0D0] rounded-2xl bg-[#F0F8F4]/30 flex flex-col items-center justify-center p-4 relative min-h-[160px] space-y-3">
                    <div className="bg-white rounded-xl p-3 border border-[#DEDBD1] shadow-2xs w-full max-w-[480px] flex items-center justify-center">
                      <img
                        src={firmaGuardada}
                        alt="Firma del responsable registrada"
                        className="max-h-[120px] max-w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between w-full max-w-[480px] pt-1 text-xs">
                      <span className="text-[#1E7A4C] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#1E7A4C]" />
                        <span>Firma digitalizada guardada y vinculada a la valoración</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setModoNuevaFirma(true);
                          setHasSignature(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEF7EE] text-[#9A5B12] font-bold border border-[#DCB87F] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Reemplazar firma existente con un nuevo trazo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Cambiar / Re-firmar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#DEDBD1] rounded-2xl bg-[#FDFCF7] flex flex-col items-center justify-center p-2 relative">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="cursor-crosshair w-full max-w-[500px] h-[160px] touch-none"
                    />
                    {!hasSignature && (
                      <div className="absolute pointer-events-none text-xs text-[#7A745F] flex items-center gap-1.5 opacity-60">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Firme aquí con el cursor o pantalla táctil</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Barra Inferior de Acciones */}
        <div className="bg-white border-t border-[#DEDBD1] px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-xs text-[#7A745F] flex items-center gap-2">
            <span>Residente: <strong>{selectedResidenteParaFicha.nombreCompleto}</strong></span>
            <span>•</span>
            <span>Expediente: {selectedResidenteParaFicha.codigoExpediente}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={cerrarFichaIngreso}
              className="px-4 py-2 rounded-xl bg-[#F7F6F2] hover:bg-[#EAE7DC] text-[#4B4636] text-xs font-bold transition-colors cursor-pointer border border-[#DEDBD1]"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleGuardarFicha}
              disabled={guardando}
              className="px-5 py-2 rounded-xl bg-[#182F28] hover:bg-[#274A3F] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#DCB87F]" />
              <span>{guardando ? 'Guardando en Oracle...' : 'Guardar y Finalizar Valoración'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Secundario: Agregar Miembro a la Red Familiar */}
      {mostrarModalNodo && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#DEDBD1] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-2">
              <h4 className="font-serif font-bold text-sm text-[#182F28]">
                Agregar Familiar al Genograma
              </h4>
              <button
                type="button"
                onClick={() => setMostrarModalNodo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4B4636] mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Carlos Arturo Gómez"
                  value={nuevoNodo.nombre}
                  onChange={(e) => setNuevoNodo((prev) => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl outline-hidden focus:border-[#182F28]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4B4636] mb-1">Parentesco</label>
                  <select
                    value={nuevoNodo.parentesco}
                    onChange={(e) => setNuevoNodo((prev) => ({ ...prev, parentesco: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl outline-hidden focus:border-[#182F28]"
                  >
                    <option value="Hijo / Hija">Hijo / Hija</option>
                    <option value="Cónyuge / Pareja">Cónyuge / Pareja</option>
                    <option value="Hermano / Hermana">Hermano / Hermana</option>
                    <option value="Nieto / Nieta">Nieto / Nieta</option>
                    <option value="Padre / Madre">Padre / Madre</option>
                    <option value="Sobrino / Sobrina">Sobrino / Sobrina</option>
                    <option value="Amigo(a) Cercano">Amigo(a) Cercano</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4B4636] mb-1">Género</label>
                  <select
                    value={nuevoNodo.genero}
                    onChange={(e) => setNuevoNodo((prev) => ({ ...prev, genero: e.target.value as 'M' | 'F' }))}
                    className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl outline-hidden focus:border-[#182F28]"
                  >
                    <option value="M">Masculino (Cuadrado)</option>
                    <option value="F">Femenino (Círculo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4B4636] mb-1">Edad Aproximada</label>
                  <input
                    type="number"
                    value={nuevoNodo.edad || ''}
                    onChange={(e) => setNuevoNodo((prev) => ({ ...prev, edad: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl outline-hidden focus:border-[#182F28]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4B4636] mb-1">Relación Afectiva</label>
                  <select
                    value={nuevoNodo.relacionConResidente}
                    onChange={(e) => setNuevoNodo((prev) => ({ ...prev, relacionConResidente: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl outline-hidden focus:border-[#182F28]"
                  >
                    <option value="Muy Buena">Muy Buena / Estrecha</option>
                    <option value="Normal">Normal</option>
                    <option value="Distante">Distante</option>
                    <option value="Conflictiva">Conflictiva</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevoNodo.fallecido}
                    onChange={(e) => setNuevoNodo((prev) => ({ ...prev, fallecido: e.target.checked }))}
                    className="rounded border-[#DEDBD1] text-[#182F28]"
                  />
                  <span>Fallecido(a)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevoNodo.esCercaniaAfectiva}
                    onChange={(e) => setNuevoNodo((prev) => ({ ...prev, esCercaniaAfectiva: e.target.checked }))}
                    className="rounded border-[#DEDBD1] text-[#182F28]"
                  />
                  <span>Mayor Cercanía Afectiva</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevoNodo.asumeCuidado}
                    onChange={(e) => setNuevoNodo((prev) => ({ ...prev, asumeCuidado: e.target.checked }))}
                    className="rounded border-[#DEDBD1] text-[#182F28]"
                  />
                  <span>Asume Acompañamiento</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-[#4B4636] mb-1">Notas / Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Vive en el exterior, llama todos los domingos..."
                  value={nuevoNodo.notas || ''}
                  onChange={(e) => setNuevoNodo((prev) => ({ ...prev, notas: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl outline-hidden focus:border-[#182F28]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DEDBD1]">
              <button
                type="button"
                onClick={() => setMostrarModalNodo(false)}
                className="px-3 py-1.5 rounded-xl bg-[#F7F6F2] text-[#4B4636] text-xs font-bold hover:bg-[#EAE7DC]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAgregarNodoGenograma}
                className="px-4 py-1.5 rounded-xl bg-[#182F28] text-white text-xs font-bold hover:bg-[#274A3F]"
              >
                Agregar al Genograma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
