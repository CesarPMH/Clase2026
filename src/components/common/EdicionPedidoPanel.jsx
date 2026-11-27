// Panel superior del modo "editar pedido": historial de cambios + envío de solicitud
//
// Qué hace: se muestra arriba del formulario cuando se edita un pedido ya existente.
// Cuenta los cambios detectados, deja enviar la solicitud (con motivo obligatorio)
// y muestra el historial del pedido (creación + solicitudes anteriores).
// De dónde salen los datos: todo llega por props desde la página del formulario
// (pedido, historial, cambios); la información original viene de data/solicitudesCambio.js.
// Quién lo usa: pages/NuevoPedido.jsx (modo edición). Además exporta pequeños
// componentes de apoyo que reutiliza pages/SolicitudesCambio.jsx.
import { useState, useEffect } from 'react';
import { Box, Typography, Dialog, DialogContent } from '@mui/material';
import { DL } from '../../theme';

const F = "'Inter', ui-sans-serif, system-ui, sans-serif";
const SERIF = "'Crimson Pro','Cormorant Garamond',Georgia,serif";

// Convierte una fecha ISO a texto "dd/mm/aaaa · hh:mm"; devuelve '—' si la fecha no es válida.
export const fmtFechaHora = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
};

// Color de cada estado de solicitud: verde aprobada, rojo rechazada, amarillo pendiente.
export const estadoColor = (estado) =>
  estado === 'Aprobada' ? DL.green : estado === 'Rechazada' ? DL.red : DL.yellow;

// OBJETIVO: mostrar el estado de una solicitud como un punto de color + texto.
// Recibe el estado ('Pendiente' | 'Aprobada' | 'Rechazada'); devuelve el indicador.
export function EstadoSolicitud({ estado }) {
  const c = estadoColor(estado);
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: c, fontFamily: F }}>{estado}</Typography>
    </Box>
  );
}

// OBJETIVO: listar los cambios de una solicitud con el formato "Campo: antes → después".
// Recibe "cambios" (arreglo de {campo, antes, despues}) y "dense" para un espaciado
// más compacto (se usa en el historial). Si no hay cambios no dibuja nada.
export function ListaCambios({ cambios, dense }) {
  if (!cambios?.length) return null;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: dense ? '2px' : '4px', mt: '4px' }}>
      {cambios.map((c, i) => (
        <Typography key={i} sx={{ fontSize: 11, color: DL.tM, fontFamily: F, lineHeight: 1.45 }}>
          <Box component="span" sx={{ fontWeight: 500, color: DL.tH }}>{c.campo}:</Box>{' '}
          {/* El valor anterior se tacha, salvo que no existiera ('—') */}
          <Box component="span" sx={{ color: DL.tS, textDecoration: c.antes && c.antes !== '—' ? 'line-through' : 'none' }}>{c.antes}</Box>
          {' → '}
          <Box component="span" sx={{ color: DL.tH }}>{c.despues}</Box>
        </Typography>
      ))}
    </Box>
  );
}

