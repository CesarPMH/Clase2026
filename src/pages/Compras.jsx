// ─── Dashboard Compras ─────────────────────────────────────────────────────────
// Objetivo: Monitorear órdenes de compra, proveedores y variación de precios.
//
// UI: MUI (sx only) · Charts: Apache ECharts (echarts-for-react) · Font: Inter

import { useState, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography, Paper } from '@mui/material';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import SectionHeader from '../components/common/SectionHeader';
import { useT } from '../i18n/LanguageContext';
import { DL } from '../theme';
import {
  COMP_KPIS,
  ORDENES_ABIERTAS,
  COMPRAS_CATEGORIA,
  LEAD_TIMES,
  VARIACION_PRECIOS,
  COMP_TREND,
  ALERTAS_COMP,
} from '../data/compras';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt$ = v => {
  if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
  if (Math.abs(v) >= 1000)    return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
};
const pctChange = (cur, prev) =>
  prev !== 0 ? +((( cur - prev) / Math.abs(prev)) * 100).toFixed(1) : 0;

// ─── DeltaBadge ───────────────────────────────────────────────────────────────
function DeltaBadge({ value }) {
  const up = value >= 0;
  return (
    <Box sx={{
      display: 'inline-block', px: '5px', py: '1px',
      borderRadius: '4px', fontSize: 9, fontWeight: 500,
      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      background: up ? DL.greenBg : DL.redBg,
      color: up ? DL.green : DL.red,
    }}>
      {up ? '+' : ''}{value}%
    </Box>
  );
}

// ─── TIER_CFG ─────────────────────────────────────────────────────────────────
const TIER_CFG = {
  r: { bg: DL.redBg,    bd: DL.redBd,    icon: '▲', color: DL.red    },
  y: { bg: DL.yellowBg, bd: DL.yellowBd, icon: '△', color: DL.yellow },
  g: { bg: DL.greenBg,  bd: DL.greenBd,  icon: '✓', color: DL.green  },
};

