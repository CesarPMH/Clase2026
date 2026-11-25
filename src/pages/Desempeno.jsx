// ─── Desempeño · Dashboard de Vendedores y Sucursales ────────────────────────
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { ArrowUpward as AscIcon, ArrowDownward as DescIcon, UnfoldMore as SortIcon, Search as SearchIcon, ViewColumn as ColsIcon } from '@mui/icons-material';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import { DL } from '../theme';
import { useT } from '../i18n/LanguageContext';

// ─── Demo data ────────────────────────────────────────────────────────────────
const MESES = ['May','Jun','Jul','Ago','Sep','Oct','Nov','Dic','Ene','Feb','Mar','Abr'];

const KPIS_DATA = [
  { id: 'ventas',    labelKey: 'des.kpi.ventasTotales', value: '$24.7M', metaLabelKey: 'des.kpi.metaMensual', meta: '$25.0M', pct: 98.8,  metaDelta: '-$0.3M',  metaDeltaUp: false, delta: '+16.0%', deltaUp: true,  yoy: 'vs Año Ant. $21.3M',  accentColor: DL.green,  badgeIcon: '↑' },
  { id: 'cumpl',     labelKey: 'des.kpi.cumplimiento',  value: '91.6%',  metaLabelKey: 'lbl.meta', meta: '100%', pct: 91.6, metaDelta: '-8.4pp', metaDeltaUp: false, delta: '+3pp', deltaUp: true,  yoy: 'vs Año Ant. 88.6%',  accentColor: DL.green,  barColor: '#C05820', badgeIcon: '✓' },
  { id: 'ticket',    labelKey: 'des.kpi.ticketProm',    value: '$6,175', metaLabelKey: 'des.kpi.referencia',  meta: '$5,950', pct: 103.8, metaDelta: '+$225',   metaDeltaUp: true,  delta: '+5.4%',  deltaUp: true,  yoy: 'vs Año Ant. $5,860',  accentColor: DL.blue,   badgeIcon: '↑' },
  { id: 'suc_meta',  labelKey: 'des.kpi.sucEnMeta',     value: '4 / 5',  metaLabelKey: 'des.kpi.totalSucurs', meta: '5',     pct: 80,    metaDelta: null,      metaDeltaUp: true,  delta: '+1',     deltaUp: true,  yoy: 'vs Mes Ant. 3 / 5',   accentColor: DL.blue,   badgeIcon: '◎' },
  { id: 'vend_meta', labelKey: 'des.kpi.vendEnMeta',    value: '5 / 8',  metaLabelKey: 'des.kpi.totalEquipo', meta: '8',     pct: 62.5,  metaDelta: null,      metaDeltaUp: true,  delta: '+1',     deltaUp: true,  yoy: 'vs Mes Ant. 4 / 8',   accentColor: DL.green,  badgeIcon: '✓' },
];

// semanas: 4 semanas de Abr 2026 · pct=% cumpl. · venta=$ · meta=$ · ant=$ año anterior misma semana
const PERF_VEND = [
  { rank: 1, nombre: 'María González', navId: 'ML', meta: 25000, venta: 26480, ventaAnt: 23800, pct: 105, estado: 'Sobre Meta',
    semanas: [{ pct: 108, venta: 6750, meta: 6250, ant: 5950 }, { pct: 106, venta: 6625, meta: 6250, ant: 5800 }, { pct: 103, venta: 6435, meta: 6250, ant: 5980 }, { pct: 105, venta: 6625, meta: 6300, ant: 6070 }] },
  { rank: 2, nombre: 'Carlos Ruiz',    navId: 'CA', meta: 25000, venta: 25900, ventaAnt: 24200, pct: 104, estado: 'Sobre Meta',
    semanas: [{ pct: 105, venta: 6560, meta: 6250, ant: 6100 }, { pct: 102, venta: 6375, meta: 6250, ant: 5980 }, { pct: 106, venta: 6625, meta: 6250, ant: 6050 }, { pct: 103, venta: 6490, meta: 6300, ant: 6070 }] },
  { rank: 3, nombre: 'Ana Martínez',   navId: 'JM', meta: 25000, venta: 25600, ventaAnt: 24600, pct: 102, estado: 'Sobre Meta',
    semanas: [{ pct: 104, venta: 6500, meta: 6250, ant: 6200 }, { pct: 101, venta: 6310, meta: 6250, ant: 6050 }, { pct: 103, venta: 6435, meta: 6250, ant: 6150 }, { pct: 100, venta: 6300, meta: 6300, ant: 6200 }] },
  { rank: 4, nombre: 'Luis Fernández', navId: 'JH', meta: 25000, venta: 25100, ventaAnt: 24900, pct: 100, estado: 'En Meta',
    semanas: [{ pct: 102, venta: 6375, meta: 6250, ant: 6250 }, { pct:  99, venta: 6185, meta: 6250, ant: 6180 }, { pct: 101, venta: 6310, meta: 6250, ant: 6220 }, { pct:  99, venta: 6245, meta: 6300, ant: 6250 }] },
  { rank: 5, nombre: 'Sofía López',    navId: 'ML', meta: 24200, venta: 24000, ventaAnt: 22800, pct: 99,  estado: 'En Meta',
    semanas: [{ pct: 100, venta: 6050, meta: 6050, ant: 5700 }, { pct:  98, venta: 5929, meta: 6050, ant: 5650 }, { pct:  99, venta: 5990, meta: 6050, ant: 5720 }, { pct:  99, venta: 6040, meta: 6100, ant: 5730 }] },
  { rank: 6, nombre: 'Diego Torres',   navId: 'JH', meta: 24400, venta: 22900, ventaAnt: 21500, pct: 94,  estado: 'Bajo Meta',
    semanas: [{ pct:  97, venta: 5820, meta: 6100, ant: 5400 }, { pct:  93, venta: 5673, meta: 6100, ant: 5250 }, { pct:  94, venta: 5734, meta: 6100, ant: 5380 }, { pct:  91, venta: 5551, meta: 6100, ant: 5470 }] },
  { rank: 7, nombre: 'Carmen Silva',   navId: 'JM', meta: 25100, venta: 22100, ventaAnt: 23400, pct: 88,  estado: 'Bajo Meta',
    semanas: [{ pct:  90, venta: 5625, meta: 6250, ant: 5900 }, { pct:  87, venta: 5438, meta: 6250, ant: 5820 }, { pct:  89, venta: 5563, meta: 6250, ant: 5850 }, { pct:  86, venta: 5418, meta: 6300, ant: 5830 }] },
  { rank: 8, nombre: 'Roberto Díaz',   navId: 'CA', meta: 25000, venta: 19800, ventaAnt: 21200, pct: 79,  estado: 'Bajo Meta',
    semanas: [{ pct:  82, venta: 5125, meta: 6250, ant: 5300 }, { pct:  78, venta: 4875, meta: 6250, ant: 5280 }, { pct:  80, venta: 5000, meta: 6250, ant: 5300 }, { pct:  76, venta: 4788, meta: 6300, ant: 5320 }] },
];

