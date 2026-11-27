// ─── Inicio ─────────────────────────────────────────────────────────────────────
// Pantalla de bienvenida de la aplicación. Muestra el resumen de UNA semana elegida
// (por defecto la actual): cuántos pedidos hay, las entregas de cada día, las
// entregas del día seleccionado y los pendientes que alguien debe revisar
// (solicitudes de cambio, cotizaciones sin pago y pedidos sin pago completo).
// Está pensada para el equipo de la tienda/producción, que la ve al iniciar sesión
// y desde aquí salta a las pantallas de Pedidos y Producción.
// Todos los datos salen de los pedidos (PEDIDOS_INICIALES + los guardados en localStorage).
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { DL } from '../theme';
import { useT } from '../i18n/LanguageContext';
import { PEDIDOS_INICIALES } from '../data/pedidosMock';
import { aplicarOverrides, getSolicitudes } from '../data/solicitudesCambio';
import { EstadoChip } from '../components/common/TablaPedidos';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';

// Fuentes y listas de nombres usadas para escribir fechas en español.
const F = "'Inter', ui-sans-serif, system-ui, sans-serif";
const SERIF = "'Crimson Pro','Cormorant Garamond',Georgia,serif";
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
// Funciones pequeñas de formato: dinero, número con 2 dígitos, fecha ISO (AAAA-MM-DD) y hora.
// La fecha ISO se usa para comparar días sin preocuparnos por la hora.
const money = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pad = (n) => String(n).padStart(2, '0');
const isoDia = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hora = (iso) => new Date(iso).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });

// Objetivo: elegir el saludo según la hora del día.
// Recibe: t (función de traducción). Devuelve: el texto "buenos días/tardes/noches".
function getGreeting(t) {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('greeting.morning');
  if (h >= 12 && h < 20) return t('greeting.afternoon');
  return t('greeting.evening');
}

// Objetivo: describir en una línea qué contiene un pedido (catálogo, accesorios o pastel).
// Recibe: p (pedido). Devuelve: texto como "Catálogo (2) · Accesorios", o "—" si no tiene líneas.
// Se evitan repetidos con includes para que cada tipo salga una sola vez.
function resumenPedido(p) {
  const partes = [];
  (p.lineas || []).forEach(l => {
    const txt = l.tipo === 'Catálogo' ? `Catálogo (${l.qty || 1})` : l.tipo === 'Accesorios' ? 'Accesorios' : 'Pastel personalizado';
    if (!partes.includes(txt)) partes.push(txt);
  });
  return partes.join(' · ') || '—';
}

// Objetivo: contenedor visual reutilizable (caja blanca con título y un extra a la derecha).
// Props: titulo, extra (ej. un enlace), children (contenido), sx (estilos adicionales).
// Devuelve: la tarjeta ya con su encabezado.
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

// Objetivo: texto pequeño clicable que funciona como enlace. Props: children, onClick.
function Enlace({ children, onClick }) {
  return (
    <Typography onClick={onClick} sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, fontFamily: F, cursor: 'pointer', '&:hover': { color: DL.tH, textDecoration: 'underline' } }}>
      {children}
    </Typography>
  );
}

// Objetivo: marco con scroll propio (altura máxima) para listas largas de entregas. Props: children.
function ListaConBorde({ children }) {
  return (
    <Box sx={{ m: '12px', border: `1px solid ${DL.border}`, borderRadius: '8px', maxHeight: 462, overflowY: 'auto' }}>
      {children}
    </Box>
  );
}

// Objetivo: mostrar una entrega en una fila (hora, cliente, número de pedido, total y estado de pago).
// Props: p (pedido), fechaCorta (opcional, se usa en "siguientes entregas" para saber qué día es), onClick.
// En pantallas pequeñas se oculta la columna de total/estado para que no se desborde.
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

