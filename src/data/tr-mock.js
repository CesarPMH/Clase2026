// TR Capital — Mock Data

export const kpiStrip = [
  { label: 'Oferta',     amount: 13850000,  count: 6,  diasProm: 5 },
  { label: 'Pre Reg.',   amount: 70223000,  count: 8,  diasProm: 5 },
  { label: 'CNAD',       amount: 4000000,   count: 1,  diasProm: 5 },
  { label: 'Revisión',   amount: 50000000,  count: 2,  diasProm: 5 },
  { label: 'Habilitado', amount: 0,         count: 0,  diasProm: 5 },
  { label: 'Emitido',    amount: 159400000, count: 6,  diasProm: 5 },
  { label: 'Comp.',      amount: 159400000, count: 6,  diasProm: 5 },
  { label: 'Historicos', amount: 159400000, count: 6,  diasProm: 5 },
  { label: 'Vencidos',   amount: 0,         count: 4,  diasProm: 5, alert: true },
];

const ETAPAS_BASE = [
  { key: 'oferta',      label: 'Oferta',      sub: 'Presentación de Oferta' },
  { key: 'preReg',      label: 'Pre-Registro', sub: 'Documentación Inicial' },
  { key: 'cnad',        label: 'CNAD',         sub: 'En Revisión CNAD' },
  { key: 'revision',    label: 'Revisión',     sub: 'Requiere Correcciones' },
  { key: 'habilitado',  label: 'Habilitado',   sub: 'Documentación Habilitada' },
  { key: 'emitido',     label: 'Emitido',      sub: 'Emisión del Proyecto' },
];

function makeEtapas(currentKey) {
  const idx = ETAPAS_BASE.findIndex(e => e.key === currentKey);
  return ETAPAS_BASE.map((e, i) => ({
    ...e,
    status: i < idx ? 'done' : i === idx ? 'active' : 'pending',
  }));
}

export const USUARIOS = [
  { id: 'CR', nombre: 'Carlos R.',  color: '#547e69' },
  { id: 'ML', nombre: 'Maria L.',   color: '#1a1a1a' },
  { id: 'RM', nombre: 'Rodrigo M.', color: '#4d3f32' },
  { id: 'HM', nombre: 'Hugo M.',    color: '#059669' },
];

const DOCS_TEMPLATE = [
  { id: 1, nombre: 'DOCUMENTO 1', tipo: 'Firmado', tamano: '346 MB', subidoPor: 'Carlos R.', modificacion: 'Abr 21, 2025' },
  { id: 2, nombre: 'DOCUMENTO 2', tipo: 'Legal',   tamano: '346 MB', subidoPor: 'Carlos R.', modificacion: 'Abr 21, 2025' },
  { id: 3, nombre: 'DOCUMENTO 3', tipo: 'Cliente', tamano: '346 MB', subidoPor: 'Carlos R.', modificacion: 'Abr 21, 2025' },
  { id: 4, nombre: 'DOCUMENTO 4', tipo: 'CNAD',    tamano: '346 MB', subidoPor: 'Carlos R.', modificacion: 'Abr 21, 2025' },
  { id: 5, nombre: 'DOCUMENTO 5', tipo: 'Otros',   tamano: '346 MB', subidoPor: 'Carlos R.', modificacion: 'Abr 21, 2025' },
  { id: 6, nombre: 'DOCUMENTO 6', tipo: 'Firmado', tamano: '346 MB', subidoPor: 'Carlos R.', modificacion: 'Abr 21, 2025' },
];