const PERF_SUC = [
  { rank: 1, nombre: 'San Benito',   navId: 'JH', meta: 80000, venta: 83200, ventaAnt: 78400, pct: 104, estado: 'Sobre Meta',
    semanas: [{ pct: 106, venta: 21200, meta: 20000, ant: 19600 }, { pct: 103, venta: 20600, meta: 20000, ant: 19500 }, { pct: 105, venta: 21000, meta: 20000, ant: 19800 }, { pct: 103, venta: 20600, meta: 20000, ant: 19500 }] },
  { rank: 2, nombre: 'Petén Centro', navId: 'JM', meta: 75000, venta: 76500, ventaAnt: 72000, pct: 102, estado: 'Sobre Meta',
    semanas: [{ pct: 103, venta: 19313, meta: 18750, ant: 18000 }, { pct: 101, venta: 18938, meta: 18750, ant: 17800 }, { pct: 102, venta: 19125, meta: 18750, ant: 18100 }, { pct: 101, venta: 18938, meta: 18750, ant: 18100 }] },
  { rank: 3, nombre: 'Santa Elena',  navId: 'ML', meta: 70000, venta: 68600, ventaAnt: 67200, pct: 98,  estado: 'En Meta',
    semanas: [{ pct: 100, venta: 17500, meta: 17500, ant: 16800 }, { pct:  97, venta: 16975, meta: 17500, ant: 16900 }, { pct:  99, venta: 17325, meta: 17500, ant: 16800 }, { pct:  97, venta: 16975, meta: 17500, ant: 16700 }] },
  { rank: 4, nombre: 'Flores',       navId: 'CA', meta: 65000, venta: 61750, ventaAnt: 63200, pct: 95,  estado: 'En Meta',
    semanas: [{ pct:  97, venta: 15763, meta: 16250, ant: 15800 }, { pct:  94, venta: 15275, meta: 16250, ant: 15900 }, { pct:  96, venta: 15600, meta: 16250, ant: 15700 }, { pct:  93, venta: 15113, meta: 16250, ant: 15800 }] },
  { rank: 5, nombre: 'Sayaxché',     navId: 'JH', meta: 50000, venta: 43500, ventaAnt: 46800, pct: 87,  estado: 'Bajo Meta',
    semanas: [{ pct:  89, venta: 11125, meta: 12500, ant: 11700 }, { pct:  86, venta: 10750, meta: 12500, ant: 11800 }, { pct:  88, venta: 11000, meta: 12500, ant: 11600 }, { pct:  85, venta: 10625, meta: 12500, ant: 11700 }] },
];

// meses = % cumplimiento · ventas = $ vendido ese mes (en miles)
// 12 months: May–Abr · meses = % cumplimiento · ventas = $ k
const HEAT_VEND = [
  { nombre: 'María González', navId: 'ML',
    meses:  [107, 105, 108, 104, 106, 103, 109, 105, 107, 104, 106, 105],
    ventas: [26750,26250,27000,26000,26500,25750,27250,26250,26750,26000,26500,26250],
    total: 106 },
  { nombre: 'Carlos Ruiz',    navId: 'CA',
    meses:  [103, 101, 104, 102, 103, 104, 101, 103, 102, 104, 103, 104],
    ventas: [25750,25250,26000,25500,25750,26000,25250,25750,25500,26000,25750,26000],
    total: 103 },
  { nombre: 'Ana Martínez',   navId: 'JM',
    meses:  [101, 103, 100, 102, 99,  101, 102, 100, 101, 103, 100, 102],
    ventas: [25250,25750,25000,25500,24750,25250,25500,25000,25250,25750,25000,25500],
    total: 101 },
  { nombre: 'Luis Fernández', navId: 'JH',
    meses:  [100, 98,  101,  99, 100,  98, 100,  99, 102, 100,  99, 100],
    ventas: [25000,24500,25250,24750,25000,24500,25000,24750,25500,25000,24750,25000],
    total: 100 },
  { nombre: 'Sofía López',    navId: 'ML',
    meses:  [98,  96, 100,  97,  99,  96,  98,  97, 100,  98,  96,  99],
    ventas: [23520,23040,24000,23280,23760,23040,23520,23280,24000,23520,23040,23760],
    total:  98 },
  { nombre: 'Diego Torres',   navId: 'JH',
    meses:  [93,  95,  92,  96,  91,  94,  92,  95,  90,  94,  93,  94],
    ventas: [22320,22800,22080,23040,21840,22560,22080,22800,21600,22560,22320,22560],
    total:  93 },
  { nombre: 'Carmen Silva',   navId: 'JM',
    meses:  [88,  85,  90,  86,  88,  84,  89,  86,  87,  85,  90,  88],
    ventas: [22000,21250,22500,21500,22000,21000,22250,21500,21750,21250,22500,22000],
    total:  88 },
  { nombre: 'Roberto Díaz',   navId: 'CA',
    meses:  [81,  79,  83,  78,  80,  77,  82,  79,  76,  80,  78,  79],
    ventas: [20250,19750,20750,19500,20000,19250,20500,19750,19000,20000,19500,19750],
    total:  80 },
];

const HEAT_SUC = [
  { nombre: 'San Benito',   navId: 'JH',
    meses:  [104, 101, 105, 102, 103, 104, 102, 105, 103, 101, 104, 104],
    ventas: [83200,80800,84000,81600,82400,83200,81600,84000,82400,80800,83200,83200],
    total: 103 },
  { nombre: 'Petén Centro', navId: 'JM',
    meses:  [101, 103, 100, 102, 101, 103, 102, 100, 103, 102, 101, 102],
    ventas: [75750,77250,75000,76500,75750,77250,76500,75000,77250,76500,75750,76500],
    total: 102 },
  { nombre: 'Santa Elena',  navId: 'ML',
    meses:  [99,  97,  98, 100,  98,  97,  99,  98, 100,  97,  99,  98],
    ventas: [69300,67900,68600,70000,68600,67900,69300,68600,70000,67900,69300,68600],
    total:  98 },
  { nombre: 'Flores',       navId: 'CA',
    meses:  [96,  94,  95,  97,  94,  96,  93,  95,  97,  94,  95,  95],
    ventas: [62400,61100,61750,63050,61100,62400,60450,61750,63050,61100,61750,61750],
    total:  95 },
  { nombre: 'Sayaxché',     navId: 'JH',
    meses:  [90,  86,  88,  91,  85,  89,  87,  90,  84,  88,  86,  87],
    ventas: [45000,43000,44000,45500,42500,44500,43500,45000,42000,44000,43000,43500],
    total:  88 },
];

