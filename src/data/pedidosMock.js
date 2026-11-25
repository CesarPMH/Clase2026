// ─── Clientes ────────────────────────────────────────────────────────────────
export const CLIENTES = [
  { id: 1, dui: '021135560', nombre: 'Pablo Herrera', telefono: '+503 7777 7777', email: 'correo@correo.com', tipo: 'Natural', direcciones: [
    { id: 1, direccion: 'Col. Escalón, Av. 12 #8', departamento: 'San Salvador', municipio: 'San Salvador', comentario: 'Portón azul, timbre derecho' },
    { id: 2, direccion: 'Residencial Miraflores, Calle Principal #8', departamento: 'La Libertad', municipio: 'Antiguo Cuscatlán', comentario: '' },
  ]},
  { id: 2, dui: '777777777', nombre: 'Ana Lucía Rivas', telefono: '+503 2222 2222', email: 'analucia@correo.com', tipo: 'Natural', direcciones: [
    { id: 1, direccion: 'Calle La Mascota #45', departamento: 'San Salvador', municipio: 'San Salvador', comentario: 'Colonia San Benito' },
  ]},
  { id: 3, nit: '0614-010101-001-2', nombre: 'Comercial Altavista S.A.', telefono: '+503 2222 2222', email: 'ventas@altavista.com', tipo: 'Jurídico', direcciones: [
    { id: 1, direccion: 'Centro Comercial Galerías, Local 12', departamento: 'San Salvador', municipio: 'San Salvador', comentario: 'Nivel 2, frente a escaleras' },
  ]},
  { id: 4, dui: '022222222', nombre: 'Pablo Medina', telefono: '+503 7777 7777', email: '', tipo: 'Natural', direcciones: [] },
  { id: 5, dui: '033333333', nombre: 'Marta Lemus', telefono: '+503 6666 6666', email: 'marta@correo.com', tipo: 'Natural', direcciones: [
    { id: 1, direccion: 'Pasaje 3 #12', departamento: 'La Libertad', municipio: 'Antiguo Cuscatlán', comentario: 'Colonia Jardines de Guadalupe' },
  ]},
  { id: 6, nit: '0614-020202-001-3', nombre: 'Corporación Nexo Ltda.', telefono: '+503 2233 4455', email: 'contacto@nexo.com', tipo: 'Jurídico', direcciones: [
    { id: 1, direccion: 'Zona Industrial San Bartolo, Bodega 5', departamento: 'San Salvador', municipio: 'Ilopango', comentario: '' },
    { id: 2, direccion: '4a Calle Poniente #320', departamento: 'La Libertad', municipio: 'Santa Tecla', comentario: 'Edificio Torre Azul, piso 3' },
  ]},
];

