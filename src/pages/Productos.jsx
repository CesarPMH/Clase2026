// ─── Dashboard de Productos y Categorías ──────────────────────────────────────
// Objetivo: ¿Qué productos y categorías generan más valor, margen y rotación?
//           ¿Qué SKUs están en riesgo de quiebre o bajo rendimiento?
//
// UI: MUI · Charts: Apache ECharts (echarts-for-react)

import { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import ReactECharts from 'echarts-for-react';
import {
  Box, Typography, TextField, InputAdornment,
  Chip, Tab, Tabs,
  Paper, IconButton, LinearProgress, Tooltip, Divider,
} from '@mui/material';
import {
  ArrowBack, Search, TrendingUp, ExpandMore, ExpandLess, FiberManualRecord,
  FilterList as FilterListIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import AlertasSistema from '../components/common/AlertasSistema';
import SectionHeader from '../components/common/SectionHeader';
import KpiCard from '../components/common/KpiCard';
import { DL } from '../theme';
import { useT } from '../i18n/LanguageContext';
import {
  PROD_MONTHS, CATS, PRODS, PROD_TREND,
  RFM_SEGS, RFM_PROD, RFM_CAT_PEERS,
  CLI_DATA, CLI_DEFAULT, ESTAC_DATA, ESTAC_DEFAULT,
} from '../data/productos';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt$ = (v) => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
  if (v >= 1000) return `$${Math.round(v / 1000)}K`;
  return `$${v}`;
};

const stockColors = {
  Normal:  { bg: DL.greenBg,  bd: DL.greenBd,  tx: DL.green  },
  Bajo:    { bg: DL.yellowBg, bd: DL.yellowBd,  tx: DL.yellow },
  Crítico: { bg: DL.redBg,    bd: DL.redBd,     tx: DL.red    },
};

const segColors = {
  champions:   '#16a34a',
  dormidos:    '#4d3f32',
  'en-peligro':'#dc2626',
  nuevos:      '#6c6c6c',
  inicio:      '#547e69',
  'alto-valor':'#db2777',
  requiere:    '#ea580c',
  perdidos:    '#6a6a6a',
};

function StockChip({ stock }) {
  const c = stockColors[stock] || stockColors.Normal;
  return (
    <Box sx={{
      display:'inline-flex', alignItems:'center', gap:'3px',
      px:'7px', py:'2px', borderRadius:'4px',
      background: c.bg, border:`1px solid ${c.bd}`,
    }}>
      <FiberManualRecord sx={{ fontSize:6, color:c.tx }} />
      <Typography sx={{ fontSize:8, fontWeight: 500, color:c.tx }}>{stock}</Typography>
    </Box>
  );
}

function DeltaBadge({ val, suffix='', size=9 }) {
  const up = val >= 0;
  return (
    <Box sx={{
      display:'inline-block', px:'5px', py:'1px', borderRadius:'4px',
      fontSize:size, fontWeight: 500,
      background: up ? DL.greenBg : DL.redBg,
      color:       up ? DL.green   : DL.red,
    }}>
      {up ? '+' : ''}{val}{suffix}
    </Box>
  );
}

function MiniKpiCard({ lbl, val, sub, accent, pct, meta }) {
  const { t } = useT();
  const barColor = pct >= 100 ? DL.green : pct >= 80 ? DL.yellow : DL.red;
  return (
    <Box sx={{
      background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`,
      boxShadow:DL.e1, p:'12px 13px 10px', position:'relative', overflow:'hidden',
      flex:1, minWidth:0,
    }}>
      <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, borderRadius:'10px 10px 0 0', background: pct !== undefined ? barColor : (accent || DL.blue) }} />
      <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, mb:'5px', mt:'3px' }}>
        {lbl}
      </Typography>
      <Typography sx={{
        fontSize:20, fontWeight: 500, color:DL.tH, lineHeight:1.05, letterSpacing:'-0.04em',
        pb: pct !== undefined ? '3px' : 0,
        mb: pct !== undefined ? '3px' : '5px',
        borderBottom: pct !== undefined ? '1px solid rgba(26,26,26,.08)' : 'none',
      }}>
        {val}
      </Typography>
      {pct !== undefined && (
        <>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', mb:'4px' }}>
            <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em' }}>{t('lbl.meta')}</Typography>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>{meta}</Typography>
          </Box>
          <Box sx={{ height:9, background:'rgba(26,26,26,.07)', borderRadius:5, overflow:'hidden', mb:'5px' }}>
            <Box sx={{ height:'100%', borderRadius:5, width:`${Math.min(pct,100)}%`, background:barColor, transition:'width .6s ease' }} />
          </Box>
          <Typography sx={{ fontSize:9, fontWeight: 500, color:barColor }}>{pct.toFixed(0)}% {t('lbl.deMeta')}</Typography>
        </>
      )}
      {sub && !pct && (
        <Typography sx={{ fontSize:9, color:DL.tS }}>{sub}</Typography>
      )}
    </Box>
  );
}

// ─── Inventario Estado General data ──────────────────────────────────────────
const INV_CRITICAL = [
  { name:'Concentrado Premium 50kg', min:10, stock:6  },
  { name:'Vacuna Multivalente 10ml', min:8,  stock:3  },
  { name:'Antibiótico Bovino 30ml',  min:5,  stock:2  },
  { name:'Vacuna Bovino Triple',     min:8,  stock:2  },
  { name:'Herbicida Glifosato 1L',   min:20, stock:6  },
  { name:'Fertilizante NPK 50kg',    min:15, stock:4  },
  { name:'Ivermectina 500ml',        min:10, stock:3  },
  { name:'Semilla Maíz Híbrido 5kg', min:50, stock:12 },
  { name:'Calcio Inyectable 500ml',  min:12, stock:5  },
  { name:'Funguicida Sistémico 1L',  min:8,  stock:2  },
  { name:'Ciprofarm 250ml',          min:6,  stock:1  },
  { name:'Desparasitante Bovino 1L', min:10, stock:4  },
  { name:'Vitaminas AD3E 100ml',     min:12, stock:5  },
  { name:'Herbicida 2,4-D 1L',       min:15, stock:3  },
  { name:'Fungicida Manzate 1kg',    min:20, stock:7  },
  { name:'Semilla Sorgo 5kg',        min:30, stock:8  },
  { name:'Zinc Inyectable 100ml',    min:8,  stock:2  },
  { name:'Albendazol 200ml',         min:10, stock:4  },
  { name:'Enrofloxacina 100ml',      min:6,  stock:1  },
];

const TOP_SELLERS_DATA = [
  { rank:1, rankColor:'#f59e0b', name:'Conc. Porcino 40kg',  cat:'Agro', catColor:'#547e69', cant:270, venta:27000, margen:39 },
  { rank:2, rankColor:'#8d8d8d', name:'Sup. Mineral 25kg',   cat:'Agro', catColor:'#547e69', cant:208, venta:18700, margen:35 },
  { rank:3, rankColor:'#b45309', name:'Conc. Premium 50kg',  cat:'Agro', catColor:'#547e69', cant:186, venta:18600, margen:42 },
  { rank:4, rankColor:'#d4d4d4', name:'Conc. Lechero 40kg',  cat:'Agro', catColor:'#547e69', cant:160, venta:16000, margen:37 },
  { rank:5, rankColor:'#d4d4d4', name:'Conc. Engorde 40kg',  cat:'Agro', catColor:'#547e69', cant:130, venta:13000, margen:35 },
];

// ─── Inventario · Estado General panel ───────────────────────────────────────
function InventarioEstadoPanel() {
  const { t } = useT();
  const [page, setPage] = useState(0);
  const PER_PAGE = 5;
  const total = INV_CRITICAL.length;
  const paged = INV_CRITICAL.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const maxPages = Math.ceil(total / PER_PAGE);

  return (
    <Paper sx={{ borderRadius:'10px', boxShadow:DL.e1, border:`1px solid ${DL.border}`, p:'14px 16px', display:'flex', flexDirection:'column', gap:'10px' }}>
      {/* Header */}
      <Box sx={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <Box>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, letterSpacing:'-.3px' }}>
            {t('prod.inv.titulo')}
          </Typography>
          <Typography sx={{ fontSize:9, color:DL.tS, mt:'1px' }}>
            {t('prod.inv.sub')}
          </Typography>
        </Box>
        <Box component="button" sx={{
          display:'flex', alignItems:'center', gap:'5px',
          fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight: 500,
          px:'10px', py:'5px', borderRadius:'7px',
          border:`1px solid ${DL.border2}`, background:'#fff', color:DL.tM,
          cursor:'pointer', transition:'all .14s',
          '&:hover':{ borderColor:DL.blue, color:DL.navy },
        }}>
          <FilterListIcon sx={{ fontSize:13 }} />
          {t('prod.inv.filtrar')}
        </Box>
      </Box>

      {/* Status counts */}
      <Box sx={{ display:'flex', gap:'20px' }}>
        {[
          { label: t('prod.inv.critico'),   val: total,   color: DL.red   },
          { label: t('prod.inv.stockBajo'),val: 154,     color: DL.yellow },
          { label: t('prod.inv.normal'),   val: 1719,    color: DL.tM    },
        ].map(s => (
          <Box key={s.label} sx={{ display:'flex', alignItems:'baseline', gap:'5px' }}>
            <Typography sx={{ fontSize:11, fontWeight: 500, color:s.color }}>{s.label}</Typography>
            <Typography sx={{ fontSize:14, fontWeight: 500, color:DL.tH }}>{s.val}</Typography>
          </Box>
        ))}
      </Box>

      {/* Section label */}
      <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.red }}>
        {t('prod.inv.reorden')}
      </Typography>

      {/* Table header */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 60px 80px 70px', gap:'4px', px:'2px' }}>
        {[t('prod.col.producto'), t('prod.col.min'), t('prod.col.stockAct'), t('prod.col.estado')].map(h => (
          <Typography key={h} sx={{ fontSize:7.5, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS }}>{h}</Typography>
        ))}
      </Box>
      <Divider sx={{ borderColor:'rgba(26,26,26,.07)', my:'-4px' }} />

      {/* Rows */}
      <Box sx={{ display:'flex', flexDirection:'column', gap:'1px' }}>
        {paged.map((row, i) => (
          <Box key={i} sx={{
            display:'grid', gridTemplateColumns:'1fr 60px 80px 70px',
            gap:'4px', px:'2px', py:'7px', alignItems:'center',
            borderBottom: i < paged.length - 1 ? `1px solid rgba(26,26,26,.05)` : 'none',
            borderRadius:'6px',
            '&:hover':{ background:'rgba(84,126,105,.03)' },
          }}>
            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH }}>{row.name}</Typography>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tM }}>{row.min}u</Typography>
            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.red }}>{row.stock}u</Typography>
            <Box sx={{
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              px:'8px', py:'2px', borderRadius:'4px',
              background:DL.redBg, border:`1px solid ${DL.redBd}`,
              width:'fit-content',
            }}>
              <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.red }}>{t('prod.inv.critico')}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Pagination */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mt:'4px' }}>
        <Typography sx={{ fontSize:9, color:DL.tS }}>
          {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, total)} {t('prod.pag.de')} {total} {t('prod.pag.productos')}
        </Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:'4px' }}>
          <Box component="button" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            sx={{ display:'flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'6px', border:`1px solid ${DL.border}`, background:'#fff', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, '&:hover': page > 0 ? { borderColor:DL.blue } : {} }}>
            <ChevronLeftIcon sx={{ fontSize:16, color:DL.tM }} />
          </Box>
          <Box component="button" onClick={() => setPage(p => Math.min(maxPages - 1, p + 1))} disabled={page >= maxPages - 1}
            sx={{ display:'flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'6px', border:`1px solid ${DL.border}`, background:'#fff', cursor: page >= maxPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= maxPages - 1 ? 0.4 : 1, '&:hover': page < maxPages - 1 ? { borderColor:DL.blue } : {} }}>
            <ChevronRightIcon sx={{ fontSize:16, color:DL.tM }} />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

// ─── Productos Más Vendidos panel ─────────────────────────────────────────────
function TopVendidosPanel() {
  const { t } = useT();
  const [sortMode, setSortMode] = useState('venta');

  const sorted = [...TOP_SELLERS_DATA].sort((a, b) =>
    sortMode === 'venta'  ? b.venta  - a.venta  :
    sortMode === 'margen' ? b.margen - a.margen  :
                            b.cant   - a.cant
  ).map((r, i) => ({ ...r, rank: i + 1 }));

  const RANK_COLORS = ['#f59e0b','#8d8d8d','#b45309','#d4d4d4','#d4d4d4'];

  return (
    <Paper sx={{ borderRadius:'10px', boxShadow:DL.e1, border:`1px solid ${DL.border}`, p:'14px 16px', display:'flex', flexDirection:'column', gap:'10px' }}>
      {/* Header */}
      <Box sx={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <Box>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, letterSpacing:'-.3px' }}>
            {t('prod.top.titulo')}
          </Typography>
          <Typography sx={{ fontSize:9, color:DL.tS, mt:'1px' }}>
            {t('prod.top.sub')}
          </Typography>
        </Box>
        {/* Sort toggle */}
        <Box sx={{ display:'flex', alignItems:'center', gap:'4px', background:DL.subtle, border:`1px solid ${DL.border2}`, borderRadius:'8px', p:'3px' }}>
          {[
            { val:'venta',  labelKey:'prod.sort.venta'  },
            { val:'margen', labelKey:'prod.sort.margen' },
            { val:'cant',   labelKey:'prod.sort.cant'   },
          ].map(opt => (
            <Box key={opt.val} component="button" onClick={() => setSortMode(opt.val)}
              sx={{
                fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight: 500,
                px:'9px', py:'4px', borderRadius:'6px', border:'none', cursor:'pointer',
                transition:'all .14s',
                background: sortMode === opt.val ? DL.blue : 'transparent',
                color:      sortMode === opt.val ? '#fff'  : DL.tM,
                boxShadow:  sortMode === opt.val ? '0 1px 4px rgba(26,26,26,.3)' : 'none',
                '&:hover':  sortMode !== opt.val ? { color:DL.tH } : {},
              }}
            >{t(opt.labelKey)}</Box>
          ))}
        </Box>
      </Box>

      {/* Table header */}
      <Box sx={{ display:'grid', gridTemplateColumns:'28px 1fr 50px 55px 65px 60px', gap:'4px', px:'2px' }}>
        {['#', t('prod.col.producto'), t('prod.col.cat'), t('prod.col.cant'), t('prod.col.venta'), t('prod.col.margen')].map(h => (
          <Typography key={h} sx={{ fontSize:7.5, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS }}>{h}</Typography>
        ))}
      </Box>
      <Divider sx={{ borderColor:'rgba(26,26,26,.07)', my:'-4px' }} />

      {/* Rows */}
      <Box sx={{ display:'flex', flexDirection:'column', gap:'1px' }}>
        {sorted.map((row, i) => (
          <Box key={row.name} sx={{
            display:'grid', gridTemplateColumns:'28px 1fr 50px 55px 65px 60px',
            gap:'4px', px:'2px', py:'9px', alignItems:'center',
            borderBottom: i < sorted.length - 1 ? `1px solid rgba(26,26,26,.05)` : 'none',
            borderRadius:'6px',
            '&:hover':{ background:'rgba(84,126,105,.03)' },
          }}>
            {/* Rank */}
            <Box sx={{
              width:20, height:20, borderRadius:'50%',
              background: RANK_COLORS[i],
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <Typography sx={{ fontSize:9, fontWeight: 500, color:'#fff' }}>{row.rank}</Typography>
            </Box>
            {/* Nombre */}
            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH }}>{row.name}</Typography>
            {/* Categoría badge */}
            <Box sx={{ px:'6px', py:'2px', borderRadius:'6px', background:'rgba(84,126,105,.1)', width:'fit-content' }}>
              <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.blue }}>{row.cat}</Typography>
            </Box>
            {/* Cant */}
            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tM }}>{row.cant}</Typography>
            {/* Venta */}
            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH }}>${(row.venta/1000).toFixed(1)}k</Typography>
            {/* Margen */}
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.green }}>{row.margen}%</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

// ─── Pareto / Rendimiento Matrix ─────────────────────────────────────────────
function ParetoMatrix({ prods = PRODS }) {
  const [metric, setMetric] = useState('ingresos'); // 'ingresos' | 'margen'
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return prods;
    const q = search.toLowerCase();
    return prods.filter(p => p.name.toLowerCase().includes(q));
  }, [prods, search]);

  const sorted = useMemo(() => {
    if (metric === 'ingresos') {
      const total = filtered.reduce((s, p) => s + p.ing, 0);
      let cum = 0;
      return [...filtered]
        .sort((a, b) => b.ing - a.ing)
        .map(p => {
          cum += p.ing;
          return { ...p, pct: +((p.ing / total) * 100).toFixed(1), cumPct: +((cum / total) * 100).toFixed(1) };
        });
    } else {
      const totalM = filtered.reduce((s, p) => s + p.margen, 0);
      let cum = 0;
      return [...filtered]
        .sort((a, b) => b.margen - a.margen)
        .map(p => {
          cum += p.margen;
          return { ...p, pct: +((p.margen / totalM) * 100).toFixed(1), cumPct: +((cum / totalM) * 100).toFixed(1) };
        });
    }
  }, [filtered, metric]);

  const threshIdx = sorted.findIndex(p => p.cumPct >= 80);

  const chartOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        const bar = params.find(p => p.seriesType === 'bar');
        const val = metric === 'ingresos' ? fmt$(bar?.value || 0) : `${bar?.value}%`;
        return `<b>${bar?.name}</b><br/>${metric === 'ingresos' ? 'Ingresos' : 'Margen'}: ${val}`;
      },
    },
    grid: { top: 12, right: 16, bottom: 36, left: 58, containLabel: false },
    xAxis: {
      type: 'category',
      data: sorted.map(p => p.name.length > 13 ? p.name.slice(0, 12) + '…' : p.name),
      axisLabel: { color: DL.tS, fontSize: 8, rotate: 0, interval: 0, overflow: 'truncate', width: 80 },
      axisLine: { lineStyle: { color: 'rgba(26,26,26,.1)' } },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: DL.tS, fontSize: 8,
          formatter: metric === 'ingresos' ? v => '$' + Math.round(v / 1000) + 'K' : v => v + '%',
        },
        splitLine: { lineStyle: { color: 'rgba(26,26,26,.05)' } },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        type: 'bar',
        data: sorted.map((p, i) => ({
          value: metric === 'ingresos' ? p.ing : p.margen,
          itemStyle: { color: i <= threshIdx ? DL.blue : 'rgba(26,26,26,.18)', borderRadius: [3, 3, 0, 0] },
        })),
        barMaxWidth: 44,
      },
    ],
  }), [sorted, threshIdx, metric]);

  const FF_P = "'Inter', ui-sans-serif, system-ui, sans-serif";
  return (
    <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1, overflow:'hidden' }}>
      {/* Card header */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'16px', py:'11px', borderBottom:`1px solid ${DL.border}`, gap:'10px', flexWrap:'wrap' }}>
        <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FF_P, letterSpacing:'-.3px' }}>Rendimiento por Producto</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {/* Buscador */}
          <Box sx={{ display:'flex', alignItems:'center', gap:'5px', px:'8px', py:'4px', borderRadius:'7px', border:`1px solid ${DL.border}`, background:'#fafafa', '&:focus-within':{ borderColor:DL.blue } }}>
            <Search sx={{ fontSize:12, color:DL.tS, opacity:.6 }} />
            <Box component="input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto…"
              sx={{ border:'none', outline:'none', background:'transparent', fontFamily:FF_P, fontSize:10, color:DL.tH, width:120, '&::placeholder':{ color:DL.tS } }} />
          </Box>
          {/* Toggle Ingresos / Margen */}
          <Box sx={{ display:'flex', border:`1px solid ${DL.border}`, borderRadius:'7px', overflow:'hidden' }}>
            {[{ v:'ingresos', l:'Ingresos' }, { v:'margen', l:'Margen' }].map(opt => (
              <Box key={opt.v} component="button" onClick={() => setMetric(opt.v)} sx={{
                px:'11px', py:'5px', border:'none', cursor:'pointer', fontFamily:FF_P,
                fontSize:9, fontWeight: 500,
                background: metric === opt.v ? DL.blue : 'transparent',
                color:      metric === opt.v ? '#fff'  : DL.tS,
                transition: 'all .14s',
                '&:hover':  metric === opt.v ? {} : { background:'rgba(84,126,105,.07)' },
              }}>{opt.l}</Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Body: chart + table */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0px' }}>
        {/* Chart */}
        <Box sx={{ p:'14px 14px 10px', borderRight:`1px solid ${DL.border}` }}>
          <ReactECharts option={chartOption} style={{ height:268 }} />
        </Box>

        {/* Table */}
        <Box sx={{ display:'flex', flexDirection:'column' }}>
          {/* Table header */}
          <Box component="table" sx={{ width:'100%', borderCollapse:'collapse', fontFamily:FF_P }}>
            <Box component="thead">
              <Box component="tr" sx={{ background:'rgba(26,26,26,.025)' }}>
                {['#','Producto','Ingresos','Margen','Unidades','Días Stock','Stock','Part.','Acum.'].map((h, hi) => (
                  <Box component="th" key={h} sx={{
                    p:'8px 10px', fontSize:7.5, fontWeight: 500, color:DL.tS,
                    textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:FF_P,
                    textAlign: hi <= 1 ? 'left' : 'right',
                    borderBottom:`1px solid ${DL.border}`,
                    whiteSpace:'nowrap',
                  }}>{h}</Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {sorted.map((p, i) => {
                const inTop       = i <= threshIdx;
                const margenColor = p.margen >= 28 ? DL.green : p.margen >= 22 ? DL.yellow : DL.red;
                const stockColor  = p.stock === 'Normal' ? DL.green : p.stock === 'Bajo' ? DL.yellow : DL.red;
                const stockBg     = p.stock === 'Normal' ? DL.greenBg : p.stock === 'Bajo' ? DL.yellowBg : DL.redBg;
                return (
                  <Box component="tr" key={p.id} sx={{
                    borderBottom:`1px solid rgba(26,26,26,.05)`,
                    borderLeft:`3px solid ${inTop ? DL.blue : 'transparent'}`,
                    background: inTop ? `${DL.blue}05` : 'transparent',
                    '&:hover':{ background: inTop ? `${DL.blue}0c` : 'rgba(26,26,26,.02)' },
                  }}>
                    {/* # */}
                    <Box component="td" sx={{ p:'7px 10px', width:28 }}>
                      <Box sx={{ width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background: inTop ? DL.blue : 'rgba(26,26,26,.08)' }}>
                        <Typography sx={{ fontSize:8, fontWeight: 500, color: inTop ? '#fff' : DL.tS, fontFamily:FF_P }}>{i + 1}</Typography>
                      </Box>
                    </Box>
                    {/* Producto */}
                    <Box component="td" sx={{ p:'7px 8px' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF_P, whiteSpace:'nowrap' }}>{p.name}</Typography>
                      <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FF_P, mt:'1px' }}>{p.cat}</Typography>
                    </Box>
                    {/* Ingresos */}
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF_P, whiteSpace:'nowrap' }}>{fmt$(p.ing)}</Typography>
                    </Box>
                    {/* Margen */}
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right' }}>
                      <Box sx={{ display:'inline-flex', px:'6px', py:'1px', borderRadius:'4px', background: margenColor + '18', border:`1px solid ${margenColor}33` }}>
                        <Typography sx={{ fontSize:9, fontWeight: 500, color:margenColor, fontFamily:FF_P }}>{p.margen}%</Typography>
                      </Box>
                    </Box>
                    {/* Unidades */}
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF_P }}>{p.unidades.toLocaleString()}</Typography>
                    </Box>
                    {/* Días Stock */}
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tM, fontFamily:FF_P }}>{p.diasStock}d</Typography>
                    </Box>
                    {/* Stock */}
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right' }}>
                      <Box sx={{ display:'inline-flex', px:'6px', py:'1px', borderRadius:'4px', background:stockBg, alignItems:'center', gap:'3px' }}>
                        <Box sx={{ width:5, height:5, borderRadius:'50%', background:stockColor, flexShrink:0 }} />
                        <Typography sx={{ fontSize:8, fontWeight: 500, color:stockColor, fontFamily:FF_P }}>{p.stock}</Typography>
                      </Box>
                    </Box>
                    {/* Part. */}
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right' }}>
                      <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tM, fontFamily:FF_P }}>{p.pct}%</Typography>
                    </Box>
                    {/* Acum. */}
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right' }}>
                      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'4px' }}>
                        <Typography sx={{ fontSize:9, fontWeight: 500, color: inTop ? DL.blue : DL.tS, fontFamily:FF_P }}>{p.cumPct}%</Typography>
                        {i === threshIdx && (
                          <Box sx={{ px:'4px', py:'1px', borderRadius:'4px', background:DL.yellowBg, border:`1px solid ${DL.yellowBd}` }}>
                            <Typography sx={{ fontSize:6.5, fontWeight: 500, color:DL.yellow, fontFamily:FF_P }}>80%</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Dashboard View ────────────────────────────────────────────────────────────
const PROD_PALETTE = ['#547e69','#1a1a1a','#16a34a','#b45309','#dc2626','#4d3f32','#6c6c6c','#db2777','#ea580c','#6a6a6a'];

const ALERTAS = [
  { type:'critical', title:'Stock Crítico Detectado',    desc:'12 SKUs por debajo del mínimo de reorden',    time:'Ahora'  },
  { type:'warning',  title:'Rotación Baja – PILAROUND',  desc:'Solo 12 días de stock disponible',            time:'2h'     },
  { type:'warning',  title:'Semillas: Stock Bajo',       desc:'28% de SKUs bajo mínimo establecido',         time:'5h'     },
  { type:'info',     title:'Veterinario +15.5%',         desc:'Ingresos superiores al mes anterior',         time:'Hoy'    },
  { type:'critical', title:'Herbicida X20 – Agotamiento',desc:'Estimado de quiebre en 5 días',               time:'Hoy'    },
  { type:'success',  title:'Meta Agrícola Cumplida',      desc:'$612K alcanzados — 100% de objetivo',         time:'Ayer'   },
  { type:'warning',  title:'Concentrado Porcino Bajo',   desc:'Stock actual: 6 uds / mínimo: 10',           time:'Ayer'   },
];

const ALERT_COLORS = {
  critical: { bg: '#fef2f2', bd: '#fca5a5', tx: '#dc2626' },
  warning:  { bg: '#fffbeb', bd: '#fcd34d', tx: '#d97706' },
  info:     { bg: '#f6f6f6', bd: '#b8b8b8', tx: '#1a1a1a' },
  success:  { bg: '#f0fdf4', bd: '#86efac', tx: '#16a34a' },
};

const FF = "'Inter', ui-sans-serif, system-ui, sans-serif";

// eslint-disable-next-line no-unused-vars
function DashboardView({ filteredProds, filterCat, setFilterCat, sortMode, setSortMode, search, setSearch, onSelectProd, onExport }) {
  const { t } = useT();
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);
  const [rendSort, setRendSort] = useState('ingreso');
  const [rendSearch, setRendSearch] = useState('');

  // Derived category data — driven by filterCat from PageHeader MiniSelect
  const activeCat  = CATS.find(c => c.id === filterCat) || null;
  const catProds   = filterCat === 'todas' ? PRODS : PRODS.filter(p => p.cat === activeCat?.name);
  const isCat      = filterCat !== 'todas';
  const [invTab, setInvTab] = useState('todos');

  // KPI values
  const totalIngresos = isCat
    ? catProds.reduce((s, p) => s + p.ing, 0)
    : CATS.reduce((s, c) => s + c.ingreso, 0);
  const avgMargen = isCat
    ? catProds.length > 0
        ? (catProds.reduce((s, p) => s + p.margen * p.ing, 0) / catProds.reduce((s, p) => s + p.ing, 0)).toFixed(1)
        : '0'
    : (CATS.reduce((s, c) => s + c.margen * c.ingreso, 0) / CATS.reduce((s, c) => s + c.ingreso, 0)).toFixed(1);
  const totalUnidades = isCat
    ? catProds.reduce((s, p) => s + p.unidades, 0)
    : CATS.reduce((s, c) => s + c.unidades, 0);
  const skusCrit = isCat
    ? catProds.filter(p => p.stock === 'Crítico').length
    : 12;

  // Trend chart: solid Jan–Oct, dashed Nov–Dec (projection)
  const SPLIT = 9;
  const trendChartOption = useMemo(() => {
    const baseTooltip = {
      trigger: 'axis', backgroundColor: '#fff',
      borderColor: 'rgba(26,26,26,.12)', borderWidth: 1,
      textStyle: { fontFamily: FF, fontSize: 10 },
      extraCssText: 'box-shadow:0 6px 20px rgba(26,26,26,.13);border-radius:8px',
    };
    const baseLegend  = { bottom: 2, left: 'center', itemWidth: 10, itemHeight: 4, itemGap: 14, textStyle: { fontFamily: FF, fontSize: 9, color: DL.tS } };
    const baseGrid    = { top: 10, right: 14, bottom: 40, left: 48 };
    const baseXAxis   = { type: 'category', data: PROD_MONTHS, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontFamily: FF, fontSize: 9, color: DL.tS }, splitLine: { show: false } };
    const baseYAxis   = { type: 'value', axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontFamily: FF, fontSize: 9, color: DL.tS, formatter: v => '$' + v + 'K' }, splitLine: { lineStyle: { color: 'rgba(26,26,26,.06)', type: 'dashed' } } };

    if (!isCat) {
      return {
        tooltip: baseTooltip, legend: baseLegend, grid: baseGrid, xAxis: baseXAxis, yAxis: baseYAxis,
        series: Object.entries(PROD_TREND).flatMap(([cat, data]) => {
          const catColor = CATS.find(c => c.name === cat)?.color || '#939393';
          return [
            { name: cat, type: 'line', data: data.map((v,i) => i<=SPLIT?v:null), smooth:0.3, connectNulls:false, lineStyle:{color:catColor,width:2}, itemStyle:{color:catColor}, symbol:'circle', symbolSize:4 },
            { name: `${cat}_proj`, type:'line', data:data.map((v,i)=>i>=SPLIT?v:null), smooth:0.3, connectNulls:false, lineStyle:{color:catColor,width:2,type:'dashed'}, itemStyle:{color:catColor}, symbol:'none', legendHoverLink:false, showInLegend:false },
          ];
        }),
      };
    }
    // Category view: per-product lines
    const catTrend     = PROD_TREND[activeCat?.name] || new Array(12).fill(50);
    const catTotalIng  = catProds.reduce((s, p) => s + p.ing, 0) || 1;
    return {
      tooltip: baseTooltip, legend: baseLegend, grid: baseGrid, xAxis: baseXAxis, yAxis: baseYAxis,
      series: catProds.flatMap((prod, pi) => {
        const prop  = prod.ing / catTotalIng;
        const color = PROD_PALETTE[pi % PROD_PALETTE.length];
        return [
          { name: prod.name, type:'line', data: catTrend.map((v,i)=>i<=SPLIT?+(v*prop).toFixed(1):null), smooth:0.3, connectNulls:false, lineStyle:{color,width:2}, itemStyle:{color}, symbol:'circle', symbolSize:4 },
          { name:`${prod.name}_proj`, type:'line', data:catTrend.map((v,i)=>i>=SPLIT?+(v*prop).toFixed(1):null), smooth:0.3, connectNulls:false, lineStyle:{color,width:2,type:'dashed'}, itemStyle:{color}, symbol:'none', legendHoverLink:false, showInLegend:false },
        ];
      }),
    };
  }, [isCat, activeCat, catProds]);

  // Inventario chart
  const invHorizOption = useMemo(() => {
    const baseTooltip = { trigger:'axis', axisPointer:{type:'shadow'}, backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1, textStyle:{fontFamily:FF,fontSize:10}, extraCssText:'box-shadow:0 6px 20px rgba(26,26,26,.13);border-radius:8px' };
    const baseLegend  = { bottom:2, left:'center', itemWidth:10, itemHeight:8, itemGap:18, textStyle:{fontFamily:FF,fontSize:9,color:DL.tS} };
    const baseYAxis   = { type:'value', max:100, axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:FF,fontSize:9,color:DL.tS,formatter:v=>v+'%'}, splitLine:{lineStyle:{color:'rgba(26,26,26,.06)',type:'dashed'}} };
    const xLabels = isCat ? catProds.map(p=>p.name.length>12?p.name.slice(0,11)+'…':p.name) : CATS.map(c=>c.name);
    const srcList  = isCat ? catProds : CATS;
    return {
      tooltip: baseTooltip, legend: baseLegend, grid: { top:10, right:14, bottom:42, left:46 },
      xAxis: { type:'category', data:xLabels, axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:FF,fontSize:9,color:DL.tH}, splitLine:{show:false} },
      yAxis: baseYAxis,
      series: [
        { name:'Normal',    type:'bar', stack:'s', barMaxWidth:40, itemStyle:{color:DL.green}, data: srcList.map(x => isCat ? (x.stock==='Normal'?100:0) : x.stockNorm) },
        { name:'Stock Bajo',type:'bar', stack:'s', barMaxWidth:40, itemStyle:{color:DL.yellow}, data: srcList.map(x => isCat ? (x.stock==='Bajo'?100:0) : x.stockBajo) },
        { name:'Crítico',   type:'bar', stack:'s', barMaxWidth:40, itemStyle:{color:DL.red, borderRadius:[4,4,0,0]}, data: srcList.map(x => isCat ? (x.stock==='Crítico'?100:0) : x.stockCrit) },
      ],
    };
  }, [isCat, catProds]);

  // Donut
  const mixDonutOption = useMemo(() => ({
    tooltip: { trigger:'item', formatter:'{b}: ${c}' },
    series: [{
      type:'pie', radius:['48%','74%'],
      data: isCat
        ? catProds.map((p,i) => ({ value:p.ing, name:p.name, itemStyle:{color:PROD_PALETTE[i%PROD_PALETTE.length]} }))
        : CATS.map(c => ({ value:c.ingreso, name:c.name, itemStyle:{color:c.color} })),
      label:{show:false}, emphasis:{label:{show:false}},
    }],
  }), [isCat, catProds]);

  // Rendimiento table rows
  const rendRows = useMemo(() => {
    if (!isCat) {
      const filtered = CATS.filter(c => c.name.toLowerCase().includes(rendSearch.toLowerCase()));
      return [...filtered].sort((a, b) => rendSort === 'ingreso' ? b.ingreso - a.ingreso : b.margen - a.margen);
    }
    const filtered = catProds.filter(p => p.name.toLowerCase().includes(rendSearch.toLowerCase()));
    return [...filtered].sort((a, b) => rendSort === 'ingreso' ? b.ing - a.ing : b.margen - a.margen);
  }, [isCat, catProds, rendSort, rendSearch]);

  const cardSx = { background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1 };
  const maxIng = Math.max(...PRODS.map(p => p.ing));

  return (
    <Box>
      {/* Page header */}
      <PageHeader title={t('page.productos')} live={true} onRefresh={handleRefresh} onExport={onExport}>
        <MiniSelect label={t('filter.categoria')} value={filterCat} onChange={setFilterCat} options={[
          { value:'todas',       label: t('cat.todas')       },
          { value:'agricola',    label: t('cat.agricola')    },
          { value:'veterinario', label: t('cat.veterinario') },
          { value:'semillas',    label: t('cat.semillas')    },
          { value:'especiales',  label: t('cat.espMenores')  },
        ]} />
        <MiniSelect label={t('filter.ordenar')} value={sortMode} onChange={setSortMode} options={[
          { value:'ingreso', label: t('prod.sort.ingreso') },
          { value:'margen',  label: t('prod.sort.margen')  },
          { value:'nombre',  label: t('prod.sort.az')      },
        ]} />
      </PageHeader>

      <Box sx={{ p:'16px', display:'flex', flexDirection:'column', gap:'16px' }}>

      {/* ── Row 1: 4 KPI cards ─────────────────────────────────────────────── */}
      {(() => {
        const metaIng    = isCat ? activeCat?.ingrAnt || 0 : 1500000;
        const metaIngLbl = isCat ? `${fmt$(activeCat?.ingrAnt || 0)} año ant.` : 'Q1.50M';
        const pctIng     = metaIng > 0 ? Math.min(Math.round((totalIngresos / metaIng) * 100), 140) : 100;
        const ingColor   = pctIng >= 100 ? DL.green : pctIng >= 90 ? DL.yellow : DL.red;

        const metaMg     = isCat ? (activeCat?.margenAnt || 25) : 25;
        const pctMg      = Math.min(Math.round((parseFloat(avgMargen) / metaMg) * 100), 140);
        const mgColor    = pctMg >= 100 ? DL.green : pctMg >= 90 ? DL.yellow : DL.red;

        const totalUdAnt = isCat ? (activeCat?.unidAnt || 1) : 7062;
        const metaUd     = isCat ? activeCat?.unidAnt || 0 : 8000;
        const pctUd      = metaUd > 0 ? Math.min(Math.round((totalUnidades / metaUd) * 100), 140) : 100;
        const udColor    = pctUd >= 100 ? DL.green : pctUd >= 90 ? DL.yellow : DL.red;

        const critMax    = isCat ? Math.max(1, Math.round(catProds.length * 0.3)) : 5;
        const critColor  = skusCrit > critMax ? DL.red : skusCrit > 0 ? DL.yellow : DL.green;

        return (
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
            {/* Total Ingresos */}
            <Box sx={{ ...cardSx, p:'12px 13px 10px', position:'relative', overflow:'hidden' }}>
              <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, borderRadius:'10px 10px 0 0', background: ingColor }} />
              <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, mb:'4px', mt:'3px', fontFamily:FF }}>Total Ingresos</Typography>
              <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, lineHeight:1, letterSpacing:'-0.04em', pb:'4px', mb:'4px', borderBottom:'1px solid rgba(26,26,26,.08)', fontFamily:FF }}>
                {fmt$(totalIngresos)}
              </Typography>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', mb:'4px' }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:FF }}>Meta</Typography>
                <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{metaIngLbl}</Typography>
              </Box>
              <Box sx={{ height:7, background:'rgba(26,26,26,.07)', borderRadius:5, overflow:'hidden', mb:'4px' }}>
                <Box sx={{ height:'100%', borderRadius:5, width:`${Math.min(pctIng,100)}%`, background:ingColor, transition:'width .6s ease' }} />
              </Box>
              <Typography sx={{ fontSize:9, fontWeight: 500, color:ingColor, fontFamily:FF }}>{pctIng}% de meta</Typography>
            </Box>

            {/* Margen Bruto Prom. */}
            <Box sx={{ ...cardSx, p:'12px 13px 10px', position:'relative', overflow:'hidden' }}>
              <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, borderRadius:'10px 10px 0 0', background: mgColor }} />
              <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, mb:'4px', mt:'3px', fontFamily:FF }}>Margen Bruto Prom.</Typography>
              <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, lineHeight:1, letterSpacing:'-0.04em', pb:'4px', mb:'4px', borderBottom:'1px solid rgba(26,26,26,.08)', fontFamily:FF }}>
                {avgMargen}%
              </Typography>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', mb:'4px' }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:FF }}>Meta</Typography>
                <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{metaMg}%</Typography>
              </Box>
              <Box sx={{ height:7, background:'rgba(26,26,26,.07)', borderRadius:5, overflow:'hidden', mb:'4px' }}>
                <Box sx={{ height:'100%', borderRadius:5, width:`${Math.min(pctMg,100)}%`, background:mgColor, transition:'width .6s ease' }} />
              </Box>
              <Typography sx={{ fontSize:9, fontWeight: 500, color:mgColor, fontFamily:FF }}>{pctMg}% de meta</Typography>
            </Box>

            {/* Unidades Vendidas */}
            <Box sx={{ ...cardSx, p:'12px 13px 10px', position:'relative', overflow:'hidden' }}>
              <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, borderRadius:'10px 10px 0 0', background: udColor }} />
              <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, mb:'4px', mt:'3px', fontFamily:FF }}>Unidades Vendidas</Typography>
              <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, lineHeight:1, letterSpacing:'-0.04em', pb:'4px', mb:'4px', borderBottom:'1px solid rgba(26,26,26,.08)', fontFamily:FF }}>
                {totalUnidades.toLocaleString()}
              </Typography>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', mb:'4px' }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:FF }}>Meta</Typography>
                <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{metaUd.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ height:7, background:'rgba(26,26,26,.07)', borderRadius:5, overflow:'hidden', mb:'4px' }}>
                <Box sx={{ height:'100%', borderRadius:5, width:`${Math.min(pctUd,100)}%`, background:udColor, transition:'width .6s ease' }} />
              </Box>
              <Typography sx={{ fontSize:9, fontWeight: 500, color:udColor, fontFamily:FF }}>{pctUd}% de meta</Typography>
            </Box>

            {/* SKUs Stock Crítico */}
            <Box sx={{ ...cardSx, p:'12px 13px 10px', position:'relative', overflow:'hidden' }}>
              <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, borderRadius:'10px 10px 0 0', background: critColor }} />
              <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, mb:'5px', mt:'3px', fontFamily:FF }}>SKUs Stock Crítico</Typography>
              <Typography sx={{ fontSize:22, fontWeight: 500, color:critColor, lineHeight:1, letterSpacing:'-0.04em', pb:'4px', mb:'4px', borderBottom:'1px solid rgba(26,26,26,.08)', fontFamily:FF }}>{skusCrit} SKUs</Typography>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', mb:'4px' }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:FF }}>Límite permitido</Typography>
                <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{critMax} SKUs</Typography>
              </Box>
              <Box sx={{ height:7, background:'rgba(26,26,26,.07)', borderRadius:5, overflow:'hidden', mb:'4px' }}>
                <Box sx={{ height:'100%', borderRadius:5, width:`${Math.min(Math.round((skusCrit/critMax)*100),100)}%`, background:critColor, transition:'width .6s ease' }} />
              </Box>
              <Typography sx={{ fontSize:9, fontWeight: 500, color:critColor, fontFamily:FF }}>
                {skusCrit === 0 ? 'Sin stock crítico' : skusCrit > critMax ? 'Reorden urgente' : 'Atención requerida'}
              </Typography>
            </Box>
          </Box>
        );
      })()}

      {/* ── Row 2: Tendencia de Ingresos + Alertas ─────────────────────────── */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 270px', gap:'12px' }}>
        {/* Tendencia de Ingresos chart */}
        <Box sx={cardSx}>
          <Box sx={{ px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>Tendencia de Ingresos por Categoría</Typography>
            <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, mt:'1px' }}>Histórico mensual · línea sólida = real · punteada = proyección</Typography>
          </Box>
          <Box sx={{ p:'10px 14px 6px' }}>
            <ReactECharts option={trendChartOption} notMerge style={{ height:248 }} />
          </Box>
        </Box>

        {/* Alertas de Sistema */}
        <AlertasSistema alerts={ALERTAS.map(a => ({
          tier: a.type === 'critical' ? 'r' : a.type === 'warning' ? 'y' : a.type === 'info' ? 'o' : 'g',
          msg: a.title + (a.desc ? ' — ' + a.desc : ''),
        }))} />
      </Box>

      {/* ── Row 3: Inventario / Estado + Mix de Ingresos ─────────────────── */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
        {/* Izquierda: tabla inventario (cat) o barras (general) */}
        {isCat ? (() => {
            const sinStock  = catProds.filter(p => p.stock === 'Crítico' || p.stockQ === 0);
            const enRiesgo  = catProds.filter(p => p.stock === 'Bajo' || (p.diasStock > 0 && p.diasStock <= 14));
            const tabRows   = invTab === 'sinStock' ? sinStock : invTab === 'enRiesgo' ? enRiesgo : catProds;
            const TABS = [
              { id:'todos',    label:'Todos',     count: catProds.length },
              { id:'enRiesgo', label:'En Riesgo', count: enRiesgo.length },
              { id:'sinStock', label:'Sin Stock', count: sinStock.length },
            ];
            return (
          /* ── Tabla de estado de inventario por producto ── */
          <Box sx={{ ...cardSx, overflow:'hidden' }}>
            <Box sx={{ px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>Estado de Inventario · {activeCat?.name}</Typography>
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, mt:'1px' }}>Stock actual, cobertura y alertas por producto</Typography>
            </Box>
            {/* Tabs */}
            <Box sx={{ display:'flex', px:'14px', borderBottom:`1px solid ${DL.border}`, gap:'2px' }}>
              {TABS.map(t => (
                <Box key={t.id} component="button" onClick={() => setInvTab(t.id)} sx={{
                  display:'flex', alignItems:'center', gap:'5px',
                  fontFamily:FF, fontSize:10, fontWeight: invTab===t.id ? 500 : 500,
                  px:'12px', py:'8px', border:'none', background:'transparent', cursor:'pointer',
                  color: invTab===t.id ? DL.navy : DL.tS,
                  borderBottom:`2px solid ${invTab===t.id ? DL.blue : 'transparent'}`,
                  mb:'-1px', transition:'all .14s', '&:hover':{ color:DL.tH },
                }}>
                  {t.label}
                  <Box sx={{ px:'5px', py:'1px', borderRadius:'10px', fontSize:8, fontWeight: 500,
                    background: invTab===t.id ? DL.blue : 'rgba(26,26,26,.08)',
                    color: invTab===t.id ? '#fff' : DL.tS,
                  }}>{t.count}</Box>
                </Box>
              ))}
            </Box>
            <Box sx={{ overflowX:'auto' }}>
              <Box component="table" sx={{ width:'100%', borderCollapse:'collapse', fontFamily:FF }}>
                <Box component="thead">
                  <Box component="tr" sx={{ background:'rgba(26,26,26,.025)' }}>
                    {['SKU','Nombre','Sucursal','Stock Q','Días Sin Stock','Sin Stock En','Cobertura'].map((h,i) => (
                      <Box component="th" key={h} sx={{ p:'6px 8px', fontSize:7.5, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:`1px solid ${DL.border}`, whiteSpace:'nowrap', textAlign: i >= 3 ? 'right' : 'left', fontFamily:FF }}>{h}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {tabRows.length === 0 && (
                    <Box component="tr"><Box component="td" colSpan={7} sx={{ p:'20px', textAlign:'center' }}>
                      <Typography sx={{ fontSize:10, color:DL.tS, fontFamily:FF }}>No hay productos en esta categoría</Typography>
                    </Box></Box>
                  )}
                  {tabRows.map(p => {
                    const sqColor  = p.stock === 'Crítico' ? DL.red : p.stock === 'Bajo' ? DL.yellow : DL.tH;
                    const dssColor = p.diasSinStock > 10 ? DL.red : p.diasSinStock > 0 ? DL.yellow : DL.tS;
                    const covColor = p.diasStock <= 7 ? DL.red : p.diasStock <= 14 ? DL.yellow : DL.green;
                    const SUC_COLORS = { 'Pto. Venta Sur':'#547e69', 'Suc. Norte':'#4d3f32', 'Bodega Central':'#6c6c6c' };
                    return (
                      <Box component="tr" key={p.id} onClick={() => onSelectProd && onSelectProd(p)} sx={{ borderBottom:`1px solid ${DL.border}`, cursor:'pointer', '&:hover td':{ background:'rgba(84,126,105,.05)' } }}>
                        <Box component="td" sx={{ p:'6px 8px' }}>
                          <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS, fontFamily:FF }}>{p.skuCode}</Typography>
                        </Box>
                        <Box component="td" sx={{ p:'6px 8px' }}>
                          <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF, whiteSpace:'nowrap' }}>{p.name}</Typography>
                        </Box>
                        <Box component="td" sx={{ p:'6px 8px' }}>
                          <Box sx={{ display:'inline-flex', px:'5px', py:'1px', borderRadius:'5px', background:`${SUC_COLORS[p.sucursal] || DL.blue}15`, border:`1px solid ${SUC_COLORS[p.sucursal] || DL.blue}30` }}>
                            <Typography sx={{ fontSize:8.5, fontWeight: 500, color:SUC_COLORS[p.sucursal] || DL.blue, whiteSpace:'nowrap', fontFamily:FF }}>{p.sucursal}</Typography>
                          </Box>
                        </Box>
                        <Box component="td" sx={{ p:'6px 8px', textAlign:'right' }}>
                          <Typography sx={{ fontSize:10, fontWeight: 500, color:sqColor, fontFamily:FF }}>{p.stockQ}</Typography>
                        </Box>
                        <Box component="td" sx={{ p:'6px 8px', textAlign:'right' }}>
                          {p.diasSinStock > 0
                            ? <Typography sx={{ fontSize:10, fontWeight: 500, color:dssColor, fontFamily:FF }}>{p.diasSinStock}d</Typography>
                            : <Typography sx={{ fontSize:10, color:DL.tS, fontFamily:FF }}>—</Typography>
                          }
                        </Box>
                        <Box component="td" sx={{ p:'6px 8px' }}>
                          <Box sx={{ display:'flex', gap:'3px', flexWrap:'wrap' }}>
                            {p.sinStockEn.length > 0
                              ? p.sinStockEn.map(loc => (
                                  <Box key={loc} sx={{ display:'inline-flex', px:'4px', py:'1px', borderRadius:'4px', background:'#fee2e2', border:'1px solid #fca5a5' }}>
                                    <Typography sx={{ fontSize:7.5, fontWeight: 500, color:DL.red, whiteSpace:'nowrap', fontFamily:FF }}>{loc}</Typography>
                                  </Box>
                                ))
                              : <Typography sx={{ fontSize:10, color:DL.tS, fontFamily:FF }}>—</Typography>
                            }
                          </Box>
                        </Box>
                        <Box component="td" sx={{ p:'6px 8px', textAlign:'right' }}>
                          <Typography sx={{ fontSize:10, fontWeight: 500, color:covColor, fontFamily:FF }}>{p.diasStock}d</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
            );
          })() : (
          /* ── Estado de Inventario por Categoría — horizontal stacked bars ── */
          <Box sx={cardSx}>
            <Box sx={{ px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>Estado de Inventario por Categoría</Typography>
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, mt:'1px' }}>Distribución % de estado de stock</Typography>
            </Box>
            <Box sx={{ p:'10px 14px 6px' }}>
              <ReactECharts option={invHorizOption} style={{ height:200 }} />
            </Box>
          </Box>
        )}

        {/* Mix de Ingresos por Categoría */}
        <Box sx={cardSx}>
          <Box sx={{ px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>Mix de Ingresos por Categoría</Typography>
            <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, mt:'1px' }}>Participación en ingresos totales</Typography>
          </Box>

          {isCat ? (
            /* ── Horizontal layout: donut izq + leyenda der ── */
            <Box sx={{ p:'10px 14px 12px', display:'flex', alignItems:'center', gap:'12px' }}>
              <Box sx={{ position:'relative', flexShrink:0, width:150, height:150 }}>
                <ReactECharts option={mixDonutOption} style={{ width:150, height:150 }} />
                <Box sx={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
                  <Typography sx={{ fontSize:7, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:FF }}>Total</Typography>
                  <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, lineHeight:1.1, fontFamily:FF }}>{fmt$(totalIngresos)}</Typography>
                </Box>
              </Box>
              <Box sx={{ flex:1, display:'flex', flexDirection:'column' }}>
                <Box sx={{ display:'grid', gridTemplateColumns:'1fr 30px 54px', gap:'4px', pb:'4px', borderBottom:`1px solid ${DL.border}`, mb:'2px' }}>
                  {['Producto','%','Ingresos'].map(h => (
                    <Typography key={h} sx={{ fontSize:7, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS, fontFamily:FF }}>{h}</Typography>
                  ))}
                </Box>
                {catProds.map((p, i) => (
                  <Box key={p.id} sx={{ display:'grid', gridTemplateColumns:'1fr 30px 54px', gap:'4px', py:'5px', borderBottom:`1px solid rgba(26,26,26,.04)`, alignItems:'center' }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:'4px', overflow:'hidden' }}>
                      <Box sx={{ width:6, height:6, borderRadius:'2px', background:PROD_PALETTE[i % PROD_PALETTE.length], flexShrink:0 }} />
                      <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tH, fontFamily:FF, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</Typography>
                    </Box>
                    <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tM, fontFamily:FF }}>{Math.round((p.ing / totalIngresos) * 100)}%</Typography>
                    <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tH, fontFamily:FF, whiteSpace:'nowrap' }}>{fmt$(p.ing)}</Typography>
                  </Box>
                ))}
                <Box sx={{ display:'grid', gridTemplateColumns:'1fr 30px 54px', gap:'4px', pt:'5px', alignItems:'center' }}>
                  <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', fontFamily:FF }}>Total</Typography>
                  <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tH, fontFamily:FF }}>100%</Typography>
                  <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{fmt$(totalIngresos)}</Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            /* ── Layout horizontal: donut + leyenda lado a lado (vista general) ── */
            <Box sx={{ p:'10px 14px 12px', display:'flex', alignItems:'center', gap:'14px' }}>
              <Box sx={{ position:'relative', flexShrink:0, width:210, height:210 }}>
                <ReactECharts option={mixDonutOption} style={{ width:210, height:210 }} />
                <Box sx={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
                  <Typography sx={{ fontSize:7, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:FF }}>Total</Typography>
                  <Typography sx={{ fontSize:16, fontWeight: 500, color:DL.tH, lineHeight:1.1, fontFamily:FF }}>Q1.56M</Typography>
                </Box>
              </Box>
              <Box sx={{ flex:1, display:'flex', flexDirection:'column' }}>
                <Box sx={{ display:'grid', gridTemplateColumns:'1fr 32px 56px', gap:'4px', pb:'4px', borderBottom:`1px solid ${DL.border}`, mb:'2px' }}>
                  {['Categoría','%','Ingresos'].map(h => (
                    <Typography key={h} sx={{ fontSize:7, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS, fontFamily:FF }}>{h}</Typography>
                  ))}
                </Box>
                {CATS.map(item => (
                  <Box key={item.id} sx={{ display:'grid', gridTemplateColumns:'1fr 32px 56px', gap:'4px', py:'5px', borderBottom:`1px solid rgba(26,26,26,.04)`, alignItems:'center' }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      <Box sx={{ width:6, height:6, borderRadius:'2px', background:item.color, flexShrink:0 }} />
                      <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{item.name}</Typography>
                    </Box>
                    <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tM, fontFamily:FF }}>{item.pct}%</Typography>
                    <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{fmt$(item.ingreso)}</Typography>
                  </Box>
                ))}
                <Box sx={{ display:'grid', gridTemplateColumns:'1fr 32px 56px', gap:'4px', pt:'5px', alignItems:'center' }}>
                  <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', fontFamily:FF }}>Total</Typography>
                  <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tH, fontFamily:FF }}>100%</Typography>
                  <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{fmt$(totalIngresos)}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Row 4: Rendimiento por Categoría — solo en vista general ───────── */}
      {!isCat && <Box sx={{ ...cardSx, overflow:'hidden' }}>
        {/* Header */}
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}`, flexWrap:'wrap', gap:'8px' }}>
          <Box>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>
              {isCat ? `Rendimiento por Producto · ${activeCat?.name}` : 'Rendimiento por Categoría'}
            </Typography>
            <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, mt:'1px' }}>
              {isCat ? `${catProds.length} productos en esta categoría` : 'Vista consolidada de desempeño por línea de producto'}
            </Typography>
          </Box>
          <Box sx={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {/* Search */}
            <Box sx={{ display:'flex', alignItems:'center', gap:'6px', px:'9px', py:'5px', borderRadius:'7px', border:`1px solid ${DL.border}`, background:'#fafafa' }}>
              <Search sx={{ fontSize:13, color:DL.tS }} />
              <Box component="input" value={rendSearch} onChange={e => setRendSearch(e.target.value)}
                placeholder={isCat ? 'Buscar producto…' : 'Buscar categoría…'}
                sx={{ border:'none', outline:'none', background:'transparent', fontFamily:FF, fontSize:10, color:DL.tH, width:120,
                  '&::placeholder':{ color:DL.tS } }} />
            </Box>
            {/* Toggle */}
            <Box sx={{ display:'flex', border:`1px solid ${DL.border}`, borderRadius:'7px', overflow:'hidden' }}>
              {[{ v:'ingreso', l:'Por ingreso' },{ v:'margen', l:'Por margen' }].map(opt => (
                <Box key={opt.v} component="button" onClick={() => setRendSort(opt.v)} sx={{
                  px:'11px', py:'5px', border:'none', cursor:'pointer', fontFamily:FF,
                  fontSize:9, fontWeight: 500,
                  background: rendSort === opt.v ? DL.blue : 'transparent',
                  color: rendSort === opt.v ? '#fff' : DL.tS,
                  transition:'all .14s',
                  '&:hover': rendSort === opt.v ? {} : { background:'rgba(84,126,105,.07)' },
                }}>{opt.l}</Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Table */}
        <Box component="table" sx={{ width:'100%', borderCollapse:'collapse', fontFamily:FF }}>
          <Box component="thead">
            <Box component="tr" sx={{ background:'rgba(26,26,26,.025)' }}>
              {(isCat ? ['Producto','Ingresos','Margen','Unidades','Días Stock','Stock'] : ['Categoría','Ingresos','Margen','Unidades','SKUs','Stock']).map((h,i) => (
                <Box component="th" key={i} sx={{ p:'8px 12px', textAlign: i===0?'left':'right', fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:`1px solid ${DL.border}`, fontFamily:FF, whiteSpace:'nowrap' }}>{h}</Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {rendRows.map((row) => {
              const ing       = isCat ? row.ing       : row.ingreso;
              const ingAnt    = isCat ? row.ingAnt    : row.ingrAnt;
              const margen    = row.margen;
              const unidades  = isCat ? row.unidades  : row.unidades;
              const stockVal  = isCat ? row.stock     : row.stock;
              const col5      = isCat ? `${row.diasStock}d` : row.sku;
              const dotColor  = isCat ? row.color : row.color;
              const name      = isCat ? row.name : row.name;
              const stockColor  = stockVal === 'Normal' ? DL.green : stockVal === 'Bajo' ? DL.yellow : DL.red;
              const stockBg     = stockVal === 'Normal' ? DL.greenBg : stockVal === 'Bajo' ? DL.yellowBg : DL.redBg;
              const margenColor = margen >= 28 ? DL.green : margen >= 22 ? DL.yellow : DL.red;
              const ingDelta    = ingAnt > 0 ? Math.round(((ing - ingAnt) / ingAnt) * 100) : 0;
              const handleRowClick = () => isCat
                ? onSelectProd && onSelectProd(row)
                : setFilterCat(row.id);
              return (
                <Box component="tr" key={row.id} onClick={handleRowClick} sx={{ borderBottom:`1px solid ${DL.border}`, '&:last-child':{borderBottom:'none'}, '&:hover':{ background:'rgba(84,126,105,.05)', cursor:'pointer' } }}>
                  <Box component="td" sx={{ p:'10px 12px' }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:'7px' }}>
                      <Box sx={{ width:8, height:8, borderRadius:'50%', background:dotColor, flexShrink:0 }} />
                      <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{name}</Typography>
                    </Box>
                  </Box>
                  <Box component="td" sx={{ p:'10px 12px', textAlign:'right' }}>
                    <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{fmt$(ing)}</Typography>
                    <Typography sx={{ fontSize:8, color: ingDelta >= 0 ? DL.green : DL.red, fontFamily:FF, mt:'1px' }}>
                      {ingDelta >= 0 ? '+' : ''}{ingDelta}% vs ant.
                    </Typography>
                  </Box>
                  <Box component="td" sx={{ p:'10px 12px', textAlign:'right' }}>
                    <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background: margenColor + '18', border:`1px solid ${margenColor}33` }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:margenColor, fontFamily:FF }}>{margen}%</Typography>
                    </Box>
                  </Box>
                  <Box component="td" sx={{ p:'10px 12px', textAlign:'right' }}>
                    <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{unidades.toLocaleString()}</Typography>
                  </Box>
                  <Box component="td" sx={{ p:'10px 12px', textAlign:'right' }}>
                    <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tM, fontFamily:FF }}>{col5}</Typography>
                  </Box>
                  <Box component="td" sx={{ p:'10px 12px', textAlign:'right' }}>
                    <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:stockBg, alignItems:'center', gap:'4px' }}>
                      <FiberManualRecord sx={{ fontSize:5, color:stockColor }} />
                      <Typography sx={{ fontSize:8, fontWeight: 500, color:stockColor, fontFamily:FF }}>{stockVal}</Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
            {/* Total row */}
            <Box component="tr" sx={{ background:'rgba(26,26,26,.025)', borderTop:`2px solid ${DL.border}` }}>
              <Box component="td" sx={{ p:'9px 12px' }}>
                <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF, textTransform:'uppercase', letterSpacing:'0.04em' }}>Total</Typography>
              </Box>
              <Box component="td" sx={{ p:'9px 12px', textAlign:'right' }}>
                <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{fmt$(totalIngresos)}</Typography>
              </Box>
              <Box component="td" sx={{ p:'9px 12px', textAlign:'right' }}>
                <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{avgMargen}%</Typography>
              </Box>
              <Box component="td" sx={{ p:'9px 12px', textAlign:'right' }}>
                <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FF }}>{totalUnidades.toLocaleString()}</Typography>
              </Box>
              <Box component="td" sx={{ p:'9px 12px', textAlign:'right' }}>
                <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FF }}>
                  {isCat ? '—' : CATS.reduce((s,c)=>s+c.sku,0)}
                </Typography>
              </Box>
              <Box component="td" />
            </Box>
          </Box>
        </Box>
      </Box>

      }

      {/* ── Rendimiento por Producto (Pareto) — solo en vista de categoría ── */}
      {isCat && <ParetoMatrix prods={catProds} />}

      </Box>{/* end tab content */}
    </Box>
  );
}

