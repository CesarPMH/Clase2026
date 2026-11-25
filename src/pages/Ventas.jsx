// ─── Dashboard de Ventas ──────────────────────────────────────────────────────
// Objetivo: ¿Cómo vamos en ventas vs. meta y año anterior?
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
const fmt$ = (v) => `$${Number(v).toLocaleString()}`;

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
const selectSx = {
  fontSize:10, fontWeight:500, color:'#3f3f3f',
  border:`1px solid ${DL.border2}`, borderRadius:'6px',
  px:'7px', py:'3px', background:'#fff',
  fontFamily:"'Inter',sans-serif",
  cursor:'pointer', outline:'none',
  '&:focus':{ borderColor:DL.blue },
};

// ─── KPI Cards ────────────────────────────────────────────────────────────────
function KpiRow({ onKpiClick }) {
  return (
    <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'repeat(2,1fr)', sm:'repeat(4,1fr)', md:'repeat(7,minmax(0,1fr))' }, gap:'10px' }}>
      {VENTAS_KPIS.map(k => (
        <KpiCard
          key={k.id}
          lbl={k.label} val={k.value} pct={k.pct}
          meta={k.meta} metaLbl={k.metaLabel || 'Meta'}
          diff={k.metaDelta} diffUp={k.metaDeltaUp}
          yoyPrev={String(k.yoy).replace(/^vs\s+año\s+ant\.?\s*/i, '')}
          yoyDelta={k.delta} yoyUp={k.deltaUp}
          onInfo={KPI_INTEL[k.id] ? () => onKpiClick(k) : undefined}
        />
      ))}
    </Box>
  );
}

// VENTAS_ALERTS uses { type:'r'|'y'|'g', msg } — mapped to tier for shared component
const ventasAlerts = VENTAS_ALERTS.map(a => ({ tier: a.type, msg: a.msg }));

