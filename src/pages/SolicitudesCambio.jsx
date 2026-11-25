// ─── Solicitudes de Cambios ─────────────────────────────────────────────────────
// Pedidos a los que se les pidió un cambio. Aquí se aprueban o se rechazan.
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Dialog, DialogContent, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { DL } from '../theme';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import { MenuAcciones } from '../components/common/ConfigUI';
import { EstadoSolicitud, ListaCambios, fmtFechaHora } from '../components/common/EdicionPedidoPanel';
import { getSolicitudes, resolverSolicitud } from '../data/solicitudesCambio';

const F = "'Inter', ui-sans-serif, system-ui, sans-serif";
const SERIF = "'Crimson Pro','Cormorant Garamond',Georgia,serif";
const money = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TABS = [
  { id: '', label: 'Todas' },
  { id: 'Pendiente', label: 'Pendientes' },
  { id: 'Aprobada', label: 'Aprobadas' },
  { id: 'Rechazada', label: 'Rechazadas' },
];

const th = { textAlign: 'left', fontFamily: F, fontSize: 11, fontWeight: 500, color: DL.tH, padding: '10px 12px', borderBottom: `1px solid ${DL.tH}`, whiteSpace: 'nowrap', background: 'transparent' };
const td = { fontFamily: F, fontSize: 11, color: DL.tM, padding: '12px', borderBottom: `1px dotted ${DL.border2}`, verticalAlign: 'middle' };

function BtnOutline({ children, onClick, color = DL.tH, disabled }) {
  return (
    <Box onClick={disabled ? undefined : onClick} sx={{
      px: '12px', py: '6px', borderRadius: '7px', border: `1px solid ${color}`, background: '#fff',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, display: 'inline-block',
      '&:hover': disabled ? {} : { background: DL.bg }, transition: 'background .14s',
    }}>
      <Typography sx={{ fontSize: 11, fontWeight: 500, color, fontFamily: F, whiteSpace: 'nowrap' }}>{children}</Typography>
    </Box>
  );
}