// ─── CompKpiCard ──────────────────────────────────────────────────────────────
function CompKpiCard({ lbl, valDisplay, val, ant, meta, antDisplay, metaDisplay, isRisk }) {
  const rawPct = (val / meta) * 100;
  const pctMeta = +rawPct.toFixed(1);
  const barColor = isRisk
    ? (pctMeta <= 50 ? DL.green : pctMeta <= 75 ? DL.yellow : DL.red)
    : (pctMeta >= 100 ? DL.green : pctMeta >= 75 ? DL.yellow : DL.red);
  const barW = Math.min(pctMeta, 100);
  const delta = pctChange(val, ant);

  return (
    <Box sx={{
      background: '#fff', borderRadius: '10px',
      border: `1px solid ${DL.border}`,
      p: '12px 13px 10px', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', boxShadow: DL.e1,
      transition: 'box-shadow .2s, transform .2s',
      '&:hover': { boxShadow: DL.e2, transform: 'translateY(-1px)' },
    }}>
      {/* Top accent strip */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, borderRadius: '10px 10px 0 0', background: barColor,
      }} />

      {/* Label */}
      <Typography sx={{
        fontSize: 8, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: DL.tS, mt: '3px', mb: '5px',
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}>
        {lbl}
      </Typography>

      {/* Big value */}
      <Typography sx={{
        fontSize: 20, fontWeight: 500, color: DL.tH,
        lineHeight: 1.05, letterSpacing: '-.04em',
        pb: '3px', mb: '3px',
        borderBottom: `1px solid rgba(26,26,26,.08)`,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}>
        {valDisplay}
      </Typography>

      {/* Meta row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '4px' }}>
        <Typography sx={{
          fontSize: 8, fontWeight: 500, color: DL.tS,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        }}>
          Meta
        </Typography>
        <Typography sx={{
          fontSize: 10, fontWeight: 500, color: DL.tH,
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        }}>
          {metaDisplay || meta}
        </Typography>
      </Box>

      {/* Progress bar */}
      <Box sx={{ height: 9, background: 'rgba(26,26,26,.07)', borderRadius: 5, overflow: 'hidden', mb: '4px' }}>
        <Box sx={{
          height: '100%', borderRadius: 5, width: `${barW}%`,
          background: barColor, transition: 'width .6s ease',
        }} />
      </Box>

      {/* % de meta */}
      <Typography sx={{
        fontSize: 9, fontWeight: 500, color: barColor, mb: '8px',
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}>
        {pctMeta.toFixed(1)}% de meta
      </Typography>

      {/* VS AÑO ANT. footer */}
      <Box sx={{
        background: DL.subtle, borderRadius: '5px',
        p: '5px 8px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', mt: 'auto',
      }}>
        <Typography sx={{
          fontSize: 7.5, fontWeight: 500, color: DL.tS,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          whiteSpace: 'nowrap', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        }}>
          VS AÑO ANT.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Typography sx={{ fontSize: 8, color: DL.tS, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
            {antDisplay || ant}
          </Typography>
          <DeltaBadge value={delta} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── AlertasComp ──────────────────────────────────────────────────────────────
function AlertasComp() {
  const { t } = useT();
  const [filter, setFilter] = useState('todos');
  const rows = filter === 'todos'
    ? ALERTAS_COMP
    : ALERTAS_COMP.filter(a => a.tier === filter);

  return (
    <Box sx={{
      border: `1px solid ${DL.border}`, borderRadius: '10px',
      overflow: 'hidden', background: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <Box sx={{
        px: '12px', py: '8px',
        borderBottom: `1px solid ${DL.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: DL.subtle,
      }}>
        <Typography sx={{
          fontSize: 9, fontWeight: 500, textTransform: 'uppercase',
          letterSpacing: '0.09em', color: DL.tS,
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        }}>
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
          <option value="g">{t('status.ok')}</option>
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Typography sx={{
                  fontSize: 9, color: cfg.color, fontWeight: 500,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                }}>
                  {cfg.icon}
                </Typography>
              </Box>
              <Typography sx={{
                fontSize: 10, fontWeight: 500, color: DL.tH, lineHeight: 1.4,
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              }}>
                {a.msg}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── ComprasTrendChart ────────────────────────────────────────────────────────
function ComprasTrendChart() {
  const option = {
    grid: { top: 16, right: 60, bottom: 30, left: 56, containLabel: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: DL.dark,
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 11 },
      formatter: params => {
        let str = `<b>${params[0].axisValue}</b><br/>`;
        params.forEach(p => {
          const val = p.seriesName === 'Órdenes'
            ? `${p.value} órdenes`
            : fmt$(p.value);
          str += `${p.marker} ${p.seriesName}: <b>${val}</b><br/>`;
        });
        return str;
      },
    },
    legend: {
      data: ['Compras ($)', 'Órdenes'],
      bottom: 0,
      textStyle: { fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 9, color: DL.tS },
    },
    xAxis: {
      type: 'category',
      data: COMP_TREND.meses,
      axisLine: { lineStyle: { color: DL.border2 } },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 9, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        color: DL.tS, fontWeight: 500,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Monto',
        nameTextStyle: { fontSize: 8, color: DL.tS, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" },
        splitLine: { lineStyle: { color: DL.border, type: 'dashed' } },
        axisLabel: {
          fontSize: 8, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          color: DL.tS, fontWeight: 500,
          formatter: v => fmt$(v),
        },
      },
      {
        type: 'value',
        name: 'Órdenes',
        nameTextStyle: { fontSize: 8, color: DL.tS, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" },
        splitLine: { show: false },
        axisLabel: {
          fontSize: 8, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          color: DL.tS, fontWeight: 500,
          formatter: v => `${v}`,
        },
      },
    ],
    series: [
      {
        name: 'Compras ($)',
        type: 'bar',
        yAxisIndex: 0,
        data: COMP_TREND.compras,
        barMaxWidth: 32,
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: DL.blue + 'cc' },
              { offset: 1, color: DL.blue + '44' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Órdenes',
        type: 'line',
        yAxisIndex: 1,
        data: COMP_TREND.ordenes,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: DL.navy, width: 2 },
        itemStyle: { color: DL.navy },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 240 }} />;
}

// ─── OrdenesTable ─────────────────────────────────────────────────────────────
function OrdenesTable() {
  const estadoCfg = estado => {
    if (estado === 'En tránsito') return { bg: 'rgba(84,126,105,.1)', color: DL.blue,   bd: 'rgba(84,126,105,.3)' };
    if (estado === 'Confirmada')  return { bg: DL.greenBg,            color: DL.green,  bd: DL.greenBd };
    return                               { bg: DL.yellowBg,           color: DL.yellow, bd: DL.yellowBd };
  };

  const headers = ['# ORDEN','PROVEEDOR','MONTO','FECHA','DÍAS','ITEMS','ESTADO'];

  return (
    <Box sx={{ overflowY: 'auto', height: 280 }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr" sx={{ background: DL.subtle }}>
            {headers.map((h, hi) => (
              <Box key={h} component="th" sx={{
                textAlign: hi === 0 || hi === 1 ? 'left' : (hi === headers.length - 1 ? 'center' : 'right'),
                px: '10px', py: '7px',
                fontSize: 8, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                color: DL.tS, borderBottom: `1px solid ${DL.border2}`,
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                whiteSpace: 'nowrap',
                position: 'sticky', top: 0, background: DL.subtle, zIndex: 1,
              }}>
                {h}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {ORDENES_ABIERTAS.map((row, i) => {
            const sc = estadoCfg(row.estado);
            return (
              <Box key={row.id} component="tr" sx={{
                background: i % 2 === 0 ? '#fff' : DL.subtle,
                '&:hover': { background: 'rgba(84,126,105,.04)' },
              }}>
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  fontSize: 9, fontWeight: 500, color: DL.blue,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {row.id}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {row.proveedor}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {fmt$(row.monto)}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 9, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.fecha}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500,
                  color: row.diasAbierta >= 10 ? DL.red : row.diasAbierta >= 5 ? DL.yellow : DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.diasAbierta}d
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.items}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'center',
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center',
                    px: '7px', py: '2px', borderRadius: '4px',
                    background: sc.bg, border: `1px solid ${sc.bd}`,
                    fontSize: 9, fontWeight: 500, color: sc.color,
                    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    whiteSpace: 'nowrap',
                  }}>
                    {row.estado}
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

// ─── LeadTimesTable ───────────────────────────────────────────────────────────
function LeadTimesTable() {
  const ltColor = lt => lt <= 6 ? DL.green : lt <= 9 ? DL.yellow : DL.red;
  const MAX_LT = 15;

  // Star rating visual
  const Stars = ({ rating }) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1px', justifyContent: 'flex-end' }}>
        {[1,2,3,4,5].map(s => (
          <Box key={s} sx={{
            fontSize: 10,
            color: s <= full ? DL.yellow : (s === full + 1 && hasHalf ? DL.yellow : 'rgba(26,26,26,.15)'),
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          }}>
            {s <= full ? '★' : (s === full + 1 && hasHalf ? '½' : '☆')}
          </Box>
        ))}
        <Typography sx={{
          fontSize: 9, fontWeight: 500, color: DL.tM, ml: '3px',
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        }}>
          {rating}
        </Typography>
      </Box>
    );
  };

  const headers = ['PROVEEDOR','LEAD TIME (días)','ANT.','ÓRDENES','RATING'];

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr" sx={{ background: DL.subtle }}>
            {headers.map((h, hi) => (
              <Box key={h} component="th" sx={{
                textAlign: hi === 0 ? 'left' : 'right',
                px: '10px', py: '7px',
                fontSize: 8, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                color: DL.tS, borderBottom: `1px solid ${DL.border2}`,
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                whiteSpace: 'nowrap',
              }}>
                {h}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {LEAD_TIMES.map((row, i) => {
            const lc = ltColor(row.leadTime);
            return (
              <Box key={row.proveedor} component="tr" sx={{
                background: i % 2 === 0 ? '#fff' : DL.subtle,
                '&:hover': { background: 'rgba(84,126,105,.04)' },
              }}>
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.proveedor}
                </Box>
                {/* Lead time with bar */}
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    <Typography sx={{
                      fontSize: 10, fontWeight: 500, color: lc,
                      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    }}>
                      {row.leadTime}d
                    </Typography>
                    <Box sx={{ width: 60, height: 4, background: 'rgba(26,26,26,.07)', borderRadius: 2, overflow: 'hidden' }}>
                      <Box sx={{
                        height: '100%', borderRadius: 2,
                        width: `${(row.leadTime / MAX_LT) * 100}%`,
                        background: lc,
                      }} />
                    </Box>
                  </Box>
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 9, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.ant}d
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.ordenes}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  <Stars rating={row.rating} />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

// ─── CategoriaComprasTable ────────────────────────────────────────────────────
function CategoriaComprasTable() {
  const headers = ['CATEGORÍA','MONTO','ANT.','%','# ÓRDENES','CRECIMIENTO'];

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr" sx={{ background: DL.subtle }}>
            {headers.map((h, hi) => (
              <Box key={h} component="th" sx={{
                textAlign: hi === 0 ? 'left' : (hi === headers.length - 1 ? 'center' : 'right'),
                px: '10px', py: '7px',
                fontSize: 8, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                color: DL.tS, borderBottom: `1px solid ${DL.border2}`,
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                whiteSpace: 'nowrap',
              }}>
                {h}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {COMPRAS_CATEGORIA.map((row, i) => {
            const crecPct = pctChange(row.monto, row.ant);
            const crecUp = crecPct >= 0;
            return (
              <Box key={row.categoria} component="tr" sx={{
                background: i % 2 === 0 ? '#fff' : DL.subtle,
                '&:hover': { background: 'rgba(84,126,105,.04)' },
              }}>
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.categoria}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {fmt$(row.monto)}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 9, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {fmt$(row.ant)}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.blue,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.pct}%
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.ordenes}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'center',
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    px: '7px', py: '2px', borderRadius: '4px',
                    background: crecUp ? DL.greenBg : DL.redBg,
                    border: `1px solid ${crecUp ? DL.greenBd : DL.redBd}`,
                    fontSize: 9, fontWeight: 500,
                    color: crecUp ? DL.green : DL.red,
                    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    whiteSpace: 'nowrap',
                  }}>
                    {crecUp ? '▲' : '▼'} {crecUp ? '+' : ''}{crecPct}%
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

// ─── VariacionPreciosTable ────────────────────────────────────────────────────
function VariacionPreciosTable() {
  const headers = ['SKU','PRODUCTO','PRECIO ACT.','PRECIO ANT.','VAR.%'];

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr" sx={{ background: DL.subtle }}>
            {headers.map((h, hi) => (
              <Box key={h} component="th" sx={{
                textAlign: hi === 0 ? 'left' : (hi === 1 ? 'left' : 'right'),
                px: '10px', py: '7px',
                fontSize: 8, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                color: DL.tS, borderBottom: `1px solid ${DL.border2}`,
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                whiteSpace: 'nowrap',
              }}>
                {h}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {VARIACION_PRECIOS.map((row, i) => {
            const up = row.tendencia === 'up';
            const varAbs = Math.abs(row.var);
            const varColor = up ? (row.var > 5 ? DL.red : DL.yellow) : DL.green;
            return (
              <Box key={row.sku} component="tr" sx={{
                background: i % 2 === 0 ? '#fff' : DL.subtle,
                '&:hover': { background: 'rgba(84,126,105,.04)' },
              }}>
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  fontSize: 9, fontWeight: 500, color: DL.tS,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {row.sku}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {row.nombre}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  ${row.precioAct.toFixed(2)}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 9, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  ${row.precioAnt.toFixed(2)}
                </Box>
                {/* VAR.% with arrow */}
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    px: '7px', py: '2px', borderRadius: '4px',
                    background: up ? (row.var > 5 ? DL.redBg : DL.yellowBg) : DL.greenBg,
                    border: `1px solid ${up ? (row.var > 5 ? DL.redBd : DL.yellowBd) : DL.greenBd}`,
                    fontSize: 9, fontWeight: 500, color: varColor,
                    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    whiteSpace: 'nowrap',
                  }}>
                    <Box sx={{ fontSize: 8, lineHeight: 1 }}>{up ? '▲' : '▼'}</Box>
                    {up ? '+' : ''}{row.var}%
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

// ─── Main export ──────────────────────────────────────────────────────────────
export default function Compras() {
  const { t } = useT();
  const [proveedor,  setProveedor]  = useState('todos');
  const [categoria,  setCategoria]  = useState('todas');
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);

  const K = COMP_KPIS;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Page Header */}
      <PageHeader
        title={t('page.compras')}
        live={true}
        onRefresh={handleRefresh}
      >
        <MiniSelect
          label="Proveedor"
          value={proveedor}
          onChange={setProveedor}
          options={[
            { value: 'todos',    label: 'Todos' },
            { value: 'vetpharma',label: 'VetPharma GT' },
            { value: 'agro',     label: 'AgroInsumos' },
            { value: 'semillas', label: 'SemillasTec' },
            { value: 'biovet',   label: 'BioVet Central' },
          ]}
          minWidth={130}
        />
        <MiniSelect
          label="Categoría"
          value={categoria}
          onChange={setCategoria}
          options={[
            { value: 'todas',      label: 'Todas' },
            { value: 'agricola',   label: 'Agrícola' },
            { value: 'veterinario',label: 'Veterinario' },
            { value: 'semillas',   label: 'Semillas' },
            { value: 'menores',    label: 'Esp. Menores' },
          ]}
          minWidth={120}
        />
      </PageHeader>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Row 1: 6 KPI cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px' }}>
          <CompKpiCard
            lbl={t('comp.kpi.ordenesAbiertas')}
            valDisplay={`${K.ordenesAbiertas.val}`}
            val={K.ordenesAbiertas.val}
            ant={K.ordenesAbiertas.ant}
            antDisplay={`${K.ordenesAbiertas.ant}`}
            meta={K.ordenesAbiertas.meta}
            metaDisplay={`${K.ordenesAbiertas.meta}`}
            isRisk
          />
          <CompKpiCard
            lbl={t('comp.kpi.montoOrdenes')}
            valDisplay={fmt$(K.montoOrdenes.val)}
            val={K.montoOrdenes.val}
            ant={K.montoOrdenes.ant}
            antDisplay={fmt$(K.montoOrdenes.ant)}
            meta={K.montoOrdenes.meta}
            metaDisplay={fmt$(K.montoOrdenes.meta)}
          />
          <CompKpiCard
            lbl={t('comp.kpi.comprasMes')}
            valDisplay={fmt$(K.comprasMes.val)}
            val={K.comprasMes.val}
            ant={K.comprasMes.ant}
            antDisplay={fmt$(K.comprasMes.ant)}
            meta={K.comprasMes.meta}
            metaDisplay={fmt$(K.comprasMes.meta)}
          />
          <CompKpiCard
            lbl={t('comp.kpi.leadTimeProm')}
            valDisplay={`${K.leadTimeProm.val} ${t('lbl.dias')}`}
            val={K.leadTimeProm.val}
            ant={K.leadTimeProm.ant}
            antDisplay={`${K.leadTimeProm.ant} ${t('lbl.dias')}`}
            meta={K.leadTimeProm.meta}
            metaDisplay={`${K.leadTimeProm.meta} ${t('lbl.dias')}`}
            isRisk
          />
          <CompKpiCard
            lbl={t('comp.kpi.provActivos')}
            valDisplay={`${K.proveedoresAct.val}`}
            val={K.proveedoresAct.val}
            ant={K.proveedoresAct.ant}
            antDisplay={`${K.proveedoresAct.ant}`}
            meta={K.proveedoresAct.meta}
            metaDisplay={`${K.proveedoresAct.meta}`}
          />
          <CompKpiCard
            lbl={t('comp.kpi.variacionPrecio')}
            valDisplay={`${K.variacionPrec.val}%`}
            val={K.variacionPrec.val}
            ant={K.variacionPrec.ant}
            antDisplay={`${K.variacionPrec.ant}%`}
            meta={K.variacionPrec.meta}
            metaDisplay={`${K.variacionPrec.meta}%`}
            isRisk
          />
        </Box>

        {/* Row 2: Chart + Alertas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', alignItems: 'start' }}>
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionHeader title={t('sec.tendenciaCompras')} subtitle={t('sec.tendenciaCompras.sub')} />
            <ComprasTrendChart />
          </Paper>
          <AlertasComp />
        </Box>

        {/* Row 3: Órdenes + Lead Times */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'start' }}>
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionHeader title={t('sec.ordenesAbiertas')}>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center',
                px: '8px', py: '2px', borderRadius: '4px',
                background: DL.yellowBg, border: `1px solid ${DL.yellowBd}`,
                fontSize: 9, fontWeight: 500, color: DL.yellow,
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              }}>
                {ORDENES_ABIERTAS.length} órdenes
              </Box>
            </SectionHeader>
            <OrdenesTable />
          </Paper>
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionHeader title={t('sec.leadTime')} />
            <LeadTimesTable />
          </Paper>
        </Box>

        {/* Row 4: Categorías + Variación de Precios */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'start' }}>
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionHeader title={t('sec.comprasCat')} />
            <CategoriaComprasTable />
          </Paper>
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionHeader title={t('sec.variacionPrecios')} />
            <VariacionPreciosTable />
          </Paper>
        </Box>

      </Box>
    </Box>
  );
}
