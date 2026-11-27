/*
 * NuevoPedido.jsx — Pantalla "Nuevo pedido" del sistema (React + Material UI).
 *
 * OBJETIVO: registrar un pedido de pastelería paso a paso, y también editar un pedido ya guardado
 * (cuando la URL trae ?id=...).
 *
 * FLUJO DE 4 PASOS (barra superior):
 *   1. Cliente → buscar o crear al cliente.                      (componente Step1)
 *   2. Entrega → tipo de pedido, fecha/hora, lugar y dirección.  (componente Step3)
 *   3. Pedido  → elegir productos: catálogo, accesorios o pastel/cupcakes/galletas personalizados.
 *                                                                (componente Step2)
 *   4. Pago    → resumen del receptor, tipo y método de pago.    (componente Step4)
 *   OJO: los nombres Step2 y Step3 quedaron invertidos respecto al número del paso; se conservaron así
 *   para no romper el código. El panel derecho (ResumenSidebar) resume el pedido desde el paso 3.
 *
 * REGLAS DE NEGOCIO:
 *   - Total = subtotal de productos + IVA 13 % + envío.
 *   - Envío: solo si la entrega es a Domicilio; el precio depende de la zona del departamento (ZONAS_ENVIO).
 *   - Reserva: productos de línea en stock; puede entregarse el mismo día y NO admite pastel personalizado.
 *   - Producción: pedido personalizado; requiere mínimo 5 días de anticipación.
 *   - Si parte de las unidades sale de stock y parte se produce, el pedido se muestra como "Mixto".
 *   - Cotización: se guarda con estadoPago 'Pendiente' y no se produce hasta registrar un pago.
 *
 * QUÉ SE GUARDA Y DÓNDE (no hay servidor; se usa localStorage del navegador):
 *   - 'pedidos_nuevos': lista de pedidos confirmados (PED-...) y cotizaciones (COT-...).
 *   - 'pagos_pedidos': pagos registrados por pedido (el anticipo inicial o los abonos al editar).
 *   - Los cambios a un pedido existente no se aplican directo: se envían como solicitud de cambio.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, TextField, InputAdornment, IconButton,
  Tooltip, Divider, Dialog, DialogContent, Select, MenuItem, Menu, FormControl, InputLabel, Switch,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Person as PersonIcon,
  AccountBalance as JuridicoIcon,
  Inventory2 as ProdIcon,
  LocationOn as LocIcon,
  CreditCard as PayIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  WhatsApp as WaIcon,
  ExpandMore as ExpandMoreIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  CallSplit as CallSplitIcon,
} from '@mui/icons-material';
import { DL } from '../theme';
import EdicionPedidoPanel from '../components/common/EdicionPedidoPanel';
import { crearSolicitud, getHistorialPedido, aplicarOverrides } from '../data/solicitudesCambio';
import {
  PEDIDOS_INICIALES, CLIENTES, CATALOGO, CATALOGO_CATS, ACCESORIOS, ACCESORIOS_CATS, TOPPERS, TOPPERS_SUBCATS,
  PASTEL_TAMANOS, CUPCAKE_TAMANOS, PASTEL_SABORES, PASTEL_REMOJOS, PASTEL_RELLENOS,
  PASTEL_TIPOS_RELLENO, PRECIO_POR_PORCION, PASTEL_DEDICATORIA_TIPOS,
  CUPCAKE_STEPS, CUPCAKE_SABORES_CREMA, CUPCAKE_SABORES_TORTA, CUPCAKE_RELLENOS, CUPCAKE_COLORES, CUPCAKE_TEXTURAS, CUPCAKE_PRECIO_UNITARIO,
  GALLETAS_STEPS, GALLETAS_FORMAS,
  PASTEL_TEXTURAS, PASTEL_TEXTURAS_BASE, PASTEL_COLORES_POR_TEXTURA,
  PASTEL_RUEDOS, PASTEL_RUEDOS_TIPOS, PASTEL_RUEDO_ESTILOS,
  PASTEL_DEDICATORIAS, PASTEL_STEPS,
  LUGARES_ENTREGA, TIPOS_PAGO, METODOS_PAGO,
} from '../data/pedidosMock';

// ─── Stepper ──────────────────────────────────────────────────────────────────
// Los 4 pasos del asistente, en el orden en que se recorren: Cliente → Entrega → Pedido → Pago.
// 'n' es el número que se muestra dentro del círculo y se compara con el paso actual.
const STEPS = [
  { n: 1, label: 'Cliente' },
  { n: 2, label: 'Entrega' },
  { n: 3, label: 'Pedido'  },
  { n: 4, label: 'Pago'    },
];

const SF = "'Inter', ui-sans-serif, system-ui, sans-serif";

/*
 * Stepper: barra de progreso con los 4 pasos del asistente.
 * Recibe: step (paso actual, 1 a 4) y onStepClick (opcional; si existe, cada paso es clickeable).
 * Devuelve: círculos numerados unidos por líneas; los pasos ya completados se marcan con check.
 */