export default function SolicitudesCambio() {
  const navigate = useNavigate();
  const [lista, setLista] = useState(() => getSolicitudes());
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [solicitante, setSolicitante] = useState('');
  const [detalle, setDetalle] = useState(null);        // solicitud abierta
  const [accion, setAccion] = useState(null);          // 'Aprobada' | 'Rechazada'
  const [comentario, setComentario] = useState('');
  const [errorCom, setErrorCom] = useState(false);

  const solicitantes = useMemo(() => [...new Set(lista.map(s => s.solicitante))], [lista]);
  const conteo = (e) => lista.filter(s => !e || s.estado === e).length;

  const rows = useMemo(() => lista.filter(s => {
    const q = search.toLowerCase();
    return (!tab || s.estado === tab)
      && (!solicitante || s.solicitante === solicitante)
      && (!q || s.pedidoId.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.cliente.toLowerCase().includes(q));
  }), [lista, tab, search, solicitante]);

  const cerrarAccion = () => { setAccion(null); setComentario(''); setErrorCom(false); };
  const confirmar = () => {
    if (accion === 'Rechazada' && !comentario.trim()) { setErrorCom(true); return; }
    const nueva = resolverSolicitud(detalle.id, accion, 'Administrador', comentario.trim());
    setLista(nueva);
    setDetalle(nueva.find(s => s.id === detalle.id));
    cerrarAccion();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: DL.bg, overflow: 'hidden' }}>
      <PageHeader title="Solicitudes de Cambios" live={false} showShare={false}>
        <MiniSelect label="Solicitante" value={solicitante} onChange={setSolicitante} minWidth={130}
          options={[{ value: '', label: 'Todos' }, ...solicitantes.map(v => ({ value: v, label: v }))]} />
      </PageHeader>

      <Box sx={{ flex: 1, overflowY: 'auto', p: '16px 20px' }}>
        <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, overflow: 'hidden' }}>
          {/* Cabecera de la tarjeta */}
          <Box sx={{ p: '10px 16px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F, mr: 'auto' }}>
              Total de solicitudes: {rows.length}
            </Typography>
            <TextField size="small" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: DL.tS }} /></InputAdornment> } }}
              sx={{ width: 180, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff' } }} />
          </Box>
          {/* Tabs */}
          <Box sx={{ display: 'flex', borderBottom: `1px solid ${DL.border}`, px: '8px', pt: '4px' }}>
            {TABS.map(t => (
              <Box key={t.id} component="button" onClick={() => setTab(t.id)} sx={{
                fontFamily: F, fontSize: 11, fontWeight: 500, px: '14px', py: '8px',
                border: 'none', borderBottom: `2px solid ${tab === t.id ? DL.blue : 'transparent'}`, mb: '-1px',
                background: 'transparent', color: tab === t.id ? DL.navy : DL.tS, cursor: 'pointer', whiteSpace: 'nowrap',
                '&:hover': { color: DL.tM },
              }}>
                {t.label} <Box component="span" sx={{ color: DL.tS, fontWeight: 400 }}>({conteo(t.id)})</Box>
              </Box>
            ))}
          </Box>

          {/* Tabla */}
          <Box sx={{ p: '12px' }}>
            <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr>
                    {['Solicitud', 'Pedido', 'Cliente', 'Solicitante', 'Fecha', 'Cambios', 'Total', 'Estado', 'Acciones'].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(s => (
                    <tr key={s.id} onClick={() => setDetalle(s)} style={{ cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...td, color: DL.tH, fontWeight: 500 }}>{s.id}</td>
                      <td style={{ ...td, color: DL.blue, fontWeight: 500 }}>{s.pedidoId}</td>
                      <td style={{ ...td, color: DL.tH }}>{s.cliente}</td>
                      <td style={td}>{s.solicitante}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmtFechaHora(s.fecha)}</td>
                      <td style={td}>{s.cambios.length} {s.cambios.length === 1 ? 'cambio' : 'cambios'}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <span style={{ color: DL.tS, textDecoration: 'line-through' }}>{money(s.totalAntes)}</span>
                        {' → '}<span style={{ color: DL.tH, fontWeight: 500 }}>{money(s.totalDespues)}</span>
                      </td>
                      <td style={td}><EstadoSolicitud estado={s.estado} /></td>
                      <td style={td} onClick={e => e.stopPropagation()}>
                        <MenuAcciones opciones={[
                          { label: 'Ver detalle', onClick: () => setDetalle(s) },
                          { label: 'Aprobar solicitud', color: DL.green, separadorAntes: true, oculto: s.estado !== 'Pendiente', onClick: () => { setDetalle(s); setAccion('Aprobada'); } },
                          { label: 'Rechazar solicitud', color: DL.red, oculto: s.estado !== 'Pendiente', onClick: () => { setDetalle(s); setAccion('Rechazada'); } },
                        ]} />
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: DL.tS, padding: '36px' }}>No hay solicitudes con estos filtros.</td></tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Detalle de la solicitud */}
      <Dialog open={!!detalle} onClose={() => { setDetalle(null); cerrarAccion(); }} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', border: `1px solid ${DL.border}` } } }}>
        {detalle && (
          <DialogContent sx={{ p: '26px 28px 22px' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
              <Typography sx={{ fontFamily: SERIF, fontWeight: 300, fontSize: 28, color: DL.tH }}>{detalle.id}</Typography>
              <EstadoSolicitud estado={detalle.estado} />
            </Box>
            <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: F, mb: '16px' }}>
              Pedido {detalle.pedidoId} · {detalle.cliente} · solicitado por {detalle.solicitante} el {fmtFechaHora(detalle.fecha)}
            </Typography>

            <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: DL.tS, fontFamily: F }}>Motivo</Typography>
            <Typography sx={{ fontSize: 12, color: DL.tH, fontFamily: F, mb: '14px', mt: '2px' }}>{detalle.motivo}</Typography>

            <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: DL.tS, fontFamily: F }}>Cambios solicitados</Typography>
            <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', p: '10px 14px', mt: '4px', mb: '14px', maxHeight: 220, overflowY: 'auto' }}>
              <ListaCambios cambios={detalle.cambios} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
              <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: F }}>Total del pedido</Typography>
              <Typography sx={{ fontSize: 12, color: DL.tH, fontFamily: F, fontWeight: 500 }}>
                {money(detalle.totalAntes)} → {money(detalle.totalDespues)}
              </Typography>
            </Box>

            {detalle.resolucion && (
              <Typography sx={{ fontSize: 11, color: DL.tM, fontFamily: F, fontStyle: 'italic', mt: '10px' }}>
                {detalle.estado} por {detalle.resolucion.por} · {fmtFechaHora(detalle.resolucion.fecha)}
                {detalle.resolucion.comentario ? ` — “${detalle.resolucion.comentario}”` : ''}
              </Typography>
            )}

            {/* Acción de resolución */}
            {detalle.estado === 'Pendiente' && accion && (
              <Box sx={{ mt: '14px' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: DL.tS, fontFamily: F, mb: '6px' }}>
                  Comentario {accion === 'Rechazada' ? '*' : '(opcional)'}
                </Typography>
                <Box component="textarea" rows={2} value={comentario}
                  onChange={e => { setComentario(e.target.value); setErrorCom(false); }}
                  placeholder={accion === 'Rechazada' ? 'Indica por qué se rechaza' : 'Añade una nota'}
                  sx={{ width: '100%', resize: 'vertical', fontFamily: F, fontSize: 12, color: DL.tH, p: '10px 12px', borderRadius: '8px',
                    border: `1px solid ${errorCom ? DL.red : DL.border2}`, outline: 'none', '&:focus': { borderColor: DL.tH } }} />
                {errorCom && <Typography sx={{ fontSize: 10, color: DL.red, fontFamily: F, mt: '4px' }}>El comentario es obligatorio al rechazar.</Typography>}
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', mt: '20px', flexWrap: 'wrap' }}>
              <BtnOutline color={DL.tM} onClick={() => navigate('/pedidos')}>Ver registro de pedidos</BtnOutline>
              {detalle.estado === 'Pendiente' && !accion && (
                <>
                  <BtnOutline color={DL.red} onClick={() => setAccion('Rechazada')}>Rechazar</BtnOutline>
                  <BtnOutline color={DL.green} onClick={() => setAccion('Aprobada')}>Aprobar</BtnOutline>
                </>
              )}
              {detalle.estado === 'Pendiente' && accion && (
                <>
                  <BtnOutline color={DL.tM} onClick={cerrarAccion}>Cancelar</BtnOutline>
                  <BtnOutline color={accion === 'Aprobada' ? DL.green : DL.red} onClick={confirmar}>
                    Confirmar {accion === 'Aprobada' ? 'aprobación' : 'rechazo'}
                  </BtnOutline>
                </>
              )}
              {detalle.estado !== 'Pendiente' && <BtnOutline onClick={() => setDetalle(null)}>Cerrar</BtnOutline>}
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}