const ALERTAS = [
  { type: 'r', title: 'Roberto Díaz · Bajo meta',  msg: '79% cumplimiento. Meta pendiente: $5,200. Requiere atención inmediata.' },
  { type: 'r', title: 'Carmen Silva · En riesgo',   msg: '88% cumplimiento. Si no mejora el ritmo, no alcanzará la meta esta semana.' },
  { type: 'y', title: 'Cuentas por cobrar',          msg: '$12,500 con vencimiento en 6 días. Enviar recordatorio a clientes.' },
  { type: 'y', title: 'Diego Torres · Revisión',     msg: '94% cumplimiento. Necesita cerrar $1,500 adicionales para alcanzar meta.' },
  { type: 'g', title: 'Meta de equipo en camino',    msg: '6 de 8 vendedores en meta o por encima. Tendencia positiva para cierre.' },
  { type: 'g', title: 'María González · Récord',     msg: '105% — mejor desempeño del equipo. Supera meta en $1,480 este mes.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtK  = (v) => `$${(v / 1000).toFixed(0)}K`;

// RAG thresholds: ≥90 green, ≥70 amber, <70 red
function getRAG(pct) {
  if (pct >= 90) return { dot: DL.green,   bg: 'rgba(22,163,74,.12)',   border: 'rgba(22,163,74,.3)',   text: DL.green,   label: 'En Meta' };
  if (pct >= 70) return { dot: '#d97706',  bg: 'rgba(217,119,6,.12)',   border: 'rgba(217,119,6,.3)',   text: '#d97706',  label: 'Cerca'   };
  return           { dot: DL.red,    bg: 'rgba(220,38,38,.12)',   border: 'rgba(220,38,38,.3)',   text: DL.red,     label: 'Bajo'    };
}

// Keep legacy map for any direct lookups
const ESTADO_CFG = {
  'Sobre Meta': { bg: 'rgba(22,163,74,.12)',  color: DL.green },
  'En Meta':    { bg: 'rgba(22,163,74,.12)',  color: DL.green },
  'Bajo Meta':  { bg: 'rgba(220,38,38,.12)',  color: DL.red   },
};

const ALERT_C = {
  r: { bg: '#fff1f0', border: DL.red,    iconBg: '#fee2e2', iconColor: DL.red,    iconBd: '#fca5a5', icon: '!' },
  y: { bg: '#fffbeb', border: '#d97706', iconBg: '#fef3c7', iconColor: '#d97706', iconBd: '#fcd34d', icon: '⚠' },
  g: { bg: '#f0fdf4', border: DL.green,  iconBg: '#dcfce7', iconColor: DL.green,  iconBd: '#86efac', icon: '✓' },
};

const RANK_COLORS   = ['#f59e0b', '#8d8d8d', '#cd7c2f'];
const PAGE_SIZE_OPTS = [10, 25, 30, 50];

// Paleta pastel idéntica a Vendedor: #FFF2F0 → #FFF6EB → #E5FFF4
const HEAT_D_STOPS = [
  [0,   [255, 242, 240]],  // #FFF2F0 rosa claro (bajo)
  [0.5, [255, 246, 235]],  // #FFF6EB durazno   (medio)
  [1,   [229, 255, 244]],  // #E5FFF4 verde menta (alto)
];
function lerpHeatD(t) {
  t = Math.max(0, Math.min(1, t));
  let lo = HEAT_D_STOPS[0], hi = HEAT_D_STOPS[HEAT_D_STOPS.length - 1];
  for (let i = 0; i < HEAT_D_STOPS.length - 1; i++) {
    if (t >= HEAT_D_STOPS[i][0] && t <= HEAT_D_STOPS[i + 1][0]) { lo = HEAT_D_STOPS[i]; hi = HEAT_D_STOPS[i + 1]; break; }
  }
  const s = (hi[0] - lo[0]) > 0 ? (t - lo[0]) / (hi[0] - lo[0]) : 0;
  return `rgb(${Math.round(lo[1][0]+s*(hi[1][0]-lo[1][0]))},${Math.round(lo[1][1]+s*(hi[1][1]-lo[1][1]))},${Math.round(lo[1][2]+s*(hi[1][2]-lo[1][2]))})`;
}
// pct 0–100+ → t 0–1; texto siempre oscuro (colores pasteles claros)
function heatCfg(pct) {
  return { bg: lerpHeatD(Math.min(pct, 100) / 100), color: '#404040' };
}

function barColor(pct) {
  return pct >= 100 ? DL.green : pct >= 90 ? '#b45309' : pct >= 80 ? '#d97706' : DL.red;
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
      px: '12px', py: '7px',
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

function EstadoBadge({ pct }) {
  const rag = getRAG(pct);
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      px: '8px', py: '3px', borderRadius: '4px',
      background: rag.bg, border: `1px solid ${rag.border}`,
      flexShrink: 0,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: rag.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 8, fontWeight: 500, color: rag.text, whiteSpace: 'nowrap' }}>
        {rag.label}
      </Typography>
    </Box>
  );
}

// Sortable column header
function SortTH({ label, col, sortCol, sortDir, onSort, align = 'left', sx: extra }) {
  const active = sortCol === col;
  return (
    <TableCell
      onClick={() => onSort(col)}
      sx={{
        fontSize: 9, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '.07em', color: active ? DL.blue : DL.tS,
        background: 'rgba(26,26,26,.025)',
        borderBottom: '2px solid rgba(26,26,26,.08)',
        px: '10px', py: '8px', whiteSpace: 'nowrap',
        textAlign: align, cursor: 'pointer', userSelect: 'none',
        transition: 'color .12s',
        '&:hover': { color: DL.blue },
        ...extra,
      }}
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        {label}
        {active
          ? sortDir === 'asc'
            ? <AscIcon  sx={{ fontSize: 10 }} />
            : <DescIcon sx={{ fontSize: 10 }} />
          : <SortIcon sx={{ fontSize: 10, opacity: .35 }} />
        }
      </Box>
    </TableCell>
  );
}

// ─── Column picker (for PerformanceCard) ─────────────────────────────────────
function ColPickerPopover({ cols, setCols, onClose }) {
  const { t } = useT();
  return (
    <Box sx={{
      position: 'absolute', top: '100%', right: 0, mt: '4px', zIndex: 1200,
      background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(26,26,26,.12)', p: '10px 12px', minWidth: 160,
    }}>
      <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '.06em', mb: '8px' }}>{t('lbl.colVisibles')}</Typography>
      {cols.filter(c => !c.fixed).map(c => (
        <Box key={c.key} onClick={() => setCols(prev => prev.map(x => x.key === c.key ? { ...x, vis: !x.vis } : x))}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: '5px', cursor: 'pointer', '&:hover': { color: DL.blue } }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '3px', border: `1.5px solid ${c.vis ? DL.blue : DL.border2}`, background: c.vis ? DL.blue : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {c.vis && <Box sx={{ width: 6, height: 6, borderRadius: '1px', background: '#fff' }} />}
          </Box>
          <Typography sx={{ fontSize: 10, fontWeight: 500, color: 'inherit' }}>{t(c.labelKey)}</Typography>
        </Box>
      ))}
      <Box onClick={onClose} sx={{ mt: '8px', pt: '8px', borderTop: `1px solid ${DL.border}`, fontSize: 9, fontWeight: 500, color: DL.tS, cursor: 'pointer', textAlign: 'center', '&:hover': { color: DL.blue } }}>{t('btn.close')}</Box>
    </Box>
  );
}

