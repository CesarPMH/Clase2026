// Genera el PDF de un pedido (comprobante) con jsPDF.
// Genera el PDF del comprobante de un pedido con jsPDF.
// Recibe el objeto pedido (el mismo que muestran las tablas) y no necesita servidor: el PDF se arma
// en el navegador. Se usa para descargarlo (descargarPedidoPdf) o abrirlo en otra pestaña (verPedidoPdf).
import { jsPDF } from 'jspdf';

// money: formatea un monto como dinero con dos decimales (ej. $1,250.00).
const money = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// fecha: convierte una fecha ISO a "dd/mm/aaaa hh:mm" en formato de El Salvador; si no es válida devuelve "—".
const fecha = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
};

// pagosDe: lee de localStorage los pagos registrados de un pedido (clave "pagos_pedidos").
// Devuelve lista vacía si no hay o si el dato está dañado, para que el PDF nunca falle por esto.
function pagosDe(id) {
  try { return (JSON.parse(localStorage.getItem('pagos_pedidos') || '{}')[id]) || []; } catch { return []; }
}

// generarPedidoPdf: construye el documento completo y lo devuelve (aún sin guardar ni mostrar).
// Orden del comprobante: encabezado -> datos del pedido -> cliente -> detalle -> totales y pagos.
// Usa un cursor vertical "y" (en mm) que baja cada vez que se escribe algo.
export function generarPedidoPdf(p) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  // W: ancho de la hoja A4 y M: margen lateral, ambos en milímetros.
  const W = 210, M = 18;
  let y = 22;
  // linea: escribe un texto en la posición actual y baja el cursor. El texto largo se parte en varias
  // líneas para que quepa en el ancho (splitTextToSize). Si ya no cabe en la hoja agrega una página nueva.
  const linea = (txt, o = {}) => {
    doc.setFont('helvetica', o.bold ? 'bold' : 'normal');
    doc.setFontSize(o.size || 10);
    doc.setTextColor(26, 26, 26);
    // Se parte el texto largo en varias líneas para saber cuánto espacio vertical ocupará.
    const partes = doc.splitTextToSize(String(txt), o.w || (W - 2 * M));
    if (y + partes.length * 5 > 280) { doc.addPage(); y = 20; }
    doc.text(partes, o.x ?? M, y);
    y += partes.length * (o.h || 5);
  };
  // par: escribe una fila "etiqueta (negrita) + valor" a la misma altura. Como cada texto puede ocupar
  // varias líneas, se recuerda hasta dónde bajó la etiqueta y el cursor queda debajo del más largo.
  const par = (a, b) => {
    const yIni = y;
    linea(a, { bold: true, w: 40 });
    const yTrasEtiqueta = y;
    y = yIni;
    linea(b, { x: M + 42, w: W - 2 * M - 42 });
    y = Math.max(y, yTrasEtiqueta);
  };
  // sep: dibuja una línea gris horizontal para separar secciones y deja un espacio.
  const sep = () => { doc.setDrawColor(200); doc.line(M, y, W - M, y); y += 6; };

  // Encabezado del comprobante.
  linea('Punto Cero', { bold: true, size: 20, h: 8 });
  linea('Comprobante de pedido', { size: 11, h: 7 });
  sep();
  linea(`Pedido ${p.id}`, { bold: true, size: 14, h: 8 });
  // Datos generales del pedido.
  par('Tipo de pedido', p.tipoPedido || '—');
  par('Registrado', fecha(p.registro));
  par('Entrega', fecha(p.entrega));
  par('Vendedor', p.vendedor || '—');
  y += 2; sep();

  // Datos del cliente y entrega. La dirección solo se imprime si existe (puede venir como texto o como objeto).
  linea('Cliente', { bold: true, size: 12, h: 7 });
  par('Nombre', p.cliente?.nombre || '—');
  par('Teléfono', p.cliente?.telefono || '—');
  par('Tipo de cliente', p.tipoCliente || '—');
  // El pedido puede guardar la dirección como objeto (con campo "direccion") o como texto; se toma el texto en ambos casos.
  const dir = typeof p.direccionEntrega === 'object' ? p.direccionEntrega?.direccion : p.direccionEntrega;
  par('Lugar de entrega', p.lugarEntrega || '—');
  if (dir) par('Dirección', dir);
  y += 2; sep();

  // Detalle del pedido y subtotal. Si el pedido trae "ordenes" con productos y precios, se listan una por una
  // y se suma el subtotal. Si no (pedidos de demostración antiguos) solo se resume cada línea sin precios.
  linea('Detalle del pedido', { bold: true, size: 12, h: 7 });
  let subtotal = 0;
  if (Array.isArray(p.ordenes) && p.ordenes.length) {
    p.ordenes.forEach((o, i) => {
      linea(`${i + 1}. ${o.nombre || o.tipo || 'Orden'}`, { bold: true });
      (o.items || []).forEach(it => {
        // Cada producto muestra "cantidad x nombre" a la izquierda y su importe a la derecha, en la misma altura.
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

  // El desglose de subtotal e IVA (13 %) solo se muestra cuando se pudo calcular el subtotal.
  if (subtotal > 0) {
    par('Subtotal', money(subtotal));
    par('IVA (13 %)', money(subtotal * 0.13));
  }
  linea(`Total: ${money(p.total)}`, { bold: true, size: 13, h: 8 });
  // Pagos: se suman los abonos registrados. Si el pedido está "Pendiente" se presenta como cotización;
  // si hay pagos se listan y se calcula el saldo pendiente (nunca negativo).
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

// descargarPedidoPdf: genera el PDF y lo descarga con el código del pedido como nombre (ej. PED-2606-001.pdf).
export function descargarPedidoPdf(p) {
  generarPedidoPdf(p).save(`${p.id}.pdf`);
}

// verPedidoPdf: genera el PDF y lo abre en una pestaña nueva sin descargarlo.
// "noopener" evita que la pestaña nueva pueda controlar a la actual.
export function verPedidoPdf(p) {
  const url = generarPedidoPdf(p).output('bloburl');
  window.open(url, '_blank', 'noopener');
}
