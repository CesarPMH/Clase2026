// ─── Inicio ─────────────────────────────────────────────────────────────────────
// Resumen de la semana elegida: entregas por día, pendientes y alertas.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { DL } from '../theme';
import { useT } from '../i18n/LanguageContext';
import { PEDIDOS_INICIALES } from '../data/pedidosMock';
import { aplicarOverrides, getSolicitudes } from '../data/solicitudesCambio';
import { EstadoChip } from '../components/common/TablaPedidos';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';

const F = "'Inter', ui-sans-serif, system-ui, sans-serif";
const SERIF = "'Crimson Pro','Cormorant Garamond',Georgia,serif";
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const money = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pad = (n) => String(n).padStart(2, '0');
const isoDia = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hora = (iso) => new Date(iso).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });

function getGreeting(t) {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('greeting.morning');
  if (h >= 12 && h < 20) return t('greeting.afternoon');
  return t('greeting.evening');
}

function resumenPedido(p) {
  const partes = [];
  (p.lineas || []).forEach(l => {
    const txt = l.tipo === 'Catálogo' ? `Catálogo (${l.qty || 1})` : l.tipo === 'Accesorios' ? 'Accesorios' : 'Pastel personalizado';
    if (!partes.includes(txt)) partes.push(txt);
  });
  return partes.join(' · ') || '—';
}

function Tarjeta({ titulo, extra, children, sx }) {
  return (
    <Box sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '18px', py: '13px', borderBottom: `1px solid ${DL.border}` }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F }}>{titulo}</Typography>
        {extra}
      </Box>
      {children}
    </Box>
  );
}

function Enlace({ children, onClick }) {
  return (
    <Typography onClick={onClick} sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, fontFamily: F, cursor: 'pointer', '&:hover': { color: DL.tH, textDecoration: 'underline' } }}>
      {children}
    </Typography>
  );
}

function FilaEntrega({ p, fechaCorta, onClick }) {
  return (
    <Box onClick={onClick} sx={{
      display: 'flex', alignItems: 'center', gap: '14px', px: '18px', py: '11px', cursor: 'pointer',
      borderBottom: `1px dotted ${DL.border2}`, '&:last-child': { borderBottom: 'none' }, '&:hover': { background: '#fafafa' },
    }}>
      <Box sx={{ width: 84, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F, lineHeight: 1.2 }}>{hora(p.entrega)}</Typography>
        {fechaCorta && <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>{fechaCorta}</Typography>}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.cliente?.nombre}</Typography>
        <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.id} · {resumenPedido(p)}
        </Typography>
      </Box>
      <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 11, color: DL.tM, fontFamily: F, mb: '2px' }}>{money(p.total)}</Typography>
        <EstadoChip estado={p.estadoPago} />
      </Box>
    </Box>
  );
}

const MES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIA_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const lunesDe = (offset) => {
  const h = new Date(); h.setHours(0, 0, 0, 0);
  const l = new Date(h); l.setDate(h.getDate() - ((h.getDay() + 6) % 7) + offset * 7);
  return l;
};
const etiquetaSemana = (offset) => {
  const l = lunesDe(offset), d = new Date(l); d.setDate(l.getDate() + 6);
  const r = l.getMonth() === d.getMonth()
    ? `${l.getDate()} – ${d.getDate()} ${MES_CORTO[d.getMonth()]}`
    : `${l.getDate()} ${MES_CORTO[l.getMonth()]} – ${d.getDate()} ${MES_CORTO[d.getMonth()]}`;
  return offset === 0 ? `${r} (esta semana)` : r;
};
const OFFSETS = [-8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2];