// ─── Pedidos ──────────────────────────────────────────────────────────────────
export const PEDIDOS_INICIALES = [
  {
    id: 'PED-2606-001', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 8 }],
    registro: '2026-06-01T09:15:00', entrega: '2026-06-07T15:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Silvia Rosales', telefono: '+503 7810 2233' },
    tipoCliente: 'Natural', estadoPago: 'Pendiente', total: 30,
  },
  {
    id: 'PED-2606-002', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-VAN-007' },
      { tipo: 'Catálogo', label: 'Orden #3', qty: 20 },
      { tipo: 'Accesorios', label: 'Orden #4', accDe: 'PP-CHO-003', codigos: ['ACC-FLO-001', 'ACC-LAZ-002'] },
    ],
    registro: '2026-06-02T10:30:00', entrega: '2026-06-10T15:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Repostería Casa Nuestra S.A.', telefono: '+503 2222 2222' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 111,
  },
  {
    id: 'PED-2606-003', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Catálogo', label: 'Orden #1', qty: 1 },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-CHO-003' },
    ],
    registro: '2026-06-03T12:16:00', entrega: '2026-06-09T12:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Ana Lucía Rivas', telefono: '+503 2222 2222' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 75,
  },
  {
    id: 'PED-2606-004', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 50 },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-TRE-012', codigos: ['ACC-VEL-010'] },
    ],
    registro: '2026-06-03T17:22:00', entrega: '2026-06-12T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Delicias del Instante Ltda.', telefono: '+503 5555 5555' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 88,
  },
  {
    id: 'PED-2606-005', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-VAN-007' },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-VAN-007', codigos: ['ACC-FLO-001'] },
      { tipo: 'Catálogo', label: 'Orden #4', qty: 12 },
    ],
    registro: '2026-06-04T14:37:00', entrega: '2026-06-12T15:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Delicias del Instante Ltda.', telefono: '+503 5555 5555' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 150,
  },
  {
    id: 'PED-2606-006', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Catálogo', label: 'Orden #1', qty: 3 },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-LIM-019' },
    ],
    registro: '2026-06-04T16:14:00', entrega: '2026-06-11T15:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'César Mendieta', telefono: '+503 7612 9900' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 60,
  },
  {
    id: 'PED-2606-007', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Accesorios', label: 'Orden #1', codigos: ['ACC-LAZ-002', 'ACC-VEL-010'] }],
    registro: '2026-06-05T08:50:00', entrega: '2026-06-09T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Lorena Fuentes', telefono: '+503 6644 1122' },
    tipoCliente: 'Natural', estadoPago: 'Pendiente', total: 25,
  },
  {
    id: 'PED-2606-008', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Accesorios', label: 'Orden #2', accDe: 'PP-CHO-003', codigos: ['ACC-FLO-001', 'ACC-LAZ-002', 'ACC-VEL-010'] },
    ],
    registro: '2026-06-05T11:05:00', entrega: '2026-06-10T14:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Convites y Más S.A.', telefono: '+503 2244 7788' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 195,
  },
  {
    id: 'PED-2606-009', tipoPedido: 'Reserva',
    lineas: [
      { tipo: 'Catálogo', label: 'Orden #1', qty: 4 },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 7 },
    ],
    registro: '2026-06-06T09:30:00', entrega: '2026-06-12T15:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Rodrigo Cordero', telefono: '+503 7823 4411' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 42,
  },
  {
    id: 'PED-2606-010', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 1 },
      { tipo: 'Catálogo', label: 'Orden #3', qty: 6 },
    ],
    registro: '2026-06-07T13:20:00', entrega: '2026-06-09T12:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Dulcería La Soberana Ltda.', telefono: '+503 2100 3399' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 220,
  },
  {
    id: 'PED-2606-011', tipoPedido: 'Reserva',
    lineas: [
      { tipo: 'Accesorios', label: 'Orden #1', codigos: ['ACC-FLO-001'] },
      { tipo: 'Accesorios', label: 'Orden #2', codigos: ['ACC-LAZ-002', 'ACC-VEL-010'] },
    ],
    registro: '2026-06-07T15:45:00', entrega: '2026-06-12T16:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Irene Tobar', telefono: '+503 7934 5566' },
    tipoCliente: 'Natural', estadoPago: 'Pendiente', total: 38,
  },
  {
    id: 'PED-2606-012', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-VAN-007' },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-VAN-007', codigos: ['ACC-FLO-001', 'ACC-LAZ-002'] },
    ],
    registro: '2026-06-08T10:00:00', entrega: '2026-06-12T11:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Grupo Festejos S.A.', telefono: '+503 2300 8800' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 310,
  },
  {
    id: 'PED-2606-013', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 15 }],
    registro: '2026-06-09T08:20:00', entrega: '2026-06-11T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Diana Hidalgo', telefono: '+503 6512 4477' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 55,
  },
  {
    id: 'PED-2606-014', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-LIM-019' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 2 },
    ],
    registro: '2026-06-09T14:00:00', entrega: '2026-06-09T18:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Mauricio Ángel Reyes', telefono: '+503 7001 2288' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 90,
  },
  {
    id: 'PED-2606-015', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-VAN-007' },
      { tipo: 'Pastel Personalizado', label: 'Orden #3', codigo: 'PP-TRE-012' },
    ],
    registro: '2026-06-09T16:30:00', entrega: '2026-06-12T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Enlaces & Ceremonias Selecta S.A.', telefono: '+503 2500 9911' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 480,
  },

  // ── Junio 2026 (adicionales) ──────────────────────────────────────────────────
  {
    id: 'PED-2606-016', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Accesorios', label: 'Orden #2', accDe: 'PP-CHO-003', codigos: ['ACC-FLO-001', 'ACC-LAZ-002'] },
    ],
    registro: '2026-06-10T09:10:00', entrega: '2026-06-14T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Verónica Maldonado', telefono: '+503 7711 3344' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 72,
  },
  {
    id: 'PED-2606-017', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 24 }],
    registro: '2026-06-10T11:30:00', entrega: '2026-06-13T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Convites Ingeniosos S.A.', telefono: '+503 2233 9988' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 48,
  },
  {
    id: 'PED-2606-018', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-VAN-007' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 6 },
    ],
    registro: '2026-06-11T14:00:00', entrega: '2026-06-16T15:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Federico Cabrera', telefono: '+503 6611 5522' },
    tipoCliente: 'Natural', estadoPago: 'Anticipo', total: 95,
  },
  {
    id: 'PED-2606-019', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-LIM-019' },
      { tipo: 'Catálogo', label: 'Orden #3', qty: 12 },
    ],
    registro: '2026-06-12T10:20:00', entrega: '2026-06-17T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Dulcería La Soberana Ltda.', telefono: '+503 2100 3399' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 185,
  },
  {
    id: 'PED-2606-020', tipoPedido: 'Reserva',
    lineas: [
      { tipo: 'Catálogo', label: 'Orden #1', qty: 10 },
      { tipo: 'Accesorios', label: 'Orden #2', codigos: ['ACC-VEL-010'] },
    ],
    registro: '2026-06-13T08:45:00', entrega: '2026-06-18T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Silvia Rosales', telefono: '+503 7810 2233' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 40,
  },
  {
    id: 'PED-2606-021', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Accesorios', label: 'Orden #2', accDe: 'PP-CHO-003', codigos: ['ACC-FLO-001', 'ACC-LAZ-002', 'ACC-VEL-010'] },
    ],
    registro: '2026-06-14T13:00:00', entrega: '2026-06-19T15:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Grupo Festejos S.A.', telefono: '+503 2300 8800' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 230,
  },
  {
    id: 'PED-2606-022', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-VAN-007' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-CHO-003' },
    ],
    registro: '2026-06-15T09:00:00', entrega: '2026-06-20T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Enlaces & Ceremonias Selecta S.A.', telefono: '+503 2500 9911' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 310,
  },
  {
    id: 'PED-2606-023', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 30 }],
    registro: '2026-06-16T10:15:00', entrega: '2026-06-20T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Ana Lucía Rivas', telefono: '+503 2222 2222' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 60,
  },
  {
    id: 'PED-2606-024', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 8 },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-TRE-012', codigos: ['ACC-LAZ-002'] },
    ],
    registro: '2026-06-17T15:30:00', entrega: '2026-06-22T14:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Delicias del Instante Ltda.', telefono: '+503 5555 5555' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 145,
  },
  {
    id: 'PED-2606-025', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-LIM-019' },
      { tipo: 'Pastel Personalizado', label: 'Orden #3', codigo: 'PP-VAN-007' },
      { tipo: 'Catálogo', label: 'Orden #4', qty: 20 },
    ],
    registro: '2026-06-18T11:00:00', entrega: '2026-06-23T15:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Repostería Casa Nuestra S.A.', telefono: '+503 2222 2222' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 420,
  },
  {
    id: 'PED-2606-026', tipoPedido: 'Reserva',
    lineas: [
      { tipo: 'Accesorios', label: 'Orden #1', codigos: ['ACC-FLO-001', 'ACC-VEL-010'] },
    ],
    registro: '2026-06-19T09:30:00', entrega: '2026-06-23T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Lorena Fuentes', telefono: '+503 6644 1122' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 28,
  },
  {
    id: 'PED-2606-027', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Accesorios', label: 'Orden #2', accDe: 'PP-TRE-012', codigos: ['ACC-LAZ-002', 'ACC-FLO-001'] },
      { tipo: 'Catálogo', label: 'Orden #3', qty: 4 },
    ],
    registro: '2026-06-20T14:00:00', entrega: '2026-06-25T14:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Convites y Más S.A.', telefono: '+503 2244 7788' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 175,
  },
  {
    id: 'PED-2606-028', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 15 },
    ],
    registro: '2026-06-21T10:00:00', entrega: '2026-06-26T15:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Marta Lemus', telefono: '+503 6666 6666' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 110,
  },
  {
    id: 'PED-2606-029', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 18 }],
    registro: '2026-06-22T08:00:00', entrega: '2026-06-26T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Rodrigo Cordero', telefono: '+503 7823 4411' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 54,
  },
  {
    id: 'PED-2606-030', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-VAN-007' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-CHO-003' },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-VAN-007', codigos: ['ACC-FLO-001'] },
    ],
    registro: '2026-06-23T10:00:00', entrega: '2026-06-27T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Enlaces & Ceremonias Selecta S.A.', telefono: '+503 2500 9911' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 290,
  },
  {
    id: 'PED-2606-031', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 20 }],
    registro: '2026-06-23T14:00:00', entrega: '2026-06-27T10:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Diana Hidalgo', telefono: '+503 6512 4477' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 44,
  },
  {
    id: 'PED-2606-032', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 10 },
    ],
    registro: '2026-06-24T11:30:00', entrega: '2026-06-28T15:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'César Mendieta', telefono: '+503 7612 9900' },
    tipoCliente: 'Natural', estadoPago: 'Anticipo', total: 120,
  },
  {
    id: 'PED-2606-033', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-VAN-007' },
      { tipo: 'Pastel Personalizado', label: 'Orden #3', codigo: 'PP-LIM-019' },
      { tipo: 'Catálogo', label: 'Orden #4', qty: 25 },
    ],
    registro: '2026-06-24T13:00:00', entrega: '2026-06-29T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Dulcería La Soberana Ltda.', telefono: '+503 2100 3399' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 380,
  },
  {
    id: 'PED-2606-034', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Accesorios', label: 'Orden #2', accDe: 'PP-TRE-012', codigos: ['ACC-FLO-001', 'ACC-LAZ-002', 'ACC-VEL-010'] },
    ],
    registro: '2026-06-25T14:30:00', entrega: '2026-06-29T15:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Convites y Más S.A.', telefono: '+503 2244 7788' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 210,
  },
  {
    id: 'PED-2606-035', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 5 },
    ],
    registro: '2026-06-26T10:00:00', entrega: '2026-06-30T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Mauricio Ángel Reyes', telefono: '+503 7001 2288' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 85,
  },
  {
    id: 'PED-2606-036', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 35 }],
    registro: '2026-06-26T15:30:00', entrega: '2026-06-30T10:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Grupo Festejos S.A.', telefono: '+503 2300 8800' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 70,
  },
  {
    id: 'PED-2606-037', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-VAN-007' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-CHO-003' },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-VAN-007', codigos: ['ACC-FLO-001', 'ACC-LAZ-002'] },
      { tipo: 'Catálogo', label: 'Orden #4', qty: 15 },
    ],
    registro: '2026-06-27T11:00:00', entrega: '2026-06-30T15:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Delicias del Instante Ltda.', telefono: '+503 5555 5555' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 320,
  },
  {
    id: 'PED-2606-038', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-VAN-007' },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-CHO-003', codigos: ['ACC-LAZ-002'] },
      { tipo: 'Catálogo', label: 'Orden #4', qty: 8 },
    ],
    registro: '2026-06-28T14:30:00', entrega: '2026-06-30T15:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Repostería Casa Nuestra S.A.', telefono: '+503 2222 2222' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 265,
  },
  {
    id: 'PED-2606-039', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-LIM-019' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 20 },
    ],
    registro: '2026-06-29T10:00:00', entrega: '2026-06-30T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Corporación Nexo Ltda.', telefono: '+503 2233 4455' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 130,
  },
  {
    id: 'PED-2606-040', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-CHO-003' },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-TRE-012', codigos: ['ACC-FLO-001', 'ACC-VEL-010'] },
    ],
    registro: '2026-06-29T15:00:00', entrega: '2026-06-30T15:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Verónica Maldonado', telefono: '+503 7711 3344' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 95,
  },

  // ── Julio 2026 ────────────────────────────────────────────────────────────────
  {
    id: 'PED-2607-001', tipoPedido: 'Producción',
    lineas: [{ tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' }, { tipo: 'Accesorios', label: 'Orden #2', accDe: 'PP-CHO-003', codigos: ['ACC-FLO-001'] }],
    registro: '2026-07-01T09:00:00', entrega: '2026-07-05T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Verónica Maldonado', telefono: '+503 7711 3344' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 72,
  },
  {
    id: 'PED-2607-002', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 24 }],
    registro: '2026-07-02T11:00:00', entrega: '2026-07-07T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Convites Ingeniosos S.A.', telefono: '+503 2233 9988' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 48,
  },
  {
    id: 'PED-2607-003', tipoPedido: 'Producción',
    lineas: [{ tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-VAN-007' }, { tipo: 'Catálogo', label: 'Orden #2', qty: 6 }],
    registro: '2026-07-05T14:00:00', entrega: '2026-07-10T15:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Federico Cabrera', telefono: '+503 6611 5522' },
    tipoCliente: 'Natural', estadoPago: 'Anticipo', total: 95,
  },
  {
    id: 'PED-2607-004', tipoPedido: 'Producción',
    lineas: [{ tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' }, { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-LIM-019' }, { tipo: 'Catálogo', label: 'Orden #3', qty: 12 }],
    registro: '2026-07-07T10:00:00', entrega: '2026-07-12T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Dulcería La Soberana Ltda.', telefono: '+503 2100 3399' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 185,
  },
  {
    id: 'PED-2607-005', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 10 }, { tipo: 'Accesorios', label: 'Orden #2', codigos: ['ACC-VEL-010'] }],
    registro: '2026-07-08T09:00:00', entrega: '2026-07-13T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Silvia Rosales', telefono: '+503 7810 2233' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 40,
  },
  {
    id: 'PED-2607-006', tipoPedido: 'Producción',
    lineas: [{ tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' }, { tipo: 'Accesorios', label: 'Orden #2', accDe: 'PP-CHO-003', codigos: ['ACC-FLO-001', 'ACC-LAZ-002'] }],
    registro: '2026-07-10T13:00:00', entrega: '2026-07-15T15:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Grupo Festejos S.A.', telefono: '+503 2300 8800' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 230,
  },
  {
    id: 'PED-2607-007', tipoPedido: 'Producción',
    lineas: [{ tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-VAN-007' }, { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-CHO-003' }],
    registro: '2026-07-12T09:00:00', entrega: '2026-07-17T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Enlaces & Ceremonias Selecta S.A.', telefono: '+503 2500 9911' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 310,
  },
  {
    id: 'PED-2607-008', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 30 }],
    registro: '2026-07-14T10:00:00', entrega: '2026-07-19T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Ana Lucía Rivas', telefono: '+503 2222 2222' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 60,
  },
  {
    id: 'PED-2607-009', tipoPedido: 'Producción',
    lineas: [{ tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' }, { tipo: 'Catálogo', label: 'Orden #2', qty: 8 }],
    registro: '2026-07-16T15:00:00', entrega: '2026-07-21T14:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Delicias del Instante Ltda.', telefono: '+503 5555 5555' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 145,
  },
  {
    id: 'PED-2607-010', tipoPedido: 'Producción',
    lineas: [{ tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' }, { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-LIM-019' }, { tipo: 'Catálogo', label: 'Orden #3', qty: 20 }],
    registro: '2026-07-18T11:00:00', entrega: '2026-07-23T15:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Repostería Casa Nuestra S.A.', telefono: '+503 2222 2222' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 420,
  },
  {
    id: 'PED-2607-011', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Accesorios', label: 'Orden #1', codigos: ['ACC-FLO-001', 'ACC-VEL-010'] }],
    registro: '2026-07-20T09:00:00', entrega: '2026-07-24T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Lorena Fuentes', telefono: '+503 6644 1122' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 28,
  },
  {
    id: 'PED-2607-012', tipoPedido: 'Producción',
    lineas: [{ tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' }, { tipo: 'Catálogo', label: 'Orden #2', qty: 4 }],
    registro: '2026-07-22T14:00:00', entrega: '2026-07-27T14:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Convites y Más S.A.', telefono: '+503 2244 7788' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 175,
  },
  {
    id: 'PED-2607-013', tipoPedido: 'Producción',
    lineas: [{ tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' }, { tipo: 'Catálogo', label: 'Orden #2', qty: 15 }],
    registro: '2026-07-24T10:00:00', entrega: '2026-07-29T15:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Marta Lemus', telefono: '+503 6666 6666' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 110,
  },
  {
    id: 'PED-2607-014', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 18 }],
    registro: '2026-07-26T08:00:00', entrega: '2026-07-30T10:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Rodrigo Cordero', telefono: '+503 7823 4411' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 54,
  },
  {
    id: 'PED-2607-015', tipoPedido: 'Producción',
    lineas: [{ tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-VAN-007' }, { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-TRE-012' }, { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-VAN-007', codigos: ['ACC-LAZ-002'] }],
    registro: '2026-07-28T13:00:00', entrega: '2026-07-31T15:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Corporación Nexo Ltda.', telefono: '+503 2233 4455' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 265,
  },

  // ── Agosto 2026 (mes actual) ──────────────────────────────────────────────────
  {
    id: 'PED-2608-001', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-VAN-007' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-CHO-003' },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-VAN-007', codigos: ['ACC-FLO-001'] },
    ],
    registro: '2026-08-01T10:00:00', entrega: '2026-08-06T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Enlaces & Ceremonias Selecta S.A.', telefono: '+503 2500 9911' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 290,
  },
  {
    id: 'PED-2608-002', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 20 }],
    registro: '2026-08-02T09:00:00', entrega: '2026-08-07T10:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Diana Hidalgo', telefono: '+503 6512 4477' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 44,
  },
  {
    id: 'PED-2608-003', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 10 },
    ],
    registro: '2026-08-04T11:30:00', entrega: '2026-08-09T15:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'César Mendieta', telefono: '+503 7612 9900' },
    tipoCliente: 'Natural', estadoPago: 'Anticipo', total: 120,
  },
  {
    id: 'PED-2608-004', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-VAN-007' },
      { tipo: 'Pastel Personalizado', label: 'Orden #3', codigo: 'PP-LIM-019' },
      { tipo: 'Catálogo', label: 'Orden #4', qty: 25 },
    ],
    registro: '2026-08-05T13:00:00', entrega: '2026-08-11T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Dulcería La Soberana Ltda.', telefono: '+503 2100 3399' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 380,
  },
  {
    id: 'PED-2608-005', tipoPedido: 'Reserva',
    lineas: [
      { tipo: 'Catálogo', label: 'Orden #1', qty: 8 },
      { tipo: 'Accesorios', label: 'Orden #2', codigos: ['ACC-LAZ-002'] },
    ],
    registro: '2026-08-06T09:15:00', entrega: '2026-08-11T10:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Irene Tobar', telefono: '+503 7934 5566' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 36,
  },
  {
    id: 'PED-2608-006', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Accesorios', label: 'Orden #2', accDe: 'PP-TRE-012', codigos: ['ACC-FLO-001', 'ACC-LAZ-002', 'ACC-VEL-010'] },
    ],
    registro: '2026-08-07T14:30:00', entrega: '2026-08-13T15:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Convites y Más S.A.', telefono: '+503 2244 7788' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 210,
  },
  {
    id: 'PED-2608-007', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 5 },
    ],
    registro: '2026-08-08T10:00:00', entrega: '2026-08-14T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Mauricio Ángel Reyes', telefono: '+503 7001 2288' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 85,
  },
  {
    id: 'PED-2608-008', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 35 }],
    registro: '2026-08-10T08:30:00', entrega: '2026-08-15T10:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Grupo Festejos S.A.', telefono: '+503 2300 8800' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 70,
  },
  {
    id: 'PED-2608-009', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-VAN-007' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-CHO-003' },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-VAN-007', codigos: ['ACC-FLO-001', 'ACC-LAZ-002'] },
      { tipo: 'Catálogo', label: 'Orden #4', qty: 15 },
    ],
    registro: '2026-08-11T11:00:00', entrega: '2026-08-16T15:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Delicias del Instante Ltda.', telefono: '+503 5555 5555' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 320,
  },
  {
    id: 'PED-2608-010', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 6 },
    ],
    registro: '2026-08-12T13:00:00', entrega: '2026-08-17T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Verónica Maldonado', telefono: '+503 7711 3344' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 95,
  },
  {
    id: 'PED-2608-011', tipoPedido: 'Reserva',
    lineas: [
      { tipo: 'Catálogo', label: 'Orden #1', qty: 12 },
      { tipo: 'Accesorios', label: 'Orden #2', codigos: ['ACC-VEL-010', 'ACC-FLO-001'] },
    ],
    registro: '2026-08-13T09:00:00', entrega: '2026-08-18T10:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Federico Cabrera', telefono: '+503 6611 5522' },
    tipoCliente: 'Natural', estadoPago: 'Pagado', total: 52,
  },
  {
    id: 'PED-2608-012', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-CHO-003' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-VAN-007' },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-CHO-003', codigos: ['ACC-LAZ-002'] },
      { tipo: 'Catálogo', label: 'Orden #4', qty: 8 },
    ],
    registro: '2026-08-13T14:30:00', entrega: '2026-08-19T15:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Repostería Casa Nuestra S.A.', telefono: '+503 2222 2222' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 265,
  },
  {
    id: 'PED-2608-013', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-LIM-019' },
      { tipo: 'Catálogo', label: 'Orden #2', qty: 20 },
    ],
    registro: '2026-08-14T10:00:00', entrega: '2026-08-20T14:00:00',
    vendedor: 'Andrea M.', cliente: { nombre: 'Corporación Nexo Ltda.', telefono: '+503 2233 4455' },
    tipoCliente: 'Jurídico', estadoPago: 'Pagado', total: 130,
  },
  {
    id: 'PED-2608-014', tipoPedido: 'Reserva',
    lineas: [{ tipo: 'Catálogo', label: 'Orden #1', qty: 16 }],
    registro: '2026-08-14T11:20:00', entrega: '2026-08-19T10:00:00',
    vendedor: 'Mariana V.', cliente: { nombre: 'Ana Lucía Rivas', telefono: '+503 2222 2222' },
    tipoCliente: 'Natural', estadoPago: 'Contra Entrega', total: 48,
  },
  {
    id: 'PED-2608-015', tipoPedido: 'Producción',
    lineas: [
      { tipo: 'Pastel Personalizado', label: 'Orden #1', codigo: 'PP-TRE-012' },
      { tipo: 'Pastel Personalizado', label: 'Orden #2', codigo: 'PP-CHO-003' },
      { tipo: 'Accesorios', label: 'Orden #3', accDe: 'PP-TRE-012', codigos: ['ACC-FLO-001', 'ACC-VEL-010'] },
    ],
    registro: '2026-08-14T15:00:00', entrega: '2026-08-20T15:00:00',
    vendedor: 'Christian B.', cliente: { nombre: 'Enlaces & Ceremonias Selecta S.A.', telefono: '+503 2500 9911' },
    tipoCliente: 'Jurídico', estadoPago: 'Anticipo', total: 410,
  },
];

