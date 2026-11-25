// ─── Dashboard: Costo por Operación ──────────────────────────────────────────
import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography, Paper } from '@mui/material';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import { DL } from '../theme';

const FF = "'Inter', ui-sans-serif, system-ui, sans-serif";

const fmt$ = (v) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

// ─── Data por mes ─────────────────────────────────────────────────────────────
const DATA_BY_MONTH = {
  Enero:   { ingresos:70000, fijos:30000, variables:28000, unidades:380 },
  Febrero: { ingresos:74500, fijos:30800, variables:29200, unidades:395 },
  Marzo:   { ingresos:77000, fijos:31200, variables:29800, unidades:408 },
  Abril:   { ingresos:85000, fijos:31600, variables:30600, unidades:420 },
  Mayo:    { ingresos:81000, fijos:31600, variables:31000, unidades:412 },
  Junio:   { ingresos:86500, fijos:32000, variables:31400, unidades:428 },
};

const TREND_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun'];
const TREND_ING    = [70000,74500,77000,85000,81000,86500];
const TREND_COST   = [58000,60000,61000,62200,62600,63400];

const FIJOS_ITEMS    = [
  { label:'Planilla',  monto:18000 },
  { label:'Renta',     monto:8000  },
  { label:'Servicios', monto:3200  },
  { label:'Otros',     monto:2100  },
  { label:'Seguros',   monto:1500  },
];
const VARIABLES_ITEMS = [
  { label:'Mat. prima',    monto:12000 },
  { label:'M.o. variable', monto:7200  },
  { label:'Comisiones',    monto:5500  },
  { label:'Empaque',       monto:3800  },
];

const MONTHS = Object.keys(DATA_BY_MONTH);

