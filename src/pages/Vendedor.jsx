// ─── Dashboard de Vendedor ────────────────────────────────────────────────────
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  Box, Typography, Modal, Backdrop,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Close as CloseIcon, ArrowUpward as AscIcon, ArrowDownward as DescIcon, UnfoldMore as SortIcon } from '@mui/icons-material';

import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import { DL } from '../theme';
import { useT } from '../i18n/LanguageContext';
import {
  VENDEDORES,
  VEND_KPIS, HIST_DATA, VEND_ALERTS,
  CLIENTES_VEND, CXC_DATA_V2, HEATMAP_VEND, DET_ROWS_VEND,
  VENTAS_CAT_VEND, VENTAS_PROD_VEND,
} from '../data/vendedor';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt$ = (n) => '$' + Number(n).toLocaleString('en-US');
const fmtK = (n) => n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'K' : '$' + n;

const selectSx = {
  fontSize: 10, fontWeight: 500, color: '#3f3f3f',
  border: `1px solid ${DL.border2}`, borderRadius: '6px',
  px: '7px', py: '3px', background: '#fff',
  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
  cursor: 'pointer', outline: 'none',
  '&:focus': { borderColor: DL.blue },
};

// Adapt DET_ROWS_VEND row → InvoiceModal format
function toModalRow(r, selId) {
  const v = VENDEDORES.find(x => x.id === selId);
  const isPaid = r.estado === 'Pagado';
  const abono = isPaid ? r.v : Math.round(r.v * 0.35);
  const pend = r.v - abono;
  return {
    fac: r.id,
    nc: false, nc_monto: null,
    nofac: r.id.replace('F-', '001-001-0'),
    cli: r.cli, cliFull: r.cli,
    canal: 'Tienda Directa',
    vend: v ? v.name.split(' ').map((w, i) => i === 0 ? w[0] + '.' : w).join(' ') : '',
    vendFull: v?.name || '',
    condpago: isPaid ? 'Contado' : '30 días',
    tipo: isPaid ? 'Contado' : 'Crédito',
    fecha: r.fecha ? r.fecha.split('-').reverse().join('/') : '',
    vence: r.venc ? r.venc.split('-').reverse().join('/') : '—',
    qty: Math.max(1, Math.round(r.v / 2000)),
    v: r.v, costo: r.costo,
    mg: r.mgPct, abono, pend, pago: isPaid,
    lines: [{ prod: r.cat + ' — Lote principal', sku: 'SKU-' + r.id.slice(-3), qty: Math.max(1, Math.round(r.v / 2000)), pu: 2000, tot: r.v, costo: r.costo, mg: r.mgPct }],
  };
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function Card({ children, sx }) {
  return (
    <Box sx={{ background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1, overflow: 'hidden', ...sx }}>
      {children}
    </Box>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <Box component="button" onClick={onClick} sx={{
      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      fontSize: 10, fontWeight: active ? 500 : 500,
      px: '12px', py: '6px',
      borderBottom: `2px solid ${active ? DL.blue : 'transparent'}`,
      mb: '-1px', border: 'none', background: 'transparent',
      color: active ? DL.navy : DL.tS,
      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .14s',
      '&:hover': { color: DL.tM },
    }}>
      {label}
    </Box>
  );
}

function SortTH({ label, col, sortCol, sortDir, onSort, align = 'left', sx: extra }) {
  const active = sortCol === col;
  return (
    <TableCell onClick={() => onSort(col)} sx={{
      fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.07em',
      color: active ? DL.blue : DL.tS,
      background: 'rgba(26,26,26,.025)', borderBottom: '2px solid rgba(26,26,26,.08)',
      px: '10px', py: '8px', whiteSpace: 'nowrap',
      textAlign: align, cursor: 'pointer', userSelect: 'none', transition: 'color .12s',
      '&:hover': { color: DL.blue }, ...extra,
    }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        {label}
        {active
          ? sortDir === 'asc' ? <AscIcon sx={{ fontSize: 10 }} /> : <DescIcon sx={{ fontSize: 10 }} />
          : <SortIcon sx={{ fontSize: 10, opacity: .35 }} />}
      </Box>
    </TableCell>
  );
}

// ─── Heatmap Vendedor × Mes (col totals match category heatmap per entity) ───
const HEATMAP_VENDEDOR = {
  JH: {
    xAxis: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'],
    yAxis: ['Juan Hernández','María Lucía','Carlos Arriaga','Jorge Méndez'],
    data: [
      [18200, 20400, 19200, 17800, 19400, 21200, 24400, 26600, 19800],
      [14800, 16200, 15400, 14200, 15600, 17000, 19600, 21400, 15800],
      [11200, 12400, 11600, 10800, 11400, 12600, 14200, 15600, 11800],
      [ 7000,  7100,  6000,  6200,  6000,  5200,  6400,  7200,  6600],
    ],
  },
  JM: {
    xAxis: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'],
    yAxis: ['Roberto Xicay','Ana Revolorio','Luis Tol'],
    data: [
      [3600, 3800, 6200, 7400, 8200, 6400, 4800, 4200, 3600],
      [3200, 3000, 5400, 6200, 7000, 5200, 4000, 3600, 3000],
      [2000, 2000, 3000, 3400, 3000, 2800, 2400, 2400, 1400],
    ],
  },
  ML: {
    xAxis: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'],
    yAxis: ['Sandra Mazariegos','Pedro Chuc','Laura Bautista'],
    data: [
      [10200, 11600, 10800, 11800, 11200, 10200, 12200, 13400, 11800],
      [ 7800,  9000,  8400,  9200,  8800,  8200,  9600, 10400,  9200],
      [ 4000,  4400,  4200,  4600,  4200,  4000,  4400,  5200,  4400],
    ],
  },
  CA: {
    xAxis: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'],
    yAxis: ['Marco Ajú','Daniela Cruz'],
    data: [
      [23100, 18700, 17270, 19580, 24310, 25300, 28270, 32010, 25300],
      [18900, 15300, 14130, 16020, 19890, 20700, 23130, 26190, 20700],
    ],
  },
};

// ─── Demo vendedor rows per entity ───────────────────────────────────────────
const VEND_ROWS = {
  JH: [
    { name:'Juan Hernández',   ventas:184200, delta:12.4, mg:23.8, pend:8400  },
    { name:'María Lucía',      ventas:148600, delta:8.1,  mg:25.2, pend:0     },
    { name:'Carlos Arriaga',   ventas:112400, delta:-2.3, mg:21.6, pend:3200  },
    { name:'Jorge Méndez',     ventas:96800,  delta:15.7, mg:27.3, pend:0     },
  ],
  JM: [
    { name:'Roberto Xicay',    ventas:138400, delta:9.2,  mg:24.1, pend:5600  },
    { name:'Ana Revolorio',    ventas:112000, delta:6.8,  mg:22.4, pend:0     },
    { name:'Luis Tol',         ventas:88600,  delta:-4.1, mg:19.8, pend:2800  },
  ],
  ML: [
    { name:'Sandra Mazariegos',ventas:104800, delta:11.3, mg:25.6, pend:0     },
    { name:'Pedro Chuc',       ventas:82400,  delta:3.4,  mg:22.1, pend:4200  },
    { name:'Laura Bautista',   ventas:68200,  delta:7.6,  mg:23.9, pend:0     },
  ],
  CA: [
    { name:'Marco Ajú',        ventas:96200,  delta:14.2, mg:26.4, pend:1800  },
    { name:'Daniela Cruz',     ventas:78400,  delta:5.9,  mg:24.7, pend:0     },
  ],
};

// ─── Column Picker Popover ────────────────────────────────────────────────────
function ColPickerPopover({ cols, setCols, onClose }) {
  const { t } = useT();
  return (
    <Box sx={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
      background: '#fff', borderRadius: '10px',
      border: `1px solid ${DL.border2}`, boxShadow: DL.e2,
      p: '12px', minWidth: 190,
    }}>
      <Typography sx={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: DL.tS, mb: '8px' }}>
        {t('lbl.colVisibles')}
      </Typography>
      {cols.map((c, i) => (
        <Box key={c.key} sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: '4px', opacity: c.fixed ? 0.5 : 1 }}>
          <Box component="input" type="checkbox" checked={c.vis} disabled={c.fixed}
            onChange={() => { if (c.fixed) return; setCols(prev => prev.map((x, j) => j === i ? { ...x, vis: !x.vis } : x)); }}
            sx={{ cursor: c.fixed ? 'default' : 'pointer', accentColor: DL.blue }}
          />
          <Typography sx={{ fontSize: 10, color: c.fixed ? DL.tS : DL.tH, fontWeight: 500 }}>
            {c.labelKey ? t(c.labelKey) : c.label}
          </Typography>
          {c.fixed && <Typography sx={{ fontSize: 8, color: DL.tS }}>{t('lbl.fijo')}</Typography>}
        </Box>
      ))}
      <Box component="button" onClick={onClose} sx={{
        mt: '8px', width: '100%', py: '5px', borderRadius: '6px',
        border: `1px solid ${DL.border2}`, background: '#fff',
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 9, fontWeight: 500, color: DL.tM,
        cursor: 'pointer', '&:hover': { borderColor: DL.blue, color: DL.blue },
      }}>
        {t('btn.close')}
      </Box>
    </Box>
  );
}

function ColsBtn({ open, onClick }) {
  const { t } = useT();
  return (
    <Box component="button" onClick={onClick} sx={{
      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      fontSize: 9, fontWeight: 500,
      px: '10px', py: '5px', borderRadius: '7px',
      border: `1px solid ${DL.border2}`, background: open ? 'rgba(84,126,105,.08)' : '#fff',
      color: open ? DL.blue : DL.tM,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
      transition: 'all .14s', flexShrink: 0,
      '&:hover': { borderColor: DL.blue, color: DL.navy },
    }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5px', width: 10 }}>
        {[0, 1, 2, 3].map(i => <Box key={i} sx={{ width: 4, height: 4, background: 'currentColor', borderRadius: .5, opacity: .7 }} />)}
      </Box>
      {t('btn.columns')}
    </Box>
  );
}

// ─── KPI Row ──────────────────────────────────────────────────────────────────
function KpiRow({ kpis, columns = 4, children }) {
  const { t } = useT();
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs:'repeat(2,1fr)', sm:'repeat(3,1fr)', md:`repeat(${columns}, minmax(0,1fr))` }, gap: '10px' }}>
      {kpis.map(k => {
        const barColor = k.pct >= 100 ? DL.green : k.pct >= 80 ? DL.yellow : DL.red;
        const barW = Math.min(k.pct, 100);
        return (
          <Box key={k.id} sx={{
            background: '#fff', borderRadius: '10px',
            border: `1px solid ${DL.border}`, boxShadow: DL.e1,
            p: '12px 13px 10px', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            transition: 'box-shadow .2s, transform .2s', cursor: 'default',
            '&:hover': { boxShadow: DL.e2, transform: 'translateY(-1px)' },
          }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '10px 10px 0 0', background: barColor }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '3px', mb: '5px' }}>
              <Typography sx={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: DL.tS }}>{k.label}</Typography>
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', background: `${barColor}1a`, color: barColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, flexShrink: 0 }}>{k.badgeIcon}</Box>
            </Box>
            <Typography sx={{
              fontSize: 20, fontWeight: 500, color: DL.tH, lineHeight: 1.05, letterSpacing: '-.04em',
              pb: '3px', mb: '3px',
              borderBottom: '1px solid rgba(26,26,26,.08)',
            }}>{k.value}</Typography>
            {/* Meta label + value */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '4px' }}>
              <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.metaLabel}</Typography>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH }}>{k.meta}</Typography>
            </Box>
            {/* THICK progress bar — matches Desempeño style */}
            <Box sx={{ height: 9, background: '#e3e3e3', borderRadius: 5, overflow: 'hidden', mb: '5px' }}>
              <Box sx={{ height: '100%', borderRadius: 5, width: `${barW}%`, background: barColor, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
            </Box>
            {/* Pct + metaDelta */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '8px', alignItems: 'center', gap: '4px' }}>
              <Typography sx={{ fontSize: 9, fontWeight: 500, color: barColor, whiteSpace: 'nowrap' }}>{k.pct.toFixed(0)} {t('lbl.deMeta')}</Typography>
              {k.metaDelta && (
                <Box sx={{ fontSize: 8, fontWeight: 500, px: '5px', py: '1px', borderRadius: '4px', background: k.metaDeltaUp ? DL.greenBg : DL.redBg, color: k.metaDeltaUp ? DL.green : DL.red, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {k.metaDelta}
                </Box>
              )}
            </Box>
            <Box sx={{ background: 'rgba(26,26,26,.035)', borderRadius: '5px', p: '4px 7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px', mt: 'auto' }}>
              <Typography sx={{ fontSize: 7.5, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{k.yoy}</Typography>
              <Box sx={{ fontSize: 8, fontWeight: 500, px: '5px', py: '1px', borderRadius: '4px', background: k.deltaUp ? DL.greenBg : DL.redBg, color: k.deltaUp ? DL.green : DL.red, whiteSpace: 'nowrap' }}>{k.delta}</Box>
            </Box>
          </Box>
        );
      })}
      {children}
    </Box>
  );
}

// ─── Histórico ────────────────────────────────────────────────────────────────
const SPLIT_OPTS = [
  { value: 'general',   labelKey: 'vend.split.mes'       },
  { value: 'categoria', labelKey: 'vend.split.categoria' },
  { value: 'clientes',  labelKey: 'vend.split.clientes'  },
];

