import {
  SedeCentro,
  Residente,
  FamiliarAcudiente,
  TrabajadorEmpleado,
  TurnoAsignado,
  PermisoAusencia,
  IncidenteOperativo,
  ElementoDotacionCatalogo,
  DotacionResidente
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
    esSedePrincipal: true
  },
  {
    id: 2,
    nombre: 'Sede Campestre La Calera',
    codigo: 'SEDE-NORTE',
    ciudad: 'La Calera, Cundinamarca',
    direccion: 'Km 4 Vía La Calera',
    telefono: '+57 (601) 862-4400',
    capacidadTotal: 45,
    esSedePrincipal: false
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
    acudientes: []
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
    acudientes: []
  }
];

export const SEED_TRABAJADORES: TrabajadorEmpleado[] = [
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