// ─── Detalle helpers ─────────────────────────────────────────────────────────
function TogBtn2({ active, onClick, children }) {
  return (
    <Box component="button" onClick={onClick} sx={{
      px:'10px', py:'5px', border:'none', cursor:'pointer', fontFamily:FF,
      fontSize:9, fontWeight: 500,
      background: active ? DL.blue : 'transparent',
      color:      active ? '#fff'  : DL.tS,
      transition: 'all .14s',
      '&:hover': active ? {} : { background:'rgba(84,126,105,.07)' },
    }}>{children}</Box>
  );
}

function EstadoChip({ estado }) {
  const map = {
    OK:       { bg:DL.greenBg,  bd:DL.greenBd,  tx:DL.green  },
    Atención: { bg:DL.yellowBg, bd:DL.yellowBd, tx:DL.yellow },
    Revisar:  { bg:DL.redBg,    bd:DL.redBd,    tx:DL.red    },
  };
  const c = map[estado] || map.OK;
  return (
    <Box component="span" sx={{
      px:'8px', py:'2px', borderRadius:'4px',
      fontSize:9, fontWeight: 500, fontFamily:FF,
      background:c.bg, border:`1px solid ${c.bd}`, color:c.tx,
    }}>{estado}</Box>
  );
}

// ─── Detalle View ─────────────────────────────────────────────────────────────
function DetalleView({ prod, onBack, catProds = [], onChangeProd }) {
  const [salesMode, setSalesMode] = useState('ingresos');
  const [branchTab, setBranchTab] = useState('margen');

  // ── Derived values ──────────────────────────────────────────────────────────
  const pvp          = +(prod.ing  / prod.unidades).toFixed(2);
  const costoU       = +(prod.costo / prod.unidades).toFixed(2);
  const ingresosDelta= +(((prod.ing - prod.ingAnt) / prod.ingAnt) * 100).toFixed(1);
  const catData      = CATS.find(c => c.name === prod.cat) || CATS[0];
  const invPct       = +((prod.unidades / catData.unidades) * 100).toFixed(1);

  // Reorder point
  const reorderPoint = prod.stock === 'Crítico' ? Math.round(prod.unidades * 2.5)
                     : prod.stock === 'Bajo'    ? Math.round(prod.unidades / 0.63)
                     :                            Math.round(prod.unidades * 0.4);
  const stockPct = Math.min(100, Math.round((prod.unidades / reorderPoint) * 100));

  // Margin vs meta
  const margenMeta = 27.0;
  const margenPct  = Math.round((prod.margen / margenMeta) * 100);
  const margenDiff = +(prod.margen - margenMeta).toFixed(1);

  // Category participation
  const catPart      = +((prod.ing / catData.ingreso) * 100).toFixed(1);
  const catPartDelta = 2.1;

  // Monthly data (12 months, Ene-Dic)
  const REAL_END = 4; // Ene–Abr = real; May–Dic = projection
  const monthly2026 = PROD_MONTHS.map((_, i) => {
    const base = Math.round((prod.ing / 12) * (0.75 + Math.sin(i * 0.9 + 1) * 0.3 + 0.05));
    return i < REAL_END ? base : Math.round(base * 1.05);
  });
  const monthly2025 = PROD_MONTHS.map((_, i) =>
    Math.round((prod.ingAnt / 12) * (0.7 + Math.sin(i * 0.9 + 1) * 0.3)));
  const monthlyUnits2026 = PROD_MONTHS.map((_, i) =>
    Math.round((prod.unidades / 12) * (0.7 + Math.sin(i * 0.9 + 1) * 0.35 + 0.1) * (i >= REAL_END ? 1.03 : 1)));
  const monthlyUnits2025 = PROD_MONTHS.map((_, i) =>
    Math.round((prod.unidAnt / 12) * (0.7 + Math.sin(i * 0.9 + 1) * 0.35)));

  // Branch data
  const BRANCH_INFO = [
    { name:'Matriz',  w:0.31, desc:1.7 },
    { name:'Central', w:0.24, desc:2.1 },
    { name:'Norte',   w:0.20, desc:3.2 },
    { name:'Sur',     w:0.15, desc:6.3 },
    { name:'Oeste',   w:0.10, desc:1.1 },
  ];
  const branchRows = BRANCH_INFO.map(b => {
    const ventas = Math.round(prod.ing * b.w);
    const mgReal = +(prod.margen - b.desc * 0.55).toFixed(1);
    const estado = mgReal >= 24 ? 'OK' : mgReal >= 21 ? 'Atención' : 'Revisar';
    return { name:b.name, ventas, desc:b.desc, mgReal, estado };
  });

  // Supplier by category
  const SUPPLIERS = {
    'Agrícola':    { name:'VetPharma GT', tipo:'Proveedor principal',  stars:4, leadTime:7,  credito:34900, pagoDias:'28/04', pagoAmt:8000,  rating:'Muy bueno' },
    'Veterinario': { name:'BioVet SA',    tipo:'Proveedor principal',  stars:5, leadTime:5,  credito:45000, pagoDias:'15/05', pagoAmt:12000, rating:'Excelente'  },
    'Semillas':    { name:'AgroSeed',     tipo:'Proveedor secundario', stars:3, leadTime:14, credito:22000, pagoDias:'30/04', pagoAmt:5000,  rating:'Bueno'      },
    'Esp. Menores':{ name:'MultiAgro',   tipo:'Proveedor principal',  stars:4, leadTime:10, credito:18000, pagoDias:'05/05', pagoAmt:3500,  rating:'Muy bueno'  },
  };
  const supplier = SUPPLIERS[prod.cat] || SUPPLIERS['Agrícola'];

  // Discount analysis
  const descProm    = 2.1;
  const descMaxPct  = 5.0;
  const mgSinDesc   = +(prod.margen + descProm * 0.4).toFixed(1);
  const impactoNeto = Math.round(prod.ing * (descProm / 100) * 0.7);
  const descOK      = descProm <= descMaxPct;

  // Demand prediction: biweekly May–Dic (16 bars)
  const demandMonthNames = ['May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const demandLabels = [];
  const demandRealData = [];
  const demandProjData = [];
  for (let m = 0; m < 8; m++) {
    for (let w = 0; w < 2; w++) {
      demandLabels.push(w === 0 ? demandMonthNames[m] : '');
      const base = Math.round((prod.unidades / 12 / 2) * (0.8 + Math.sin((m * 2 + w) * 0.7) * 0.25 + 0.1));
      demandRealData.push(m === 0 ? base : null);   // first 2 bars = real (Abr baseline)
      demandProjData.push(m === 0 ? null : base);   // rest = projection
    }
  }

  // Alerts
  const prodAlerts = [
    { type:'critical', msg:`${prod.name.split(' ').slice(0,2).join('')} con margen negativo -0.7% — revisar precio` },
    { type:'critical', msg:`Margen bruto ${prod.margen}% — bajo umbral mínimo 25%` },
    { type:'critical', msg:'Tienda Norte descuentos al 8.4% sin autorización' },
    { type:'warning',  msg:`${prod.cat} — 5 SKUs bajo punto de reorden` },
  ];
  const alertColors = {
    critical: { bg:'#fef2f2', bd:'#fca5a5', tx:'#dc2626' },
    warning:  { bg:'#fffbeb', bd:'#fcd34d', tx:'#d97706' },
  };

  // ── Chart options ───────────────────────────────────────────────────────────
  const salesOption = useMemo(() => {
    const isIng    = salesMode === 'ingresos';
    const data2026 = isIng ? monthly2026      : monthlyUnits2026;
    const data2025 = isIng ? monthly2025      : monthlyUnits2025;
    const fmtY     = isIng ? (v => 'Q' + Math.round(v / 1000) + 'K') : (v => v + ' un.');
    return {
      tooltip: { trigger:'axis', backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1, textStyle:{fontFamily:FF,fontSize:10}, extraCssText:'box-shadow:0 6px 20px rgba(26,26,26,.13);border-radius:8px' },
      legend:  { bottom:2, left:'center', itemWidth:10, itemHeight:8, itemGap:16, textStyle:{fontFamily:FF,fontSize:9,color:DL.tS} },
      grid:    { top:10, right:14, bottom:40, left:56 },
      xAxis:   { type:'category', data:PROD_MONTHS, axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:FF,fontSize:9,color:DL.tS}, splitLine:{show:false} },
      yAxis:   { type:'value', axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:FF,fontSize:9,color:DL.tS,formatter:fmtY}, splitLine:{lineStyle:{color:'rgba(26,26,26,.06)',type:'dashed'}} },
      series: [
        { name:'Real 2026',       type:'bar', barMaxWidth:16, data: data2026.map((v,i) => i < REAL_END ? { value:v, itemStyle:{color:DL.blue,borderRadius:[3,3,0,0]} } : null) },
        { name:'Proyección 2026', type:'bar', barMaxWidth:16, data: data2026.map((v,i) => i >= REAL_END ? { value:v, itemStyle:{color:'#b8b8b8',borderRadius:[3,3,0,0]} } : null) },
        { name:'2025',            type:'bar', barMaxWidth:16, data: data2025.map(v => ({ value:v, itemStyle:{color:'#d4d4d4',borderRadius:[3,3,0,0]} })) },
      ],
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesMode, prod.id]);

  const demandOption = {
    tooltip: { trigger:'axis', backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1, textStyle:{fontFamily:FF,fontSize:10} },
    legend:  { bottom:2, left:'center', itemWidth:10, itemHeight:8, itemGap:16, textStyle:{fontFamily:FF,fontSize:9,color:DL.tS} },
    grid:    { top:10, right:14, bottom:40, left:52 },
    xAxis:   { type:'category', data:demandLabels, axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:FF,fontSize:8,color:DL.tS,interval:0,rotate:0}, splitLine:{show:false} },
    yAxis:   { type:'value', min:0, axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:FF,fontSize:9,color:DL.tS,formatter:v=>v+' un.'}, splitLine:{lineStyle:{color:'rgba(26,26,26,.06)'}} },
    series: [
      { name:'Real (abr)', type:'bar', data:demandRealData, barMaxWidth:20, itemStyle:{color:DL.green, borderRadius:[3,3,0,0]} },
      { name:'Proyección', type:'bar', data:demandProjData, barMaxWidth:20, itemStyle:{color:'#b8b8b8',borderRadius:[3,3,0,0]} },
    ],
  };

  // ── Style shorthand ─────────────────────────────────────────────────────────
  const card  = { background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1 };

  return (
    <Box sx={{ display:'flex', flexDirection:'column' }}>

      {/* ── Top Bar ───────────────────────────────────────────────────────────── */}
      <PageHeader title="Vista por Producto" live onBack={onBack} onExport={() => {}}>
        {catProds.length > 0 && (
          <MiniSelect
            label={prod.cat}
            value={prod.id}
            onChange={onChangeProd}
            options={catProds.map(p => ({ value: p.id, label: p.name }))}
            minWidth={200}
          />
        )}
      </PageHeader>

      <Box sx={{ p:'14px 20px', display:'flex', flexDirection:'column', gap:'12px' }}>

        {/* ── Product Header Card ──────────────────────────────────────────────── */}
        <Box sx={{ ...card, p:'14px 18px', display:'flex', alignItems:'center', gap:'14px' }}>
          {/* Name + metadata */}
          <Box sx={{ flex:1, minWidth:0 }}>
            {/* Row 1: SKU (small) + Name (large) on same line */}
            <Box sx={{ display:'flex', alignItems:'baseline', gap:'8px', mb:'5px' }}>
              <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tS, fontFamily:FF, whiteSpace:'nowrap' }}>{prod.skuCode}</Typography>
              <Typography sx={{ fontSize:15, fontWeight: 500, color:DL.tH, fontFamily:FF, lineHeight:1.2, whiteSpace:'nowrap' }}>{prod.name}</Typography>
            </Box>
            {/* Row 2: Cat | Supplier | PVP | Costo | tags — all on one line */}
            <Box sx={{ display:'flex', alignItems:'center', gap:'7px', flexWrap:'nowrap' }}>
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, whiteSpace:'nowrap' }}>Cat: {prod.cat}</Typography>
              <Box sx={{ width:'1px', height:'12px', background:DL.border, flexShrink:0 }} />
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, whiteSpace:'nowrap' }}>{supplier.name}</Typography>
              <Box sx={{ width:'1px', height:'12px', background:DL.border, flexShrink:0 }} />
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, whiteSpace:'nowrap' }}>PVP: Q{pvp.toFixed(2)}</Typography>
              <Box sx={{ width:'1px', height:'12px', background:DL.border, flexShrink:0 }} />
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, whiteSpace:'nowrap' }}>Costo: Q{costoU.toFixed(2)}</Typography>
              <Box sx={{ display:'inline-block', px:'7px', py:'2px', borderRadius:'4px', background:DL.blue+'22', fontSize:8, fontWeight: 500, fontFamily:FF, color:DL.blue, whiteSpace:'nowrap', flexShrink:0 }}>{prod.cat}</Box>
              <Box sx={{ display:'inline-block', px:'7px', py:'2px', borderRadius:'4px', fontSize:8, fontWeight: 500, fontFamily:FF, whiteSpace:'nowrap', flexShrink:0,
                background: prod.stock==='Crítico' ? DL.redBg : prod.stock==='Bajo' ? DL.yellowBg : DL.greenBg,
                color:      prod.stock==='Crítico' ? DL.red   : prod.stock==='Bajo' ? DL.yellow   : DL.green,
              }}>{prod.stock}</Box>
            </Box>
          </Box>
          {/* Right summary metrics */}
          <Box sx={{ display:'flex', gap:'0px', flexShrink:0, borderLeft:`1px solid ${DL.border}`, pl:'18px' }}>
            <Box sx={{ textAlign:'right', pr:'18px' }}>
              <Typography sx={{ fontSize:7.5, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FF, mb:'2px' }}>MARGEN BRUTO</Typography>
              <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, fontFamily:FF, lineHeight:1 }}>{prod.margen}%</Typography>
              <Typography sx={{ fontSize:9, color:DL.green, fontWeight: 500, fontFamily:FF, mt:'2px' }}>+2.1% vs periodo anterior</Typography>
            </Box>
            <Box sx={{ textAlign:'right', borderLeft:`1px solid ${DL.border}`, pl:'18px' }}>
              <Typography sx={{ fontSize:7.5, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FF, mb:'2px' }}>% INVENTARIO TOTAL</Typography>
              <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, fontFamily:FF, lineHeight:1 }}>{invPct}%</Typography>
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, mt:'2px' }}>{prod.unidades} un. · {catPart}% de {prod.cat}</Typography>
            </Box>
          </Box>
        </Box>

        {/* ── 5 KPI Cards ──────────────────────────────────────────────────────── */}
        {(() => {
          const ingPct   = Math.round(prod.ing / prod.ingAnt * 100);
          const unitDelta = +(((prod.unidades - prod.unidAnt) / prod.unidAnt) * 100).toFixed(1);
          const unitPct   = Math.round(prod.unidades / prod.unidAnt * 100);
          return (
            <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'10px' }}>
              {/* 1 — Ingresos Período */}
              <KpiCard
                lbl="Ingresos Período"
                val={`Q${Math.round(prod.ing / 1000)}K`}
                pct={ingPct}
                meta={`Q${Math.round(prod.ingAnt / 1000)}K`}
                metaLbl="Período Anterior"
                diff={`${ingresosDelta >= 0 ? '+' : ''}${ingresosDelta}%`}
                diffUp={ingresosDelta >= 0}
                yoyPrev={`Q${Math.round(prod.ingAnt / 1000)}K`}
                yoyDelta={`${ingresosDelta >= 0 ? '+' : ''}${ingresosDelta}%`}
                yoyUp={ingresosDelta >= 0}
              />
              {/* 2 — Unidades Vendidas */}
              <KpiCard
                lbl="Unidades Vendidas"
                val={`${prod.unidades.toLocaleString()} un.`}
                pct={unitPct}
                meta={`${prod.unidAnt.toLocaleString()} un.`}
                metaLbl="Período Anterior"
                diff={`${unitDelta >= 0 ? '+' : ''}${unitDelta}%`}
                diffUp={unitDelta >= 0}
                yoyPrev={`${prod.unidAnt} un.`}
                yoyDelta={`${unitDelta >= 0 ? '+' : ''}${unitDelta}%`}
                yoyUp={unitDelta >= 0}
              />
              {/* 3 — Stock Actual */}
              <KpiCard
                lbl="Stock Actual"
                val={`${prod.unidades.toLocaleString()} un.`}
                pct={stockPct}
                meta={`${reorderPoint} un.`}
                metaLbl="Punto de Reorden"
                diff={prod.stock}
                diffUp={prod.stock === 'Normal'}
                yoyPrev={`${prod.diasStock}d cobertura`}
                yoyDelta={`${prod.rotacion}x rotación`}
                yoyUp={prod.stock !== 'Crítico'}
              />
              {/* 4 — Margen Bruto */}
              <KpiCard
                lbl="Margen Bruto"
                val={`${prod.margen}%`}
                pct={margenPct}
                meta={`${margenMeta.toFixed(1)}%`}
                metaLbl="Meta"
                diff={`${margenDiff >= 0 ? '+' : ''}${margenDiff.toFixed(1)} pp`}
                diffUp={margenDiff >= 0}
                yoyPrev={`${margenMeta.toFixed(1)}%`}
                yoyDelta={`${margenDiff >= 0 ? '+' : ''}${margenDiff.toFixed(1)} pp`}
                yoyUp={margenDiff >= 0}
              />
              {/* 5 — Part. en Categoría */}
              <KpiCard
                lbl="Part. en Categoría"
                val={`${catPart}%`}
                pct={Math.min(100, Math.round(catPart * 4))}
                meta={fmt$(catData.ingreso)}
                metaLbl="Ing. Categoría"
                diff={`+${catPartDelta}%`}
                diffUp={catPartDelta >= 0}
                yoyPrev={`${(catPart - catPartDelta).toFixed(1)}%`}
                yoyDelta={`+${catPartDelta}%`}
                yoyUp
              />
            </Box>
          );
        })()}
        {/* end 5 KPI cards */}

        {/* ── Main 2-col layout ──────────────────────────────────────────────── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'3fr 1fr', gap:'12px', alignItems:'start' }}>

          {/* Left column */}
          <Box sx={{ display:'flex', flexDirection:'column', gap:'12px' }}>

            {/* Ventas Mensuales chart */}
            <Box sx={card}>
              <Box sx={{ px:'16px', py:'11px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FF }}>VENTAS MENSUALES — 2026 VS 2025</Typography>
                  <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FF, mt:'1px' }}>Ingresos Q · Real Ene-Abr + Proyección May-Dic</Typography>
                </Box>
                <Box sx={{ display:'flex', border:`1px solid ${DL.border}`, borderRadius:'7px', overflow:'hidden' }}>
                  <TogBtn2 active={salesMode==='ingresos'} onClick={()=>setSalesMode('ingresos')}>Ingresos Q</TogBtn2>
                  <TogBtn2 active={salesMode==='unidades'} onClick={()=>setSalesMode('unidades')}>Unidades</TogBtn2>
                </Box>
              </Box>
              <ReactECharts option={salesOption} notMerge style={{ height:280, padding:'8px 8px 4px' }} />
            </Box>

            {/* Margen Real por Sucursal */}
            <Box sx={card}>
              <Box sx={{ px:'16px', py:'11px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>Margen Real por Sucursal</Typography>
                  <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, mt:'1px' }}>vs descuentos aplicados</Typography>
                </Box>
                <Box sx={{ display:'flex', border:`1px solid ${DL.border}`, borderRadius:'7px', overflow:'hidden' }}>
                  <TogBtn2 active={branchTab==='margen'}     onClick={()=>setBranchTab('margen')}>% Margen</TogBtn2>
                  <TogBtn2 active={branchTab==='vendedores'} onClick={()=>setBranchTab('vendedores')}>Vendedores</TogBtn2>
                  <TogBtn2 active={branchTab==='movimiento'} onClick={()=>setBranchTab('movimiento')}>Movimiento</TogBtn2>
                </Box>
              </Box>
              <Box component="table" sx={{ width:'100%', borderCollapse:'collapse', fontFamily:FF }}>
                <Box component="thead">
                  <Box component="tr" sx={{ background:DL.subtle }}>
                    {['SUCURSAL','VENTAS Q','DESC.%','MG. REAL','ESTADO'].map((h, hi) => (
                      <Box component="th" key={h} sx={{ p:'8px 14px', textAlign:hi>0?'right':'left', fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:`1px solid ${DL.border}` }}>{h}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {branchRows.map((row, i) => (
                    <Box component="tr" key={i} sx={{ borderBottom:`1px solid ${DL.border}`, '&:last-child':{borderBottom:'none'}, '&:hover':{background:DL.subtle} }}>
                      <Box component="td" sx={{ p:'9px 14px', fontWeight: 500, color:DL.tH, fontSize:11, fontFamily:FF }}>{row.name}</Box>
                      <Box component="td" sx={{ p:'9px 14px', textAlign:'right', fontSize:11, fontWeight: 500, color:DL.blue, fontFamily:FF }}>Q{Math.round(row.ventas / 1000)}K</Box>
                      <Box component="td" sx={{ p:'9px 14px', textAlign:'right', fontSize:10, fontWeight: 500, color:row.desc > 5 ? DL.red : row.desc > 3 ? DL.yellow : DL.tM, fontFamily:FF }}>{row.desc}%</Box>
                      <Box component="td" sx={{ p:'9px 14px', textAlign:'right', fontSize:10, fontWeight: 500, color:row.mgReal >= 24 ? DL.green : row.mgReal >= 20 ? DL.yellow : DL.red, fontFamily:FF }}>{row.mgReal}%</Box>
                      <Box component="td" sx={{ p:'9px 14px', textAlign:'right' }}><EstadoChip estado={row.estado} /></Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>


          </Box>{/* end left column */}

          {/* Right sidebar */}
          <Box sx={{ display:'flex', flexDirection:'column', gap:'12px' }}>

            {/* Alertas de Sistema */}
            <AlertasSistema alerts={prodAlerts.map(a => ({
              tier: a.type === 'critical' ? 'r' : 'y',
              msg: a.msg,
            }))} />

            {/* Proveedor */}
            <Box sx={card}>
              <Box sx={{ px:'12px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
                <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS, fontFamily:FF, textTransform:'uppercase', letterSpacing:'0.07em' }}>PROVEEDOR</Typography>
              </Box>
              <Box sx={{ p:'12px' }}>
                <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FF, mb:'1px' }}>{supplier.name}</Typography>
                <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, mb:'8px' }}>{supplier.tipo} · Activo</Typography>
                <Box sx={{ display:'flex', gap:'2px', mb:'1px' }}>
                  {[1,2,3,4,5].map(s => (
                    <Typography key={s} sx={{ fontSize:13, color:s <= supplier.stars ? '#f59e0b' : '#e3e3e3', lineHeight:1 }}>★</Typography>
                  ))}
                </Box>
                <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FF, mb:'10px' }}>{supplier.stars}.0/5.0 calidad</Typography>
                <Box sx={{ display:'flex', flexDirection:'column', gap:'8px', mb:'10px' }}>
                  {[
                    { label:'Lead time',        val:`${supplier.leadTime} días`,                      color:DL.tH  },
                    { label:'Crédito disponible', val:`Q${supplier.credito.toLocaleString()}`,        color:DL.blue},
                    { label:'Próximo pago',       val:`${supplier.pagoDias} (Q${supplier.pagoAmt.toLocaleString()})`, color:DL.red },
                    { label:'Rating calidad',     val:supplier.rating,                               color:DL.tH  },
                  ].map(row => (
                    <Box key={row.label} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF }}>{row.label}</Typography>
                      <Typography sx={{ fontSize:9, fontWeight: 500, color:row.color, fontFamily:FF }}>{row.val}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Análisis de Descuentos */}
            <Box sx={card}>
              <Box sx={{ px:'12px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
                <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS, fontFamily:FF, textTransform:'uppercase', letterSpacing:'0.07em' }}>ANÁLISIS DE DESCUENTOS</Typography>
              </Box>
              <Box sx={{ p:'12px' }}>
                <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FF, mb:'2px' }}>Descuento promedio aplicado</Typography>
                <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, fontFamily:FF, lineHeight:1, mb:'2px' }}>{descProm}%</Typography>
                <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FF, mb:'6px' }}>Máximo permitido: {descMaxPct}%</Typography>
                <Box sx={{ height:5, background:'rgba(26,26,26,.07)', borderRadius:3, overflow:'hidden', mb:'10px' }}>
                  <Box sx={{ height:'100%', borderRadius:3, width:`${(descProm / descMaxPct) * 100}%`, background:DL.green }} />
                </Box>
                <Box sx={{ display:'flex', flexDirection:'column', gap:'7px', mb:'10px' }}>
                  {[
                    { label:'Mg. bruto s/descuento', val:`${mgSinDesc}%`,                                    color:DL.tH },
                    { label:'Mg. real con descuento', val:`${prod.margen}%`,                                 color:DL.tH },
                    { label:'Impacto neto periodo',   val:`-Q${impactoNeto.toLocaleString()}`,               color:DL.red},
                  ].map(row => (
                    <Box key={row.label} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF }}>{row.label}</Typography>
                      <Typography sx={{ fontSize:9, fontWeight: 500, color:row.color, fontFamily:FF }}>{row.val}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ p:'7px 10px', borderRadius:'6px', background:descOK ? DL.greenBg : DL.redBg, border:`1px solid ${descOK ? DL.greenBd : DL.redBd}` }}>
                  <Typography sx={{ fontSize:8, fontWeight: 500, color:descOK ? DL.green : DL.red, fontFamily:FF }}>
                    {descOK ? '✓ Descuento dentro del rango permitido.' : '✗ Descuento supera el límite permitido.'}
                  </Typography>
                </Box>
              </Box>
            </Box>

          </Box>{/* end right sidebar */}

        </Box>{/* end 2-col layout */}

      </Box>{/* end page content */}
    </Box>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Productos() {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'detalle'
  const [currentProd, setCurrentProd] = useState(null);
  const [filterCat, setFilterCat] = useState('todas');
  const [sortMode, setSortMode] = useState('ingreso');
  const [search, setSearch] = useState('');

  const filteredProds = useMemo(() => {
    let list = [...PRODS];
    if (filterCat !== 'todas') {
      const catMap = { agricola:'Agrícola', veterinario:'Veterinario', semillas:'Semillas', especiales:'Esp. Menores' };
      list = list.filter(p => p.cat === catMap[filterCat]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.skuCode.toLowerCase().includes(q));
    }
    if (sortMode === 'ingreso') list.sort((a, b) => b.ing - a.ing);
    else if (sortMode === 'margen') list.sort((a, b) => b.margen - a.margen);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filterCat, sortMode, search]);

  const handleSelectProd = (prod) => {
    setCurrentProd(prod);
    setView('detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setView('dashboard');
    setCurrentProd(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Sheet 1: Categorías
    const catRows = CATS.map(c => ({
      Categoría: c.name,
      'Ingreso $': c.ingreso,
      'Costo $': c.costo,
      'Margen %': c.margen,
      '% Participación': c.pct,
      SKUs: c.sku,
      'Rotación': c.rotacion,
      'Stock Status': c.stock,
      'Ingreso Anterior $': c.ingrAnt,
      Unidades: c.unidades,
    }));
    const wsCat = XLSX.utils.json_to_sheet(catRows);
    autoWidth(wsCat);
    XLSX.utils.book_append_sheet(wb, wsCat, 'Categorías');

    // Sheet 2: Productos
    const prodRows = PRODS.map(p => ({
      ID: p.id,
      Producto: p.name,
      Categoría: p.cat,
      SKU: p.skuCode,
      'Ingreso $': p.ing,
      'Costo $': p.costo,
      'Margen %': p.margen,
      'Stock Status': p.stock,
      Unidades: p.unidades,
      'Días en Stock': p.diasStock,
      'Rotación': p.rotacion,
    }));
    const wsProd = XLSX.utils.json_to_sheet(prodRows);
    autoWidth(wsProd);
    XLSX.utils.book_append_sheet(wb, wsProd, 'Productos');

    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    XLSX.writeFile(wb, `Productos_${stamp}.xlsx`);
  }

  return (
    <Box>
      <Box sx={{
        opacity: 1,
        transition: 'opacity .2s ease',
      }}>
        {view === 'dashboard' ? (
          <DashboardView
            filteredProds={filteredProds}
            filterCat={filterCat}
            setFilterCat={setFilterCat}
            sortMode={sortMode}
            setSortMode={setSortMode}
            search={search}
            setSearch={setSearch}
            onSelectProd={handleSelectProd}
            onExport={exportToExcel}
          />
        ) : currentProd ? (
          <DetalleView
            prod={currentProd}
            onBack={handleBack}
            catProds={PRODS.filter(p => p.cat === currentProd.cat)}
            onChangeProd={(id) => {
              const p = PRODS.find(x => x.id === id);
              if (p) { setCurrentProd(p); window.scrollTo({ top:0, behavior:'smooth' }); }
            }}
          />
        ) : null}
      </Box>
    </Box>
  );
}