// ─── Catálogo de productos ────────────────────────────────────────────────────
export const CATALOGO = [
  { id: 1,  nombre: 'Galleta Muñeca Rosa',               precio: 10.00, categoria: 'Galletería',   sku: 'GAL-001' },
  { id: 2,  nombre: 'Galleta Esponja Marina',           precio: 14.00, categoria: 'Galletería',   sku: 'GAL-002' },
  { id: 3,  nombre: 'Galleta Zodiaco Cangrejo',                precio: 6.00,  categoria: 'Galletería',   sku: 'GAL-003' },
  { id: 4,  nombre: 'Galleta Carita Gatita',      precio: 7.00,  categoria: 'Galletería',   sku: 'GAL-004' },
  { id: 5,  nombre: 'Galleta Adornada',              precio: 11.00, categoria: 'Galletería',   sku: 'GAL-005' },
  { id: 6,  nombre: 'Galleta Adornada E.',           precio: 15.00, categoria: 'Galletería',   sku: 'GAL-006' },
  { id: 7,  nombre: 'Galleta Adornada Especial',     precio: 5.00,  categoria: 'Galletería',   sku: 'GAL-007' },
  { id: 8,  nombre: 'Galleta Adornada Docente',      precio: 7.00,  categoria: 'Galletería',   sku: 'GAL-008' },
  { id: 9,  nombre: 'Galleta Adornada Madre',         precio: 12.00, categoria: 'Galletería',   sku: 'GAL-009' },
  { id: 10, nombre: 'Galleta Adornada Padre',         precio: 9.00,  categoria: 'Galletería',   sku: 'GAL-010' },
  { id: 11, nombre: 'Galleta Dinosaurio Troquel',      precio: 11.00, categoria: 'Galletería',   sku: 'GAL-011' },
  { id: 12, nombre: 'Galleta Escudo Héroe Patriota',precio: 12.00, categoria: 'Galletería',   sku: 'GAL-012' },
  { id: 13, nombre: 'Galleta Buen Día',             precio: 3.00,  categoria: 'Galletería',   sku: 'GAL-013' },
  { id: 14, nombre: 'Galleta Pétalo',                  precio: 7.00,  categoria: 'Galletería',   sku: 'GAL-014' },
  { id: 15, nombre: 'Galleta Pétalo Dorado',         precio: 7.00,  categoria: 'Galletería',   sku: 'GAL-015' },
  { id: 16, nombre: 'Galleta Duendecillo Enamorados',    precio: 6.00,  categoria: 'Galletería',   sku: 'GAL-016' },
  { id: 17, nombre: 'Galleta Noche de Brujas',             precio: 5.00,  categoria: 'Galletería',   sku: 'GAL-017' },
  { id: 18, nombre: 'Galleta Noche de Brujas Duende',       precio: 3.00,  categoria: 'Galletería',   sku: 'GAL-018' },
  { id: 19, nombre: 'Galleta Feliz Aniversario de Vida',        precio: 5.00,  categoria: 'Galletería',   sku: 'GAL-019' },
  { id: 20, nombre: 'Galleta Hongo Fontanero',           precio: 3.00,  categoria: 'Galletería',   sku: 'GAL-020' },
  { id: 21, nombre: 'Galleta Emblema Murciélago',           precio: 15.00, categoria: 'Galletería',   sku: 'GAL-021' },
  { id: 22, nombre: 'Galleta Fontanero Bigotón',           precio: 6.00,  categoria: 'Galletería',   sku: 'GAL-022' },
  { id: 23, nombre: 'Galleta Libélula',              precio: 10.00, categoria: 'Galletería',   sku: 'GAL-023' },
  { id: 24, nombre: 'Galleta Ratón Orejón',          precio: 13.00, categoria: 'Galletería',   sku: 'GAL-024' },
  { id: 25, nombre: 'Galleta Cerdita Rosada',             precio: 6.00,  categoria: 'Galletería',   sku: 'GAL-025' },
  { id: 26, nombre: 'Galleta Princesa Durazno',        precio: 15.00, categoria: 'Galletería',   sku: 'GAL-026' },
  { id: 27, nombre: 'Galleta Hombre Araña',             precio: 12.00, categoria: 'Galletería',   sku: 'GAL-027' },
  { id: 30, nombre: 'Tarta de Lima',                  precio: 15.00, categoria: 'Repostería',sku: 'PAS-030' },
  { id: 31, nombre: 'Tarta de Pera',                precio: 15.00, categoria: 'Repostería',sku: 'PAS-031' },
  { id: 32, nombre: 'Tarta de Queso Frutilla',             precio: 18.00, categoria: 'Repostería',sku: 'PAS-032' },
  { id: 33, nombre: 'Brownie Cacao',             precio: 8.00,  categoria: 'Repostería',sku: 'PAS-033' },
  { id: 34, nombre: 'Magdalena Adornada',              precio: 4.00,  categoria: 'Repostería',sku: 'PAS-034' },
  { id: 35, nombre: 'Tartaleta de Frutos',               precio: 22.00, categoria: 'Repostería',sku: 'PAS-035' },
  { id: 40, nombre: 'Agua Pura 600ml',            precio: 1.50,  categoria: 'Refrescos',   sku: 'BEB-040' },
  { id: 41, nombre: 'Café Largo',                precio: 3.00,  categoria: 'Refrescos',   sku: 'BEB-041' },
  { id: 42, nombre: 'Café con Leche',                    precio: 4.00,  categoria: 'Refrescos',   sku: 'BEB-042' },
  { id: 43, nombre: 'Zumo Natural',                  precio: 3.50,  categoria: 'Refrescos',   sku: 'BEB-043' },
  { id: 50, nombre: 'Jalea de Colores',           precio: 5.00,  categoria: 'Dulces',   sku: 'POS-050' },
  { id: 51, nombre: 'Flan de Toffee',              precio: 6.00,  categoria: 'Dulces',   sku: 'POS-051' },
  { id: 52, nombre: 'Espuma de Cacao',           precio: 7.00,  categoria: 'Dulces',   sku: 'POS-052' },
  { id: 60, nombre: '2do Paquete Cabañita a Mitad de Precio',precio: 5.00,categoria: 'Varios',     sku: 'OTR-060' },
  { id: 61, nombre: 'Charola Grande de Rosca Festiva',precio: 6.00,categoria: 'Varios',     sku: 'OTR-061' },
  { id: 62, nombre: 'Frasco de Merengues Primaverales',     precio: 11.00, categoria: 'Varios',     sku: 'OTR-062' },
  { id: 70, nombre: 'Baguette',                   precio: 0.25,  categoria: 'Panificados', sku: 'PAN-070' },
  { id: 71, nombre: 'Pan de Manteca',            precio: 0.50,  categoria: 'Panificados', sku: 'PAN-071' },
  { id: 72, nombre: 'Cuernito',                     precio: 2.50,  categoria: 'Panificados', sku: 'PAN-072' },
  { id: 80, nombre: 'Estuche de Obsequio',                precio: 5.00,  categoria: 'Artículos',  sku: 'PRD-080' },
  { id: 81, nombre: 'Saquito Ornamental',              precio: 3.00,  categoria: 'Artículos',  sku: 'PRD-081' },
  { id: 82, nombre: 'Moño Ornamental',               precio: 1.50,  categoria: 'Artículos',  sku: 'PRD-082' },
];