// OBJETIVO: dar el primer paso del flujo de cambio de un pedido (crear solicitud).
// Recibe: pedido (el que se edita), historial (eventos ya ordenados), cambios
// (diferencias detectadas contra el original), onEnviar(motivo) (lo ejecuta el
// padre para crear la solicitud) y openSignal (contador que, al cambiar, abre
// el diálogo desde fuera, p. ej. con un botón "Guardar" de la página).
// Devuelve el panel con cabecera, historial plegable y diálogo de envío.
export default function EdicionPedidoPanel({ pedido, historial, cambios, onEnviar, openSignal }) {
  const [abierto, setAbierto] = useState(true);       // historial desplegado
  const [dialogo, setDialogo] = useState(false);      // diálogo de envío visible
  const [motivo, setMotivo] = useState('');
  const [errorMotivo, setErrorMotivo] = useState(false);
  const n = cambios.length;
  // Solo abre el diálogo si hay al menos un cambio; sin cambios no hay nada que solicitar
  useEffect(() => { if (openSignal && n) setDialogo(true); }, [openSignal]); // eslint-disable-line

  // Regla: el motivo es obligatorio. Si está vacío se marca el error y no se envía;
  // la solicitud queda 'Pendiente' hasta que alguien la apruebe o rechace.
  const enviar = () => {
    if (!motivo.trim()) { setErrorMotivo(true); return; }
    onEnviar(motivo.trim());
    setDialogo(false); setMotivo('');
  };

  return (
    <Box sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '12px', mb: '20px', overflow: 'hidden' }}>
      {/* Cabecera: título, contador de cambios y botón de envío (deshabilitado si no hay cambios) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '20px', py: '14px', flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography sx={{ fontFamily: SERIF, fontWeight: 300, fontSize: 24, lineHeight: 1.1, color: DL.tH }}>
            Editando pedido {pedido.id}
          </Typography>
          <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F, mt: '2px' }}>
            {pedido.cliente?.nombre} · Los cambios se aplican cuando una persona aprueba la solicitud.
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 11, color: n ? DL.tH : DL.tS, fontFamily: F, fontWeight: 500 }}>
          {n ? `${n} ${n === 1 ? 'cambio detectado' : 'cambios detectados'}` : 'Sin cambios todavía'}
        </Typography>
        <Box onClick={() => n && setDialogo(true)} sx={{
          px: '16px', py: '8px', borderRadius: '8px', border: `1px solid ${n ? DL.tH : DL.border}`,
          background: '#fff', cursor: n ? 'pointer' : 'not-allowed',
          '&:hover': n ? { background: DL.bg } : {}, transition: 'background .14s',
        }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: n ? DL.tH : 'rgba(26,26,26,.4)', fontFamily: F }}>
            Enviar solicitud
          </Typography>
        </Box>
      </Box>

      {/* Historial: línea de tiempo con la creación del pedido y cada solicitud (con su resolución si ya la tiene) */}
      <Box sx={{ borderTop: `1px solid ${DL.border}` }}>
        <Box onClick={() => setAbierto(o => !o)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '20px', py: '10px', cursor: 'pointer', '&:hover': { background: '#fafafa' } }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: F }}>
            Historial de cambios <Box component="span" sx={{ color: DL.tS, fontWeight: 400 }}>({historial.length})</Box>
          </Typography>
          <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F }}>{abierto ? 'Ocultar' : 'Mostrar'}</Typography>
        </Box>
        {abierto && (
          <Box sx={{ maxHeight: 230, overflowY: 'auto', px: '20px', pb: '14px' }}>
            {historial.map((h, i) => (
              <Box key={h.id} sx={{ display: 'flex', gap: '12px', position: 'relative', pb: i === historial.length - 1 ? 0 : '14px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '4px' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: h.estado ? estadoColor(h.estado) : DL.tH, flexShrink: 0 }} />
                  {i < historial.length - 1 && <Box sx={{ flex: 1, width: '1px', background: DL.border2, mt: '4px' }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: F }}>{h.tipo}{h.id !== 'creado' ? ` · ${h.id}` : ''}</Typography>
                    {h.estado && <EstadoSolicitud estado={h.estado} />}
                    <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>{fmtFechaHora(h.fecha)} · {h.usuario}</Typography>
                  </Box>
                  {h.detalle && <Typography sx={{ fontSize: 11, color: DL.tM, fontFamily: F, mt: '2px' }}>{h.detalle}</Typography>}
                  <ListaCambios cambios={h.cambios} dense />
                  {h.resolucion && (
                    <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F, mt: '4px', fontStyle: 'italic' }}>
                      {h.estado} por {h.resolucion.por} · {fmtFechaHora(h.resolucion.fecha)}{h.resolucion.comentario ? ` — “${h.resolucion.comentario}”` : ''}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Diálogo de envío: resume los cambios y pide el motivo (obligatorio) */}
      <Dialog open={dialogo} onClose={() => setDialogo(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', border: `1px solid ${DL.border}` } } }}>
        <DialogContent sx={{ p: '26px 28px 22px' }}>
          <Typography sx={{ fontFamily: SERIF, fontWeight: 300, fontSize: 26, color: DL.tH, mb: '4px' }}>Enviar solicitud de cambio</Typography>
          <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: F, mb: '14px' }}>
            Pedido {pedido.id}. Quedará pendiente hasta que se apruebe o se rechace.
          </Typography>
          <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', p: '12px 14px', mb: '14px', maxHeight: 200, overflowY: 'auto' }}>
            <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: DL.tS, fontFamily: F }}>Cambios</Typography>
            <ListaCambios cambios={cambios} />
          </Box>
          <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: DL.tS, fontFamily: F, mb: '6px' }}>Motivo del cambio *</Typography>
          <Box component="textarea" value={motivo} rows={3}
            onChange={e => { setMotivo(e.target.value); setErrorMotivo(false); }}
            placeholder="Explica por qué se hace este cambio"
            sx={{ width: '100%', resize: 'vertical', fontFamily: F, fontSize: 12, color: DL.tH, p: '10px 12px', borderRadius: '8px',
              border: `1px solid ${errorMotivo ? DL.red : DL.border2}`, outline: 'none', '&:focus': { borderColor: DL.tH } }} />
          {errorMotivo && <Typography sx={{ fontSize: 10, color: DL.red, fontFamily: F, mt: '4px' }}>El motivo es obligatorio.</Typography>}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', mt: '18px' }}>
            <Box onClick={() => setDialogo(false)} sx={{ px: '16px', py: '8px', borderRadius: '8px', border: `1px solid ${DL.border2}`, cursor: 'pointer', '&:hover': { background: DL.bg } }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tM, fontFamily: F }}>Cancelar</Typography>
            </Box>
            <Box onClick={enviar} sx={{ px: '16px', py: '8px', borderRadius: '8px', border: `1px solid ${DL.tH}`, cursor: 'pointer', '&:hover': { background: DL.bg } }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: F }}>Enviar solicitud</Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
