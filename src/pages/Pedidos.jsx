// ─── Pedidos ────────────────────────────────────────────────────────────────────
// Qué hace: pantalla principal de pedidos. Según el parámetro de la URL "?vista="
// muestra una de tres vistas:
//   - cotizados  (por defecto): "Registro de Pedidos", solo cotizaciones.
//   - gestion: "Gestión de Pedidos", resumen y tabla de la semana actual.
//   - calendario: "Calendario de Pedidos", con conteo de pedidos por día.
// De dónde salen los datos: PEDIDOS_INICIALES (pedidosMock) + los pedidos nuevos
// guardados en localStorage ('pedidos_nuevos'), con los cambios aprobados de
// solicitudes de cambio aplicados encima (aplicarOverrides).
// Quién lo usa: App.jsx la monta en la ruta '/pedidos'; el Sidebar (y Home) eligen
// la vista con "?vista=". Desde el calendario se navega a PedidosDia.jsx.
//
// Concepto clave: una COTIZACIÓN es un pedido con estadoPago 'Pendiente'; todavía
// no tiene pago registrado y por eso no se produce. Al registrarse el pago pasa a
// ser un pedido CONFIRMADO y recién ahí aparece en la gestión y el calendario.
import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, TextField, InputAdornment,
  IconButton, Tooltip, Popper, Paper, Fade,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon,
  Download as DownloadIcon, TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon, InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { DL } from '../theme';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import { PEDIDOS_INICIALES } from '../data/pedidosMock';
import { aplicarOverrides } from '../data/solicitudesCambio';
import TablaPedidos, { ColsButton, DEFAULT_COLS_VISIBLES } from '../components/common/TablaPedidos';

const F = "'Inter', ui-sans-serif, system-ui, sans-serif";

// ─── helper: detectar tipos de orden en un pedido ────────────────────────────
// OBJETIVO: saber si un pedido tiene al menos una línea del tipo de orden elegido
// en el filtro. Recibe el pedido y el filtro ('' = sin filtro); devuelve true/false.
// "Personalizado" del filtro equivale al tipo 'Pastel Personalizado' de las líneas.
function pedidoTieneOrden(p, tipoOrden) {
  if (!tipoOrden) return true;
  const tipos = (p.lineas || []).map(l => l.tipo);
  if (tipoOrden === 'Catálogo')      return tipos.includes('Catálogo');
  if (tipoOrden === 'Accesorios')    return tipos.includes('Accesorios');
  if (tipoOrden === 'Personalizado') return tipos.includes('Pastel Personalizado');
  return true;
}