// ─── Histórico de Ventas card ─────────────────────────────────────────────────
function HistoricoCard({ gran, setGran, split, setSplit }) {
  const { t } = useT();
  const [valMode, setValMode] = useState('$');

  const histOption = useMemo(() => {
    const d = VENTAS_HIST[split]?.[gran] || VENTAS_HIST.general.mes;
    const series = d.datasets.map(ds => ({
      name: ds.label, type:'bar',
      data: ds.data,
      barMaxWidth:14, barGap:'8%', barCategoryGap:'35%',
      itemStyle:{ color:ds.color, borderRadius:[3,3,0,0] },
      emphasis:{ focus:'series' },
    }));
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
          <Box sx={{ display:'flex', alignItems:'center', gap:'5px' }}>
            <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              {t('view.vista')}
            </Typography>
            <Box component="select" value={gran} onChange={e => setGran(e.target.value)} sx={selectSx}>
              <option value="mes">{t('time.mes')}</option>
              <option value="trim">{t('time.trimestral')}</option>
            </Box>
          </Box>
          {/* SPLIT BY */}
          <Box sx={{ display:'flex', alignItems:'center', gap:'5px' }}>
            <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              {t('view.splitBy')}
            </Typography>
            <Box component="select" value={split} onChange={e => setSplit(e.target.value)} sx={selectSx}>
              <option value="general">{t('time.mes')}</option>
              <option value="categoria">{t('filter.categoria')}</option>
            </Box>
          </Box>
          {/* $ / Cant. toggle */}
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
      {/* Legend row */}
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
function VporCard() {
  const { t } = useT();
  const [vporTab,    setVporTab]    = useState('producto');
  const [vporSearch, setVporSearch] = useState('');
  const [vporPage,   setVporPage]   = useState(1);
  const VPOR_PAGE_SIZE = 7;

  const TABS = [
    { value:'producto',  label: t('ventas.top.productos') },
    { value:'categoria', label: t('ventas.top.categoria') },
    { value:'canal',     label: t('ventas.top.canal')     },
    { value:'vendedor',  label: t('ventas.top.vendedor')  },
    { value:'region',    label: t('ventas.top.region')    },
    { value:'cliente',   label: t('ventas.top.cliente')   },
  ];

  const entityLabel = {
    producto: t('ventas.top.productos'), categoria: t('ventas.top.categoria'), canal: t('ventas.top.canal'),
    vendedor: t('ventas.top.vendedor'),  region: t('ventas.top.region'),        cliente: t('ventas.top.cliente'),
  }[vporTab] || t('lbl.nombre');

  const colLabel = {
    producto: t('ventas.top.productos'), categoria: t('ventas.top.categoria'), canal: t('ventas.top.canal'),
    vendedor: t('ventas.top.vendedor'),  region: t('ventas.top.region'),        cliente: t('ventas.top.cliente'),
  }[vporTab] || t('lbl.nombre');

  const allRows = VPOR_DATA[vporTab] || [];
  const filteredRows = vporSearch
    ? allRows.filter(r => r.name.toLowerCase().includes(vporSearch.toLowerCase()))
    : allRows;
  const totalPages = Math.ceil(filteredRows.length / VPOR_PAGE_SIZE);
  const rows = filteredRows.slice((vporPage - 1) * VPOR_PAGE_SIZE, vporPage * VPOR_PAGE_SIZE);

  const handleTabChange = (v) => { setVporTab(v); setVporPage(1); setVporSearch(''); };

  const vsColor = (va) => va >= 0 ? DL.green   : DL.red;
  const vsBg    = (va) => va >= 0 ? DL.greenBg  : DL.redBg;

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
          {/* Columns button */}
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

      {/* Body: Chart left + Table right */}
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

      {/* Footer: legend + showing + pagination */}
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
function InvoiceModal({ row, onClose }) {
  const { t } = useT();
  if (!row) return null;
  const cobradoPct    = row.v > 0 ? Math.round(row.abono / row.v * 100) : 100;
  const pendientePct  = 100 - cobradoPct;
  const mgColor       = row.mg >= 25 ? DL.green : row.mg >= 15 ? DL.yellow : DL.red;

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
          {/* NC warning banner */}
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

          {/* Top 3 stat boxes */}
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

          {/* Product lines */}
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

          {/* Footer: Rentabilidad + Estado de Cobro */}
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
function FacturasCard() {
  const { t } = useT();
  const [invTab,       setInvTab]       = useState('todas');
  const [invPage,      setInvPage]      = useState(1);
  const [invSearch,    setInvSearch]    = useState('');
  const [invCols,      setInvCols]      = useState(INV_COLS_CFG.map(c => ({ ...c })));
  const [colPickerOpen,setColPickerOpen]= useState(false);
  const [selectedInv,  setSelectedInv]  = useState(null);
  const pickerRef = useRef(null);
  const PAGE_SIZE = 7;

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setColPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE);
  const pageRows   = allFiltered.slice((invPage - 1) * PAGE_SIZE, invPage * PAGE_SIZE);
  const visCols    = invCols.filter(c => c.vis);

  const handleTabChange = (v) => { setInvTab(v); setInvPage(1); };

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

  const INV_TABS = [
    { value:'todas',      label: t('ventas.tab.todas')      },
    { value:'pagadas',    label: t('ventas.tab.pagadas')    },
    { value:'pendientes', label: t('ventas.tab.pendientes') },
  ];

  return (
    <>
      <Card>
        {/* Plain white header: title + tabs + search + columns */}
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

        {/* Table */}
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

        {/* Pagination footer */}
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
export default function Ventas() {
  const { t } = useT();
  const [periodo,   setPeriodo]   = useState('ytd2025');
  const [categoria, setCategoria] = useState('todas');
  const [canal,     setCanal]     = useState('todos');
  const [vendedor,  setVendedor]  = useState('todos');
  const [gran,      setGran]      = useState('mes');
  const [split,     setSplit]     = useState('general');

  // KPI Intelligence Drawer
  const [drawerKpi, setDrawerKpi] = useState(null);

  // Refresh cooldown — 30 min, persisted in localStorage
  const COOLDOWN_MS = 30 * 60 * 1000;
  const STORAGE_KEY = 'ventas_last_refresh';
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

  const fmtLastUpdate = (ts) => {
    const d = new Date(ts);
    const date = d.toLocaleDateString('es-GT', { day:'2-digit', month:'2-digit', year:'numeric' });
    const time = d.toLocaleTimeString('es-GT', { hour:'2-digit', minute:'2-digit', hour12:true });
    return `${date} ${time}`;
  };

  const lastRefreshTs = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  const [lastUpdateLabel, setLastUpdateLabel] = useState(
    lastRefreshTs ? fmtLastUpdate(lastRefreshTs) : '5/07/2025 02:00 pm'  // fallback demo date
  );

  const handleRefresh = useCallback(() => {
    if (refreshRemaining > 0) return;
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, String(now));
    setRefreshRemaining(COOLDOWN_MS);
    setLastUpdateLabel(fmtLastUpdate(now));
  }, [refreshRemaining]);

  const fmtCooldown = (ms) => {
    const total = Math.ceil(ms / 1000);
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  function exportToExcel() {
    const wb = XLSX.utils.book_new();
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

    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    XLSX.writeFile(wb, `Ventas_${stamp}.xlsx`);
  }

  return (
    <Box>
      {/* Page Header */}
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

      {/* KPI Intelligence Drawer */}
      <KpiDrawer
        open={!!drawerKpi}
        onClose={() => setDrawerKpi(null)}
        kpiLabel={drawerKpi?.label}
        kpiValue={drawerKpi?.value}
        accentColor={drawerKpi?.accentColor}
        intel={drawerKpi ? KPI_INTEL[drawerKpi.id] : null}
      />

      <Box sx={{ p:{ xs:'10px', md:'16px' }, display:'flex', flexDirection:'column', gap:'16px' }}>
        {/* KPI section header + cards */}
        <Box>
          <KpiRow onKpiClick={setDrawerKpi} />
        </Box>

        {/* Histórico + Alertas */}
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