// Stock value demo data (12 months) per entity
const STOCK_HIST = {
  JH: [892, 878, 861, 894, 908, 921, 887, 862, 831, 811, 798, 832],
  JM: [641, 628, 612, 639, 651, 668, 644, 621, 598, 581, 574, 601],
  ML: [513, 498, 480, 507, 519, 534, 511, 490, 463, 441, 432, 456],
  CA: [385, 371, 356, 378, 391, 404, 381, 362, 340, 324, 317, 339],
};
const HIST_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function HistoricoCard({ histData, selId, isSucursal }) {
  const { t } = useT();
  const [gran,      setGran]      = useState('mes');
  const [split,     setSplit]     = useState('general');
  const [valMode,   setValMode]   = useState('$');
  const [stockMode, setStockMode] = useState(false); // false=ventas true=stock

  const d = histData?.[split]?.[gran] || histData?.general?.[gran] || histData?.general?.mes;
  const stockVals = STOCK_HIST[selId] || STOCK_HIST.JH;

  const chartOption = useMemo(() => {
    // ── Stock mode ────────────────────────────────────────────────────
    if (stockMode) {
      return {
        animation: true, animationDuration: 500,
        grid: { top: 16, right: 20, bottom: 40, left: 62 },
        xAxis: { type: 'category', data: HIST_MONTHS, axisLine: { lineStyle: { color: 'rgba(26,26,26,.12)' } }, axisTick: { show: false }, axisLabel: { fontFamily: 'Inter', fontSize: 10, color: '#8d8d8d' }, splitLine: { show: false } },
        yAxis: { type: 'value', axisLabel: { fontFamily: 'Inter', fontSize: 10, color: '#8d8d8d', formatter: v => '$'+v+'K' }, splitLine: { lineStyle: { color: 'rgba(26,26,26,.06)', type: 'dashed' } }, axisLine: { show: false }, axisTick: { show: false } },
        tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: 'rgba(26,26,26,.15)', borderWidth: 1, padding: [10, 14], textStyle: { fontFamily: 'Inter', fontSize: 11, color: '#1a1a1a' }, formatter: p => `${p[0].name}<br/><b>$${p[0].value}K</b>` },
        legend: { show: false },
        series: [{
          name: 'Stock $', type: 'line', data: stockVals, smooth: true,
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,163,74,.25)' }, { offset: 1, color: 'rgba(22,163,74,.02)' }] } },
          lineStyle: { color: DL.green, width: 2.5 },
          itemStyle: { color: DL.green }, symbolSize: 5,
          markLine: {
            silent: true, symbol: 'none',
            data: [{ type: 'average', name: 'Promedio', label: { formatter: v => 'Prom $'+Math.round(v.value)+'K', color: '#8d8d8d', fontSize: 9 }, lineStyle: { color: '#8d8d8d', type: 'dashed', width: 1 } }],
          },
        }],
      };
    }
    // ── Ventas mode ───────────────────────────────────────────────────
    if (!d) return {};
    const series = d.datasets.map(ds => ({
      name: ds.label, type: 'bar', data: ds.data,
      barMaxWidth: 14, barGap: '8%', barCategoryGap: '35%',
      itemStyle: { color: ds.color, borderRadius: [3, 3, 0, 0] },
      emphasis: { focus: 'series' },
    }));
    if (d.budget) series.push({ name: t('lbl.meta'), type: 'line', data: d.budget, smooth: false, symbol: 'circle', symbolSize: 4, lineStyle: { color: '#d97706', width: 1.8, type: 'dashed' }, itemStyle: { color: '#d97706' }, z: 10 });
    return {
      animation: true, animationDuration: 500,
      grid: { top: 16, right: 20, bottom: 52, left: 62 },
      xAxis: { type: 'category', data: d.labels, axisLine: { lineStyle: { color: 'rgba(26,26,26,.12)' } }, axisTick: { show: false }, axisLabel: { fontFamily: 'Inter', fontSize: 10, color: '#8d8d8d' }, splitLine: { show: false } },
      yAxis: { type: 'value', axisLabel: { fontFamily: 'Inter', fontSize: 10, color: '#8d8d8d', formatter: v => fmtK(v) }, splitLine: { lineStyle: { color: 'rgba(26,26,26,.06)', type: 'dashed' } }, axisLine: { show: false }, axisTick: { show: false } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#fff', borderColor: 'rgba(26,26,26,.15)', borderWidth: 1, padding: [10, 14], textStyle: { fontFamily: 'Inter', fontSize: 11, color: '#1a1a1a' } },
      legend: {
        show: true, bottom: 0, left: 'center',
        itemWidth: 10, itemHeight: 10, itemGap: 18,
        textStyle: { fontFamily: 'Inter', fontSize: 9, fontWeight: 500, color: '#8d8d8d' },
        inactiveColor: '#d4d4d4',
      },
      series,
    };
  }, [d, stockMode, stockVals, t]);

  return (
    <Card>
      <Box sx={{ px: '16px', py: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${DL.border}`, flexWrap: 'wrap', gap: '8px' }}>
        {/* Title */}
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH }}>
          {t('sec.ventasHistoricas')}
        </Typography>
        {/* Controls — hidden in stock mode */}
        {!stockMode && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('vend.hist.vista')}</Typography>
              <Box component="select" value={gran} onChange={e => { setGran(e.target.value); if (e.target.value === 'trim' || e.target.value === 'semana') setSplit('general'); }} sx={selectSx}>
                <option value="semana">{t('time.semana')}</option>
                <option value="mes">{t('time.mes')}</option>
                <option value="trim">{t('time.trimestral')}</option>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('vend.hist.splitBy')}</Typography>
              <Box component="select" value={split} onChange={e => setSplit(e.target.value)} sx={selectSx}>
                {SPLIT_OPTS.map(o => <option key={o.value} value={o.value} disabled={(gran === 'trim' || gran === 'semana') && o.value !== 'general'}>{t(o.labelKey)}</option>)}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Typography sx={{ fontSize: 9, fontWeight: 500, color: valMode === '$' ? DL.navy : DL.tS, transition: 'color .15s' }}>$</Typography>
              <Box component="button" onClick={() => setValMode(v => v === '$' ? 'cant' : '$')} sx={{ width: 28, height: 14, borderRadius: 7, border: 'none', background: valMode === 'cant' ? DL.blue : DL.border2, cursor: 'pointer', position: 'relative', padding: 0, flexShrink: 0, transition: 'background .2s', '&::after': { content: '""', position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: '#fff', top: '50%', transform: 'translateY(-50%)', left: valMode === '$' ? '2px' : 'calc(100% - 12px)', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' } }} />
              <Typography sx={{ fontSize: 9, fontWeight: 500, color: valMode === 'cant' ? DL.navy : DL.tS, transition: 'color .15s' }}>{t('vend.lbl.cant')}</Typography>
            </Box>
          </Box>
        )}
      </Box>
      {/* Stock mode subtitle */}
      {stockMode && (
        <Box sx={{ px:'16px', pt:'8px', pb:'2px' }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <Box sx={{ width:10, height:10, borderRadius:'2px', background:DL.green }} />
            <Typography sx={{ fontSize:9, color:DL.tS, fontWeight: 500 }}>{t('vend.hist.stockSub')}</Typography>
          </Box>
        </Box>
      )}
      <Box sx={{ px: '8px', pb: '8px' }}>
        <ReactECharts option={chartOption} style={{ height: 260 }} />
      </Box>
    </Card>
  );
}

// ─── Alerts Panel ─────────────────────────────────────────────────────────────
const ALERT_C = {
  r: { bg: '#fff1f0', border: DL.red,    iconBg: '#fee2e2', iconColor: DL.red,    iconBd: '#fca5a5', icon: '!' },
  y: { bg: '#fffbeb', border: '#d97706', iconBg: '#fef3c7', iconColor: '#d97706', iconBd: '#fcd34d', icon: '⚠' },
  g: { bg: '#f0fdf4', border: DL.green,  iconBg: '#dcfce7', iconColor: DL.green,  iconBd: '#86efac', icon: '✓' },
};
function AlertsPanel({ alerts }) {
  const { t } = useT();
  const [filter, setFilter] = useState('todos');
  const shown = filter === 'criticos' ? alerts.filter(a => a.type === 'r') : filter === 'atencion' ? alerts.filter(a => a.type === 'y') : filter === 'positivos' ? alerts.filter(a => a.type === 'g') : alerts;
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: '14px', py: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${DL.border}`, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH }}>{t('sec.alertas')}</Typography>
        <Box component="select" value={filter} onChange={e => setFilter(e.target.value)} sx={selectSx}>
          <option value="todos">{t('filter.todos')}</option>
          <option value="criticos">{t('vend.alerts.criticos')}</option>
          <option value="atencion">{t('vend.alerts.atencion')}</option>
          <option value="positivos">{t('vend.alerts.positivos')}</option>
        </Box>
      </Box>
      <Box sx={{ p: '6px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
        {shown.map((a, i) => {
          const c = ALERT_C[a.type];
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '6px', p: '5px 8px', borderRadius: '6px', borderLeft: `2px solid ${c.border}`, background: c.bg }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: c.iconBg, color: c.iconColor, border: `1px solid ${c.iconBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 500 }}>{c.icon}</Box>
              <Typography sx={{ fontSize: 9, color: DL.tM, lineHeight: 1.35, fontWeight: 500 }}>{a.msg}</Typography>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}

// ─── Clientes / Categoría / Producto Card ─────────────────────────────────────
const COLS_CFG = {
  clientes: [
    { key: 'nombre',       labelKey: 'col.cliente',       fixed: true,  vis: true  },
    { key: 'ventas',       labelKey: 'col.ventas',        fixed: true,  vis: true  },
    { key: 'ant',          labelKey: 'col.vtaAnoAnt',     fixed: false, vis: true  },
    { key: 'cxcVencido',   labelKey: 'col.cxcVencido',    fixed: false, vis: true  },
    { key: 'cxcTotal',     labelKey: 'col.cxcTotal',      fixed: false, vis: true  },
    { key: 'cxcNoVencido', labelKey: 'col.cxcNoVencido',  fixed: false, vis: true  },
  ],
  categoria: [
    { key: 'nombre',     labelKey: 'col.categoria',   fixed: true,  vis: true  },
    { key: 'ventas',     labelKey: 'col.ventas',       fixed: true,  vis: true  },
    { key: 'ant',        labelKey: 'col.vtaAnoAnt',    fixed: false, vis: true  },
    { key: 'delta',      labelKey: 'col.vsAnt',        fixed: false, vis: true  },
    { key: 'mg',         labelKey: 'col.mg',           fixed: false, vis: true  },
    { key: 'skus',       labelKey: 'col.skus',         fixed: false, vis: true  },
    { key: 'skusAnt',    labelKey: 'col.skusAnt',      fixed: false, vis: true  },
    { key: 'rotacion',   labelKey: 'col.rotInv',       fixed: false, vis: true  },
    { key: 'valorStock', labelKey: 'col.valorStock',   fixed: false, vis: true  },
    { key: 'pend',       labelKey: 'col.cxcPend',      fixed: false, vis: false },
  ],
  producto: [
    { key: 'nombre',      labelKey: 'col.producto',     fixed: true,  vis: true  },
    { key: 'cat',         labelKey: 'col.categoria',    fixed: false, vis: true  },
    { key: 'ventas',      labelKey: 'col.ventas',       fixed: true,  vis: true  },
    { key: 'ant',         labelKey: 'col.vtaAnoAnt',    fixed: false, vis: true  },
    { key: 'delta',       labelKey: 'col.vsAnt',        fixed: false, vis: true  },
    { key: 'mg',          labelKey: 'col.mg',           fixed: false, vis: true  },
    { key: 'stockStatus', labelKey: 'col.estado',       fixed: false, vis: true  },
    { key: 'rotacion',    labelKey: 'col.rotInv',       fixed: false, vis: true  },
    { key: 'valorStock',  labelKey: 'col.valorStock',   fixed: false, vis: true  },
    { key: 'cantStock',   labelKey: 'col.cantStock',    fixed: false, vis: true  },
  ],
  vendedor: [
    { key: 'nombre',   labelKey: 'col.vendedor',   fixed: true,  vis: true  },
    { key: 'ventas',   labelKey: 'col.ventas',     fixed: true,  vis: true  },
    { key: 'delta',    labelKey: 'col.vsAnt',      fixed: false, vis: true  },
    { key: 'mg',       labelKey: 'col.mg',         fixed: false, vis: true  },
    { key: 'pend',     labelKey: 'col.cxcPend',    fixed: false, vis: true  },
  ],
};

const CLI_PAGE_SIZE = 8;

function ClientesCard({ cliRows, catRows, prodRows, vendRows, isSucursal }) {
  const { t } = useT();
  const [tab,          setTab]          = useState('clientes');
  const [sortCol,      setSortCol]      = useState('ventas');
  const [sortDir,      setSortDir]      = useState('desc');
  const [cliPage,      setCliPage]      = useState(0);
  const [colsPickerOpen, setColsPickerOpen] = useState(false);
  const [cols, setCols] = useState({
    clientes: COLS_CFG.clientes.map(c => ({ ...c })),
    categoria: COLS_CFG.categoria.map(c => ({ ...c })),
    producto: COLS_CFG.producto.map(c => ({ ...c })),
    vendedor: COLS_CFG.vendedor.map(c => ({ ...c })),
  });
  const pickerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setColsPickerOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleTab = (t) => { setTab(t); setSortCol('ventas'); setSortDir('desc'); setColsPickerOpen(false); setCliPage(0); };
  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  // Normalize rows to common shape
  const rawRows = tab === 'clientes' ? cliRows : tab === 'categoria' ? catRows : tab === 'vendedor' ? vendRows : prodRows;
  const rows = useMemo(() => {
    const normalized = (rawRows || []).map(r => ({
      nombre:      r.name        || r.nombre,
      seg:         r.seg         || null,
      segColor:    r.segColor    || null,
      cat:         r.cat         || null,
      ventas:      r.ventas      || 0,
      ant:         r.ant         ?? 0,
      delta:       r.delta       ?? 0,
      mg:          r.mg          ?? r.mgPct ?? 0,
      pend:        r.pend        ?? 0,
      skus:        r.skus        ?? null,
      skusAnt:     r.skusAnt     ?? null,
      lowStockQ:   r.lowStockQ   ?? null,
      rotacion:    r.rotacion    ?? null,
      valorStock:  r.valorStock  ?? null,
      cantStock:   r.cantStock   ?? null,
      stockStatus: r.stockStatus ?? null,
      cxcVencido:  r.cxcVencido  ?? 0,
      cxcNoVencido: r.cxcNoVencido ?? 0,
      cxcTotal:    r.cxcTotal    ?? 0,
    }));
    return [...normalized].sort((a, b) => {
      const av = typeof a[sortCol] === 'string' ? a[sortCol].toLowerCase() : (a[sortCol] ?? 0);
      const bv = typeof b[sortCol] === 'string' ? b[sortCol].toLowerCase() : (b[sortCol] ?? 0);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rawRows, sortCol, sortDir]);

  const activeCols = cols[tab].filter(c => c.vis);
  const sp = { sortCol, sortDir, onSort: handleSort };
  const thSx = { background: 'rgba(26,26,26,.025)', borderBottom: '2px solid rgba(26,26,26,.08)', px: '10px', py: '8px' };
  const cliTotalPages = Math.ceil(rows.length / CLI_PAGE_SIZE);
  const cliSlice = rows.slice(cliPage * CLI_PAGE_SIZE, (cliPage + 1) * CLI_PAGE_SIZE);

  const renderCell = (r, key) => {
    switch (key) {
      case 'nombre': return <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{r.nombre}</Typography>;
      case 'segmento': return r.seg ? (
        <Box sx={{ display: 'inline-flex', px: '6px', py: '2px', borderRadius: '4px', background: (r.segColor || DL.blue) + '18', border: `1px solid ${(r.segColor || DL.blue)}40` }}>
          <Typography sx={{ fontSize: 9, fontWeight: 500, color: r.segColor || DL.blue }}>{r.seg}</Typography>
        </Box>
      ) : <Typography sx={{ fontSize: 10, color: DL.tS }}>—</Typography>;
      case 'cat': return <Typography sx={{ fontSize: 10, color: DL.tM }}>{r.cat || '—'}</Typography>;
      case 'ventas': return <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{fmt$(r.ventas)}</Typography>;
      case 'delta': return (
        <Box sx={{ display: 'inline-flex', px: '5px', py: '1px', borderRadius: '4px', background: r.delta >= 0 ? DL.greenBg : DL.redBg }}>
          <Typography sx={{ fontSize: 9, fontWeight: 500, color: r.delta >= 0 ? DL.green : DL.red }}>
            {r.delta >= 0 ? '+' : ''}{r.delta.toFixed(1)}%
          </Typography>
        </Box>
      );
      case 'mg': return (
        <Typography sx={{ fontSize: 10, fontWeight: 500, color: r.mg >= 30 ? DL.green : r.mg >= 20 ? DL.yellow : DL.red }}>
          {r.mg}%
        </Typography>
      );
      case 'pend': return (
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: r.pend > 0 ? DL.red : DL.tS }}>
          {r.pend > 0 ? fmt$(r.pend) : '—'}
        </Typography>
      );
      case 'ant': return (
        <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tM }}>
          {r.ant > 0 ? fmt$(r.ant) : '—'}
        </Typography>
      );
      case 'skus': return (
        <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH }}>
          {r.skus != null ? r.skus : '—'}
        </Typography>
      );
      case 'skusAnt': {
        if (r.skusAnt == null) return <Typography sx={{ fontSize:10, color:DL.tS }}>—</Typography>;
        const diff = (r.skus ?? 0) - r.skusAnt;
        const color = diff > 0 ? DL.green : diff < 0 ? DL.red : DL.tS;
        return (
          <Box sx={{ display:'flex', alignItems:'center', gap:'4px' }}>
            <Typography sx={{ fontSize:10, color:DL.tM }}>{r.skusAnt}</Typography>
            {diff !== 0 && (
              <Typography sx={{ fontSize:8, fontWeight: 500, color }}>{diff > 0 ? `+${diff}` : diff}</Typography>
            )}
          </Box>
        );
      }
      case 'cantStock': return (
        <Typography sx={{ fontSize:10, fontWeight: 500, color: r.cantStock != null ? DL.tH : DL.tS }}>
          {r.cantStock != null ? r.cantStock.toLocaleString() : '—'}
        </Typography>
      );
      case 'rotacion': return (
        <Typography sx={{ fontSize: 10, fontWeight: 500, color: r.rotacion != null ? (r.rotacion <= 30 ? DL.green : r.rotacion <= 60 ? DL.yellow : DL.red) : DL.tS }}>
          {r.rotacion != null ? `${r.rotacion}d` : '—'}
        </Typography>
      );
      case 'valorStock': return (
        <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH }}>
          {r.valorStock != null ? fmt$(r.valorStock) : '—'}
        </Typography>
      );
      case 'stockStatus': {
        if (!r.stockStatus) return <Typography sx={{ fontSize:10, color:DL.tS }}>—</Typography>;
        const sc = r.stockStatus === 'Normal' ? { bg: DL.greenBg, color: DL.green }
                 : r.stockStatus === 'Bajo'   ? { bg: DL.yellowBg, color: DL.yellow }
                 :                              { bg: DL.redBg, color: DL.red };
        return (
          <Box sx={{ display:'inline-flex', px:'6px', py:'2px', borderRadius:'4px', background: sc.bg }}>
            <Typography sx={{ fontSize:9, fontWeight: 500, color: sc.color }}>{r.stockStatus}</Typography>
          </Box>
        );
      }
      case 'cxcVencido': return (
        <Typography sx={{ fontSize:11, fontWeight: 500, color: r.cxcVencido > 0 ? DL.red : DL.tS }}>
          {r.cxcVencido > 0 ? fmt$(r.cxcVencido) : '—'}
        </Typography>
      );
      case 'cxcTotal': return (
        <Typography sx={{ fontSize:11, fontWeight: 500, color: DL.tH }}>
          {r.cxcTotal > 0 ? fmt$(r.cxcTotal) : '—'}
        </Typography>
      );
      case 'cxcNoVencido': return (
        <Typography sx={{ fontSize:11, fontWeight: 500, color: r.cxcNoVencido > 0 ? DL.blue : DL.tS }}>
          {r.cxcNoVencido > 0 ? fmt$(r.cxcNoVencido) : '—'}
        </Typography>
      );
      default: return null;
    }
  };

  const TAB_LABELS = {
    clientes: t('vend.tab.clientes'),
    categoria: t('vend.tab.categoria'),
    producto: t('vend.tab.producto'),
    vendedor: t('des.tab.vendedor'),
  };

  return (
    <Card>
      {/* Header row */}
      <Box sx={{ px: '14px', py: '10px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH }}>{t('vend.cli.titulo')}</Typography>
        <Box ref={pickerRef} sx={{ position: 'relative' }}>
          <ColsBtn open={colsPickerOpen} onClick={() => setColsPickerOpen(o => !o)} />
          {colsPickerOpen && (
            <ColPickerPopover
              cols={cols[tab]}
              setCols={newCols => setCols(prev => ({ ...prev, [tab]: newCols }))}
              onClose={() => setColsPickerOpen(false)}
            />
          )}
        </Box>
      </Box>
      {/* Tabs — hide 'vendedor' tab in vendedor view (only show in sucursal) */}
      <Box sx={{ display: 'flex', borderBottom: `1px solid ${DL.border}`, px: '8px', pt: '4px' }}>
        {['clientes', 'categoria', 'producto', ...(isSucursal ? ['vendedor'] : [])].map(t => (
          <TabBtn key={t} label={TAB_LABELS[t]} active={tab === t} onClick={() => handleTab(t)} />
        ))}
      </Box>
      {/* Table padded & bordered */}
      <Box sx={{ p: '12px 14px 14px' }}>
        <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {activeCols.map(c => (
                    <SortTH
                      key={c.key} label={t(c.labelKey)} col={c.key}
                      align={['ventas','ant','delta','mg','pend','skus','skusAnt','rotacion','valorStock','cantStock','stockStatus','cxcVencido','cxcTotal','cxcNoVencido'].includes(c.key) ? 'right' : 'left'}
                      {...sp}
                      sx={{ ...thSx }}
                    />
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {cliSlice.map((r, i) => (
                  <TableRow key={i} sx={{ borderBottom: '1px solid rgba(26,26,26,.05)', '&:hover td': { background: 'rgba(84,126,105,.025)' } }}>
                    {activeCols.map(c => (
                      <TableCell key={c.key} sx={{ px: '10px', py: '9px', textAlign: ['ventas','ant','delta','mg','pend','skus','skusAnt','rotacion','valorStock','cantStock','stockStatus','cxcVencido','cxcTotal','cxcNoVencido'].includes(c.key) ? 'right' : 'left' }}>
                        {renderCell(r, c.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      {/* Pagination — always visible, right-aligned */}
      <Box sx={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'4px', px:'14px', py:'10px', borderTop:`1px solid ${DL.border}` }}>
        <Typography sx={{ fontSize:9, color:DL.tS, mr:'6px' }}>
          {rows.length === 0 ? '0 registros' : `${cliPage * CLI_PAGE_SIZE + 1}–${Math.min((cliPage + 1) * CLI_PAGE_SIZE, rows.length)} de ${rows.length}`}
        </Typography>
        {[{icon:'‹',dir:-1},{icon:'›',dir:1}].map(b => (
          <Box key={b.dir} component="button" onClick={() => setCliPage(p => Math.max(0, Math.min(cliTotalPages-1, p+b.dir)))}
            disabled={b.dir===-1 ? cliPage===0 : cliPage>=cliTotalPages-1}
            sx={{ width:26, height:26, borderRadius:'5px', border:`1px solid ${DL.border}`, background:'#fff',
              fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight: 500, color:DL.tM,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              '&:hover':{ borderColor:DL.blue, color:DL.blue }, '&:disabled':{ opacity:.35, cursor:'default' },
            }}>{b.icon}</Box>
        ))}
      </Box>
    </Card>
  );
}

// ─── CxC Card ────────────────────────────────────────────────────────────────
function CxcCard({ cxc }) {
  const { t } = useT();
  const [mode, setMode] = useState('$'); // '$' = amounts | '#' = invoice count

  const fmt$ = (v) => '$' + Number(v).toLocaleString('en-US');

  const totalVencidoAmt = cxc.desglose.reduce((s, r) => s + r.vencido, 0);
  const pctVencido = cxc.total > 0 ? Math.round((totalVencidoAmt / cxc.total) * 100) : 0;
  const barColor = pctVencido > 40 ? DL.red : pctVencido > 15 ? DL.yellow : DL.green;

  const totalVigente = cxc.desglose.reduce((s, r) => s + r.vigente, 0);
  const totalVencido = cxc.desglose.reduce((s, r) => s + r.vencido, 0);
  const totalFacsVte = cxc.desglose.reduce((s, r) => s + (r.facs?.vte || 0), 0);
  const totalFacsVcd = cxc.desglose.reduce((s, r) => s + (r.facs?.vcd || 0), 0);

  // Shared toggle pill style
  const pillBtn = (active) => ({
    px: '9px', py: '4px', fontSize: 10, fontWeight: 500,
    cursor: 'pointer', userSelect: 'none',
    background: active ? DL.blue : 'transparent',
    color: active ? '#fff' : DL.tS,
    transition: 'all .14s',
    '&:hover': !active ? { background: 'rgba(84,126,105,.07)' } : {},
  });

  const isCount = mode === '#';

  // Header columns change label when showing counts
  const colHeaders = isCount
    ? [t('vend.cxc.periodo'), t('vend.cxc.facsVte'), t('vend.cxc.facsVcd'), t('des.total')]
    : [t('vend.cxc.periodo'), t('vend.cxc.vigente'), t('col.vencido'), t('des.total')];

  return (
    <Card>
      <Box sx={{ px: '14px', py: '10px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH }}>{t('page.cxc')}</Typography>
        {/* $ / # toggle */}
        <Box sx={{ display: 'flex', border: `1px solid ${DL.border}`, borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
          {['$', '#'].map(m => (
            <Box key={m} onClick={() => setMode(m)} sx={pillBtn(mode === m)}>{m}</Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ p: '14px 14px 4px' }}>
        {/* Total + bar — always in $ */}
        <Typography sx={{ fontSize: 24, fontWeight: 500, color: DL.tH, letterSpacing: '-1px', lineHeight: 1 }}>{fmt$(cxc.total)}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '6px', mb: '2px' }}>
          <Typography sx={{ fontSize: 9, color: DL.tS }}>Vencido: {fmt$(totalVencidoAmt)}</Typography>
          <Typography sx={{ fontSize: 9, fontWeight: 500, color: barColor }}>{pctVencido}% vencido</Typography>
        </Box>
        {/* Progress bar — shows % of total that is vencido */}
        <Box sx={{ position: 'relative', height: 4, background: '#e3e3e3', borderRadius: '4px', overflow: 'hidden', mb: '14px' }}>
          <Box sx={{ height: '100%', borderRadius: '4px', width: `${Math.min(pctVencido, 100)}%`, background: barColor, transition: 'width .6s ease' }} />
        </Box>
      </Box>

      {/* Desglose table */}
      <Box sx={{ px: '14px', pb: '14px' }}>
        <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {colHeaders.map((h, i) => (
                  <TableCell key={h} sx={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: DL.tS, background: 'rgba(26,26,26,.025)', borderBottom: '2px solid rgba(26,26,26,.08)', px: '10px', py: '7px', textAlign: i === 0 ? 'left' : 'right', whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cxc.desglose.map((row, i) => {
                const vte   = isCount ? (row.facs?.vte || 0) : row.vigente;
                const vcd   = isCount ? (row.facs?.vcd || 0) : row.vencido;
                const total = isCount ? (vte + vcd) : (row.vigente + row.vencido);
                return (
                  <TableRow key={i} sx={{ borderBottom: '1px solid rgba(26,26,26,.05)', '&:hover td': { background: 'rgba(84,126,105,.02)' } }}>
                    <TableCell sx={{ fontSize: 11, color: DL.tM, fontWeight: 500, px: '10px', py: '8px' }}>{row.lbl}</TableCell>
                    <TableCell sx={{ px: '10px', textAlign: 'right' }}>
                      {vte > 0
                        ? <Typography sx={{ fontSize: 10, fontWeight: 500, color: '#547e69' }}>{isCount ? vte : fmt$(vte)}</Typography>
                        : <Typography sx={{ fontSize: 10, color: DL.tS }}>—</Typography>}
                    </TableCell>
                    <TableCell sx={{ px: '10px', textAlign: 'right' }}>
                      {vcd > 0
                        ? <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.red }}>{isCount ? vcd : fmt$(vcd)}</Typography>
                        : <Typography sx={{ fontSize: 10, color: DL.tS }}>—</Typography>}
                    </TableCell>
                    <TableCell sx={{ px: '10px', textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH }}>{total > 0 ? (isCount ? total : fmt$(total)) : '—'}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Totals row */}
              <TableRow sx={{ background: 'rgba(26,26,26,.025)', borderTop: '2px solid rgba(26,26,26,.08)' }}>
                <TableCell sx={{ fontSize: 10, fontWeight: 500, color: DL.tM, px: '10px', py: '8px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{t('des.total')}</TableCell>
                <TableCell sx={{ px: '10px', textAlign: 'right' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: '#547e69' }}>{isCount ? totalFacsVte : fmt$(totalVigente)}</Typography>
                </TableCell>
                <TableCell sx={{ px: '10px', textAlign: 'right' }}>
                  {(isCount ? totalFacsVcd : totalVencido) > 0
                    ? <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.red }}>{isCount ? totalFacsVcd : fmt$(totalVencido)}</Typography>
                    : <Typography sx={{ fontSize: 10, color: DL.tS }}>—</Typography>}
                </TableCell>
                <TableCell sx={{ px: '10px', textAlign: 'right' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH }}>
                    {isCount ? (totalFacsVte + totalFacsVcd) : fmt$(cxc.total)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
        {/* Legend */}
        {totalVencido > 0 && (
          <Box sx={{ display: 'flex', gap: '14px', mt: '10px' }}>
            {[{ color: '#547e69', label: t('vend.cxc.vigente') }, { color: DL.red, label: t('col.vencido') }].map(l => (
              <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '2px', background: l.color }} />
                <Typography sx={{ fontSize: 9, color: DL.tS, fontWeight: 500 }}>{l.label}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Card>
  );
}

// ─── Inventario data & card ───────────────────────────────────────────────────
const INVENTARIO_DATA = {
  JH: {
    critico: [
      { name: 'Concentrado Premium 50kg',  min: 10, actual: 6  },
      { name: 'Vacuna Multivalente 10ml',  min: 8,  actual: 3  },
      { name: 'Antibiótico Bovino 30ml',   min: 5,  actual: 2  },
      { name: 'Vacuna Bovino Triple',      min: 8,  actual: 2  },
      { name: 'Herbicida Glifosato 1L',    min: 20, actual: 6  },
      { name: 'AGROVIT PLUS 1L',           min: 15, actual: 4  },
      { name: 'Ivermectina 1% 500ml',      min: 12, actual: 3  },
    ],
    bajo: [
      { name: 'PILAROUND 500ML',           min: 20, actual: 14 },
      { name: 'NUTRISEM PRO 25kg',         min: 15, actual: 10 },
      { name: 'BIOMAX TABS 100u',          min: 30, actual: 22 },
      { name: 'SEMVERDE 25KG',             min: 25, actual: 18 },
      { name: 'CALCIVIT INY 100ml',        min: 10, actual: 7  },
      { name: 'AGROFER 5KG',              min: 18, actual: 13 },
      { name: 'VETMEC COMBO',             min: 12, actual: 9  },
    ],
    normal: [
      { name: 'AGROVIT PLUS 500ml',        min: 20, actual: 48 },
      { name: 'VITAVET B12 10ml',          min: 15, actual: 38 },
      { name: 'FERTIMIX 2L',              min: 10, actual: 62 },
      { name: 'HERBICIDA X20',            min: 8,  actual: 24 },
      { name: 'BIOFILM 1L',              min: 5,  actual: 19 },
    ],
  },
  JM: {
    critico: [
      { name: 'Vacuna Multivalente 10ml',  min: 8,  actual: 2  },
      { name: 'PILAROUND 500ML',           min: 15, actual: 4  },
      { name: 'NUTRISEM PRO 25kg',         min: 10, actual: 3  },
    ],
    bajo: [
      { name: 'AGROVIT PLUS 1L',           min: 12, actual: 8  },
      { name: 'BIOMAX TABS 100u',          min: 25, actual: 18 },
      { name: 'VETMEC COMBO',             min: 10, actual: 7  },
    ],
    normal: [
      { name: 'VITAVET B12 10ml',          min: 10, actual: 34 },
      { name: 'FERTIMIX 2L',              min: 8,  actual: 29 },
    ],
  },
  ML: {
    critico: [
      { name: 'Herbicida Glifosato 1L',    min: 15, actual: 3  },
      { name: 'Concentrado Premium 50kg',  min: 8,  actual: 2  },
      { name: 'CALCIVIT INY 100ml',        min: 10, actual: 4  },
      { name: 'AGROFER 5KG',              min: 12, actual: 5  },
    ],
    bajo: [
      { name: 'NUTRISEM PRO 25kg',         min: 15, actual: 11 },
      { name: 'SEMVERDE 25KG',             min: 20, actual: 14 },
    ],
    normal: [
      { name: 'VITAVET B12 10ml',          min: 8,  actual: 28 },
      { name: 'BIOFILM 1L',              min: 5,  actual: 17 },
    ],
  },
  CA: {
    critico: [
      { name: 'Vacuna Bovino Triple',      min: 6,  actual: 2  },
    ],
    bajo: [
      { name: 'AGROVIT PLUS 1L',           min: 10, actual: 7  },
      { name: 'BIOMAX TABS 100u',          min: 20, actual: 15 },
      { name: 'PILAROUND 500ML',           min: 12, actual: 9  },
    ],
    normal: [
      { name: 'VITAVET B12 10ml',          min: 8,  actual: 31 },
      { name: 'FERTIMIX 2L',              min: 6,  actual: 22 },
      { name: 'NUTRISEM PRO 25kg',         min: 10, actual: 18 },
    ],
  },
};

const INV_PAGE = 5;

function InventarioCard({ selId }) {
  const { t } = useT();
  const data    = INVENTARIO_DATA[selId] || INVENTARIO_DATA.JH;
  const [tab,   setTab]  = useState('critico');
  const [page,  setPage] = useState(0);

  const rows = data[tab] || [];
  const total = rows.length;
  const totalPages = Math.ceil(total / INV_PAGE);
  const slice = rows.slice(page * INV_PAGE, (page + 1) * INV_PAGE);

  const handleTab = (t) => { setTab(t); setPage(0); };

  const counts = { critico: data.critico.length, bajo: data.bajo.length, normal: data.normal.length };

  const tabCfg = [
    { key: 'critico', label: t('vend.inv.critico'), color: DL.red,    bg: DL.redBg    },
    { key: 'bajo',    label: t('vend.inv.bajo'),    color: DL.yellow, bg: DL.yellowBg },
  ];

  const sectionLabel = {
    critico: t('vend.inv.sectionCritico'),
    bajo:    t('vend.inv.sectionBajo'),
    normal:  t('vend.inv.sectionNormal'),
  }[tab];

  const statusBadge = {
    critico: { bg: DL.redBg,    color: DL.red,    label: t('vend.inv.critico') },
    bajo:    { bg: DL.yellowBg, color: DL.yellow, label: t('vend.inv.bajo')    },
    normal:  { bg: DL.greenBg,  color: DL.green,  label: t('vend.inv.normal')  },
  }[tab];

  const today = new Date(2026, 3, 27); // Apr 2026
  const monthLabel = today.toLocaleDateString('es', { month:'short', year:'numeric' });

  return (
    <Card sx={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <Box sx={{ px:'14px', pt:'12px', pb:'10px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexShrink:0 }}>
        <Box>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH }}>{t('prod.inv.titulo')}</Typography>
          <Typography sx={{ fontSize:9.5, color:DL.tS, mt:'2px' }}>
            SKUs activos y alertas de stock · {monthLabel}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ display:'flex', alignItems:'center', gap:'4px', px:'14px', py:'10px', borderBottom:`1px solid rgba(26,26,26,.06)`, flexShrink:0 }}>
        {tabCfg.map(t => {
          const active = tab === t.key;
          return (
            <Box key={t.key} onClick={() => handleTab(t.key)} sx={{
              display:'flex', alignItems:'center', gap:'5px',
              px:'10px', py:'5px', borderRadius:'4px', cursor:'pointer',
              background: active ? t.bg : 'transparent',
              border:`1px solid ${active ? t.color+'44' : 'transparent'}`,
              transition:'all .14s',
              '&:hover':{ background: active ? t.bg : 'rgba(26,26,26,.04)' },
            }}>
              <Typography sx={{ fontSize:11, fontWeight: active ? 500 : 500, color: active ? t.color : DL.tS }}>
                {t.label}
              </Typography>
              <Typography sx={{ fontSize:11, fontWeight: 500, color: active ? t.color : DL.tM }}>
                {counts[t.key]}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Section label */}
      <Box sx={{ px:'14px', py:'7px', flexShrink:0 }}>
        <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.09em', color:DL.tS }}>
          {sectionLabel}
        </Typography>
      </Box>

      {/* Table header */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 52px 72px 70px', gap:'4px', px:'14px', pb:'5px', flexShrink:0 }}>
        {[t('col.producto'), t('prod.col.min'), t('prod.col.stockAct'), t('col.estado')].map(h => (
          <Typography key={h} sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS }}>
            {h}
          </Typography>
        ))}
      </Box>
      <Box sx={{ height:'1px', background:'rgba(26,26,26,.07)', mx:'14px', mb:'2px', flexShrink:0 }} />

      {/* Rows */}
      <Box sx={{ flex:1, overflowY:'auto', px:'14px', minHeight:0 }}>
        {slice.map((r, i) => (
          <Box key={i} sx={{
            display:'grid', gridTemplateColumns:'1fr 52px 72px 70px',
            gap:'4px', alignItems:'center', py:'8px',
            borderBottom: i < slice.length-1 ? '1px solid rgba(26,26,26,.05)' : 'none',
            '&:hover':{ background:'rgba(84,126,105,.03)' }, borderRadius:'4px',
          }}>
            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, lineHeight:1.3 }}>{r.name}</Typography>
            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tS, textAlign:'center' }}>{r.min}u</Typography>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:statusBadge.color, textAlign:'center' }}>{r.actual}u</Typography>
            <Box>
              <Box sx={{ display:'inline-flex', px:'8px', py:'3px', borderRadius:'4px', background:statusBadge.bg }}>
                <Typography sx={{ fontSize:9, fontWeight: 500, color:statusBadge.color }}>{statusBadge.label}</Typography>
              </Box>
            </Box>
          </Box>
        ))}
        {slice.length === 0 && (
          <Box sx={{ py:'24px', textAlign:'center' }}>
            <Typography sx={{ fontSize:11, color:DL.tS }}>{t('vend.inv.sinProductos')}</Typography>
          </Box>
        )}
      </Box>

      {/* Pagination */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'14px', py:'10px', borderTop:`1px solid ${DL.border}`, flexShrink:0 }}>
        <Typography sx={{ fontSize:9, color:DL.tS }}>
          {total === 0 ? t('vend.det.inv.empty') : t('vend.det.inv.pagination').replace('{n1}', page * INV_PAGE + 1).replace('{n2}', Math.min((page+1)*INV_PAGE, total)).replace('{n3}', total)}
        </Typography>
        <Box sx={{ display:'flex', gap:'4px' }}>
          {[{icon:'‹',dir:-1},{icon:'›',dir:1}].map(b => (
            <Box key={b.dir} component="button" onClick={() => setPage(p => Math.max(0, Math.min(totalPages-1, p+b.dir)))}
              disabled={b.dir===-1 ? page===0 : page>=totalPages-1}
              sx={{
                width:26, height:26, borderRadius:'7px',
                border:`1px solid ${DL.border}`, background:'#fff',
                fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight: 500,
                color:DL.tM, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                '&:hover':{ borderColor:DL.blue, color:DL.blue },
                '&:disabled':{ opacity:.35, cursor:'default' },
              }}>{b.icon}</Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}

// ─── Clientes Inactivos ───────────────────────────────────────────────────────
const INACTIVOS_DATA = {
  JH: [
    { nombre: 'Agro Inversiones S.A.',  dias: 28, ultima: '2025-04-14', monto: '$8,400'  },
    { nombre: 'Distribuidora Montoya',  dias: 21, ultima: '2025-04-21', monto: '$3,200'  },
    { nombre: 'Ferretería El Pino',     dias: 17, ultima: '2025-04-25', monto: '$1,800'  },
    { nombre: 'Agropecuaria Noriega',   dias: 15, ultima: '2025-04-27', monto: '$5,600'  },
    { nombre: 'Coop. La Semilla',       dias: 14, ultima: '2025-04-28', monto: '$2,100'  },
  ],
  JM: [
    { nombre: 'Semilleros del Valle',   dias: 32, ultima: '2025-04-10', monto: '$4,200'  },
    { nombre: 'Agroquímicos Ruta 5',    dias: 24, ultima: '2025-04-18', monto: '$6,800'  },
    { nombre: 'Fertisol S.R.L.',        dias: 19, ultima: '2025-04-23', monto: '$2,900'  },
    { nombre: 'Coop. Occidente',        dias: 13, ultima: '2025-04-29', monto: '$3,500'  },
  ],
  ML: [
    { nombre: 'Mercado Central Sur',    dias: 45, ultima: '2025-03-28', monto: '$12,400' },
    { nombre: 'Distribuidora Escuintla',dias: 26, ultima: '2025-04-16', monto: '$7,200'  },
    { nombre: 'Supermercado Astral',    dias: 18, ultima: '2025-04-24', monto: '$4,600'  },
  ],
  CA: [
    { nombre: 'Avícola Los Pinos',      dias: 38, ultima: '2025-04-04', monto: '$9,800'  },
    { nombre: 'Granja San Miguel',      dias: 22, ultima: '2025-04-20', monto: '$5,400'  },
    { nombre: 'Veterinaria Colonial',   dias: 16, ultima: '2025-04-26', monto: '$3,200'  },
    { nombre: 'Avipaz Guatemala',       dias: 11, ultima: '2025-04-30', monto: '$1,900'  },
  ],
};

function ClientesInactivosCard({ selId }) {
  const rows = INACTIVOS_DATA[selId] || INACTIVOS_DATA.JH;
  const FF = "'Inter', ui-sans-serif, system-ui, sans-serif";
  return (
    <Card sx={{ height: '100%' }}>
      <Box sx={{ px: '14px', py: '10px', borderBottom: `1px solid ${DL.border}` }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH }}>Clientes Inactivos</Typography>
        <Typography sx={{ fontSize: 10, color: DL.tS, mt: '2px' }}>Sin compra en los últimos días</Typography>
      </Box>
      <Box sx={{ p: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {rows.map((r, i) => {
          const color = r.dias >= 30 ? DL.red : r.dias >= 20 ? DL.yellow : DL.tM;
          const bg    = r.dias >= 30 ? '#fef2f2' : r.dias >= 20 ? '#fffbeb' : '#f8fafc';
          const bd    = r.dias >= 30 ? '#fca5a5' : r.dias >= 20 ? '#fcd34d' : DL.border;
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '10px', py: '8px', borderRadius: '7px', background: bg, border: `1px solid ${bd}` }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, fontFamily: FF, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{r.nombre}</Typography>
                <Typography sx={{ fontSize: 8.5, color: DL.tS, fontFamily: FF }}>Últ. compra: {r.ultima}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, ml: '8px' }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', px: '6px', py: '2px', borderRadius: '4px', background: bg, border: `1px solid ${bd}` }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color, fontFamily: FF }}>{r.dias}d</Typography>
                </Box>
                <Typography sx={{ fontSize: 8.5, color: DL.tS, fontFamily: FF, mt: '2px' }}>{r.monto}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}

// ─── Heatmap helpers — paleta: rojo claro → durazno → verde menta ────────────
// bajo → #FFF2F0  |  medio → #FFF6EB  |  alto → #E5FFF4
const HEAT_STOPS = [
  [0,    [255, 242, 240]],  // #FFF2F0 rojo claro
  [0.5,  [255, 246, 235]],  // #FFF6EB durazno
  [1,    [229, 255, 244]],  // #E5FFF4 verde menta
];
function lerpColor(t) {
  t = Math.max(0, Math.min(1, t));
  let lo = HEAT_STOPS[0], hi = HEAT_STOPS[HEAT_STOPS.length - 1];
  for (let i = 0; i < HEAT_STOPS.length - 1; i++) {
    if (t >= HEAT_STOPS[i][0] && t <= HEAT_STOPS[i + 1][0]) { lo = HEAT_STOPS[i]; hi = HEAT_STOPS[i + 1]; break; }
  }
  const s = (hi[0] - lo[0]) > 0 ? (t - lo[0]) / (hi[0] - lo[0]) : 0;
  return `rgb(${Math.round(lo[1][0] + s * (hi[1][0] - lo[1][0]))},${Math.round(lo[1][1] + s * (hi[1][1] - lo[1][1]))},${Math.round(lo[1][2] + s * (hi[1][2] - lo[1][2]))})`;
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────
function HeatmapCard({ hm, hmVend, isSucursal }) {
  const { t } = useT();
  const [valMode,  setValMode]  = useState('$monto');    // '$monto' | '%part'
  const [view,     setView]     = useState('categoria');  // 'categoria' | 'vendedor'

  const active = view === 'vendedor' ? hmVend : hm;

  const toK = (v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`;

  const colSums    = useMemo(() => active.xAxis.map((_, ci) => active.data.reduce((s, row) => s + (row[ci] || 0), 0)), [active]);
  const rowSums    = useMemo(() => active.data.map(row => row.reduce((s, v) => s + v, 0)), [active]);
  const grandTotal = useMemo(() => rowSums.reduce((s, v) => s + v, 0), [rowSums]);
  const maxVal     = useMemo(() => Math.max(...active.data.flatMap(r => r)), [active]);

  // Value shown in each data cell
  const cellVal = (val, ci, ri) => {
    if (valMode === '%part')  return colSums[ci] > 0 ? (val / colSums[ci]) * 100 : 0;
    if (valMode === '%cumpl') return rowSums[ri] > 0 ? (val / rowSums[ri]) * 100 : 0;
    return val;
  };
  const cellLabel = (val, ci, ri) => {
    const d = cellVal(val, ci, ri);
    if (d <= 0) return '—';
    if (valMode === '%part')  return `${d.toFixed(0)}%`;
    if (valMode === '%cumpl') return `${d.toFixed(0)}%`;
    return toK(val);
  };
  const cellBg = (val, ci, ri) => {
    const d = cellVal(val, ci, ri);
    const max = (valMode === '%part' || valMode === '%cumpl') ? 100 : maxVal;
    return lerpColor(max > 0 ? d / max : 0);
  };

  // Dynamic text color: dark on light cells, white on dark cells
  // All three palette colors are light pastels → always dark text
  const cellTextColor = () => '#404040';

  // Row total label (always $ — shows row's absolute share)
  const rowTotalLabel = (ri) => toK(rowSums[ri]);
  // Row total bg color relative to largest row sum
  const maxRowSum = useMemo(() => Math.max(...rowSums), [rowSums]);
  const rowTotalBg = (ri) => lerpColor(maxRowSum > 0 ? rowSums[ri] / maxRowSum : 0);

  // Col total label
  const colTotalLabel = (ci) => valMode !== '$monto' ? '100%' : toK(colSums[ci]);

  // Total cell style (navy text on light bg — visually separated)
  const totCellSx = { background: 'rgba(26,26,26,.09)', borderRadius: '3px', p: '6px 4px', textAlign: 'center' };
  const totTxt = { fontSize: 8, fontWeight: 500, color: DL.navy, whiteSpace: 'nowrap' };

  const rowLabel = view === 'vendedor' ? t('vend.heat.vendedor') : t('vend.heat.categoria');

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '440px' }}>
      {/* Header: title + value-mode toggle */}
      <Box sx={{ px: '14px', py: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexShrink: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH }}>
            Mapa de Calor de Ventas · {rowLabel}
          </Typography>
          <Typography sx={{ fontSize: 10, color: DL.tS, mt: '2px' }}>
            {valMode === '$monto'
              ? t('vend.heat.subtitleAmt').replace('{lbl}', view === 'vendedor' ? t('vend.heat.vendedor').toLowerCase() : t('vend.heat.categoria').toLowerCase())
              : valMode === '%part'
              ? t('vend.heat.subtitlePct').replace('{lbl}', view === 'vendedor' ? t('vend.heat.vendedor').toLowerCase() : t('vend.heat.categoria').toLowerCase())
              : `% de cumplimiento por fila (participación por período)`}
          </Typography>
        </Box>

        {/* 2-option toggle: $ Monto | % Part. */}
        <Box sx={{ display: 'flex', border: `1px solid ${DL.border}`, borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
          {[{ k: '$monto', lbl: '$ Monto' }, { k: '%part', lbl: '% Part.' }].map(({ k, lbl }) => (
            <Box key={k} onClick={() => setValMode(k)} sx={{
              px: '9px', py: '4px', fontSize: 9, fontWeight: 500, cursor: 'pointer', userSelect: 'none',
              background: valMode === k ? DL.blue : 'transparent',
              color: valMode === k ? '#fff' : DL.tS, transition: 'all .14s',
              '&:hover': valMode !== k ? { background: 'rgba(84,126,105,.07)' } : {},
            }}>{lbl}</Box>
          ))}
        </Box>
      </Box>

      {/* Tabs: Categoría / Vendedor — show Vendedor tab only in sucursal view */}
      {isSucursal && (
        <Box sx={{ display: 'flex', borderBottom: `1px solid ${DL.border}`, px: '8px', flexShrink: 0 }}>
          {[{ k: 'categoria', lbl: t('vend.heat.categoria') }, { k: 'vendedor', lbl: t('vend.heat.vendedor') }].map(({ k, lbl }) => (
            <TabBtn key={k} label={lbl} active={view === k} onClick={() => setView(k)} />
          ))}
        </Box>
      )}

      {/* Table — fills all remaining vertical space */}
      <Box sx={{ flex: 1, p: '10px 14px 14px', overflowX: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Box component="table" sx={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          {/* Header row — month labels */}
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{ width: view === 'vendedor' ? 120 : 90, pb: '6px' }} />
              {active.xAxis.map(x => (
                <Box component="th" key={x} sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textAlign: 'center', pb: '6px' }}>{x}</Box>
              ))}
              <Box component="th" sx={{ fontSize: 9, fontWeight: 500, color: DL.navy, textAlign: 'center', pb: '6px', width: 70, borderLeft: '2px solid rgba(26,26,26,.15)' }}>{t('des.total')}</Box>
            </Box>
          </Box>

          {/* Data rows — height: 1px triggers equal distribution when table is height:100% */}
          <Box component="tbody" sx={{ height: '100%' }}>
            {active.yAxis.map((label, ri) => (
              <Box component="tr" key={label} sx={{ height: '1px' }}>
                <Box component="td" sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textAlign: 'right', pr: '10px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{label}</Box>
                {active.xAxis.map((_, ci) => (
                  <Box component="td" key={ci} sx={{ background: cellBg(active.data[ri][ci], ci, ri), px: '4px', textAlign: 'center', border: '1px solid rgba(255,255,255,.3)', verticalAlign: 'middle' }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 500, color: cellTextColor(), whiteSpace: 'nowrap' }}>{cellLabel(active.data[ri][ci], ci, ri)}</Typography>
                  </Box>
                ))}
                <Box component="td" sx={{ background: rowTotalBg(ri), textAlign: 'center', px: '4px', border: '1px solid rgba(255,255,255,.3)', borderLeft: '3px solid rgba(26,26,26,.2)', verticalAlign: 'middle' }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#404040', whiteSpace: 'nowrap' }}>{rowTotalLabel(ri)}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Footer row — column totals + grand total */}
          <Box component="tfoot">
            <Box component="tr">
              <Box component="td" sx={{ fontSize: 8, fontWeight: 500, color: DL.navy, textAlign: 'right', pr: '10px', py: '8px', textTransform: 'uppercase', letterSpacing: '.05em', verticalAlign: 'middle' }}>{t('des.total')}</Box>
              {active.xAxis.map((_, ci) => (
                <Box component="td" key={ci} sx={{ background: 'rgba(26,26,26,.08)', py: '8px', px: '4px', textAlign: 'center', border: '1px solid rgba(26,26,26,.1)', verticalAlign: 'middle' }}>
                  <Typography sx={totTxt}>{colTotalLabel(ci)}</Typography>
                </Box>
              ))}
              <Box component="td" sx={{ background: 'rgba(26,26,26,.18)', textAlign: 'center', py: '8px', px: '4px', border: '1px solid rgba(26,26,26,.15)', borderLeft: '3px solid rgba(26,26,26,.3)', verticalAlign: 'middle' }}>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.navy, whiteSpace: 'nowrap' }}>{toK(grandTotal)}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────
function MgChip({ mg }) {
  const [bg, color] = mg >= 25 ? [DL.greenBg, DL.green] : mg >= 15 ? [DL.yellowBg, DL.yellow] : [DL.redBg, DL.red];
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', px: '6px', py: '2px', borderRadius: '4px', background: bg }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 10, fontWeight: 500, color }}>{mg.toFixed(1)}%</Typography>
    </Box>
  );
}

function InvoiceModal({ row, onClose }) {
  const { t } = useT();
  if (!row) return null;
  const cobradoPct = row.v > 0 ? Math.round(row.abono / row.v * 100) : 100;
  const pendientePct = 100 - cobradoPct;
  const mgColor = row.mg >= 25 ? DL.green : row.mg >= 15 ? DL.yellow : DL.red;

  const InfoRow = ({ label, value, valueStyle }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: '5px', borderBottom: '1px solid rgba(26,26,26,.05)', '&:last-child': { borderBottom: 'none' } }}>
      <Typography sx={{ fontSize: 11, color: DL.tS, fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: 11, color: DL.tH, fontWeight: 500, ...valueStyle }}>{value}</Typography>
    </Box>
  );
  const SecTitle = ({ children }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '8px', mt: '4px' }}>
      <Box sx={{ width: 12, height: 2, borderRadius: 2, background: `linear-gradient(90deg,${DL.blue},${DL.navy})` }} />
      <Typography sx={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.09em', color: DL.tS }}>{children}</Typography>
    </Box>
  );

  return (
    <Modal open onClose={onClose} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { sx: { background: 'rgba(3,9,25,.5)' } } }}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 860, maxWidth: '96vw', maxHeight: '90vh',
        background: '#fff', borderRadius: '14px', boxShadow: '0 24px 64px rgba(0,0,70,.22)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'mSlideIn .22s ease',
        '@keyframes mSlideIn': { from: { opacity: 0, transform: 'translate(-50%,calc(-50% + 12px)) scale(.98)' }, to: { opacity: 1, transform: 'translate(-50%,-50%)' } },
      }}>
        {/* Modal header */}
        <Box sx={{ px: '24px', pt: '20px', pb: '14px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: DL.tH, letterSpacing: '-.02em' }}>{t('vend.modal.factura')}{row.fac}</Typography>
            <Typography sx={{ fontSize: 11, color: DL.tS, mt: '2px' }}>{row.cliFull} · {row.fecha}</Typography>
          </Box>
          <Box component="button" onClick={onClose} sx={{ width: 28, height: 28, borderRadius: '7px', border: 'none', background: 'rgba(26,26,26,.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DL.tS, transition: 'all .14s', '&:hover': { background: DL.redBg, color: DL.red } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>
        {/* Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: '18px 24px', display: 'flex', flexDirection: 'column', gap: '16px', scrollbarWidth: 'thin' }}>
          {/* 3 stat boxes */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {[
              { lbl: t('vend.modal.totalFac'),   val: fmt$(row.v),             sub: `${row.condpago} · ${row.pago ? t('vend.modal.pagado') : t('vend.modal.pendiente')}`, valColor: DL.tH },
              { lbl: t('vend.modal.margenBruto'), val: `${row.mg.toFixed(1)}%`, sub: `${fmt$(row.v - row.costo)} ${t('vend.modal.sobreCosto')}`, valColor: mgColor },
              { lbl: t('vend.modal.saldoPend'),   val: fmt$(row.pend),           sub: `${t('vend.modal.vence')} ${row.vence}`,                   valColor: row.pend > 0 ? DL.red : DL.green },
            ].map(k => (
              <Box key={k.lbl} sx={{ background: 'rgba(26,26,26,.03)', borderRadius: '10px', p: '14px 16px' }}>
                <Typography sx={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: DL.tS, mb: '6px' }}>{k.lbl}</Typography>
                <Typography sx={{ fontSize: 26, fontWeight: 500, color: k.valColor, letterSpacing: '-.04em', lineHeight: 1 }}>{k.val}</Typography>
                <Typography sx={{ fontSize: 10, color: DL.tS, mt: '4px' }}>{k.sub}</Typography>
              </Box>
            ))}
          </Box>
          {/* 2-col info */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Box>
              <SecTitle>{t('vend.modal.infoCli')}</SecTitle>
              <InfoRow label={t('col.cliente')}         value={row.cliFull} />
              <InfoRow label={t('vend.modal.lbl.canal')} value={row.canal} />
              <InfoRow label={t('col.vendedor')}        value={row.vendFull} />
              <InfoRow label={t('vend.modal.lbl.condPago')} value={row.condpago} />
            </Box>
            <Box>
              <SecTitle>{t('vend.modal.infoFac')}</SecTitle>
              <InfoRow label={t('vend.modal.lbl.noFac')}       value={row.nofac} />
              <InfoRow label={t('vend.modal.lbl.tipo')}        value={row.tipo} />
              <InfoRow label={t('vend.modal.lbl.fechaEmision')} value={row.fecha} />
              <InfoRow label={t('vend.modal.lbl.fechaVenc')}   value={row.vence} valueStyle={{ color: row.pend > 0 ? DL.red : DL.tH }} />
            </Box>
          </Box>
          {/* Product lines */}
          <Box>
            <SecTitle>{t('vend.modal.detProductos')}</SecTitle>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[t('col.producto'), t('vend.modal.col.sku'), t('vend.modal.col.cant'), t('vend.modal.col.pUnit'), t('des.total'), t('col.costo'), t('vend.modal.col.mg')].map(h => (
                      <TableCell key={h} sx={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: DL.tS, borderBottom: `2px solid rgba(26,26,26,.08)`, background: 'rgba(26,26,26,.025)', px: '10px' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.lines.map((l, i) => (
                    <TableRow key={i} sx={{ '&:hover td': { background: 'rgba(84,126,105,.025)' } }}>
                      <TableCell sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, px: '10px' }}>{l.prod}</TableCell>
                      <TableCell sx={{ fontSize: 10, color: DL.tS, px: '10px' }}>{l.sku}</TableCell>
                      <TableCell sx={{ fontSize: 11, color: DL.tM, textAlign: 'right', px: '10px' }}>{l.qty}</TableCell>
                      <TableCell sx={{ fontSize: 11, color: DL.tM, textAlign: 'right', px: '10px' }}>{fmt$(l.pu)}</TableCell>
                      <TableCell sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, textAlign: 'right', px: '10px' }}>{fmt$(l.tot)}</TableCell>
                      <TableCell sx={{ fontSize: 11, color: DL.tS, textAlign: 'right', px: '10px' }}>{fmt$(l.costo)}</TableCell>
                      <TableCell sx={{ px: '10px' }}><MgChip mg={l.mg} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          {/* Footer: Rentabilidad + Cobro */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Box>
              <SecTitle>{t('vend.modal.rentabilidad')}</SecTitle>
              <InfoRow label={t('vend.modal.lbl.ventaNeta')}  value={fmt$(row.v)} />
              <InfoRow label={t('vend.modal.lbl.costoTotal')} value={fmt$(row.costo)} />
              <InfoRow label={t('vend.modal.lbl.margenDolar')} value={fmt$(row.v - row.costo)} />
              <InfoRow label={t('vend.modal.lbl.margenPct')}  value={`${row.mg.toFixed(1)}%`} valueStyle={{ color: mgColor }} />
            </Box>
            <Box>
              <SecTitle>{t('vend.modal.estadoCobro')}</SecTitle>
              <InfoRow label={t('vend.modal.lbl.totalFac')}    value={fmt$(row.v)} />
              <InfoRow label={t('vend.modal.lbl.totalAbonado')} value={fmt$(row.abono)} />
              <InfoRow label={t('vend.modal.lbl.pendiente')}   value={fmt$(row.pend)} valueStyle={{ color: row.pend > 0 ? DL.red : DL.green }} />
              <Box sx={{ mt: '10px' }}>
                <Box sx={{ height: 10, background: DL.redBg, borderRadius: '6px', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', background: DL.green, borderRadius: '6px', width: `${cobradoPct}%`, transition: 'width .8s ease' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '4px' }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.green }}>{t('vend.modal.cobradoPct').replace('{n}', cobradoPct)}</Typography>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: row.pend > 0 ? DL.red : DL.tS }}>{t('vend.modal.pendientePct').replace('{n}', pendientePct)}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

// ─── Detalles (Ventas + Inventario tabs) ─────────────────────────────────────
// Columns: ID Factura | Cliente | N° Factura | Fecha | Vencimiento | Cant. | Venta $ | N.C. | Costo $ | MG% | Abono | Pendiente
const DET_COLS_CFG = [
  { key: 'id',     labelKey: 'col.factura',     fixed: true,  vis: true  },
  { key: 'cli',    labelKey: 'col.cliente',     fixed: true,  vis: true  },
  { key: 'nofac',  labelKey: 'col.nofactura',   fixed: false, vis: true  },
  { key: 'fecha',  labelKey: 'col.fecha',       fixed: false, vis: true  },
  { key: 'venc',   labelKey: 'col.vencimiento', fixed: false, vis: true  },
  { key: 'qty',    labelKey: 'col.cant',        fixed: false, vis: true  },
  { key: 'v',      labelKey: 'col.ventaS',      fixed: true,  vis: true  },
  { key: 'nc',     labelKey: 'col.nc',          fixed: false, vis: true  },
  { key: 'costo',  labelKey: 'col.costoS',      fixed: false, vis: true  },
  { key: 'mgPct',  labelKey: 'col.mg',          fixed: false, vis: true  },
  { key: 'abono',  labelKey: 'col.abono',       fixed: false, vis: true  },
  { key: 'pend',   labelKey: 'col.pendiente',   fixed: false, vis: true  },
];

// Inventory rows per entity
const INV_ROWS = {
  JH: [
    { prod:'AGROVIT PLUS 1L',          cat:'Agrícola',    uom:'LITRO',   exist:48,  ultCompra:'2026-03-15', cantCompra:120, costoU:8.40,  costoT:403,  diasInv:28,  stockMin:20, consPSem:1.71, consPHist:2.10, estadoV:'Con Ventas', v3m:38, v6m:72,  costoUC:8.35  },
    { prod:'PILAROUND 500ML',          cat:'Agrícola',    uom:'UNIDAD',  exist:14,  ultCompra:'2025-11-20', cantCompra:60,  costoU:12.80, costoT:179,  diasInv:12,  stockMin:20, consPSem:1.14, consPHist:1.84, estadoV:'Con Ventas', v3m:22, v6m:45,  costoUC:12.75 },
    { prod:'VETMEC COMBO',             cat:'Veterinario', uom:'UNIDAD',  exist:32,  ultCompra:'2026-01-08', cantCompra:80,  costoU:24.20, costoT:774,  diasInv:35,  stockMin:15, consPSem:0.91, consPHist:1.42, estadoV:'Con Ventas', v3m:18, v6m:34,  costoUC:24.10 },
    { prod:'NUTRISEM PRO 25kg',        cat:'Semillas',    uom:'SACO',    exist:10,  ultCompra:'2025-10-30', cantCompra:40,  costoU:18.60, costoT:186,  diasInv:14,  stockMin:15, consPSem:0.71, consPHist:1.10, estadoV:'Con Ventas', v3m:12, v6m:28,  costoUC:18.50 },
    { prod:'BIOMAX TABS 100u',         cat:'Veterinario', uom:'CAJA',    exist:22,  ultCompra:'2026-02-14', cantCompra:50,  costoU:9.80,  costoT:216,  diasInv:22,  stockMin:30, consPSem:1.00, consPHist:1.54, estadoV:'Con Ventas', v3m:25, v6m:48,  costoUC:9.75  },
    { prod:'AGROFER 5KG',              cat:'Agrícola',    uom:'SACO',    exist:62,  ultCompra:'2026-03-22', cantCompra:100, costoU:6.20,  costoT:384,  diasInv:32,  stockMin:20, consPSem:1.93, consPHist:2.80, estadoV:'Con Ventas', v3m:42, v6m:84,  costoUC:6.18  },
    { prod:'CALCIVIT INY 100ml',       cat:'Veterinario', uom:'FRASCO',  exist:7,   ultCompra:'2025-09-12', cantCompra:30,  costoU:14.50, costoT:101,  diasInv:40,  stockMin:10, consPSem:0.18, consPHist:0.52, estadoV:'Con Ventas', v3m:4,  v6m:9,   costoUC:14.48 },
    { prod:'SEMVERDE 25KG',            cat:'Semillas',    uom:'SACO',    exist:18,  ultCompra:'2025-12-05', cantCompra:50,  costoU:11.20, costoT:202,  diasInv:30,  stockMin:25, consPSem:0.60, consPHist:0.95, estadoV:'Con Ventas', v3m:10, v6m:22,  costoUC:11.15 },
    { prod:'HERBICIDA X20',            cat:'Agrícola',    uom:'LITRO',   exist:24,  ultCompra:'2026-04-01', cantCompra:60,  costoU:7.80,  costoT:187,  diasInv:5,   stockMin:8,  consPSem:4.80, consPHist:3.80, estadoV:'Con Ventas', v3m:52, v6m:88,  costoUC:7.75  },
    { prod:'VITAVET B12 10ml',         cat:'Veterinario', uom:'FRASCO',  exist:31,  ultCompra:'2026-02-28', cantCompra:80,  costoU:10.40, costoT:322,  diasInv:38,  stockMin:15, consPSem:0.81, consPHist:1.20, estadoV:'Con Ventas', v3m:20, v6m:38,  costoUC:10.38 },
    { prod:'Concentrado Premium 50kg', cat:'Agrícola',    uom:'SACO',    exist:6,   ultCompra:'2025-08-20', cantCompra:30,  costoU:42.00, costoT:252,  diasInv:487, stockMin:10, consPSem:0.01, consPHist:0.08, estadoV:'Sin Ventas', v3m:0,  v6m:0,   costoUC:null  },
    { prod:'Vacuna Multivalente 10ml', cat:'Veterinario', uom:'VIAL',    exist:3,   ultCompra:'2025-05-03', cantCompra:60,  costoU:38.50, costoT:115,  diasInv:0,   stockMin:8,  consPSem:0.00, consPHist:3.23, estadoV:'Con Ventas', v3m:28, v6m:35,  costoUC:38.46 },
    { prod:'Antibiótico Bovino 30ml',  cat:'Veterinario', uom:'FRASCO',  exist:2,   ultCompra:'2025-11-17', cantCompra:13,  costoU:28.60, costoT:57,   diasInv:92,  stockMin:5,  consPSem:0.02, consPHist:0.23, estadoV:'Con Ventas', v3m:4,  v6m:5,   costoUC:28.55 },
    { prod:'BIOFILM 1L',               cat:'Esp. Menores',uom:'LITRO',   exist:19,  ultCompra:'2026-01-18', cantCompra:40,  costoU:5.60,  costoT:106,  diasInv:488, stockMin:5,  consPSem:0.04, consPHist:0.08, estadoV:'Sin Ventas', v3m:0,  v6m:0,   costoUC:null  },
    { prod:'FERTIMIX 2L',              cat:'Agrícola',    uom:'LITRO',   exist:29,  ultCompra:'2026-03-10', cantCompra:70,  costoU:9.20,  costoT:267,  diasInv:140, stockMin:0,  consPSem:0.21, consPHist:0.69, estadoV:'Con Ventas', v3m:15, v6m:29,  costoUC:9.18  },
  ],
  JM: [
    { prod:'AGROVIT PLUS 1L',          cat:'Agrícola',    uom:'LITRO',   exist:36,  ultCompra:'2026-02-20', cantCompra:80,  costoU:8.40,  costoT:302,  diasInv:24,  stockMin:15, consPSem:1.50, consPHist:1.90, estadoV:'Con Ventas', v3m:28, v6m:55,  costoUC:8.38  },
    { prod:'PILAROUND 500ML',          cat:'Agrícola',    uom:'UNIDAD',  exist:4,   ultCompra:'2025-12-10', cantCompra:40,  costoU:12.80, costoT:51,   diasInv:8,   stockMin:15, consPSem:0.50, consPHist:1.20, estadoV:'Con Ventas', v3m:14, v6m:28,  costoUC:12.72 },
    { prod:'VETMEC COMBO',             cat:'Veterinario', uom:'UNIDAD',  exist:18,  ultCompra:'2026-01-15', cantCompra:50,  costoU:24.20, costoT:436,  diasInv:30,  stockMin:10, consPSem:0.60, consPHist:1.10, estadoV:'Con Ventas', v3m:12, v6m:24,  costoUC:24.15 },
    { prod:'NUTRISEM PRO 25kg',        cat:'Semillas',    uom:'SACO',    exist:3,   ultCompra:'2025-09-25', cantCompra:25,  costoU:18.60, costoT:56,   diasInv:10,  stockMin:10, consPSem:0.30, consPHist:0.75, estadoV:'Con Ventas', v3m:8,  v6m:18,  costoUC:18.55 },
    { prod:'BIOMAX TABS 100u',         cat:'Veterinario', uom:'CAJA',    exist:18,  ultCompra:'2026-02-08', cantCompra:35,  costoU:9.80,  costoT:176,  diasInv:18,  stockMin:25, consPSem:1.00, consPHist:1.20, estadoV:'Con Ventas', v3m:18, v6m:34,  costoUC:9.72  },
    { prod:'CALCIVIT INY 100ml',       cat:'Veterinario', uom:'FRASCO',  exist:21,  ultCompra:'2026-03-05', cantCompra:60,  costoU:14.50, costoT:305,  diasInv:259, stockMin:0,  consPSem:0.08, consPHist:0.46, estadoV:'Con Ventas', v3m:6,  v6m:8,   costoUC:14.52 },
    { prod:'SEMVERDE 25KG',            cat:'Semillas',    uom:'SACO',    exist:14,  ultCompra:'2025-11-28', cantCompra:35,  costoU:11.20, costoT:157,  diasInv:24,  stockMin:20, consPSem:0.58, consPHist:0.82, estadoV:'Con Ventas', v3m:8,  v6m:16,  costoUC:11.18 },
    { prod:'VITAVET B12 10ml',         cat:'Veterinario', uom:'FRASCO',  exist:34,  ultCompra:'2026-03-18', cantCompra:60,  costoU:10.40, costoT:354,  diasInv:813, stockMin:0,  consPSem:0.04, consPHist:2.31, estadoV:'Con Ventas', v3m:34, v6m:36,  costoUC:10.40 },
  ],
  ML: [
    { prod:'AGROVIT PLUS 1L',          cat:'Agrícola',    uom:'LITRO',   exist:28,  ultCompra:'2026-02-10', cantCompra:60,  costoU:8.40,  costoT:235,  diasInv:22,  stockMin:12, consPSem:1.27, consPHist:1.60, estadoV:'Con Ventas', v3m:22, v6m:42,  costoUC:8.36  },
    { prod:'VETMEC COMBO',             cat:'Veterinario', uom:'UNIDAD',  exist:9,   ultCompra:'2025-12-28', cantCompra:30,  costoU:24.20, costoT:218,  diasInv:25,  stockMin:10, consPSem:0.36, consPHist:0.90, estadoV:'Con Ventas', v3m:9,  v6m:18,  costoUC:24.08 },
    { prod:'NUTRISEM PRO 25kg',        cat:'Semillas',    uom:'SACO',    exist:11,  ultCompra:'2026-01-20', cantCompra:30,  costoU:18.60, costoT:205,  diasInv:18,  stockMin:15, consPSem:0.61, consPHist:0.88, estadoV:'Con Ventas', v3m:10, v6m:20,  costoUC:18.54 },
    { prod:'Herbicida Glifosato 1L',   cat:'Agrícola',    uom:'LITRO',   exist:3,   ultCompra:'2025-07-15', cantCompra:40,  costoU:7.80,  costoT:23,   diasInv:5,   stockMin:15, consPSem:0.60, consPHist:2.10, estadoV:'Con Ventas', v3m:18, v6m:38,  costoUC:7.72  },
    { prod:'SEMVERDE 25KG',            cat:'Semillas',    uom:'SACO',    exist:14,  ultCompra:'2025-10-12', cantCompra:28,  costoU:11.20, costoT:157,  diasInv:26,  stockMin:20, consPSem:0.54, consPHist:0.75, estadoV:'Con Ventas', v3m:8,  v6m:14,  costoUC:11.16 },
    { prod:'BIOMAX TABS 100u',         cat:'Veterinario', uom:'CAJA',    exist:15,  ultCompra:'2026-02-02', cantCompra:30,  costoU:9.80,  costoT:147,  diasInv:20,  stockMin:20, consPSem:0.75, consPHist:1.00, estadoV:'Con Ventas', v3m:14, v6m:26,  costoUC:9.76  },
    { prod:'VITAVET B12 10ml',         cat:'Veterinario', uom:'FRASCO',  exist:28,  ultCompra:'2026-03-08', cantCompra:50,  costoU:10.40, costoT:291,  diasInv:150, stockMin:0,  consPSem:0.19, consPHist:0.46, estadoV:'Con Ventas', v3m:6,  v6m:8,   costoUC:10.38 },
  ],
  CA: [
    { prod:'AGROVIT PLUS 1L',          cat:'Agrícola',    uom:'LITRO',   exist:22,  ultCompra:'2026-03-01', cantCompra:50,  costoU:8.40,  costoT:185,  diasInv:20,  stockMin:10, consPSem:1.10, consPHist:1.40, estadoV:'Con Ventas', v3m:18, v6m:34,  costoUC:8.38  },
    { prod:'Vacuna Bovino Triple',     cat:'Veterinario', uom:'VIAL',    exist:2,   ultCompra:'2026-01-08', cantCompra:20,  costoU:32.50, costoT:65,   diasInv:6,   stockMin:6,  consPSem:0.33, consPHist:0.85, estadoV:'Con Ventas', v3m:8,  v6m:16,  costoUC:32.40 },
    { prod:'BIOMAX TABS 100u',         cat:'Veterinario', uom:'CAJA',    exist:15,  ultCompra:'2026-02-18', cantCompra:25,  costoU:9.80,  costoT:147,  diasInv:16,  stockMin:20, consPSem:0.94, consPHist:0.92, estadoV:'Con Ventas', v3m:12, v6m:22,  costoUC:9.78  },
    { prod:'PILAROUND 500ML',          cat:'Agrícola',    uom:'UNIDAD',  exist:9,   ultCompra:'2025-11-14', cantCompra:20,  costoU:12.80, costoT:115,  diasInv:12,  stockMin:12, consPSem:0.75, consPHist:0.92, estadoV:'Con Ventas', v3m:10, v6m:18,  costoUC:12.74 },
    { prod:'VITAVET B12 10ml',         cat:'Veterinario', uom:'FRASCO',  exist:31,  ultCompra:'2026-02-22', cantCompra:45,  costoU:10.40, costoT:322,  diasInv:813, stockMin:0,  consPSem:0.04, consPHist:2.31, estadoV:'Con Ventas', v3m:28, v6m:36,  costoUC:10.38 },
    { prod:'NUTRISEM PRO 25kg',        cat:'Semillas',    uom:'SACO',    exist:8,   ultCompra:'2026-01-05', cantCompra:20,  costoU:18.60, costoT:149,  diasInv:14,  stockMin:10, consPSem:0.57, consPHist:0.80, estadoV:'Con Ventas', v3m:8,  v6m:14,  costoUC:18.52 },
  ],
};

const INV_COLS_CFG = [
  { key: 'stockSt',    labelKey: 'col.estado',        fixed: true,  vis: true  },
  { key: 'prod',       labelKey: 'col.producto',      fixed: true,  vis: true  },
  { key: 'cat',        labelKey: 'col.categoria',     fixed: false, vis: true  },
  { key: 'uom',        labelKey: 'col.uom',           fixed: false, vis: true  },
  { key: 'exist',      labelKey: 'col.existencia',    fixed: false, vis: true  },
  { key: 'ultCompra',  labelKey: 'col.fUltCompra',    fixed: false, vis: true  },
  { key: 'cantCompra', labelKey: 'col.cantUltCompra', fixed: false, vis: false },
  { key: 'costoU',     labelKey: 'col.costoUnit',     fixed: false, vis: true  },
  { key: 'costoT',     labelKey: 'col.costoTotal',    fixed: false, vis: true  },
  { key: 'diasInv',    labelKey: 'col.diasInv',       fixed: false, vis: true  },
  { key: 'stockMin',   labelKey: 'col.stockMin',      fixed: false, vis: true  },
  { key: 'consPSem',   labelKey: 'col.consPSem',      fixed: false, vis: true  },
  { key: 'consPHist',  labelKey: 'col.consPHist',     fixed: false, vis: false },
  { key: 'estadoV',    labelKey: 'col.estadoVentas',  fixed: false, vis: true  },
  { key: 'v3m',        labelKey: 'col.vta3m',         fixed: false, vis: true  },
  { key: 'v6m',        labelKey: 'col.vta6m',         fixed: false, vis: false },
  { key: 'costoUC',    labelKey: 'col.costoUCompra',  fixed: false, vis: false },
];

const PAGE_SIZE = 5;
const INV_PAGE_SIZE = 10;

function DetTable({ rows, selId, isSucursal }) {
  const { t } = useT();
  // top-level view: 'ventas' | 'inventario'
  const [mainTab,      setMainTab]      = useState('ventas');

  // Ventas sub-state
  const [tab,          setTab]          = useState('todas');
  const [page,         setPage]         = useState(0);
  const [selectedRow,  setSelectedRow]  = useState(null);
  const [colPickerOpen,setColPickerOpen]= useState(false);
  const [cols,         setCols]         = useState(DET_COLS_CFG.map(c => ({ ...c })));
  const pickerRef = useRef(null);

  // Inventario sub-state
  const [invPage,      setInvPage]      = useState(0);
  const [invSort,      setInvSort]      = useState({ col:'prod', dir:'asc' });
  const [invFilter,    setInvFilter]    = useState('todos'); // todos | on-stock | low-stock | sin-ventas
  const [invCols,      setInvCols]      = useState(INV_COLS_CFG.map(c => ({ ...c })));
  const [invColPickerOpen, setInvColPickerOpen] = useState(false);
  const invPickerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setColPickerOpen(false);
      if (invPickerRef.current && !invPickerRef.current.contains(e.target)) setInvColPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Ventas logic ────────────────────────────────────────────────
  const today = new Date('2025-10-12');
  const isVenc = (v) => v && new Date(v) < today;
  const fmtDate = (d) => d ? d.split('-').reverse().join('/') : '—';

  const filtered = useMemo(() => {
    if (tab === 'pagadas')    return rows.filter(r => r.pend === 0);
    if (tab === 'pendientes') return rows.filter(r => r.pend > 0);
    return rows;
  }, [rows, tab]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const slice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const visCols = cols.filter(c => c.vis);

  const handleTab = (t) => { setTab(t); setPage(0); };

  const estadoColor = (e) => ({
    'Pagado':    { bg: '#dcfce7', color: '#15803d' },
    'Pendiente': { bg: '#e8e8e8', color: '#1a1a1a' },
  }[e] || { bg: '#fee2e2', color: '#b91c1c' });

  const renderCell = (r, key) => {
    switch (key) {
      case 'id':    return <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.blue, whiteSpace:'nowrap' }}>{r.id}</Typography>;
      case 'cli':   return <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH }}>{r.cli}</Typography>;
      case 'nofac': return <Typography sx={{ fontSize:10, color:DL.tS, whiteSpace:'nowrap' }}>{r.nofac || '—'}</Typography>;
      case 'fecha': return <Typography sx={{ fontSize:10, color:DL.tS, whiteSpace:'nowrap' }}>{fmtDate(r.fecha)}</Typography>;
      case 'venc':  return <Typography sx={{ fontSize:10, color:r.pend>0&&isVenc(r.venc)?DL.red:DL.tS, fontWeight:r.pend>0&&isVenc(r.venc)?500:400, whiteSpace:'nowrap' }}>{fmtDate(r.venc)}</Typography>;
      case 'qty':   return <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, textAlign:'right' }}>{r.qty ?? '—'}</Typography>;
      case 'v':     return <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, whiteSpace:'nowrap' }}>{fmt$(r.v)}</Typography>;
      case 'nc':    return r.nc ? (
        <Box sx={{ display:'inline-flex', px:'6px', py:'2px', borderRadius:'4px', background:'#fef2f2', border:'1px solid #fca5a5' }}>
          <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.red, whiteSpace:'nowrap' }}>NC {fmt$(r.nc)}</Typography>
        </Box>
      ) : <Typography sx={{ fontSize:10, color:DL.tS }}>—</Typography>;
      case 'costo': return <Typography sx={{ fontSize:10, color:DL.tS, whiteSpace:'nowrap' }}>{fmt$(r.costo)}</Typography>;
      case 'mgPct': {
        const dot = r.mgPct >= 25 ? DL.green : r.mgPct >= 18 ? DL.yellow : DL.red;
        return (
          <Box sx={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>
            <Box sx={{ width:6, height:6, borderRadius:'50%', background:dot, flexShrink:0 }} />
            <Typography sx={{ fontSize:10, fontWeight: 500, color:dot }}>{r.mgPct}%</Typography>
          </Box>
        );
      }
      case 'abono': return <Typography sx={{ fontSize:10, fontWeight: 500, color:r.abono>0?DL.green:DL.tS, whiteSpace:'nowrap' }}>{fmt$(r.abono)}</Typography>;
      case 'pend':  return <Typography sx={{ fontSize:10, fontWeight: 500, color:r.pend>0?DL.red:DL.tS, whiteSpace:'nowrap' }}>{fmt$(r.pend)}</Typography>;
      default: return null;
    }
  };

  // ── Inventario logic ────────────────────────────────────────────
  const allInv = INV_ROWS[selId] || INV_ROWS.JH;

  const invRows = useMemo(() => {
    const stockStatus = (r) => r.exist === 0 ? 'low' : r.exist <= r.stockMin ? 'low' : 'on';
    let list = allInv.map(r => ({ ...r, stockSt: stockStatus(r) }));
    if (invFilter === 'on-stock')   list = list.filter(r => r.stockSt === 'on');
    if (invFilter === 'low-stock')  list = list.filter(r => r.stockSt === 'low');
    if (invFilter === 'sin-stock')  list = list.filter(r => r.exist === 0);
    if (invFilter === 'sin-ventas') list = list.filter(r => r.estadoV === 'Sin Ventas');
    return [...list].sort((a, b) => {
      const av = typeof a[invSort.col] === 'string' ? a[invSort.col].toLowerCase() : (a[invSort.col] ?? 0);
      const bv = typeof b[invSort.col] === 'string' ? b[invSort.col].toLowerCase() : (b[invSort.col] ?? 0);
      if (av < bv) return invSort.dir === 'asc' ? -1 : 1;
      if (av > bv) return invSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allInv, invFilter, invSort]);

  const invTotalPages = Math.ceil(invRows.length / INV_PAGE_SIZE);
  const invSlice = invRows.slice(invPage * INV_PAGE_SIZE, (invPage + 1) * INV_PAGE_SIZE);

  const handleInvSort = (col) => {
    setInvSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));
    setInvPage(0);
  };

  const thSx = { background:'rgba(26,26,26,.025)', borderBottom:'2px solid rgba(26,26,26,.08)', px:'10px', py:'8px', whiteSpace:'nowrap', cursor:'pointer', userSelect:'none', '&:hover':{ color:DL.blue } };
  const ThSort = ({ col, children, align = 'left' }) => (
    <TableCell onClick={() => handleInvSort(col)} sx={{ ...thSx, textAlign:align, fontSize:8.5, fontWeight: 500, textTransform:'uppercase', letterSpacing:'.07em', color: invSort.col===col ? DL.blue : DL.tS }}>
      <Box sx={{ display:'inline-flex', alignItems:'center', gap:'2px' }}>
        {children}
        {invSort.col === col
          ? (invSort.dir === 'asc' ? <Box sx={{ fontSize:8, ml:'2px' }}>↑</Box> : <Box sx={{ fontSize:8, ml:'2px' }}>↓</Box>)
          : <Box sx={{ fontSize:8, opacity:.3, ml:'2px' }}>↕</Box>}
      </Box>
    </TableCell>
  );

  const counts = useMemo(() => ({
    total:    allInv.length,
    onStock:  allInv.filter(r => r.exist > r.stockMin).length,
    lowStock: allInv.filter(r => r.exist > 0 && r.exist <= r.stockMin).length,
    sinStock: allInv.filter(r => r.exist === 0).length,
    sinVentas:allInv.filter(r => r.estadoV === 'Sin Ventas').length,
    valorTotal: allInv.reduce((s, r) => s + r.costoT, 0),
  }), [allInv]);

  // ── Excel export for Detalles ────────────────────────────────────
  const exportDetExcel = () => {
    const stamp = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const label = isSucursal ? 'Sucursal' : 'Vendedor';
    const wb = XLSX.utils.book_new();
    if (mainTab === 'ventas') {
      const wsData = filtered.map(r => ({
        'Factura':      r.id,
        'Cliente':      r.cli,
        'N° Factura':   r.nofac || '',
        'Fecha':        r.fecha ? r.fecha.split('-').reverse().join('/') : '',
        'Vencimiento':  r.venc  ? r.venc.split('-').reverse().join('/')  : '',
        'Cant.':        r.qty ?? '',
        'Venta $':      r.v,
        'N.C.':         r.nc || '',
        'Costo $':      r.costo,
        'MG%':          r.mgPct != null ? r.mgPct / 100 : '',
        'Abono':        r.abono,
        'Pendiente':    r.pend,
      }));
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
      XLSX.writeFile(wb, `${label}_Detalles_${stamp}.xlsx`);
    } else {
      const wsData = invRows.map(r => ({
        'Producto':           r.prod,
        'Categoría':          r.cat,
        'UOM':                r.uom,
        'Existencia':         r.exist,
        'Últ. Compra':        r.ultCompra,
        'Cant. Últ. Compra':  r.cantCompra,
        'Costo Unit.':        r.costoU,
        'Costo Total':        r.costoT,
        'Días Inv.':          r.diasInv,
        'Stock Mín.':         r.stockMin,
        'Cons/Sem':           r.consPSem,
        'Cons/Sem Hist.':     r.consPHist,
        'Estado Ventas':      r.estadoV,
      }));
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
      XLSX.writeFile(wb, `${label}_Inventario_${stamp}.xlsx`);
    }
  };

  return (
    <>
      <Card>
        {/* ── Card header ─────────────────────────────────────────── */}
        <Box sx={{ px:'14px', py:'10px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${DL.border}` }}>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH }}>{t('vend.det.titulo')}</Typography>
          {/* Right side: excel export + col picker */}
          <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {/* Excel icon button */}
            <Box component="button" onClick={exportDetExcel} title="Descargar Excel" sx={{
              width:26, height:26, borderRadius:'7px', border:`1px solid ${DL.border2}`,
              background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all .14s', flexShrink:0, p:0,
              '&:hover':{ borderColor:'#15803d', background:'#f0fdf4' },
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="18" rx="2" fill="#15803d" opacity=".12"/>
                <path d="M8 8l3 4-3 4M12 16h4M12 8h4M12 12h3" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3v4M8 3v4M2 9h20" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </Box>
            {mainTab === 'ventas' && (
              <Box ref={pickerRef} sx={{ position:'relative' }}>
                <ColsBtn open={colPickerOpen} onClick={() => setColPickerOpen(o => !o)} />
                {colPickerOpen && <ColPickerPopover cols={cols} setCols={setCols} onClose={() => setColPickerOpen(false)} />}
              </Box>
            )}
            {mainTab === 'inventario' && (
              <Box ref={invPickerRef} sx={{ position:'relative' }}>
                <ColsBtn open={invColPickerOpen} onClick={() => setInvColPickerOpen(o => !o)} />
                {invColPickerOpen && <ColPickerPopover cols={invCols} setCols={setInvCols} onClose={() => setInvColPickerOpen(false)} />}
              </Box>
            )}
          </Box>
        </Box>

        {/* ══ VENTAS TAB ══════════════════════════════════════════════ */}
        {mainTab === 'ventas' && <>
          {/* Sub-tabs */}
          <Box sx={{ display:'flex', borderBottom:`1px solid ${DL.border}`, px:'8px' }}>
            {[{ v:'todas', l: t('vend.det.todas') }, { v:'pagadas', l: 'Pagadas' }, { v:'pendientes', l: t('vend.det.pendientes') }].map(tb => (
              <Box key={tb.v} component="button" onClick={() => handleTab(tb.v)} sx={{
                fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:tab===tb.v?500:500,
                px:'12px', py:'6px', borderBottom:`2px solid ${tab===tb.v?DL.blue:'transparent'}`,
                mb:'-1px', border:'none', background:'transparent',
                color:tab===tb.v?DL.navy:DL.tS, cursor:'pointer', whiteSpace:'nowrap', transition:'all .14s',
                '&:hover':{ color:DL.tM },
              }}>{tb.l}</Box>
            ))}
          </Box>
          {/* Table */}
          <Box sx={{ overflowX:'auto', px:'14px' }}>
            <Table size="small" sx={{ minWidth:700 }}>
              <TableHead>
                <TableRow>
                  {visCols.map(c => (
                    <TableCell key={c.key} sx={{ fontSize:9, fontWeight: 500, textTransform:'uppercase', letterSpacing:'.07em', color:DL.tS, background:'rgba(26,26,26,.025)', borderBottom:'2px solid rgba(26,26,26,.08)', px:'12px', py:'8px', whiteSpace:'nowrap', textAlign:['qty','v','nc','costo','mgPct','abono','pend'].includes(c.key)?'right':'left' }}>
                      {t(c.labelKey)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {slice.map((r) => (
                  <TableRow key={r.id} onClick={() => setSelectedRow(toModalRow(r, selId))} sx={{ cursor:'pointer', borderBottom:'1px solid rgba(26,26,26,.05)', '&:hover td':{ background:'rgba(84,126,105,.03)' } }}>
                    {visCols.map(c => (
                      <TableCell key={c.key} sx={{ px:'12px', py:'9px', textAlign:['qty','v','nc','costo','mgPct','abono','pend'].includes(c.key)?'right':'left' }}>
                        {renderCell(r, c.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          {/* Pagination */}
          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'14px', py:'10px', borderTop:`1px solid ${DL.border}` }}>
            <Typography sx={{ fontSize:9, color:DL.tS }}>
              {t('vend.det.pagination').replace('{n1}', page*PAGE_SIZE+1).replace('{n2}', Math.min((page+1)*PAGE_SIZE, filtered.length)).replace('{n3}', filtered.length)}
            </Typography>
            <Box sx={{ display:'flex', gap:'3px' }}>
              {Array.from({ length:totalPages }, (_,i) => (
                <Box key={i} component="button" onClick={() => setPage(i)} sx={{
                  minWidth:24, height:24, borderRadius:'5px',
                  border:`1px solid ${i===page?DL.blue:DL.border}`,
                  background:i===page?DL.blue:'#fff',
                  fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight: 500,
                  color:i===page?'#fff':DL.tM, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  '&:hover':{ borderColor:DL.blue },
                }}>{i+1}</Box>
              ))}
            </Box>
          </Box>
        </>}

        {/* ══ INVENTARIO TAB ══════════════════════════════════════════ */}
        {mainTab === 'inventario' && <>
          {/* Filter tabs — each shows count and filters on click */}
          <Box sx={{ display:'flex', borderBottom:`1px solid ${DL.border}`, px:'8px', gap:'2px', flexWrap:'wrap' }}>
            {[
              { key:'todos',      label: t('vend.det.inv.totalSKUs'),   val:counts.total,     color:DL.tM,    activeColor:DL.navy  },
              { key:'on-stock',   label: t('vend.det.inv.onStock'),      val:counts.onStock,   color:DL.green, activeColor:DL.green },
              { key:'low-stock',  label: t('vend.det.inv.stockBajo'),    val:counts.lowStock,  color:DL.yellow,activeColor:DL.yellow},
              { key:'sin-stock',  label: t('vend.det.inv.sinStock'),     val:counts.sinStock,  color:DL.red,   activeColor:DL.red   },
              { key:'sin-ventas', label: t('vend.det.inv.sinVentasLbl'), val:counts.sinVentas, color:'#8d8d8d',activeColor:'#6a6a6a'},
            ].map(k => {
              const isActive = invFilter === k.key;
              return (
                <Box key={k.key} component="button" onClick={() => { setInvFilter(k.key); setInvPage(0); }} sx={{
                  fontFamily:"'Inter',sans-serif", cursor:'pointer', border:'none',
                  background:'transparent', display:'flex', alignItems:'center', gap:'5px',
                  px:'12px', py:'7px', mb:'-1px',
                  borderBottom:`2px solid ${isActive ? k.activeColor : 'transparent'}`,
                  transition:'all .14s',
                  '&:hover': !isActive ? { borderBottomColor:'rgba(26,26,26,.2)' } : {},
                }}>
                  <Typography sx={{ fontSize:11, fontWeight: 500, color: isActive ? k.activeColor : k.color }}>{k.val}</Typography>
                  <Typography sx={{ fontSize:9, fontWeight: isActive ? 500 : 500, color: isActive ? k.activeColor : DL.tS }}>{k.label}</Typography>
                </Box>
              );
            })}
          </Box>

          {/* Inventory table */}
          {(() => {
            const visInvCols = invCols.filter(c => c.vis);
            const rightAlign = new Set(['exist','cantCompra','costoU','costoT','diasInv','stockMin','consPSem','consPHist','v3m','v6m','costoUC']);
            return (
          <Box sx={{ overflowX:'auto', px:'14px' }}>
            <Table size="small" sx={{ minWidth: visInvCols.length > 10 ? 1300 : 800 }}>
              <TableHead>
                <TableRow>
                  {visInvCols.map(c => (
                    <ThSort key={c.key} col={c.key} align={rightAlign.has(c.key) ? 'right' : 'left'}>{t(c.labelKey)}</ThSort>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {invSlice.map((r, i) => {
                  const isLow = r.stockSt === 'low';
                  const rowBg = i % 2 === 0 ? '#fff' : 'rgba(26,26,26,.008)';
                  const renderInvCell = (key) => {
                    switch(key) {
                      case 'stockSt':    return <Box sx={{ display:'inline-flex', alignItems:'center', gap:'5px' }}><Box sx={{ width:8, height:8, borderRadius:'50%', background:isLow?DL.red:DL.green, flexShrink:0 }} /><Typography sx={{ fontSize:9.5, fontWeight: 500, color:isLow?DL.red:DL.green, whiteSpace:'nowrap' }}>{isLow?'Low Stock':'On Stock'}</Typography></Box>;
                      case 'prod':       return <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, whiteSpace:'nowrap' }}>{r.prod}</Typography>;
                      case 'cat':        return <Typography sx={{ fontSize:9.5, color:DL.tM }}>{r.cat}</Typography>;
                      case 'uom':        return <Typography sx={{ fontSize:9, color:DL.tS, fontWeight: 500 }}>{r.uom}</Typography>;
                      case 'exist':      return <Typography sx={{ fontSize:11, fontWeight: 500, color:isLow?DL.red:DL.tH }}>{r.exist}</Typography>;
                      case 'ultCompra':  return <Typography sx={{ fontSize:9.5, color:DL.tS }}>{r.ultCompra||'—'}</Typography>;
                      case 'cantCompra': return <Typography sx={{ fontSize:10, color:DL.tM }}>{r.cantCompra??'—'}</Typography>;
                      case 'costoU':     return <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>${r.costoU.toFixed(2)}</Typography>;
                      case 'costoT':     return <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>${r.costoT.toLocaleString()}</Typography>;
                      case 'diasInv':    return <Typography sx={{ fontSize:10, fontWeight: 500, color:r.diasInv>=200?'#8d8d8d':r.diasInv<=14?DL.red:DL.tM }}>{r.diasInv}</Typography>;
                      case 'stockMin':   return <Typography sx={{ fontSize:10, color:r.exist<=r.stockMin&&r.stockMin>0?DL.red:DL.tS }}>{r.stockMin}</Typography>;
                      case 'consPSem':   return <Typography sx={{ fontSize:10, color:DL.tM }}>{r.consPSem.toFixed(2)}</Typography>;
                      case 'consPHist':  return <Typography sx={{ fontSize:10, color:DL.tM }}>{r.consPHist.toFixed(2)}</Typography>;
                      case 'estadoV':    return <Box sx={{ display:'inline-flex', px:'6px', py:'2px', borderRadius:'4px', background:r.estadoV==='Con Ventas'?DL.greenBg:DL.redBg }}><Typography sx={{ fontSize:9, fontWeight: 500, color:r.estadoV==='Con Ventas'?DL.green:'#8d8d8d' }}>{r.estadoV}</Typography></Box>;
                      case 'v3m':        return <Typography sx={{ fontSize:10, fontWeight: 500, color:r.v3m>0?DL.tH:'#8d8d8d' }}>{r.v3m}</Typography>;
                      case 'v6m':        return <Typography sx={{ fontSize:10, fontWeight: 500, color:r.v6m>0?DL.tH:'#8d8d8d' }}>{r.v6m}</Typography>;
                      case 'costoUC':    return <Typography sx={{ fontSize:10, color:DL.tS }}>{r.costoUC!=null?`$${r.costoUC.toFixed(2)}`:'—'}</Typography>;
                      default: return null;
                    }
                  };
                  return (
                    <TableRow key={r.prod} sx={{ background:rowBg, '&:hover td':{ background:'rgba(84,126,105,.03)' } }}>
                      {visInvCols.map(c => (
                        <TableCell key={c.key} sx={{ px:'10px', py:'8px', textAlign: rightAlign.has(c.key)?'right':'left' }}>
                          {renderInvCell(c.key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
            );
          })()}
          {/* Pagination */}
          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'14px', py:'10px', borderTop:`1px solid ${DL.border}` }}>
            <Typography sx={{ fontSize:9, color:DL.tS }}>
              {invRows.length === 0 ? t('vend.det.inv.empty') : t('vend.det.inv.pagination').replace('{n1}', invPage*INV_PAGE_SIZE+1).replace('{n2}', Math.min((invPage+1)*INV_PAGE_SIZE, invRows.length)).replace('{n3}', invRows.length)}
            </Typography>
            <Box sx={{ display:'flex', gap:'4px' }}>
              {[{icon:'‹',dir:-1},{icon:'›',dir:1}].map(b => (
                <Box key={b.dir} component="button" onClick={() => setInvPage(p => Math.max(0, Math.min(invTotalPages-1, p+b.dir)))}
                  disabled={b.dir===-1 ? invPage===0 : invPage>=invTotalPages-1}
                  sx={{
                    width:26, height:26, borderRadius:'7px',
                    border:`1px solid ${DL.border}`, background:'#fff',
                    fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight: 500,
                    color:DL.tM, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    '&:hover':{ borderColor:DL.blue, color:DL.blue },
                    '&:disabled':{ opacity:.35, cursor:'default' },
                  }}>{b.icon}</Box>
              ))}
            </Box>
          </Box>
        </>}
      </Card>
      {selectedRow && <InvoiceModal row={selectedRow} onClose={() => setSelectedRow(null)} />}
    </>
  );
}

// ─── Sucursales (for mode="sucursal") ────────────────────────────────────────
const SUCURSALES = [
  { id: 'JH', name: 'Ciudad de Guatemala' },
  { id: 'JM', name: 'Quetzaltenango'      },
  { id: 'ML', name: 'Escuintla'           },
  { id: 'CA', name: 'Antigua Guatemala'   },
];

// Stock data per sucursal (demo)
const STOCK_DATA = {
  JH: { totalSKUs: 122, bajaSKUs: 14, criticoSKUs: 4, valorStock: 892400, valorMeta: 950000 },
  JM: { totalSKUs: 98,  bajaSKUs: 8,  criticoSKUs: 2, valorStock: 641200, valorMeta: 700000 },
  ML: { totalSKUs: 86,  bajaSKUs: 11, criticoSKUs: 3, valorStock: 512800, valorMeta: 580000 },
  CA: { totalSKUs: 74,  bajaSKUs: 5,  criticoSKUs: 1, valorStock: 384600, valorMeta: 420000 },
};

function StockKpiCards({ selId }) {
  const { t } = useT();
  const s = STOCK_DATA[selId] || STOCK_DATA.JH;
  const bajaPct  = Math.round(((s.bajaSKUs + s.criticoSKUs) / s.totalSKUs) * 100);
  const valorPct = Math.round((s.valorStock / s.valorMeta) * 100);
  const fmtV = (v) => v >= 1000000 ? `$${(v/1000000).toFixed(2)}M` : `$${Math.round(v/1000)}K`;

  const valColor = valorPct >= 95 ? DL.green : valorPct >= 80 ? DL.yellow : DL.red;

  return (
    /* Valor de inventario — solo esta tarjeta */
    <Box sx={{
      background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1,
      p:'12px 13px 10px', position:'relative', overflow:'hidden',
      display:'flex', flexDirection:'column',
      transition:'box-shadow .2s, transform .2s', cursor:'default',
      '&:hover':{ boxShadow:DL.e2, transform:'translateY(-1px)' },
    }}>
      {/* Accent bar */}
      <Box sx={{ position:'absolute', top:0, left:'13px', right:'13px', height:3, borderRadius:'0 0 4px 4px', background:valColor }} />

      {/* Header */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mt:'3px', mb:'5px' }}>
        <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS }}>
          {t('vend.stock.valorInv')}
        </Typography>
        <Box sx={{ width:18, height:18, borderRadius:'50%', background:`${valColor}1a`, color:valColor,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight: 500, flexShrink:0 }}>
          $
        </Box>
      </Box>

      {/* Value */}
      <Typography sx={{ fontSize:20, fontWeight: 500, color:DL.tH, lineHeight:1.05, letterSpacing:'-.04em',
        pb:'3px', mb:'3px', borderBottom:'1px solid rgba(26,26,26,.08)' }}>
        {fmtV(s.valorStock)}
      </Typography>

      {/* Meta row */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', mb:'4px' }}>
        <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em' }}>{t('lbl.meta')}</Typography>
        <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>{fmtV(s.valorMeta)}</Typography>
      </Box>

      {/* Progress bar */}
      <Box sx={{ height:9, background:'rgba(26,26,26,.07)', borderRadius:5, overflow:'hidden', mb:'5px' }}>
        <Box sx={{ height:'100%', borderRadius:5, width:`${Math.min(valorPct,100)}%`,
          background:valColor, transition:'width .8s cubic-bezier(.4,0,.2,1)' }} />
      </Box>

      {/* Pct row */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:'8px' }}>
        <Typography sx={{ fontSize:9, fontWeight: 500, color:valColor }}>{valorPct}% {t('lbl.deMeta')}</Typography>
        <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS }}>{fmtV(s.valorMeta - s.valorStock)}</Typography>
      </Box>

      {/* YoY footer */}
      <Box sx={{ background:'rgba(26,26,26,.035)', borderRadius:'5px', p:'4px 7px',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:'5px', mt:'auto' }}>
        <Typography sx={{ fontSize:7.5, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
          vs año ant.
        </Typography>
        <Box sx={{ fontSize:8, fontWeight: 500, px:'5px', py:'1px', borderRadius:'4px',
          background:DL.greenBg, color:DL.green, whiteSpace:'nowrap' }}>
          +4.2%
        </Box>
      </Box>
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Vendedor({ mode = 'vendedor' }) {
  const { t } = useT();
  const isSucursal = mode === 'sucursal';
  const entidades  = isSucursal ? SUCURSALES : VENDEDORES;

  const [searchParams] = useSearchParams();
  const initId = (() => {
    const v = searchParams.get('v');
    return v && entidades.find(x => x.id === v) ? v : entidades[0].id;
  })();
  const [selId,    setSelId]    = useState(initId);
  const [ano,      setAno]      = useState('2025');
  const [mes,      setMes]      = useState('todos');
  const [filterCat,    setFilterCat]    = useState('todas');
  const [filterSubcat, setFilterSubcat] = useState('todas');
  const [filterProd,   setFilterProd]   = useState('todos');
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);

  const kpis     = VEND_KPIS[selId]       || VEND_KPIS.JH;
  const hist     = HIST_DATA[selId]       || HIST_DATA.JH;
  const alerts   = VEND_ALERTS[selId]     || VEND_ALERTS.JH;
  const cliRows  = CLIENTES_VEND[selId]   || CLIENTES_VEND.JH;
  const catRows  = VENTAS_CAT_VEND[selId] || VENTAS_CAT_VEND.JH;
  const prodRows = VENTAS_PROD_VEND[selId]|| VENTAS_PROD_VEND.JH;
  const cxc      = CXC_DATA_V2[selId]     || CXC_DATA_V2.JH;
  const hm       = HEATMAP_VEND[selId]    || HEATMAP_VEND.JH;
  const detRows  = DET_ROWS_VEND[selId]   || DET_ROWS_VEND.JH;

  const pageTitle    = isSucursal ? t('page.tienda')  : t('page.vendedor');
  const pageSubtitle = isSucursal ? t('vend.pageSubSucursal') : t('vend.pageSubVendedor');
  const filterLabel  = isSucursal ? t('vend.filterLabel.sucursal') : t('vend.filterLabel.vendedor');

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

    const vendedor = entidades.find(x => x.id === selId);
    const vendNombre = vendedor ? vendedor.name : selId;

    // Sheet 1: KPIs Vendedor
    const kpiRows = kpis.map(k => ({
      KPI: k.label,
      Valor: k.value,
      Meta: k.meta,
      '% de Meta': k.pct + '%',
      'vs Año Ant.': k.delta,
    }));
    const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
    autoWidth(wsKpi);
    XLSX.utils.book_append_sheet(wb, wsKpi, 'KPIs');

    // Sheet 2: Facturas
    const detRowsMapped = detRows.map(r => ({
      'ID Factura': r.id,
      Cliente: r.cli,
      Categoría: r.cat,
      'Fecha': r.fecha || '',
      'Vencimiento': r.venc || '',
      'Venta $': r.v,
      'Costo $': r.costo,
      'Margen %': r.mgPct,
      Estado: r.estado,
    }));
    const wsDet = XLSX.utils.json_to_sheet(detRowsMapped);
    autoWidth(wsDet);
    XLSX.utils.book_append_sheet(wb, wsDet, 'Facturas');

    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    const safeNombre = vendNombre.replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `Vendedor_${safeNombre}_${stamp}.xlsx`);
  }

  return (
    <Box>
      <PageHeader title={pageTitle} live onRefresh={handleRefresh} onExport={exportToExcel}>
        <MiniSelect label={t('lbl.anio')} value={ano} onChange={setAno} minWidth={80} options={[
          { value: '2026', label: '2026' },
          { value: '2025', label: '2025' },
          { value: '2024', label: '2024' },
        ]} />
        <MiniSelect label={t('time.mes')} value={mes} onChange={setMes} options={[
          { value: 'todos', label: t('filter.todos')        },
          { value: '01',    label: t('month.enero')         },
          { value: '02',    label: t('month.febrero')       },
          { value: '03',    label: t('month.marzo')         },
          { value: '04',    label: t('month.abril')         },
          { value: '05',    label: t('month.mayo')          },
          { value: '06',    label: t('month.junio')         },
          { value: '07',    label: t('month.julio')         },
          { value: '08',    label: t('month.agosto')        },
          { value: '09',    label: t('month.septiembre')    },
          { value: '10',    label: t('month.octubre')       },
          { value: '11',    label: t('month.noviembre')     },
          { value: '12',    label: t('month.diciembre')     },
        ]} />
        <MiniSelect label={filterLabel} value={selId} onChange={setSelId} options={entidades.map(v => ({ value: v.id, label: v.name }))} />
        <MiniSelect label="Categoría" value={filterCat} onChange={setFilterCat} options={[
          { value: 'todas',          label: 'Todas'           },
          { value: 'agricola',       label: 'Agrícola'        },
          { value: 'veterinario',    label: 'Veterinario'     },
          { value: 'semillas',       label: 'Semillas'        },
          { value: 'farmaceuticos',  label: 'Farmacéuticos'   },
          { value: 'maquinaria',     label: 'Maquinaria'      },
        ]} />
        <MiniSelect label="Subcategoría" value={filterSubcat} onChange={setFilterSubcat} options={[
          { value: 'todas',     label: 'Todas'      },
          { value: 'premium',  label: 'Premium'     },
          { value: 'estandar', label: 'Estándar'    },
          { value: 'basico',   label: 'Básico'      },
        ]} />
        <MiniSelect label="Producto" value={filterProd} onChange={setFilterProd} options={[
          { value: 'todos',    label: 'Todos'       },
          { value: 'activos',  label: 'Activos'     },
          { value: 'inactivos',label: 'Inactivos'   },
        ]} />
      </PageHeader>

      <Box sx={{ p:{ xs:'10px', md:'16px' }, display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* KPI row — 6 cols when sucursal (adds 2 stock cards inline) */}
        <KpiRow kpis={kpis} columns={isSucursal ? 5 : 4}>
          {isSucursal && <StockKpiCards selId={selId} />}
        </KpiRow>

        {/* Histórico + Alertas */}
        <Box sx={{ display: 'grid', gridTemplateColumns:{ xs:'1fr', md:'1fr 260px' }, gap: '16px', alignItems: 'start' }}>
          <HistoricoCard histData={hist} selId={selId} isSucursal={isSucursal} />
          <AlertsPanel alerts={alerts} />
        </Box>

        {/* Clientes/Cat/Prod + CxC — right col fixed 280px to match row below */}
        <Box sx={{ display: 'grid', gridTemplateColumns:{ xs:'1fr', md:'1fr 280px' }, gap: '16px', alignItems: 'stretch' }}>
          <ClientesCard cliRows={cliRows} catRows={catRows} prodRows={prodRows} vendRows={VEND_ROWS[selId] || VEND_ROWS.JH} isSucursal={isSucursal} />
          <CxcCard cxc={cxc} />
        </Box>

        {/* Heatmap + Inactivos — same right col width as row above */}
        <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'1fr 280px' }, gap:'16px', alignItems:'stretch' }}>
          <HeatmapCard hm={hm} hmVend={HEATMAP_VENDEDOR[selId] || HEATMAP_VENDEDOR.JH} isSucursal={isSucursal} />
          <ClientesInactivosCard selId={selId} />
        </Box>

        {/* Detalle */}
        <DetTable rows={detRows} selId={selId} isSucursal={isSucursal} />

      </Box>
    </Box>
  );
}
