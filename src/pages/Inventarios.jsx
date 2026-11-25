// ─── Dashboard Inventarios ─────────────────────────────────────────────────────
// Objetivo: Monitorear stock disponible, alertas de reorden, bodegas y rotación.
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
  INV_KPIS,
  INV_CATEGORIAS,
  ITEMS_BAJO_MINIMO,
  INV_BODEGAS,
  INV_TREND,
  ALERTAS_INV,
} from '../data/inventarios';

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

// ─── InvKpiCard ───────────────────────────────────────────────────────────────
function InvKpiCard({ lbl, valDisplay, val, ant, meta, isRisk }) {
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
          {meta}
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
            {ant}
          </Typography>
          <DeltaBadge value={delta} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── AlertasInv ───────────────────────────────────────────────────────────────
function AlertasInv() {
  const { t } = useT();
  const [filter, setFilter] = useState('todos');
  const rows = filter === 'todos'
    ? ALERTAS_INV
    : ALERTAS_INV.filter(a => a.tier === filter);

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
          Alertas de Inventario
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

// ─── StockTrendChart ──────────────────────────────────────────────────────────
function StockTrendChart() {
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
          const val = p.seriesName === 'Unidades'
            ? `${p.value.toLocaleString()} u`
            : fmt$(p.value);
          str += `${p.marker} ${p.seriesName}: <b>${val}</b><br/>`;
        });
        return str;
      },
    },
    legend: {
      data: ['Unidades', 'Valor ($)'],
      bottom: 0,
      textStyle: { fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 9, color: DL.tS },
    },
    xAxis: {
      type: 'category',
      data: INV_TREND.meses,
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
        name: 'Unidades',
        nameTextStyle: { fontSize: 8, color: DL.tS, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" },
        splitLine: { lineStyle: { color: DL.border, type: 'dashed' } },
        axisLabel: {
          fontSize: 8, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          color: DL.tS, fontWeight: 500,
          formatter: v => `${(v / 1000).toFixed(1)}K`,
        },
      },
      {
        type: 'value',
        name: 'Valor',
        nameTextStyle: { fontSize: 8, color: DL.tS, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" },
        splitLine: { show: false },
        axisLabel: {
          fontSize: 8, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          color: DL.tS, fontWeight: 500,
          formatter: v => fmt$(v),
        },
      },
    ],
    series: [
      {
        name: 'Unidades',
        type: 'bar',
        yAxisIndex: 0,
        data: INV_TREND.unidades,
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
        name: 'Valor ($)',
        type: 'line',
        yAxisIndex: 1,
        data: INV_TREND.stockVal,
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

// ─── CategoriasStockTable ─────────────────────────────────────────────────────
function CategoriasStockTable() {
  const estadoColor = estado => {
    if (estado === 'Normal') return { bg: DL.greenBg, color: DL.green, bd: DL.greenBd };
    if (estado === 'Bajo')   return { bg: DL.yellowBg, color: DL.yellow, bd: DL.yellowBd };
    return { bg: DL.redBg, color: DL.red, bd: DL.redBd };
  };

  const headers = ['CATEGORÍA','STOCK U','STOCK MÍN','STOCK MÁX','VALOR','ROTACIÓN','COBERTURA','ESTADO'];

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
          {INV_CATEGORIAS.map((row, i) => {
            const sc = estadoColor(row.estado);
            return (
              <Box key={row.nombre} component="tr" sx={{
                background: i % 2 === 0 ? '#fff' : DL.subtle,
                '&:hover': { background: 'rgba(84,126,105,.04)' },
              }}>
                <Box component="td" sx={{
                  px: '10px', py: '8px', fontSize: 10, fontWeight: 500,
                  color: DL.tH, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.nombre}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.stockU.toLocaleString()}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.stockMin.toLocaleString()}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.stockMax.toLocaleString()}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {fmt$(row.valor)}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.blue,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.rotacion}x
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.cobertura}d
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
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

// ─── StockBodegasTable ────────────────────────────────────────────────────────
function StockBodegasTable() {
  const headers = ['BODEGA', 'STOCK (U)', 'VALOR', 'ROTACIÓN', 'COBERTURA (días)', 'UTILIZACIÓN'];

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
          {INV_BODEGAS.map((row, i) => {
            const utilColor = row.utilizacion >= 80 ? DL.green
              : row.utilizacion >= 60 ? DL.yellow
              : DL.red;
            return (
              <Box key={row.nombre} component="tr" sx={{
                background: i % 2 === 0 ? '#fff' : DL.subtle,
                '&:hover': { background: 'rgba(84,126,105,.04)' },
              }}>
                <Box component="td" sx={{
                  px: '10px', py: '8px', fontSize: 10, fontWeight: 500,
                  color: DL.tH, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.nombre}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.stockU.toLocaleString()}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {fmt$(row.valor)}
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.blue,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.rotacion}x
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  —
                </Box>
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                    <Box sx={{ flex: 1, maxWidth: 80, height: 6, background: 'rgba(26,26,26,.07)', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{
                        height: '100%', borderRadius: 3,
                        width: `${row.utilizacion}%`,
                        background: utilColor,
                        transition: 'width .5s ease',
                      }} />
                    </Box>
                    <Typography sx={{
                      fontSize: 9, fontWeight: 500, color: utilColor,
                      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                      minWidth: 28, textAlign: 'right',
                    }}>
                      {row.utilizacion}%
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

// ─── BajoMinimoTable ──────────────────────────────────────────────────────────
function BajoMinimoTable() {
  const headers = ['SKU', 'PRODUCTO', 'CAT', 'STOCK ACTUAL', 'STOCK MÍN', 'COBERTURA', 'URGENCIA'];

  return (
    <Box sx={{ overflowY: 'auto', height: 320 }}>
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
                position: 'sticky', top: 0, background: DL.subtle, zIndex: 1,
              }}>
                {h}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {ITEMS_BAJO_MINIMO.map((row, i) => {
            const fillPct = (row.stockActual / row.stockMin) * 100;
            const barColor = fillPct < 50 ? DL.red : fillPct < 80 ? DL.yellow : DL.green;
            const urgCfg = row.urgencia === 'critico'
              ? { bg: DL.redBg, color: DL.red, bd: DL.redBd, label: 'Crítico' }
              : { bg: DL.yellowBg, color: DL.yellow, bd: DL.yellowBd, label: 'Bajo' };

            return (
              <Box key={row.sku} component="tr" sx={{
                background: i % 2 === 0 ? '#fff' : DL.subtle,
                '&:hover': { background: 'rgba(84,126,105,.04)' },
              }}>
                {/* SKU */}
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  fontSize: 9, fontWeight: 500, color: DL.tS,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {row.sku}
                </Box>
                {/* Producto */}
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  fontSize: 10, fontWeight: 500, color: DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {row.nombre}
                </Box>
                {/* Categoría */}
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 9, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {row.categoria}
                </Box>
                {/* Stock actual + mini bar */}
                <Box component="td" sx={{
                  px: '10px', py: '8px',
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    <Typography sx={{
                      fontSize: 10, fontWeight: 500, color: barColor,
                      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    }}>
                      {row.stockActual}
                    </Typography>
                    <Box sx={{ width: 60, height: 4, background: 'rgba(26,26,26,.07)', borderRadius: 2, overflow: 'hidden' }}>
                      <Box sx={{
                        height: '100%', borderRadius: 2,
                        width: `${Math.min(fillPct, 100)}%`,
                        background: barColor,
                      }} />
                    </Box>
                  </Box>
                </Box>
                {/* Stock mín */}
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500, color: DL.tM,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.stockMin}
                </Box>
                {/* Cobertura */}
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'right',
                  fontSize: 10, fontWeight: 500,
                  color: row.cobertura <= 7 ? DL.red : row.cobertura <= 14 ? DL.yellow : DL.tH,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  {row.cobertura}d
                </Box>
                {/* Urgencia chip */}
                <Box component="td" sx={{
                  px: '10px', py: '8px', textAlign: 'center',
                  borderBottom: `1px solid ${DL.border}`,
                }}>
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center',
                    px: '7px', py: '2px', borderRadius: '4px',
                    background: urgCfg.bg, border: `1px solid ${urgCfg.bd}`,
                    fontSize: 9, fontWeight: 500, color: urgCfg.color,
                    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    whiteSpace: 'nowrap',
                  }}>
                    {urgCfg.label}
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
export default function Inventarios() {
  const { t } = useT();
  const [bodega,    setBodega]    = useState('todas');
  const [categoria, setCategoria] = useState('todas');
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);

  const K = INV_KPIS;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Page Header */}
      <PageHeader
        title={t('page.inventarios')}
        live={true}
        onRefresh={handleRefresh}
      >
        <MiniSelect
          label="Bodega"
          value={bodega}
          onChange={setBodega}
          options={[
            { value: 'todas',   label: 'Todas' },
            { value: 'matriz',  label: 'Matriz' },
            { value: 'central', label: 'Central' },
            { value: 'norte',   label: 'Norte' },
            { value: 'sur',     label: 'Sur' },
          ]}
          minWidth={100}
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
          <InvKpiCard
            lbl={t('inv.kpi.stockTotal')}
            valDisplay={K.stockTotal.val.toLocaleString()}
            val={K.stockTotal.val}
            ant={K.stockTotal.ant.toLocaleString()}
            meta={K.stockTotal.meta.toLocaleString()}
          />
          <InvKpiCard
            lbl={t('inv.kpi.valorInv')}
            valDisplay={fmt$(K.valorInventario.val)}
            val={K.valorInventario.val}
            ant={fmt$(K.valorInventario.ant)}
            meta={fmt$(K.valorInventario.meta)}
            isRisk
          />
          <InvKpiCard
            lbl={t('inv.kpi.skusBajoMin')}
            valDisplay={`${K.bajominimo.val} SKUs`}
            val={K.bajominimo.val}
            ant={`${K.bajominimo.ant} SKUs`}
            meta={K.bajominimo.meta}
            isRisk
          />
          <InvKpiCard
            lbl={t('inv.kpi.skusCriticos')}
            valDisplay={`${K.critico.val} SKUs`}
            val={K.critico.val}
            ant={`${K.critico.ant} SKUs`}
            meta={K.critico.meta}
            isRisk
          />
          <InvKpiCard
            lbl={t('inv.kpi.rotacionProm')}
            valDisplay={`${K.rotacionProm.val}x`}
            val={K.rotacionProm.val}
            ant={`${K.rotacionProm.ant}x`}
            meta={K.rotacionProm.meta}
          />
          <InvKpiCard
            lbl={t('inv.kpi.coberturaProm')}
            valDisplay={`${K.coberturaDias.val} ${t('lbl.dias')}`}
            val={K.coberturaDias.val}
            ant={`${K.coberturaDias.ant} ${t('lbl.dias')}`}
            meta={K.coberturaDias.meta}
          />
        </Box>

        {/* Row 2: Chart + Alertas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', alignItems: 'start' }}>
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionHeader title={t('sec.tendenciaInventario')} subtitle={t('sec.tendenciaInventario.sub')} />
            <StockTrendChart />
          </Paper>
          <AlertasInv />
        </Box>

        {/* Row 3: Categorías + Bodegas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'start' }}>
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionHeader title={t('sec.inventarioCat')} />
            <CategoriasStockTable />
          </Paper>
          <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionHeader title={t('sec.inventarioBodega')} />
            <StockBodegasTable />
          </Paper>
        </Box>

        {/* Row 4: SKUs Bajo Mínimo full width */}
        <Paper sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SectionHeader title={t('sec.bajoMinimo')}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center',
              px: '8px', py: '2px', borderRadius: '4px',
              background: DL.yellowBg, border: `1px solid ${DL.yellowBd}`,
              fontSize: 9, fontWeight: 500, color: DL.yellow,
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            }}>
              {ITEMS_BAJO_MINIMO.length} SKUs
            </Box>
          </SectionHeader>
          <BajoMinimoTable />
        </Paper>

      </Box>
    </Box>
  );
}
