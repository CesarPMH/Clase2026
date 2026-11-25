// ─── Dashboard de Costos de Producción ───────────────────────────────────────
// Objetivo: ¿Cuál es la variación real vs estándar? ¿Qué componente/OT
//           está jalando el costo fuera de control?

import { useState, useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Box, Typography, Paper,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';

import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import SectionHeader from '../components/common/SectionHeader';
import { DL } from '../theme';
import { useT } from '../i18n/LanguageContext';
import {
  COST_KPIS,
  VARIACION_COMPONENTES,
  COSTOS_OT,
  SCRAP_DETALLE,
  COST_TREND,
  ALERTAS_COST,
} from '../data/costos';

// ─── TIER_CFG for alerts ──────────────────────────────────────────────────────
const TIER_CFG = {
  r: { bg:DL.redBg,    bd:DL.redBd,    icon:'▲', color:DL.red    },
  y: { bg:DL.yellowBg, bd:DL.yellowBd, icon:'△', color:DL.yellow },
  g: { bg:DL.greenBg,  bd:DL.greenBd,  icon:'✓', color:DL.green  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt$ = (v) => `$${Number(v).toLocaleString()}`;

// ─── Standard KPI Card (CostKpiCard) ─────────────────────────────────────────
function CostKpiCard({ label, valueStr, val, ant, meta, isRisk }) {
  const { t } = useT();
  const pct = meta > 0 ? (val / meta) * 100 : 0;
  const barColor = isRisk
    ? (pct <= 50 ? DL.green : pct <= 75 ? DL.yellow : DL.red)
    : (pct >= 100 ? DL.green : pct >= 75 ? DL.yellow : DL.red);
  const barW = Math.min(Math.max(pct, 0), 100);

  const diff = val - ant;
  const diffPct = ant !== 0 ? ((diff / ant) * 100).toFixed(1) : '0.0';
  const antUp = isRisk ? diff <= 0 : diff >= 0;

  return (
    <Box sx={{
      background:'#fff', borderRadius:'10px',
      border:`1px solid ${DL.border}`, boxShadow:DL.e1,
      p:'12px 13px 10px', position:'relative', overflow:'hidden',
      display:'flex', flexDirection:'column',
      transition:'box-shadow .2s, transform .2s',
      '&:hover':{ boxShadow:DL.e2, transform:'translateY(-1px)' },
    }}>
      {/* Top accent strip 3px */}
      <Box sx={{
        position:'absolute', top:0, left:0, right:0, height:3,
        borderRadius:'10px 10px 0 0', background:barColor,
      }} />
      {/* Label 8px uppercase */}
      <Typography sx={{
        fontSize:8, fontWeight: 500, textTransform:'uppercase',
        letterSpacing:'0.07em', color:DL.tS, mt:'3px', mb:'5px',
      }}>
        {label}
      </Typography>
      {/* Value 20px/800 with borderBottom */}
      <Typography sx={{
        fontSize:20, fontWeight: 500, color:DL.tH, lineHeight:1.05,
        letterSpacing:'-.04em', pb:'3px', mb:'4px',
        borderBottom:'1px solid rgba(26,26,26,.08)',
      }}>
        {valueStr}
      </Typography>
      {/* Meta row */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', mb:'4px' }}>
        <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em' }}>
          {t('lbl.meta')}
        </Typography>
        <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>{meta}</Typography>
      </Box>
      {/* Progress bar h:9 */}
      <Box sx={{ height:9, background:'#e3e3e3', borderRadius:5, overflow:'hidden', mb:'5px' }}>
        <Box sx={{
          height:'100%', borderRadius:5,
          width:`${barW}%`, background:barColor,
          transition:'width .8s cubic-bezier(.4,0,.2,1)',
        }} />
      </Box>
      {/* X% de meta */}
      <Typography sx={{ fontSize:9, fontWeight: 500, color:barColor, mb:'8px' }}>
        {pct.toFixed(0)}% {t('lbl.deMeta')}
      </Typography>
      {/* VS AÑO ANT. footer */}
      <Box sx={{
        background:DL.subtle, borderRadius:'5px', p:'4px 7px',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:'5px', mt:'auto',
      }}>
        <Typography sx={{ fontSize:7.5, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em' }}>
          {t('lbl.vsAnioAnt')}
        </Typography>
        <Box sx={{
          fontSize:8, fontWeight: 500, px:'5px', py:'1px', borderRadius:'4px',
          background: antUp ? DL.greenBg : DL.redBg,
          color:       antUp ? DL.green   : DL.red,
        }}>
          {diff >= 0 ? '+' : ''}{diffPct}%
        </Box>
      </Box>
    </Box>
  );
}

// ─── Alertas panel ────────────────────────────────────────────────────────────
function AlertasCost() {
  const { t } = useT();
  const [filter, setFilter] = useState('todos');
  const shown =
    filter === 'criticos'  ? ALERTAS_COST.filter(a => a.tier === 'r') :
    filter === 'atencion'  ? ALERTAS_COST.filter(a => a.tier === 'y') :
    filter === 'positivos' ? ALERTAS_COST.filter(a => a.tier === 'g') :
    ALERTAS_COST;

  return (
    <Box sx={{
      background:'#fff', borderRadius:'10px',
      border:`1px solid ${DL.border}`, boxShadow:DL.e1,
      display:'flex', flexDirection:'column', height:'100%',
    }}>
      <Box sx={{
        px:'14px', py:'10px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:`1px solid ${DL.border}`, flexShrink:0,
      }}>
        <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH }}>{t('sec.alertas')}</Typography>
        <Box
          component="select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          sx={{
            fontSize:10, fontWeight:500, color:DL.tH,
            border:`1px solid ${DL.border2}`, borderRadius:'6px',
            px:'7px', py:'3px', background:'#fff',
            fontFamily:"'Inter',sans-serif",
            cursor:'pointer', outline:'none',
            '&:focus':{ borderColor:DL.blue },
          }}
        >
          <option value="todos">{t('alert.todos')}</option>
          <option value="criticos">{t('alert.criticos')}</option>
          <option value="atencion">{t('alert.atencion')}</option>
          <option value="positivos">{t('alert.positivos')}</option>
        </Box>
      </Box>
      <Box sx={{ p:'10px 14px', flex:1, display:'flex', flexDirection:'column', gap:'5px', overflowY:'auto' }}>
        {shown.map((a, i) => {
          const c = TIER_CFG[a.tier];
          return (
            <Box key={i} sx={{
              display:'flex', alignItems:'flex-start', gap:'8px',
              p:'8px 10px', borderRadius:'8px',
              borderLeft:`3px solid ${c.color}`, background:c.bg,
            }}>
              <Box sx={{
                width:18, height:18, borderRadius:'50%', flexShrink:0, mt:'1px',
                background:c.bg, color:c.color,
                border:`1.5px solid ${c.bd}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:9, fontWeight: 500,
              }}>
                {c.icon}
              </Box>
              <Typography sx={{ fontSize:10, color:DL.tM, lineHeight:1.4, fontWeight:500 }}>
                {a.msg}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Common table header/cell sx ─────────────────────────────────────────────
const thSx = {
  fontSize:9, fontWeight: 500, textTransform:'uppercase',
  letterSpacing:'.07em', color:DL.tS,
  background:'rgba(26,26,26,.025)',
  borderBottom:'2px solid rgba(26,26,26,.08)',
  px:'10px', py:'7px', whiteSpace:'nowrap',
};
const tdSx = {
  px:'10px', py:'7px',
  borderBottom:'1px solid rgba(26,26,26,.05)',
};

// ─── Variación Componentes Table ──────────────────────────────────────────────
function VariacionComponentesTable() {
  const { t } = useT();
  const maxReal = Math.max(...VARIACION_COMPONENTES.map(r => r.real));

  return (
    <Box sx={{ overflowX:'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {[
              { label:'COMPONENTE',     align:'left'  },
              { label:'REAL',           align:'right' },
              { label:'ESTÁNDAR',       align:'right' },
              { label:'VARIACIÓN $',    align:'right' },
              { label:'VAR. %',         align:'right' },
              { label:'% COSTO TOTAL',  align:'right' },
            ].map(h => (
              <TableCell key={h.label} sx={{ ...thSx, textAlign:h.align }}>{h.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {VARIACION_COMPONENTES.map(r => {
            const varDollar = r.real - r.estandar;
            const varColor = r.var < 0 ? DL.green : r.var < 4 ? DL.yellow : DL.red;
            const barW = Math.round((r.real / maxReal) * 100);
            const estBarW = Math.round((r.estandar / maxReal) * 100);
            return (
              <TableRow key={r.componente} sx={{ '&:hover td':{ background:'rgba(84,126,105,.03)' } }}>
                <TableCell sx={{ ...tdSx, minWidth:160 }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, mb:'3px' }}>{r.componente}</Typography>
                  {/* Waterfall-style bar visual */}
                  <Box sx={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      <Typography sx={{ fontSize:8, color:DL.tS, width:40 }}>{t('costs.lbl.real')}</Typography>
                      <Box sx={{ flex:1, height:5, background:'#e3e3e3', borderRadius:3, overflow:'hidden' }}>
                        <Box sx={{ height:'100%', width:`${barW}%`, background:DL.blue, borderRadius:3 }} />
                      </Box>
                    </Box>
                    <Box sx={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      <Typography sx={{ fontSize:8, color:DL.tS, width:40 }}>{t('costs.lbl.est')}</Typography>
                      <Box sx={{ flex:1, height:5, background:'#e3e3e3', borderRadius:3, overflow:'hidden' }}>
                        <Box sx={{ height:'100%', width:`${estBarW}%`, background:'rgba(26,26,26,.25)', borderRadius:3 }} />
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>{fmt$(r.real)}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, color:DL.tM }}>{fmt$(r.estandar)}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color: varDollar > 0 ? DL.red : DL.green }}>
                    {varDollar > 0 ? '+' : ''}{fmt$(varDollar)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Box sx={{
                    display:'inline-flex', px:'6px', py:'2px', borderRadius:'4px',
                    background: r.var < 0 ? DL.greenBg : r.var < 4 ? DL.yellowBg : DL.redBg,
                  }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:varColor }}>
                      {r.var > 0 ? '+' : ''}{r.var.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, color:DL.tM }}>{r.pct.toFixed(1)}%</Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

// ─── Costos OT Table ──────────────────────────────────────────────────────────
function CostosOTTable() {
  return (
    <Box sx={{ overflowX:'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {[
              { label:'OT',           align:'left'  },
              { label:'PRODUCTO',     align:'left'  },
              { label:'COSTO REAL',   align:'right' },
              { label:'EST.',         align:'right' },
              { label:'VAR. %',       align:'right' },
              { label:'UND.',         align:'right' },
              { label:'COSTO/UND',    align:'right' },
              { label:'EFIC.',        align:'right' },
              { label:'SCRAP',        align:'right' },
            ].map(h => (
              <TableCell key={h.label} sx={{ ...thSx, textAlign:h.align }}>{h.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {COSTOS_OT.map(r => {
            const varColor = r.var < 2 ? DL.green : r.var < 4 ? DL.yellow : DL.red;
            const varBg    = r.var < 2 ? DL.greenBg : r.var < 4 ? DL.yellowBg : DL.redBg;
            return (
              <TableRow key={r.id} sx={{ '&:hover td':{ background:'rgba(84,126,105,.03)' } }}>
                <TableCell sx={{ ...tdSx }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.blue, whiteSpace:'nowrap' }}>{r.id}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, whiteSpace:'nowrap' }}>{r.producto}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>{fmt$(r.real)}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, color:DL.tM }}>{fmt$(r.estandar)}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Box sx={{ display:'inline-flex', px:'6px', py:'2px', borderRadius:'4px', background:varBg }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:varColor }}>
                      {r.var > 0 ? '+' : ''}{r.var.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, color:DL.tM }}>{r.und.toLocaleString()}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>${r.costoUnd.toFixed(1)}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color: r.efic >= 95 ? DL.green : r.efic >= 90 ? DL.yellow : DL.red }}>
                    {r.efic.toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color: r.scrap > 3 ? DL.red : r.scrap > 2 ? DL.yellow : DL.green }}>
                    {r.scrap.toFixed(1)}%
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

// ─── Scrap Table ──────────────────────────────────────────────────────────────
function ScrapTable() {
  const { t } = useT();
  const totalCosto = SCRAP_DETALLE.reduce((s, r) => s + r.costoScrap, 0);

  return (
    <Box>
      <Box sx={{ overflowX:'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {[
                { label:'PRODUCTO',    align:'left'  },
                { label:'SCRAP (Kg)',  align:'right' },
                { label:'SCRAP %',     align:'right' },
                { label:'COSTO SCRAP', align:'right' },
                { label:'CAUSA',       align:'left'  },
              ].map(h => (
                <TableCell key={h.label} sx={{ ...thSx, textAlign:h.align }}>{h.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {SCRAP_DETALLE.map(r => (
              <TableRow key={r.producto} sx={{ '&:hover td':{ background:'rgba(84,126,105,.03)' } }}>
                <TableCell sx={{ ...tdSx }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, whiteSpace:'nowrap' }}>{r.producto}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, color:DL.tM }}>{r.scrapKg.toFixed(1)}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Box sx={{
                    display:'inline-flex', px:'6px', py:'2px', borderRadius:'4px',
                    background: r.scrapPct > 3 ? DL.redBg : r.scrapPct > 2 ? DL.yellowBg : DL.greenBg,
                  }}>
                    <Typography sx={{
                      fontSize:10, fontWeight: 500,
                      color: r.scrapPct > 3 ? DL.red : r.scrapPct > 2 ? DL.yellow : DL.green,
                    }}>
                      {r.scrapPct.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.red }}>{fmt$(r.costoScrap)}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx }}>
                  <Typography sx={{ fontSize:10, color:DL.tM }}>{r.causa}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {/* Total cost chip */}
      <Box sx={{
        display:'flex', alignItems:'center', justifyContent:'flex-end',
        px:'12px', py:'10px', borderTop:`1px solid ${DL.border}`,
      }}>
        <Box sx={{
          display:'inline-flex', alignItems:'center', gap:'8px',
          px:'12px', py:'6px', borderRadius:'8px',
          background:DL.redBg, border:`1px solid ${DL.redBd}`,
        }}>
          <Typography sx={{ fontSize:9, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.red }}>
            {t('costs.lbl.costoTotalScrap')}
          </Typography>
          <Typography sx={{ fontSize:14, fontWeight: 500, color:DL.red, letterSpacing:'-.02em' }}>
            {fmt$(totalCosto)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Cost Trend Chart ─────────────────────────────────────────────────────────
function CostTrendChart() {
  const { t } = useT();
  const option = useMemo(() => ({
    animation: true,
    animationDuration: 500,
    grid: { top:36, right:50, bottom:40, left:62 },
    legend: {
      show:true, top:4, right:0,
      textStyle:{ fontFamily:'Inter', fontSize:9, color:DL.tM },
      itemWidth:10, itemHeight:8,
    },
    xAxis: {
      type:'category', data:COST_TREND.meses,
      axisLine:{ lineStyle:{ color:'rgba(26,26,26,.12)' } },
      axisTick:{ show:false },
      axisLabel:{ fontFamily:'Inter', fontSize:10, color:DL.tS },
      splitLine:{ show:false },
    },
    yAxis: [
      {
        type:'value', name:'$',
        nameTextStyle:{ fontFamily:'Inter', fontSize:9, color:DL.tS },
        axisLabel:{
          fontFamily:'Inter', fontSize:10, color:DL.tS,
          formatter: v => `$${(v/1000).toFixed(0)}K`,
        },
        splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } },
        axisLine:{ show:false }, axisTick:{ show:false },
      },
      {
        type:'value', name:t('chart.variacionPct'),
        nameTextStyle:{ fontFamily:'Inter', fontSize:9, color:DL.tS },
        axisLabel:{ fontFamily:'Inter', fontSize:10, color:DL.tS, formatter:v => `${v}%` },
        axisLine:{ show:false }, axisTick:{ show:false }, splitLine:{ show:false },
        min:0, max:6,
      },
    ],
    tooltip: {
      trigger:'axis', axisPointer:{ type:'shadow' },
      backgroundColor:'#fff', borderColor:'rgba(26,26,26,.15)', borderWidth:1, padding:[10,14],
      textStyle:{ fontFamily:'Inter', fontSize:11, color:DL.tH },
      formatter: (params) => {
        let html = `<div style="font-family:Inter;font-size:11px;font-weight:500;color:${DL.tH};margin-bottom:6px">${params[0].name}</div>`;
        params.forEach(p => {
          const val = p.seriesName === t('chart.variacionPct')
            ? `${p.value}%`
            : `$${Number(p.value).toLocaleString()}`;
          html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color}"></span>
            <span style="font-size:10px;color:${DL.tM}">${p.seriesName}</span>
            <span style="font-size:10px;font-weight:500;color:${DL.tH};margin-left:auto">${val}</span>
          </div>`;
        });
        return html;
      },
    },
    series: [
      {
        name:t('chart.real'), type:'bar', yAxisIndex:0,
        data:COST_TREND.real,
        barWidth:12, barGap:'8%', barCategoryGap:'35%',
        itemStyle:{ color:DL.blue, borderRadius:[3,3,0,0] },
      },
      {
        name:t('chart.estandar'), type:'bar', yAxisIndex:0,
        data:COST_TREND.estandar,
        barWidth:12, barGap:'8%', barCategoryGap:'35%',
        itemStyle:{ color:'rgba(26,26,26,.22)', borderRadius:[3,3,0,0] },
      },
      {
        name:t('chart.variacionPct'), type:'line', yAxisIndex:1,
        data:COST_TREND.variacion,
        smooth:true, symbol:'circle', symbolSize:5,
        lineStyle:{ color:DL.yellow, width:2 },
        itemStyle:{ color:DL.yellow },
      },
    ],
  }), [t]);

  return (
    <Paper elevation={1} sx={{ p:'14px 12px 8px', height:'100%' }}>
      <SectionHeader title={t('sec.tendenciaCostos')} subtitle={t('sec.tendenciaCostos.sub')} />
      <ReactECharts option={option} style={{ height:260 }} />
    </Paper>
  );
}

// ─── Summary boxes for variación componentes ─────────────────────────────────
function ComponenteSummaryBoxes() {
  const { t } = useT();
  const configs = [
    { labelKey:'costs.lbl.materialDir', comp:VARIACION_COMPONENTES[0] },
    { labelKey:'costs.lbl.manoObra',   comp:VARIACION_COMPONENTES[1] },
    { labelKey:'costs.lbl.costosInd',  comp:VARIACION_COMPONENTES[2] },
  ];
  return (
    <Box sx={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', mt:'12px', px:'12px', pb:'12px' }}>
      {configs.map(({ labelKey, comp }) => {
        const varColor = comp.var < 0 ? DL.green : comp.var < 4 ? DL.yellow : DL.red;
        const varBg    = comp.var < 0 ? DL.greenBg : comp.var < 4 ? DL.yellowBg : DL.redBg;
        const varBd    = comp.var < 0 ? DL.greenBd : comp.var < 4 ? DL.yellowBd : DL.redBd;
        return (
          <Box key={labelKey} sx={{
            background:varBg, border:`1px solid ${varBd}`,
            borderRadius:'10px', p:'12px 14px',
            display:'flex', flexDirection:'column', gap:'4px',
          }}>
            <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:varColor }}>
              {t(labelKey)}
            </Typography>
            <Typography sx={{ fontSize:22, fontWeight: 500, color:varColor, letterSpacing:'-.03em', lineHeight:1 }}>
              {comp.var > 0 ? '+' : ''}{comp.var.toFixed(1)}%
            </Typography>
            <Typography sx={{ fontSize:9, color:varColor, fontWeight: 500 }}>
              {t('costs.lbl.varVsEstandar')}
            </Typography>
            <Box sx={{ display:'flex', justifyContent:'space-between', mt:'4px' }}>
              <Typography sx={{ fontSize:9, color:varColor }}>{t('costs.lbl.real')}: {fmt$(comp.real)}</Typography>
              <Typography sx={{ fontSize:9, color:varColor }}>{t('costs.lbl.est')}: {fmt$(comp.estandar)}</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CostosProduccion() {
  const { t } = useT();
  const [periodo,  setPeriodo]  = useState('abr2026');
  const [producto, setProducto] = useState('todos');
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);

  return (
    <Box>
      <PageHeader
        title={t('page.costos')}
        live={true}
        onRefresh={handleRefresh}
      >
        <MiniSelect
          label={t('filter.periodo')}
          value={periodo}
          onChange={setPeriodo}
          options={[
            { value:'abr2026', label:'Abril 2026'  },
            { value:'mar2026', label:'Marzo 2026'  },
            { value:'feb2026', label:'Febrero 2026'},
            { value:'q12026',  label:'Q1 2026'     },
          ]}
        />
        <MiniSelect
          label={t('col.producto')}
          value={producto}
          onChange={setProducto}
          options={[
            { value:'todos',     label:t('alert.todos')   },
            { value:'agrovit',   label:'AGROVIT PLUS 1L'  },
            { value:'pilaround', label:'PILAROUND 500ML'  },
            { value:'biomax',    label:'BIOMAX TABS'      },
            { value:'vetmec',    label:'VETMEC COMBO'     },
          ]}
        />
      </PageHeader>

      <Box sx={{ p:{ xs:'10px', md:'16px' }, display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* Row 1: 6 KPI cards */}
        <Box>
          <SectionHeader title={t('sec.kpisCostos')} subtitle="Abril 2026" />
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'10px' }}>
            <CostKpiCard
              label={t('costs.kpi.costoReal')}
              valueStr={`$${(COST_KPIS.costoReal.val/1000).toFixed(1)}K`}
              val={COST_KPIS.costoReal.val}
              ant={COST_KPIS.costoReal.ant}
              meta={COST_KPIS.costoReal.meta}
              isRisk={true}
            />
            <CostKpiCard
              label={t('costs.kpi.costoEstandar')}
              valueStr={`$${(COST_KPIS.costoEstandar.val/1000).toFixed(1)}K`}
              val={COST_KPIS.costoEstandar.val}
              ant={COST_KPIS.costoEstandar.ant}
              meta={COST_KPIS.costoEstandar.meta}
              isRisk={false}
            />
            <CostKpiCard
              label={t('costs.kpi.variacionTotal')}
              valueStr="3.1%"
              val={COST_KPIS.variacion.val}
              ant={COST_KPIS.variacion.ant}
              meta={COST_KPIS.variacion.meta}
              isRisk={true}
            />
            <CostKpiCard
              label={t('costs.kpi.eficienciaProd')}
              valueStr="87.4%"
              val={COST_KPIS.eficiencia.val}
              ant={COST_KPIS.eficiencia.ant}
              meta={COST_KPIS.eficiencia.meta}
              isRisk={false}
            />
            <CostKpiCard
              label={t('costs.kpi.scrapPct')}
              valueStr="3.2%"
              val={COST_KPIS.scrapPct.val}
              ant={COST_KPIS.scrapPct.ant}
              meta={COST_KPIS.scrapPct.meta}
              isRisk={true}
            />
            <CostKpiCard
              label={t('costs.kpi.costoPorUnidad')}
              valueStr="$32.4"
              val={COST_KPIS.costoUnidad.val}
              ant={COST_KPIS.costoUnidad.ant}
              meta={COST_KPIS.costoUnidad.meta}
              isRisk={true}
            />
          </Box>
        </Box>

        {/* Row 2: Trend chart + Alertas */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'16px', alignItems:'start' }}>
          <CostTrendChart />
          <AlertasCost />
        </Box>

        {/* Row 3: Variación por Componente full width */}
        <Paper elevation={1} sx={{ overflow:'hidden' }}>
          <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
            <SectionHeader title={t('sec.variacionCosto')} subtitle={t('sec.variacionCosto.sub')} />
          </Box>
          <VariacionComponentesTable />
          <ComponenteSummaryBoxes />
        </Paper>

        {/* Row 4: Costos OT + Scrap */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', alignItems:'start' }}>
          {/* Left: Costos por Orden de Trabajo */}
          <Paper elevation={1} sx={{ overflow:'hidden' }}>
            <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
              <SectionHeader title={t('costs.sec.costosOT')} />
            </Box>
            <CostosOTTable />
          </Paper>

          {/* Right: Scrap / Desperdicio */}
          <Paper elevation={1} sx={{ overflow:'hidden' }}>
            <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
              <SectionHeader title={t('sec.scrap')} subtitle={t('sec.scrap.sub')} />
            </Box>
            <ScrapTable />
          </Paper>
        </Box>

      </Box>
    </Box>
  );
}
