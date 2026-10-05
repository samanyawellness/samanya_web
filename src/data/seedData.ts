import {
  SedeCentro,
  Residente,
  FamiliarAcudiente,
  TrabajadorEmpleado,
  TurnoAsignado,
  PermisoAusencia,
  IncidenteOperativo,
  ElementoDotacionCatalogo,
  DotacionResidente,
  CategoriaArticulo,
  ArticuloCatalogo,
  BodegaSede,
  InventarioStockSede,
  MovimientoInventario,
  TrasladoSedes
} from '../types';

export const SEED_SEDES: SedeCentro[] = [
  {
    id: 1,
    nombre: 'Sede Central Bogotá',
    codigo: 'SEDE-CENTRAL',
    ciudad: 'Bogotá D.C.',
    direccion: 'Calle 122 # 18-35, Usaquén',
    telefono: '+57 (601) 745-8900',
    capacidadTotal: 40,
    esSedePrincipal: true,
    manejaInventario: true,
    manejaCostosInventario: true,
    manejaAlimentacion: true
  },
  {
    id: 2,
    nombre: 'Sede Campestre La Calera',
    codigo: 'SEDE-NORTE',
    ciudad: 'La Calera, Cundinamarca',
    direccion: 'Km 4 Vía La Calera',
    telefono: '+57 (601) 862-4400',
    capacidadTotal: 45,
    esSedePrincipal: false,
    manejaInventario: true,
    manejaCostosInventario: false, // Ejemplo: La Calera solo controla cantidades físicas
    manejaAlimentacion: true
  },
  {
    id: 3,
    nombre: 'Sede Satélite Día Chía',
    codigo: 'SEDE-CHIA-DIA',
    ciudad: 'Chía, Cundinamarca',
    direccion: 'Carrera 9 # 14-20',
    telefono: '+57 (601) 885-1234',
    capacidadTotal: 15,
    esSedePrincipal: false,
    manejaInventario: false,
    manejaCostosInventario: false,
    manejaAlimentacion: false
  }
];

export const SEED_FAMILIARES: FamiliarAcudiente[] = [
  {
    id: 101,
    tipoIdentificacion: 'CC',
    identificacion: '52489120',
    nombres: 'Claudia Patricia',
    apellidos: 'Restrepo Gómez',
    nombreCompleto: 'Claudia Patricia Restrepo Gómez',
    telefonoPrincipal: '310 845 9921',
    telefonoSecundario: '300 214 7890',
    email: 'claudia.restrepo@gmail.com',
    direccion: 'Carrera 15 # 106-25 Apto 402',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'WhatsApp',
    residentesAsociados: [
      {
        idResidente: 1,
        nombreResidente: 'Blanca Gómez de Restrepo',
        parentesco: 'Hija',
        esPrincipal: true,
        autorizadoSalidas: true,
        responsablePago: true
      }
    ]
  },
  {
    id: 102,
    tipoIdentificacion: 'CC',
    identificacion: '79345889',
    nombres: 'Mauricio Andrés',
    apellidos: 'Restrepo Gómez',
    nombreCompleto: 'Mauricio Andrés Restrepo Gómez',
    telefonoPrincipal: '315 678 1234',
    email: 'mauricio.restrepo@empresa.com',
    direccion: 'Calle 134 # 9-45',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'Correo',
    residentesAsociados: [
      {
        idResidente: 1,
        nombreResidente: 'Blanca Gómez de Restrepo',
        parentesco: 'Hijo',
        esPrincipal: false,
        autorizadoSalidas: true,
        responsablePago: false
      }
    ]
  },
  {
    id: 103,
    tipoIdentificacion: 'CC',
    identificacion: '41980231',
    nombres: 'Sonia Esperanza',
    apellidos: 'Daza Morales',
    nombreCompleto: 'Sonia Esperanza Daza Morales',
    telefonoPrincipal: '312 450 7812',
    email: 'sonia.daza@outlook.com',
    direccion: 'Calle 142 # 19-30',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'WhatsApp',
    residentesAsociados: [
      {
        idResidente: 2,
        nombreResidente: 'Carlos Julio Daza',
        parentesco: 'Hija',
        esPrincipal: true,
        autorizadoSalidas: true,
        responsablePago: true
      }
    ]
  },
  {
    id: 104,
    tipoIdentificacion: 'CC',
    identificacion: '80123654',
    nombres: 'Fernando Alberto',
    apellidos: 'Vargas Silva',
    nombreCompleto: 'Fernando Alberto Vargas Silva',
    telefonoPrincipal: '318 901 2345',
    email: 'fernando.vargas@yahoo.com',
    direccion: 'Carrera 7 # 115-60',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'Llamada',
    residentesAsociados: [
      {
        idResidente: 3,
        nombreResidente: 'Lucila Silva de Vargas',
        parentesco: 'Hijo',
        esPrincipal: true,
        autorizadoSalidas: true,
        responsablePago: true
      }
    ]
  },
  {
    id: 105,
    tipoIdentificacion: 'CC',
    identificacion: '19456789',
    nombres: 'Alejandro',
    apellidos: 'Bermúdez Castro',
    nombreCompleto: 'Alejandro Bermúdez Castro',
    telefonoPrincipal: '320 334 5566',
    email: 'abermudez@hotmail.com',
    direccion: 'Calle 127 # 53A-12',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'WhatsApp',
    residentesAsociados: [
      {
        idResidente: 4,
        nombreResidente: 'Hernando Bermúdez',
        parentesco: 'Hermano',
        esPrincipal: true,
        autorizadoSalidas: false,
        responsablePago: true
      }
    ]
  }
];