function Stepper({ step, onStepClick }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', gap: 0 }}>
      {STEPS.map((s, i) => {
        // Cada paso se pinta distinto según esté completado, activo o pendiente respecto al paso actual.
        const done    = step > s.n;
        const active  = step === s.n;
        const pending = step < s.n;
        return (
          <Box key={s.n} sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Step node */}
            <Box onClick={() => onStepClick?.(s.n)}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                cursor: onStepClick ? 'pointer' : 'default' }}>
              {/* Circle */}
              <Box sx={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? DL.green : active ? DL.blue : '#fff',
                border: `2px solid ${done ? DL.green : active ? DL.blue : 'rgba(26,26,26,.18)'}`,
                boxShadow: active ? `0 0 0 4px rgba(84,126,105,.15)` : 'none',
                transition: 'all .2s',
                '&:hover': onStepClick ? { opacity: 0.8 } : {},
              }}>
                {done ? (
                  <CheckIcon sx={{ fontSize: 14, color: '#fff' }} />
                ) : (
                  <Typography sx={{
                    fontSize: 12, fontWeight: 500, fontFamily: SF,
                    color: active ? '#fff' : 'rgba(26,26,26,.35)',
                    lineHeight: 1,
                  }}>
                    {s.n}
                  </Typography>
                )}
              </Box>
              {/* Label */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{
                  fontSize: 10, fontWeight: active ? 500 : 500, fontFamily: SF,
                  color: done ? DL.green : active ? DL.navy : DL.tS,
                  whiteSpace: 'nowrap', lineHeight: 1.2,
                  transition: 'color .2s',
                }}>
                  {s.label}
                </Typography>
              </Box>
            </Box>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <Box sx={{
                width: { xs: 28, sm: 48, md: 72 },
                height: 2,
                mx: '8px',
                mb: '16px', // align with circle center
                background: done
                  ? `linear-gradient(90deg, ${DL.green}, ${step > s.n + 1 ? DL.green : 'rgba(26,26,26,.15)'})`
                  : 'rgba(26,26,26,.12)',
                borderRadius: 1,
                flexShrink: 0,
                transition: 'background .3s',
              }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Sidebar de Resumen ───────────────────────────────────────────────────────
const SB_F = "'Inter', ui-sans-serif, system-ui, sans-serif";

// Frases sugeridas para dedicatorias (quedaron definidas como atajos, pero hoy no se muestran en pantalla).
const DED_SUGS = ['Feliz Día 🎂', 'Enhorabuena 🎉', 'Con Afecto ❤️', 'En tu día ✨'];

/*
 * DedicatoriaInline: caja de texto para escribir la dedicatoria de UNA unidad de pastel.
 * Recibe: value (texto actual) y onChange (función que recibe el nuevo texto).
 * Tiene un límite de 100 caracteres y un botón "×" para borrarla.
 */
function DedicatoriaInline({ value, onChange }) {
  return (
    <Box sx={{ mt: '6px', borderTop: `1px dashed ${DL.border2}`, pt: '7px' }}>
      {/* Input directo */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
        <textarea
          maxLength={100}
          value={value}
          placeholder="Dedicatoria (opcional)…"
          onChange={e => onChange(e.target.value)}
          rows={value && value.length > 35 ? 2 : 1}
          style={{
            flex: 1, fontSize: 10, fontFamily: SB_F,
            border: `1px solid ${value ? 'rgba(84,126,105,.4)' : DL.border}`,
            borderRadius: '6px', padding: '5px 8px', outline: 'none',
            background: value ? 'rgba(84,126,105,.04)' : '#fafafa',
            color: '#1a1a1a', transition: 'border .15s, background .15s',
            resize: 'none', lineHeight: 1.5, overflowY: 'hidden',
          }}
        />
        {value && (
          <Box onClick={() => onChange('')} sx={{ cursor: 'pointer', color: DL.tS, lineHeight: 1, fontSize: 13, mt: '4px', '&:hover': { color: DL.red } }}>×</Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Item row con dedicatoria colapsable ──────────────────────────────────────
/*
 * OrdenItemRow: fila de un producto dentro de una orden en el resumen lateral.
 * Recibe: el item, su posición (ii), el id de su orden y los callbacks para quitarlo, cambiar cantidad,
 * editar dedicatorias y dividir stock/producción. hideSplit oculta el campo "En stock" y readOnly
 * bloquea la edición (se usa en el paso de pago, donde el pedido ya no se modifica).
 */
function OrdenItemRow({ item, ii, totalItems, ordenId, onRemoveItem, onChangeQty, onDedicatoriaChange, onStockSplit, hideSplit, readOnly }) {
  const [dedOpen, setDedOpen] = useState(false);
  const qty = item.qty || 1;
  // Solo los productos de repostería o con pastel configurado admiten dedicatoria (las galletas no).
  const hasDed = (item.categoria === 'Repostería' || !!item.pastelConfig) && item.pastelConfig?.tipoProd !== 'galletas';

  const [stockInput, setStockInput] = useState('');

  // Reparte la línea entre stock y producción: el número escrito en "En stock" es lo que ya hay en tienda
  // y el resto se manda a producción. Se ignora si no es un número válido o si no es menor a la cantidad pedida.
  const ejecutarSplit = () => {
    if (hideSplit) return;
    const raw = stockInput.trim();
    setStockInput('');
    if (raw === '') return;
    const v = parseInt(raw);
    if (isNaN(v) || v < 0 || v >= qty) return;
    onStockSplit(ordenId, ii, v, true);
  };

  return (
    <Box sx={{
      px: '12px', py: '8px',
      borderBottom: ii < totalItems - 1 ? `1px solid ${DL.border}` : 'none',
      background: '#fff',
    }}>
      {/* Nombre + SKU + botón dedicatoria + eliminar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0, mr: '4px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, fontFamily: SB_F, lineHeight: 1.4 }}>
              {item.nombre}
            </Typography>
            {item.sku && (
              <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: SB_F, letterSpacing: '0.02em', flexShrink: 0 }}>
                {item.sku}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          {hasDed && (
            <Tooltip title={dedOpen ? 'Ocultar dedicatorias' : 'Ver dedicatorias'} arrow>
              <IconButton size="small" onClick={() => setDedOpen(v => !v)}
                sx={{ p: '2px', color: dedOpen ? DL.blue : DL.tS, border: `1px solid ${dedOpen ? 'rgba(84,126,105,.3)' : DL.border}`, borderRadius: '5px', background: dedOpen ? 'rgba(84,126,105,.06)' : '#fff', '&:hover': { color: DL.blue } }}>
                <ExpandMoreIcon sx={{ fontSize: 12, transform: dedOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .18s' }} />
              </IconButton>
            </Tooltip>
          )}
          {!readOnly && (
            <Tooltip title="Quitar" arrow>
              <IconButton size="small" onClick={() => onRemoveItem(ordenId, ii)}
                sx={{ color: DL.red, p: '2px', '&:hover': { background: DL.redBg }, flexShrink: 0 }}>
                <DeleteIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Resumen pastel personalizado (colapsable) */}
      {dedOpen && item.pastelConfig && (() => {
        const c = item.pastelConfig;
        // Los pasteles montados (de 2 pisos) guardan sabor, remojo y relleno por piso (sufijo _p2 para el piso 2),
        // por eso aquí se separan las filas en "Piso 1", "Piso 2" y datos generales.
        const esMontadoResumen = !!c.tamano?.montado;
        const filasPiso1 = esMontadoResumen ? [
          { label: 'Sabor',   val: c.sabor },
          { label: 'Remojo',  val: c.remojo },
          { label: 'Relleno', val: c.relleno },
        ].filter(f => f.val && f.val !== '') : [];
        const filasPiso2 = esMontadoResumen ? [
          { label: 'Sabor',   val: c.sabor_p2 },
          { label: 'Remojo',  val: c.remojo_p2 },
          { label: 'Relleno', val: c.relleno_p2 },
        ].filter(f => f.val && f.val !== '') : [];
        const filas = esMontadoResumen ? [
          { label: 'Textura', val: c.textura },
          { label: 'Ruedo',   val: c.ruedo },
          { label: 'Dedic.',  val: c.dedicatoria },
        ].filter(f => f.val && f.val !== '') : [
          { label: 'Sabor',   val: c.sabor },
          { label: 'Remojo',  val: c.remojo },
          { label: 'Relleno', val: c.relleno },
          { label: 'Textura', val: c.textura },
          { label: 'Ruedo',   val: c.ruedo },
          { label: 'Dedic.',  val: c.dedicatoria },
        ].filter(f => f.val && f.val !== '');
        const accs = Object.values(c.accesorios || {});
        if (!filas.length && !accs.length) return null;
        const renderFilas = (fs) => fs.map(f => (
          <Box key={f.label} sx={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
            <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, fontFamily: SB_F, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, minWidth: 42 }}>
              {f.label}
            </Typography>
            <Typography sx={{ fontSize: 10, color: DL.tM, fontFamily: SB_F, lineHeight: 1.4 }}>
              {f.val}
            </Typography>
          </Box>
        ));
        return (
          <Box sx={{ mt: '6px', pt: '6px', borderTop: `1px dashed ${DL.border2}`, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {esMontadoResumen && filasPiso1.length > 0 && (
              <Box sx={{ mb: '2px' }}>
                <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.blue, fontFamily: SB_F, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '3px' }}>Piso 1</Typography>
                {renderFilas(filasPiso1)}
              </Box>
            )}
            {esMontadoResumen && filasPiso2.length > 0 && (
              <Box sx={{ mb: '2px', pt: '4px', borderTop: `1px dashed ${DL.border}` }}>
                <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.blue, fontFamily: SB_F, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '3px' }}>Piso 2</Typography>
                {renderFilas(filasPiso2)}
              </Box>
            )}
            {filas.length > 0 && (
              <Box sx={esMontadoResumen ? { pt: '4px', borderTop: `1px dashed ${DL.border}` } : {}}>
                {renderFilas(filas)}
              </Box>
            )}
            {accs.length > 0 && (
              <Box sx={{ mt: '3px', pt: '3px', borderTop: `1px dashed ${DL.border}` }}>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, fontFamily: SB_F, textTransform: 'uppercase', letterSpacing: '0.05em', mb: '3px' }}>
                  Accesorios
                </Typography>
                {accs.map(a => (
                  <Box key={a.id} sx={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <Typography sx={{ fontSize: 10, color: DL.tM, fontFamily: SB_F, lineHeight: 1.4, flex: 1 }}>
                      {a.nombre}{a.qty > 1 ? ` ×${a.qty}` : ''}
                    </Typography>
                    <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, fontFamily: SB_F }}>
                      ${((a.precio || 0) * (a.qty || 1)).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      })()}

      {/* Dedicatorias de Pastelería (colapsable) */}
      {dedOpen && item.categoria === 'Repostería' && (() => {
        // Con 1 unidad hay una sola dedicatoria; con varias unidades se pide una por cada unidad (item.dedicatorias[k]).
        if (qty === 1) {
          return (
            <DedicatoriaInline
              value={(item.dedicatorias?.[0]) ?? (item.dedicatoria || '')}
              onChange={val => onDedicatoriaChange?.(ordenId, ii, val, 0)}
            />
          );
        }
        return (
          <Box sx={{ mt: '6px', borderTop: `1px dashed ${DL.border2}`, pt: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Array.from({ length: qty }, (_, k) => (
              <Box key={k}>
                <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, fontFamily: SB_F, mb: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Unidad {k + 1}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <textarea
                    maxLength={100}
                    value={(item.dedicatorias || [])[k] || ''}
                    placeholder={`Dedicatoria unidad ${k + 1}…`}
                    onChange={e => onDedicatoriaChange?.(ordenId, ii, e.target.value, k)}
                    rows={(item.dedicatorias?.[k] || '').length > 35 ? 2 : 1}
                    style={{
                      flex: 1, fontSize: 10, fontFamily: SB_F,
                      border: `1px solid ${(item.dedicatorias?.[k]) ? 'rgba(84,126,105,.4)' : DL.border}`,
                      borderRadius: '6px', padding: '5px 8px', outline: 'none',
                      background: (item.dedicatorias?.[k]) ? 'rgba(84,126,105,.04)' : '#fafafa',
                      color: '#1a1a1a', resize: 'none', lineHeight: 1.5, overflowY: 'hidden',
                    }}
                  />
                  {(item.dedicatorias?.[k]) && (
                    <Box onClick={() => onDedicatoriaChange?.(ordenId, ii, '', k)}
                      sx={{ cursor: 'pointer', color: DL.tS, fontSize: 13, mt: '4px', lineHeight: 1, '&:hover': { color: DL.red } }}>×</Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        );
      })()}

      {/* Precio + controles qty + campo En stock inline */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '5px', gap: '6px', flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: SB_F }}>
          $ {item.precio.toFixed(2)}
        </Typography>
        {item.qty !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
            {!readOnly && (
              <IconButton size="small" onClick={() => onChangeQty(ordenId, ii, -1)}
                sx={{ p: '2px', border: `1px solid ${DL.border}`, borderRadius: '5px', background: '#fff', '&:hover': { background: DL.bg } }}>
                <RemoveIcon sx={{ fontSize: 10, color: DL.tM }} />
              </IconButton>
            )}
            {readOnly ? (
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, fontFamily: SB_F, px: '4px' }}>
                {item.qty}×
              </Typography>
            ) : (
              <input type="number" min="1" value={item.qty}
                onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) onChangeQty(ordenId, ii, v - item.qty); }}
                onBlur={e => { const v = parseInt(e.target.value); if (isNaN(v) || v < 1) onChangeQty(ordenId, ii, 1 - item.qty); }}
                style={{ width: '40px', textAlign: 'center', border: `1px solid ${DL.border}`, borderRadius: '5px', fontSize: 11, fontWeight: 500, fontFamily: SB_F, color: DL.tH, background: '#fff', padding: '2px 4px', outline: 'none', MozAppearance: 'textfield' }}
              />
            )}
            {!readOnly && (
              <IconButton size="small" onClick={() => onChangeQty(ordenId, ii, 1)}
                sx={{ p: '2px', border: `1px solid ${DL.border}`, borderRadius: '5px', background: '#fff', '&:hover': { background: DL.bg } }}>
                <AddIcon sx={{ fontSize: 10, color: DL.tM }} />
              </IconButton>
            )}
            <Typography sx={{ fontSize: 10, color: DL.blue, fontWeight: 500, ml: '2px', fontFamily: SB_F }}>
              $ {(item.precio * item.qty).toFixed(2)}
            </Typography>

            {/* Campo En stock — solo en órdenes normales */}
            {!hideSplit && (<>
              <Box sx={{ width: '1px', height: '14px', background: DL.border2, mx: '4px' }} />
              <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: SB_F, whiteSpace: 'nowrap' }}>En stock:</Typography>
              <input
                type="text" inputMode="numeric"
                placeholder={String(qty)}
                value={stockInput}
                onChange={e => setStockInput(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') { ejecutarSplit(); e.target.blur(); } }}
                style={{ width: '40px', textAlign: 'center', border: `1px solid ${stockInput ? DL.blue : DL.border}`, borderRadius: '5px', fontSize: 11, fontWeight: 500, fontFamily: SB_F, color: DL.tH, background: '#fff', padding: '2px 4px', outline: 'none' }}
              />
            </>)}

          </Box>
        )}
      </Box>
    </Box>
  );
}

/*
 * OrdenAccordion: tarjeta colapsable que agrupa los productos de una orden (Orden I, II, ...).
 * Recibe: la orden, su índice (oi), callbacks para editar/quitar y el tipo de pedido.
 * El campo "En stock" se oculta en órdenes de Producción y en pedidos de tipo Producción o Reserva.
 * Con readOnly (paso de pago) no se puede editar ni eliminar nada.
 */
function OrdenAccordion({ orden, oi, onRemoveItem, onChangeQty, onRemoveOrden, onDedicatoriaChange, onStockSplit, tipoPedido, readOnly, onEditOrden }) {
  const [open, setOpen] = useState(true);
  // Subtotal de la orden (sin IVA ni envío): precio × cantidad de cada producto.
  const subtotal = orden.items.reduce((s, it) => s + it.precio * (it.qty || 1), 0);

  return (
    <Box sx={{ mb: '8px', borderRadius: '10px', border: `1px solid ${DL.border}`, overflow: 'hidden', boxShadow: DL.e1 }}>
      {/* Header — clickeable para colapsar */}
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: '12px', py: '10px', cursor: 'pointer', transition: 'background .13s',
          background: '#547e69',
          '&:hover': { background: '#616161' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', fontFamily: SB_F, lineHeight: 1.2 }}>
              Orden {toRoman(oi + 1)}
            </Typography>
            <Typography sx={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.85)', fontFamily: SB_F }}>
              {orden.tipo}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff', fontFamily: SB_F }}>
            $ {subtotal.toFixed(2)}
          </Typography>
          {/* Expand/collapse chevron */}
          <Box sx={{
            color: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s',
          }}>
            <ExpandMoreIcon sx={{ fontSize: 16 }} />
          </Box>
          {!readOnly && !orden.esCatalogo && onEditOrden && (
            <Tooltip title="Editar orden" arrow>
              <IconButton size="small"
                onClick={e => { e.stopPropagation(); onEditOrden(orden); }}
                sx={{ color: 'rgba(255,255,255,.55)', '&:hover': { color: '#d4d4d4' }, p: '2px' }}>
                <EditIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
          {!readOnly && (
            <Tooltip title="Eliminar orden" arrow>
              <IconButton size="small"
                onClick={e => { e.stopPropagation(); onRemoveOrden(orden.id); }}
                sx={{ color: 'rgba(255,255,255,.35)', '&:hover': { color: '#fca5a5' }, p: '2px' }}>
                <DeleteIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Items colapsables */}
      {open && (
        <Box>
          {orden.items.map((item, ii) => (
            <OrdenItemRow
              key={item.id ?? `${orden.id}-${ii}`}
              item={item}
              ii={ii}
              totalItems={orden.items.length}
              ordenId={orden.id}
              onRemoveItem={onRemoveItem}
              onChangeQty={onChangeQty}
              onDedicatoriaChange={onDedicatoriaChange}
              onStockSplit={onStockSplit}
              hideSplit={!!orden.isProduccion || tipoPedido === 'Producción' || tipoPedido === 'Reserva'}
              readOnly={readOnly}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

/*
 * ResumenSidebar: panel derecho con el resumen del pedido, visible en todos los pasos.
 * Recibe: datos del cliente/entrega/dirección, precioEnvio, el paso actual, las órdenes y los callbacks
 * de edición (onAgregarPastel se recibe pero hoy no se usa). pastelEnProceso bloquea el pago mientras
 * haya un pastel a medio configurar.
 * Provoca: onGuardar (guardar cotización o cambios) y onPagar (avanzar al paso de pago).
 */
function ResumenSidebar({ cliente, entrega, direccion, precioEnvio, step, ordenes, onRemoveItem, onChangeQty, onRemoveOrden, onAgregarPastel, pastelEnProceso, onGuardar, onPagar, tipoPedido, onDedicatoriaChange, onStockSplit, isConfirmedEdit, pagoError, onEditOrden }) {
  // Subtotal general: suma de todas las órdenes antes de impuestos y envío.
  const subtotal = useMemo(() =>
    ordenes.reduce((s, o) => s + o.items.reduce((ss, it) => ss + it.precio * (it.qty || 1), 0), 0),
    [ordenes]);
  // El IVA (13 %) y el envío solo se suman al total en el paso 4 (Pago); en los pasos anteriores se muestra el subtotal.
  const iva = subtotal * 0.13;
  const envio = precioEnvio || 0;
  const total = subtotal + (step === 4 ? iva + envio : 0);

  // Una Reserva pasa a ser "Mixto" cuando parte de las unidades se producen (orden de producción o stock insuficiente)
  // y el resto sale de stock.
  // Si algún item tiene split parcial de stock → pedido Mixto
  const tipoPedidoEfectivo = useMemo(() => {
    if (tipoPedido !== 'Reserva') return tipoPedido;
    const tieneProduccion = ordenes.some(o => o.isProduccion) || ordenes.some(o => o.items.some(it => it.stockDisp !== undefined && it.stockDisp < (it.qty || 1)));
    return tieneProduccion ? 'Mixto' : tipoPedido;
  }, [ordenes, tipoPedido]);

  return (
    <Box sx={{
      flexShrink: 0,
      background: '#fff', borderRadius: '12px',
      border: `1px solid ${DL.border}`, boxShadow: DL.e2,
      display: 'flex', flexDirection: 'column',
      position: 'absolute', inset: 0, width: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{ p: '12px 14px', borderBottom: `1px solid ${DL.border}` }}>
        {/* Título + chip tipo */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: SB_F }}>
            Resumen de Pedido
          </Typography>
          {tipoPedidoEfectivo && (() => {
            const tpMap = {
              'Reserva':    { bg: '#f0fdf4', color: '#15803d', bd: '#bbf7d0' },
              'Producción': { bg: 'rgba(84,126,105,.08)', color: DL.blue, bd: 'rgba(84,126,105,.2)' },
              'Mixto':      { bg: '#fefce8', color: '#a16207', bd: '#fef08a' },
            };
            const tp = tpMap[tipoPedidoEfectivo] || {};
            return (
              <Box sx={{ px: '7px', py: '2px', borderRadius: '8px', background: tp.bg, border: `1px solid ${tp.bd}` }}>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: tp.color, fontFamily: SB_F }}>{tipoPedidoEfectivo}</Typography>
              </Box>
            );
          })()}
        </Box>

        {cliente?.nombre && (
          <Typography sx={{ fontSize: 9, color: DL.tS, mt: '2px', fontFamily: SB_F }}>
            {cliente.nombre} · {cliente.telefono}
          </Typography>
        )}
        {entrega && (
          <Typography sx={{ fontSize: 9, color: DL.tS, mt: '1px', fontFamily: SB_F }}>{entrega}</Typography>
        )}
        {direccion && (
          <Typography sx={{ fontSize: 9, color: DL.tS, mt: '1px', fontFamily: SB_F, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{direccion}</Typography>
        )}
      </Box>

      {/* Órdenes — scroll cuando el contenido es largo */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: '10px 12px', scrollbarWidth: 'thin', scrollbarColor: `${DL.border2} transparent` }}>
        {ordenes.length === 0 && (
          <Box sx={{ py: '32px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: SB_F }}>
              Aún no hay productos en el pedido
            </Typography>
          </Box>
        )}
        {ordenes.map((orden, oi) => (
          <OrdenAccordion
            key={orden.id}
            orden={orden}
            oi={oi}
            onRemoveItem={onRemoveItem}
            onChangeQty={onChangeQty}
            onRemoveOrden={onRemoveOrden}
            onDedicatoriaChange={onDedicatoriaChange}
            onStockSplit={onStockSplit}
            tipoPedido={tipoPedido}
            readOnly={step === 4}
            onEditOrden={step === 3 ? onEditOrden : null}
          />
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ p: '12px 14px', borderTop: `1px solid ${DL.border}` }}>
        {/* Paso 4: se desglosa subtotal + IVA 13 % + envío = total. En los demás pasos solo se muestra el total parcial. */}
        {step === 4 ? (
          <Box sx={{ mb: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Subtotal', val: subtotal },
              { label: 'IVA (13%)', val: iva },
              { label: 'Envío', val: envio },
            ].map(({ label, val }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: SB_F }}>{label}</Typography>
                <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: SB_F }}>$ {val.toFixed(2)}</Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: `1px solid ${DL.border}`, mt: '4px', pt: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: SB_F }}>Total:</Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: DL.tH, letterSpacing: '-0.03em', fontFamily: SB_F }}>
                $ {total.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '10px' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: SB_F }}>Total Pedido:</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: DL.tH, letterSpacing: '-0.03em', fontFamily: SB_F }}>
              $ {subtotal.toFixed(2)}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Guardar Cotización / Guardar Cambios */}
          <Box onClick={onGuardar} sx={{
            py: '9px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
            border: `1.5px solid ${DL.border2}`, background: '#fff',
            '&:hover': { background: DL.bg, borderColor: DL.navy },
            transition: 'all .14s',
          }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, fontFamily: SB_F }}>
              {isConfirmedEdit ? 'Guardar Cambios' : 'Guardar Cotización'}
            </Typography>
          </Box>

          {/* Pagar Pedido — oculto en modo edición */}
          {!isConfirmedEdit && <Box onClick={!pastelEnProceso ? onPagar : undefined} sx={{
            py: '9px', borderRadius: '8px', textAlign: 'center',
            cursor: pastelEnProceso ? 'not-allowed' : 'pointer',
            background: pastelEnProceso ? 'rgba(26,26,26,.08)' : DL.blue,
            opacity: pastelEnProceso ? 0.5 : 1,
            boxShadow: pastelEnProceso ? 'none' : '0 2px 8px rgba(84,126,105,.28)',
            '&:hover': pastelEnProceso ? {} : { background: DL.navy },
            transition: 'all .14s',
          }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: pastelEnProceso ? DL.tM : '#fff', fontFamily: SB_F }}>
              Pagar Pedido
            </Typography>
          </Box>}

          {pastelEnProceso && (
            <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: SB_F, textAlign: 'center', lineHeight: 1.4 }}>
              Agrega o descarta el pastel personalizado para habilitar el pago
            </Typography>
          )}
          {pagoError && !pastelEnProceso && (
            <Typography sx={{ fontSize: 9, color: '#dc2626', fontFamily: SB_F, textAlign: 'center', lineHeight: 1.4 }}>
              Selecciona tipo de pago y método de pago para continuar
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// Convierte la posición de la orden (1, 2, 3...) a número romano para rotularla ("Orden I", "Orden II"...).
function toRoman(n) {
  const map = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  return map[n - 1] || n;
}

// ─── Step 1: Datos del cliente ────────────────────────────────────────────────
// ─── Modal Nuevo Cliente ──────────────────────────────────────────────────────
const TIPO_DOC_OPTIONS = ['DUI', 'Pasaporte', 'Carné de Residente'];
const ACT_ECONOMICA_OPTIONS = ['Comercio al por menor', 'Comercio al por mayor', 'Servicios', 'Industria', 'Agropecuario', 'Otro'];

// ─── Departamentos y Municipios de El Salvador ────────────────────────────────
// Departamentos de El Salvador con sus municipios; alimenta los selects en cascada de las direcciones.
const SV_GEO = {
  'Ahuachapán':    ['Ahuachapán','Apaneca','Atiquizaya','Concepción de Ataco','El Refugio','Guaymango','Jujutla','San Francisco Menéndez','San Lorenzo','San Pedro Puxtla','Tacuba','Turín'],
  'Santa Ana':     ['Santa Ana','Candelaria de la Frontera','Chalchuapa','Coatepeque','El Congo','El Porvenir','Masahuat','Metapán','San Antonio Pajonal','San Sebastián Salitrillo','Santa Rosa Guachipilín','Santiago de la Frontera','Texistepeque'],
  'Sonsonate':     ['Sonsonate','Acajutla','Armenia','Caluco','Cuisnahuat','Izalco','Juayúa','Nahuizalco','Nahulingo','Salcoatitán','San Antonio del Monte','San Julián','Santa Catarina Masahuat','Santa Isabel Ishuatán','Santo Domingo de Guzmán','Sonzacate'],
  'Chalatenango':  ['Chalatenango','Agua Caliente','Arcatao','Azacualpa','Citalá','Comalapa','Concepción Quezaltepeque','Dulce Nombre de María','El Carrizal','El Paraíso','La Laguna','La Palma','La Reina','Las Vueltas','Nombre de Jesús','Nueva Concepción','Nueva Trinidad','Ojos de Agua','Potonico','San Antonio de la Cruz','San Antonio Los Ranchos','San Fernando','San Francisco Lempa','San Francisco Morazán','San Ignacio','San Isidro Labrador','San Luis del Carmen','San Miguel de Mercedes','San Rafael','Santa Rita','Tejutla'],
  'La Libertad':   ['Santa Tecla','Antiguo Cuscatlán','Chiltiupán','Ciudad Arce','Comasagua','Huizúcar','Jayaque','Jicalapa','La Libertad','Nuevo Cuscatlán','Quezaltepeque','Sacacoyo','San Juan Opico','San Matías','San Pablo Tacachico','Talnique','Tamanique','Teotepeque','Tepecoyo','Zaragoza'],
  'San Salvador':  ['San Salvador','Aguilares','Apopa','Ayutuxtepeque','Cuscatancingo','Ciudad Delgado','El Paisnal','Guazapa','Ilopango','Mejicanos','Nejapa','Panchimalco','Rosario de Mora','San Marcos','San Martín','Santiago Texacuangos','Santo Tomás','Soyapango','Tonacatepeque'],
  'Cuscatlán':     ['Cojutepeque','El Carmen','El Rosario','Monte San Juan','Oratorio de Concepción','San Bartolomé Perulapía','San Cristóbal','San José Guayabal','San Pedro Perulapán','Santa Cruz Analquito','Santa Cruz Michapa','Suchitoto','San Ramón'],
  'La Paz':        ['Zacatecoluca','Cuyultitán','El Rosario','Jerusalén','Mercedes La Ceiba','Olocuilta','Paraíso de Osorio','San Antonio Masahuat','San Emigdio','San Francisco Chinameca','San Juan Nonualco','San Juan Talpa','San Juan Tepezontes','San Luis La Herradura','San Luis Talpa','San Miguel Tepezontes','San Pedro Masahuat','San Pedro Nonualco','San Rafael Obrajuelo','Santa María Ostuma','Santiago Nonualco','Tapalhuaca'],
  'Cabañas':       ['Suchitoto','Cinquera','Dolores','Guacotecti','Ilobasco','Jutiapa','San Isidro','Sensuntepeque','Tejutepeque','Victoria'],
  'San Vicente':   ['San Vicente','Apastepeque','Guadalupe','San Cayetano Istepeque','San Esteban Catarina','San Ildefonso','San Lorenzo','San Sebastián','Santa Clara','Santo Domingo','Tecoluca','Tepetitán','Verapaz'],
  'Usulután':      ['Usulután','Alegría','Berlín','California','Concepción Batres','El Triunfo','Ereguayquín','Estanzuelas','Jiquilisco','Jucuapa','Jucuarán','Mercedes Umaña','Nueva Granada','Ozatlán','Puerto El Triunfo','San Agustín','San Buenaventura','San Dionisio','San Francisco Javier','Santa Elena','Santa María','Santiago de María','Tecapán'],
  'San Miguel':    ['San Miguel','Carolina','Chapeltique','Chinameca','Chirilagua','Ciudad Barrios','Comacarán','El Tránsito','Lolotique','Moncagua','Nueva Guadalupe','Nuevo Edén de San Juan','Quelepa','San Antonio','San Gerardo','San Jorge','San Luis de la Reina','San Rafael Oriente','Sesori','Uluazapa'],
  'Morazán':       ['San Francisco Gotera','Arambala','Cacaopera','Chilanga','Corinto','Delicias de Concepción','El Divisadero','El Rosario','Gualococti','Guatajiagua','Joateca','Jocoaitique','Jocoro','Lolotiquillo','Meanguera','Osicala','Perquín','San Carlos','San Fernando','San Isidro','San Simón','Sensembra','Sociedad','Torola','Yamabal','Yoloaiquín'],
  'La Unión':      ['La Unión','Anamorós','Bolívar','Concepción de Oriente','Conchagua','El Carmen','El Sauce','Intipucá','Lislique','Meanguera del Golfo','Nueva Esparta','Pasaquina','Polorós','San Alejo','San José','Santa Rosa de Lima','Yayantique','Yucuaiquín'],
};
const DEPTOS = Object.keys(SV_GEO);

// ─── Direcciones ──────────────────────────────────────────────────────────────
// Plantilla de dirección vacía: se copia al abrir el formulario de "Nueva dirección".
const DIR_EMPTY = { direccion: '', departamento: '', municipio: '', comentario: '', telefono: '', responsable: '' };

/*
 * DirRowMenu: menú de tres puntos (Editar / Eliminar) de cada fila de la tabla de direcciones.
 * Recibe: onEdit y onDelete, que se ejecutan al elegir la opción correspondiente.
 */
function DirRowMenu({ onEdit, onDelete }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <IconButton size="small" onClick={e => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{ p: '3px', color: DL.tS, border: `1px solid ${DL.border}`, borderRadius: '6px', background: '#fff', '&:hover': { color: DL.tH } }}>
        <MoreVertIcon sx={{ fontSize: 14 }} />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: '0 4px 16px rgba(0,0,0,.1)', minWidth: 130 } } }}>
        <MenuItem onClick={() => { setAnchor(null); onEdit?.(); }}
          sx={{ gap: '8px', fontSize: 12, fontFamily: SF, color: DL.blue, fontWeight: 500, '&:hover': { background: 'rgba(84,126,105,.07)' } }}>
          <EditIcon sx={{ fontSize: 14, color: DL.blue }} /> Editar
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete?.(); }}
          sx={{ gap: '8px', fontSize: 12, fontFamily: SF, color: '#dc2626', fontWeight: 500, '&:hover': { background: '#fef2f2' } }}>
          <DeleteIcon sx={{ fontSize: 14, color: '#dc2626' }} /> Eliminar
        </MenuItem>
      </Menu>
    </>
  );
}

/*
 * DireccionesSection: lista de direcciones de un cliente con formulario para agregar, editar y eliminar.
 * Recibe: direcciones (arreglo actual), onChange (recibe el arreglo actualizado) e inputSx (estilos de campos).
 * Trabaja sobre un borrador (draft) y solo modifica la lista al presionar "Guardar".
 */
function DireccionesSection({ direcciones, onChange, inputSx }) {
  const [editIdx, setEditIdx] = useState(null); // null = cerrado, -1 = nueva
  const [draft, setDraft] = useState(DIR_EMPTY);
  const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const openNew = () => { setDraft({ ...DIR_EMPTY }); setEditIdx(-1); };
  const openEdit = idx => { setDraft({ ...direcciones[idx] }); setEditIdx(idx); };
  const cancel = () => setEditIdx(null);

  // Exige al menos la dirección escrita. Con editIdx -1 agrega una dirección nueva (con id temporal);
  // en otro caso reemplaza la que se está editando.
  const save = () => {
    if (!draft.direccion.trim()) return;
    if (editIdx === -1) {
      onChange([...direcciones, { ...draft, id: Date.now() }]);
    } else {
      const updated = [...direcciones];
      updated[editIdx] = { ...draft };
      onChange(updated);
    }
    setEditIdx(null);
  };

  const del = idx => onChange(direcciones.filter((_, i) => i !== idx));

  const F2 = SF;
  const ColHd = ({ children }) => (
    <th style={{ textAlign: 'left', padding: '5px 8px', fontSize: 9, fontWeight: 500,
      color: DL.tS, fontFamily: F2,
      borderBottom: `1px solid rgba(26,26,26,.10)`, whiteSpace: 'nowrap', background: '#f8fafc' }}>
      {children}
    </th>
  );

  return (
    <Box>
      {/* Header sección */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '12px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LocIcon sx={{ fontSize: 16, color: DL.blue }} />
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F2 }}>Direcciones</Typography>
          {direcciones.length > 0 && (
            <Box sx={{ px: '7px', py: '1px', borderRadius: '10px', background: 'rgba(84,126,105,.09)', border: '1px solid rgba(84,126,105,.2)' }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.blue, fontFamily: F2 }}>{direcciones.length}</Typography>
            </Box>
          )}
        </Box>
        {editIdx === null && (
          <Box onClick={openNew} sx={{
            display: 'flex', alignItems: 'center', gap: '5px', px: '10px', py: '5px',
            borderRadius: '8px', background: DL.blue, cursor: 'pointer',
            '&:hover': { background: DL.navy }, transition: 'background .13s',
          }}>
            <AddIcon sx={{ fontSize: 13, color: '#fff' }} />
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', fontFamily: F2 }}>Agregar</Typography>
          </Box>
        )}
      </Box>

      {/* Tabla */}
      {direcciones.length > 0 && editIdx === null && (
        <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden', mb: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '26%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '7%' }} />
            </colgroup>
            <thead>
              <tr>
                <ColHd>#</ColHd>
                <ColHd>Dirección</ColHd>
                <ColHd>Depto.</ColHd>
                <ColHd>Municipio</ColHd>
                <ColHd>Responsable</ColHd>
                <ColHd>Teléfono</ColHd>
                <ColHd>Coment.</ColHd>
                <ColHd>Acc.</ColHd>
              </tr>
            </thead>
            <tbody>
              {direcciones.map((d, i) => {
                const bd = i < direcciones.length - 1 ? `1px solid rgba(26,26,26,.06)` : 'none';
                const cellTxt = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 0 };
                return (
                  <tr key={d.id || i} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfe' }}>
                    <td style={{ padding: '5px 8px', borderBottom: bd }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, fontFamily: F2 }}>{i + 1}</Typography>
                    </td>
                    <td style={{ padding: '5px 8px', borderBottom: bd }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, fontFamily: F2, lineHeight: 1.4, wordBreak: 'break-word' }}>{d.direccion || '—'}</Typography>
                    </td>
                    <td style={{ padding: '5px 8px', borderBottom: bd, ...cellTxt }}>
                      <Typography sx={{ fontSize: 10, color: DL.tM, fontFamily: F2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.departamento || '—'}</Typography>
                    </td>
                    <td style={{ padding: '5px 8px', borderBottom: bd, ...cellTxt }}>
                      <Typography sx={{ fontSize: 10, color: DL.tM, fontFamily: F2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.municipio || '—'}</Typography>
                    </td>
                    <td style={{ padding: '5px 8px', borderBottom: bd, ...cellTxt }}>
                      <Typography sx={{ fontSize: 10, color: DL.tM, fontFamily: F2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.responsable || '—'}</Typography>
                    </td>
                    <td style={{ padding: '5px 8px', borderBottom: bd, ...cellTxt }}>
                      <Typography sx={{ fontSize: 10, color: DL.tM, fontFamily: F2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.telefono || '—'}</Typography>
                    </td>
                    <td style={{ padding: '5px 8px', borderBottom: bd, ...cellTxt }}>
                      <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.comentario}>{d.comentario || '—'}</Typography>
                    </td>
                    <td style={{ padding: '5px 8px', textAlign: 'center', borderBottom: bd }}>
                      <DirRowMenu onEdit={() => openEdit(i)} onDelete={() => del(i)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      )}

      {/* Formulario inline nueva/editar */}
      {editIdx !== null && (
        <Box sx={{ p: '14px', borderRadius: '10px', border: `1px solid ${DL.border}`, background: '#fafbfe', mb: '4px' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, fontFamily: F2, mb: '12px' }}>
            {editIdx === -1 ? 'Nueva dirección' : 'Editar dirección'}
          </Typography>
          <TextField fullWidth size="small" label="Dirección *" value={draft.direccion} onChange={e => setD('direccion', e.target.value)}
            sx={{ mb: '8px', '& .MuiOutlinedInput-root': { fontSize: 12, fontFamily: F2, borderRadius: '8px' }, '& label': { fontSize: 12, fontFamily: F2 } }} />
          {/* Departamento → Municipio en cascada: al cambiar el departamento se borra el municipio porque depende de él */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', mb: '8px' }}>
            <FormControl size="small" sx={{ '& .MuiOutlinedInput-root': { fontSize: 12, fontFamily: F2, borderRadius: '8px' }, '& label': { fontSize: 12, fontFamily: F2 } }}>
              <InputLabel>Departamento</InputLabel>
              <Select value={draft.departamento} label="Departamento"
                onChange={e => setDraft(d => ({ ...d, departamento: e.target.value, municipio: '' }))}
                sx={{ fontSize: 12, fontFamily: F2, borderRadius: '8px' }}>
                {DEPTOS.map(dep => <MenuItem key={dep} value={dep} sx={{ fontSize: 12, fontFamily: F2 }}>{dep}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" disabled={!draft.departamento}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: 12, fontFamily: F2, borderRadius: '8px' }, '& label': { fontSize: 12, fontFamily: F2 } }}>
              <InputLabel>Municipio</InputLabel>
              <Select value={draft.municipio} label="Municipio"
                onChange={e => setD('municipio', e.target.value)}
                sx={{ fontSize: 12, fontFamily: F2, borderRadius: '8px' }}>
                {(SV_GEO[draft.departamento] || []).map(m => <MenuItem key={m} value={m} sx={{ fontSize: 12, fontFamily: F2 }}>{m}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', mb: '8px' }}>
            <TextField size="small" label="Responsable de recibir" value={draft.responsable} onChange={e => setD('responsable', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: 12, fontFamily: F2, borderRadius: '8px' }, '& label': { fontSize: 12, fontFamily: F2 } }} />
            <TextField size="small" label="Teléfono" value={draft.telefono} onChange={e => setD('telefono', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: 12, fontFamily: F2, borderRadius: '8px' }, '& label': { fontSize: 12, fontFamily: F2 } }} />
          </Box>
          <TextField fullWidth size="small" label="Comentario" value={draft.comentario} onChange={e => setD('comentario', e.target.value)}
            sx={{ mb: '12px', '& .MuiOutlinedInput-root': { fontSize: 12, fontFamily: F2, borderRadius: '8px' }, '& label': { fontSize: 12, fontFamily: F2 } }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Box onClick={cancel} sx={{ px: '14px', py: '6px', borderRadius: '7px', cursor: 'pointer', border: `1px solid ${DL.border}`, '&:hover': { background: DL.bg } }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, fontFamily: F2 }}>Cancelar</Typography>
            </Box>
            <Box onClick={save} sx={{ px: '14px', py: '6px', borderRadius: '7px', cursor: 'pointer', background: DL.blue, '&:hover': { background: DL.navy }, transition: 'background .13s' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', fontFamily: F2 }}>{editIdx === -1 ? 'Guardar dirección' : 'Actualizar'}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {direcciones.length === 0 && editIdx === null && (
        <Box sx={{ py: '16px', textAlign: 'center', borderRadius: '8px', border: `1px dashed ${DL.border2}` }}>
          <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F2 }}>Sin direcciones registradas</Typography>
        </Box>
      )}
    </Box>
  );
}

/*
 * NuevoClienteModal: ventana para registrar un cliente nuevo sin salir del pedido.
 * Recibe: open (visible o no), onClose y onGuardar (recibe el cliente creado).
 * Cambia los campos fiscales según el tipo: Natural (DUI/documento) o Jurídico (NIT/NRC).
 */
function NuevoClienteModal({ open, onClose, onGuardar }) {
  const [tipo, setTipo] = useState('Natural');
  const [activo, setActivo] = useState(true);
  const [form, setForm] = useState({
    nombre: '', razonSocial: '', nombreComercial: '',
    tipoDoc: 'DUI', numDoc: '',
    nit: '', nrc: '',
    codigoArea: '+503', telefono: '', correo: '',
    departamento: '', municipio: '',
    direcciones: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Arma el cliente según su tipo: persona Natural usa nombre y documento; Jurídica usa razón social
  // (o nombre comercial) y NIT. Se entrega a Step1, que lo deja seleccionado en el pedido.
  const handleGuardar = () => {
    const nuevo = {
      id: Date.now(),
      nombre: tipo === 'Natural' ? form.nombre : (form.razonSocial || form.nombreComercial),
      tipo,
      dui: tipo === 'Natural' ? form.numDoc : undefined,
      nit: tipo === 'Jurídico' ? form.nit : undefined,
      telefono: `${form.codigoArea} ${form.telefono}`.trim(),
      email: form.correo,
      direcciones: form.direcciones,
      activo,
    };
    onGuardar(nuevo);
    onClose();
  };

  const iSx = {
    '& .MuiOutlinedInput-root': { fontSize: 13, fontFamily: SF, borderRadius: '8px' },
    '& label': { fontSize: 13, fontFamily: SF },
  };

  const Sec = ({ icon, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '14px' }}>
      <Box sx={{ color: DL.blue }}>{icon}</Box>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH, fontFamily: SF }}>{children}</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px', border: `1px solid ${DL.border}`, boxShadow: DL.e3, maxHeight: '92vh' } } }}>
      <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <Box sx={{ p: '18px 24px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(84,126,105,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PersonIcon sx={{ fontSize: 20, color: DL.blue }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: DL.tH, fontFamily: SF }}>Nuevo Cliente</Typography>
            <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: SF }}>Registro de información comercial</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: DL.tS, '&:hover': { color: DL.tH } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ overflowY: 'auto', p: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Toggle Natural / Jurídico */}
          <Box sx={{ display: 'flex', border: `1px solid ${DL.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            {['Natural', 'Jurídico'].map(t => (
              <Box key={t} onClick={() => setTipo(t)} sx={{
                flex: 1, py: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                cursor: 'pointer', transition: 'all .14s',
                background: tipo === t ? DL.navy : 'transparent',
                borderRight: t === 'Natural' ? `1px solid ${DL.border}` : 'none',
              }}>
                {t === 'Natural' ? <PersonIcon sx={{ fontSize: 15, color: tipo === t ? '#fff' : DL.tS }} /> : <BusinessIcon sx={{ fontSize: 15, color: tipo === t ? '#fff' : DL.tS }} />}
                <Typography sx={{ fontSize: 13, fontWeight: 500, fontFamily: SF, color: tipo === t ? '#fff' : DL.tS }}>{t}</Typography>
              </Box>
            ))}
          </Box>

          {/* Nombre */}
          {tipo === 'Natural' ? (
            <TextField fullWidth size="small" label="Nombre Cliente *" value={form.nombre}
              onChange={e => set('nombre', e.target.value)} sx={iSx} />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <TextField size="small" label="Razón Social *" value={form.razonSocial}
                onChange={e => set('razonSocial', e.target.value)} sx={iSx} />
              <TextField size="small" label="Nombre Comercial" value={form.nombreComercial}
                onChange={e => set('nombreComercial', e.target.value)} sx={iSx} />
            </Box>
          )}

          <Divider sx={{ borderColor: DL.border }} />

          {/* Información Fiscal */}
          <Box>
            <Sec icon={<BusinessIcon sx={{ fontSize: 16 }} />}>Información Fiscal</Sec>
            {tipo === 'Natural' ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <FormControl size="small" sx={iSx}>
                  <InputLabel>Tipo de Documento *</InputLabel>
                  <Select value={form.tipoDoc} label="Tipo de Documento *"
                    onChange={e => set('tipoDoc', e.target.value)}
                    sx={{ fontSize: 13, fontFamily: SF, borderRadius: '8px' }}>
                    {TIPO_DOC_OPTIONS.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField size="small" label="N° de Documento"
                  value={form.numDoc} onChange={e => set('numDoc', e.target.value)} sx={iSx} />
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <TextField size="small" label="NIT *" placeholder="####-######-###-#"
                  value={form.nit} onChange={e => set('nit', e.target.value)} sx={iSx} />
                <TextField size="small" label="NRC" placeholder="#### ####"
                  value={form.nrc} onChange={e => set('nrc', e.target.value)} sx={iSx} />
              </Box>
            )}
          </Box>

          <Divider sx={{ borderColor: DL.border }} />

          {/* Contacto y Ubicación */}
          <Box>
            <Sec icon={<LocIcon sx={{ fontSize: 16 }} />}>Contacto y Ubicación</Sec>
            <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '10px', mb: '10px' }}>
              <TextField size="small" label="Código de Área *" value={form.codigoArea}
                onChange={e => set('codigoArea', e.target.value)} sx={iSx} />
              <TextField size="small" label="Número de Teléfono *" value={form.telefono}
                onChange={e => set('telefono', e.target.value)} sx={iSx} />
              <TextField size="small" label="Correo Electrónico *" value={form.correo}
                onChange={e => set('correo', e.target.value)} sx={iSx} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <FormControl size="small" sx={iSx}>
                <InputLabel>Departamento</InputLabel>
                <Select value={form.departamento} label="Departamento"
                  onChange={e => setForm(f => ({ ...f, departamento: e.target.value, municipio: '' }))}
                  sx={{ fontSize: 13, fontFamily: SF, borderRadius: '8px' }}>
                  {DEPTOS.map(dep => <MenuItem key={dep} value={dep} sx={{ fontSize: 13 }}>{dep}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" disabled={!form.departamento} sx={iSx}>
                <InputLabel>Municipio</InputLabel>
                <Select value={form.municipio} label="Municipio"
                  onChange={e => set('municipio', e.target.value)}
                  sx={{ fontSize: 13, fontFamily: SF, borderRadius: '8px' }}>
                  {(SV_GEO[form.departamento] || []).map(m => <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ borderColor: DL.border }} />

          {/* Direcciones de Cliente */}
          <DireccionesSection direcciones={form.direcciones} onChange={dirs => set('direcciones', dirs)} inputSx={iSx} />
        </Box>

        {/* Footer */}
        <Box sx={{ p: '14px 24px', borderTop: `1px solid ${DL.border}`, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Box onClick={onClose} sx={{
            px: '20px', py: '9px', borderRadius: '8px', border: `1px solid ${DL.border}`,
            cursor: 'pointer', fontFamily: SF, fontSize: 13, fontWeight: 500, color: DL.tM,
            '&:hover': { background: DL.bg }, transition: 'background .13s',
          }}>
            Cancelar
          </Box>
          <Box onClick={handleGuardar} sx={{
            px: '20px', py: '9px', borderRadius: '8px',
            background: '#fff', border: '1px solid #1a1a1a', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '7px',
            '&:hover': { background: DL.bg }, transition: 'background .13s',
          }}>
            <PersonIcon sx={{ fontSize: 14, color: '#1a1a1a' }} />
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', fontFamily: SF }}>Guardar Cliente</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

/*
 * Step1 (paso 1 del asistente, "Cliente"): buscar y seleccionar al cliente del pedido.
 * Recibe: data (estado del pedido), onChange (actualiza el estado), isEditing (pedido ya confirmado:
 * el cliente queda de solo lectura) y showErrors (marca en rojo si falta elegir cliente).
 * Permite crear un cliente nuevo desde el modal si no aparece en la búsqueda.
 */
function Step1({ data, onChange, isEditing, showErrors }) {
  const [search, setSearch] = useState(data.clienteSearch || '');
  const [showDrop, setShowDrop] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const ref = useRef(null);

  // Cierra la lista de resultados cuando se hace clic fuera del buscador.
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Filtra clientes por nombre, DUI, NIT o teléfono y muestra como máximo 6 resultados.
  const resultados = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return CLIENTES.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      (c.dui || '').includes(q) ||
      (c.nit || '').includes(q) ||
      c.telefono.includes(q)
    ).slice(0, 6);
  }, [search]);

  // Guarda el cliente elegido en el estado de la página y limpia el buscador.
  const seleccionar = (c) => {
    onChange({ cliente: c, tipoCliente: c.tipo, clienteSearch: '' });
    setSearch('');
    setShowDrop(false);
  };

  const limpiar = () => {
    onChange({ cliente: null, clienteSearch: '' });
    setSearch('');
  };

  const Label = ({ children }) => (
    <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '6px' }}>
      {children}
    </Typography>
  );

  const Campo = ({ children, sx: sxExtra }) => (
    <Box sx={{
      px: '14px', py: '10px', borderRadius: '8px',
      border: `1px solid ${DL.border}`, background: '#f6f6f6',
      ...sxExtra,
    }}>
      {children}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Cliente */}
      <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, p: '16px 20px' }}>
        {/* Header: título + vendedora en la misma fila */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '14px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: SF }}>Información del cliente</Typography>
            {isEditing && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', px: '8px', py: '2px',
                borderRadius: '10px', background: '#fefce8', border: '1px solid #fef08a' }}>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#a16207', fontFamily: SF }}>🔒 Solo lectura</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: SF }}>Vendedora:</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, fontFamily: SF }}>{data.vendedor}</Typography>
          </Box>
        </Box>

        {/* Búsqueda — siempre visible */}
        <Box ref={ref} sx={{ position: 'relative', mb: data.cliente ? '12px' : '16px' }}>
          <TextField
            fullWidth size="small"
            placeholder="Buscar cliente por nombre, DUI o teléfono…"
            value={search}
            onChange={e => {
              if (isEditing) return;
              // Si hay cliente seleccionado, limpiar primero para buscar uno nuevo
              if (data.cliente) limpiar();
              setSearch(e.target.value); setShowDrop(true); onChange({ clienteSearch: e.target.value });
            }}
            onFocus={() => { if (!isEditing) setShowDrop(true); }}

            error={showErrors && !data.cliente}
            helperText={showErrors && !data.cliente ? 'Selecciona un cliente para continuar' : ''}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: '8px' } }}
          />

          {/* Dropdown */}
          {showDrop && !data.cliente && !isEditing && (
            <Box sx={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
              background: '#fff', border: `1px solid ${DL.border}`,
              borderRadius: '8px', boxShadow: DL.e2, mt: '4px', overflow: 'hidden',
            }}>
              <Box
                onClick={() => { setShowDrop(false); setModalOpen(true); }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  px: '14px', py: '10px', cursor: 'pointer',
                  '&:hover': { background: DL.subtle },
                }}
              >
                <AddIcon sx={{ fontSize: 16, color: DL.blue }} />
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.blue }}>Agregar Nuevo Cliente</Typography>
              </Box>
              {search && resultados.length === 0 && (
                <Box sx={{ px: '14px', py: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: SF }}>
                    Sin resultados para "{search}"
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: SF }}>
                    No hay ningún cliente registrado con ese nombre, documento o teléfono.
                  </Typography>
                </Box>
              )}
              {resultados.length > 0 && <Divider sx={{ borderColor: DL.border }} />}
              {resultados.map(c => (
                <Box key={c.id} onClick={() => seleccionar(c)} sx={{
                  px: '14px', py: '9px', cursor: 'pointer',
                  '&:hover': { background: DL.subtle },
                }}>
                  <Typography sx={{ fontSize: 12, color: DL.tH }}>
                    {c.dui || c.nit} | {c.nombre} | {c.telefono}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Tarjeta cliente seleccionado — compacta */}
        {data.cliente && (() => {
          const isJ = data.tipoCliente === 'Jurídico';
          const docLabel = isJ ? 'NIT' : 'DUI';
          const docVal = data.cliente.dui || data.cliente.nit || '—';
          const chipColor = isJ ? '#424242' : '#4d3f32';
          const chipBd   = isJ ? '#d4d4d4' : '#d4d4d4';
          const chipBg   = isJ ? '#f6f6f6' : '#f6f6f6';
          const meta = [docLabel, docVal, data.cliente.telefono, data.cliente.email].filter(Boolean).join(' · ');
          return (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: '12px',
              px: '16px', py: '10px', borderRadius: '10px',
              background: '#f8fafc', border: `1px solid ${DL.border}`,
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: SF, textTransform: 'uppercase', letterSpacing: '.03em', mb: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {data.cliente.nombre}
                </Typography>
                <Typography sx={{ fontSize: 12, color: DL.tM, fontFamily: SF, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {meta}
                </Typography>
              </Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', px: '8px', py: '2px', borderRadius: '4px', background: chipBg, border: `1px solid ${chipBd}`, flexShrink: 0 }}>
                {isJ ? <BusinessIcon sx={{ fontSize: 10, color: chipColor }} /> : <PersonIcon sx={{ fontSize: 10, color: chipColor }} />}
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: chipColor, fontFamily: SF }}>{data.tipoCliente}</Typography>
              </Box>
              {!isEditing && (
                <IconButton size="small" onClick={limpiar} sx={{ color: DL.tS, '&:hover': { color: DL.tH, background: '#f1f1f1' }, flexShrink: 0 }}>
                  <CloseIcon sx={{ fontSize: 15 }} />
                </IconButton>
              )}
            </Box>
          );
        })()}
      </Box>

      <NuevoClienteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGuardar={c => { seleccionar(c); }}
      />
    </Box>
  );
}

// ─── Step 2: Detalles del pedido ──────────────────────────────────────────────
const F = "'Inter', ui-sans-serif, system-ui, sans-serif";

/*
 * ProductGrid: cuadrícula de productos del catálogo que se pueden marcar para el pedido.
 * Recibe: productos, seleccion (objeto id → cantidad), onToggle (marca/desmarca) y search (texto de filtro).
 */
function ProductGrid({ productos, seleccion, onToggle, search }) {
  const filtrados = useMemo(() => {
    if (!search) return productos;
    const q = search.toLowerCase();
    return productos.filter(p => p.nombre.toLowerCase().includes(q));
  }, [productos, search]);

  return (
    <Box sx={{
      maxHeight: '420px', overflowY: 'auto',
      p: '10px',
    }}>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '6px',
    }}>
      {filtrados.map(p => {
        const qty = seleccion[p.id] || 0;
        const sel = qty > 0;
        return (
          <Box key={p.id} onClick={() => onToggle(p)} sx={{
            p: '7px 9px',
            borderRadius: '8px', cursor: 'pointer',
            border: `1.5px solid ${sel ? DL.blue : DL.border}`,
            background: sel ? 'rgba(84,126,105,.06)' : '#fff',
            transition: 'all .13s',
            position: 'relative',
            boxShadow: sel ? `0 0 0 2px rgba(84,126,105,.1)` : DL.e1,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            '&:hover': {
              border: `1.5px solid ${DL.blue}`,
              boxShadow: `0 0 0 2px rgba(84,126,105,.1)`,
            },
          }}>
            {/* Badge qty */}
            {sel && (
              <Box sx={{
                position: 'absolute', top: 5, right: 5,
                width: 15, height: 15, borderRadius: '50%',
                background: DL.blue,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontSize: 8, fontWeight: 500, color: '#fff', fontFamily: F, lineHeight: 1 }}>
                  {qty}
                </Typography>
              </Box>
            )}

            {/* Nombre */}
            <Typography sx={{
              fontSize: 10, fontWeight: 500, color: DL.tH,
              lineHeight: 1.3, fontFamily: F,
              pr: sel ? '18px' : '2px',
              mb: '6px', flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {p.nombre}
            </Typography>

            {/* Precio */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
              px: '4px', py: '1px', borderRadius: '4px',
              background: sel ? DL.blue : 'rgba(26,26,26,.07)',
              mt: 'auto',
            }}>
              <Typography sx={{ fontSize: 8, fontWeight: 500, color: sel ? '#fff' : DL.navy, fontFamily: F }}>
                $ {p.precio.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        );
      })}
      {filtrados.length === 0 && (
        <Box sx={{ gridColumn: '1 / -1', py: '40px', textAlign: 'center' }}>
          <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: F }}>Sin resultados</Typography>
        </Box>
      )}
    </Box>
    </Box>
  );
}

/*
 * PastelConfigurador: asistente interno para personalizar un producto de repostería
 * (pastel, cupcakes o galletas) paso a paso, con un menú de pasos a la izquierda.
 * Recibe: config (lo elegido hasta ahora), onChange (recibe solo los campos que cambian),
 * tipoProd ('pastel' | 'cupcake' | 'galletas'), accesoriosDisp (accesorios que se pueden agregar)
 * e isCorporativo (habilita subir imagen de referencia para clientes corporativos).
 * No calcula el precio final: solo guarda las elecciones en config; el precio lo arma Step2.
 */
function PastelConfigurador({ config, onChange, tipoProd, accesoriosDisp = [], isCorporativo = false }) {
  const esCupcake  = tipoProd === 'cupcake';
  const esGalletas = tipoProd === 'galletas';
  // Un pastel "montado" es de 2 pisos: sus opciones se piden dos veces (las del piso 2 llevan sufijo _p2).
  const esMontado  = !esCupcake && !esGalletas && !!config.tamano?.montado;

  // Pasos que se muestran según el producto. El paso "Imagen" solo aplica a clientes corporativos (en galletas siempre).
  const STEPS = (esCupcake ? CUPCAKE_STEPS : esGalletas ? GALLETAS_STEPS : PASTEL_STEPS)
    .filter(s => (s !== 'Imagen' || isCorporativo) || esGalletas);
  const tamanos = esCupcake ? [] : PASTEL_TAMANOS;

  const [stepActivo, setStepActivo] = useState(STEPS[0]);
  const [accCat, setAccCat] = useState('Todas');
  const [accSearch, setAccSearch] = useState('');
  const [topperSubcat, setTopperSubcat] = useState(TOPPERS_SUBCATS[0].id);

  // Reset step when tipoProd changes
  const prevTipoProd = useRef(tipoProd);
  useEffect(() => {
    if (prevTipoProd.current !== tipoProd) {
      setStepActivo(STEPS[0]);
      prevTipoProd.current = tipoProd;
    }
  }, [tipoProd, STEPS]);

  // Reset to step 1 when montado status changes (steps list changes)
  const prevMontado = useRef(esMontado);
  useEffect(() => {
    if (prevMontado.current !== esMontado) {
      setStepActivo(STEPS[0]);
      prevMontado.current = esMontado;
    }
  }, [esMontado]);

  // Cada paso del pastel se asocia con la clave de config donde se guarda lo elegido (KEY_MAP)
  // y con la lista de opciones que se muestra en pantalla (OPTIONS_MAP).
  const PASTEL_KEY_MAP = {
    'Estilo de Relleno': 'tipoRelleno',
    'Sabor de Torta':  'sabor',
    'Remojo de Torta': 'remojo',
    'Relleno de Torta':'relleno',
    'Textura y Color': 'textura',
    'Borde de Torta':  'ruedo',
    'Dedicatoria':     'dedicatoria',
  };
  const PASTEL_OPTIONS_MAP = {
    'Sabor de Torta':  PASTEL_SABORES,
    'Remojo de Torta': PASTEL_REMOJOS,
    'Textura y Color': PASTEL_TEXTURAS,
    'Borde de Torta':  PASTEL_RUEDOS,
    'Dedicatoria':     PASTEL_DEDICATORIAS,
  };

  // Cupcake key map
  const CUPCAKE_KEY_MAP = {
    'Sabor de Crema': 'cup_sabor_crema',
    'Sabor de Torta': 'sabor',
    'Relleno':        'relleno',
    'Color':          'cup_color',
    'Textura':        'cup_textura',
  };
  const CUPCAKE_OPTIONS_MAP = {
    'Sabor de Crema': CUPCAKE_SABORES_CREMA,
    'Sabor de Torta': CUPCAKE_SABORES_TORTA,
    'Relleno':        CUPCAKE_RELLENOS,
  };

  const getValorPastel = (step) => config[PASTEL_KEY_MAP[step]] || '';
  const getValorCupcake = (step) => config[CUPCAKE_KEY_MAP[step]] || '';

  // Dice si un paso ya está completo para marcarlo con el check verde del menú. En pasteles montados
  // se exige también la elección del piso 2; Accesorios e Imagen son opcionales y solo marcan si hay algo cargado.
  const isComplete = (step) => {
    if (step === 'Accesorios') return !!(config.accesorios && Object.keys(config.accesorios).length > 0);
    if (step === 'Imagen') return !!(config.cup_img_file || config.cup_comentarios);
    if (esCupcake) {
      if (step === 'Cantidad') return !!(config.cup_qty && config.cup_qty > 0);
      if (step === 'Color')    return !!config.cup_color;
      if (step === 'Textura')  return !!config.cup_textura;
      return !!getValorCupcake(step);
    }
    if (esGalletas) {
      if (step === 'Cantidad')     return !!(config.gal_qty && config.gal_qty > 0);
      if (step === 'Forma')        return !!config.gal_forma;
      if (step === 'Subir imagen') return !!(config.cup_img_file || config.cup_comentarios);
      return false;
    }
    if (step === 'Dimensión de Torta') return !!config.tamano;
    if (step === 'Estilo de Relleno') return esMontado ? (!!config.tipoRelleno && !!config.tipoRelleno_p2) : !!config.tipoRelleno;
    if (step === 'Sabor de Torta')  return esMontado ? (!!config.sabor && !!config.sabor_p2) : !!config.sabor;
    if (step === 'Remojo de Torta') return esMontado ? (!!config.remojo && !!config.remojo_p2) : !!config.remojo;
    if (step === 'Relleno de Torta') return esMontado ? (!!config.relleno && !!config.relleno_p2) : !!config.relleno;
    if (step === 'Textura y Color') {
      if (!esMontado) return !!config.textura;
      if (config.textura === 'Según el diseño' || config.textura_p2 === 'Según el diseño') return true;
      return !!config.textura && !!config.textura_p2;
    }
    if (step === 'Borde de Torta')  return esMontado ? (!!config.ruedo && !!config.ruedo_p2) : !!config.ruedo;
    if (step === 'Imagen de referencia') return !!(config.pas_img_file || config.pas_sin_imagen);
    return !!getValorPastel(step);
  };

  // Avance automático: al elegir una opción pasa al paso siguiente tras una pausa breve (160 ms)
  // para que la persona alcance a ver su selección antes del cambio.
  const avanzarSiguiente = (currentStep) => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) setTimeout(() => setStepActivo(STEPS[idx + 1]), 160);
  };

  const seleccionarTamano = (tam) => { onChange({ tamano: tam }); avanzarSiguiente('Dimensión de Torta'); };

  const seleccionarValorPastel = (step, val) => {
    onChange({ [PASTEL_KEY_MAP[step]]: val });
    avanzarSiguiente(step);
  };
  const seleccionarValorCupcake = (step, val) => {
    onChange({ [CUPCAKE_KEY_MAP[step]]: val });
    avanzarSiguiente(step);
  };

  // Helpers inline (no component definitions inside render)
  const renderOpcionGrid = (opciones, valor, onSelect) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', p: '14px' }}>
      {opciones.map(op => {
        const sel = valor === op;
        return (
          <Box key={op} onClick={() => onSelect(op)} sx={{
            p: '11px 14px', borderRadius: '10px', cursor: 'pointer',
            border: `1.5px solid ${sel ? DL.blue : DL.border}`,
            background: sel ? 'rgba(84,126,105,.07)' : '#fff',
            boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
            transition: 'all .13s',
            '&:hover': { border: `1.5px solid ${DL.blue}`, boxShadow: `0 0 0 3px rgba(84,126,105,.10)` },
          }}>
            <Typography sx={{ fontSize: 11, fontWeight: sel ? 500 : 500, color: sel ? DL.blue : DL.tH, fontFamily: F }}>
              {op}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  const renderTamanoGrid = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', p: '14px' }}>
      {tamanos.map(tam => {
        const sel = config.tamano?.id === tam.id;
        return (
          <Box key={tam.id} onClick={() => seleccionarTamano(tam)} sx={{
            p: '12px 14px', borderRadius: '10px', cursor: 'pointer',
            border: `1.5px solid ${sel ? DL.blue : DL.border}`,
            background: sel ? 'rgba(84,126,105,.07)' : '#fff',
            boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
            transition: 'all .13s',
            '&:hover': { border: `1.5px solid ${DL.blue}`, boxShadow: `0 0 0 3px rgba(84,126,105,.10)` },
          }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: sel ? DL.blue : DL.tH, fontFamily: F, mb: '4px' }}>{tam.label}</Typography>
            <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F, mb: '8px' }}>{tam.rango}</Typography>
            <Box sx={{ display: 'inline-flex', px: '7px', py: '2px', borderRadius: '6px', background: sel ? DL.blue : 'rgba(26,26,26,.07)' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: sel ? '#fff' : DL.navy, fontFamily: F }}>
                desde ${tam.precioBase.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  const renderColorGrid = (colores, valorKey, onChangeColor, onAvanzar) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', p: '14px' }}>
      {colores.map(col => {
        const sel = config[valorKey] === col.nombre;
        const isWhite = col.hex === '#FFFFFF' || col.hex === '#FFFEF2' || col.hex === '#FFFFF0';
        const isDark  = col.hex === '#2C2C2C';
        return (
          <Box key={col.nombre} onClick={() => { onChangeColor(col.nombre); if (onAvanzar) setTimeout(onAvanzar, 160); }} sx={{
            display: 'flex', alignItems: 'center', gap: '8px',
            px: '12px', py: '8px', borderRadius: '10px', cursor: 'pointer',
            border: `1.5px solid ${sel ? DL.blue : DL.border}`,
            background: sel ? 'rgba(84,126,105,.07)' : '#fff',
            boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
            transition: 'all .13s', '&:hover': { border: `1.5px solid ${DL.blue}` },
          }}>
            <Box sx={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: col.hex,
              border: isWhite ? `1.5px solid ${DL.border}` : isDark ? '1.5px solid #555' : '1.5px solid rgba(0,0,0,.08)',
              boxShadow: '0 1px 3px rgba(0,0,0,.12)' }} />
            <Typography sx={{ fontSize: 11, fontWeight: sel ? 500 : 500, color: sel ? DL.blue : DL.tH, fontFamily: F, whiteSpace: 'nowrap' }}>
              {col.nombre}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '380px' }}>
      {/* Left nav */}
      <Box sx={{ width: 165, borderRight: `1px solid ${DL.border}`, overflowY: 'auto', flexShrink: 0, py: '6px' }}>
        {STEPS.map((s, i) => (
          <Box key={s} onClick={() => setStepActivo(s)} sx={{
            px: '14px', py: '9px', cursor: 'pointer',
            borderLeft: `3px solid ${stepActivo === s ? DL.blue : 'transparent'}`,
            background: stepActivo === s ? 'rgba(84,126,105,.07)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px',
            '&:hover': { background: stepActivo === s ? 'rgba(84,126,105,.07)' : '#f8fafc' },
            transition: 'all .12s',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, fontFamily: F, minWidth: '14px', flexShrink: 0 }}>
                {i + 1}
              </Typography>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 11, fontWeight: stepActivo === s ? 500 : 500, color: stepActivo === s ? DL.blue : DL.tM, lineHeight: 1.3, fontFamily: F, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s}
                </Typography>
                {esCupcake && s === 'Imagen' && (
                  <Typography sx={{ fontSize: 9, color: '#a16207', fontFamily: F, fontWeight: 500 }}>opcional</Typography>
                )}
                {(s === 'Accesorios' || s === 'Imagen de referencia') && (
                  <Typography sx={{ fontSize: 9, color: '#a16207', fontFamily: F, fontWeight: 500 }}>opcional</Typography>
                )}
              </Box>
            </Box>
            {isComplete(s) && (
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: DL.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckIcon sx={{ fontSize: 10, color: '#fff' }} />
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Right content */}
      <Box sx={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>

        {/* ── CUPCAKE STEPS ── */}
        {/* La cantidad de cupcakes se guarda también como un "tamaño" personalizado (cantidad × precio unitario)
            para que el cálculo del precio lo trate igual que un pastel. */}
        {esCupcake && stepActivo === 'Cantidad' && (
          <Box sx={{ p: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>
              ¿Cuántos cupcakes deseas?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Box sx={{
                display: 'flex', alignItems: 'center', border: `1.5px solid ${DL.border}`, borderRadius: '12px',
                overflow: 'hidden', background: '#fff', boxShadow: DL.e1,
              }}>
                <Box component="button" onClick={() => {
                  const v = Math.max(1, (config.cup_qty || 1) - 1);
                  onChange({ cup_qty: v, tamano: { id: 'cupcake-custom', label: `${v} cupcakes`, precio: v * CUPCAKE_PRECIO_UNITARIO } });
                }} sx={{ px: '14px', py: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: DL.tM, '&:hover': { background: '#f6f6f6' } }}>−</Box>
                <input
                  type="number" min="1"
                  value={config.cup_qty || ''}
                  placeholder="0"
                  onChange={e => {
                    const v = Math.max(1, parseInt(e.target.value) || 0);
                    onChange({ cup_qty: v, tamano: { id: 'cupcake-custom', label: `${v} cupcakes`, precio: v * CUPCAKE_PRECIO_UNITARIO } });
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && config.cup_qty > 0) avanzarSiguiente('Cantidad'); }}
                  style={{
                    width: '64px', textAlign: 'center', border: 'none', outline: 'none',
                    fontSize: 20, fontWeight: 500, fontFamily: 'inherit', color: '#111', padding: '10px 0',
                  }}
                />
                <Box component="button" onClick={() => {
                  const v = (config.cup_qty || 0) + 1;
                  onChange({ cup_qty: v, tamano: { id: 'cupcake-custom', label: `${v} cupcakes`, precio: v * CUPCAKE_PRECIO_UNITARIO } });
                }} sx={{ px: '14px', py: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: DL.tM, '&:hover': { background: '#f6f6f6' } }}>+</Box>
              </Box>
              <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F }}>
                ${((config.cup_qty || 0) * CUPCAKE_PRECIO_UNITARIO).toFixed(2)} total
              </Typography>
            </Box>
            {config.cup_qty > 0 && (
              <Box onClick={() => avanzarSiguiente('Cantidad')} sx={{
                alignSelf: 'flex-start', px: '16px', py: '8px', borderRadius: '8px', background: DL.blue,
                cursor: 'pointer', '&:hover': { background: DL.navy }, transition: 'background .14s',
              }}>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', fontFamily: F }}>Continuar</Typography>
              </Box>
            )}
          </Box>
        )}
        {esCupcake && stepActivo === 'Sabor de Crema' && renderOpcionGrid(CUPCAKE_SABORES_CREMA, config.cup_sabor_crema || '', v => seleccionarValorCupcake('Sabor de Crema', v))}
        {esCupcake && stepActivo === 'Sabor de Torta' && renderOpcionGrid(CUPCAKE_SABORES_TORTA, config.sabor || '', v => seleccionarValorCupcake('Sabor de Torta', v))}
        {esCupcake && stepActivo === 'Relleno'        && renderOpcionGrid(CUPCAKE_RELLENOS, config.relleno || '', v => seleccionarValorCupcake('Relleno', v))}
        {esCupcake && stepActivo === 'Color'          && renderColorGrid(CUPCAKE_COLORES, 'cup_color', v => onChange({ cup_color: v }), () => avanzarSiguiente('Color'))}
        {esCupcake && stepActivo === 'Textura'        && renderOpcionGrid(CUPCAKE_TEXTURAS, config.cup_textura || '', v => seleccionarValorCupcake('Textura', v))}
        {esCupcake && stepActivo === 'Imagen' && !isCorporativo && (
          <Box sx={{ p: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '50%', background: '#f6f6f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: 22 }}>🔒</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: F }}>Solo para clientes corporativos</Typography>
            <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F, maxWidth: 220, lineHeight: 1.5 }}>
              Activa la opción "Cliente corporativo" en los datos de entrega para subir imágenes de referencia.
            </Typography>
          </Box>
        )}
        {esCupcake && stepActivo === 'Imagen' && isCorporativo && (
          <Box sx={{ p: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Box sx={{ display: 'inline-flex', alignSelf: 'flex-start', px: '8px', py: '2px', borderRadius: '4px', background: '#fefce8', border: '1px solid #fef08a' }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: '#a16207', fontFamily: F }}>Paso opcional</Typography>
            </Box>

            {/* Upload imagen */}
            <Box>
              <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, mb: '8px' }}>
                Imagen de referencia
              </Typography>
              {/* La imagen no se sube a un servidor: solo se guarda su nombre y una URL temporal para la vista previa. */}
              <Box
                component="label"
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', p: '24px', borderRadius: '10px', cursor: 'pointer',
                  border: `2px dashed ${config.cup_img_file ? DL.blue : DL.border2}`,
                  background: config.cup_img_file ? 'rgba(84,126,105,.05)' : '#fafbfe',
                  transition: 'all .13s', '&:hover': { borderColor: DL.blue, background: 'rgba(84,126,105,.05)' },
                }}
              >
                <input type="file" accept="image/*" hidden onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onChange({ cup_img_file: file.name, cup_img_url: url });
                  }
                }} />
                {config.cup_img_url ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <Box component="img" src={config.cup_img_url} sx={{ maxHeight: 100, maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                    <Typography sx={{ fontSize: 10, color: DL.blue, fontFamily: F, fontWeight: 500 }}>{config.cup_img_file}</Typography>
                    <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>Click para cambiar</Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(84,126,105,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: 18, lineHeight: 1 }}>📎</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tM, fontFamily: F }}>Subir imagen</Typography>
                    <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>JPG, PNG o GIF</Typography>
                  </>
                )}
              </Box>
            </Box>

            {/* Comentarios */}
            <Box>
              <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, mb: '8px' }}>
                Comentarios adicionales
              </Typography>
              <TextField fullWidth multiline rows={3}
                placeholder="Agrega instrucciones o detalles del diseño..."
                value={config.cup_comentarios || ''}
                onChange={e => onChange({ cup_comentarios: e.target.value.slice(0, 300) })}
                sx={{ '& .MuiOutlinedInput-root': { fontSize: 12, fontFamily: F, borderRadius: '10px' } }}
              />
              <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F, mt: '4px', textAlign: 'right' }}>
                {(config.cup_comentarios?.length || 0)}/300
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── GALLETAS STEPS ── */}
        {esGalletas && stepActivo === 'Cantidad' && (
          <Box sx={{ p: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>
              ¿Cuántas galletas deseas?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${DL.border}`, borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: DL.e1 }}>
                <Box component="button" onClick={() => { const v = Math.max(1, (config.gal_qty || 1) - 1); onChange({ gal_qty: v }); }} sx={{ px: '14px', py: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: DL.tM, '&:hover': { background: '#f6f6f6' } }}>−</Box>
                <input type="number" min="1" value={config.gal_qty || ''} placeholder="0"
                  onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 0); onChange({ gal_qty: v }); }}
                  onKeyDown={e => { if (e.key === 'Enter' && config.gal_qty > 0) avanzarSiguiente('Cantidad'); }}
                  style={{ width: '64px', textAlign: 'center', border: 'none', outline: 'none', fontSize: 20, fontWeight: 500, fontFamily: 'inherit', color: '#111', padding: '10px 0' }} />
                <Box component="button" onClick={() => { const v = (config.gal_qty || 0) + 1; onChange({ gal_qty: v }); }} sx={{ px: '14px', py: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: DL.tM, '&:hover': { background: '#f6f6f6' } }}>+</Box>
              </Box>
            </Box>
            {config.gal_qty > 0 && (
              <Box onClick={() => avanzarSiguiente('Cantidad')} sx={{ alignSelf: 'flex-start', px: '16px', py: '8px', borderRadius: '8px', background: DL.blue, cursor: 'pointer', '&:hover': { background: DL.navy }, transition: 'background .14s' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', fontFamily: F }}>Continuar</Typography>
              </Box>
            )}
          </Box>
        )}
        {esGalletas && stepActivo === 'Forma' && renderOpcionGrid(GALLETAS_FORMAS, config.gal_forma || '', v => { onChange({ gal_forma: v }); avanzarSiguiente('Forma'); })}
        {esGalletas && stepActivo === 'Subir imagen' && (
          <Box sx={{ p: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Box component="label" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', p: '24px', borderRadius: '10px', cursor: 'pointer', border: `2px dashed ${config.cup_img_file ? DL.blue : DL.border2}`, background: config.cup_img_file ? 'rgba(84,126,105,.05)' : '#fafbfe', transition: 'all .13s', '&:hover': { borderColor: DL.blue } }}>
              <input type="file" accept="image/*" hidden onChange={e => { const file = e.target.files?.[0]; if (file) { const url = URL.createObjectURL(file); onChange({ cup_img_file: file.name, cup_img_url: url }); } }} />
              {config.cup_img_url ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <Box component="img" src={config.cup_img_url} sx={{ maxHeight: 100, maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                  <Typography sx={{ fontSize: 10, color: DL.blue, fontFamily: F, fontWeight: 500 }}>{config.cup_img_file}</Typography>
                  <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>Click para cambiar</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(84,126,105,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: 18, lineHeight: 1 }}>📎</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tM, fontFamily: F }}>Subir imagen de referencia</Typography>
                  <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>JPG, PNG o GIF</Typography>
                </>
              )}
            </Box>
            <TextField fullWidth multiline rows={3} placeholder="Comentarios adicionales sobre el diseño..." value={config.cup_comentarios || ''} onChange={e => onChange({ cup_comentarios: e.target.value.slice(0, 300) })} sx={{ '& .MuiOutlinedInput-root': { fontSize: 12, fontFamily: F, borderRadius: '10px' } }} />
            <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F, textAlign: 'right', mt: '-10px' }}>{(config.cup_comentarios?.length || 0)}/300</Typography>
          </Box>
        )}

        {/* ── ACCESORIOS (ambos modos) ── */}
        {stepActivo === 'Accesorios' && (() => {
          // Filtra los accesorios por la categoría elegida y por el texto de búsqueda.
          const accFiltrado = accesoriosDisp.filter(a =>
            (accCat === 'Todas' || a.categoria === accCat) &&
            (!accSearch || a.nombre.toLowerCase().includes(accSearch.toLowerCase()))
          );
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {/* Tabs de categorías */}
              <Box sx={{ borderBottom: `1px solid ${DL.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', px: '12px', gap: '8px' }}>
                  <Box sx={{ display: 'flex', flex: 1, gap: '0', overflowX: 'auto', minWidth: 0, '&::-webkit-scrollbar': { height: 0 }, scrollbarWidth: 'none' }}>
                    {ACCESORIOS_CATS.map(c => (
                      <Box key={c} component="button" onClick={() => setAccCat(c)} sx={{
                        px: '12px', py: '9px', border: 'none', background: 'transparent',
                        fontFamily: F, fontSize: 11, fontWeight: accCat === c ? 500 : 500,
                        color: accCat === c ? DL.navy : DL.tS, cursor: 'pointer',
                        borderBottom: accCat === c ? `2px solid ${DL.blue}` : '2px solid transparent',
                        mb: '-1px', transition: 'all .13s', whiteSpace: 'nowrap', flexShrink: 0,
                      }}>{c}</Box>
                    ))}
                  </Box>
                </Box>
              </Box>
              {/* Grid de accesorios */}
              {accCat === 'Adornos' ? (() => {
                // ── Toppers: subcategorías + productos + campos extra ──
                const subcat = TOPPERS_SUBCATS.find(s => s.id === topperSubcat) || TOPPERS_SUBCATS[0];
                const productosFiltrados = TOPPERS.filter(t => t.subcat === subcat.id);
                const imgKey = `topper_img_${subcat.id}`;
                const nombreKey = `topper_nombre_${subcat.id}`;
                const imgData = config.accesorios?.[imgKey] || {};
                const nombreData = config.accesorios?.[nombreKey] || {};
                // Guarda datos extra del topper (imagen o nombre) dentro de config.accesorios, con una clave propia por subcategoría.
                const updateTopperExtra = (key, fields) => {
                  const prev = config.accesorios || {};
                  onChange({ accesorios: { ...prev, [key]: { ...(prev[key] || {}), ...fields } } });
                };
                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Subcategorías */}
                    <Box sx={{ borderBottom: `1px solid ${DL.border}`, px: '12px', display: 'flex', gap: 0, overflowX: 'auto', '&::-webkit-scrollbar': { height: 0 } }}>
                      {TOPPERS_SUBCATS.map(s => (
                        <Box key={s.id} component="button" onClick={() => setTopperSubcat(s.id)} sx={{
                          px: '11px', py: '8px', border: 'none', background: 'transparent',
                          fontFamily: F, fontSize: 10, fontWeight: topperSubcat === s.id ? 500 : 500,
                          color: topperSubcat === s.id ? DL.blue : DL.tS, cursor: 'pointer',
                          borderBottom: topperSubcat === s.id ? `2px solid ${DL.blue}` : '2px solid transparent',
                          mb: '-1px', whiteSpace: 'nowrap', flexShrink: 0,
                        }}>{s.label}</Box>
                      ))}
                    </Box>
                    {/* Productos de la subcategoría */}
                    <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {productosFiltrados.map(acc => {
                          const sel = !!(config.accesorios?.[acc.id]);
                          const qty = config.accesorios?.[acc.id]?.qty || 0;
                          // Suma o resta cantidad al accesorio; al llegar a 0 se quita de la selección.
                          const changeQty = (delta) => {
                            const prev = config.accesorios || {};
                            const next = { ...prev };
                            const newQty = (qty || 0) + delta;
                            if (newQty <= 0) delete next[acc.id];
                            else next[acc.id] = { ...acc, qty: newQty };
                            onChange({ accesorios: next });
                          };
                          return (
                            <Box key={acc.id} sx={{
                              px: '10px', py: '8px', borderRadius: '10px',
                              border: `1.5px solid ${sel ? DL.blue : DL.border}`,
                              background: sel ? 'rgba(84,126,105,.07)' : '#fff',
                              boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                              transition: 'all .13s', minWidth: '100px',
                            }}>
                              <Typography onClick={() => changeQty(sel ? -qty : 1)}
                                sx={{ fontSize: 11, fontWeight: sel ? 500 : 500, color: sel ? DL.blue : DL.tH, fontFamily: F, cursor: 'pointer', mb: '4px' }}>
                                {acc.nombre}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F }}>${acc.precio?.toFixed(2)}</Typography>
                                {sel ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Box component="button" onClick={() => changeQty(-1)} sx={{ width: 16, height: 16, borderRadius: '4px', border: `1px solid ${DL.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0, fontSize: 11, fontWeight: 500, color: DL.tM, lineHeight: 1 }}>−</Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.blue, fontFamily: F, minWidth: '14px', textAlign: 'center' }}>{qty}</Typography>
                                    <Box component="button" onClick={() => changeQty(1)} sx={{ width: 16, height: 16, borderRadius: '4px', border: `1px solid ${DL.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0, fontSize: 11, fontWeight: 500, color: DL.tM, lineHeight: 1 }}>+</Box>
                                  </Box>
                                ) : (
                                  <Box component="button" onClick={() => changeQty(1)} sx={{ px: '6px', py: '1px', borderRadius: '5px', border: `1px solid ${DL.border}`, background: '#fff', cursor: 'pointer', fontSize: 10, fontWeight: 500, color: DL.tM }}>+ Add</Box>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                      {/* Imagen de diseño (para subcategorías que lo requieren) */}
                      {subcat.necesitaImagen && (
                        <Box>
                          <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tM, fontFamily: F, mb: '6px' }}>Imagen de diseño</Typography>
                          <Box component="label" sx={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            border: `1.5px dashed ${imgData.img_url ? DL.blue : DL.border2}`,
                            borderRadius: '10px', p: '10px', cursor: 'pointer',
                            background: imgData.img_url ? 'rgba(84,126,105,.05)' : '#fafbfe',
                            maxWidth: 360,
                          }}>
                            <input type="file" accept="image/*" hidden onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) { const url = URL.createObjectURL(file); updateTopperExtra(imgKey, { img_file: file.name, img_url: url }); }
                            }} />
                            {imgData.img_url ? (
                              <>
                                <Box component="img" src={imgData.img_url} sx={{ height: 44, borderRadius: '6px', objectFit: 'contain', flexShrink: 0 }} />
                                <Box>
                                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.blue, fontFamily: F }}>Imagen cargada</Typography>
                                  <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F }}>{imgData.img_file}</Typography>
                                </Box>
                              </>
                            ) : (
                              <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>Subir imagen de diseño</Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                      {/* Nombre (para Frases Predeterminadas) */}
                      {subcat.necesitaNombre && (
                        <Box>
                          <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tM, fontFamily: F, mb: '6px' }}>Nombre para la frase</Typography>
                          <TextField size="small" placeholder="Ej: María, Juan..."
                            value={nombreData.nombrePersona || ''}
                            onChange={e => updateTopperExtra(nombreKey, { nombrePersona: e.target.value })}
                            sx={{ width: 260, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', background: '#fff' } }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })() : (
              <Box sx={{ p: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {accFiltrado.map(acc => {
                  const sel = !!(config.accesorios?.[acc.id]);
                  const qty = config.accesorios?.[acc.id]?.qty || 0;
                  const changeQtyAcc = (delta) => {
                    const prev = config.accesorios || {};
                    const next = { ...prev };
                    const newQty = (qty || 0) + delta;
                    if (newQty <= 0) delete next[acc.id];
                    else next[acc.id] = { ...acc, qty: newQty, ...(prev[acc.id] || {}) };
                    onChange({ accesorios: next });
                  };
                  return (
                    <Box key={acc.id} sx={{
                      px: '10px', py: '8px', borderRadius: '10px',
                      border: `1.5px solid ${sel ? DL.blue : DL.border}`,
                      background: sel ? 'rgba(84,126,105,.07)' : '#fff',
                      boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                      transition: 'all .13s', minWidth: '90px',
                    }}>
                      <Typography
                        onClick={() => changeQtyAcc(sel ? -qty : 1)}
                        sx={{ fontSize: 11, fontWeight: sel ? 500 : 500, color: sel ? DL.blue : DL.tH, fontFamily: F, cursor: 'pointer', mb: '4px' }}>
                        {acc.nombre}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F }}>${acc.precio?.toFixed(2) ?? '0.00'}</Typography>
                        {sel && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Box component="button" onClick={() => changeQtyAcc(-1)}
                              sx={{ width: 16, height: 16, borderRadius: '4px', border: `1px solid ${DL.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0, fontSize: 11, fontWeight: 500, color: DL.tM, lineHeight: 1 }}>−</Box>
                            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.blue, fontFamily: F, minWidth: '14px', textAlign: 'center' }}>{qty}</Typography>
                            <Box component="button" onClick={() => changeQtyAcc(1)}
                              sx={{ width: 16, height: 16, borderRadius: '4px', border: `1px solid ${DL.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0, fontSize: 11, fontWeight: 500, color: DL.tM, lineHeight: 1 }}>+</Box>
                          </Box>
                        )}
                        {!sel && (
                          <Box component="button" onClick={() => changeQtyAcc(1)}
                            sx={{ px: '6px', py: '1px', borderRadius: '5px', border: `1px solid ${DL.border}`, background: '#fff', cursor: 'pointer', fontSize: 10, fontWeight: 500, color: DL.tM }}>+ Add</Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
                {accFiltrado.length === 0 && (
                  <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F }}>Sin resultados.</Typography>
                )}
              </Box>
              )}
            </Box>
          );
        })()}

        {/* ── PASTEL STEPS ── */}
        {!esCupcake && stepActivo === 'Dimensión de Torta' && renderTamanoGrid()}

        {/* Estilo de Relleno */}
        {!esCupcake && stepActivo === 'Estilo de Relleno' && (() => {
          // Tarjetas con los tipos de relleno de un piso; cada una muestra su costo extra por porción.
          // Al cambiar el tipo se borra el relleno ya elegido, porque las opciones de relleno dependen del tipo.
          const renderTipoCards = (configKey, rellenoKey, pisoLabel) => (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {esMontado && <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.blue, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>{pisoLabel}</Typography>}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {PASTEL_TIPOS_RELLENO.map(tipo => {
                  const sel = config[configKey]?.id === tipo.id;
                  // En pasteles montados solo se avanza de paso cuando ambos pisos ya tienen su tipo elegido.
                  const otroCompleto = configKey === 'tipoRelleno' ? !!config.tipoRelleno_p2 : !!config.tipoRelleno;
                  return (
                    <Box key={tipo.id} onClick={() => {
                      onChange({ [configKey]: tipo, [rellenoKey]: '' });
                      if (!esMontado || otroCompleto) avanzarSiguiente(stepActivo);
                    }} sx={{
                      p: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                      border: `1.5px solid ${sel ? DL.blue : DL.border}`,
                      background: sel ? 'rgba(84,126,105,.07)' : '#fff',
                      boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                      transition: 'all .13s',
                      '&:hover': { border: `1.5px solid ${DL.blue}`, boxShadow: `0 0 0 3px rgba(84,126,105,.10)` },
                    }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: sel ? DL.blue : DL.tH, fontFamily: F, mb: '4px' }}>{tipo.label}</Typography>
                      <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F, mb: '10px' }}>{tipo.desc}</Typography>
                      <Box sx={{ display: 'inline-flex', px: '8px', py: '3px', borderRadius: '6px', background: sel ? DL.blue : 'rgba(26,26,26,.07)' }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color: sel ? '#fff' : DL.navy, fontFamily: F }}>
                          {tipo.precioPorPorcion === 0 ? 'incluido' : `+$${tipo.precioPorPorcion.toFixed(2)} × porción`}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
          return (
            <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>Elige el tipo de relleno</Typography>
              {renderTipoCards('tipoRelleno', 'relleno', 'Piso 1')}
              {esMontado && (
                <Box sx={{ pt: '12px', borderTop: `1px dashed ${DL.border}` }}>
                  {renderTipoCards('tipoRelleno_p2', 'relleno_p2', 'Piso 2')}
                </Box>
              )}
            </Box>
          );
        })()}

        {/* Relleno de Torta */}
        {!esCupcake && stepActivo === 'Relleno de Torta' && (() => {
          // Algunos rellenos se bloquean según la combinación: unos solo van en pasteles dobles (no triples)
          // y otros no se pueden usar en pasteles montados.
          const renderRellenoGrid = (rellenoKey, tipoKey, pisoLabel) => {
            const esTriple = config[tipoKey]?.id === 'triple';
            const otroCompleto = rellenoKey === 'relleno' ? !!config.relleno_p2 : !!config.relleno;
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {esMontado && <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.blue, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>{pisoLabel}</Typography>}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                  {PASTEL_RELLENOS.map(rel => {
                    const bloqueado = (rel.soloDoble && esTriple) || (rel.bloqMontado && esMontado);
                    const sel = config[rellenoKey] === rel.id;
                    return (
                      <Tooltip key={rel.id} title={bloqueado ? 'No disponible con esta combinación' : ''} disableHoverListener={!bloqueado}>
                        <Box onClick={() => { if (!bloqueado) { onChange({ [rellenoKey]: rel.id }); if (!esMontado || otroCompleto) avanzarSiguiente(stepActivo); } }} sx={{
                          p: '11px 14px', borderRadius: '10px', cursor: bloqueado ? 'not-allowed' : 'pointer',
                          border: `1.5px solid ${sel ? DL.blue : bloqueado ? '#e3e3e3' : DL.border}`,
                          background: sel ? 'rgba(84,126,105,.07)' : bloqueado ? '#f8fafc' : '#fff',
                          boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                          opacity: bloqueado ? 0.45 : 1,
                          transition: 'all .13s',
                          '&:hover': bloqueado ? {} : { border: `1.5px solid ${DL.blue}`, boxShadow: `0 0 0 3px rgba(84,126,105,.10)` },
                        }}>
                          <Typography sx={{ fontSize: 11, fontWeight: sel ? 500 : 500, color: sel ? DL.blue : bloqueado ? DL.tS : DL.tH, fontFamily: F }}>
                            {rel.label}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            );
          };
          return (
            <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {renderRellenoGrid('relleno', 'tipoRelleno', 'Piso 1')}
              {esMontado && (
                <Box sx={{ pt: '12px', borderTop: `1px dashed ${DL.border}` }}>
                  {renderRellenoGrid('relleno_p2', 'tipoRelleno_p2', 'Piso 2')}
                </Box>
              )}
            </Box>
          );
        })()}

        {!esCupcake && (stepActivo === 'Textura y Color' ? (() => {
          // Paso "Textura y Color": cada piso necesita un tipo de textura y, si esa textura ofrece varios colores,
          // también un color. "Según el diseño" no pide color y se aplica a ambos pisos (con una imagen de referencia).
          const texturaPisoCompleta = (baseKey, colorKey) => {
            const base = config[baseKey];
            if (!base) return false;
            if (base === 'Según el diseño') return true;
            const colores = PASTEL_COLORES_POR_TEXTURA[base] || [];
            return colores.length <= 1 || !!config[colorKey];
          };
          // Se declaran antes de p2OK: si se leyeran después, un pastel escalonado fallaría (variable aún sin inicializar).
          const igualDisenoP1 = config.textura_base === 'Según el diseño';
          const igualDisenoP2 = config.textura_base_p2 === 'Según el diseño';

          const p1OK = texturaPisoCompleta('textura_base', 'textura_color');
          const p2OK = !esMontado || igualDisenoP1 || igualDisenoP2 || texturaPisoCompleta('textura_base_p2', 'textura_color_p2');
          // El botón "Continuar" solo hace falta cuando no hay avance automático: pasteles montados o textura "Según el diseño".
          const necesitaBoton = esMontado || config.textura_base === 'Según el diseño' || config.textura_base_p2 === 'Según el diseño';

          const renderTexturaSection = (baseKey, colorKey, texturaKey, otroBaseKey, otroColorKey, otroTexturaKey, pisoLabel) => {
            // Si un piso elige "Según el diseño", el otro piso se bloquea porque ese diseño cubre ambos.
            const bloqueadoPorOtro = esMontado && (
              (baseKey === 'textura_base' && igualDisenoP2) ||
              (baseKey === 'textura_base_p2' && igualDisenoP1)
            );
            return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: bloqueadoPorOtro ? 0.45 : 1, pointerEvents: bloqueadoPorOtro ? 'none' : 'auto', position: 'relative' }}>
              {esMontado && <Typography sx={{ fontSize: 9, fontWeight: 500, color: bloqueadoPorOtro ? DL.tS : DL.blue, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>{pisoLabel}</Typography>}
              {bloqueadoPorOtro && (
                <Box sx={{ px: '10px', py: '6px', borderRadius: '8px', background: '#f6f6f6', border: `1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>Según el diseño aplica a ambos pisos</Typography>
                </Box>
              )}
              {!bloqueadoPorOtro && (
              <Box>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, mb: '8px' }}>Tipo de Textura</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {PASTEL_TEXTURAS_BASE.map(tx => {
                    const selTx = config[baseKey] === tx;
                    return (
                      <Box key={tx} onClick={() => {
                        const colores = PASTEL_COLORES_POR_TEXTURA[tx] || [];
                        onChange({ [baseKey]: tx, [colorKey]: null, [texturaKey]: tx });
                        if (!esMontado && tx !== 'Según el diseño' && colores.length <= 1)
                          setTimeout(() => avanzarSiguiente('Textura y Color'), 160);
                      }} sx={{
                        px: '14px', py: '9px', borderRadius: '10px', cursor: 'pointer',
                        border: `1.5px solid ${selTx ? DL.blue : DL.border}`,
                        background: selTx ? 'rgba(84,126,105,.07)' : '#fff',
                        boxShadow: selTx ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                        transition: 'all .13s',
                        '&:hover': { border: `1.5px solid ${DL.blue}` },
                      }}>
                        <Typography sx={{ fontSize: 11, fontWeight: selTx ? 500 : 500, color: selTx ? DL.blue : DL.tH, fontFamily: F }}>{tx}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              )}

              {/* Color — solo cuando aplica */}
              {config[baseKey] && config[baseKey] !== 'Según el diseño' && PASTEL_COLORES_POR_TEXTURA[config[baseKey]]?.length > 1 && (
                <Box>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, mb: '8px' }}>Color</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {PASTEL_COLORES_POR_TEXTURA[config[baseKey]].map(col => {
                      const selCol = config[colorKey] === col.nombre;
                      const isDark = col.hex === '#2C2C2C';
                      const isWhite = col.hex === '#FFFFFF' || col.hex === '#FFFEF2' || col.hex === '#FFFFF0';
                      return (
                        <Box key={col.nombre} onClick={() => {
                          onChange({ [colorKey]: col.nombre, [texturaKey]: `${config[baseKey]} - ${col.nombre}` });
                          if (!esMontado) setTimeout(() => avanzarSiguiente('Textura y Color'), 160);
                        }} sx={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          px: '12px', py: '8px', borderRadius: '10px', cursor: 'pointer',
                          border: `1.5px solid ${selCol ? DL.blue : DL.border}`,
                          background: selCol ? 'rgba(84,126,105,.07)' : '#fff',
                          boxShadow: selCol ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                          transition: 'all .13s',
                          '&:hover': { border: `1.5px solid ${DL.blue}` },
                        }}>
                          <Box sx={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: col.hex, border: isWhite ? `1.5px solid ${DL.border}` : isDark ? '1.5px solid #555' : '1.5px solid rgba(0,0,0,.08)', boxShadow: '0 1px 3px rgba(0,0,0,.12)' }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Typography sx={{ fontSize: 11, fontWeight: selCol ? 500 : 500, color: selCol ? DL.blue : DL.tH, fontFamily: F, whiteSpace: 'nowrap' }}>{col.nombre}</Typography>
                            {col.soloDetalles && (
                              <Box sx={{ px: '5px', py: '1px', borderRadius: '4px', background: '#fef3c7', border: '1px solid #fde68a' }}>
                                <Typography sx={{ fontSize: 8, fontWeight: 500, color: '#92400e', fontFamily: F, whiteSpace: 'nowrap' }}>Solo detalles</Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

            </Box>
            );
          };

          const igualDiseno = igualDisenoP1 || igualDisenoP2;

          return (
            <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {renderTexturaSection('textura_base', 'textura_color', 'textura', 'textura_base_p2', 'textura_color_p2', 'textura_p2', 'Piso 1')}
              {esMontado && (
                <Box sx={{ pt: '12px', borderTop: `1px dashed ${DL.border}` }}>
                  {renderTexturaSection('textura_base_p2', 'textura_color_p2', 'textura_p2', 'textura_base', 'textura_color', 'textura', 'Piso 2')}
                </Box>
              )}

              {/* Upload único compartido cuando algún piso eligió "Según el diseño" */}
              {igualDiseno && (
                <Box sx={{ pt: '4px', borderTop: `1px dashed ${DL.border}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>Imagen de referencia del diseño</Typography>
                    <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F, fontStyle: 'italic' }}>Una sola imagen para ambos pisos</Typography>
                  </Box>
                  <Box component="label" sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', p: '14px', borderRadius: '10px', cursor: 'pointer',
                    border: `2px dashed ${config.pas_img_url ? DL.blue : DL.border2}`,
                    background: config.pas_img_url ? 'rgba(84,126,105,.05)' : '#fafbfe',
                    transition: 'all .13s', '&:hover': { borderColor: DL.blue, background: 'rgba(84,126,105,.05)' },
                  }}>
                    <input type="file" accept="image/*" hidden onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) { const url = URL.createObjectURL(file); onChange({ pas_img_file: file.name, pas_img_url: url, pas_sin_imagen: false }); }
                    }} />
                    {config.pas_img_url ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Box component="img" src={config.pas_img_url} sx={{ height: 50, borderRadius: '6px', objectFit: 'contain' }} />
                        <Box>
                          <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.blue, fontFamily: F }}>{config.pas_img_file}</Typography>
                          <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F }}>Click para cambiar</Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, fontFamily: F }}>📸 Subir imagen de referencia</Typography>
                    )}
                  </Box>
                </Box>
              )}

              {necesitaBoton && p1OK && p2OK && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box onClick={() => avanzarSiguiente('Textura y Color')} sx={{ px: '16px', py: '7px', borderRadius: '8px', cursor: 'pointer', background: DL.blue, '&:hover': { background: DL.navy }, transition: 'background .13s' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', fontFamily: F }}>Continuar →</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          );
        })() : stepActivo === 'Borde de Torta' ? (() => {
          // Paso "Borde de Torta" (ruedo): se elige tipo → estilo → color. "Sin borde" ya es una opción completa.
          const ruedoPisoCompleto = (tipoKey, estiloKey, colorKey) => {
            const tipo = config[tipoKey];
            if (!tipo) return false;
            if (tipo === 'Sin borde') return true;
            if (!config[estiloKey]) return false;
            return !!config[colorKey];
          };
          const r1OK = ruedoPisoCompleto('ruedo_tipo', 'ruedo_estilo', 'ruedo_color');
          const r2OK = !esMontado || ruedoPisoCompleto('ruedo_tipo_p2', 'ruedo_estilo_p2', 'ruedo_color_p2');

          const renderRuedoSection = (tipoKey, estiloKey, colorKey, ruedoKey, pisoLabel) => (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {esMontado && <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.blue, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>{pisoLabel}</Typography>}
              <Box>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, mb: '8px' }}>Tipo de Ruedo</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {PASTEL_RUEDOS_TIPOS.map(tipo => {
                    const sel = config[tipoKey] === tipo;
                    return (
                      <Box key={tipo} onClick={() => {
                        const sinRuedo = tipo === 'Sin borde';
                        onChange({ [tipoKey]: tipo, [estiloKey]: '', [colorKey]: null, [ruedoKey]: sinRuedo ? 'Sin borde' : tipo });
                        if (!esMontado && sinRuedo) setTimeout(() => avanzarSiguiente('Borde de Torta'), 160);
                      }} sx={{
                        px: '14px', py: '9px', borderRadius: '10px', cursor: 'pointer',
                        border: `1.5px solid ${sel ? DL.blue : DL.border}`,
                        background: sel ? 'rgba(84,126,105,.07)' : '#fff',
                        boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                        transition: 'all .13s', '&:hover': { border: `1.5px solid ${DL.blue}` },
                      }}>
                        <Typography sx={{ fontSize: 11, fontWeight: sel ? 500 : 500, color: sel ? DL.blue : DL.tH, fontFamily: F }}>{tipo}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              {config[tipoKey] && config[tipoKey] !== 'Sin borde' && (
                <Box>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, mb: '8px' }}>Estilo de Ruedo</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {PASTEL_RUEDO_ESTILOS.map(estilo => {
                      const sel = config[estiloKey] === estilo;
                      return (
                        <Box key={estilo} onClick={() => onChange({ [estiloKey]: estilo, [colorKey]: null, [ruedoKey]: `${config[tipoKey]} - ${estilo}` })} sx={{
                          px: '14px', py: '9px', borderRadius: '10px', cursor: 'pointer',
                          border: `1.5px solid ${sel ? DL.blue : DL.border}`,
                          background: sel ? 'rgba(84,126,105,.07)' : '#fff',
                          boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                          transition: 'all .13s', '&:hover': { border: `1.5px solid ${DL.blue}` },
                        }}>
                          <Typography sx={{ fontSize: 11, fontWeight: sel ? 500 : 500, color: sel ? DL.blue : DL.tH, fontFamily: F }}>{estilo}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
              {config[estiloKey] && (
                <Box>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, mb: '8px' }}>Color del Ruedo</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {PASTEL_COLORES_POR_TEXTURA['Cobertura de Color'].map(col => {
                      const sel = config[colorKey] === col.nombre;
                      const isWhite = col.hex === '#FFFFFF';
                      const isDark = col.hex === '#2C2C2C';
                      return (
                        <Box key={col.nombre} onClick={() => {
                          onChange({ [colorKey]: col.nombre, [ruedoKey]: `${config[tipoKey]} - ${config[estiloKey]} - ${col.nombre}` });
                          if (!esMontado) setTimeout(() => avanzarSiguiente('Borde de Torta'), 160);
                        }} sx={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          px: '12px', py: '8px', borderRadius: '10px', cursor: 'pointer',
                          border: `1.5px solid ${sel ? DL.blue : DL.border}`,
                          background: sel ? 'rgba(84,126,105,.07)' : '#fff',
                          boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                          transition: 'all .13s', '&:hover': { border: `1.5px solid ${DL.blue}` },
                        }}>
                          <Box sx={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: col.hex, border: isWhite ? `1.5px solid ${DL.border}` : isDark ? '1.5px solid #555' : '1.5px solid rgba(0,0,0,.08)', boxShadow: '0 1px 3px rgba(0,0,0,.12)' }} />
                          <Typography sx={{ fontSize: 11, fontWeight: sel ? 500 : 500, color: sel ? DL.blue : DL.tH, fontFamily: F, whiteSpace: 'nowrap' }}>{col.nombre}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          );

          return (
            <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {renderRuedoSection('ruedo_tipo', 'ruedo_estilo', 'ruedo_color', 'ruedo', 'Piso 1')}
              {esMontado && (
                <Box sx={{ pt: '12px', borderTop: `1px dashed ${DL.border}` }}>
                  {renderRuedoSection('ruedo_tipo_p2', 'ruedo_estilo_p2', 'ruedo_color_p2', 'ruedo_p2', 'Piso 2')}
                </Box>
              )}
              {esMontado && r1OK && r2OK && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box onClick={() => avanzarSiguiente('Borde de Torta')} sx={{ px: '16px', py: '7px', borderRadius: '8px', cursor: 'pointer', background: DL.blue, '&:hover': { background: DL.navy }, transition: 'background .13s' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', fontFamily: F }}>Continuar →</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          );
        })() : stepActivo === 'Dedicatoria' ? (
          <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Paso Dedicatoria: se elige "Sin mensaje" o se escribe un texto (máximo 100 caracteres) y el tipo de plaquita. */}
            {/* Sin mensaje */}
            <Box>
              <Box onClick={() => {
                onChange({ dedicatoria: 'Sin mensaje', dedicatoriaTipo: null });
                setTimeout(() => avanzarSiguiente('Dedicatoria'), 160);
              }} sx={{
                display: 'inline-flex', px: '14px', py: '8px', borderRadius: '4px', cursor: 'pointer',
                border: `1.5px solid ${config.dedicatoria === 'Sin mensaje' ? DL.red : '#fca5a5'}`,
                background: config.dedicatoria === 'Sin mensaje' ? DL.redBg : '#fff5f5',
                boxShadow: config.dedicatoria === 'Sin mensaje' ? '0 0 0 3px rgba(220,38,38,.10)' : 'none',
                transition: 'all .13s', '&:hover': { border: `1.5px solid ${DL.red}` },
              }}>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.red, fontFamily: F, whiteSpace: 'nowrap' }}>
                  Sin mensaje
                </Typography>
              </Box>
            </Box>

            {/* Tipo de plaquita */}
            {config.dedicatoria !== 'Sin mensaje' && (
              <Box>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, mb: '8px' }}>
                  Tipo de plaquita
                </Typography>
                <Box sx={{ display: 'flex', gap: '8px' }}>
                  {PASTEL_DEDICATORIA_TIPOS.map(dt => {
                    const selDt = config.dedicatoriaTipo === dt.id;
                    return (
                      <Box key={dt.id} onClick={() => onChange({ dedicatoriaTipo: dt.id })} sx={{
                        flex: 1, p: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                        border: `1.5px solid ${selDt ? DL.blue : DL.border}`,
                        background: selDt ? 'rgba(84,126,105,.07)' : '#fff',
                        boxShadow: selDt ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                        transition: 'all .13s',
                        '&:hover': { border: `1.5px solid ${DL.blue}` },
                      }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color: selDt ? DL.blue : DL.tH, fontFamily: F, mb: '2px' }}>{dt.label}</Typography>
                        <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>{dt.desc}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Campo de texto */}
            <Box>
              <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, mb: '8px' }}>
                Texto de dedicatoria
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth multiline rows={3}
                  placeholder="Escribe aquí la dedicatoria..."
                  value={config.dedicatoria === 'Sin mensaje' ? '' : (config.dedicatoria || '')}
                  onChange={e => onChange({ dedicatoria: e.target.value.slice(0, 100) })}
                  disabled={config.dedicatoria === 'Sin mensaje'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 12, fontFamily: F, borderRadius: '10px',
                      background: config.dedicatoria === 'Sin mensaje' ? '#f8fafc' : '#fff',
                    },
                  }}
                />
                <Typography sx={{
                  position: 'absolute', bottom: '8px', right: '12px',
                  fontSize: 10, color: (config.dedicatoria?.length || 0) >= 90 ? DL.red : DL.tS,
                  fontFamily: F, fontWeight: 500,
                  pointerEvents: 'none',
                }}>
                  {config.dedicatoria === 'Sin mensaje' ? '0' : (config.dedicatoria?.length || 0)}/100
                </Typography>
              </Box>
              {config.dedicatoria && config.dedicatoria !== 'Sin mensaje' && config.dedicatoria.length > 0 && (
                <Box sx={{ mt: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Box onClick={() => setTimeout(() => avanzarSiguiente('Dedicatoria'), 100)} sx={{
                    px: '16px', py: '7px', borderRadius: '8px', cursor: 'pointer',
                    background: DL.blue, '&:hover': { background: DL.navy }, transition: 'background .13s',
                  }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', fontFamily: F }}>Confirmar dedicatoria</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        ) : stepActivo === 'Imagen de referencia' ? (
          <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Paso opcional: imagen de referencia del diseño. Se puede marcar "Sin imagen" para dar el paso por completado. */}
            {/* Sin imagen (mismo estilo y lugar que "Sin mensaje") */}
            {!config.pas_img_file && (
              <Box>
                <Box onClick={() => {
                  onChange({ pas_sin_imagen: true });
                  setTimeout(() => avanzarSiguiente('Imagen de referencia'), 160);
                }} sx={{
                  display: 'inline-flex', px: '14px', py: '8px', borderRadius: '4px', cursor: 'pointer',
                  border: `1.5px solid ${config.pas_sin_imagen ? DL.red : '#fca5a5'}`,
                  background: config.pas_sin_imagen ? DL.redBg : '#fff5f5',
                  boxShadow: config.pas_sin_imagen ? '0 0 0 3px rgba(220,38,38,.10)' : 'none',
                  transition: 'all .13s', '&:hover': { border: `1.5px solid ${DL.red}` },
                }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.red, fontFamily: F, whiteSpace: 'nowrap' }}>
                    Sin imagen
                  </Typography>
                </Box>
              </Box>
            )}
            <Box sx={{ display: 'inline-flex', alignSelf: 'flex-start', px: '8px', py: '2px', borderRadius: '4px', background: '#fefce8', border: '1px solid #fef08a' }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: '#a16207', fontFamily: F }}>Paso opcional</Typography>
            </Box>
            {config.pas_img_url && (config.textura_base === 'Según el diseño' || config.textura_base_p2 === 'Según el diseño') ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', p: '10px', borderRadius: '10px', background: 'rgba(84,126,105,.05)', border: `1px solid rgba(84,126,105,.2)` }}>
                <Box component="img" src={config.pas_img_url} sx={{ height: 60, borderRadius: '8px', objectFit: 'contain', flexShrink: 0 }} />
                <Box>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.blue, fontFamily: F }}>Imagen ya cargada desde Textura</Typography>
                  <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>{config.pas_img_file}</Typography>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F, lineHeight: 1.5 }}>
                Si el cliente tiene una imagen de referencia para el diseño del pastel, súbela aquí y especifica los cambios que desea.
              </Typography>
            )}

            {/* Upload */}
            <Box component="label" sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '8px', p: '24px', borderRadius: '12px', cursor: 'pointer',
              border: `2px dashed ${config.pas_img_file ? DL.blue : DL.border2}`,
              background: config.pas_img_file ? 'rgba(84,126,105,.05)' : '#fafbfe',
              transition: 'all .13s', '&:hover': { borderColor: DL.blue, background: 'rgba(84,126,105,.05)' },
            }}>
              <input type="file" accept="image/*" hidden onChange={e => {
                const file = e.target.files?.[0];
                if (file) { const url = URL.createObjectURL(file); onChange({ pas_img_file: file.name, pas_img_url: url, pas_sin_imagen: false }); }
              }} />
              {config.pas_img_url ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Box component="img" src={config.pas_img_url} sx={{ maxHeight: 120, maxWidth: '100%', borderRadius: '10px', objectFit: 'contain' }} />
                  <Typography sx={{ fontSize: 10, color: DL.blue, fontFamily: F, fontWeight: 500 }}>{config.pas_img_file}</Typography>
                  <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>Click para cambiar imagen</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(84,126,105,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: 22, lineHeight: 1 }}>📸</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tM, fontFamily: F }}>Subir imagen de referencia</Typography>
                  <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F }}>JPG, PNG o GIF · Click o arrastra aquí</Typography>
                </>
              )}
            </Box>

            {/* Chips de modificación — siempre visibles si hay imagen */}
            {config.pas_img_file && (
              <Box>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, mb: '10px' }}>
                  ¿Qué cambios quiere hacer a la imagen?
                </Typography>
                {/* Tres tipos de cambio posibles sobre la imagen (eliminar, cambiar, agregar); cada uno se activa
                    y guarda su texto en config.pas_modificaciones. */}
                {[
                  { tipo: 'eliminar', label: '+ Eliminar algo', placeholder: 'Eliminar algo... ¿qué elemento?', color: '#dc2626', bg: '#fee2e2', bd: '#fca5a5' },
                  { tipo: 'cambiar',  label: '+ Cambiar algo',  placeholder: 'Cambiar algo... ¿qué y por qué?', color: '#d97706', bg: '#fef3c7', bd: '#fcd34d' },
                  { tipo: 'agregar',  label: '+ Agregar algo',  placeholder: 'Agregar algo... ¿qué elemento?',  color: '#16a34a', bg: '#dcfce7', bd: '#86efac' },
                ].map(({ tipo, label, placeholder, color, bg, bd }) => {
                  const mods = config.pas_modificaciones || {};
                  const activo = tipo in mods;
                  return (
                    <Box key={tipo} sx={{ mb: '8px' }}>
                      {!activo ? (
                        <Box onClick={() => {
                          const prev = config.pas_modificaciones || {};
                          onChange({ pas_modificaciones: { ...prev, [tipo]: '' } });
                        }} sx={{
                          display: 'inline-flex', alignItems: 'center',
                          px: '12px', py: '7px', borderRadius: '8px', cursor: 'pointer',
                          border: `1px solid ${DL.border2}`, background: '#fff',
                          transition: 'all .12s',
                          '&:hover': { border: `1px solid ${color}`, background: bg },
                        }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tS, fontFamily: F }}>{label}</Typography>
                        </Box>
                      ) : (
                        <Box sx={{
                          display: 'flex', alignItems: 'center',
                          border: `1.5px solid ${bd}`, borderRadius: '8px',
                          background: bg, overflow: 'hidden',
                        }}>
                          <Box onClick={() => {
                            const next = { ...(config.pas_modificaciones || {}) };
                            delete next[tipo];
                            onChange({ pas_modificaciones: next });
                          }} sx={{
                            px: '10px', py: '8px', cursor: 'pointer', flexShrink: 0,
                            borderRight: `1px solid ${bd}`,
                            '&:hover': { background: `${color}22` }, transition: 'background .12s',
                          }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 500, color, fontFamily: F }}>✕</Typography>
                          </Box>
                          <Box
                            component="input"
                            autoFocus
                            placeholder={placeholder}
                            value={mods[tipo] || ''}
                            onChange={e => onChange({ pas_modificaciones: { ...(config.pas_modificaciones || {}), [tipo]: e.target.value.slice(0, 150) } })}
                            sx={{
                              flex: 1, border: 'none', outline: 'none', background: 'transparent',
                              fontFamily: F, fontSize: 12, fontWeight: 500, color,
                              px: '10px', py: '8px',
                              '&::placeholder': { color: `${color}88`, fontWeight: 500 },
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}

            {config.pas_img_file && (
              <Box onClick={() => avanzarSiguiente('Imagen de referencia')} sx={{
                alignSelf: 'flex-start', px: '16px', py: '8px', borderRadius: '8px',
                background: DL.blue, cursor: 'pointer',
                '&:hover': { background: DL.navy }, transition: 'background .13s',
              }}>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', fontFamily: F }}>Continuar →</Typography>
              </Box>
            )}
          </Box>
        ) : esMontado && (stepActivo === 'Sabor de Torta' || stepActivo === 'Remojo de Torta') ? (() => {
          // Pastel montado: sabor y remojo se eligen por separado para cada piso
          // (la clave normal es del piso 1 y la misma clave con sufijo _p2 es del piso 2).
          const p1Key = PASTEL_KEY_MAP[stepActivo];
          const p2Key = p1Key + '_p2';
          const opciones = PASTEL_OPTIONS_MAP[stepActivo] || [];
          const renderGrid = (valKey, pisoLabel) => {
            const otroCompleto = valKey === p1Key ? !!config[p2Key] : !!config[p1Key];
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.blue, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>{pisoLabel}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                  {opciones.map(op => {
                    const sel = config[valKey] === op;
                    // Regla de negocio: el sabor Cacao no está disponible en pasteles montados.
                    const bloqueado = esMontado && stepActivo === 'Sabor de Torta' && op === 'Cacao';
                    return (
                      <Tooltip key={op} title={bloqueado ? 'No disponible para pastel montado' : ''} disableHoverListener={!bloqueado}>
                        <Box onClick={() => { if (!bloqueado) { onChange({ [valKey]: op }); if (otroCompleto) avanzarSiguiente(stepActivo); } }} sx={{
                          p: '11px 14px', borderRadius: '10px', cursor: bloqueado ? 'not-allowed' : 'pointer',
                          border: `1.5px solid ${sel ? DL.blue : bloqueado ? '#e3e3e3' : DL.border}`,
                          background: sel ? 'rgba(84,126,105,.07)' : bloqueado ? '#f8fafc' : '#fff',
                          boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                          opacity: bloqueado ? 0.45 : 1,
                          transition: 'all .13s',
                          '&:hover': bloqueado ? {} : { border: `1.5px solid ${DL.blue}`, boxShadow: `0 0 0 3px rgba(84,126,105,.10)` },
                        }}>
                          <Typography sx={{ fontSize: 11, fontWeight: sel ? 500 : 500, color: sel ? DL.blue : bloqueado ? DL.tS : DL.tH, fontFamily: F }}>{op}</Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            );
          };
          return (
            <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {renderGrid(p1Key, 'Piso 1')}
              <Box sx={{ pt: '12px', borderTop: `1px dashed ${DL.border}` }}>
                {renderGrid(p2Key, 'Piso 2')}
              </Box>
            </Box>
          );
        })() : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', p: '14px' }}>
            {(PASTEL_OPTIONS_MAP[stepActivo] || []).map(op => {
              const sel = getValorPastel(stepActivo) === op;
              return (
                <Box key={op} onClick={() => seleccionarValorPastel(stepActivo, op)} sx={{
                  p: '11px 14px', borderRadius: '10px', cursor: 'pointer',
                  border: `1.5px solid ${sel ? DL.blue : DL.border}`,
                  background: sel ? 'rgba(84,126,105,.07)' : '#fff',
                  boxShadow: sel ? `0 0 0 3px rgba(84,126,105,.10)` : DL.e1,
                  transition: 'all .13s',
                  '&:hover': { border: `1.5px solid ${DL.blue}`, boxShadow: `0 0 0 3px rgba(84,126,105,.10)` },
                }}>
                  <Typography sx={{ fontSize: 11, fontWeight: sel ? 500 : 500, color: sel ? DL.blue : DL.tH, fontFamily: F }}>
                    {op}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/*
 * Step2 (paso 3 de la barra, "Pedido"): elegir los productos del pedido.
 * Tiene 4 pestañas: Catálogo, Personalizado (pastel/cupcakes/galletas), Accesorios Pasteles y Accesorios Cupcakes.
 * Recibe: ordenes y onOrdenesChange (lista de órdenes del pedido), tipoPedido (Reserva/Producción),
 * pastelConfig y onPastelConfigChange (borrador del pastel en armado), las selecciones de catálogo/accesorios,
 * isCorporativo y forceTabTo (orden del padre para abrir una pestaña concreta).
 * Provoca: crea o actualiza órdenes en el estado de la página principal.
 */
function Step2({ ordenes, onOrdenesChange, cliente, onTabChange, tipoPedido, pastelConfig, onPastelConfigChange, selCatalogo, setSelCatalogo, selAccesorios, setSelAccesorios, selAccesoriosCupcakes, setSelAccesoriosCupcakes, isCorporativo, forceTabTo }) {
  const setPastelConfig = onPastelConfigChange;
  const [dedicatorias, setDedicatorias] = useState({}); // { [prodId]: string }
  const [tabActual, setTabActual] = useState('Catalogo');
  const cambiarTab = (t) => { setTabActual(t); onTabChange?.(t); };
  const [subCat, setSubCat] = useState('Todas');
  const [subAcc, setSubAcc] = useState('Todas');
  const [s2TopperSubcat, setS2TopperSubcat] = useState(TOPPERS_SUBCATS[0].id);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [tipoProd, setTipoProd] = useState('pastel');
  const lastForceSeq = useRef(null);
  // Permite que la página principal fuerce abrir una pestaña (por ejemplo al editar una orden);
  // 'seq' evita repetir la orden cuando el padre se vuelve a renderizar.
  useEffect(() => {
    if (forceTabTo && forceTabTo.seq !== lastForceSeq.current) {
      lastForceSeq.current = forceTabTo.seq;
      cambiarTab(forceTabTo.tab);
      if (forceTabTo.tipoProd) setTipoProd(forceTabTo.tipoProd);
    }
  }, [forceTabTo]);

  // Ordena los productos de la lista según la opción elegida (A-Z, Z-A o precio); sin opción deja el orden original.
  const applySort = (arr) => {
    if (!sortOrder) return arr;
    const s = [...arr];
    if (sortOrder === 'az') s.sort((a, b) => a.nombre.localeCompare(b.nombre));
    else if (sortOrder === 'za') s.sort((a, b) => b.nombre.localeCompare(a.nombre));
    else if (sortOrder === 'asc') s.sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
    else if (sortOrder === 'desc') s.sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));
    return s;
  };

  const catalogoFiltrado = useMemo(() => {
    const base = subCat === 'Todas' ? CATALOGO : CATALOGO.filter(p => p.categoria === subCat);
    return applySort(base);
  }, [subCat, sortOrder]);

  const accesoriosFiltrado = useMemo(() => {
    const base = subAcc === 'Todas' ? ACCESORIOS : ACCESORIOS.filter(p => p.categoria === subAcc);
    return applySort(base);
  }, [subAcc, sortOrder]);

  // Marca o desmarca un producto (con cantidad inicial 1) y sincroniza la orden con la selección nueva.
  const toggleItem = (sel, setSel, prod) => {
    setSel(prev => {
      const qty = prev[prod.id] || 0;
      const newSel = { ...prev };
      if (qty > 0) {
        delete newSel[prod.id];
      } else {
        newSel[prod.id] = 1;
      }
      actualizarOrden(tabActual, newSel);
      return newSel;
    });
  };

  // Mantiene UNA sola orden de Catálogo y una de Accesorios: reconstruye sus items a partir de la selección
  // y conserva lo que ya se había editado (cantidades, dedicatorias) para no perderlo al marcar otro producto.
  const actualizarOrden = (tipo, seleccion) => {
    const productos = tipo === 'Catalogo' ? CATALOGO : ACCESORIOS;
    const tipoLabel = tipo === 'Catalogo' ? 'Catálogo' : 'Accesorios';
    onOrdenesChange(prev => {
      const existeIdx = prev.findIndex(o => o.tipo === tipoLabel && o.esCatalogo);
      // Preservar datos previos del item (dedicatorias, qty manual, etc.)
      const existingItems = existeIdx >= 0 ? prev[existeIdx].items : [];
      const items = Object.entries(seleccion)
        .filter(([, q]) => q > 0)
        .map(([id]) => {
          const p = productos.find(x => x.id === parseInt(id));
          if (!p) return null;
          const existing = existingItems.find(it => it.id === p.id);
          // Si el item ya existía, conservarlo COMPLETAMENTE (qty, dedicatorias, todo)
          // Solo crear nuevo si es la primera vez que se agrega
          return existing ? existing : { ...p, qty: 1 };
        }).filter(Boolean);
      if (existeIdx >= 0) {
        const nuevas = [...prev];
        nuevas[existeIdx] = { ...nuevas[existeIdx], items };
        return nuevas;
      }
      return [...prev, { id: Date.now(), tipo: tipoLabel, esCatalogo: true, items }];
    });
  };

  // Convierte lo configurado en una orden nueva (Pastel, Cupcakes o Galletas personalizados) y deja limpio el
  // configurador. No agrega nada si falta el tamaño (o la cantidad, en el caso de las galletas).
  const agregarPastel = () => {
    const esGalletasLocal = tipoProd === 'galletas';
    if (!pastelConfig.tamano && !esGalletasLocal) return;
    if (esGalletasLocal && !(pastelConfig.gal_qty > 0)) return;
    const esCupcake = tipoProd === 'cupcake';
    const prefix = esCupcake ? 'CUP' : esGalletasLocal ? 'GAL' : 'PP';
    const nombreBase = esCupcake ? 'Cupcakes' : esGalletasLocal ? 'Galletas' : 'Pastel';
    const tamanoLabel = esGalletasLocal
      ? `${pastelConfig.gal_qty} galletas · ${pastelConfig.gal_forma || ''}`
      : pastelConfig.tamano.label;
    // Precio del pastel = precio base del tamaño + extra del tipo de relleno por porción (en pasteles montados
    // cada piso suma el suyo). En galletas queda en 0 aquí; los accesorios elegidos se suman aparte (accTotal).
    const tamanoPrecio = esGalletasLocal ? 0 : (() => {
      const tam = pastelConfig.tamano;
      const basePrice = tam.precioBase ?? tam.precio ?? 0;
      const relleno = pastelConfig.tipoRelleno;
      const relleno_p2 = pastelConfig.tipoRelleno_p2;
      const relExtra = relleno && tam.porciones ? relleno.precioPorPorcion * tam.porciones : 0;
      // piso 2 usa la misma cantidad de porciones (montado comparte el tamaño)
      const relExtra_p2 = relleno_p2 && tam.porciones ? relleno_p2.precioPorPorcion * tam.porciones : 0;
      return basePrice + relExtra + relExtra_p2;
    })();
    const accTotal = Object.values(pastelConfig.accesorios || {}).reduce((s, a) => s + (a.precio || 0) * (a.qty || 1), 0);
    // SKU provisional: prefijo del tipo + tamaño + últimos 3 dígitos de la hora, para distinguir cada orden personalizada.
    const skuCode = `${prefix}-${tamanoLabel.replace(/\s+/g, '').slice(0, 6).toUpperCase()}-${String(Date.now()).slice(-3)}`;
    const items = [{
      nombre: `${nombreBase} ${tamanoLabel}${!esGalletasLocal && pastelConfig.sabor ? ' · ' + pastelConfig.sabor : ''}`,
      precio: tamanoPrecio + accTotal,
      sku: skuCode,
      pastelConfig: { ...pastelConfig },
    }];
    const tipoOrden = esCupcake ? 'Cupcakes Personalizados' : esGalletasLocal ? 'Galletas Personalizadas' : 'Pastel Personalizado';
    onOrdenesChange(prev => [...prev, { id: Date.now(), tipo: tipoOrden, esCatalogo: false, items }]);
    // Reinicia el configurador para poder armar otro producto desde cero y regresa al catálogo.
    setPastelConfig({ tamano: null, tipoProd: 'pastel', tipoRelleno: null, tipoRelleno_p2: null, sabor: '', sabor_p2: '', remojo: '', remojo_p2: '', relleno: '', relleno_p2: '', textura: '', textura_base: '', textura_color: null, textura_p2: '', textura_base_p2: '', textura_color_p2: null, ruedo: '', ruedo_tipo: '', ruedo_estilo: '', ruedo_color: null, ruedo_p2: '', ruedo_tipo_p2: '', ruedo_estilo_p2: '', ruedo_color_p2: null, dedicatoria: '', dedicatoriaTipo: null, pas_img_file: null, pas_img_url: null, pas_modificaciones: {} });
    setTabActual('Catalogo');
  };

  // Pestañas del paso. "Personalizado" se desactiva en una Reserva porque esta no admite pastel personalizado.
  const TABS2 = [
    { id: 'Catalogo',              label: 'Catálogo' },
    { id: 'Pastel Personalizado',  label: 'Personalizado' },
    { id: 'Accesorios',            label: 'Accesorios Pasteles' },
    { id: 'AccesoriosCupcakes',    label: 'Accesorios Cupcakes' },
  ];

  // Barra de subcategorías reutilizable (Todas, y las categorías del catálogo o de accesorios).
  const SubCatBar = ({ cats, active, onSelect }) => (
    <Box sx={{ borderBottom: `1px solid ${DL.border}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: '12px', gap: '8px' }}>
        <Box sx={{
          display: 'flex', flex: 1, gap: '0', overflowX: 'auto', minWidth: 0,
          '&::-webkit-scrollbar': { height: 0 }, scrollbarWidth: 'none',
        }}>
          {cats.map(c => (
            <Box key={c} component="button" onClick={() => onSelect(c)} sx={{
              px: '12px', py: '9px', border: 'none', background: 'transparent',
              fontFamily: F, fontSize: 11, fontWeight: active === c ? 500 : 500,
              color: active === c ? DL.navy : DL.tS, cursor: 'pointer',
              borderBottom: active === c ? `2px solid ${DL.blue}` : '2px solid transparent',
              mb: '-1px', transition: 'all .13s', whiteSpace: 'nowrap', flexShrink: 0,
            }}>{c}</Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, boxShadow: DL.e2, overflow: 'hidden' }}>
      {/* Header con título y pill-tabs */}
      <Box sx={{ px: '16px', pt: '14px', pb: '12px', borderBottom: `1px solid ${DL.border}` }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '10px', fontFamily: F }}>
          Tipo de producto
        </Typography>
        {/* Tabs + buscador + sort en una sola fila */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
            {TABS2.map(t => {
              const active = tabActual === t.id;
              // Regla de negocio: una Reserva no admite pastel personalizado, por eso esa pestaña queda deshabilitada.
              const disabled = t.id === 'Pastel Personalizado' && tipoPedido === 'Reserva';
              return (
                <Box key={t.id}
                  onClick={() => { if (!disabled) { cambiarTab(t.id); setSearch(''); } }}
                  sx={{
                    px: '14px', py: '7px', borderRadius: '6px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: active ? DL.navy : disabled ? '#f6f6f6' : 'transparent',
                    border: `1.5px solid ${active ? DL.navy : disabled ? DL.border : DL.border}`,
                    opacity: disabled ? 0.45 : 1,
                    transition: 'all .13s',
                    '&:hover': (active || disabled) ? {} : { border: `1.5px solid ${DL.navy}`, background: 'rgba(26,26,26,.05)' },
                  }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: active ? '#fff' : disabled ? DL.tS : DL.tM, fontFamily: F, whiteSpace: 'nowrap' }}>
                    {t.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          {/* Sort */}
          <FormControl size="small" sx={{ width: 150, flexShrink: 0 }}>

            <Select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              displayEmpty
              sx={{ fontSize: 11, borderRadius: '8px', background: '#fff', fontFamily: SF }}
              renderValue={v => {
                if (!v) return <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: SF }}>Ordenar por…</Typography>;
                const labels = { az: 'A → Z', za: 'Z → A', asc: 'Precio: menor a mayor', desc: 'Precio: mayor a menor' };
                return <Typography sx={{ fontSize: 11, color: DL.tH, fontFamily: SF }}>{labels[v]}</Typography>;
              }}
            >
              <MenuItem value="" sx={{ fontSize: 11, fontFamily: SF, color: DL.tS }}>Sin orden</MenuItem>
              <MenuItem value="az"  sx={{ fontSize: 11, fontFamily: SF }}>A → Z</MenuItem>
              <MenuItem value="za"  sx={{ fontSize: 11, fontFamily: SF }}>Z → A</MenuItem>
              <MenuItem value="asc" sx={{ fontSize: 11, fontFamily: SF }}>Precio: menor a mayor</MenuItem>
              <MenuItem value="desc"sx={{ fontSize: 11, fontFamily: SF }}>Precio: mayor a menor</MenuItem>
            </Select>
          </FormControl>
          {/* Buscador */}
          <TextField size="small" placeholder="Ej. Pie de Limón" value={search} onChange={e => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 13, color: DL.tS }} /></InputAdornment> } }}
            sx={{ width: 170, flexShrink: 0, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', background: '#fff' } }} />
        </Box>
      </Box>

      {/* Catálogo */}
      {tabActual === 'Catalogo' && (
        <Box>
          <SubCatBar cats={CATALOGO_CATS} active={subCat} onSelect={setSubCat} />
          <ProductGrid productos={catalogoFiltrado} seleccion={selCatalogo} search={search}
            onToggle={p => toggleItem(selCatalogo, setSelCatalogo, p)} />
        </Box>
      )}

      {/* Pastel Personalizado */}
      {tabActual === 'Pastel Personalizado' && (
        <Box>
          {/* Tabs Pastel / Cupcakes — mismo estilo que SubCatBar */}
          <Box sx={{ display: 'flex', borderBottom: `1px solid ${DL.border}`, px: '12px' }}>
            {[
              { val: 'pastel',   label: 'Pastel' },
              { val: 'cupcake',  label: 'Cupcakes' },
              { val: 'galletas', label: 'Galletas' },
            ].map(opt => {
              const active = tipoProd === opt.val;
              return (
                <Box key={opt.val} component="button"
                  onClick={() => { setTipoProd(opt.val); setPastelConfig({ tamano: null, tipoProd: opt.val }); }}
                  sx={{
                    px: '12px', py: '9px', border: 'none', background: 'transparent',
                    fontFamily: F, fontSize: 11, fontWeight: active ? 500 : 500,
                    color: active ? DL.navy : DL.tS, cursor: 'pointer', whiteSpace: 'nowrap',
                    borderBottom: active ? `2px solid ${DL.blue}` : '2px solid transparent',
                    mb: '-1px', transition: 'all .13s',
                  }}>{opt.label}</Box>
              );
            })}
          </Box>
          <PastelConfigurador config={pastelConfig} onChange={u => setPastelConfig(p => ({ ...p, ...u }))} tipoProd={tipoProd} accesoriosDisp={ACCESORIOS} isCorporativo={isCorporativo} />
          {/* Barra inferior: muestra el resumen del tamaño/cantidad elegido y el botón que agrega el producto como nueva orden
              (no se habilita hasta tener tamaño o cantidad). */}
          {(() => {
              const esGal = tipoProd === 'galletas';
              const esCup = tipoProd === 'cupcake';
              const canAdd = esGal ? !!(pastelConfig.gal_qty > 0) : !!pastelConfig.tamano;
              const infoText = esGal
                ? (pastelConfig.gal_qty > 0 ? `${pastelConfig.gal_qty} galletas` : 'Ingresa la cantidad para continuar')
                : esCup
                  ? (pastelConfig.tamano ? `${pastelConfig.tamano.label} — $ ${(pastelConfig.tamano.precio || pastelConfig.tamano.precioBase || 0).toFixed(2)}` : 'Ingresa la cantidad para continuar')
                  : (pastelConfig.tamano ? `${pastelConfig.tamano.label} — desde $${(pastelConfig.tamano.precioBase || pastelConfig.tamano.precio || 0).toFixed(2)}` : 'Selecciona el tamaño para continuar');
              return (
                <Box sx={{ px: '16px', py: '12px', borderTop: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F }}>{infoText}</Typography>
                  <Box onClick={agregarPastel} sx={{
                    px: '16px', py: '8px', borderRadius: '8px',
                    background: canAdd ? DL.blue : 'rgba(26,26,26,.15)',
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    '&:hover': canAdd ? { background: DL.navy } : {},
                    transition: 'background .14s',
                  }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', fontFamily: F }}>
                      Agregar orden al pedido
                    </Typography>
                  </Box>
                </Box>
              );
            })()}
        </Box>
      )}

      {/* Accesorios Pasteles */}
      {tabActual === 'Accesorios' && (
        <Box>
          <SubCatBar cats={ACCESORIOS_CATS} active={subAcc} onSelect={setSubAcc} />
          {subAcc === 'Adornos' ? (() => {
            const s2Subcat = TOPPERS_SUBCATS.find(s => s.id === s2TopperSubcat) || TOPPERS_SUBCATS[0];
            const s2Productos = TOPPERS.filter(t => t.subcat === s2Subcat.id);
            return (
              <Box>
                {/* Sub-tabs de toppers */}
                <Box sx={{ borderBottom: `1px solid ${DL.border}`, px: '12px', display: 'flex', gap: 0, overflowX: 'auto', '&::-webkit-scrollbar': { height: 0 } }}>
                  {TOPPERS_SUBCATS.map(s => (
                    <Box key={s.id} component="button" onClick={() => setS2TopperSubcat(s.id)} sx={{
                      px: '11px', py: '8px', border: 'none', background: 'transparent',
                      fontFamily: F, fontSize: 10, fontWeight: s2TopperSubcat === s.id ? 500 : 500,
                      color: s2TopperSubcat === s.id ? DL.blue : DL.tS, cursor: 'pointer',
                      borderBottom: s2TopperSubcat === s.id ? `2px solid ${DL.blue}` : '2px solid transparent',
                      mb: '-1px', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>{s.label}</Box>
                  ))}
                </Box>
                <ProductGrid productos={s2Productos} seleccion={selAccesorios} search={search}
                  onToggle={p => toggleItem(selAccesorios, setSelAccesorios, p)} />
                {/* Imagen / Nombre para el tipo seleccionado */}
                {s2Subcat.necesitaImagen && (() => {
                  const imgKey = `topper_img_${s2Subcat.id}`;
                  const imgData = selAccesorios[imgKey] || {};
                  const updateImg = (fields) => setSelAccesorios(prev => ({ ...prev, [imgKey]: { ...(prev[imgKey] || {}), ...fields } }));
                  return (
                    <Box sx={{ px: '16px', pb: '12px' }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tM, fontFamily: F, mb: '6px' }}>Imagen de diseño</Typography>
                      <Box component="label" sx={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        border: `1.5px dashed ${imgData.img_url ? DL.blue : DL.border2}`,
                        borderRadius: '10px', p: '10px', cursor: 'pointer',
                        background: imgData.img_url ? 'rgba(84,126,105,.05)' : '#fafbfe', maxWidth: 360,
                      }}>
                        <input type="file" accept="image/*" hidden onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) { const url = URL.createObjectURL(file); updateImg({ img_file: file.name, img_url: url }); }
                        }} />
                        {imgData.img_url ? (
                          <><Box component="img" src={imgData.img_url} sx={{ height: 44, borderRadius: '6px', objectFit: 'contain', flexShrink: 0 }} />
                          <Box><Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.blue, fontFamily: F }}>Imagen cargada</Typography>
                          <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F }}>{imgData.img_file}</Typography></Box></>
                        ) : <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>Subir imagen de diseño</Typography>}
                      </Box>
                    </Box>
                  );
                })()}
                {s2Subcat.necesitaNombre && (
                  <Box sx={{ px: '16px', pb: '12px' }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tM, fontFamily: F, mb: '6px' }}>Nombre para la frase</Typography>
                    <TextField size="small" placeholder="Ej: María, Juan..."
                      value={selAccesorios[`topper_nombre_${s2Subcat.id}`]?.nombrePersona || ''}
                      onChange={e => setSelAccesorios(prev => ({ ...prev, [`topper_nombre_${s2Subcat.id}`]: { nombrePersona: e.target.value } }))}
                      sx={{ width: 260, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', background: '#fff' } }}
                    />
                  </Box>
                )}
              </Box>
            );
          })() : (
            <ProductGrid productos={accesoriosFiltrado} seleccion={selAccesorios} search={search}
              onToggle={p => toggleItem(selAccesorios, setSelAccesorios, p)} />
          )}
        </Box>
      )}

      {/* Accesorios Cupcakes */}
      {tabActual === 'AccesoriosCupcakes' && (
        <Box>
          <SubCatBar cats={ACCESORIOS_CATS} active={subAcc} onSelect={setSubAcc} />
          {subAcc === 'Adornos' ? (() => {
            const s2Subcat = TOPPERS_SUBCATS.find(s => s.id === s2TopperSubcat) || TOPPERS_SUBCATS[0];
            const s2Productos = TOPPERS.filter(t => t.subcat === s2Subcat.id);
            return (
              <Box>
                <Box sx={{ borderBottom: `1px solid ${DL.border}`, px: '12px', display: 'flex', gap: 0, overflowX: 'auto', '&::-webkit-scrollbar': { height: 0 } }}>
                  {TOPPERS_SUBCATS.map(s => (
                    <Box key={s.id} component="button" onClick={() => setS2TopperSubcat(s.id)} sx={{
                      px: '11px', py: '8px', border: 'none', background: 'transparent',
                      fontFamily: F, fontSize: 10, fontWeight: s2TopperSubcat === s.id ? 500 : 500,
                      color: s2TopperSubcat === s.id ? DL.blue : DL.tS, cursor: 'pointer',
                      borderBottom: s2TopperSubcat === s.id ? `2px solid ${DL.blue}` : '2px solid transparent',
                      mb: '-1px', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>{s.label}</Box>
                  ))}
                </Box>
                <ProductGrid productos={s2Productos} seleccion={selAccesoriosCupcakes} search={search}
                  onToggle={p => toggleItem(selAccesoriosCupcakes, setSelAccesoriosCupcakes, p)} />
              </Box>
            );
          })() : (
            <ProductGrid productos={accesoriosFiltrado} seleccion={selAccesoriosCupcakes} search={search}
              onToggle={p => toggleItem(selAccesoriosCupcakes, setSelAccesoriosCupcakes, p)} />
          )}
        </Box>
      )}
    </Box>
  );
}

// ─── Zonas de envío por departamento (distancia desde Calle Istmania, San Salvador) ───
// Tarifa de envío a domicilio por departamento (zonas 1 a 4 según la distancia desde San Salvador).
// Se usa solo cuando el lugar de entrega es "Domicilio".
const ZONAS_ENVIO = {
  'San Salvador': { zona: 1, label: 'Zona 1',  precio: 3.00  },
  'La Libertad':  { zona: 2, label: 'Zona 2',  precio: 5.00  },
  'Cuscatlán':    { zona: 2, label: 'Zona 2',  precio: 5.00  },
  'Chalatenango': { zona: 3, label: 'Zona 3',  precio: 7.00  },
  'Sonsonate':    { zona: 3, label: 'Zona 3',  precio: 7.00  },
  'Santa Ana':    { zona: 3, label: 'Zona 3',  precio: 8.00  },
  'Ahuachapán':   { zona: 4, label: 'Zona 4',  precio: 10.00 },
  'Cabañas':      { zona: 3, label: 'Zona 3',  precio: 7.00  },
  'San Vicente':  { zona: 3, label: 'Zona 3',  precio: 7.00  },
  'La Paz':       { zona: 3, label: 'Zona 3',  precio: 8.00  },
  'Usulután':     { zona: 4, label: 'Zona 4',  precio: 10.00 },
  'San Miguel':   { zona: 4, label: 'Zona 4',  precio: 12.00 },
  'Morazán':      { zona: 4, label: 'Zona 4',  precio: 12.00 },
  'La Unión':     { zona: 4, label: 'Zona 4',  precio: 13.00 },
};

// ─── Step 3: Datos de entrega ─────────────────────────────────────────────────
/*
 * Step3 (paso 2 de la barra, "Entrega"): cuándo, dónde y de qué tipo es la entrega.
 * Recibe: data (estado del pedido) y onChange (actualiza el estado), direccionesCliente (direcciones del
 * cliente elegido), onAgregarDireccion (guarda una dirección nueva) y showErrors (marca campos obligatorios vacíos).
 * Define el tipo de pedido (Reserva o Producción), que determina la fecha mínima y los productos permitidos.
 */
function Step3({ data, onChange, direccionesCliente = [], onAgregarDireccion, isCorporativo, onToggleCorporativo, showErrors }) {
  const [modalDirOpen, setModalDirOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [nuevaDir, setNuevaDir] = useState({ direccion: '', departamento: '', municipio: '', comentario: '' });
  const Label = ({ children, required }) => (
    <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '5px' }}>
      {children}{required && <span style={{ color: DL.red }}> *</span>}
    </Typography>
  );

  return (
    <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, p: '24px' }}>

      {/* Tipo de Pedido */}
      <Box sx={{ mb: '24px' }}>
        <Label required>Tipo de Pedido</Label>
        <Box sx={{ display: 'flex', gap: '10px', mt: '8px' }}>
          {/* Al cambiar el tipo de pedido se borra la fecha, porque la anticipación mínima es distinta en cada tipo. */}
          {[
            { val: 'Reserva',    desc: 'Productos de línea en stock. Disponible el mismo día.', color: '#15803d', bg: '#f0fdf4', bd: '#bbf7d0' },
            { val: 'Producción', desc: 'Pedido personalizado. Requiere 5 días de anticipación.', color: DL.blue, bg: 'rgba(84,126,105,.07)', bd: 'rgba(84,126,105,.25)' },
          ].map(opt => {
            const sel = data.tipoPedido === opt.val;
            return (
              <Box key={opt.val} onClick={() => onChange({ tipoPedido: opt.val, fechaEntrega: '' })}
                sx={{
                  flex: 1, p: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                  border: `2px solid ${sel ? opt.bd : DL.border}`,
                  background: sel ? opt.bg : '#fff',
                  transition: 'all .13s',
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '4px' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: sel ? opt.color : DL.border, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: sel ? opt.color : DL.tH, fontFamily: SF }}>{opt.val}</Typography>
                </Box>
                <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: SF, lineHeight: 1.4 }}>{opt.desc}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH, mb: '20px' }}>Programación de entrega</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', mb: '24px' }}>
        <Box>
          <Label required>Fecha de Entrega</Label>
          <TextField fullWidth size="small" type="date" value={data.fechaEntrega}
            onChange={e => onChange({ fechaEntrega: e.target.value })}
            error={showErrors && !data.fechaEntrega}
            helperText={showErrors && !data.fechaEntrega ? 'Selecciona una fecha de entrega' : ''}
            slotProps={{ htmlInput: {
              // Fecha mínima: hoy para Reserva (mismo día) y hoy + 5 días para Producción (anticipación mínima del negocio).
              min: (() => {
                const d = new Date();
                if (data.tipoPedido === 'Producción') d.setDate(d.getDate() + 5);
                return d.toISOString().split('T')[0];
              })()
            } }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: '8px' } }} />
          <Typography sx={{ fontSize: 10, color: DL.tS, mt: '4px', fontFamily: SF }}>
            {data.tipoPedido === 'Producción' ? 'Mínimo 5 días de anticipación' : 'Puede ser el mismo día'}
          </Typography>
        </Box>
        <Box>
          <Label required>Hora de Entrega</Label>
          <TextField fullWidth size="small" type="time" value={data.horaEntrega}
            onChange={e => onChange({ horaEntrega: e.target.value })}
            error={showErrors && !data.horaEntrega}
            helperText={showErrors && !data.horaEntrega ? 'Selecciona una hora' : ''}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: '8px' } }} />
        </Box>
      </Box>

      <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH, mb: '16px' }}>Información de ubicación</Typography>

      <Box sx={{ display:'flex', gap:'12px', alignItems:'flex-start', mb:'16px' }}>
        {/* Lugar de entrega */}
        <Box sx={{ minWidth: 200, flexShrink: 0 }}>
          <Label required>Lugar de Entrega</Label>
          <FormControl fullWidth size="small" error={showErrors && !data.lugarEntrega}>
            <Select
              value={data.lugarEntrega || ''}
              onChange={e => onChange({ lugarEntrega: e.target.value, direccionEntrega: '' })}
              displayEmpty
              sx={{ fontSize: 13, borderRadius: '8px', fontFamily: SF, background: '#fff' }}
            >
              <MenuItem value="" disabled sx={{ fontSize: 12, fontFamily: SF }}>Seleccionar lugar…</MenuItem>
              {LUGARES_ENTREGA.map(l => (
                <MenuItem key={l} value={l} sx={{ fontSize: 12, fontFamily: SF }}>{l}</MenuItem>
              ))}
            </Select>
            {showErrors && !data.lugarEntrega && <Typography sx={{ fontSize: 10, color: '#d32f2f', mt: '4px', fontFamily: SF }}>Selecciona un lugar de entrega</Typography>}
          </FormControl>
        </Box>

        {/* Dirección + costo envío */}
        {data.lugarEntrega && (
          <>
            <Box sx={{ flex: 1 }}>
              <Label required={data.lugarEntrega === 'Domicilio'}>Dirección de Entrega</Label>
              {data.lugarEntrega === 'Domicilio' ? (
                <FormControl fullWidth size="small" error={showErrors && !data.direccionEntrega}>
                  <Select
                    value={data.direccionEntrega || ''}
                    onChange={e => {
                      if (e.target.value === '__agregar__') return;
                      onChange({ direccionEntrega: e.target.value });
                    }}
                    displayEmpty
                    renderValue={val => val ? (typeof val === 'object' ? val.direccion : val) : <span style={{ color: showErrors && !data.direccionEntrega ? '#d32f2f' : '#8d8d8d', fontSize: 13 }}>Selecciona una dirección…</span>}
                    sx={{ fontSize: 13, borderRadius: '8px', background: '#fff' }}
                  >
                    {direccionesCliente.map((dir, i) => (
                      <MenuItem key={i} value={dir} sx={{ fontSize: 12, flexDirection: 'column', alignItems: 'flex-start', py: '8px' }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH }}>{dir.direccion}</Typography>
                        {(dir.departamento || dir.municipio) && (
                          <Typography sx={{ fontSize: 10, color: DL.tS }}>{[dir.municipio, dir.departamento].filter(Boolean).join(', ')}</Typography>
                        )}
                      </MenuItem>
                    ))}
                    {direccionesCliente.length === 0 && (
                      <MenuItem disabled sx={{ fontSize: 12, color: DL.tS }}>Sin direcciones registradas</MenuItem>
                    )}
                    <MenuItem value="__agregar__" onClick={() => { setNuevaDir({ direccion:'', departamento:'', municipio:'', comentario:'' }); setShowForm(false); setModalDirOpen(true); }}
                      sx={{ fontSize: 12, fontWeight: 500, color: DL.blue, borderTop: `1px solid ${DL.border}`, mt: '4px' }}>
                      + Administrar direcciones
                    </MenuItem>
                  </Select>
                  {showErrors && !data.direccionEntrega && <Typography sx={{ fontSize: 10, color: '#d32f2f', mt: '4px', fontFamily: SF }}>Selecciona una dirección de entrega</Typography>}
                </FormControl>
              ) : (
                <TextField fullWidth size="small" value={data.lugarEntrega} disabled
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: '8px', background: '#f8fafc' } }} />
              )}
            </Box>

            {/* Chip costo de envío */}
            {/* El envío solo se cobra a Domicilio: la tarifa sale del departamento de la dirección elegida (ZONAS_ENVIO).
                En los demás lugares de entrega es $0.00. */}
            <Box sx={{ flexShrink:0 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '5px' }}>&nbsp;</Typography>
              <Box sx={{ display:'flex', alignItems:'center', gap:'8px', px:'14px', height:'40px', borderRadius:'8px', background:'#f8fafc', border:'1px solid rgba(0,0,0,.23)' }}>
                <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: SF }}>Costo de envío</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: SF }}>
                  {data.lugarEntrega === 'Domicilio'
                    ? `$${(ZONAS_ENVIO[data.direccionEntrega?.departamento]?.precio || 0).toFixed(2)}`
                    : '$0.00'}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Modal direcciones */}
      {true && (
          <Dialog open={modalDirOpen} onClose={() => { setModalDirOpen(false); setShowForm(false); }} maxWidth="sm" fullWidth
            slotProps={{ paper: { sx: { borderRadius: '14px', border: `1px solid ${DL.border}` } } }}>
            <DialogContent sx={{ p: '24px' }}>
              {/* Header */}
              <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:'16px' }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 500, color: DL.tH, fontFamily: SF }}>Direcciones</Typography>
                  <Box sx={{ px:'7px', py:'1px', borderRadius:'4px', background:'rgba(84,126,105,.1)', border:`1px solid rgba(84,126,105,.2)` }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.blue, fontFamily:SF }}>{direccionesCliente.length}</Typography>
                  </Box>
                </Box>
                <Box onClick={() => { setNuevaDir({ direccion:'', departamento:'', municipio:'', comentario:'' }); setShowForm(true); }}
                  sx={{ display:'flex', alignItems:'center', gap:'5px', px:'12px', py:'6px', borderRadius:'8px', background:DL.blue, cursor:'pointer', '&:hover':{ background:DL.navy }, transition:'background .12s' }}>
                  <Typography sx={{ fontSize:12, fontWeight: 500, color:'#fff', fontFamily:SF }}>+ Agregar</Typography>
                </Box>
              </Box>

              {/* Formulario nueva dirección */}
              {showForm && (
                <Box sx={{ background:'#f8fafc', border:`1px solid ${DL.border}`, borderRadius:'10px', p:'16px', mb:'16px' }}>
                  <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:SF, mb:'12px' }}>Nueva dirección</Typography>
                  <TextField fullWidth size="small" label="Dirección *" autoFocus
                    value={nuevaDir.direccion || ''}
                    onChange={e => setNuevaDir(p => ({ ...p, direccion: e.target.value }))}
                    sx={{ mb:'10px', '& .MuiOutlinedInput-root':{ fontSize:13, borderRadius:'8px', background:'#fff' } }} />
                  <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', mb:'10px' }}>
                    <FormControl size="small" sx={{ '& .MuiOutlinedInput-root':{ fontSize:13, borderRadius:'8px', background:'#fff' }, '& label':{ fontSize:13 } }}>
                      <InputLabel>Departamento</InputLabel>
                      <Select value={nuevaDir.departamento || ''} label="Departamento"
                        onChange={e => setNuevaDir(p => ({ ...p, departamento: e.target.value, municipio: '' }))}
                        sx={{ fontSize:13, borderRadius:'8px' }}>
                        {DEPTOS.map(dep => <MenuItem key={dep} value={dep} sx={{ fontSize:13 }}>{dep}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl size="small" disabled={!nuevaDir.departamento}
                      sx={{ '& .MuiOutlinedInput-root':{ fontSize:13, borderRadius:'8px', background:'#fff' }, '& label':{ fontSize:13 } }}>
                      <InputLabel>Municipio</InputLabel>
                      <Select value={nuevaDir.municipio || ''} label="Municipio"
                        onChange={e => setNuevaDir(p => ({ ...p, municipio: e.target.value }))}
                        sx={{ fontSize:13, borderRadius:'8px' }}>
                        {(SV_GEO[nuevaDir.departamento] || []).map(m => <MenuItem key={m} value={m} sx={{ fontSize:13 }}>{m}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                  <TextField fullWidth size="small" label="Comentario"
                    value={nuevaDir.comentario || ''}
                    onChange={e => setNuevaDir(p => ({ ...p, comentario: e.target.value }))}
                    sx={{ mb:'12px', '& .MuiOutlinedInput-root':{ fontSize:13, borderRadius:'8px', background:'#fff' } }} />
                  <Box sx={{ display:'flex', gap:'8px' }}>
                    <Box onClick={() => setShowForm(false)} sx={{ flex:1, py:'8px', borderRadius:'8px', textAlign:'center', cursor:'pointer', border:`1px solid ${DL.border}`, background:'#fff', '&:hover':{ background:DL.bg } }}>
                      <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tM, fontFamily:SF }}>Cancelar</Typography>
                    </Box>
                    {/* Al guardar, la dirección se agrega a las del cliente y queda seleccionada como dirección de entrega. */}
                    <Box onClick={() => {
                      if (!nuevaDir.direccion?.trim()) return;
                      const obj = { ...nuevaDir, id: Date.now() };
                      onAgregarDireccion?.(obj);
                      onChange({ direccionEntrega: obj });
                      setShowForm(false);
                      setModalDirOpen(false);
                    }} sx={{ flex:1, py:'8px', borderRadius:'8px', textAlign:'center', cursor:'pointer', background:DL.blue, '&:hover':{ background:DL.navy } }}>
                      <Typography sx={{ fontSize:12, fontWeight: 500, color:'#fff', fontFamily:SF }}>Guardar dirección</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Tabla de direcciones — siempre visible */}
              <Box sx={{ border:`1px solid ${DL.border}`, borderRadius:'8px', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#f8fafc' }}>
                      {['#','Dirección','Depto.','Municipio','Comentario',''].map((h, i) => (
                        <th key={i} style={{ padding:'8px 12px', textAlign:'left', fontSize:9, fontWeight: 500, color:'#6a6a6a', borderBottom:`1px solid rgba(26,26,26,.1)`, whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {direccionesCliente.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding:'24px', textAlign:'center', fontSize:11, color:'#6a6a6a' }}>Sin direcciones registradas</td></tr>
                    ) : direccionesCliente.map((dir, i) => (
                      <tr key={i} style={{ background: i%2===0?'#fff':'#fafbfe', cursor:'pointer' }}
                        onClick={() => { onChange({ direccionEntrega: dir }); setModalDirOpen(false); setShowForm(false); }}>
                        <td style={{ padding:'10px 12px', fontSize:11, color:'#6a6a6a', borderBottom:'1px solid rgba(26,26,26,.06)' }}>{i+1}</td>
                        <td style={{ padding:'10px 12px', fontSize:11, fontWeight: 500, color:'#1b1b1b', borderBottom:'1px solid rgba(26,26,26,.06)', maxWidth:160 }}>{dir.direccion}</td>
                        <td style={{ padding:'10px 12px', fontSize:11, color:'#1b1b1b', borderBottom:'1px solid rgba(26,26,26,.06)' }}>{dir.departamento}</td>
                        <td style={{ padding:'10px 12px', fontSize:11, color:'#1b1b1b', borderBottom:'1px solid rgba(26,26,26,.06)' }}>{dir.municipio}</td>
                        <td style={{ padding:'10px 12px', fontSize:11, color:'#6a6a6a', borderBottom:'1px solid rgba(26,26,26,.06)', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dir.comentario || '—'}</td>
                        <td style={{ padding:'10px 12px', borderBottom:'1px solid rgba(26,26,26,.06)', textAlign:'center' }}>
                          <Typography component="span" sx={{ fontSize:10, fontWeight: 500, color:DL.blue, cursor:'pointer' }}>Seleccionar</Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </DialogContent>
          </Dialog>
      )}

      <Box>
        <Label>Comentario</Label>
        <TextField fullWidth size="small" multiline rows={3}
          placeholder="Escribe un comentario..."
          value={data.comentarioEntrega}
          onChange={e => onChange({ comentarioEntrega: e.target.value })}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: '8px' } }} />
        <Typography sx={{ fontSize: 10, color: DL.tS, mt: '4px', textAlign: 'right' }}>
          {(data.comentarioEntrega || '').length}/100 caracteres
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Step 4: Totales y Pago ───────────────────────────────────────────────────
/*
 * Step4 (paso 4 de la barra, "Pago"): resumen del receptor y datos de pago.
 * Recibe: data/onChange (estado del pedido), ordenes, precioEnvio, isEditing (pedido existente),
 * initialPagos y onPagosChange (pagos ya registrados y aviso de cambios). onConfirmar y onCotizar se reciben
 * pero hoy no se usan: el guardado lo disparan los botones del resumen lateral.
 * Al crear un pedido se elige tipo y método de pago (con monto si es Anticipo); al editar se
 * muestra el registro de pagos con el saldo pendiente.
 */
function Step4({ data, ordenes, onChange, onConfirmar, onCotizar, precioEnvio, isEditing, initialPagos, onPagosChange }) {
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef(null);
  const [pagos, setPagos] = useState(() => initialPagos || []);
  // Cada cambio en la lista de pagos también se avisa a la página principal (onPagosChange) para que los guarde.
  const setPagosAndNotify = (updater) => {
    setPagos(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onPagosChange?.(next);
      return next;
    });
  };
  const [formOpen, setFormOpen] = useState(false);
  const [form4, setForm4] = useState({ fecha: new Date().toISOString().slice(0,10), metodo: '', monto: '' });
  const [pagoError, setPagoError] = useState('');

  useEffect(() => {
    const fn = e => { if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Total = subtotal + IVA 13 % + envío; es la misma fórmula que usa el resumen lateral.
  const subtotal = ordenes.reduce((s, o) => s + o.items.reduce((ss, it) => ss + it.precio * (it.qty || 1), 0), 0);
  const total = subtotal + subtotal * 0.13 + (precioEnvio || 0);
  // Control de pagos: lo pendiente nunca baja de 0, y con pendiente 0 el pedido queda pagado al 100 %.
  const pagado4 = pagos.reduce((s, p) => s + Number(p.monto), 0);
  const pendiente4 = Math.max(0, total - pagado4);
  const isPagado4 = pendiente4 <= 0;
  // Valida el pago antes de registrarlo: debe tener fecha, método y un monto válido que no supere lo pendiente.
  const guardarPago4 = () => {
    if (!form4.fecha) { setPagoError('Selecciona una fecha.'); return; }
    if (!form4.metodo) { setPagoError('Selecciona un método de pago.'); return; }
    const monto = parseFloat(form4.monto);
    if (!monto || monto <= 0) { setPagoError('Ingresa un monto válido.'); return; }
    if (monto > pendiente4) { setPagoError(`El monto no puede superar el pendiente ($${pendiente4.toFixed(2)}).`); return; }
    setPagosAndNotify(prev => [...prev, { fecha: form4.fecha, metodo: form4.metodo, monto }]);
    setForm4({ fecha: new Date().toISOString().slice(0,10), metodo: '', monto: '' });
    setFormOpen(false);
    setPagoError('');
  };

  const Label = ({ children, required }) => (
    <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '5px' }}>
      {children}{required && <span style={{ color: DL.red }}> *</span>}
    </Typography>
  );

  const SelOption = ({ options, value, onSelect }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden' }}>
      {options.map((o, i) => (
        <Box key={o} onClick={() => onSelect(o)} sx={{
          px: '14px', py: '10px', cursor: 'pointer',
          background: value === o ? 'rgba(84,126,105,.07)' : '#fff',
          borderBottom: i < options.length - 1 ? `1px solid ${DL.border}` : 'none',
          display: 'flex', alignItems: 'center', gap: '8px',
          '&:hover': { background: 'rgba(84,126,105,.04)' },
        }}>
          <Box sx={{
            width: 14, height: 14, borderRadius: '50%',
            border: `2px solid ${value === o ? DL.blue : DL.border}`,
            background: value === o ? DL.blue : 'transparent',
            flexShrink: 0, transition: 'all .12s',
          }} />
          <Typography sx={{ fontSize: 12, fontWeight: value === o ? 500 : 500, color: value === o ? DL.tH : DL.tM }}>
            {o}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Tarjeta única */}
      <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, p: '16px 20px' }}>
        {/* Label */}
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, fontFamily: SF, mb: '10px' }}>
          Información del receptor
        </Typography>

        {/* Etiqueta interna — toda la info en una sola pastilla */}
        <Box sx={{ background: '#f8fafc', border: `1px solid ${DL.border}`, borderRadius: '10px', px: '16px', py: '12px', position: 'relative' }}>
          {/* Nombre en negrita azul */}
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.navy, fontFamily: SF, mb: '2px' }}>
            {data.cliente?.nombre}
          </Typography>

          {/* Vendedor — encima de la fecha */}
          {data.vendedor && (
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: SF, mb: '2px' }}>
              Vendedora: {data.vendedor}
            </Typography>
          )}

          {/* Fecha y hora de entrega */}
          {data.fechaEntrega && (() => {
            const d = new Date(data.fechaEntrega + 'T12:00:00');
            const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
            const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
            const [h, m] = (data.horaEntrega || '00:00').split(':').map(Number);
            const ampm = h >= 12 ? 'p.m.' : 'a.m.';
            const h12  = h % 12 || 12;
            return (
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: SF, mb: '2px' }}>
                Fecha y hora de entrega: {DIAS[d.getDay()]} {d.getDate()} {MESES[d.getMonth()]} · {h12}:{String(m).padStart(2,'0')} {ampm}
              </Typography>
            );
          })()}

          {/* Dirección */}
          {data.lugarEntrega && (
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: SF, mb: '2px' }}>
              {data.lugarEntrega}{data.direccionEntrega ? ': ' + (typeof data.direccionEntrega === 'object'
                ? [data.direccionEntrega.direccion, data.direccionEntrega.municipio, data.direccionEntrega.departamento].filter(Boolean).join(', ')
                : data.direccionEntrega) : ''}
            </Typography>
          )}

          {/* Meta-línea: doc · tel · email */}
          <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: SF, mb: data.tipoPedido ? '8px' : 0 }}>
            {[
              data.cliente?.dui ? `Dui · ${data.cliente.dui}` : data.cliente?.nit ? `Nit · ${data.cliente.nit}` : null,
              data.cliente?.telefono,
              data.cliente?.email,
            ].filter(Boolean).join('  •  ')}
          </Typography>

          {/* Botón Compartir — top right de la tarjeta gris */}
          <Box ref={shareRef} sx={{ position:'absolute', top:'12px', right:'12px' }}>
            <Box component="button" onClick={() => setShareOpen(o => !o)} sx={{
              display:'flex', alignItems:'center', gap:'6px',
              px:'12px', py:'5px', borderRadius:'8px',
              backgroundColor:'#ffffff', border:`1.5px solid ${DL.blue}`, cursor:'pointer',
              outline:'none',
              '&:hover':{ backgroundColor:'#ffffff' },
            }}>
              <ShareIcon sx={{ fontSize:13, color:DL.blue }} />
              <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.blue, fontFamily:SF }}>Compartir</Typography>
            </Box>
            {shareOpen && (
              <Box sx={{ position:'absolute', right:0, top:'100%', mt:'4px', zIndex:10, background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'8px', boxShadow:DL.e2, minWidth:'180px', overflow:'hidden' }}>
                {[
                  { icon:<DownloadIcon sx={{fontSize:14}}/>, label:'Descargar Cotización' },
                  { icon:<EmailIcon sx={{fontSize:14}}/>, label:'Enviar por Correo' },
                  { icon:<WaIcon sx={{fontSize:14}}/>, label:'Enviar por Whatsapp' },
                ].map(item => (
                  <Box key={item.label} onClick={() => setShareOpen(false)} sx={{ display:'flex', alignItems:'center', gap:'10px', px:'14px', py:'10px', cursor:'pointer', '&:hover':{ background:DL.subtle } }}>
                    <Box sx={{ color:DL.tM }}>{item.icon}</Box>
                    <Typography sx={{ fontSize:12, color:DL.tH }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Badge tipo pedido */}
          {data.tipoPedido && (() => {
            const tpMap = { 'Reserva': { bg:'#f0fdf4', color:'#15803d', bd:'#bbf7d0' }, 'Producción': { bg:'rgba(84,126,105,.08)', color:DL.blue, bd:'rgba(84,126,105,.2)' }, 'Mixto': { bg:'#fefce8', color:'#a16207', bd:'#fef08a' } };
            const tp = tpMap[data.tipoPedido] || {};
            return (
              <Box sx={{ display:'inline-flex', alignItems:'center', px:'8px', py:'2px', borderRadius:'10px', mt:'8px', background:tp.bg, border:`1px solid ${tp.bd}` }}>
                <Typography sx={{ fontSize:10, fontWeight: 500, color:tp.color, fontFamily:SF }}>Pedido {data.tipoPedido}</Typography>
              </Box>
            );
          })()}
        </Box>
      </Box>

      {/* Pago — oculto en modo edición; solo se muestra al crear */}
      {!isEditing && <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, p: '20px 24px' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH, mb: '16px' }}>Información de Pago</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', mb: '16px' }}>
          <Box>
            <Label required>Tipo de Pago</Label>
            <SelOption options={TIPOS_PAGO} value={data.tipoPago} onSelect={v => onChange({ tipoPago: v })} />
          </Box>
          <Box>
            <Label required>Método de Pago</Label>
            <SelOption options={METODOS_PAGO} value={data.metodoPago} onSelect={v => onChange({ metodoPago: v })} />
          </Box>
        </Box>

        {/* Anticipo: el abono no puede superar el total del pedido; el pendiente es total − anticipo. */}
        {/* Campo monto anticipo — inline compacto */}
        {data.tipoPago === 'Anticipo' && (
          <Box sx={{ mb: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
            px: '14px', py: '10px', borderRadius: '8px',
            background: 'rgba(84,126,105,.05)', border: `1px solid rgba(84,126,105,.2)` }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tS, fontFamily: SF, textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0 }}>
              Monto anticipo <span style={{ color: DL.red }}>*</span>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tS, fontFamily: SF }}>$</Typography>
              <TextField
                size="small" type="number"
                placeholder="0.00"
                value={data.montoAnticipo}
                onChange={e => {
                  const v = e.target.value;
                  if (v === '' || (parseFloat(v) >= 0 && parseFloat(v) <= total)) onChange({ montoAnticipo: v });
                }}
                slotProps={{ htmlInput: { min: 0, max: total, step: '0.01' } }}
                sx={{ width: 110, '& .MuiOutlinedInput-root': { fontSize: 13, fontWeight: 500, borderRadius: '7px', background: '#fff', py: 0 } }}
              />
            </Box>
            <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: SF }}>de <strong>${total.toFixed(2)}</strong></Typography>
            {data.montoAnticipo && parseFloat(data.montoAnticipo) > 0 && (
              <Typography sx={{ fontSize: 11, color: '#15803d', fontWeight: 500, fontFamily: SF }}>
                · Pendiente: ${(total - parseFloat(data.montoAnticipo || 0)).toFixed(2)}
              </Typography>
            )}
          </Box>
        )}

        <Label>Comentario</Label>
        <TextField fullWidth size="small" multiline rows={2}
          placeholder="Escribe un comentario..."
          value={data.comentarioPago}
          onChange={e => onChange({ comentarioPago: e.target.value })}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: '8px' } }} />
        <Typography sx={{ fontSize: 10, color: DL.tS, mt: '4px', textAlign: 'right' }}>
          {(data.comentarioPago || '').length}/100 caracteres
        </Typography>
      </Box>}

      {/* ── Registro de Pagos — solo en modo edición ──────────────────────── */}
      {isEditing && <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, p: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Header + resumen inline */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: SF }}>Registro de Pagos</Typography>
          <Box sx={{ display: 'flex', gap: '12px' }}>
            {[
              { label: 'Total', val: total, color: DL.blue },
              { label: 'Pagado', val: pagado4, color: '#15803d' },
              { label: 'Pendiente', val: pendiente4, color: pendiente4 > 0 ? '#dc2626' : '#15803d' },
            ].map(({ label, val, color }) => (
              <Box key={label} sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, fontFamily: SF, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color, fontFamily: SF }}>${val.toFixed(2)}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Tabla historial */}
        <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Fecha', 'Método', 'Monto'].map(h => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontFamily: SF, fontSize: 9, fontWeight: 500, color: DL.blue, borderBottom: `1px solid ${DL.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagos.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '10px', textAlign: 'center', fontFamily: SF, fontSize: 11, color: DL.tS }}>Sin pagos registrados</td></tr>
              ) : pagos.map((pg, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfe' }}>
                  <td style={{ padding: '6px 10px', fontFamily: SF, fontSize: 11, color: DL.tM, borderBottom: `1px solid ${DL.border}` }}>{pg.fecha}</td>
                  <td style={{ padding: '6px 10px', fontFamily: SF, fontSize: 11, color: DL.tM, borderBottom: `1px solid ${DL.border}` }}>{pg.metodo}</td>
                  <td style={{ padding: '6px 10px', fontFamily: SF, fontSize: 11, fontWeight: 500, color: '#15803d', borderBottom: `1px solid ${DL.border}` }}>${Number(pg.monto).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {/* Formulario nuevo pago */}
        {!isPagado4 && formOpen && (
          <Box sx={{ p: '12px', borderRadius: '8px', border: `1px solid ${DL.border}`, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Box sx={{ display: 'flex', gap: '8px' }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, fontFamily: SF, mb: '3px' }}>Fecha *</Typography>
                <Box component="input" type="date" value={form4.fecha}
                  onChange={e => setForm4(f => ({ ...f, fecha: e.target.value }))}
                  sx={{ width: '100%', fontFamily: SF, fontSize: 11, color: DL.tH, border: `1px solid ${DL.border}`, borderRadius: '6px', px: '8px', py: '5px', outline: 'none', background: '#fff', boxSizing: 'border-box', '&:focus': { borderColor: DL.blue } }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, fontFamily: SF, mb: '3px' }}>Método *</Typography>
                <Box component="select" value={form4.metodo}
                  onChange={e => setForm4(f => ({ ...f, metodo: e.target.value }))}
                  sx={{ width: '100%', fontFamily: SF, fontSize: 11, color: form4.metodo ? DL.tH : DL.tS, border: `1px solid ${DL.border}`, borderRadius: '6px', px: '8px', py: '5px', outline: 'none', background: '#fff', cursor: 'pointer', appearance: 'none', boxSizing: 'border-box', '&:focus': { borderColor: DL.blue } }}>
                  <option value="">Seleccionar...</option>
                  {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, fontFamily: SF, mb: '3px' }}>Monto * (máx. ${pendiente4.toFixed(2)})</Typography>
                <Box component="input" type="number" min="0.01" step="0.01" max={pendiente4} value={form4.monto} placeholder="0.00"
                  onChange={e => setForm4(f => ({ ...f, monto: e.target.value }))}
                  sx={{ width: '100%', fontFamily: SF, fontSize: 11, color: DL.tH, border: `1px solid ${DL.border}`, borderRadius: '6px', px: '8px', py: '5px', outline: 'none', background: '#fff', boxSizing: 'border-box', '&:focus': { borderColor: DL.blue } }} />
              </Box>
            </Box>
            {pagoError && <Typography sx={{ fontSize: 10, color: '#dc2626', fontFamily: SF }}>{pagoError}</Typography>}
            <Box sx={{ display: 'flex', gap: '6px' }}>
              <Box component="button" onClick={guardarPago4} sx={{ flex: 1, py: '7px', borderRadius: '7px', background: '#fff', border: '1px solid #1a1a1a', cursor: 'pointer', fontFamily: SF, fontSize: 11, fontWeight: 500, color: '#1a1a1a', '&:hover': { background: '#f6f6f6' } }}>
                Ingresar pago
              </Box>
              <Box component="button" onClick={() => { setFormOpen(false); setPagoError(''); }} sx={{ flex: 1, py: '7px', borderRadius: '7px', background: '#f6f6f6', border: `1px solid ${DL.border}`, cursor: 'pointer', fontFamily: SF, fontSize: 11, fontWeight: 500, color: DL.tM, '&:hover': { background: '#e3e3e3' } }}>
                Cancelar
              </Box>
            </Box>
          </Box>
        )}

        {!isPagado4 && !formOpen && (
          <Box component="button" onClick={() => { setFormOpen(true); setPagoError(''); }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', py: '7px', borderRadius: '7px', background: '#fff', border: '1px solid #1a1a1a', cursor: 'pointer', fontFamily: SF, fontSize: 11, fontWeight: 500, color: '#1a1a1a', '&:hover': { background: '#f6f6f6' } }}>
            + Agregar pago
          </Box>
        )}

        {isPagado4 && (
          <Box sx={{ py: '7px', px: '12px', borderRadius: '7px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#15803d', fontFamily: SF }}>✓ Pedido pagado al 100%</Typography>
          </Box>
        )}
      </Box>}

    </Box>
  );
}

