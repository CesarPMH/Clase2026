// ─── Flujo de Caja ────────────────────────────────────────────────────────────
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/common/KpiCard';
import { DL } from '../theme';
import { TOP_DEUDORES } from '../data/cxc';

const ff = "'Inter', ui-sans-serif, system-ui, sans-serif";

// ─── Datos ────────────────────────────────────────────────────────────────────
const CF_MONTHS   = ['Oct 2025','Nov 2025','Dic 2025','Ene 2026','Feb 2026','Mar 2026','Abr 2026'];
const CF_ENTRADAS = [130000, 145000, 168000, 185000, 210000, 230000, 245000];
const CF_SALIDAS  = [ 85000,  91000, 105000, 109500, 121000, 130000, 120000];
const CF_SALDO    = CF_ENTRADAS.map((_, i) =>
  CF_ENTRADAS.slice(0,i+1).reduce((s,v)=>s+v,0) - CF_SALIDAS.slice(0,i+1).reduce((s,v)=>s+v,0)
);
const CF_E_CAT = { 'Ventas clientes':[95000,108000,125000,138000,158000,175000,185000], 'Cobros CxC':[22000,24000,28000,32000,35000,38000,42000], 'Otros ingresos':[13000,13000,15000,15000,17000,17000,18000] };
const CF_S_CAT = { 'Costo mercadería':[38000,44000,52000,56000,62000,68000,70000], 'Nómina':[22000,22000,22000,25000,25000,28000,28000], 'Gastos operativos':[12000,13000,14000,15000,16000,17000,17000], 'Gastos financieros':[4000,4000,4000,1000,1000,1000,500], 'Impuestos/otros':[9000,12000,13000,18000,21000,26000,34500] };
const CF_COLORS_E = [DL.blue, DL.navy, '#8fb0a0'];
const CF_COLORS_S = [DL.red, '#f97316', '#d97706', '#4d3f32', '#727272'];

// TogBtn: matches the standard design used across the rest of the app
function TogBtn({ active, onClick, children }) {
  return (
    <Box component="button" onClick={onClick} sx={{
      px: '12px', py: '5px', border: 'none', cursor: 'pointer', fontFamily: ff,
      fontSize: 9, fontWeight: 500,
      background: active ? DL.blue : 'transparent',
      color: active ? '#fff' : DL.tS,
      transition: 'all .14s',
      '&:hover': active ? {} : { background: 'rgba(84,126,105,.07)' },
    }}>{children}</Box>
  );
}

