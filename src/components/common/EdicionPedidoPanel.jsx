// Panel superior del modo "editar pedido": historial de cambios + envío de solicitud
import { useState, useEffect } from 'react';
import { Box, Typography, Dialog, DialogContent } from '@mui/material';
import { DL } from '../../theme';

const F = "'Inter', ui-sans-serif, system-ui, sans-serif";
const SERIF = "'Crimson Pro','Cormorant Garamond',Georgia,serif";

export const fmtFechaHora = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
};

export const estadoColor = (estado) =>
  estado === 'Aprobada' ? DL.green : estado === 'Rechazada' ? DL.red : DL.yellow;

export function EstadoSolicitud({ estado }) {
  const c = estadoColor(estado);
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: c, fontFamily: F }}>{estado}</Typography>
    </Box>
  );
}

export function ListaCambios({ cambios, dense }) {
  if (!cambios?.length) return null;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: dense ? '2px' : '4px', mt: '4px' }}>
      {cambios.map((c, i) => (
        <Typography key={i} sx={{ fontSize: 11, color: DL.tM, fontFamily: F, lineHeight: 1.45 }}>
          <Box component="span" sx={{ fontWeight: 500, color: DL.tH }}>{c.campo}:</Box>{' '}
          <Box component="span" sx={{ color: DL.tS, textDecoration: c.antes && c.antes !== '—' ? 'line-through' : 'none' }}>{c.antes}</Box>
          {' → '}
          <Box component="span" sx={{ color: DL.tH }}>{c.despues}</Box>
        </Typography>
      ))}
    </Box>
  );
}

export default function EdicionPedidoPanel({ pedido, historial, cambios, onEnviar, openSignal }) {
  const [abierto, setAbierto] = useState(true);
  const [dialogo, setDialogo] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [errorMotivo, setErrorMotivo] = useState(false);
  const n = cambios.length;
  useEffect(() => { if (openSignal && n) setDialogo(true); }, [openSignal]); // eslint-disable-line

  const enviar = () => {
    if (!motivo.trim()) { setErrorMotivo(true); return; }
    onEnviar(motivo.trim());
    setDialogo(false); setMotivo('');
  };

  return (
    <Box sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '12px', mb: '20px', overflow: 'hidden' }}>
      {/* Cabecera */}
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

      {/* Historial */}
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

      {/* Diálogo de envío */}
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