// ─── Controles filtro ─────────────────────────────────────────────────────────
// OBJETIVO: barra con los filtros (tipo pedido, orden, pago, vendedor, cliente),
// descarga, buscador y botón de pedido nuevo. Recibe cada valor de filtro con su
// función "on..." para cambiarlo; no guarda estado propio. Devuelve la barra.
// Nota: actualmente la página muestra estos filtros en el PageHeader, así que
// este componente queda como alternativa sin uso.
function Controles({ search, onSearch, vendedor, onVendedor, tipoCliente, onTipo, vendedores,
  tipoPedido, onTipoPedido, tipoOrden, onTipoOrden, estadoPago, onEstadoPago, estadosPago,
  onNuevo, showDownload }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <MiniSelect label="Tipo pedido" value={tipoPedido} onChange={onTipoPedido} minWidth={110} options={[
        { value: '', label: 'Todos' },
        { value: 'Reserva', label: 'Reserva' },
        { value: 'Producción', label: 'Producción' },
      ]} />
      <MiniSelect label="Tipo orden" value={tipoOrden} onChange={onTipoOrden} minWidth={120} options={[
        { value: '', label: 'Todos' },
        { value: 'Catálogo', label: 'Catálogo' },
        { value: 'Accesorios', label: 'Accesorios' },
        { value: 'Personalizado', label: 'Personalizado' },
      ]} />
      <MiniSelect label="Estado pago" value={estadoPago} onChange={onEstadoPago} minWidth={120} options={[
        { value: '', label: 'Todos' },
        ...(estadosPago || []).map(e => ({ value: e, label: e })),
      ]} />
      <MiniSelect label="Vendedor" value={vendedor} onChange={onVendedor} minWidth={110} options={[
        { value: '', label: 'Todos' },
        ...vendedores.map(v => ({ value: v, label: v })),
      ]} />
      <MiniSelect label="Cliente" value={tipoCliente} onChange={onTipo} minWidth={100} options={[
        { value: '', label: 'Todos' },
        { value: 'Natural', label: 'Natural' },
        { value: 'Jurídico', label: 'Jurídico' },
      ]} />
      <Tooltip title="Descargar Excel" arrow>
        <IconButton size="small" sx={{ border: `1px solid ${DL.border2}`, borderRadius: '7px', p: '5px', color: DL.tM, background: '#fff' }}>
          <DownloadIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
      <TextField size="small" placeholder="Buscar..." value={search} onChange={e => onSearch(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: DL.tS }} /></InputAdornment> } }}
        sx={{ width: 160, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff' } }} />
      <Tooltip title="Pedido nuevo" arrow>
        <IconButton onClick={onNuevo} aria-label="Pedido nuevo" sx={{ width: 34, height: 34, borderRadius: '8px', border: '1px solid #1a1a1a', background: '#fff', color: '#1a1a1a', '&:hover': { background: '#f6f6f6' } }}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// ─── Vista Cotizados ──────────────────────────────────────────────────────────
// OBJETIVO: listar las cotizaciones (pedidos sin pago registrado) de un mes y año.
// Recibe todos los pedidos, los valores de filtro elegidos en el encabezado y
// las funciones para editar o crear un pedido. Devuelve la tarjeta con la tabla.
function VistaCotizados({ pedidos, onEdit, onNuevo, mesSeleccionado, anioSeleccionado,
  search, onSearch, vendedor, onVendedor, tipo, onTipo,
  tipoPedido, onTipoPedido, tipoOrden, onTipoOrden, estadoPago, onEstadoPago,
  vendedores, estadosPago }) {
  const [colsVisibles, setColsVisibles] = useState(DEFAULT_COLS_VISIBLES);
  // Primer filtro: mes y año de REGISTRO del pedido (cuándo se cotizó, no cuándo
  // se entrega). Si falta mes o año, ese criterio no filtra.
  const pedidosMes = useMemo(() => {
    const m = mesSeleccionado ? Number(mesSeleccionado) : null;
    const a = anioSeleccionado ? Number(anioSeleccionado) : null;
    return pedidos.filter(p => {
      const d = new Date(p.registro || p.entrega || '');
      return (!m || d.getMonth() + 1 === m) && (!a || d.getFullYear() === a);
    });
  }, [pedidos, mesSeleccionado, anioSeleccionado]);

  // Cotizados = estadoPago 'Pendiente'. Los que ya tienen pago son pedidos confirmados
  // y se ven en las vistas de gestión y calendario.
  const cotizados = pedidosMes.filter(p => p.estadoPago === 'Pendiente');

  // Segundo filtro: búsqueda por cliente o id, más los selectores del encabezado
  const rows = useMemo(() => cotizados.filter(p => {
    const q = (search || '').toLowerCase();
    return (!q || p.cliente.nombre.toLowerCase().includes(q) || String(p.id).includes(q))
      && (!vendedor   || p.vendedor === vendedor)
      && (!tipo       || p.tipoCliente === tipo)
      && (!tipoPedido || p.tipoPedido === tipoPedido)
      && (!estadoPago || p.estadoPago === estadoPago)
      && pedidoTieneOrden(p, tipoOrden);
  }), [cotizados, search, vendedor, tipo, tipoPedido, tipoOrden, estadoPago]);

  return (
    <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, boxShadow: DL.e2, overflow: 'hidden' }}>
      <Box sx={{ p: '10px 16px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F, mr: 'auto' }}>Total Pedidos Cotizados: {rows.length}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tooltip title="Descargar Excel" arrow>
            <IconButton size="small" sx={{ border: `1px solid ${DL.border2}`, borderRadius: '8px', p: '7px', color: DL.tM, background: '#fff' }}>
              <DownloadIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <TextField size="small" placeholder="Buscar..." value={search} onChange={e => onSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: DL.tS }} /></InputAdornment> } }}
            sx={{ width: 160, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff' } }} />
          <Tooltip title="Pedido nuevo" arrow>
        <IconButton onClick={onNuevo} aria-label="Pedido nuevo" sx={{ width: 34, height: 34, borderRadius: '8px', border: '1px solid #1a1a1a', background: '#fff', color: '#1a1a1a', '&:hover': { background: '#f6f6f6' } }}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
          <ColsButton colsVisibles={colsVisibles} onChange={setColsVisibles} />
        </Box>
      </Box>
      <Box sx={{ p: '12px' }}>
        <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          <TablaPedidos pedidos={rows} onEdit={onEdit} colsVisibles={colsVisibles} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── Vista Gestión ────────────────────────────────────────────────────────────
// OBJETIVO: dar al equipo un resumen de la semana en curso (lunes a domingo):
// cuántos pedidos son reserva o producción, cuántos están confirmados y cuántos
// siguen cotizados, más la tabla con el detalle. Recibe los pedidos y los filtros;
// devuelve las tarjetas de resumen y la tabla.
function VistaGestion({ pedidos, onNuevo, onEdit,
  search, onSearch, vendedor, tipo, tipoPedido, tipoOrden, estadoPago }) {
  const [colsVisibles, setColsVisibles] = useState(DEFAULT_COLS_VISIBLES);

  // Pedidos cuya fecha de entrega cae en la semana actual. La semana empieza en
  // lunes: getDay() devuelve 0 para domingo, por eso se usa (día + 6) % 7 para
  // saber cuántos días retroceder hasta el lunes.
  const pedidosSemana = useMemo(() => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    lunes.setHours(0, 0, 0, 0);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);
    return pedidos.filter(p => {
      const d = new Date(p.entrega || p.registro || p.fecha || '');
      return d >= lunes && d <= domingo;
    });
  }, [pedidos]);

  // Confirmados (con pago registrado) frente a cotizados (pago 'Pendiente'): son los
  // números de las dos últimas tarjetas de resumen.
  const confirmados = pedidosSemana.filter(p => p.estadoPago !== 'Pendiente');
  const cotizados   = pedidosSemana.filter(p => p.estadoPago === 'Pendiente');
  const reservas    = pedidosSemana.filter(p => p.tipoPedido === 'Reserva').length;
  const produccion  = pedidosSemana.filter(p => p.tipoPedido === 'Producción').length;

  // Filas de la tabla: pedidos de la semana (confirmados y cotizados) filtrados por
  // búsqueda y selectores del encabezado
  const rows = useMemo(() => pedidosSemana.filter(p => {
    const q = (search || '').toLowerCase();
    return (!q || p.cliente.nombre.toLowerCase().includes(q) || String(p.id).includes(q))
      && (!vendedor   || p.vendedor === vendedor)
      && (!tipo       || p.tipoCliente === tipo)
      && (!tipoPedido || p.tipoPedido === tipoPedido)
      && (!estadoPago || p.estadoPago === estadoPago)
      && pedidoTieneOrden(p, tipoOrden);
  }), [pedidosSemana, search, vendedor, tipo, tipoPedido, tipoOrden, estadoPago]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Tarjetas de resumen (KPIs) de la semana: reserva, producción, confirmados, cotizados */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke={DL.navy} strokeWidth="2"/><path d="M3 9h18" stroke={DL.navy} strokeWidth="2"/><path d="M9 21V9" stroke={DL.navy} strokeWidth="2"/></svg>, label: 'Reserva', value: reservas },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke={DL.navy} strokeWidth="2"/><path d="M8 7V5a2 2 0 0 1 4 0v2" stroke={DL.navy} strokeWidth="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2" stroke={DL.navy} strokeWidth="2"/></svg>, label: 'Producción', value: produccion },
          { icon: <TrendingUpIcon sx={{ fontSize: 16, color: DL.navy }} />, label: 'Total de Pedidos de la Semana', value: confirmados.length },
          { icon: <ShieldIcon sx={{ fontSize: 16, color: DL.navy }} />,    label: 'Total de Pedidos Cotizados',   value: cotizados.length },
        ].map(k => (
          <Box key={k.label} sx={{ background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1, p: '18px 22px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '10px' }}>
              <Box sx={{ color: DL.navy, display:'flex', alignItems:'center' }}>{k.icon}</Box>
              <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>
                {k.label}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 32, fontWeight: 500, color: DL.tH, letterSpacing: '-0.04em', fontFamily: F }}>
              {k.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, boxShadow: DL.e2, overflow: 'hidden' }}>
        <Box sx={{ p: '12px 16px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Stats: total de la semana y desglose por tipo de cliente (se calcula en una función que se ejecuta al instante) */}
          {(() => {
            const natural  = pedidosSemana.filter(p => p.tipoCliente === 'Natural').length;
            const juridico = pedidosSemana.filter(p => p.tipoCliente === 'Jurídico').length;
            return (
              <>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F, whiteSpace: 'nowrap' }}>
                  Pedidos totales: {pedidosSemana.length}
                </Typography>
                <Box sx={{ px: '10px', py: '3px', borderRadius: '5px', background: 'rgba(3,105,161,.12)', flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#515151', fontFamily: F }}>Natural: {natural}</Typography>
                </Box>
                <Box sx={{ px: '10px', py: '3px', borderRadius: '5px', background: 'rgba(13,148,136,.12)', flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#0d9488', fontFamily: F }}>Jurídico: {juridico}</Typography>
                </Box>
              </>
            );
          })()}
          <Box sx={{ flex: 1 }} />
          {/* Descargar | Buscador | Nuevo Pedido */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tooltip title="Descargar Excel" arrow>
              <IconButton size="small" sx={{ border: `1px solid ${DL.border2}`, borderRadius: '8px', p: '7px', color: DL.tM, background: '#fff' }}>
                <DownloadIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <TextField size="small" placeholder="Buscar..." value={search} onChange={e => onSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: DL.tS }} /></InputAdornment> } }}
              sx={{ width: 160, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff' } }} />
            <Tooltip title="Pedido nuevo" arrow>
        <IconButton onClick={onNuevo} aria-label="Pedido nuevo" sx={{ width: 34, height: 34, borderRadius: '8px', border: '1px solid #1a1a1a', background: '#fff', color: '#1a1a1a', '&:hover': { background: '#f6f6f6' } }}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
            <ColsButton colsVisibles={colsVisibles} onChange={setColsVisibles} />
          </Box>
        </Box>
        <Box sx={{ p: '12px' }}>
          <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden' }}>
            <TablaPedidos pedidos={rows} onEdit={onEdit} colsVisibles={colsVisibles} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Calendario mensual ───────────────────────────────────────────────────────
// Etiquetas de columnas (la semana del calendario empieza en domingo) y nombres de meses
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// OBJETIVO: dibujar el calendario de un mes donde cada día muestra cuántos pedidos
// confirmados se entregan, separados por tipo de cliente (N/J) y de pedido (R/P).
// Recibe: pedidos (ya filtrados), mesRef (fecha dentro del mes a mostrar),
// semanaActiva (índice de semana a resaltar, o null para todas), onDiaClick(iso)
// (se ejecuta al pulsar un día del mes) y diaSeleccionado (iso resaltado).
function CalendarioMensual({ pedidos, mesRef, semanaActiva, onDiaClick, diaSeleccionado }) {
  const year  = mesRef.getFullYear();
  const month = mesRef.getMonth();

  // Build weeks for the month
  // Arma la cuadrícula: lista de semanas (cada una con 7 fechas, domingo a sábado).
  // Empieza en el domingo anterior al día 1 y termina al completar la última
  // semana, por eso se incluyen días de los meses vecinos (se ven atenuados).
  const weeks = useMemo(() => {
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const rows = [];
    let current = new Date(primerDia);
    current.setDate(current.getDate() - current.getDay()); // start on Sunday
    while (current <= ultimoDia || current.getDay() !== 0) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      rows.push(week);
      if (current > ultimoDia && current.getDay() === 0) break;
    }
    return rows;
  }, [year, month]);

  // Pedidos por día
  // Agrupa por fecha de entrega ('AAAA-MM-DD') y cuenta totales por tipo de cliente
  // y de pedido. Se excluyen las cotizaciones (estadoPago 'Pendiente'): sin pago no
  // hay producción, así que no deben ocupar un día del calendario.
  const pedidosPorDia = useMemo(() => {
    const map = {};
    pedidos.filter(p => p.estadoPago !== 'Pendiente').forEach(p => {
      const key = p.entrega.split('T')[0];
      if (!map[key]) map[key] = { total: 0, natural: 0, juridico: 0, reserva: 0, produccion: 0 };
      map[key].total++;
      if (p.tipoCliente === 'Natural') map[key].natural++;
      else map[key].juridico++;
      if (p.tipoPedido === 'Reserva') map[key].reserva++;
      else map[key].produccion++;
    });
    return map;
  }, [pedidos]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <Box sx={{ p: '12px' }}>
      <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header de días */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${DL.border}` }}>
        {DIAS.map(d => (
          <Box key={d} sx={{ py: '10px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F }}>
              {d}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Semanas */}
      {weeks.map((week, wi) => {
        // Si se eligió una semana, las demás se atenúan para enfocar la vista
        const isActiveWeek = semanaActiva === null || semanaActiva === wi;
        return (
          <Box key={wi} sx={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: wi < weeks.length - 1 ? `1px solid ${DL.border}` : 'none',
            opacity: isActiveWeek ? 1 : 0.35,
            transition: 'opacity .2s',
          }}>
            {week.map((dia, di) => {
              const iso = dia.toISOString().split('T')[0];
              const inMes = dia.getMonth() === month;
              const isToday = iso === today;
              const isSel = iso === diaSeleccionado;
              const info = pedidosPorDia[iso];
              return (
                // Solo los días del mes actual son clicables (los de relleno no)
                <Box key={di} onClick={() => inMes && onDiaClick(iso)} sx={{
                  minHeight: 84, p: '8px 10px',
                  borderRight: di < 6 ? `1px solid ${DL.border}` : 'none',
                  background: isSel ? 'rgba(84,126,105,.06)' : isToday ? 'rgba(84,126,105,.03)' : inMes ? '#fff' : '#fafbfe',
                  cursor: inMes ? 'pointer' : 'default',
                  transition: 'background .12s',
                  '&:hover': inMes ? { background: 'rgba(84,126,105,.05)' } : {},
                  position: 'relative',
                }}>
                  {/* Número de día */}
                  <Box sx={{
                    width: 22, height: 22, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isToday ? DL.blue : isSel ? DL.navy : 'transparent',
                    mb: '6px',
                  }}>
                    <Typography sx={{
                      fontSize: 11, fontWeight: isToday || isSel ? 500 : inMes ? 500 : 400,
                      color: isToday || isSel ? '#fff' : inMes ? DL.tH : DL.tS,
                      fontFamily: F, lineHeight: 1,
                    }}>
                      {dia.getDate()}
                    </Typography>
                  </Box>

                  {/* Indicadores de pedidos */}
                  {info && inMes && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: DL.blue, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, fontFamily: F }}>
                          {info.total} pedido{info.total !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {/* Fila 1: tipo de cliente */}
                        {(info.natural > 0 || info.juridico > 0) && (
                          <Box sx={{ display: 'flex', gap: '4px' }}>
                            {info.natural > 0 && (
                              <Box sx={{ px: '5px', py: '1px', borderRadius: '10px', background: '#f6f6f6', border: '1px solid #dbdbdb' }}>
                                <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#515151', fontFamily: F }}>N: {info.natural}</Typography>
                              </Box>
                            )}
                            {info.juridico > 0 && (
                              <Box sx={{ px: '5px', py: '1px', borderRadius: '10px', background: '#f0fdfa', border: '1px solid #99f6e4' }}>
                                <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#0d9488', fontFamily: F }}>J: {info.juridico}</Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                        {/* Fila 2: tipo de pedido */}
                        {(info.reserva > 0 || info.produccion > 0) && (
                          <Box sx={{ display: 'flex', gap: '4px' }}>
                            {info.reserva > 0 && (
                              <Box sx={{ px: '5px', py: '1px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#15803d', fontFamily: F }}>R: {info.reserva}</Typography>
                              </Box>
                            )}
                            {info.produccion > 0 && (
                              <Box sx={{ px: '5px', py: '1px', borderRadius: '10px', background: 'rgba(84,126,105,.08)', border: '1px solid rgba(84,126,105,.2)' }}>
                                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.blue, fontFamily: F }}>P: {info.produccion}</Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        );
      })}
      </Box>
    </Box>
  );
}

// ─── (DetalleDia moved to /pages/PedidosDia.jsx) ─────────────────────────────

// Versión antigua del detalle de un día (panel debajo del calendario). Se reemplazó
// por la página PedidosDia.jsx y ya no se usa en esta pantalla; se conserva como
// referencia. Recibe iso (fecha), pedidos, onClose y onEdit.
function DetalleDia({ iso, pedidos, onClose, onEdit }) {
  const [search, setSearch]   = useState('');
  const [vendedor, setVend]   = useState('');
  const [estado, setEstado]   = useState('');
  const [tipo, setTipo]       = useState('');

  const d = new Date(iso + 'T12:00:00');
  const titulo = `${DIAS_LARGO[d.getDay()]} ${d.getDate()} de ${MESES_LARGO[d.getMonth()]}`;

  const todos = pedidos.filter(p => p.entrega.startsWith(iso) && p.estadoPago !== 'Pendiente');
  const natural  = todos.filter(p => p.tipoCliente === 'Natural').length;
  const juridico = todos.filter(p => p.tipoCliente === 'Jurídico').length;

  const vendedores = [...new Set(todos.map(p => p.vendedor))];
  const estados    = [...new Set(todos.map(p => p.estadoPago))];

  const rows = useMemo(() => todos.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.cliente.nombre.toLowerCase().includes(q) || p.id.includes(q))
      && (!vendedor || p.vendedor === vendedor)
      && (!estado   || p.estadoPago === estado)
      && (!tipo     || p.tipoCliente === tipo);
  }), [todos, search, vendedor, estado, tipo]);

  return (
    <Box sx={{ borderTop: `2px solid ${DL.border}`, background: DL.bg }}>
      {/* Cabecera */}
      <Box sx={{ px: '20px', pt: '18px', pb: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 500, color: DL.tH, fontFamily: F }}>{titulo}</Typography>
          <Box sx={{ display: 'flex', gap: '8px', mt: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.blue, fontFamily: F }}>
              Órdenes totales: {todos.length}
            </Typography>
            <Box sx={{ px: '10px', py: '3px', borderRadius: '4px', background: '#f6f6f6', border: '1px solid #dbdbdb' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#515151', fontFamily: F }}>Natural: {natural}</Typography>
            </Box>
            <Box sx={{ px: '10px', py: '3px', borderRadius: '4px', background: '#f0fdfa', border: '1px solid #99f6e4' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#0d9488', fontFamily: F }}>Jurídico: {juridico}</Typography>
            </Box>
          </Box>
        </Box>
        <Box onClick={onClose} sx={{
          display: 'flex', alignItems: 'center', gap: '5px', px: '12px', py: '7px',
          borderRadius: '8px', border: `1px solid ${DL.border2}`, background: '#fff',
          cursor: 'pointer', '&:hover': { background: DL.bg },
        }}>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, fontFamily: F }}>Cerrar</Typography>
        </Box>
      </Box>

      {/* Tarjeta con filtros + tabla */}
      <Box sx={{ mx: '12px', mb: '12px', background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, boxShadow: DL.e2, overflow: 'hidden' }}>
        {/* Filtros */}
        <Box sx={{ px: '16px', py: '12px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: DL.tS }} /></InputAdornment> } }}
            sx={{ width: 180, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff' } }} />
          <FormControl size="small">
            <Select value={estado} onChange={e => setEstado(e.target.value)} displayEmpty
              sx={{ fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff', minWidth: 140 }}>
              <MenuItem value="" sx={{ fontSize: 11 }}>Todos los Estados</MenuItem>
              {estados.map(v => <MenuItem key={v} value={v} sx={{ fontSize: 11 }}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <Select value={vendedor} onChange={e => setVend(e.target.value)} displayEmpty
              sx={{ fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff', minWidth: 150 }}>
              <MenuItem value="" sx={{ fontSize: 11 }}>Todos los Vendedores</MenuItem>
              {vendedores.map(v => <MenuItem key={v} value={v} sx={{ fontSize: 11 }}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <Select value={tipo} onChange={e => setTipo(e.target.value)} displayEmpty
              sx={{ fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff', minWidth: 140 }}>
              <MenuItem value="" sx={{ fontSize: 11 }}>Todos los Clientes</MenuItem>
              <MenuItem value="Natural"  sx={{ fontSize: 11 }}>Natural</MenuItem>
              <MenuItem value="Jurídico" sx={{ fontSize: 11 }}>Jurídico</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* Tabla */}
        <Box sx={{ p: '12px' }}>
          <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden' }}>
            <TablaPedidos pedidos={rows} onEdit={onEdit} showPagination />
            {rows.length === 0 && (
              <Box sx={{ py: '36px', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: F }}>No hay pedidos confirmados para este día</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Vista Calendario ─────────────────────────────────────────────────────────
// Nombres de meses para los desplegables
const MESES_DROPDOWN = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// OBJETIVO: ofrecer dos formas de ver los pedidos confirmados: el calendario del
// mes (pulsar un día lleva a PedidosDia) o una tabla general ("control general").
// Recibe los pedidos, el mes/año/semana elegidos en el encabezado y los filtros de
// vendedor, cliente, tipo de pedido y búsqueda. Devuelve la tarjeta con pestañas.
function VistaCalendario({ pedidos, onNuevo, onEdit, mesIdx, anio,
  semanaActiva, vendedor, tipo, tipoPedido, search, onSearch }) {
  const navigate = useNavigate();
  const [vistaTab,    setVistaTab]    = useState('calendario');   // 'calendario' | 'general'
  const [infoAnchor,  setInfoAnchor]  = useState(null);          // ancla de la leyenda (null = oculta)
  const [colsVisibles, setColsVisibles] = useState(DEFAULT_COLS_VISIBLES);

  // Fecha de referencia (día 1) para que el calendario sepa qué mes dibujar
  const mesRef = useMemo(() => new Date(anio, mesIdx, 1), [anio, mesIdx]);

  // Los filtros del encabezado se aplican antes de contar pedidos por día
  const pedidosFiltrados = pedidos
    .filter(p => !tipo       || p.tipoCliente === tipo)
    .filter(p => !tipoPedido || p.tipoPedido  === tipoPedido)
    .filter(p => !vendedor   || p.vendedor    === vendedor)
    .filter(p => !search     || p.cliente?.nombre?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, boxShadow: DL.e2, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ borderBottom: `1px solid ${DL.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: '16px' }}>
          {/* Tabs */}
          {[
            { id: 'calendario', label: 'Vista en calendario' },
            { id: 'general',    label: 'Vista de control general' },
          ].map(v => (
            <Box key={v.id} component="button" onClick={() => setVistaTab(v.id)} sx={{
              px: '14px', py: '13px', border: 'none', background: 'transparent', fontFamily: F,
              fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              color: vistaTab === v.id ? DL.navy : DL.tS,
              borderBottom: vistaTab === v.id ? `2px solid ${DL.blue}` : '2px solid transparent',
              mb: '-1px', transition: 'all .14s',
            }}>{v.label}</Box>
          ))}

          <Box sx={{ flex: 1 }} />

          {/* i | Descargar | Buscar | Nuevo Pedido */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: '8px' }}>
            {/* Leyenda info: al pasar el mouse explica qué significan N, J, R y P en el calendario */}
            <Box onMouseEnter={e => setInfoAnchor(e.currentTarget)} onMouseLeave={() => setInfoAnchor(null)}
              sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${infoAnchor ? DL.blue : DL.border2}`,
                background: infoAnchor ? 'rgba(84,126,105,.08)' : '#fff',
                transition: 'all .15s', cursor: 'pointer',
              }}>
                <InfoIcon sx={{ fontSize: 15, color: infoAnchor ? DL.blue : DL.tS }} />
              </Box>
              <Popper open={!!infoAnchor} anchorEl={infoAnchor} placement="bottom-end" transition sx={{ zIndex: 1400 }}>
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={180}>
                    <Paper elevation={0} sx={{ mt: '8px', borderRadius: '14px', overflow: 'hidden', border: `1px solid ${DL.border}`, boxShadow: '0 8px 32px rgba(26,26,26,.10)', minWidth: 270 }}>
                      <Box sx={{ px: '16px', py: '11px', background: 'linear-gradient(135deg,#f6f6f6 0%,#efefef 100%)', borderBottom: `1px solid ${DL.border}` }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.navy, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: F }}>Leyenda de indicadores</Typography>
                      </Box>
                      <Box sx={{ p: '10px 14px', display: 'flex', flexDirection: 'column', gap: '4px', background: '#fff' }}>
                        {[
                          { badge: 'N', color: '#547e69', bg: '#e8e8e8', border: '#b8b8b8', label: 'Natural', desc: 'Cliente persona natural (DUI)' },
                          { badge: 'J', color: '#15803d', bg: '#dcfce7', border: '#86efac', label: 'Jurídico', desc: 'Cliente empresa o jurídico (NIT)' },
                          { badge: 'R', color: '#b45309', bg: '#fef3c7', border: '#fcd34d', label: 'Reserva', desc: 'Pedido despachado desde stock existente' },
                          { badge: 'P', color: '#515151', bg: '#ededed', border: '#c2c2c2', label: 'Producción', desc: 'Pedido que requiere fabricarse' },
                        ].map(({ badge, color, bg, border, label, desc }) => (
                          <Box key={badge} sx={{ display: 'flex', alignItems: 'center', gap: '10px', py: '5px' }}>
                            <Box sx={{ width: 28, height: 28, borderRadius: '8px', flexShrink: 0, background: bg, border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography sx={{ fontSize: 10, fontWeight: 500, color, lineHeight: 1, fontFamily: F }}>{badge}</Typography>
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, fontFamily: F, lineHeight: 1.2 }}>{label}</Typography>
                              <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F, lineHeight: 1.3 }}>{desc}</Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </Box>
            {/* Descargar */}
            <Tooltip title="Descargar Excel" arrow>
              <IconButton size="small" sx={{ border: `1px solid ${DL.border2}`, borderRadius: '8px', p: '7px', color: DL.tM, background: '#fff' }}>
                <DownloadIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            {/* Buscar */}
            <TextField size="small" placeholder="Buscar..." value={search} onChange={e => onSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: DL.tS }} /></InputAdornment> } }}
              sx={{ width: 160, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff' } }} />
            {/* Nuevo Pedido */}
            <Tooltip title="Pedido nuevo" arrow>
        <IconButton onClick={onNuevo} aria-label="Pedido nuevo" sx={{ width: 34, height: 34, borderRadius: '8px', border: '1px solid #1a1a1a', background: '#fff', color: '#1a1a1a', '&:hover': { background: '#f6f6f6' } }}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Contenido: calendario o tabla general según la pestaña. La tabla general solo
          muestra pedidos confirmados (sin las cotizaciones 'Pendiente'). */}
      {vistaTab === 'calendario' ? (
        <CalendarioMensual
          pedidos={pedidosFiltrados}
          mesRef={mesRef}
          semanaActiva={semanaActiva === 'todas' ? null : Number(semanaActiva)}
          diaSeleccionado={null}
          onDiaClick={iso => navigate(`/pedidos/dia/${iso}`)}
        />
      ) : (
        <Box sx={{ p: '12px' }}>
          <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden' }}>
            <TablaPedidos pedidos={pedidosFiltrados.filter(p => p.estadoPago !== 'Pendiente')} onEdit={onEdit} showPagination colsVisibles={colsVisibles} />
          </Box>
        </Box>
      )}
    </Box>
  );
}

// Título del encabezado según la vista activa (valor de "?vista=" en la URL)
const VISTA_TITLES = {
  cotizados:  'Registro de Pedidos',
  gestion:    'Gestión de Pedidos',
  calendario: 'Calendario de Pedidos',
};

const MESES_NOMBRES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Opciones de mes (1-12) y de año (±2 del actual) para el filtro de "Registro de Pedidos"
const MES_OPTIONS = MESES_NOMBRES.map((label, i) => ({ value: String(i + 1), label }));

const ANIO_BASE = new Date().getFullYear();
const ANIO_OPTIONS = [-2,-1,0,1,2].map(d => ({ value: String(ANIO_BASE + d), label: String(ANIO_BASE + d) }));

// Estilo común de los selectores de mes y año
const selectSx = {
  fontFamily: F, fontSize: 12, fontWeight: 500, color: DL.navy,
  background: '#fff', border: `1.5px solid ${DL.blue}`,
  borderRadius: '8px', px: '12px', pr: '32px', py: '6px',
  outline: 'none', cursor: 'pointer', appearance: 'none',
  transition: 'border-color .15s, box-shadow .15s',
  boxShadow: '0 1px 4px rgba(84,126,105,.12)',
  '&:hover': { borderColor: DL.navy, boxShadow: '0 2px 8px rgba(84,126,105,.2)' },
  '&:focus': { borderColor: DL.navy, boxShadow: '0 0 0 3px rgba(84,126,105,.15)' },
};

// Selector de mes + año
// Recibe el mes y año actuales (texto) y sus funciones onMes / onAnio; devuelve los dos desplegables.
function MesFiltro({ mes, onMes, anio, onAnio }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <Box component="select" value={mes} onChange={e => onMes(e.target.value)} sx={{ ...selectSx, minWidth: 120 }}>
          {MES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Box>
        <Box sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DL.blue, fontSize: 12, fontWeight: 500 }}>▾</Box>
      </Box>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <Box component="select" value={anio} onChange={e => onAnio(e.target.value)} sx={{ ...selectSx, minWidth: 90 }}>
          {ANIO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Box>
        <Box sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DL.blue, fontSize: 12, fontWeight: 500 }}>▾</Box>
      </Box>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// OBJETIVO: componente de la página. Carga los pedidos una vez, guarda los filtros
// de cada vista y decide cuál vista pintar según "?vista=" de la URL. No recibe props.
// Los filtros viven aquí (no dentro de cada vista) porque los selectores están en el
// PageHeader, que es hermano de las vistas. Editar o crear un pedido navega a /pedidos/nuevo.
export default function Pedidos() {
  const navigate = useNavigate();
  const location = useLocation();
  // Pedidos de ejemplo + los creados por el usuario (localStorage 'pedidos_nuevos'),
  // con los cambios aprobados aplicados. Se carga una sola vez al abrir la pantalla.
  const [pedidos] = useState(() => {
    const guardados = JSON.parse(localStorage.getItem('pedidos_nuevos') || '[]');
    return aplicarOverrides([...PEDIDOS_INICIALES, ...guardados]);
  });

  // Vista activa: 'cotizados' (por defecto), 'gestion' o 'calendario'
  const vista = new URLSearchParams(location.search).get('vista') || 'cotizados';

  const now = new Date();
  const defaultMes  = String(now.getMonth() + 1);
  const defaultAnio = String(now.getFullYear());

  // Mes y año por defecto = hoy. Cada vista tiene sus propios filtros para que al
  // cambiar de vista no se mezclen las selecciones.
  const [mesRegistro,  setMesRegistro]  = useState(defaultMes);
  const [anioRegistro, setAnioRegistro] = useState(defaultAnio);
  const [mesGestion,   setMesGestion]   = useState(defaultMes);
  const [anioGestion,  setAnioGestion]  = useState(defaultAnio);

  // Filtros Gestión
  const [gestSearch,     setGestSearch]     = useState('');
  const [gestVendedor,   setGestVendedor]   = useState('');
  const [gestTipo,       setGestTipo]       = useState('');
  const [gestTipoPedido, setGestTipoPedido] = useState('');
  const [gestTipoOrden,  setGestTipoOrden]  = useState('');
  const [gestEstadoPago, setGestEstadoPago] = useState('');
  const [calMesIdx,     setCalMesIdx]     = useState(now.getMonth());
  const [calAnio,       setCalAnio]       = useState(now.getFullYear());
  const [calSemana,     setCalSemana]     = useState('todas');
  const [calVendedor,   setCalVendedor]   = useState('');
  const [calTipo,       setCalTipo]       = useState('');
  const [calTipoPedido, setCalTipoPedido] = useState('');
  const [calSearch,     setCalSearch]     = useState('');

  // Filtros levantados al header — solo para cotizados
  const [search,     setSearch]     = useState('');
  const [vendedor,   setVendedor]   = useState('');
  const [tipo,       setTipo]       = useState('');
  const [tipoPedido, setTipoPedido] = useState('');
  const [tipoOrden,  setTipoOrden]  = useState('');
  const [estadoPago, setEstadoPago] = useState('');

  // Opciones de los selectores. En cotizados el estado de pago solo puede ser 'Pendiente'
  // (por definición de cotización), por eso se filtra antes de armar la lista.
  const vendedores  = [...new Set(pedidos.map(p => p.vendedor))];
  const estadosPago = [...new Set(pedidos.filter(p => p.estadoPago === 'Pendiente').map(p => p.estadoPago))];

  // Cuántas semanas tiene el mes del calendario (4, 5 o 6), con la misma lógica de la
  // cuadrícula domingo-sábado de CalendarioMensual; alimenta el selector "Semana".
  const calNumSemanas = useMemo(() => {
    const primerDia = new Date(calAnio, calMesIdx, 1);
    const ultimoDia = new Date(calAnio, calMesIdx + 1, 0);
    let current = new Date(primerDia);
    current.setDate(current.getDate() - current.getDay());
    let count = 0;
    while (current <= ultimoDia || current.getDay() !== 0) {
      count++;
      current.setDate(current.getDate() + 7);
      if (current > ultimoDia && current.getDay() === 0) break;
    }
    return count;
  }, [calAnio, calMesIdx]);
  const calSemanaOpts = [{ value: 'todas', label: 'Todas las semanas' }, ...Array.from({ length: calNumSemanas }, (_, i) => ({ value: String(i), label: `Semana ${i + 1}` }))];
  const calAnioBase = now.getFullYear();
  const calAnioOpts = [-2,-1,0,1,2].map(d => ({ value: String(calAnioBase + d), label: String(calAnioBase + d) }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: DL.bg, overflow: 'hidden' }}>
      {/* Encabezado: los selectores cambian según la vista activa */}
      <PageHeader title={VISTA_TITLES[vista] || 'Pedidos'} live={false} showShare={false}>
        {vista === 'cotizados' && (
          <>
            <MesFiltro mes={mesRegistro} onMes={setMesRegistro} anio={anioRegistro} onAnio={setAnioRegistro} />
            <MiniSelect label="Tipo pedido" value={tipoPedido} onChange={setTipoPedido} minWidth={110} options={[
              { value: '', label: 'Todos' },
              { value: 'Reserva', label: 'Reserva' },
              { value: 'Producción', label: 'Producción' },
            ]} />
            <MiniSelect label="Tipo orden" value={tipoOrden} onChange={setTipoOrden} minWidth={120} options={[
              { value: '', label: 'Todos' },
              { value: 'Catálogo', label: 'Catálogo' },
              { value: 'Accesorios', label: 'Accesorios' },
              { value: 'Personalizado', label: 'Personalizado' },
            ]} />
            <MiniSelect label="Estado pago" value={estadoPago} onChange={setEstadoPago} minWidth={120} options={[
              { value: '', label: 'Todos' },
              ...(estadosPago || []).map(e => ({ value: e, label: e })),
            ]} />
            <MiniSelect label="Vendedor" value={vendedor} onChange={setVendedor} minWidth={110} options={[
              { value: '', label: 'Todos' },
              ...vendedores.map(v => ({ value: v, label: v })),
            ]} />
            <MiniSelect label="Cliente" value={tipo} onChange={setTipo} minWidth={100} options={[
              { value: '', label: 'Todos' },
              { value: 'Natural', label: 'Natural' },
              { value: 'Jurídico', label: 'Jurídico' },
            ]} />
          </>
        )}
        {vista === 'gestion' && (
          <>
            <MiniSelect label="Tipo pedido" value={gestTipoPedido} onChange={setGestTipoPedido} minWidth={110} options={[
              { value: '', label: 'Todos' },
              { value: 'Reserva', label: 'Reserva' },
              { value: 'Producción', label: 'Producción' },
            ]} />
            <MiniSelect label="Tipo orden" value={gestTipoOrden} onChange={setGestTipoOrden} minWidth={120} options={[
              { value: '', label: 'Todos' },
              { value: 'Catálogo', label: 'Catálogo' },
              { value: 'Accesorios', label: 'Accesorios' },
              { value: 'Personalizado', label: 'Personalizado' },
            ]} />
            <MiniSelect label="Estado pago" value={gestEstadoPago} onChange={setGestEstadoPago} minWidth={120} options={[
              { value: '', label: 'Todos' },
              ...pedidos.map(p => p.estadoPago).filter((v,i,a) => a.indexOf(v)===i).map(e => ({ value: e, label: e })),
            ]} />
            <MiniSelect label="Vendedor" value={gestVendedor} onChange={setGestVendedor} minWidth={110} options={[
              { value: '', label: 'Todos' },
              ...vendedores.map(v => ({ value: v, label: v })),
            ]} />
            <MiniSelect label="Cliente" value={gestTipo} onChange={setGestTipo} minWidth={100} options={[
              { value: '', label: 'Todos' },
              { value: 'Natural', label: 'Natural' },
              { value: 'Jurídico', label: 'Jurídico' },
            ]} />
          </>
        )}
        {vista === 'calendario' && (
          <>
            <MiniSelect label="Mes" value={String(calMesIdx)} onChange={v => setCalMesIdx(Number(v))} minWidth={120}
              options={MESES_NOMBRES.map((m, i) => ({ value: String(i), label: m }))} />
            <MiniSelect label="Año" value={String(calAnio)} onChange={v => setCalAnio(Number(v))} minWidth={90}
              options={calAnioOpts.map(o => ({ value: String(o.value), label: String(o.label) }))} />
            <MiniSelect label="Semana" value={calSemana} onChange={setCalSemana} minWidth={150} options={calSemanaOpts} />
            <MiniSelect label="Vendedor" value={calVendedor} onChange={setCalVendedor} minWidth={110} options={[{ value:'', label:'Todos' }, ...vendedores.map(v => ({ value:v, label:v }))]} />
            <MiniSelect label="Cliente" value={calTipo} onChange={setCalTipo} minWidth={100} options={[{ value:'', label:'Todos' }, { value:'Natural', label:'Natural' }, { value:'Jurídico', label:'Jurídico' }]} />
            <MiniSelect label="Tipo pedido" value={calTipoPedido} onChange={setCalTipoPedido} minWidth={120} options={[{ value:'', label:'Todos' }, { value:'Reserva', label:'Reserva' }, { value:'Producción', label:'Producción' }]} />
          </>
        )}
      </PageHeader>

      {/* Cuerpo: solo se monta la vista activa; onEdit abre el formulario con "?id=" del pedido */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {vista === 'cotizados'  && <VistaCotizados  pedidos={pedidos} onNuevo={() => navigate('/pedidos/nuevo')} onEdit={p => navigate(`/pedidos/nuevo?id=${encodeURIComponent(p.id)}`)} mesSeleccionado={mesRegistro} anioSeleccionado={anioRegistro}
          search={search} onSearch={setSearch}
          vendedor={vendedor} onVendedor={setVendedor}
          tipo={tipo} onTipo={setTipo}
          tipoPedido={tipoPedido} onTipoPedido={setTipoPedido}
          tipoOrden={tipoOrden} onTipoOrden={setTipoOrden}
          estadoPago={estadoPago} onEstadoPago={setEstadoPago}
          vendedores={vendedores} estadosPago={estadosPago} />}
        {vista === 'gestion'    && <VistaGestion     pedidos={pedidos} onNuevo={() => navigate('/pedidos/nuevo')} onEdit={p => navigate(`/pedidos/nuevo?id=${encodeURIComponent(p.id)}`)}
          search={gestSearch} onSearch={setGestSearch}
          vendedor={gestVendedor} tipo={gestTipo} tipoPedido={gestTipoPedido}
          tipoOrden={gestTipoOrden} estadoPago={gestEstadoPago} />}
        {vista === 'calendario' && <VistaCalendario  pedidos={pedidos} onNuevo={() => navigate('/pedidos/nuevo')} onEdit={p => navigate(`/pedidos/nuevo?id=${encodeURIComponent(p.id)}`)} mesIdx={calMesIdx} anio={calAnio}
          semanaActiva={calSemana} vendedor={calVendedor} tipo={calTipo} tipoPedido={calTipoPedido}
          search={calSearch} onSearch={setCalSearch} />}
      </Box>
    </Box>
  );
}