export const CATALOGO_CATS = ['Todas', 'Refrescos', 'Galletería', 'Varios', 'Panificados', 'Repostería', 'Dulces', 'Artículos'];

// Stock disponible por ítem en sucursal (para pedidos de reserva)
export const STOCK_POR_ITEM = {
  1:25, 2:18, 3:40, 4:30, 5:22, 6:15, 7:45, 8:28, 9:20, 10:35,
  11:12, 12:8, 13:50, 14:38, 15:42, 16:25, 17:30, 18:55, 19:48, 20:60,
  21:10, 22:32, 23:20, 24:18, 25:40, 26:12, 27:16,
  30:5, 31:4, 32:6, 33:15, 34:24, 35:3,
  40:100, 41:80, 42:70, 43:60,
  50:8, 51:10, 52:7,
  60:3, 61:2, 62:5,
  70:200, 71:150, 72:30,
  80:20, 81:25, 82:40,
};

// ─── Accesorios ───────────────────────────────────────────────────────────────
export const ACCESORIOS = [
  { id: 100, nombre: 'Vela #1',                      precio: 3.00,  categoria: 'Todas',               sku: 'ACC-100' },
  { id: 101, nombre: 'Vela #2',                      precio: 7.00,  categoria: 'Todas',               sku: 'ACC-101' },
  { id: 102, nombre: 'Vela #3',                      precio: 12.00, categoria: 'Todas',               sku: 'ACC-102' },
  { id: 103, nombre: 'Vela #4',                      precio: 10.00, categoria: 'Todas',               sku: 'ACC-103' },
  { id: 104, nombre: 'Vela #5',                      precio: 5.00,  categoria: 'Todas',               sku: 'ACC-104' },
  { id: 105, nombre: 'Vela #6',                      precio: 10.00, categoria: 'Todas',               sku: 'ACC-105' },
  { id: 106, nombre: 'Vela #7',                      precio: 6.00,  categoria: 'Todas',               sku: 'ACC-106' },
  { id: 107, nombre: 'Vela #8',                      precio: 9.00,  categoria: 'Todas',               sku: 'ACC-107' },
  { id: 108, nombre: 'Vela #1 Brillo+ Hileras (C.12u)', precio: 5.00,  categoria: 'Mayores',              sku: 'ACC-108' },
  { id: 109, nombre: 'Vela #2 Brillo+ Hileras (C.12u)', precio: 14.00, categoria: 'Mayores',              sku: 'ACC-109' },
  { id: 110, nombre: 'Vela #3 Brillo+ Hileras (C.12u)', precio: 6.00,  categoria: 'Mayores',              sku: 'ACC-110' },
  { id: 111, nombre: 'Vela #4 Brillo+ Hileras (C.12u)', precio: 13.00, categoria: 'Mayores',              sku: 'ACC-111' },
  { id: 112, nombre: 'Vela #5 Brillo+ Hileras (C.12u)', precio: 11.00, categoria: 'Mayores',              sku: 'ACC-112' },
  { id: 113, nombre: 'Vela #6 Brillo+ Hileras (C.12u)', precio: 5.00,  categoria: 'Mayores',              sku: 'ACC-113' },
  { id: 114, nombre: 'Vela #7 Brillo+ Hileras (C.12u)', precio: 3.00,  categoria: 'Mayores',              sku: 'ACC-114' },
  { id: 115, nombre: 'Vela #8 Brillo+ Hileras (C.12u)', precio: 9.00,  categoria: 'Mayores',              sku: 'ACC-115' },
  { id: 116, nombre: 'Vela Encantada',                  precio: 10.00, categoria: 'Todas',               sku: 'ACC-116' },
  { id: 117, nombre: 'Vela Pulida Metálica',         precio: 15.00, categoria: 'Todas',               sku: 'ACC-117' },
  { id: 118, nombre: 'Vela Copa Balompié',             precio: 10.00, categoria: 'Todas',               sku: 'ACC-118' },
  { id: 119, nombre: 'Vela de Figura',             precio: 12.00, categoria: 'Todas',               sku: 'ACC-119' },
  { id: 120, nombre: 'Vela de Pétalo Estuche',            precio: 14.00, categoria: 'Todas',               sku: 'ACC-120' },
  { id: 121, nombre: 'Vela en Flor Magenta',          precio: 11.00, categoria: 'Todas',               sku: 'ACC-121' },
  { id: 122, nombre: 'Vela Espiral Metálicos',     precio: 4.00,  categoria: 'Todas',               sku: 'ACC-122' },
  { id: 123, nombre: 'Velas con Mensaje',                precio: 7.00,  categoria: 'Niños',            sku: 'ACC-123' },
  { id: 124, nombre: 'Velas Numéricas Chicas',             precio: 10.00, categoria: 'Niños',            sku: 'ACC-124' },
  { id: 125, nombre: 'Paquete Cabañita Festiva',           precio: 15.00, categoria: 'Paquetes',                sku: 'ACC-125' },
  { id: 126, nombre: 'Paquete Convite Completo',          precio: 25.00, categoria: 'Paquetes',                sku: 'ACC-126' },
  { id: 127, nombre: 'Merengues Primaverales',            precio: 11.00, categoria: 'Fechas Especiales',sku: 'ACC-127' },
  { id: 128, nombre: 'Alambre Revestido (C-200u)',     precio: 15.00, categoria: 'Todas',               sku: 'ACC-128' },
];

