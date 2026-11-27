// ─── Tabla de pedidos ───────────────────────────────────────────────────────────
// Qué hace: tabla reutilizable que lista pedidos con columnas configurables,
// orden por columna, paginación, selección múltiple con descarga de PDF y un menú
// de acciones por fila (ver pagos, editar, ver/descargar PDF, eliminar).
// De dónde salen los datos: no los busca; recibe el arreglo "pedidos" por props.
// Solo lee de localStorage los pagos registrados ('pagos_pedidos') para calcular
// el estado de pago real de cada pedido y para el panel de pagos.
// Quién lo usa: pages/Pedidos.jsx (vistas cotizados, gestión y calendario) y
// pages/PedidosDia.jsx. También exporta ColsButton (selector de columnas), chips
// y FmtDate que se reutilizan en otras pantallas.
import { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Typography, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import { Edit as EditIcon, MoreVert as MoreVertIcon, Delete as DeleteIcon, PictureAsPdf as PdfIcon, Download as DownloadIcon, ViewColumn as ViewColumnIcon, Visibility as VisibilityIcon, Send as SendIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import { DL } from '../../theme';
import Pagination from './Pagination';
import { descargarPedidoPdf, verPedidoPdf } from '../../lib/pedidoPdf';

const F = "'Inter', ui-sans-serif, system-ui, sans-serif";

// ─── Chips — relleno sólido, sin borde (regla UI kit) ────────────────────────
function Pill({ children, color, bg }) {
  return (
    <Box sx={{ display:'inline-flex',alignItems:'center',px:'8px',py:'2px',borderRadius:'5px',background:bg }}>
      <Typography sx={{ fontSize:9,fontWeight: 500,color,fontFamily:F,whiteSpace:'nowrap' }}>{children}</Typography>
    </Box>
  );
}

// OBJETIVO: mostrar el estado de pago como una etiqueta de color (rojo = pendiente,
// naranja = anticipo, verde = pagado). Recibe el texto del estado; devuelve el chip.
export function EstadoChip({ estado }) {
  const map = {
    'Pendiente':      { color:'#dc2626', bg:'#fee2e2' },
    'Anticipo':       { color:'#d97706', bg:'rgba(217,119,6,.12)' },
    'Contra Entrega': { color:DL.blue,   bg:'rgba(84,126,105,.12)' },
    'Pagado':         { color:DL.green,  bg:DL.greenBg },
  };
  const s = map[estado] || { color:DL.tM, bg:'rgba(26,26,26,.07)' };
  return <Pill color={s.color} bg={s.bg}>{estado}</Pill>;
}

// OBJETIVO: etiqueta del tipo de cliente. Recibe 'Natural' o 'Jurídico'; devuelve el chip
// (verde azulado para Jurídico).
export function TipoChip({ tipo }) {
  const isJ = tipo === 'Jurídico';
  return <Pill color={isJ?'#0d9488':'#515151'} bg={isJ?'rgba(13,148,136,.12)':'rgba(3,105,161,.12)'}>{tipo}</Pill>;
}

// ─── Fecha ────────────────────────────────────────────────────────────────────
// OBJETIVO: mostrar una fecha ISO en dos líneas: día abreviado con fecha y hora en
// formato 12 horas. Recibe el ISO (iso); devuelve el bloque de texto.
export function FmtDate({ iso }) {
  const d = new Date(iso);
  const dias  = ['dom','lun','mar','mié','jue','vie','sáb'];
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const h = d.getHours(), m = String(d.getMinutes()).padStart(2,'0');
  return (
    <Box>
      <Typography sx={{ fontSize:11,fontWeight: 500,color:DL.tH,fontFamily:F }}>
        {dias[d.getDay()]} {String(d.getDate()).padStart(2,'0')}/{meses[d.getMonth()]}/{d.getFullYear()}
      </Typography>
      <Typography sx={{ fontSize:10,color:DL.tS,fontFamily:F }}>
        {h%12||12}:{m} {h>=12?'p. m.':'a. m.'}
      </Typography>
    </Box>
  );
}


// ─── Código pill ──────────────────────────────────────────────────────────────
// Etiqueta pequeña con el código de un producto o accesorio (ej. 'CATÁLOGO'). Recibe
// el código (cod) y los colores de fondo y borde.
function CodPill({ cod, color, bg, bd }) {
  return (
    <Box sx={{ display:'inline-flex',px:'7px',py:'1px',borderRadius:'5px',background:bg,border:`1px solid ${bd}` }}>
      <Typography sx={{ fontSize:10,fontWeight: 500,color,fontFamily:F,letterSpacing:'0.04em',whiteSpace:'nowrap' }}>{cod}</Typography>
    </Box>
  );
}

// ─── Líneas detalle ───────────────────────────────────────────────────────────
// OBJETIVO: resumir en la celda "Detalle" qué contiene el pedido (pasteles personalizados,
// productos de catálogo y accesorios). Recibe el arreglo de líneas del pedido y
// devuelve una lista de etiquetas con su código.
function LineasDetalle({ lineas }) {
  return (
    <Box sx={{ display:'flex',flexDirection:'column',gap:'5px' }}>
      {lineas.map((l, i) => {
        // Accesorios con accDe → se renderizan bajo su pastel, no aquí
        // (accDe = código del pastel al que pertenecen; así se ve a cuál acompañan)
        if (l.tipo === 'Accesorios' && l.accDe) return null;

        if (l.tipo === 'Pastel Personalizado') {
          const accs = lineas.filter(a => a.tipo === 'Accesorios' && a.accDe === l.codigo);
          return (
            <Box key={i}>
              <Box sx={{ display:'flex',alignItems:'center',gap:'5px' }}>
                <CodPill cod={l.codigo} color='#6a6a6a' bg='#f6f6f6' bd='#d4d4d4' />
                <Typography sx={{ fontSize:11,color:DL.tS,fontFamily:F }}>Pastel Personalizado</Typography>
              </Box>
              {accs.map((acc, ai) =>
                (acc.codigos||[]).map((cod, ci) => (
                  <Box key={`${ai}-${ci}`} sx={{ display:'flex',alignItems:'center',gap:'5px',pl:'12px',mt:'2px' }}>
                    <Box sx={{ width:'8px',height:'1px',background:DL.border2,mr:'2px',flexShrink:0 }} />
                    <CodPill cod={cod} color='#6a6a6a' bg='#f6f6f6' bd='#d4d4d4' />
                    <Typography sx={{ fontSize:10,color:DL.tS,fontFamily:F }}>Accesorio</Typography>
                  </Box>
                ))
              )}
            </Box>
          );
        }

        if (l.tipo === 'Catálogo') {
          return (
            <Box key={i} sx={{ display:'flex',alignItems:'center',gap:'5px' }}>
              <CodPill cod='CATÁLOGO' color='#6a6a6a' bg='#f6f6f6' bd='#d4d4d4' />
              <Typography sx={{ fontSize:11,color:DL.tS,fontFamily:F }}>{l.qty} Producto{l.qty!==1?'s':''}</Typography>
            </Box>
          );
        }

        // Accesorios standalone (sin accDe)
        if (l.tipo === 'Accesorios') {
          return (
            <Box key={i} sx={{ display:'flex',flexDirection:'column',gap:'2px' }}>
              {(l.codigos||[]).map((cod, ci) => (
                <Box key={ci} sx={{ display:'flex',alignItems:'center',gap:'5px' }}>
                  <CodPill cod={cod} color='#6a6a6a' bg='#f6f6f6' bd='#d4d4d4' />
                  <Typography sx={{ fontSize:10,color:DL.tS,fontFamily:F }}>Accesorio</Typography>
                </Box>
              ))}
            </Box>
          );
        }

        return null;
      })}
    </Box>
  );
}

// ─── Pago Drawer ──────────────────────────────────────────────────────────────
// Métodos de pago que se pueden elegir al registrar un pago
const METODOS_PAGO = ['Efectivo','Transferencia','Tarjeta de Crédito / Débito','Cheque'];

// OBJETIVO: panel lateral para consultar y registrar los pagos de un pedido.
// Recibe el pedido y onClose. Muestra total, pendiente e historial; al guardar un pago
// lo agrega a localStorage ('pagos_pedidos', un objeto con la lista de pagos por id
// de pedido). Cuando el pendiente llega a 0 el pedido se considera Pagado.
function PagoDrawer({ pedido, onClose }) {
  const storageKey = 'pagos_pedidos';
  const [pagos, setPagos] = useState(() => {
    try { return (JSON.parse(localStorage.getItem(storageKey) || '{}'))[pedido.id] || []; }
    catch { return []; }
  });
  const [formOpen, setFormOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ fecha: today, metodo: '', monto: '' });
  const [error, setError] = useState('');

  // Cálculo de saldos: total del pedido, suma de pagos y lo que falta por pagar
  const total    = Number(pedido.total) || 0;
  const pagado   = pagos.reduce((s, pg) => s + Number(pg.monto), 0);
  const pendiente = Math.max(0, total - pagado);
  const isPagado = pedido.estadoPago === 'Pagado' || pendiente <= 0;

  // Validaciones antes de guardar un pago: método elegido, monto mayor que 0 y que no
  // supere lo pendiente (así nunca se cobra de más). Si todo está bien se guarda en
  // el estado y en localStorage.
  const guardar = () => {
    if (!form.metodo) { setError('Selecciona un método de pago'); return; }
    const m = Number(form.monto);
    if (!m || m <= 0) { setError('Ingresa un monto válido'); return; }
    if (m > pendiente) { setError(`El monto no puede superar el pendiente ($${pendiente.toFixed(2)})`); return; }
    const nuevo = { fecha: form.fecha, metodo: form.metodo, monto: m };
    const nuevos = [...pagos, nuevo];
    setPagos(nuevos);
    try {
      const all = JSON.parse(localStorage.getItem(storageKey) || '{}');
      all[pedido.id] = nuevos;
      localStorage.setItem(storageKey, JSON.stringify(all));
    } catch {}
    setFormOpen(false);
    setForm({ fecha: today, metodo: '', monto: '' });
    setError('');
  };

  const estadoMap = {
    'Pendiente':      { color:'#dc2626', bg:'#fef2f2', bd:'#fecaca' },
    'Anticipo':       { color:'#a16207', bg:'#fefce8', bd:'#fef08a' },
    'Contra Entrega': { color:'#1a1a1a', bg:'#f6f6f6', bd:'#d4d4d4' },
    'Pagado':         { color:'#15803d', bg:'#f0fdf4', bd:'#bbf7d0' },
  };
  const estadoEfectivo = isPagado ? 'Pagado' : pedido.estadoPago;
  const esSt = estadoMap[estadoEfectivo] || { color:DL.tM, bg:'#f6f6f6', bd:DL.border2 };

  const fmtFecha = iso => {
    const d = new Date(iso + 'T12:00:00');
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  return (
    <>
      <Box onClick={onClose} sx={{ position:'fixed', inset:0, background:'rgba(14,24,48,.32)', zIndex:1200 }} />
      <Box sx={{
        position:'fixed', top:0, right:0, bottom:0, width:400, background:'#fff',
        zIndex:1300, boxShadow:'-6px 0 40px rgba(26,26,26,.13)',
        display:'flex', flexDirection:'column',
      }}>
        {/* Header */}
        <Box sx={{ px:'24px', pt:'22px', pb:'16px', borderBottom:`1px solid ${DL.border}` }}>
          <Typography sx={{ fontSize:18, fontWeight: 500, color:DL.tH, fontFamily:F }}>Actualización de pago</Typography>
        </Box>

        {/* Body */}
        <Box sx={{ flex:1, overflowY:'auto', p:'20px 24px', display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Info pedido */}
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <Box>
              <Typography sx={{ fontSize:12, color:DL.tS, fontFamily:F }}>
                Orden: <strong style={{ color:DL.tH }}>{pedido.id}</strong>
              </Typography>
              <Typography sx={{ fontSize:12, color:DL.tS, fontFamily:F, mt:'4px' }}>
                Cliente: <strong style={{ color:DL.tH }}>{pedido.cliente?.nombre}</strong>
                {pedido.cliente?.telefono && <span style={{ color:DL.tS }}> ({pedido.cliente.telefono})</span>}
              </Typography>
            </Box>
            <Box sx={{ px:'10px', py:'4px', borderRadius:'4px', background:esSt.bg, border:`1px solid ${esSt.bd}`, flexShrink:0 }}>
              <Typography sx={{ fontSize:11, fontWeight: 500, color:esSt.color, fontFamily:F }}>{estadoEfectivo}</Typography>
            </Box>
          </Box>

          {/* Total / Pendiente */}
          <Box sx={{ display:'flex', gap:'16px', p:'14px 16px', borderRadius:'10px', background:'#f8fafc', border:`1px solid ${DL.border}` }}>
            <Box sx={{ flex:1 }}>
              <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tS, fontFamily:F, textTransform:'uppercase', letterSpacing:'.06em' }}>Total</Typography>
              <Typography sx={{ fontSize:20, fontWeight: 500, color:DL.blue, fontFamily:F, mt:'2px' }}>${total.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ width:'1px', background:DL.border }} />
            <Box sx={{ flex:1 }}>
              <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tS, fontFamily:F, textTransform:'uppercase', letterSpacing:'.06em' }}>Pendiente</Typography>
              <Typography sx={{ fontSize:20, fontWeight: 500, color: pendiente > 0 ? '#dc2626' : '#15803d', fontFamily:F, mt:'2px' }}>
                ${pendiente.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Tabla de pagos */}
          <Box>
            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tS, fontFamily:F, mb:'8px', textTransform:'uppercase', letterSpacing:'.06em' }}>Historial de pagos</Typography>
            <Box sx={{ border:`1px solid ${DL.border}`, borderRadius:'8px', overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Fecha','Método','Monto'].map(h => (
                      <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontFamily:F, fontSize:10, fontWeight: 500, color:DL.blue, borderBottom:`1px solid ${DL.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagos.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding:'20px', textAlign:'center', fontFamily:F, fontSize:11, color:DL.tS }}>Sin pagos registrados</td></tr>
                  ) : pagos.map((pg, i) => (
                    <tr key={i} style={{ background: i%2===0?'#fff':'#fafbfe' }}>
                      <td style={{ padding:'9px 12px', fontFamily:F, fontSize:11, color:DL.tM, borderBottom:`1px solid ${DL.border}` }}>{fmtFecha(pg.fecha)}</td>
                      <td style={{ padding:'9px 12px', fontFamily:F, fontSize:11, color:DL.tM, borderBottom:`1px solid ${DL.border}` }}>{pg.metodo}</td>
                      <td style={{ padding:'9px 12px', fontFamily:F, fontSize:11, fontWeight: 500, color:'#15803d', borderBottom:`1px solid ${DL.border}` }}>${Number(pg.monto).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>

          {/* Formulario agregar pago */}
          {!isPagado && formOpen && (
            <Box sx={{ p:'16px', borderRadius:'10px', border:`1px solid ${DL.border}`, background:'#f8fafc', display:'flex', flexDirection:'column', gap:'12px' }}>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:F }}>Nuevo pago</Typography>
              {/* Fecha */}
              <Box>
                <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tS, fontFamily:F, mb:'4px' }}>Fecha *</Typography>
                <Box component="input" type="date" value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  sx={{ width:'100%', fontFamily:F, fontSize:12, color:DL.tH, border:`1px solid ${DL.border2}`, borderRadius:'8px', px:'10px', py:'7px', outline:'none', background:'#fff', boxSizing:'border-box', '&:focus':{ borderColor:DL.blue } }} />
              </Box>
              {/* Método */}
              <Box>
                <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tS, fontFamily:F, mb:'4px' }}>Método de pago *</Typography>
                <Box component="select" value={form.metodo}
                  onChange={e => setForm(f => ({ ...f, metodo: e.target.value }))}
                  sx={{ width:'100%', fontFamily:F, fontSize:12, color: form.metodo ? DL.tH : DL.tS, border:`1px solid ${DL.border2}`, borderRadius:'8px', px:'10px', py:'7px', outline:'none', background:'#fff', cursor:'pointer', appearance:'none', boxSizing:'border-box', '&:focus':{ borderColor:DL.blue } }}>
                  <option value="">Seleccionar método...</option>
                  {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                </Box>
              </Box>
              {/* Monto */}
              <Box>
                <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tS, fontFamily:F, mb:'4px' }}>Monto a pagar * <span style={{ color:DL.tS, fontWeight:400 }}>(máx. ${pendiente.toFixed(2)})</span></Typography>
                <Box component="input" type="number" min="0.01" step="0.01" max={pendiente} value={form.monto} placeholder="0.00"
                  onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                  sx={{ width:'100%', fontFamily:F, fontSize:12, color:DL.tH, border:`1px solid ${DL.border2}`, borderRadius:'8px', px:'10px', py:'7px', outline:'none', background:'#fff', boxSizing:'border-box', '&:focus':{ borderColor:DL.blue } }} />
              </Box>
              {error && <Typography sx={{ fontSize:11, color:'#dc2626', fontFamily:F }}>{error}</Typography>}
              <Box sx={{ display:'flex', gap:'8px' }}>
                <Box component="button" onClick={guardar} sx={{
                  flex:1, py:'9px', borderRadius:'8px', background: '#fff', border: '1px solid #1a1a1a', cursor:'pointer',
                  fontFamily:F, fontSize:12, fontWeight: 500, color: '#1a1a1a',
                  '&:hover': { background: '#f6f6f6' }, transition:'background .13s',
                }}>Ingresar</Box>
                <Box component="button" onClick={() => { setFormOpen(false); setError(''); }} sx={{
                  flex:1, py:'9px', borderRadius:'8px', background:'#f6f6f6', border:`1px solid ${DL.border2}`, cursor:'pointer',
                  fontFamily:F, fontSize:12, fontWeight: 500, color:DL.tM,
                  '&:hover':{ background:'#e3e3e3' }, transition:'background .13s',
                }}>Cancelar</Box>
              </Box>
            </Box>
          )}

          {/* Botón agregar pago */}
          {!isPagado && !formOpen && (
            <Box component="button" onClick={() => { setFormOpen(true); setError(''); }} sx={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
              py:'10px', borderRadius:'8px', background: '#fff', border: '1px solid #1a1a1a', cursor:'pointer',
              fontFamily:F, fontSize:12, fontWeight: 500, color: '#1a1a1a',
              '&:hover': { background: '#f6f6f6' }, transition:'background .13s',
            }}>
              + Agregar nuevo pago
            </Box>
          )}

          {isPagado && (
            <Box sx={{ p:'12px 16px', borderRadius:'8px', background:'#f0fdf4', border:'1px solid #bbf7d0', textAlign:'center' }}>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:'#15803d', fontFamily:F }}>✓ Pedido pagado al 100%</Typography>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p:'16px 24px', borderTop:`1px solid ${DL.border}` }}>
          <Box component="button" onClick={onClose} sx={{
            width:'100%', py:'10px', borderRadius:'8px', background:'#f6f6f6',
            border:`1px solid ${DL.border2}`, cursor:'pointer',
            fontFamily:F, fontSize:12, fontWeight: 500, color:DL.tM,
            '&:hover':{ background:'#e3e3e3' }, transition:'background .13s',
          }}>Cerrar</Box>
        </Box>
      </Box>
    </>
  );
}

// ─── Row Menu ─────────────────────────────────────────────────────────────────
// OBJETIVO: menú de tres puntos de cada fila con las acciones del pedido.
// Recibe el pedido (p) y las funciones onEdit, onDelete, onPdfDescargado (para marcar
// la hora de descarga) y onVerPagos. La eliminación pide confirmación antes de ejecutar
// onDelete, porque es permanente.
function RowMenu({ p, onEdit, onDelete, onPdfDescargado, onVerPagos }) {
  const [anchor, setAnchor] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);
  const itemSx = (color) => ({
    gap: '10px', fontSize: 12, fontFamily: F, color, fontWeight: 500, px: '14px', py: '8px',
    '&:hover': { background: `${color}12` },
  });

  // Texto del lugar de entrega: si es a domicilio muestra la dirección; si no, la sucursal
  const lugarLabel = p.lugarEntrega === 'Domicilio' && p.direccionEntrega
    ? (typeof p.direccionEntrega === 'object'
        ? p.direccionEntrega.direccion || ''
        : p.direccionEntrega)
    : p.lugarEntrega || '—';

  return (
    <>
      <IconButton size="small" onClick={e => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{ color: DL.tS, '&:hover': { color: DL.tH, background: 'rgba(26,26,26,.06)' } }}>
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Menu anchorEl={anchor} open={open} onClose={close}
        slotProps={{ paper: { sx: { borderRadius: '12px', border: `1px solid ${DL.border}`, boxShadow: '0 6px 24px rgba(0,0,0,.12)', minWidth: 190 } } }}>
        <MenuItem onClick={() => { close(); onVerPagos && onVerPagos(p); }} sx={itemSx(DL.tH)}>
          <VisibilityIcon sx={{ fontSize: 16, color: DL.tH }} /> Ver pagos
        </MenuItem>
        <MenuItem onClick={() => { close(); onEdit && onEdit(p); }} sx={itemSx(DL.tH)}>
          <EditIcon sx={{ fontSize: 16, color: DL.tH }} /> Editar
        </MenuItem>
        <MenuItem onClick={() => { close(); verPedidoPdf(p); onPdfDescargado && onPdfDescargado(p.id); }} sx={itemSx(DL.tH)}>
          <PdfIcon sx={{ fontSize: 16, color: DL.tH }} /> Ver PDF
        </MenuItem>
        <MenuItem onClick={() => { close(); descargarPedidoPdf(p); onPdfDescargado && onPdfDescargado(p.id); }} sx={itemSx(DL.tH)}>
          <DownloadIcon sx={{ fontSize: 16, color: DL.tH }} /> Descargar PDF
        </MenuItem>
        <MenuItem onClick={close} sx={itemSx(DL.tH)}>
          <SendIcon sx={{ fontSize: 16, color: DL.tH }} /> Enviar por Correo
        </MenuItem>
        <MenuItem onClick={close} sx={itemSx('#16a34a')}>
          <WhatsAppIcon sx={{ fontSize: 16, color: '#16a34a' }} /> Compartir por Whatsapp
        </MenuItem>
        {/* Separador */}
        <Box sx={{ borderTop: `1px solid ${DL.border}`, my: '4px' }} />
        <MenuItem onClick={() => { close(); setConfirmarEliminar(true); }} sx={itemSx('#dc2626')}>
          <DeleteIcon sx={{ fontSize: 16, color: '#dc2626' }} /> Eliminar pedido
        </MenuItem>
      </Menu>

      {/* Modal de confirmación de eliminación */}
      {confirmarEliminar && (
        <Box sx={{
          position: 'fixed', inset: 0, zIndex: 1400,
          background: 'rgba(14,30,46,.45)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setConfirmarEliminar(false)}>
          <Box onClick={e => e.stopPropagation()} sx={{
            background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,.2)',
            border: `1px solid ${DL.border}`, width: '100%', maxWidth: 420, mx: '16px',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <Box sx={{ background: '#fff', borderBottom: `1px solid ${DL.border}`, px: '20px', py: '16px', position: 'relative', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.navy, fontFamily: F }}>
                Eliminar pedido
              </Typography>
              <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F, fontWeight: 500, mt: '2px' }}>
                Esta acción es permanente y no se puede deshacer
              </Typography>
              <Box component="button" onClick={() => setConfirmarEliminar(false)} sx={{
                position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)',
                width: 22, height: 22, borderRadius: '5px', border: `1px solid ${DL.border2}`,
                background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: DL.tS, fontSize: 11, fontWeight: 500, '&:hover': { background: DL.bg, color: DL.tH },
              }}>✕</Box>
            </Box>

            {/* Detalle del pedido */}
            <Box sx={{ px: '20px', py: '16px' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tS, fontFamily: F, textTransform: 'uppercase', letterSpacing: '.06em', mb: '10px' }}>
                Detalle del pedido
              </Typography>
              {[
                ['N° Pedido',      p.id],
                ['Cliente',        p.cliente?.nombre || '—'],
                ['Vendedor',       p.vendedor || '—'],
                ['Fecha entrega',  p.entrega ? p.entrega.slice(0,10) : '—'],
                ['Lugar entrega',  lugarLabel],
                ['Estado de pago', p.estadoPago || '—'],
                ['Total',          p.total != null ? `$${Number(p.total).toFixed(2)}` : '—'],
              ].map(([label, val]) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: '5px', borderBottom: `1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F }}>{label}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, fontFamily: F, textAlign: 'right', maxWidth: '60%' }}>{val}</Typography>
                </Box>
              ))}
            </Box>

            {/* Botones */}
            <Box sx={{ px: '20px', pb: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Box component="button" onClick={() => setConfirmarEliminar(false)} sx={{
                px: '16px', py: '8px', borderRadius: '8px', border: `1px solid ${DL.border2}`,
                background: '#fff', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 500,
                color: DL.tM, '&:hover': { background: DL.bg },
              }}>
                Cancelar
              </Box>
              <Box component="button" onClick={() => {
                setConfirmarEliminar(false);
                onDelete && onDelete(p);
              }} sx={{
                px: '16px', py: '8px', borderRadius: '8px', border: '1px solid #1a1a1a',
                background: '#fff', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 500,
                color: '#1a1a1a', '&:hover': { background: '#f6f6f6' }, transition: 'background .13s',
              }}>
                Sí, eliminar pedido
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

// ─── Tabla ────────────────────────────────────────────────────────────────────
// Definición de las columnas (clave, título y ancho). 'check' y 'accion' son fijas;
// las demás se pueden ocultar con ColsButton.
const COLS = [
  { key:'check',  label:'',               w:36   },
  { key:'id',     label:'N° Pedido',      w:100  },
  { key:'lineas', label:'Detalle',        w:null },
  { key:'vend',   label:'Vendedor',       w:120  },
  { key:'reg',    label:'Registro',       w:130  },
  { key:'cli',    label:'Cliente',        w:160  },
  { key:'ent',    label:'Entrega',        w:130  },
  { key:'lugar',  label:'Lugar entrega',  w:120  },
  { key:'tipo',     label:'Tipo',           w:90   },
  { key:'estado',   label:'Estado de Pago', w:120  },
  { key:'descarga', label:'Descarga',        w:100  },
  { key:'accion',   label:'',               w:44   },
];

// Borde suave que separa las filas
const ROW_BORDER = '1px solid rgba(26,26,26,.065)';

// Columnas que el usuario puede mostrar u ocultar, y conjunto inicial con todas visibles
export const COLS_OPCIONALES = COLS.filter(c => c.key !== 'check' && c.key !== 'accion');
export const DEFAULT_COLS_VISIBLES = new Set(COLS_OPCIONALES.map(c => c.key));

// Cómo obtener, de cada pedido, el valor por el que se ordena cada columna (todos texto,
// para poder comparar con localeCompare). Las columnas sin entrada aquí no se ordenan.
const SORT_FN = {
  id:     p => p.id || '',
  vend:   p => p.vendedor || '',
  reg:    p => p.registro || '',
  cli:    p => p.cliente?.nombre || '',
  ent:    p => p.entrega || '',
  lugar:  p => p.lugarEntrega === 'Domicilio' && p.direccionEntrega
    ? (typeof p.direccionEntrega === 'object' ? p.direccionEntrega.direccion || '' : p.direccionEntrega)
    : p.lugarEntrega || '',
  tipo:   p => p.tipoCliente || '',
  estado: p => p.estadoPago || '',
};

// ─── ColsButton (exported) ────────────────────────────────────────────────────
// OBJETIVO: botón con menú para elegir qué columnas se ven. Recibe el conjunto de
// columnas visibles y onChange para actualizarlo (lo guarda la página padre). Siempre
// deja al menos una columna visible y se cierra al hacer clic fuera.
export function ColsButton({ colsVisibles, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);
  const toggle = (key) => onChange(prev => {
    const n = new Set(prev);
    if (n.has(key)) { if (n.size > 1) n.delete(key); } else n.add(key);
    return n;
  });
  return (
    <Box ref={ref} sx={{ position:'relative' }}>
      <Box component="button" title="Columnas" aria-label="Columnas" onClick={() => setOpen(o => !o)} sx={{
        display:'flex', alignItems:'center', gap:'5px',
        px:'10px', py:'7px', borderRadius:'8px',
        border:`1px solid ${open ? DL.blue : DL.border2}`,
        background: open ? 'rgba(84,126,105,.06)' : '#fff',
        cursor:'pointer', fontFamily:F, fontSize:11, fontWeight: 500,
        color: open ? DL.blue : DL.tM,
        '&:hover':{ background:'rgba(84,126,105,.04)', borderColor:DL.blue, color:DL.blue },
        transition:'all .13s',
      }}>
        <ViewColumnIcon sx={{ fontSize:16 }} />
      </Box>
      {open && (
        <Box sx={{
          position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:200,
          background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px',
          boxShadow:'0 4px 20px rgba(0,0,0,.1)', py:'6px', minWidth:'164px',
        }}>
          {COLS_OPCIONALES.map(c => (
            <Box key={c.key} onClick={() => toggle(c.key)} sx={{
              display:'flex', alignItems:'center', gap:'8px',
              px:'12px', py:'7px', cursor:'pointer',
              '&:hover':{ background:'rgba(84,126,105,.05)' },
            }}>
              <Box sx={{ width:14, height:14, borderRadius:'3px', flexShrink:0,
                border:`1.5px solid ${colsVisibles.has(c.key) ? DL.blue : DL.border2}`,
                background: colsVisibles.has(c.key) ? DL.blue : '#fff',
                display:'flex', alignItems:'center', justifyContent:'center', transition:'all .12s',
              }}>
                {colsVisibles.has(c.key) && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </Box>
              <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tM, fontFamily:F }}>{c.label}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// OBJETIVO: dibujar la tabla completa de pedidos.
// Recibe: pedidos (arreglo ya filtrado por la página), onEdit y onDelete (acciones del
// menú de fila), showPagination (true = pagina de a 5/10/... filas) y colsVisibles
// (columnas a mostrar). Devuelve la tabla con su barra de selección y paginación;
// los clics en editar/eliminar se avisan al padre por onEdit/onDelete.
export default function TablaPedidos({ pedidos, onEdit, onDelete, showPagination = true, colsVisibles = DEFAULT_COLS_VISIBLES }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  // pdfTimestamps: hora de la última descarga de PDF por pedido; seleccionados: ids marcados
  // con el checkbox; sortKey/sortDir: columna y sentido del orden; pedidoPagos: pedido cuyo
  // panel de pagos está abierto (null = cerrado).
  const [pdfTimestamps, setPdfTimestamps] = useState({});
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [pedidoPagos, setPedidoPagos] = useState(null);
  const [tick, setTick] = useState(0);
  // Cada 30 s se fuerza un nuevo render para que "hace X min" y los pagos se mantengan al día
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // Leer pagos registrados para calcular estado real por pedido
  const pagosPorId = useMemo(() => {
    return JSON.parse(localStorage.getItem('pagos_pedidos') || '{}');
  }, [tick, pedidoPagos]);

  // Estado de pago que realmente se muestra: se calcula con los pagos registrados y no
  // solo con el campo estadoPago. Pagado si cubre el total, Anticipo si hay algún pago
  // y, si no hay pagos, el estado original del pedido (ej. 'Pendiente' = cotización).
  const estadoEfectivoPedido = (p) => {
    const registrados = pagosPorId[p.id] || [];
    const pagado = registrados.reduce((s, r) => s + (r.monto || 0), 0);
    if (pagado >= p.total && p.total > 0) return 'Pagado';
    if (pagado > 0) return 'Anticipo';
    return p.estadoPago;
  };

  // Columnas a dibujar: las fijas más las que el usuario dejó marcadas
  const visibleCols = COLS.filter(c => c.key === 'check' || c.key === 'accion' || colsVisibles.has(c.key));

  // Primer clic en una columna ordena ascendente; un segundo clic invierte el orden
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // Copia ordenada de los pedidos (no se modifica el arreglo original que llega por props)
  const sortedPedidos = useMemo(() => {
    if (!sortKey || !SORT_FN[sortKey]) return pedidos;
    const fn = SORT_FN[sortKey];
    return [...pedidos].sort((a, b) => {
      const av = fn(a), bv = fn(b);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [pedidos, sortKey, sortDir]);

  // Guarda la hora de la última descarga de un pedido para mostrar "hace X min" en la columna Descarga
  const markPdf = id => setPdfTimestamps(prev => ({ ...prev, [id]: Date.now() }));
  const tiempoRelativo = ts => {
    const seg = Math.floor((Date.now() - ts) / 1000);
    if (seg < 60)  return `hace ${seg}s`;
    if (seg < 3600) return `hace ${Math.floor(seg/60)}min`;
    return `hace ${Math.floor(seg/3600)}h`;
  };
  // Filas de la página actual; sin paginación se muestran todas
  const rows = showPagination
    ? sortedPedidos.slice((page-1)*pageSize, page*pageSize)
    : sortedPedidos;

  // ── Selección múltiple ──
  // Los ids marcados se guardan en un Set para sumar o quitar un pedido sin duplicados.
  // El checkbox del encabezado marca o desmarca solo las filas de la página visible.
  const toggleRow = (id) => setSeleccionados(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const todosSeleccionados = rows.length > 0 && rows.every(p => seleccionados.has(p.id));
  const toggleTodos = () => {
    if (todosSeleccionados) setSeleccionados(prev => { const n = new Set(prev); rows.forEach(p => n.delete(p.id)); return n; });
    else setSeleccionados(prev => { const n = new Set(prev); rows.forEach(p => n.add(p.id)); return n; });
  };

  // Estilo del checkbox personalizado (relleno cuando está marcado)
  const chkStyle = (checked) => ({
    width: 14, height: 14, borderRadius: '3px', flexShrink: 0, cursor: 'pointer',
    border: `1.5px solid ${checked ? DL.blue : DL.border2}`,
    background: checked ? DL.blue : '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .12s',
  });

  const numSeleccionados = seleccionados.size;

  return (
    <>
    <Box>
      {/* Barra de selección múltiple: aparece solo si hay pedidos marcados y permite
         descargar todos sus PDF de una vez o cancelar la selección */}
      {numSeleccionados > 0 && (
        <Box sx={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          px:'16px', py:'6px',
          background:'rgba(84,126,105,.06)', borderBottom:`1px solid rgba(84,126,105,.15)`,
        }}>
          <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.blue, fontFamily:F }}>
            {numSeleccionados} pedido{numSeleccionados !== 1 ? 's' : ''} seleccionado{numSeleccionados !== 1 ? 's' : ''}
          </Typography>
          <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <Box component="button" onClick={() => setSeleccionados(new Set())} sx={{
              fontSize:11, fontWeight: 500, color:DL.tS, fontFamily:F,
              background:'transparent', border:'none', cursor:'pointer', px:'4px',
              '&:hover':{ color:DL.tH },
            }}>
              Cancelar
            </Box>
            <Box component="button" onClick={() => {
              // Descarga un PDF por cada pedido marcado. Se espacian 350 ms entre uno y otro
              // (i * 350) para que el navegador no bloquee las descargas lanzadas todas juntas.
              const elegidos = pedidos.filter(x => seleccionados.has(x.id));
              elegidos.forEach((x, i) => setTimeout(() => { descargarPedidoPdf(x); markPdf(x.id); }, i * 350));
            }} title={`Descargar PDF${numSeleccionados !== 1 ? 's' : ''}`} aria-label="Descargar PDF" sx={{
              display:'flex', alignItems:'center', gap:'6px',
              px:'10px', py:'6px', borderRadius:'8px',
              background:DL.blue, border:'none', cursor:'pointer',
              '&:hover':{ background:'#616161' }, transition:'background .13s',
            }}>
              <DownloadIcon sx={{ fontSize:15, color:'#fff' }} />
            </Box>
          </Box>
        </Box>
      )}
    <Box sx={{ overflowX:'auto' }}>
      <table style={{ width:'100%',borderCollapse:'collapse',minWidth:860 }}>
        <thead>
          <tr style={{ background:'#f8fafc' }}>
            {visibleCols.map(c => {
              const sortable = !!SORT_FN[c.key];
              const isActive = sortKey === c.key;
              return (
                <th key={c.key}
                  onClick={() => sortable && toggleSort(c.key)}
                  style={{
                    width:c.w||undefined, textAlign:'left',
                    padding:'10px 14px', fontFamily:F, fontSize:9, fontWeight: 500,
                    color: isActive ? DL.blue : DL.tS,
                    borderBottom:`1px solid rgba(26,26,26,.10)`, whiteSpace:'nowrap',
                    cursor: sortable ? 'pointer' : 'default',
                    userSelect:'none',
                    background: isActive ? 'rgba(84,126,105,.04)' : '#f8fafc',
                  }}>
                  {c.key === 'check' ? (
                    <Box sx={chkStyle(todosSeleccionados)} onClick={e => { e.stopPropagation(); toggleTodos(); }}>
                      {todosSeleccionados && <Box sx={{ width:8, height:8, borderRadius:'1px', background:'#fff' }} />}
                    </Box>
                  ) : (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'3px' }}>
                      {c.label}
                      {sortable && (
                        <span style={{ fontSize:9, color: isActive ? DL.blue : '#d4d4d4', lineHeight:1 }}>
                          {isActive ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      )}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={visibleCols.length} style={{ padding:'40px',textAlign:'center',fontFamily:F,fontSize:11,color:DL.tS }}>Sin registros</td></tr>
          ) : rows.map((p, i) => (
            <tr key={p.id}
              style={{ background: seleccionados.has(p.id) ? 'rgba(84,126,105,.05)' : i%2===0?'#ffffff':'#fafbfe' }}
              onMouseEnter={e => { if (!seleccionados.has(p.id)) e.currentTarget.style.background='rgba(84,126,105,.045)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = seleccionados.has(p.id) ? 'rgba(84,126,105,.05)' : i%2===0?'#ffffff':'#fafbfe'; }}
            >
              <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}>
                <Box sx={chkStyle(seleccionados.has(p.id))} onClick={() => toggleRow(p.id)}>
                  {seleccionados.has(p.id) && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </Box>
              </td>
              {colsVisibles.has('id') && <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}>
                <Box sx={{ display:'flex',alignItems:'center',gap:'6px' }}>
                  <Typography sx={{ fontSize:11,fontWeight: 500,color:DL.tH,fontFamily:F,whiteSpace:'nowrap',letterSpacing:'0.02em' }}>{p.id}</Typography>
                </Box>
                {/* Etiqueta del tipo de pedido (Reserva / Producción / Mixto) bajo el número */}
                {p.tipoPedido && (() => {
                  const tpMap = {
                    'Reserva':    { bg:'#f0fdf4', color:'#15803d', bd:'#bbf7d0' },
                    'Producción': { bg:'rgba(84,126,105,.08)', color:DL.blue, bd:'rgba(84,126,105,.2)' },
                    'Mixto':      { bg:'#fefce8', color:'#a16207', bd:'#fef08a' },
                  };
                  const tp = tpMap[p.tipoPedido] || { bg:'#f6f6f6', color:DL.tM, bd:DL.border2 };
                  return (
                    <Box sx={{ display:'inline-flex',alignItems:'center',px:'6px',py:'1px',borderRadius:'10px',mt:'3px',
                      background:tp.bg,border:`1px solid ${tp.bd}` }}>
                      <Typography sx={{ fontSize:9,fontWeight: 500,color:tp.color,fontFamily:F,whiteSpace:'nowrap' }}>
                        {p.tipoPedido}
                      </Typography>
                    </Box>
                  );
                })()}
              </td>}
              {/* Detalle */}
              {colsVisibles.has('lineas') && <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}>
                <LineasDetalle lineas={p.lineas} />
              </td>}
              {/* Vendedor + Sucursal */}
              {colsVisibles.has('vend') && <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}>
                <Typography sx={{ fontSize:11,fontWeight: 500,color:DL.tM,fontFamily:F }}>{p.vendedor}</Typography>
                {p.sucursal && <Typography sx={{ fontSize:10,color:DL.tS,fontFamily:F }}>Suc. {p.sucursal}</Typography>}
              </td>}
              {/* Registro */}
              {colsVisibles.has('reg') && <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}><FmtDate iso={p.registro}/></td>}
              {/* Cliente */}
              {colsVisibles.has('cli') && <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}>
                <Typography sx={{ fontSize:12,fontWeight: 500,color:DL.tH,fontFamily:F }}>{p.cliente.nombre}</Typography>
                <Typography sx={{ fontSize:10,color:DL.tS,fontFamily:F }}>{p.cliente.telefono}</Typography>
              </td>}
              {/* Entrega */}
              {colsVisibles.has('ent') && <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}><FmtDate iso={p.entrega}/></td>}
              {/* Lugar de Entrega */}
              {colsVisibles.has('lugar') && <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}>
                <Typography sx={{ fontSize:11,fontWeight: 500,color:DL.tM,fontFamily:F }}>
                  {p.lugarEntrega === 'Domicilio' && p.direccionEntrega
                    ? (typeof p.direccionEntrega === 'object'
                        ? p.direccionEntrega.direccion || ''
                        : p.direccionEntrega)
                    : p.lugarEntrega || '—'}
                </Typography>
              </td>}
              {/* Tipo */}
              {colsVisibles.has('tipo') && <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}><TipoChip tipo={p.tipoCliente}/></td>}
              {/* Estado de Pago */}
              {colsVisibles.has('estado') && <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}><EstadoChip estado={estadoEfectivoPedido(p)}/></td>}
              {/* Descarga */}
              {colsVisibles.has('descarga') && <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER }}>
                {pdfTimestamps[p.id] ? (
                  <Box sx={{ display:'flex',flexDirection:'column',gap:'1px' }}>
                    <Typography sx={{ fontSize:10,fontWeight: 500,color:'#16a34a',fontFamily:F,whiteSpace:'nowrap' }}>
                      PDF
                    </Typography>
                    <Typography sx={{ fontSize:9,color:DL.tS,fontFamily:F,whiteSpace:'nowrap' }}>
                      {tiempoRelativo(pdfTimestamps[p.id])}
                    </Typography>
                  </Box>
                ) : null}
              </td>}
              {/* Acciones */}
              <td style={{ padding:'13px 14px',borderBottom:ROW_BORDER,textAlign:'center' }}>
                <RowMenu p={p} onEdit={onEdit} onDelete={onDelete} onPdfDescargado={markPdf} onVerPagos={setPedidoPagos} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPagination && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={sortedPedidos.length}
          onPageChange={p => setPage(p)}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        />
      )}
    </Box>
    </Box>
    {/* Panel de pagos: solo se monta cuando se pidió "Ver pagos" de un pedido */}
    {pedidoPagos && <PagoDrawer pedido={pedidoPagos} onClose={() => setPedidoPagos(null)} />}
    </>
  );
}
