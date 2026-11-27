// ─── Dashboard de Ventas ──────────────────────────────────────────────────────
// Objetivo: ¿Cómo vamos en ventas vs. meta y año anterior?
//           ¿Qué producto/canal/vendedor está jalando o frenando los números?
// Para quién: gerencia y administración, que revisan los números de ventas.
// Estructura de la pantalla (de arriba hacia abajo):
//   1. Encabezado con filtros, botón de actualizar y exportar a Excel.
//   2. Fila de KPI (KpiRow); cada uno abre un panel con su explicación (KpiDrawer).
//   3. Gráfica de ventas históricas (HistoricoCard) junto a las alertas del sistema.
//   4. "Ventas por" (VporCard): gráfica de barras + tabla por producto, canal, vendedor, etc.
//   5. "Detalles de Venta" (FacturasCard): tabla de facturas; al tocar una fila se abre su detalle.
// Nota honesta: los datos vienen de data/ventas.js (datos de demostración, no de los pedidos reales).
// Los filtros del encabezado (período, categoría, canal, vendedor) por ahora solo guardan la opción
// elegida; todavía no recalculan los datos.
//           ¿Qué producto/canal/vendedor está jalando o frenando los números?

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import ReactECharts from 'echarts-for-react';
import {
  Box, Typography, Modal, Backdrop,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Close as CloseIcon, IosShare as ShareIcon, Refresh as RefreshIcon } from '@mui/icons-material';

import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import KpiDrawer from '../components/common/KpiDrawer';
import KpiCard from '../components/common/KpiCard';
import SectionHeader from '../components/common/SectionHeader';
import AlertasSistema from '../components/common/AlertasSistema';
import { DL } from '../theme';
import { useT } from '../i18n/LanguageContext';
import {
  VENTAS_KPIS, VENTAS_ALERTS, VENTAS_HIST,
  VPOR_DATA, INV_DATA, INV_COLS_CFG,
} from '../data/ventas';
import { KPI_INTEL } from '../data/kpi_intel';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// fmt$: da formato de dinero con separador de miles, ej. 12450 -> "$12,450".
const fmt$ = (v) => `$${Number(v).toLocaleString()}`;

// Objetivo: mostrar el margen bruto (%) con un punto de color como semáforo.
// Regla: 25 % o más = verde (sano), de 15 a 25 = amarillo (vigilar), menos de 15 = rojo (bajo).
// Props: mg (número, porcentaje). Devuelve: punto + porcentaje con un decimal.
function MgChip({ mg }) {
  const [bg, color] =
    mg >= 25 ? [DL.greenBg,  DL.green]  :
    mg >= 15 ? [DL.yellowBg, DL.yellow] :
               [DL.redBg,    DL.red];
  return (
    <Box sx={{
      display:'inline-flex', alignItems:'center', gap:'3px',
      px:0, py:'2px',
    }}>
      <Box sx={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0 }} />
      <Typography sx={{ fontSize:10, fontWeight: 500, color }}>{mg.toFixed(1)}%</Typography>
    </Box>
  );
}

// Objetivo: mostrar si una factura está pagada (verde) o pendiente (rojo).
// Props: pago (booleano). El texto sale de las traducciones.
function StatusChip({ pago }) {
  const { t } = useT();
  const label = pago ? t('status.pagado') : t('status.pendiente');
  const bg    = pago ? DL.greenBg  : DL.redBg;
  const color = pago ? DL.green    : DL.red;
  return (
    <Box sx={{
      display:'inline-flex', alignItems:'center', gap:'3px',
      px:0, py:'2px',
    }}>
      <Box sx={{ width:4, height:4, borderRadius:'50%', background:color }} />
      <Typography sx={{ fontSize:8, fontWeight: 500, color }}>{label}</Typography>
    </Box>
  );
}

// Objetivo: caja blanca con borde, base visual de todas las tarjetas de la página. Props: children, sx (estilos extra).
function Card({ children, sx }) {
  return (
    <Box sx={{
      background:'#fff', borderRadius:'6px',
      border:`1px solid ${DL.border}`, boxShadow:'none',
      overflow:'hidden', ...sx,
    }}>
      {children}
    </Box>
  );
}

// ─── Card plain header (white, no gradient) ───────────────────────────────────
// Objetivo: encabezado simple de una tarjeta con título y, opcionalmente, controles a la derecha.
// Props: title, right (controles), borderBottom (línea inferior; true por defecto). Hoy las tarjetas
// de esta página arman su propio encabezado, por lo que este componente queda como utilidad.
function CardHeader({ title, right, borderBottom = true }) {
  return (
    <Box sx={{
      px:'16px', py:'10px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      borderBottom: borderBottom ? `1px solid ${DL.border}` : 'none',
      flexWrap:'wrap', gap:'6px',
    }}>
      <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH }}>
        {title}
      </Typography>
      {right && (
        <Box sx={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {right}
        </Box>
      )}
    </Box>
  );
}

// ─── Reusable select ──────────────────────────────────────────────────────────
// Estilo de un select nativo pequeño (hoy se usa MiniSelect en su lugar; queda definido por si se necesita).
const selectSx = {
  fontSize:10, fontWeight:500, color:'#3f3f3f',
  border:`1px solid ${DL.border2}`, borderRadius:'6px',
  px:'7px', py:'3px', background:'#fff',
  fontFamily:"'Inter',sans-serif",
  cursor:'pointer', outline:'none',
  '&:focus':{ borderColor:DL.blue },
};

// ─── KPI Cards ────────────────────────────────────────────────────────────────
// Objetivo: fila con los 7 indicadores. Props: onKpiClick (se llama con el KPI elegido para abrir el drawer).
// Por qué grilla responsiva: 2 por fila en celular, 4 en tablet y 7 en escritorio, así siempre caben.
function KpiRow({ onKpiClick }) {
  return (
    <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'repeat(2,1fr)', sm:'repeat(4,1fr)', md:'repeat(7,minmax(0,1fr))' }, gap:'10px' }}>
      {/* Se traduce cada KPI de data/ventas.js a las props de KpiCard (lbl, val, pct, meta, diff, yoy...). */}
      {VENTAS_KPIS.map(k => (
        <KpiCard
          key={k.id}
          lbl={k.label} val={k.value} pct={k.pct}
          meta={k.meta} metaLbl={k.metaLabel || 'Meta'}
          diff={k.metaDelta} diffUp={k.metaDeltaUp}
          // Se le quita el prefijo "vs Año Ant." al texto, porque KpiCard ya escribe "Año ant." por su cuenta.
          yoyPrev={String(k.yoy).replace(/^vs\s+año\s+ant\.?\s*/i, '')}
          yoyDelta={k.delta} yoyUp={k.deltaUp}
          // El enlace "detalle" solo aparece si existe explicación para ese KPI en kpi_intel.js (si es undefined, KpiCard no lo muestra).
          onInfo={KPI_INTEL[k.id] ? () => onKpiClick(k) : undefined}
        />
      ))}
    </Box>
  );
}

// Adaptación de datos: las alertas guardan el nivel en "type", pero AlertasSistema espera "tier"; aquí se renombra.
const ventasAlerts = VENTAS_ALERTS.map(a => ({ tier: a.type, msg: a.msg }));