// ─── KPI Card inline ──────────────────────────────────────────────────────────
function KpiCard({ accentColor, icon, label, value, valueColor, sub, badge }) {
  return (
    <Box sx={{
      background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`,
      boxShadow:DL.e1, p:'12px 14px 10px', position:'relative', overflow:'hidden', flex:1, minWidth:0,
    }}>
      <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, background:accentColor, borderRadius:'10px 10px 0 0' }} />
      <Box sx={{ display:'flex', alignItems:'center', gap:'5px', mt:'3px', mb:'5px' }}>
        <Typography sx={{ fontSize:12 }}>{icon}</Typography>
        <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FF }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontSize:22, fontWeight: 500, color:valueColor || DL.tH, fontFamily:FF, lineHeight:1, letterSpacing:'-0.04em', pb:'4px', mb:'4px', borderBottom:`1px solid rgba(26,26,26,.07)` }}>
        {value}
      </Typography>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'6px' }}>
        <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF }}>{sub}</Typography>
        {badge && (
          <Box sx={{ px:'7px', py:'2px', borderRadius:'4px', background:badge.bg, border:`1px solid ${badge.bd}`, flexShrink:0 }}>
            <Typography sx={{ fontSize:8, fontWeight: 500, color:badge.tx, fontFamily:FF }}>{badge.lbl}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Horizontal bar row ───────────────────────────────────────────────────────
function BarRow({ label, monto, max, color }) {
  const pct = max > 0 ? (monto / max) * 100 : 0;
  return (
    <Box sx={{ display:'grid', gridTemplateColumns:'90px 1fr 64px', alignItems:'center', gap:'10px', py:'5px' }}>
      <Typography sx={{ fontSize:10, fontWeight:500, color:DL.tM, fontFamily:FF, whiteSpace:'nowrap' }}>{label}</Typography>
      <Box sx={{ height:6, borderRadius:3, background:`${color}18`, overflow:'hidden' }}>
        <Box sx={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, transition:'width .5s ease' }} />
      </Box>
      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FF, textAlign:'right' }}>
        ${monto.toLocaleString()}
      </Typography>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CostoOperacion() {
  const [mes, setMes] = useState('Abril');
  const [compTab, setCompTab] = useState('Fijos');

  const d        = DATA_BY_MONTH[mes];
  const costos   = d.fijos + d.variables;
  const utilidad = d.ingresos - costos;
  const margen   = +((utilidad / d.ingresos) * 100).toFixed(1);
  const costoU   = Math.round(costos / d.unidades);
  const fijoPct  = +((d.fijos / costos) * 100).toFixed(1);
  const varPct   = +((d.variables / costos) * 100).toFixed(1);
  const utilPct  = margen;
  const maxBar   = Math.max(...FIJOS_ITEMS.map(i=>i.monto), ...VARIABLES_ITEMS.map(i=>i.monto));

  const margenBadge = margen >= 25
    ? { lbl:'Saludable', bg:DL.greenBg, bd:`${DL.green}30`, tx:DL.green }
    : margen >= 15
    ? { lbl:'Atención',  bg:DL.yellowBg, bd:`${DL.yellow}30`, tx:DL.yellow }
    : { lbl:'Crítico',   bg:DL.redBg,    bd:`${DL.red}30`,    tx:DL.red };

  // Donut chart
  const donutOption = useMemo(() => ({
    tooltip: { trigger:'item', formatter:'{b}: {d}%', backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1, textStyle:{ fontFamily:FF, fontSize:10 } },
    series: [{
      type:'pie', radius:['52%','78%'], center:['38%','50%'],
      label:{ show:false },
      data: [
        { value:d.fijos,     name:'Fijos',     itemStyle:{ color:DL.blue   } },
        { value:d.variables, name:'Variables', itemStyle:{ color:'#f97316' } },
      ],
    }],
  }), [d]);

  // Trend chart
  const trendOption = useMemo(() => ({
    tooltip:{ trigger:'axis', backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1, textStyle:{ fontFamily:FF, fontSize:10 }, formatter:(p) => `<b>${p[0].axisValue}</b><br/>${p.map(s=>`${s.marker}${s.seriesName}: $${s.value.toLocaleString()}`).join('<br/>')}` },
    legend:{ bottom:4, left:'center', itemWidth:10, itemHeight:8, itemGap:20, textStyle:{ fontFamily:FF, fontSize:9, color:DL.tS } },
    grid:{ top:16, right:16, bottom:44, left:60 },
    xAxis:{ type:'category', data:TREND_MONTHS, axisLine:{show:false}, axisTick:{show:false}, axisLabel:{ fontFamily:FF, fontSize:9, color:DL.tS }, splitLine:{show:false} },
    yAxis:{ type:'value', axisLine:{show:false}, axisTick:{show:false}, axisLabel:{ fontFamily:FF, fontSize:9, color:DL.tS, formatter: v => `$${v/1000}k` }, splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } } },
    series:[
      { name:'Ingresos', type:'line', data:TREND_ING,  smooth:true, symbol:'circle', symbolSize:6, lineStyle:{ color:DL.green,  width:2.5 }, itemStyle:{ color:DL.green  } },
      { name:'Costos',   type:'line', data:TREND_COST, smooth:true, symbol:'circle', symbolSize:6, lineStyle:{ color:'#f97316', width:2, type:'dashed' }, itemStyle:{ color:'#f97316' } },
    ],
  }), []);

  const cardSx = { background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1, overflow:'hidden' };
  const cardHd = { px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', gap:'7px' };

  // Alerts
  const alerts = [
    margen >= 25
      ? { type:'ok',   msg:`Margen saludable de ${margen}%. Operación rentable.` }
      : { type:'warn', msg:`Margen de ${margen}% — por debajo del umbral del 25%.` },
    fijoPct > 55
      ? { type:'warn', msg:`Costos fijos en ${fijoPct}% del total — monitorear ante caídas de ventas.` }
      : { type:'ok',   msg:`Distribución fijos/variables equilibrada (${fijoPct}% / ${varPct}%).` },
    costoU > 160
      ? { type:'warn', msg:`Costo por unidad de $${costoU} — revisar eficiencia productiva.` }
      : { type:'ok',   msg:`Costo unitario de $${costoU} dentro del rango objetivo.` },
  ];
  const alertColors = {
    ok:   { bg:DL.greenBg, bd:`${DL.green}30`,  tx:DL.green,  icon:'✓' },
    warn: { bg:DL.yellowBg, bd:`${DL.yellow}30`, tx:'#a16207', icon:'△' },
    crit: { bg:DL.redBg,    bd:`${DL.red}30`,    tx:DL.red,    icon:'!' },
  };

  return (
    <Box>
      <PageHeader title="Costo por Operación" live onExport={() => {}}>
        <MiniSelect
          label="Mes"
          value={mes}
          onChange={setMes}
          options={MONTHS.map(m => ({ value:m, label:m }))}
          minWidth={120}
        />
      </PageHeader>

      <Box sx={{ p:'16px 20px', display:'flex', flexDirection:'column', gap:'12px' }}>

        {/* ── Row 1: 5 KPI cards ────────────────────────────────────────────── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px' }}>
          <KpiCard
            accentColor={DL.blue}
            icon="↗"
            label="Ingresos totales"
            value={fmt$(d.ingresos)}
            sub="periodo actual"
            badge={{ lbl:`+${(((d.ingresos-70000)/70000)*100).toFixed(1)}% vs Ene`, bg:'rgba(84,126,105,.08)', bd:'rgba(84,126,105,.2)', tx:DL.blue }}
          />
          <KpiCard
            accentColor="#f97316"
            icon="⊟"
            label="Costos totales"
            value={fmt$(costos)}
            valueColor="#f97316"
            sub={`$${(d.fijos/1000).toFixed(0)}K fijos + $${(d.variables/1000).toFixed(0)}K var.`}
          />
          <KpiCard
            accentColor={DL.green}
            icon="⊞"
            label="Utilidad bruta"
            value={fmt$(utilidad)}
            valueColor={DL.green}
            sub={`${margen}% del ingreso`}
          />
          <KpiCard
            accentColor={margenBadge.tx}
            icon="%"
            label="Margen neto"
            value={`${margen}%`}
            valueColor={margenBadge.tx}
            sub=""
            badge={margenBadge}
          />
          <KpiCard
            accentColor={DL.navy}
            icon="⊡"
            label="Costo por unidad"
            value={`$${costoU}`}
            sub={`${d.unidades} unidades`}
          />
        </Box>

        {/* ── Row 2: Desglose + Donut ───────────────────────────────────────── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>

          {/* Desglose por categoría */}
          <Box sx={cardSx}>
            <Box sx={cardHd}>
              <Typography sx={{ fontSize:11 }}>≡</Typography>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>Desglose por categoría</Typography>
            </Box>
            <Box sx={{ p:'10px 16px 14px' }}>
              {/* Fijos */}
              <Box sx={{ display:'flex', alignItems:'center', gap:'6px', mb:'4px', mt:'2px' }}>
                <Box sx={{ width:8, height:8, borderRadius:2, background:DL.blue }} />
                <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.blue, fontFamily:FF }}>Costos Fijos</Typography>
                <Box sx={{ flex:1, height:'1px', background:`${DL.blue}20` }} />
                <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.blue, fontFamily:FF }}>${d.fijos.toLocaleString()}</Typography>
              </Box>
              {FIJOS_ITEMS.map(r => <BarRow key={r.label} label={r.label} monto={r.monto} max={maxBar} color={DL.blue} />)}

              {/* Variables */}
              <Box sx={{ display:'flex', alignItems:'center', gap:'6px', mb:'4px', mt:'10px' }}>
                <Box sx={{ width:8, height:8, borderRadius:2, background:'#f97316' }} />
                <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:'#f97316', fontFamily:FF }}>Costos Variables</Typography>
                <Box sx={{ flex:1, height:'1px', background:'#f9731620' }} />
                <Typography sx={{ fontSize:9, fontWeight: 500, color:'#f97316', fontFamily:FF }}>${d.variables.toLocaleString()}</Typography>
              </Box>
              {VARIABLES_ITEMS.map(r => <BarRow key={r.label} label={r.label} monto={r.monto} max={maxBar} color="#f97316" />)}
            </Box>
          </Box>

          {/* Distribución de costos */}
          <Box sx={cardSx}>
            <Box sx={cardHd}>
              <Typography sx={{ fontSize:11 }}>◑</Typography>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>Distribución de costos</Typography>
            </Box>
            <Box sx={{ p:'16px', display:'flex', alignItems:'center', gap:'20px', height:'calc(100% - 44px)' }}>
              <Box sx={{ position:'relative', flex:'0 0 200px', height:200 }}>
                <ReactECharts option={donutOption} style={{ width:200, height:200 }} />
                {/* Center label */}
                <Box sx={{ position:'absolute', top:'50%', left:'38%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
                  <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF, fontWeight: 500 }}>Total</Typography>
                  <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FF, letterSpacing:'-0.03em' }}>{fmt$(costos)}</Typography>
                </Box>
              </Box>
              <Box sx={{ flex:1, display:'flex', flexDirection:'column', gap:'12px' }}>
                {[
                  { label:'Fijos',     val:d.fijos,     pct:fijoPct, color:DL.blue   },
                  { label:'Variables', val:d.variables, pct:varPct,  color:'#f97316' },
                ].map(item => (
                  <Box key={item.label}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:'4px' }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <Box sx={{ width:10, height:10, borderRadius:2, background:item.color }} />
                        <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tM, fontFamily:FF }}>{item.label}</Typography>
                        <Typography sx={{ fontSize:10, fontWeight: 500, color:item.color, fontFamily:FF }}>— {item.pct}%</Typography>
                      </Box>
                      <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FF }}>${item.val.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ height:6, borderRadius:3, background:`${item.color}18`, overflow:'hidden' }}>
                      <Box sx={{ height:'100%', width:`${item.pct}%`, background:item.color, borderRadius:3, transition:'width .5s' }} />
                    </Box>
                  </Box>
                ))}
                <Box sx={{ mt:'4px', p:'8px 10px', borderRadius:'8px', background:'rgba(26,26,26,.04)' }}>
                  <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FF }}>Total costos</Typography>
                  <Typography sx={{ fontSize:15, fontWeight: 500, color:DL.tH, fontFamily:FF, letterSpacing:'-0.03em' }}>${costos.toLocaleString()}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Row 3: Tendencia mensual ──────────────────────────────────────── */}
        <Box sx={cardSx}>
          <Box sx={cardHd}>
            <Typography sx={{ fontSize:11 }}>📈</Typography>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>Tendencia mensual — ingresos vs costos</Typography>
          </Box>
          <Box sx={{ p:'8px 16px 14px' }}>
            <ReactECharts option={trendOption} style={{ height:220 }} />
          </Box>
        </Box>

        {/* ── Row 4: Composición + Alertas ─────────────────────────────────── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>

          {/* Composición del ingreso */}
          <Box sx={cardSx}>
            <Box sx={cardHd}>
              <Typography sx={{ fontSize:11 }}>◧</Typography>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>Composición del ingreso</Typography>
            </Box>
            <Box sx={{ p:'14px 16px' }}>
              {/* Stacked bar */}
              <Box sx={{ height:36, borderRadius:8, overflow:'hidden', display:'flex', mb:'14px' }}>
                <Box sx={{ width:`${fijoPct}%`, background:DL.blue, display:'flex', alignItems:'center', justifyContent:'center', transition:'width .6s' }}>
                  <Typography sx={{ fontSize:9, fontWeight: 500, color:'#fff', fontFamily:FF }}>Fijos</Typography>
                </Box>
                <Box sx={{ width:`${varPct}%`, background:'#f97316', display:'flex', alignItems:'center', justifyContent:'center', transition:'width .6s' }}>
                  <Typography sx={{ fontSize:9, fontWeight: 500, color:'#fff', fontFamily:FF }}>Var.</Typography>
                </Box>
                <Box sx={{ flex:1, background:DL.green, display:'flex', alignItems:'center', justifyContent:'center', transition:'width .6s' }}>
                  <Typography sx={{ fontSize:9, fontWeight: 500, color:'#fff', fontFamily:FF }}>Util.</Typography>
                </Box>
              </Box>
              {/* Tabs selector */}
              <Box sx={{ display:'flex', gap:'6px', mb:'12px' }}>
                {['Fijos','Variables','Utilidad'].map(t => (
                  <Box key={t} component="button" onClick={() => setCompTab(t)} sx={{
                    flex:1, fontFamily:FF, fontSize:10, fontWeight: 500, py:'6px', borderRadius:'7px', border:'none', cursor:'pointer',
                    background: compTab===t ? (t==='Fijos'?DL.blue:t==='Variables'?'#f97316':DL.green) : DL.subtle,
                    color: compTab===t ? '#fff' : DL.tM,
                    transition:'all .15s',
                  }}>{t}</Box>
                ))}
              </Box>
              {/* 3 metric boxes */}
              <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
                {[
                  { label:'Peso fijos',     val:`${fijoPct}%`, color:DL.blue   },
                  { label:'Peso variables', val:`${varPct}%`,  color:'#f97316' },
                  { label:'Margen',         val:`${utilPct}%`, color:DL.green  },
                ].map(m => (
                  <Box key={m.label} sx={{ textAlign:'center', p:'10px 6px', borderRadius:'8px', background:DL.subtle, border:`1px solid ${DL.border}` }}>
                    <Typography sx={{ fontSize:16, fontWeight: 500, color:m.color, fontFamily:FF, letterSpacing:'-0.03em' }}>{m.val}</Typography>
                    <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FF, mt:'2px' }}>{m.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Alertas y diagnóstico */}
          <Box sx={cardSx}>
            <Box sx={cardHd}>
              <Typography sx={{ fontSize:11 }}>🔔</Typography>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF }}>Alertas y diagnóstico</Typography>
            </Box>
            <Box sx={{ p:'12px 14px', display:'flex', flexDirection:'column', gap:'8px' }}>
              {alerts.map((a, i) => {
                const c = alertColors[a.type];
                return (
                  <Box key={i} sx={{ display:'flex', alignItems:'flex-start', gap:'8px', p:'10px 12px', borderRadius:'8px', background:c.bg, border:`1px solid ${c.bd}` }}>
                    <Box sx={{ width:18, height:18, borderRadius:'50%', background:`${c.tx}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, mt:'1px' }}>
                      <Typography sx={{ fontSize:9, fontWeight: 500, color:c.tx, fontFamily:FF }}>{c.icon}</Typography>
                    </Box>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:c.tx, fontFamily:FF, lineHeight:1.5 }}>{a.msg}</Typography>
                  </Box>
                );
              })}
              {/* Resumen rápido */}
              <Box sx={{ mt:'4px', p:'10px 12px', borderRadius:'8px', background:'rgba(26,26,26,.04)', border:`1px solid ${DL.border}` }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FF, mb:'6px' }}>Resumen del período</Typography>
                <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                  {[
                    { lbl:'Punto de equilibrio', val: fmt$(Math.round(d.fijos / margen * 100)) },
                    { lbl:'Cobertura fijos',     val: `${((d.ingresos / d.fijos)*100).toFixed(0)}%` },
                    { lbl:'Eficiencia de costos',val: `${((costos/d.ingresos)*100).toFixed(1)}%` },
                    { lbl:'Ingresos / unidad',   val: `$${Math.round(d.ingresos/d.unidades)}` },
                  ].map(r => (
                    <Box key={r.lbl}>
                      <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FF }}>{r.lbl}</Typography>
                      <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FF, letterSpacing:'-0.02em' }}>{r.val}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