// Nombres cortos/largos para las etiquetas de la semana y los textos de los KPI.
const MES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIA_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Objetivo: calcular el lunes de la semana actual, desplazada "offset" semanas.
// Por qué: getDay() devuelve 0 para domingo, entonces (getDay()+6)%7 convierte la semana
// para que empiece en lunes (lunes=0 ... domingo=6) y se retrocede esa cantidad de días.
// offset=0 es esta semana, -1 la anterior, 1 la siguiente. Se pone la hora en 0 para comparar solo fechas.
const lunesDe = (offset) => {
  const h = new Date(); h.setHours(0, 0, 0, 0);
  const l = new Date(h); l.setDate(h.getDate() - ((h.getDay() + 6) % 7) + offset * 7);
  return l;
};
// Objetivo: texto del selector, por ejemplo "10 – 16 nov" o "28 oct – 3 nov" si cruza de mes.
// Recibe: offset de semana. Devuelve: el rango y "(esta semana)" cuando offset es 0.
const etiquetaSemana = (offset) => {
  const l = lunesDe(offset), d = new Date(l); d.setDate(l.getDate() + 6);
  const r = l.getMonth() === d.getMonth()
    ? `${l.getDate()} – ${d.getDate()} ${MES_CORTO[d.getMonth()]}`
    : `${l.getDate()} ${MES_CORTO[l.getMonth()]} – ${d.getDate()} ${MES_CORTO[d.getMonth()]}`;
  return offset === 0 ? `${r} (esta semana)` : r;
};
// Semanas que se pueden elegir en el selector: 8 hacia atrás, la actual y 2 hacia adelante.
const OFFSETS = [-8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2];