// ─── Histórico de Ventas card ─────────────────────────────────────────────────
// Objetivo: gráfica de barras agrupadas con las ventas por mes o trimestre (años comparados) y la línea del presupuesto.
// Props: gran ('mes' | 'trim', granularidad), setGran, split ('general' | 'categoria', cómo dividir las barras), setSplit.
// El estado vive en la página (Ventas) y aquí solo se cambia mediante los selectores del encabezado.
function HistoricoCard({ gran, setGran, split, setSplit }) {
  const { t } = useT();
  // valMode ($ o cantidad) solo cambia el interruptor visual; los datos de la gráfica todavía son siempre en dólares.
  const [valMode, setValMode] = useState('$');

  // Preparación de la gráfica ECharts. Por qué useMemo: la configuración es un objeto grande y solo debe
  // recalcularse cuando cambia la vista (mes/trimestre) o la división (general/categoría).
  // Pasos: 1) elegir el conjunto de datos (si la combinación no existe, usa general/mes), 2) convertir cada
  // serie (año o categoría) en una serie de barras, 3) añadir el presupuesto como línea punteada si existe,
  // 4) definir ejes, cuadrícula y tooltip.
  const histOption = useMemo(() => {
    const d = VENTAS_HIST[split]?.[gran] || VENTAS_HIST.general.mes;
    // Cada dataset es una barra del grupo; los valores null (meses sin dato) simplemente no se dibujan.
    const series = d.datasets.map(ds => ({
      name: ds.label, type:'bar',
      data: ds.data,
      barMaxWidth:14, barGap:'8%', barCategoryGap:'35%',
      itemStyle:{ color:ds.color, borderRadius:[3,3,0,0] },
      emphasis:{ focus:'series' },
    }));
    // El presupuesto va como línea encima de las barras (z: 10) para que no quede tapada.
    if (d.budget) series.push({
      name: t('chart.presupuesto'), type:'line', data:d.budget,
      smooth:false, symbol:'circle', symbolSize:4,
      lineStyle:{ color:'#d97706', width:1.8, type:'dashed' },
      itemStyle:{ color:'#d97706' }, z:10,
    });
    return {
      animation:true, animationDuration:500,
      grid:{ top:16, right:20, bottom:40, left:62 },
      xAxis:{
        type:'category', data: d.labels,
        axisLine:{ lineStyle:{ color:'rgba(26,26,26,.12)' } }, axisTick:{ show:false },
        axisLabel:{ fontFamily:'Inter', fontSize:10, color:'#8d8d8d' }, splitLine:{ show:false },
      },
      yAxis:{
        type:'value',
        axisLabel:{ fontFamily:'Inter', fontSize:10, color:'#8d8d8d', formatter: v => '$'+v+'K' },
        splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } },
        axisLine:{ show:false }, axisTick:{ show:false },
      },
      tooltip:{
        trigger:'axis', axisPointer:{ type:'shadow' },
        backgroundColor:'#fff', borderColor:'rgba(26,26,26,.15)', borderWidth:1, padding:[10,14],
        textStyle:{ fontFamily:'Inter', fontSize:11, color:'#1a1a1a' },
      },
      legend:{ show:false },
      series,
    };
  }, [split, gran]);

  const d = VENTAS_HIST[split]?.[gran] || VENTAS_HIST.general.mes;
  // La leyenda se dibuja aparte con HTML (la de ECharts está oculta) para controlar su estilo; refleja las mismas series.
  const legendItems = [
    ...d.datasets.map(ds => ({ label:ds.label, color:ds.color, type:'bar' })),
    ...(d.budget ? [{ label: t('chart.presupuesto2025'), color:'#d97706', type:'dashed' }] : []),
  ];

  return (
    <Card>
      {/* Plain white header */}
      <Box sx={{ px:'16px', py:'10px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${DL.border}`, flexWrap:'wrap', gap:'8px' }}>
        <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH }}>{t('sec.ventasHistoricas')}</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:'14px' }}>
          {/* VISTA */}
          <MiniSelect compact label={t('view.vista')} value={gran} onChange={setGran} minWidth={96}
            options={[{ value: 'mes', label: t('time.mes') }, { value: 'trim', label: t('time.trimestral') }]} />
          {/* SPLIT BY */}
          <MiniSelect compact label={t('view.splitBy')} value={split} onChange={setSplit} minWidth={96}
            options={[{ value: 'general', label: t('time.mes') }, { value: 'categoria', label: t('filter.categoria') }]} />
          {/* Interruptor $ / Cant.: la bolita se mueve según valMode (ver nota arriba). */}
          <Box sx={{ display:'flex', alignItems:'center', gap:'5px' }}>
            <Typography sx={{ fontSize:9, fontWeight: 500, color: valMode === '$' ? DL.navy : DL.tS, transition:'color .15s' }}>$</Typography>
            <Box
              component="button"
              onClick={() => setValMode(v => v === '$' ? 'cant' : '$')}
              sx={{
                width:28, height:14, borderRadius:7, border:'none',
                background: valMode === 'cant' ? DL.blue : DL.border2,
                cursor:'pointer', position:'relative', padding:0, flexShrink:0,
                transition:'background .2s',
                '&::after':{
                  content:'""', position:'absolute',
                  width:10, height:10, borderRadius:'50%', background:'#fff',
                  top:'50%', transform:'translateY(-50%)',
                  left: valMode === '$' ? '2px' : 'calc(100% - 12px)',
                  transition:'left .2s',
                  boxShadow:'0 1px 3px rgba(0,0,0,.2)',
                },
              }}
            />
            <Typography sx={{ fontSize:9, fontWeight: 500, color: valMode === 'cant' ? DL.navy : DL.tS, transition:'color .15s' }}>
              {t('lbl.cant')}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ px:'8px', pb:0, pt:'10px' }}>
        <ReactECharts option={histOption} style={{ height:260 }} />
      </Box>
      {/* Fila de leyenda: cuadro de color para barras y línea punteada para el presupuesto. */}
      <Box sx={{ display:'flex', gap:'18px', justifyContent:'center', px:'16px', pt:'2px', pb:'12px', flexWrap:'wrap' }}>
        {legendItems.map(l => (
          <Box key={l.label} sx={{ display:'flex', alignItems:'center', gap:'4px' }}>
            {l.type === 'dashed'
              ? <Box sx={{ width:16, borderTop:`2px dashed ${l.color}` }} />
              : <Box sx={{ width:8, height:8, borderRadius:'2px', background:l.color, flexShrink:0 }} />}
            <Typography sx={{ fontSize:9, color:DL.tS, fontWeight: 500 }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

// ─── Ventas Por card ──────────────────────────────────────────────────────────
// Objetivo: responder "¿quién vende más?": barras horizontales (año anterior vs actual) y una tabla con
// ventas, variación contra año anterior, participación y margen, por producto, categoría, canal, vendedor,
// región o cliente. Incluye búsqueda por nombre, pestañas y paginación. No recibe props.
function VporCard() {
  const { t } = useT();
  // Estado: pestaña elegida, texto de búsqueda y página actual de la tabla.
  const [vporTab,    setVporTab]    = useState('producto');
  const [vporSearch, setVporSearch] = useState('');
  const [vporPage,   setVporPage]   = useState(1);
  // Filas por página (también son las barras que se dibujan a la vez).
  const VPOR_PAGE_SIZE = 7;

  // Pestañas disponibles; "value" coincide con las claves de VPOR_DATA.
  const TABS = [
    { value:'producto',  label: t('ventas.top.productos') },
    { value:'categoria', label: t('ventas.top.categoria') },
    { value:'canal',     label: t('ventas.top.canal')     },
    { value:'vendedor',  label: t('ventas.top.vendedor')  },
    { value:'region',    label: t('ventas.top.region')    },
    { value:'cliente',   label: t('ventas.top.cliente')   },
  ];

  // Nombre de la entidad elegida, usado en el texto "Mostrando X de N <entidad>" del pie.
  const entityLabel = {
    producto: t('ventas.top.productos'), categoria: t('ventas.top.categoria'), canal: t('ventas.top.canal'),
    vendedor: t('ventas.top.vendedor'),  region: t('ventas.top.region'),        cliente: t('ventas.top.cliente'),
  }[vporTab] || t('lbl.nombre');

  // Título de la primera columna de la tabla según la pestaña elegida.
  const colLabel = {
    producto: t('ventas.top.productos'), categoria: t('ventas.top.categoria'), canal: t('ventas.top.canal'),
    vendedor: t('ventas.top.vendedor'),  region: t('ventas.top.region'),        cliente: t('ventas.top.cliente'),
  }[vporTab] || t('lbl.nombre');

  // Cadena de datos de la tabla: 1) todas las filas de la pestaña, 2) se filtran por el buscador (sin importar mayúsculas),
  // 3) se calcula cuántas páginas hay y 4) se toma solo la porción de la página actual.
  const allRows = VPOR_DATA[vporTab] || [];
  const filteredRows = vporSearch
    ? allRows.filter(r => r.name.toLowerCase().includes(vporSearch.toLowerCase()))
    : allRows;
  const totalPages = Math.ceil(filteredRows.length / VPOR_PAGE_SIZE);
  const rows = filteredRows.slice((vporPage - 1) * VPOR_PAGE_SIZE, vporPage * VPOR_PAGE_SIZE);

  // Al cambiar de pestaña se vuelve a la página 1 y se limpia la búsqueda, para no quedar en una página que no existe.
  const handleTabChange = (v) => { setVporTab(v); setVporPage(1); setVporSearch(''); };

  // Verde si la variación contra el año anterior es positiva o cero; rojo si es negativa.
  const vsColor = (va) => va >= 0 ? DL.green   : DL.red;
  const vsBg    = (va) => va >= 0 ? DL.greenBg  : DL.redBg;

  // Preparación de la gráfica ECharts de barras horizontales. Usa "rows" (solo la página actual), por eso depende de
  // [vporTab, rows]. yAxis inverse hace que la primera fila quede arriba; los nombres largos se cortan con "…".
  // Hay dos series por fila: año anterior (gris) y actual (verde); solo la actual muestra la etiqueta "$XK +Y%".
  const vporOption = useMemo(() => ({
    grid:{ top:4, right:80, bottom:4, left:8, containLabel:true },
    tooltip:{
      backgroundColor:'#fff', borderColor:'rgba(26,26,26,.15)', borderWidth:1,
      padding:[8,12], textStyle:{ fontFamily:'Inter', fontSize:10 }, trigger:'axis',
    },
    xAxis:{
      type:'value',
      axisLabel:{ fontFamily:'Inter', fontSize:8, color:'#939393', formatter: v => '$'+v+'K' },
      splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)' } },
      axisLine:{ show:false }, axisTick:{ show:false },
    },
    yAxis:{
      type:'category',
      data: rows.map(r => r.name.length > 14 ? r.name.slice(0,13)+'…' : r.name),
      inverse:true,
      axisLabel:{ fontFamily:'Inter', fontSize:9, color:'#1a1a1a' },
      axisTick:{ show:false }, axisLine:{ show:false },
    },
    series:[
      {
        name:'2024', type:'bar', data:rows.map(r => r.prev),
        barWidth:5, barGap:'20%', barCategoryGap:'35%',
        itemStyle:{ color:'rgba(26,26,26,.18)', borderRadius:[0,2,2,0] },
      },
      {
        name:'2025', type:'bar', data:rows.map(r => r.v),
        barWidth:5, barGap:'20%', barCategoryGap:'35%',
        itemStyle:{ color:'#547e69', borderRadius:[0,2,2,0] },
        label:{
          show:true, position:'right',
          fontFamily:'Inter', fontSize:8, color:'#585858',
          formatter: p => {
            const r = rows[p.dataIndex];
            if (!r) return '';
            const sign = r.vsAnt >= 0 ? '+' : '';
            return `$${r.v}K  ${sign}${Math.round(r.vsAnt)}%`;
          },
        },
      },
    ],
  }), [vporTab, rows]);

  // Rango mostrado en el pie ("1-7 de N"): el fin no puede pasar del total de filas filtradas.
  const startItem = (vporPage - 1) * VPOR_PAGE_SIZE + 1;
  const endItem   = Math.min(vporPage * VPOR_PAGE_SIZE, filteredRows.length);

  return (
    <Card>
      {/* Header */}
      <Box sx={{ px:'14px', py:'10px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${DL.border}`, gap:'10px', flexWrap:'wrap' }}>
        <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH }}>Ventas por</Typography>
        <Box sx={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {/* Search */}
          <Box sx={{
            display:'flex', alignItems:'center', gap:'5px',
            border:`1px solid ${DL.border2}`, borderRadius:'7px',
            px:'9px', py:'5px', background:'#fafafa',
            '&:focus-within':{ borderColor:DL.blue, background:'#fff' },
          }}>
            <Typography sx={{ fontSize:10, color:DL.tS, lineHeight:1 }}>🔍</Typography>
            <Box
              component="input"
              placeholder={t('btn.search')}
              value={vporSearch}
              onChange={e => { setVporSearch(e.target.value); setVporPage(1); }}
              sx={{
                border:'none', outline:'none', background:'transparent',
                fontFamily:"'Inter',sans-serif", fontSize:10, color:DL.tM,
                width:110,
              }}
            />
          </Box>
          {/* Este botón "Columnas" es solo visual en esta tarjeta; el selector de columnas que sí funciona está en la tabla de facturas. */}
          <Box component="button" sx={{
            fontFamily:"'Inter',sans-serif",
            fontSize:9, fontWeight: 500,
            px:'10px', py:'5px', borderRadius:'7px',
            border:`1px solid ${DL.border2}`, background:'#fff', color:DL.tM,
            cursor:'pointer', display:'flex', alignItems:'center', gap:'5px',
            transition:'all .14s',
            '&:hover':{ borderColor:DL.blue, color:DL.navy },
          }}>
            <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5px', width:10 }}>
              {[0,1,2,3].map(i => <Box key={i} sx={{ width:4, height:4, background:'currentColor', borderRadius:.5, opacity:.7 }} />)}
            </Box>
            {t('btn.columns')}
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{
        display:'flex', borderBottom:`1px solid ${DL.border}`,
        px:'8px', pt:'4px',
        overflowX:'auto', '&::-webkit-scrollbar':{ display:'none' },
      }}>
        {TABS.map(t => (
          <Box key={t.value} component="button" onClick={() => handleTabChange(t.value)} sx={{
            fontFamily:"'Inter',sans-serif",
            fontSize:10, fontWeight: vporTab === t.value ? 500 : 500,
            px:'12px', py:'6px',
            border:'none', borderBottom:`2px solid ${vporTab === t.value ? DL.blue : 'transparent'}`,
            mb:'-1px', background:'transparent',
            color: vporTab === t.value ? DL.navy : DL.tS,
            cursor:'pointer', whiteSpace:'nowrap', transition:'all .14s',
            '&:hover':{ color:DL.tM },
          }}>
            {t.label}
          </Box>
        ))}
      </Box>

      {/* Cuerpo: gráfica a la izquierda (55 %) y tabla a la derecha. La altura de la gráfica crece con el número de filas (38 px por fila, mínimo 200). */}
      <Box sx={{ display:'flex', alignItems:'flex-start' }}>
        {/* Chart */}
        <Box sx={{ flex:'0 0 55%', borderRight:`1px solid ${DL.border}`, p:'8px 4px 8px 8px', minWidth:0 }}>
          <ReactECharts option={vporOption} style={{ height: Math.max(rows.length * 38 + 24, 200) }} />
        </Box>
        {/* Table */}
        <Box sx={{ flex:1, minWidth:0, overflowX:'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  { label:colLabel,           align:'left'  },
                  { label:t('col.ventas'),    align:'right' },
                  { label:t('col.vsAnt'),     align:'right' },
                  { label:t('col.pct'),       align:'right' },
                  { label:t('col.mg'),        align:'right' },
                ].map(h => (
                  <TableCell key={h.label} sx={{
                    fontSize:11, fontWeight: 500, textTransform:'none',
                    letterSpacing:0, color:DL.tH,
                    background:'transparent',
                    borderBottom:`1px solid ${DL.tH}`,
                    px:'10px', py:'6px', whiteSpace:'nowrap',
                    textAlign:h.align,
                  }}>
                    {h.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.name} sx={{
                  borderBottom:`1px dotted ${DL.border2}`,
                  '&:hover':{ background:'#fafafa' },
                }}>
                  <TableCell sx={{ fontSize:10, fontWeight: 500, color:DL.tH, px:'10px', py:'10px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:130 }}>
                    {r.name}
                  </TableCell>
                  <TableCell sx={{ fontSize:10, fontWeight: 500, color:DL.tH, textAlign:'right', px:'10px', whiteSpace:'nowrap' }}>
                    ${r.v}K
                  </TableCell>
                  <TableCell sx={{ textAlign:'right', px:'10px' }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:vsColor(r.vsAnt), fontVariantNumeric:'tabular-nums' }}>
                      {r.vsAnt >= 0 ? '↑' : '↓'} {Math.abs(r.vsAnt)}%
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize:10, color:DL.tM, textAlign:'right', px:'10px' }}>
                    {r.part}%
                  </TableCell>
                  <TableCell sx={{ textAlign:'right', px:'10px' }}>
                    <Typography sx={{
                      fontSize:10, fontWeight: 500,
                      color: r.mg >= 25 ? DL.green : r.mg >= 15 ? DL.yellow : DL.red,
                    }}>
                      {r.mg}%
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* Pie: leyenda de años, texto "Mostrando..." y paginación (solo si hay más de una página). Los botones de las puntas van a la primera/última página. */}
      <Box sx={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        px:'14px', py:'8px',
        borderTop:`1px solid ${DL.border}`,
        flexWrap:'wrap', gap:'8px',
      }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:'14px' }}>
          {[{ color:'#547e69', label:'2025' }, { color:'rgba(26,26,26,.22)', label:'2024' }].map(l => (
            <Box key={l.label} sx={{ display:'flex', alignItems:'center', gap:'4px' }}>
              <Box sx={{ width:8, height:8, borderRadius:'2px', background:l.color }} />
              <Typography sx={{ fontSize:9, color:DL.tS, fontWeight: 500 }}>{l.label}</Typography>
            </Box>
          ))}
          <Typography sx={{ fontSize:9, color:DL.tS }}>
            {t('ventas.footer.mostrando').replace('{start}', startItem).replace('{end}', endItem).replace('{n}', filteredRows.length).replace('{entity}', entityLabel)}
          </Typography>
        </Box>
        {totalPages > 1 && (
          <Box sx={{ display:'flex', gap:'2px' }}>
            {[['|◀', 1], ['◀', Math.max(vporPage - 1, 1)]].map(([lb, tg]) => (
              <Box key={lb} component="button"
                onClick={() => setVporPage(Number(tg))}
                disabled={vporPage === 1}
                sx={{
                  minWidth:24, height:24, borderRadius:'5px', border:`1px solid ${DL.border}`,
                  background:'#fff', fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight: 500,
                  color:DL.tM, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  '&:disabled':{ opacity:.3, cursor:'default' },
                  '&:hover:not(:disabled)':{ borderColor:DL.blue },
                }}
              >{lb}</Box>
            ))}
            {Array.from({ length:totalPages }, (_, i) => (
              <Box key={i} component="button"
                onClick={() => setVporPage(i + 1)}
                sx={{
                  minWidth:24, height:24, borderRadius:'5px',
                  border:`1px solid ${(i+1) === vporPage ? DL.blue : DL.border}`,
                  background:(i+1) === vporPage ? DL.blue : '#fff',
                  fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight: 500,
                  color:(i+1) === vporPage ? '#fff' : DL.tM,
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  '&:hover':{ borderColor:DL.blue },
                }}
              >{i + 1}</Box>
            ))}
            {[['▶', Math.min(vporPage + 1, totalPages)], ['▶|', totalPages]].map(([lb, tg]) => (
              <Box key={lb} component="button"
                onClick={() => setVporPage(Number(tg))}
                disabled={vporPage === totalPages}
                sx={{
                  minWidth:24, height:24, borderRadius:'5px', border:`1px solid ${DL.border}`,
                  background:'#fff', fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight: 500,
                  color:DL.tM, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  '&:disabled':{ opacity:.3, cursor:'default' },
                  '&:hover:not(:disabled)':{ borderColor:DL.blue },
                }}
              >{lb}</Box>
            ))}
          </Box>
        )}
      </Box>
    </Card>
  );
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────
// Objetivo: ventana con el detalle de UNA factura: totales, datos del cliente y de la factura, productos,
// rentabilidad y estado de cobro. Props: row (factura de INV_DATA, o null), onClose.
// Devuelve: el modal, o null si no hay factura seleccionada.
function InvoiceModal({ row, onClose }) {
  const { t } = useT();
  if (!row) return null;
  // Porcentaje cobrado = abono / venta. Si la venta fuera 0 se toma 100 % para no dividir entre 0.
  // El pendiente es el complemento; sirve para pintar la barra verde/roja de cobro. mgColor usa el mismo semáforo del margen.
  const cobradoPct    = row.v > 0 ? Math.round(row.abono / row.v * 100) : 100;
  const pendientePct  = 100 - cobradoPct;
  const mgColor       = row.mg >= 25 ? DL.green : row.mg >= 15 ? DL.yellow : DL.red;

  // Fila "etiqueta ... valor" repetida en varios bloques del modal. valueStyle permite cambiar el color del valor.
  const InfoRow = ({ label, value, valueStyle }) => (
    <Box sx={{
      display:'flex', justifyContent:'space-between', py:'5px',
      borderBottom:`1px dotted ${DL.border2}`,
      '&:last-child':{ borderBottom:'none' },
    }}>
      <Typography sx={{ fontSize:11, color:DL.tS, fontWeight:500 }}>{label}</Typography>
      <Typography sx={{ fontSize:11, color:DL.tH, fontWeight: 500, ...valueStyle }}>{value}</Typography>
    </Box>
  );

  // Título pequeño de cada bloque del modal (con la barrita de color).
  const SecTitle = ({ children }) => (
    <Box sx={{ display:'flex', alignItems:'center', gap:'6px', mb:'8px', mt:'4px' }}>
      <Box sx={{ width:12, height:2, borderRadius:2, background:`linear-gradient(90deg,${DL.blue},${DL.navy})` }} />
      <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.09em', color:DL.tS }}>
        {children}
      </Typography>
    </Box>
  );

  return (
    <Modal open onClose={onClose} closeAfterTransition slots={{ backdrop:Backdrop }}
      slotProps={{ backdrop:{ sx:{ background:'rgba(3,9,25,.5)' } } }}>
      <Box sx={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:860, maxWidth:'96vw', maxHeight:'90vh',
        background:'#fff', borderRadius:'14px',
        boxShadow:'0 24px 64px rgba(0,0,70,.22)',
        display:'flex', flexDirection:'column', overflow:'hidden',
        animation:'mSlideIn .22s ease',
        '@keyframes mSlideIn':{ from:{ opacity:0, transform:'translate(-50%,calc(-50% + 12px)) scale(.98)' }, to:{ opacity:1, transform:'translate(-50%,-50%)' } },
      }}>
        {/* Modal header */}
        <Box sx={{
          px:'24px', pt:'20px', pb:'14px',
          borderBottom:`1px solid ${DL.border}`,
          display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexShrink:0,
        }}>
          <Box>
            <Typography sx={{ fontSize:16, fontWeight: 500, color:DL.tH, letterSpacing:'-.02em' }}>
              Factura #{row.fac}
            </Typography>
            <Typography sx={{ fontSize:11, color:DL.tS, mt:'2px' }}>
              {row.cliFull} · {row.fecha}
            </Typography>
          </Box>
          <Box component="button" onClick={onClose} sx={{
            width:28, height:28, borderRadius:'7px', border:'none',
            background:'rgba(26,26,26,.06)', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:DL.tS, transition:'all .14s',
            '&:hover':{ background:DL.redBg, color:DL.red },
          }}>
            <CloseIcon sx={{ fontSize:16 }} />
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{
          flex:1, overflowY:'auto', p:'18px 24px',
          display:'flex', flexDirection:'column', gap:'16px',
          scrollbarWidth:'thin',
        }}>
          {/* Aviso rojo si la factura tiene Nota de Crédito (nc = true), mostrando su monto. */}
          {row.nc && (
            <Box sx={{
              display:'flex', alignItems:'center', gap:'10px',
              p:'10px 14px', borderRadius:'8px',
              background:'#fff1f0', border:`1px solid ${DL.red}`,
              borderLeft:`4px solid ${DL.red}`,
            }}>
              <Box sx={{
                width:20, height:20, borderRadius:'50%', flexShrink:0,
                background:DL.redBg, color:DL.red,
                border:'1.5px solid #fca5a5',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight: 500,
              }}>!</Box>
              <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.red }}>
                Nota de Crédito aplicada: {row.nc_monto}
              </Typography>
            </Box>
          )}

          {/* Tres cifras clave arriba: total de la factura, margen bruto y saldo pendiente. El saldo se pinta rojo si todavía se debe algo. */}
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
            {[
              { lbl:t('ventas.modal.totalFactura'),   val:fmt$(row.v),             sub:`${row.condpago} · ${row.pago ? t('status.pagado') : t('status.pendiente')}`, valColor:DL.tH },
              { lbl:t('ventas.modal.margenBruto'),    val:`${row.mg.toFixed(1)}%`, sub:`${fmt$(row.v - row.costo)} sobre costo`,                  valColor:mgColor },
              { lbl:t('ventas.modal.saldoPendiente'), val:fmt$(row.pend),          sub:`Vence: ${row.vence}`,                                     valColor:row.pend > 0 ? DL.red : DL.green },
            ].map(k => (
              <Box key={k.lbl} sx={{ background:'rgba(26,26,26,.03)', borderRadius:'10px', p:'14px 16px' }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.08em', color:DL.tS, mb:'6px' }}>
                  {k.lbl}
                </Typography>
                <Typography sx={{ fontSize:26, fontWeight: 500, color:k.valColor, letterSpacing:'-.04em', lineHeight:1 }}>
                  {k.val}
                </Typography>
                <Typography sx={{ fontSize:10, color:DL.tS, mt:'4px' }}>{k.sub}</Typography>
              </Box>
            ))}
          </Box>

          {/* 2-col info grid */}
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <Box>
              <SecTitle>{t('ventas.modal.infoCliente')}</SecTitle>
              <InfoRow label={t('col.cliente')}              value={row.cliFull} />
              <InfoRow label={t('col.canal')}                value={row.canal} />
              <InfoRow label={t('col.vendedor')}             value={row.vendFull} />
              <InfoRow label={t('ventas.modal.condPago')}    value={row.condpago} />
            </Box>
            <Box>
              <SecTitle>{t('ventas.modal.infoFactura')}</SecTitle>
              <InfoRow label={t('ventas.modal.noFactura')}       value={row.nofac} />
              <InfoRow label={t('col.tipo')}                     value={row.tipo} />
              <InfoRow label={t('ventas.modal.fechaEmision')}    value={row.fecha} />
              <InfoRow label={t('ventas.modal.fechaVencimiento')} value={row.vence} valueStyle={{ color: row.pend > 0 ? DL.red : DL.tH }} />
            </Box>
          </Box>

          {/* Detalle de productos: cada línea de la factura con cantidad, precio unitario, total, costo y margen. */}
          <Box>
            <SecTitle>Detalle de Productos</SecTitle>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[t('col.producto'),t('col.sku'),t('lbl.cant'),t('col.pu'),t('col.total'),t('col.costo'),'Mg%'].map(h => (
                      <TableCell key={h} sx={{
                        fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em',
                        color:DL.tS, borderBottom:`2px solid rgba(26,26,26,.08)`,
                        background:'rgba(26,26,26,.025)', px:'10px',
                      }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.lines.map((l, i) => (
                    <TableRow key={i} sx={{ '&:hover td':{ background:'rgba(84,126,105,.025)' } }}>
                      <TableCell sx={{ fontSize:11, fontWeight: 500, color:DL.tH, px:'10px' }}>{l.prod}</TableCell>
                      <TableCell sx={{ fontSize:10, color:DL.tS, px:'10px' }}>{l.sku}</TableCell>
                      <TableCell sx={{ fontSize:11, color:DL.tM, textAlign:'right', px:'10px' }}>{l.qty}</TableCell>
                      <TableCell sx={{ fontSize:11, color:DL.tM, textAlign:'right', px:'10px' }}>{fmt$(l.pu)}</TableCell>
                      <TableCell sx={{ fontSize:11, fontWeight: 500, color:DL.tH, textAlign:'right', px:'10px' }}>{fmt$(l.tot)}</TableCell>
                      <TableCell sx={{ fontSize:11, color:DL.tS, textAlign:'right', px:'10px' }}>{fmt$(l.costo)}</TableCell>
                      <TableCell sx={{ px:'10px' }}><MgChip mg={l.mg} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Pie del modal: rentabilidad (venta, costo y margen) y estado de cobro con barra de progreso (cobrado vs pendiente). */}
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <Box>
              <SecTitle>{t('ventas.modal.rentabilidad')}</SecTitle>
              <InfoRow label={t('ventas.modal.ventaNeta')}    value={fmt$(row.v)} />
              <InfoRow label={t('ventas.modal.costoTotal')}   value={fmt$(row.costo)} />
              <InfoRow label={t('ventas.modal.margenDolares')} value={fmt$(row.v - row.costo)} />
              <InfoRow label={t('ventas.modal.margenPct')}    value={`${row.mg.toFixed(1)}%`} valueStyle={{ color:mgColor }} />
            </Box>
            <Box>
              <SecTitle>{t('ventas.modal.estadoCobro')}</SecTitle>
              <InfoRow label={t('ventas.modal.totalFacturado')} value={fmt$(row.v)} />
              <InfoRow label={t('ventas.modal.totalAbonado')}   value={fmt$(row.abono)} />
              <InfoRow label={t('col.pendiente')}               value={fmt$(row.pend)} valueStyle={{ color: row.pend > 0 ? DL.red : DL.green }} />
              <Box sx={{ mt:'10px' }}>
                <Box sx={{ height:10, background:DL.redBg, borderRadius:'6px', overflow:'hidden' }}>
                  <Box sx={{ height:'100%', background:DL.green, borderRadius:'6px', width:`${cobradoPct}%`, transition:'width .8s ease' }} />
                </Box>
                <Box sx={{ display:'flex', justifyContent:'space-between', mt:'4px' }}>
                  <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.green }}>{t('ventas.modal.pagadoX').replace('{x}', cobradoPct)}</Typography>
                  <Typography sx={{ fontSize:9, fontWeight: 500, color: row.pend > 0 ? DL.red : DL.tS }}>{t('ventas.modal.pendienteY').replace('{y}', pendientePct)}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

// ─── Column Picker Popover ────────────────────────────────────────────────────
// Objetivo: lista de casillas para elegir qué columnas de la tabla de facturas se ven.
// Props: cols (configuración de columnas), setCols (actualiza el estado del padre), onClose.
// Las columnas "fijas" aparecen deshabilitadas porque siempre deben verse.
function ColPickerPopover({ cols, setCols, onClose }) {
  const { t } = useT();
  return (
    <Box sx={{
      position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:200,
      background:'#fff', borderRadius:'10px',
      border:`1px solid ${DL.border2}`,
      boxShadow:DL.e2,
      p:'12px', minWidth:200,
    }}>
      <Typography sx={{ fontSize:9, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, mb:'8px' }}>
        {t('lbl.colVisibles')}
      </Typography>
      {cols.map((c, i) => (
        <Box key={c.key} sx={{ display:'flex', alignItems:'center', gap:'8px', py:'4px', opacity:c.fixed ? 0.5 : 1 }}>
          <Box
            component="input" type="checkbox" checked={c.vis} disabled={c.fixed}
            // Se crea una copia nueva del arreglo cambiando solo la columna tocada (el estado no se modifica directamente).
            onChange={() => {
              if (c.fixed) return;
              setCols(prev => prev.map((x, j) => j === i ? { ...x, vis:!x.vis } : x));
            }}
            sx={{ cursor:c.fixed ? 'default' : 'pointer', accentColor:DL.blue }}
          />
          <Typography sx={{ fontSize:10, color:c.fixed ? DL.tS : DL.tH, fontWeight:500 }}>
            {c.label}
          </Typography>
          {c.fixed && <Typography sx={{ fontSize:8, color:DL.tS }}>{t('lbl.fijo')}</Typography>}
        </Box>
      ))}
      <Box component="button" onClick={onClose} sx={{
        mt:'8px', width:'100%', py:'5px', borderRadius:'6px',
        border:`1px solid ${DL.border2}`, background:'#fff',
        fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight: 500, color:DL.tM,
        cursor:'pointer', '&:hover':{ borderColor:DL.blue, color:DL.blue },
      }}>
        {t('btn.close')}
      </Box>
    </Box>
  );
}

// ─── Facturas (Detalles de Venta) card ────────────────────────────────────────
// Objetivo: tabla de facturas con pestañas (todas / pagadas / pendientes), búsqueda, columnas configurables,
// paginación y detalle al hacer clic en una fila. No recibe props; los datos salen de INV_DATA.
function FacturasCard() {
  const { t } = useT();
  // Estado: pestaña, página, búsqueda, columnas visibles (copia de la configuración inicial), selector abierto y factura elegida.
  const [invTab,       setInvTab]       = useState('todas');
  const [invPage,      setInvPage]      = useState(1);
  const [invSearch,    setInvSearch]    = useState('');
  const [invCols,      setInvCols]      = useState(INV_COLS_CFG.map(c => ({ ...c })));
  const [colPickerOpen,setColPickerOpen]= useState(false);
  const [selectedInv,  setSelectedInv]  = useState(null);
  // pickerRef apunta al botón de columnas; sirve para detectar clics fuera y cerrar el selector.
  const pickerRef = useRef(null);
  const PAGE_SIZE = 7;

  useEffect(() => {
    // Cierra el selector si el clic fue fuera de él. El listener se quita al desmontar para no dejar fugas de memoria.
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setColPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtros de la tabla: primero por pestaña (pagadas/pendientes) y luego por texto (ID de factura o cliente).
  // useMemo evita refiltrar en cada render; solo se recalcula si cambian la pestaña o la búsqueda.
  const allFiltered = useMemo(() => {
    let rows = INV_DATA;
    if (invTab === 'pagadas')    rows = rows.filter(r => r.pago);
    if (invTab === 'pendientes') rows = rows.filter(r => !r.pago);
    if (invSearch) rows = rows.filter(r =>
      r.fac.toLowerCase().includes(invSearch.toLowerCase()) ||
      r.cli.toLowerCase().includes(invSearch.toLowerCase())
    );
    return rows;
  }, [invTab, invSearch]);

  // Paginación: total de páginas, filas de la página actual y columnas marcadas como visibles.
  const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE);
  const pageRows   = allFiltered.slice((invPage - 1) * PAGE_SIZE, invPage * PAGE_SIZE);
  const visCols    = invCols.filter(c => c.vis);

  const handleTabChange = (v) => { setInvTab(v); setInvPage(1); };

  // Objetivo: decidir qué mostrar en cada celda según la columna (key). Por qué un switch: la tabla es dinámica,
  // cada columna tiene su propio formato (color, moneda, etiqueta N.C.). Pendiente > 0 se pinta en rojo.
  const renderCell = (r, col) => {
    switch (col.key) {
      case 'fac':
        return <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.blue, whiteSpace:'nowrap' }}>{r.fac}</Typography>;
      case 'cli':
        return <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, whiteSpace:'nowrap' }}>{r.cli}</Typography>;
      case 'nofac':
        return <Typography sx={{ fontSize:9, color:DL.tS }}>{r.nofac}</Typography>;
      case 'tipo':
        return <Typography sx={{ fontSize:9, color:DL.tS }}>{r.tipo}</Typography>;
      case 'condpago':
        return <Typography sx={{ fontSize:9, color:DL.tS }}>{r.condpago}</Typography>;
      case 'canal':
        return <Typography sx={{ fontSize:10, color:DL.tM }}>{r.canal}</Typography>;
      case 'vend':
        return <Typography sx={{ fontSize:10, color:DL.tM }}>{r.vend}</Typography>;
      case 'fecha':
        return <Typography sx={{ fontSize:10, color:DL.tS, whiteSpace:'nowrap' }}>{r.fecha}</Typography>;
      case 'vence':
        return <Typography sx={{ fontSize:10, color: r.pend > 0 ? DL.red : DL.tS, whiteSpace:'nowrap' }}>{r.vence}</Typography>;
      case 'qty':
        return <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tM }}>{r.qty}</Typography>;
      case 'v':
        return <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, whiteSpace:'nowrap' }}>{fmt$(r.v)}</Typography>;
      case 'nc':
        return r.nc
          ? <Box sx={{ display:'inline-block', px:'6px', py:'2px', borderRadius:'4px', background:DL.redBg, color:DL.red, fontSize:9, fontWeight: 500, whiteSpace:'nowrap' }}>{r.nc_monto}</Box>
          : <Typography sx={{ fontSize:10, color:DL.tS }}>—</Typography>;
      case 'costo':
        return <Typography sx={{ fontSize:10, color:DL.tS, whiteSpace:'nowrap' }}>{fmt$(r.costo)}</Typography>;
      case 'mg':
        return <MgChip mg={r.mg} />;
      case 'abono':
        return <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.green, whiteSpace:'nowrap' }}>{fmt$(r.abono)}</Typography>;
      case 'pend':
        return <Typography sx={{ fontSize:11, fontWeight: 500, color:r.pend > 0 ? DL.red : DL.tS, whiteSpace:'nowrap' }}>{r.pend > 0 ? fmt$(r.pend) : '$0'}</Typography>;
      case 'estado':
        return <StatusChip pago={r.pago} />;
      default:
        return null;
    }
  };

  // Pestañas de la tabla de facturas.
  const INV_TABS = [
    { value:'todas',      label: t('ventas.tab.todas')      },
    { value:'pagadas',    label: t('ventas.tab.pagadas')    },
    { value:'pendientes', label: t('ventas.tab.pendientes') },
  ];

  return (
    <>
      <Card>
        {/* Encabezado: título, buscador y selector de columnas (con su popover). */}
        <Box sx={{
          display:'flex', alignItems:'center', px:'14px', py:'8px',
          borderBottom:`1px solid ${DL.border}`,
          gap:'8px', flexWrap:'wrap',
        }}>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, whiteSpace:'nowrap', mr:'4px' }}>
            Detalles de Venta
          </Typography>
          <Box sx={{ flex:1 }} />
          {/* Search */}
          <Box sx={{
            display:'flex', alignItems:'center', gap:'5px',
            border:`1px solid ${DL.border2}`, borderRadius:'7px',
            px:'9px', py:'5px', background:'#fafafa',
            '&:focus-within':{ borderColor:DL.blue, background:'#fff' },
          }}>
            <Typography sx={{ fontSize:10, color:DL.tS, lineHeight:1 }}>🔍</Typography>
            <Box
              component="input"
              placeholder={t('btn.search')}
              value={invSearch}
              onChange={e => { setInvSearch(e.target.value); setInvPage(1); }}
              sx={{
                border:'none', outline:'none', background:'transparent',
                fontFamily:"'Inter',sans-serif", fontSize:10, color:DL.tM,
                width:110,
              }}
            />
          </Box>
          {/* Columns picker */}
          <Box ref={pickerRef} sx={{ position:'relative' }}>
            <Box component="button" onClick={() => setColPickerOpen(o => !o)} sx={{
              fontFamily:"'Inter',sans-serif",
              fontSize:9, fontWeight: 500,
              px:'10px', py:'5px', borderRadius:'7px',
              border:`1px solid ${DL.border2}`, background:'#fff', color:DL.tM,
              cursor:'pointer', display:'flex', alignItems:'center', gap:'5px',
              transition:'all .14s',
              '&:hover':{ borderColor:DL.blue, color:DL.navy },
            }}>
              <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5px', width:10 }}>
                {[0,1,2,3].map(i => <Box key={i} sx={{ width:4, height:4, background:'currentColor', borderRadius:.5, opacity:.7 }} />)}
              </Box>
              {t('btn.columns')}
            </Box>
            {colPickerOpen && (
              <ColPickerPopover cols={invCols} setCols={setInvCols} onClose={() => setColPickerOpen(false)} />
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{
          display:'flex', borderBottom:`1px solid ${DL.border}`,
          px:'8px', pt:'4px',
          overflowX:'auto', '&::-webkit-scrollbar':{ display:'none' },
        }}>
          {INV_TABS.map(t => (
            <Box key={t.value} component="button" onClick={() => handleTabChange(t.value)} sx={{
              fontFamily:"'Inter',sans-serif",
              fontSize:10, fontWeight:500,
              px:'12px', py:'6px',
              border:'none', borderBottom:`2px solid ${invTab === t.value ? DL.blue : 'transparent'}`,
              mb:'-1px', background:'transparent',
              color: invTab === t.value ? DL.navy : DL.tS,
              cursor:'pointer', whiteSpace:'nowrap', transition:'all .14s',
              '&:hover':{ color:DL.tM },
            }}>
              {t.label}
            </Box>
          ))}
        </Box>

        {/* Tabla dinámica: solo se dibujan las columnas visibles; hacer clic en una fila abre el modal de esa factura. */}
        <Box sx={{ overflowX:'auto' }}>
          <Table size="small" sx={{ minWidth:700 }}>
            <TableHead>
              <TableRow>
                {visCols.map(c => (
                  <TableCell key={c.key} sx={{
                    fontSize:11, fontWeight: 500, textTransform:'none',
                    letterSpacing:0, color:DL.tH,
                    background:'transparent',
                    borderBottom:`1px solid ${DL.tH}`,
                    px:'10px', py:'7px', whiteSpace:'nowrap',
                    textAlign:c.center ? 'center' : 'left',
                  }}>
                    {c.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map(r => (
                <TableRow key={r.fac}
                  onClick={() => setSelectedInv(r)}
                  sx={{
                    cursor:'pointer',
                    borderBottom:`1px dotted ${DL.border2}`,
                    '&:hover td':{ background:'#fafafa' },
                  }}
                >
                  {visCols.map(c => (
                    <TableCell key={c.key} sx={{ px:'10px', py:'11px', textAlign:c.center ? 'center' : 'left' }}>
                      {renderCell(r, c)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Pie con el rango mostrado y los botones de paginación (primera, anterior, números, siguiente, última). */}
        <Box sx={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          px:'14px', py:'10px',
          borderTop:`1px solid ${DL.border}`,
        }}>
          <Typography sx={{ fontSize:9, color:DL.tS }}>
            {(invPage - 1) * PAGE_SIZE + 1}–{Math.min(invPage * PAGE_SIZE, allFiltered.length)} {t('ventas.footer.deFacturas').replace('{n}', allFiltered.length)}
          </Typography>
          <Box sx={{ display:'flex', gap:'2px' }}>
            {[['|◀', 1], ['◀', Math.max(invPage - 1, 1)]].map(([label, target]) => (
              <Box key={label} component="button"
                onClick={() => setInvPage(Number(target))}
                disabled={invPage === 1}
                sx={{
                  minWidth:26, height:26, borderRadius:'5px',
                  border:`1px solid ${DL.border}`, background:'#fff',
                  fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight: 500,
                  color:DL.tM, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  '&:disabled':{ opacity:.3, cursor:'default' },
                  '&:hover:not(:disabled)':{ borderColor:DL.blue },
                }}
              >{label}</Box>
            ))}
            {Array.from({ length:totalPages }, (_, i) => (
              <Box key={i} component="button"
                onClick={() => setInvPage(i + 1)}
                sx={{
                  minWidth:26, height:26, borderRadius:'5px',
                  border:`1px solid ${(i+1) === invPage ? DL.blue : DL.border}`,
                  background:(i+1) === invPage ? DL.blue : '#fff',
                  fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight: 500,
                  color:(i+1) === invPage ? '#fff' : DL.tM,
                  cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  '&:hover':{ borderColor:DL.blue },
                }}
              >{i + 1}</Box>
            ))}
            {[['▶', Math.min(invPage + 1, totalPages)], ['▶|', totalPages]].map(([label, target]) => (
              <Box key={label} component="button"
                onClick={() => setInvPage(Number(target))}
                disabled={invPage === totalPages}
                sx={{
                  minWidth:26, height:26, borderRadius:'5px',
                  border:`1px solid ${DL.border}`, background:'#fff',
                  fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight: 500,
                  color:DL.tM, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  '&:disabled':{ opacity:.3, cursor:'default' },
                  '&:hover:not(:disabled)':{ borderColor:DL.blue },
                }}
              >{label}</Box>
            ))}
          </Box>
        </Box>
      </Card>

      {selectedInv && (
        <InvoiceModal row={selectedInv} onClose={() => setSelectedInv(null)} />
      )}
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
// Objetivo: pantalla completa del dashboard de Ventas. Junta el encabezado, los KPI, la gráfica histórica,
// las alertas y las dos tablas. Aquí vive el estado que comparten los componentes de arriba.
export default function Ventas() {
  const { t } = useT();
  // Estado de los filtros del encabezado y de la gráfica histórica (gran / split). Los filtros aún no afectan los datos.
  const [periodo,   setPeriodo]   = useState('ytd2025');
  const [categoria, setCategoria] = useState('todas');
  const [canal,     setCanal]     = useState('todos');
  const [vendedor,  setVendedor]  = useState('todos');
  const [gran,      setGran]      = useState('mes');
  const [split,     setSplit]     = useState('general');

  // drawerKpi guarda el KPI elegido (null = drawer cerrado).
  const [drawerKpi, setDrawerKpi] = useState(null);

  // Espera entre actualizaciones: el botón se bloquea 30 minutos después de usarlo. Por qué localStorage:
  // así la espera sigue aunque se recargue la página. Es una simulación: actualizar solo guarda la hora, no recarga datos.
  const COOLDOWN_MS = 30 * 60 * 1000;
  const STORAGE_KEY = 'ventas_last_refresh';
  // Milisegundos que faltan para poder actualizar de nuevo (nunca negativo).
  const getRemaining = () => {
    const last = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    return Math.max(0, COOLDOWN_MS - (Date.now() - last));
  };
  const [refreshRemaining, setRefreshRemaining] = useState(getRemaining);
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    if (refreshRemaining <= 0) return;
    refreshTimerRef.current = setInterval(() => {
      const rem = getRemaining();
      setRefreshRemaining(rem);
      if (rem <= 0) clearInterval(refreshTimerRef.current);
    }, 1000);
    return () => clearInterval(refreshTimerRef.current);
  }, [refreshRemaining > 0]);

  // Convierte una marca de tiempo en texto "dd/mm/aaaa hh:mm" en formato 12 horas.
  const fmtLastUpdate = (ts) => {
    const d = new Date(ts);
    const date = d.toLocaleDateString('es-GT', { day:'2-digit', month:'2-digit', year:'numeric' });
    const time = d.toLocaleTimeString('es-GT', { hour:'2-digit', minute:'2-digit', hour12:true });
    return `${date} ${time}`;
  };

  // Última actualización guardada; si nunca se actualizó, abajo se usa una fecha de demostración fija.
  const lastRefreshTs = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  const [lastUpdateLabel, setLastUpdateLabel] = useState(
    lastRefreshTs ? fmtLastUpdate(lastRefreshTs) : '5/07/2025 02:00 pm'  // fallback demo date
  );

  // Al actualizar: se ignora si aún hay espera, se guarda la hora, se reinicia la cuenta regresiva y se actualiza la etiqueta.
  const handleRefresh = useCallback(() => {
    if (refreshRemaining > 0) return;
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, String(now));
    setRefreshRemaining(COOLDOWN_MS);
    setLastUpdateLabel(fmtLastUpdate(now));
  }, [refreshRemaining]);

  // Formatea los milisegundos restantes como "mm:ss".
  const fmtCooldown = (ms) => {
    const total = Math.ceil(ms / 1000);
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Objetivo: descargar un archivo Excel (.xlsx) con dos hojas: "KPIs" y "Facturas", usando la librería xlsx.
  // Los nombres de columnas se escriben legibles porque es lo que verá quien abra el archivo.
  function exportToExcel() {
    const wb = XLSX.utils.book_new();
    // Ajusta el ancho de cada columna al texto más largo (mínimo 10, máximo 40 caracteres) para que se lea bien en Excel.
    const autoWidth = ws => {
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      const widths = [];
      for (let C = range.s.c; C <= range.e.c; C++) {
        let max = 10;
        for (let R = range.s.r; R <= range.e.r; R++) {
          const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
          if (cell && cell.v != null) { const len = String(cell.v).length; if (len > max) max = len; }
        }
        widths.push({ wch: Math.min(max + 2, 40) });
      }
      ws['!cols'] = widths;
    };

    // Sheet 1: KPIs
    const kpiRows = VENTAS_KPIS.map(k => ({
      KPI: k.label,
      Valor: k.value,
      Meta: k.meta,
      '% de Meta': k.pct + '%',
      'vs Año Ant.': k.delta,
    }));
    const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
    autoWidth(wsKpi);
    XLSX.utils.book_append_sheet(wb, wsKpi, 'KPIs');

    // Sheet 2: Facturas / Ventas detalle
    const invRows = INV_DATA.map(r => ({
      'ID Factura': r.fac,
      Cliente: r.cli,
      'N° Factura': r.nofac,
      Tipo: r.tipo,
      Canal: r.canal,
      Vendedor: r.vend,
      'Fecha Emisión': r.fecha,
      Vencimiento: r.vence,
      Cantidad: r.qty,
      'Venta $': r.v,
      'Costo $': r.costo,
      'Margen %': r.mg,
      'Abono $': r.abono,
      'Pendiente $': r.pend,
      Estado: r.pago ? 'Pagado' : 'Pendiente',
    }));
    const wsInv = XLSX.utils.json_to_sheet(invRows);
    autoWidth(wsInv);
    XLSX.utils.book_append_sheet(wb, wsInv, 'Facturas');

    // El nombre del archivo lleva la fecha (AAAAMMDD) para no sobrescribir descargas de otros días.
    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    XLSX.writeFile(wb, `Ventas_${stamp}.xlsx`);
  }

  return (
    <Box>
      {/* Encabezado con filtros. El botón de actualizar recibe el tiempo restante para bloquearse y el de descargar llama a exportToExcel. */}
      <PageHeader
        title={t('page.ventas')}
        live={true}
        onRefresh={handleRefresh}
        refreshDisabled={refreshRemaining > 0}
        refreshCooldown={refreshRemaining}
        onExport={exportToExcel}
      >
        <MiniSelect
          label="Período"
          value={periodo}
          onChange={setPeriodo}
          options={[
            { value:'ytd2025', label:'1 ene - 6 abr 2026' },
            { value:'jul2025', label:'Jul 2025' },
            { value:'jun2025', label:'Jun 2025' },
            { value:'custom',  label:'Personalizado' },
          ]}
        />
        <MiniSelect
          label="Categoría"
          value={categoria}
          onChange={setCategoria}
          options={[
            { value:'todas',      label:'Todas'        },
            { value:'agricola',   label:'Agrícola'     },
            { value:'veterinario',label:'Veterinario'  },
            { value:'semillas',   label:'Semillas'     },
            { value:'menores',    label:'Esp. Menores' },
          ]}
        />
        <MiniSelect
          label="Canal"
          value={canal}
          onChange={setCanal}
          options={[
            { value:'todos',   label:'Todos'          },
            { value:'central', label:'Tienda Central' },
            { value:'suc1',    label:'Sucursal No.1'  },
            { value:'suc2',    label:'Sucursal No.2'  },
            { value:'ecom',    label:'E-Commerce'     },
          ]}
        />
        <MiniSelect
          label="Vendedor"
          value={vendedor}
          onChange={setVendedor}
          options={[
            { value:'todos',     label:'Todos'              },
            { value:'guerra',    label:'David Guerra'       },
            { value:'zamora',    label:'Robinson Zamora'    },
            { value:'quinonez',  label:'Estuardo Quiñonez'  },
            { value:'directa',   label:'Tienda Directa'     },
          ]}
        />
      </PageHeader>

      {/* Panel lateral de explicación; recibe el KPI elegido y su texto desde KPI_INTEL. */}
      <KpiDrawer
        open={!!drawerKpi}
        onClose={() => setDrawerKpi(null)}
        kpiLabel={drawerKpi?.label}
        kpiValue={drawerKpi?.value}
        accentColor={drawerKpi?.accentColor}
        intel={drawerKpi ? KPI_INTEL[drawerKpi.id] : null}
      />

      {/* Contenido de la página: columna con separación uniforme entre secciones. */}
      <Box sx={{ p:{ xs:'10px', md:'16px' }, display:'flex', flexDirection:'column', gap:'16px' }}>
        {/* KPI section header + cards */}
        <Box>
          <KpiRow onKpiClick={setDrawerKpi} />
        </Box>

        {/* En escritorio la gráfica ocupa el espacio libre y las alertas una columna fija de 280 px; en celular se apilan. */}
        <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'1fr 280px' }, gap:'16px', alignItems:'start' }}>
          <HistoricoCard gran={gran} setGran={setGran} split={split} setSplit={setSplit} />
          <AlertasSistema alerts={ventasAlerts} />
        </Box>

        {/* Ventas Por — full width */}
        <VporCard />

        {/* Detalles de Venta — full width */}
        <FacturasCard />
      </Box>
    </Box>
  );
}
