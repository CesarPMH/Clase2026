// ─── Solicitudes de cambio de pedidos (almacén local) ───────────────────────────
// Una solicitud nace al editar un pedido y pulsar "Enviar solicitud". Queda
// "Pendiente" hasta que alguien la aprueba (se aplica al pedido) o la rechaza.

import { PEDIDOS_INICIALES } from './pedidosMock';

const KEY_SOL = 'solicitudes_cambio_v2';
const KEY_OVR = 'pedidos_modificados';

const hace = (dias, h = 10, m = 0) => {
  const d = new Date(); d.setDate(d.getDate() - dias); d.setHours(h, m, 0, 0); return d.toISOString();
};

// Datos de demostración (se siembran una sola vez)
const SEED = [
  {
    id: 'SC-0001', pedidoId: 'PED-2606-002', cliente: 'Repostería Casa Nuestra S.A.',
    solicitante: 'Andrea M.', fecha: hace(6, 9, 20), estado: 'Aprobada',
    motivo: 'El cliente pidió adelantar la entrega un día.',
    cambios: [
      { campo: 'Fecha de entrega', antes: '10/06/2026', despues: '09/06/2026' },
      { campo: 'Hora de entrega', antes: '15:00', despues: '12:00' },
    ],
    totalAntes: 111, totalDespues: 111,
    resolucion: { por: 'Administrador', fecha: hace(6, 11, 5), comentario: 'Aprobado, producción tiene espacio.' },
  },
  {
    id: 'SC-0002', pedidoId: 'PED-2606-003', cliente: 'Ana Lucía Rivas',
    solicitante: 'Christian B.', fecha: hace(3, 14, 40), estado: 'Rechazada',
    motivo: 'Agregar dos paquetes de velas al pedido.',
    cambios: [
      { campo: 'Orden agregada', antes: '—', despues: 'Accesorios · Vela #3 ×2' },
    ],
    totalAntes: 75, totalDespues: 99.12,
    resolucion: { por: 'Administrador', fecha: hace(3, 16, 2), comentario: 'Producción ya cerró el pedido, crear uno nuevo.' },
  },
  {
    id: 'SC-0003', pedidoId: 'PED-2606-004', cliente: 'Delicias del Instante Ltda.',
    solicitante: 'Andrea M.', fecha: hace(1, 8, 55), estado: 'Pendiente',
    motivo: 'Cambio de lugar de entrega a domicilio.',
    cambios: [
      { campo: 'Lugar de entrega', antes: 'Sucursal Centro', despues: 'Domicilio' },
      { campo: 'Dirección de entrega', antes: '—', despues: 'Col. Escalón, Av. 12 #8, San Salvador' },
    ],
    totalAntes: 88, totalDespues: 93,
    resolucion: null,
  },
  {
    id: 'SC-0004', pedidoId: 'PED-2606-001', cliente: 'Silvia Rosales',
    solicitante: 'Andrea M.', fecha: hace(0, 9, 10), estado: 'Pendiente',
    motivo: 'El cliente cambia la cantidad de galletas.',
    cambios: [
      { campo: 'Orden #1 · Catálogo', antes: '8 productos', despues: '6 productos' },
    ],
    totalAntes: 30, totalDespues: 24,
    resolucion: null,
  },
];