export default function Home({ user }) {
  const { t } = useT();
  const navigate = useNavigate();
  const name = user?.name?.split(' ')[0] || '';
  const [offset, setOffset] = useState(0);
  const [diaSel, setDiaSel] = useState(null);   // iso del día elegido (null = hoy o lunes)

  const datos = useMemo(() => {
    let guardados = [];
    try { guardados = JSON.parse(localStorage.getItem('pedidos_nuevos') || '[]'); } catch { /* sin datos guardados */ }
    const todos = aplicarOverrides([...PEDIDOS_INICIALES, ...guardados]);
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const lunes = lunesDe(offset);
    const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
    const finSemana = new Date(domingo); finSemana.setHours(23, 59, 59, 999);

    const confirmados = todos.filter(p => p.estadoPago !== 'Pendiente');
    const cotizados = todos.filter(p => p.estadoPago === 'Pendiente');
    const entreSemana = (p) => { const e = new Date(p.entrega); return e >= lunes && e <= finSemana; };
    const semana = confirmados.filter(entreSemana);
    const hoyISO = isoDia(hoy);
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes); d.setDate(lunes.getDate() + i);
      const iso = isoDia(d);
      return { d, iso, n: semana.filter(p => p.entrega.slice(0, 10) === iso).length, hoy: iso === hoyISO };
    });
    const sel = dias.find(d => d.iso === diaSel) || dias.find(d => d.hoy) || dias[0];
    const delDia = semana.filter(p => p.entrega.slice(0, 10) === sel.iso).sort((a, b) => a.entrega.localeCompare(b.entrega));
    const siguientes = semana.filter(p => p.entrega.slice(0, 10) > sel.iso).sort((a, b) => a.entrega.localeCompare(b.entrega));
    const sinPago = semana.filter(p => p.estadoPago !== 'Pagado');
    const cotSemana = cotizados.filter(entreSemana);
    const pendientesSol = getSolicitudes().filter(s => s.estado === 'Pendiente');
    return { lunes, domingo, semana, sel, delDia, siguientes, dias, sinPago, cotSemana, pendientesSol };
  }, [offset, diaSel]);

  const { semana, sel, delDia, siguientes, dias, sinPago, cotSemana, pendientesSol } = datos;
  const maxDia = Math.max(1, ...dias.map(d => d.n));
  const esHoy = sel.hoy;
  const nombreDia = esHoy ? 'hoy' : `el ${DIA_LARGO[sel.d.getDay()]} ${sel.d.getDate()}`;

  const kpis = [
    { l: 'Pedidos de la semana', v: semana.length, s: `${etiquetaSemana(offset).replace(' (esta semana)', '')}` },
    { l: esHoy ? 'Entregas de hoy' : `Entregas del ${DIA_LARGO[sel.d.getDay()]} ${sel.d.getDate()}`, v: delDia.length, s: delDia.length ? `Primera a las ${hora(delDia[0].entrega)}` : 'Sin entregas ese día' },
    { l: 'Sin pago completo', v: sinPago.length, s: `${money(sinPago.reduce((a, p) => a + (p.total || 0), 0))} en pedidos de la semana` },
    { l: 'Solicitudes pendientes', v: pendientesSol.length, s: pendientesSol.length ? 'Esperan aprobación' : 'Todo al día' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: DL.bg, overflow: 'hidden' }}>
      <PageHeader title="Inicio" live={false} showShare={false}>
        <MiniSelect label="Semana" value={String(offset)} onChange={(v) => { setOffset(Number(v)); setDiaSel(null); }} minWidth={190}
          options={OFFSETS.map(o => ({ value: String(o), label: etiquetaSemana(o) }))} />
      </PageHeader>

      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: '16px', md: '18px 24px 32px' } }}>
        <Typography sx={{ fontFamily: SERIF, fontSize: 28, fontWeight: 300, lineHeight: 1.1, color: DL.tH, mb: '4px' }}>
          {getGreeting(t)}{name ? `, ${name}` : ''}.
        </Typography>
        <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: F, mb: '18px' }}>
          Semana del {etiquetaSemana(offset).replace(' (esta semana)', '')}{offset === 0 ? ' · la semana en curso' : ''}.
        </Typography>

        {/* Indicadores */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: '12px', mb: '16px' }}>
          {kpis.map(k => (
            <Box key={k.l} sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderLeft: `3px solid ${DL.blue}`, borderRadius: '10px', p: '14px 16px' }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: DL.tS, fontFamily: F }}>{k.l}</Typography>
              <Typography sx={{ fontFamily: SERIF, fontSize: 34, fontWeight: 300, color: DL.tH, lineHeight: 1.1, my: '4px' }}>{k.v}</Typography>
              <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F }}>{k.s}</Typography>
            </Box>
          ))}
        </Box>

        {/* Semana */}
        <Tarjeta titulo="Entregas de la semana" extra={<Enlace onClick={() => navigate('/pedidos?vista=calendario')}>Ver calendario</Enlace>} sx={{ mb: '16px' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: '6px', md: '12px' }, p: '16px' }}>
            {dias.map(d => {
              const on = d.iso === sel.iso;
              return (
                <Box key={d.iso} onClick={() => setDiaSel(d.iso)} sx={{
                  borderRadius: '10px', p: { xs: '8px 4px', md: '12px 10px' }, cursor: 'pointer', textAlign: 'center', transition: 'all .14s',
                  border: `1px solid ${on ? DL.tH : DL.border}`, background: on ? DL.tH : '#fff',
                  boxShadow: d.hoy && !on ? `inset 0 0 0 1px ${DL.blue}` : 'none',
                  '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,.08)' },
                }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: F, color: on ? 'rgba(255,255,255,.7)' : DL.tS }}>{DIAS[d.d.getDay()]}{d.hoy ? ' · hoy' : ''}</Typography>
                  <Typography sx={{ fontFamily: SERIF, fontSize: 26, fontWeight: 300, lineHeight: 1.1, color: on ? '#fff' : DL.tH }}>{d.d.getDate()}</Typography>
                  <Box sx={{ height: 4, borderRadius: 2, background: on ? 'rgba(255,255,255,.25)' : '#eee', my: '8px', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${(d.n / maxDia) * 100}%`, background: on ? '#fff' : DL.blue }} />
                  </Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, fontFamily: F, color: on ? '#fff' : DL.tM }}>{d.n} {d.n === 1 ? 'pedido' : 'pedidos'}</Typography>
                </Box>
              );
            })}
          </Box>
        </Tarjeta>

        {/* Día elegido y siguientes */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: '14px', mb: '16px' }}>
          <Tarjeta titulo={`Entregas de ${nombreDia} (${delDia.length})`} extra={<Enlace onClick={() => navigate(`/pedidos/dia/${sel.iso}`)}>Ver el día</Enlace>}>
            {delDia.length === 0
              ? <Typography sx={{ p: '30px 18px', fontSize: 12, color: DL.tS, fontFamily: F, textAlign: 'center' }}>No hay entregas programadas para este día.</Typography>
              : delDia.slice(0, 6).map(p => <FilaEntrega key={p.id} p={p} onClick={() => navigate(`/pedidos/dia/${p.entrega.slice(0, 10)}`)} />)}
            {delDia.length > 6 && <Box sx={{ px: '18px', py: '10px', borderTop: `1px solid ${DL.border}` }}><Enlace onClick={() => navigate(`/pedidos/dia/${sel.iso}`)}>Ver las {delDia.length - 6} entregas restantes</Enlace></Box>}
          </Tarjeta>
          <Tarjeta titulo="Siguientes entregas de la semana" extra={<Enlace onClick={() => navigate('/pedidos?vista=gestion')}>Ver gestión</Enlace>}>
            {siguientes.length === 0
              ? <Typography sx={{ p: '30px 18px', fontSize: 12, color: DL.tS, fontFamily: F, textAlign: 'center' }}>No hay más entregas después de este día.</Typography>
              : siguientes.slice(0, 6).map(p => {
                const e = new Date(p.entrega);
                return <FilaEntrega key={p.id} p={p} fechaCorta={`${DIAS[e.getDay()]} ${e.getDate()}`} onClick={() => navigate(`/pedidos/dia/${p.entrega.slice(0, 10)}`)} />;
              })}
          </Tarjeta>
        </Box>

        {/* Para revisar */}
        <Tarjeta titulo="Para revisar">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            {[
              { n: pendientesSol.length, t: 'Solicitudes de cambio pendientes', s: 'Aprueba o rechaza los cambios pedidos por las sucursales.', to: '/produccion/solicitudes' },
              { n: cotSemana.length, t: 'Cotizaciones sin pago registrado', s: 'No entran a producción hasta que se registre un pago.', to: '/pedidos' },
              { n: sinPago.length, t: 'Pedidos sin pago completo', s: 'Revisa anticipos y cobros pendientes.', to: '/pedidos?vista=gestion' },
            ].map((x, i) => (
              <Box key={x.t} onClick={() => navigate(x.to)} sx={{
                p: '18px 20px', cursor: 'pointer', borderLeft: { md: i ? `1px solid ${DL.border}` : 'none' }, borderTop: { xs: i ? `1px solid ${DL.border}` : 'none', md: 'none' },
                '&:hover': { background: '#fafafa' },
              }}>
                <Typography sx={{ fontFamily: SERIF, fontSize: 30, fontWeight: 300, color: DL.tH, lineHeight: 1 }}>{x.n}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: F, mt: '6px' }}>{x.t}</Typography>
                <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F, mt: '2px' }}>{x.s}</Typography>
              </Box>
            ))}
          </Box>
        </Tarjeta>
      </Box>
    </Box>
  );
}