export const ACCESORIOS_CATS = ['Todas', 'Mayores', 'Niños', 'Paquetes', 'Fechas Especiales', 'Adornos'];

// ─── Toppers ─────────────────────────────────────────────────────────────────
export const TOPPERS_SUBCATS = [
  { id: 'impreso',            label: 'Adorno Impreso' },
  { id: 'impreso-edicion',    label: 'Adorno Impreso Editado',       necesitaImagen: true },
  { id: 'troquelado',         label: 'Troquelado' },
  { id: 'troquelado-impreso', label: 'Recortado Impreso + Edición', necesitaImagen: true },
  { id: 'frases',             label: 'Mensajes Prediseñados + Nombre', necesitaNombre: true },
];

export const TOPPERS = [
  // Adorno Impreso
  { id: 300, nombre: 'Adorno Circular 10cm',      precio: 4.00,  subcat: 'impreso',            sku: 'TOP-300' },
  { id: 301, nombre: 'Adorno Circular 15cm',      precio: 5.00,  subcat: 'impreso',            sku: 'TOP-301' },
  { id: 302, nombre: 'Adorno Rectangular 10cm',  precio: 4.50,  subcat: 'impreso',            sku: 'TOP-302' },
  { id: 303, nombre: 'Adorno Rectangular 15cm',  precio: 6.00,  subcat: 'impreso',            sku: 'TOP-303' },
  // Adorno Impreso Editado
  { id: 310, nombre: 'Adorno Impreso Ed. 10cm',  precio: 7.00,  subcat: 'impreso-edicion',    sku: 'TOP-310' },
  { id: 311, nombre: 'Adorno Impreso Ed. 15cm',  precio: 9.00,  subcat: 'impreso-edicion',    sku: 'TOP-311' },
  { id: 312, nombre: 'Adorno Impreso Ed. A4',    precio: 12.00, subcat: 'impreso-edicion',    sku: 'TOP-312' },
  // Troquelado
  { id: 320, nombre: 'Recortado Básico 10cm',   precio: 5.00,  subcat: 'troquelado',         sku: 'TOP-320' },
  { id: 321, nombre: 'Recortado Básico 15cm',   precio: 7.00,  subcat: 'troquelado',         sku: 'TOP-321' },
  { id: 322, nombre: 'Recortado Especial',      precio: 9.00,  subcat: 'troquelado',         sku: 'TOP-322' },
  // Recortado Impreso + Edición
  { id: 330, nombre: 'Recort. Impreso Ed. 10cm',   precio: 9.00,  subcat: 'troquelado-impreso', sku: 'TOP-330' },
  { id: 331, nombre: 'Recort. Impreso Ed. 15cm',   precio: 11.00, subcat: 'troquelado-impreso', sku: 'TOP-331' },
  { id: 332, nombre: 'Recort. Impreso Ed. XL',     precio: 14.00, subcat: 'troquelado-impreso', sku: 'TOP-332' },
  // Mensajes Prediseñados + Nombre
  { id: 340, nombre: 'Mensaje Cumpleaños',         precio: 4.50,  subcat: 'frases',             sku: 'TOP-340' },
  { id: 341, nombre: 'Mensaje Aniversario',        precio: 4.50,  subcat: 'frases',             sku: 'TOP-341' },
  { id: 342, nombre: 'Mensaje Graduación',         precio: 4.50,  subcat: 'frases',             sku: 'TOP-342' },
  { id: 343, nombre: 'Mensaje Bienvenida Bebé',        precio: 4.50,  subcat: 'frases',             sku: 'TOP-343' },
];