// ── Solicitudes de demostración: 10 por día durante los últimos 7 días ─────────
(function generarSolicitudesDemo() {
  let seed = 4242;
  const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const pedidos = PEDIDOS_INICIALES.filter(p => p.id.startsWith('PED-'));
  if (!pedidos.length) return;
  const solicitantes = ['Andrea M.', 'Christian B.', 'Mariana V.'];
  const casos = [
    { motivo: 'El cliente pidió adelantar la entrega.', cambios: [{ campo: 'Hora de entrega', antes: '15:00', despues: '12:00' }], dt: 0 },
    { motivo: 'El cliente cambió la fecha de entrega.', cambios: [{ campo: 'Fecha de entrega', antes: 'día original', despues: 'un día después' }], dt: 0 },
    { motivo: 'Cambio de lugar de entrega a domicilio.', cambios: [{ campo: 'Lugar de entrega', antes: 'Sucursal Centro', despues: 'Domicilio' }, { campo: 'Dirección de entrega', antes: '—', despues: 'Col. Escalón, Av. 12 #8, San Salvador' }], dt: 5 },
    { motivo: 'Agregar velas al pedido.', cambios: [{ campo: 'Orden agregada', antes: '—', despues: 'Accesorios · Vela #3 ×2' }], dt: 6 },
    { motivo: 'El cliente cambia la cantidad de galletas.', cambios: [{ campo: 'Orden #1 · Catálogo', antes: '12 productos', despues: '8 productos' }], dt: -8 },
    { motivo: 'Cambio de sabor del pastel.', cambios: [{ campo: 'Sabor de torta', antes: 'Vainilla', despues: 'Chocolate' }], dt: 0 },
    { motivo: 'Se agrega dedicatoria al pastel.', cambios: [{ campo: 'Dedicatoria', antes: '—', despues: 'Feliz cumpleaños' }], dt: 2 },
    { motivo: 'Corrección del teléfono de contacto.', cambios: [{ campo: 'Teléfono', antes: '+503 7777 7777', despues: '+503 7600 1122' }], dt: 0 },
  ];
  const motivosRech = ['Producción ya cerró el pedido, crear uno nuevo.', 'No hay disponibilidad ese día.', 'El cambio excede el plazo permitido.'];
  const out = [];
  let n = 5;
  for (let dia = 0; dia < 7; dia++) {
    for (let i = 0; i < 10; i++) {
      const ped = pick(pedidos), c = pick(casos);
      const r = rnd();
      const estado = dia === 0 ? (r < 0.8 ? 'Pendiente' : 'Aprobada') : dia === 1 ? (r < 0.5 ? 'Pendiente' : r < 0.85 ? 'Aprobada' : 'Rechazada') : (r < 0.12 ? 'Pendiente' : r < 0.78 ? 'Aprobada' : 'Rechazada');
      const hora = 8 + Math.floor(rnd() * 9), min = Math.floor(rnd() * 60);
      const total = Number(ped.total) || 50;
      out.push({
        id: `SC-${String(n++).padStart(4, '0')}`, pedidoId: ped.id, cliente: ped.cliente?.nombre || '',
        solicitante: pick(solicitantes), fecha: hace(dia, hora, min), estado, motivo: c.motivo, cambios: c.cambios,
        totalAntes: total, totalDespues: Math.round((total + c.dt) * 100) / 100,
        resolucion: estado === 'Pendiente' ? null : {
          por: 'Administrador', fecha: hace(dia, Math.min(hora + 2, 18), min),
          comentario: estado === 'Aprobada' ? 'Aprobado.' : pick(motivosRech),
        },
      });
    }
  }
  SEED.push(...out);
})();

const read = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};

export function getSolicitudes() {
  let list = read(KEY_SOL, null);
  if (!list) { list = SEED; localStorage.setItem(KEY_SOL, JSON.stringify(list)); }
  return list;
}

function saveSolicitudes(list) { localStorage.setItem(KEY_SOL, JSON.stringify(list)); }

export function crearSolicitud({ pedido, solicitante, motivo, cambios, totalAntes, totalDespues, propuesta }) {
  const list = getSolicitudes();
  const n = list.reduce((m, s) => Math.max(m, parseInt(String(s.id).replace(/\D/g, ''), 10) || 0), 0) + 1;
  const sol = {
    id: `SC-${String(n).padStart(4, '0')}`,
    pedidoId: pedido.id,
    cliente: pedido.cliente?.nombre || '',
    solicitante, fecha: new Date().toISOString(), estado: 'Pendiente',
    motivo, cambios, totalAntes, totalDespues, propuesta, resolucion: null,
  };
  saveSolicitudes([sol, ...list]);
  return sol;
}

export function resolverSolicitud(id, estado, por, comentario) {
  const list = getSolicitudes().map(s =>
    s.id === id ? { ...s, estado, resolucion: { por, fecha: new Date().toISOString(), comentario: comentario || '' } } : s
  );
  saveSolicitudes(list);
  const sol = list.find(s => s.id === id);
  if (estado === 'Aprobada' && sol?.propuesta) {
    const ovr = read(KEY_OVR, {});
    ovr[sol.pedidoId] = { ...(ovr[sol.pedidoId] || {}), ...sol.propuesta };
    localStorage.setItem(KEY_OVR, JSON.stringify(ovr));
  }
  return list;
}

// Historial de un pedido: creación + todas las solicitudes que se le han hecho
export function getHistorialPedido(pedido) {
  const items = [];
  if (pedido?.registro) {
    items.push({ id: 'creado', fecha: pedido.registro, tipo: 'Creación', usuario: pedido.vendedor || '—',
      detalle: 'Pedido registrado', cambios: [], estado: null });
  }
  getSolicitudes().filter(s => s.pedidoId === pedido?.id).forEach(s => {
    items.push({ id: s.id, fecha: s.fecha, tipo: 'Solicitud de cambio', usuario: s.solicitante,
      detalle: s.motivo, cambios: s.cambios, estado: s.estado, resolucion: s.resolucion });
  });
  return items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// Aplica las modificaciones aprobadas sobre una lista de pedidos
export function aplicarOverrides(lista) {
  const ovr = read(KEY_OVR, {});
  return lista.map(p => (ovr[p.id] ? { ...p, ...ovr[p.id] } : p));
}

export function pedidoTieneSolicitudPendiente(id) {
  return getSolicitudes().some(s => s.pedidoId === id && s.estado === 'Pendiente');
}