// ─── KPI Cards (Ventas style) ─────────────────────────────────────────────────
function KpiRow() {
  const { t } = useT();
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: '10px' }}>
      {KPIS_DATA.map(k => {
        const bc = k.barColor || (k.pct >= 100 ? DL.green : k.pct >= 80 ? DL.yellow : DL.red);
        const bw = Math.min(k.pct ?? 0, 100);
        return (
          <Box key={k.id} sx={{
            background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`,
            boxShadow: DL.e1, p: '12px 13px 10px',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            transition: 'box-shadow .2s, transform .2s', cursor: 'default',
            '&:hover': { boxShadow: DL.e2, transform: 'translateY(-1px)' },
          }}>
            {/* Accent bar — color-matched to status */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '10px 10px 0 0', background: bc }} />
            {/* Label + badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '3px', mb: '5px' }}>
              <Typography sx={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: DL.tS }}>
                {t(k.labelKey)}
              </Typography>
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', background: `${bc}1a`, color: bc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, flexShrink: 0 }}>
                {k.badgeIcon}
              </Box>
            </Box>
            {/* Value — divider attached as border-bottom */}
            <Typography sx={{
              fontSize: 20, fontWeight: 500, color: DL.tH, lineHeight: 1.05, letterSpacing: '-.04em',
              pb: '3px', mb: '3px',
              borderBottom: '1px solid rgba(26,26,26,.08)',
            }}>
              {k.value}
            </Typography>

            {/* Meta + bar section — hidden for noMeta cards */}
            {!k.noMeta ? (
              <>
                {/* Meta label + value */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '4px' }}>
                  <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t(k.metaLabelKey)}</Typography>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH }}>{k.meta}</Typography>
                </Box>
                {/* THICK progress bar */}
                <Box sx={{ height: 9, background: '#e3e3e3', borderRadius: 5, overflow: 'hidden', mb: '5px' }}>
                  <Box sx={{ height: '100%', borderRadius: 5, width: `${bw}%`, background: bc, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
                </Box>
                {/* Pct + metaDelta */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '8px', alignItems: 'center', gap: '4px' }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: bc, whiteSpace: 'nowrap' }}>{k.pct.toFixed(0)} {t('des.lbl.deMeta')}</Typography>
                  {k.metaDelta && (
                    <Box sx={{ fontSize: 8, fontWeight: 500, px: '5px', py: '1px', borderRadius: '4px', background: k.metaDeltaUp ? DL.greenBg : DL.redBg, color: k.metaDeltaUp ? DL.green : DL.red, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {k.metaDelta}
                    </Box>
                  )}
                </Box>
              </>
            ) : (
              /* noMeta: just show delta chip below divider */
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '7px' }}>
                {k.metaDelta && (
                  <Box sx={{ fontSize: 8, fontWeight: 500, px: '6px', py: '2px', borderRadius: '4px', background: k.metaDeltaUp ? DL.greenBg : DL.redBg, color: k.metaDeltaUp ? DL.green : DL.red }}>
                    {k.metaDelta}
                  </Box>
                )}
              </Box>
            )}
            {/* YoY footer */}
            <Box sx={{ background: 'rgba(26,26,26,.035)', borderRadius: '5px', p: '4px 7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px', mt: 'auto' }}>
              <Typography sx={{ fontSize: 7.5, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                {k.yoy.split(' ')[0] === 'vs' ? k.yoy : k.yoy}
              </Typography>
              <Box sx={{ fontSize: 8, fontWeight: 500, px: '5px', py: '1px', borderRadius: '4px', background: k.deltaUp ? DL.greenBg : DL.redBg, color: k.deltaUp ? DL.green : DL.red, whiteSpace: 'nowrap' }}>
                {k.delta}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Performance Card ─────────────────────────────────────────────────────────
const PERF_COLS_CFG = [
  { key: 'rank',    labelKey: 'des.col.num',         fixed: true,  vis: true  },
  { key: 'nombre',  labelKey: 'des.col.nombre',     fixed: true,  vis: true  },
  { key: 'meta',    labelKey: 'lbl.meta',           fixed: false, vis: true  },
  { key: 'venta',   labelKey: 'des.col.ventaAct',   fixed: false, vis: true  },
  { key: 'cumpl',   labelKey: 'des.col.cumplPct',   fixed: false, vis: true  },
  { key: 'dif',     labelKey: 'des.col.diferencia', fixed: false, vis: true  },
  { key: 'part',    labelKey: 'des.col.pctRepr',    fixed: false, vis: false },
  { key: 'ant',     labelKey: 'des.col.anioAnt',    fixed: false, vis: true  },
  { key: 'crec',    labelKey: 'des.col.pctCrec',    fixed: false, vis: true  },
  { key: 'progreso',labelKey: 'des.col.progreso',   fixed: false, vis: false },
  { key: 'estado',  labelKey: 'des.estado',         fixed: false, vis: true  },
];

function PerformanceCard() {
  const { t } = useT();
  const navigate = useNavigate();
  const [tab,          setTab]          = useState('vendedor');
  const [vista,        setVista]        = useState('mensual'); // 'mensual' | 'semanal'
  const [sortCol,      setSortCol]      = useState('cumpl');
  const [sortDir,      setSortDir]      = useState('desc');
  const [page,         setPage]         = useState(0);
  const [pageSize,     setPageSize]     = useState(10);
  const [search,       setSearch]       = useState('');
  const [cols,         setCols]         = useState(PERF_COLS_CFG.map(c => ({ ...c })));
  const [colPickerOpen,setColPickerOpen]= useState(false);
  const pickerRef = useRef(null);
  const [flipped, setFlipped] = useState(new Set());
  const toggleFlip = useCallback((key) => setFlipped(prev => {
    const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next;
  }), []);

  useEffect(() => {
    const handler = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setColPickerOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allRows  = tab === 'vendedor' ? PERF_VEND : PERF_SUC;
  const dimLabel = tab === 'vendedor' ? t('des.tab.vendedor') : t('des.tab.sucursal');
  const visCols  = cols.filter(c => c.vis);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
    setPage(0);
  };

  const handleTab = (t) => { setTab(t); setSortCol('cumpl'); setSortDir('desc'); setPage(0); setSearch(''); };

  const handleNameClick = (r) => {
    const dest = tab === 'vendedor' ? `/vendedor?v=${r.navId}` : `/tienda?v=${r.navId}`;
    navigate(dest);
  };

  // Total venta across all rows (for participation %)
  const totalVenta = allRows.reduce((s, r) => s + r.venta, 0);

  // Map virtual col keys to actual row fields for sorting
  const sortVal = (r, col) => {
    if (col === 'cumpl')    return r.pct;
    if (col === 'dif')      return r.venta - r.meta;
    if (col === 'progreso') return r.pct;
    if (col === 'part')     return totalVenta > 0 ? r.venta / totalVenta : 0;
    if (col === 'ant')      return r.ventaAnt || 0;
    if (col === 'crec')     return r.ventaAnt ? (r.venta - r.ventaAnt) / r.ventaAnt : 0;
    return typeof r[col] === 'string' ? r[col].toLowerCase() : r[col];
  };

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? allRows.filter(r => r.nombre.toLowerCase().includes(q)) : allRows;
    return [...filtered].sort((a, b) => {
      const av = sortVal(a, sortCol);
      const bv = sortVal(b, sortCol);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRows, sortCol, sortDir, search]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const rows = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const sp = { sortCol, sortDir, onSort: handleSort };

  // For $ mode: show venta-meta delta with sign
  const fmtDelta = (r) => {
    const diff = r.venta - r.meta;
    const sign = diff >= 0 ? '+' : '';
    return `${sign}$${Math.abs(diff).toLocaleString()}`;
  };
  const deltaColor = (r) => r.venta >= r.meta ? DL.green : DL.red;

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: '16px', py: '10px', borderBottom: `1px solid ${DL.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH }}>{t('des.title.desempenio')}</Typography>
          <Typography sx={{ fontSize: 10, color: DL.tS, mt: '2px' }}>{t('des.ventaVsMeta')}</Typography>
        </Box>
        {/* Vista toggle: Mensual / Semanal */}
        <Box sx={{ display: 'flex', alignItems: 'center', background: 'rgba(26,26,26,.06)', borderRadius: '7px', p: '2px', gap: '1px', flexShrink: 0 }}>
          {[{ v: 'mensual', lKey: 'des.mensual' }, { v: 'semanal', lKey: 'des.semanal' }].map(o => (
            <Box
              key={o.v}
              component="button"
              onClick={() => { setVista(o.v); setPage(0); }}
              sx={{
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                fontSize: 9, fontWeight: 500,
                px: '10px', py: '4px', borderRadius: '5px', border: 'none', cursor: 'pointer',
                background: vista === o.v ? '#fff' : 'transparent',
                color: vista === o.v ? DL.navy : DL.tS,
                boxShadow: vista === o.v ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                transition: 'all .14s', whiteSpace: 'nowrap',
              }}
            >
              {t(o.lKey)}
            </Box>
          ))}
        </Box>

        {/* Search box */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${DL.border2}`, borderRadius: '7px', px: '8px', py: '4px', background: '#fff', '&:focus-within': { borderColor: DL.blue } }}>
          <SearchIcon sx={{ fontSize: 13, color: DL.tS, flexShrink: 0 }} />
          <Box
            component="input"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder={t('btn.search')}
            sx={{ border: 'none', outline: 'none', fontSize: 10, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", color: DL.tH, background: 'transparent', width: 100, '&::placeholder': { color: DL.tS } }}
          />
        </Box>
        {/* Columnas picker */}
        <Box ref={pickerRef} sx={{ position: 'relative' }}>
          <Box component="button" onClick={() => setColPickerOpen(o => !o)} sx={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500,
            px: '10px', py: '5px', borderRadius: '7px',
            border: `1px solid ${colPickerOpen ? DL.blue : DL.border2}`,
            background: colPickerOpen ? 'rgba(84,126,105,.06)' : '#fff',
            color: colPickerOpen ? DL.blue : DL.tM, cursor: 'pointer',
            transition: 'all .14s',
          }}>
            <ColsIcon sx={{ fontSize: 12 }} />
            {t('btn.columns')}
          </Box>
          {colPickerOpen && (
            <ColPickerPopover cols={cols} setCols={setCols} onClose={() => setColPickerOpen(false)} />
          )}
        </Box>
      </Box>
      {/* Tabs */}
      <Box sx={{ display: 'flex', borderBottom: `1px solid ${DL.border}`, px: '8px', pt: '4px', flexShrink: 0 }}>
        <TabBtn label={t('des.tab.vendedor')} active={tab === 'vendedor'} onClick={() => handleTab('vendedor')} />
        <TabBtn label={t('des.tab.sucursal')} active={tab === 'sucursal'} onClick={() => handleTab('sucursal')} />
      </Box>
      {/* Table — fills remaining height, padded so it doesn't reach edges */}
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, p: '12px 16px 0' }}>
        <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden', mb: '12px' }}>

        {/* ── SEMANAL TABLE ──────────────────────────────────────────── */}
        {vista === 'semanal' && (() => {
          const SEM_LABELS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
          const thSx = { fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.07em', color: DL.tS, background: 'rgba(26,26,26,.025)', borderBottom: '2px solid rgba(26,26,26,.08)', px: '10px', py: '8px' };

          // flipped state lives in PerformanceCard to avoid hook-in-IIFE violation

          // Bubble cell for a week — click % to reveal $año anterior
          const SemBubble = ({ s, flipKey }) => {
            const isFlipped = flipped.has(flipKey);
            const { bg, color } = heatCfg(s.pct);
            const crecPct = s.ant ? ((s.venta - s.ant) / s.ant) * 100 : null;
            const up = crecPct !== null && crecPct >= 0;
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                {/* Bubble — toggles between % and $ant on click */}
                <Box
                  onClick={() => s.ant && toggleFlip(flipKey)}
                  sx={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    px: '8px', py: '4px', borderRadius: '3px', minWidth: 52,
                    background: isFlipped ? 'rgba(26,26,26,.09)' : bg,
                    cursor: s.ant ? 'pointer' : 'default',
                    transition: 'background .15s',
                    '&:hover': s.ant ? { opacity: 0.85 } : {},
                  }}
                >
                  {isFlipped
                    ? <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.navy, lineHeight: 1.4 }}>${(s.ant / 1000).toFixed(1)}k</Typography>
                    : <Typography sx={{ fontSize: 11, fontWeight: 500, color, lineHeight: 1.4 }}>{s.pct}%</Typography>
                  }
                </Box>
                {/* $venta · vs YoY — same line */}
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tM }}>${(s.venta / 1000).toFixed(1)}k</Typography>
                  {crecPct !== null && (
                    <Typography sx={{ fontSize: 8, fontWeight: 500, color: up ? DL.green : DL.red }}>
                      {up ? '+' : ''}{crecPct.toFixed(1)}%
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          };
          return (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...thSx, width: 44, textAlign: 'center' }}>#</TableCell>
                  <TableCell sx={{ ...thSx, minWidth: 150 }}>{dimLabel}</TableCell>
                  {SEM_LABELS.map((l, i) => (
                    <TableCell key={i} sx={{ ...thSx, textAlign: 'center', minWidth: 90 }}>{l}</TableCell>
                  ))}
                  <TableCell sx={{ ...thSx, textAlign: 'center', minWidth: 80, borderLeft: `1px solid rgba(26,26,26,.08)`, background: 'rgba(26,26,26,.05)', color: DL.tH }}>
                    {t('des.col.acum')}
                  </TableCell>
                  <TableCell sx={{ ...thSx, textAlign: 'right', minWidth: 80 }}>{t('des.col.estado')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(r => {
                  const rc = RANK_COLORS[r.rank - 1] || DL.tS;
                  const acum = r.pct;
                  const { bg: acBg, color: acColor } = heatCfg(acum);
                  return (
                    <TableRow key={r.rank} sx={{ height: 58, borderBottom: '1px solid rgba(26,26,26,.05)', '&:hover': { background: 'rgba(84,126,105,.02)' } }}>
                      <TableCell sx={{ px: '10px', textAlign: 'center', py: 0 }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', mx: 'auto', background: r.rank <= 3 ? `${rc}22` : 'rgba(26,26,26,.05)', border: r.rank <= 3 ? `1.5px solid ${rc}` : `1px solid rgba(26,26,26,.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: 10, fontWeight: 500, color: r.rank <= 3 ? rc : DL.tS }}>{r.rank}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ px: '10px', py: 0 }}>
                        <Typography onClick={() => handleNameClick(r)} sx={{ fontSize: 12, fontWeight: 500, color: DL.blue, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                          {r.nombre}
                        </Typography>
                      </TableCell>
                      {r.semanas.map((s, i) => (
                        <TableCell key={i} sx={{ textAlign: 'center', px: '6px', py: 0 }}>
                          <SemBubble s={s} flipKey={`${r.rank}-${i}`} />
                        </TableCell>
                      ))}
                      <TableCell sx={{ textAlign: 'center', px: '6px', py: 0, borderLeft: `1px solid rgba(26,26,26,.07)` }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', px: '8px', py: '4px', borderRadius: '3px', background: acBg, minWidth: 48, border: '1px solid rgba(255,255,255,.5)' }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 500, color: acColor }}>{acum}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ px: '10px', py: 0, textAlign: 'right' }}>
                        <EstadoBadge pct={r.pct} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Footer: team average per week */}
                <TableRow sx={{ borderTop: '2px solid rgba(26,26,26,.08)', background: 'rgba(26,26,26,.018)' }}>
                  <TableCell colSpan={2} sx={{ px: '10px', py: '7px', fontSize: 10, fontWeight: 500, color: DL.tH, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {t('lbl.promEquipo')}
                  </TableCell>
                  {[0,1,2,3].map(i => {
                    const avg = Math.round(rows.reduce((s, r) => s + r.semanas[i].pct, 0) / rows.length);
                    const { bg, color } = heatCfg(avg);
                    return (
                      <TableCell key={i} sx={{ textAlign: 'center', px: '6px', py: '7px' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', px: '8px', py: '4px', borderRadius: '3px', background: bg, minWidth: 48 }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 500, color }}>{avg}%</Typography>
                        </Box>
                      </TableCell>
                    );
                  })}
                  <TableCell colSpan={2} sx={{ borderLeft: `1px solid rgba(26,26,26,.07)` }} />
                </TableRow>
              </TableBody>
            </Table>
          );
        })()}

        {/* ── MENSUAL TABLE (default) ────────────────────────────────── */}
        {vista === 'mensual' && <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {visCols.map(c => {
                const thSx = { fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.07em', color: DL.tS, background: 'rgba(26,26,26,.025)', borderBottom: '2px solid rgba(26,26,26,.08)', px: '10px', py: '8px' };
                if (c.key === 'rank')     return <TableCell key="rank"    sx={{ ...thSx, textAlign: 'center', width: 44 }}>#</TableCell>;
                if (c.key === 'nombre')   return <SortTH key="nombre"  label={dimLabel}               col="nombre"  align="left"  {...sp} />;
                if (c.key === 'meta')     return <SortTH key="meta"    label={t('lbl.meta')}           col="meta"    align="right" {...sp} />;
                if (c.key === 'venta')    return <SortTH key="venta"   label={t('des.col.ventaAct')}   col="venta"   align="right" {...sp} />;
                if (c.key === 'cumpl')    return <SortTH key="cumpl"   label={t('des.col.cumplPct')}   col="cumpl"   align="right" {...sp} />;
                if (c.key === 'dif')      return <SortTH key="dif"     label={t('des.col.diferencia')} col="dif"     align="right" {...sp} />;
                if (c.key === 'part')     return <SortTH key="part"    label={t('des.col.pctRepr')}    col="part"    align="right" {...sp} />;
                if (c.key === 'ant')      return <SortTH key="ant"     label={t('des.col.anioAnt')}    col="ant"     align="right" {...sp} />;
                if (c.key === 'crec')     return <SortTH key="crec"    label={t('des.col.pctCrec')}    col="crec"    align="right" {...sp} />;
                if (c.key === 'progreso') return <TableCell key="prog"  sx={{ ...thSx, minWidth: 130 }}>{t('des.col.progreso')}</TableCell>;
                if (c.key === 'estado')   return <SortTH key="estado"  label={t('des.col.estado')}         col="estado"  align="right" {...sp} />;
                return null;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => {
              const bc = barColor(r.pct);
              const rc = RANK_COLORS[r.rank - 1] || DL.tS;
              return (
                <TableRow key={r.rank} sx={{ height: 44, borderBottom: '1px solid rgba(26,26,26,.05)', '&:hover': { background: 'rgba(84,126,105,.025)' } }}>
                  {visCols.map(c => {
                    if (c.key === 'rank') return (
                      <TableCell key="rank" sx={{ px: '10px', textAlign: 'center', py: 0 }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', mx: 'auto', background: r.rank <= 3 ? `${rc}22` : 'rgba(26,26,26,.05)', border: r.rank <= 3 ? `1.5px solid ${rc}` : `1px solid rgba(26,26,26,.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: 10, fontWeight: 500, color: r.rank <= 3 ? rc : DL.tS }}>{r.rank}</Typography>
                        </Box>
                      </TableCell>
                    );
                    if (c.key === 'nombre') {
                      const partPct = totalVenta > 0 ? (r.venta / totalVenta) * 100 : 0;
                      return (
                        <TableCell key="nombre" sx={{ px: '10px', py: '4px' }}>
                          <Typography
                            onClick={() => handleNameClick(r)}
                            sx={{ fontSize: 12, fontWeight: 500, color: DL.blue, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {r.nombre}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '3px' }}>
                            <Box sx={{ flex: 1, height: 4, background: '#e3e3e3', borderRadius: 2, overflow: 'hidden' }}>
                              <Box sx={{ height: '100%', width: `${partPct}%`, background: DL.blue, borderRadius: 2, transition: 'width .6s ease' }} />
                            </Box>
                            <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, whiteSpace: 'nowrap' }}>{partPct.toFixed(1)}%</Typography>
                          </Box>
                        </TableCell>
                      );
                    }
                    if (c.key === 'meta')     return <TableCell key="meta"    sx={{ fontSize: 11, color: DL.tM, px: '10px', py: 0, textAlign: 'right' }}>{fmtK(r.meta)}</TableCell>;
                    if (c.key === 'venta')    return <TableCell key="venta"   sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, px: '10px', py: 0, textAlign: 'right' }}>${r.venta.toLocaleString()}</TableCell>;
                    if (c.key === 'cumpl')    return <TableCell key="cumpl"   sx={{ fontSize: 12, fontWeight: 500, px: '10px', py: 0, textAlign: 'right', color: bc }}>{r.pct}%</TableCell>;
                    if (c.key === 'dif')  return <TableCell key="dif"  sx={{ fontSize: 11, fontWeight: 500, px: '10px', py: 0, textAlign: 'right', color: deltaColor(r) }}>{fmtDelta(r)}</TableCell>;
                    if (c.key === 'part') {
                      const pct = totalVenta > 0 ? (r.venta / totalVenta) * 100 : 0;
                      return (
                        <TableCell key="part" sx={{ px: '10px', py: 0, textAlign: 'right' }}>
                          <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{pct.toFixed(1)}%</Typography>
                            <Box sx={{ width: 50, height: 3, background: '#e3e3e3', borderRadius: 2, overflow: 'hidden' }}>
                              <Box sx={{ height: '100%', width: `${pct}%`, background: DL.blue, borderRadius: 2 }} />
                            </Box>
                          </Box>
                        </TableCell>
                      );
                    }
                    if (c.key === 'ant') return (
                      <TableCell key="ant" sx={{ fontSize: 11, color: DL.tM, px: '10px', py: 0, textAlign: 'right' }}>
                        ${(r.ventaAnt || 0).toLocaleString()}
                      </TableCell>
                    );
                    if (c.key === 'crec') {
                      const crec = r.ventaAnt ? ((r.venta - r.ventaAnt) / r.ventaAnt) * 100 : 0;
                      const up = crec >= 0;
                      return (
                        <TableCell key="crec" sx={{ px: '10px', py: 0, textAlign: 'right' }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '2px', px: '6px', py: '2px', borderRadius: '4px', background: up ? DL.greenBg : DL.redBg }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 500, color: up ? DL.green : DL.red }}>
                              {up ? '+' : ''}{crec.toFixed(1)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      );
                    }
                    if (c.key === 'progreso') return (
                      <TableCell key="prog" sx={{ px: '10px', py: 0 }}>
                        <Box sx={{ height: 6, background: '#e3e3e3', borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${Math.min(r.pct, 100)}%`, background: bc, borderRadius: 3, transition: 'width .6s ease' }} />
                        </Box>
                      </TableCell>
                    );
                    if (c.key === 'estado')   return <TableCell key="estado"  sx={{ px: '10px', py: 0, textAlign: 'right' }}><EstadoBadge pct={r.pct} /></TableCell>;
                    return null;
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>}
        </Box>{/* end bordered wrapper */}
      </Box>

      {/* Footer — rows per page + pagination */}
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: '16px', py: '8px', borderTop: `1px solid ${DL.border}`, gap: '12px', flexWrap: 'wrap' }}>

        {/* Left: rows-per-page selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography sx={{ fontSize: 9, color: DL.tS, whiteSpace: 'nowrap' }}>{t('des.filasXPagina')}</Typography>
          <Box sx={{ display: 'flex', gap: '3px' }}>
            {PAGE_SIZE_OPTS.map(n => (
              <Box
                key={n}
                component="button"
                onClick={() => { setPageSize(n); setPage(0); }}
                sx={{
                  minWidth: 28, height: 22, borderRadius: '5px', px: '5px',
                  border: `1px solid ${pageSize === n ? DL.blue : DL.border2}`,
                  background: pageSize === n ? DL.blue : '#fff',
                  color: pageSize === n ? '#fff' : DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 9, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .12s',
                  '&:hover': { borderColor: DL.blue, color: pageSize === n ? '#fff' : DL.blue },
                }}
              >
                {n}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right: record count + page buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography sx={{ fontSize: 9, color: DL.tS, whiteSpace: 'nowrap' }}>
            {sorted.length === 0 ? t('des.sinResultados') : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, sorted.length)} ${t('des.de')} ${sorted.length}`}
          </Typography>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <Box
                  key={i}
                  component="button"
                  onClick={() => setPage(i)}
                  sx={{
                    minWidth: 24, height: 24, borderRadius: '5px', px: '4px',
                    border: `1px solid ${i === page ? DL.blue : DL.border2}`,
                    background: i === page ? DL.blue : '#fff',
                    color: i === page ? '#fff' : DL.tM,
                    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 9, fontWeight: 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .12s',
                    '&:hover': { borderColor: DL.blue, color: i === page ? '#fff' : DL.blue },
                  }}
                >
                  {i + 1}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}

// ─── Alertas Panel ────────────────────────────────────────────────────────────
function AlertasCard() {
  const { t } = useT();
  const [filter, setFilter] = useState('todos');
  const shown =
    filter === 'criticos'  ? ALERTAS.filter(a => a.type === 'r') :
    filter === 'atencion'  ? ALERTAS.filter(a => a.type === 'y') :
    filter === 'positivos' ? ALERTAS.filter(a => a.type === 'g') :
    ALERTAS;

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: '14px', py: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${DL.border}`, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH }}>{t('sec.alertas')}</Typography>
        <Box component="select" value={filter} onChange={e => setFilter(e.target.value)} sx={{ fontSize: 10, fontWeight: 500, color: '#3f3f3f', border: `1px solid ${DL.border2}`, borderRadius: '6px', px: '7px', py: '3px', background: '#fff', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", cursor: 'pointer', outline: 'none' }}>
          <option value="todos">{t('alert.todos')}</option>
          <option value="criticos">{t('alert.criticos')}</option>
          <option value="atencion">{t('alert.atencion')}</option>
          <option value="positivos">{t('alert.positivos')}</option>
        </Box>
      </Box>
      <Box sx={{ p: '6px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
        {shown.map((a, i) => {
          const c = ALERT_C[a.type];
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '6px', p: '5px 8px', borderRadius: '6px', borderLeft: `2px solid ${c.border}`, background: c.bg }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: c.iconBg, color: c.iconColor, border: `1px solid ${c.iconBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 500 }}>
                {c.icon}
              </Box>
              <Typography sx={{ fontSize: 9, color: DL.tM, lineHeight: 1.35, fontWeight: 500 }}>
                {a.title ? <><strong>{a.title}</strong> — {a.msg}</> : a.msg}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────
const HEAT_MODE_IDS = ['pct', 'monto', 'part'];

function HeatmapCard() {
  const { t } = useT();
  const navigate = useNavigate();
  const [tab,     setTab]     = useState('vendedor');
  const [sortCol, setSortCol] = useState('total');
  const [sortDir, setSortDir] = useState('desc');
  const [valMode, setValMode] = useState('pct'); // 'pct' | 'monto' | 'part'

  const allRows  = tab === 'vendedor' ? HEAT_VEND : HEAT_SUC;
  const dimLabel = tab === 'vendedor' ? t('des.tab.vendedor') : t('des.tab.sucursal');
  const n        = allRows.length;

  // Column $ sums (for participation %)
  const colSums   = useMemo(() => MESES.map((_, mi) => allRows.reduce((s, r) => s + r.ventas[mi], 0)), [allRows]);
  const grandTotal = useMemo(() => allRows.reduce((s, r) => s + r.ventas.reduce((ss, v) => ss + v, 0), 0), [allRows]);
  const equalShare = 100 / n; // fair % if everyone sold the same

  // --- per-cell helpers ---
  const cellVal = (r, mi) => {
    if (valMode === 'pct')   return r.meses[mi];
    if (valMode === 'monto') return r.ventas[mi];
    return colSums[mi] > 0 ? (r.ventas[mi] / colSums[mi]) * 100 : 0;
  };
  const cellFmt = (val) => {
    if (valMode === 'pct')   return `${val}%`;
    if (valMode === 'monto') return fmtK(val);
    return `${val.toFixed(1)}%`;
  };
  const cellCfg = (r, mi) => {
    if (valMode === 'pct')   return heatCfg(r.meses[mi]);
    if (valMode === 'monto') return heatCfg(r.meses[mi]); // color still driven by % cumpl
    const part = colSums[mi] > 0 ? (r.ventas[mi] / colSums[mi]) * 100 : 0;
    return heatCfg((part / equalShare) * 100); // normalise so equalShare = 100
  };

  // --- total column helpers ---
  const totalVal = (r) => {
    if (valMode === 'pct')   return r.total;
    if (valMode === 'monto') return r.ventas.reduce((s, v) => s + v, 0);
    return grandTotal > 0 ? (r.ventas.reduce((s, v) => s + v, 0) / grandTotal) * 100 : 0;
  };
  const totalFmt = (val) => {
    if (valMode === 'pct')   return `${val}%`;
    if (valMode === 'monto') return fmtK(val);
    return `${val.toFixed(1)}%`;
  };
  const totalCfg = (r) => {
    if (valMode === 'pct')   return heatCfg(r.total);
    if (valMode === 'monto') return heatCfg(r.total);
    const part = grandTotal > 0 ? (r.ventas.reduce((s, v) => s + v, 0) / grandTotal) * 100 : 0;
    return heatCfg((part / equalShare) * 100);
  };

  // --- sort ---
  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const sorted = useMemo(() => {
    return [...allRows].sort((a, b) => {
      let av, bv;
      if (sortCol === 'nombre') {
        av = a.nombre.toLowerCase(); bv = b.nombre.toLowerCase();
      } else if (sortCol === 'total') {
        av = totalVal(a); bv = totalVal(b);
      } else {
        const mi = Number(sortCol);
        av = cellVal(a, mi); bv = cellVal(b, mi);
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRows, sortCol, sortDir, valMode, colSums, grandTotal]);

  // --- footer (Promedio / Equi-parte) ---
  const footerLabel = valMode === 'part' ? t('des.equiparte') : t('des.promedio');
  const footerMonthVals = MESES.map((_, mi) => {
    if (valMode === 'pct')   return Math.round(allRows.reduce((s, r) => s + r.meses[mi], 0) / n);
    if (valMode === 'monto') return Math.round(allRows.reduce((s, r) => s + r.ventas[mi], 0) / n);
    return equalShare; // all equal in participation
  });
  const footerTotalVal = (() => {
    if (valMode === 'pct')   return Math.round(allRows.reduce((s, r) => s + r.total, 0) / n);
    if (valMode === 'monto') return Math.round(allRows.reduce((s, r) => s + r.ventas.reduce((ss, v) => ss + v, 0), 0) / n);
    return equalShare;
  })();
  const footerFmt = (val) => {
    if (valMode === 'pct')   return `${val}%`;
    if (valMode === 'monto') return fmtK(val);
    return `${Number(val).toFixed(1)}%`;
  };
  const footerCfg = (val) => {
    if (valMode === 'part') return heatCfg(100); // equal share = perfectly on target
    return heatCfg(val);
  };

  const handleHeatNameClick = (r) => {
    const dest = tab === 'vendedor' ? `/vendedor?v=${r.navId}` : `/tienda?v=${r.navId}`;
    navigate(dest);
  };

  const hSp = { sortCol, sortDir, onSort: handleSort };
  const TH_HEAT = { fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.07em', color: DL.tS, background: 'rgba(26,26,26,.025)', borderBottom: '2px solid rgba(26,26,26,.08)', py: '8px' };

  const SUBTITLE = {
    pct:   t('des.heat.subtitlePct'),
    monto: t('des.heat.subtitleMonto'),
    part:  t('des.heat.subtitlePart'),
  };

  return (
    <Card>
      {/* Header */}
      <Box sx={{ px: '16px', py: '10px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH }}>{t('des.heat.title')}</Typography>
          <Typography sx={{ fontSize: 10, color: DL.tS, mt: '2px' }}>{SUBTITLE[valMode]}</Typography>
        </Box>
        {/* 3-mode segmented toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, background: 'rgba(26,26,26,.06)', borderRadius: '8px', p: '3px', gap: '2px' }}>
          {HEAT_MODE_IDS.map(id => {
            const heatLabel = id === 'pct' ? t('des.heat.cumpl') : id === 'monto' ? t('des.heat.monto') : t('des.heat.pctPart');
            return (
            <Box
              key={id}
              component="button"
              onClick={() => setValMode(id)}
              sx={{
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                fontSize: 9, fontWeight: 500,
                px: '10px', py: '5px',
                borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: valMode === id ? '#fff' : 'transparent',
                color: valMode === id ? DL.navy : DL.tS,
                boxShadow: valMode === id ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
                transition: 'all .15s', whiteSpace: 'nowrap',
                '&:hover': valMode !== id ? { color: DL.tM } : {},
              }}
            >
              {heatLabel}
            </Box>
            );
          })}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: 'flex', borderBottom: `1px solid ${DL.border}`, px: '8px', pt: '4px' }}>
        <TabBtn label={t('des.tab.vendedor')} active={tab === 'vendedor'} onClick={() => { setTab('vendedor'); setSortCol('total'); setSortDir('desc'); }} />
        <TabBtn label={t('des.tab.sucursal')} active={tab === 'sucursal'} onClick={() => { setTab('sucursal'); setSortCol('total'); setSortDir('desc'); }} />
      </Box>

      {/* Padded table container — doesn't reach edges */}
      <Box sx={{ p: '12px 16px 16px' }}>
        <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <SortTH label={dimLabel} col="nombre" align="left" {...hSp} sx={{ ...TH_HEAT, px: '14px', minWidth: 150 }} />
                  {MESES.map((m, mi) => (
                    <SortTH key={m} label={m} col={String(mi)} align="center" {...hSp} sx={{ ...TH_HEAT, px: '20px', textAlign: 'center' }} />
                  ))}
                  <SortTH label={t('des.total')} col="total" align="center" {...hSp} sx={{ ...TH_HEAT, px: '20px', textAlign: 'center', background: 'rgba(26,26,26,.05)', color: sortCol === 'total' ? DL.blue : DL.tH, borderLeft: `1px solid rgba(26,26,26,.08)` }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.map((r) => (
                  <TableRow key={r.nombre} sx={{ borderBottom: '1px solid rgba(26,26,26,.04)', '&:hover': { background: 'rgba(84,126,105,.02)' } }}>
                    {/* Clickable name cell */}
                    <TableCell sx={{ px: '14px', py: '6px', whiteSpace: 'nowrap' }}>
                      <Typography
                        onClick={() => handleHeatNameClick(r)}
                        sx={{ fontSize: 11, fontWeight: 500, color: DL.blue, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {r.nombre}
                      </Typography>
                    </TableCell>
                    {/* Month cells — same style as Vendedor heatmap */}
                    {MESES.map((_, mi) => {
                      const { bg, color } = cellCfg(r, mi);
                      return (
                        <TableCell key={mi} sx={{ textAlign: 'center', px: '4px', py: '9px', background: bg, border: '1px solid rgba(255,255,255,.5)', verticalAlign: 'middle' }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 500, color, lineHeight: 1.4 }}>{cellFmt(cellVal(r, mi))}</Typography>
                        </TableCell>
                      );
                    })}
                    {/* Total cell */}
                    {(() => {
                      const tv = totalVal(r);
                      const { bg, color } = totalCfg(r);
                      return (
                        <TableCell sx={{ textAlign: 'center', px: '4px', py: '9px', borderLeft: `3px solid rgba(26,26,26,.2)`, background: bg, border: '1px solid rgba(255,255,255,.5)', verticalAlign: 'middle' }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 500, color, lineHeight: 1.4 }}>{totalFmt(tv)}</Typography>
                        </TableCell>
                      );
                    })()}
                  </TableRow>
                ))}

                {/* Footer row — same style as Vendedor total row */}
                <TableRow sx={{ borderTop: `2px solid rgba(26,26,26,.1)` }}>
                  <TableCell sx={{ fontSize: 9, fontWeight: 500, color: DL.navy, px: '14px', py: '8px', textTransform: 'uppercase', letterSpacing: '.05em', background: 'rgba(26,26,26,.03)' }}>
                    {footerLabel}
                  </TableCell>
                  {footerMonthVals.map((val, mi) => {
                    const { bg, color } = footerCfg(val);
                    return (
                      <TableCell key={mi} sx={{ textAlign: 'center', px: '4px', py: '8px', background: bg, border: '1px solid rgba(26,26,26,.08)', verticalAlign: 'middle' }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color, lineHeight: 1.4 }}>{footerFmt(val)}</Typography>
                      </TableCell>
                    );
                  })}
                  {(() => {
                    const { bg, color } = footerCfg(footerTotalVal);
                    return (
                      <TableCell sx={{ textAlign: 'center', px: '4px', py: '8px', borderLeft: `3px solid rgba(26,26,26,.2)`, background: bg, border: '1px solid rgba(26,26,26,.08)', verticalAlign: 'middle' }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color, lineHeight: 1.4 }}>{footerFmt(footerTotalVal)}</Typography>
                      </TableCell>
                    );
                  })()}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Desempeno() {
  const { t } = useT();
  const [ano,      setAno]      = useState('2026');
  const [mes,      setMes]      = useState('todos');
  const [sucursal, setSucursal] = useState('todas');
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);

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

    // KPIs de Desempeño
    const kpiRows = KPIS_DATA.map(k => ({
      KPI: k.id,
      Valor: k.value,
      Meta: k.meta,
      '% de Meta': k.pct + '%',
      'vs Año Ant.': k.delta,
    }));
    const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
    autoWidth(wsKpi);
    XLSX.utils.book_append_sheet(wb, wsKpi, 'KPIs Desempeño');

    // Rendimiento Vendedores
    const vendRows = PERF_VEND.map(v => ({
      Rank: v.rank,
      Vendedor: v.nombre,
      'Meta $': v.meta,
      'Venta $': v.venta,
      'Venta Anterior $': v.ventaAnt,
      '% Cumplimiento': v.pct,
      Estado: v.estado,
    }));
    const wsVend = XLSX.utils.json_to_sheet(vendRows);
    autoWidth(wsVend);
    XLSX.utils.book_append_sheet(wb, wsVend, 'Vendedores');

    // Rendimiento Sucursales
    const sucRows = PERF_SUC.map(s => ({
      Rank: s.rank,
      Sucursal: s.nombre,
      'Meta $': s.meta,
      'Venta $': s.venta,
      'Venta Anterior $': s.ventaAnt,
      '% Cumplimiento': s.pct,
      Estado: s.estado,
    }));
    const wsSuc = XLSX.utils.json_to_sheet(sucRows);
    autoWidth(wsSuc);
    XLSX.utils.book_append_sheet(wb, wsSuc, 'Sucursales');

    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    XLSX.writeFile(wb, `Desempeno_${stamp}.xlsx`);
  }

  return (
    <Box>
      <PageHeader title={t('page.desempeno')} live={true} onRefresh={handleRefresh} onExport={exportToExcel}>
        <MiniSelect label={t('lbl.anio')} value={ano} onChange={setAno} minWidth={80} options={[
          { value: '2026', label: '2026' },
          { value: '2025', label: '2025' },
          { value: '2024', label: '2024' },
        ]} />
        <MiniSelect label={t('time.mes')} value={mes} onChange={setMes} options={[
          { value: 'todos', label: t('filter.todos')        },
          { value: '01', label: t('month.enero')      },
          { value: '02', label: t('month.febrero')    },
          { value: '03', label: t('month.marzo')      },
          { value: '04', label: t('month.abril')      },
          { value: '05', label: t('month.mayo')       },
          { value: '06', label: t('month.junio')      },
          { value: '07', label: t('month.julio')      },
          { value: '08', label: t('month.agosto')     },
          { value: '09', label: t('month.septiembre') },
          { value: '10', label: t('month.octubre')    },
          { value: '11', label: t('month.noviembre')  },
          { value: '12', label: t('month.diciembre')  },
        ]} />
        <MiniSelect label={t('des.tab.sucursal')} value={sucursal} onChange={setSucursal} options={[
          { value: 'todas',        label: t('filter.todas')  },
          { value: 'san-benito',   label: 'San Benito'       },
          { value: 'peten-centro', label: 'Petén Centro'     },
          { value: 'santa-elena',  label: 'Santa Elena'      },
          { value: 'flores',       label: 'Flores'           },
          { value: 'sayaxche',     label: 'Sayaxché'         },
        ]} />
      </PageHeader>

      <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* KPI Row */}
        <KpiRow />

        {/* Performance + Alertas — stretch to same height */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '12px', alignItems: 'stretch' }}>
          <PerformanceCard />
          <AlertasCard />
        </Box>

        {/* Heatmap */}
        <HeatmapCard />

      </Box>
    </Box>
  );
}