// ─── Pastel personalizado ─────────────────────────────────────────────────────
// porciones: base interna para calcular precio. rango: texto mostrado al cliente.
// precioBase: precio cuando es doble relleno ($2.50 × porciones)
export const PASTEL_TAMANOS = [
  { id: 'p-mediano',     label: 'Regular',      rango: '14–20 porciones', porciones: 15, precioBase: 37.50, montado: false },
  { id: 'p-grande',      label: 'Familiar',        rango: '24–30 porciones', porciones: 20, precioBase: 50.00, montado: false },
  { id: 'p-extra',       label: 'Gigante',  rango: '32–40 porciones', porciones: 30, precioBase: 75.00, montado: false },
  { id: 'p-montado',     label: 'Escalonado',       rango: '44–50 porciones', porciones: 45, precioBase: 112.50, montado: true },
];

export const PRECIO_POR_PORCION = { doble: 0, triple: 0.50 };

// Tipo de relleno — paso previo al sabor de relleno
// precioBase ya incluye el doble relleno; doble no suma nada, triple suma $0.50/porción
export const PASTEL_TIPOS_RELLENO = [
  { id: 'doble', label: 'Doble Capa', desc: '2 capas · estándar', precioPorPorcion: 0 },
  { id: 'triple', label: 'Triple Capa', desc: '3 capas · más altura', precioPorPorcion: 0.50 },
];

export const CUPCAKE_TAMANOS = [
  { id: 'c-12', label: 'Docena', precio: 22.00 },
];

export const PASTEL_SABORES = [
  'Cacao', 'Vainilla Clásica', 'Frutilla', 'Cítrico', 'Maracuyá',
  'Terciopelo Rojo', 'Zanahoria Especiada', 'Triple Leche', 'Coco Rallado', 'Moka',
];

export const PASTEL_REMOJOS = [
  'Triple Leche', 'Sin Humedecer', 'Almíbar Clásico',
  'Almíbar de Cacao', 'Leche Azucarada', 'Moka',
];

