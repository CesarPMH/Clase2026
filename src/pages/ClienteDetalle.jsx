// ─── Dashboard de Seguimiento de Cliente ─────────────────────────────────────
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  Box, Typography, Paper, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputBase,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  ViewColumn as ColIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as ChevronIcon,
  CalendarMonth as CalIcon,
  KeyboardArrowUp as SortUpIcon,
  UnfoldMore as SortIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  DirectionsWalk as VisitIcon,
} from '@mui/icons-material';
import { DL } from '../theme';

const FONT = "'Inter',sans-serif";

// ─── Demo data ────────────────────────────────────────────────────────────────
const CLIENTE = { name:'Veterinaria Los Pinos', clasificacion:'A', lastUpdate:'5/07/2025 02:00 pm' };

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const CHART = {
  y2024:  [6200, 8400, 9400, 8600, 10800, 4800, 5400, 5200, 4800, 5000, 4200, 5200],
  y2025:  [7800, 9200, 10200, 9400, 11000, 5200, 8600, 10400, 5000, 5400, 4600, 5400],
  budget: Array(12).fill(6000),
};

const FACTURAS = [
  { id:'001-001-0060541', cond:'Crédito', fecha:'24/07/25', venc:'14/08/25', cant:38, venta:12490, mgQ:9430,  mgPct:24.5, abono:12490, pend:0,    diasV:0,  estado:'Pagada'    },
  { id:'001-001-0060560', cond:'Crédito', fecha:'22/07/25', venc:'21/08/25', cant:29, venta:9840,  mgQ:7200,  mgPct:26.8, abono:9840,  pend:0,    diasV:0,  estado:'Pagada'    },
  { id:'001-001-0060561', cond:'Contado', fecha:'20/07/25', venc:'20/07/25', cant:15, venta:5230,  mgQ:3900,  mgPct:25.4, abono:5230,  pend:0,    diasV:0,  estado:'Pagada'    },
  { id:'001-001-0060562', cond:'Crédito', fecha:'18/07/25', venc:'17/08/25', cant:42, venta:13700, mgQ:10100, mgPct:26.3, abono:6000,  pend:7700, diasV:14, estado:'Pendiente' },
  { id:'001-001-0060563', cond:'Crédito', fecha:'15/07/25', venc:'14/08/25', cant:31, venta:10200, mgQ:7600,  mgPct:25.5, abono:10200, pend:0,    diasV:0,  estado:'Pagada'    },
  { id:'001-001-0060540', cond:'Contado', fecha:'10/07/25', venc:'10/07/25', cant:22, venta:7800,  mgQ:5800,  mgPct:25.6, abono:7800,  pend:0,    diasV:0,  estado:'Pagada'    },
];

const SB = {
  totalVencido:7884, totalFact:42, pagadas:41, pendientes:1,
  cruzadas: [
    { prod:'Vacuna Triple',    sub:'Producto relacionado a su cartera' },
    { prod:'Anti Parasitario', sub:'Producto relacionado a su cartera' },
  ],
  masComprados: [
    { prod:'Vacuna Triple',    u:210, v:24959 },
    { prod:'Anti Parasitario', u:210, v:24959 },
  ],
  ultimos: [
    { prod:'Vacuna Triple',    fecha:'24/07/25', u:66, v:14975 },
    { prod:'Anti Parasitario', fecha:'21/07/25', u:31, v:14975 },
  ],
  riesgo:       [{ prod:'Anti Parasitario', detail:'-30% menos que período ant.' }],
  dejoComprar:  [{ prod:'Suplemento Plus',  detail:'Última compra: Feb 2025' }],
};

// ─── Credit & Collections demo data ─────────────────────────────────────────
const CREDITO = {
  limite:     85000,
  utilizado:  79000,
  disponible: 6000,
  desviacion: 7.0,
  notas: [
    { id:'NC-001-2341', fecha:'10/07/25', monto:2400, motivo:'Devolución de producto' },
    { id:'NC-001-2298', fecha:'02/06/25', monto:1200, motivo:'Descuento por volumen'  },
  ],
  ultimoPago: { fecha:'22/07/25', monto:9840 },
  creditosActivos: 3,
};

const CATEGORIA = 'AA';
const CATEGORIA_COLORS = { AA:'#16a34a', A:'#547e69', B:'#d97706', C:'#ea580c', D:'#dc2626' };
const CATEGORIA_BG     = { AA:'rgba(22,163,74,.1)', A:'rgba(84,126,105,.1)', B:'rgba(217,119,6,.1)', C:'rgba(234,88,12,.1)', D:'rgba(220,38,38,.1)' };

const COBROS = {
  responsable:         'Carlos Méndez',
  cargo:               'Vendedor',
  diasVencido:         14,
  enCobranza:          false,
  promedioDiasRetraso: 8,
  interaccionesPorPago:2.3,
  costoGestion:        145,
  ultimaVenta:         '24/07/25',
  ultimoCobro:         '22/07/25',
  interacciones: [
    { fecha:'28/07/25', tipo:'Llamada',  duracion:'8 min', resultado:'Prometió pago para el 05/08',              resp:'Carlos Méndez' },
    { fecha:'25/07/25', tipo:'WhatsApp', duracion:'—',     resultado:'Confirmó recepción de estado de cuenta',   resp:'Carlos Méndez' },
    { fecha:'20/07/25', tipo:'Visita',   duracion:'25 min',resultado:'Revisión de facturas pendientes en sitio', resp:'Carlos Méndez' },
  ],
  abonosFuturos: [
    { fecha:'05/08/25', monto:7700, estado:'Comprometido', factura:'001-001-0060562' },
  ],
};

