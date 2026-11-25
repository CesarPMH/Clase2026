// ─── Dashboard Cuentas por Pagar (CxP) ───────────────────────────────────────
// Objetivo: Monitorear obligaciones con proveedores, vencimientos y DPO.
// UI: MUI (sx only) · Charts: Apache ECharts (echarts-for-react) · Font: Inter

import { useState, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography, Paper } from '@mui/material';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import SectionHeader from '../components/common/SectionHeader';
import { useT } from '../i18n/LanguageContext';
import { DL } from '../theme';
import {
  CXP_KPIS,
  CXP_AGING,
  TOP_PROVEEDORES,
  PROXIMOS_PAGOS,
  PAGOS_TREND,
  ALERTAS_CXP,
} from '../data/cxp';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt$ = v => {
  if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
  if (Math.abs(v) >= 1000)    return `$${(v / 1000).toFixed(1)}K`;
  return `$${v}`;
};
const pctChange = (cur, prev) =>
  prev !== 0 ? +((( cur - prev) / Math.abs(prev)) * 100).toFixed(1) : 0;

// ─── DeltaBadge ───────────────────────────────────────────────────────────────
function DeltaBadge({ value, size = 9 }) {
  const up = value >= 0;
  return (
    <Box sx={{
      display: 'inline-block', px: '5px', py: '1px',
      borderRadius: '4px', fontSize: size, fontWeight: 500,
      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      background: up ? DL.greenBg : DL.redBg,
      color: up ? DL.green : DL.red,
    }}>
      {up ? '+' : ''}{value}%
    </Box>
  );
}