export const SEED_RESIDENTES: Residente[] = [
  {
    id: 1,
    idCentro: 1,
    codigoExpediente: 'RES-2025-001',
    tipoIdentificacion: 'CC',
    identificacion: '24312890',
    nombres: 'Blanca',
    apellidos: 'Gómez de Restrepo',
    nombreCompleto: 'Blanca Gómez de Restrepo',
    fechaNacimiento: '1942-05-14',
    edad: 83,
    genero: 'F',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    habitacion: '104',
    cama: '104-A',
    eps: 'Sanitas EPS',
    planComplementario: 'Medicina Prepagada Colmédica',
    tipoSangre: 'O+',
    nivelMovilidad: 'Asistencia Leve',
    tipoDieta: 'Hiposódica',
    alertasClinicas: 'Alérgica a la Penicilina. Riesgo leve de caídas nocturnas.',
    estado: 'Activo',
    fechaIngreso: '2024-02-10',
    medicamentos: [
      {
        id: 1,
        idResidente: 1,
        medicamento: 'Losartán Potásico 50mg',
        cantidad: '1 tableta',
        frecuencia: 'Cada 12 horas',
        fechaFin: '2026-12-31',
        indicaciones: 'Administrar con agua después del desayuno y cena.'
      },
      {
        id: 2,
        idResidente: 1,
        medicamento: 'Omeprazol 20mg',
        cantidad: '1 cápsula',
        frecuencia: 'Cada 24 horas (Mañana)',
        indicaciones: 'En ayunas, 30 minutos antes del desayuno.'
      }
    ],
    acudientes: [
      {
        id: 101,
        nombreCompleto: 'Claudia Patricia Restrepo Gómez',
        parentesco: 'Hija',
        telefono: '310 845 9921',
        email: 'claudia.restrepo@gmail.com',
        esPrincipal: true
      },
      {
        id: 102,
        nombreCompleto: 'Mauricio Andrés Restrepo Gómez',
        parentesco: 'Hijo',
        telefono: '315 678 1234',
        email: 'mauricio.restrepo@empresa.com',
        esPrincipal: false
      }
    ],
    observaciones: 'Ingresa en compañía de su hija Claudia Restrepo. Se ubica en habitación individual 104 con pertenencias completas.',
    bitacora: [
      {
        id: 1001,
        idResidente: 1,
        nombreResidente: 'Blanca Gómez de Restrepo',
        habitacion: '104',
        cama: '104-A',
        idUsuario: 1,
        nombreUsuario: 'Administrador Principal',
        fecha: '2024-01-15',
        hora: '10:30',
        idCategoriaBitacora: 1,
        categoria: 'Rutina',
        contenido: '[REGISTRO DEL RESIDENTE]: Ingresa en compañía de su hija Claudia Restrepo. Se ubica en habitación individual 104 con pertenencias completas y plan farmacoterapéutico revisado.',
        grabadoPorVoz: false,
        visibleAcudiente: true,
        fechaCreacion: '2024-01-15T10:30:00'
      }
    ]
  },
  {
    id: 2,
    idCentro: 1,
    codigoExpediente: 'RES-2025-002',
    tipoIdentificacion: 'CC',
    identificacion: '17150902',
    nombres: 'Carlos Julio',
    apellidos: 'Daza Morales',
    nombreCompleto: 'Carlos Julio Daza Morales',
    fechaNacimiento: '1939-11-20',
    edad: 86,
    genero: 'M',
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    habitacion: '108',
    cama: '108-B',
    eps: 'Compensar EPS',
    tipoSangre: 'A+',
    nivelMovilidad: 'Asistencia Moderada',
    tipoDieta: 'Diabética',
    alertasClinicas: 'Diabetes Mellitus Tipo II. Control glucometría preprandial.',
    estado: 'Activo',
    fechaIngreso: '2024-05-18',
    medicamentos: [
      {
        id: 3,
        idResidente: 2,
        medicamento: 'Metformina 850mg',
        cantidad: '1 tableta',
        frecuencia: 'Cada 12 horas',
        fechaFin: '2026-12-31',
        indicaciones: 'Con las comidas principales para control glucémico.'
      }
    ],
    acudientes: [
      {
        id: 103,
        nombreCompleto: 'Sonia Esperanza Daza Morales',
        parentesco: 'Hija',
        telefono: '312 450 7812',
        email: 'sonia.daza@outlook.com',
        esPrincipal: true
      }
    ],
    observaciones: 'Ingresa en compañía de su hija Sonia Daza. Se establece protocolo de glucometría capilar y dieta para diabéticos.',
    bitacora: [
      {
        id: 1002,
        idResidente: 2,
        nombreResidente: 'Carlos Julio Daza Morales',
        habitacion: '108',
        cama: '108-B',
        idUsuario: 1,
        nombreUsuario: 'Administrador Principal',
        fecha: '2024-05-18',
        hora: '09:00',
        idCategoriaBitacora: 1,
        categoria: 'Rutina',
        contenido: '[REGISTRO DEL RESIDENTE]: Admisión e ingreso formal a la sede en compañía de su hija Sonia Daza. Se ubica en habitación 108-B. Se establece protocolo de glucometría capilar diaria y dieta para diabéticos.',
        grabadoPorVoz: false,
        visibleAcudiente: true,
        fechaCreacion: '2024-05-18T09:00:00'
      }
    ]
  },
  {
    id: 3,
    idCentro: 1,
    codigoExpediente: 'RES-2025-003',
    tipoIdentificacion: 'CC',
    identificacion: '28904551',
    nombres: 'Lucila',
    apellidos: 'Silva de Vargas',
    nombreCompleto: 'Lucila Silva de Vargas',
    fechaNacimiento: '1945-08-03',
    edad: 80,
    genero: 'F',
    fotoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
    habitacion: '201',
    cama: '201-A',
    eps: 'Sura EPS',
    planComplementario: 'Plan Élite Sura',
    tipoSangre: 'B+',
    nivelMovilidad: 'Independiente',
    tipoDieta: 'Normal / General',
    alertasClinicas: 'Hipertensión controlada con Losartán 50mg.',
    estado: 'Activo',
    fechaIngreso: '2024-08-01',
    acudientes: [
      {
        id: 104,
        nombreCompleto: 'Fernando Alberto Vargas Silva',
        parentesco: 'Hijo',
        telefono: '318 901 2345',
        email: 'fernando.vargas@yahoo.com',
        esPrincipal: true
      }
    ],
    observaciones: 'Ingresa en compañía de su hijo Fernando Vargas. Medicación antihipertensiva verificada.',
    bitacora: [
      {
        id: 1003,
        idResidente: 3,
        nombreResidente: 'Lucila Silva de Vargas',
        habitacion: '201',
        cama: '201-A',
        idUsuario: 1,
        nombreUsuario: 'Administrador Principal',
        fecha: '2024-08-01',
        hora: '10:00',
        idCategoriaBitacora: 1,
        categoria: 'Rutina',
        contenido: '[REGISTRO DEL RESIDENTE]: Ingreso oficial en habitación 201-A en compañía de su familia. Residente orientada e independiente. Se revisa prescripción de Losartán 50mg.',
        grabadoPorVoz: false,
        visibleAcudiente: true,
        fechaCreacion: '2024-08-01T10:00:00'
      }
    ]
  },
  {
    id: 4,
    idCentro: 1,
    codigoExpediente: 'RES-2025-004',
    tipoIdentificacion: 'CC',
    identificacion: '19231870',
    nombres: 'Hernando',
    apellidos: 'Bermúdez Castro',
    nombreCompleto: 'Hernando Bermúdez Castro',
    fechaNacimiento: '1937-01-29',
    edad: 89,
    genero: 'M',
    fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    habitacion: '205',
    cama: '205-A',
    eps: 'Famisanar EPS',
    tipoSangre: 'O-',
    nivelMovilidad: 'Dependiente Total',
    tipoDieta: 'Blanda',
    alertasClinicas: 'Movilización en silla de ruedas asistida. Cuidados de piel por decúbito.',
    estado: 'Activo',
    fechaIngreso: '2023-11-15',
    acudientes: [
      {
        id: 105,
        nombreCompleto: 'Alejandro Bermúdez Castro',
        parentesco: 'Hermano',
        telefono: '320 334 5566',
        email: 'abermudez@hotmail.com',
        esPrincipal: true
      }
    ],
    observaciones: 'Ingresa asistido en silla de ruedas por su hermano Alejandro Bermúdez. Cuidados de piel por decúbito activos.',
    bitacora: [
      {
        id: 1004,
        idResidente: 4,
        nombreResidente: 'Hernando Bermúdez Castro',
        habitacion: '205',
        cama: '205-A',
        idUsuario: 1,
        nombreUsuario: 'Administrador Principal',
        fecha: '2023-11-15',
        hora: '08:30',
        idCategoriaBitacora: 1,
        categoria: 'Rutina',
        contenido: '[REGISTRO DEL RESIDENTE]: Admisión en habitación 205-A con apoyo de su hermano. Residente dependiente total. Se instaura protocolo de movilización en silla de ruedas asistida y cuidados de integridad cutánea.',
        grabadoPorVoz: false,
        visibleAcudiente: true,
        fechaCreacion: '2023-11-15T08:30:00'
      }
    ]
  },
  {
    id: 5,
    idCentro: 1,
    codigoExpediente: 'RES-2025-005',
    tipoIdentificacion: 'CC',
    identificacion: '32654120',
    nombres: 'Esperanza',
    apellidos: 'Montoya Cuéllar',
    nombreCompleto: 'Esperanza Montoya Cuéllar',
    fechaNacimiento: '1947-09-12',
    edad: 78,
    genero: 'F',
    fotoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    habitacion: '210',
    cama: '210-A',
    eps: 'Nueva EPS',
    tipoSangre: 'A-',
    nivelMovilidad: 'Asistencia Leve',
    tipoDieta: 'Hiposódica',
    alertasClinicas: 'Dificultad leve para deglutir sólidos grandes.',
    estado: 'En Observación',
    fechaIngreso: '2025-01-10',
    acudientes: [],
    observaciones: 'Ingreso a valoración en habitación 210-A. Se supervisa deglución de sólidos.',
    bitacora: [
      {
        id: 1005,
        idResidente: 5,
        nombreResidente: 'Esperanza Montoya Cuéllar',
        habitacion: '210',
        cama: '210-A',
        idUsuario: 1,
        nombreUsuario: 'Administrador Principal',
        fecha: '2025-01-10',
        hora: '09:15',
        idCategoriaBitacora: 1,
        categoria: 'Rutina',
        contenido: '[REGISTRO DEL RESIDENTE]: Admisión inicial en observación en habitación 210-A. Se inicia dieta hiposódica blanda con supervisión en deglución.',
        grabadoPorVoz: false,
        visibleAcudiente: true,
        fechaCreacion: '2025-01-10T09:15:00'
      }
    ]
  },
  {
    id: 6,
    idCentro: 1,
    codigoExpediente: 'RES-2025-006',
    tipoIdentificacion: 'CC',
    identificacion: '14890334',
    nombres: 'Guillermo',
    apellidos: 'Ospina Rincón',
    nombreCompleto: 'Guillermo Ospina Rincón',
    fechaNacimiento: '1940-03-22',
    edad: 85,
    genero: 'M',
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    habitacion: '212',
    cama: '212-B',
    eps: 'Sanitas EPS',
    tipoSangre: 'O+',
    nivelMovilidad: 'Independiente',
    tipoDieta: 'Normal / General',
    alertasClinicas: 'Ninguna alergia conocida.',
    estado: 'Activo',
    fechaIngreso: '2024-09-05',
    acudientes: [],
    observaciones: 'Ingreso formal en habitación 212-B. Residente independiente y colaborativo.',
    bitacora: [
      {
        id: 1006,
        idResidente: 6,
        nombreResidente: 'Guillermo Ospina Rincón',
        habitacion: '212',
        cama: '212-B',
        idUsuario: 1,
        nombreUsuario: 'Administrador Principal',
        fecha: '2024-09-05',
        hora: '10:30',
        idCategoriaBitacora: 1,
        categoria: 'Rutina',
        contenido: '[REGISTRO DEL RESIDENTE]: Ingreso oficial a la institución en habitación 212-B. Residente independiente en actividades básicas cotidianas sin alergias reportadas.',
        grabadoPorVoz: false,
        visibleAcudiente: true,
        fechaCreacion: '2024-09-05T10:30:00'
      }
    ]
  }
];

