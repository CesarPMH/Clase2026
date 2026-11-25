// ─── Dashboard Financiero ─────────────────────────────────────────────────────
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/common/KpiCard';
import { DL } from '../theme';
import { FIN_KPIS, RENDIMIENTO, ALERTAS_FIN } from '../data/financiero';
import AlertasSistema from '../components/common/AlertasSistema';
import { useT } from '../i18n/LanguageContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ff = "'Inter', ui-sans-serif, system-ui, sans-serif";
const fmt = v => {
  if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(1) + 'K';
  return '$' + v.toFixed(0);
};
const fmtFull = v =>
  (v < 0 ? '-' : '') + '$' +
  Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ─── Datos ────────────────────────────────────────────────────────────────────
const MONTHS_LABELS = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'];
const MONTHS_VENTAS  = [86800,  95400, 143200, 141000, 158000, 175000, 185000];
const MONTHS_UTIL    = [16500,  19200,  43100,  52000,  68000,  82000,  93000];
const MONTHS_GASTOS  = [11500,  12800,  14200,  13500,  12900,  11800,  10800];
const META_LINE      = [110000, 110000, 128000, 160000, 190000, 210000, 210000];

const PL_ROWS = [
  { label: 'Ventas',                val26: 749740,  val25: 467593,  isSub: false },
  { label: '(-) Costo de Ventas',   val26: -250090, val25: -276395, isSub: false },
  { label: 'Utilidad Bruta',        val26: 499651,  val25: 191198,  isSub: true  },
  { label: '(-) Gastos Operativos', val26: -73252,  val25: -102128, isSub: false },
  { label: 'Utilidad Operativa',    val26: 426399,  val25: 89071,   isSub: true  },
  { label: '(+/-) Otros netos',     val26: -433,    val25: -2867,   isSub: false },
  { label: 'U. Antes de Impuesto',  val26: 425967,  val25: 86204,   isSub: true  },
  { label: '(+) D&A estimado',      val26: 8521,    val25: 4200,    isSub: false },
  { label: 'EBITDA',                val26: 434920,  val25: 93271,   isSub: true, isEbitda: true },
  { label: '(-) ISR est. (25%)',    val26: -106492, val25: -21684,  isSub: false },
  { label: 'Resultado del Ejercicio', val26: 319475, val25: 65150,  isSub: true, isResultado: true },
];

const VENDORS = (RENDIMIENTO?.vendedor ?? [])
  .map(v => ({ ...v, margen: +((v.util / v.ventas) * 100).toFixed(1) }))
  .sort((a, b) => b.margen - a.margen);

const ALERT_STYLE = {
  r: { bg: '#fff1f0', border: DL.red,    iconBg: DL.redBg,    iconColor: DL.red,    label: '!' },
  y: { bg: '#fffbeb', border: DL.yellow, iconBg: DL.yellowBg, iconColor: DL.yellow, label: '△' },
  g: { bg: '#f0fdf4', border: DL.green,  iconBg: DL.greenBg,  iconColor: DL.green,  label: '✓' },
};