// ─── CxpKpiCard ───────────────────────────────────────────────────────────────
function CxpKpiCard({ label, value, meta, ant, pct, isRisk, displayVal }) {
  const { t } = useT();
  const barColor = isRisk
    ? (pct <= 50 ? DL.green : pct <= 75 ? DL.yellow : DL.red)
    : (pct >= 100 ? DL.green : pct >= 75 ? DL.yellow : DL.red);
  const delta = pctChange(value, ant);
  const barW = Math.min(pct, 100);

  return (
    <Box sx={{
      background: '#fff', borderRadius: '10px',
      border: `1px solid ${DL.border}`, boxShadow: DL.e1,
      p: '12px 13px 10px', position: 'relative', overflow: 'hidden',
      flex: 1, display: 'flex', flexDirection: 'column',
      transition: 'box-shadow .2s, transform .2s',
      '&:hover': { boxShadow: DL.e2, transform: 'translateY(-1px)' },
    }}>
      {/* Accent strip */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '10px 10px 0 0', background: barColor }} />

      {/* Label */}
      <Typography sx={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: DL.tS, mb: '5px', mt: '3px', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
        {label}
      </Typography>

      {/* Value */}
      <Typography sx={{ fontSize: 20, fontWeight: 500, color: DL.tH, lineHeight: 1.05, letterSpacing: '-0.04em', pb: '3px', mb: '3px', borderBottom: '1px solid rgba(26,26,26,.08)', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
        {displayVal !== undefined ? displayVal : fmt$(value)}
      </Typography>

      {/* Meta row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '4px' }}>
        <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>{t('lbl.meta')}</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
          {displayVal !== undefined ? (typeof meta === 'number' && meta > 99 ? fmt$(meta) : meta) : fmt$(meta)}
        </Typography>
      </Box>

      {/* Progress bar */}
      <Box sx={{ height: 9, background: 'rgba(26,26,26,.07)', borderRadius: 5, overflow: 'hidden', mb: '5px' }}>
        <Box sx={{ height: '100%', borderRadius: 5, width: `${barW}%`, background: barColor, transition: 'width .6s ease' }} />
      </Box>

      {/* % de meta */}
      <Typography sx={{ fontSize: 9, fontWeight: 500, color: barColor, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
        {pct.toFixed(0)}% {t('lbl.deMeta')}
      </Typography>

      {/* VS AÑO ANT. */}
      <Box sx={{ mt: '6px', p: '4px 8px', background: DL.subtle, borderRadius: '5px', display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>{t('lbl.vsAnioAnt')}</Typography>
        <Typography sx={{ fontSize: 9, fontWeight: 500, color: delta >= 0 ? DL.green : DL.red, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
          {delta >= 0 ? '+' : ''}{delta}%
        </Typography>
      </Box>
    </Box>
  );
}

// ─── AlertasCxp ───────────────────────────────────────────────────────────────
const TIER_CFG = {
  r: { bg: DL.redBg,    bd: DL.redBd,    icon: '▲', color: DL.red    },
  y: { bg: DL.yellowBg, bd: DL.yellowBd, icon: '△', color: DL.yellow },
  g: { bg: DL.greenBg,  bd: DL.greenBd,  icon: '✓', color: DL.green  },
};

function AlertasCxp() {
  const { t } = useT();
  const [filter, setFilter] = useState('todos');
  const rows = filter === 'todos' ? ALERTAS_CXP : ALERTAS_CXP.filter(a => a.tier === filter);

  return (
    <Box sx={{
      border: `1px solid ${DL.border}`, borderRadius: '10px',
      overflow: 'hidden', background: '#fff',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Header */}
      <Box sx={{
        px: '12px', py: '8px', borderBottom: `1px solid ${DL.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: DL.subtle,
      }}>
        <Typography sx={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.09em', color: DL.tS, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
          {t('sec.alertas')}
        </Typography>
        <Box
          component="select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          sx={{
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            fontSize: 9, fontWeight: 500, color: DL.tH,
            background: '#fff', border: `1px solid ${DL.border2}`,
            borderRadius: '5px', padding: '3px 20px 3px 7px',
            outline: 'none', cursor: 'pointer', appearance: 'none',
          }}
        >
          <option value="todos">{t('alert.todos')}</option>
          <option value="r">{t('alert.criticas')}</option>
          <option value="y">{t('alert.atencion')}</option>
          <option value="g">{t('alert.oportunidades')}</option>
        </Box>
      </Box>

      {/* Alert rows */}
      <Box sx={{ p: '8px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {rows.map((a, i) => {
          const cfg = TIER_CFG[a.tier];
          return (
            <Box key={i} sx={{
              display: 'flex', alignItems: 'center', gap: '8px',
              px: '10px', py: '7px', borderRadius: '6px',
              background: cfg.bg, border: `1px solid ${cfg.bd}`,
            }}>
              <Box sx={{
                width: 18, height: 18, borderRadius: '50%',
                background: `${cfg.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Typography sx={{ fontSize: 9, color: cfg.color, fontWeight: 500, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                  {cfg.icon}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, lineHeight: 1.4, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                {a.msg}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── PagosTrendChart ──────────────────────────────────────────────────────────
function PagosTrendChart() {
  const { t } = useT();
  const option = {
    grid: { top: 16, right: 16, bottom: 28, left: 54, containLabel: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: DL.dark,
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 11 },
      formatter: params => {
        let str = `<b>${params[0].axisValue}</b><br/>`;
        params.forEach(p => {
          str += `${p.marker} ${p.seriesName}: <b>${fmt$(p.value)}</b><br/>`;
        });
        return str;
      },
    },
    xAxis: {
      type: 'category',
      data: PAGOS_TREND.meses,
      axisLine: { lineStyle: { color: DL.border2 } },
      axisTick: { show: false },
      axisLabel: { fontSize: 9, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", color: DL.tS, fontWeight: 500 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: DL.border, type: 'dashed' } },
      axisLabel: { fontSize: 8, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", color: DL.tS, fontWeight: 500, formatter: v => fmt$(v) },
    },
    series: [
      {
        name: t('chart.pagado'),
        type: 'line',
        smooth: true,
        symbol: 'circle', symbolSize: 6,
        data: PAGOS_TREND.pagado,
        lineStyle: { color: DL.blue, width: 2 },
        itemStyle: { color: DL.blue },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: DL.blue + '28' }, { offset: 1, color: DL.blue + '04' }] } },
      },
      {
        name: t('chart.facturasRecibidas'),
        type: 'line',
        smooth: true,
        symbol: 'circle', symbolSize: 6,
        data: PAGOS_TREND.facturas,
        lineStyle: { color: DL.navy, width: 2, type: 'dashed' },
        itemStyle: { color: DL.navy },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 220 }} />;
}

// ─── ProximosPagosTable ───────────────────────────────────────────────────────
const URGENCIA_CFG = {
  vencido: { bg: DL.redBg,    color: DL.red,    labelKey: 'cxp.urgencia.vencido' },
  hoy:     { bg: '#fff7ed',   color: '#ea580c', labelKey: 'cxp.urgencia.hoy'     },
  '7dias': { bg: DL.yellowBg, color: DL.yellow, labelKey: 'cxp.urgencia.7dias'   },
  '15dias':{ bg: DL.subtle,   color: DL.tM,     labelKey: 'cxp.urgencia.15dias'  },
};

function ProximosPagosTable() {
  const { t } = useT();
  // Summary chips
  const total7  = PROXIMOS_PAGOS.filter(p => p.urgencia === '7dias' || p.urgencia === 'hoy' || p.urgencia === 'vencido').reduce((s, p) => s + p.monto, 0);
  const total15 = PROXIMOS_PAGOS.filter(p => p.urgencia === '15dias').reduce((s, p) => s + p.monto, 0);
  const totalAll = PROXIMOS_PAGOS.reduce((s, p) => s + p.monto, 0);

  return (
    <Box>
      {/* Summary chips */}
      <Box sx={{ display: 'flex', gap: '6px', mb: '10px', flexWrap: 'wrap' }}>
        <Box sx={{ px: '10px', py: '4px', background: DL.redBg, border: `1px solid ${DL.redBd}`, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.red, textTransform: 'uppercase', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>{t('cxp.chips.vencidoHoy')}</Typography>
          <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.red, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>{fmt$(total7)}</Typography>
        </Box>
        <Box sx={{ px: '10px', py: '4px', background: DL.yellowBg, border: `1px solid ${DL.yellowBd}`, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.yellow, textTransform: 'uppercase', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>{t('cxp.chips.15dias')}</Typography>
          <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.yellow, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>{fmt$(total15)}</Typography>
        </Box>
        <Box sx={{ px: '10px', py: '4px', background: DL.subtle, border: `1px solid ${DL.border2}`, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>{t('cxp.chips.total')}</Typography>
          <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tH, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>{fmt$(totalAll)}</Typography>
        </Box>
      </Box>

      {/* Table */}
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr" sx={{ background: DL.subtle }}>
            {[t('col.proveedor'), t('col.monto'), t('col.fecha'), t('col.dias'), t('col.estado')].map((h, hi) => (
              <Box key={h} component="th" sx={{
                textAlign: hi === 0 ? 'left' : hi <= 3 ? 'right' : 'center',
                px: '10px', py: '7px',
                fontSize: 8, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                color: DL.tS, borderBottom: `1px solid ${DL.border2}`,
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", whiteSpace: 'nowrap',
              }}>
                {h}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {PROXIMOS_PAGOS.map((p, i) => {
            const ucfg = URGENCIA_CFG[p.urgencia] || URGENCIA_CFG['15dias'];
            return (
              <Box key={i} component="tr" sx={{
                background: ucfg.bg,
                '&:hover': { filter: 'brightness(0.97)' },
              }}>
                {/* Proveedor */}
                <Box component="td" sx={{ px: '10px', py: '8px', borderBottom: `1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                    {p.proveedor}
                  </Typography>
                </Box>

                {/* Monto */}
                <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                    {fmt$(p.monto)}
                  </Typography>
                </Box>

                {/* Fecha */}
                <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tM, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                    {p.fecha}
                  </Typography>
                </Box>

                {/* Días */}
                <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: ucfg.color, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                    {p.dias === 0 ? '0' : `+${p.dias}`}
                  </Typography>
                </Box>

                {/* Status chip */}
                <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'center', borderBottom: `1px solid ${DL.border}` }}>
                  <Box sx={{
                    display: 'inline-block', px: '7px', py: '2px',
                    background: `${ucfg.color}18`, borderRadius: '4px',
                    border: `1px solid ${ucfg.color}40`,
                  }}>
                    <Typography sx={{ fontSize: 8, fontWeight: 500, color: ucfg.color, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                      {t(ucfg.labelKey)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

// ─── TopProveedoresTable ──────────────────────────────────────────────────────
const dpoColor = d => {
  if (d >= 45) return DL.green;
  if (d >= 30) return DL.yellow;
  return DL.red;
};

function TopProveedoresTable() {
  const { t } = useT();
  return (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
      <Box component="thead">
        <Box component="tr" sx={{ background: DL.subtle }}>
          {[t('col.proveedor'), t('col.saldo'), t('col.vencido'), t('col.proxPago'), t('col.montoPago'), 'DPO'].map((h, hi) => (
            <Box key={h} component="th" sx={{
              textAlign: hi === 0 ? 'left' : 'right',
              px: '10px', py: '7px',
              fontSize: 8, fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              color: DL.tS, borderBottom: `1px solid ${DL.border2}`,
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", whiteSpace: 'nowrap',
            }}>
              {h}
            </Box>
          ))}
        </Box>
      </Box>
      <Box component="tbody">
        {TOP_PROVEEDORES.map((p, i) => (
          <Box key={i} component="tr" sx={{
            background: i % 2 === 0 ? '#fff' : DL.subtle,
            '&:hover': { background: 'rgba(84,126,105,.04)' },
          }}>
            {/* Proveedor */}
            <Box component="td" sx={{ px: '10px', py: '8px', borderBottom: `1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                {p.nombre}
              </Typography>
            </Box>

            {/* Saldo */}
            <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                {fmt$(p.saldo)}
              </Typography>
            </Box>

            {/* Vencido */}
            <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: p.vencido > 0 ? DL.red : DL.tS, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                {p.vencido > 0 ? fmt$(p.vencido) : '—'}
              </Typography>
            </Box>

            {/* Próx. Pago */}
            <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tM, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                {p.proxPago}
              </Typography>
            </Box>

            {/* Monto Pago */}
            <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.blue, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                {fmt$(p.monto)}
              </Typography>
            </Box>

            {/* DPO */}
            <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: dpoColor(p.dpo), fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                {p.dpo}d
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── AgingApTable ─────────────────────────────────────────────────────────────
function AgingApTable() {
  const { t } = useT();
  const total = CXP_AGING.reduce((s, b) => s + b.monto, 0);

  return (
    <Box>
      {/* Stacked progress bar */}
      <Box sx={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', mb: '12px' }}>
        {CXP_AGING.map((b, i) => (
          <Box key={i} sx={{ height: '100%', width: `${(b.monto / total) * 100}%`, background: b.color }} />
        ))}
      </Box>

      {/* Table */}
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr" sx={{ background: DL.subtle }}>
            {[t('col.bucket'), t('col.monto'), t('col.facturas'), t('col.pctTotal'), t('col.barra')].map((h, hi) => (
              <Box key={h} component="th" sx={{
                textAlign: hi === 0 ? 'left' : hi === 4 ? 'left' : 'right',
                px: '10px', py: '7px',
                fontSize: 8, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                color: DL.tS, borderBottom: `1px solid ${DL.border2}`,
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              }}>
                {h}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {CXP_AGING.map((b, i) => {
            const pct = (b.monto / total) * 100;
            return (
              <Box key={i} component="tr" sx={{
                background: i % 2 === 0 ? '#fff' : DL.subtle,
                '&:hover': { background: 'rgba(84,126,105,.04)' },
              }}>
                {/* Bucket */}
                <Box component="td" sx={{ px: '10px', py: '8px', borderBottom: `1px solid ${DL.border}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                      {b.label}
                    </Typography>
                  </Box>
                </Box>

                {/* Monto */}
                <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                    {fmt$(b.monto)}
                  </Typography>
                </Box>

                {/* Facturas */}
                <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tM, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                    {b.facturas}
                  </Typography>
                </Box>

                {/* % */}
                <Box component="td" sx={{ px: '10px', py: '8px', textAlign: 'right', borderBottom: `1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tM, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                    {pct.toFixed(1)}%
                  </Typography>
                </Box>

                {/* Horizontal bar */}
                <Box component="td" sx={{ px: '10px', py: '8px', borderBottom: `1px solid ${DL.border}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box sx={{ flex: 1, height: 6, background: 'rgba(26,26,26,.07)', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct}%`, background: b.color, borderRadius: 3 }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CuentasPagar() {
  const { t } = useT();
  const [period, setPeriod] = useState('abr2026');
  const [year, setYear]     = useState('2026');
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);

  const K = CXP_KPIS;

  const avgPagado = Math.round(PAGOS_TREND.pagado.reduce((s, v) => s + v, 0) / PAGOS_TREND.pagado.length);
  const totalPagado   = PAGOS_TREND.pagado.reduce((s, v) => s + v, 0);
  const totalFacturas = PAGOS_TREND.facturas.reduce((s, v) => s + v, 0);
  const pctPagoFacturas = ((totalPagado / totalFacturas) * 100).toFixed(1);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Page Header */}
      <PageHeader title={t('page.cxp')} live={true} onRefresh={handleRefresh}>
        <MiniSelect
          label={t('filter.periodo')}
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'abr2026', label: 'Abril 2026'    },
            { value: 'mar2026', label: 'Marzo 2026'    },
            { value: 'feb2026', label: 'Febrero 2026'  },
            { value: 'ene2026', label: 'Enero 2026'    },
          ]}
          minWidth={110}
        />
        <MiniSelect
          label={t('lbl.anio')}
          value={year}
          onChange={setYear}
          options={[{ value: '2026', label: '2026' }, { value: '2025', label: '2025' }]}
          minWidth={70}
        />
      </PageHeader>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Row 1: 6 KPI Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px' }}>
          {/* 1. Saldo Total CxP (isRisk) */}
          <CxpKpiCard
            label={t('cxp.kpi.saldoTotal')}
            value={K.saldoTotal.val}
            meta={K.saldoTotal.meta}
            ant={K.saldoTotal.ant}
            pct={(K.saldoTotal.meta / K.saldoTotal.val) * 100}
            isRisk
          />
          {/* 2. Total Vencido AP (isRisk) */}
          <CxpKpiCard
            label={t('cxp.kpi.totalVencido')}
            value={K.vencido.val}
            meta={K.vencido.meta}
            ant={K.vencido.ant}
            pct={(K.vencido.meta / K.vencido.val) * 100}
            isRisk
          />
          {/* 3. Por Vencer */}
          <CxpKpiCard
            label={t('cxp.kpi.porVencer')}
            value={K.porVencer.val}
            meta={K.porVencer.meta}
            ant={K.porVencer.ant}
            pct={(K.porVencer.val / K.porVencer.meta) * 100}
          />
          {/* 4. DPO (higher is better) */}
          <CxpKpiCard
            label={t('cxp.kpi.dpo')}
            value={K.dpo.val}
            meta={K.dpo.meta}
            ant={K.dpo.ant}
            pct={(K.dpo.val / K.dpo.meta) * 100}
            displayVal={`${K.dpo.val} ${t('lbl.dias')}`}
          />
          {/* 5. Pagos del Mes */}
          <CxpKpiCard
            label={t('cxp.kpi.pagosMes')}
            value={K.pagosMes.val}
            meta={K.pagosMes.meta}
            ant={K.pagosMes.ant}
            pct={(K.pagosMes.val / K.pagosMes.meta) * 100}
          />
          {/* 6. Proveedores Activos */}
          <CxpKpiCard
            label={t('cxp.kpi.provActivos')}
            value={K.proveedores.val}
            meta={K.proveedores.meta}
            ant={K.proveedores.ant}
            pct={(K.proveedores.val / K.proveedores.meta) * 100}
            displayVal={String(K.proveedores.val)}
          />
        </Box>

        {/* Row 2: Chart + Alertas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', alignItems: 'start' }}>
          {/* Left: Pagos Trend */}
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionHeader title={t('sec.pagosMensuales')} subtitle={t('sec.pagosMensuales.sub')} />
            <PagosTrendChart />

            {/* Legend */}
            <Box sx={{ display: 'flex', gap: '16px', px: '4px' }}>
              {[{ labelKey: 'chart.pagado', color: DL.blue }, { labelKey: 'chart.facturasRecibidas', color: DL.navy }].map(s => (
                <Box key={s.labelKey} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ width: 18, height: 3, borderRadius: 2, background: s.color }} />
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tM, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>{t(s.labelKey)}</Typography>
                </Box>
              ))}
            </Box>

            {/* Sub-stats */}
            <Box sx={{ display: 'flex', gap: '12px', pt: '4px', borderTop: `1px solid ${DL.border}` }}>
              <Box sx={{ flex: 1, p: '8px 10px', background: DL.subtle, borderRadius: '8px' }}>
                <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '3px', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                  {t('lbl.promMensPagado')}
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: DL.tH, letterSpacing: '-0.03em', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                  {fmt$(avgPagado)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: '8px 10px', background: DL.subtle, borderRadius: '8px' }}>
                <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '3px', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                  {t('lbl.pctPagos')}
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: DL.blue, letterSpacing: '-0.03em', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                  {pctPagoFacturas}%
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Right: Alertas */}
          <AlertasCxp />
        </Box>

        {/* Row 3: Próximos Pagos + Top Proveedores */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'start' }}>
          {/* Left: Próximos Pagos */}
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionHeader title={t('sec.proximosPagos')} />
            <ProximosPagosTable />
          </Paper>

          {/* Right: Top Proveedores */}
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>
            <SectionHeader title={t('sec.topProveedores')} />
            <Box sx={{ overflowX: 'auto' }}>
              <TopProveedoresTable />
            </Box>
          </Paper>
        </Box>

        {/* Row 4: Aging AP full width */}
        <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SectionHeader title={t('sec.antigüedadCxP')} subtitle={`Total: ${fmt$(CXP_AGING.reduce((s, b) => s + b.monto, 0))}`} />
          <AgingApTable />
        </Paper>

      </Box>
    </Box>
  );
}