export const SEED_TRABAJADORES: TrabajadorEmpleado[] = [
  {
    id: 1,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '1010123456',
    nombres: 'Orlando Arturo',
    apellidos: 'Valverde',
    nombreCompleto: 'Orlando Arturo Valverde',
    cargo: 'Administrador General del Centro',
    area: 'Administrativo',
    unidadAsignada: 'Dirección General & Operaciones',
    telefono: '310 123 4567',
    email: 'admin@samanya.com.co',
    fechaContratacion: '2022-01-15',
    tipoContrato: 'Término Indefinido',
    eps: 'Sura EPS',
    arl: 'Sura ARL',
    estado: 'Activo',
    avatarUrl: '/uploads/usuarios/usuario_1.jpg',
    turnoHabitual: 'Jornada Administrativa (08:00 - 17:00)'
  },
  {
    id: 201,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '1020789456',
    nombres: 'Mariana',
    apellidos: 'Cifuentes Rojas',
    nombreCompleto: 'Mariana Cifuentes Rojas',
    cargo: 'Jefa de Enfermería',
    area: 'Enfermería',
    unidadAsignada: 'Piso 1 y 2 Asistencial',
    telefono: '313 789 4512',
    email: 'm.cifuentes@samanyacare.com',
    fechaContratacion: '2023-01-15',
    tipoContrato: 'Término Indefinido',
    eps: 'Sura EPS',
    arl: 'Sura ARL',
    estado: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Mañana (07:00 - 15:00)'
  },
  {
    id: 202,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '1014230987',
    nombres: 'Laura Viviana',
    apellidos: 'Mora Peña',
    nombreCompleto: 'Laura Viviana Mora Peña',
    cargo: 'Auxiliar de Enfermería',
    area: 'Enfermería',
    unidadAsignada: 'Piso 1',
    telefono: '311 234 5678',
    email: 'l.mora@samanyacare.com',
    fechaContratacion: '2023-06-01',
    tipoContrato: 'Término Indefinido',
    eps: 'Sanitas EPS',
    arl: 'Positiva ARL',
    estado: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Mañana (07:00 - 15:00)'
  },
  {
    id: 203,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '80765432',
    nombres: 'José Daniel',
    apellidos: 'Quiroga León',
    nombreCompleto: 'José Daniel Quiroga León',
    cargo: 'Cuidador Gerontológico',
    area: 'Cuidado Asistencial',
    unidadAsignada: 'Piso 2',
    telefono: '318 456 7890',
    email: 'j.quiroga@samanyacare.com',
    fechaContratacion: '2023-09-10',
    tipoContrato: 'Término Fijo',
    eps: 'Compensar EPS',
    arl: 'Sura ARL',
    estado: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Tarde (14:00 - 22:00)'
  },
  {
    id: 204,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '53120456',
    nombres: 'Sandra Milena',
    apellidos: 'Torres Beltrán',
    nombreCompleto: 'Sandra Milena Torres Beltrán',
    cargo: 'Cuidadora Asistencial',
    area: 'Cuidado Asistencial',
    unidadAsignada: 'Piso 1 y Ronda',
    telefono: '316 789 0123',
    email: 's.torres@samanyacare.com',
    fechaContratacion: '2024-02-01',
    tipoContrato: 'Término Indefinido',
    eps: 'Famisanar EPS',
    arl: 'Positiva ARL',
    estado: 'En Permiso',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Mañana (07:00 - 15:00)'
  },
  {
    id: 205,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '1032456789',
    nombres: 'Dr. Camilo',
    apellidos: 'Serrano Vega',
    nombreCompleto: 'Dr. Camilo Serrano Vega',
    cargo: 'Médico General Evaluador',
    area: 'Medicina / Especialistas',
    unidadAsignada: 'Consultorio Clínico',
    telefono: '315 890 1234',
    email: 'c.serrano@samanyacare.com',
    fechaContratacion: '2023-04-15',
    tipoContrato: 'Prestación de Servicios',
    eps: 'Sanitas EPS',
    arl: 'Sura ARL',
    estado: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Visita Diurna (08:00 - 12:00)'
  },
  {
    id: 206,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '41890654',
    nombres: 'Nohora',
    apellidos: 'Cárdenas Prieto',
    nombreCompleto: 'Nohora Cárdenas Prieto',
    cargo: 'Nutricionista Dietista',
    area: 'Nutrición / Cocina',
    unidadAsignada: 'Área de Dietas y Comedor',
    telefono: '312 345 6789',
    email: 'n.cardenas@samanyacare.com',
    fechaContratacion: '2023-08-20',
    tipoContrato: 'Término Fijo',
    eps: 'Compensar EPS',
    arl: 'Sura ARL',
    estado: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Mañana (07:30 - 16:00)'
  }
];