export const PASTEL_RELLENOS = [
  { id: 'pudin',     label: 'Flan Toffee' },
  { id: 'fresas',    label: 'Frutillas con Nata',  soloDoble: true },  // no disponible en Triple
  { id: 'chocolate', label: 'Cacao',           bloqMontado: true }, // no en Montado
  { id: 'manjar',    label: 'Crema de Leche Dulce' },
  { id: 'mermelada', label: 'Confitura de Frutilla' },
  { id: 'crema',     label: 'Natilla' },
  { id: 'dulce',     label: 'Cajeta' },
  { id: 'sin',       label: 'Sin Centro' },
];

export const PASTEL_TEXTURAS_BASE = [
  'Pulida', 'Rústica', 'Cobertura Natural', 'Cobertura de Color', 'Crema Batida', 'Según el diseño',
];

export const PASTEL_COLORES_POR_TEXTURA = {
  'Pulida': [
    { nombre: 'Nieve',       hex: '#FFFFFF' },
    { nombre: 'Hueso',       hex: '#FFFFF0' },
    { nombre: 'Rosado',         hex: '#FFB6C1' },
    { nombre: 'Rosa Suave',  hex: '#FFD1DC' },
    { nombre: 'Rosa Empolvado',   hex: '#C4A5A5' },
    { nombre: 'Coral',       hex: '#FF8C69' },
    { nombre: 'Mandarina',      hex: '#FF7043' },
    { nombre: 'Oliva',        hex: '#808000' },
    { nombre: 'Verde Salvia',   hex: '#B2AC88' },
    { nombre: 'Celeste Bebé',    hex: '#bebebe' },
    { nombre: 'Lila',      hex: '#e8e8e8' },
    { nombre: 'Durazno',    hex: '#FFCBA4' },
    { nombre: 'Gris Ceniza',   hex: '#D3D3D3' },
  ],
  'Rústica': [
    { nombre: 'Nieve',       hex: '#FFFFFF' },
    { nombre: 'Oliva',        hex: '#808000' },
    { nombre: 'Dorado Suave',    hex: '#F7E7CE' },
    { nombre: 'Arena',         hex: '#E8C9A0' },
    { nombre: 'Rosa Empolvado',   hex: '#C4A5A5' },
    { nombre: 'Coral',       hex: '#FF8C69' },
    { nombre: 'Plomo',         hex: '#B0B0B0' },
  ],
  'Cobertura Natural': [
    { nombre: 'Crudo',      hex: '#F5F0DC' },
  ],
  'Cobertura de Color': [
    { nombre: 'Carmín',         hex: '#E63946' },
    { nombre: 'Marino',         hex: '#6f6f6f' },
    { nombre: 'Esmeralda',        hex: '#2D6A4F' },
    { nombre: 'Girasol',     hex: '#F4D03F' },
    { nombre: 'Mandarina',      hex: '#F4A261' },
    { nombre: 'Coral',       hex: '#FF8C69' },
    { nombre: 'Rosa Empolvado',   hex: '#C4A5A5' },
    { nombre: 'Magenta',  hex: '#FF69B4' },
    { nombre: 'Violeta',       hex: '#4e4e4e' },
    { nombre: 'Aguamarina',     hex: '#40E0D0' },
    { nombre: 'Nieve',       hex: '#FFFFFF' },
    // Solo para detalles — no disponibles como cobertura total
    { nombre: 'Ébano',        hex: '#2C2C2C', soloDetalles: true },
    { nombre: 'Castaño',         hex: '#6F4E37', soloDetalles: true },
  ],
  'Crema Batida': [
    { nombre: 'Nieve',       hex: '#FFFEF2' },
    { nombre: 'Crema',     hex: '#F3E5AB' },
    { nombre: 'Rosado',         hex: '#FFB6C1' },
    { nombre: 'Rosa Empolvado',   hex: '#C4A5A5' },
    { nombre: 'Coral',       hex: '#FF8C69' },
    { nombre: 'Mandarina',      hex: '#FF7043' },
    { nombre: 'Azul Cielo',  hex: '#c0c0c0' },
    { nombre: 'Menta',  hex: '#98FF98' },
    { nombre: 'Lila',      hex: '#e8e8e8' },
    { nombre: 'Ámbar',     hex: '#C68642' },
    { nombre: 'Cacao',    hex: '#7B3F00' },
  ],
};

export const PASTEL_TEXTURAS = [
  'Pulida - Olivo', 'Pulida - Blanco', 'Pulida - Rosa',
  'Rústica - Olivo', 'Rústica - Blanco',
  'Cobertura Natural', 'Cobertura de Color', 'Crema Batida',
];

export const PASTEL_RUEDOS_TIPOS = [
  'Borde arriba y abajo', 'Solo superior', 'Solo inferior', 'Sin borde',
];

export const PASTEL_RUEDO_ESTILOS = [
  'Perlitas', 'Florecillas', 'Olas', 'Picos', 'Cordón', 'Plano', 'Veneras', 'Rosetas', 'Quebrado', 'Puntilla',
];

export const PASTEL_RUEDOS = [
  'Borde arriba y abajo', 'Solo superior', 'Solo inferior', 'Sin borde',
];

export const PASTEL_DEDICATORIAS = [
  'Feliz Día', 'Enhorabuena', 'Con Afecto',
  'En tu gran día', 'A tu medida', 'Sin mensaje',
];

export const PASTEL_DEDICATORIA_TIPOS = [
  { id: 'impresa',      label: 'Placa Impresa',   desc: 'Impresión sobre plástico transparente' },
  { id: 'dulce',        label: 'Placa de Azúcar',  desc: 'Inscrita en una plaquita de fondant' },
];

export const PASTEL_STEPS = [
  'Dimensión de Torta',
  'Estilo de Relleno',
  'Sabor de Torta',
  'Remojo de Torta',
  'Relleno de Torta',
  'Textura y Color',
  'Borde de Torta',
  'Dedicatoria',
  'Imagen de referencia',
  'Accesorios',
];

export const CUPCAKE_STEPS = [
  'Cantidad',
  'Sabor de Crema',
  'Sabor de Torta',
  'Relleno',
  'Color',
  'Textura',
  'Imagen',
  'Accesorios',
];

export const CUPCAKE_PRECIO_UNITARIO = 2.00; // precio por cupcake individual

export const GALLETAS_STEPS = [
  'Cantidad',
  'Forma',
  'Subir imagen',
];

export const GALLETAS_FORMAS = ['Redonda', 'Cuadriculada'];

export const CUPCAKE_SABORES_CREMA = ['Praliné'];

export const CUPCAKE_SABORES_TORTA = ['Vainilla Clásica', 'Cacao'];

export const CUPCAKE_RELLENOS = ['Toffee'];

export const CUPCAKE_COLORES = [
  { nombre: 'Nieve',    hex: '#FFFFFF' },
  { nombre: 'Rosa Suave',   hex: '#FFB6C1' },
  { nombre: 'Cielo',  hex: '#bebebe' },
  { nombre: 'Perla',  hex: '#F7E7CE' },
  { nombre: 'Esmeralda',    hex: '#98FF98' },
];

export const CUPCAKE_TEXTURAS = ['Rosetón', 'Pétalo', 'Césped', 'Remolino'];

// ─── Opciones de entrega y pago ───────────────────────────────────────────────
export const LUGARES_ENTREGA = ['Domicilio', 'Sucursal Centro', 'Sucursal Norte', 'Sucursal Sur'];
export const TIPOS_PAGO = ['Anticipo', 'Contra Entrega', 'Pagado'];
export const METODOS_PAGO = ['Efectivo', 'Transferencia Bancaria', 'Tarjeta de Crédito / Débito'];

