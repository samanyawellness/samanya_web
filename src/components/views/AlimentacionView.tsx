import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  UtensilsCrossed,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Coffee,
  Sun,
  Moon,
  Apple,
  Droplets,
  HeartPulse,
  UserCheck,
  FileSpreadsheet,
  ChevronRight,
  ShieldAlert,
  Info,
  Sparkles
} from 'lucide-react';
import {
  PlanNutricional,
  MinutaSemanal,
  RegistroAlimentacion,
  TiempoComida
} from '../../types';

export const AlimentacionView: React.FC = () => {
  const { activeSede, residentes } = useAdmin();

  // Subpestañas del módulo
  const [subTab, setSubTab] = useState<'comedor' | 'planes' | 'minuta'>('comedor');

  // Filtros del comedor
  const [selectedFecha, setSelectedFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTiempoComida, setSelectedTiempoComida] = useState<number>(2); // 2 = Almuerzo por defecto
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroDieta, setFiltroDieta] = useState('TODAS');

  // Tiempos de comida estándar
  const tiemposComida: TiempoComida[] = [
    { id: 1, codigo: 'DES', nombre: 'Desayuno', horaSugerida: '07:30', orden: 1, estado: 'ACTIVO' },
    { id: 2, codigo: 'ALM', nombre: 'Almuerzo', horaSugerida: '12:00', orden: 2, estado: 'ACTIVO' },
    { id: 3, codigo: 'MER', nombre: 'Merienda / Once', horaSugerida: '15:30', orden: 3, estado: 'ACTIVO' },
    { id: 4, codigo: 'CEN', nombre: 'Cena', horaSugerida: '18:30', orden: 4, estado: 'ACTIVO' },
    { id: 5, codigo: 'COL', nombre: 'Colación Nocturna', horaSugerida: '21:00', orden: 5, estado: 'ACTIVO' }
  ];

  // Residentes activos de la sede
  const residentesSede = useMemo(() => {
    return residentes.filter(r => r.idCentro === activeSede.id && r.estado === 'Activo');
  }, [residentes, activeSede.id]);

  // Mock inicial de planes nutricionales
  const [planesNutricionales, setPlanesNutricionales] = useState<PlanNutricional[]>(() => {
    const dietas = ['Normal / General', 'Hiposódica (Baja en sal)', 'Diabética / Baja en Carbohidratos', 'Blanda Mecánica', 'Papilla / Licuada'];
    const consistencias = ['Sólida Regular', 'Blanda Fácil Masticación', 'Puré Suave', 'Líquida Espesada'];
    const espesantes = ['Néctar (Nivel 2 IDDSI)', 'Miel (Nivel 3 IDDSI)', 'Pudín (Nivel 4 IDDSI)', undefined];

    return residentesSede.map((res, idx) => ({
      id: 100 + res.id,
      idCentro: activeSede.id,
      idResidente: res.id,
      tipoDietaNombre: dietas[idx % dietas.length],
      consistenciaNombre: consistencias[idx % consistencias.length],
      nivelEspesanteNombre: espesantes[idx % espesantes.length],
      requerimientoCaloricoKcal: 1600 + (idx % 4) * 150,
      restriccionesAlergias: idx % 3 === 0 ? 'Sin mariscos ni fresas' : idx % 4 === 0 ? 'Intolerante a la lactosa' : undefined,
      alimentosPreferidos: 'Frutas dulces, sopas caseras',
      requiereAsistencia: idx % 2 === 0,
      suplementoNutricional: idx % 3 === 1 ? 'Ensure Advance 1 vaso/día' : undefined,
      estado: 'ACTIVO'
    }));
  });

  // Mock de registros de comedor del día
  const [registrosComedor, setRegistrosComedor] = useState<Record<string, RegistroAlimentacion>>(() => {
    const initial: Record<string, RegistroAlimentacion> = {};
    residentesSede.forEach((res, idx) => {
      const plan = planesNutricionales.find(p => p.idResidente === res.id);
      const key = `${selectedFecha}_${selectedTiempoComida}_${res.id}`;
      const porcentaje = idx % 5 === 0 ? 25 : idx % 4 === 0 ? 50 : idx % 3 === 0 ? 75 : 100;
      initial[key] = {
        id: idx + 1,
        idCentro: activeSede.id,
        idResidente: res.id,
        residenteNombre: `${res.nombres} ${res.apellidos}`,
        habitacion: res.habitacion || `Hab-${101 + idx}`,
        cama: res.cama || 'A',
        fecha: selectedFecha,
        idTiempoComida: selectedTiempoComida,
        tiempoComidaNombre: tiemposComida.find(t => t.id === selectedTiempoComida)?.nombre,
        tipoDieta: plan?.tipoDietaNombre || 'Normal',
        consistencia: plan?.consistenciaNombre || 'Sólida Regular',
        espesante: plan?.nivelEspesanteNombre,
        requiereAsistencia: plan?.requiereAsistencia,
        porcentajeIngesta: porcentaje,
        liquidosMl: 150 + (idx % 3) * 50,
        tolerancia: porcentaje < 50 ? 'REGULAR' : 'BUENA',
        asistio: true,
        observaciones: porcentaje < 50 ? 'Ingesta escasa por falta de apetito' : ''
      };
    });
    return initial;
  });

  // Handler para actualizar ingesta rápida
  const handleUpdateIngesta = (idResidente: number, porcentaje: number) => {
    const key = `${selectedFecha}_${selectedTiempoComida}_${idResidente}`;
    setRegistrosComedor(prev => {
      const current = prev[key];
      const tolerancia = porcentaje <= 25 ? 'MALA' : porcentaje <= 50 ? 'REGULAR' : 'BUENA';
      return {
        ...prev,
        [key]: {
          ...current,
          porcentajeIngesta: porcentaje,
          tolerancia: tolerancia
        }
      };
    });
  };

  // Minuta Semanal Demo
  const [minutaDemo] = useState<MinutaSemanal>({
    id: 1,
    idCentro: activeSede.id,
    nombre: 'Minuta Nutricional Ciclo 1 - Balance Geriátrico',
    descripcion: 'Aporte controlado en sodio, alto contenido de fibra y adaptación a texturas modificadas.',
    fechaInicio: '2026-10-01',
    fechaFin: '2026-10-07',
    estado: 'ACTIVO',
    items: [
      { id: 1, idMinuta: 1, diaSemana: 1, nombreDia: 'Lunes', idTiempoComida: 1, tiempoComidaNombre: 'Desayuno', platoPrincipal: 'Huevos revueltos suaves con arepa de maíz blanco', bebida: 'Chocolate en leche descremada o avena tibia', caloriasEstimadas: 380 },
      { id: 2, idMinuta: 1, diaSemana: 1, nombreDia: 'Lunes', idTiempoComida: 2, tiempoComidaNombre: 'Almuerzo', platoPrincipal: 'Pechuga a la plancha en salsa criolla suave', acompanamiento: 'Puré de papa criolla y arroz blanco suave', bebida: 'Jugo natural de guayaba endulzado con estevia', postre: 'Compota de manzana casera sin azúcar', caloriasEstimadas: 540 },
      { id: 3, idMinuta: 1, diaSemana: 1, nombreDia: 'Lunes', idTiempoComida: 3, tiempoComidaNombre: 'Merienda', platoPrincipal: 'Galletas de avena con yogur griego natural', bebida: 'Infusión de manzanilla tibia', caloriasEstimadas: 210 },
      { id: 4, idMinuta: 1, diaSemana: 1, nombreDia: 'Lunes', idTiempoComida: 4, tiempoComidaNombre: 'Cena', platoPrincipal: 'Crema de auyama con trocitos de queso campesino tierno', acompanamiento: 'Tostada integral', bebida: 'Aromática de hierbabuena', caloriasEstimadas: 360 },
      { id: 5, idMinuta: 1, diaSemana: 2, nombreDia: 'Martes', idTiempoComida: 1, tiempoComidaNombre: 'Desayuno', platoPrincipal: 'Pancake de avena y banano con queso fresco bajo en sal', bebida: 'Café descafeinado con leche de almendras', caloriasEstimadas: 390 },
      { id: 6, idMinuta: 1, diaSemana: 2, nombreDia: 'Martes', idTiempoComida: 2, tiempoComidaNombre: 'Almuerzo', platoPrincipal: 'Filete de pescado blanco al horno con finas hierbas', acompanamiento: 'Sopa de verduras mixtas y puré de plátano maduro', bebida: 'Jugo de lulo', postre: 'Gelatina dietética de fresa', caloriasEstimadas: 510 },
      { id: 7, idMinuta: 1, diaSemana: 2, nombreDia: 'Martes', idTiempoComida: 4, tiempoComidaNombre: 'Cena', platoPrincipal: 'Tortilla de espinacas y zanahoria al vapor', acompanamiento: 'Arepita asada', bebida: 'Aromática tibia', caloriasEstimadas: 340 }
    ]
  });

  // Estadísticas del comedor para la comida seleccionada
  const estadisticas = useMemo(() => {
    let totalComensales = 0;
    let sumaPorcentajes = 0;
    let ingestaBaja = 0;
    let requiereAsistenciaCount = 0;
    let liquidosTotal = 0;

    residentesSede.forEach(res => {
      const key = `${selectedFecha}_${selectedTiempoComida}_${res.id}`;
      const reg = registrosComedor[key];
      const plan = planesNutricionales.find(p => p.idResidente === res.id);

      totalComensales++;
      if (reg) {
        sumaPorcentajes += reg.porcentajeIngesta;
        if (reg.porcentajeIngesta <= 50) ingestaBaja++;
        liquidosTotal += reg.liquidosMl || 0;
      }
      if (plan?.requiereAsistencia) requiereAsistenciaCount++;
    });

    const promedioIngesta = totalComensales > 0 ? Math.round(sumaPorcentajes / totalComensales) : 0;
    const promedioLiquidos = totalComensales > 0 ? Math.round(liquidosTotal / totalComensales) : 0;

    return {
      totalComensales,
      promedioIngesta,
      ingestaBaja,
      requiereAsistenciaCount,
      promedioLiquidos
    };
  }, [residentesSede, registrosComedor, selectedFecha, selectedTiempoComida, planesNutricionales]);

  // Icono dinámico según tiempo de comida
  const getTiempoIcon = (codigo: string) => {
    switch (codigo) {
      case 'DES': return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'ALM': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'MER': return <Apple className="w-4 h-4 text-emerald-600" />;
      case 'CEN': return <Moon className="w-4 h-4 text-indigo-500" />;
      default: return <UtensilsCrossed className="w-4 h-4 text-[#B3803F]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="bg-white rounded-3xl p-6 border border-[#DEDBD1] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#182F28] flex items-center justify-center text-[#DCB87F] shadow-xs">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[#182F28]">
                  Alimentación & Nutrición
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B3803F]/15 text-[#9A5B12] border border-[#DCB87F]">
                  {activeSede.nombre}
                </span>
              </div>
              <p className="text-xs text-[#7A745F]">
                Planes nutricionales geriátricos, control de ingestas en comedor y minutas semanales
              </p>
            </div>
          </div>

          {/* Subpestañas */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1]">
            <button
              type="button"
              onClick={() => setSubTab('comedor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'comedor'
                  ? 'bg-[#182F28] text-white shadow-xs'
                  : 'text-[#7A745F] hover:text-[#182F28]'
              }`}
            >
              Comedor del Día
            </button>
            <button
              type="button"
              onClick={() => setSubTab('planes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'planes'
                  ? 'bg-[#182F28] text-white shadow-xs'
                  : 'text-[#7A745F] hover:text-[#182F28]'
              }`}
            >
              Planes Nutricionales
            </button>
            <button
              type="button"
              onClick={() => setSubTab('minuta')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'minuta'
                  ? 'bg-[#182F28] text-white shadow-xs'
                  : 'text-[#7A745F] hover:text-[#182F28]'
              }`}
            >
              Minuta Semanal
            </button>
          </div>
        </div>
      </div>

      {/* VISTA 1: COMEDOR DEL DÍA */}
      {subTab === 'comedor' && (
        <div className="space-y-6">
          {/* Tarjetas KPI de Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#182F28]/10 text-[#182F28] flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#182F28]">{estadisticas.totalComensales}</div>
                <div className="text-[11px] text-[#7A745F] font-semibold">Comensales Activos</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#182F28]">{estadisticas.promedioIngesta}%</div>
                <div className="text-[11px] text-[#7A745F] font-semibold">Ingesta Promedio</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                estadisticas.ingestaBaja > 0 ? 'bg-[#FBE8E6] text-[#A4453A]' : 'bg-gray-100 text-gray-500'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-xl font-bold font-serif ${estadisticas.ingestaBaja > 0 ? 'text-[#A4453A]' : 'text-[#182F28]'}`}>
                  {estadisticas.ingestaBaja}
                </div>
                <div className="text-[11px] text-[#7A745F] font-semibold">Baja Ingesta (≤50%)</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#182F28]">{estadisticas.promedioLiquidos} ml</div>
                <div className="text-[11px] text-[#7A745F] font-semibold">Líquidos Promedio</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DEDBD1] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#182F28]">{estadisticas.requiereAsistenciaCount}</div>
                <div className="text-[11px] text-[#7A745F] font-semibold">Requieren Asistencia</div>
              </div>
            </div>
          </div>

          {/* Barra de Filtros y Selección de Horario */}
          <div className="bg-white rounded-2xl p-4 border border-[#DEDBD1] flex flex-wrap items-center justify-between gap-4">
            {/* Tiempos de Comida Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {tiemposComida.map(tc => {
                const isSelected = selectedTiempoComida === tc.id;
                return (
                  <button
                    key={tc.id}
                    type="button"
                    onClick={() => setSelectedTiempoComida(tc.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#B3803F] text-white shadow-xs'
                        : 'bg-[#F7F6F2] text-[#4B4636] hover:bg-[#EAE7DC]'
                    }`}
                  >
                    {getTiempoIcon(tc.codigo)}
                    <span>{tc.nombre}</span>
                    <span className="text-[10px] opacity-75 font-mono">({tc.horaSugerida})</span>
                  </button>
                );
              })}
            </div>

            {/* Fecha y Buscador */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
                <Calendar className="w-4 h-4 text-[#B3803F]" />
                <input
                  type="date"
                  value={selectedFecha}
                  onChange={(e) => setSelectedFecha(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#182F28] focus:outline-none"
                />
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7A745F]" />
                <input
                  type="text"
                  placeholder="Buscar residente..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-[#182F28] focus:outline-none focus:border-[#B3803F] w-48"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Control de Ingesta */}
          <div className="bg-white rounded-3xl border border-[#DEDBD1] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#F7F6F2] border-b border-[#DEDBD1] flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-[#182F28] flex items-center gap-2">
                <span>Comensales Registrados</span>
                <span className="text-xs text-[#7A745F] font-sans font-normal">
                  ({tiemposComida.find(t => t.id === selectedTiempoComida)?.nombre} • {selectedFecha})
                </span>
              </h3>
              <span className="text-xs text-[#B3803F] font-semibold">
                Click en los porcentajes para registrar de inmediato
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#182F28] text-white uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Residente & Ubicación</th>
                    <th className="py-3 px-4">Plan & Dieta</th>
                    <th className="py-3 px-4">Textura / Espesante</th>
                    <th className="py-3 px-4 text-center">Asistencia</th>
                    <th className="py-3 px-4 text-center">Porcentaje Ingesta</th>
                    <th className="py-3 px-4 text-center">Líquidos (ml)</th>
                    <th className="py-3 px-4">Tolerancia & Alertas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEDBD1]">
                  {residentesSede
                    .filter(res => {
                      const nombreCompleto = `${res.nombres} ${res.apellidos}`.toLowerCase();
                      return nombreCompleto.includes(filtroTexto.toLowerCase()) || res.habitacion?.toLowerCase().includes(filtroTexto.toLowerCase());
                    })
                    .map(res => {
                      const plan = planesNutricionales.find(p => p.idResidente === res.id);
                      const key = `${selectedFecha}_${selectedTiempoComida}_${res.id}`;
                      const reg = registrosComedor[key];
                      const porcentaje = reg?.porcentajeIngesta ?? 100;

                      return (
                        <tr key={res.id} className="hover:bg-[#FAF9F5] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#182F28] text-xs">
                              {res.nombres} {res.apellidos}
                            </div>
                            <div className="text-[11px] text-[#7A745F]">
                              Hab: <span className="font-semibold">{res.habitacion || '101'}</span> • Cama: {res.cama || 'A'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#182F28]">
                              {plan?.tipoDietaNombre || 'Normal / General'}
                            </span>
                            {plan?.restriccionesAlergias && (
                              <div className="text-[10px] text-[#A4453A] font-bold flex items-center gap-1 mt-0.5">
                                <ShieldAlert className="w-3 h-3 shrink-0" />
                                <span>{plan.restriccionesAlergias}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-xs text-[#4B4636]">
                              {plan?.consistenciaNombre || 'Sólida Regular'}
                            </div>
                            {plan?.nivelEspesanteNombre && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                {plan.nivelEspesanteNombre}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {plan?.requiereAsistencia ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                                Asistida
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#7A745F]">
                                Autónomo
                              </span>
                            )}
                          </td>

                          {/* Botones de Registro Rápido de Ingesta */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1">
                              {[100, 75, 50, 25, 0].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleUpdateIngesta(res.id, val)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    porcentaje === val
                                      ? val >= 75
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : val >= 50
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'bg-rose-600 text-white shadow-xs'
                                      : 'bg-[#F7F6F2] text-[#7A745F] hover:bg-[#EAE7DC]'
                                  }`}
                                >
                                  {val}%
                                </button>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono font-bold text-xs text-[#182F28]">
                              {reg?.liquidosMl || 150} ml
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                porcentaje >= 75 ? 'bg-emerald-500' : porcentaje >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} />
                              <span className="text-[11px] font-semibold text-[#4B4636]">
                                {reg?.tolerancia || 'BUENA'}
                              </span>
                            </div>
                            {reg?.observaciones && (
                              <p className="text-[10px] text-[#7A745F] mt-0.5 truncate max-w-[180px]">
                                {reg.observaciones}
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: PLANES NUTRICIONALES */}
      {subTab === 'planes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#DEDBD1] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#182F28]">
                  Directorio de Planes Nutricionales por Residente
                </h3>
                <p className="text-xs text-[#7A745F]">
                  Prescripciones dietéticas, niveles de consistencia para disfagia y requerimientos calóricos
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Función disponible en la siguiente fase: Prescribir nuevo plan nutricional clínico')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#B3803F] hover:bg-[#9a6c32] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Plan Clínico</span>
                </button>
              </div>
            </div>

            {/* Listado en Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planesNutricionales.map(plan => {
                const res = residentesSede.find(r => r.id === plan.idResidente);
                if (!res) return null;

                return (
                  <div key={plan.id} className="bg-[#FAF9F5] rounded-2xl p-4 border border-[#DEDBD1] hover:border-[#B3803F] transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#182F28]">
                          {res.nombres} {res.apellidos}
                        </h4>
                        <div className="text-[11px] text-[#7A745F]">
                          Habitación {res.habitacion || '101'} • Cama {res.cama || 'A'}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#182F28] text-[#DCB87F]">
                        {plan.estado}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#DEDBD1]/60 space-y-2 text-xs">
                      <div>
                        <span className="text-[#7A745F] text-[11px]">Tipo de Dieta: </span>
                        <span className="font-bold text-[#182F28]">{plan.tipoDietaNombre}</span>
                      </div>

                      <div>
                        <span className="text-[#7A745F] text-[11px]">Consistencia: </span>
                        <span className="font-semibold text-[#4B4636]">{plan.consistenciaNombre}</span>
                      </div>

                      {plan.nivelEspesanteNombre && (
                        <div>
                          <span className="text-[#7A745F] text-[11px]">Espesante IDDSI: </span>
                          <span className="font-bold text-amber-700">{plan.nivelEspesanteNombre}</span>
                        </div>
                      )}

                      {plan.restriccionesAlergias && (
                        <div className="p-2 rounded-xl bg-[#FBE8E6] border border-[#E9A8A0] text-[#A4453A] text-[11px]">
                          <strong>Alergia/Restricción: </strong>{plan.restriccionesAlergias}
                        </div>
                      )}

                      {plan.suplementoNutricional && (
                        <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-[11px]">
                          <strong>Suplemento: </strong>{plan.suplementoNutricional}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] pt-1 text-[#7A745F]">
                        <span>Calorías: <strong>{plan.requerimientoCaloricoKcal} kcal</strong></span>
                        <span>Asistencia: <strong>{plan.requiereAsistencia ? 'Sí' : 'No'}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: MINUTA SEMANAL */}
      {subTab === 'minuta' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#DEDBD1] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#182F28]">
                    {minutaDemo.nombre}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Vigente
                  </span>
                </div>
                <p className="text-xs text-[#7A745F] mt-1">
                  {minutaDemo.descripcion} • Vigencia: {minutaDemo.fechaInicio} al {minutaDemo.fechaFin}
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert('Programación de minutas semanales disponible en Fase 2')}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#182F28] hover:bg-[#274A3F] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#DCB87F]" />
                <span>Exportar Menú Semanal</span>
              </button>
            </div>

            {/* Ciclo de Días y Comidas */}
            <div className="space-y-4">
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia, idx) => {
                const diaNum = idx + 1;
                const itemsDia = minutaDemo.items?.filter(item => item.diaSemana === diaNum) || [];

                return (
                  <div key={dia} className="border border-[#DEDBD1] rounded-2xl overflow-hidden">
                    <div className="bg-[#F7F6F2] px-4 py-2.5 flex items-center justify-between border-b border-[#DEDBD1]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#B3803F]" />
                        <span className="font-serif font-bold text-sm text-[#182F28]">{dia}</span>
                      </div>
                      <span className="text-[11px] text-[#7A745F]">
                        {itemsDia.length} preparaciones programadas
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {itemsDia.length > 0 ? (
                        itemsDia.map(item => (
                          <div key={item.id} className="bg-white p-3.5 rounded-xl border border-[#DEDBD1] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#B3803F] uppercase tracking-wider text-[10px]">
                                {item.tiempoComidaNombre}
                              </span>
                              <span className="text-[10px] text-[#7A745F] font-mono">
                                ~{item.caloriasEstimadas} kcal
                              </span>
                            </div>

                            <div className="text-xs font-semibold text-[#182F28]">
                              {item.platoPrincipal}
                            </div>

                            {item.acompanamiento && (
                              <div className="text-[11px] text-[#7A745F]">
                                <strong>Acompañamiento: </strong>{item.acompanamiento}
                              </div>
                            )}

                            {item.bebida && (
                              <div className="text-[11px] text-[#7A745F]">
                                <strong>Bebida: </strong>{item.bebida}
                              </div>
                            )}

                            {item.postre && (
                              <div className="text-[11px] text-[#7A745F]">
                                <strong>Postre: </strong>{item.postre}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-4 text-center text-xs text-[#7A745F]">
                          Menú cíclico estándar configurado para este día según protocolo nutricional.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