// ─── Toggle series ────────────────────────────────────────────────────────────
function TogBtn({ active, onClick, children }) {
  return (
    <Box component="button" onClick={onClick} sx={{
      px: '10px', py: '3px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: ff,
      fontSize: 10, fontWeight: 500,
      background: active ? DL.blue : 'transparent',
      color: active ? '#fff' : DL.tS,
      transition: 'all .15s',
    }}>
      {children}
    </Box>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Financiero() {
  const [period, setPeriod]   = useState('mes');
  const [seriesKey, setSeries] = useState('all');
  const navigate = useNavigate();
  const { t } = useT();

  const kpiData = {
    mes:       { ventas: fmtFull(749740),  uai: fmtFull(425966), ebitda: fmtFull(434920), resultado: fmtFull(319475), cf: fmtFull(243700) },
    trimestre: { ventas: fmtFull(580000),  uai: fmtFull(327000), ebitda: fmtFull(310000), resultado: fmtFull(232500), cf: fmtFull(198000) },
    anio:      { ventas: fmtFull(1490000), uai: fmtFull(839000), ebitda: fmtFull(870000), resultado: fmtFull(652500), cf: fmtFull(520000) },
  };

  const visible = n => seriesKey === 'all' || seriesKey === n;

  const chartOption = {
    tooltip: {
      trigger: 'axis', backgroundColor: '#fff',
      borderColor: 'rgba(26,26,26,.12)', borderWidth: 1,
      textStyle: { fontFamily: ff, fontSize: 11, color: DL.tH },
      extraCssText: 'box-shadow:0 6px 20px rgba(26,26,26,.13);border-radius:8px',
      formatter: params => {
        let s = `<div style="font-weight:500;margin-bottom:6px">${params[0].axisValue}</div>`;
        params.forEach(p => {
          if (p.seriesName === 'Meta') s += `<div style="display:flex;justify-content:space-between;gap:14px"><span>${p.marker}<em>Meta</em></span><strong style="color:#f97316">$800K</strong></div>`;
          else s += `<div style="display:flex;justify-content:space-between;gap:14px"><span>${p.marker}${p.seriesName}</span><strong>$${Number(p.value).toLocaleString()}</strong></div>`;
        });
        return s;
      },
    },
    grid: { top: 28, right: 14, bottom: 24, left: 54 },
    legend: { textStyle: { fontFamily: ff, fontSize: 10 }, top: 4 },
    xAxis: {
      type: 'category', data: MONTHS_LABELS,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { fontFamily: ff, fontSize: 10, color: DL.tS }, splitLine: { show: false },
    },
    yAxis: {
      type: 'value', axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { fontFamily: ff, fontSize: 10, color: DL.tS, formatter: v => v >= 1000 ? '$' + (v/1000).toFixed(0) + 'K' : '$' + v },
      splitLine: { lineStyle: { color: 'rgba(26,26,26,.06)', type: 'dashed' } },
    },
    series: [
      visible('ventas') && { name:'Ventas',   type:'line', data:MONTHS_VENTAS, smooth:0.3, lineStyle:{color:DL.blue,  width:2.5}, itemStyle:{color:DL.blue},   symbol:'circle', symbolSize:5, areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:DL.blue+'28'},{offset:1,color:DL.blue+'02'}]}} },
      visible('utilidad') && { name:'Utilidad', type:'line', data:MONTHS_UTIL,   smooth:0.3, lineStyle:{color:DL.green, width:2.5}, itemStyle:{color:DL.green},  symbol:'circle', symbolSize:5, areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:DL.green+'28'},{offset:1,color:DL.green+'02'}]}} },
      visible('gastos') && { name:'Gastos',   type:'line', data:MONTHS_GASTOS, smooth:0.3, lineStyle:{color:'#d97706',width:2.5}, itemStyle:{color:'#d97706'}, symbol:'circle', symbolSize:5, areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'#d9770628'},{offset:1,color:'#d9770602'}]}} },
      visible('ventas') && { name:'Meta', type:'line', data:META_LINE, lineStyle:{color:'#f97316',width:2,type:'dashed'}, itemStyle:{color:'#f97316'}, symbol:'none' },
    ].filter(Boolean),
  };

  return (
    <Box sx={{ p: '14px 20px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 500, color: DL.tH, fontFamily: ff, flex: 1 }}>
          {t('page.financiero')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '8px', px: '10px', py: '5px' }}>
          <Box component="span" sx={{ fontSize: 13, opacity: .6 }}>📅</Box>
          <Box component="select" value={period} onChange={e => setPeriod(e.target.value)} sx={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: ff, fontSize: 11, fontWeight: 500, color: DL.tH, cursor: 'pointer' }}>
            <option value="mes">{t('time.mensual')} — Abr 2026</option>
            <option value="trimestre">{t('time.trimestre')} — Q1-Q2 2026</option>
            <option value="anio">{t('time.año')} — Ene-Dic 2026</option>
          </Box>
        </Box>
      </Box>

      {/* ── 5 KPI Cards (usando KpiCard existente) ──────────────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <KpiCard
          lbl={t('fin.kpi.ventasMeta')}  val={kpiData[period].ventas}
          pct={93.7}                     meta="$800,000"   metaLbl={t('fin.kpi.metaMensual')}
          diff="-$50,260"
          yoyPrev="$467,593"     yoyDelta="+60.3%" yoyUp
        />
        <KpiCard
          lbl={t('fin.kpi.utilAntesImp')}  val={kpiData[period].uai}
          pct={112}                         meta="$380,000"  metaLbl={t('fin.kpi.metaMensual')}
          diff="+$45,966"
          yoyPrev="$86,204"          yoyDelta="+394.2%" yoyUp
        />
        <KpiCard
          lbl={t('fin.kpi.ebitda')}  val={kpiData[period].ebitda}
          pct={114.5}                meta="$380,000"   metaLbl={t('fin.kpi.metaMensual')}
          diff="+$54,920"
          yoyPrev="$93,271"     yoyDelta="+366.1%" yoyUp
          icon="D&A"
        />
        <KpiCard
          lbl={t('fin.kpi.resultadoNeto')}  val={kpiData[period].resultado}
          pct={106}                          meta="$300,000"  metaLbl={t('fin.kpi.metaMensual')}
          diff="+$19,475"
          yoyPrev="$65,150"                yoyDelta="+390.3%" yoyUp
        />
        <KpiCard
          lbl={t('fin.kpi.cashFlow')}  val={kpiData[period].cf}
          pct={101}                     meta="$240,000"   metaLbl={t('fin.kpi.metaMensual')}
          diff="+$3,700"
          yoyPrev="$186,000"         yoyDelta="+31%" yoyUp
        />
      </Box>

      {/* ── Gráfica + Alertas ───────────────────────────────────────── */}
      <Box sx={{ background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 0 }}>

          {/* Gráfica */}
          <Box sx={{ borderRight: `1px solid ${DL.border}`, p: '12px 14px 10px' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', mb: '6px', flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: ff }}>
                  {t('fin.dash.haciaAdonde')}
                </Typography>
                <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: ff }}>Oct 2025 – Abr 2026</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: '2px', background: DL.subtle, borderRadius: '7px', p: '2px' }}>
                {[['all',t('fin.tab.todos')],['ventas',t('fin.tab.ventas')],['utilidad',t('fin.tab.utilidad')],['gastos',t('fin.tab.gastos')]].map(([k,l]) => (
                  <TogBtn key={k} active={seriesKey===k} onClick={()=>setSeries(k)}>{l}</TogBtn>
                ))}
              </Box>
            </Box>
            <ReactECharts option={chartOption} style={{ height: 240 }} />
          </Box>

          {/* Alertas de Sistema */}
          <AlertasSistema alerts={ALERTAS_FIN} />
        </Box>
      </Box>

      {/* ── Ranking + P&L ───────────────────────────────────────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>

        {/* Ranking vendedores */}
        <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1, overflow:'hidden' }}>
          <Box sx={{ p:'10px 14px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center' }}>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:ff, flex:1 }}>{t('fin.dash.rankingVend')}</Typography>
            <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:ff }}>{t('fin.dash.porMargen')}</Typography>
          </Box>
          <Box component="table" sx={{ width:'100%', borderCollapse:'collapse', fontSize:11, fontFamily:ff }}>
            <Box component="thead">
              <Box component="tr" sx={{ background:DL.subtle }}>
                {[t('fin.col.rank'),t('fin.rend.vendedor'),t('fin.tbl.ventas'),t('fin.col.mrg'),t('fin.col.uBruta')].map((h,i)=>(
                  <Box component="th" key={h} sx={{ p:'6px 10px', textAlign:i>1?'right':'left', fontSize:9, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${DL.border}` }}>{h}</Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {VENDORS.slice(0,8).map((v,i)=>{
                const rank = i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1);
                const mc = v.margen>=50?DL.green:v.margen>=35?DL.yellow:DL.red;
                return (
                  <Box component="tr" key={v.name} sx={{ borderBottom:`1px solid ${DL.border}`, '&:last-child':{borderBottom:'none'}, '&:hover':{background:DL.subtle} }}>
                    <Box component="td" sx={{ p:'6px 10px', textAlign:'center', fontSize:12 }}>{rank}</Box>
                    <Box component="td" sx={{ p:'6px 10px', fontWeight: 500, color:DL.tH, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.name}</Box>
                    <Box component="td" sx={{ p:'6px 10px', textAlign:'right', color:DL.tM }}>{fmt(v.ventas)}</Box>
                    <Box component="td" sx={{ p:'6px 10px', textAlign:'right' }}><Box component="span" sx={{ fontWeight: 500, color:mc }}>{v.margen}%</Box></Box>
                    <Box component="td" sx={{ p:'6px 10px', textAlign:'right', fontWeight: 500, color:DL.green }}>{fmt(v.util)}</Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* P&L Resumen */}
        <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1, overflow:'hidden' }}>
          <Box sx={{ p:'10px 14px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center' }}>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:ff, flex:1 }}>{t('fin.dash.pl')}</Typography>
            <Box component="button" onClick={()=>navigate('/estado')} sx={{ fontSize:10, fontWeight: 500, color:DL.blue, background:'transparent', border:`1px solid ${DL.border}`, borderRadius:'6px', px:'8px', py:'3px', cursor:'pointer', fontFamily:ff, '&:hover':{background:DL.subtle} }}>{t('fin.dash.verCompleto')}</Box>
          </Box>
          <Box component="table" sx={{ width:'100%', borderCollapse:'collapse', fontSize:10, fontFamily:ff }}>
            <Box component="thead">
              <Box component="tr" sx={{ background:DL.subtle }}>
                {[t('fin.col.cuenta'),'2025','2026',t('fin.col.var'),t('fin.col.pctIng')].map((h,i)=>(
                  <Box component="th" key={h} sx={{ p:'5px 10px', textAlign:i>0?'right':'left', fontSize:8, fontWeight: 500, color:i===4?DL.blue:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${DL.border}` }}>{h}</Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {PL_ROWS.map((r,i)=>{
                const vp = r.val25!==0?((r.val26-r.val25)/Math.abs(r.val25)*100).toFixed(1):null;
                const ps = (Math.abs(r.val26)/749740*100).toFixed(1);
                const isE=r.isEbitda, isR=r.isResultado;
                return (
                  <Box component="tr" key={i} sx={{ background:isE?'rgba(26,26,26,.04)':isR?'rgba(22,163,74,.05)':'transparent', borderBottom:`1px solid ${DL.border}`, '&:last-child':{borderBottom:'none'} }}>
                    <Box component="td" sx={{ p:'4px 10px', color:isE?DL.blue:isR?DL.green:r.isSub?DL.tH:DL.tM, fontWeight:r.isSub?500:400, whiteSpace:'nowrap' }}>{r.label}</Box>
                    <Box component="td" sx={{ p:'4px 10px', textAlign:'right', color:DL.tS }}>{fmtFull(r.val25)}</Box>
                    <Box component="td" sx={{ p:'4px 10px', textAlign:'right', fontWeight:r.isSub?500:400, color:isE?DL.blue:isR?DL.green:r.val26>=0?DL.tH:DL.red }}>{fmtFull(r.val26)}</Box>
                    <Box component="td" sx={{ p:'4px 10px', textAlign:'right' }}>
                      {vp&&<Box component="span" sx={{ color:Number(vp)>=0?DL.green:DL.red, fontWeight: 500 }}>{Number(vp)>=0?'+':''}{vp}%</Box>}
                    </Box>
                    <Box component="td" sx={{ p:'4px 10px', textAlign:'right', color:DL.blue, fontWeight:r.isSub?500:400 }}>{ps}%</Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>


      </Box>
    </Box>
  );
}