const TAREAS_TEMPLATE = [
  { id: 1, nombre: 'Documentos de información Relevante', desc: 'Verificar que los datos ingresados sean correctos, completos y estén actualizados.', prioridad: 'Alto',  asignados: ['CR','ML','RM'], fechaLimite: 'Abr 21, 2025', activa: true  },
  { id: 2, nombre: 'Seguimiento de ventas asignadas',     desc: 'Monitorear el avance de las ventas bajo responsabilidad del vendedor.',               prioridad: 'Alto',  asignados: ['CR','RM'],       fechaLimite: 'Abr 21, 2025', activa: true  },
  { id: 3, nombre: 'Actualización de estado de clientes', desc: 'Registrar cambios en el estado de cada cliente.',                                       prioridad: 'Bajo',  asignados: ['CR'],             fechaLimite: 'Abr 25, 2025', activa: true  },
  { id: 4, nombre: 'Gestión de notificaciones y recordatorios', desc: 'Enviar y dar seguimiento a alertas relacionadas con pagos.',                       prioridad: 'Alto',  asignados: ['CR','RM'],       fechaLimite: 'Abr 25, 2025', activa: true  },
  { id: 5, nombre: 'Carga y mantenimiento de documentación', desc: 'Leer, organizar y mantener actualizados los documentos requeridos.',                  prioridad: 'Bajo',  asignados: ['CR','ML'],       fechaLimite: 'Abr 25, 2025', activa: true  },
  { id: 6, nombre: 'Análisis de resultados y reporte',    desc: 'Revisar el desempeño general y generar reportes que faciliten la toma de decisiones.',   prioridad: 'Bajo',  asignados: ['CR','RM'],       fechaLimite: 'Abr 25, 2025', activa: false },
  { id: 7, nombre: 'Validación de facturación emitida',   desc: 'Revisar facturas generadas en el sistema y confirmar que los montos sean correctos.',     prioridad: 'Medio', asignados: ['ML'],             fechaLimite: 'Abr 25, 2025', activa: false },
  { id: 8, nombre: 'Seguimiento a oportunidades en negociación', desc: 'Contactar clientes con propuestas enviadas y actualizar estado en CRM.',           prioridad: 'Medio', asignados: ['CR','RM'],       fechaLimite: 'Abr 25, 2025', activa: false },
  { id: 9, nombre: 'Actualización de indicadores en dashboard', desc: 'Revisar y actualizar los KPIs del panel principal según datos del último cliente.', prioridad: 'Alto',  asignados: ['ML'],             fechaLimite: 'Abr 25, 2025', activa: false },
];

const FINANZAS_TEMPLATE = [
  { id: 1, desc: 'Seguimiento de Suscripción', tipo: 'Suscripción', fecha: 'Nov 1, 2026', monto: 500,  estado: 'Completado' },
  { id: 2, desc: 'Seguimiento de Suscripción', tipo: 'Suscripción', fecha: 'Dic 1, 2026', monto: 500,  estado: 'Completado' },
  { id: 3, desc: 'Cobro Por Mantenimiento',    tipo: 'Pago Extra',  fecha: 'Ene 20, 2025', monto: 600, estado: 'Completado' },
  { id: 4, desc: 'Seguimiento de Suscripción', tipo: 'Suscripción', fecha: 'Feb 1, 2026', monto: 500,  estado: 'Atrasado'   },
  { id: 5, desc: 'Seguimiento de Suscripción', tipo: 'Suscripción', fecha: 'Mar 1, 2026', monto: 500,  estado: 'Atrasado'   },
  { id: 6, desc: 'Cobro Por Mantenimiento',    tipo: 'Pago Extra',  fecha: 'Feb 10, 2026', monto: 600, estado: 'Completado' },
  { id: 7, desc: 'Cobro Por Servicio Extra',   tipo: 'Pago Extra',  fecha: 'Feb 26, 2026', monto: 400, estado: 'Completado' },
  { id: 8, desc: 'Seguimiento de Suscripción', tipo: 'Suscripción', fecha: 'Mar 1, 2026', monto: 500,  estado: 'Atrasado'   },
  { id: 9, desc: 'Cobro Por Mantenimiento',    tipo: 'Pago Extra',  fecha: 'Abr 10, 2026', monto: 350, estado: 'Pendiente'  },
];