// ─── Pedidos de demostración relativos a la fecha actual ──────────────────────
// Se generan al cargar para que Registro, Gestión y Calendario siempre se vean
// llenos (semana en curso, mes en curso y alrededores). Determinista: mismos datos
// cada día de la semana/mes, sin aleatoriedad real.
(function generarPedidosDemo() {
  let seed = 20260;
  const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d, h, m = 0) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}:00`;

  const personas = [
    ['Pablo Herrera', '+503 7777 7777'], ['Ana Lucía Rivas', '+503 2222 2222'], ['Marta Lemus', '+503 6666 6666'],
    ['Silvia Rosales', '+503 7810 2233'], ['Verónica Maldonado', '+503 7455 1290'], ['Rodrigo Cordero', '+503 7001 8842'],
    ['Lorena Fuentes', '+503 7322 4410'], ['Federico Cabrera', '+503 6120 9981'], ['Diana Hidalgo', '+503 7790 3356'],
    ['César Mendieta', '+503 7611 0274'], ['Irene Tobar', '+503 7248 5519'], ['Mauricio Ángel Reyes', '+503 7933 6621'],
    ['Paola Quintanilla', '+503 7512 3380'], ['Gabriela Arévalo', '+503 6877 1045'], ['Tomás Villatoro', '+503 7156 2290'],
  ];
  const empresas = [
    ['Delicias del Instante Ltda.', '+503 5555 5555'], ['Enlaces & Ceremonias Selecta S.A.', '+503 2260 7714'],
    ['Repostería Casa Nuestra S.A.', '+503 2222 2222'], ['Grupo Festejos S.A.', '+503 2245 8830'],
    ['Convites y Más S.A.', '+503 2270 1156'], ['Dulcería La Soberana Ltda.', '+503 2288 4402'],
    ['Corporación Nexo Ltda.', '+503 2233 4455'], ['Comercial Altavista S.A.', '+503 2250 9981'],
  ];
  const vendedores = ['Andrea M.', 'Christian B.', 'Mariana V.'];
  const lugares = [
    'Sucursal Centro', 'Sucursal Norte', 'Sucursal Sur',
    'Domicilio', 'Domicilio',
  ];
  const direcciones = [
    'Col. Escalón, Av. 12 #8', 'Residencial Miraflores, Calle Principal #8', 'Calle La Mascota #45',
    'Pasaje 3 #12, Col. Jardines', '4a Calle Poniente #320, Santa Tecla', 'Zona Industrial San Bartolo, Bodega 5',
  ];
  const codPastel = ['CHO', 'VAN', 'TRE', 'RED', 'FRE', 'COC'];
  const accs = ['ACC-VEL-010', 'ACC-FLO-001', 'ACC-LAZ-002', 'ACC-TOP-005'];

  let n = 100;
  const nuevo = (entrega, pendiente) => {
    const juridico = rnd() < 0.3;
    const [nombre, telefono] = pick(juridico ? empresas : personas);
    const produccion = rnd() < 0.62;
    const lineas = [];
    let total = 0;
    if (produccion) {
      const k = 1 + Math.floor(rnd() * 3);
      const codigos = [];
      for (let i = 0; i < k; i++) {
        const codigo = `PP-${pick(codPastel)}-${pad(Math.floor(rnd() * 40) + 1).padStart(3, '0')}`;
        codigos.push(codigo);
        lineas.push({ tipo: 'Pastel Personalizado', label: `Orden #${lineas.length + 1}`, codigo });
        total += 38 + Math.floor(rnd() * 70);
      }
      if (rnd() < 0.55) {
        lineas.push({ tipo: 'Accesorios', label: `Orden #${lineas.length + 1}`, accDe: codigos[0], codigos: [pick(accs), pick(accs)].filter((v, i, a) => a.indexOf(v) === i) });
        total += 6 + Math.floor(rnd() * 14);
      }
      if (rnd() < 0.4) {
        const qty = 6 + Math.floor(rnd() * 40);
        lineas.push({ tipo: 'Catálogo', label: `Orden #${lineas.length + 1}`, qty });
        total += qty * 1.5 + 8;
      }
    } else {
      const qty = 2 + Math.floor(rnd() * 28);
      lineas.push({ tipo: 'Catálogo', label: 'Orden #1', qty });
      total += qty * 3.2 + 6;
      if (rnd() < 0.3) { lineas.push({ tipo: 'Catálogo', label: 'Orden #2', qty: 4 + Math.floor(rnd() * 10) }); total += 18; }
    }
    total = Math.round(total * 1.13);
    const r = rnd();
    const estadoPago = pendiente ? 'Pendiente' : r < 0.42 ? 'Pagado' : r < 0.75 ? 'Anticipo' : 'Contra Entrega';
    // registro: pocos días antes de la entrega, sin pasar de hoy
    const hoy = new Date();
    const reg = new Date(entrega);
    reg.setDate(reg.getDate() - (produccion ? 5 + Math.floor(rnd() * 8) : 1 + Math.floor(rnd() * 3)));
    if (pendiente || reg > hoy) { reg.setTime(hoy.getTime()); reg.setDate(hoy.getDate() - Math.floor(rnd() * Math.min(10, hoy.getDate()))); }
    reg.setHours(8 + Math.floor(rnd() * 9), Math.floor(rnd() * 60), 0, 0);
    const lugar = pick(lugares);
    const mes = entrega.getMonth() + 1, anio = String(entrega.getFullYear()).slice(-2);
    return {
      id: `${pendiente ? 'COT' : 'PED'}-${pad(mes)}${anio}-${String(n++).padStart(3, '0')}`,
      tipoPedido: produccion ? 'Producción' : 'Reserva',
      lineas, registro: iso(reg, reg.getHours(), reg.getMinutes()), entrega: iso(entrega, entrega.getHours(), entrega.getMinutes()),
      vendedor: pick(vendedores), cliente: { nombre, telefono }, tipoCliente: juridico ? 'Jurídico' : 'Natural',
      lugarEntrega: lugar, direccionEntrega: lugar === 'Domicilio' ? pick(direcciones) : '',
      estadoPago, total,
    };
  };

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const out = [];
  // Rango: 45 días atrás hasta 15 días adelante (10 entregas por día)
  const ini = new Date(hoy); ini.setDate(ini.getDate() - 45);
  const fin = new Date(hoy); fin.setDate(fin.getDate() + 15);
  for (let d = new Date(ini); d <= fin; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    const enSemana = d >= lunes && d < new Date(lunes.getTime() + 7 * 86400000);
    // 10 pedidos por día en todo el rango (calendario, gestión y registro siempre llenos)
    const cuantos = 10;
    for (let i = 0; i < cuantos; i++) {
      const e = new Date(d); e.setHours(9 + Math.floor(rnd() * 9), pick([0, 15, 30, 45]), 0, 0);
      out.push(nuevo(e, false));
    }
  }
  // Registro: 10 pedidos registrados por día durante los últimos 60 días (hasta hoy)
  out.sort((a, b) => a.entrega.localeCompare(b.entrega));
  const dias = 60;
  out.forEach((o, k) => {
    const r = new Date(hoy); r.setDate(hoy.getDate() - (dias - 1) + Math.min(dias - 1, Math.floor(k * dias / out.length)));
    o.registro = iso(r, 8 + Math.floor(rnd() * 9), Math.floor(rnd() * 60));
  });
  // Cotizaciones (pendientes) registradas este mes, con entrega a futuro
  for (let i = 0; i < 12; i++) {
    const e = new Date(hoy); e.setDate(hoy.getDate() + (i < 3 ? i % 2 : 3 + Math.floor(rnd() * 16))); e.setHours(10 + Math.floor(rnd() * 7), pick([0, 30]), 0, 0);
    out.push(nuevo(e, true));
  }
  PEDIDOS_INICIALES.push(...out);
})();