export const SEED_TURNOS: TurnoAsignado[] = [
  {
    id: 301,
    idCentro: 1,
    nombre: 'Turno Mañana (Asistencial & Cuidados)',
    tipo: 'Mañana',
    horario: '07:00 - 15:00',
    fecha: new Date().toISOString().split('T')[0],
    coberturaMinimaRequerida: 3,
    estado: 'Activo',
    trabajadoresAsignados: [
      {
        idTrabajador: 201,
        nombre: 'Mariana Cifuentes Rojas',
        cargo: 'Jefa de Enfermería',
        area: 'Enfermería',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
      },
      {
        idTrabajador: 202,
        nombre: 'Laura Viviana Mora Peña',
        cargo: 'Auxiliar de Enfermería',
        area: 'Enfermería',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      },
      {
        idTrabajador: 206,
        nombre: 'Nohora Cárdenas Prieto',
        cargo: 'Nutricionista Dietista',
        area: 'Nutrición / Cocina',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 302,
    idCentro: 1,
    nombre: 'Turno Tarde (Acompañamiento y Medicación)',
    tipo: 'Tarde',
    horario: '14:00 - 22:00',
    fecha: new Date().toISOString().split('T')[0],
    coberturaMinimaRequerida: 2,
    estado: 'Programado',
    trabajadoresAsignados: [
      {
        idTrabajador: 203,
        nombre: 'José Daniel Quiroga León',
        cargo: 'Cuidador Gerontológico',
        area: 'Cuidado Asistencial',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
      }
    ],
    alertas: 'Alerta: Se requiere 1 auxiliar adicional para cumplir cobertura mínima.'
  },
  {
    id: 303,
    idCentro: 1,
    nombre: 'Turno Noche (Vigilancia y Emergencias)',
    tipo: 'Noche',
    horario: '21:00 - 07:00',
    fecha: new Date().toISOString().split('T')[0],
    coberturaMinimaRequerida: 2,
    estado: 'Programado',
    trabajadoresAsignados: [
      {
        idTrabajador: 202,
        nombre: 'Laura Viviana Mora Peña',
        cargo: 'Auxiliar de Enfermería',
        area: 'Enfermería',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      }
    ]
  }
];

export const SEED_PERMISOS: PermisoAusencia[] = [
  {
    id: 401,
    idTrabajador: 204,
    nombreTrabajador: 'Sandra Milena Torres Beltrán',
    area: 'Cuidado Asistencial',
    tipo: 'Incapacidad Médica',
    fechaInicio: '2025-02-18',
    fechaFin: '2025-02-21',
    motivo: 'Cuadro de lumbago mecánico certificado por EPS Sanitas.',
    soporteUrl: 'incapacidad_sandra_torres.pdf',
    driveUrl: 'https://drive.google.com/file/d/demo_incapacidad_sandra_torres/view',
    rutaDrive: 'Samanya/Talento_humano/204_1032456789/incapacidad_sandra_torres.pdf',
    estado: 'Aprobado',
    comentariosAdmin: 'Aprobada incapacidad de 3 días. Turnos reasignados a cuidador de refuerzo.',
    fechaSolicitud: '2025-02-17'
  },
  {
    id: 402,
    idTrabajador: 203,
    nombreTrabajador: 'José Daniel Quiroga León',
    area: 'Cuidado Asistencial',
    tipo: 'Permiso Personal',
    fechaInicio: '2025-02-25',
    fechaFin: '2025-02-25',
    motivo: 'Cita en juzgado para diligencia familiar improrrogable.',
    soporteUrl: 'citacion_juzgado_jose_quiroga.pdf',
    driveUrl: 'https://drive.google.com/file/d/demo_citacion_juzgado/view',
    rutaDrive: 'Samanya/Talento_humano/203_1018234567/citacion_juzgado_jose_quiroga.pdf',
    estado: 'Pendiente',
    fechaSolicitud: '2025-02-18'
  }
];

export const SEED_INCIDENTES: IncidenteOperativo[] = [
  {
    id: 501,
    idCentro: 1,
    idResidente: 2,
    nombreResidente: 'Carlos Julio Daza Morales',
    habitacion: '108',
    tipo: 'Caída',
    severidad: 'Media',
    descripcion: 'Pérdida de equilibrio al intentar levantarse sin apoyo hacia el baño. Caída controlada a nivel.',
    accionesTomadas: 'Valoración inmediata por enfermería. Sin traumatismo craneal ni signos de fractura. Se notificó a familiar y se reforzó timbre de auxilio.',
    reportadoPor: 'Mariana Cifuentes Rojas',
    fechaHora: 'Hoy 09:30 AM',
    estado: 'En Seguimiento',
    notificadoFamiliar: true
  },
  {
    id: 502,
    idCentro: 1,
    idResidente: 5,
    nombreResidente: 'Esperanza Montoya Cuéllar',
    habitacion: '210',
    tipo: 'Alteración de Signos',
    severidad: 'Baja',
    descripcion: 'Episodio de presión arterial elevada (150/95 mmHg) durante control matutino.',
    accionesTomadas: 'Reposo en cama durante 30 minutos y administración de dosis indicada según protocolo. Presión estabilizada a 130/85 mmHg.',
    reportadoPor: 'Laura Viviana Mora Peña',
    fechaHora: 'Ayer 11:15 AM',
    estado: 'Cerrado',
    notificadoFamiliar: false
  }
];

export const SEED_CATALOGO_DOTACION: ElementoDotacionCatalogo[] = [
  {
    id: 1,
    idOrganizacion: 1,
    nombreElemento: 'Juego de sábanas completo (Sobresábana, bajera, funda)',
    categoria: 'Lencería y Ropa de Cama',
    cantidadDefecto: 2,
    frecuenciaCambioMeses: 12,
    descripcion: 'Juego de cama 100% algodón 200 hilos para cama hospitalaria/geriátrica. Renovación cada 12 meses.',
    esSugeridoIngreso: true,
    estado: 'Activo'
  },
  {
    id: 2,
    idOrganizacion: 1,
    nombreElemento: 'Cobija térmica o plumón liviano',
    categoria: 'Lencería y Ropa de Cama',
    cantidadDefecto: 1,
    frecuenciaCambioMeses: 24,
    descripcion: 'Manta térmica hipoalergénica lavable en máquina. Ciclo de recambio sugerido cada 24 meses.',
    esSugeridoIngreso: true,
    estado: 'Activo'
  },
  {
    id: 3,
    idOrganizacion: 1,
    nombreElemento: 'Almohada ortopédica ergonómica',
    categoria: 'Lencería y Ropa de Cama',
    cantidadDefecto: 1,
    frecuenciaCambioMeses: 12,
    descripcion: 'Almohada con memoria viscoelástica y funda lavable antifluido. Cambio recomendado cada año.',
    esSugeridoIngreso: true,
    estado: 'Activo'
  },
  {
    id: 4,
    idOrganizacion: 1,
    nombreElemento: 'Juego de toallas (Cuerpo, manos y pies)',
    categoria: 'Aseo y Cuidado Personal',
    cantidadDefecto: 2,
    frecuenciaCambioMeses: 6,
    descripcion: 'Toallas de baño absorbentes personalizadas con el nombre del residente. Recambio cada 6 meses.',
    esSugeridoIngreso: true,
    estado: 'Activo'
  },
  {
    id: 5,
    idOrganizacion: 1,
    nombreElemento: 'Protector de colchón antifluido',
    categoria: 'Lencería y Ropa de Cama',
    cantidadDefecto: 1,
    frecuenciaCambioMeses: 12,
    descripcion: 'Cubrecolchón impermeable y transpirable con cierre perimetral. Recambio anual.',
    esSugeridoIngreso: true,
    estado: 'Activo'
  },
  {
    id: 6,
    idOrganizacion: 1,
    nombreElemento: 'Kit menaje personal (Pocillo térmico, vaso y cubiertos)',
    categoria: 'Menaje',
    cantidadDefecto: 1,
    frecuenciaCambioMeses: null,
    descripcion: 'Vajilla personal irrompible libre de BPA. Entrega única al ingreso, reposición por pérdida.',
    esSugeridoIngreso: true,
    estado: 'Activo'
  },
  {
    id: 7,
    idOrganizacion: 1,
    nombreElemento: 'Neceser y kit de higiene personal inicial',
    categoria: 'Aseo y Cuidado Personal',
    cantidadDefecto: 1,
    frecuenciaCambioMeses: 1,
    descripcion: 'Cepillo, crema dental, esponja suave, peine y jabonera. Entrega al ingreso, reposición mensual de consumibles.',
    esSugeridoIngreso: true,
    estado: 'Activo'
  }
];

export const SEED_DOTACIONES_RESIDENTES: DotacionResidente[] = [
  {
    id: 1,
    idResidente: 1,
    idElementoCatalogo: 1,
    nombreElemento: 'Juego de sábanas completo (Sobresábana, bajera, funda)',
    categoria: 'Lencería y Ropa de Cama',
    cantidad: 2,
    fechaEntrega: '2025-03-10',
    frecuenciaCambioMeses: 12,
    fechaProximoCambio: '2026-03-10',
    fechaUltimoCambio: '2025-03-10',
    estadoElemento: 'Entregado',
    condicionEntrega: 'Nuevo de paquete',
    notas: 'Dotación entregada completa por ingreso. Color beige.',
    usuarioEntrega: 'Dr. Alejandro Morales',
    semaforoCambio: 'PROXIMO',
    diasParaCambio: 15,
    historial: []
  },
  {
    id: 2,
    idResidente: 1,
    idElementoCatalogo: 2,
    nombreElemento: 'Cobija térmica o plumón liviano',
    categoria: 'Lencería y Ropa de Cama',
    cantidad: 1,
    fechaEntrega: '2025-03-10',
    frecuenciaCambioMeses: 24,
    fechaProximoCambio: '2027-03-10',
    fechaUltimoCambio: '2025-03-10',
    estadoElemento: 'Entregado',
    condicionEntrega: 'Nuevo',
    notas: 'Plumón térmico color azul oscuro.',
    usuarioEntrega: 'Dr. Alejandro Morales',
    semaforoCambio: 'VIGENTE',
    diasParaCambio: 380,
    historial: []
  },
  {
    id: 3,
    idResidente: 1,
    idElementoCatalogo: 4,
    nombreElemento: 'Juego de toallas (Cuerpo, manos y pies)',
    categoria: 'Aseo y Cuidado Personal',
    cantidad: 2,
    fechaEntrega: '2025-03-10',
    frecuenciaCambioMeses: 6,
    fechaProximoCambio: '2025-09-10',
    fechaUltimoCambio: '2025-03-10',
    estadoElemento: 'Cambio Pendiente',
    condicionEntrega: 'Nuevo',
    notas: 'Desgaste por uso continuo. Pendiente renovación semestral.',
    usuarioEntrega: 'Dr. Alejandro Morales',
    semaforoCambio: 'VENCIDO',
    diasParaCambio: -160,
    historial: []
  },
  {
    id: 4,
    idResidente: 1,
    idElementoCatalogo: 6,
    nombreElemento: 'Kit menaje personal (Pocillo térmico, vaso y cubiertos)',
    categoria: 'Menaje',
    cantidad: 1,
    fechaEntrega: '2025-03-10',
    frecuenciaCambioMeses: null,
    fechaProximoCambio: null,
    fechaUltimoCambio: '2025-03-10',
    estadoElemento: 'Entregado',
    condicionEntrega: 'Nuevo',
    notas: 'Marcado con el nombre de la residente en base.',
    usuarioEntrega: 'Dr. Alejandro Morales',
    semaforoCambio: 'SIN_VENCIMIENTO',
    diasParaCambio: null,
    historial: []
  },
  {
    id: 5,
    idResidente: 2,
    idElementoCatalogo: 1,
    nombreElemento: 'Juego de sábanas completo (Sobresábana, bajera, funda)',
    categoria: 'Lencería y Ropa de Cama',
    cantidad: 2,
    fechaEntrega: '2025-05-20',
    frecuenciaCambioMeses: 12,
    fechaProximoCambio: '2026-05-20',
    fechaUltimoCambio: '2025-05-20',
    estadoElemento: 'Entregado',
    condicionEntrega: 'Nuevo',
    notas: 'Entregado juego celeste y juego blanco.',
    usuarioEntrega: 'Mariana Cifuentes Rojas',
    semaforoCambio: 'VIGENTE',
    diasParaCambio: 85,
    historial: []
  },
  {
    id: 6,
    idResidente: 2,
    idElementoCatalogo: 4,
    nombreElemento: 'Juego de toallas (Cuerpo, manos y pies)',
    categoria: 'Aseo y Cuidado Personal',
    cantidad: 2,
    fechaEntrega: '2025-11-20',
    frecuenciaCambioMeses: 6,
    fechaProximoCambio: '2026-05-20',
    fechaUltimoCambio: '2025-11-20',
    estadoElemento: 'Entregado',
    condicionEntrega: 'Nuevo',
    notas: 'Recambio semestral efectuado satisfactoriamente.',
    usuarioEntrega: 'Mariana Cifuentes Rojas',
    semaforoCambio: 'VIGENTE',
    diasParaCambio: 85,
    historial: [
      {
        id: 1,
        idDotacionResidente: 6,
        fechaCambio: '2025-11-20',
        motivo: 'Recambio semestral por uso continuo',
        condicionNuevo: 'Nuevo de paquete',
        observaciones: 'Se retiran las toallas anteriores entregadas en mayo.',
        usuarioRegistra: 'Mariana Cifuentes Rojas'
      }
    ]
  }
];

// =============================================================================
// SEED DATA: MÓDULO DE INVENTARIO Y ALMACÉN MULTISEDE
// =============================================================================

export const SEED_CATEGORIAS_ARTICULOS: CategoriaArticulo[] = [
  {
    id: 1,
    idOrganizacion: 1,
    codigoCategoria: 'ASIST_CUR',
    nombreCategoria: 'Insumos Asistenciales y Curación',
    descripcion: 'Gasas, apósitos, sondas, guantes, pañales y tiras reactivas',
    colorHex: '#0EA5E9',
    estado: 'Activo'
  },
  {
    id: 2,
    idOrganizacion: 1,
    codigoCategoria: 'MED_URG',
    nombreCategoria: 'Medicamentos y Fármacos de Urgencia',
    descripcion: 'Botiquín de sede, soluciones salinas, analgésicos y primeros auxilios',
    colorHex: '#EF4444',
    estado: 'Activo'
  },
  {
    id: 3,
    idOrganizacion: 1,
    codigoCategoria: 'ASEO_DES',
    nombreCategoria: 'Aseo y Desinfección Hospitalaria',
    descripcion: 'Clorhexidina, alcohol antiséptico, desinfectantes y toallas desechables',
    colorHex: '#10B981',
    estado: 'Activo'
  },
  {
    id: 4,
    idOrganizacion: 1,
    codigoCategoria: 'LENC_CAMA',
    nombreCategoria: 'Lencería y Ropa de Cama',
    descripcion: 'Sábanas institucionales, protectores impermeables, cobijas y toallas',
    colorHex: '#8B5CF6',
    estado: 'Activo'
  },
  {
    id: 5,
    idOrganizacion: 1,
    codigoCategoria: 'NUT_ALIM',
    nombreCategoria: 'Nutrición y Suplementos Especiales',
    descripcion: 'Ensure, Glucerna, espesantes para disfagia y suplementos proteicos',
    colorHex: '#F59E0B',
    estado: 'Activo'
  },
  {
    id: 6,
    idOrganizacion: 1,
    codigoCategoria: 'EQUIP_BIO',
    nombreCategoria: 'Equipamiento Menor y Dispositivos',
    descripcion: 'Tensiómetros, oxímetros de pulso, termómetros y glucómetros',
    colorHex: '#64748B',
    estado: 'Activo'
  }
];

export const SEED_ARTICULOS_CATALOGO: ArticuloCatalogo[] = [
  {
    id: 1,
    idOrganizacion: 1,
    idCategoria: 1,
    nombreCategoria: 'Insumos Asistenciales y Curación',
    colorCategoria: '#0EA5E9',
    codigoArticulo: 'INS-PAN-01',
    nombreArticulo: 'Pañal Desechable Adulto Talla G (Paquete x 30)',
    descripcion: 'Pañales para incontinencia severa con barreras antiescurrimiento',
    unidadMedida: 'UNIDAD',
    unidadesPorEmpaque: 30,
    tipoEmpaque: 'Paquete',
    requiereLoteVencimiento: false,
    esDescontablePorResidente: true,
    costoEstandar: 1933,
    estado: 'Activo'
  },
  {
    id: 2,
    idOrganizacion: 1,
    idCategoria: 1,
    nombreCategoria: 'Insumos Asistenciales y Curación',
    colorCategoria: '#0EA5E9',
    codigoArticulo: 'INS-GLU-02',
    nombreArticulo: 'Tiras Reactivas Glucometría Accu-Chek (Caja x 50)',
    descripcion: 'Tiras para monitoreo diario de glucosa capilar',
    unidadMedida: 'UNIDAD',
    unidadesPorEmpaque: 50,
    tipoEmpaque: 'Caja',
    requiereLoteVencimiento: true,
    esDescontablePorResidente: true,
    costoEstandar: 1900,
    estado: 'Activo'
  },
  {
    id: 3,
    idOrganizacion: 1,
    idCategoria: 2,
    nombreCategoria: 'Medicamentos y Fármacos de Urgencia',
    colorCategoria: '#EF4444',
    codigoArticulo: 'MED-SOL-01',
    nombreArticulo: 'Solución Salina Normal 0.9% Bolsa 500ml',
    descripcion: 'Bolsa para irrigación, curaciones y micronebulizaciones',
    unidadMedida: 'UNIDAD',
    requiereLoteVencimiento: true,
    esDescontablePorResidente: true,
    costoEstandar: 6500,
    estado: 'Activo'
  },
  {
    id: 4,
    idOrganizacion: 1,
    idCategoria: 3,
    nombreCategoria: 'Aseo y Desinfección Hospitalaria',
    colorCategoria: '#10B981',
    codigoArticulo: 'ASE-CLX-01',
    nombreArticulo: 'Jabón Quirúrgico Clorhexidina 4% Galón',
    descripcion: 'Antiséptico de alto nivel para lavado clínico de manos',
    unidadMedida: 'FRASCO',
    requiereLoteVencimiento: true,
    esDescontablePorResidente: false,
    costoEstandar: 82000,
    estado: 'Activo'
  },
  {
    id: 5,
    idOrganizacion: 1,
    idCategoria: 4,
    nombreCategoria: 'Lencería y Ropa de Cama',
    colorCategoria: '#8B5CF6',
    codigoArticulo: 'LEN-SAB-01',
    nombreArticulo: 'Juego de Sábanas Cama Sencilla Algodón 180H',
    descripcion: 'Sábana ajustable, sobre-sábana y funda color blanco',
    unidadMedida: 'UNIDAD',
    requiereLoteVencimiento: false,
    esDescontablePorResidente: true,
    costoEstandar: 45000,
    estado: 'Activo'
  },
  {
    id: 6,
    idOrganizacion: 1,
    idCategoria: 5,
    nombreCategoria: 'Nutrición y Suplementos Especiales',
    colorCategoria: '#F59E0B',
    codigoArticulo: 'NUT-ENS-01',
    nombreArticulo: 'Ensure Advance Vainilla Lata 850g',
    descripcion: 'Suplemento nutricional con HMB y proteína para masa muscular',
    unidadMedida: 'FRASCO',
    requiereLoteVencimiento: true,
    esDescontablePorResidente: true,
    costoEstandar: 89000,
    estado: 'Activo'
  }
];

export const SEED_BODEGAS_SEDE: BodegaSede[] = [
  {
    id: 1,
    idCentro: 1,
    codigoBodega: 'BOD-PRIN',
    nombreBodega: 'Almacén Central - Sede Bogotá',
    descripcion: 'Bodega principal de insumos clínicos y farmacia',
    esBodegaPrincipal: true,
    estado: 'Activo'
  },
  {
    id: 2,
    idCentro: 2,
    codigoBodega: 'BOD-PRIN',
    nombreBodega: 'Almacén Principal - Sede Campestre',
    descripcion: 'Bodega de insumos y materiales sede campestre',
    esBodegaPrincipal: true,
    estado: 'Activo'
  }
];

export const SEED_INVENTARIO_STOCK: InventarioStockSede[] = [
  {
    id: 1,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    idBodega: 1,
    nombreBodega: 'Almacén Central - Sede Bogotá',
    idArticulo: 1,
    codigoArticulo: 'INS-PAN-01',
    nombreArticulo: 'Pañal Desechable Adulto Talla G (Paquete x 30)',
    categoria: 'Insumos Asistenciales y Curación',
    colorCategoria: '#0EA5E9',
    unidadMedida: 'PAQUETE',
    cantidadDisponible: 45,
    cantidadReservada: 0,
    stockMinimo: 15,
    stockMaximo: 60,
    puntoReorden: 20,
    ubicacionEstante: 'Estante A-1',
    fechaUltimoMovimiento: '2026-03-28',
    costoEstandar: 58000,
    valorTotalStock: 2610000,
    estadoSuministro: 'OPTIMO'
  },
  {
    id: 2,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    idBodega: 1,
    nombreBodega: 'Almacén Central - Sede Bogotá',
    idArticulo: 2,
    codigoArticulo: 'INS-GLU-02',
    nombreArticulo: 'Tiras Reactivas Glucometría Accu-Chek (Caja x 50)',
    categoria: 'Insumos Asistenciales y Curación',
    colorCategoria: '#0EA5E9',
    unidadMedida: 'CAJA',
    numeroLote: 'L-2026-GLU',
    fechaVencimiento: '2026-04-18',
    diasParaVencer: 15,
    cantidadDisponible: 8,
    cantidadReservada: 0,
    stockMinimo: 10,
    stockMaximo: 40,
    puntoReorden: 15,
    ubicacionEstante: 'Botiquín Frío 2',
    fechaUltimoMovimiento: '2026-03-30',
    costoEstandar: 95000,
    valorTotalStock: 760000,
    estadoSuministro: 'BAJO'
  },
  {
    id: 3,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    idBodega: 1,
    nombreBodega: 'Almacén Central - Sede Bogotá',
    idArticulo: 3,
    codigoArticulo: 'MED-SOL-01',
    nombreArticulo: 'Solución Salina Normal 0.9% Bolsa 500ml',
    categoria: 'Medicamentos y Fármacos de Urgencia',
    colorCategoria: '#EF4444',
    unidadMedida: 'UNIDAD',
    numeroLote: 'L-SAL-8891',
    fechaVencimiento: '2026-11-30',
    diasParaVencer: 240,
    cantidadDisponible: 32,
    cantidadReservada: 0,
    stockMinimo: 15,
    stockMaximo: 50,
    puntoReorden: 20,
    ubicacionEstante: 'Estante B-3',
    fechaUltimoMovimiento: '2026-03-25',
    costoEstandar: 6500,
    valorTotalStock: 208000,
    estadoSuministro: 'OPTIMO'
  },
  {
    id: 4,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    idBodega: 1,
    nombreBodega: 'Almacén Central - Sede Bogotá',
    idArticulo: 4,
    codigoArticulo: 'ASE-CLX-01',
    nombreArticulo: 'Jabón Quirúrgico Clorhexidina 4% Galón',
    categoria: 'Aseo y Desinfección Hospitalaria',
    colorCategoria: '#10B981',
    unidadMedida: 'FRASCO',
    numeroLote: 'L-CLX-2025',
    fechaVencimiento: '2026-12-15',
    diasParaVencer: 255,
    cantidadDisponible: 12,
    cantidadReservada: 0,
    stockMinimo: 6,
    stockMaximo: 20,
    puntoReorden: 8,
    ubicacionEstante: 'Bodega Limpieza 1',
    fechaUltimoMovimiento: '2026-03-20',
    costoEstandar: 82000,
    valorTotalStock: 984000,
    estadoSuministro: 'OPTIMO'
  },
  {
    id: 5,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    idBodega: 1,
    nombreBodega: 'Almacén Central - Sede Bogotá',
    idArticulo: 5,
    codigoArticulo: 'LEN-SAB-01',
    nombreArticulo: 'Juego de Sábanas Cama Sencilla Algodón 180H',
    categoria: 'Lencería y Ropa de Cama',
    colorCategoria: '#8B5CF6',
    unidadMedida: 'UNIDAD',
    cantidadDisponible: 24,
    cantidadReservada: 0,
    stockMinimo: 10,
    stockMaximo: 40,
    puntoReorden: 15,
    ubicacionEstante: 'Ropería Central',
    fechaUltimoMovimiento: '2026-03-15',
    costoEstandar: 45000,
    valorTotalStock: 1080000,
    estadoSuministro: 'OPTIMO'
  },
  {
    id: 6,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    idBodega: 1,
    nombreBodega: 'Almacén Central - Sede Bogotá',
    idArticulo: 6,
    codigoArticulo: 'NUT-ENS-01',
    nombreArticulo: 'Ensure Advance Vainilla Lata 850g',
    categoria: 'Nutrición y Suplementos Especiales',
    colorCategoria: '#F59E0B',
    unidadMedida: 'FRASCO',
    numeroLote: 'ENS-COL-99',
    fechaVencimiento: '2026-05-10',
    diasParaVencer: 37,
    cantidadDisponible: 14,
    cantidadReservada: 0,
    stockMinimo: 8,
    stockMaximo: 30,
    puntoReorden: 12,
    ubicacionEstante: 'Alacena Nutricional',
    fechaUltimoMovimiento: '2026-03-29',
    costoEstandar: 89000,
    valorTotalStock: 1246000,
    estadoSuministro: 'POR_VENCER'
  },
  // Sede 2 (Campestre La Calera)
  {
    id: 7,
    idCentro: 2,
    nombreCentro: 'Sede Campestre La Calera',
    idBodega: 2,
    nombreBodega: 'Almacén Principal - Sede Campestre',
    idArticulo: 1,
    codigoArticulo: 'INS-PAN-01',
    nombreArticulo: 'Pañal Desechable Adulto Talla G (Paquete x 30)',
    categoria: 'Insumos Asistenciales y Curación',
    colorCategoria: '#0EA5E9',
    unidadMedida: 'PAQUETE',
    cantidadDisponible: 28,
    cantidadReservada: 0,
    stockMinimo: 15,
    stockMaximo: 60,
    puntoReorden: 20,
    ubicacionEstante: 'Depósito 1',
    fechaUltimoMovimiento: '2026-03-27',
    costoEstandar: 58000,
    valorTotalStock: 1624000,
    estadoSuministro: 'OPTIMO'
  },
  {
    id: 8,
    idCentro: 2,
    nombreCentro: 'Sede Campestre La Calera',
    idBodega: 2,
    nombreBodega: 'Almacén Principal - Sede Campestre',
    idArticulo: 2,
    codigoArticulo: 'INS-GLU-02',
    nombreArticulo: 'Tiras Reactivas Glucometría Accu-Chek (Caja x 50)',
    categoria: 'Insumos Asistenciales y Curación',
    colorCategoria: '#0EA5E9',
    unidadMedida: 'CAJA',
    numeroLote: 'L-2026-C2',
    fechaVencimiento: '2026-08-30',
    diasParaVencer: 148,
    cantidadDisponible: 18,
    cantidadReservada: 0,
    stockMinimo: 10,
    stockMaximo: 35,
    puntoReorden: 15,
    ubicacionEstante: 'Botiquín Sede',
    fechaUltimoMovimiento: '2026-03-24',
    costoEstandar: 95000,
    valorTotalStock: 1710000,
    estadoSuministro: 'OPTIMO'
  }
];

export const SEED_MOVIMIENTOS_INVENTARIO: MovimientoInventario[] = [
  {
    id: 1,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    numeroDocumento: 'INV-ENT-2026-0001',
    tipoMovimiento: 'ENTRADA_COMPRA',
    fechaMovimiento: '2026-03-20 09:30:00',
    idUsuarioRegistra: 1,
    nombreUsuarioRegistra: 'Dra. Valentina Morales',
    observaciones: 'Recepción de pedido mensual de insumos clínicos y farmacia',
    estado: 'APLICADO',
    totalArticulos: 60,
    costoTotal: 3480000,
    detalles: [
      {
        id: 101,
        idMovimiento: 1,
        idBodega: 1,
        idArticulo: 1,
        codigoArticulo: 'INS-PAN-01',
        nombreArticulo: 'Pañal Desechable Adulto Talla G (Paquete x 30)',
        unidadMedida: 'UNIDAD',
        cantidad: 30,
        costoUnitario: 58000,
        costoTotal: 1740000,
        saldoAnterior: 15,
        saldoPosterior: 45
      },
      {
        id: 102,
        idMovimiento: 1,
        idBodega: 1,
        idArticulo: 3,
        codigoArticulo: 'MED-SOL-01',
        nombreArticulo: 'Solución Salina Normal 0.9% Bolsa 500ml',
        unidadMedida: 'UNIDAD',
        numeroLote: 'L-SAL-8891',
        fechaVencimiento: '2026-11-30',
        cantidad: 20,
        costoUnitario: 6500,
        costoTotal: 130000,
        saldoAnterior: 12,
        saldoPosterior: 32
      }
    ]
  },
  {
    id: 2,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    numeroDocumento: 'INV-DON-2026-0001',
    tipoMovimiento: 'ENTRADA_DONACION',
    fechaMovimiento: '2026-03-22 10:00:00',
    idUsuarioRegistra: 1,
    nombreUsuarioRegistra: 'Dra. Valentina Morales',
    idResidente: 1,
    nombreResidente: 'Álvaro Delgado Mora',
    observaciones: 'Donación recibida de Carlos Delgado Mora (Hijo / Acudiente Principal): 5 paquetes de pañales talla G para custodia personal',
    estado: 'APLICADO',
    totalArticulos: 150,
    costoTotal: 290000,
    detalles: [
      {
        id: 103,
        idMovimiento: 2,
        idBodega: 1,
        idArticulo: 1,
        codigoArticulo: 'INS-PAN-01',
        nombreArticulo: 'Pañal Desechable Adulto Talla G (Paquete x 30)',
        unidadMedida: 'UNIDAD',
        cantidad: 150,
        cantidadEmpaques: 5,
        unidadesPorEmpaque: 30,
        tipoEmpaque: 'Paquete',
        costoUnitario: 1933,
        costoTotal: 290000,
        saldoAnterior: 45,
        saldoPosterior: 195
      }
    ]
  },
  {
    id: 3,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    numeroDocumento: 'INV-DON-2026-0002',
    tipoMovimiento: 'ENTRADA_DONACION',
    fechaMovimiento: '2026-03-24 15:30:00',
    idUsuarioRegistra: 1,
    nombreUsuarioRegistra: 'Dra. Valentina Morales',
    idResidente: 1,
    nombreResidente: 'Álvaro Delgado Mora',
    observaciones: 'Aporte entregado por Carlos Delgado Mora: 3 latas de Ensure Advance Vainilla para refuerzo nutricional según prescripción',
    estado: 'APLICADO',
    totalArticulos: 3,
    costoTotal: 285000,
    detalles: [
      {
        id: 104,
        idMovimiento: 3,
        idBodega: 1,
        idArticulo: 6,
        codigoArticulo: 'NUT-ENS-01',
        nombreArticulo: 'Ensure Advance Vainilla Lata 850g',
        unidadMedida: 'FRASCO',
        numeroLote: 'LOT-ENS-2026',
        fechaVencimiento: '2027-04-15',
        cantidad: 3,
        costoUnitario: 95000,
        costoTotal: 285000,
        saldoAnterior: 18,
        saldoPosterior: 21
      }
    ]
  },
  {
    id: 4,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    numeroDocumento: 'INV-SAL-2026-0004',
    tipoMovimiento: 'SALIDA_ENTREGA_RESIDENTE',
    fechaMovimiento: '2026-03-28 11:15:00',
    idUsuarioRegistra: 2,
    nombreUsuarioRegistra: 'Martha Cecilia Rodríguez Peña',
    idResidente: 1,
    nombreResidente: 'Álvaro Delgado Mora',
    observaciones: 'Dispensación asistencial semanal para residente Habitación 101: 30 pañales desechables',
    estado: 'APLICADO',
    totalArticulos: 30,
    costoTotal: 58000,
    detalles: [
      {
        id: 105,
        idMovimiento: 4,
        idBodega: 1,
        idArticulo: 1,
        codigoArticulo: 'INS-PAN-01',
        nombreArticulo: 'Pañal Desechable Adulto Talla G (Paquete x 30)',
        unidadMedida: 'UNIDAD',
        cantidad: 30,
        cantidadEmpaques: 1,
        unidadesPorEmpaque: 30,
        tipoEmpaque: 'Paquete',
        costoUnitario: 1933,
        costoTotal: 58000,
        saldoAnterior: 195,
        saldoPosterior: 165
      }
    ]
  },
  {
    id: 5,
    idCentro: 1,
    nombreCentro: 'Sede Central Bogotá',
    numeroDocumento: 'INV-SAL-2026-0005',
    tipoMovimiento: 'SALIDA_ENTREGA_RESIDENTE',
    fechaMovimiento: '2026-03-30 08:30:00',
    idUsuarioRegistra: 2,
    nombreUsuarioRegistra: 'Martha Cecilia Rodríguez Peña',
    idResidente: 1,
    nombreResidente: 'Álvaro Delgado Mora',
    observaciones: 'Entrega a enfermería de 1 lata de Ensure Advance para preparación diaria de tomas nutricionales',
    estado: 'APLICADO',
    totalArticulos: 1,
    costoTotal: 95000,
    detalles: [
      {
        id: 106,
        idMovimiento: 5,
        idBodega: 1,
        idArticulo: 6,
        codigoArticulo: 'NUT-ENS-01',
        nombreArticulo: 'Ensure Advance Vainilla Lata 850g',
        unidadMedida: 'FRASCO',
        numeroLote: 'LOT-ENS-2026',
        fechaVencimiento: '2027-04-15',
        cantidad: 1,
        costoUnitario: 95000,
        costoTotal: 95000,
        saldoAnterior: 21,
        saldoPosterior: 20
      }
    ]
  }
];

export const SEED_TRASLADOS_SEDES: TrasladoSedes[] = [
  {
    id: 1,
    codigoTraslado: 'TRS-2026-0001',
    idCentroOrigen: 1,
    nombreCentroOrigen: 'Sede Central Bogotá',
    idCentroDestino: 2,
    nombreCentroDestino: 'Sede Campestre La Calera',
    fechaEnvio: '2026-03-29 14:00:00',
    estadoTraslado: 'EN_TRANSITO',
    idUsuarioDespacha: 1,
    nombreUsuarioDespacha: 'Dra. Valentina Morales',
    notasDespacho: 'Apoyo por stock crítico de tiras de glucosa y pañales en sede campestre',
    detalles: [
      {
        id: 201,
        idTraslado: 1,
        idArticulo: 1,
        codigoArticulo: 'INS-PAN-01',
        nombreArticulo: 'Pañal Desechable Adulto Talla G (Paquete x 30)',
        unidadMedida: 'PAQUETE',
        cantidadEnviada: 10,
        estadoItem: 'EN_TRANSITO'
      }
    ]
  }
];