export const proyectos = [
  {
    id: 22, nombre: 'Puerto Marisco', cliente: 'GRUPO C5, S.A.S. DE C.V.',
    tipo: 'Token de Renta Fija', etapaActual: 'preReg', estado: 'En Progreso',
    fechaCreacion: 'Lunes 25 de septiembre de 2025',
    montoEstimado: 2000, montoDepositado: 4000, tipoEmision: 'Pública',
    progresoGeneral: 9, diasAbierto: 30, diasEnEtapa: 15,
    encargados: ['CR', 'RM'],
    docs: { firmado: 5, legal: 5, cliente: 5, cnad: 5, total: 10 },
    totalImpl: 2000, totalImplGoal: 4000,
    etapas: makeEtapas('preReg'),
    descripcion: 'Este proyecto tiene como objetivo gestionar el proceso de certificación de un activo, asegurando el cumplimiento de todas las normativas necesarias e implementando una ejecución eficiente de ventas dentro de los plazos establecidos.',
    infoProyecto: {
      sector: 'Energía Renovable', estructurador: 'Capital Structuring Group',
      fondo: 'Digital Asset Solutions', certificadora: 'Global Trust Certification',
      tipoToken: 'Token de Renta Fija', activoSubyacente: 'Planta Solar Fotovoltaica',
      precioToken: '$1,200.00', montoTokenizado: '$9,100',
      numeroTokens: 250, blockchain: 'Polygon',
      nombreToken: 'Solar Energy 2026', plazoEmision: '36 Meses',
    },
    infoCliente: {
      nombre: 'GRUPO C5, S.A.S. DE C.V.', telefono: '+503 7777-7777',
      correo: 'inver.globales@gmail.com', tipoPersona: 'Jurídica',
      tipoDocumento: 'NIT', nDocumento: '06909109-5', caracter: 'Representante Legal',
      direccion: 'Av. La capilla #ja. La Revolución #456',
    },
    tareas: TAREAS_TEMPLATE,
    documentos: DOCS_TEMPLATE,
    finanzas: FINANZAS_TEMPLATE,
  },
  {
    id: 23, nombre: 'Hacienda Verde', cliente: 'AGROMAX S.A. DE C.V.',
    tipo: 'Token de Renta Variable', etapaActual: 'oferta', estado: 'Vigente',
    fechaCreacion: 'Martes 10 de octubre de 2025',
    montoEstimado: 5000, montoDepositado: 5000, tipoEmision: 'Privada',
    progresoGeneral: 2, diasAbierto: 30, diasEnEtapa: 8,
    encargados: ['ML'],
    docs: { firmado: 3, legal: 2, cliente: 4, cnad: 1, total: 10 },
    totalImpl: 500, totalImplGoal: 5000,
    etapas: makeEtapas('oferta'),
    descripcion: 'Proyecto de tokenización de activos agroindustriales para financiamiento de operaciones.',
    infoProyecto: {
      sector: 'Agroindustrial', estructurador: 'AgroFinance Group',
      fondo: 'Green Asset Solutions', certificadora: 'Certifica Global',
      tipoToken: 'Token de Renta Variable', activoSubyacente: 'Plantación de Café',
      precioToken: '$800.00', montoTokenizado: '$5,000',
      numeroTokens: 500, blockchain: 'Ethereum',
      nombreToken: 'AgroGreen 2026', plazoEmision: '24 Meses',
    },
    infoCliente: {
      nombre: 'AGROMAX S.A. DE C.V.', telefono: '+503 2222-3333',
      correo: 'contacto@agromax.com', tipoPersona: 'Jurídica',
      tipoDocumento: 'NIT', nDocumento: '12345678-9', caracter: 'Representante Legal',
      direccion: 'Km 45, Carretera al Norte, San Salvador',
    },
    tareas: TAREAS_TEMPLATE.slice(0, 5),
    documentos: DOCS_TEMPLATE.slice(0, 4),
    finanzas: FINANZAS_TEMPLATE.slice(0, 4),
  },
  {
    id: 24, nombre: 'Torres del Norte', cliente: 'INMOBILIARIA TNS S.R.L.',
    tipo: 'Token Inmobiliario', etapaActual: 'cnad', estado: 'En Progreso',
    fechaCreacion: 'Miércoles 5 de noviembre de 2025',
    montoEstimado: 8000, montoDepositado: 3000, tipoEmision: 'Pública',
    progresoGeneral: 35, diasAbierto: 30, diasEnEtapa: 8,
    encargados: ['ML', 'RM'],
    docs: { firmado: 7, legal: 6, cliente: 8, cnad: 3, total: 10 },
    totalImpl: 2000, totalImplGoal: 4000,
    etapas: makeEtapas('cnad'),
    descripcion: 'Tokenización de proyecto inmobiliario residencial en zona norte de la ciudad.',
    infoProyecto: {
      sector: 'Inmobiliario', estructurador: 'RE Capital Partners',
      fondo: 'Real Estate Tokens Fund', certificadora: 'Global Trust Certification',
      tipoToken: 'Token Inmobiliario', activoSubyacente: 'Complejo Residencial',
      precioToken: '$2,500.00', montoTokenizado: '$8,000',
      numeroTokens: 320, blockchain: 'Solana',
      nombreToken: 'TorreNorte 2026', plazoEmision: '48 Meses',
    },
    infoCliente: {
      nombre: 'INMOBILIARIA TNS S.R.L.', telefono: '+503 3333-4444',
      correo: 'info@tns.com.sv', tipoPersona: 'Jurídica',
      tipoDocumento: 'NIT', nDocumento: '98765432-1', caracter: 'Apoderado Legal',
      direccion: 'Col. Escalón, Paseo General Escalón #5550',
    },
    tareas: TAREAS_TEMPLATE.slice(0, 7),
    documentos: DOCS_TEMPLATE,
    finanzas: FINANZAS_TEMPLATE.slice(0, 6),
  },
  {
    id: 25, nombre: 'Costa Azul', cliente: 'MARINA HOLDINGS S.A.',
    tipo: 'Token de Utilidad', etapaActual: 'habilitado', estado: 'Vigente',
    fechaCreacion: 'Jueves 20 de noviembre de 2025',
    montoEstimado: 12000, montoDepositado: 12000, tipoEmision: 'Pública',
    progresoGeneral: 75, diasAbierto: 30, diasEnEtapa: 3,
    encargados: ['RM'],
    docs: { firmado: 9, legal: 8, cliente: 9, cnad: 7, total: 10 },
    totalImpl: 500, totalImplGoal: 5000,
    etapas: makeEtapas('habilitado'),
    descripcion: 'Emisión de tokens de utilidad para acceso a servicios de marina y puertos deportivos.',
    infoProyecto: {
      sector: 'Turismo y Logística', estructurador: 'Blue Ocean Structuring',
      fondo: 'Maritime Asset Fund', certificadora: 'Maritime Certification LLC',
      tipoToken: 'Token de Utilidad', activoSubyacente: 'Marina Turística',
      precioToken: '$500.00', montoTokenizado: '$12,000',
      numeroTokens: 2400, blockchain: 'Polygon',
      nombreToken: 'CostaBlue 2025', plazoEmision: '12 Meses',
    },
    infoCliente: {
      nombre: 'MARINA HOLDINGS S.A.', telefono: '+503 4444-5555',
      correo: 'legal@marinaholdings.com', tipoPersona: 'Jurídica',
      tipoDocumento: 'NIT', nDocumento: '11223344-5', caracter: 'Director General',
      direccion: 'Puerto La Libertad, Zona Portuaria Sur',
    },
    tareas: TAREAS_TEMPLATE.slice(0, 6),
    documentos: DOCS_TEMPLATE,
    finanzas: FINANZAS_TEMPLATE,
  },
  {
    id: 26, nombre: 'Punta Cana Tech', cliente: 'TECHVENTURES GROUP S.A.',
    tipo: 'Token de Equity', etapaActual: 'revision', estado: 'Incompleto',
    fechaCreacion: 'Lunes 1 de diciembre de 2025',
    montoEstimado: 6000, montoDepositado: 1500, tipoEmision: 'Privada',
    progresoGeneral: 48, diasAbierto: 30, diasEnEtapa: 9,
    encargados: ['RM'],
    docs: { firmado: 4, legal: 3, cliente: 5, cnad: 2, total: 10 },
    totalImpl: 2000, totalImplGoal: 4000,
    etapas: makeEtapas('revision'),
    descripcion: 'Tokenización de participación accionaria en startup de tecnología agrícola.',
    infoProyecto: {
      sector: 'Tecnología', estructurador: 'TechCapital Partners',
      fondo: 'Innovation Equity Fund', certificadora: 'Tech Cert Authority',
      tipoToken: 'Token de Equity', activoSubyacente: 'Startup AgriTech',
      precioToken: '$1,000.00', montoTokenizado: '$6,000',
      numeroTokens: 600, blockchain: 'Ethereum',
      nombreToken: 'TechEquity 2026', plazoEmision: '60 Meses',
    },
    infoCliente: {
      nombre: 'TECHVENTURES GROUP S.A.', telefono: '+503 5555-6666',
      correo: 'ventures@techgroup.com', tipoPersona: 'Jurídica',
      tipoDocumento: 'NIT', nDocumento: '55667788-9', caracter: 'Representante Legal',
      direccion: 'Zona Rosa, Calle La Reforma #223',
    },
    tareas: TAREAS_TEMPLATE,
    documentos: DOCS_TEMPLATE.slice(0, 5),
    finanzas: FINANZAS_TEMPLATE.slice(0, 5),
  },
  {
    id: 27, nombre: 'Sierra Nevada', cliente: 'ENERGÍA LIMPIA S.R.L.',
    tipo: 'Token de Renta Fija', etapaActual: 'emitido', estado: 'Vigente',
    fechaCreacion: 'Viernes 12 de diciembre de 2025',
    montoEstimado: 20000, montoDepositado: 20000, tipoEmision: 'Pública',
    progresoGeneral: 92, diasAbierto: 30, diasEnEtapa: 12,
    encargados: ['ML', 'RM'],
    docs: { firmado: 10, legal: 9, cliente: 10, cnad: 8, total: 10 },
    totalImpl: 500, totalImplGoal: 5000,
    etapas: makeEtapas('emitido'),
    descripcion: 'Tokenización de parque eólico en zona montañosa. Proyecto de energía renovable ya en fase de emisión.',
    infoProyecto: {
      sector: 'Energía Renovable', estructurador: 'WindCapital Group',
      fondo: 'Clean Energy Fund', certificadora: 'Green Certification S.A.',
      tipoToken: 'Token de Renta Fija', activoSubyacente: 'Parque Eólico Sierra',
      precioToken: '$2,000.00', montoTokenizado: '$20,000',
      numeroTokens: 1000, blockchain: 'Polygon',
      nombreToken: 'SierraNev 2025', plazoEmision: '36 Meses',
    },
    infoCliente: {
      nombre: 'ENERGÍA LIMPIA S.R.L.', telefono: '+503 6666-7777',
      correo: 'legal@energialimpia.sv', tipoPersona: 'Jurídica',
      tipoDocumento: 'NIT', nDocumento: '99887766-5', caracter: 'Representante Legal',
      direccion: 'Santa Ana, Av. Independencia #890',
    },
    tareas: TAREAS_TEMPLATE.slice(0, 8),
    documentos: DOCS_TEMPLATE,
    finanzas: FINANZAS_TEMPLATE,
  },
];