// Objetivo: página de Inicio.
// Props: user (usuario con sesión, de ahí sale el primer nombre para el saludo).
// Devuelve: encabezado con selector de semana, KPI, tira de 7 días y listas de entregas.
export default function Home({ user }) {
  const { t } = useT();
  const navigate = useNavigate();
  const name = user?.name?.split(' ')[0] || '';
  const [offset, setOffset] = useState(0);
  const [diaSel, setDiaSel] = useState(null);   // iso del día elegido (null = hoy o lunes)

  // Por qué useMemo: este cálculo recorre todos los pedidos y arma la semana completa;
  // solo se rehace cuando cambia la semana (offset) o el día elegido, no en cada render.
  // Orden: 1) juntar pedidos (mock + guardados + cambios aprobados), 2) definir los límites de la semana,
  // 3) separar confirmados de cotizaciones, 4) armar los 7 días, 5) derivar las listas que muestra la pantalla.
  const datos = useMemo(() => {
    // Los pedidos nuevos se guardan en localStorage; el try/catch evita que un JSON dañado rompa la pantalla.
    let guardados = [];
    try { guardados = JSON.parse(localStorage.getItem('pedidos_nuevos') || '[]'); } catch { /* sin datos guardados */ }
    const todos = aplicarOverrides([...PEDIDOS_INICIALES, ...guardados]);
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const lunes = lunesDe(offset);
    const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
    // finSemana llega a las 23:59:59 del domingo para que las entregas de ese último día cuenten dentro de la semana.
    const finSemana = new Date(domingo); finSemana.setHours(23, 59, 59, 999);

    // Un pedido "Pendiente" de pago es solo una cotización: no entra a producción, por eso se separa de los confirmados.
    const confirmados = todos.filter(p => p.estadoPago !== 'Pendiente');
    const cotizados = todos.filter(p => p.estadoPago === 'Pendiente');
    const entreSemana = (p) => { const e = new Date(p.entrega); return e >= lunes && e <= finSemana; };
    const semana = confirmados.filter(entreSemana);
    const hoyISO = isoDia(hoy);
    // Se arman siempre 7 días (lunes a domingo) con su cantidad de pedidos, aunque estén en 0,
    // para que la tira de la semana mantenga siempre la misma forma. "hoy" marca el día actual.
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes); d.setDate(lunes.getDate() + i);
      const iso = isoDia(d);
      return { d, iso, n: semana.filter(p => p.entrega.slice(0, 10) === iso).length, hoy: iso === hoyISO };
    });
    // Día seleccionado: el que el usuario tocó; si no hay, hoy (si cae en esta semana); si tampoco, el lunes.
    // Así siempre hay un día válido y nunca queda la sección vacía.
    const sel = dias.find(d => d.iso === diaSel) || dias.find(d => d.hoy) || dias[0];
    const delDia = semana.filter(p => p.entrega.slice(0, 10) === sel.iso).sort((a, b) => a.entrega.localeCompare(b.entrega));
    const siguientes = semana.filter(p => p.entrega.slice(0, 10) > sel.iso).sort((a, b) => a.entrega.localeCompare(b.entrega));
    // Pedidos de la semana con pago incompleto (anticipo o pendiente): son los que hay que cobrar.
    const sinPago = semana.filter(p => p.estadoPago !== 'Pagado');
    const cotSemana = cotizados.filter(entreSemana);
    const pendientesSol = getSolicitudes().filter(s => s.estado === 'Pendiente');
    return { lunes, domingo, semana, sel, delDia, siguientes, dias, sinPago, cotSemana, pendientesSol };
  }, [offset, diaSel]);

  const { semana, sel, delDia, siguientes, dias, sinPago, cotSemana, pendientesSol } = datos;
  // Se usa como 100 % de la barrita de cada día; el mínimo 1 evita dividir entre 0 cuando no hay pedidos.
  const maxDia = Math.max(1, ...dias.map(d => d.n));
  const esHoy = sel.hoy;
  const nombreDia = esHoy ? 'hoy' : `el ${DIA_LARGO[sel.d.getDay()]} ${sel.d.getDate()}`;

  // Los 4 indicadores de arriba. l = etiqueta, v = valor grande, s = texto de apoyo debajo.
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

      {/* Zona con scroll propio: el encabezado queda fijo arriba y solo el contenido se desplaza. */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: '16px', md: '18px 24px 32px' } }}>
        <Typography sx={{ fontFamily: SERIF, fontSize: 28, fontWeight: 300, lineHeight: 1.1, color: DL.tH, mb: '4px' }}>
          {getGreeting(t)}{name ? `, ${name}` : ''}.
        </Typography>
        <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: F, mb: '18px' }}>
          Semana del {etiquetaSemana(offset).replace(' (esta semana)', '')}{offset === 0 ? ' · la semana en curso' : ''}.
        </Typography>

        {/* Indicadores */}
        {/* Indicadores: 2 por fila en celular y 4 en pantallas grandes. */}
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
            {/* Una casilla por día; al tocarla se cambia diaSel y las listas de abajo se actualizan. La barra azul es proporcional al día con más pedidos. */}
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
              : <ListaConBorde>{delDia.map(p => <FilaEntrega key={p.id} p={p} onClick={() => navigate(`/pedidos/dia/${p.entrega.slice(0, 10)}`)} />)}</ListaConBorde>}
          </Tarjeta>
          <Tarjeta titulo="Siguientes entregas de la semana" extra={<Enlace onClick={() => navigate('/pedidos?vista=gestion')}>Ver gestión</Enlace>}>
            {siguientes.length === 0
              ? <Typography sx={{ p: '30px 18px', fontSize: 12, color: DL.tS, fontFamily: F, textAlign: 'center' }}>No hay más entregas después de este día.</Typography>
              : <ListaConBorde>{siguientes.map(p => {
                const e = new Date(p.entrega);
                return <FilaEntrega key={p.id} p={p} fechaCorta={`${DIAS[e.getDay()]} ${e.getDate()}`} onClick={() => navigate(`/pedidos/dia/${p.entrega.slice(0, 10)}`)} />;
              })}</ListaConBorde>}
          </Tarjeta>
        </Box>

        {/* Para revisar */}
        {/* Accesos directos a los pendientes; cada uno lleva a la pantalla donde se resuelve. */}
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
