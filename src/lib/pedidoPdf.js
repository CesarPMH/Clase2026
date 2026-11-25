// Genera el PDF de un pedido (comprobante) con jsPDF.
import { jsPDF } from 'jspdf';

const money = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fecha = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
};

function pagosDe(id) {
  try { return (JSON.parse(localStorage.getItem('pagos_pedidos') || '{}')[id]) || []; } catch { return []; }
}

export function generarPedidoPdf(p) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, M = 18;
  let y = 22;
  const linea = (txt, o = {}) => {
    doc.setFont('helvetica', o.bold ? 'bold' : 'normal');
    doc.setFontSize(o.size || 10);
    doc.setTextColor(26, 26, 26);
    const partes = doc.splitTextToSize(String(txt), o.w || (W - 2 * M));
    if (y + partes.length * 5 > 280) { doc.addPage(); y = 20; }
    doc.text(partes, o.x ?? M, y);
    y += partes.length * (o.h || 5);
  };
  const par = (a, b) => {
    const yIni = y;
    linea(a, { bold: true, w: 40 });
    const yTrasEtiqueta = y;
    y = yIni;
    linea(b, { x: M + 42, w: W - 2 * M - 42 });
    y = Math.max(y, yTrasEtiqueta);
  };
  const sep = () => { doc.setDrawColor(200); doc.line(M, y, W - M, y); y += 6; };

  linea('Punto Cero', { bold: true, size: 20, h: 8 });
  linea('Comprobante de pedido', { size: 11, h: 7 });
  sep();
  linea(`Pedido ${p.id}`, { bold: true, size: 14, h: 8 });
  par('Tipo de pedido', p.tipoPedido || '—');
  par('Registrado', fecha(p.registro));
  par('Entrega', fecha(p.entrega));
  par('Vendedor', p.vendedor || '—');
  y += 2; sep();

  linea('Cliente', { bold: true, size: 12, h: 7 });
  par('Nombre', p.cliente?.nombre || '—');
  par('Teléfono', p.cliente?.telefono || '—');
  par('Tipo de cliente', p.tipoCliente || '—');
  const dir = typeof p.direccionEntrega === 'object' ? p.direccionEntrega?.direccion : p.direccionEntrega;
  par('Lugar de entrega', p.lugarEntrega || '—');
  if (dir) par('Dirección', dir);
  y += 2; sep();

  linea('Detalle del pedido', { bold: true, size: 12, h: 7 });
  let subtotal = 0;
  if (Array.isArray(p.ordenes) && p.ordenes.length) {
    p.ordenes.forEach((o, i) => {
      linea(`${i + 1}. ${o.nombre || o.tipo || 'Orden'}`, { bold: true });
      (o.items || []).forEach(it => {
        const qty = it.qty || 1, sub = (it.precio || 0) * qty;
        subtotal += sub;
        const yIni = y;
        linea(`    ${qty} x ${it.nombre || it.label || 'Producto'}`, { w: 130 });
        const yFin = y;
        y = yIni;
        linea(money(sub), { x: W - M - 25, w: 25 });
        y = Math.max(y, yFin);
      });
    });
  } else {
    (p.lineas || []).forEach((l, i) => {
      const txt = l.tipo === 'Catálogo'
        ? `Catálogo (${l.qty || 1} productos)`
        : l.tipo === 'Accesorios'
          ? `Accesorios${l.codigos ? ': ' + l.codigos.join(', ') : ''}`
          : `Pastel personalizado ${l.codigo || ''}`;
      linea(`${i + 1}. ${txt}`);
    });
  }
  y += 2; sep();

  if (subtotal > 0) {
    par('Subtotal', money(subtotal));
    par('IVA (13 %)', money(subtotal * 0.13));
  }
  linea(`Total: ${money(p.total)}`, { bold: true, size: 13, h: 8 });
  const pagos = pagosDe(p.id);
  const pagado = pagos.reduce((s, x) => s + (x.monto || 0), 0);
  par('Estado de pago', p.estadoPago === 'Pendiente' ? 'Cotización (sin pago registrado)' : p.estadoPago);
  if (pagos.length) {
    pagos.forEach(x => par(`Pago ${x.fecha || ''}`, `${money(x.monto)} · ${x.metodo || ''}`));
    par('Saldo pendiente', money(Math.max((p.total || 0) - pagado, 0)));
  }
  y += 6;
  linea('Documento generado por Punto Cero.', { size: 9 });
  return doc;
}

export function descargarPedidoPdf(p) {
  generarPedidoPdf(p).save(`${p.id}.pdf`);
}

export function verPedidoPdf(p) {
  const url = generarPedidoPdf(p).output('bloburl');
  window.open(url, '_blank', 'noopener');
}