export default function FlujoCaja() {
  const [cfMode, setCfMode] = useState('totales');
  const navigate = useNavigate();

  const cfOption = {
    tooltip: {
      trigger: 'axis', backgroundColor: '#fff', borderColor: 'rgba(26,26,26,.12)', borderWidth: 1,
      textStyle: { fontFamily: ff, fontSize: 11 },
      extraCssText: 'box-shadow:0 6px 20px rgba(26,26,26,.13);border-radius:8px',
    },
    grid: { top: 10, right: cfMode === 'totales' ? 56 : 14, bottom: cfMode === 'totales' ? 38 : 58, left: 56 },
    legend: { bottom: 2, left: 'center', textStyle: { fontFamily: ff, fontSize: cfMode === 'totales' ? 10 : 9, color: DL.tS }, itemWidth: 10, itemHeight: 7, itemGap: cfMode === 'totales' ? 18 : 10 },
    xAxis: { type:'category', data:CF_MONTHS, axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:ff,fontSize:9,color:DL.tS,rotate:10}, splitLine:{show:false} },
    yAxis: cfMode === 'totales'
      ? [
          { type:'value', axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:ff,fontSize:9,color:DL.tS,formatter:v=>'$'+(v/1000).toFixed(0)+'K'}, splitLine:{lineStyle:{color:'rgba(26,26,26,.06)',type:'dashed'}} },
          { type:'value', position:'right', axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:ff,fontSize:9,color:DL.tS,formatter:v=>'$'+(v/1000).toFixed(0)+'K'}, splitLine:{show:false} },
        ]
      : { type:'value', axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:ff,fontSize:9,color:DL.tS,formatter:v=>'$'+(v/1000).toFixed(0)+'K'}, splitLine:{lineStyle:{color:'rgba(26,26,26,.06)',type:'dashed'}} },
    series: cfMode === 'totales' ? [
      { name:'Entradas', type:'bar', data:CF_ENTRADAS, barMaxWidth:28, itemStyle:{color:DL.blue,borderRadius:[4,4,0,0]} },
      { name:'Salidas',  type:'bar', data:CF_SALIDAS,  barMaxWidth:28, itemStyle:{color:DL.red, borderRadius:[4,4,0,0]} },
      { name:'Saldo Acum.', type:'line', data:CF_SALDO, yAxisIndex:1, smooth:0.3, lineStyle:{color:DL.green,width:2.5}, itemStyle:{color:DL.green}, symbol:'circle', symbolSize:5 },
    ] : [
      ...Object.entries(CF_E_CAT).map(([name,data],i) => ({ name, type:'bar', stack:'e', data, barMaxWidth:36, itemStyle:{color:CF_COLORS_E[i]} })),
      ...Object.entries(CF_S_CAT).map(([name,data],i) => ({ name, type:'bar', stack:'s', data:data.map(v=>-v), barMaxWidth:36, itemStyle:{color:CF_COLORS_S[i]} })),
    ],
  };

  const card        = { background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1, overflow:'hidden' };
  const chartCard   = { background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1 };

  return (
    <Box sx={{ p: '14px 20px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Header */}
      <Typography sx={{ fontSize: 18, fontWeight: 500, color: DL.tH, fontFamily: ff }}>
        Flujo de Caja
      </Typography>

      {/* KPI row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        <KpiCard
          lbl="Saldo en Caja"        val="$312,450"
          pct={104}                  meta="$300,000"   metaLbl="Meta Mensual"
          diff="+$12,450"
          yoyPrev="$280,000"         yoyDelta="+11.6%" yoyUp
        />
        <KpiCard
          lbl="Cuentas por Cobrar"   val="$184,320"
          pct={88}                   meta="$210,000"   metaLbl="Cartera Objetivo"
          diff="-$25,680"
          yoyPrev="$210,000"         yoyDelta="-12.2%" yoyUp={false}
        />
        <KpiCard
          lbl="Cuentas por Pagar"    val="$68,750"
          pct={86}                   meta="$80,000"    metaLbl="Presupuesto CxP"
          diff="-$11,250"
          yoyPrev="$94,000"          yoyDelta="-26.9%" yoyUp
        />
        <KpiCard
          lbl="Cash Flow Operativo"  val="$243,700"
          pct={101.5}                meta="$240,000"   metaLbl="Meta Mensual"
          diff="+$3,700"
          yoyPrev="$186,000"         yoyDelta="+31.0%" yoyUp
        />
      </Box>

      {/* Gráfica */}
      <Box sx={chartCard}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'16px', py:'11px', borderBottom:`1px solid ${DL.border}`, borderRadius:'10px 10px 0 0' }}>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:ff }}>
            Liquidez Financiera
          </Typography>
          <Box sx={{ display:'flex', border:`1px solid ${DL.border}`, borderRadius:'7px', overflow:'hidden' }}>
            <TogBtn active={cfMode==='totales'}     onClick={()=>setCfMode('totales')}>Totales</TogBtn>
            <TogBtn active={cfMode==='composicion'} onClick={()=>setCfMode('composicion')}>Composición</TogBtn>
          </Box>
        </Box>
        <ReactECharts option={cfOption} notMerge style={{ height: cfMode === 'totales' ? 290 : 310, padding:'8px 8px 4px' }} />
      </Box>

      {/* CxC + Proyección */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:'12px' }}>

        {/* Tabla CxC */}
        <Box sx={card}>
          <Box sx={{ p:'10px 14px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:ff, flex:1 }}>¿Qué dinero tengo pendiente de cobrar?</Typography>
            {['Todos','0-30d','31-60d','61-90d','+90d'].map((f,i) => (
              <Box key={f} component="button" sx={{ px:'8px', py:'3px', borderRadius:'6px', border:`1px solid ${DL.border}`, fontSize:9, fontWeight: 500, cursor:'pointer', fontFamily:ff, background:i===0?DL.blue:'transparent', color:i===0?'#fff':DL.tS }}>
                {f}
              </Box>
            ))}
          </Box>
          <Box component="table" sx={{ width:'100%', borderCollapse:'collapse', fontSize:11, fontFamily:ff }}>
            <Box component="thead">
              <Box component="tr" sx={{ background:DL.subtle }}>
                {['Cliente','Monto','Días','Vencimiento','Estado'].map((h,i)=>(
                  <Box component="th" key={h} sx={{ p:'7px 10px', textAlign:i>0?'right':'left', fontSize:9, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${DL.border}` }}>{h}</Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {TOP_DEUDORES.map((d,i) => {
                const vencido   = d.dias > 60;
                const porVencer = d.dias > 30 && d.dias <= 60;
                const label = vencido ? 'Vencida' : porVencer ? 'Por vencer' : 'Al corriente';
                const color = vencido ? DL.red : porVencer ? DL.yellow : DL.green;
                const bg    = vencido ? DL.redBg : porVencer ? DL.yellowBg : DL.greenBg;
                const venc  = new Date(Date.now() - d.dias * 86400000).toISOString().split('T')[0];
                return (
                  <Box component="tr" key={i} sx={{ borderBottom:`1px solid ${DL.border}`, '&:last-child':{borderBottom:'none'}, '&:hover':{background:DL.subtle} }}>
                    <Box component="td" sx={{ p:'7px 10px', fontWeight: 500, color:DL.tH, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.nombre}</Box>
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right', fontWeight: 500, color:DL.tH }}>USD {d.saldo.toLocaleString('en-US',{minimumFractionDigits:2})}</Box>
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right', color:DL.tM }}>{d.dias}d</Box>
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right', color:DL.tS, fontSize:10 }}>{venc}</Box>
                    <Box component="td" sx={{ p:'7px 10px', textAlign:'right' }}>
                      <Box component="span" sx={{ px:'7px', py:'2px', borderRadius:'4px', fontSize:9, fontWeight: 500, background:bg, color, fontFamily:ff, whiteSpace:'nowrap' }}>{label}</Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Proyección 30 días */}
        <Box sx={{ ...card, p:'12px 14px' }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:'8px', mb:'12px' }}>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:ff }}>Proyección 30 días</Typography>
            <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:ff }}>3 escenarios</Typography>
          </Box>
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', mb:'12px' }}>
            {[
              { label:'OPTIMISTA', val:'$520,000', sub:'+10% crecim.',     color:DL.green, bg:DL.greenBg },
              { label:'BASE',      val:'$438,000', sub:'Tendencia actual', color:DL.blue,  bg:'#f6f6f6'  },
              { label:'PESIMISTA', val:'$355,000', sub:'-15% reducción',   color:DL.red,   bg:DL.redBg   },
            ].map(s => (
              <Box key={s.label} sx={{ background:s.bg, borderRadius:'8px', p:'10px 12px', textAlign:'center' }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, color:s.color, letterSpacing:'0.07em', fontFamily:ff }}>{s.label}</Typography>
                <Typography sx={{ fontSize:20, fontWeight: 500, color:s.color, fontFamily:ff, lineHeight:1.2 }}>{s.val}</Typography>
                <Typography sx={{ fontSize:9, color:s.color, fontWeight: 500, fontFamily:ff }}>{s.sub}</Typography>
              </Box>
            ))}
          </Box>
          <ReactECharts style={{ height:180 }} option={{
            grid:{ top:10, right:10, bottom:20, left:44 },
            xAxis:{ type:'category', data:['Sem 1','Sem 2','Sem 3','Sem 4'], axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:ff,fontSize:9,color:DL.tS}, splitLine:{show:false} },
            yAxis:{ type:'value', axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:ff,fontSize:9,color:DL.tS,formatter:v=>'$'+(v/1000).toFixed(0)+'K'}, splitLine:{lineStyle:{color:'rgba(26,26,26,.06)'}} },
            tooltip:{ trigger:'axis', backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1, textStyle:{fontFamily:ff,fontSize:10} },
            series:[
              { name:'Optimista', type:'line', data:[100,130,155,185], smooth:0.3, lineStyle:{color:DL.green,width:2}, areaStyle:{color:DL.green+'22'}, itemStyle:{color:DL.green}, symbol:'none' },
              { name:'Base',      type:'line', data:[90,108,125,155],  smooth:0.3, lineStyle:{color:DL.blue, width:2}, areaStyle:{color:DL.blue+'22'},  itemStyle:{color:DL.blue},  symbol:'none' },
              { name:'Pesimista', type:'line', data:[80,90,105,135],   smooth:0.3, lineStyle:{color:DL.red,  width:2}, areaStyle:{color:DL.red+'22'},   itemStyle:{color:DL.red},   symbol:'none' },
            ],
          }} />
        </Box>

      </Box>
    </Box>
  );
}