// ─── Convierte lineas del mock a ordenes con items reales ─────────────────────
// Reconstruye órdenes con productos a partir de las líneas resumidas de un pedido guardado, que solo traen
// tipo y cantidad. Es una aproximación para poder mostrar y editar el pedido: usa los primeros productos del
// catálogo y precios fijos (pastel $35, cupcake $3.50 c/u, accesorio $5). Devuelve [] si no hay líneas.
function lineasToOrdenes(lineas) {
  if (!lineas?.length) return [];
  let counter = Date.now();
  const uid = () => ++counter;

  // Agrupar accesorios con accDe junto a su pastel; los standalone van solos
  const result = [];

  lineas.forEach(l => {
    if (l.tipo === 'Catálogo') {
      const count = Math.min(l.qty || 3, CATALOGO.length);
      const items = CATALOGO.slice(0, count).map(p => ({ ...p, qty: 1 }));
      result.push({ id: uid(), tipo: 'Catálogo', esCatalogo: true, items });
    }
    else if (l.tipo === 'Pastel Personalizado' || l.tipo === 'Cupcakes Personalizados' || l.tipo === 'Galletas Personalizadas') {
      const accLinea = lineas.find(a => a.tipo === 'Accesorios' && a.accDe === l.codigo);
      const nombreBase = l.tipo;
      const nombreItem = l.codigo ? `${nombreBase} · ${l.codigo}` : nombreBase;
      const pastelItems = [{
        id: uid(), nombre: nombreItem,
        precio: l.tipo === 'Cupcakes Personalizados' ? (l.qty || 1) * 3.5 : 35,
        categoria: 'Repostería', qty: 1,
      }];
      if (accLinea?.codigos?.length) {
        accLinea.codigos.forEach(cod => {
          pastelItems.push({ id: uid(), nombre: cod, precio: 5, categoria: 'Accesorios', qty: 1 });
        });
      }
      result.push({ id: uid(), tipo: l.tipo, esCatalogo: false, items: pastelItems });
    }
    else if (l.tipo === 'Accesorios' && !l.accDe) {
      // Accesorios standalone (sin pastel asociado)
      const items = (l.codigos || []).map(cod => ({
        id: uid(), nombre: cod, precio: 5, categoria: 'Accesorios', qty: 1,
      }));
      if (items.length) result.push({ id: uid(), tipo: 'Accesorios', esCatalogo: true, items });
    }
    // Accesorios con accDe ya se incluyeron en el pastel correspondiente
  });

  return result;
}