const PROX_VENCER = { fecha:'14/08/25', monto:7700, diasRestantes:17, factura:'001-001-0060562' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtQ = v => 'Q' + Number(v).toLocaleString('en-US');
const fmt$ = v => v >= 1000 ? `$${(v/1000).toFixed(1).replace('.0','')}K` : `$${v}`;
const fmtN = v => '$' + Number(v).toLocaleString('en-US');

// ─── Top bar ──────────────────────────────────────────────────────────────────
function TopBar({ onBack, period, setPeriod, cliente, setCliente }) {
  const PERIODS  = ['Ago 2026','Jul 2026','Jun 2026','YTD 2026'];
  const CLIENTES = ['Veterinaria Los Pinos','Farma Central','Gloria Mar','Distribuidora K'];

  const Sel = ({ value, onChange, opts, icon }) => (
    <Box sx={{ display:'flex', alignItems:'center', gap:'5px', px:'10px', py:'5px', border:`1px solid ${DL.border}`, borderRadius:'7px', background:'#fff', cursor:'pointer', '&:hover':{ borderColor:DL.blue } }}>
      {icon && <Box sx={{ color:DL.tS, display:'flex', alignItems:'center' }}>{icon}</Box>}
      <Box component="select" value={value} onChange={e => onChange(e.target.value)} sx={{
        fontFamily:FONT, fontSize:11, fontWeight: 500, color:DL.tH,
        background:'transparent', border:'none', outline:'none', cursor:'pointer', appearance:'none',
      }}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </Box>
      <ChevronIcon sx={{ fontSize:14, color:DL.tS }} />
    </Box>
  );

  return (
    <Box sx={{ background:'#fff', borderBottom:`1px solid ${DL.border}`, px:'16px', py:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexShrink:0 }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:'12px', minWidth:0 }}>
        <Box onClick={onBack} sx={{ display:'flex', alignItems:'center', gap:'4px', cursor:'pointer', color:DL.tS, '&:hover':{ color:DL.navy }, transition:'color .15s', flexShrink:0 }}>
          <BackIcon sx={{ fontSize:16 }} />
          <Typography sx={{ fontSize:10, fontWeight: 500, fontFamily:FONT }}>Regresar</Typography>
        </Box>
        <Box sx={{ width:1, height:20, background:DL.border }} />
        <Box sx={{ minWidth:0 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <Typography sx={{ fontSize:14, fontWeight: 500, color:DL.tH, whiteSpace:'nowrap' }}>{CLIENTE.name}</Typography>
            <Box sx={{ px:'7px', py:'2px', borderRadius:'4px', background:'rgba(22,163,74,.1)', border:'1px solid rgba(22,163,74,.25)', flexShrink:0 }}>
              <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.green, textTransform:'uppercase', letterSpacing:'0.06em' }}>Clasificación A</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize:8, color:DL.tS }}>Última Actualización: {CLIENTE.lastUpdate}</Typography>
        </Box>
      </Box>

      <Box sx={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
        <Sel value={period} onChange={setPeriod} opts={PERIODS} icon={<CalIcon sx={{ fontSize:13 }} />} />
        <Sel value={cliente} onChange={setCliente} opts={CLIENTES} />
        <Box sx={{ width:30, height:30, borderRadius:'50%', border:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', '&:hover':{ background:DL.subtle } }}>
          <RefreshIcon sx={{ fontSize:14, color:DL.tS }} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────
function KCard({ accent, iconBg, iconColor, icon, label, value, children }) {
  return (
    <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, p:'12px 14px 10px', position:'relative', overflow:'hidden', boxShadow:DL.e1, display:'flex', flexDirection:'column' }}>
      <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, background:accent, borderRadius:'10px 10px 0 0' }} />
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mt:'2px', mb:'3px' }}>
        <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FONT }}>{label}</Typography>
        <Box sx={{ width:18, height:18, borderRadius:'50%', background:iconBg, color:iconColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight: 500, flexShrink:0 }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, letterSpacing:'-1px', lineHeight:1.15, mb:'6px', fontFamily:FONT }}>{value}</Typography>
      <Box sx={{ height:1, background:'rgba(26,26,26,.06)', mb:'7px' }} />
      {children}
    </Box>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <Box sx={{ height:5, background:'rgba(26,26,26,.07)', borderRadius:3, overflow:'hidden', mb:'5px' }}>
      <Box sx={{ height:'100%', width:`${Math.min(pct,100)}%`, background:color, borderRadius:3, transition:'width .6s ease' }} />
    </Box>
  );
}

function KpiCards() {
  const Row = ({ l, r, lColor, rColor }) => (
    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:'3px' }}>
      <Typography sx={{ fontSize:9, color: lColor || DL.tS, fontWeight: lColor ? 500 : 500, fontFamily:FONT }}>{l}</Typography>
      <Typography sx={{ fontSize:9, fontWeight: 500, color: rColor || DL.tM, fontFamily:FONT }}>{r}</Typography>
    </Box>
  );
  const BottomRow = ({ l, r, badge }) => (
    <Box sx={{ background:'rgba(26,26,26,.035)', borderRadius:'5px', p:'5px 8px', display:'flex', alignItems:'center', justifyContent:'space-between', mt:'auto', gap:'6px' }}>
      <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap', fontFamily:FONT }}>{l}</Typography>
      <Box sx={{ display:'flex', alignItems:'center', gap:'5px' }}>
        <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tM, whiteSpace:'nowrap', fontFamily:FONT }}>{r}</Typography>
        {badge && <Box sx={{ px:'4px', py:'1px', borderRadius:'4px', fontSize:8, fontWeight: 500, background:DL.greenBg, color:DL.green, fontFamily:FONT }}>{badge}</Box>}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5,minmax(0,1fr))', gap:'10px' }}>

      {/* 1 — Ventas Actuales */}
      <KCard accent={DL.green} icon="✓" iconBg={DL.greenBg} iconColor={DL.green} label="Ventas Actuales" value="Q74,876">
        <Row l="FACTURAS EMITIDAS" r="42" />
        <ProgressBar pct={72} color={DL.green} />
        <Row l="+6.9% vs Jul 2026" lColor={DL.green} r="Margen Bruto 31.2%" />
        <Box sx={{ height:1, background:'rgba(26,26,26,.06)', my:'6px' }} />
        <Row l="FACTURAS EMITIDAS" r="42" />
        <Row l="MARGEN BRUTO" r="31.2%" />
        <Box sx={{ display:'flex', alignItems:'center', gap:'4px', mt:'4px', cursor:'pointer' }}>
          <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.blue, textDecoration:'underline', textUnderlineOffset:'3px', fontFamily:FONT }}>✏ Ver Detalle</Typography>
        </Box>
      </KCard>

      {/* 2 — Margen Bruto */}
      <KCard accent={DL.green} icon="✓" iconBg={DL.greenBg} iconColor={DL.green} label="Margen Bruto" value="80%">
        <Row l="80% CUMPLIDO" lColor={DL.green} r="-Q1,360 faltante" rColor={DL.red} />
        <ProgressBar pct={80} color={DL.green} />
        <Row l="Vendido" r="Días Restantes: 8 Días" />
        <BottomRow l="VENDIDO / DÍAS REST." r="Q258,000" />
      </KCard>

      {/* 3 — Ticket Promedio */}
      <KCard accent={DL.blue} icon="+" iconBg="rgba(84,126,105,.12)" iconColor={DL.blue} label="Ticket Promedio" value="$830">
        <Row l="+9.2% VS JUL 2026" lColor={DL.green} r="" />
        <ProgressBar pct={65} color={DL.blue} />
        <Row l="12.4 prods." r="Ticket más Alto" />
        <BottomRow l="ARTÍCULO / TICKET" r="Q30,500" />
      </KCard>

      {/* 4 — Saldo Pendiente */}
      <KCard accent={DL.red} icon="!" iconBg={DL.redBg} iconColor={DL.red} label="Saldo Pendiente" value="$79K">
        <Row l="40% CUMPLIDO" lColor={DL.yellow} r="-Q5,000 faltante" rColor={DL.red} />
        <ProgressBar pct={40} color={DL.red} />
        <Row l="Vendido" r="Días Transcurridos: 30" />
        <BottomRow l="VENDIDO / TRANSCURRIDOS" r="Q2,000" badge="+10%" />
      </KCard>

      {/* 5 — Días desde Últ. Compra */}
      <KCard accent={DL.yellow} icon="⚠" iconBg={DL.yellowBg} iconColor={DL.yellow} label="Días desde Últ. Compra" value="30 Días">
        <Row l="+19% EN JUL 2026" lColor={DL.green} r="" />
        <ProgressBar pct={50} color={DL.yellow} />
        <Box sx={{ height:1, background:'rgba(26,26,26,.06)', my:'5px' }} />
        <Row l="ÚLTIMA COMPRA" r="Jul 17, 2026" />
        <Row l="FRECUENCIA PROMEDIO" r="Cada 30 días" rColor={DL.red} />
      </KCard>

    </Box>
  );
}