export const clientesMock = [
  { id: 1345, cliente: 'Amartínez', documento: 'DUI: 123456678-9',    direccion: 'Col. Escalón, San...', contacto: '+503 7777 7777', categoria: 'Corporativa', tipo: 'Natural' },
  { id: 1346, cliente: 'Amartínez', documento: 'NIT: 0611-123564-001-7', direccion: 'Col. Escalón, San...', contacto: '+503 7777 7777', categoria: 'Corporativa', tipo: 'Natural' },
  { id: 1347, cliente: 'Amartínez', documento: 'DUI: 12345678-9',    direccion: 'Col. Escalón, San...', contacto: '+503 7777 7777', categoria: 'Corporativa', tipo: 'Natural' },
  { id: 1348, cliente: 'Amartínez', documento: 'NIT: 0611-123564-001-7', direccion: 'Col. Escalón, San...', contacto: '+503 7777 7777', categoria: 'Corporativa', tipo: 'Natural' },
  { id: 1349, cliente: 'Amartínez', documento: 'DUI: 12345678-9',    direccion: 'Col. Escalón, San...', contacto: '+503 7777 7777', categoria: 'Corporativa', tipo: 'Natural' },
  { id: 1350, cliente: 'Amartínez', documento: 'NIT: 0611-123564-001-7', direccion: 'Col. Escalón, San...', contacto: '+503 7777 7777', categoria: 'Corporativa', tipo: 'Natural' },
  { id: 1351, cliente: 'Amartínez', documento: 'DUI: 12345678-9',    direccion: 'Col. Escalón, San...', contacto: '+503 7777 7777', categoria: 'Corporativa', tipo: 'Natural' },
  { id: 1352, cliente: 'Amartínez', documento: 'NIT: 0611-123564-001-7', direccion: 'Col. Escalón, San...', contacto: '+503 7777 7777', categoria: 'Corporativa', tipo: 'Natural' },
  { id: 1353, cliente: 'Amartínez', documento: 'DUI: 12345678-9',    direccion: 'Col. Escalón, San...', contacto: '+503 7777 7777', categoria: 'Corporativa', tipo: 'Natural' },
  { id: 1354, cliente: 'Amartínez', documento: 'NIT: 0611-123564-001-7', direccion: 'Col. Escalón, San...', contacto: '+503 7777 7777', categoria: 'Corporativa', tipo: 'Natural' },
];