// ─── Page principal ───────────────────────────────────────────────────────────
/*
 * NuevoPedido (componente principal): coordina los 4 pasos, guarda todo el estado del pedido y
 * decide qué se muestra. Recibe user (usuario con sesión, de donde sale la vendedora).
 * Provoca: guardar cotizaciones o pedidos en localStorage y navegar a la lista de pedidos; en modo
 * edición, enviar una solicitud de cambio en lugar de guardar directo.
 */
export default function NuevoPedido({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Modo edición: si la URL trae ?id=..., se abre un pedido ya guardado en lugar de uno nuevo.
  const editId = (() => { const raw = new URLSearchParams(location.search).get('id'); return raw ? decodeURIComponent(raw) : null; })();
  // Busca el pedido entre los de ejemplo y los guardados en localStorage ('pedidos_nuevos'), aplicando
  // primero los cambios ya aprobados (aplicarOverrides).
  const pedidoEdit = editId ? (
    aplicarOverrides([
      ...PEDIDOS_INICIALES,
      ...JSON.parse(localStorage.getItem('pedidos_nuevos') || '[]'),
    ]).find(p => p.id === editId)
  ) : null;
  // Pagos ya registrados de ese pedido (localStorage, clave 'pagos_pedidos').
  const editPagos = editId ? (JSON.parse(localStorage.getItem('pagos_pedidos') || '{}')[editId] || []) : [];
  // Guarda en localStorage la lista de pagos del pedido en edición cada vez que Step4 la modifica;
  // en un pedido nuevo no hace nada (todavía no tiene id).
  const handlePagosChange = (updatedPagos) => {
    if (!editId) return;
    const all = JSON.parse(localStorage.getItem('pagos_pedidos') || '{}');
    all[editId] = updatedPagos;
    localStorage.setItem('pagos_pedidos', JSON.stringify(all));
  };

  // Paso actual del asistente: 1 Cliente, 2 Entrega, 3 Pedido, 4 Pago.
  const [step, setStep] = useState(1);
  // Órdenes del pedido: cada orden agrupa productos (Catálogo, Accesorios, personalizado, Producción...).
  // Al editar se cargan las del pedido guardado.
  const [ordenes, setOrdenes] = useState(() => {
    if (!pedidoEdit) return [];
    if (pedidoEdit.ordenes?.length) return pedidoEdit.ordenes;
    return lineasToOrdenes(pedidoEdit.lineas);
  });
  // Selecciones de las cuadrículas (id de producto → cantidad) para marcar lo ya agregado al pedido.
  const [selCatalogo, setSelCatalogo] = useState({});
  const [selAccesorios, setSelAccesorios] = useState({});
  const [selAccesoriosCupcakes, setSelAccesoriosCupcakes] = useState({});
  const [isCorporativo] = useState(true); // subida de imágenes de referencia siempre habilitada
  // Se marca al elegir "Guardar como cotización y salir" en el diálogo de salida.
  const [success, setSuccess] = useState(null);
  // Activa el aviso del resumen lateral cuando se intenta pagar sin elegir tipo y método de pago.
  const [pagoError, setPagoError] = useState(false);
  const [openSolicitud, setOpenSolicitud] = useState(0);
  const [tabStep2, setTabStep2] = useState('Catalogo');
  const [forceTabTo, setForceTabTo] = useState(null);
  const [exitDialog, setExitDialog] = useState(false); // dialog "¿salir sin guardar?"
  const [pendingNav, setPendingNav] = useState(null);  // ruta pendiente
  // Borrador del pastel personalizado que se está armando. Vive aquí (y no en Step2) para no perderse al cambiar de paso.
  const [pastelConfig, setPastelConfig] = useState({
    tamano: null, tipoRelleno: null, tipoRelleno_p2: null,
    sabor: '', sabor_p2: '', remojo: '', remojo_p2: '', relleno: '', relleno_p2: '',
    textura: '', textura_base: '', textura_color: null,
    textura_p2: '', textura_base_p2: '', textura_color_p2: null,
    ruedo: '', ruedo_tipo: '', ruedo_estilo: '', ruedo_color: null,
    ruedo_p2: '', ruedo_tipo_p2: '', ruedo_estilo_p2: '', ruedo_color_p2: null,
    dedicatoria: '',
  });
  // Direcciones del cliente (se pueden agregar durante el flujo)
  const [clienteDirecciones, setClienteDirecciones] = useState(() => {
    const cli = pedidoEdit?.cliente;
    if (!cli) return [];
    const found = CLIENTES.find(c => c.nombre === cli.nombre);
    return found?.direcciones || [];
  });

  // Datos de los pasos 1, 2 y 4. En modo edición se llenan con el pedido guardado; en uno nuevo se usan valores
  // por defecto (Reserva, Domicilio y la vendedora del usuario con sesión).
  const [formData, setFormData] = useState(() => pedidoEdit ? {
    vendedor: pedidoEdit.vendedor,
    cliente: pedidoEdit.cliente,
    tipoCliente: pedidoEdit.tipoCliente || 'Natural',
    clienteSearch: pedidoEdit.cliente?.nombre || '',
    fechaEntrega: pedidoEdit.entrega?.split('T')[0] || '',
    horaEntrega: pedidoEdit.entrega?.split('T')[1]?.slice(0, 5) || '12:00',
    lugarEntrega: pedidoEdit.lugarEntrega || 'Sucursal Principal',
    direccionEntrega: pedidoEdit.direccionEntrega || '',
    comentarioEntrega: pedidoEdit.comentarioEntrega || '',
    tipoPedido: pedidoEdit.tipoPedido || 'Reserva',
    tipoPago: pedidoEdit.estadoPago || '',
    metodoPago: pedidoEdit.metodoPago || '',
    comentarioPago: pedidoEdit.comentarioPago || '',
  } : {
    vendedor: user?.name || 'Vendedor',
    cliente: null, tipoCliente: 'Natural', clienteSearch: '',
    fechaEntrega: '', horaEntrega: '09:00',
    lugarEntrega: 'Domicilio', direccionEntrega: '', comentarioEntrega: '',
    tipoPago: '', metodoPago: '', comentarioPago: '', montoAnticipo: '',
    tipoPedido: 'Reserva',
    sucursal: 'Principal',
  });

  // ── Modo edición: línea base para detectar cambios ────────────────────────
  const dirTxt = (d) => !d ? '' : typeof d === 'object'
    ? [d.direccion, d.municipio, d.departamento].filter(Boolean).join(', ') : String(d);
  const resumenOrdenes = (os) => os.map((o, i) => ({
    label: `Orden #${i + 1} · ${o.tipo || 'Catálogo'}`,
    items: (o.items || []).map(it => `${it.nombre || it.name || 'Ítem'} ×${it.qty || 1}`).sort(),
  }));
  const subtotalOrdenes = (os) => os.reduce((sum, o) => sum + (o.items || []).reduce((ss, it) => ss + (it.precio || 0) * (it.qty || 1), 0), 0);
  // Foto inicial del pedido al abrirlo; después se compara con el estado actual para saber qué cambió.
  const [baseline] = useState(() => ({
    form: { ...formData, direccionTxt: dirTxt(formData.direccionEntrega) },
    ordenes: resumenOrdenes(ordenes),
    subtotal: subtotalOrdenes(ordenes),
  }));

  // Actualiza parte de los datos del formulario. Si cambia el cliente se recargan sus direcciones, y al elegir
  // tipo o método de pago se borra el aviso de error.
  const update = (partial) => {
    // Si cambia el cliente, actualizar las direcciones disponibles
    if (partial.cliente !== undefined) {
      const found = CLIENTES.find(c => c.nombre === partial.cliente?.nombre);
      setClienteDirecciones(found?.direcciones || []);
    }
    setFormData(p => ({ ...p, ...partial }));
    if (partial.tipoPago || partial.metodoPago) setPagoError(false);
  };

  // Salir seguro — si hay datos sin guardar muestra el dialog
  // Hay datos sin guardar si ya se eligió cliente o se agregó alguna orden; en ese caso salir pide confirmación.
  const hasUnsaved = !!formData.cliente || ordenes.length > 0;
  const safeNavigate = (to) => {
    if (hasUnsaved && !success) { setPendingNav(to); setExitDialog(true); }
    else navigate(to);
  };
  const confirmExit = () => { setExitDialog(false); navigate(pendingNav || '/pedidos'); };
  // "Guardar como cotización y salir": guarda de verdad la cotización y va a la pantalla que se quería abrir.
  // Si no hay nada que guardar (sin órdenes) o se está editando un pedido, solo sale.
  const saveAndExit = () => {
    setExitDialog(false);
    if (editId || !ordenes.length) { navigate(pendingNav || '/pedidos'); return; }
    handleCotizar(pendingNav || '/pedidos');
  };
  const saveConfirmedAndExit = () => { setExitDialog(false); navigate(pendingNav || '/pedidos'); };
  // Edición de un pedido ya confirmado (estadoPago distinto de 'Pendiente'); si sigue 'Pendiente' es una cotización.
  // Cambia los textos del diálogo y del resumen, y oculta el botón "Pagar Pedido".
  const isConfirmedEdit = !!editId && pedidoEdit?.estadoPago !== 'Pendiente';

  // Confirmar / cotizar
  // Confirma el pedido desde el paso de pago. En edición solo abre la solicitud de cambio. En un pedido nuevo
  // exige tipo y método de pago, crea el pedido con id PED-MMAA-NNN y lo guarda en localStorage.
  const handleConfirmar = () => {
    if (editId) { setOpenSolicitud(n => n + 1); return; }
    if (!formData.tipoPago || !formData.metodoPago) { setPagoError(true); return; }
    setPagoError(false);
    // Fecha y hora de entrega en formato ISO; si faltaran se usa el momento actual.
    const ahora = new Date().toISOString();
    const entregaISO = formData.fechaEntrega && formData.horaEntrega
      ? `${formData.fechaEntrega}T${formData.horaEntrega}:00`
      : ahora;
    // El id se arma con el mes y año de la fecha de ENTREGA más un consecutivo (PED-MMAA-NNN).
    const mes = new Date(entregaISO).getMonth() + 1;
    const anio = String(new Date(entregaISO).getFullYear()).slice(-2);
    const previos = JSON.parse(localStorage.getItem('pedidos_nuevos') || '[]');
    const num = String(previos.length + 1).padStart(3, '0');
    const nuevoPedido = {
      id: `PED-${String(mes).padStart(2,'0')}${anio}-${num}`,
      tipoPedido: formData.tipoPedido || 'Reserva',
      ordenes: ordenes,
      lineas: ordenes.map(o => ({
        tipo: o.tipo === 'Catálogo' || o.esCatalogo ? 'Catálogo' : o.tipo,
        label: o.nombre || o.tipo,
        qty: o.items?.length || 1,
        codigo: o.id,
      })),
      registro: ahora,
      entrega: entregaISO,
      vendedor: formData.vendedor || 'Vendedor',
      sucursal: formData.sucursal || 'Principal',
      cliente: { nombre: formData.cliente?.nombre || '', telefono: formData.cliente?.telefono || '' },
      tipoCliente: formData.tipoCliente || 'Natural',
      lugarEntrega: formData.lugarEntrega || '',
      direccionEntrega: formData.direccionEntrega || '',
      estadoPago: formData.tipoPago || 'Pendiente',
      metodoPago: formData.metodoPago || '',
      // Total final del pedido confirmado: subtotal + IVA 13 % + envío.
      total: (() => { const sub = ordenes.reduce((s, o) => s + (o.items || []).reduce((ss, it) => ss + (it.precio || 0) * (it.qty || 1), 0), 0); return sub + sub * 0.13 + (precioEnvio || 0); })(),
    };
    localStorage.setItem('pedidos_nuevos', JSON.stringify([...previos, nuevoPedido]));
    // Si el pago es Anticipo, el monto se registra como primer pago del pedido (pagos_pedidos)
    // para poder calcular después el saldo pendiente.
    if (formData.tipoPago === 'Anticipo' && formData.montoAnticipo && parseFloat(formData.montoAnticipo) > 0) {
      const pagosPrevios = JSON.parse(localStorage.getItem('pagos_pedidos') || '{}');
      pagosPrevios[nuevoPedido.id] = [{
        fecha: new Date().toISOString().slice(0, 10),
        metodo: formData.metodoPago || 'Efectivo',
        monto: parseFloat(formData.montoAnticipo),
      }];
      localStorage.setItem('pagos_pedidos', JSON.stringify(pagosPrevios));
    }
    // Navegar directamente según la fecha de entrega
    // Si la entrega cae en la semana actual (lunes a domingo) se abre la vista de gestión; si no, la vista del día de entrega.
    const feEntrega = new Date(entregaISO);
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    lunes.setHours(0, 0, 0, 0);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);
    if (feEntrega >= lunes && feEntrega <= domingo) {
      navigate('/pedidos?vista=gestion');
    } else {
      navigate(`/pedidos/dia/${formData.fechaEntrega}`);
    }
  };
  // Guarda el pedido como COTIZACIÓN: se arma igual que en handleConfirmar pero con id COT-, estadoPago 'Pendiente'
  // y sin método de pago. Una cotización no se produce hasta que se registre un pago. Al terminar vuelve a la lista.
  // destino: ruta a la que ir después de guardar (solo se usa al salir desde el diálogo; los botones llaman sin argumento).
  const handleCotizar = (destino) => {
    if (editId) { setOpenSolicitud(n => n + 1); return; }
    const ahora = new Date().toISOString();
    const entregaISO = formData.fechaEntrega && formData.horaEntrega
      ? `${formData.fechaEntrega}T${formData.horaEntrega}:00`
      : ahora;
    const mes = new Date(entregaISO).getMonth() + 1;
    const anio = String(new Date(entregaISO).getFullYear()).slice(-2);
    const previos = JSON.parse(localStorage.getItem('pedidos_nuevos') || '[]');
    const num = String(previos.length + 1).padStart(3, '0');
    const nuevoPedido = {
      id: `COT-${String(mes).padStart(2,'0')}${anio}-${num}`,
      tipoPedido: formData.tipoPedido || 'Reserva',
      ordenes: ordenes,
      lineas: ordenes.map(o => ({
        tipo: o.tipo === 'Catálogo' || o.esCatalogo ? 'Catálogo' : o.tipo,
        label: o.nombre || o.tipo,
        qty: o.items?.length || 1,
        codigo: o.id,
      })),
      registro: ahora,
      entrega: entregaISO,
      vendedor: formData.vendedor || 'Vendedor',
      sucursal: formData.sucursal || 'Principal',
      cliente: { nombre: formData.cliente?.nombre || '', telefono: formData.cliente?.telefono || '' },
      tipoCliente: formData.tipoCliente || 'Natural',
      lugarEntrega: formData.lugarEntrega || '',
      estadoPago: 'Pendiente',
      metodoPago: '',
      // Mismo cálculo que el pedido confirmado: subtotal + IVA (13 %) + envío, para que ambos totales coincidan.
      total: (() => { const sub = ordenes.reduce((s, o) => s + (o.items || []).reduce((ss, it) => ss + (it.precio || 0) * (it.qty || 1), 0), 0); return sub + sub * 0.13 + (precioEnvio || 0); })(),
    };
    localStorage.setItem('pedidos_nuevos', JSON.stringify([...previos, nuevoPedido]));
    navigate(typeof destino === 'string' ? destino : '/pedidos');
  };

  // Se activa al intentar avanzar con campos obligatorios vacíos, para que los pasos muestren sus mensajes de error.
  const [showErrors, setShowErrors] = useState(false);

  // Reabre una orden personalizada en el configurador: la quita de la lista (se vuelve a agregar al terminar),
  // carga su configuración y lleva a la pestaña "Personalizado" del paso 3.
  const handleEditOrden = (orden) => {
    setOrdenes(prev => prev.filter(o => o.id !== orden.id));
    const existingConfig = orden.items[0]?.pastelConfig;
    const tipoProdMap = { 'Cupcakes Personalizados': 'cupcake', 'Galletas Personalizadas': 'galletas' };
    const tipoProd = tipoProdMap[orden.tipo] || 'pastel';
    setPastelConfig(existingConfig
      ? { ...existingConfig }
      : { tamano: null, tipoProd, sabor: '', remojo: '', relleno: '', textura: '', textura_base: '', textura_color: null, ruedo: '', ruedo_tipo: '', ruedo_estilo: '', ruedo_color: null, dedicatoria: '', accesorios: {} }
    );
    setForceTabTo({ tab: 'Pastel Personalizado', tipoProd, seq: Date.now() });
    if (step !== 3) setStep(3);
  };

  // Validaciones por paso: 1 requiere cliente; 2 fecha, hora, lugar y (si es Domicilio) dirección;
  // 3 al menos una orden con productos. En modo edición no se bloquea el avance.
  const canNext = () => {
    if (!!editId) return true;
    if (step === 1) return !!formData.cliente;
    if (step === 2) return !!formData.fechaEntrega && !!formData.horaEntrega && !!formData.lugarEntrega && (formData.lugarEntrega !== 'Domicilio' || !!formData.direccionEntrega);
    if (step === 3) return ordenes.length > 0 && ordenes.some(o => o.items.length > 0);
    return true;
  };

  // Avanza solo si el paso actual es válido; si no, activa los mensajes de error del paso.
  const handleNext = () => {
    if (canNext()) { setShowErrors(false); setStep(s => s + 1); }
    else setShowErrors(true);
  };

  // Quita un producto de una orden. Si la orden queda vacía se elimina y el producto se desmarca en la cuadrícula.
  const removeItem = (ordenId, itemIdx) => {
    // Deseleccionar el producto en el grid izquierdo
    setOrdenes(prev => {
      const orden = prev.find(o => o.id === ordenId);
      if (orden) {
        const item = orden.items[itemIdx];
        if (item && item.id !== undefined) {
          if (orden.tipo === 'Catálogo' || orden.esCatalogo) {
            setSelCatalogo(s => {
              const qty = (s[item.id] || 1) - 1;
              if (qty <= 0) { const { [item.id]: _, ...rest } = s; return rest; }
              return { ...s, [item.id]: qty };
            });
          } else if (orden.tipo === 'Accesorios') {
            setSelAccesorios(s => {
              const qty = (s[item.id] || 1) - 1;
              if (qty <= 0) { const { [item.id]: _, ...rest } = s; return rest; }
              return { ...s, [item.id]: qty };
            });
          }
        }
      }
      return prev.map(o => {
        if (o.id !== ordenId) return o;
        const items = o.items.filter((_, i) => i !== itemIdx);
        return { ...o, items };
      }).filter(o => o.items.length > 0);
    });
  };

  // Cambia la cantidad de un producto (mínimo 1) y reconstruye las selecciones de catálogo y accesorios
  // para que los contadores de las tarjetas coincidan con las órdenes.
  const changeQty = (ordenId, itemIdx, delta) => {
    setOrdenes(prev => {
      const next = prev.map(o => {
        if (o.id !== ordenId) return o;
        const items = o.items.map((it, i) => {
          if (i !== itemIdx) return it;
          const newQty = Math.max(1, (it.qty || 1) + delta);
          return { ...it, qty: newQty };
        });
        return { ...o, items };
      });

      // Sync badges: rebuild selCatalogo y selAccesorios desde todas las ordenes
      const catSel = {};
      const accSel = {};
      next.forEach(o => {
        const isCat = o.tipo === 'Catálogo' || o.esCatalogo;
        const isAcc = o.tipo === 'Accesorios' || o.tipo === 'Accesorios Cupcakes';
        o.items.forEach(it => {
          if (it.id == null) return;
          if (isCat) catSel[it.id] = (catSel[it.id] || 0) + (it.qty || 1);
          else if (isAcc) accSel[it.id] = (accSel[it.id] || 0) + (it.qty || 1);
        });
      });
      setSelCatalogo(catSel);
      setSelAccesorios(accSel);

      return next;
    });
  };

  // Elimina una orden completa y descuenta sus productos de las selecciones de la cuadrícula.
  const removeOrden = (ordenId) => {
    setOrdenes(prev => {
      const orden = prev.find(o => o.id === ordenId);
      if (orden) {
        const isCat = orden.tipo === 'Catálogo' || orden.esCatalogo;
        const isAcc = orden.tipo === 'Accesorios';
        if (isCat || isAcc) {
          const setSel = isCat ? setSelCatalogo : setSelAccesorios;
          setSel(s => {
            const updated = { ...s };
            orden.items.forEach(item => {
              if (item.id !== undefined) {
                const qty = (updated[item.id] || 1) - 1;
                if (qty <= 0) delete updated[item.id];
                else updated[item.id] = qty;
              }
            });
            return updated;
          });
        }
      }
      return prev.filter(o => o.id !== ordenId);
    });
  };

  // División stock / producción (pedido Mixto): si en "En stock" se indican menos unidades que las pedidas,
  // la línea original queda con la cantidad en stock y la diferencia pasa a una única orden de "Producción"
  // (se crea si no existe, o se suma al mismo producto si ya estaba). El resumen detecta esa orden y muestra "Mixto".
  const splitStock = (ordenId, itemIdx, stockDisp, confirmar = false) => {
    setOrdenes(prev => {
      const orden = prev.find(o => o.id === ordenId);
      if (!orden) return prev;
      const item = orden.items[itemIdx];
      const qty = item.qty || 1;

      // Confirmar: agregar a la única Orden de Producción (o crearla si no existe)
      if (confirmar && stockDisp !== undefined && stockDisp < qty) {
        const aProduccion = qty - stockDisp;
        const { stockDisp: _sd, ...itemClean } = item;
        const itemProd = { ...itemClean, qty: aProduccion };

        // Reducir qty del item original y limpiar stockDisp
        const updated = prev.map(o => {
          if (o.isProduccion) {
            // Agregar a la orden de producción existente (evitar duplicado por id)
            const yaExiste = o.items.findIndex(it => it.id === itemClean.id);
            const items = yaExiste >= 0
              ? o.items.map((it, i) => i === yaExiste ? { ...it, qty: (it.qty || 1) + aProduccion } : it)
              : [...o.items, itemProd];
            return { ...o, items };
          }
          if (o.id !== ordenId) return o;
          const items = o.items.map((it, i) => {
            if (i !== itemIdx) return it;
            const { stockDisp: _, ...rest } = it;
            return { ...rest, qty: stockDisp };
          });
          return { ...o, items };
        });

        // Si no había orden de producción, crearla al final
        const yaHayProd = prev.some(o => o.isProduccion);
        if (yaHayProd) return updated;
        return [...updated, { id: Date.now(), tipo: 'Producción', isProduccion: true, items: [itemProd] }];
      }

      // Sin confirmar: solo marcar stockDisp en el item (estado pendiente)
      return prev.map(o => {
        if (o.id !== ordenId) return o;
        const items = o.items.map((it, i) => {
          if (i !== itemIdx) return it;
          if (stockDisp === undefined) { const { stockDisp: _, ...rest } = it; return rest; }
          return { ...it, stockDisp };
        });
        return { ...o, items };
      });
    });
  };

  // Guarda la dedicatoria de un pastel. Con varias unidades se mantiene un arreglo (una por unidad) ajustado a la cantidad.
  const changeDedicatoria = (ordenId, itemIdx, val, unitIdx) => {
    setOrdenes(prev => prev.map(o => {
      if (o.id !== ordenId) return o;
      const items = o.items.map((it, i) => {
        if (i !== itemIdx) return it;
        if (unitIdx === undefined) return { ...it, dedicatoria: val };
        // Multi-unidad: guardar en array dedicatorias
        const deds = Array.from({ length: it.qty || 1 }, (_, k) => (it.dedicatorias || [])[k] || '');
        deds[unitIdx] = val;
        return { ...it, dedicatorias: deds };
      });
      return { ...o, items };
    }));
  };

  // Textos cortos de entrega y dirección para el encabezado del resumen lateral.
  const entregaResumen = formData.fechaEntrega
    ? `${formData.lugarEntrega} · ${formData.fechaEntrega} ${formData.horaEntrega}`
    : '';
  const direccionResumen = formData.lugarEntrega === 'Domicilio' && formData.direccionEntrega
    ? (typeof formData.direccionEntrega === 'object'
        ? [formData.direccionEntrega.direccion, formData.direccionEntrega.municipio, formData.direccionEntrega.departamento].filter(Boolean).join(', ')
        : formData.direccionEntrega)
    : '';

  // Costo de envío por zona: solo aplica a Domicilio y sale del departamento de la dirección elegida (ZONAS_ENVIO); si no, es 0.
  const precioEnvio = (() => {
    if (formData.lugarEntrega !== 'Domicilio' || !formData.direccionEntrega) return 0;
    const dep = typeof formData.direccionEntrega === 'object' ? formData.direccionEntrega.departamento : null;
    return dep && ZONAS_ENVIO[dep] ? ZONAS_ENVIO[dep].precio : 0;
  })();

  // ── Modo edición: cambios detectados contra la línea base ─────────────────
  // Compara el formulario y las órdenes actuales contra la línea base y arma la lista de cambios (campo, antes, después).
  const cambiosPedido = (() => {
    if (!editId || !pedidoEdit) return [];
    const out = [];
    const b = baseline.form;
    const fechaFmt = (f) => f ? f.split('-').reverse().join('/') : '—';
    if (b.fechaEntrega !== formData.fechaEntrega) out.push({ campo: 'Fecha de entrega', antes: fechaFmt(b.fechaEntrega), despues: fechaFmt(formData.fechaEntrega) });
    if (b.horaEntrega !== formData.horaEntrega) out.push({ campo: 'Hora de entrega', antes: b.horaEntrega || '—', despues: formData.horaEntrega || '—' });
    if (b.lugarEntrega !== formData.lugarEntrega) out.push({ campo: 'Lugar de entrega', antes: b.lugarEntrega || '—', despues: formData.lugarEntrega || '—' });
    if (b.direccionTxt !== dirTxt(formData.direccionEntrega)) out.push({ campo: 'Dirección de entrega', antes: b.direccionTxt || '—', despues: dirTxt(formData.direccionEntrega) || '—' });
    if (b.tipoPedido !== formData.tipoPedido) out.push({ campo: 'Tipo de pedido', antes: b.tipoPedido || '—', despues: formData.tipoPedido || '—' });
    if ((b.cliente?.nombre || '') !== (formData.cliente?.nombre || '')) out.push({ campo: 'Cliente', antes: b.cliente?.nombre || '—', despues: formData.cliente?.nombre || '—' });
    const act = resumenOrdenes(ordenes);
    const max = Math.max(baseline.ordenes.length, act.length);
    for (let i = 0; i < max; i++) {
      const a = baseline.ordenes[i], n = act[i];
      if (a && !n) out.push({ campo: a.label, antes: a.items.join(', ') || '—', despues: 'Orden eliminada' });
      else if (!a && n) out.push({ campo: n.label, antes: '—', despues: n.items.join(', ') || 'Orden agregada' });
      else if (a.items.join('|') !== n.items.join('|')) out.push({ campo: n.label, antes: a.items.join(', ') || '—', despues: n.items.join(', ') || '—' });
    }
    return out;
  })();
  // Nuevo total estimado al editar: total anterior más la diferencia de subtotal con IVA (13 %).
  const totalAntesEdit = pedidoEdit?.total || 0;
  const totalDespuesEdit = Math.round((totalAntesEdit + (subtotalOrdenes(ordenes) - baseline.subtotal) * 1.13) * 100) / 100;
  const historialEdit = editId && pedidoEdit ? getHistorialPedido(pedidoEdit) : [];
  // En modo edición los cambios no se aplican directo: se crea una solicitud de cambio (motivo, cambios y totales)
  // que se envía a Producción.
  const enviarSolicitud = (motivo) => {
    const entregaISO = formData.fechaEntrega && formData.horaEntrega ? `${formData.fechaEntrega}T${formData.horaEntrega}:00` : pedidoEdit.entrega;
    crearSolicitud({
      pedido: pedidoEdit,
      solicitante: user?.name || pedidoEdit.vendedor || 'Vendedor',
      motivo,
      cambios: cambiosPedido,
      totalAntes: totalAntesEdit,
      totalDespues: totalDespuesEdit,
      propuesta: {
        entrega: entregaISO,
        lugarEntrega: formData.lugarEntrega || '',
        direccionEntrega: dirTxt(formData.direccionEntrega),
        tipoPedido: formData.tipoPedido || pedidoEdit.tipoPedido,
        cliente: { nombre: formData.cliente?.nombre || pedidoEdit.cliente?.nombre || '', telefono: formData.cliente?.telefono || pedidoEdit.cliente?.telefono || '' },
        ordenes,
        lineas: ordenes.map(o => ({ tipo: o.tipo === 'Catálogo' || o.esCatalogo ? 'Catálogo' : o.tipo, label: o.nombre || o.tipo, qty: o.items?.length || 1, codigo: o.id })),
        total: totalDespuesEdit,
      },
    });
    navigate('/produccion/solicitudes');
  };

  // El resumen lateral aparece desde el paso 3 (Pedido); en modo edición se ve desde el paso 1.
  const mostrarSidebar = step >= 3 || (!!editId && step >= 1);
  // Solo bloquea el pago si el usuario está configurando un pastel Y ya eligió tamaño (hay config activa sin guardar)
  const pastelEnProceso = step === 3 && tabStep2 === 'Pastel Personalizado' && !!pastelConfig.tamano;

  return (
    <Box sx={{ p: { xs: '12px', md: '20px 24px' } }}>
      {editId && pedidoEdit && (
        <EdicionPedidoPanel pedido={pedidoEdit} historial={historialEdit} cambios={cambiosPedido}
          onEnviar={enviarSolicitud} openSignal={openSolicitud} />
      )}
      {/* Stepper Bar */}
      <Box sx={{
        background: '#fff', borderRadius: '14px',
        border: `1px solid ${DL.border}`, boxShadow: DL.e1,
        p: '16px 20px', mb: '20px',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        {/* Botón Anterior */}
        <Box onClick={() => step > 1 ? setStep(s => s - 1) : safeNavigate('/pedidos')} title="Anterior" aria-label="Anterior" sx={{
          display: 'flex', alignItems: 'center', gap: '6px',
          px: '14px', py: '9px', borderRadius: '10px',
          border: `1px solid ${step > 1 ? DL.border2 : DL.tH}`,
          background: '#fff',
          cursor: 'pointer', flexShrink: 0,
          '&:hover': { background: DL.bg },
          transition: 'all .14s',
        }}>
          <BackIcon sx={{ fontSize: 18, color: DL.tH }} />
        </Box>

        <Stepper step={step} onStepClick={editId ? setStep : null} />

        {/* Botón Siguiente */}
        {step < 4 ? (
          <Tooltip title={!canNext() ? 'Completa los campos requeridos' : ''} arrow>
            <Box onClick={handleNext} title={canNext() ? 'Siguiente' : undefined} aria-label="Siguiente" sx={{
              display: 'flex', alignItems: 'center', gap: '6px',
              px: '14px', py: '9px', borderRadius: '10px',
              background: '#fff',
              border: `1px solid ${canNext() ? DL.tH : DL.border}`,
              cursor: canNext() ? 'pointer' : 'not-allowed', flexShrink: 0,
                            '&:hover': canNext() ? { background: DL.bg } : {},
              transition: 'all .14s',
            }}>
              <NextIcon sx={{ fontSize: 18, color: canNext() ? DL.tH : 'rgba(26,26,26,.4)' }} />
            </Box>
          </Tooltip>
        ) : <Box sx={{ width: 44, flexShrink: 0 }} />}
      </Box>

      {/* Content — ambas tarjetas miden lo mismo y llenan la vista; el resumen scrollea por dentro */}
      <Box sx={{ display: 'flex', gap: '20px', alignItems: 'stretch', minHeight: 'calc(100vh - 200px)' }}>
        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', ...(step === 3 ? { alignSelf: 'flex-start' } : {}) }}>
          {/* Cada paso se dibuja según 'step'. Recordar: Step3 es el paso 2 (Entrega) y Step2 es el paso 3 (Pedido). */}
          {step === 1 && <Step1 data={formData} onChange={update} isEditing={!!editId} showErrors={showErrors} />}
          {step === 2 && <Step3 data={formData} onChange={update}
            direccionesCliente={clienteDirecciones}
            onAgregarDireccion={dir => setClienteDirecciones(prev => [...prev, dir])}
            isCorporativo={isCorporativo}
            showErrors={showErrors}
          />}
          {step === 3 && <Step2 ordenes={ordenes} onOrdenesChange={setOrdenes} cliente={formData.cliente} onTabChange={setTabStep2} tipoPedido={formData.tipoPedido} pastelConfig={pastelConfig} onPastelConfigChange={setPastelConfig} selCatalogo={selCatalogo} setSelCatalogo={setSelCatalogo} selAccesorios={selAccesorios} setSelAccesorios={setSelAccesorios} selAccesoriosCupcakes={selAccesoriosCupcakes} setSelAccesoriosCupcakes={setSelAccesoriosCupcakes} isCorporativo={isCorporativo} forceTabTo={forceTabTo} />}
          {step === 4 && (
            <Step4
              data={formData} ordenes={ordenes} onChange={update}
              onConfirmar={handleConfirmar}
              onCotizar={handleCotizar}
              precioEnvio={precioEnvio}
              isEditing={!!editId}
              initialPagos={editPagos}
              onPagosChange={handlePagosChange}
            />
          )}
        </Box>

        {/* Sidebar */}
        {mostrarSidebar && (
          <Box sx={{ width: 290, flexShrink: 0, position: 'relative' }}>
          <ResumenSidebar
            cliente={formData.cliente}
            entrega={entregaResumen}
            direccion={direccionResumen}
            precioEnvio={precioEnvio}
            step={step}
            ordenes={ordenes}
            onRemoveItem={removeItem}
            onChangeQty={changeQty}
            onRemoveOrden={removeOrden}
            onAgregarPastel={step === 3 ? () => {} : null}
            pastelEnProceso={pastelEnProceso}
            onGuardar={handleCotizar}
            onPagar={step === 4 ? handleConfirmar : () => setStep(4)}
            tipoPedido={formData.tipoPedido}
            onDedicatoriaChange={changeDedicatoria}
            onStockSplit={splitStock}
            isConfirmedEdit={isConfirmedEdit}
            pagoError={pagoError}
            onEditOrden={handleEditOrden}
          />
          </Box>
        )}
      </Box>

      {/* Dialog: salir sin guardar */}
      <Dialog open={exitDialog} onClose={() => setExitDialog(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', border: `1px solid ${DL.border}`, boxShadow: DL.e3 } } }}>
        <DialogContent sx={{ p: '28px 28px 20px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 500, color: DL.tH, fontFamily: SF, mb: '8px' }}>
            {isConfirmedEdit ? '¿Qué deseas hacer?' : '¿Salir sin guardar?'}
          </Typography>
          <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: SF, mb: '20px' }}>
            {isConfirmedEdit
              ? 'Tienes cambios en este pedido. Elige cómo deseas proceder.'
              : 'Tienes un pedido en progreso. Si sales ahora se perderán todos los datos ingresados.'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isConfirmedEdit ? (
              <>
                <Box onClick={saveConfirmedAndExit} sx={{
                  py: '10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                  background: DL.navy, '&:hover': { background: '#070707' }, transition: 'background .13s',
                }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff', fontFamily: SF }}>Salir y guardar cambios</Typography>
                </Box>
                <Box onClick={confirmExit} sx={{
                  py: '10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                  border: `1px solid #fca5a5`, background: '#fef2f2', '&:hover': { background: '#fee2e2' }, transition: 'background .13s',
                }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#dc2626', fontFamily: SF }}>Salir sin guardar</Typography>
                </Box>
                <Box onClick={() => setExitDialog(false)} sx={{
                  py: '10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                  border: `1px solid ${DL.border}`, background: '#fff', '&:hover': { background: DL.bg }, transition: 'background .13s',
                }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tM, fontFamily: SF }}>Seguir editando</Typography>
                </Box>
              </>
            ) : (
              <>
                <Box onClick={saveAndExit} sx={{
                  py: '10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                  background: DL.navy, '&:hover': { background: '#070707' }, transition: 'background .13s',
                }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff', fontFamily: SF }}>Guardar como cotización y salir</Typography>
                </Box>
                <Box onClick={confirmExit} sx={{
                  py: '10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                  border: `1px solid #fca5a5`, background: '#fef2f2', '&:hover': { background: '#fee2e2' }, transition: 'background .13s',
                }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#dc2626', fontFamily: SF }}>Salir sin guardar</Typography>
                </Box>
                <Box onClick={() => setExitDialog(false)} sx={{
                  py: '10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                  border: `1px solid ${DL.border}`, background: '#fff', '&:hover': { background: DL.bg }, transition: 'background .13s',
                }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tM, fontFamily: SF }}>Seguir editando</Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
