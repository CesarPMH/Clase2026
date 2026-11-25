// ─── SANTA ANA — Cadena de Suministro Dashboard ─────────────────────────────
// KPIs estratégicos basados en modelo integral CDS: Fill Rate, DOH, Rotación,
// Exactitud, OTIF Proveedores, Compras Urgentes, Quiebres, Nivel de Servicio,
// Vencimientos, Sobreinventario, Lead Time, Merma.

import { useState, useMemo } from 'react';
import {
  Box, Typography, Paper,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  LinearProgress,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { DL } from '../theme';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';

const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";
const fmt$ = (v) => 'Q' + Number(v).toLocaleString('en-US');
const fmtPct = (v) => v + '%';

// ─── DEMO DATA ───────────────────────────────────────────────────────────────
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const KPI_CARDS = [
  { id:'fillRate',    label:'Fill Rate',           val:'87%',  raw:87,  target:95,  unit:'%',   dir:'up',   desc:'% de demanda satisfecha',          color: '#ea580c' },
  { id:'doh',         label:'DOH Promedio',         val:'42d',  raw:42,  target:35,  unit:'d',   dir:'down', desc:'Días de inventario disponible',     color: '#ea580c' },
  { id:'rotacion',    label:'Rotación',             val:'4.8×', raw:4.8, target:6,   unit:'×',   dir:'up',   desc:'Vueltas del inventario al año',     color: '#d97706' },
  { id:'exactitud',   label:'Exactitud Inv.',       val:'94%',  raw:94,  target:98,  unit:'%',   dir:'up',   desc:'Físico vs. sistema',                color: '#d97706' },
  { id:'otif',        label:'OTIF Proveedores',     val:'78%',  raw:78,  target:90,  unit:'%',   dir:'up',   desc:'Entrega a tiempo y completa',       color: '#dc2626' },
  { id:'urgentes',    label:'Compras Urgentes',     val:'22%',  raw:22,  target:10,  unit:'%',   dir:'down', desc:'% compras no planificadas',         color: '#dc2626' },
  { id:'quiebres',    label:'Quiebres de Stock',    val:'38',   raw:38,  target:20,  unit:'SKU', dir:'down', desc:'SKUs sin stock disponible',         color: '#ea580c' },
  { id:'servicio',    label:'Nivel de Servicio',    val:'91%',  raw:91,  target:97,  unit:'%',   dir:'up',   desc:'Pedidos perfectos al cliente',      color: '#d97706' },
  { id:'merma',       label:'Merma / Daños',        val:'1.8%', raw:1.8, target:1,   unit:'%',   dir:'down', desc:'Tasa de pérdida operacional',       color: '#dc2626' },
  { id:'leadtime',    label:'Lead Time Prom.',      val:'14d',  raw:14,  target:10,  unit:'d',   dir:'down', desc:'Días promedio de entrega proveedor',color: '#d97706' },
  { id:'sobreinv',    label:'Sobreinventario',      val:'Q480K',raw:480, target:200, unit:'K',   dir:'down', desc:'Exceso de stock inmovilizado',      color: '#dc2626' },
  { id:'vencimientos',label:'Vencimientos',         val:'12',   raw:12,  target:5,   unit:'SKU', dir:'down', desc:'SKUs próximos a caducar (30d)',     color: '#ea580c' },
];

// DOH + Fill Rate mensual (últimos 12 meses)
const TREND_MENSUAL = [
  { mes:'Ene', doh:55, fillRate:82, otif:72, urgentes:28 },
  { mes:'Feb', doh:52, fillRate:83, otif:74, urgentes:26 },
  { mes:'Mar', doh:50, fillRate:84, otif:75, urgentes:25 },
  { mes:'Abr', doh:48, fillRate:85, otif:76, urgentes:24 },
  { mes:'May', doh:47, fillRate:85, otif:77, urgentes:23 },
  { mes:'Jun', doh:46, fillRate:86, otif:76, urgentes:23 },
  { mes:'Jul', doh:44, fillRate:86, otif:78, urgentes:22 },
  { mes:'Ago', doh:45, fillRate:87, otif:77, urgentes:22 },
  { mes:'Sep', doh:43, fillRate:87, otif:79, urgentes:21 },
  { mes:'Oct', doh:42, fillRate:87, otif:78, urgentes:22 },
  { mes:'Nov', doh:42, fillRate:87, otif:78, urgentes:22 },
  { mes:'Dic', doh:40, fillRate:88, otif:80, urgentes:20 }, // proyección
];

// DOH por categoría ABC
const DOH_ABC = [
  { cat:'A', doh:18, target:20, skus:170,  color:'#547e69' },
  { cat:'B', doh:34, target:35, skus:340,  color:'#4d3f32' },
  { cat:'C', doh:68, target:45, skus:1190, color:'#d97706' },
];

// Compras urgentes vs planificadas (mensual)
const COMPRAS_MENSUAL = [
  { mes:'Jul', plan:820, urgente:220 },
  { mes:'Ago', plan:780, urgente:210 },
  { mes:'Sep', plan:860, urgente:205 },
  { mes:'Oct', plan:900, urgente:215 },
  { mes:'Nov', plan:840, urgente:200 },
  { mes:'Dic', plan:870, urgente:190 },
];

// OTIF por proveedor
const OTIF_PROVEEDORES = [
  { nombre:'Bayer CropScience',   otif:88, pedidos:24, enTiempo:21 },
  { nombre:'BASF Guatemala',      otif:82, pedidos:18, enTiempo:15 },
  { nombre:'Agroquímicos del Sur',otif:76, pedidos:31, enTiempo:24 },
  { nombre:'Vetanco',             otif:71, pedidos:15, enTiempo:11 },
  { nombre:'Proveedor Local A',   otif:65, pedidos:28, enTiempo:18 },
  { nombre:'Distrib. Central',    otif:92, pedidos:12, enTiempo:11 },
  { nombre:'Semillas Pacífico',   otif:79, pedidos:20, enTiempo:16 },
];

// Quiebres de stock (Top SKUs)
const QUIEBRES = [
  { sku:'PILAROUND 500ML',     cat:'A', diasSinStock:8,  ventaPerdidaQ:12400, rotacion:5.2 },
  { sku:'HERBICIDA X20 1L',    cat:'A', diasSinStock:5,  ventaPerdidaQ:8900,  rotacion:4.8 },
  { sku:'VACUNA BOVINO TRIPLE',cat:'A', diasSinStock:12, ventaPerdidaQ:7200,  rotacion:6.1 },
  { sku:'VETMEC COMBO',        cat:'B', diasSinStock:3,  ventaPerdidaQ:4100,  rotacion:3.9 },
  { sku:'AGROFER 5KG',         cat:'B', diasSinStock:6,  ventaPerdidaQ:3800,  rotacion:4.2 },
  { sku:'NUTRISEM PRO 25KG',   cat:'B', diasSinStock:4,  ventaPerdidaQ:2900,  rotacion:3.1 },
  { sku:'BIOFILM 1L',          cat:'C', diasSinStock:18, ventaPerdidaQ:1200,  rotacion:1.4 },
];

// Sobreinventario (Top SKUs)
const SOBREINVENTARIO = [
  { sku:'CONCENTRADO PREM. 50KG', cat:'C', doh:487, stockQ:62000,  excesoPct:82, costoExceso:48000 },
  { sku:'VITAVET B12 10ML',       cat:'B', doh:180, stockQ:28000,  excesoPct:65, costoExceso:31200 },
  { sku:'CALCIVIT INY 100ML',     cat:'B', doh:259, stockQ:18000,  excesoPct:74, costoExceso:22800 },
  { sku:'FERTIMIX 2L',            cat:'C', doh:140, stockQ:15200,  excesoPct:51, costoExceso:14600 },
  { sku:'BIOMAX TABS 100U',       cat:'C', doh:120, stockQ:12400,  excesoPct:48, costoExceso:11800 },
  { sku:'ANTIBIÓTICO BOV. 30ML',  cat:'C', doh:92,  stockQ:9800,   excesoPct:44, costoExceso:8400  },
];

// Vencimientos próximos
const VENCIMIENTOS = [
  { sku:'VACUNA MULTIVALENTE 10ML', lote:'L-240318', vence:'15/01/2026', diasRestantes:19, unidades:240,  valorQ:9240,  accion:'Liquidar urgente' },
  { sku:'ANTIBIÓTICO BOV. 30ML',    lote:'L-240512', vence:'22/01/2026', diasRestantes:26, unidades:180,  valorQ:5148,  accion:'Promoción / descuento' },
  { sku:'CALCIVIT INY 100ML',       lote:'L-240601', vence:'28/01/2026', diasRestantes:32, unidades:310,  valorQ:4495,  accion:'Reubicar a rotación' },
  { sku:'BIOFILM 1L',               lote:'L-240415', vence:'05/02/2026', diasRestantes:40, unidades:95,   valorQ:532,   accion:'Mover a primera línea' },
  { sku:'NUTRISEM PRO 25KG',        lote:'L-240720', vence:'14/02/2026', diasRestantes:49, unidades:44,   valorQ:818,   accion:'Incluir en promo' },
];

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const SL = ({ children }) => (
  <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.07em', mb:'10px', fontFamily:FONT }}>
    {children}
  </Typography>
);

const TH_SX = {
  fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'.07em',
  color:DL.tS, background:'rgba(26,26,26,.025)',
  borderBottom:'2px solid rgba(26,26,26,.08)', px:'10px', py:'7px', whiteSpace:'nowrap',
};
const TD_SX = { fontSize:10, px:'10px', py:'8px', borderBottom:`1px solid ${DL.border}` };

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KpiBlock({ kpi }) {
  const isGood = kpi.dir === 'up' ? kpi.raw >= kpi.target : kpi.raw <= kpi.target;
  const isWarn = kpi.dir === 'up'
    ? kpi.raw >= kpi.target * 0.9 && kpi.raw < kpi.target
    : kpi.raw <= kpi.target * 1.3 && kpi.raw > kpi.target;
  const status = isGood ? 'green' : isWarn ? 'yellow' : 'red';
  const accentColor = status === 'green' ? DL.green : status === 'yellow' ? '#d97706' : DL.red;
  const pct = kpi.dir === 'up'
    ? Math.min(Math.round((kpi.raw / kpi.target) * 100), 130)
    : Math.min(Math.round((kpi.target / kpi.raw) * 100), 130);

  return (
    <Paper elevation={0} sx={{
      border:`1px solid ${DL.border}`, borderRadius:'10px', p:'12px 14px',
      borderTop:`3px solid ${accentColor}`, position:'relative', overflow:'hidden',
      transition:'transform .15s, box-shadow .15s',
      '&:hover':{ transform:'translateY(-1px)', boxShadow:DL.e2 },
    }}>
      <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'.06em', mb:'4px', fontFamily:FONT }}>
        {kpi.label}
      </Typography>
      <Box sx={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
        <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, letterSpacing:'-.04em', lineHeight:1, fontFamily:FONT }}>
          {kpi.val}
        </Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:'3px' }}>
          <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FONT }}>meta</Typography>
          <Typography sx={{ fontSize:8, fontWeight: 500, color:accentColor, fontFamily:FONT }}>
            {kpi.target}{kpi.unit}
          </Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize:8, color:DL.tS, mt:'2px', mb:'8px', fontFamily:FONT }}>{kpi.desc}</Typography>
      <Box sx={{ height:5, borderRadius:3, background:'rgba(26,26,26,.07)', overflow:'hidden' }}>
        <Box sx={{ height:'100%', width:`${Math.min(pct,100)}%`, borderRadius:3, background:accentColor, transition:'width .8s ease' }} />
      </Box>
      <Box sx={{ position:'absolute', top:'10px', right:'10px' }}>
        <Box sx={{ width:6, height:6, borderRadius:'50%', background:accentColor }} />
      </Box>
    </Paper>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SecHeader({ title, subtitle }) {
  return (
    <Box sx={{ mb:'10px' }}>
      <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, mt:'1px' }}>{subtitle}</Typography>}
    </Box>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function SantaAna() {
  const [periodo, setPeriodo] = useState('2025');
  const [trendMetric, setTrendMetric] = useState('fillRate');

  // Trend chart option
  const trendOption = useMemo(() => {
    const metrics = {
      fillRate: { label:'Fill Rate %', color:'#547e69', target:95,  data: TREND_MENSUAL.map(m=>m.fillRate) },
      doh:      { label:'DOH (días)',   color:'#4d3f32', target:35,  data: TREND_MENSUAL.map(m=>m.doh)      },
      otif:     { label:'OTIF %',       color:'#059669', target:90,  data: TREND_MENSUAL.map(m=>m.otif)     },
      urgentes: { label:'Comp. Urgentes %', color:'#dc2626', target:10, data: TREND_MENSUAL.map(m=>m.urgentes) },
    };
    const m = metrics[trendMetric];
    return {
      animation: true,
      grid: { top:30, right:20, bottom:30, left:44 },
      tooltip: { trigger:'axis', backgroundColor:'#fff', borderColor:'#e3e3e3', borderWidth:1, textStyle:{ fontFamily:FONT, fontSize:11 } },
      xAxis: { type:'category', data: TREND_MENSUAL.map(m=>m.mes), axisLabel:{ fontFamily:FONT, fontSize:10, color:'#8d8d8d' }, axisLine:{ lineStyle:{ color:'rgba(26,26,26,.12)' } }, axisTick:{ show:false }, splitLine:{ show:false } },
      yAxis: { type:'value', axisLabel:{ fontFamily:FONT, fontSize:10, color:'#8d8d8d' }, splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } }, axisLine:{ show:false }, axisTick:{ show:false } },
      series: [
        {
          name: m.label, type:'line', smooth:true, data: m.data,
          symbol:'circle', symbolSize:6,
          lineStyle:{ color:m.color, width:2.5 },
          itemStyle:{ color:m.color },
          areaStyle:{ color:{ type:'linear', x:0, y:0, x2:0, y2:1, colorStops:[{ offset:0, color:m.color+'30' },{ offset:1, color:m.color+'03' }] } },
        },
        {
          name:'Meta', type:'line', data: Array(12).fill(m.target),
          lineStyle:{ color:'#d97706', width:1.5, type:'dashed' },
          symbol:'none', itemStyle:{ color:'#d97706' },
        },
      ],
      legend: { show:true, bottom:0, left:'center', itemWidth:10, itemHeight:10, textStyle:{ fontFamily:FONT, fontSize:9, color:'#8d8d8d' } },
    };
  }, [trendMetric]);

  // DOH por ABC chart
  const dohAbcOption = {
    animation: true,
    grid: { top:10, right:16, bottom:30, left:44 },
    tooltip: { trigger:'axis', backgroundColor:'#fff', borderColor:'#e3e3e3', borderWidth:1, textStyle:{ fontFamily:FONT, fontSize:11 } },
    xAxis: { type:'category', data: DOH_ABC.map(d=>d.cat+' ('+d.skus+' SKUs)'), axisLabel:{ fontFamily:FONT, fontSize:10, color:'#8d8d8d' }, axisLine:{ lineStyle:{ color:'rgba(26,26,26,.12)' } }, axisTick:{ show:false }, splitLine:{ show:false } },
    yAxis: { type:'value', name:'Días', nameTextStyle:{ fontFamily:FONT, fontSize:9, color:'#8d8d8d' }, axisLabel:{ fontFamily:FONT, fontSize:9, color:'#8d8d8d' }, splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } }, axisLine:{ show:false }, axisTick:{ show:false } },
    series: [
      {
        name:'DOH Actual', type:'bar', barMaxWidth:32,
        data: DOH_ABC.map(d => ({ value: d.doh, itemStyle:{ color: d.doh>d.target ? '#dc2626' : '#547e69', borderRadius:[4,4,0,0] } })),
        label:{ show:true, position:'top', fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tH, formatter: v => v.data.value+'d' },
      },
      {
        name:'Meta', type:'scatter', symbol:'diamond', symbolSize:10,
        data: DOH_ABC.map(d => ({ value: d.target, itemStyle:{ color:'#d97706' } })),
      },
    ],
  };

  // Compras urgentes vs planificadas
  const comprasOption = {
    animation: true,
    grid: { top:10, right:16, bottom:30, left:48 },
    tooltip: { trigger:'axis', axisPointer:{ type:'shadow' }, backgroundColor:'#fff', borderColor:'#e3e3e3', borderWidth:1, textStyle:{ fontFamily:FONT, fontSize:11 } },
    xAxis: { type:'category', data: COMPRAS_MENSUAL.map(c=>c.mes), axisLabel:{ fontFamily:FONT, fontSize:10, color:'#8d8d8d' }, axisLine:{ lineStyle:{ color:'rgba(26,26,26,.12)' } }, axisTick:{ show:false }, splitLine:{ show:false } },
    yAxis: { type:'value', axisLabel:{ fontFamily:FONT, fontSize:9, color:'#8d8d8d', formatter:v=>'Q'+v+'K' }, splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } }, axisLine:{ show:false }, axisTick:{ show:false } },
    legend: { show:true, bottom:0, left:'center', itemWidth:10, itemHeight:10, textStyle:{ fontFamily:FONT, fontSize:9, color:'#8d8d8d' } },
    series: [
      { name:'Planificadas', type:'bar', stack:'total', barMaxWidth:28, itemStyle:{ color:'#059669', borderRadius:[0,0,0,0] }, data: COMPRAS_MENSUAL.map(c=>c.plan) },
      { name:'Urgentes',     type:'bar', stack:'total', barMaxWidth:28, itemStyle:{ color:'#dc2626', borderRadius:[4,4,0,0] }, data: COMPRAS_MENSUAL.map(c=>c.urgente) },
    ],
  };

  // OTIF horizontal bar
  const otifOption = {
    animation: true,
    grid: { top:8, right:60, bottom:10, left:140 },
    tooltip: { trigger:'axis', axisPointer:{ type:'shadow' }, backgroundColor:'#fff', borderColor:'#e3e3e3', borderWidth:1, textStyle:{ fontFamily:FONT, fontSize:11 }, formatter: p => `${p[0].name}<br/>OTIF: <b>${p[0].value}%</b>` },
    xAxis: { type:'value', max:100, axisLabel:{ fontFamily:FONT, fontSize:9, color:'#8d8d8d', formatter:v=>v+'%' }, splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } }, axisLine:{ show:false }, axisTick:{ show:false } },
    yAxis: { type:'category', data: OTIF_PROVEEDORES.map(p=>p.nombre).reverse(), axisLabel:{ fontFamily:FONT, fontSize:9.5, color:DL.tM }, axisLine:{ show:false }, axisTick:{ show:false } },
    series: [{
      name:'OTIF %', type:'bar', barMaxWidth:14,
      data: OTIF_PROVEEDORES.map(p => p.otif).reverse().map(v => ({
        value: v,
        itemStyle:{ color: v>=90 ? '#059669' : v>=80 ? '#d97706' : '#dc2626', borderRadius:[0,4,4,0] },
        label:{ show:true, position:'right', fontFamily:FONT, fontSize:9, fontWeight: 500, color:DL.tH, formatter: val => val.value+'%' },
      })),
    }],
  };

  const catColor = (c) => c==='A' ? '#547e69' : c==='B' ? '#4d3f32' : '#8d8d8d';

  return (
    <Box sx={{ p:{ xs:'10px', md:'16px 20px' }, maxWidth:1400, mx:'auto' }}>
      <PageHeader
        title="Santa Ana — Cadena de Suministro"
        subtitle="KPIs estratégicos de inventarios y abastecimiento"
        live
        onRefresh={() => {}}
      >
        <MiniSelect label="Período" value={periodo} onChange={setPeriodo} options={[
          { value:'2025', label:'2025' },
          { value:'2024', label:'2024' },
        ]} />
      </PageHeader>

      {/* ── ALERTA EJECUTIVA ── */}
      <Box sx={{ mt:'14px', mb:'16px', p:'10px 14px', borderRadius:'10px', background:'rgba(220,38,38,.05)', border:'1px solid rgba(220,38,38,.18)', display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
        <Box sx={{ width:8, height:8, borderRadius:'50%', background:DL.red, flexShrink:0 }} />
        <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.red, fontFamily:FONT }}>Atención Requerida:</Typography>
        <Typography sx={{ fontSize:10, color:DL.tM, fontFamily:FONT }}>
          OTIF Proveedores en 78% (meta 90%) · Compras urgentes representan el 22% del total · 38 SKUs en quiebres de stock · Exactitud de inventario 94% (meta 98%)
        </Typography>
      </Box>

      {/* ── KPI STRIP ── */}
      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'repeat(2,1fr)', sm:'repeat(3,1fr)', md:'repeat(4,1fr)', lg:'repeat(6,1fr)' }, gap:'10px', mb:'20px' }}>
        {KPI_CARDS.map(kpi => <KpiBlock key={kpi.id} kpi={kpi} />)}
      </Box>

      {/* ── ROW 2: Trend + DOH ABC ── */}
      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'1.4fr 1fr' }, gap:'14px', mb:'14px' }}>

        {/* Tendencia mensual */}
        <Paper elevation={0} sx={{ border:`1px solid ${DL.border}`, borderRadius:'10px', p:'14px' }}>
          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:'12px', flexWrap:'wrap', gap:'8px' }}>
            <SecHeader title="Evolución de KPIs" subtitle="Tendencia mensual vs. meta" />
            <Box sx={{ display:'flex', gap:'4px' }}>
              {[
                { v:'fillRate', l:'Fill Rate' },
                { v:'doh',      l:'DOH' },
                { v:'otif',     l:'OTIF' },
                { v:'urgentes', l:'Urgentes' },
              ].map(t => (
                <Box key={t.v} component="button" onClick={() => setTrendMetric(t.v)} sx={{
                  fontFamily:FONT, fontSize:8.5, fontWeight: 500, px:'8px', py:'4px',
                  borderRadius:'5px', border:`1px solid ${trendMetric===t.v ? DL.blue : DL.border2}`,
                  background: trendMetric===t.v ? DL.blue : '#fff',
                  color: trendMetric===t.v ? '#fff' : DL.tM, cursor:'pointer', transition:'all .14s',
                }}>{t.l}</Box>
              ))}
            </Box>
          </Box>
          <ReactECharts option={trendOption} style={{ height:220 }} />
        </Paper>

        {/* DOH por ABC */}
        <Paper elevation={0} sx={{ border:`1px solid ${DL.border}`, borderRadius:'10px', p:'14px' }}>
          <SecHeader title="DOH por Categoría ABC" subtitle="Días inventario disponible vs. meta (◆)" />
          <ReactECharts option={dohAbcOption} style={{ height:210 }} />
          <Box sx={{ display:'flex', gap:'12px', mt:'6px', flexWrap:'wrap' }}>
            {DOH_ABC.map(d => (
              <Box key={d.cat} sx={{ display:'flex', alignItems:'center', gap:'4px' }}>
                <Box sx={{ width:8, height:8, borderRadius:'2px', background:d.doh>d.target?'#dc2626':'#547e69' }} />
                <Typography sx={{ fontSize:8.5, color:DL.tS, fontFamily:FONT }}>Cat. {d.cat} ({d.skus} SKUs)</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* ── ROW 3: Compras + OTIF Proveedores ── */}
      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'1fr 1fr' }, gap:'14px', mb:'14px' }}>

        {/* Compras urgentes vs planificadas */}
        <Paper elevation={0} sx={{ border:`1px solid ${DL.border}`, borderRadius:'10px', p:'14px' }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:'10px' }}>
            <SecHeader title="Compras: Planificadas vs. Urgentes" subtitle="Monto mensual en Q miles" />
            <Box sx={{ display:'inline-flex', px:'8px', py:'3px', borderRadius:'4px', background:'rgba(220,38,38,.08)', border:'1px solid rgba(220,38,38,.18)', flexShrink:0 }}>
              <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.red, fontFamily:FONT }}>22% urgentes</Typography>
            </Box>
          </Box>
          <ReactECharts option={comprasOption} style={{ height:210 }} />
        </Paper>

        {/* OTIF Proveedores */}
        <Paper elevation={0} sx={{ border:`1px solid ${DL.border}`, borderRadius:'10px', p:'14px' }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:'10px' }}>
            <SecHeader title="OTIF por Proveedor" subtitle="On-Time In-Full · Meta: 90%" />
            <Box sx={{ display:'flex', gap:'8px', alignItems:'center' }}>
              {[{ color:'#059669', label:'≥90%' },{ color:'#d97706', label:'≥80%' },{ color:'#dc2626', label:'<80%' }].map(b => (
                <Box key={b.label} sx={{ display:'flex', alignItems:'center', gap:'3px' }}>
                  <Box sx={{ width:6, height:6, borderRadius:'50%', background:b.color }} />
                  <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FONT }}>{b.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <ReactECharts option={otifOption} style={{ height:210 }} />
        </Paper>
      </Box>

      {/* ── ROW 4: Quiebres + Sobreinventario ── */}
      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'1fr 1fr' }, gap:'14px', mb:'14px' }}>

        {/* Quiebres de stock */}
        <Paper elevation={0} sx={{ border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden' }}>
          <Box sx={{ px:'14px', pt:'12px', pb:'8px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <Box>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Quiebres de Stock</Typography>
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>SKUs sin disponibilidad — prioridad por venta perdida</Typography>
            </Box>
            <Box sx={{ px:'10px', py:'3px', borderRadius:'4px', background:'rgba(220,38,38,.08)', border:'1px solid rgba(220,38,38,.2)' }}>
              <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.red, fontFamily:FONT }}>38 SKUs</Typography>
            </Box>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['SKU','Cat.','Días sin stock','Venta Perdida','Rotación'].map(h => (
                    <TableCell key={h} sx={{ ...TH_SX, textAlign: h==='Venta Perdida'||h==='Rotación'?'right':'left' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {QUIEBRES.map((r, i) => (
                  <TableRow key={i} sx={{ '&:hover td':{ background:'rgba(220,38,38,.02)' } }}>
                    <TableCell sx={{ ...TD_SX }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{r.sku}</Typography>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX }}>
                      <Box sx={{ display:'inline-flex', px:'5px', py:'1px', borderRadius:'4px', background:`${catColor(r.cat)}18` }}>
                        <Typography sx={{ fontSize:9, fontWeight: 500, color:catColor(r.cat), fontFamily:FONT }}>{r.cat}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX }}>
                      <Box sx={{ display:'inline-flex', px:'6px', py:'1px', borderRadius:'4px', background:'rgba(220,38,38,.08)', border:'1px solid rgba(220,38,38,.18)' }}>
                        <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.red, fontFamily:FONT }}>{r.diasSinStock}d</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, textAlign:'right' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.red, fontFamily:FONT }}>Q{r.ventaPerdidaQ.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, textAlign:'right' }}>
                      <Typography sx={{ fontSize:10, color:DL.tM, fontFamily:FONT }}>{r.rotacion}×</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ px:'14px', py:'7px', borderTop:`1px solid ${DL.border}` }}>
            <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>
              Venta perdida estimada total: <strong style={{ color:DL.red }}>Q{QUIEBRES.reduce((s,r)=>s+r.ventaPerdidaQ,0).toLocaleString()}</strong>
            </Typography>
          </Box>
        </Paper>

        {/* Sobreinventario */}
        <Paper elevation={0} sx={{ border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden' }}>
          <Box sx={{ px:'14px', pt:'12px', pb:'8px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <Box>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Sobreinventario</Typography>
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>SKUs con exceso de cobertura — capital inmovilizado</Typography>
            </Box>
            <Box sx={{ px:'10px', py:'3px', borderRadius:'4px', background:'rgba(217,119,6,.08)', border:'1px solid rgba(217,119,6,.25)' }}>
              <Typography sx={{ fontSize:9, fontWeight: 500, color:'#d97706', fontFamily:FONT }}>Q{SOBREINVENTARIO.reduce((s,r)=>s+r.costoExceso,0).toLocaleString()} exceso</Typography>
            </Box>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['SKU','Cat.','DOH actual','% Exceso','Costo Exceso'].map(h => (
                    <TableCell key={h} sx={{ ...TH_SX, textAlign: h==='% Exceso'||h==='Costo Exceso'?'right':'left' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {SOBREINVENTARIO.map((r, i) => {
                  const barColor = r.excesoPct >= 70 ? DL.red : r.excesoPct >= 50 ? '#d97706' : '#8d8d8d';
                  return (
                    <TableRow key={i} sx={{ '&:hover td':{ background:'rgba(217,119,6,.02)' } }}>
                      <TableCell sx={{ ...TD_SX }}>
                        <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{r.sku}</Typography>
                      </TableCell>
                      <TableCell sx={{ ...TD_SX }}>
                        <Box sx={{ display:'inline-flex', px:'5px', py:'1px', borderRadius:'4px', background:`${catColor(r.cat)}18` }}>
                          <Typography sx={{ fontSize:9, fontWeight: 500, color:catColor(r.cat), fontFamily:FONT }}>{r.cat}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ ...TD_SX }}>
                        <Typography sx={{ fontSize:10, fontWeight: 500, color:'#d97706', fontFamily:FONT }}>{r.doh}d</Typography>
                      </TableCell>
                      <TableCell sx={{ ...TD_SX, textAlign:'right' }}>
                        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'6px' }}>
                          <Box sx={{ width:48, height:5, borderRadius:3, background:'rgba(26,26,26,.07)', overflow:'hidden' }}>
                            <Box sx={{ height:'100%', width:`${r.excesoPct}%`, borderRadius:3, background:barColor }} />
                          </Box>
                          <Typography sx={{ fontSize:9, fontWeight: 500, color:barColor, fontFamily:FONT, minWidth:28, textAlign:'right' }}>{r.excesoPct}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ ...TD_SX, textAlign:'right' }}>
                        <Typography sx={{ fontSize:10, fontWeight: 500, color:'#d97706', fontFamily:FONT }}>Q{r.costoExceso.toLocaleString()}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ px:'14px', py:'7px', borderTop:`1px solid ${DL.border}` }}>
            <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>
              Capital inmovilizado total: <strong style={{ color:'#d97706' }}>Q{SOBREINVENTARIO.reduce((s,r)=>s+r.costoExceso,0).toLocaleString()}</strong>
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* ── ROW 5: Vencimientos ── */}
      <Paper elevation={0} sx={{ border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden', mb:'14px' }}>
        <Box sx={{ px:'14px', pt:'12px', pb:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${DL.border}` }}>
          <Box>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Alertas de Vencimiento</Typography>
            <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>SKUs próximos a caducar en los próximos 60 días — acción FEFO requerida</Typography>
          </Box>
          <Box sx={{ display:'flex', gap:'8px', alignItems:'center' }}>
            {[{ color:DL.red, label:'≤21 días' },{ color:'#d97706', label:'22-45 días' },{ color:'#8d8d8d', label:'46-60 días' }].map(b => (
              <Box key={b.label} sx={{ display:'flex', alignItems:'center', gap:'3px' }}>
                <Box sx={{ width:6, height:6, borderRadius:'50%', background:b.color }} />
                <Typography sx={{ fontSize:8.5, color:DL.tS, fontFamily:FONT }}>{b.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['SKU','Lote','Fecha Vence','Días Restantes','Unidades','Valor Q','Acción Recomendada'].map(h => (
                  <TableCell key={h} sx={{ ...TH_SX, textAlign: h==='Unidades'||h==='Valor Q'?'right':'left' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {VENCIMIENTOS.map((r, i) => {
                const urgColor = r.diasRestantes <= 21 ? DL.red : r.diasRestantes <= 45 ? '#d97706' : '#8d8d8d';
                return (
                  <TableRow key={i} sx={{ '&:hover td':{ background:'rgba(220,38,38,.02)' } }}>
                    <TableCell sx={{ ...TD_SX }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{r.sku}</Typography>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX }}>
                      <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{r.lote}</Typography>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:urgColor, fontFamily:FONT }}>{r.vence}</Typography>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX }}>
                      <Box sx={{ display:'inline-flex', alignItems:'center', gap:'5px' }}>
                        <Box sx={{ width:40, height:5, borderRadius:3, background:'rgba(26,26,26,.07)', overflow:'hidden' }}>
                          <Box sx={{ height:'100%', width:`${Math.max(0,100-r.diasRestantes*2)}%`, borderRadius:3, background:urgColor }} />
                        </Box>
                        <Box sx={{ display:'inline-flex', px:'6px', py:'1px', borderRadius:'4px', background:`${urgColor}14`, border:`1px solid ${urgColor}30` }}>
                          <Typography sx={{ fontSize:9, fontWeight: 500, color:urgColor, fontFamily:FONT }}>{r.diasRestantes}d</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, textAlign:'right' }}>
                      <Typography sx={{ fontSize:10, color:DL.tM, fontFamily:FONT }}>{r.unidades.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, textAlign:'right' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Q{r.valorQ.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX }}>
                      <Box sx={{ display:'inline-flex', px:'8px', py:'2px', borderRadius:'5px', background:`${urgColor}10`, border:`1px solid ${urgColor}25` }}>
                        <Typography sx={{ fontSize:8.5, fontWeight: 500, color:urgColor, fontFamily:FONT }}>{r.accion}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ px:'14px', py:'7px', borderTop:`1px solid ${DL.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>
            Valor en riesgo total: <strong style={{ color:DL.red }}>Q{VENCIMIENTOS.reduce((s,r)=>s+r.valorQ,0).toLocaleString()}</strong>
          </Typography>
          <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>
            Mostrando 5 SKUs más críticos de 12 en alerta
          </Typography>
        </Box>
      </Paper>

      {/* ── ROW 6: Resumen ejecutivo ── */}
      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', sm:'repeat(3,1fr)' }, gap:'10px', mb:'4px' }}>
        {[
          { title:'Plan de Acción Inmediata', color:'#dc2626', bg:'rgba(220,38,38,.04)', border:'rgba(220,38,38,.15)', items:['Reponer 7 SKUs cat. A en quiebre','Negociar OTIF con 3 proveedores críticos','Liquidar lotes con vencimiento < 30 días'] },
          { title:'Optimización a 30 días',    color:'#d97706', bg:'rgba(217,119,6,.04)', border:'rgba(217,119,6,.15)',  items:['Reducir compras urgentes de 22% → 15%','Ajustar cobertura cat. C (DOH 68d → 45d)','Implementar conteo cíclico semanal'] },
          { title:'Objetivo Trimestral',        color:'#059669', bg:'rgba(22,163,74,.04)', border:'rgba(22,163,74,.15)', items:['Fill Rate 87% → 93%','OTIF Proveedores 78% → 88%','Exactitud inventario 94% → 97%'] },
        ].map(panel => (
          <Paper key={panel.title} elevation={0} sx={{ border:`1px solid ${panel.border}`, borderRadius:'10px', p:'12px 14px', background:panel.bg }}>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:panel.color, fontFamily:FONT, mb:'8px' }}>{panel.title}</Typography>
            {panel.items.map((item, i) => (
              <Box key={i} sx={{ display:'flex', gap:'7px', mb:'5px' }}>
                <Box sx={{ width:4, height:4, borderRadius:'50%', background:panel.color, mt:'5px', flexShrink:0 }} />
                <Typography sx={{ fontSize:9.5, color:DL.tM, fontFamily:FONT, lineHeight:1.5 }}>{item}</Typography>
              </Box>
            ))}
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