export const ETAPA_COLOR = {
  oferta:     { bg: '#f6f6f6', color: '#585858', border: '#d4d4d4' },
  preReg:     { bg: '#ededed', color: '#4d3f32', border: '#c2c2c2' },
  cnad:       { bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  revision:   { bg: '#ffedd5', color: '#c2410c', border: '#fdba74' },
  habilitado: { bg: '#e8e8e8', color: '#1a1a1a', border: '#b8b8b8' },
  emitido:    { bg: '#dcfce7', color: '#166534', border: '#86efac' },
};

export const ESTADO_CHIP = {
  'En Progreso': { bg: '#e8e8e8', color: '#1a1a1a' },
  'Vigente':     { bg: '#dcfce7', color: '#166534' },
  'Incompleto':  { bg: '#fee2e2', color: '#dc2626' },
  'Completado':  { bg: '#d1fae5', color: '#065f46' },
  'Atrasado':    { bg: '#fee2e2', color: '#dc2626' },
  'Pendiente':   { bg: '#fef3c7', color: '#92400e' },
};

export const PRIORIDAD_CHIP = {
  'Alto':  { bg: '#fee2e2', color: '#dc2626' },
  'Medio': { bg: '#e8e8e8', color: '#1a1a1a' },
  'Bajo':  { bg: '#f3f4f6', color: '#727272' },
};
