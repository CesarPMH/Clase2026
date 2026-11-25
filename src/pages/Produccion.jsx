// ─── Dashboard de Producción ──────────────────────────────────────────────────
// Objetivo: ¿Cómo van las órdenes de trabajo vs plan? ¿Dónde están los cuellos
//           de botella en eficiencia y scrap?

import { useState, useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Box, Typography, Paper,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';

import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import SectionHeader from '../components/common/SectionHeader';
import { useT } from '../i18n/LanguageContext';
import { DL } from '../theme';
import {
  PROD_KPIS,
  ORDENES_PRODUCCION,
  PROD_PRODUCTOS,
  CONSUMO_MATERIALES,
  PROD_TREND,
  ALERTAS_PROD,
} from '../data/produccion';

// ─── TIER_CFG for alerts ──────────────────────────────────────────────────────
const TIER_CFG = {
  r: { bg:DL.redBg,    bd:DL.redBd,    icon:'▲', color:DL.red    },
  y: { bg:DL.yellowBg, bd:DL.yellowBd, icon:'△', color:DL.yellow },
  g: { bg:DL.greenBg,  bd:DL.greenBd,  icon:'✓', color:DL.green  },
};

// ─── Standard KPI Card ────────────────────────────────────────────────────────
function ProdKpiCard({ label, valueStr, val, ant, meta, isRisk }) {
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
          Meta
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
        {pct.toFixed(0)}% de meta
      </Typography>
      {/* VS AÑO ANT. footer */}
      <Box sx={{
        background:DL.subtle, borderRadius:'5px', p:'4px 7px',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:'5px', mt:'auto',
      }}>
        <Typography sx={{ fontSize:7.5, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em' }}>
          VS AÑO ANT.
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
function AlertasProd() {
  const { t } = useT();
  const [filter, setFilter] = useState('todos');
  const shown =
    filter === 'criticos'  ? ALERTAS_PROD.filter(a => a.tier === 'r') :
    filter === 'atencion'  ? ALERTAS_PROD.filter(a => a.tier === 'y') :
    filter === 'positivos' ? ALERTAS_PROD.filter(a => a.tier === 'g') :
    ALERTAS_PROD;

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

// ─── Estado chip helper ───────────────────────────────────────────────────────
function EstadoChip({ estado }) {
  const [bg, color] =
    estado === 'Cerrada'  ? [DL.greenBg,  DL.green]  :
    estado === 'En curso' ? ['rgba(84,126,105,.12)', DL.blue] :
                            ['rgba(26,26,26,.07)',  DL.tM];
  return (
    <Box sx={{
      display:'inline-flex', alignItems:'center', gap:'3px',
      px:'7px', py:'2px', borderRadius:'4px', background:bg,
    }}>
      <Box sx={{ width:4, height:4, borderRadius:'50%', background:color, flexShrink:0 }} />
      <Typography sx={{ fontSize:9, fontWeight: 500, color }}>{estado}</Typography>
    </Box>
  );
}

// ─── Common table header cell sx ─────────────────────────────────────────────
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

// ─── Órdenes de Producción Table ──────────────────────────────────────────────
function OrdenesProduccionTable() {
  const { t } = useT();
  const [tab, setTab] = useState('todas');
  const TABS = [
    { value:'encurso',    label: t('prod2.tab.enCurso')     },
    { value:'planif',     label: t('prod2.tab.planificadas') },
    { value:'cerradas',   label: t('prod2.tab.cerradas')     },
    { value:'todas',      label: t('prod2.tab.todas')        },
  ];

  const rows = useMemo(() => {
    if (tab === 'encurso')  return ORDENES_PRODUCCION.filter(r => r.estado === 'En curso');
    if (tab === 'planif')   return ORDENES_PRODUCCION.filter(r => r.estado === 'Planif.');
    if (tab === 'cerradas') return ORDENES_PRODUCCION.filter(r => r.estado === 'Cerrada');
    return ORDENES_PRODUCCION;
  }, [tab]);

  return (
    <Paper elevation={1} sx={{ overflow:'hidden' }}>
      <Box sx={{
        px:'16px', py:'10px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:`1px solid ${DL.border}`, flexWrap:'wrap', gap:'8px',
      }}>
        <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH }}>Órdenes de Producción</Typography>
        {/* Tab buttons */}
        <Box sx={{ display:'flex', gap:'1px', background:DL.subtle, border:`1px solid ${DL.border2}`, borderRadius:'7px', p:'2px' }}>
          {TABS.map(t => (
            <Box
              key={t.value}
              component="button"
              onClick={() => setTab(t.value)}
              sx={{
                fontFamily:"'Inter',sans-serif",
                fontSize:9, fontWeight: 500,
                px:'10px', py:'4px', borderRadius:'5px', border:'none',
                cursor:'pointer', whiteSpace:'nowrap', transition:'all .14s',
                background: tab === t.value ? '#fff' : 'transparent',
                color: tab === t.value ? DL.navy : DL.tM,
                boxShadow: tab === t.value ? '0 1px 3px rgba(0,0,70,.1)' : 'none',
                '&:hover':{ color:DL.tH },
              }}
            >
              {t.label}
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ overflowX:'auto' }}>
        <Table size="small" sx={{ minWidth:800 }}>
          <TableHead>
            <TableRow>
              {['OT','PRODUCTO','CANTIDAD','PRODUCIDO','ESTADO','INICIO','FIN','CICLO (días)','EFIC. %','SCRAP %'].map(h => (
                <TableCell key={h} sx={{ ...thSx, textAlign: ['CANTIDAD','PRODUCIDO','CICLO (días)','EFIC. %','SCRAP %'].includes(h) ? 'right' : 'left' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => {
              const eficColor =
                r.estado !== 'Cerrada' ? DL.tS :
                r.efic >= 95 ? DL.green : r.efic >= 90 ? DL.yellow : DL.red;
              return (
                <TableRow key={r.id} sx={{ '&:hover td':{ background:'rgba(84,126,105,.03)' } }}>
                  <TableCell sx={{ ...tdSx }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.blue, whiteSpace:'nowrap' }}>{r.id}</Typography>
                  </TableCell>
                  <TableCell sx={{ ...tdSx }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, whiteSpace:'nowrap' }}>{r.producto}</Typography>
                  </TableCell>
                  <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                    <Typography sx={{ fontSize:10, color:DL.tM, fontWeight: 500 }}>{r.cantidad.toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color: r.producido > 0 ? DL.tH : DL.tS }}>
                      {r.producido > 0 ? r.producido.toLocaleString() : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...tdSx }}>
                    <EstadoChip estado={r.estado} />
                  </TableCell>
                  <TableCell sx={{ ...tdSx }}>
                    <Typography sx={{ fontSize:10, color:DL.tS }}>{r.inicio}</Typography>
                  </TableCell>
                  <TableCell sx={{ ...tdSx }}>
                    <Typography sx={{ fontSize:10, color:DL.tS }}>{r.fin || '—'}</Typography>
                  </TableCell>
                  <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                    <Typography sx={{ fontSize:10, color:DL.tM }}>{r.ciclo > 0 ? r.ciclo.toFixed(1) : '—'}</Typography>
                  </TableCell>
                  <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:eficColor }}>
                      {r.efic > 0 ? `${r.efic.toFixed(1)}%` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color: r.scrap > 3 ? DL.red : r.scrap > 0 ? DL.tM : DL.tS }}>
                      {r.scrap > 0 ? `${r.scrap.toFixed(1)}%` : '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}

// ─── Productos Resumen Table ──────────────────────────────────────────────────
function ProductosResumenTable() {
  return (
    <Box sx={{ overflowX:'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {[
              { label:'PRODUCTO',  align:'left'  },
              { label:'PLAN MES',  align:'right' },
              { label:'PRODUCIDO', align:'right' },
              { label:'CUMPL. %',  align:'right' },
              { label:'CICLO',     align:'right' },
              { label:'EFIC.',     align:'right' },
              { label:'SCRAP',     align:'right' },
            ].map(h => (
              <TableCell key={h.label} sx={{ ...thSx, textAlign:h.align }}>{h.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {PROD_PRODUCTOS.map(r => {
            const cumplColor = r.cumpl >= 100 ? DL.green : r.cumpl >= 90 ? DL.yellow : r.cumpl > 0 ? DL.red : DL.tS;
            const cumplW = Math.min(r.cumpl, 100);
            return (
              <TableRow key={r.nombre} sx={{ '&:hover td':{ background:'rgba(84,126,105,.03)' } }}>
                <TableCell sx={{ ...tdSx }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:'5px' }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>{r.nombre}</Typography>
                    {r.tendencia !== '—' && (
                      <Typography sx={{ fontSize:10, color: r.tendencia === 'up' ? DL.green : DL.red }}>
                        {r.tendencia === 'up' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, color:DL.tM }}>{r.planMes.toLocaleString()}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>
                    {r.producido > 0 ? r.producido.toLocaleString() : '—'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right', minWidth:100 }}>
                  {r.cumpl > 0 ? (
                    <Box>
                      <Box sx={{ display:'flex', justifyContent:'flex-end', mb:'2px' }}>
                        <Typography sx={{ fontSize:10, fontWeight: 500, color:cumplColor }}>{r.cumpl}%</Typography>
                      </Box>
                      <Box sx={{ height:5, background:'#e3e3e3', borderRadius:3, overflow:'hidden' }}>
                        <Box sx={{ height:'100%', borderRadius:3, width:`${cumplW}%`, background:cumplColor, transition:'width .8s' }} />
                      </Box>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize:10, color:DL.tS }}>—</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, color:DL.tM }}>{r.tiempoCiclo.toFixed(1)}d</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color: r.efic >= 95 ? DL.green : r.efic >= 90 ? DL.yellow : r.efic > 0 ? DL.red : DL.tS }}>
                    {r.efic > 0 ? `${r.efic}%` : '—'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color: r.scrap > 3 ? DL.red : r.scrap > 0 ? DL.tM : DL.tS }}>
                    {r.scrap > 0 ? `${r.scrap}%` : '—'}
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

// ─── Consumo Materiales Table ─────────────────────────────────────────────────
function ConsumoMaterialesTable() {
  return (
    <Box sx={{ overflowX:'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {[
              { label:'MATERIAL',     align:'left'  },
              { label:'UOM',          align:'center'},
              { label:'PLANIFICADO',  align:'right' },
              { label:'REAL',         align:'right' },
              { label:'VAR. %',       align:'right' },
            ].map(h => (
              <TableCell key={h.label} sx={{ ...thSx, textAlign:h.align }}>{h.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {CONSUMO_MATERIALES.map(r => {
            const varPos = r.variacion >= 0;
            const varColor = Math.abs(r.variacion) < 2 ? DL.tM : varPos ? DL.yellow : DL.green;
            return (
              <TableRow key={r.material} sx={{ '&:hover td':{ background:'rgba(84,126,105,.03)' } }}>
                <TableCell sx={{ ...tdSx }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>{r.material}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'center' }}>
                  <Typography sx={{ fontSize:10, color:DL.tS }}>{r.unidad}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, color:DL.tM }}>{r.planificado.toLocaleString()}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>{r.real.toLocaleString()}</Typography>
                </TableCell>
                <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                  <Box sx={{
                    display:'inline-flex', alignItems:'center', gap:'3px',
                    px:'6px', py:'2px', borderRadius:'4px',
                    background: varPos ? DL.yellowBg : DL.greenBg,
                  }}>
                    <Typography sx={{ fontSize:9, fontWeight: 500, color:varColor }}>
                      {varPos ? '↑' : '↓'} {varPos ? '+' : ''}{r.variacion.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

// ─── Producción Trend Chart ───────────────────────────────────────────────────
function ProduccionTrendChart() {
  const { t } = useT();
  const option = useMemo(() => ({
    animation: true,
    animationDuration: 500,
    grid: { top:32, right:50, bottom:40, left:40 },
    legend: {
      show: true, top:4, right:0,
      textStyle:{ fontFamily:'Inter', fontSize:9, color:DL.tM },
      itemWidth:10, itemHeight:8,
    },
    xAxis: {
      type:'category', data:PROD_TREND.meses,
      axisLine:{ lineStyle:{ color:'rgba(26,26,26,.12)' } },
      axisTick:{ show:false },
      axisLabel:{ fontFamily:'Inter', fontSize:10, color:DL.tS },
      splitLine:{ show:false },
    },
    yAxis: [
      {
        type:'value', name:'OTs', nameTextStyle:{ fontFamily:'Inter', fontSize:9, color:DL.tS },
        axisLabel:{ fontFamily:'Inter', fontSize:10, color:DL.tS },
        splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } },
        axisLine:{ show:false }, axisTick:{ show:false },
        min: 0,
      },
      {
        type:'value', name:'Efic.%', nameTextStyle:{ fontFamily:'Inter', fontSize:9, color:DL.tS },
        axisLabel:{ fontFamily:'Inter', fontSize:10, color:DL.tS, formatter:v => `${v}%` },
        axisLine:{ show:false }, axisTick:{ show:false }, splitLine:{ show:false },
        min:70, max:100,
      },
    ],
    tooltip: {
      trigger:'axis', axisPointer:{ type:'shadow' },
      backgroundColor:'#fff', borderColor:'rgba(26,26,26,.15)', borderWidth:1, padding:[10,14],
      textStyle:{ fontFamily:'Inter', fontSize:11, color:DL.tH },
    },
    series: [
      {
        name:'Plan', type:'bar', yAxisIndex:0,
        data:PROD_TREND.plan,
        barWidth:10, barGap:'10%', barCategoryGap:'35%',
        itemStyle:{ color:'rgba(26,26,26,.18)', borderRadius:[3,3,0,0] },
      },
      {
        name:'Cerradas', type:'bar', yAxisIndex:0,
        data:PROD_TREND.cerradas,
        barWidth:10, barGap:'10%', barCategoryGap:'35%',
        itemStyle:{ color:DL.blue, borderRadius:[3,3,0,0] },
      },
      {
        name:'Eficiencia %', type:'line', yAxisIndex:1,
        data:PROD_TREND.efic,
        smooth:true, symbol:'circle', symbolSize:5,
        lineStyle:{ color:DL.green, width:2 },
        itemStyle:{ color:DL.green },
      },
    ],
  }), []);

  return (
    <Paper elevation={1} sx={{ p:'14px 12px 8px', height:'100%' }}>
      <SectionHeader title={t('sec.tendenciaProduccion')} subtitle={t('sec.tendenciaProduccion.sub')} />
      <ReactECharts option={option} style={{ height:260 }} />
    </Paper>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Produccion() {
  const { t } = useT();
  const [periodo,  setPeriodo]  = useState('abr2026');
  const [producto, setProducto] = useState('todos');
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);

  return (
    <Box>
      <PageHeader
        title={t('page.produccion')}
        live={true}
        onRefresh={handleRefresh}
      >
        <MiniSelect
          label="Período"
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
          label="Producto"
          value={producto}
          onChange={setProducto}
          options={[
            { value:'todos',         label:'Todos'          },
            { value:'agrovit',       label:'AGROVIT PLUS 1L'},
            { value:'pilaround',     label:'PILAROUND 500ML'},
            { value:'biomax',        label:'BIOMAX TABS'    },
            { value:'vetmec',        label:'VETMEC COMBO'   },
          ]}
        />
      </PageHeader>

      <Box sx={{ p:{ xs:'10px', md:'16px' }, display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* Row 1: 6 KPI cards */}
        <Box>
          <SectionHeader title={t('sec.kpisProduccion')} subtitle="Abril 2026" />
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'10px' }}>
            <ProdKpiCard
              label={t('prod2.kpi.otAbiertas')}
              valueStr="12 OTs"
              val={PROD_KPIS.otAbiertas.val}
              ant={PROD_KPIS.otAbiertas.ant}
              meta={PROD_KPIS.otAbiertas.meta}
              isRisk={true}
            />
            <ProdKpiCard
              label={t('prod2.kpi.otCerradas')}
              valueStr="38 OTs"
              val={PROD_KPIS.otCerradas.val}
              ant={PROD_KPIS.otCerradas.ant}
              meta={PROD_KPIS.otCerradas.meta}
              isRisk={false}
            />
            <ProdKpiCard
              label={t('prod2.kpi.cumplPlan')}
              valueStr="84.2%"
              val={PROD_KPIS.cumplimiento.val}
              ant={PROD_KPIS.cumplimiento.ant}
              meta={PROD_KPIS.cumplimiento.meta}
              isRisk={false}
            />
            <ProdKpiCard
              label={t('prod2.kpi.tiempoCiclo')}
              valueStr={`3.8 ${t('lbl.dias')}`}
              val={PROD_KPIS.tiempoPromedio.val}
              ant={PROD_KPIS.tiempoPromedio.ant}
              meta={PROD_KPIS.tiempoPromedio.meta}
              isRisk={true}
            />
            <ProdKpiCard
              label={t('prod2.kpi.eficienciaProd')}
              valueStr="87.4%"
              val={PROD_KPIS.eficiencia.val}
              ant={PROD_KPIS.eficiencia.ant}
              meta={PROD_KPIS.eficiencia.meta}
              isRisk={false}
            />
            <ProdKpiCard
              label={t('prod2.kpi.scrap')}
              valueStr="3.2%"
              val={PROD_KPIS.scrap.val}
              ant={PROD_KPIS.scrap.ant}
              meta={PROD_KPIS.scrap.meta}
              isRisk={true}
            />
          </Box>
        </Box>

        {/* Row 2: Trend chart + Alertas */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'16px', alignItems:'start' }}>
          <ProduccionTrendChart />
          <AlertasProd />
        </Box>

        {/* Row 3: Órdenes de Producción full width */}
        <OrdenesProduccionTable />

        {/* Row 4: Rendimiento por Producto + Consumo Materiales */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', alignItems:'start' }}>
          {/* Left: Rendimiento por Producto */}
          <Paper elevation={1} sx={{ overflow:'hidden' }}>
            <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
              <SectionHeader title={t('sec.rendimientoProducto')} />
            </Box>
            <ProductosResumenTable />
          </Paper>

          {/* Right: Consumo de Materiales */}
          <Paper elevation={1} sx={{ overflow:'hidden' }}>
            <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
              <SectionHeader title={t('sec.consumoMateriales')} subtitle={t('sec.consumoMateriales.sub')} />
            </Box>
            <ConsumoMaterialesTable />
          </Paper>
        </Box>

      </Box>
    </Box>
  );
}