// ─── BLOCK 1 — Credit KPI row ─────────────────────────────────────────────────
function CreditoKpis() {
  const limiteColor  = CREDITO.utilizado > CREDITO.limite ? DL.red : DL.green;
  const limiteIconBg = CREDITO.utilizado > CREDITO.limite ? DL.redBg : DL.greenBg;
  const usedPct      = Math.round((CREDITO.utilizado / CREDITO.limite) * 100 * 10) / 10;

  const SmallRow = ({ l, r, rColor }) => (
    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FONT }}>{l}</Typography>
      <Typography sx={{ fontSize:9, fontWeight: 500, color: rColor || DL.tM, fontFamily:FONT }}>{r}</Typography>
    </Box>
  );

  return (
    <Box sx={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>

      {/* Card 1 — Límite de Crédito */}
      <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, p:'12px 14px 10px', position:'relative', overflow:'hidden', boxShadow:DL.e1, display:'flex', flexDirection:'column' }}>
        <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, background:limiteColor, borderRadius:'10px 10px 0 0' }} />
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mt:'2px', mb:'3px' }}>
          <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FONT }}>Límite de Crédito</Typography>
          <Box sx={{ width:18, height:18, borderRadius:'50%', background:limiteIconBg, color:limiteColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight: 500 }}>$</Box>
        </Box>
        <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, letterSpacing:'-1px', lineHeight:1.15, mb:'4px', fontFamily:FONT }}>$85K</Typography>
        <Box sx={{ height:1, background:'rgba(26,26,26,.06)', mb:'6px' }} />
        <Box sx={{ height:5, background:'rgba(26,26,26,.07)', borderRadius:3, overflow:'hidden', mb:'3px' }}>
          <Box sx={{ height:'100%', width:`${Math.min(usedPct,100)}%`, background:limiteColor, borderRadius:3 }} />
        </Box>
        <Typography sx={{ fontSize:8, fontWeight: 500, color:limiteColor, mb:'5px', fontFamily:FONT }}>{usedPct}% utilizado</Typography>
        <Box sx={{ background:'rgba(26,26,26,.035)', borderRadius:'5px', p:'5px 8px', mt:'auto' }}>
          <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, fontFamily:FONT }}>
            Disponible <strong style={{ color: DL.green }}>${CREDITO.disponible.toLocaleString()}</strong>
            {' '}| Desviación <strong style={{ color: DL.red }}>+{CREDITO.desviacion}%</strong>
          </Typography>
        </Box>
      </Box>

      {/* Card 2 — Categoría del Cliente */}
      <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, p:'12px 14px 10px', position:'relative', overflow:'hidden', boxShadow:DL.e1, display:'flex', flexDirection:'column' }}>
        <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, background:CATEGORIA_COLORS[CATEGORIA], borderRadius:'10px 10px 0 0' }} />
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mt:'2px', mb:'4px' }}>
          <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FONT }}>Categoría del Cliente</Typography>
          <Box sx={{
            width:28, height:28, borderRadius:'50%',
            background: CATEGORIA_BG[CATEGORIA],
            border: `2px solid ${CATEGORIA_COLORS[CATEGORIA]}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Typography sx={{ fontSize:11, fontWeight: 500, color: CATEGORIA_COLORS[CATEGORIA], fontFamily:FONT }}>{CATEGORIA}</Typography>
          </Box>
        </Box>
        <Box sx={{ height:1, background:'rgba(26,26,26,.06)', mb:'5px' }} />
        <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tM, mb:'6px', fontFamily:FONT }}>Paga antes o en fecha de vencimiento</Typography>
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px', mt:'auto' }}>
          <Box sx={{ background:'rgba(26,26,26,.03)', borderRadius:'5px', p:'4px 6px', textAlign:'center' }}>
            <Typography sx={{ fontSize:7, color:DL.tS, fontFamily:FONT }}>Prom. retraso</Typography>
            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{COBROS.promedioDiasRetraso} días</Typography>
          </Box>
          <Box sx={{ background:'rgba(26,26,26,.03)', borderRadius:'5px', p:'4px 6px', textAlign:'center' }}>
            <Typography sx={{ fontSize:7, color:DL.tS, fontFamily:FONT }}>Interacciones</Typography>
            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{COBROS.interaccionesPorPago}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Card 3 — Próximo Cobro */}
      <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, p:'12px 14px 10px', position:'relative', overflow:'hidden', boxShadow:DL.e1, display:'flex', flexDirection:'column' }}>
        <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, background:DL.yellow, borderRadius:'10px 10px 0 0' }} />
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mt:'2px', mb:'3px' }}>
          <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FONT }}>Próximo Cobro</Typography>
          <Box sx={{ px:'6px', py:'2px', borderRadius:'4px', background:DL.yellowBg, border:`1px solid rgba(217,119,6,.3)` }}>
            <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.yellow, fontFamily:FONT }}>En {PROX_VENCER.diasRestantes} días</Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, letterSpacing:'-1px', lineHeight:1.15, mb:'4px', fontFamily:FONT }}>{PROX_VENCER.fecha}</Typography>
        <Box sx={{ height:1, background:'rgba(26,26,26,.06)', mb:'5px' }} />
        <Typography sx={{ fontSize:9, color:DL.tM, mb:'auto', fontFamily:FONT }}>
          Factura <strong>{PROX_VENCER.factura}</strong> · ${PROX_VENCER.monto.toLocaleString()} pendiente
        </Typography>
        <Box sx={{ background:'rgba(26,26,26,.035)', borderRadius:'5px', p:'5px 8px', mt:'6px' }}>
          <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, fontFamily:FONT }}>Fecha sugerida de gestión: <strong>10/08/25</strong></Typography>
        </Box>
      </Box>

      {/* Card 4 — Gestión de Cobro */}
      <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, p:'12px 14px 10px', position:'relative', overflow:'hidden', boxShadow:DL.e1, display:'flex', flexDirection:'column' }}>
        <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, background: COBROS.diasVencido < 31 ? DL.green : DL.red, borderRadius:'10px 10px 0 0' }} />
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mt:'2px', mb:'3px' }}>
          <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FONT }}>Gestión de Cobro</Typography>
          <Box sx={{
            px:'6px', py:'2px', borderRadius:'4px',
            background: COBROS.diasVencido < 31 ? DL.greenBg : DL.redBg,
            border: `1px solid ${COBROS.diasVencido < 31 ? 'rgba(22,163,74,.3)' : 'rgba(220,38,38,.3)'}`,
          }}>
            <Typography sx={{ fontSize:7, fontWeight: 500, color: COBROS.diasVencido < 31 ? DL.green : DL.red, fontFamily:FONT }}>
              {COBROS.diasVencido < 31 ? 'En seguimiento vendedor' : 'En cobranza'}
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize:19, fontWeight: 500, color:DL.tH, letterSpacing:'-0.5px', lineHeight:1.2, mb:'4px', fontFamily:FONT }}>{COBROS.responsable}</Typography>
        <Box sx={{ height:1, background:'rgba(26,26,26,.06)', mb:'5px' }} />
        <Typography sx={{ fontSize:9, color:DL.tM, mb:'auto', fontFamily:FONT }}>
          {COBROS.cargo} · <strong style={{ color: DL.yellow }}>{COBROS.diasVencido} días vencido</strong>
        </Typography>
        <Box sx={{ background:'rgba(26,26,26,.035)', borderRadius:'5px', p:'5px 8px', mt:'6px' }}>
          <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, fontFamily:FONT }}>
            Última venta: <strong>{COBROS.ultimaVenta}</strong> · Último cobro: <strong>{COBROS.ultimoCobro}</strong>
          </Typography>
        </Box>
      </Box>

    </Box>
  );
}

// ─── Ventas por Período chart ─────────────────────────────────────────────────
function VentasPeriodo() {
  const [gran,  setGran]  = useState('mes');
  const [split, setSplit] = useState('mes');
  const [mode,  setMode]  = useState('$');

  const option = useMemo(() => ({
    animation: true, animationDuration: 400,
    grid: { top: 20, right: 20, bottom: 48, left: 56 },
    xAxis: {
      type:'category', data:MONTHS,
      axisLine:{ lineStyle:{ color:'rgba(26,26,26,.12)' } }, axisTick:{ show:false },
      axisLabel:{ fontFamily:'Inter', fontSize:10, color:'#8d8d8d' }, splitLine:{ show:false },
    },
    yAxis: {
      type:'value',
      axisLabel:{ fontFamily:'Inter', fontSize:10, color:'#8d8d8d', formatter: v => `$${v/1000}K` },
      splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } },
      axisLine:{ show:false }, axisTick:{ show:false },
    },
    tooltip:{
      trigger:'axis', backgroundColor:'#fff', borderColor:'rgba(26,26,26,.15)', borderWidth:1,
      padding:[10,14], textStyle:{ fontFamily:'Inter', fontSize:11 },
    },
    legend:{ show:false },
    series:[
      {
        name:'2024', type:'bar', data:CHART.y2024, barWidth:14, barGap:'20%',
        itemStyle:{ color:'rgba(180,180,180,.85)', borderRadius:[3,3,0,0] },
      },
      {
        name:'2025', type:'bar', data:CHART.y2025, barWidth:14,
        itemStyle:{ color:'#1a1a1a', borderRadius:[3,3,0,0] },
      },
      {
        name:'Presupuesto 2025', type:'line', data:CHART.budget, smooth:false,
        symbol:'circle', symbolSize:5,
        lineStyle:{ color:'#f59e0b', width:2, type:'dashed' },
        itemStyle:{ color:'#f59e0b' }, z:10,
      },
    ],
  }), []);

  const Pill = ({ v, cur, set, label }) => (
    <Box onClick={() => set(v)} sx={{
      px:'10px', py:'4px', fontSize:10, fontWeight: 500, cursor:'pointer',
      borderRadius:'5px', userSelect:'none', transition:'all .14s', fontFamily:FONT,
      background: cur===v ? DL.navy : 'transparent',
      color: cur===v ? '#fff' : DL.tS,
      '&:hover': cur!==v ? { background:'rgba(26,26,26,.06)' } : {},
    }}>{label}</Box>
  );

  return (
    <Paper elevation={1} sx={{ p:'14px 16px 10px' }}>
      <Box sx={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', mb:'10px' }}>
        <Box>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Ventas por Período</Typography>
          <Typography sx={{ fontSize:9, color:DL.tS, mt:'2px', fontFamily:FONT }}>Historial mensual · comparativo anual</Typography>
        </Box>
        <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {/* Gran */}
          <Box sx={{ display:'flex', border:`1px solid ${DL.border}`, borderRadius:'6px', overflow:'hidden' }}>
            {[{v:'mes',l:'Mes'},{v:'trim',l:'Trim'},{v:'año',l:'Año'}].map(o => (
              <Pill key={o.v} v={o.v} cur={gran} set={setGran} label={o.l} />
            ))}
          </Box>
          {/* Split */}
          <Box sx={{ display:'flex', alignItems:'center', gap:'6px', border:`1px solid ${DL.border}`, borderRadius:'6px', px:'8px', py:'4px' }}>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tS, fontFamily:FONT }}>Split by:</Typography>
            <Box component="select" value={split} onChange={e => setSplit(e.target.value)} sx={{
              fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tH,
              background:'transparent', border:'none', outline:'none', cursor:'pointer', appearance:'none',
            }}>
              {['Mes','Semana','Día'].map(o => <option key={o}>{o}</option>)}
            </Box>
            <ChevronIcon sx={{ fontSize:13, color:DL.tS }} />
          </Box>
          {/* $ / Cant toggle */}
          <Box sx={{ display:'flex', alignItems:'center', gap:'5px', border:`1px solid ${DL.border}`, borderRadius:'6px', px:'8px', py:'5px' }}>
            <Typography sx={{ fontSize:10, fontWeight: 500, color: mode==='$' ? DL.tH : DL.tS, fontFamily:FONT }}>$</Typography>
            <Box onClick={() => setMode(m => m==='$'?'cant':'$')} sx={{
              width:28, height:15, borderRadius:'20px', cursor:'pointer',
              background: mode==='$' ? DL.blue : DL.border,
              position:'relative', transition:'background .2s',
            }}>
              <Box sx={{
                width:11, height:11, borderRadius:'50%', background:'#fff',
                position:'absolute', top:'2px',
                left: mode==='$' ? '2px' : '15px',
                transition:'left .2s',
              }} />
            </Box>
            <Typography sx={{ fontSize:10, fontWeight: 500, color: mode==='cant' ? DL.tH : DL.tS, fontFamily:FONT }}>Cant</Typography>
          </Box>
        </Box>
      </Box>

      <ReactECharts option={option} style={{ height:280 }} />

      {/* Legend */}
      <Box sx={{ display:'flex', gap:'16px', justifyContent:'center', mt:'8px' }}>
        {[
          { color:'rgba(180,180,180,.85)', label:'2024', circle:true },
          { color:'#1a1a1a', label:'2025', circle:true },
          { color:'#f59e0b', label:'Presupuesto 2025', dashed:true },
        ].map(l => (
          <Box key={l.label} sx={{ display:'flex', alignItems:'center', gap:'5px' }}>
            {l.dashed
              ? <Box sx={{ width:18, borderTop:`2px dashed ${l.color}` }} />
              : <Box sx={{ width:10, height:10, borderRadius:'2px', background:l.color }} />}
            <Typography sx={{ fontSize:9, color:DL.tS, fontWeight: 500, fontFamily:FONT }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

// ─── Invoice table ────────────────────────────────────────────────────────────
function FacturasTable() {
  const [tab,     setTab]     = useState('todas');
  const [search,  setSearch]  = useState('');
  const [sortCol, setSortCol] = useState('venta');
  const [sortDir, setSortDir] = useState('desc');
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 5;

  const filtered = useMemo(() => {
    let rows = FACTURAS;
    if (tab === 'pagadas')    rows = rows.filter(r => r.estado === 'Pagada');
    if (tab === 'pendientes') rows = rows.filter(r => r.estado === 'Pendiente');
    if (search) rows = rows.filter(r => r.id.includes(search) || r.cond.toLowerCase().includes(search.toLowerCase()));
    return [...rows].sort((a,b) => {
      const av = a[sortCol] ?? 0, bv = b[sortCol] ?? 0;
      return sortDir==='asc' ? av-bv : bv-av;
    });
  }, [tab, search, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const slice = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const handleSort = col => {
    if (sortCol===col) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const Th = ({ label, col, align='right' }) => (
    <TableCell
      onClick={() => col && handleSort(col)}
      sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS,
        background:'rgba(26,26,26,.025)', borderBottom:'2px solid rgba(26,26,26,.08)',
        px:'10px', py:'7px', textAlign:align, whiteSpace:'nowrap',
        cursor: col ? 'pointer' : 'default',
        '&:hover': col ? { color:DL.navy } : {},
        fontFamily:FONT,
      }}>
      <Box sx={{ display:'inline-flex', alignItems:'center', gap:'2px' }}>
        {label}
        {col && (sortCol===col
          ? <SortUpIcon sx={{ fontSize:10, color:DL.blue, transform: sortDir==='desc'?'rotate(180deg)':'none' }} />
          : <SortIcon sx={{ fontSize:9, color:'rgba(26,26,26,.25)' }} />)}
      </Box>
    </TableCell>
  );

  return (
    <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1, overflow:'hidden' }}>

      {/* ── Card header ── */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
        <Box>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Detalles de Venta</Typography>
          <Typography sx={{ fontSize:9, color:DL.tS, mt:'1px', fontFamily:FONT }}>Facturas del cliente en el período</Typography>
        </Box>
        <Box sx={{ display:'flex', gap:'8px' }}>
          <Box sx={{ display:'flex', alignItems:'center', background:'#f8fafc', border:`1px solid ${DL.border2}`, borderRadius:'7px', overflow:'hidden', '&:focus-within':{ borderColor:DL.blue } }}>
            <SearchIcon sx={{ fontSize:13, color:DL.tS, mx:'7px', opacity:.6 }} />
            <InputBase value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscador..."
              sx={{ fontFamily:FONT, fontSize:10, '& input':{ p:'5px 8px 5px 0', width:140 } }} />
          </Box>
          <Box sx={{ display:'flex', alignItems:'center', gap:'5px', px:'10px', py:'5px', border:`1px solid ${DL.border}`, borderRadius:'7px', cursor:'pointer', '&:hover':{ background:'rgba(26,26,26,.04)' } }}>
            <ColIcon sx={{ fontSize:13, color:DL.tS }} />
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tM, fontFamily:FONT }}>Columnas</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Tabs ── */}
      <Box sx={{ display:'flex', borderBottom:`1px solid ${DL.border}`, px:'8px' }}>
        {[{v:'todas',l:'Todas'},{v:'pagadas',l:'Pagadas'},{v:'pendientes',l:'Pendientes'}].map(t => (
          <Box key={t.v} component="button" onClick={() => { setTab(t.v); setPage(1); }} sx={{
            fontFamily:FONT, fontSize:10, fontWeight: tab===t.v ? 500 : 500,
            px:'12px', py:'7px', borderBottom:`2px solid ${tab===t.v ? DL.blue : 'transparent'}`,
            mb:'-1px', border:'none', background:'transparent',
            color: tab===t.v ? DL.navy : DL.tS, cursor:'pointer', transition:'all .14s',
            '&:hover':{ color:DL.tM },
          }}>{t.l}</Box>
        ))}
      </Box>

      <Box>
        <TableContainer>
          <Table size="small" sx={{ minWidth:900 }}>
            <TableHead>
              <TableRow>
                <Th label="Nº Factura" align="left" />
                <Th label="Cond. Pago" align="left" />
                <Th label="Fecha" align="left" />
                <Th label="Venc." align="left" />
                <Th label="Cant." col="cant" />
                <Th label="Venta $" col="venta" />
                <Th label="MG. Q" col="mgQ" />
                <Th label="MG%" col="mgPct" />
                <Th label="Abono" col="abono" />
                <Th label="Pendiente" col="pend" />
                <Th label="Días V." col="diasV" />
              </TableRow>
            </TableHead>
            <TableBody>
              {slice.map(r => (
                <TableRow key={r.id} hover sx={{ '&:hover td':{ background:'rgba(84,126,105,.025)' } }}>
                  <TableCell sx={{ px:'10px', py:'9px' }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.blue, cursor:'pointer', '&:hover':{ textDecoration:'underline' }, fontFamily:FONT }}>{r.id}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize:10, color:DL.tM, px:'10px', fontFamily:FONT }}>{r.cond}</TableCell>
                  <TableCell sx={{ fontSize:10, color:DL.tM, px:'10px', fontFamily:FONT }}>{r.fecha}</TableCell>
                  <TableCell sx={{ fontSize:10, color:DL.tM, px:'10px', fontFamily:FONT }}>{r.venc}</TableCell>
                  <TableCell sx={{ fontSize:11, fontWeight: 500, color:DL.tH, textAlign:'right', px:'10px', fontFamily:FONT }}>{r.cant}</TableCell>
                  <TableCell sx={{ fontSize:11, fontWeight: 500, color:DL.tH, textAlign:'right', px:'10px', whiteSpace:'nowrap', fontFamily:FONT }}>{fmtN(r.venta)}</TableCell>
                  <TableCell sx={{ fontSize:10, color:DL.tM, textAlign:'right', px:'10px', whiteSpace:'nowrap', fontFamily:FONT }}>{fmtN(r.mgQ)}</TableCell>
                  <TableCell sx={{ textAlign:'right', px:'10px' }}>
                    <Box sx={{ display:'inline-flex', alignItems:'center', gap:'3px', px:'6px', py:'2px', borderRadius:'4px', background: r.mgPct>=25?DL.greenBg:DL.yellowBg }}>
                      <Box sx={{ width:4, height:4, borderRadius:'50%', background: r.mgPct>=25?DL.green:DL.yellow }} />
                      <Typography sx={{ fontSize:9, fontWeight: 500, color: r.mgPct>=25?DL.green:DL.yellow, fontFamily:FONT }}>{r.mgPct}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize:11, fontWeight: 500, color:DL.tH, textAlign:'right', px:'10px', whiteSpace:'nowrap', fontFamily:FONT }}>{fmtN(r.abono)}</TableCell>
                  <TableCell sx={{ fontSize:11, fontWeight: 500, textAlign:'right', px:'10px', whiteSpace:'nowrap', color: r.pend>0 ? DL.red : DL.green, fontFamily:FONT }}>
                    {r.pend>0 ? fmtN(r.pend) : '$0'}
                  </TableCell>
                  <TableCell sx={{ fontSize:11, fontWeight: r.diasV>0?500:400, textAlign:'right', px:'10px', color: r.diasV>0?DL.red:DL.tS, fontFamily:FONT }}>
                    {r.diasV}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ px:'16px', py:'8px', borderTop:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>
            Mostrando {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} de {filtered.length} Facturas
          </Typography>
          <Box sx={{ display:'flex', gap:'2px', alignItems:'center' }}>
            {['|◀','◀'].map(b => (
              <Box key={b} component="button" onClick={() => setPage(p => Math.max(1,p-(b==='◀'?1:p-1)))} sx={{
                minWidth:26, height:26, borderRadius:'5px', border:`1px solid ${DL.border}`, background:'#fff',
                fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tM, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{b}</Box>
            ))}
            {Array.from({length:totalPages},(_,i)=>i+1).map(n => (
              <Box key={n} component="button" onClick={() => setPage(n)} sx={{
                minWidth:26, height:26, borderRadius:'5px',
                border:`1px solid ${page===n ? DL.blue : DL.border}`,
                background: page===n ? DL.blue : '#fff',
                fontFamily:FONT, fontSize:10, fontWeight: 500,
                color: page===n ? '#fff' : DL.tM, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{n}</Box>
            ))}
            {['▶','▶|'].map(b => (
              <Box key={b} component="button" onClick={() => setPage(p => Math.min(totalPages,p+(b==='▶'?1:totalPages-p+1)))} sx={{
                minWidth:26, height:26, borderRadius:'5px', border:`1px solid ${DL.border}`, background:'#fff',
                fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tM, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{b}</Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── BLOCK 4 — Gestión de Cobros ─────────────────────────────────────────────
function GestionCobros() {
  const TIPO_STYLE = {
    Llamada:  { bg:'rgba(84,126,105,.12)',   color:DL.blue   },
    WhatsApp: { bg:'rgba(22,163,74,.1)',     color:DL.green  },
    Visita:   { bg:'rgba(77,63,50,.1)',    color:'#4d3f32' },
  };

  const totalCosto = COBROS.interacciones.length * COBROS.costoGestion;

  const MiniKpi = ({ label, value, color }) => (
    <Box sx={{ flex:1, background:'rgba(26,26,26,.03)', borderRadius:'7px', p:'6px 10px', textAlign:'center' }}>
      <Typography sx={{ fontSize:7, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:FONT, mb:'1px' }}>{label}</Typography>
      <Typography sx={{ fontSize:14, fontWeight: 500, color: color || DL.tH, fontFamily:FONT, lineHeight:1.2 }}>{value}</Typography>
    </Box>
  );

  return (
    <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1, overflow:'hidden' }}>

      {/* Header */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
        <Box>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Gestión de Cobros</Typography>
          <Typography sx={{ fontSize:9, color:DL.tS, mt:'1px', fontFamily:FONT }}>Seguimiento de interacciones y compromisos de pago</Typography>
        </Box>
        <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tM, fontFamily:FONT }}>{COBROS.responsable}</Typography>
          <Box sx={{
            px:'7px', py:'3px', borderRadius:'4px',
            background: COBROS.diasVencido < 31 ? DL.greenBg : DL.redBg,
            border: `1px solid ${COBROS.diasVencido < 31 ? 'rgba(22,163,74,.3)' : 'rgba(220,38,38,.3)'}`,
          }}>
            <Typography sx={{ fontSize:8, fontWeight: 500, color: COBROS.diasVencido < 31 ? DL.green : DL.red, fontFamily:FONT }}>
              {COBROS.diasVencido < 31 ? 'En seguimiento vendedor' : 'En cobranza'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Sub-header stats row */}
      <Box sx={{ display:'flex', gap:'8px', p:'10px 14px', borderBottom:`1px solid ${DL.border}` }}>
        <MiniKpi label="Días Vencido"        value={`${COBROS.diasVencido}`}              color={DL.yellow} />
        <MiniKpi label="Prom. Retraso"        value={`${COBROS.promedioDiasRetraso} días`} color={DL.green}  />
        <MiniKpi label="Interacciones/Pago"   value={`${COBROS.interaccionesPorPago}`}    color={DL.blue}   />
        <MiniKpi label="Costo Gestión"        value={`$${COBROS.costoGestion}`}           color='#4d3f32'   />
      </Box>

      {/* Two-column body */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'0' }}>

        {/* Left — Interacciones table */}
        <Box sx={{ borderRight:`1px solid ${DL.border}` }}>
          <Box sx={{ px:'14px', py:'8px', borderBottom:`1px solid rgba(26,26,26,.05)` }}>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Interacciones de Cobro</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Fecha','Tipo','Duración','Resultado','Responsable'].map(h => (
                    <TableCell key={h} sx={{
                      fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em',
                      color:DL.tS, background:'rgba(26,26,26,.025)', borderBottom:'2px solid rgba(26,26,26,.08)',
                      px:'10px', py:'6px', fontFamily:FONT, whiteSpace:'nowrap',
                    }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...COBROS.interacciones].sort((a,b) => b.fecha.localeCompare(a.fecha)).map((ix, i) => (
                  <TableRow key={i} hover sx={{ '&:hover td':{ background:'rgba(84,126,105,.025)' } }}>
                    <TableCell sx={{ fontSize:10, color:DL.tM, px:'10px', py:'8px', whiteSpace:'nowrap', fontFamily:FONT }}>{ix.fecha}</TableCell>
                    <TableCell sx={{ px:'10px', py:'8px' }}>
                      <Box sx={{
                        display:'inline-flex', alignItems:'center', gap:'4px',
                        px:'6px', py:'2px', borderRadius:'4px',
                        background: TIPO_STYLE[ix.tipo]?.bg || 'rgba(26,26,26,.08)',
                      }}>
                        <Typography sx={{ fontSize:9, fontWeight: 500, color: TIPO_STYLE[ix.tipo]?.color || DL.tM, fontFamily:FONT }}>{ix.tipo}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize:10, color:DL.tM, px:'10px', py:'8px', fontFamily:FONT }}>{ix.duracion}</TableCell>
                    <TableCell sx={{ fontSize:10, color:DL.tM, px:'10px', py:'8px', fontFamily:FONT, maxWidth:220 }}>
                      <Typography sx={{ fontSize:10, color:DL.tM, fontFamily:FONT, whiteSpace:'normal', wordBreak:'break-word' }}>{ix.resultado}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize:10, color:DL.tM, px:'10px', py:'8px', fontFamily:FONT, whiteSpace:'nowrap' }}>{ix.resp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ px:'14px', py:'7px', borderTop:`1px solid ${DL.border}` }}>
            <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{COBROS.interacciones.length} interacciones registradas</Typography>
          </Box>
        </Box>

        {/* Right — Abonos + Métricas */}
        <Box sx={{ p:'12px 14px', display:'flex', flexDirection:'column', gap:'12px' }}>

          {/* Compromisos de Pago */}
          <Box>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, mb:'8px', fontFamily:FONT }}>Compromisos de Pago</Typography>
            {COBROS.abonosFuturos.length === 0 ? (
              <Box sx={{ p:'12px', textAlign:'center', background:'rgba(26,26,26,.03)', borderRadius:'7px' }}>
                <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>Sin compromisos registrados</Typography>
              </Box>
            ) : COBROS.abonosFuturos.map((ab, i) => (
              <Box key={i} sx={{ p:'8px 10px', borderRadius:'7px', border:`1px solid rgba(26,26,26,.1)`, background:'rgba(26,26,26,.02)', mb:'5px' }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:'3px' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{ab.fecha}</Typography>
                  <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.green, fontFamily:FONT }}>${ab.monto.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FONT }}>Factura: {ab.factura}</Typography>
                  <Box sx={{ px:'5px', py:'2px', borderRadius:'4px', background:DL.yellowBg, border:'1px solid rgba(217,119,6,.3)' }}>
                    <Typography sx={{ fontSize:7, fontWeight: 500, color:DL.yellow, fontFamily:FONT }}>{ab.estado}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor:'rgba(26,26,26,.07)' }} />

          {/* Métricas de Cobro */}
          <Box>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, mb:'7px', fontFamily:FONT }}>Métricas de Cobro</Typography>
            {[
              { l:'Últ. Venta',  v: COBROS.ultimaVenta },
              { l:'Últ. Cobro',  v: COBROS.ultimoCobro },
            ].map(row => (
              <Box key={row.l} sx={{ display:'flex', justifyContent:'space-between', mb:'4px' }}>
                <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{row.l}</Typography>
                <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tM, fontFamily:FONT }}>{row.v}</Typography>
              </Box>
            ))}
            <Box sx={{ p:'7px 9px', borderRadius:'6px', background:'rgba(26,26,26,.03)', border:`1px solid rgba(26,26,26,.08)`, mt:'5px' }}>
              <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tM, fontFamily:FONT }}>
                Costo total estimado: <strong style={{ color:DL.tH }}>${totalCosto}</strong>
                {' '}({COBROS.interacciones.length} interacciones × ${COBROS.costoGestion} aprox.)
              </Typography>
            </Box>
            <Box sx={{ p:'6px 9px', borderRadius:'6px', background:DL.yellowBg, border:'1px solid rgba(217,119,6,.2)', mt:'5px' }}>
              <Typography sx={{ fontSize:8, color:DL.yellow, fontWeight: 500, fontFamily:FONT }}>
                A los 31 días sin pago, pasa a gestión de cobranza
              </Typography>
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  );
}

// ─── BLOCK 3 — Ficha de Crédito (Right Sidebar panel) ────────────────────────
function FichaCredito() {
  const totalNC = CREDITO.notas.reduce((s, n) => s + n.monto, 0);

  return (
    <Paper elevation={1} sx={{ p:'14px', mb:'10px' }}>
      <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, mb:'10px', fontFamily:FONT }}>Ficha de Crédito</Typography>

      {/* Resumen maestro — 2x2 grid */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px', mb:'10px' }}>
        {[
          { l:'Límite',    v:`$${CREDITO.limite.toLocaleString()}`,    vColor:DL.tH },
          { l:'Utilizado', v:`$${CREDITO.utilizado.toLocaleString()}`, vColor:DL.tH },
          { l:'Disponible',v:`$${CREDITO.disponible.toLocaleString()}`,vColor:DL.green },
          { l:'Créditos Activos', v:CREDITO.creditosActivos, vColor:DL.blue },
        ].map(s => (
          <Box key={s.l} sx={{ background:'rgba(26,26,26,.03)', borderRadius:'6px', p:'5px 8px' }}>
            <Typography sx={{ fontSize:7, color:DL.tS, fontFamily:FONT, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.l}</Typography>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:s.vColor, fontFamily:FONT }}>{s.v}</Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor:'rgba(26,26,26,.07)', mb:'8px' }} />

      {/* Último Pago */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:'5px' }}>
        <Typography sx={{ fontSize:10, color:DL.tM, fontFamily:FONT }}>Último Pago</Typography>
        <Box sx={{ textAlign:'right' }}>
          <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{CREDITO.ultimoPago.fecha}</Typography>
          <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.green, fontFamily:FONT }}>${CREDITO.ultimoPago.monto.toLocaleString()}</Typography>
        </Box>
      </Box>

      {/* Días vencido */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:'8px' }}>
        <Typography sx={{ fontSize:10, color:DL.tM, fontFamily:FONT }}>Días Vencido</Typography>
        <Box sx={{ px:'7px', py:'2px', borderRadius:'4px', background:DL.yellowBg, border:'1px solid rgba(217,119,6,.3)' }}>
          <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.yellow, fontFamily:FONT }}>{COBROS.diasVencido} días</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor:'rgba(26,26,26,.07)', mb:'8px' }} />

      {/* Notas de Crédito */}
      <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', mb:'6px', fontFamily:FONT }}>Notas de Crédito</Typography>
      {CREDITO.notas.map(nc => (
        <Box key={nc.id} sx={{ py:'5px', borderBottom:`1px solid rgba(26,26,26,.05)`, '&:last-child':{ borderBottom:'none' } }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.blue, fontFamily:FONT }}>{nc.id}</Typography>
            <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>${nc.monto.toLocaleString()}</Typography>
          </Box>
          <Typography sx={{ fontSize:8, color:DL.tS, mt:'1px', fontFamily:FONT }}>{nc.motivo}</Typography>
        </Box>
      ))}

      {/* Total NC */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mt:'6px', pt:'6px', borderTop:`2px solid rgba(26,26,26,.08)` }}>
        <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:FONT }}>Total NC</Typography>
        <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>${totalNC.toLocaleString()}</Typography>
      </Box>
    </Paper>
  );
}

// ─── Right Sidebar ────────────────────────────────────────────────────────────
function SbSection({ title, icon, iconColor, iconBg, children }) {
  return (
    <Box sx={{ mb:'14px' }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:'6px', mb:'8px' }}>
        {icon && (
          <Box sx={{ width:18, height:18, borderRadius:'50%', background:iconBg||'rgba(26,26,26,.08)', color:iconColor||DL.tM, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, flexShrink:0 }}>
            {icon}
          </Box>
        )}
        <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{title}</Typography>
      </Box>
      {children}
    </Box>
  );
}

function RightSidebar() {
  return (
    <Box sx={{ display:'flex', flexDirection:'column', gap:'0' }}>

      {/* BLOCK 3 — Ficha de Crédito (NEW — first item) */}
      <FichaCredito />

      {/* Saldo y Cuentas */}
      <Paper elevation={1} sx={{ p:'14px', mb:'10px' }}>
        <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, mb:'10px', fontFamily:FONT }}>Saldo y Cuentas</Typography>

        {/* Alert */}
        <Box sx={{ display:'flex', alignItems:'center', gap:'8px', p:'8px 10px', borderRadius:'6px', background:'rgba(220,38,38,.06)', border:`1px solid rgba(220,38,38,.2)`, mb:'10px' }}>
          <Box sx={{ width:16, height:16, borderRadius:'50%', background:DL.redBg, color:DL.red, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight: 500, flexShrink:0 }}>!</Box>
          <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.red, fontFamily:FONT }}>Total Vencido: {fmtN(SB.totalVencido)}</Typography>
        </Box>

        {[
          { l:'Total de Facturas', v:SB.totalFact, color:DL.tH },
          { l:'Pagadas',           v:SB.pagadas,   color:DL.tM },
          { l:'Pendientes',        v:SB.pendientes,color:SB.pendientes>0?DL.red:DL.tM },
        ].map(row => (
          <Box key={row.l} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', py:'5px', borderBottom:`1px solid rgba(26,26,26,.05)`, '&:last-child':{ borderBottom:'none' } }}>
            <Typography sx={{ fontSize:11, color:DL.tM, fontFamily:FONT }}>{row.l}</Typography>
            <Typography sx={{ fontSize:11, fontWeight: 500, color:row.color, fontFamily:FONT }}>{row.v}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Ventas Cruzadas */}
      <Paper elevation={1} sx={{ p:'14px', mb:'10px' }}>
        <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, mb:'8px', fontFamily:FONT }}>Ventas Cruzadas Recomendadas</Typography>
        {SB.cruzadas.map((c,i) => (
          <Box key={i} sx={{ py:'5px', borderBottom:`1px solid rgba(26,26,26,.05)`, '&:last-child':{ borderBottom:'none' } }}>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{c.prod}</Typography>
            <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FONT }}>{c.sub}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Más Comprados */}
      <Paper elevation={1} sx={{ p:'14px', mb:'10px' }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:'8px' }}>
          <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Más Comprados</Typography>
          <Box sx={{ width:16, height:16, borderRadius:'50%', background:DL.greenBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:DL.green, fontWeight: 500 }}>✓</Box>
        </Box>
        {SB.masComprados.map((p,i) => (
          <Box key={i} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', py:'5px', borderBottom:`1px solid rgba(26,26,26,.05)`, '&:last-child':{ borderBottom:'none' } }}>
            <Box>
              <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{p.prod}</Typography>
              <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FONT }}>{p.u} u · {fmtN(p.v)}</Typography>
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Últimos Productos Comprados */}
      <Paper elevation={1} sx={{ p:'14px', mb:'10px' }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:'8px' }}>
          <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Últimos Productos Comprados</Typography>
          <Box sx={{ width:16, height:16, borderRadius:'50%', background:'rgba(84,126,105,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:DL.blue }}>🕐</Box>
        </Box>
        {SB.ultimos.map((p,i) => (
          <Box key={i} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', py:'5px', borderBottom:`1px solid rgba(26,26,26,.05)`, '&:last-child':{ borderBottom:'none' } }}>
            <Box>
              <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{p.prod}</Typography>
              <Typography sx={{ fontSize:8, color:DL.tS, fontFamily:FONT }}>{p.fecha} · {p.u} u</Typography>
            </Box>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.blue, fontFamily:FONT }}>{fmtN(p.v)}</Typography>
          </Box>
        ))}
      </Paper>

      {/* En Riesgo */}
      <Paper elevation={1} sx={{ p:'14px', mb:'10px', border:`1px solid ${DL.yellowBd}` }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:'8px' }}>
          <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>En Riesgo</Typography>
          <Box sx={{ fontSize:14 }}>⚠</Box>
        </Box>
        {SB.riesgo.map((r,i) => (
          <Box key={i}>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{r.prod}</Typography>
            <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.yellow, fontFamily:FONT }}>{r.detail}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Dejó de Comprar */}
      <Paper elevation={1} sx={{ p:'14px', border:`1px solid rgba(220,38,38,.2)` }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:'8px' }}>
          <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Dejó de Comprar</Typography>
          <Box sx={{ width:16, height:16, borderRadius:'50%', background:DL.redBg, color:DL.red, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight: 500 }}>⊖</Box>
        </Box>
        {SB.dejoComprar.map((r,i) => (
          <Box key={i}>
            <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{r.prod}</Typography>
            <Typography sx={{ fontSize:9, color:DL.red, fontFamily:FONT }}>{r.detail}</Typography>
          </Box>
        ))}
      </Paper>

    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ClienteDetalle() {
  const navigate = useNavigate();
  const [period,  setPeriod]  = useState('Ago 2026');
  const [cliente, setCliente] = useState('Veterinaria Los Pinos');

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#f4f6fb' }}>
      <TopBar onBack={() => navigate('/clientes')} period={period} setPeriod={setPeriod} cliente={cliente} setCliente={setCliente} />

      <Box sx={{ p:'14px 16px', display:'flex', flexDirection:'column', gap:'14px' }}>
        {/* KPI row */}
        <KpiCards />

        {/* BLOCK 1 — Credit KPI row */}
        <CreditoKpis />

        {/* BLOCK 2 — CxC Alert Banner (conditional) */}
        {CREDITO.utilizado >= CREDITO.limite && (
          <Box sx={{ display:'flex', alignItems:'center', gap:'10px', p:'10px 14px', borderRadius:'8px', background:'rgba(220,38,38,.06)', border:'1px solid rgba(220,38,38,.3)' }}>
            <Box sx={{ fontSize:16 }}>🚨</Box>
            <Box>
              <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.red, fontFamily:FONT }}>CxC supera el límite de crédito</Typography>
              <Typography sx={{ fontSize:9, color:DL.red, fontFamily:FONT }}>Saldo pendiente ${CREDITO.utilizado.toLocaleString()} supera el límite de ${CREDITO.limite.toLocaleString()}. No emitir nuevas facturas hasta regularizar.</Typography>
            </Box>
          </Box>
        )}

        {/* Main 2-column layout */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'14px', alignItems:'start' }}>
          {/* Left: chart + table + gestión cobros */}
          <Box sx={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <VentasPeriodo />
            <FacturasTable />
            {/* BLOCK 4 — Gestión de Cobros */}
            <GestionCobros />
          </Box>
          {/* Right sidebar (includes FichaCredito at top) */}
          <RightSidebar />
        </Box>
      </Box>
    </Box>
  );
}
